import { useState, useCallback, useRef } from 'react';
import { AnyCanvasObject, AppMode, AppState, Page, Project } from '@/lib/types';
import { CommandHistory } from '@/lib/commandHistory';
import {
  AddObjectCommand,
  DeleteObjectCommand,
  UpdateObjectCommand,
  MoveObjectsCommand,
  BatchCommand,
} from '@/lib/commands';

// Generate unique ID
export const generateId = (): string => {
  return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Deep copy objects array to prevent shared references between pages
const cloneObjects = (objects: AnyCanvasObject[]): AnyCanvasObject[] =>
  JSON.parse(JSON.stringify(objects));

const createPage = (index: number): Page => ({
  id: generateId(),
  title: `Страница ${index}`,
  objects: [],
});

const firstPage = createPage(1);

// Initial state
const initialState: AppState = {
  mode: 'select',
  selectedObjectIds: [],
  objects: [],
  projectPath: null,
  projectName: 'Новый проект',
  isDirty: false,
  pages: [firstPage],
  activePageId: firstPage.id,
};

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const historyRef = useRef(new CommandHistory());
  const objectsRef = useRef<AnyCanvasObject[]>(initialState.objects);
  // Refs for page state — always current, no stale closures
  const pagesRef = useRef<Page[]>(initialState.pages);
  const activePageIdRef = useRef<string>(initialState.activePageId);
  const pageCounterRef = useRef(1);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Internal setter for commands — reads from refs, never stale
  const setObjects = useCallback((objects: AnyCanvasObject[]) => {
    objectsRef.current = objects;
    const pageId = activePageIdRef.current;
    const updatedPages = pagesRef.current.map(p =>
      p.id === pageId ? { ...p, objects } : p
    );
    pagesRef.current = updatedPages;
    setState((prev) => ({
      ...prev,
      objects,
      isDirty: true,
      pages: updatedPages,
    }));
  }, []);

  // Update object in state (for final changes only - end of drag, resize, text edit)
  const updateObject = useCallback((id: string, updates: Partial<AnyCanvasObject>) => {
    const command = new UpdateObjectCommand(objectsRef.current, id, updates, setObjects);
    historyRef.current.execute(command);
  }, [setObjects]);

  // Add object to canvas
  const addObject = useCallback((object: AnyCanvasObject) => {
    const command = new AddObjectCommand(objectsRef.current, object, setObjects);
    historyRef.current.execute(command);
    setState((prev) => ({
      ...prev,
      selectedObjectIds: [object.id],
    }));
  }, [setObjects]);

  // Remove object from canvas
  const removeObject = useCallback((id: string) => {
    const command = new DeleteObjectCommand(objectsRef.current, id, setObjects);
    historyRef.current.execute(command);
    setState((prev) => ({
      ...prev,
      selectedObjectIds: prev.selectedObjectIds.filter((objId) => objId !== id),
    }));
  }, [setObjects]);

  // Move objects (for drag completion)
  const moveObjects = useCallback((previousObjects: AnyCanvasObject[], nextObjects: AnyCanvasObject[]) => {
    const command = new MoveObjectsCommand(previousObjects, nextObjects, setObjects);
    historyRef.current.execute(command);
  }, [setObjects]);

  // Select object
  const selectObject = useCallback((id: string | null, multi: boolean = false) => {
    setState((prev) => {
      if (id === null) {
        return { ...prev, selectedObjectIds: [] };
      }
      if (multi) {
        const isSelected = prev.selectedObjectIds.includes(id);
        return {
          ...prev,
          selectedObjectIds: isSelected
            ? prev.selectedObjectIds.filter((objId) => objId !== id)
            : [...prev.selectedObjectIds, id],
        };
      }
      return { ...prev, selectedObjectIds: [id] };
    });
  }, []);

  // Select multiple objects at once (for marquee selection)
  const selectMultiple = useCallback((ids: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedObjectIds: ids,
    }));
  }, []);

  // Set app mode
  const setMode = useCallback((mode: AppMode) => {
    setState((prev) => ({ ...prev, mode, selectedObjectIds: [] }));
  }, []);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyRef.current.undo()) {
      setState((prev) => ({ ...prev, isDirty: true }));
    }
  }, []);

  const redo = useCallback(() => {
    if (historyRef.current.redo()) {
      setState((prev) => ({ ...prev, isDirty: true }));
    }
  }, []);

  const canUndo = useCallback(() => {
    return historyRef.current.canUndo();
  }, []);

  const canRedo = useCallback(() => {
    return historyRef.current.canRedo();
  }, []);

  // New project
  const newProject = useCallback(() => {
    pageCounterRef.current = 1;
    const page = createPage(1);
    objectsRef.current = [];
    pagesRef.current = [page];
    activePageIdRef.current = page.id;
    setState({
      ...initialState,
      projectName: 'Новый проект',
      projectPath: null,
      pages: [page],
      activePageId: page.id,
      objects: [],
    });
    historyRef.current.clear();
  }, []);

  // Load project
  const loadProject = useCallback((project: Project, path: string) => {
    // Support both old format (objects only) and new format (pages)
    let pages: Page[];
    let activePageId: string;

    if (project.pages && project.pages.length > 0) {
      pages = project.pages;
      activePageId = project.activePageId ?? pages[0].id;
    } else {
      const page = { ...createPage(1), objects: project.objects ?? [] };
      pages = [page];
      activePageId = page.id;
    }

    const activeObjects = cloneObjects(pages.find(p => p.id === activePageId)?.objects ?? []);
    objectsRef.current = activeObjects;
    pagesRef.current = pages;
    activePageIdRef.current = activePageId;
    pageCounterRef.current = pages.length;

    setState({
      ...initialState,
      objects: activeObjects,
      projectName: project.name,
      projectPath: path,
      pages,
      activePageId,
    });
    historyRef.current.clear();
  }, []);

  // Set project path
  const setProjectPath = useCallback((path: string) => {
    setState((prev) => ({ ...prev, projectPath: path }));
  }, []);

  // Set project name
  const setProjectName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, projectName: name, isDirty: true }));
  }, []);

  // Mark as saved
  const markAsSaved = useCallback(() => {
    setState((prev) => ({ ...prev, isDirty: false }));
  }, []);

  // Clear canvas or delete selected objects
  const clearCanvas = useCallback(() => {
    const currentObjects = objectsRef.current;
    const currentSelectedIds = stateRef.current.selectedObjectIds;
    // If objects are selected, delete only selected objects
    if (currentSelectedIds.length > 0) {
      const commands = currentSelectedIds.map(
        id => new DeleteObjectCommand(currentObjects, id, setObjects)
      );
      const batchCommand = new BatchCommand(commands, 'Удалить выбранные объекты');
      historyRef.current.execute(batchCommand);
      setState((prev) => ({
        ...prev,
        selectedObjectIds: [],
      }));
    } else {
      // Otherwise, clear entire canvas
      const commands = currentObjects.map(
        obj => new DeleteObjectCommand(currentObjects, obj.id, setObjects)
      );
      const batchCommand = new BatchCommand(commands, 'Очистить холст');
      historyRef.current.execute(batchCommand);
    }
  }, [setObjects]);

  // Page management
  const addPage = useCallback(() => {
    // Save current objects to current page first
    const savedPages = pagesRef.current.map(p =>
      p.id === activePageIdRef.current ? { ...p, objects: cloneObjects(objectsRef.current) } : p
    );
    pageCounterRef.current += 1;
    const newPage = createPage(pageCounterRef.current);
    const updatedPages = [...savedPages, newPage];

    objectsRef.current = [];
    pagesRef.current = updatedPages;
    activePageIdRef.current = newPage.id;

    setState(prev => ({
      ...prev,
      pages: updatedPages,
      activePageId: newPage.id,
      objects: [],
      selectedObjectIds: [],
      isDirty: true,
    }));
    historyRef.current.clear();
  }, []);

  const removePage = useCallback((pageId: string) => {
    if (pagesRef.current.length <= 1) return;
    const newPages = pagesRef.current.filter(p => p.id !== pageId);
    const newActiveId = pageId === activePageIdRef.current
      ? newPages[newPages.length - 1].id
      : activePageIdRef.current;
    const newObjects = cloneObjects(newPages.find(p => p.id === newActiveId)?.objects ?? []);

    objectsRef.current = newObjects;
    pagesRef.current = newPages;
    activePageIdRef.current = newActiveId;

    setState(prev => ({
      ...prev,
      pages: newPages,
      activePageId: newActiveId,
      objects: newObjects,
      selectedObjectIds: [],
      isDirty: true,
    }));
    historyRef.current.clear();
  }, []);

  const switchPage = useCallback((pageId: string) => {
    if (pageId === activePageIdRef.current) return;

    // Save current objects to current page using refs (no stale state)
    const savedPages = pagesRef.current.map(p =>
      p.id === activePageIdRef.current ? { ...p, objects: cloneObjects(objectsRef.current) } : p
    );
    const newObjects = cloneObjects(savedPages.find(p => p.id === pageId)?.objects ?? []);

    objectsRef.current = newObjects;
    pagesRef.current = savedPages;
    activePageIdRef.current = pageId;

    setState(prev => ({
      ...prev,
      pages: savedPages,
      activePageId: pageId,
      objects: newObjects,
      selectedObjectIds: [],
    }));
    historyRef.current.clear();
  }, []);

  // Get selected objects
  const selectedObjects = state.objects.filter((obj) =>
    state.selectedObjectIds.includes(obj.id)
  );

  return {
    state,
    selectedObjects,
    updateObject,
    addObject,
    removeObject,
    moveObjects,
    selectObject,
    setMode,
    undo,
    redo,
    canUndo,
    canRedo,
    newProject,
    loadProject,
    setProjectPath,
    setProjectName,
    markAsSaved,
    clearCanvas,
    selectMultiple,
    addPage,
    removePage,
    switchPage,
  };
}
