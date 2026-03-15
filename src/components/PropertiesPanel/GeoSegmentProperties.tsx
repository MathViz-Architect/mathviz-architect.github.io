import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPicker } from './ColorPicker';

interface GeoSegmentPropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

export const GeoSegmentProperties: React.FC<GeoSegmentPropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as { pointAId: string; pointBId: string; color: string; strokeWidth: number; showPoints?: boolean };

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({
      data: { ...object.data, [key]: value },
    });
  };

  return (
    <>
      <ColorPicker
        label="Цвет"
        value={data.color || '#374151'}
        onChange={(value) => handleUpdateData('color', value)}
      />
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Толщина</label>
        <input
          type="number"
          value={data.strokeWidth || 2}
          onChange={(e) => handleUpdateData('strokeWidth', parseInt(e.target.value) || 1)}
          className="w-full px-2 py-1 text-sm border rounded"
          min={1} max={20}
        />
      </div>
      <div className="mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.showPoints !== false}
            onChange={(e) => handleUpdateData('showPoints', e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Показывать точки</span>
        </label>
      </div>
    </>
  );
};
