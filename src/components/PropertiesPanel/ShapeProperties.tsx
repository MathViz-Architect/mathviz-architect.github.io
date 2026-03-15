import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPicker } from './ColorPicker';

interface ShapePropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

export const ShapeProperties: React.FC<ShapePropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as {
    fill: string;
    stroke: string;
    strokeWidth: number;
    cornerRadius?: number;
  };

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({
      data: { ...object.data, [key]: value },
    });
  };

  return (
    <>
      <ColorPicker
        label="Заливка"
        value={data?.fill || '#4F46E5'}
        onChange={(value) => handleUpdateData('fill', value)}
      />
      <ColorPicker
        label="Обводка"
        value={data?.stroke || '#312E81'}
        onChange={(value) => handleUpdateData('stroke', value)}
      />
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Толщина обводки</label>
        <input
          type="number"
          value={data?.strokeWidth || 2}
          onChange={(e) => handleUpdateData('strokeWidth', parseInt(e.target.value))}
          className="w-full px-2 py-1 text-sm border rounded"
          min={0}
          max={20}
        />
      </div>
      {object.type === 'rectangle' && (
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Скругление углов</label>
          <input
            type="number"
            value={(data as { cornerRadius?: number })?.cornerRadius || 0}
            onChange={(e) => handleUpdateData('cornerRadius', parseInt(e.target.value))}
            className="w-full px-2 py-1 text-sm border rounded"
            min={0}
            max={50}
          />
        </div>
      )}
    </>
  );
};
