import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPicker } from './ColorPicker';

interface LinePropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

export const LineProperties: React.FC<LinePropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    strokeWidth: number;
    arrowStart?: boolean;
    arrowEnd?: boolean;
  };

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({
      data: { ...object.data, [key]: value },
    });
  };

  return (
    <>
      <ColorPicker
        label="Цвет линии"
        value={data?.color || '#374151'}
        onChange={(value) => handleUpdateData('color', value)}
      />
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Толщина линии</label>
        <input
          type="number"
          value={data?.strokeWidth || 2}
          onChange={(e) => handleUpdateData('strokeWidth', parseInt(e.target.value))}
          className="w-full px-2 py-1 text-sm border rounded"
          min={1}
          max={20}
        />
      </div>
      <div className="mb-3">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={data?.arrowStart || false}
            onChange={(e) => handleUpdateData('arrowStart', e.target.checked)}
            className="rounded"
          />
          Стрелка в начале
        </label>
      </div>
      <div className="mb-3">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={data?.arrowEnd || false}
            onChange={(e) => handleUpdateData('arrowEnd', e.target.checked)}
            className="rounded"
          />
          Стрелка в конце
        </label>
      </div>
    </>
  );
};
