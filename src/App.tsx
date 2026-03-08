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
import { useAppState, generateId } from './hooks/useAppState';
import { AnyCanvasObject, Project } from './lib/types';
import { Template } from './lib/templates';
import './types/electron.d.ts';

function App() {
  const {
    state,
    selectedObjects,
    updateObject,
    addObject,
    removeObject,
    selectObject,
    selectMultiple,
    setMode,
    undo,
    redo,
    saveToHistory,
    newProject,
    loadProject,
    setProjectPath,
    setProjectName,
    markAsSaved,
    clearCanvas,
  } = useAppState();

  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('welcomeScreenShown');
  });

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
        clearCanvas();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjects, clearCanvas, undo, redo]);

  // Handle template selection
  const handleSelectTemplate = useCallback((template: Template) => {
    const objects = template.createObjects();
    objects.forEach((obj) => addObject(obj));
    saveToHistory();
    // Switch to select mode after adding template
    setMode('select');
  }, [addObject, saveToHistory, setMode]);

  // File operations
  const handleNew = useCallback(() => {
    newProject();
  }, [newProject]);

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
        canvasSize: { width: 800, height: 600 },
        backgroundColor: '#FFFFFF',
      };

      const result = await window.electronAPI.writeFile(filePath, JSON.stringify(project, null, 2));
      if (result.success) {
        setProjectPath(filePath);
        markAsSaved();
      }
    }
  }, [state, setProjectPath, markAsSaved]);

  const handleExport = useCallback(async () => {
    // Export functionality will be implemented later
    console.log('Export clicked');
  }, []);

  // View controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1);
  const handleToggleGrid = () => setShowGrid((g) => !g);

  // Object controls
  const handleToggleVisibility = () => {
    if (selectedObjects.length > 0) {
      const obj = selectedObjects[0];
      updateObject(obj.id, { visible: !obj.visible });
    }
  };

  const handleToggleLock = () => {
    if (selectedObjects.length > 0) {
      const obj = selectedObjects[0];
      updateObject(obj.id, { locked: !obj.locked });
    }
  };

  const handleDeleteObject = (id: string) => {
    removeObject(id);
    saveToHistory();
  };

  // Add new object
  const handleAddObject = (obj: AnyCanvasObject) => {
    addObject(obj);
    saveToHistory();
  };

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
        <div className="flex-1 bg-gray-100">
          <InteractiveLibrary />
        </div>
      );
    }

    // Challenge mode - math challenges
    if (state.mode === 'challenge') {
      return (
        <div className="flex-1 bg-gray-100">
          <ChallengeMode />
        </div>
      );
    }

    // Library mode - templates
    if (state.mode === 'library') {
      return (
        <div className="flex-1 flex">
          <Canvas
            objects={state.objects}
            selectedObjectIds={state.selectedObjectIds}
            zoom={zoom}
            showGrid={showGrid}
            onSelectObject={selectObject}
            onSelectMultiple={selectMultiple}
            onUpdateObject={updateObject}
            onAddObject={handleAddObject}
            onDeleteObject={handleDeleteObject}
            mode={state.mode}
          />
          <TemplateLibrary onSelectTemplate={handleSelectTemplate} />
        </div>
      );
    }

    // Default mode - canvas with object creator
    return (
      <div className="flex-1 flex">
        <Canvas
          objects={state.objects}
          selectedObjectIds={state.selectedObjectIds}
          zoom={zoom}
          showGrid={showGrid}
          onSelectObject={selectObject}
          onSelectMultiple={selectMultiple}
          onUpdateObject={updateObject}
          onAddObject={handleAddObject}
          onDeleteObject={handleDeleteObject}
          mode={state.mode}
        />
        <ObjectCreator mode={state.mode} onAddObject={handleAddObject} />
      </div>
    );
  };

  return (
    <div className={`h-screen flex flex-col bg-gray-50 overflow-x-hidden ${state.mode !== 'interactive' && state.mode !== 'challenge' ? 'canvas-mode' : ''
      }`}>
      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Left sidebar - Tools */}
        <ToolSidebar
          mode={state.mode}
          onModeChange={setMode}
          onUndo={undo}
          onRedo={redo}
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onExport={handleExport}
          onClear={clearCanvas}
          canUndo={state.history.past.length > 0}
          canRedo={state.history.future.length > 0}
          isDirty={state.isDirty}
          hasSelection={selectedObjects.length > 0}
        />

        {/* Center area */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <TopBar
            projectName={state.projectName}
            zoom={zoom}
            showGrid={showGrid}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onToggleGrid={handleToggleGrid}
            selectedObjects={selectedObjects}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
          />

          {/* Main content */}
          {renderMainContent()}
        </div>

        {/* Right panel - Properties (hidden in interactive mode) */}
        {state.mode !== 'interactive' && (
          <PropertiesPanel
            selectedObjects={selectedObjects}
            onUpdateObject={updateObject}
            onDeleteObject={handleDeleteObject}
            onSaveToHistory={saveToHistory}
          />
        )}
      </div>

      {/* Welcome Screen */}
      {showWelcome && <WelcomeScreen onClose={() => setShowWelcome(false)} />}
    </div>
  );
}

export default App;
