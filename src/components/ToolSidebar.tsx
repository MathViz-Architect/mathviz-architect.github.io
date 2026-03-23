import React, { useState } from 'react';
import {
  MousePointer2, Square, Type, Minus, Eraser, Library, Brain, FunctionSquare,
  Undo2, Redo2, Save, FolderOpen, FilePlus, Download, Trash2, FolderKanban,
  Dot, Spline, Triangle, Pencil, Circle, Highlighter, ChevronRight, PencilLine,
} from 'lucide-react';
import { AppMode } from '@/lib/types';
import { useEditorContext } from '@/contexts/EditorContext';

// Custom SVG icons
type IconProps = { size?: number; className?: string };

const TrapezoidIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <polygon points="4,18 20,18 17,6 7,6" vectorEffect="non-scaling-stroke" />
  </svg>
);

const RhombusIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <polygon points="12,3 21,12 12,21 3,12" vectorEffect="non-scaling-stroke" />
  </svg>
);

const ParallelogramIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <polygon points="6,18 22,18 18,6 2,6" vectorEffect="non-scaling-stroke" />
  </svg>
);

// Tool Configuration
type IconComponent = React.ComponentType<{ size?: number; className?: string }>;
interface ToolDef { id: string; name: string; icon: IconComponent; mode: AppMode; }
interface ToolGroup { id: string; name: string; icon: IconComponent; accent?: 'indigo' | 'amber' | 'emerald'; tools: ToolDef[]; }

const TOOL_GROUPS: ToolGroup[] = [
  { id: 'select', name: 'Выбор', icon: MousePointer2, tools: [{ id: 'select', name: 'Выбор', icon: MousePointer2, mode: 'select' }, { id: 'eraser', name: 'Ластик', icon: Eraser, mode: 'eraser' }] },
  { id: 'geometry', name: 'Геометрия', icon: Dot, tools: [{ id: 'geopoint', name: 'Точка', icon: Dot, mode: 'geopoint' }, { id: 'geosegment', name: 'Отрезок', icon: Spline, mode: 'geosegment' }, { id: 'line', name: 'Линия', icon: Minus, mode: 'line' }, { id: 'geoangle', name: 'Угол', icon: Triangle, mode: 'geoangle' }] },
  { id: 'freehand', name: 'Карандаш', icon: Pencil, tools: [{ id: 'freehand', name: 'Карандаш', icon: Pencil, mode: 'freehand' }, { id: 'highlighter', name: 'Выделитель', icon: Highlighter, mode: 'highlighter' }, { id: 'smart-pencil', name: 'Умный карандаш', icon: PencilLine, mode: 'smart-pencil' }] },
  { id: 'shapes', name: 'Фигуры', icon: Square, tools: [{ id: 'shape-rect', name: 'Прямоугольник', icon: Square, mode: 'shape' }, { id: 'shape-circle', name: 'Круг', icon: Circle, mode: 'shape' }, { id: 'shape-triangle', name: 'Треугольник', icon: Triangle, mode: 'shape' }, { id: 'shape-trapezoid', name: 'Трапеция', icon: TrapezoidIcon, mode: 'shape' }, { id: 'shape-rhombus', name: 'Ромб', icon: RhombusIcon, mode: 'shape' }, { id: 'shape-parallelogram', name: 'Паралл-мм', icon: ParallelogramIcon, mode: 'shape' }] },
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
  const { state, setMode, undo, redo, canUndo, canRedo, clearCanvas, selectedObjects, setShapeType, shapeType } = useEditorContext();
  const mode = state.mode;
  const canUndoAction = canUndo();
  const canRedoAction = canRedo();
  const isDirty = state.isDirty;
  const hasSelection = selectedObjects.length > 0;

  const shapeToolToType: Record<string, Parameters<typeof setShapeType>[0]> = {
    'shape-rect': 'rectangle', 'shape-circle': 'circle', 'shape-triangle': 'triangle',
    'shape-trapezoid': 'trapezoid', 'shape-rhombus': 'rhombus', 'shape-parallelogram': 'parallelogram',
  };

  const isActiveShape = (tool: ToolDef) => mode === 'shape' && shapeToolToType[tool.id] === shapeType;
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  const activeGroupId = TOOL_GROUPS.find(g => g.tools.some(t => t.mode === mode))?.id ?? null;
  const isExpanded = openGroupId !== null;

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
    // не закрываем панель — пользователь видит активный инструмент
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 flex flex-col py-4 gap-2 transition-all duration-200 relative ${isExpanded ? 'w-44' : 'w-16'} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* File actions */}
      <div className={`flex gap-1 mb-2 px-2 ${isExpanded ? 'flex-row flex-wrap justify-start' : 'flex-col items-center'}`}>
        <button onClick={onNew} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0" title="Новый проект"><FilePlus size={20} /></button>
        <button onClick={onOpen} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0" title="Открыть проект"><FolderOpen size={20} /></button>
        <button onClick={onSave} className={`p-2 rounded-lg text-gray-600 shrink-0 ${isDirty ? 'text-amber-600 hover:bg-amber-50' : 'hover:bg-gray-100'}`} title="Сохранить проект"><Save size={20} /></button>
        <button onClick={onExport} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0" title="Экспорт"><Download size={20} /></button>
      </div>

      <div className="mx-3 h-px bg-gray-200" />

      {/* Undo/Redo */}
      <div className={`flex gap-1 px-2 ${isExpanded ? 'flex-row' : 'flex-col items-center'}`}>
        <button onClick={undo} disabled={!canUndoAction} className={`p-2 rounded-lg shrink-0 ${canUndoAction ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`} title="Отменить"><Undo2 size={20} /></button>
        <button onClick={redo} disabled={!canRedoAction} className={`p-2 rounded-lg shrink-0 ${canRedoAction ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`} title="Вернуть"><Redo2 size={20} /></button>
      </div>

      <div className="mx-3 h-px bg-gray-200" />

      {/* Tool groups */}
      <div className="flex flex-col gap-1 px-2 flex-1">
        {TOOL_GROUPS.map((group) => {
          if (group.id === 'projects' && window.electronAPI) return null;

          const isGroupActive = activeGroupId === group.id;
          const isOpen = openGroupId === group.id;
          const accent = group.accent;
          const hasChildren = group.tools.length > 1;

          const btnClass = `p-2 rounded-lg transition-all flex items-center gap-2 w-full ${isGroupActive
            ? (accent ? accentActive[accent] : 'bg-indigo-100 text-indigo-600')
            : (accent ? accentInactive[accent] : 'text-gray-600 hover:bg-gray-100')
            }`;

          const ActiveIcon = isGroupActive && hasChildren
            ? (group.tools.find(t => t.mode === mode)?.icon ?? group.icon)
            : group.icon;

          return (
            <div key={group.id}>
              {/* Group button */}
              <button onClick={() => handleGroupClick(group)} className={btnClass} title={group.name}>
                <ActiveIcon size={20} className="shrink-0" />
                {isExpanded && (
                  <>
                    <span className="text-xs font-medium truncate flex-1 text-left">{group.name}</span>
                    {hasChildren && (
                      <ChevronRight size={14} className={`shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`} />
                    )}
                  </>
                )}
              </button>

              {/* Inline children */}
              {isOpen && hasChildren && (
                <div className="mt-1 ml-2">
                  {group.id === 'shapes' ? (
                    <div className="grid grid-cols-3 gap-1 p-1 bg-gray-50 rounded-lg">
                      {group.tools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool)}
                          title={tool.name}
                          className={`p-2 rounded-md flex items-center justify-center transition-all ${isActiveShape(tool)
                            ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400'
                            : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          <tool.icon size={16} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {group.tools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all w-full ${mode === tool.mode
                            ? 'bg-indigo-100 text-indigo-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          <tool.icon size={15} className="shrink-0" />
                          <span className="truncate">{tool.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trash */}
      <div className="px-2 mt-auto">
        <button
          onClick={clearCanvas}
          className="p-2 rounded-lg hover:bg-red-50 text-red-500 w-full flex items-center gap-2"
          title={hasSelection ? 'Удалить выбранное' : 'Очистить холст'}
        >
          <Trash2 size={20} className="shrink-0" />
          {isExpanded && <span className="text-xs truncate">{hasSelection ? 'Удалить' : 'Очистить'}</span>}
        </button>
      </div>
    </div>
  );
};

export default ToolSidebar;
