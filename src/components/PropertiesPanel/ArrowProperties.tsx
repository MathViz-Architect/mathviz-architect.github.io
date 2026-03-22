import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPalette } from './ColorPalette';
import { StrokeWidthSlider } from './StrokeWidthSlider';

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

  const disabled = object.locked === true;

  return (
    <>
      <ColorPalette
        label="Цвет стрелки"
        value={data?.stroke || '#374151'}
        onChange={(value) => handleUpdateData('stroke', value)}
        allowTransparent={false}
        disabled={disabled}
      />
      <div className="mt-3">
        <StrokeWidthSlider
          label="Толщина"
          value={data?.strokeWidth || 2}
          onChange={(value) => handleUpdateData('strokeWidth', value)}
          disabled={disabled}
        />
      </div>
      <div className="mb-3 mt-3">
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
