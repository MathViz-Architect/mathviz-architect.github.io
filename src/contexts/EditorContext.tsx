import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useAppState, generateId } from '@/hooks/useAppState';
import { AnyCanvasObject, AppMode, AppState } from '@/lib/types';
import { Template } from '@/lib/templates';

interface SavedProject {
  id: string;
  name: string;
  updatedAt: string;
}

interface EditorContextValue {
  state: AppState;
  selectedObjects: AnyCanvasObject[];
  updateObject: (id: string, updates: Partial<AnyCanvasObject>) => void;
  addObject: (obj: AnyCanvasObject) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null, multi?: boolean) => void;
  selectMultiple: (ids: string[]) => void;
  setMode: (mode: AppMode) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  newProject: () => void;
  loadProject: (project: any, path: string) => void;
  setProjectPath: (path: string) => void;
  setProjectName: (name: string) => void;
  markAsSaved: () => void;
  clearCanvas: () => void;
  zoom: number;
  showGrid: boolean;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  handleToggleGrid: () => void;
  handleAddObject: (obj: AnyCanvasObject) => void;
  handleDeleteObject: (id: string) => void;
  handleSelectTemplate: (template: Template) => void;
  handleToggleVisibility: () => void;
  handleToggleLock: () => void;
  saveProjectToStorage: (name: string) => void;
  getSavedProjects: () => SavedProject[];
  loadProjectFromStorage: (id: string) => void;
  deleteProjectFromStorage: (id: string) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const appState = useAppState();
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 0.1, 2)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 0.1, 0.5)), []);
  const handleZoomReset = useCallback(() => setZoom(1), []);
  const handleToggleGrid = useCallback(() => setShowGrid(g => !g), []);

  const handleAddObject = useCallback((obj: AnyCanvasObject) => {
    appState.addObject(obj);
    appState.saveToHistory();
  }, [appState]);

  const handleDeleteObject = useCallback((id: string) => {
    appState.removeObject(id);
    appState.saveToHistory();
  }, [appState]);

  const handleSelectTemplate = useCallback((template: Template) => {
    template.createObjects().forEach(obj => appState.addObject(obj));
    appState.saveToHistory();
    appState.setMode('select');
  }, [appState]);

  const handleToggleVisibility = useCallback(() => {
    const obj = appState.selectedObjects[0];
    if (obj) appState.updateObject(obj.id, { visible: !obj.visible });
  }, [appState]);

  const handleToggleLock = useCallback(() => {
    const obj = appState.selectedObjects[0];
    if (obj) appState.updateObject(obj.id, { locked: !obj.locked });
  }, [appState]);

  // localStorage functions (web only)
  const saveProjectToStorage = useCallback((name: string) => {
    if (window.electronAPI) return; // Skip in Electron

    const projectId = generateId();
    const project = {
      id: projectId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      objects: appState.state.objects,
      canvasSize: { width: 800, height: 600 },
      backgroundColor: '#FFFFFF',
    };

    // Save project
    localStorage.setItem(`mathviz_project_${projectId}`, JSON.stringify(project));

    // Update index
    const indexKey = 'mathviz_projects_index';
    const indexStr = localStorage.getItem(indexKey);
    const index: SavedProject[] = indexStr ? JSON.parse(indexStr) : [];
    index.push({ id: projectId, name, updatedAt: project.updatedAt });
    localStorage.setItem(indexKey, JSON.stringify(index));
  }, [appState.state.objects]);

  const getSavedProjects = useCallback((): SavedProject[] => {
    if (window.electronAPI) return []; // Skip in Electron

    const indexKey = 'mathviz_projects_index';
    const indexStr = localStorage.getItem(indexKey);
    if (!indexStr) return [];

    try {
      const index: SavedProject[] = JSON.parse(indexStr);
      // Add autosave entry if it exists
      const autosave = localStorage.getItem('mathviz_autosave');
      if (autosave) {
        const autosaveProject = JSON.parse(autosave);
        return [
          { id: 'autosave', name: 'Автосохранение', updatedAt: autosaveProject.updatedAt },
          ...index,
        ];
      }
      return index;
    } catch {
      return [];
    }
  }, []);

  const loadProjectFromStorage = useCallback((id: string) => {
    if (window.electronAPI) return; // Skip in Electron

    try {
      const key = id === 'autosave' ? 'mathviz_autosave' : `mathviz_project_${id}`;
      const projectStr = localStorage.getItem(key);
      if (projectStr) {
        const project = JSON.parse(projectStr);
        appState.loadProject(project, '');
      }
    } catch (e) {
      console.error('Failed to load project from storage:', e);
    }
  }, [appState]);

  const deleteProjectFromStorage = useCallback((id: string) => {
    if (window.electronAPI) return; // Skip in Electron
    if (id === 'autosave') return; // Can't delete autosave

    try {
      // Remove project
      localStorage.removeItem(`mathviz_project_${id}`);

      // Update index
      const indexKey = 'mathviz_projects_index';
      const indexStr = localStorage.getItem(indexKey);
      if (indexStr) {
        const index: SavedProject[] = JSON.parse(indexStr);
        const newIndex = index.filter(p => p.id !== id);
        localStorage.setItem(indexKey, JSON.stringify(newIndex));
      }
    } catch (e) {
      console.error('Failed to delete project from storage:', e);
    }
  }, []);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    if (window.electronAPI) return; // Skip in Electron

    // Clear existing timer
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Set new timer
    autosaveTimerRef.current = setTimeout(() => {
      const project = {
        id: 'autosave',
        name: appState.state.projectName,
        updatedAt: new Date().toISOString(),
        objects: appState.state.objects,
      };
      localStorage.setItem('mathviz_autosave', JSON.stringify(project));
    }, 1000);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [appState.state.objects, appState.state.projectName]);

  // Restore autosave on mount
  useEffect(() => {
    if (window.electronAPI) return; // Skip in Electron

    const saved = localStorage.getItem('mathviz_autosave');
    if (saved) {
      try {
        const project = JSON.parse(saved);
        if (project.objects?.length > 0) {
          appState.loadProject(project, '');
        }
      } catch (e) {
        console.error('Failed to restore autosave:', e);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <EditorContext.Provider value={{
      ...appState,
      zoom,
      showGrid,
      handleZoomIn,
      handleZoomOut,
      handleZoomReset,
      handleToggleGrid,
      handleAddObject,
      handleDeleteObject,
      handleSelectTemplate,
      handleToggleVisibility,
      handleToggleLock,
      saveProjectToStorage,
      getSavedProjects,
      loadProjectFromStorage,
      deleteProjectFromStorage,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditorContext must be used within EditorProvider');
  return ctx;
}

