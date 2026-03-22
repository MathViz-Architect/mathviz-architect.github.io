import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPalette } from './ColorPalette';
import { StrokeWidthSlider } from './StrokeWidthSlider';

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
      <ColorPalette
        label="Цвет"
        value={data.color || '#374151'}
        onChange={(value) => handleUpdateData('color', value)}
        allowTransparent={false}
        disabled={object.locked === true}
      />
      <StrokeWidthSlider
        label="Толщина"
        value={data.strokeWidth || 2}
        onChange={(value) => handleUpdateData('strokeWidth', value)}
        disabled={object.locked === true}
      />
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
