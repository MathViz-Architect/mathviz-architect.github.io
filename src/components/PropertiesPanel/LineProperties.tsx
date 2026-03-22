import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPalette } from './ColorPalette';
import { StrokeWidthSlider } from './StrokeWidthSlider';

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

  const disabled = object.locked === true;

  return (
    <>
      <ColorPalette
        label="Цвет линии"
        value={data?.color || '#374151'}
        onChange={(value) => handleUpdateData('color', value)}
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
