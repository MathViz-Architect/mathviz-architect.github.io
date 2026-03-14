// src/hooks/useCollaborationContext.tsx
import React, { createContext, useContext, useCallback, ReactNode, useMemo, useRef, useEffect } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import { useRoom, RoomState as UseRoomState } from '@/hooks/useRoom';
import { useYjsSync, YjsCanvasState } from '@/hooks/useYjsSync';
import { useAwareness, AwarenessUser } from '@/hooks/useAwareness';
import { useAuth } from '@/hooks/useAuth';
import { BoardSettings, AnyCanvasObject, Page } from '@/lib/types';
import { User } from '@supabase/supabase-js';

interface CollaborationState {
  roomState: UseRoomState;
  user: User | null;
  boardSettings: BoardSettings;
  canEdit: boolean;
  peers: AwarenessUser[];
}

interface CollaborationContextValue extends CollaborationState {
  createRoom: () => Promise<string | null>;
  leaveRoom: () => void;
  closeRoom: () => Promise<void>;
  copyRoomLink: () => string;
  updateBoardSettings: (newSettings: Partial<BoardSettings>) => void;
  publishLocalChange: (state: { objects: AnyCanvasObject[]; pages: Page[]; activePageId: string }) => void;
  updateCursor: (pos: { x: number; y: number } | null) => void;
}

const CollaborationContext = createContext<CollaborationContextValue | null>(null);

function CollaborationStateBridge({ children }: { children: ReactNode }) {
  const editor = useEditorContext();
  const { user } = useAuth();
  const { roomState, createRoom, leaveRoom, closeRoom, copyRoomLink } = useRoom();

  // ─── Refs для актуальных значений без stale closures ───────────────────────
  const roomStateRef = useRef(roomState);
  useEffect(() => { roomStateRef.current = roomState; });

  const boardSettingsRef = useRef<BoardSettings>({ mode: 'view', activeStudentId: null });

  // Callback для входящих remote updates.
  // Вызывается ТОЛЬКО для изменений от peers — loop protection внутри useYjsSync.
  const handleCanvasChange = useCallback(
    (canvasState: YjsCanvasState) => {
      console.log('[collab] remote canvas update received', canvasState.objects.length, 'objects');
      editor.loadRemoteState(canvasState);
    },
    [editor],
  );

  const { boardSettings, updateBoardSettings, publishCanvasChange, getProvider } = useYjsSync(
    roomState.isConnected && roomState.roomId
      ? { roomId: roomState.roomId, role: roomState.role, onCanvasChange: handleCanvasChange }
      : null,
  );

  // Синхронизируем ref с актуальными boardSettings.
  useEffect(() => { boardSettingsRef.current = boardSettings; });

  // Awareness — cursor tracking.
  const awarenessOptions = useMemo(
    () =>
      roomState.isConnected
        ? {
            name: user?.user_metadata?.full_name ?? user?.email ?? 'Участник',
            color: user?.user_metadata?.avatar_color ?? '#3B82F6',
          }
        : null,
    [roomState.isConnected, user],
  );
  const { peers, updateCursor } = useAwareness(getProvider, awarenessOptions);

  // canEdit — вычисляется без замыкания на stale roomState.
  // Читает из refs чтобы всегда иметь актуальные значения.
  const canEdit = useMemo(() => {
    if (!roomState.isConnected || !roomState.roomId) return true;
    const { role } = roomState;
    const { mode, activeStudentId } = boardSettings;
    switch (mode) {
      case 'view':          return role === 'teacher';
      case 'collaboration': return true;
      case 'student_turn':  return role === 'teacher' || user?.id === activeStudentId;
      default:              return false;
    }
  }, [roomState, boardSettings, user]);

  // publishLocalChange читает isConnected из ref — никогда не устаревает.
  // publishCanvasChange стабилен (создан через useCallback с [] deps в useYjsSync).
  const publishLocalChange = useCallback(
    (state: { objects: AnyCanvasObject[]; pages: Page[]; activePageId: string }) => {
      const { isConnected } = roomStateRef.current;
      console.log('[collab] publishLocalChange called, isConnected=', isConnected, 'objects=', state.objects.length);
      if (!isConnected) {
        console.warn('[collab] publishLocalChange skipped — not connected');
        return;
      }
      publishCanvasChange(state);
    },
    // publishCanvasChange стабилен — не вызывает stale closure
    [publishCanvasChange],
  );

  const contextValue: CollaborationContextValue = {
    roomState,
    user,
    boardSettings,
    canEdit,
    peers,
    createRoom,
    leaveRoom,
    closeRoom,
    copyRoomLink,
    updateBoardSettings: updateBoardSettings ?? (() => {}),
    publishLocalChange,
    updateCursor,
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function CollaborationProvider({ children }: { children: ReactNode }) {
  return <CollaborationStateBridge>{children}</CollaborationStateBridge>;
}

export function useCollaborationContext() {
  const ctx = useContext(CollaborationContext);
  if (!ctx) throw new Error('useCollaborationContext must be used within a CollaborationProvider');
  return ctx;
}
