import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPicker } from './ColorPicker';

interface FractionPropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

export const FractionProperties: React.FC<FractionPropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as {
    numerator: number;
    denominator: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    showLabels: boolean;
  };

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({
      data: { ...object.data, [key]: value },
    });
  };

  return (
    <>
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Числитель</label>
        <input
          type="number"
          value={data?.numerator || 1}
          onChange={(e) => handleUpdateData('numerator', parseInt(e.target.value) || 1)}
          className="w-full px-2 py-1 text-sm border rounded"
          min={0}
        />
      </div>
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Знаменатель</label>
        <input
          type="number"
          value={data?.denominator || 1}
          onChange={(e) => handleUpdateData('denominator', parseInt(e.target.value) || 1)}
          className="w-full px-2 py-1 text-sm border rounded"
          min={1}
        />
      </div>
      <ColorPicker
        label="Заливка"
        value={data?.fill || '#4F46E5'}
        onChange={(value) => handleUpdateData('fill', value)}
      />
      <div className="mb-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.showLabels ?? true}
            onChange={(e) => handleUpdateData('showLabels', e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-gray-500">Показать подписи</span>
        </label>
      </div>
    </>
  );
};
