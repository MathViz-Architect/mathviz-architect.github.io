import React from 'react';
import { AnyCanvasObject } from '@/lib/types';
import { ColorPicker } from './ColorPicker';

interface TextPropertiesProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

export const TextProperties: React.FC<TextPropertiesProps> = ({ object, onUpdate }) => {
  const data = object.data as {
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fill: string;
    textAlign: string;
  };

  const handleUpdateData = (key: string, value: unknown) => {
    onUpdate({
      data: { ...object.data, [key]: value },
    });
  };

  return (
    <>
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Текст</label>
        <textarea
          value={data?.text || 'Текст'}
          onChange={(e) => handleUpdateData('text', e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded resize-none"
          rows={3}
        />
      </div>
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Размер шрифта</label>
        <input
          type="number"
          value={data?.fontSize || 16}
          onChange={(e) => handleUpdateData('fontSize', parseInt(e.target.value))}
          className="w-full px-2 py-1 text-sm border rounded"
          min={8}
          max={72}
        />
      </div>
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">Выравнивание</label>
        <select
          value={data?.textAlign || 'left'}
          onChange={(e) => handleUpdateData('textAlign', e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded"
        >
          <option value="left">По левому краю</option>
          <option value="center">По центру</option>
          <option value="right">По правому краю</option>
        </select>
      </div>
      <ColorPicker
        label="Цвет текста"
        value={data?.fill || '#1F2937'}
        onChange={(value) => handleUpdateData('fill', value)}
      />
    </>
  );
};
