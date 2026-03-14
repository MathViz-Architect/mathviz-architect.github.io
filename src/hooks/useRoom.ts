// src/hooks/useRoom.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/types';
import { useAuth } from './useAuth';

export interface RoomParticipant {
  id: string;
  name: string;
  color: string;
}

export interface RoomState {
  roomId: string | null;
  role: UserRole;
  isConnected: boolean;
  participants: RoomParticipant[];
  error: string | null;
}

function generateRoomId(): string {
  const segment = () => Math.random().toString(36).substring(2, 6);
  return `${segment()}-${segment()}-${segment()}`;
}

export function useRoom() {
  const { user, ensureAnonAuth } = useAuth();
  const [roomState, setRoomState] = useState<RoomState>({
    roomId: null,
    role: 'student',
    isConnected: false,
    participants: [],
    error: null,
  });

  useEffect(() => {
    const init = async () => {
      await ensureAnonAuth();
      const params = new URLSearchParams(window.location.search);
      const roomId = params.get('room');
      if (roomId) {
        joinRoom(roomId);
      }
    };
    init();
  }, [ensureAnonAuth]); // eslint-disable-line react-hooks/exhaustive-deps

  const createRoom = useCallback(async (): Promise<string | null> => {
    const userId = await ensureAnonAuth();
    if (!userId) {
      setRoomState((prev) => ({ ...prev, error: 'Не удалось создать анонимную сессию' }));
      return null;
    }

    const roomId = generateRoomId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('rooms').insert({
      id: roomId,
      owner_id: userId,
      canvas_data: { objects: [], pages: [] },
      is_active: true,
      expires_at: expiresAt,
    });

    if (error) {
      console.error('[useRoom] Ошибка создания комнаты:', error);
      setRoomState((prev) => ({ ...prev, error: 'Не удалось создать комнату' }));
      return null;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.pushState({}, '', url.toString());

    setRoomState((prev) => ({
      ...prev,
      roomId,
      role: 'teacher',
      isConnected: true,
      error: null,
    }));

    return roomId;
  }, [ensureAnonAuth]);

  const joinRoom = useCallback(
    async (roomId: string): Promise<boolean> => {
      const userId = await ensureAnonAuth();
      if (!userId) {
          setRoomState(prev => ({ ...prev, error: 'Требуется анонимная сессия для входа' }));
          return false;
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('id, owner_id, is_active, expires_at')
        .eq('id', roomId)
        .single();

      if (error || !data) {
        setRoomState((prev) => ({ ...prev, error: 'Комната не найдена' }));
        return false;
      }
      if (!data.is_active) {
        setRoomState((prev) => ({ ...prev, error: 'Комната закрыта' }));
        return false;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setRoomState((prev) => ({ ...prev, error: 'Срок действия комнаты истёк' }));
        return false;
      }

      const role: UserRole = data.owner_id === userId ? 'teacher' : 'student';

      setRoomState((prev) => ({
        ...prev,
        roomId,
        role,
        isConnected: true,
        error: null,
      }));

      return true;
    },
    [ensureAnonAuth],
  );

  const leaveRoom = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.toString());

    setRoomState({
      roomId: null,
      role: 'student',
      isConnected: false,
      participants: [],
      error: null,
    });
  }, []);

  const closeRoom = useCallback(async () => {
    if (!roomState.roomId || roomState.role !== 'teacher') return;
    await supabase.from('rooms').update({ is_active: false }).eq('id', roomState.roomId);
    leaveRoom();
  }, [roomState.roomId, roomState.role, leaveRoom]);

  const copyRoomLink = useCallback((): string => {
    const url = new URL(window.location.href);
    if (roomState.roomId) {
      url.searchParams.set('room', roomState.roomId);
    }
    return url.toString();
  }, [roomState.roomId]);

  return {
    roomState,
    createRoom,
    joinRoom,
    leaveRoom,
    closeRoom,
    copyRoomLink,
  };
}
