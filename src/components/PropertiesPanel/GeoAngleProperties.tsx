import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPicker } from './ColorPicker';

interface GeoAnglePropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

export const GeoAngleProperties: React.FC<GeoAnglePropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as {
    pointAId: string; pointBId: string; pointCId: string;
    color: string; arcRadius: number; showLabel: boolean;
  };

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({
      data: { ...object.data, [key]: value },
    });
  };

  return (
    <>
      <ColorPicker
        label="Цвет"
        value={data.color || '#7C3AED'}
        onChange={(value) => handleUpdateData('color', value)}
      />
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Радиус дуги (px)</label>
        <input
          type="number"
          value={data.arcRadius || 25}
          onChange={(e) => handleUpdateData('arcRadius', parseInt(e.target.value) || 25)}
          className="w-full px-2 py-1 text-sm border rounded"
          min={10} max={80}
        />
      </div>
      <div className="mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.showLabel !== false}
            onChange={(e) => handleUpdateData('showLabel', e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Показывать значение угла</span>
        </label>
      </div>
    </>
  );
};
