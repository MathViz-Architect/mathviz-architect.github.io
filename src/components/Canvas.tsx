import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import { SmartShapeToolbar } from './SmartShapeToolbar';
import { AnyCanvasObject, Point } from '@/lib/types';
import {
  isPointInObject,
  objectsIntersectRect,
  screenToCanvas,
  applyDelta,
  calculateArrowAngle,
  calculateArrowHeadPoints,
  calculateDistance,
} from '@/math-core';
import { findNearbyPoint, SNAP_RADIUS } from '@/lib/geometry';

export const Canvas: React.FC = () => {
  const {
    state,
    zoom,
    showGrid,
    selectObject: onSelectObject,
    selectMultiple: onSelectMultiple,
    updateObject: onUpdateObject,
    handleAddObject: onAddObject,
    handleDeleteObject: onDeleteObject,
    moveObjects: onMoveObjects,
    penSettings,
    shapeType,
  } = useEditorContext();
  const objects = state.objects;
  const selectedObjectIds = state.selectedObjectIds;
  const mode = state.mode;
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragObjectId, setDragObjectId] = useState<string | null>(null);
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
  const selectMouseDownRef = useRef<{ x: number; y: number; objectId: string | null } | null>(null);
  const didMarqueeSelectionRef = useRef(false);

  // Segment tool state
  // step: 0 = waiting for point A, 1 = waiting for point B
  const [segmentStep, setSegmentStep] = useState<0 | 1>(0);
  const [segmentPointAId, setSegmentPointAId] = useState<string | null>(null);
  const [segmentPreview, setSegmentPreview] = useState<Point | null>(null);

  // Angle tool state
  // step: 0 = select A, 1 = select B (vertex), 2 = select C
  const [angleStep, setAngleStep] = useState<0 | 1 | 2>(0);
  const [anglePointAId, setAnglePointAId] = useState<string | null>(null);
  const [anglePointBId, setAnglePointBId] = useState<string | null>(null);
  const [anglePreview, setAnglePreview] = useState<Point | null>(null);

  // Snap indicator: shows target point while hovering in geo modes
  const [snapTarget, setSnapTarget] = useState<{ x: number; y: number; snapped: boolean } | null>(null);

  // Freehand drawing state
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [freehandPoints, setFreehandPoints] = useState<{ x: number; y: number }[]>([]);
  const freehandLastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Panning state
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Hit detection for eraser tool - now using math-core
  // (function moved to @/math-core/geometry.ts)

  // Handle eraser deletion
  const handleEraserDelete = (x: number, y: number) => {
    if (!onDeleteObject) return;

    // Find object under cursor (check in reverse order to match rendering order)
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (obj.visible && !obj.locked && isPointInObject(x, y, obj)) {
        onDeleteObject(obj.id);
        break; // Delete only one object at a time
      }
    }
  };

  // Returns next available uppercase letter label (A, B … Z, A1 …)
  const nextPointLabel = (): string => {
    const used = new Set(
      objects
        .filter(o => o.type === 'geopoint')
        .map(o => (o.data as { label?: string }).label)
        .filter(Boolean)
    );
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const ch of letters) {
      if (!used.has(ch)) return ch;
    }
    for (let n = 1; n <= 9; n++) {
      for (const ch of letters) {
        const lbl = `${ch}${n}`;
        if (!used.has(lbl)) return lbl;
      }
    }
    return '';
  };

  // Snap: find existing geopoint within SNAP_RADIUS, or create a new one with auto-label
  const snapOrCreatePoint = (x: number, y: number): string => {
    const existing = findNearbyPoint(objects, x, y, SNAP_RADIUS);
    if (existing) return existing.id;

    const R = 5;
    const newPoint: AnyCanvasObject = {
      id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'geopoint',
      x: x - R, y: y - R,
      width: R * 2, height: R * 2,
      rotation: 0, opacity: 1, visible: true, locked: false,
      data: { color: '#1D4ED8', radius: R, label: nextPointLabel() },
    };
    onAddObject(newPoint);
    return newPoint.id;
  };

  // Segment tool click handler
  const handleSegmentClick = (x: number, y: number) => {
    if (segmentStep === 0) {
      const pointId = snapOrCreatePoint(x, y);
      setSegmentPointAId(pointId);
      setSegmentStep(1);
    } else {
      const pointBId = snapOrCreatePoint(x, y);
      const pointA = objects.find(o => o.id === segmentPointAId);
      if (!pointA || !segmentPointAId) { setSegmentStep(0); return; }

      const ax = pointA.x + pointA.width / 2;
      const ay = pointA.y + pointA.height / 2;
      // pointB may have just been created — find from all objects + newly added
      const pointB = objects.find(o => o.id === pointBId);
      const bx = pointB ? pointB.x + pointB.width / 2 : x;
      const by = pointB ? pointB.y + pointB.height / 2 : y;

      const segment: AnyCanvasObject = {
        id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'geosegment',
        x: Math.min(ax, bx), y: Math.min(ay, by),
        width: Math.abs(bx - ax), height: Math.abs(by - ay),
        rotation: 0, opacity: 1, visible: true, locked: false,
        data: { pointAId: segmentPointAId, pointBId, color: '#374151', strokeWidth: 2, showPoints: true },
      };
      onAddObject(segment);
      setSegmentStep(0);
      setSegmentPointAId(null);
      setSegmentPreview(null);
      setSnapTarget(null);
    }
  };

  // Angle tool click handler
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
      const bx = ptB.x + ptB.width / 2;
      const by = ptB.y + ptB.height / 2;

      const angle: AnyCanvasObject = {
        id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'geoangle',
        x: bx - 30, y: by - 30,
        width: 60, height: 60,
        rotation: 0, opacity: 1, visible: true, locked: false,
        data: {
          pointAId: anglePointAId,
          pointBId: anglePointBId,
          pointCId,
          color: '#7C3AED',
          arcRadius: 25,
          showLabel: true,
        },
      };
      onAddObject(angle);
      setAngleStep(0);
      setAnglePointAId(null);
      setAnglePointBId(null);
      setAnglePreview(null);
      setSnapTarget(null);
    }
  };

  // Handle resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.floor(rect.width / zoom),
          height: Math.floor(rect.height / zoom),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Also observe element size changes (e.g. when mode changes and sidebar appears/disappears)
    const observer = new ResizeObserver(updateSize);
    if (canvasRef.current) observer.observe(canvasRef.current);

    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, [zoom]);

  // Reset segment tool state when mode changes
  useEffect(() => {
    if (mode !== 'geosegment') {
      setSegmentStep(0);
      setSegmentPointAId(null);
      setSegmentPreview(null);
      setSnapTarget(null);
    }
  }, [mode]);

  // Reset angle tool state when mode changes
  useEffect(() => {
    if (mode !== 'geoangle') {
      setAngleStep(0);
      setAnglePointAId(null);
      setAnglePointBId(null);
      setAnglePreview(null);
      setSnapTarget(null);
    }
  }, [mode]);

  // Handle Space key for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !editingTextId) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (isPanning) {
          setIsPanning(false);
          setPanStart(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [editingTextId, isPanning]);

  // Handle mouse down on object
  const handleObjectMouseDown = (e: React.MouseEvent, objectId: string) => {
    if (mode === 'line') return;
    // Geo tools handle clicks via handleCanvasMouseDown — don't intercept
    if (mode === 'geosegment' || mode === 'geoangle' || mode === 'geopoint' || mode === 'eraser') return;
    // Freehand draws on canvas, never selects objects
    if (mode === 'freehand') return;
    e.stopPropagation();
    const obj = objects.find((o) => o.id === objectId);
    if (obj?.locked) return;

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

    // Save initial state before drag
    dragStartObjectsRef.current = [...objects];

    // Start drag immediately
    setIsDragging(true);
    setDragStart({ x, y });
    setDragObjectId(objectId);

    // Multi-select with Ctrl/Cmd or Shift
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    const alreadySelected = selectedObjectIds.includes(objectId);
    if (!alreadySelected || isMultiSelect) {
      onSelectObject(objectId, isMultiSelect);
    }
  };

  // Handle mouse up for object dragging
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setDragObjectId(null);
    }
  };

  // Handle text double click for editing
  const handleTextDoubleClick = (e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    const obj = objects.find((o) => o.id === objectId);
    if (!obj || obj.type !== 'text') return;

    const data = obj.data as { text: string };
    setEditingTextId(objectId);
    setEditingText(data?.text || 'Текст');
  };

  // Handle text edit completion
  const handleTextEditComplete = () => {
    if (editingTextId) {
      const updates: Partial<AnyCanvasObject> = {
        data: {
          ...objects.find((o) => o.id === editingTextId)?.data,
          text: editingText,
        },
      };
      if (editingTextSize) {
        updates.width = editingTextSize.width;
        updates.height = editingTextSize.height;
      }
      onUpdateObject(editingTextId, updates);
    }
    setEditingTextId(null);
    setEditingText('');
    setEditingTextSize(null);
  };

  // Auto-resize textarea to content
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

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      setTimeout(() => autoResizeTextarea(), 0);
    }
  }, [editingTextId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Freehand: build smoothed SVG path using quadratic bezier midpoints
  const buildSmoothPath = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q ${pts[i].x} ${pts[i].y} ${mx} ${my}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
  };

  // Handle canvas click (deselect)
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Prevent click from overriding marquee selection result
    if (didMarqueeSelectionRef.current) {
      didMarqueeSelectionRef.current = false;
      return;
    }

    // Only deselect when clicking on empty canvas space (not on any object)
    // e.target === svg element itself, not a child object
    const target = e.target as SVGElement | HTMLElement;
    const isEmptyCanvas = target.tagName === 'svg' || target === e.currentTarget;
    if (isEmptyCanvas && mode !== 'arrow' && mode !== 'line' && mode !== 'eraser') {
      onSelectObject(null);
    }
  };

  // Handle canvas mouse down - unified for arrow drawing and object dragging
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Panning with middle mouse button or Space + left click
    if (e.button === 1 || (isSpacePressed && e.button === 0)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Don't start other actions if Space is pressed (waiting for pan)
    if (isSpacePressed) {
      return;
    }

    // Arrow drawing mode
    if (mode === 'arrow' && e.target === e.currentTarget) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

      setIsDrawingArrow(true);
      setArrowStart({ x, y });
      setArrowEnd({ x, y });
      e.stopPropagation();
    }

    // Line drawing mode
    if (mode === 'line') {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

      setIsDrawingLine(true);
      setLineStart({ x, y });
      setLineEnd({ x, y });
      e.stopPropagation();
    }

    // Eraser mode
    if (mode === 'eraser') {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

      setIsErasing(true);
      handleEraserDelete(x, y);
      e.stopPropagation();
    }

    // Geopoint mode — create point on click
    if (mode === 'geopoint') {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      const R = 5;

      const existing = findNearbyPoint(objects, x, y, SNAP_RADIUS);
      if (existing) {
        onSelectObject(existing.id);
        e.stopPropagation();
        return;
      }

      const newPoint: AnyCanvasObject = {
        id: `obj_${Date.now()}`,
        type: 'geopoint',
        x: x - R,
        y: y - R,
        width: R * 2,
        height: R * 2,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        data: { color: '#1D4ED8', radius: R, label: nextPointLabel() },
      };

      onAddObject(newPoint);
      e.stopPropagation();
      setSnapTarget(null);
    }

    // Segment tool — two-click workflow
    if (mode === 'geosegment') {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      handleSegmentClick(x, y);
      e.stopPropagation();
    }

    // Angle tool — three-click workflow
    if (mode === 'geoangle') {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      handleAngleClick(x, y);
      e.stopPropagation();
    }

    // Freehand drawing — start path
    if (mode === 'freehand') {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      setIsDrawingFreehand(true);
      const firstPoint = { x, y };
      setFreehandPoints([firstPoint]);
      freehandLastPointRef.current = firstPoint;
      e.stopPropagation();
    }

    // Shape mode — drag-to-draw start
    if (mode === 'shape') {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      setIsDrawingShape(true);
      setShapeDrawStart({ x, y });
      setShapeDrawEnd({ x, y });
      e.stopPropagation();
    }

    // Select mode marquee is handled directly on the SVG element below
  };

  // Handle canvas mouse move - unified for arrow drawing and object dragging
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Panning
    if (isPanning && panStart) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Arrow drawing
    if (isDrawingArrow && arrowStart) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

      setArrowEnd({ x, y });
      return;
    }

    // Line drawing
    if (isDrawingLine && lineStart) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

      setLineEnd({ x, y });
      return;
    }

    // Eraser mode - delete while dragging
    if (isErasing) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

      handleEraserDelete(x, y);
      return;
    }

    // Marquee selection update
    if (isMarqueeSelecting) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      setMarqueeEnd({ x, y });
      return;
    }

    // Object drag
    if (isDragging && dragStart && dragObjectId) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      const idsToMove = selectedObjectIds.length > 1 && selectedObjectIds.includes(dragObjectId)
        ? selectedObjectIds : [dragObjectId];
      idsToMove.forEach((id) => {
        const obj = objects.find((o) => o.id === id);
        if (!obj) return;
        if (obj.type === 'freehand') {
          const fData = obj.data as { points: { x: number; y: number }[]; color: string; width: number };
          onUpdateObject(id, {
            x: obj.x + dx,
            y: obj.y + dy,
            data: {
              ...fData,
              points: fData.points.map(p => ({ x: p.x + dx, y: p.y + dy })),
            },
          });
        } else {
          const updates = applyDelta(obj, dx, dy);
          onUpdateObject(id, updates);
        }
      });
      setDragStart({ x, y });
      return;
    }

    // Segment preview while waiting for second point
    if (mode === 'geosegment' && segmentStep === 1) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      setSegmentPreview({ x, y });
      const near = findNearbyPoint(objects, x, y, SNAP_RADIUS);
      if (near) {
        const nx = near.x + near.width / 2;
        const ny = near.y + near.height / 2;
        setSnapTarget({ x: nx, y: ny, snapped: true });
      } else {
        setSnapTarget({ x, y, snapped: false });
      }
    }

    // Angle preview
    if (mode === 'geoangle' && angleStep >= 1) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      setAnglePreview({ x, y });
      const near = findNearbyPoint(objects, x, y, SNAP_RADIUS);
      if (near) {
        const nx = near.x + near.width / 2;
        const ny = near.y + near.height / 2;
        setSnapTarget({ x: nx, y: ny, snapped: true });
      } else {
        setSnapTarget({ x, y, snapped: false });
      }
    }

    // Geopoint mode: show snap preview
    if (mode === 'geopoint') {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      const near = findNearbyPoint(objects, x, y, SNAP_RADIUS);
      if (near) {
        const nx = near.x + near.width / 2;
        const ny = near.y + near.height / 2;
        setSnapTarget({ x: nx, y: ny, snapped: true });
      } else {
        setSnapTarget(null);
      }
    }

    // Shape drag preview
    if (mode === 'shape' && isDrawingShape) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      setShapeDrawEnd({ x, y });
      return;
    }

    // Freehand: append point if distance threshold exceeded
    if (mode === 'freehand' && isDrawingFreehand) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
      const last = freehandLastPointRef.current;
      if (!last || Math.hypot(x - last.x, y - last.y) > 2) {
        const pt = { x, y };
        setFreehandPoints(prev => [...prev, pt]);
        freehandLastPointRef.current = pt;
      }
    }
  };

  // Handle canvas mouse up - unified for arrow drawing and object dragging
  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    // Panning completion
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    // Arrow drawing completion
    if (isDrawingArrow && arrowStart && arrowEnd) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

      // Calculate drag distance
      const dx = x - arrowStart.x;
      const dy = y - arrowStart.y;
      const distance = calculateDistance(arrowStart.x, arrowStart.y, x, y);

      // Only create arrow if drag distance > 5px
      if (distance > 5) {
        const newArrow: AnyCanvasObject = {
          id: `obj_${Date.now()}`,
          type: 'arrow',
          x: arrowStart.x,
          y: arrowStart.y,
          width: dx,
          height: dy,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            stroke: '#374151',
            strokeWidth: 2,
            arrowHead: 'end',
          },
        };

        onAddObject(newArrow);
      }

      setIsDrawingArrow(false);
      setArrowStart(null);
      setArrowEnd(null);
      return;
    }

    // Line drawing completion
    if (isDrawingLine && lineStart && lineEnd) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

      // Calculate drag distance
      const distance = calculateDistance(lineStart.x, lineStart.y, x, y);

      // Only create line if drag distance > 5px
      if (distance > 5) {
        const newLine: AnyCanvasObject = {
          id: `obj_${Date.now()}`,
          type: 'line',
          x: Math.min(lineStart.x, x),
          y: Math.min(lineStart.y, y),
          width: Math.abs(x - lineStart.x),
          height: Math.abs(y - lineStart.y),
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            x1: lineStart.x,
            y1: lineStart.y,
            x2: x,
            y2: y,
            color: '#374151',
            strokeWidth: 2,
          },
        };

        onAddObject(newLine);
      }

      setIsDrawingLine(false);
      setLineStart(null);
      setLineEnd(null);
      return;
    }

    // Marquee selection completion
    if (isMarqueeSelecting && marqueeStart && marqueeEnd) {
      // Calculate marquee bounds (normalized)
      const minX = Math.min(marqueeStart.x, marqueeEnd.x);
      const maxX = Math.max(marqueeStart.x, marqueeEnd.x);
      const minY = Math.min(marqueeStart.y, marqueeEnd.y);
      const maxY = Math.max(marqueeStart.y, marqueeEnd.y);

      // Find all objects that intersect with marquee
      const selectedIds: string[] = [];
      objects.forEach((obj) => {
        if (!obj.visible || obj.locked) return;

        const intersects = objectsIntersectRect(obj, minX, minY, maxX, maxY);
        if (intersects) selectedIds.push(obj.id);
      });

      // Select all intersecting objects in one atomic call
      if (selectedIds.length > 0) {
        onSelectMultiple(selectedIds);
      } else {
        onSelectObject(null, false);
      }

      // Set flag to prevent click handler from overriding selection
      didMarqueeSelectionRef.current = true;

      setIsMarqueeSelecting(false);
      setMarqueeStart(null);
      setMarqueeEnd(null);
      return;
    }

    // Eraser mode cleanup
    if (isErasing) {
      setIsErasing(false);
      return;
    }

    // Shape drag-to-draw completion
    if (isDrawingShape && shapeDrawStart && shapeDrawEnd) {
      const x = Math.min(shapeDrawStart.x, shapeDrawEnd.x);
      const y = Math.min(shapeDrawStart.y, shapeDrawEnd.y);
      const w = Math.abs(shapeDrawEnd.x - shapeDrawStart.x);
      const h = Math.abs(shapeDrawEnd.y - shapeDrawStart.y);

      setIsDrawingShape(false);
      setShapeDrawStart(null);
      setShapeDrawEnd(null);

      if (w > 5 && h > 5) {
        const id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        let newShape: AnyCanvasObject;
        switch (shapeType) {
          case 'circle':
            newShape = { id, type: 'circle', x, y, width: w, height: w, rotation: 0, opacity: 1, visible: true, locked: false, data: { fill: '#10B981', stroke: '#047857', strokeWidth: 2 } };
            break;
          case 'triangle':
            newShape = { id, type: 'triangle', x, y, width: w, height: h, rotation: 0, opacity: 1, visible: true, locked: false, data: { fill: '#F59E0B', stroke: '#D97706', strokeWidth: 2 } };
            break;
          case 'geoshape-circle':
            newShape = { id, type: 'geoshape', x, y, width: w, height: w, rotation: 0, opacity: 1, visible: true, locked: false, data: { shapeKind: 'circle', radius: Math.round(w / 2), stroke: '#374151', strokeWidth: 2 } };
            break;
          case 'geoshape-triangle':
            newShape = { id, type: 'geoshape', x, y, width: w, height: h, rotation: 0, opacity: 1, visible: true, locked: false, data: { shapeKind: 'triangle', sideA: Math.round(w), sideB: Math.round(w), sideC: Math.round(w), stroke: '#374151', strokeWidth: 2 } };
            break;
          case 'geoshape-quad':
            newShape = { id, type: 'geoshape', x, y, width: w, height: h, rotation: 0, opacity: 1, visible: true, locked: false, data: { shapeKind: 'quadrilateral', sideAB: Math.round(w), sideBC: Math.round(h), sideCD: Math.round(w), sideDA: Math.round(h), stroke: '#374151', strokeWidth: 2 } };
            break;
          default:
            newShape = { id, type: 'rectangle', x, y, width: w, height: h, rotation: 0, opacity: 1, visible: true, locked: false, data: { fill: '#4F46E5', stroke: '#312E81', strokeWidth: 2, cornerRadius: 0 } };
        }
        onAddObject(newShape);
        onSelectObject(newShape.id);
      }
      return;
    }

    // Freehand drawing completion
    if (isDrawingFreehand) {
      setIsDrawingFreehand(false);
      freehandLastPointRef.current = null;
      if (freehandPoints.length >= 2) {
        const xs = freehandPoints.map(p => p.x);
        const ys = freehandPoints.map(p => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        const newPath: AnyCanvasObject = {
          id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'freehand',
          x: minX,
          y: minY,
          width: Math.max(maxX - minX, 1),
          height: Math.max(maxY - minY, 1),
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            points: freehandPoints,
            color: penSettings.color,
            width: penSettings.width,
          },
        };
        onAddObject(newPath);
      }
      setFreehandPoints([]);
      return;
    }

    // Object dragging completion
    if (isDragging) {
      // Save move to history if objects were actually moved
      if (dragStartObjectsRef.current.length > 0) {
        onMoveObjects(dragStartObjectsRef.current, objects);
      }
      setIsDragging(false);
      setDragStart(null);
      setDragObjectId(null);
      dragStartObjectsRef.current = [];
      return;
    }
  };

  // Handle double click to add object
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as SVGElement | HTMLElement;
    const isEmptyCanvas = target.tagName === 'svg' || target === e.currentTarget;

    // In text mode, double-click on empty canvas creates a text object
    if (isEmptyCanvas && mode === 'text') {
      // fall through to object creation below
    } else if (isEmptyCanvas) {
      // Double-click on empty canvas resets pan
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    if (!['shape', 'draw', 'fraction', 'chart', 'arrow', 'text'].includes(mode)) return;

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);

    let newObject: AnyCanvasObject;

    switch (mode) {
      case 'text':
        newObject = {
          id: `obj_${Date.now()}`,
          type: 'text',
          x: x - 100,
          y: y - 20,
          width: 200,
          height: 40,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            text: 'Текст',
            fontSize: 24,
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            fill: '#1F2937',
            textAlign: 'left',
          },
        };
        break;

      case 'fraction':
        newObject = {
          id: `obj_${Date.now()}`,
          type: 'fraction',
          x: x - 75,
          y: y - 75,
          width: 150,
          height: 150,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            numerator: 1,
            denominator: 2,
            fill: '#4F46E5',
            stroke: '#312E81',
            strokeWidth: 2,
            showLabels: true,
          },
        };
        break;

      case 'chart':
        // Create a simple bar chart object (using rectangle as placeholder)
        newObject = {
          id: `obj_${Date.now()}`,
          type: 'rectangle',
          x: x - 50,
          y: y - 75,
          width: 100,
          height: 150,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#10B981',
            stroke: '#047857',
            strokeWidth: 2,
            cornerRadius: 4,
          },
        };
        break;

      case 'arrow':
        newObject = {
          id: `obj_${Date.now()}`,
          type: 'arrow',
          x: x - 75,
          y: y - 10,
          width: 150,
          height: 20,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            stroke: '#374151',
            strokeWidth: 2,
            arrowHead: 'end',
          },
        };
        break;

      default:
        // Default rectangle for 'shape' and 'draw' modes
        newObject = {
          id: `obj_${Date.now()}`,
          type: 'rectangle',
          x: x - 50,
          y: y - 30,
          width: 100,
          height: 60,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          data: {
            fill: '#4F46E5',
            stroke: '#312E81',
            strokeWidth: 2,
            cornerRadius: 0,
          },
        };
    }

    onAddObject(newObject);
  };

  // Render grid
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridSize = 20;
    const lines = [];

    for (let x = 0; x <= canvasSize.width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasSize.height}
          stroke="#E5E7EB"
          strokeWidth={0.5}
        />
      );
    }

    for (let y = 0; y <= canvasSize.height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasSize.width}
          y2={y}
          stroke="#E5E7EB"
          strokeWidth={0.5}
        />
      );
    }

    return <>{lines}</>;
  };

  // Render object based on type
  const renderObject = (obj: AnyCanvasObject) => {
    const isSelected = selectedObjectIds.includes(obj.id);
    const opacity = obj.visible ? obj.opacity : 0.3;

    switch (obj.type) {
      case 'rectangle': {
        const data = obj.data as {
          fill: string;
          stroke: string;
          strokeWidth: number;
          cornerRadius: number;
        };

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            <rect
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              rx={data?.cornerRadius || 0}
              ry={data?.cornerRadius || 0}
              fill={data?.fill || '#4F46E5'}
              stroke={data?.stroke || '#312E81'}
              strokeWidth={data?.strokeWidth || 2}
              opacity={opacity}
              transform={`rotate(${obj.rotation} ${obj.x + obj.width / 2} ${obj.y + obj.height / 2})`}
            />
            {isSelected && (
              <rect
                x={obj.x - 2}
                y={obj.y - 2}
                width={obj.width + 4}
                height={obj.height + 4}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </g>
        );
      }

      case 'circle': {
        const data = obj.data as {
          fill: string;
          stroke: string;
          strokeWidth: number;
        };
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        const rx = obj.width / 2;
        const ry = obj.height / 2;

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={data?.fill || '#10B981'}
              stroke={data?.stroke || '#047857'}
              strokeWidth={data?.strokeWidth || 2}
              opacity={opacity}
            />
            {isSelected && (
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx + 4}
                ry={ry + 4}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </g>
        );
      }

      case 'triangle': {
        const data = obj.data as {
          fill: string;
          stroke: string;
          strokeWidth: number;
        };

        const centerX = obj.x + obj.width / 2;
        const centerY = obj.y + obj.height / 2;
        const points = `${obj.x + obj.width / 2},${obj.y} ${obj.x + obj.width},${obj.y + obj.height} ${obj.x},${obj.y + obj.height}`;

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            <polygon
              points={points}
              fill={data?.fill || '#F59E0B'}
              stroke={data?.stroke || '#D97706'}
              strokeWidth={data?.strokeWidth || 2}
              opacity={opacity}
              transform={`rotate(${obj.rotation} ${centerX} ${centerY})`}
            />
            {isSelected && (
              <rect
                x={obj.x - 2}
                y={obj.y - 2}
                width={obj.width + 4}
                height={obj.height + 4}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </g>
        );
      }

      case 'polygon': {
        const data = obj.data as {
          points: { x: number; y: number }[];
          fill: string;
          stroke: string;
          strokeWidth: number;
        };

        const pts = data.points
          .map(p => `${obj.x + p.x * obj.width},${obj.y + p.y * obj.height}`)
          .join(' ');

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            <polygon
              points={pts}
              fill={data?.fill || '#F59E0B'}
              stroke={data?.stroke || '#D97706'}
              strokeWidth={data?.strokeWidth || 2}
              opacity={opacity}
            />
            {isSelected && (
              <rect
                x={obj.x - 2}
                y={obj.y - 2}
                width={obj.width + 4}
                height={obj.height + 4}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </g>
        );
      }


      case 'geoshape': {
        const data = obj.data as {
          shapeKind: 'circle' | 'triangle' | 'quadrilateral';
          radius?: number;
          sideA?: number; sideB?: number; sideC?: number;
          sideAB?: number; sideBC?: number; sideCD?: number; sideDA?: number;
          stroke: string;
          strokeWidth: number;
        };

        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;

        // Helper: compute triangle points from sides a,b,c using law of cosines
        const getTrianglePoints = (a: number, b: number, c: number) => {
          // Place side c along bottom, compute apex
          const cosA = (b * b + c * c - a * a) / (2 * b * c);
          if (cosA < -1 || cosA > 1) return null; // invalid
          const sinA = Math.sqrt(1 - cosA * cosA);
          // Normalize to fit in obj.width x obj.height
          const scale = Math.min(obj.width / c, obj.height / (b * sinA)) * 0.9;
          const baseY = obj.y + obj.height * 0.9;
          const baseX = obj.x + (obj.width - c * scale) / 2;
          const px1 = baseX;
          const py1 = baseY;
          const px2 = baseX + c * scale;
          const py2 = baseY;
          const px3 = baseX + b * cosA * scale;
          const py3 = baseY - b * sinA * scale;
          return `${px1},${py1} ${px2},${py2} ${px3},${py3}`;
        };

        // Helper: compute quadrilateral points using all four independent sides
        const getQuadPoints = (ab: number, bc: number, cd: number, da: number) => {
          // Place quadrilateral centered in obj bounds
          // A is top-left, B is top-right, C is bottom-right, D is bottom-left
          // AB = top side, BC = right side, CD = bottom side, DA = left side

          const maxWidth = Math.max(ab, cd);
          const maxHeight = Math.max(bc, da);
          const ox = obj.x + (obj.width - maxWidth) / 2;
          const oy = obj.y + (obj.height - maxHeight) / 2;

          // Point A (top-left)
          const ax = ox;
          const ay = oy;

          // Point B (top-right) - distance AB from A
          const bx = ax + ab;
          const by = ay;

          // Point D (bottom-left) - distance DA down from A
          const dx = ax;
          const dy = ay + da;

          // Point C (bottom-right) - distance BC down from B and distance CD from D
          // Average the two possible positions for C
          const cx = (bx + (dx + cd)) / 2;
          const cy = (by + bc + dy) / 2;

          return `${ax},${ay} ${bx},${by} ${cx},${cy} ${dx},${dy}`;
        };

        let shapeEl: React.ReactNode = null;
        let isInvalid = false;

        if (data.shapeKind === 'circle') {
          const r = Math.min(obj.width, obj.height) / 2 - 2;
          shapeEl = (
            <circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={data.stroke || '#374151'}
              strokeWidth={data.strokeWidth || 2}
              opacity={opacity}
            />
          );
        } else if (data.shapeKind === 'triangle') {
          const a = data.sideA ?? 100;
          const b = data.sideB ?? 100;
          const c = data.sideC ?? 100;
          // Validate triangle inequality
          if (a + b <= c || a + c <= b || b + c <= a) {
            isInvalid = true;
          } else {
            const pts = getTrianglePoints(a, b, c);
            if (!pts) {
              isInvalid = true;
            } else {
              shapeEl = (
                <polygon
                  points={pts}
                  fill="none"
                  stroke={data.stroke || '#374151'}
                  strokeWidth={data.strokeWidth || 2}
                  opacity={opacity}
                />
              );
            }
          }
        } else if (data.shapeKind === 'quadrilateral') {
          const ab = data.sideAB ?? 160;
          const bc = data.sideBC ?? 120;
          const cd = data.sideCD ?? 160;
          const da = data.sideDA ?? 120;
          const pts = getQuadPoints(ab, bc, cd, da);
          shapeEl = (
            <polygon
              points={pts}
              fill="none"
              stroke={data.stroke || '#374151'}
              strokeWidth={data.strokeWidth || 2}
              opacity={opacity}
            />
          );
        }

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            {isInvalid ? (
              <text
                x={cx} y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fill="#EF4444"
              >
                Неверные стороны
              </text>
            ) : shapeEl}
            {isSelected && (
              <rect
                x={obj.x - 2} y={obj.y - 2}
                width={obj.width + 4} height={obj.height + 4}
                fill="none" stroke="#F59E0B"
                strokeWidth={2} strokeDasharray="5,5"
              />
            )}
          </g>
        );
      }

      case 'fraction': {
        const data = obj.data as {
          numerator: number;
          denominator: number;
          fill: string;
          stroke: string;
          strokeWidth: number;
          showLabels: boolean;
        };

        const numerator = data?.numerator || 1;
        const denominator = data?.denominator || 1;

        // Calculate whole circles and remainder
        const wholeCircles = Math.floor(numerator / denominator);
        const remainder = numerator % denominator;
        const radius = Math.min(obj.width, obj.height) / 2 - 4;

        // Helper to draw arc
        const describeArc = (cx: number, cy: number, startAngle: number, endAngle: number) => {
          const start = {
            x: cx + radius * Math.cos(startAngle),
            y: cy + radius * Math.sin(startAngle),
          };
          const end = {
            x: cx + radius * Math.cos(endAngle),
            y: cy + radius * Math.sin(endAngle),
          };
          const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
          if (largeArcFlag) {
            return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y} Z`;
          }
          return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z`;
        };

        // Render multiple circles for improper fractions
        const circles = [];
        const circleSpacing = radius * 2.5;

        // Calculate grid layout
        const maxCirclesPerRow = Math.max(1, Math.floor((obj.width - 20) / circleSpacing));

        for (let i = 0; i < wholeCircles; i++) {
          const row = Math.floor(i / maxCirclesPerRow);
          const col = i % maxCirclesPerRow;
          const cx_circle = obj.x + radius + col * circleSpacing;
          const cy_circle = obj.y + radius + row * circleSpacing;

          circles.push(
            <circle
              key={`whole-${i}`}
              cx={cx_circle}
              cy={cy_circle}
              r={radius}
              fill={data?.fill || '#4F46E5'}
              stroke={data?.stroke || '#312E81'}
              strokeWidth={data?.strokeWidth || 2}
              opacity={opacity}
            />
          );
        }

        // Add remainder circle if needed
        if (remainder > 0) {
          const i = wholeCircles;
          const row = Math.floor(i / maxCirclesPerRow);
          const col = i % maxCirclesPerRow;
          const cx_circle = obj.x + radius + col * circleSpacing;
          const cy_circle = obj.y + radius + row * circleSpacing;

          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + (Math.PI * 2 * remainder / denominator);

          circles.push(
            <g key={`remainder-${i}`}>
              <circle
                cx={cx_circle}
                cy={cy_circle}
                r={radius}
                fill="#F3F4F6"
                stroke={data?.stroke || '#312E81'}
                strokeWidth={data?.strokeWidth || 2}
                opacity={opacity}
              />
              <path
                d={describeArc(cx_circle, cy_circle, startAngle, endAngle)}
                fill={data?.fill || '#4F46E5'}
                opacity={opacity}
              />
            </g>
          );
        }

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            {circles}
            {isSelected && circles.map((circle, i) => {
              const row = Math.floor(i / maxCirclesPerRow);
              const col = i % maxCirclesPerRow;
              const cx_sel = obj.x + radius + col * circleSpacing;
              const cy_sel = obj.y + radius + row * circleSpacing;
              return (
                <circle
                  key={`sel-${i}`}
                  cx={cx_sel}
                  cy={cy_sel}
                  r={radius + 4}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              );
            })}
          </g>
        );
      }

      case 'text': {
        const data = obj.data as {
          text: string;
          fontSize: number;
          fontFamily: string;
          fontWeight: string;
          fill: string;
          textAlign: string;
        };

        const isEditing = editingTextId === obj.id;
        const maxWidth = canvasSize.width - obj.x - 8;
        const foWidth = isEditing
          ? (editingTextSize?.width ?? Math.min(obj.width, maxWidth))
          : obj.width;
        const foHeight = isEditing
          ? (editingTextSize?.height ?? obj.height)
          : obj.height;

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => !isEditing && handleObjectMouseDown(e, obj.id)}
            onDoubleClick={(e) => handleTextDoubleClick(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : isEditing ? 'text' : 'move' }}
          >
            <foreignObject
              x={obj.x}
              y={obj.y}
              width={Math.max(foWidth, 40)}
              height={Math.max(foHeight, 24)}
              style={{ overflow: 'visible' }}
            >
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  value={editingText}
                  onChange={(e) => {
                    setEditingText(e.target.value);
                    autoResizeTextarea();
                  }}
                  onBlur={handleTextEditComplete}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTextEditComplete();
                    } else if (e.key === 'Escape') {
                      setEditingTextId(null);
                      setEditingText('');
                      setEditingTextSize(null);
                    }
                  }}
                  style={{
                    display: 'block',
                    width: `${Math.min(Math.max(foWidth, 80), maxWidth)}px`,
                    minWidth: '80px',
                    maxWidth: `${maxWidth}px`,
                    height: 'auto',
                    minHeight: '32px',
                    fontSize: `${data?.fontSize || 16}px`,
                    fontFamily: data?.fontFamily || 'sans-serif',
                    fontWeight: data?.fontWeight || 'normal',
                    color: data?.fill || '#1F2937',
                    textAlign: (data?.textAlign as 'left' | 'center' | 'right') || 'left',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid #F59E0B',
                    borderRadius: '4px',
                    padding: '4px',
                    resize: 'none',
                    outline: 'none',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: `${data?.fontSize || 16}px`,
                    fontFamily: data?.fontFamily || 'sans-serif',
                    fontWeight: data?.fontWeight || 'normal',
                    color: data?.fill || '#1F2937',
                    textAlign: (data?.textAlign as 'left' | 'center' | 'right') || 'left',
                    opacity,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    width: '100%',
                    padding: '4px',
                    boxSizing: 'border-box',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  {data?.text || 'Текст'}
                </div>
              )}
            </foreignObject>
            {isSelected && !isEditing && (
              <rect
                x={obj.x - 2}
                y={obj.y - 2}
                width={foWidth + 4}
                height={foHeight + 4}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </g>
        );
      }

      case 'arrow': {
        const data = obj.data as {
          stroke: string;
          strokeWidth: number;
          arrowHead: string;
        };

        // Calculate arrow points - handle negative width/height
        const x1 = obj.x;
        const y1 = obj.y;
        const x2 = obj.x + obj.width;
        const y2 = obj.y + obj.height;

        // Arrow head size
        const headLength = 15;

        // Calculate arrow head angle
        const angle = calculateArrowAngle(x1, y1, x2, y2);

        // Arrow head points at end
        const endPoints = calculateArrowHeadPoints(x2, y2, angle, headLength, 'forward');
        const arrowPoint1X = endPoints.point1X;
        const arrowPoint1Y = endPoints.point1Y;
        const arrowPoint2X = endPoints.point2X;
        const arrowPoint2Y = endPoints.point2Y;

        // Arrow head points at start (for 'both' option)
        const startPoints = calculateArrowHeadPoints(x1, y1, angle, headLength, 'backward');
        const arrowPoint3X = startPoints.point1X;
        const arrowPoint3Y = startPoints.point1Y;
        const arrowPoint4X = startPoints.point2X;
        const arrowPoint4Y = startPoints.point2Y;

        const centerX = obj.x + obj.width / 2;
        const centerY = obj.y + obj.height / 2;

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
            transform={`rotate(${obj.rotation} ${centerX} ${centerY})`}
          >
            {/* Arrow line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={data?.stroke || '#374151'}
              strokeWidth={data?.strokeWidth || 2}
              opacity={opacity}
            />

            {/* Arrow head at end */}
            {(data?.arrowHead === 'end' || data?.arrowHead === 'both') && (
              <polygon
                points={`${x2},${y2} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
                fill={data?.stroke || '#374151'}
                opacity={opacity}
              />
            )}

            {/* Arrow head at start */}
            {data?.arrowHead === 'both' && (
              <polygon
                points={`${x1},${y1} ${arrowPoint3X},${arrowPoint3Y} ${arrowPoint4X},${arrowPoint4Y}`}
                fill={data?.stroke || '#374151'}
                opacity={opacity}
              />
            )}

            {isSelected && (
              <rect
                x={Math.min(x1, x2) - 2}
                y={Math.min(y1, y2) - 2}
                width={Math.abs(obj.width) + 4}
                height={Math.abs(obj.height) + 4}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </g>
        );
      }

      case 'line': {
        const data = obj.data as {
          x1: number;
          y1: number;
          x2: number;
          y2: number;
          color: string;
          strokeWidth: number;
          arrowStart?: boolean;
          arrowEnd?: boolean;
        };

        // Calculate arrowhead geometry if needed
        const headLength = 15;
        const angle = calculateArrowAngle(data.x1, data.y1, data.x2, data.y2);

        // Arrow head points at end
        const endPoints = calculateArrowHeadPoints(data.x2, data.y2, angle, headLength, 'forward');
        const arrowEndPoint1X = endPoints.point1X;
        const arrowEndPoint1Y = endPoints.point1Y;
        const arrowEndPoint2X = endPoints.point2X;
        const arrowEndPoint2Y = endPoints.point2Y;

        // Arrow head points at start
        const startPoints = calculateArrowHeadPoints(data.x1, data.y1, angle, headLength, 'backward');
        const arrowStartPoint1X = startPoints.point1X;
        const arrowStartPoint1Y = startPoints.point1Y;
        const arrowStartPoint2X = startPoints.point2X;
        const arrowStartPoint2Y = startPoints.point2Y;

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            <line
              x1={data.x1}
              y1={data.y1}
              x2={data.x2}
              y2={data.y2}
              stroke={data.color || '#374151'}
              strokeWidth={data.strokeWidth || 2}
              strokeLinecap="round"
              opacity={opacity}
            />

            {/* Arrow head at end */}
            {data.arrowEnd && (
              <polygon
                points={`${data.x2},${data.y2} ${arrowEndPoint1X},${arrowEndPoint1Y} ${arrowEndPoint2X},${arrowEndPoint2Y}`}
                fill={data.color || '#374151'}
                opacity={opacity}
              />
            )}

            {/* Arrow head at start */}
            {data.arrowStart && (
              <polygon
                points={`${data.x1},${data.y1} ${arrowStartPoint1X},${arrowStartPoint1Y} ${arrowStartPoint2X},${arrowStartPoint2Y}`}
                fill={data.color || '#374151'}
                opacity={opacity}
              />
            )}

            {isSelected && (
              <rect
                x={Math.min(data.x1, data.x2) - 2}
                y={Math.min(data.y1, data.y2) - 2}
                width={Math.abs(data.x2 - data.x1) + 4}
                height={Math.abs(data.y2 - data.y1) + 4}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </g>
        );
      }

      case 'chart': {
        const data = obj.data as {
          chartType: 'bar' | 'pie' | 'line';
          data: Array<{ label: string; value: number; color: string }>;
          title: string;
        };

        if (data?.chartType === 'bar') {
          // Bar chart rendering
          const chartData = data.data || [];
          const barCount = chartData.length;
          const titleHeight = 20;
          const bottomMargin = 25;
          const leftMargin = 35;
          const topMargin = 10;

          const chartWidth = obj.width - leftMargin - 10;
          const chartHeight = obj.height - titleHeight - bottomMargin - topMargin;

          const barWidth = chartWidth / (barCount * 2);
          const barSpacing = barWidth;
          const maxValue = Math.max(...chartData.map(d => d.value), 100);

          // Y-axis scale marks
          const yAxisMarks = [0, 25, 50, 75, 100];

          return (
            <g
              key={obj.id}
              onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
              style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
            >
              {/* Background */}
              <rect
                x={obj.x}
                y={obj.y}
                width={obj.width}
                height={obj.height}
                fill="white"
                stroke="#E5E7EB"
                strokeWidth={1}
                opacity={opacity}
              />

              {/* Title */}
              <text
                x={obj.x + obj.width / 2}
                y={obj.y + 15}
                textAnchor="middle"
                fontSize={12}
                fontWeight="bold"
                fill="#374151"
              >
                {data?.title || 'Диаграмма'}
              </text>

              {/* Grid lines and Y-axis labels */}
              {yAxisMarks.map((mark) => {
                const yPos = obj.y + titleHeight + topMargin + chartHeight - (mark / 100) * chartHeight;
                return (
                  <g key={mark}>
                    {/* Grid line */}
                    <line
                      x1={obj.x + leftMargin}
                      y1={yPos}
                      x2={obj.x + obj.width - 10}
                      y2={yPos}
                      stroke="#E5E7EB"
                      strokeWidth={1}
                      opacity={0.5}
                    />
                    {/* Y-axis label */}
                    <text
                      x={obj.x + leftMargin - 5}
                      y={yPos + 3}
                      textAnchor="end"
                      fontSize={8}
                      fill="#6B7280"
                    >
                      {mark}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis line */}
              <line
                x1={obj.x + leftMargin}
                y1={obj.y + titleHeight + topMargin}
                x2={obj.x + leftMargin}
                y2={obj.y + titleHeight + topMargin + chartHeight}
                stroke="#9CA3AF"
                strokeWidth={1}
              />

              {/* Bars */}
              {chartData.map((item, index) => {
                const barHeight = (item.value / maxValue) * chartHeight;
                const barX = obj.x + leftMargin + barSpacing + index * (barWidth + barSpacing);
                const barY = obj.y + titleHeight + topMargin + chartHeight - barHeight;

                return (
                  <g key={index}>
                    {/* Bar */}
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={item.color}
                      opacity={opacity}
                    />
                    {/* Value label above bar */}
                    <text
                      x={barX + barWidth / 2}
                      y={barY - 3}
                      textAnchor="middle"
                      fontSize={9}
                      fontWeight="bold"
                      fill="#374151"
                    >
                      {item.value}
                    </text>
                    {/* X-axis label */}
                    <text
                      x={barX + barWidth / 2}
                      y={obj.y + obj.height - 10}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#6B7280"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}

              {isSelected && (
                <rect
                  x={obj.x - 2}
                  y={obj.y - 2}
                  width={obj.width + 4}
                  height={obj.height + 4}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
            </g>
          );
        } else if (data?.chartType === 'pie') {
          // Pie chart rendering
          const chartData = data.data || [];
          const total = chartData.reduce((sum, item) => sum + item.value, 0);
          const centerX = obj.x + obj.width / 2;
          const centerY = obj.y + obj.height / 2;
          const radius = Math.min(obj.width, obj.height) / 2 - 10;

          let currentAngle = -Math.PI / 2; // Start from top

          return (
            <g
              key={obj.id}
              onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
              style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
            >
              {/* Background circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius + 5}
                fill="white"
                stroke="#E5E7EB"
                strokeWidth={1}
                opacity={opacity}
              />

              {/* Pie slices */}
              {chartData.map((item, index) => {
                const sliceAngle = (item.value / total) * 2 * Math.PI;
                const endAngle = currentAngle + sliceAngle;

                const x1 = centerX + radius * Math.cos(currentAngle);
                const y1 = centerY + radius * Math.sin(currentAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);

                const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                const slice = (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    stroke="white"
                    strokeWidth={2}
                    opacity={opacity}
                  />
                );

                currentAngle = endAngle;
                return slice;
              })}

              {isSelected && (
                <rect
                  x={obj.x - 2}
                  y={obj.y - 2}
                  width={obj.width + 4}
                  height={obj.height + 4}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
            </g>
          );
        }

        // Fallback for unknown chart type
        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            <rect
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              fill="#E5E7EB"
              stroke="#9CA3AF"
              strokeWidth={1}
              opacity={opacity}
            />
            <text
              x={obj.x + obj.width / 2}
              y={obj.y + obj.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fill="#6B7280"
            >
              chart
            </text>
            {isSelected && (
              <rect
                x={obj.x - 2}
                y={obj.y - 2}
                width={obj.width + 4}
                height={obj.height + 4}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </g>
        );
      }

      case 'geopoint': {
        const data = obj.data as { color: string; radius: number; label?: string };
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        const r = data?.radius ?? 5;

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            <circle cx={cx} cy={cy} r={r} fill={data?.color || '#1D4ED8'} opacity={opacity} />
            {data?.label && (
              <text
                x={cx + r + 4}
                y={cy - r}
                fontSize={13}
                fontWeight="bold"
                fontFamily="sans-serif"
                stroke="white"
                strokeWidth={3}
                strokeLinejoin="round"
                paintOrder="stroke"
                fill={data.color || '#1D4ED8'}
                pointerEvents="none"
                style={{ userSelect: 'none' }}
              >
                {data.label}
              </text>
            )}
            {isSelected && (
              <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4,4" />
            )}
          </g>
        );
      }

      case 'geosegment': {
        const data = obj.data as { pointAId: string; pointBId: string; color: string; strokeWidth: number; showPoints?: boolean };
        const ptA = objects.find(o => o.id === data.pointAId);
        const ptB = objects.find(o => o.id === data.pointBId);
        if (!ptA || !ptB) return null;

        const ax = ptA.x + ptA.width / 2;
        const ay = ptA.y + ptA.height / 2;
        const bx = ptB.x + ptB.width / 2;
        const by = ptB.y + ptB.height / 2;
        const ptAData = ptA.data as { color?: string; label?: string };
        const ptBData = ptB.data as { color?: string; label?: string };

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            {/* Invisible wider hit area */}
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke="transparent" strokeWidth={12} />
            <line
              x1={ax} y1={ay} x2={bx} y2={by}
              stroke={data?.color || '#374151'}
              strokeWidth={data?.strokeWidth || 2}
              opacity={opacity}
              strokeLinecap="round"
            />
            {/* Endpoint dots rendered by geopoint objects themselves — no duplicates here */}
            {isSelected && (
              <line
                x1={ax} y1={ay} x2={bx} y2={by}
                stroke="#F59E0B"
                strokeWidth={(data?.strokeWidth || 2) + 4}
                strokeLinecap="round"
                opacity={0.4}
              />
            )}
          </g>
        );
      }

      case 'geoangle': {
        const data = obj.data as {
          pointAId: string;
          pointBId: string;
          pointCId: string;
          color: string;
          arcRadius: number;
          showLabel: boolean;
        };

        const ptA = objects.find(o => o.id === data.pointAId);
        const ptB = objects.find(o => o.id === data.pointBId);
        const ptC = objects.find(o => o.id === data.pointCId);
        if (!ptA || !ptB || !ptC) return null;

        // Coordinates: B is vertex
        const ax = ptA.x + ptA.width / 2;
        const ay = ptA.y + ptA.height / 2;
        const bx = ptB.x + ptB.width / 2;
        const by = ptB.y + ptB.height / 2;
        const cx = ptC.x + ptC.width / 2;
        const cy = ptC.y + ptC.height / 2;

        // Vectors BA and BC
        const baX = ax - bx; const baY = ay - by;
        const bcX = cx - bx; const bcY = cy - by;
        const lenBA = Math.hypot(baX, baY);
        const lenBC = Math.hypot(bcX, bcY);

        if (lenBA < 1 || lenBC < 1) return null;

        // Compute angle in degrees
        const dot = baX * bcX + baY * bcY;
        const cosA = Math.max(-1, Math.min(1, dot / (lenBA * lenBC)));
        const angleDeg = Math.round(Math.acos(cosA) * 180 / Math.PI);

        // Arc angles (from B, measuring from positive X axis)
        const startAngle = Math.atan2(baY, baX);
        const endAngle = Math.atan2(bcY, bcX);

        // Build SVG arc path: always draw the smaller arc
        const R = data.arcRadius ?? 25;

        // Start and end points on the arc circle
        const sx = bx + R * Math.cos(startAngle);
        const sy = by + R * Math.sin(startAngle);
        const ex = bx + R * Math.cos(endAngle);
        const ey = by + R * Math.sin(endAngle);

        // Determine sweep direction: use the shorter arc
        // cross product: BA × BC — positive = counter-clockwise from BA to BC
        const cross = baX * bcY - baY * bcX;
        const sweepFlag = cross > 0 ? 1 : 0;
        const largeArcFlag = 0; // always draw shorter arc

        const arcPath = `M ${sx} ${sy} A ${R} ${R} 0 ${largeArcFlag} ${sweepFlag} ${ex} ${ey}`;

        // Label position: midpoint angle direction from B
        const midAngle = startAngle + (cross > 0 ? 1 : -1) * Math.acos(cosA) / 2;
        const labelDist = R + 14;
        const labelX = bx + labelDist * Math.cos(midAngle);
        const labelY = by + labelDist * Math.sin(midAngle);

        // Point labels for display
        const ptALabel = (ptA.data as { label?: string }).label || 'A';
        const ptBLabel = (ptB.data as { label?: string }).label || 'B';
        const ptCLabel = (ptC.data as { label?: string }).label || 'C';

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
            opacity={opacity}
          >
            {/* Arc */}
            <path
              d={arcPath}
              fill="none"
              stroke={data.color || '#7C3AED'}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            {/* Filled arc sector (light) */}
            <path
              d={`M ${bx} ${by} L ${sx} ${sy} A ${R} ${R} 0 ${largeArcFlag} ${sweepFlag} ${ex} ${ey} Z`}
              fill={data.color || '#7C3AED'}
              fillOpacity={0.1}
              stroke="none"
            />
            {/* Label: ∠ABC = N° */}
            {data.showLabel && (
              <text
                x={labelX}
                y={labelY}
                fontSize={11}
                fill={data.color || '#7C3AED'}
                fontFamily="sans-serif"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {`∠${ptALabel}${ptBLabel}${ptCLabel} = ${angleDeg}°`}
              </text>
            )}
            {isSelected && (
              <circle
                cx={bx} cy={by} r={R + 4}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="4,4"
              />
            )}
          </g>
        );
      }

      case 'freehand': {
        const data = obj.data as { points: { x: number; y: number }[]; color: string; width: number };
        const d = buildSmoothPath(data.points);
        if (!d) return null;
        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            {/* Invisible wider hit area for easier selection */}
            <path d={d} stroke="transparent" strokeWidth={Math.max((data.width || 2) * 3, 10)} fill="none" />
            <path
              d={d}
              stroke={data.color || '#374151'}
              strokeWidth={data.width || 2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
            />
            {isSelected && (
              <path
                d={d}
                stroke="#F59E0B"
                strokeWidth={(data.width || 2) + 4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.4}
              />
            )}
          </g>
        );
      }

      default:
        return (
          <g
            key={obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : 'move' }}
          >
            <rect
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              fill="#E5E7EB"
              stroke="#9CA3AF"
              strokeWidth={1}
              opacity={opacity}
            />
            <text
              x={obj.x + obj.width / 2}
              y={obj.y + obj.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fill="#6B7280"
            >
              {obj.type}
            </text>
            {isSelected && (
              <rect
                x={obj.x - 2}
                y={obj.y - 2}
                width={obj.width + 4}
                height={obj.height + 4}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}
          </g>
        );
    }
  };

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden relative">
      <div
        ref={canvasRef}
        className="w-full h-full overflow-auto select-none"
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={(e) => { handleCanvasMouseMove(e); }}
        onMouseUp={(e) => { handleCanvasMouseUp(e); }}
        onMouseLeave={() => {
          setSnapTarget(null);
          if (isPanning) {
            setIsPanning(false);
            setPanStart(null);
          } else if (isDrawingArrow) {
            setIsDrawingArrow(false);
            setArrowStart(null);
            setArrowEnd(null);
          } else if (isDrawingLine) {
            setIsDrawingLine(false);
            setLineStart(null);
            setLineEnd(null);
          } else if (isErasing) {
            setIsErasing(false);
          } else if (isDrawingFreehand) {
            setIsDrawingFreehand(false);
            setFreehandPoints([]);
            freehandLastPointRef.current = null;
          } else if (isMarqueeSelecting) {
            setIsMarqueeSelecting(false);
            setMarqueeStart(null);
            setMarqueeEnd(null);
          } else {
            handleMouseUp();
          }
        }}
        style={{
          cursor: isPanning ? 'grabbing' : isSpacePressed ? 'grab' : mode === 'arrow' || mode === 'line' ? 'crosshair' : mode === 'eraser' ? 'cell' : ['draw', 'fraction', 'chart', 'geopoint', 'geosegment', 'geoangle', 'freehand', 'shape'].includes(mode) ? 'crosshair' : 'default',
        }}
      >
        <svg
          ref={svgRef}
          data-canvas-svg
          width={canvasSize.width * zoom}
          height={canvasSize.height * zoom}
          viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
          onMouseDown={(e: React.MouseEvent<SVGSVGElement>) => {
            if (mode === 'line' || mode === 'geosegment' || mode === 'shape') { handleCanvasMouseDown(e as unknown as React.MouseEvent); return; }
            // Don't start marquee if panning or Space is pressed
            if (isPanning || isSpacePressed) return;
            // Marquee: only when clicking directly on SVG background (not on objects)
            if (mode === 'select' && e.target === e.currentTarget) {
              const svgRect = svgRef.current?.getBoundingClientRect();
              if (!svgRect) return;
              // Convert client coords to SVG viewBox coords
              const { x, y } = screenToCanvas(e.clientX, e.clientY, svgRect, canvasSize.width, canvasSize.height);
              setIsMarqueeSelecting(true);
              setMarqueeStart({ x, y });
              setMarqueeEnd({ x, y });
              e.stopPropagation();
            }
          }}
        >
          {/* Grid */}
          {renderGrid()}

          {/* Objects */}
          {objects.filter((o) => o.visible).map(renderObject)}

          {/* Drawing arrow preview */}
          {isDrawingArrow && arrowStart && arrowEnd && (() => {
            const distance = calculateDistance(arrowStart.x, arrowStart.y, arrowEnd.x, arrowEnd.y);

            if (distance > 5) {
              const angle = calculateArrowAngle(arrowStart.x, arrowStart.y, arrowEnd.x, arrowEnd.y);
              const headLength = 15;
              const points = calculateArrowHeadPoints(arrowEnd.x, arrowEnd.y, angle, headLength, 'forward');
              const arrowPoint1X = points.point1X;
              const arrowPoint1Y = points.point1Y;
              const arrowPoint2X = points.point2X;
              const arrowPoint2Y = points.point2Y;

              return (
                <g opacity={0.5}>
                  <line
                    x1={arrowStart.x}
                    y1={arrowStart.y}
                    x2={arrowEnd.x}
                    y2={arrowEnd.y}
                    stroke="#374151"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                  />
                  <polygon
                    points={`${arrowEnd.x},${arrowEnd.y} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
                    fill="#374151"
                  />
                </g>
              );
            }
            return null;
          })()}

          {/* Drawing line preview */}
          {isDrawingLine && lineStart && lineEnd && (() => {
            const distance = calculateDistance(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);

            if (distance > 5) {
              return (
                <line
                  x1={lineStart.x}
                  y1={lineStart.y}
                  x2={lineEnd.x}
                  y2={lineEnd.y}
                  stroke="#374151"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                  strokeLinecap="round"
                  opacity={0.6}
                />
              );
            }
            return null;
          })()}

          {/* Marquee selection rectangle */}
          {isMarqueeSelecting && marqueeStart && marqueeEnd && (() => {
            const x = Math.min(marqueeStart.x, marqueeEnd.x);
            const y = Math.min(marqueeStart.y, marqueeEnd.y);
            const width = Math.abs(marqueeEnd.x - marqueeStart.x);
            const height = Math.abs(marqueeEnd.y - marqueeStart.y);

            return (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="rgba(59,130,246,0.1)"
                stroke="#3b82f6"
                strokeDasharray="4,4"
                strokeWidth={1}
              />
            );
          })()}

          {/* Shape drag-to-draw preview */}
          {isDrawingShape && shapeDrawStart && shapeDrawEnd && (() => {
            const x = Math.min(shapeDrawStart.x, shapeDrawEnd.x);
            const y = Math.min(shapeDrawStart.y, shapeDrawEnd.y);
            const w = Math.abs(shapeDrawEnd.x - shapeDrawStart.x);
            const h = Math.abs(shapeDrawEnd.y - shapeDrawStart.y);
            return (
              <rect
                x={x} y={y} width={w} height={h}
                fill="rgba(79,70,229,0.08)"
                stroke="#4F46E5"
                strokeWidth={1.5}
                strokeDasharray="6,3"
                style={{ pointerEvents: 'none' }}
              />
            );
          })()}

          {/* Segment tool: preview line from point A to cursor */}
          {mode === 'geosegment' && segmentStep === 1 && segmentPointAId && segmentPreview && (() => {
            const ptA = objects.find(o => o.id === segmentPointAId);
            if (!ptA) return null;
            const ax = ptA.x + ptA.width / 2;
            const ay = ptA.y + ptA.height / 2;
            return (
              <line
                x1={ax} y1={ay}
                x2={segmentPreview.x} y2={segmentPreview.y}
                stroke="#374151"
                strokeWidth={2}
                strokeDasharray="6,4"
                strokeLinecap="round"
                opacity={0.5}
              />
            );
          })()}

          {/* Angle tool: preview lines to cursor */}
          {mode === 'geoangle' && anglePreview && (() => {
            if (angleStep === 1 && anglePointAId) {
              const ptA = objects.find(o => o.id === anglePointAId);
              if (!ptA) return null;
              const ax = ptA.x + ptA.width / 2;
              const ay = ptA.y + ptA.height / 2;
              return (
                <line
                  x1={ax} y1={ay}
                  x2={anglePreview.x} y2={anglePreview.y}
                  stroke="#7C3AED" strokeWidth={2} strokeDasharray="6,4"
                  strokeLinecap="round" opacity={0.5}
                />
              );
            }
            if (angleStep === 2 && anglePointAId && anglePointBId) {
              const ptA = objects.find(o => o.id === anglePointAId);
              const ptB = objects.find(o => o.id === anglePointBId);
              if (!ptA || !ptB) return null;
              const ax = ptA.x + ptA.width / 2; const ay = ptA.y + ptA.height / 2;
              const bx = ptB.x + ptB.width / 2; const by = ptB.y + ptB.height / 2;
              return (
                <g opacity={0.5}>
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#7C3AED" strokeWidth={2} strokeDasharray="6,4" strokeLinecap="round" />
                  <line x1={bx} y1={by} x2={anglePreview.x} y2={anglePreview.y} stroke="#7C3AED" strokeWidth={2} strokeDasharray="6,4" strokeLinecap="round" />
                </g>
              );
            }
            return null;
          })()}

          {/* Snap indicator: highlight nearest point or cursor position */}
          {snapTarget && (mode === 'geosegment' || mode === 'geoangle' || mode === 'geopoint') && (
            <circle
              cx={snapTarget.x}
              cy={snapTarget.y}
              r={snapTarget.snapped ? 9 : 5}
              fill="none"
              stroke={snapTarget.snapped ? '#10B981' : '#7C3AED'}
              strokeWidth={snapTarget.snapped ? 2.5 : 1.5}
              strokeDasharray={snapTarget.snapped ? undefined : '3,3'}
              opacity={0.8}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Freehand preview path while drawing */}
          {isDrawingFreehand && freehandPoints.length >= 2 && (
            <path
              d={buildSmoothPath(freehandPoints)}
              stroke={penSettings.color}
              strokeWidth={penSettings.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
              style={{ pointerEvents: 'none' }}
            />
          )}

        </svg>
      </div>

      {/* Segment tool hint overlay */}
      {mode === 'geosegment' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none select-none">
          {segmentStep === 0 ? 'Выберите первую точку' : 'Выберите вторую точку'}
        </div>
      )}

      {/* Angle tool hint overlay */}
      {mode === 'geoangle' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-800 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none select-none">
          {angleStep === 0 ? 'Выберите первую точку (A)' : angleStep === 1 ? 'Выберите вершину угла (B)' : 'Выберите третью точку (C)'}
        </div>
      )}
      {/* Smart Shape Toolbar — floating panel above selected shape */}
      <SmartShapeToolbar />

    </div>
  );
};


export default Canvas;
