import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import { SmartShapeToolbar } from './SmartShapeToolbar';
import { ObjectRenderer } from './canvas/ObjectRenderer';
import { AnyCanvasObject, Point } from '@/lib/types';
import { useCollaborationContext } from '@/hooks/useCollaborationContext';
import { RemoteCursors } from '@/components/room/RemoteCursors';
import {
  isPointInObject, objectsIntersectRect, screenToCanvas, applyDelta,
  calculateArrowAngle, calculateArrowHeadPoints, calculateDistance,
} from '@/math-core';
import { findNearbyPoint, SNAP_RADIUS } from '@/lib/geometry';

export const Canvas: React.FC = () => {
  const {
    state, zoom, showGrid, selectObject: onSelectObject, selectMultiple: onSelectMultiple,
    updateObject: onUpdateObject, handleAddObject: onAddObject, handleDeleteObject: onDeleteObject,
    moveObjects: onMoveObjects, penSettings, shapeType, getCanvasSnapshot,
  } = useEditorContext();

  const { roomState, canEdit, copyRoomLink, createRoom, publishLocalChange, updateCursor } = useCollaborationContext();

  const { objects, selectedObjectIds, mode } = state;

  // Публикует АКТУАЛЬНЫЙ canvas state в Yjs после завершённого действия пользователя.
  // Читает из refs через getCanvasSnapshot() — никогда не устаревает,
  // даже если вызван синхронно сразу после addObject/moveObjects до следующего рендера.
  const publishState = useCallback(() => {
    publishLocalChange(getCanvasSnapshot());
  }, [publishLocalChange, getCanvasSnapshot]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragObjectId, setDragObjectId] = useState<string | null>(null);
  const [dragDelta, setDragDelta] = useState<{ dx: number; dy: number } | null>(null);
  const dragStartObjectsRef = useRef<AnyCanvasObject[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editingTextSize, setEditingTextSize] = useState<{ width: number; height: number } | null>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<Point | null>(null);
  const [arrowEnd, setArrowEnd] = useState<Point | null>(null);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState<Point | null>(null);
  const [lineEnd, setLineEnd] = useState<Point | null>(null);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeDrawStart, setShapeDrawStart] = useState<Point | null>(null);
  const [shapeDrawEnd, setShapeDrawEnd] = useState<Point | null>(null);
  const [isErasing, setIsErasing] = useState(false);
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<Point | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<Point | null>(null);
  const didMarqueeSelectionRef = useRef(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [segmentStep, setSegmentStep] = useState<0 | 1>(0);
  const [segmentPointAId, setSegmentPointAId] = useState<string | null>(null);
  const [segmentPreview, setSegmentPreview] = useState<Point | null>(null);
  const [angleStep, setAngleStep] = useState<0 | 1 | 2>(0);
  const [anglePointAId, setAnglePointAId] = useState<string | null>(null);
  const [anglePointBId, setAnglePointBId] = useState<string | null>(null);
  const [anglePreview, setAnglePreview] = useState<Point | null>(null);
  const [snapTarget, setSnapTarget] = useState<{ x: number; y: number; snapped: boolean } | null>(null);
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [freehandPoints, setFreehandPoints] = useState<{ x: number; y: number }[]>([]);
  const freehandLastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const handleShare = useCallback(async () => {
    let link: string;
    if (roomState.isConnected && roomState.roomId) {
      link = copyRoomLink();
    } else {
      const roomId = await createRoom();
      if (!roomId) return;
      link = copyRoomLink();
    }
    try {
      await navigator.clipboard.writeText(link);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      alert(`Ссылка на комнату:\n${link}`);
    }
  }, [roomState.isConnected, roomState.roomId, createRoom, copyRoomLink]);

  const handleEraserDelete = (x: number, y: number) => {
    if (!onDeleteObject) return;
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (obj.visible && !obj.locked && isPointInObject(x, y, obj)) {
        onDeleteObject(obj.id);
        break;
      }
    }
  };

  const nextPointLabel = (): string => {
    const used = new Set(objects.filter(o => o.type === 'geopoint').map(o => (o.data as { label?: string }).label).filter(Boolean));
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const ch of letters) if (!used.has(ch)) return ch;
    for (let n = 1; n <= 9; n++) for (const ch of letters) { const lbl = `${ch}${n}`; if (!used.has(lbl)) return lbl; }
    return '';
  };

  const snapOrCreatePoint = (x: number, y: number): string => {
    const existing = findNearbyPoint(objects, x, y, SNAP_RADIUS);
    if (existing) return existing.id;
    const R = 5;
    const newPoint: AnyCanvasObject = { id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, type: 'geopoint', x: x - R, y: y - R, width: R * 2, height: R * 2, rotation: 0, opacity: 1, visible: true, locked: false, data: { color: '#1D4ED8', radius: R, label: nextPointLabel() } };
    onAddObject(newPoint);
    return newPoint.id;
  };

  const handleSegmentClick = (x: number, y: number) => {
    if (segmentStep === 0) {
      const pointId = snapOrCreatePoint(x, y);
      setSegmentPointAId(pointId);
      setSegmentStep(1);
    } else {
      const pointBId = snapOrCreatePoint(x, y);
      const pointA = objects.find(o => o.id === segmentPointAId);
      if (!pointA || !segmentPointAId) { setSegmentStep(0); return; }
      const ax = pointA.x + pointA.width / 2, ay = pointA.y + pointA.height / 2;
      const pointB = objects.find(o => o.id === pointBId);
      const bx = pointB ? pointB.x + pointB.width / 2 : x, by = pointB ? pointB.y + pointB.height / 2 : y;
      const segment: AnyCanvasObject = { id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, type: 'geosegment', x: Math.min(ax, bx), y: Math.min(ay, by), width: Math.abs(bx - ax), height: Math.abs(by - ay), rotation: 0, opacity: 1, visible: true, locked: false, data: { pointAId: segmentPointAId, pointBId, color: '#374151', strokeWidth: 2, showPoints: true } };
      onAddObject(segment);
      setSegmentStep(0); setSegmentPointAId(null); setSegmentPreview(null); setSnapTarget(null);
      publishState();
    }
  };

  const handleAngleClick = (x: number, y: number) => {
    if (angleStep === 0) {
      const pointId = snapOrCreatePoint(x, y);
      setAnglePointAId(pointId);
      setAngleStep(1);
    } else if (angleStep === 1) {
      const pointId = snapOrCreatePoint(x, y);
      setAnglePointBId(pointId);
      setAngleStep(2);
    } else {
      const pointCId = snapOrCreatePoint(x, y);
      if (!anglePointAId || !anglePointBId) { setAngleStep(0); return; }
      const ptB = objects.find(o => o.id === anglePointBId);
      if (!ptB) { setAngleStep(0); return; }
      const bx = ptB.x + ptB.width / 2, by = ptB.y + ptB.height / 2;
      const angle: AnyCanvasObject = { id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, type: 'geoangle', x: bx - 30, y: by - 30, width: 60, height: 60, rotation: 0, opacity: 1, visible: true, locked: false, data: { pointAId: anglePointAId, pointBId: anglePointBId, pointCId, color: '#7C3AED', arcRadius: 25, showLabel: true } };
      onAddObject(angle);
      setAngleStep(0); setAnglePointAId(null); setAnglePointBId(null); setAnglePreview(null); setSnapTarget(null);
      publishState();
    }
  };

  useEffect(() => {
    const updateSize = () => { if (canvasRef.current) { const rect = canvasRef.current.getBoundingClientRect(); setCanvasSize({ width: Math.floor(rect.width / zoom), height: Math.floor(rect.height / zoom) }); } };
    updateSize();
    window.addEventListener('resize', updateSize);
    const observer = new ResizeObserver(updateSize);
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => { window.removeEventListener('resize', updateSize); observer.disconnect(); };
  }, [zoom]);

  useEffect(() => { if (mode !== 'geosegment') { setSegmentStep(0); setSegmentPointAId(null); setSegmentPreview(null); setSnapTarget(null); } }, [mode]);
  useEffect(() => { if (mode !== 'geoangle') { setAngleStep(0); setAnglePointAId(null); setAnglePointBId(null); setAnglePreview(null); setSnapTarget(null); } }, [mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space' && !editingTextId) { e.preventDefault(); setIsSpacePressed(true); } };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') { setIsSpacePressed(false); if (isPanning) { setIsPanning(false); setPanStart(null); } } };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [editingTextId, isPanning]);

  const handleObjectMouseDown = (e: React.MouseEvent, objectId: string) => {
    if (!canEdit || mode === 'line' || mode === 'geosegment' || mode === 'geoangle' || mode === 'geopoint' || mode === 'eraser' || mode === 'freehand') return;
    e.stopPropagation();
    const obj = objects.find((o) => o.id === objectId);
    if (obj?.locked) return;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
    dragStartObjectsRef.current = [...objects];
    setIsDragging(true);
    setDragStart({ x, y });
    setDragObjectId(objectId);
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    const alreadySelected = selectedObjectIds.includes(objectId);
    if (!alreadySelected || isMultiSelect) onSelectObject(objectId, isMultiSelect);
  };

  const handleMouseUp = () => { if (isDragging) { setIsDragging(false); setDragStart(null); setDragObjectId(null); } };

  const handleTextDoubleClick = (e: React.MouseEvent, objectId: string) => {
    if (!canEdit) return;
    e.stopPropagation();
    const obj = objects.find((o) => o.id === objectId);
    if (!obj || obj.type !== 'text') return;
    const data = obj.data as { text: string };
    setEditingTextId(objectId);
    setEditingText(data?.text || 'Текст');
  };

  const handleTextEditComplete = () => {
    if (editingTextId) {
      const updates: Partial<AnyCanvasObject> = { data: { ...objects.find((o) => o.id === editingTextId)?.data, text: editingText } };
      if (editingTextSize) { updates.width = editingTextSize.width; updates.height = editingTextSize.height; }
      onUpdateObject(editingTextId, updates);
    }
    setEditingTextId(null); setEditingText(''); setEditingTextSize(null);
    publishState();
  };

  const autoResizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta || !editingTextId) return;
    const obj = objects.find((o) => o.id === editingTextId);
    if (!obj) return;
    const maxWidth = canvasSize.width - obj.x - 8;
    ta.style.height = 'auto';
    const newHeight = Math.max(ta.scrollHeight + 8, 32);
    ta.style.height = `${newHeight}px`;
    const newWidth = Math.min(Math.max(ta.scrollWidth + 8, 80), maxWidth);
    setEditingTextSize({ width: newWidth, height: newHeight });
  }, [editingTextId, objects, canvasSize.width]);

  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      setTimeout(() => autoResizeTextarea(), 0);
    }
  }, [editingTextId]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildSmoothPath = (pts: { x: number; y: number }[]): string => {
    if (pts.length < 2) return `M ${pts[0]?.x ?? 0} ${pts[0]?.y ?? 0}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q ${pts[i].x} ${pts[i].y} ${mx} ${my}`;
    }
    d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
    return d;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (didMarqueeSelectionRef.current) { didMarqueeSelectionRef.current = false; return; }
    const target = e.target as SVGElement | HTMLElement;
    const isEmptyCanvas = target.tagName === 'svg' || target === e.currentTarget;
    if (isEmptyCanvas && !['arrow', 'line', 'eraser'].includes(mode)) onSelectObject(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (isSpacePressed && e.button === 0)) { setIsPanning(true); setPanStart({ x: e.clientX, y: e.clientY }); e.preventDefault(); e.stopPropagation(); return; }
    if (isSpacePressed) return;
    if (!canEdit) return;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

    if (mode === 'arrow' && e.target === e.currentTarget) { setIsDrawingArrow(true); setArrowStart({ x, y }); setArrowEnd({ x, y }); e.stopPropagation(); }
    if (mode === 'line') { setIsDrawingLine(true); setLineStart({ x, y }); setLineEnd({ x, y }); e.stopPropagation(); }
    if (mode === 'eraser') { setIsErasing(true); handleEraserDelete(x, y); e.stopPropagation(); }
    if (mode === 'geopoint') {
      const existing = findNearbyPoint(objects, x, y, SNAP_RADIUS);
      if (existing) { onSelectObject(existing.id); e.stopPropagation(); return; }
      const R = 5;
      const newPoint: AnyCanvasObject = { id: `obj_${Date.now()}`, type: 'geopoint', x: x - R, y: y - R, width: R * 2, height: R * 2, rotation: 0, opacity: 1, visible: true, locked: false, data: { color: '#1D4ED8', radius: R, label: nextPointLabel() } };
      onAddObject(newPoint);
      e.stopPropagation(); setSnapTarget(null);
      publishState();
    }
    if (mode === 'geosegment') { handleSegmentClick(x, y); e.stopPropagation(); }
    if (mode === 'geoangle') { handleAngleClick(x, y); e.stopPropagation(); }
    if (mode === 'freehand') { setIsDrawingFreehand(true); const firstPoint = { x, y }; setFreehandPoints([firstPoint]); freehandLastPointRef.current = firstPoint; e.stopPropagation(); }
    if (mode === 'shape') { setIsDrawingShape(true); setShapeDrawStart({ x, y }); setShapeDrawEnd({ x, y }); e.stopPropagation(); }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStart) { const dx = e.clientX - panStart.x, dy = e.clientY - panStart.y; setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy })); setPanStart({ x: e.clientX, y: e.clientY }); return; }
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
    updateCursor({ x, y });
    if (!canEdit) return;

    if (isDrawingArrow && arrowStart) { setArrowEnd({ x, y }); return; }
    if (isDrawingLine && lineStart) { setLineEnd({ x, y }); return; }
    if (isErasing) { handleEraserDelete(x, y); return; }
    if (isMarqueeSelecting) { setMarqueeEnd({ x, y }); return; }
    if (isDragging && dragStart && dragObjectId) { const dx = x - dragStart.x, dy = y - dragStart.y; setDragDelta({ dx, dy }); return; }
    if (mode === 'geosegment' && segmentStep === 1) {
      setSegmentPreview({ x, y });
      const near = findNearbyPoint(objects, x, y, SNAP_RADIUS);
      if (near) { const nx = near.x + near.width / 2, ny = near.y + near.height / 2; setSnapTarget({ x: nx, y: ny, snapped: true }); } else setSnapTarget({ x, y, snapped: false });
    }
    if (mode === 'geoangle' && angleStep >= 1) {
      setAnglePreview({ x, y });
      const near = findNearbyPoint(objects, x, y, SNAP_RADIUS);
      if (near) { const nx = near.x + near.width / 2, ny = near.y + near.height / 2; setSnapTarget({ x: nx, y: ny, snapped: true }); } else setSnapTarget({ x, y, snapped: false });
    }
    if (mode === 'geopoint') {
      const near = findNearbyPoint(objects, x, y, SNAP_RADIUS);
      if (near) { const nx = near.x + near.width / 2, ny = near.y + near.height / 2; setSnapTarget({ x: nx, y: ny, snapped: true }); } else setSnapTarget(null);
    }
    if (mode === 'shape' && isDrawingShape) { setShapeDrawEnd({ x, y }); return; }
    if (mode === 'freehand' && isDrawingFreehand) {
      const last = freehandLastPointRef.current;
      if (!last || Math.hypot(x - last.x, y - last.y) > 2) { const pt = { x, y }; setFreehandPoints(prev => [...prev, pt]); freehandLastPointRef.current = pt; }
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (isPanning) { setIsPanning(false); setPanStart(null); return; }
    if (!canEdit) return;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

    if (isDrawingArrow && arrowStart && arrowEnd) {
      if (calculateDistance(arrowStart.x, arrowStart.y, x, y) > 5) {
        const newArrow: AnyCanvasObject = { id: `obj_${Date.now()}`, type: 'arrow', x: arrowStart.x, y: arrowStart.y, width: x - arrowStart.x, height: y - arrowStart.y, rotation: 0, opacity: 1, visible: true, locked: false, data: { stroke: '#374151', strokeWidth: 2, arrowHead: 'end' } };
        onAddObject(newArrow);
      }
      setIsDrawingArrow(false); setArrowStart(null); setArrowEnd(null);
      publishState(); return;
    }
    if (isDrawingLine && lineStart && lineEnd) {
      if (calculateDistance(lineStart.x, lineStart.y, x, y) > 5) {
        const newLine: AnyCanvasObject = { id: `obj_${Date.now()}`, type: 'line', x: Math.min(lineStart.x, x), y: Math.min(lineStart.y, y), width: Math.abs(x - lineStart.x), height: Math.abs(y - lineStart.y), rotation: 0, opacity: 1, visible: true, locked: false, data: { x1: lineStart.x, y1: lineStart.y, x2: x, y2: y, color: '#374151', strokeWidth: 2 } };
        onAddObject(newLine);
      }
      setIsDrawingLine(false); setLineStart(null); setLineEnd(null);
      publishState(); return;
    }
    if (isMarqueeSelecting && marqueeStart && marqueeEnd) {
      const minX = Math.min(marqueeStart.x, marqueeEnd.x), maxX = Math.max(marqueeStart.x, marqueeEnd.x), minY = Math.min(marqueeStart.y, marqueeEnd.y), maxY = Math.max(marqueeStart.y, marqueeEnd.y);
      const selectedIds: string[] = [];
      objects.forEach((obj) => { if (obj.visible && !obj.locked && objectsIntersectRect(obj, minX, minY, maxX, maxY)) selectedIds.push(obj.id); });
      if (selectedIds.length > 0) onSelectMultiple(selectedIds); else onSelectObject(null, false);
      didMarqueeSelectionRef.current = true;
      setIsMarqueeSelecting(false); setMarqueeStart(null); setMarqueeEnd(null); return;
    }
    if (isErasing) { setIsErasing(false); publishState(); return; }
    if (isDrawingShape && shapeDrawStart && shapeDrawEnd) {
      const sx = Math.min(shapeDrawStart.x, shapeDrawEnd.x), sy = Math.min(shapeDrawStart.y, shapeDrawEnd.y), w = Math.abs(shapeDrawEnd.x - shapeDrawStart.x), h = Math.abs(shapeDrawEnd.y - shapeDrawStart.y);
      setIsDrawingShape(false); setShapeDrawStart(null); setShapeDrawEnd(null);
      if (w > 5 && h > 5) {
        const id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        let newShape: AnyCanvasObject;
        switch (shapeType) {
          case 'circle': newShape = { id, type: 'circle', x: sx, y: sy, width: w, height: w, rotation: 0, opacity: 1, visible: true, locked: false, data: { fill: '#10B981', stroke: '#047857', strokeWidth: 2 } }; break;
          case 'triangle': newShape = { id, type: 'triangle', x: sx, y: sy, width: w, height: h, rotation: 0, opacity: 1, visible: true, locked: false, data: { fill: '#F59E0B', stroke: '#D97706', strokeWidth: 2 } }; break;
          case 'geoshape-circle': newShape = { id, type: 'geoshape', x: sx, y: sy, width: w, height: w, rotation: 0, opacity: 1, visible: true, locked: false, data: { shapeKind: 'circle', radius: Math.round(w / 2), stroke: '#374151', strokeWidth: 2 } }; break;
          case 'geoshape-triangle': newShape = { id, type: 'geoshape', x: sx, y: sy, width: w, height: h, rotation: 0, opacity: 1, visible: true, locked: false, data: { shapeKind: 'triangle', sideA: Math.round(w), sideB: Math.round(w), sideC: Math.round(w), stroke: '#374151', strokeWidth: 2 } }; break;
          case 'geoshape-quad': newShape = { id, type: 'geoshape', x: sx, y: sy, width: w, height: h, rotation: 0, opacity: 1, visible: true, locked: false, data: { shapeKind: 'quadrilateral', sideAB: Math.round(w), sideBC: Math.round(h), sideCD: Math.round(w), sideDA: Math.round(h), stroke: '#374151', strokeWidth: 2 } }; break;
          default: newShape = { id, type: 'rectangle', x: sx, y: sy, width: w, height: h, rotation: 0, opacity: 1, visible: true, locked: false, data: { fill: '#4F46E5', stroke: '#312E81', strokeWidth: 2, cornerRadius: 0 } };
        }
        onAddObject(newShape); onSelectObject(newShape.id);
      }
      publishState(); return;
    }
    if (isDrawingFreehand) {
      setIsDrawingFreehand(false); freehandLastPointRef.current = null;
      if (freehandPoints.length >= 2) {
        const xs = freehandPoints.map(p => p.x), ys = freehandPoints.map(p => p.y);
        const minX = Math.min(...xs), minY = Math.min(...ys), maxX = Math.max(...xs), maxY = Math.max(...ys);
        const newPath: AnyCanvasObject = { id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, type: 'freehand', x: minX, y: minY, width: Math.max(maxX - minX, 1), height: Math.max(maxY - minY, 1), rotation: 0, opacity: 1, visible: true, locked: false, data: { points: freehandPoints, color: penSettings.color, width: penSettings.width } };
        onAddObject(newPath);
      }
      setFreehandPoints([]); publishState(); return;
    }
    if (isDragging) {
      if (dragDelta && dragStartObjectsRef.current.length > 0) {
        const { dx, dy } = dragDelta;
        const idsToMove = selectedObjectIds.length > 1 && selectedObjectIds.includes(dragObjectId ?? '') ? selectedObjectIds : (dragObjectId ? [dragObjectId] : []);
        const nextObjects = objects.map(obj => {
          if (!idsToMove.includes(obj.id)) return obj;
          if (obj.type === 'freehand') { const fd = obj.data as { points: { x: number; y: number }[] }; return { ...obj, x: obj.x + dx, y: obj.y + dy, data: { ...fd, points: fd.points.map(p => ({ x: p.x + dx, y: p.y + dy })) } }; }
          return { ...obj, ...applyDelta(obj, dx, dy) };
        });
        onMoveObjects(dragStartObjectsRef.current, nextObjects);
        nextObjects.forEach(obj => { if (idsToMove.includes(obj.id)) onUpdateObject(obj.id, obj); });
      }
      setIsDragging(false); setDragStart(null); setDragObjectId(null); setDragDelta(null); dragStartObjectsRef.current = [];
      publishState(); return;
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as SVGElement | HTMLElement;
    const isEmptyCanvas = target.tagName === 'svg' || target === e.currentTarget;
    if (isEmptyCanvas && mode === 'text') { /* fall through */ } else if (isEmptyCanvas) { setPanOffset({ x: 0, y: 0 }); return; }
    if (!canEdit || !['shape', 'draw', 'fraction', 'chart', 'arrow', 'text'].includes(mode)) return;
    const svgRect = svgRef.current?.getBoundingClientRect(); if (!svgRect) return;
    const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
    let newObject: Partial<AnyCanvasObject> = {};
    switch (mode) {
      case 'text': newObject = { type: 'text', x: x - 100, y: y - 20, width: 200, height: 40, data: { text: 'Текст', fontSize: 24, fontFamily: 'sans-serif', fontWeight: 'normal', fill: '#1F2937', textAlign: 'left' } }; break;
      case 'fraction': newObject = { type: 'fraction', x: x - 75, y: y - 75, width: 150, height: 150, data: { numerator: 1, denominator: 2, fill: '#4F46E5', stroke: '#312E81', strokeWidth: 2, showLabels: true } }; break;
      case 'chart': newObject = { type: 'rectangle', x: x - 50, y: y - 75, width: 100, height: 150, data: { fill: '#10B981', stroke: '#047857', strokeWidth: 2, cornerRadius: 4 } }; break;
      case 'arrow': newObject = { type: 'arrow', x: x - 75, y: y - 10, width: 150, height: 20, data: { stroke: '#374151', strokeWidth: 2, arrowHead: 'end' } }; break;
      default: newObject = { type: 'rectangle', x: x - 50, y: y - 30, width: 100, height: 60, data: { fill: '#4F46E5', stroke: '#312E81', strokeWidth: 2, cornerRadius: 0 } };
    }
    onAddObject({ id: `obj_${Date.now()}`, rotation: 0, opacity: 1, visible: true, locked: false, ...newObject } as AnyCanvasObject);
    publishState();
  };

  const renderGrid = () => {
    if (!showGrid) return null;
    const gridSize = 20; const lines = [];
    for (let x = 0; x <= canvasSize.width; x += gridSize) lines.push(<line key={`v-${x}`} x1={x} y1={0} x2={x} y2={canvasSize.height} stroke="#E5E7EB" strokeWidth={0.5} />);
    for (let y = 0; y <= canvasSize.height; y += gridSize) lines.push(<line key={`h-${y}`} x1={0} y1={y} x2={canvasSize.width} y2={y} stroke="#E5E7EB" strokeWidth={0.5} />);
    return <>{lines}</>;
  };

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden relative">
      {!canEdit && roomState.isConnected && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-yellow-100 border-b border-yellow-300 text-yellow-800 text-sm text-center py-2 animate-pulse select-none">
          👀 Режим просмотра. Объясняет учитель.
        </div>
      )}

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {roomState.isConnected && roomState.roomId && <span className="text-xs bg-green-100 text-green-700 border border-green-300 rounded-full px-2 py-0.5 select-none">Комната активна</span>}
        <button onClick={handleShare} title="Поделиться ссылкой на совместный холст" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg shadow-sm transition-colors bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 1 0-2.977-2.63l-4.94 2.47a3 3 0 1 0 0 4.319l4.94 2.47a3 3 0 1 0 .895-1.789l-4.94-2.47a3.027 3.027 0 0 0 0-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
          {shareCopied ? 'Скопировано!' : 'Поделиться'}
        </button>
      </div>

      <div ref={canvasRef} className={`w-full h-full overflow-auto select-none ${!canEdit ? 'pointer-events-none' : ''}`}
        onClick={handleCanvasClick} onDoubleClick={handleCanvasDoubleClick} onMouseDown={handleCanvasMouseDown} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp}
        onMouseLeave={() => { updateCursor(null); setSnapTarget(null); if (isPanning) { setIsPanning(false); setPanStart(null); } else if (isDrawingArrow) { setIsDrawingArrow(false); setArrowStart(null); setArrowEnd(null); } else if (isDrawingLine) { setIsDrawingLine(false); setLineStart(null); setLineEnd(null); } else if (isErasing) { setIsErasing(false); } else if (isDrawingFreehand) { setIsDrawingFreehand(false); setFreehandPoints([]); freehandLastPointRef.current = null; } else if (isMarqueeSelecting) { setIsMarqueeSelecting(false); setMarqueeStart(null); setMarqueeEnd(null); } else handleMouseUp(); }}
        style={{ cursor: isPanning ? 'grabbing' : isSpacePressed ? 'grab' : ['arrow', 'line', 'eraser', 'draw', 'fraction', 'chart', 'geopoint', 'geosegment', 'geoangle', 'freehand', 'shape'].includes(mode) ? 'crosshair' : 'default' }}>
        <svg ref={svgRef} data-canvas-svg width={canvasSize.width * zoom} height={canvasSize.height * zoom} viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`} style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
          onMouseDown={(e: React.MouseEvent<SVGSVGElement>) => {
            if (!canEdit || isPanning || isSpacePressed) return;
            if (['line', 'geosegment', 'shape'].includes(mode)) { handleCanvasMouseDown(e as unknown as React.MouseEvent); return; }
            if (mode === 'select' && e.target === e.currentTarget) { const svgRect = svgRef.current?.getBoundingClientRect(); if (!svgRect) return; const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height); setIsMarqueeSelecting(true); setMarqueeStart({ x, y }); setMarqueeEnd({ x, y }); e.stopPropagation(); }
          }}>
          {renderGrid()}
          {objects.filter((o) => o.visible).map((obj) => (<ObjectRenderer key={obj.id} obj={obj} isSelected={selectedObjectIds.includes(obj.id)} dragDelta={isDragging ? dragDelta : null} objects={objects} editingTextId={editingTextId} editingText={editingText} editingTextSize={editingTextSize} canvasWidth={canvasSize.width} textareaRef={textareaRef} onMouseDown={handleObjectMouseDown} onTextDoubleClick={handleTextDoubleClick} onEditingTextChange={setEditingText} onTextEditComplete={handleTextEditComplete} onTextEditCancel={() => { setEditingTextId(null); setEditingText(''); setEditingTextSize(null); }} onAutoResize={autoResizeTextarea} />))}
          {canEdit && isDrawingArrow && arrowStart && arrowEnd && (calculateDistance(arrowStart.x, arrowStart.y, arrowEnd.x, arrowEnd.y) > 5) && (() => { const angle = calculateArrowAngle(arrowStart.x, arrowStart.y, arrowEnd.x, arrowEnd.y); const head = calculateArrowHeadPoints(arrowEnd.x, arrowEnd.y, angle, 15, 'forward'); return <g opacity={0.5}><line x1={arrowStart.x} y1={arrowStart.y} x2={arrowEnd.x} y2={arrowEnd.y} stroke="#374151" strokeWidth={2} strokeDasharray="5,5" /><polygon points={`${arrowEnd.x},${arrowEnd.y} ${head.point1X},${head.point1Y} ${head.point2X},${head.point2Y}`} fill="#374151" /></g>; })()}
          {canEdit && isDrawingLine && lineStart && lineEnd && (calculateDistance(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y) > 5) && <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke="#374151" strokeWidth={2} strokeDasharray="5,5" strokeLinecap="round" opacity={0.6} />}
          {canEdit && isMarqueeSelecting && marqueeStart && marqueeEnd && <rect x={Math.min(marqueeStart.x, marqueeEnd.x)} y={Math.min(marqueeStart.y, marqueeEnd.y)} width={Math.abs(marqueeEnd.x - marqueeStart.x)} height={Math.abs(marqueeEnd.y - marqueeStart.y)} fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeDasharray="4,4" strokeWidth={1} />}
          {canEdit && isDrawingShape && shapeDrawStart && shapeDrawEnd && (() => { const x = Math.min(shapeDrawStart.x, shapeDrawEnd.x), y = Math.min(shapeDrawStart.y, shapeDrawEnd.y), w = Math.abs(shapeDrawEnd.x - shapeDrawStart.x), h = Math.abs(shapeDrawEnd.y - shapeDrawStart.y); const p = { fill: 'rgba(79,70,229,0.08)', stroke: '#4F46E5', strokeWidth: 1.5, strokeDasharray: '6,3', style: { pointerEvents: 'none' } as React.CSSProperties }; if (shapeType === 'circle') return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...p} />; if (shapeType === 'triangle') return <polygon points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`} {...p} />; return <rect x={x} y={y} width={w} height={h} {...p} />; })()}
          {canEdit && mode === 'geosegment' && segmentStep === 1 && segmentPointAId && segmentPreview && (() => { const ptA = objects.find(o => o.id === segmentPointAId); if (!ptA) return null; return <line x1={ptA.x + ptA.width / 2} y1={ptA.y + ptA.height / 2} x2={segmentPreview.x} y2={segmentPreview.y} stroke="#374151" strokeWidth={2} strokeDasharray="6,4" strokeLinecap="round" opacity={0.5} />; })()}
          {canEdit && mode === 'geoangle' && anglePreview && (() => { if (angleStep === 1 && anglePointAId) { const ptA = objects.find(o => o.id === anglePointAId); if (!ptA) return null; return <line x1={ptA.x + ptA.width / 2} y1={ptA.y + ptA.height / 2} x2={anglePreview.x} y2={anglePreview.y} stroke="#7C3AED" strokeWidth={2} strokeDasharray="6,4" strokeLinecap="round" opacity={0.5} />; } if (angleStep === 2 && anglePointAId && anglePointBId) { const ptA = objects.find(o => o.id === anglePointAId), ptB = objects.find(o => o.id === anglePointBId); if (!ptA || !ptB) return null; return <g opacity={0.5}><line x1={ptA.x + ptA.width / 2} y1={ptA.y + ptA.height / 2} x2={ptB.x + ptB.width / 2} y2={ptB.y + ptB.height / 2} stroke="#7C3AED" strokeWidth={2} strokeDasharray="6,4" strokeLinecap="round" /><line x1={ptB.x + ptB.width / 2} y1={ptB.y + ptB.height / 2} x2={anglePreview.x} y2={anglePreview.y} stroke="#7C3AED" strokeWidth={2} strokeDasharray="6,4" strokeLinecap="round" /></g>; } return null; })()}
          {canEdit && snapTarget && ['geosegment', 'geoangle', 'geopoint'].includes(mode) && <circle cx={snapTarget.x} cy={snapTarget.y} r={snapTarget.snapped ? 9 : 5} fill="none" stroke={snapTarget.snapped ? '#10B981' : '#7C3AED'} strokeWidth={snapTarget.snapped ? 2.5 : 1.5} strokeDasharray={snapTarget.snapped ? undefined : '3,3'} opacity={0.8} style={{ pointerEvents: 'none' }} />}
          {canEdit && isDrawingFreehand && freehandPoints.length >= 2 && <path d={buildSmoothPath(freehandPoints)} stroke={penSettings.color} strokeWidth={penSettings.width} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} style={{ pointerEvents: 'none' }} />}
        </svg>
      </div>

      {canEdit && mode === 'geosegment' && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none select-none">{segmentStep === 0 ? 'Выберите первую точку' : 'Выберите вторую точку'}</div>}
      {canEdit && mode === 'geoangle' && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-800 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none select-none">{angleStep === 0 ? 'Выберите первую точку (A)' : angleStep === 1 ? 'Выберите вершину угла (B)' : 'Выберите третью точку (C)'}</div>}
      <SmartShapeToolbar disabled={!canEdit} />
      <RemoteCursors zoom={zoom} offset={panOffset} />
    </div>
  );
};

export default Canvas;
