import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AnyCanvasObject, Point } from '@/lib/types';

interface CanvasProps {
  objects: AnyCanvasObject[];
  selectedObjectIds: string[];
  zoom: number;
  showGrid: boolean;
  onSelectObject: (id: string | null, multi?: boolean) => void;
  onSelectMultiple: (ids: string[]) => void;
  onUpdateObject: (id: string, updates: Partial<AnyCanvasObject>) => void;
  onAddObject: (obj: AnyCanvasObject) => void;
  onDeleteObject?: (id: string) => void;
  mode: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  objects,
  selectedObjectIds,
  zoom,
  showGrid,
  onSelectObject,
  onSelectMultiple,
  onUpdateObject,
  onAddObject,
  onDeleteObject,
  mode,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragObjectId, setDragObjectId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<Point | null>(null);
  const [arrowEnd, setArrowEnd] = useState<Point | null>(null);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState<Point | null>(null);
  const [lineEnd, setLineEnd] = useState<Point | null>(null);
  const [isErasing, setIsErasing] = useState(false);
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<Point | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<Point | null>(null);

  // Hit detection for eraser tool
  const isPointInObject = (x: number, y: number, obj: AnyCanvasObject): boolean => {
    if (obj.type === 'line') {
      const data = obj.data as { x1: number; y1: number; x2: number; y2: number };
      // Distance from point to line segment
      const dx = data.x2 - data.x1;
      const dy = data.y2 - data.y1;
      const lengthSquared = dx * dx + dy * dy;
      if (lengthSquared === 0) return Math.sqrt((x - data.x1) ** 2 + (y - data.y1) ** 2) < 10;

      const t = Math.max(0, Math.min(1, ((x - data.x1) * dx + (y - data.y1) * dy) / lengthSquared));
      const projX = data.x1 + t * dx;
      const projY = data.y1 + t * dy;
      const distance = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
      return distance < 10;
    }

    if (obj.type === 'arrow') {
      // Distance from point to arrow line segment
      const x1 = obj.x;
      const y1 = obj.y;
      const x2 = obj.x + obj.width;
      const y2 = obj.y + obj.height;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const lengthSquared = dx * dx + dy * dy;
      if (lengthSquared === 0) return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2) < 10;

      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared));
      const projX = x1 + t * dx;
      const projY = y1 + t * dy;
      const distance = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
      return distance < 10;
    }

    // For all other objects, use bounding box
    return x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height;
  };

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
    return () => window.removeEventListener('resize', updateSize);
  }, [zoom]);

  // Handle mouse down on object
  const handleObjectMouseDown = (e: React.MouseEvent, objectId: string) => {
    // In line drawing mode, let the event propagate to the SVG for drawing
    if (mode === 'line') return;
    e.stopPropagation();
    const obj = objects.find((o) => o.id === objectId);
    if (obj?.locked) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Multi-select with Ctrl/Cmd or Shift
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;

    setIsDragging(true);
    setDragStart({ x, y });
    setDragObjectId(objectId);

    // If the object is already in the selection and no modifier key is held,
    // do NOT reset selection — preserve all selected objects for multi-drag.
    // Only reset if clicking an unselected object without modifier.
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
      onUpdateObject(editingTextId, {
        data: {
          ...objects.find((o) => o.id === editingTextId)?.data,
          text: editingText,
        },
      });
    }
    setEditingTextId(null);
    setEditingText('');
  };

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingTextId]);

  // Handle canvas click (deselect)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (mode !== 'arrow' && mode !== 'line' && mode !== 'eraser') {
      onSelectObject(null);
    }
  };

  // Handle canvas mouse down - unified for arrow drawing and object dragging
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Arrow drawing mode
    if (mode === 'arrow' && e.target === e.currentTarget) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      setIsDrawingArrow(true);
      setArrowStart({ x, y });
      setArrowEnd({ x, y });
      e.stopPropagation();
    }

    // Line drawing mode
    if (mode === 'line') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      setIsDrawingLine(true);
      setLineStart({ x, y });
      setLineEnd({ x, y });
      e.stopPropagation();
    }

    // Eraser mode
    if (mode === 'eraser') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      setIsErasing(true);
      handleEraserDelete(x, y);
      e.stopPropagation();
    }

    // Marquee selection in select mode (on empty canvas)
    // Note: no e.target check here because clicks land on <svg>, not the wrapper div
    if (mode === 'select') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      setIsMarqueeSelecting(true);
      setMarqueeStart({ x, y });
      setMarqueeEnd({ x, y });
      e.stopPropagation();
    }
  };

  // Handle canvas mouse move - unified for arrow drawing and object dragging
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Arrow drawing
    if (isDrawingArrow && arrowStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      setArrowEnd({ x, y });
      return;
    }

    // Line drawing
    if (isDrawingLine && lineStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      setLineEnd({ x, y });
      return;
    }

    // Eraser mode - delete while dragging
    if (isErasing) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      handleEraserDelete(x, y);
      return;
    }

    // Marquee selection
    if (isMarqueeSelecting && marqueeStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      setMarqueeEnd({ x, y });
      return;
    }

    // Object dragging - move all selected objects together
    if (isDragging && dragStart && dragObjectId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      // Move all selected objects
      selectedObjectIds.forEach((id) => {
        const obj = objects.find((o) => o.id === id);
        if (!obj) return;

        if (obj.type === 'line') {
          // Line stores coords in data.x1/y1/x2/y2 — update those too
          const d = obj.data as { x1: number; y1: number; x2: number; y2: number; color: string; strokeWidth: number };
          onUpdateObject(id, {
            x: obj.x + dx,
            y: obj.y + dy,
            data: { ...d, x1: d.x1 + dx, y1: d.y1 + dy, x2: d.x2 + dx, y2: d.y2 + dy },
          });
        } else {
          onUpdateObject(id, { x: obj.x + dx, y: obj.y + dy });
        }
      });

      setDragStart({ x, y });
    }
  };

  // Handle canvas mouse up - unified for arrow drawing and object dragging
  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    // Arrow drawing completion
    if (isDrawingArrow && arrowStart && arrowEnd) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      // Calculate drag distance
      const dx = x - arrowStart.x;
      const dy = y - arrowStart.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

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
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      // Calculate drag distance
      const dx = x - lineStart.x;
      const dy = y - lineStart.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

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
      // Calculate marquee bounds
      const minX = Math.min(marqueeStart.x, marqueeEnd.x);
      const maxX = Math.max(marqueeStart.x, marqueeEnd.x);
      const minY = Math.min(marqueeStart.y, marqueeEnd.y);
      const maxY = Math.max(marqueeStart.y, marqueeEnd.y);

      // Find all objects that intersect with marquee
      const selectedIds: string[] = [];
      objects.forEach((obj) => {
        if (!obj.visible || obj.locked) return;

        // Check bounding box intersection — lines use data coords
        let objMinX = obj.x;
        let objMaxX = obj.x + obj.width;
        let objMinY = obj.y;
        let objMaxY = obj.y + obj.height;
        if (obj.type === 'line') {
          const d = obj.data as { x1: number; y1: number; x2: number; y2: number };
          objMinX = Math.min(d.x1, d.x2);
          objMaxX = Math.max(d.x1, d.x2);
          objMinY = Math.min(d.y1, d.y2);
          objMaxY = Math.max(d.y1, d.y2);
        }

        // Add tolerance so zero-width/height objects (vertical/horizontal lines) are still selectable
        const tolerance = 5;
        const intersects =
          objMinX - tolerance < maxX &&
          objMaxX + tolerance > minX &&
          objMinY - tolerance < maxY &&
          objMaxY + tolerance > minY;

        if (intersects) {
          selectedIds.push(obj.id);
        }
      });

      // Select all intersecting objects in one atomic call
      if (selectedIds.length > 0) {
        onSelectMultiple(selectedIds);
      } else {
        onSelectObject(null, false);
      }

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

    // Object dragging completion
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setDragObjectId(null);
    }
  };

  // Handle double click to add object
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (!['shape', 'draw', 'fraction', 'chart', 'arrow', 'text'].includes(mode)) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

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

        return (
          <g
            key={obj.id}
            onMouseDown={(e) => !isEditing && handleObjectMouseDown(e, obj.id)}
            onDoubleClick={(e) => handleTextDoubleClick(e, obj.id)}
            style={{ cursor: obj.locked ? 'not-allowed' : isEditing ? 'text' : 'move' }}
          >
            {isEditing ? (
              <foreignObject
                x={obj.x}
                y={obj.y}
                width={obj.width}
                height={obj.height}
              >
                <textarea
                  ref={textareaRef}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={handleTextEditComplete}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTextEditComplete();
                    } else if (e.key === 'Escape') {
                      setEditingTextId(null);
                      setEditingText('');
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
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
                  }}
                />
              </foreignObject>
            ) : (
              <text
                x={obj.x + (data?.textAlign === 'center' ? obj.width / 2 : data?.textAlign === 'right' ? obj.width : 0)}
                y={obj.y + obj.height / 2 + (data?.fontSize || 16) / 3}
                fontSize={data?.fontSize || 16}
                fontFamily={data?.fontFamily || 'sans-serif'}
                fontWeight={data?.fontWeight || 'normal'}
                fill={data?.fill || '#1F2937'}
                textAnchor={data?.textAlign === 'center' ? 'middle' : data?.textAlign === 'right' ? 'end' : 'start'}
                opacity={opacity}
              >
                {data?.text || 'Текст'}
              </text>
            )}
            {isSelected && !isEditing && (
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
        const headWidth = 10;

        // Calculate arrow head angle
        const angle = Math.atan2(y2 - y1, x2 - x1);

        // Arrow head points at end
        const arrowPoint1X = x2 - headLength * Math.cos(angle - Math.PI / 6);
        const arrowPoint1Y = y2 - headLength * Math.sin(angle - Math.PI / 6);
        const arrowPoint2X = x2 - headLength * Math.cos(angle + Math.PI / 6);
        const arrowPoint2Y = y2 - headLength * Math.sin(angle + Math.PI / 6);

        // Arrow head points at start (for 'both' option)
        const arrowPoint3X = x1 + headLength * Math.cos(angle - Math.PI / 6);
        const arrowPoint3Y = y1 + headLength * Math.sin(angle - Math.PI / 6);
        const arrowPoint4X = x1 + headLength * Math.cos(angle + Math.PI / 6);
        const arrowPoint4Y = y1 + headLength * Math.sin(angle + Math.PI / 6);

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
        };

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
    <div className="flex-1 bg-gray-100 overflow-hidden">
      <div
        ref={canvasRef}
        className="w-full h-full overflow-auto"
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={(e) => {
          if (isDrawingArrow) {
            handleCanvasMouseMove(e);
          } else if (isDrawingLine) {
            handleCanvasMouseMove(e);
          } else if (isErasing) {
            handleCanvasMouseMove(e);
          } else if (isMarqueeSelecting) {
            handleCanvasMouseMove(e);
          } else if (isDragging && dragStart && dragObjectId) {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = (e.clientX - rect.left) / zoom;
            const y = (e.clientY - rect.top) / zoom;

            const dx = x - dragStart.x;
            const dy = y - dragStart.y;

            // Move ALL selected objects together (multi-drag)
            const idsToMove = selectedObjectIds.length > 1 && selectedObjectIds.includes(dragObjectId)
              ? selectedObjectIds
              : [dragObjectId];

            idsToMove.forEach(id => {
              const obj = objects.find((o) => o.id === id);
              if (!obj) return;
              if (obj.type === 'line') {
                const d = obj.data as { x1: number; y1: number; x2: number; y2: number; color: string; strokeWidth: number };
                onUpdateObject(id, {
                  x: obj.x + dx, y: obj.y + dy,
                  data: { ...d, x1: d.x1 + dx, y1: d.y1 + dy, x2: d.x2 + dx, y2: d.y2 + dy },
                });
              } else {
                onUpdateObject(id, { x: obj.x + dx, y: obj.y + dy });
              }
            });

            setDragStart({ x, y });
          }
        }}
        onMouseUp={(e) => {
          if (isDrawingArrow) {
            handleCanvasMouseUp(e);
          } else if (isDrawingLine) {
            handleCanvasMouseUp(e);
          } else if (isErasing) {
            handleCanvasMouseUp(e);
          } else if (isMarqueeSelecting) {
            handleCanvasMouseUp(e);
          } else {
            handleMouseUp();
          }
        }}
        onMouseLeave={() => {
          if (isDrawingArrow) {
            setIsDrawingArrow(false);
            setArrowStart(null);
            setArrowEnd(null);
          } else if (isDrawingLine) {
            setIsDrawingLine(false);
            setLineStart(null);
            setLineEnd(null);
          } else if (isErasing) {
            setIsErasing(false);
          } else if (isMarqueeSelecting) {
            setIsMarqueeSelecting(false);
            setMarqueeStart(null);
            setMarqueeEnd(null);
          } else {
            handleMouseUp();
          }
        }}
        style={{
          cursor: mode === 'arrow' || mode === 'line' ? 'crosshair' : mode === 'eraser' ? 'cell' : ['draw', 'fraction', 'chart'].includes(mode) ? 'crosshair' : 'default',
        }}
      >
        <svg
          width={canvasSize.width * zoom}
          height={canvasSize.height * zoom}
          viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          onMouseDown={mode === 'line' || mode === 'select' ? handleCanvasMouseDown : undefined}
        >
          {/* Grid */}
          {renderGrid()}

          {/* Objects */}
          {objects.filter((o) => o.visible).map(renderObject)}

          {/* Drawing arrow preview */}
          {isDrawingArrow && arrowStart && arrowEnd && (() => {
            const dx = arrowEnd.x - arrowStart.x;
            const dy = arrowEnd.y - arrowStart.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 5) {
              const angle = Math.atan2(dy, dx);
              const headLength = 15;
              const arrowPoint1X = arrowEnd.x - headLength * Math.cos(angle - Math.PI / 6);
              const arrowPoint1Y = arrowEnd.y - headLength * Math.sin(angle - Math.PI / 6);
              const arrowPoint2X = arrowEnd.x - headLength * Math.cos(angle + Math.PI / 6);
              const arrowPoint2Y = arrowEnd.y - headLength * Math.sin(angle + Math.PI / 6);

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
            const dx = lineEnd.x - lineStart.x;
            const dy = lineEnd.y - lineStart.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

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
        </svg>
      </div>
    </div>
  );
};

export default Canvas;
