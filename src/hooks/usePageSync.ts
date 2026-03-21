import { useEffect, useRef, useCallback } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import { BoardSettings } from '@/lib/types';

interface UsePageSyncOptions {
  boardSettings: BoardSettings;
  role: 'teacher' | 'student' | null;
  /** The page ID the teacher is currently on (from Yjs). */
  teacherPageId?: string;
}

export function usePageSync({ boardSettings, role, teacherPageId }: UsePageSyncOptions) {
  const { state, setActivePageId } = useEditorContext();
  const appliedPageRef = useRef<string | null>(null);

  useEffect(() => {
    if (role !== 'student') return;
    if (boardSettings.mode !== 'view') return;
    if (!teacherPageId) return;

    // Only act when the teacher is on a different page than the student,
    // and we haven't already applied this exact page switch.
    const currentPageId = state.activePageId;
    if (teacherPageId !== currentPageId && teacherPageId !== appliedPageRef.current) {
      console.log('[PageSync] Following teacher to page:', teacherPageId);
      appliedPageRef.current = teacherPageId;
      setActivePageId(teacherPageId);
    }
  }, [teacherPageId, state.activePageId, boardSettings.mode, role, setActivePageId]);

  // trackLocalChange lets callers signal that a page change was initiated locally
  // so we don't echo it back.
  const trackLocalChange = useCallback((pageId: string) => {
    appliedPageRef.current = pageId;
  }, []);

  return { trackLocalChange };
}
