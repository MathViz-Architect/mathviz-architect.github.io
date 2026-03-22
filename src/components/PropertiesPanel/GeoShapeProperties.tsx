import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPalette } from './ColorPalette';
import { StrokeWidthSlider } from './StrokeWidthSlider';

interface GeoShapePropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

export const GeoShapeProperties: React.FC<GeoShapePropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as {
    shapeKind: 'circle' | 'triangle' | 'quadrilateral';
    radius?: number;
    sideA?: number; sideB?: number; sideC?: number;
    sideAB?: number; sideBC?: number; sideCD?: number; sideDA?: number;
    stroke: string;
    strokeWidth: number;
  };

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({
      data: { ...object.data, [key]: value },
    });
  };

  const triValid = data.shapeKind !== 'triangle' || (() => {
    const a = data.sideA ?? 0, b = data.sideB ?? 0, c = data.sideC ?? 0;
    return a + b > c && a + c > b && b + c > a;
  })();

  return (
    <div className="space-y-4">
      <ColorPalette
        label="Заливка"
        value={(data as { fill?: string }).fill || 'transparent'}
        onChange={(value) => handleUpdateData('fill', value)}
        allowTransparent={true}
        disabled={object.locked === true}
      />
      <ColorPalette
        label="Цвет контура"
        value={data.stroke || '#374151'}
        onChange={(value) => handleUpdateData('stroke', value)}
        allowTransparent={false}
        disabled={object.locked === true}
      />
      <StrokeWidthSlider
        label="Толщина"
        value={data.strokeWidth || 2}
        onChange={(value) => handleUpdateData('strokeWidth', value)}
        disabled={object.locked === true}
      />

      {data.shapeKind === 'circle' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Радиус (px)</label>
          <input
            type="number"
            value={data.radius || 80}
            onChange={(e) => {
              const r = parseInt(e.target.value) || 1;
              onUpdate({
                data: { ...object.data, radius: r },
                width: r * 2,
                height: r * 2,
              });
            }}
            className="w-full px-2 py-1 text-sm border rounded"
            min={10} max={400}
          />
        </div>
      )}

      {data.shapeKind === 'triangle' && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Стороны треугольника</label>
          {!triValid && (
            <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
              ⚠ Не выполняется неравенство треугольника
            </div>
          )}
          {(['sideA', 'sideB', 'sideC'] as const).map((key, i) => (
            <div key={key} className="flex items-center gap-2">
              <label className="text-xs text-gray-500 w-4">{['a', 'b', 'c'][i]}</label>
              <input
                type="number"
                value={(data[key] ?? 100) as number}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  const a = key === 'sideA' ? val : (data.sideA ?? 100);
                  const b = key === 'sideB' ? val : (data.sideB ?? 100);
                  const c = key === 'sideC' ? val : (data.sideC ?? 100);
                  const maxSide = Math.max(a, b, c);
                  onUpdate({
                    data: { ...object.data, [key]: val },
                    width: maxSide * 1.2,
                    height: maxSide * 1.0,
                  });
                }}
                className="flex-1 px-2 py-1 text-sm border rounded"
                min={1}
              />
            </div>
          ))}
        </div>
      )}

      {data.shapeKind === 'quadrilateral' && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">Стороны</label>
          {([
            ['sideAB', 'AB'], ['sideBC', 'BC'], ['sideCD', 'CD'], ['sideDA', 'DA']
          ] as [string, string][]).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <label className="text-xs text-gray-500 w-20">{label}</label>
              <input
                type="number"
                value={(data[key as keyof typeof data] ?? 100) as number}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  handleUpdateData(key, val);
                }}
                className="flex-1 px-2 py-1 text-sm border rounded"
                min={1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
