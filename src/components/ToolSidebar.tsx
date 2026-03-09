import React from 'react';
import {
  MousePointer2,
  Square,
  Type,
  Minus,
  Eraser,
  Library,
  Brain,
  FunctionSquare,
  Undo2,
  Redo2,
  Save,
  FolderOpen,
  FilePlus,
  Download,
  Trash2,
  FolderKanban,
} from 'lucide-react';
import { AppMode } from '@/lib/types';
import { useEditorContext } from '@/contexts/EditorContext';

const tools = [
  { id: 'select', name: 'Выбор', icon: MousePointer2, mode: 'select' as AppMode },
  { id: 'interactive', name: 'Интерактив', icon: FunctionSquare, mode: 'interactive' as AppMode },
  { id: 'shape', name: 'Фигуры', icon: Square, mode: 'shape' as AppMode },
  { id: 'text', name: 'Текст', icon: Type, mode: 'text' as AppMode },
  { id: 'line', name: 'Линия', icon: Minus, mode: 'line' as AppMode },
  { id: 'eraser', name: 'Ластик', icon: Eraser, mode: 'eraser' as AppMode },
  { id: 'library', name: 'Библиотека', icon: Library, mode: 'library' as AppMode },
  { id: 'projects', name: 'Проекты', icon: FolderKanban, mode: 'projects' as AppMode },
  { id: 'challenge', name: 'Задачи', icon: Brain, mode: 'challenge' as AppMode },
];

interface ToolSidebarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
}

export const ToolSidebar: React.FC<ToolSidebarProps> = ({
  onNew,
  onOpen,
  onSave,
  onExport,
}) => {
  const { state, setMode, undo, redo, canUndo, canRedo, clearCanvas, selectedObjects } = useEditorContext();
  const mode = state.mode;
  const canUndoAction = canUndo();
  const canRedoAction = canRedo();
  const isDirty = state.isDirty;
  const hasSelection = selectedObjects.length > 0;
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
      {/* File operations */}
      <div className="flex flex-col gap-1 mb-4">
        <button
          onClick={onNew}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          title="Новый проект"
        >
          <FilePlus size={20} />
        </button>
        <button
          onClick={onOpen}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          title="Открыть проект"
        >
          <FolderOpen size={20} />
        </button>
        <button
          onClick={onSave}
          className={`p-2 rounded-lg text-gray-600 ${isDirty ? 'text-amber-600 hover:bg-amber-50' : 'hover:bg-gray-100'}`}
          title="Сохранить проект"
        >
          <Save size={20} />
        </button>
        <button
          onClick={onExport}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          title="Экспорт"
        >
          <Download size={20} />
        </button>
      </div>

      <div className="w-10 h-px bg-gray-200" />

      {/* Undo/Redo */}
      <div className="flex flex-col gap-1 mb-4">
        <button
          onClick={undo}
          disabled={!canUndoAction}
          className={`p-2 rounded-lg ${canUndoAction ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          title="Отменить"
        >
          <Undo2 size={20} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedoAction}
          className={`p-2 rounded-lg ${canRedoAction ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          title="Вернуть"
        >
          <Redo2 size={20} />
        </button>
      </div>

      <div className="w-10 h-px bg-gray-200" />

      {/* Tools */}
      <div className="flex flex-col gap-1">
        {tools.map((tool) => {
          // Hide Projects button in Electron
          if (tool.id === 'projects' && window.electronAPI) {
            return null;
          }

          const isInteractive = tool.id === 'interactive';
          const isChallenge = tool.id === 'challenge';
          const isProjects = tool.id === 'projects';
          const isActive = mode === tool.mode;

          return (
            <button
              key={tool.id}
              onClick={() => setMode(tool.mode)}
              className={`p-2 rounded-lg transition-all ${isActive
                ? isInteractive
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : isChallenge
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200'
                    : isProjects
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200'
                      : 'bg-indigo-100 text-indigo-600'
                : isInteractive
                  ? 'text-indigo-600 hover:bg-indigo-50 border-2 border-indigo-200'
                  : isChallenge
                    ? 'text-amber-600 hover:bg-amber-50 border-2 border-amber-200'
                    : isProjects
                      ? 'text-emerald-600 hover:bg-emerald-50 border-2 border-emerald-200'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              title={tool.name}
            >
              <tool.icon size={20} />
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Clear canvas or delete selected */}
      <button
        onClick={clearCanvas}
        className="p-2 rounded-lg hover:bg-red-50 text-red-500"
        title={hasSelection ? "Удалить выбранное" : "Очистить холст"}
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default ToolSidebar;
