import React from 'react';
import { AnyCanvasObject } from '@/lib/types';

interface MultiSelectPanelProps {
  objects: AnyCanvasObject[];
  onDeleteAll: () => void;
}

export const MultiSelectPanel: React.FC<MultiSelectPanelProps> = ({ objects, onDeleteAll }) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Свойства</h3>
      <p className="text-sm text-gray-400">Выбрано объектов: {objects.length}</p>
      <button
        onClick={onDeleteAll}
        className="mt-4 w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
      >
        Удалить все
      </button>
    </div>
  );
};
