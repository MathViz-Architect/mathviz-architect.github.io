import { useState, useCallback, useRef } from 'react';
import { AnyCanvasObject, AppMode, AppState, Project } from '@/lib/types';
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

// Initial state
const initialState: AppState = {
  mode: 'select',
  selectedObjectIds: [],
  objects: [],
  projectPath: null,
  projectName: 'Новый проект',
  isDirty: false,
};

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const historyRef = useRef(new CommandHistory());
  // Keep a ref to always-current objects to avoid stale closures in commands
  const objectsRef = useRef<AnyCanvasObject[]>(initialState.objects);

  // Internal setter for commands — always reads from ref, not closed-over state
  const setObjects = useCallback((objects: AnyCanvasObject[]) => {
    objectsRef.current = objects;
    setState((prev) => ({
      ...prev,
      objects,
      isDirty: true,
    }));
  }, []);

  // Keep objectsRef in sync with state.objects
  const stateRef = useRef(state);
  stateRef.current = state;

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
    setState({
      ...initialState,
      projectName: 'Новый проект',
      projectPath: null,
    });
    historyRef.current.clear();
  }, []);

  // Load project
  const loadProject = useCallback((project: Project, path: string) => {
    setState({
      ...initialState,
      objects: project.objects,
      projectName: project.name,
      projectPath: path,
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
  };
}
