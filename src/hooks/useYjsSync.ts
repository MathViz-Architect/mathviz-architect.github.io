// src/hooks/useYjsSync.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import * as Y from 'yjs';
import { supabase } from '@/lib/supabase';
import { SupabaseProvider } from '@/lib/sync/SupabaseProvider';
import { AnyCanvasObject, Page, BoardSettings, BoardMode, UserRole } from '@/lib/types';

export interface YjsCanvasState {
  objects: AnyCanvasObject[];
  pages: Page[];
  activePageId: string;
}

interface UseYjsSyncOptions {
  roomId: string;
  role: UserRole;
  onCanvasChange: (canvasState: YjsCanvasState) => void;
  onActivePageIdChange?: (pageId: string) => void;
}

// Any transaction tagged with this origin was authored locally.
// Observers must skip it to prevent echo loops.
const YJS_LOCAL_UPDATE_ORIGIN = 'mathviz-local';

// Throttle: max one call per `ms` milliseconds, with a trailing flush.
function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let lastCall = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    const remaining = ms - (Date.now() - lastCall);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      lastCall = Date.now();
      fn(...args);
    } else {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  }) as T;
}

// Read current canvas state from a Y.Map.
function readCanvasState(yCanvas: Y.Map<unknown>): YjsCanvasState {
  return {
    objects: (yCanvas.get('objects') as AnyCanvasObject[]) ?? [],
    pages: (yCanvas.get('pages') as Page[]) ?? [],
    activePageId: (yCanvas.get('activePageId') as string) ?? '',
  };
}

// Read current board settings from a Y.Map.
function readBoardSettings(yBoardSettings: Y.Map<unknown>): BoardSettings {
  return {
    mode: (yBoardSettings.get('mode') as BoardMode) ?? 'view',
    activeStudentId: (yBoardSettings.get('activeStudentId') as string | null) ?? null,
  };
}

export function useYjsSync(options: UseYjsSyncOptions | null) {
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<SupabaseProvider | null>(null);
  const yCanvasRef = useRef<Y.Map<unknown> | null>(null);
  const yBoardSettingsRef = useRef<Y.Map<unknown> | null>(null);

  // Always-current callback — no stale closure risk.
  const onCanvasChangeRef = useRef(options?.onCanvasChange);
  useEffect(() => { onCanvasChangeRef.current = options?.onCanvasChange; });

  const onActivePageIdChangeRef = useRef(options?.onActivePageIdChange);
  useEffect(() => { onActivePageIdChangeRef.current = options?.onActivePageIdChange; });

  // TRUE while WE are writing into Y.Doc so our observer skips the echo.
  const isApplyingLocalUpdateRef = useRef(false);

  const [boardSettings, setBoardSettings] = useState<BoardSettings>({
    mode: 'view',
    activeStudentId: null,
  });

  // ─── Setup / teardown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!options?.roomId) return;

    const doc = new Y.Doc();
    docRef.current = doc;

    const yCanvas = doc.getMap<unknown>('canvas');
    yCanvasRef.current = yCanvas;

    const yBoardSettings = doc.getMap<unknown>('board_settings');
    yBoardSettingsRef.current = yBoardSettings;

    // Teacher seeds board_settings defaults on a fresh doc.
    // We do NOT seed for student — they receive the real state via sync-response.
    if (options.role === 'teacher' && yBoardSettings.size === 0) {
      isApplyingLocalUpdateRef.current = true;
      doc.transact(() => {
        yBoardSettings.set('mode', 'view');
        yBoardSettings.set('activeStudentId', null);
      }, YJS_LOCAL_UPDATE_ORIGIN);
      isApplyingLocalUpdateRef.current = false;
      setBoardSettings({ mode: 'view', activeStudentId: null });
    }

    // Canvas observer — fires for REMOTE changes only.
    const canvasObserver = (_events: Y.YEvent<any>[], transaction: Y.Transaction) => {
      console.log('[yjs] canvasObserver fired, origin=', transaction.origin, 'isApplyingLocal=', isApplyingLocalUpdateRef.current);
      if (
        isApplyingLocalUpdateRef.current ||
        transaction.origin === YJS_LOCAL_UPDATE_ORIGIN
      ) {
        console.log('[yjs] canvasObserver skipped (local)');
        return;
      }
      const state = readCanvasState(yCanvas);
      console.log('[yjs] canvasObserver delivering to editor:', state.objects.length, 'objects');
      onCanvasChangeRef.current?.(state);
    };

    // BoardSettings observer — fires for REMOTE changes only.
    const boardSettingsObserver = (_event: Y.YMapEvent<unknown>, transaction: Y.Transaction) => {
      console.log('[yjs] boardSettingsObserver fired, origin=', transaction.origin);
      if (transaction.origin === YJS_LOCAL_UPDATE_ORIGIN) return;
      setBoardSettings(readBoardSettings(yBoardSettings));
    };

    // ActivePageId observer — fires for REMOTE changes only (page switches).
    const activePageIdObserver = (_event: Y.YMapEvent<unknown>, transaction: Y.Transaction) => {
      if (transaction.origin === YJS_LOCAL_UPDATE_ORIGIN) return;
      const newPageId = yCanvas.get('activePageId') as string;
      if (newPageId && newPageId !== lastSyncedPageId) {
        console.log('[yjs] activePageId changed to:', newPageId);
        lastSyncedPageId = newPageId;
        onActivePageIdChangeRef.current?.(newPageId);
      }
    };
    let lastSyncedPageId = '';

    yCanvas.observeDeep(canvasObserver);
    yCanvas.observe(activePageIdObserver);
    yBoardSettings.observe(boardSettingsObserver);

    // Provider is created AFTER observers are registered so we don't miss
    // the sync-response that arrives shortly after SUBSCRIBED fires.
    const provider = new SupabaseProvider(doc, supabase, options.roomId, () => {
      // Called by provider after sync-response is applied —
      // this is the correct moment to bootstrap editor state.
      const canvas = readCanvasState(yCanvas);
      if (canvas.objects.length > 0 || canvas.pages.length > 0) {
        onCanvasChangeRef.current?.(canvas);
      }
      // Always sync boardSettings after receiving peer state —
      // ensures student gets the real mode (not the 'view' default).
      setBoardSettings(readBoardSettings(yBoardSettings));
    });
    providerRef.current = provider;

    return () => {
      yCanvas.unobserveDeep(canvasObserver);
      yCanvas.unobserve(activePageIdObserver);
      yBoardSettings.unobserve(boardSettingsObserver);
      provider.destroy();
      doc.destroy();
      docRef.current = null;
      yCanvasRef.current = null;
      yBoardSettingsRef.current = null;
      providerRef.current = null;
    };
  }, [options?.roomId, options?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Publish canvas (throttled ~1 frame, loop-safe) ────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const publishCanvasChange = useCallback(
    throttle((state: YjsCanvasState) => {
      const yCanvas = yCanvasRef.current;
      if (!yCanvas) {
        console.warn('[yjs] publishCanvasChange: yCanvas is null, skipping');
        return;
      }
      console.log('[yjs] publishCanvasChange writing', state.objects.length, 'objects to Y.Doc');
      isApplyingLocalUpdateRef.current = true;
      yCanvas.doc!.transact(() => {
        yCanvas.set('objects', state.objects);
        yCanvas.set('pages', state.pages);
        yCanvas.set('activePageId', state.activePageId);
      }, YJS_LOCAL_UPDATE_ORIGIN);
      isApplyingLocalUpdateRef.current = false;
    }, 16),
    [],
  );

  // ─── Board settings (teacher only) ─────────────────────────────────────────
  const updateBoardSettings = useCallback((newSettings: Partial<BoardSettings>) => {
    const yBoardSettings = yBoardSettingsRef.current;
    if (options?.role !== 'teacher' || !yBoardSettings) return;

    // Optimistic update — UI doesn't wait for observer round-trip.
    setBoardSettings(prev => ({ ...prev, ...newSettings }));

    isApplyingLocalUpdateRef.current = true;
    yBoardSettings.doc!.transact(() => {
      if (newSettings.mode !== undefined) yBoardSettings.set('mode', newSettings.mode);
      if (newSettings.activeStudentId !== undefined) {
        yBoardSettings.set('activeStudentId', newSettings.activeStudentId ?? null);
      }
    }, YJS_LOCAL_UPDATE_ORIGIN);
    isApplyingLocalUpdateRef.current = false;
  }, [options?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  // Shared with useAwareness so they can use the same provider.
  const getProvider = useCallback(() => providerRef.current, []);

  return { boardSettings, updateBoardSettings, publishCanvasChange, getProvider };
}
