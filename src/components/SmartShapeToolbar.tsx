import React, { useMemo } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import { AnyCanvasObject } from '@/lib/types';

// Math helpers
function rectStats(w: number, h: number) { return { perimeter: 2 * (w + h), area: w * h }; }
function circleStats(r: number) { return { perimeter: 2 * Math.PI * r, area: Math.PI * r * r }; }
function triangleArea(a: number, b: number, c: number) { const s = (a + b + c) / 2; const area2 = s * (s - a) * (s - b) * (s - c); return area2 > 0 ? Math.sqrt(area2) : 0; }
function isValidTriangle(a: number, b: number, c: number) { return a + b > c && a + c > b && b + c > a; }
function triangleType(a: number, b: number, c: number): string {
  const sides = [a, b, c].sort((x, y) => x - y);
  const [s1, s2, s3] = sides;
  if (Math.abs(s1 - s2) < 0.5 && Math.abs(s2 - s3) < 0.5) return 'Равносторонний';
  if (Math.abs(s3 * s3 - (s1 * s1 + s2 * s2)) < 1) return 'Прямоугольный';
  if (Math.abs(a - b) < 0.5 || Math.abs(b - c) < 0.5 || Math.abs(a - c) < 0.5) return 'Равнобедренный';
  return 'Разносторонний';
}

interface SmartShapeToolbarProps {
  disabled?: boolean;
}

export const SmartShapeToolbar: React.FC<SmartShapeToolbarProps> = ({ disabled = false }) => {
  const { selectedObjects, updateObject, zoom } = useEditorContext();
  const obj = selectedObjects[0] as AnyCanvasObject | undefined;

  const stats = useMemo(() => {
    if (!obj) return null;
    if (obj.type === 'rectangle') { const s = rectStats(obj.width, obj.height); return { kind: 'rectangle' as const, rows: [{ label: 'Ш', value: Math.round(obj.width), key: 'width' as const }, { label: 'В', value: Math.round(obj.height), key: 'height' as const }], info: [{ label: 'P', value: `${Math.round(s.perimeter)} px` }, { label: 'S', value: `${Math.round(s.area)} px²` }]}; }
    if (obj.type === 'circle') { const r = obj.width / 2; const s = circleStats(r); return { kind: 'circle' as const, rows: [{ label: 'R', value: Math.round(r), key: 'width' as const, factor: 2 }], info: [{ label: 'C', value: `${(s.perimeter).toFixed(1)} px` }, { label: 'S', value: `${Math.round(s.area)} px²` }]}; }
    if (obj.type === 'geoshape') {
      const d = obj.data as Record<string, unknown>;
      if (d.shapeKind === 'circle') { const r = (d.radius as number) ?? 80; const s = circleStats(r); return { kind: 'geo-circle' as const, rows: [{ label: 'R', value: Math.round(r), key: 'radius' as 'radius' }], info: [{ label: 'C', value: `${(s.perimeter).toFixed(1)} px` }, { label: 'S', value: `${Math.round(s.area)} px²` }]}; }
      if (d.shapeKind === 'triangle') {
        const a = (d.sideA as number) ?? 100, b = (d.sideB as number) ?? 100, c = (d.sideC as number) ?? 100;
        const valid = isValidTriangle(a, b, c); const area = valid ? triangleArea(a, b, c) : 0;
        return { kind: 'geo-triangle' as const, rows: [{ label: 'a', value: Math.round(a), key: 'sideA' as 'sideA' }, { label: 'b', value: Math.round(b), key: 'sideB' as 'sideB' }, { label: 'c', value: Math.round(c), key: 'sideC' as 'sideC' }], info: [{ label: 'Тип', value: valid ? triangleType(a, b, c) : '—' }, { label: 'P', value: valid ? `${a + b + c} px` : '—' }, { label: 'S', value: valid ? `${Math.round(area)} px²` : '—' }], warning: !valid ? 'Неравенство треугольника нарушено' : undefined };
      }
      if (d.shapeKind === 'quadrilateral') {
        const ab = (d.sideAB as number) ?? 160, bc = (d.sideBC as number) ?? 120, cd = (d.sideCD as number) ?? 160, da = (d.sideDA as number) ?? 120;
        return { kind: 'geo-quad' as const, rows: [{ label: 'AB', value: Math.round(ab), key: 'sideAB' as 'sideAB' }, { label: 'BC', value: Math.round(bc), key: 'sideBC' as 'sideBC' }, { label: 'CD', value: Math.round(cd), key: 'sideCD' as 'sideCD' }, { label: 'DA', value: Math.round(da), key: 'sideDA' as 'sideDA' }], info: [{ label: 'P', value: `${ab + bc + cd + da} px` }]};
      }
    }
    return null;
  }, [obj]);

  if (!obj || !stats || disabled) return null;

  const toolbarX = (obj.x + obj.width / 2) * zoom;
  const toolbarY = obj.y * zoom - 12;

  const handleDataChange = (key: string, raw: string) => {
    const val = parseInt(raw);
    if (isNaN(val) || val < 1) return;
    if (key === 'width' || key === 'height') { const updates: Partial<AnyCanvasObject> = { [key]: val }; if (key === 'width' && obj.type === 'circle') updates.height = val; updateObject(obj.id, updates); }
    else { updateObject(obj.id, { data: { ...obj.data, [key]: val } }); }
  };

  const handleCycleTriangleType = () => {
    if (!obj || obj.type !== 'geoshape') return;
    const d = obj.data as Record<string, unknown>, a = (d.sideA as number) ?? 100, b = (d.sideB as number) ?? 100, c = (d.sideC as number) ?? 100;
    const type = triangleType(a, b, c);
    if (type === 'Равносторонний' || type === 'Разносторонний') { updateObject(obj.id, { data: { ...obj.data, sideA: 100, sideB: 100, sideC: 80 } }); }
    else if (type === 'Равнобедренный') { updateObject(obj.id, { data: { ...obj.data, sideA: 60, sideB: 80, sideC: 100 } }); }
    else { updateObject(obj.id, { data: { ...obj.data, sideA: 100, sideB: 100, sideC: 100 } }); }
  };

  return (
    <div className="absolute z-40 pointer-events-auto" style={{ left: toolbarX, top: toolbarY, transform: 'translate(-50%, -100%)' }}>
      <div className="bg-gray-900 text-white rounded-xl shadow-xl px-3 py-2 flex items-center gap-3 text-xs whitespace-nowrap">
        <div className="flex items-center gap-2">
          {stats.rows.map((row) => (
            <label key={row.key} className="flex items-center gap-1">
              <span className="text-gray-400">{row.label}:</span>
              <input type="number" defaultValue={row.value} key={`${obj.id}-${row.key}-${row.value}`} onBlur={(e) => handleDataChange(row.key, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleDataChange(row.key, (e.target as HTMLInputElement).value); }} className="w-14 bg-gray-800 text-white rounded px-1.5 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-400" min={1} />
            </label>
          ))}
        </div>
        <div className="w-px h-4 bg-gray-600" />
        <div className="flex items-center gap-2 text-gray-300">
          {stats.info.map((item) => (<span key={item.label}><span className="text-gray-500">{item.label}:</span> {item.value}</span>))}
        </div>
        {'warning' in stats && stats.warning && (<><div className="w-px h-4 bg-gray-600" /><span className="text-amber-400">⚠ {stats.warning}</span></>)}
        {stats.kind === 'geo-triangle' && !('warning' in stats && stats.warning) && (<><div className="w-px h-4 bg-gray-600" /><button onClick={handleCycleTriangleType} className="px-2 py-0.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white text-xs transition-colors">↻ тип</button></>)}
      </div>
      <div className="flex justify-center"><div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" /></div>
    </div>
  );
};

export default SmartShapeToolbar;
