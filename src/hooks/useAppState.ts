import { useState, useCallback, useEffect } from 'react';
import { AnyCanvasObject, AppMode, AppState, Project } from '@/lib/types';

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
  history: {
    past: [],
    present: [],
    future: [],
  },
};

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);

  // Update object in state
  const updateObject = useCallback((id: string, updates: Partial<AnyCanvasObject>) => {
    setState((prev) => {
      const newObjects = prev.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      );
      return {
        ...prev,
        objects: newObjects,
        isDirty: true,
      };
    });
  }, []);

  // Add object to canvas
  const addObject = useCallback((object: AnyCanvasObject) => {
    setState((prev) => ({
      ...prev,
      objects: [...prev.objects, object],
      selectedObjectIds: [object.id],
      isDirty: true,
    }));
  }, []);

  // Remove object from canvas
  const removeObject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      objects: prev.objects.filter((obj) => obj.id !== id),
      selectedObjectIds: prev.selectedObjectIds.filter((objId) => objId !== id),
      isDirty: true,
    }));
  }, []);

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
    setState((prev) => {
      if (prev.history.past.length === 0) return prev;
      const previous = prev.history.past[prev.history.past.length - 1];
      const newPast = prev.history.past.slice(0, -1);
      return {
        ...prev,
        objects: previous,
        history: {
          past: newPast,
          present: previous,
          future: [prev.history.present, ...prev.history.future],
        },
        isDirty: true,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.history.future.length === 0) return prev;
      const next = prev.history.future[0];
      const newFuture = prev.history.future.slice(1);
      return {
        ...prev,
        objects: next,
        history: {
          past: [...prev.history.past, prev.history.present],
          present: next,
          future: newFuture,
        },
        isDirty: true,
      };
    });
  }, []);

  // Save state to history
  const saveToHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      history: {
        past: [...prev.history.past.slice(-19), prev.history.present],
        present: prev.objects,
        future: [],
      },
    }));
  }, []);

  // New project
  const newProject = useCallback(() => {
    setState({
      ...initialState,
      projectName: 'Новый проект',
      projectPath: null,
    });
  }, []);

  // Load project
  const loadProject = useCallback((project: Project, path: string) => {
    setState({
      ...initialState,
      objects: project.objects,
      projectName: project.name,
      projectPath: path,
      history: {
        past: [],
        present: project.objects,
        future: [],
      },
    });
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
    setState((prev) => {
      // If objects are selected, delete only selected objects
      if (prev.selectedObjectIds.length > 0) {
        return {
          ...prev,
          objects: prev.objects.filter(obj => !prev.selectedObjectIds.includes(obj.id)),
          selectedObjectIds: [],
          isDirty: true,
        };
      }
      // Otherwise, clear entire canvas
      return {
        ...prev,
        objects: [],
        selectedObjectIds: [],
        isDirty: true,
      };
    });
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
    selectObject,
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
    selectMultiple,
  };
}
