// src/contexts/EditorContext.tsx
//
// Изменения относительно предыдущей версии:
//   • loadRemoteState использует appState.setCanvasState() — не loadProject().
//     setCanvasState обновляет только objects/pages/activePageId,
//     не трогает mode, zoom, CommandHistory, projectName и т.д.
//   • Всё остальное без изменений.

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useAppState, generateId } from '@/hooks/useAppState';
import { AnyCanvasObject, AppMode, AppState, Page } from '@/lib/types';
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
  updateObjectDirect: (id: string, updates: Partial<AnyCanvasObject>) => void;
  executeCommand: (command: import('@/lib/commands').Command) => void;
  setObjectsFn: () => (objects: AnyCanvasObject[]) => void;
  addObject: (obj: AnyCanvasObject) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null, multi?: boolean) => void;
  selectMultiple: (ids: string[]) => void;
  setMode: (mode: AppMode) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  newProject: () => void;
  loadProject: (project: any, path: string) => void;
  setProjectPath: (path: string) => void;
  setProjectName: (name: string) => void;
  markAsSaved: () => void;
  clearCanvas: () => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  showGrid: boolean;
  gridWeight: 'thin' | 'bold';
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  handleToggleGrid: () => void;
  handleToggleGridWeight: () => void;
  handleAddObject: (obj: AnyCanvasObject) => void;
  handleDeleteObject: (id: string) => void;
  handleSelectTemplate: (template: Template) => void;
  handleToggleVisibility: () => void;
  handleToggleLock: () => void;
  saveProjectToStorage: (name: string) => void;
  getSavedProjects: () => SavedProject[];
  loadProjectFromStorage: (id: string) => void;
  deleteProjectFromStorage: (id: string) => void;
  moveObjects: (previousObjects: AnyCanvasObject[], nextObjects: AnyCanvasObject[]) => void;
  addPage: () => void;
  removePage: (pageId: string) => void;
  switchPage: (pageId: string) => void;
  setActivePageId: (pageId: string) => void;
  interactiveModuleId: string | null;
  setInteractiveModuleId: (moduleId: string | null) => void;
  penSettings: { width: number; color: string };
  setPenSettings: (settings: Partial<{ width: number; color: string }>) => void;
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'geoshape-circle' | 'geoshape-triangle' | 'geoshape-quad';
  setShapeType: (type: 'rectangle' | 'circle' | 'triangle' | 'geoshape-circle' | 'geoshape-triangle' | 'geoshape-quad') => void;
  /**
   * Применяет состояние холста от удалённого участника (Yjs).
   * Обновляет только objects/pages/activePageId.
   * Не пишет в CommandHistory, не меняет mode/zoom/selection.
   */
  loadRemoteState: (remoteState: { objects: AnyCanvasObject[]; pages: Page[]; activePageId: string }) => void;
  /**
   * Возвращает АКТУАЛЬНЫЙ snapshot холста напрямую из refs.
   * Вызывать сразу после действия пользователя для публикации в Yjs —
   * не ждёт следующего рендера React, никогда не устаревает.
   */
  getCanvasSnapshot: () => { objects: AnyCanvasObject[]; pages: Page[]; activePageId: string };
  copyToClipboard: () => void;
  pasteFromClipboard: () => void;
  selectAll: () => void;
  duplicateSelected: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const appState = useAppState();
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [gridWeight, setGridWeight] = useState<'thin' | 'bold'>('thin');
  const [interactiveModuleId, setInteractiveModuleId] = useState<string | null>(null);
  const [penSettings, setPenSettingsState] = useState<{ width: number; color: string }>({ width: 3, color: '#374151' });
  const [shapeType, setShapeType] = useState<'rectangle' | 'circle' | 'triangle' | 'geoshape-circle' | 'geoshape-triangle' | 'geoshape-quad'>('rectangle');
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPenSettings = useCallback((settings: Partial<{ width: number; color: string }>) => {
    setPenSettingsState(prev => ({ ...prev, ...settings }));
  }, []);

  const MIN_ZOOM = 0.3;
  const MAX_ZOOM = 2.0;

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 0.1, MAX_ZOOM)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 0.1, MIN_ZOOM)), []);
  const handleZoomReset = useCallback(() => setZoom(1), []);
  const handleToggleGrid = useCallback(() => setShowGrid(g => !g), []);
  const handleToggleGridWeight = useCallback(() => setGridWeight(w => w === 'thin' ? 'bold' : 'thin'), []);

  const handleAddObject = useCallback((obj: AnyCanvasObject) => {
    appState.addObject(obj);
  }, [appState]);

  const handleDeleteObject = useCallback((id: string) => {
    appState.removeObject(id);
  }, [appState]);

  const handleSelectTemplate = useCallback((template: Template) => {
    template.createObjects().forEach(obj => appState.addObject(obj));
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

  // ─── localStorage persistence (web only) ────────────────────────────────────

  const saveProjectToStorage = useCallback((name: string) => {
    if (window.electronAPI) return;
    const projectId = generateId();
    const project = {
      id: projectId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      objects: appState.state.objects,
      pages: appState.state.pages,
      activePageId: appState.state.activePageId,
      canvasSize: { width: 800, height: 600 },
      backgroundColor: '#FFFFFF',
    };
    localStorage.setItem(`mathviz_project_${projectId}`, JSON.stringify(project));
    const indexKey = 'mathviz_projects_index';
    const indexStr = localStorage.getItem(indexKey);
    const index: SavedProject[] = indexStr ? JSON.parse(indexStr) : [];
    index.push({ id: projectId, name, updatedAt: project.updatedAt });
    localStorage.setItem(indexKey, JSON.stringify(index));
  }, [appState.state.objects, appState.state.pages, appState.state.activePageId]);

  const getSavedProjects = useCallback((): SavedProject[] => {
    if (window.electronAPI) return [];
    const indexStr = localStorage.getItem('mathviz_projects_index');
    if (!indexStr) return [];
    try {
      const index: SavedProject[] = JSON.parse(indexStr);
      const autosave = localStorage.getItem('mathviz_autosave');
      if (autosave) {
        const autosaveProject = JSON.parse(autosave);
        return [{ id: 'autosave', name: 'Автосохранение', updatedAt: autosaveProject.updatedAt }, ...index];
      }
      return index;
    } catch { return []; }
  }, []);

  const loadProjectFromStorage = useCallback((id: string) => {
    if (window.electronAPI) return;
    try {
      const key = id === 'autosave' ? 'mathviz_autosave' : `mathviz_project_${id}`;
      const projectStr = localStorage.getItem(key);
      if (projectStr) appState.loadProject(JSON.parse(projectStr), '');
    } catch (e) { console.error('Failed to load project from storage:', e); }
  }, [appState]);

  const deleteProjectFromStorage = useCallback((id: string) => {
    if (window.electronAPI) return;
    if (id === 'autosave') return;
    try {
      localStorage.removeItem(`mathviz_project_${id}`);
      const indexStr = localStorage.getItem('mathviz_projects_index');
      if (indexStr) {
        const index: SavedProject[] = JSON.parse(indexStr);
        localStorage.setItem('mathviz_projects_index', JSON.stringify(index.filter(p => p.id !== id)));
      }
    } catch (e) { console.error('Failed to delete project from storage:', e); }
  }, []);

  // ─── Remote state application ────────────────────────────────────────────────
  // Uses setCanvasState — a surgical update that only touches objects/pages/activePageId.
  // Does NOT reset mode, zoom, CommandHistory, projectName, isDirty, or selection
  // (selection is filtered to remove deleted objects, but not cleared entirely).
  const loadRemoteState = useCallback((remoteState: {
    objects: AnyCanvasObject[];
    pages: Page[];
    activePageId: string;
  }) => {
    appState.setCanvasState(remoteState);
  }, [appState]);

  // ─── Autosave (debounced, web only) ─────────────────────────────────────────
  useEffect(() => {
    if (window.electronAPI) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      const project = {
        id: 'autosave',
        name: appState.state.projectName,
        updatedAt: new Date().toISOString(),
        objects: appState.state.objects,
        pages: appState.state.pages,
        activePageId: appState.state.activePageId,
      };
      localStorage.setItem('mathviz_autosave', JSON.stringify(project));
    }, 1000);
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  }, [appState.state.objects, appState.state.pages, appState.state.projectName]);

  // ─── Restore autosave on mount (web only) ───────────────────────────────────
  useEffect(() => {
    if (window.electronAPI) return;
    const saved = localStorage.getItem('mathviz_autosave');
    if (saved) {
      try {
        const project = JSON.parse(saved);
        if (project.objects?.length > 0) appState.loadProject(project, '');
      } catch (e) { console.error('Failed to restore autosave:', e); }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <EditorContext.Provider value={{
      ...appState,
      zoom,
      setZoom,
      showGrid,
      gridWeight,
      handleZoomIn,
      handleZoomOut,
      handleZoomReset,
      handleToggleGrid,
      handleToggleGridWeight,
      handleAddObject,
      handleDeleteObject,
      handleSelectTemplate,
      handleToggleVisibility,
      handleToggleLock,
      saveProjectToStorage,
      getSavedProjects,
      loadProjectFromStorage,
      deleteProjectFromStorage,
      interactiveModuleId,
      setInteractiveModuleId,
      penSettings,
      setPenSettings,
      shapeType,
      setShapeType,
      loadRemoteState,
      setActivePageId: appState.setActivePageId,
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
