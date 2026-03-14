import React, { useState, useEffect, useCallback } from 'react';
import { useZenMode } from './hooks/useZenMode';
import { ToolSidebar } from './components/ToolSidebar';
import { TopBar } from './components/TopBar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { TemplateLibrary } from './components/TemplateLibrary';
import { InteractiveLibrary } from './components/interactive/InteractiveLibrary';
import { ChallengeMode } from './components/challenge/ChallengeMode';
import { WelcomeScreen } from './components/interactive/WelcomeScreen';
import { ProjectsPanel } from './components/ProjectsPanel';
import { ExportModal } from './components/ExportModal';
import { PageSwitcher } from './components/PageSwitcher';
import { AuthModal } from './components/AuthModal';
import { EditorProvider, useEditorContext } from './contexts/EditorContext';
import { CollaborationProvider, useCollaborationContext } from './hooks/useCollaborationContext';
import { TeacherControlPanel } from './components/room/TeacherControlPanel';
import { generateId } from './hooks/useAppState';
import { useProgressSync } from './hooks/useProgressSync';
import { migrateOfflineDataIfNeeded } from './lib/sync/migrateOfflineData';
import { Project } from './lib/types';
import './types/electron.d.ts';
import '@/modules/index';

function AppContent() {
  const {
    state, selectedObjects, removeObject, undo, redo, setMode, loadProject,
    setProjectPath, markAsSaved, newProject, handleSelectTemplate,
    interactiveModuleId, addPage, removePage, switchPage,
  } = useEditorContext();

  const { roomState, canEdit, user } = useCollaborationContext();

  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('welcomeScreenShown'));
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { zenMode, toggleZenMode } = useZenMode();

  useProgressSync();

  useEffect(() => { if (user) { migrateOfflineDataIfNeeded(user.id); } }, [user?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canEdit && e.key !== 'Escape') return;

      const key = e.key.toLowerCase();
      if (e.ctrlKey && !e.shiftKey && (key === 'z' || key === 'я')) { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey && (key === 'y' || key === 'н')) || (e.ctrlKey && e.shiftKey && (key === 'z' || key === 'я'))) { e.preventDefault(); redo(); return; }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjects.length > 0) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;
        e.preventDefault();
        selectedObjects.forEach((obj) => removeObject(obj.id));
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeTag = (e.target as HTMLElement).tagName.toLowerCase();
        const isEditable = activeTag === 'input' || activeTag === 'textarea' || (e.target as HTMLElement).isContentEditable;
        if (!isEditable) {
          const toolMap: Record<string, string> = { KeyV: 'select', KeyE: 'eraser', KeyP: 'geopoint', KeyS: 'geosegment', KeyL: 'line', KeyA: 'geoangle', KeyF: 'freehand', KeyT: 'text' };
          const tool = toolMap[e.code];
          if (tool) { e.preventDefault(); setMode(tool as Parameters<typeof setMode>[0]); }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjects, removeObject, undo, redo, setMode, canEdit]);

  const handleNew = useCallback(() => { if (state.isDirty && !window.confirm('Несохранённые изменения будут потеряны. Продолжить?')) return; newProject(); }, [newProject, state.isDirty]);

  const handleOpen = useCallback(async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openFile();
      if (!result.canceled && result.filePaths.length > 0) {
        const fileResult = await window.electronAPI.readFile(result.filePaths[0]);
        if (fileResult.success && fileResult.data) { try { const project: Project = JSON.parse(fileResult.data); loadProject(project, result.filePaths[0]); } catch (e) { console.error('Failed to parse project file:', e); } }
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mvz,.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try { const project: Project = JSON.parse(event.target?.result as string); loadProject(project, ''); } catch (e) { console.error('Failed to parse project file:', e); alert('Ошибка при открытии файла.'); }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  }, [loadProject]);

  const handleSave = useCallback(async () => {
    const project: Project = { id: generateId(), name: state.projectName, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), objects: state.objects, pages: state.pages, activePageId: state.activePageId, canvasSize: { width: 800, height: 600 }, backgroundColor: '#FFFFFF' };
    if (window.electronAPI) {
      let filePath = state.projectPath;
      if (!filePath) { const result = await window.electronAPI.saveFile(state.projectName + '.mvz'); if (result.canceled || !result.filePath) return; filePath = result.filePath; }
      const result = await window.electronAPI.writeFile(filePath, JSON.stringify(project, null, 2));
      if (result.success) { setProjectPath(filePath); markAsSaved(); }
    } else {
      const json = JSON.stringify(project, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${state.projectName}.mvz`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      markAsSaved();
    }
  }, [state, setProjectPath, markAsSaved]);

  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanups = [ window.electronAPI.onMenuNewProject(handleNew), window.electronAPI.onMenuOpenProject(async (filePath) => {}), window.electronAPI.onMenuSaveProject(handleSave), window.electronAPI.onMenuSaveProjectAs(async () => {}), window.electronAPI.onMenuUndo(undo), window.electronAPI.onMenuRedo(redo) ];
    return () => { cleanups.forEach((cleanup) => cleanup()); };
  }, [handleNew, handleSave, state, loadProject, setProjectPath, markAsSaved, undo, redo]);

  const renderMainContent = () => {
    if (state.mode === 'interactive') return <div className="flex-1 bg-gray-100 overflow-hidden"><InteractiveLibrary initialModule={interactiveModuleId ?? undefined} /></div>;
    if (state.mode === 'challenge') return <div className="flex-1 bg-gray-100 overflow-hidden"><ChallengeMode /></div>;
    if (state.mode === 'projects') return <div className="flex-1 bg-gray-100 overflow-hidden"><ProjectsPanel /></div>;
    if (state.mode === 'library') return <div className="flex-1 flex overflow-hidden"><Canvas /><TemplateLibrary onSelectTemplate={handleSelectTemplate} /></div>;
    return <div className="flex-1 flex overflow-hidden"><Canvas /></div>;
  };

  return (
    <div className={`h-screen flex flex-col bg-gray-50 overflow-hidden ${!['interactive', 'challenge', 'projects'].includes(state.mode) ? 'canvas-mode' : ''}`}>
      <div className="flex-1 flex overflow-hidden">
        <div className={`transition-all duration-200 ${zenMode ? 'hidden' : ''}`}>
          <ToolSidebar onNew={handleNew} onOpen={handleOpen} onSave={handleSave} onExport={() => setShowExportModal(true)} disabled={!canEdit && roomState.isConnected} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {roomState.isConnected && roomState.role === 'teacher' && <TeacherControlPanel />}
          <TopBar zenMode={zenMode} onToggleZenMode={toggleZenMode} onAuthClick={() => setShowAuthModal(true)} />
          {renderMainContent()}
          {!['interactive', 'challenge', 'projects'].includes(state.mode) && ( <PageSwitcher pages={state.pages} activePageId={state.activePageId} onSwitch={switchPage} onAdd={addPage} onRemove={removePage} /> )}
        </div>
        {!zenMode && !['interactive', 'challenge', 'library', 'projects'].includes(state.mode) && (selectedObjects.length > 0 || ['freehand', 'shape', 'text'].includes(state.mode)) && ( <PropertiesPanel /> )}
      </div>
      {showWelcome && <WelcomeScreen onClose={() => setShowWelcome(false)} />}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

function App() {
  return (
    <EditorProvider>
      <CollaborationProvider>
        <AppContent />
      </CollaborationProvider>
    </EditorProvider>
  );
}

export default App;
