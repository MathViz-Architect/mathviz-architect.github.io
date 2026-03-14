import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Grid3X3, Eye, EyeOff, Lock, Unlock, Monitor, LogIn, User, Share2, Copy, X } from 'lucide-react';
import { useEditorContext } from '@/contexts/EditorContext';
import { useCollaborationContext } from '@/hooks/useCollaborationContext';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface TopBarProps {
  zenMode?: boolean
  onToggleZenMode?: () => void
  onAuthClick?: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ zenMode, onToggleZenMode, onAuthClick }) => {
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

  const { roomState, user, createRoom, leaveRoom, closeRoom, copyRoomLink } = useCollaborationContext();

  const projectName = state.projectName;
  const hasSelection = selectedObjects.length > 0;
  const firstSelected = selectedObjects[0];

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(projectName);
  const [showRoomPopover, setShowRoomPopover] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowRoomPopover(false);
      }
    };
    if (showRoomPopover) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRoomPopover]);

  const commitRename = () => {
    setEditing(false);
    const trimmed = draft.trim() || projectName;
    setDraft(trimmed);
    if (trimmed !== projectName) setProjectName(trimmed);
  };

  const handleShareClick = async () => {
    if (roomState.isConnected) {
      setShowRoomPopover(prev => !prev);
      return;
    }
    setIsCreating(true);
    await createRoom();
    setIsCreating(false);
    setShowRoomPopover(true);
  };

  const handleCopyLink = async () => {
    const link = copyRoomLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setDraft(projectName); setEditing(false); } }}
            className="text-lg font-semibold text-gray-800 border-b-2 border-indigo-400 outline-none bg-transparent px-1"
          />
        ) : (
          <span
            className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
            title="Нажмите для переименования" onClick={() => { setDraft(projectName); setEditing(true); }}
          >
            {projectName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Уменьшить"><ZoomOut size={18} /></button>
        <button onClick={handleZoomReset} className="px-2 py-1 rounded hover:bg-gray-100 text-sm text-gray-600 min-w-[60px]" title="Сбросить масштаб">{Math.round(zoom * 100)}%</button>
        <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Увеличить"><ZoomIn size={18} /></button>
        <div className="w-px h-6 bg-gray-200 mx-2" />
        <button onClick={handleToggleGrid} className={`p-1.5 rounded ${showGrid ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`} title="Сетка"><Grid3X3 size={18} /></button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onToggleZenMode} className={`p-1.5 rounded transition-colors ${zenMode ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`} title="Zen Mode — скрыть панели (Z)"><Monitor size={18} /></button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        {hasSelection ? (
          <>
            <button onClick={handleToggleVisibility} className={`p-1.5 rounded hover:bg-gray-100 ${firstSelected?.visible ? 'text-gray-600' : 'text-gray-400'}`} title={firstSelected?.visible ? 'Скрыть' : 'Показать'}>{firstSelected?.visible ? <Eye size={18} /> : <EyeOff size={18} />}</button>
            <button onClick={handleToggleLock} className={`p-1.5 rounded hover:bg-gray-100 ${firstSelected?.locked ? 'text-indigo-600' : 'text-gray-600'}`} title={firstSelected?.locked ? 'Разблокировать' : 'Заблокировать'}>{firstSelected?.locked ? <Lock size={18} /> : <Unlock size={18} />}</button>
            <span className="text-sm text-gray-500">Выбрано: {selectedObjects.length}</span>
          </>
        ) : (<span className="text-sm text-gray-400">Выберите объект</span>)}
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <div className="relative" ref={popoverRef}>
          <button onClick={handleShareClick} disabled={isCreating} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium transition-colors ${roomState.isConnected ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'text-indigo-600 hover:bg-indigo-50'}`} title={roomState.isConnected ? 'Комната активна' : 'Поделиться холстом'}>
            <Share2 size={16} /><span className="hidden sm:block">{isCreating ? 'Создаём...' : roomState.isConnected ? 'Комната' : 'Поделиться'}</span>
          </button>
          {showRoomPopover && roomState.isConnected && (
            <div className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
              <div className="flex items-center justify-between mb-3"><span className="text-sm font-medium text-gray-800">Совместная комната</span><button onClick={() => setShowRoomPopover(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button></div>
              <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-gray-500">{roomState.role === 'teacher' ? 'Вы создали комнату' : 'Вы участник'}</span></div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono mb-3 truncate">{copyRoomLink()}</div>
              <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors mb-2"><Copy size={14} />{copied ? 'Скопировано!' : 'Копировать ссылку'}</button>
              {roomState.role === 'teacher' ? (<button onClick={() => { closeRoom(); setShowRoomPopover(false); }} className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">Закрыть комнату</button>) : (<button onClick={() => { leaveRoom(); setShowRoomPopover(false); }} className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Покинуть комнату</button>)}
              {roomState.error && (<p className="mt-2 text-xs text-red-500">{roomState.error}</p>)}
            </div>
          )}
        </div>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        {user ? (<div className="flex items-center gap-1.5" title={user.email ?? ''}><User size={16} className="text-indigo-600" /><span className="text-sm text-gray-600 max-w-[120px] truncate hidden sm:block">{user.email}</span></div>
        ) : (
          <button onClick={onAuthClick} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors" title="Войти для синхронизации прогресса">
            <LogIn size={16} /><span className="hidden sm:block">Войти</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
