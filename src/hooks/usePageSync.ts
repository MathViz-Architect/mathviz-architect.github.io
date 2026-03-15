import { useEffect, useRef, useCallback } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import { BoardSettings } from '@/lib/types';

interface UsePageSyncOptions {
  boardSettings: BoardSettings;
  role: 'teacher' | 'student';
}

export function usePageSync({ boardSettings, role }: UsePageSyncOptions) {
  const { state, setActivePageId } = useEditorContext();
  const lastSyncedPageRef = useRef<string | null>(null);
  const isLocalChangeRef = useRef(false);

  const trackLocalChange = useCallback((pageId: string) => {
    lastSyncedPageRef.current = pageId;
    isLocalChangeRef.current = true;
    
    setTimeout(() => {
      isLocalChangeRef.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    if (role !== 'student') {
      return;
    }

    const shouldFollow = boardSettings.mode === 'view';
    if (!shouldFollow) {
      return;
    }

    const currentPageId = state.activePageId;
    
    if (currentPageId && currentPageId !== lastSyncedPageRef.current && !isLocalChangeRef.current) {
      console.log('[PageSync] Following teacher to page:', currentPageId);
      lastSyncedPageRef.current = currentPageId;
      // Force update outside Yjs transaction to ensure React re-renders
      requestAnimationFrame(() => {
        setTimeout(() => {
          console.log('[PageSync] Force updating React state for page:', currentPageId);
          setActivePageId(currentPageId);
        }, 0);
      });
    }
  }, [state.activePageId, boardSettings.mode, role, setActivePageId]);

  useEffect(() => {
    lastSyncedPageRef.current = state.activePageId;
  }, [state.activePageId]);

  return { trackLocalChange };
}
