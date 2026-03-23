import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPalette } from './ColorPalette';
import { StrokeWidthSlider } from './StrokeWidthSlider';

interface ShapePropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

// ── Units ─────────────────────────────────────────────────────────────────────
// Grid cell = 20px, 2 cells = 1 cm → 1 cm = 40px
const PX_PER_CM = 40;
function toCm(px: number): string { return (px / PX_PER_CM).toFixed(2); }
function toCm2(px2: number): string { return (px2 / (PX_PER_CM * PX_PER_CM)).toFixed(2); }

// ── Math helpers ─────────────────────────────────────────────────────────────
function triType(a: number, b: number, c: number): string {
  const [s1, s2, s3] = [a, b, c].sort((x, y) => x - y);
  if (Math.abs(s1 - s2) < 0.5 && Math.abs(s2 - s3) < 0.5) return 'Равносторонний';
  if (Math.abs(s3 * s3 - (s1 * s1 + s2 * s2)) < 1) return 'Прямоугольный';
  if (Math.abs(a - b) < 0.5 || Math.abs(b - c) < 0.5 || Math.abs(a - c) < 0.5) return 'Равнобедренный';
  return 'Разносторонний';
}

function shoelace(pts: { x: number; y: number }[], w: number, h: number) {
  const abs = pts.map(p => ({ x: p.x * w, y: p.y * h }));
  let area = 0, perim = 0;
  for (let i = 0; i < abs.length; i++) {
    const j = (i + 1) % abs.length;
    area += abs[i].x * abs[j].y - abs[j].x * abs[i].y;
    const dx = abs[j].x - abs[i].x, dy = abs[j].y - abs[i].y;
    perim += Math.sqrt(dx * dx + dy * dy);
  }
  return { area: Math.abs(area) / 2, perimeter: perim };
}

// ── UI primitives ─────────────────────────────────────────────────────────────
const Row: React.FC<{ label: string; value: string; sub?: string; warn?: boolean }> = ({ label, value, sub, warn }) => (
  <div className="flex items-baseline justify-between text-xs py-1">
    <span className="text-gray-500">{label}</span>
    <div className="text-right">
      <span className={`font-mono font-semibold ${warn ? 'text-amber-500' : 'text-gray-800'}`}>{value}</span>
      {sub && <span className="text-gray-400 ml-1">{sub}</span>}
    </div>
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-indigo-100 text-indigo-700' }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{children}</span>
);

// ── Geometry block ─────────────────────────────────────────────────────────────
const GeometryBlock: React.FC<{ object: AnyCanvasObject }> = ({ object }) => {

  // Rectangle
  if (object.type === 'rectangle') {
    const a = object.width, b = object.height;
    const P = 2 * (a + b), S = a * b;
    const isSquare = Math.abs(a - b) < 2;
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Геометрия</span>
          {isSquare && <Badge>Квадрат</Badge>}
        </div>
        <Row label="a (ширина)" value={toCm(a)} sub="см" />
        <Row label="b (высота)" value={toCm(b)} sub="см" />
        <div className="border-t border-gray-200 mt-1 pt-1 space-y-1">
          <Row label="P = 2(a + b)" value={toCm(P)} sub="см" />
          <Row label="S = a × b" value={toCm2(S)} sub="см²" />
        </div>
      </div>
    );
  }

  // Circle
  if (object.type === 'circle') {
    const r = object.width / 2;
    const C = 2 * Math.PI * r, S = Math.PI * r * r;
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Геометрия</span>
        <Row label="r (радиус)" value={toCm(r)} sub="см" />
        <Row label="d (диаметр)" value={toCm(r * 2)} sub="см" />
        <div className="border-t border-gray-200 mt-1 pt-1 space-y-1">
          <Row label="C = 2πr" value={toCm(C)} sub="см" />
          <Row label="S = πr²" value={toCm2(S)} sub="см²" />
        </div>
      </div>
    );
  }

  // Triangle (isosceles approximation from bounding box)
  if (object.type === 'triangle') {
    const base = object.width, h = object.height;
    const leg = Math.sqrt((base / 2) ** 2 + h ** 2);
    const a = base, b = leg;
    const type = triType(Math.round(a), Math.round(b), Math.round(b));
    const S = 0.5 * base * h;
    const P = a + b + b;
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Геометрия</span>
          <Badge>{type}</Badge>
        </div>
        <Row label="основание (a)" value={toCm(a)} sub="см" />
        <Row label="боковые (b)" value={toCm(b)} sub="см" />
        <Row label="высота (h)" value={toCm(h)} sub="см" />
        <div className="border-t border-gray-200 mt-1 pt-1 space-y-1">
          <Row label="P = a + 2b" value={toCm(P)} sub="см" />
          <Row label="S = ½ · a · h" value={toCm2(S)} sub="см²" />
        </div>
      </div>
    );
  }

  // Polygon (trapezoid / rhombus / parallelogram / pentagon)
  if (object.type === 'polygon') {
    const pts = (object.data as { points?: { x: number; y: number }[] }).points;
    if (!pts || pts.length < 3) return null;
    const { area, perimeter } = shoelace(pts, object.width, object.height);
    const n = pts.length;

    const shapeLabel =
      n === 4 && Math.abs(pts[0].x - 0.2) < 0.05 ? 'Трапеция' :
        n === 4 && Math.abs(pts[0].x - 0.5) < 0.05 ? 'Ромб' :
          n === 4 && Math.abs(pts[0].x - 0.25) < 0.05 ? 'Параллелограмм' :
            n === 5 ? 'Пятиугольник' : `${n}-угольник`;

    const extras: React.ReactNode[] = [];
    if (shapeLabel === 'Ромб') {
      const d1 = object.width, d2 = object.height;
      extras.push(<Row key="d" label="S = d₁ × d₂ / 2" value={toCm2(d1 * d2 / 2)} sub="см²" />);
    }
    if (shapeLabel === 'Трапеция') {
      const topRatio = 1 - 2 * pts[0].x;
      const a = object.width * topRatio;
      const b = object.width;
      const h = object.height;
      extras.push(<Row key="trap" label="S = (a+b)/2 · h" value={toCm2((a + b) / 2 * h)} sub="см²" />);
    }

    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Геометрия</span>
          <Badge>{shapeLabel}</Badge>
        </div>
        <Row label="ширина" value={toCm(object.width)} sub="см" />
        <Row label="высота" value={toCm(object.height)} sub="см" />
        <div className="border-t border-gray-200 mt-1 pt-1 space-y-1">
          <Row label="P" value={toCm(perimeter)} sub="см" />
          <Row label="S" value={toCm2(area)} sub="см²" />
          {extras}
        </div>
      </div>
    );
  }

  return null;
};

// ── Main component ────────────────────────────────────────────────────────────
export const ShapeProperties: React.FC<ShapePropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as {
    fill: string;
    stroke: string;
    strokeWidth: number;
    cornerRadius?: number;
  };

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({ data: { ...object.data, [key]: value } });
  };

  return (
    <div className="space-y-3">
      {/* Geometry block first — most useful for math lessons */}
      <GeometryBlock object={object} />

      {/* Appearance */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Оформление</span>
        <ColorPalette
          label="Заливка"
          value={data?.fill || 'transparent'}
          onChange={(value) => handleUpdateData('fill', value)}
          allowTransparent={true}
          disabled={object.locked === true}
        />
        <ColorPalette
          label="Цвет контура"
          value={data?.stroke || '#374151'}
          onChange={(value) => handleUpdateData('stroke', value)}
          allowTransparent={false}
          disabled={object.locked === true}
        />
        <StrokeWidthSlider
          label="Толщина"
          value={data?.strokeWidth ?? 2}
          onChange={(value) => handleUpdateData('strokeWidth', value)}
          disabled={object.locked === true}
        />
        {object.type === 'rectangle' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Скругление углов</label>
            <input
              type="number"
              value={(data as { cornerRadius?: number })?.cornerRadius || 0}
              onChange={(e) => handleUpdateData('cornerRadius', parseInt(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400"
              min={0} max={50}
            />
          </div>
        )}
      </div>
    </div>
  );
};
