import React from 'react';
import { Move, RotateCw, Maximize2 } from 'lucide-react';
import { AnyCanvasObject } from '@/lib/types';

interface PositionSizePanelProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
}

const EXCLUDED_TYPES_FOR_POSITION = ['line', 'geoshape', 'geopoint', 'freehand'];
const EXCLUDED_TYPES_FOR_SIZE = ['line', 'geoshape', 'geopoint', 'freehand'];
const EXCLUDED_TYPES_FOR_ROTATION = ['chart', 'line', 'fraction', 'geoshape', 'text', 'geopoint', 'freehand'];

export const PositionSizePanel: React.FC<PositionSizePanelProps> = ({ object, onUpdate }) => {
  const showPosition = !EXCLUDED_TYPES_FOR_POSITION.includes(object.type);
  const showSize = !EXCLUDED_TYPES_FOR_SIZE.includes(object.type);
  const showRotation = !EXCLUDED_TYPES_FOR_ROTATION.includes(object.type);

  return (
    <>
      {showPosition && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Move size={12} /> Позиция
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400">X</label>
              <input
                type="number"
                value={Math.round(object.x)}
                onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Y</label>
              <input
                type="number"
                value={Math.round(object.y)}
                onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {showSize && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Maximize2 size={12} /> Размер
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400">Ширина</label>
              <input
                type="number"
                value={Math.round(object.width)}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 10 })}
                className="w-full px-2 py-1 text-sm border rounded"
                min={10}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Высота</label>
              <input
                type="number"
                value={Math.round(object.height)}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 10 })}
                className="w-full px-2 py-1 text-sm border rounded"
                min={10}
              />
            </div>
          </div>
        </div>
      )}

      {showRotation && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <RotateCw size={12} /> Поворот
          </h4>
          <div className="space-y-2">
            <input
              type="range"
              value={object.rotation}
              onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
              className="w-full"
              min={0}
              max={360}
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={object.rotation}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  onUpdate({ rotation: Math.max(0, Math.min(360, val)) });
                }}
                className="flex-1 px-2 py-1 text-sm border rounded"
                min={0}
                max={360}
              />
              <span className="text-xs text-gray-400">°</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
