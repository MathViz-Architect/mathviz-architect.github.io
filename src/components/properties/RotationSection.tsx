import React, { useCallback } from 'react';
import { RotateCw, RotateCcw } from 'lucide-react';
import { AnyCanvasObject } from '@/lib/types';

interface RotationSectionProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
  onPublish?: () => void;
}

const EXCLUDED_TYPES = ['chart', 'line', 'fraction', 'geoshape', 'text', 'geopoint', 'freehand'];

export const RotationSection: React.FC<RotationSectionProps> = ({
  object,
  onUpdate,
  onPublish,
}) => {
  const handleRotationChange = useCallback((value: number) => {
    const normalized = Math.max(0, Math.min(360, value));
    onUpdate({ rotation: normalized });
    onPublish?.();
  }, [onUpdate, onPublish]);

  const handleReset = useCallback(() => {
    onUpdate({ rotation: 0 });
    onPublish?.();
  }, [onUpdate, onPublish]);

  if (EXCLUDED_TYPES.includes(object.type)) {
    return null;
  }

  const rotation = object.rotation || 0;

  return (
    <div className="p-4 border-b border-gray-200">
      <h4 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
        <RotateCw size={12} /> Rotation
      </h4>

      <div className="space-y-3">
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            value={rotation}
            onChange={(e) => handleRotationChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            min={0}
            max={360}
            step={1}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0°</span>
            <span>90°</span>
            <span>180°</span>
            <span>270°</span>
            <span>360°</span>
          </div>
        </div>

        {/* Input + Reset Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={Math.round(rotation)}
              onChange={(e) => handleRotationChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-8"
              min={0}
              max={360}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">°</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            title="Reset rotation"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RotationSection;
