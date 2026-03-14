import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer2, Square, Type, Minus, Eraser, Library, Brain, FunctionSquare,
  Undo2, Redo2, Save, FolderOpen, FilePlus, Download, Trash2, FolderKanban,
  Dot, Spline, Triangle, Pencil, Circle, Pentagon, LucideIcon,
} from 'lucide-react';
import { AppMode } from '@/lib/types';
import { useEditorContext } from '@/contexts/EditorContext';

// Tool Configuration
interface ToolDef { id: string; name: string; icon: LucideIcon; mode: AppMode; }
interface ToolGroup { id: string; name: string; icon: LucideIcon; accent?: 'indigo' | 'amber' | 'emerald'; tools: ToolDef[]; }

const TOOL_GROUPS: ToolGroup[] = [
  { id: 'select', name: 'Выбор', icon: MousePointer2, tools: [{ id: 'select', name: 'Выбор', icon: MousePointer2, mode: 'select' }, { id: 'eraser', name: 'Ластик', icon: Eraser, mode: 'eraser' }] },
  { id: 'geometry', name: 'Геометрия', icon: Dot, tools: [{ id: 'geopoint', name: 'Точка', icon: Dot, mode: 'geopoint' }, { id: 'geosegment', name: 'Отрезок', icon: Spline, mode: 'geosegment' }, { id: 'line', name: 'Линия', icon: Minus, mode: 'line' }, { id: 'geoangle', name: 'Угол', icon: Triangle, mode: 'geoangle' }] },
  { id: 'freehand', name: 'Карандаш', icon: Pencil, tools: [{ id: 'freehand', name: 'Карандаш', icon: Pencil, mode: 'freehand' }] },
  { id: 'shapes', name: 'Фигуры', icon: Square, tools: [{ id: 'shape-rect', name: 'Прямоугольник', icon: Square, mode: 'shape' }, { id: 'shape-circle', name: 'Круг', icon: Circle, mode: 'shape' }, { id: 'shape-triangle', name: 'Треугольник', icon: Triangle, mode: 'shape' }, { id: 'shape-geo-circle', name: 'Окружность', icon: Circle, mode: 'shape' }, { id: 'shape-geo-triangle', name: '△ с параметрами', icon: Triangle, mode: 'shape' }, { id: 'shape-geo-quad', name: '□ с параметрами', icon: Pentagon, mode: 'shape' }] },
  { id: 'text', name: 'Текст', icon: Type, tools: [{ id: 'text', name: 'Текст', icon: Type, mode: 'text' }] },
  { id: 'interactive', name: 'Интерактив', icon: FunctionSquare, accent: 'indigo', tools: [{ id: 'interactive', name: 'Интерактив', icon: FunctionSquare, mode: 'interactive' }] },
  { id: 'library', name: 'Библиотека', icon: Library, tools: [{ id: 'library', name: 'Библиотека', icon: Library, mode: 'library' }] },
  { id: 'projects', name: 'Проекты', icon: FolderKanban, accent: 'emerald', tools: [{ id: 'projects', name: 'Проекты', icon: FolderKanban, mode: 'projects' }] },
  { id: 'challenge', name: 'Задачи', icon: Brain, accent: 'amber', tools: [{ id: 'challenge', name: 'Задачи', icon: Brain, mode: 'challenge' }] },
];

// Accent Styles
const accentActive: Record<string, string> = {
  indigo: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200',
  amber: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200',
  emerald: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200',
};
const accentInactive: Record<string, string> = {
  indigo: 'text-indigo-600 hover:bg-indigo-50 border-2 border-indigo-200',
  amber: 'text-amber-600 hover:bg-amber-50 border-2 border-amber-200',
  emerald: 'text-emerald-600 hover:bg-emerald-50 border-2 border-emerald-200',
};

// Props
interface ToolSidebarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
  disabled?: boolean;
}

export const ToolSidebar: React.FC<ToolSidebarProps> = ({ onNew, onOpen, onSave, onExport, disabled = false }) => {
  const { state, setMode, undo, redo, canUndo, canRedo, clearCanvas, selectedObjects, setShapeType } = useEditorContext();
  const mode = state.mode;
  const canUndoAction = canUndo();
  const canRedoAction = canRedo();
  const isDirty = state.isDirty;
  const hasSelection = selectedObjects.length > 0;
  const shapeToolToType: Record<string, Parameters<typeof setShapeType>[0]> = { 'shape-rect': 'rectangle', 'shape-circle': 'circle', 'shape-triangle': 'triangle', 'shape-geo-circle': 'geoshape-circle', 'shape-geo-triangle': 'geoshape-triangle', 'shape-geo-quad': 'geoshape-quad' };
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpenGroupId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeGroupId = TOOL_GROUPS.find(g => g.tools.some(t => t.mode === mode))?.id ?? null;

  const handleGroupClick = (group: ToolGroup) => {
    if (group.tools.length === 1) {
      setMode(group.tools[0].mode);
      setOpenGroupId(null);
    } else {
      setOpenGroupId(prev => prev === group.id ? null : group.id);
    }
  };

  const handleToolClick = (tool: ToolDef) => {
    if (tool.id in shapeToolToType) setShapeType(shapeToolToType[tool.id]);
    setMode(tool.mode);
    setOpenGroupId(null);
  };

  const wrapperClasses = `w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 relative transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''}`;

  return (
    <div ref={sidebarRef} className={wrapperClasses}>
      <div className="flex flex-col gap-1 mb-4">
        <button onClick={onNew} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Новый проект"><FilePlus size={20} /></button>
        <button onClick={onOpen} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Открыть проект"><FolderOpen size={20} /></button>
        <button onClick={onSave} className={`p-2 rounded-lg text-gray-600 ${isDirty ? 'text-amber-600 hover:bg-amber-50' : 'hover:bg-gray-100'}`} title="Сохранить проект"><Save size={20} /></button>
        <button onClick={onExport} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Экспорт"><Download size={20} /></button>
      </div>
      <div className="w-10 h-px bg-gray-200" />
      <div className="flex flex-col gap-1 mb-4">
        <button onClick={undo} disabled={!canUndoAction} className={`p-2 rounded-lg ${canUndoAction ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`} title="Отменить"><Undo2 size={20} /></button>
        <button onClick={redo} disabled={!canRedoAction} className={`p-2 rounded-lg ${canRedoAction ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`} title="Вернуть"><Redo2 size={20} /></button>
      </div>
      <div className="w-10 h-px bg-gray-200" />
      <div className="flex flex-col gap-1">
        {TOOL_GROUPS.map((group) => {
          if (group.id === 'projects' && window.electronAPI) return null;
          const isGroupActive = activeGroupId === group.id;
          const accent = group.accent;
          const btnClass = `p-2 rounded-lg transition-all ${isGroupActive ? (accent ? accentActive[accent] : 'bg-indigo-100 text-indigo-600') : (accent ? accentInactive[accent] : 'text-gray-600 hover:bg-gray-100')}`;
          const ActiveIcon = isGroupActive && group.tools.length > 1 ? (group.tools.find(t => t.mode === mode)?.icon ?? group.icon) : group.icon;
          return (
            <div key={group.id} className="relative">
              <button onClick={() => handleGroupClick(group)} className={btnClass} title={group.name}><ActiveIcon size={20} /></button>
              {openGroupId === group.id && group.tools.length > 1 && (
                <div className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 flex flex-col gap-1 z-50 min-w-[130px]">
                  {group.tools.map((tool) => (
                    <button key={tool.id} onClick={() => handleToolClick(tool)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${mode === tool.mode ? 'bg-indigo-100 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <tool.icon size={16} />{tool.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex-1" />
      <button onClick={clearCanvas} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title={hasSelection ? 'Удалить выбранное' : 'Очистить холст'}><Trash2 size={20} /></button>
    </div>
  );
};

export default ToolSidebar;
