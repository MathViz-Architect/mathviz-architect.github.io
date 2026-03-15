import React, { useState, useEffect, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import { useZenMode } from './hooks/useZenMode';
import { useImageUpload } from './hooks/useImageUpload';
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
    selectAll, copyToClipboard, pasteFromClipboard, duplicateSelected,
  } = useEditorContext();

  const { roomState, canEdit, user } = useCollaborationContext();
  const { uploadFromClipboard, createAndUploadImage, uploadState } = useImageUpload();
  const { addObject, updateObject } = useEditorContext();

  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('welcomeScreenShown'));
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { zenMode, toggleZenMode } = useZenMode();

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePasteImage = useCallback(async () => {
    if (!canEdit) return;
    
    console.log('[App] Paste detected, canEdit:', canEdit);
    
    const result = await createAndUploadImage((id, updates) => {
      updateObject(id, updates);
    });
    if (result) {
      console.log('[App] Adding image to canvas (optimistic):', result.imageObj.id);
      addObject(result.imageObj);
    } else if (uploadState.error) {
      console.error('[App] Image upload failed:', uploadState.error);
      setUploadError(uploadState.error);
      setTimeout(() => setUploadError(null), 5000);
    }
  }, [canEdit, createAndUploadImage, addObject, updateObject, uploadState.error]);

  useProgressSync();

  useEffect(() => { if (user) { migrateOfflineDataIfNeeded(user.id); } }, [user?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if not in canvas mode or editing
      if (!canEdit && e.key !== 'Escape') return;

      const key = e.key.toLowerCase();
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isEditing = activeTag === 'input' || activeTag === 'textarea' || (e.target as HTMLElement).isContentEditable;

      // Ctrl/Cmd + Key combinations
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Z: Undo
        if (!e.shiftKey && (key === 'z' || key === 'я')) {
          e.preventDefault();
          undo();
          return;
        }
        // Ctrl+Y or Ctrl+Shift+Z: Redo
        if ((key === 'y' || key === 'н') || (e.shiftKey && (key === 'z' || key === 'я'))) {
          e.preventDefault();
          redo();
          return;
        }
        // Ctrl+A: Select all (skip if editing text)
        if (key === 'a' && !isEditing) {
          e.preventDefault();
          selectAll();
          return;
        }
        // Ctrl+C: Copy (skip if editing text)
        if (key === 'c' && !isEditing) {
          e.preventDefault();
          copyToClipboard();
          return;
        }
        // Ctrl+V: Paste (skip if editing text)
        if (key === 'v' && !isEditing) {
          e.preventDefault();
          pasteFromClipboard();
          return;
        }
        // Ctrl+D: Duplicate (skip if editing text)
        if (key === 'd' && !isEditing) {
          e.preventDefault();
          duplicateSelected();
          return;
        }
      }

      // Delete/Backspace: Delete selected objects (skip if editing text)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjects.length > 0 && !isEditing) {
        e.preventDefault();
        selectedObjects.forEach((obj) => removeObject(obj.id));
        return;
      }

      // Tool shortcuts (only when not editing text and no modifiers)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!isEditing) {
          const toolMap: Record<string, string> = { KeyV: 'select', KeyE: 'eraser', KeyP: 'geopoint', KeyS: 'geosegment', KeyL: 'line', KeyA: 'geoangle', KeyF: 'freehand', KeyT: 'text' };
          const tool = toolMap[e.code];
          if (tool) { e.preventDefault(); setMode(tool as Parameters<typeof setMode>[0]); }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjects, removeObject, undo, redo, setMode, canEdit, selectAll, copyToClipboard, pasteFromClipboard, duplicateSelected]);

  // Handle paste for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!canEdit) return;
      
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isEditing = activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable;
      if (isEditing) return;

      handlePasteImage();
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [canEdit, handlePasteImage]);

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
        <div className="flex-1 flex flex-col overflow-hidden">
          {roomState.isConnected && roomState.role === 'teacher' && (
            <div className="flex-shrink-0">
              <TeacherControlPanel />
            </div>
          )}
          <TopBar zenMode={zenMode} onToggleZenMode={toggleZenMode} onAuthClick={() => setShowAuthModal(true)} />
          {renderMainContent()}
          {!['interactive', 'challenge', 'projects'].includes(state.mode) && ( <PageSwitcher pages={state.pages} activePageId={state.activePageId} onSwitch={switchPage} onAdd={addPage} onRemove={removePage} /> )}
        </div>
        {!zenMode && !['interactive', 'challenge', 'library', 'projects'].includes(state.mode) && (selectedObjects.length > 0 || ['freehand', 'shape', 'text'].includes(state.mode)) && ( <PropertiesPanel /> )}
      </div>
      {showWelcome && <WelcomeScreen onClose={() => setShowWelcome(false)} />}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {uploadError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm">{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
          </div>
        </div>
      )}
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
