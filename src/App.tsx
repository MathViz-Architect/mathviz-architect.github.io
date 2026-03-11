import React, { useState, useEffect, useCallback } from 'react';
import { ToolSidebar } from './components/ToolSidebar';
import { TopBar } from './components/TopBar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { TemplateLibrary } from './components/TemplateLibrary';
import { ObjectCreator } from './components/ObjectCreator';
import { InteractiveLibrary } from './components/interactive/InteractiveLibrary';
import { ChallengeMode } from './components/challenge/ChallengeMode';
import { WelcomeScreen } from './components/interactive/WelcomeScreen';
import { ProjectsPanel } from './components/ProjectsPanel';
import { ExportModal } from './components/ExportModal';
import { PageSwitcher } from './components/PageSwitcher';
import { EditorProvider, useEditorContext } from './contexts/EditorContext';
import { generateId } from './hooks/useAppState';
import { Project } from './lib/types';
import './types/electron.d.ts';

// Register all interactive modules
import '@/modules/index';

function AppContent() {
  const {
    state,
    selectedObjects,
    removeObject,
    undo,
    redo,
    setMode,
    loadProject,
    setProjectPath,
    markAsSaved,
    newProject,
    handleSelectTemplate,
    interactiveModuleId,
    addPage,
    removePage,
    switchPage,
  } = useEditorContext();

  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('welcomeScreenShown');
  });

  const [showExportModal, setShowExportModal] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Ctrl+Z or Ctrl+я - undo
      const isUndo = e.ctrlKey && !e.shiftKey && (key === 'z' || key === 'я');
      if (isUndo) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y or Ctrl+н or Ctrl+Shift+Z or Ctrl+Shift+я - redo
      const isRedo = (e.ctrlKey && (key === 'y' || key === 'н')) ||
        (e.ctrlKey && e.shiftKey && (key === 'z' || key === 'я'));
      if (isRedo) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete or Backspace - delete selected objects
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjects.length > 0) {
        // Skip if user is editing text
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;

        // Prevent default backspace behavior (going back in browser)
        e.preventDefault();
        selectedObjects.forEach((obj) => removeObject(obj.id));
      }

      // Tool hotkeys — use e.code to work regardless of keyboard layout
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeTag = (e.target as HTMLElement).tagName.toLowerCase();
        const isEditable = activeTag === 'input' || activeTag === 'textarea' ||
          (e.target as HTMLElement).isContentEditable;
        if (!isEditable) {
          const toolMap: Record<string, string> = {
            KeyV: 'select',
            KeyE: 'eraser',
            KeyP: 'geopoint',
            KeyS: 'geosegment',
            KeyL: 'line',
            KeyA: 'geoangle',
            KeyF: 'freehand',
            KeyT: 'text',
          };
          const tool = toolMap[e.code];
          if (tool) {
            e.preventDefault();
            setMode(tool as Parameters<typeof setMode>[0]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjects, removeObject, undo, redo, setMode]);

  // File operations
  const handleNew = useCallback(() => {
    if (state.isDirty) {
      if (!window.confirm('Несохранённые изменения будут потеряны. Продолжить?')) {
        return;
      }
    }
    newProject();
  }, [newProject, state.isDirty]);

  const handleOpen = useCallback(async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openFile();
      if (!result.canceled && result.filePaths.length > 0) {
        const fileResult = await window.electronAPI.readFile(result.filePaths[0]);
        if (fileResult.success && fileResult.data) {
          try {
            const project: Project = JSON.parse(fileResult.data);
            loadProject(project, result.filePaths[0]);
          } catch (e) {
            console.error('Failed to parse project file:', e);
          }
        }
      }
    } else {
      // Web fallback: use file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mvz,.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const project: Project = JSON.parse(event.target?.result as string);
              loadProject(project, '');
            } catch (e) {
              console.error('Failed to parse project file:', e);
              alert('Ошибка при открытии файла. Проверьте формат файла.');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  }, [loadProject]);

  const handleSave = useCallback(async () => {
    if (window.electronAPI) {
      let filePath = state.projectPath;
      if (!filePath) {
        const result = await window.electronAPI.saveFile(state.projectName + '.mvz');
        if (result.canceled || !result.filePath) return;
        filePath = result.filePath;
      }

      const project: Project = {
        id: generateId(),
        name: state.projectName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        objects: state.objects,
        pages: state.pages,
        activePageId: state.activePageId,
        canvasSize: { width: 800, height: 600 },
        backgroundColor: '#FFFFFF',
      };

      const result = await window.electronAPI.writeFile(filePath, JSON.stringify(project, null, 2));
      if (result.success) {
        setProjectPath(filePath);
        markAsSaved();
      }
    } else {
      // Web fallback: download as file
      const project: Project = {
        id: generateId(),
        name: state.projectName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        objects: state.objects,
        pages: state.pages,
        activePageId: state.activePageId,
        canvasSize: { width: 800, height: 600 },
        backgroundColor: '#FFFFFF',
      };

      const json = JSON.stringify(project, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.projectName}.mvz`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      markAsSaved();
    }
  }, [state, setProjectPath, markAsSaved]);

  const handleExport = useCallback(async () => {
    if (window.electronAPI) {
      // Electron export will be implemented later
      console.log('Export clicked (Electron)');
      return;
    }

    // Web: Open export modal
    setShowExportModal(true);
  }, []);

  // Menu events from Electron
  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanups = [
      window.electronAPI.onMenuNewProject(handleNew),
      window.electronAPI.onMenuOpenProject(async (filePath) => {
        const fileResult = await window.electronAPI.readFile(filePath);
        if (fileResult.success && fileResult.data) {
          try {
            const project: Project = JSON.parse(fileResult.data);
            loadProject(project, filePath);
          } catch (e) {
            console.error('Failed to parse project file:', e);
          }
        }
      }),
      window.electronAPI.onMenuSaveProject(handleSave),
      window.electronAPI.onMenuSaveProjectAs(async () => {
        const result = await window.electronAPI.saveFile(state.projectName + '.mvz');
        if (!result.canceled && result.filePath) {
          const project: Project = {
            id: generateId(),
            name: state.projectName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            objects: state.objects,
            pages: state.pages,
            activePageId: state.activePageId,
            canvasSize: { width: 800, height: 600 },
            backgroundColor: '#FFFFFF',
          };
          const writeResult = await window.electronAPI.writeFile(result.filePath, JSON.stringify(project, null, 2));
          if (writeResult.success) {
            setProjectPath(result.filePath);
            markAsSaved();
          }
        }
      }),
      window.electronAPI.onMenuUndo(undo),
      window.electronAPI.onMenuRedo(redo),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [handleNew, handleSave, state, loadProject, setProjectPath, markAsSaved, undo, redo]);

  // Render main content based on mode
  const renderMainContent = () => {
    // Interactive mode - full screen interactive modules
    if (state.mode === 'interactive') {
      return (
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <InteractiveLibrary initialModule={interactiveModuleId ?? undefined} />
        </div>
      );
    }

    // Challenge mode - math challenges
    if (state.mode === 'challenge') {
      return (
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <ChallengeMode />
        </div>
      );
    }

    // Projects mode - saved projects list
    if (state.mode === 'projects') {
      return (
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <ProjectsPanel />
        </div>
      );
    }

    // Library mode - templates
    if (state.mode === 'library') {
      return (
        <div className="flex-1 flex overflow-hidden">
          <Canvas />
          <TemplateLibrary onSelectTemplate={handleSelectTemplate} />
        </div>
      );
    }

    // Default mode - canvas only
    return (
      <div className="flex-1 flex overflow-hidden">
        <Canvas />
      </div>
    );
  };

  return (
    <div className={`h-screen flex flex-col bg-gray-50 overflow-hidden ${state.mode !== 'interactive' && state.mode !== 'challenge' && state.mode !== 'projects' ? 'canvas-mode' : ''
      }`}>
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Tools */}
        <ToolSidebar
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onExport={handleExport}
        />

        {/* Center area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <TopBar />

          {/* Main content */}
          {renderMainContent()}

          {/* Page switcher - only in canvas modes */}
          {state.mode !== 'interactive' && state.mode !== 'challenge' && state.mode !== 'projects' && (
            <PageSwitcher
              pages={state.pages}
              activePageId={state.activePageId}
              onSwitch={switchPage}
              onAdd={addPage}
              onRemove={removePage}
            />
          )}
        </div>

        {/* Right panel - Properties */}
        {state.mode !== 'interactive' && state.mode !== 'challenge' && state.mode !== 'library' && state.mode !== 'projects' && (selectedObjects.length > 0 || state.mode === 'freehand' || state.mode === 'shape' || state.mode === 'text') && (
          <PropertiesPanel />
        )}
      </div>

      {/* Welcome Screen */}
      {showWelcome && <WelcomeScreen onClose={() => setShowWelcome(false)} />}

      {/* Export Modal */}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
    </div>
  );
}

function App() {
  return (
    <EditorProvider>
      <AppContent />
    </EditorProvider>
  );
}

export default App;
