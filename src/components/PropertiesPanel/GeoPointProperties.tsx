import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPicker } from './ColorPicker';

interface GeoPointPropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

export const GeoPointProperties: React.FC<GeoPointPropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as { color: string; radius: number; label?: string };

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({
      data: { ...object.data, [key]: value },
    });
  };

  return (
    <>
      <ColorPicker
        label="Цвет"
        value={data?.color || '#1D4ED8'}
        onChange={(value) => handleUpdateData('color', value)}
      />
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Метка</label>
        <input
          type="text"
          value={data?.label ?? ''}
          onChange={(e) => handleUpdateData('label', e.target.value || null)}
          placeholder="A, B, C…"
          className="w-full px-2 py-1 text-sm border rounded"
        />
      </div>
    </>
  );
};
