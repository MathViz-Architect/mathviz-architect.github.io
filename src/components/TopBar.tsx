import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Grid3X3, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useEditorContext } from '@/contexts/EditorContext';

export const TopBar: React.FC = () => {
  const {
    state,
    setProjectName,
    zoom,
    showGrid,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleToggleGrid,
    selectedObjects,
    handleToggleVisibility,
    handleToggleLock,
  } = useEditorContext();

  const projectName = state.projectName;
  const hasSelection = selectedObjects.length > 0;
  const firstSelected = selectedObjects[0];

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commitRename = () => {
    setEditing(false);
    const trimmed = draft.trim() || projectName;
    setDraft(trimmed);
    if (trimmed !== projectName) setProjectName(trimmed);
  };

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Project name */}
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setDraft(projectName); setEditing(false); } }}
            className="text-lg font-semibold text-gray-800 border-b-2 border-indigo-400 outline-none bg-transparent px-1"
          />
        ) : (
          <span
            className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
            title="Нажмите для переименования"
            onClick={() => { setDraft(projectName); setEditing(true); }}
          >
            {projectName}
          </span>
        )}
      </div>

      {/* Center - View controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
          title="Уменьшить"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleZoomReset}
          className="px-2 py-1 rounded hover:bg-gray-100 text-sm text-gray-600 min-w-[60px]"
          title="Сбросить масштаб"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
          title="Увеличить"
        >
          <ZoomIn size={18} />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2" />
        <button
          onClick={handleToggleGrid}
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
              onClick={handleToggleVisibility}
              className={`p-1.5 rounded hover:bg-gray-100 ${firstSelected?.visible ? 'text-gray-600' : 'text-gray-400'
                }`}
              title={firstSelected?.visible ? 'Скрыть' : 'Показать'}
            >
              {firstSelected?.visible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <button
              onClick={handleToggleLock}
              className={`p-1.5 rounded hover:bg-gray-100 ${firstSelected?.locked ? 'text-indigo-600' : 'text-gray-600'
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
