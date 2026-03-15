/**
 * ObjectRenderer.tsx
 * Renders a single CanvasObject as SVG.
 * Extracted from Canvas.tsx to keep Canvas focused on event handling / state.
 *
 * Props that come from Canvas scope:
 *   - obj              – the object to render
 *   - isSelected       – highlight selection ring
 *   - dragDelta        – visual-only offset while dragging (applied without writing to context)
 *   - objects          – full list (needed for geosegment / geoangle lookups)
 *   - selectedObjectIds
 *   - editingTextId    – id of the text object currently being edited
 *   - editingText      – current textarea value
 *   - editingTextSize  – measured size of the textarea
 *   - canvasWidth      – canvas pixel width (for maxWidth clamp)
 *   - textareaRef
 *   - onMouseDown      – (e, objectId) => void
 *   - onTextDoubleClick– (e, objectId) => void
 *   - onEditingTextChange – (value: string) => void
 *   - onTextEditComplete  – () => void
 *   - onTextEditCancel    – () => void
 *   - onAutoResize        – () => void
 *   - zoom               – current zoom level (for resize handles)
 *   - onImageResizeStart  – (handle: ResizeHandle, e: MouseEvent) => void
 */

import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import {
  calculateArrowAngle,
  calculateArrowHeadPoints,
} from '@/math-core';
import { ImageResizeHandles } from './ImageResizeHandles';
import { ResizeHandle } from '@/lib/canvas/resizeImage';

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x} ${pts[i].y} ${mx} ${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

const SEL = { stroke: '#F59E0B', strokeWidth: 2, strokeDasharray: '5,5', fill: 'none' };

// ─── prop types ───────────────────────────────────────────────────────────────

interface ObjectRendererProps {
  obj: AnyCanvasObject;
  isSelected: boolean;
  /** visual-only drag offset, applied only during active drag */
  dragDelta: { dx: number; dy: number } | null;
  objects: AnyCanvasObject[];
  editingTextId: string | null;
  editingText: string;
  editingTextSize: { width: number; height: number } | null;
  canvasWidth: number;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onMouseDown: (e: React.MouseEvent, objectId: string) => void;
  onTextDoubleClick: (e: React.MouseEvent, objectId: string) => void;
  onEditingTextChange: (value: string) => void;
  onTextEditComplete: () => void;
  onTextEditCancel: () => void;
  onAutoResize: () => void;
  zoom: number;
  onImageResizeStart?: (handle: ResizeHandle, e: React.MouseEvent) => void;
}

// ─── component ────────────────────────────────────────────────────────────────

const ObjectRendererComponent: React.FC<ObjectRendererProps> = ({
  obj,
  isSelected,
  dragDelta,
  objects,
  editingTextId,
  editingText,
  editingTextSize,
  canvasWidth,
  textareaRef,
  onMouseDown,
  onTextDoubleClick,
  onEditingTextChange,
  onTextEditComplete,
  onTextEditCancel,
  onAutoResize,
  zoom,
  onImageResizeStart,
}) => {
  const opacity = obj.visible ? obj.opacity : 0.3;
  const cursor = obj.locked ? 'not-allowed' : 'move';
  const md = (e: React.MouseEvent) => onMouseDown(e, obj.id);

  // Apply visual drag offset without mutating context
  const dx = (isSelected && dragDelta) ? dragDelta.dx : 0;
  const dy = (isSelected && dragDelta) ? dragDelta.dy : 0;

  switch (obj.type) {
    // ── rectangle ────────────────────────────────────────────────────────────
    case 'rectangle': {
      const d = obj.data as { fill: string; stroke: string; strokeWidth: number; cornerRadius: number };
      const x = obj.x + dx; const y = obj.y + dy;
      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          <rect
            x={x} y={y} width={obj.width} height={obj.height}
            rx={d?.cornerRadius || 0} ry={d?.cornerRadius || 0}
            fill={d?.fill || '#4F46E5'} stroke={d?.stroke || '#312E81'}
            strokeWidth={d?.strokeWidth || 2} opacity={opacity}
            transform={`rotate(${obj.rotation} ${x + obj.width / 2} ${y + obj.height / 2})`}
          />
          {isSelected && <rect x={x - 2} y={y - 2} width={obj.width + 4} height={obj.height + 4} {...SEL} />}
        </g>
      );
    }

    // ── circle ───────────────────────────────────────────────────────────────
    case 'circle': {
      const d = obj.data as { fill: string; stroke: string; strokeWidth: number };
      const cx = obj.x + obj.width / 2 + dx;
      const cy = obj.y + obj.height / 2 + dy;
      const rx = obj.width / 2; const ry = obj.height / 2;
      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
            fill={d?.fill || '#10B981'} stroke={d?.stroke || '#047857'}
            strokeWidth={d?.strokeWidth || 2} opacity={opacity} />
          {isSelected && <ellipse cx={cx} cy={cy} rx={rx + 4} ry={ry + 4} {...SEL} />}
        </g>
      );
    }

    // ── triangle ─────────────────────────────────────────────────────────────
    case 'triangle': {
      const d = obj.data as { fill: string; stroke: string; strokeWidth: number };
      const x = obj.x + dx; const y = obj.y + dy;
      const cx = x + obj.width / 2; const cy = y + obj.height / 2;
      const pts = `${x + obj.width / 2},${y} ${x + obj.width},${y + obj.height} ${x},${y + obj.height}`;
      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          <polygon points={pts}
            fill={d?.fill || '#F59E0B'} stroke={d?.stroke || '#D97706'}
            strokeWidth={d?.strokeWidth || 2} opacity={opacity}
            transform={`rotate(${obj.rotation} ${cx} ${cy})`} />
          {isSelected && <rect x={x - 2} y={y - 2} width={obj.width + 4} height={obj.height + 4} {...SEL} />}
        </g>
      );
    }

    // ── polygon ──────────────────────────────────────────────────────────────
    case 'polygon': {
      const d = obj.data as { points: { x: number; y: number }[]; fill: string; stroke: string; strokeWidth: number };
      const x = obj.x + dx; const y = obj.y + dy;
      const pts = d.points.map(p => `${x + p.x * obj.width},${y + p.y * obj.height}`).join(' ');
      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          <polygon points={pts}
            fill={d?.fill || '#F59E0B'} stroke={d?.stroke || '#D97706'}
            strokeWidth={d?.strokeWidth || 2} opacity={opacity} />
          {isSelected && <rect x={x - 2} y={y - 2} width={obj.width + 4} height={obj.height + 4} {...SEL} />}
        </g>
      );
    }

    // ── geoshape ─────────────────────────────────────────────────────────────
    case 'geoshape': {
      const d = obj.data as {
        shapeKind: 'circle' | 'triangle' | 'quadrilateral';
        radius?: number;
        sideA?: number; sideB?: number; sideC?: number;
        sideAB?: number; sideBC?: number; sideCD?: number; sideDA?: number;
        stroke: string; strokeWidth: number;
      };
      const ox = obj.x + dx; const oy = obj.y + dy;
      const cx = ox + obj.width / 2; const cy = oy + obj.height / 2;

      const getTrianglePoints = (a: number, b: number, c: number): string | null => {
        const cosA = (b * b + c * c - a * a) / (2 * b * c);
        if (cosA < -1 || cosA > 1) return null;
        const sinA = Math.sqrt(1 - cosA * cosA);
        const scale = Math.min(obj.width / c, obj.height / (b * sinA)) * 0.9;
        const baseY = oy + obj.height * 0.9;
        const baseX = ox + (obj.width - c * scale) / 2;
        return `${baseX},${baseY} ${baseX + c * scale},${baseY} ${baseX + b * cosA * scale},${baseY - b * sinA * scale}`;
      };

      const getQuadPoints = (ab: number, bc: number, cd: number, da: number): string => {
        const maxW = Math.max(ab, cd); const maxH = Math.max(bc, da);
        const qx = ox + (obj.width - maxW) / 2; const qy = oy + (obj.height - maxH) / 2;
        const qbx = qx + ab; const qby = qy;
        const qdx = qx; const qdy = qy + da;
        const qcx = (qbx + (qdx + cd)) / 2; const qcy = (qby + bc + qdy) / 2;
        return `${qx},${qy} ${qbx},${qby} ${qcx},${qcy} ${qdx},${qdy}`;
      };

      let shapeEl: React.ReactNode = null;
      let isInvalid = false;

      if (d.shapeKind === 'circle') {
        const r = Math.min(obj.width, obj.height) / 2 - 2;
        shapeEl = <circle cx={cx} cy={cy} r={r} fill="none" stroke={d.stroke || '#374151'} strokeWidth={d.strokeWidth || 2} opacity={opacity} />;
      } else if (d.shapeKind === 'triangle') {
        const [a, b, c] = [d.sideA ?? 100, d.sideB ?? 100, d.sideC ?? 100];
        if (a + b <= c || a + c <= b || b + c <= a) {
          isInvalid = true;
        } else {
          const pts = getTrianglePoints(a, b, c);
          if (!pts) isInvalid = true;
          else shapeEl = <polygon points={pts} fill="none" stroke={d.stroke || '#374151'} strokeWidth={d.strokeWidth || 2} opacity={opacity} />;
        }
      } else if (d.shapeKind === 'quadrilateral') {
        const pts = getQuadPoints(d.sideAB ?? 160, d.sideBC ?? 120, d.sideCD ?? 160, d.sideDA ?? 120);
        shapeEl = <polygon points={pts} fill="none" stroke={d.stroke || '#374151'} strokeWidth={d.strokeWidth || 2} opacity={opacity} />;
      }

      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          {isInvalid
            ? <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#EF4444">Неверные стороны</text>
            : shapeEl}
          {isSelected && <rect x={ox - 2} y={oy - 2} width={obj.width + 4} height={obj.height + 4} {...SEL} />}
        </g>
      );
    }

    // ── fraction ─────────────────────────────────────────────────────────────
    case 'fraction': {
      const d = obj.data as { numerator: number; denominator: number; fill: string; stroke: string; strokeWidth: number; showLabels: boolean };
      const numerator = d?.numerator || 1;
      const denominator = d?.denominator || 1;
      const wholeCircles = Math.floor(numerator / denominator);
      const remainder = numerator % denominator;
      const radius = Math.min(obj.width, obj.height) / 2 - 4;
      const ox = obj.x + dx; const oy = obj.y + dy;
      const maxCirclesPerRow = Math.max(1, Math.floor((obj.width - 20) / (radius * 2.5)));

      const describeArc = (cxA: number, cyA: number, start: number, end: number) => {
        const sx = cxA + radius * Math.cos(start); const sy = cyA + radius * Math.sin(start);
        const ex = cxA + radius * Math.cos(end);   const ey = cyA + radius * Math.sin(end);
        const large = end - start > Math.PI ? 1 : 0;
        return large
          ? `M ${cxA} ${cyA} L ${sx} ${sy} A ${radius} ${radius} 0 1 1 ${ex} ${ey} Z`
          : `M ${cxA} ${cyA} L ${sx} ${sy} A ${radius} ${radius} 0 0 1 ${ex} ${ey} Z`;
      };

      const circles: React.ReactNode[] = [];
      for (let i = 0; i < wholeCircles; i++) {
        const row = Math.floor(i / maxCirclesPerRow); const col = i % maxCirclesPerRow;
        const cxI = ox + radius + col * radius * 2.5; const cyI = oy + radius + row * radius * 2.5;
        circles.push(<circle key={`w-${i}`} cx={cxI} cy={cyI} r={radius} fill={d?.fill || '#4F46E5'} stroke={d?.stroke || '#312E81'} strokeWidth={d?.strokeWidth || 2} opacity={opacity} />);
      }
      if (remainder > 0) {
        const i = wholeCircles;
        const row = Math.floor(i / maxCirclesPerRow); const col = i % maxCirclesPerRow;
        const cxI = ox + radius + col * radius * 2.5; const cyI = oy + radius + row * radius * 2.5;
        const start = -Math.PI / 2; const end = start + (Math.PI * 2 * remainder / denominator);
        circles.push(
          <g key={`r-${i}`}>
            <circle cx={cxI} cy={cyI} r={radius} fill="#F3F4F6" stroke={d?.stroke || '#312E81'} strokeWidth={d?.strokeWidth || 2} opacity={opacity} />
            <path d={describeArc(cxI, cyI, start, end)} fill={d?.fill || '#4F46E5'} opacity={opacity} />
          </g>
        );
      }

      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          {circles}
          {isSelected && circles.map((_, i) => {
            const row = Math.floor(i / maxCirclesPerRow); const col = i % maxCirclesPerRow;
            return <circle key={`s-${i}`} cx={ox + radius + col * radius * 2.5} cy={oy + radius + row * radius * 2.5} r={radius + 4} fill="none" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5,5" />;
          })}
        </g>
      );
    }

    // ── text ─────────────────────────────────────────────────────────────────
    case 'text': {
      const d = obj.data as { text: string; fontSize: number; fontFamily: string; fontWeight: string; fill: string; textAlign: string };
      const isEditing = editingTextId === obj.id;
      const ox = obj.x + dx; const oy = obj.y + dy;
      const maxWidth = canvasWidth - ox - 8;
      const foWidth = isEditing ? (editingTextSize?.width ?? Math.min(obj.width, maxWidth)) : obj.width;
      const foHeight = isEditing ? (editingTextSize?.height ?? obj.height) : obj.height;

      return (
        <g key={obj.id}
          onMouseDown={(e) => !isEditing && onMouseDown(e, obj.id)}
          onDoubleClick={(e) => onTextDoubleClick(e, obj.id)}
          style={{ cursor: obj.locked ? 'not-allowed' : isEditing ? 'text' : 'move' }}
        >
          <foreignObject x={ox} y={oy} width={Math.max(foWidth, 40)} height={Math.max(foHeight, 24)} style={{ overflow: 'visible' }}>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editingText}
                onChange={(e) => { onEditingTextChange(e.target.value); onAutoResize(); }}
                onBlur={onTextEditComplete}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onTextEditComplete(); }
                  else if (e.key === 'Escape') onTextEditCancel();
                }}
                style={{
                  display: 'block', width: `${Math.min(Math.max(foWidth, 80), maxWidth)}px`,
                  minWidth: '80px', maxWidth: `${maxWidth}px`, height: 'auto', minHeight: '32px',
                  fontSize: `${d?.fontSize || 16}px`, fontFamily: d?.fontFamily || 'sans-serif',
                  fontWeight: d?.fontWeight || 'normal', color: d?.fill || '#1F2937',
                  textAlign: (d?.textAlign as 'left' | 'center' | 'right') || 'left',
                  background: 'rgba(255,255,255,0.9)', border: '2px solid #F59E0B', borderRadius: '4px',
                  padding: '4px', resize: 'none', outline: 'none', overflow: 'hidden',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxSizing: 'border-box',
                }}
              />
            ) : (
              <div style={{
                fontSize: `${d?.fontSize || 16}px`, fontFamily: d?.fontFamily || 'sans-serif',
                fontWeight: d?.fontWeight || 'normal', color: d?.fill || '#1F2937',
                textAlign: (d?.textAlign as 'left' | 'center' | 'right') || 'left',
                opacity, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                width: '100%', padding: '4px', boxSizing: 'border-box',
                userSelect: 'none', pointerEvents: 'none',
              }}>
                {d?.text || 'Текст'}
              </div>
            )}
          </foreignObject>
          {isSelected && !isEditing && <rect x={ox - 2} y={oy - 2} width={foWidth + 4} height={foHeight + 4} {...SEL} />}
        </g>
      );
    }

    // ── arrow ────────────────────────────────────────────────────────────────
    case 'arrow': {
      const d = obj.data as { stroke: string; strokeWidth: number; arrowHead: string };
      const x1 = obj.x + dx; const y1 = obj.y + dy;
      const x2 = x1 + obj.width;  const y2 = y1 + obj.height;
      const cx = x1 + obj.width / 2; const cy = y1 + obj.height / 2;
      const hl = 15;
      const angle = calculateArrowAngle(x1, y1, x2, y2);
      const ep = calculateArrowHeadPoints(x2, y2, angle, hl, 'forward');
      const sp = calculateArrowHeadPoints(x1, y1, angle, hl, 'backward');
      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }} transform={`rotate(${obj.rotation} ${cx} ${cy})`}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={d?.stroke || '#374151'} strokeWidth={d?.strokeWidth || 2} opacity={opacity} />
          {(d?.arrowHead === 'end' || d?.arrowHead === 'both') && <polygon points={`${x2},${y2} ${ep.point1X},${ep.point1Y} ${ep.point2X},${ep.point2Y}`} fill={d?.stroke || '#374151'} opacity={opacity} />}
          {d?.arrowHead === 'both' && <polygon points={`${x1},${y1} ${sp.point1X},${sp.point1Y} ${sp.point2X},${sp.point2Y}`} fill={d?.stroke || '#374151'} opacity={opacity} />}
          {isSelected && <rect x={Math.min(x1, x2) - 2} y={Math.min(y1, y2) - 2} width={Math.abs(obj.width) + 4} height={Math.abs(obj.height) + 4} {...SEL} />}
        </g>
      );
    }

    // ── line ─────────────────────────────────────────────────────────────────
    case 'line': {
      const d = obj.data as { x1: number; y1: number; x2: number; y2: number; color: string; strokeWidth: number; arrowStart?: boolean; arrowEnd?: boolean };
      const lx1 = d.x1 + dx; const ly1 = d.y1 + dy;
      const lx2 = d.x2 + dx; const ly2 = d.y2 + dy;
      const hl = 15;
      const angle = calculateArrowAngle(lx1, ly1, lx2, ly2);
      const ep = calculateArrowHeadPoints(lx2, ly2, angle, hl, 'forward');
      const sp = calculateArrowHeadPoints(lx1, ly1, angle, hl, 'backward');
      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={d.color || '#374151'} strokeWidth={d.strokeWidth || 2} strokeLinecap="round" opacity={opacity} />
          {d.arrowEnd && <polygon points={`${lx2},${ly2} ${ep.point1X},${ep.point1Y} ${ep.point2X},${ep.point2Y}`} fill={d.color || '#374151'} opacity={opacity} />}
          {d.arrowStart && <polygon points={`${lx1},${ly1} ${sp.point1X},${sp.point1Y} ${sp.point2X},${sp.point2Y}`} fill={d.color || '#374151'} opacity={opacity} />}
          {isSelected && <rect x={Math.min(lx1, lx2) - 2} y={Math.min(ly1, ly2) - 2} width={Math.abs(d.x2 - d.x1) + 4} height={Math.abs(d.y2 - d.y1) + 4} {...SEL} />}
        </g>
      );
    }

    // ── chart ────────────────────────────────────────────────────────────────
    case 'chart': {
      const d = obj.data as { chartType: 'bar' | 'pie' | 'line'; data: Array<{ label: string; value: number; color: string }>; title: string };
      const ox = obj.x + dx; const oy = obj.y + dy;

      if (d?.chartType === 'bar') {
        const items = d.data || [];
        const titleH = 20; const botM = 25; const leftM = 35; const topM = 10;
        const cw = obj.width - leftM - 10; const ch = obj.height - titleH - botM - topM;
        const bw = cw / (items.length * 2); const bs = bw;
        const maxV = Math.max(...items.map(i => i.value), 100);
        return (
          <g key={obj.id} onMouseDown={md} style={{ cursor }}>
            <rect x={ox} y={oy} width={obj.width} height={obj.height} fill="white" stroke="#E5E7EB" strokeWidth={1} opacity={opacity} />
            <text x={ox + obj.width / 2} y={oy + 15} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#374151">{d?.title || 'Диаграмма'}</text>
            {[0, 25, 50, 75, 100].map(m => {
              const yp = oy + titleH + topM + ch - (m / 100) * ch;
              return <g key={m}><line x1={ox + leftM} y1={yp} x2={ox + obj.width - 10} y2={yp} stroke="#E5E7EB" strokeWidth={1} opacity={0.5} /><text x={ox + leftM - 5} y={yp + 3} textAnchor="end" fontSize={8} fill="#6B7280">{m}</text></g>;
            })}
            <line x1={ox + leftM} y1={oy + titleH + topM} x2={ox + leftM} y2={oy + titleH + topM + ch} stroke="#9CA3AF" strokeWidth={1} />
            {items.map((item, i) => {
              const bh = (item.value / maxV) * ch;
              const bx = ox + leftM + bs + i * (bw + bs); const by = oy + titleH + topM + ch - bh;
              return <g key={i}><rect x={bx} y={by} width={bw} height={bh} fill={item.color} opacity={opacity} /><text x={bx + bw / 2} y={by - 3} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#374151">{item.value}</text><text x={bx + bw / 2} y={oy + obj.height - 10} textAnchor="middle" fontSize={10} fill="#6B7280">{item.label}</text></g>;
            })}
            {isSelected && <rect x={ox - 2} y={oy - 2} width={obj.width + 4} height={obj.height + 4} {...SEL} />}
          </g>
        );
      }

      if (d?.chartType === 'pie') {
        const items = d.data || [];
        const total = items.reduce((s, i) => s + i.value, 0);
        const cx = ox + obj.width / 2; const cy = oy + obj.height / 2;
        const r = Math.min(obj.width, obj.height) / 2 - 10;
        let cur = -Math.PI / 2;
        return (
          <g key={obj.id} onMouseDown={md} style={{ cursor }}>
            <circle cx={cx} cy={cy} r={r + 5} fill="white" stroke="#E5E7EB" strokeWidth={1} opacity={opacity} />
            {items.map((item, i) => {
              const sa = (item.value / total) * 2 * Math.PI; const ea = cur + sa;
              const x1 = cx + r * Math.cos(cur); const y1 = cy + r * Math.sin(cur);
              const x2 = cx + r * Math.cos(ea);  const y2 = cy + r * Math.sin(ea);
              const large = sa > Math.PI ? 1 : 0;
              const pd = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
              cur = ea;
              return <path key={i} d={pd} fill={item.color} stroke="white" strokeWidth={2} opacity={opacity} />;
            })}
            {isSelected && <rect x={ox - 2} y={oy - 2} width={obj.width + 4} height={obj.height + 4} {...SEL} />}
          </g>
        );
      }

      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          <rect x={ox} y={oy} width={obj.width} height={obj.height} fill="#E5E7EB" stroke="#9CA3AF" strokeWidth={1} opacity={opacity} />
          <text x={ox + obj.width / 2} y={oy + obj.height / 2} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#6B7280">chart</text>
          {isSelected && <rect x={ox - 2} y={oy - 2} width={obj.width + 4} height={obj.height + 4} {...SEL} />}
        </g>
      );
    }

    // ── geopoint ─────────────────────────────────────────────────────────────
    case 'geopoint': {
      const d = obj.data as { color: string; radius: number; label?: string };
      const cx = obj.x + obj.width / 2 + dx;
      const cy = obj.y + obj.height / 2 + dy;
      const r = d?.radius ?? 5;
      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          <circle cx={cx} cy={cy} r={r} fill={d?.color || '#1D4ED8'} opacity={opacity} />
          {d?.label && (
            <text x={cx + r + 4} y={cy - r} fontSize={13} fontWeight="bold" fontFamily="sans-serif"
              stroke="white" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke"
              fill={d.color || '#1D4ED8'} pointerEvents="none" style={{ userSelect: 'none' }}>
              {d.label}
            </text>
          )}
          {isSelected && <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4,4" />}
        </g>
      );
    }

    // ── geosegment ───────────────────────────────────────────────────────────
    case 'geosegment': {
      const d = obj.data as { pointAId: string; pointBId: string; color: string; strokeWidth: number };
      const ptA = objects.find(o => o.id === d.pointAId);
      const ptB = objects.find(o => o.id === d.pointBId);
      if (!ptA || !ptB) return null;

      // For segments we read point positions (geopoints handle their own dragDelta)
      const ax = ptA.x + ptA.width / 2;  const ay = ptA.y + ptA.height / 2;
      const bx = ptB.x + ptB.width / 2;  const by = ptB.y + ptB.height / 2;

      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          <line x1={ax} y1={ay} x2={bx} y2={by} stroke="transparent" strokeWidth={12} />
          <line x1={ax} y1={ay} x2={bx} y2={by} stroke={d?.color || '#374151'} strokeWidth={d?.strokeWidth || 2} opacity={opacity} strokeLinecap="round" />
          {isSelected && <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#F59E0B" strokeWidth={(d?.strokeWidth || 2) + 4} strokeLinecap="round" opacity={0.4} />}
        </g>
      );
    }

    // ── geoangle ─────────────────────────────────────────────────────────────
    case 'geoangle': {
      const d = obj.data as { pointAId: string; pointBId: string; pointCId: string; color: string; arcRadius: number; showLabel: boolean };
      const ptA = objects.find(o => o.id === d.pointAId);
      const ptB = objects.find(o => o.id === d.pointBId);
      const ptC = objects.find(o => o.id === d.pointCId);
      if (!ptA || !ptB || !ptC) return null;

      const ax = ptA.x + ptA.width / 2; const ay = ptA.y + ptA.height / 2;
      const bx = ptB.x + ptB.width / 2; const by = ptB.y + ptB.height / 2;
      const cx = ptC.x + ptC.width / 2; const cy = ptC.y + ptC.height / 2;

      const baX = ax - bx; const baY = ay - by;
      const bcX = cx - bx; const bcY = cy - by;
      const lenBA = Math.hypot(baX, baY); const lenBC = Math.hypot(bcX, bcY);
      if (lenBA < 1 || lenBC < 1) return null;

      const dot = baX * bcX + baY * bcY;
      const cosA = Math.max(-1, Math.min(1, dot / (lenBA * lenBC)));
      const angleDeg = Math.round(Math.acos(cosA) * 180 / Math.PI);

      const startAngle = Math.atan2(baY, baX);
      const endAngle = Math.atan2(bcY, bcX);
      const R = d.arcRadius ?? 25;
      const cross = baX * bcY - baY * bcX;
      const sweepFlag = cross > 0 ? 1 : 0;

      const sx = bx + R * Math.cos(startAngle); const sy = by + R * Math.sin(startAngle);
      const ex = bx + R * Math.cos(endAngle);   const ey = by + R * Math.sin(endAngle);
      const arcPath = `M ${sx} ${sy} A ${R} ${R} 0 0 ${sweepFlag} ${ex} ${ey}`;

      const midAngle = startAngle + (cross > 0 ? 1 : -1) * Math.acos(cosA) / 2;
      const labelX = bx + (R + 14) * Math.cos(midAngle);
      const labelY = by + (R + 14) * Math.sin(midAngle);

      const ptALabel = (ptA.data as { label?: string }).label || 'A';
      const ptBLabel = (ptB.data as { label?: string }).label || 'B';
      const ptCLabel = (ptC.data as { label?: string }).label || 'C';

      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }} opacity={opacity}>
          <path d={arcPath} fill="none" stroke={d.color || '#7C3AED'} strokeWidth={1.5} strokeLinecap="round" />
          <path d={`M ${bx} ${by} L ${sx} ${sy} A ${R} ${R} 0 0 ${sweepFlag} ${ex} ${ey} Z`} fill={d.color || '#7C3AED'} fillOpacity={0.1} stroke="none" />
          {d.showLabel && <text x={labelX} y={labelY} fontSize={11} fill={d.color || '#7C3AED'} fontFamily="sans-serif" textAnchor="middle" dominantBaseline="middle">{`∠${ptALabel}${ptBLabel}${ptCLabel} = ${angleDeg}°`}</text>}
          {isSelected && <circle cx={bx} cy={by} r={R + 4} fill="none" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4,4" />}
        </g>
      );
    }

    // ── freehand ─────────────────────────────────────────────────────────────
    case 'freehand': {
      const d = obj.data as { points: { x: number; y: number }[]; color: string; width: number };
      // For freehand, dragDelta is already baked into points by Canvas on mouseUp
      const path = buildSmoothPath(d.points);
      if (!path) return null;
      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          <path d={path} stroke="transparent" strokeWidth={Math.max((d.width || 2) * 3, 10)} fill="none" />
          <path d={path} stroke={d.color || '#374151'} strokeWidth={d.width || 2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
          {isSelected && <path d={path} stroke="#F59E0B" strokeWidth={(d.width || 2) + 4} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />}
        </g>
      );
    }

    // ── image ────────────────────────────────────────────────────────────────
    case 'image': {
      const d = obj.data as { url: string; alt?: string };
      const ox = obj.x + dx;
      const oy = obj.y + dy;
      const [imageError, setImageError] = React.useState(false);
      
      const handleError = () => {
        console.warn('[ObjectRenderer] Image failed to load:', d.url);
        setImageError(true);
      };
      
      if (imageError) {
        // Fallback placeholder when image fails to load (CORS, 404, etc.)
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        return (
          <g 
            key={obj.id} 
            onMouseDown={md} 
            style={{ cursor }}
            transform={obj.rotation ? `rotate(${obj.rotation} ${cx} ${cy})` : undefined}
          >
            <rect
              x={ox}
              y={oy}
              width={obj.width}
              height={obj.height}
              fill="#E5E7EB"
              stroke="#9CA3AF"
              strokeWidth={1}
              opacity={opacity}
            />
            <text
              x={ox + obj.width / 2}
              y={oy + obj.height / 2 - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fill="#6B7280"
            >
              Ошибка
            </text>
            <text
              x={ox + obj.width / 2}
              y={oy + obj.height / 2 + 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fill="#9CA3AF"
            >
              загрузки
            </text>
            {isSelected && <rect x={ox - 2} y={oy - 2} width={obj.width + 4} height={obj.height + 4} {...SEL} />}
            {isSelected && onImageResizeStart && (
              <ImageResizeHandles
                x={ox}
                y={oy}
                width={obj.width}
                height={obj.height}
                zoom={zoom}
                onResizeStart={onImageResizeStart}
              />
            )}
          </g>
        );
      }
      
      return (
        <g 
          key={obj.id} 
          onMouseDown={md} 
          style={{ cursor }}
          transform={obj.rotation ? `rotate(${obj.rotation} ${obj.x + obj.width / 2} ${obj.y + obj.height / 2})` : undefined}
        >
          <image
            href={d.url}
            x={ox}
            y={oy}
            width={obj.width}
            height={obj.height}
            preserveAspectRatio="xMidYMid meet"
            opacity={opacity}
            crossOrigin="anonymous"
            onError={handleError}
          />
          {isSelected && <rect x={ox - 2} y={oy - 2} width={obj.width + 4} height={obj.height + 4} {...SEL} />}
          {isSelected && onImageResizeStart && (
            <ImageResizeHandles
              x={ox}
              y={oy}
              width={obj.width}
              height={obj.height}
              zoom={zoom}
              onResizeStart={onImageResizeStart}
            />
          )}
        </g>
      );
    }

    // ── default ───────────────────────────────────────────────────────────────
    default: {
      const ox = obj.x + dx; const oy = obj.y + dy;
      return (
        <g key={obj.id} onMouseDown={md} style={{ cursor }}>
          <rect x={ox} y={oy} width={obj.width} height={obj.height} fill="#E5E7EB" stroke="#9CA3AF" strokeWidth={1} opacity={opacity} />
          <text x={ox + obj.width / 2} y={oy + obj.height / 2} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="#6B7280">{obj.type}</text>
          {isSelected && <rect x={ox - 2} y={oy - 2} width={obj.width + 4} height={obj.height + 4} {...SEL} />}
        </g>
      );
    }
  }
};

// Custom comparison for memo - only re-render if these change
function propsAreEqual(prev: ObjectRendererProps, next: ObjectRendererProps): boolean {
  // Core object data - compare by id first (quick check)
  if (prev.obj.id !== next.obj.id) return false;
  
  // Check if object itself changed (deep compare would be expensive, but necessary)
  if (prev.obj.x !== next.obj.x ||
      prev.obj.y !== next.obj.y ||
      prev.obj.width !== next.obj.width ||
      prev.obj.height !== next.obj.height ||
      prev.obj.rotation !== next.obj.rotation ||
      prev.obj.opacity !== next.obj.opacity ||
      prev.obj.visible !== next.obj.visible ||
      prev.obj.locked !== next.obj.locked ||
      JSON.stringify(prev.obj.data) !== JSON.stringify(next.obj.data)) {
    return false;
  }
  
  // Selection state
  if (prev.isSelected !== next.isSelected) return false;
  
  // Drag delta (only matters for selected objects)
  if (prev.isSelected && next.isSelected) {
    if ((prev.dragDelta?.dx ?? 0) !== (next.dragDelta?.dx ?? 0) ||
        (prev.dragDelta?.dy ?? 0) !== (next.dragDelta?.dy ?? 0)) {
      return false;
    }
  }
  
  // Zoom (for resize handles)
  if (prev.zoom !== next.zoom) return false;
  
  // Text editing - only re-render if this specific object is being edited
  if (prev.editingTextId !== next.editingTextId) {
    // If the editing object changed, we need to re-render both the old and new
    return false;
  }
  if (prev.editingTextId === prev.obj.id && prev.editingText !== next.editingText) return false;
  if (prev.editingTextId === prev.obj.id && 
      JSON.stringify(prev.editingTextSize) !== JSON.stringify(next.editingTextSize)) return false;
  
  // Canvas width (rarely changes)
  if (prev.canvasWidth !== next.canvasWidth) return false;
  
  // For geosegment/geoangle - only re-render if referenced points changed
  if (prev.obj.type === 'geosegment' || prev.obj.type === 'geoangle') {
    const prevData = prev.obj.data as { pointAId?: string; pointBId?: string; pointCId?: string };
    const nextData = next.obj.data as { pointAId?: string; pointBId?: string; pointCId?: string };
    const pointIds = [prevData.pointAId, prevData.pointBId, prevData.pointCId].filter(Boolean);
    if (pointIds.length > 0) {
      const prevPoints = new Map(prev.objects.filter(o => pointIds.includes(o.id)).map(o => [o.id, o]));
      const nextPoints = new Map(next.objects.filter(o => pointIds.includes(o.id)).map(o => [o.id, o]));
      for (const id of pointIds) {
        const prevPt = prevPoints.get(id);
        const nextPt = nextPoints.get(id);
        if (!prevPt || !nextPt || prevPt.x !== nextPt.x || prevPt.y !== nextPt.y) {
          return false;
        }
      }
    }
  }
  
  // Reference equality for callbacks - if they're the same functions, skip
  // This assumes stable callback references from parent (useCallback)
  
  return true;
}

export const ObjectRenderer = React.memo(ObjectRendererComponent, propsAreEqual);
