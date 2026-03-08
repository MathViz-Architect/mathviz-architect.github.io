import React from 'react';
import { ZoomIn, ZoomOut, Grid3X3, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { AnyCanvasObject } from '@/lib/types';

interface TopBarProps {
  projectName: string;
  zoom: number;
  showGrid: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleGrid: () => void;
  selectedObjects: AnyCanvasObject[];
  onToggleVisibility: () => void;
  onToggleLock: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  projectName,
  zoom,
  showGrid,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleGrid,
  selectedObjects,
  onToggleVisibility,
  onToggleLock,
}) => {
  const hasSelection = selectedObjects.length > 0;
  const firstSelected = selectedObjects[0];

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Project name */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-gray-800">{projectName}</span>
      </div>

      {/* Center - View controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
          title="Уменьшить"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={onZoomReset}
          className="px-2 py-1 rounded hover:bg-gray-100 text-sm text-gray-600 min-w-[60px]"
          title="Сбросить масштаб"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
          title="Увеличить"
        >
          <ZoomIn size={18} />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2" />
        <button
          onClick={onToggleGrid}
          className={`p-1.5 rounded ${showGrid ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Сетка"
        >
          <Grid3X3 size={18} />
        </button>
      </div>

      {/* Right - Object controls */}
      <div className="flex items-center gap-2">
        {hasSelection && (
          <>
            <button
              onClick={onToggleVisibility}
              className={`p-1.5 rounded hover:bg-gray-100 ${
                firstSelected?.visible ? 'text-gray-600' : 'text-gray-400'
              }`}
              title={firstSelected?.visible ? 'Скрыть' : 'Показать'}
            >
              {firstSelected?.visible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <button
              onClick={onToggleLock}
              className={`p-1.5 rounded hover:bg-gray-100 ${
                firstSelected?.locked ? 'text-indigo-600' : 'text-gray-600'
              }`}
              title={firstSelected?.locked ? 'Разблокировать' : 'Заблокировать'}
            >
              {firstSelected?.locked ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
            <span className="text-sm text-gray-500">
              Выбрано: {selectedObjects.length}
            </span>
          </>
        )}
        {!hasSelection && (
          <span className="text-sm text-gray-400">Выберите объект</span>
        )}
      </div>
    </div>
  );
};

export default TopBar;
