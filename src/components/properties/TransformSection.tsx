import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Lock, Unlock, Move, Maximize2 } from 'lucide-react';
import { AnyCanvasObject } from '@/lib/types';

interface TransformSectionProps {
  object: AnyCanvasObject;
  onUpdate: (updates: Partial<AnyCanvasObject>) => void;
  onPublish?: () => void;
}

const EXCLUDED_TYPES = ['line', 'geoshape', 'geopoint', 'freehand'];

export const TransformSection: React.FC<TransformSectionProps> = ({
  object,
  onUpdate,
  onPublish,
}) => {
  const [lockAspect, setLockAspect] = useState(true);
  const initialAspectRatioRef = useRef(object.width / object.height);
  
  // Update stored aspect ratio when object changes (e.g., different object selected)
  useEffect(() => {
    initialAspectRatioRef.current = object.width / object.height;
  }, [object.id, object.width, object.height]);

  const handleWidthChange = useCallback((newWidth: number) => {
    const currentAspectRatio = initialAspectRatioRef.current;
    if (lockAspect && currentAspectRatio > 0) {
      const newHeight = newWidth / currentAspectRatio;
      onUpdate({ width: newWidth, height: newHeight });
    } else {
      onUpdate({ width: newWidth });
    }
    onPublish?.();
  }, [lockAspect, onUpdate, onPublish]);

  const handleHeightChange = useCallback((newHeight: number) => {
    const currentAspectRatio = initialAspectRatioRef.current;
    if (lockAspect && currentAspectRatio > 0) {
      const newWidth = newHeight * currentAspectRatio;
      onUpdate({ width: newWidth, height: newHeight });
    } else {
      onUpdate({ height: newHeight });
    }
    onPublish?.();
  }, [lockAspect, onUpdate, onPublish]);

  const handlePositionChange = useCallback((axis: 'x' | 'y', value: number) => {
    onUpdate({ [axis]: value });
    onPublish?.();
  }, [onUpdate, onPublish]);

  if (EXCLUDED_TYPES.includes(object.type)) {
    return null;
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <h4 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
        <Move size={12} /> Transform
      </h4>
      
      <div className="space-y-3">
        {/* Position Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">X</label>
            <input
              type="number"
              value={Math.round(object.x)}
              onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Y</label>
            <input
              type="number"
              value={Math.round(object.y)}
              onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Size Row with Aspect Lock */}
        <div className="space-y-1">
          <label className="block text-xs text-gray-400 flex items-center gap-1">
            <Maximize2 size={10} /> Size
            {lockAspect && <span className="text-blue-500 text-[10px]">(locked)</span>}
          </label>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            <input
              type="number"
              value={Math.round(object.width)}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 10)}
              className={`w-full px-2 py-1.5 text-sm border rounded-md bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
                lockAspect ? 'border-blue-300' : 'border-gray-200'
              }`}
              min={10}
            />
            <button
              type="button"
              onClick={() => setLockAspect(!lockAspect)}
              className={`p-1.5 rounded-md transition-colors ${
                lockAspect 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            >
              {lockAspect ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
            <input
              type="number"
              value={Math.round(object.height)}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 10)}
              className={`w-full px-2 py-1.5 text-sm border rounded-md bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
                lockAspect ? 'border-blue-300' : 'border-gray-200'
              }`}
              min={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransformSection;
