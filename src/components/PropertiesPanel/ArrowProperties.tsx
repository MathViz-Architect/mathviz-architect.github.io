import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPicker } from './ColorPicker';

interface ArrowPropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

export const ArrowProperties: React.FC<ArrowPropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as {
    stroke: string;
    strokeWidth: number;
    arrowHead: string;
  };

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({
      data: { ...object.data, [key]: value },
    });
  };

  return (
    <>
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Длина стрелки</label>
        <input
          type="range"
          value={object.width}
          onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
          className="w-full"
          min={50}
          max={500}
        />
        <span className="text-xs text-gray-400">{Math.round(object.width)}px</span>
      </div>
      <ColorPicker
        label="Цвет стрелки"
        value={data?.stroke || '#374151'}
        onChange={(value) => handleUpdateData('stroke', value)}
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
        <label className="block text-xs text-gray-500 mb-1">Наконечник</label>
        <select
          value={data?.arrowHead || 'end'}
          onChange={(e) => handleUpdateData('arrowHead', e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded"
        >
          <option value="end">Конец</option>
          <option value="both">Оба конца</option>
          <option value="none">Без наконечника</option>
        </select>
      </div>
    </>
  );
};
