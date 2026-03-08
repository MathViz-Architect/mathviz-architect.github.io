import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AnyCanvasObject, Point } from '@/lib/types';

interface CanvasProps {
  objects: AnyCanvasObject[];
  selectedObjectIds: string[];
  zoom: number;
  showGrid: boolean;
  onSelectObject: (id: string | null, multi?: boolean) => void;
  onUpdateObject: (id: string, updates: Partial<AnyCanvasObject>) => void;
  onAddObject: (obj: AnyCanvasObject) => void;
  mode: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  objects,
  selectedObjectIds,
  zoom,
  showGrid,
  onSelectObject,
  onUpdateObject,
  onAddObject,
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
    e.stopPropagation();
    const obj = objects.find((o) => o.id === objectId);
    if (obj?.locked) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setIsDragging(true);
    setDragStart({ x, y });
    setDragObjectId(objectId);
    onSelectObject(objectId, e.shiftKey);
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
    if (e.target === e.currentTarget && mode !== 'arrow') {
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

    // Object dragging
    if (isDragging && dragStart && dragObjectId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      const obj = objects.find((o) => o.id === dragObjectId);
      if (!obj) return;

      onUpdateObject(dragObjectId, {
        x: obj.x + dx,
        y: obj.y + dy,
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

      // Calculate arrow dimensions
      const width = Math.abs(x - arrowStart.x);
      const height = Math.abs(y - arrowStart.y);

      // Only create arrow if it has some length
      if (width > 10 || height > 10) {
        // Determine actual start and end points (handle any direction)
        const actualX = Math.min(arrowStart.x, x);
        const actualY = Math.min(arrowStart.y, y);
        const actualWidth = x - arrowStart.x;
        const actualHeight = y - arrowStart.y;

        const newArrow: AnyCanvasObject = {
          id: `obj_${Date.now()}`,
          type: 'arrow',
          x: arrowStart.x,
          y: arrowStart.y,
          width: actualWidth,
          height: actualHeight,
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
          } else if (isDragging && dragStart && dragObjectId) {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = (e.clientX - rect.left) / zoom;
            const y = (e.clientY - rect.top) / zoom;

            const dx = x - dragStart.x;
            const dy = y - dragStart.y;

            const obj = objects.find((o) => o.id === dragObjectId);
            if (!obj) return;

            onUpdateObject(dragObjectId, {
              x: obj.x + dx,
              y: obj.y + dy,
            });

            setDragStart({ x, y });
          }
        }}
        onMouseUp={(e) => {
          if (isDrawingArrow) {
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
          } else {
            handleMouseUp();
          }
        }}
        style={{
          cursor: mode === 'arrow' ? 'crosshair' : ['draw', 'fraction', 'chart'].includes(mode) ? 'crosshair' : 'default',
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
        >
          {/* Grid */}
          {renderGrid()}

          {/* Objects */}
          {objects.filter((o) => o.visible).map(renderObject)}

          {/* Drawing arrow preview */}
          {isDrawingArrow && arrowStart && arrowEnd && (
            <line
              x1={arrowStart.x}
              y1={arrowStart.y}
              x2={arrowEnd.x}
              y2={arrowEnd.y}
              stroke="#374151"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.5}
            />
          )}
        </svg>
      </div>
    </div>
  );
};

export default Canvas;
