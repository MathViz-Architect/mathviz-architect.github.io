import { useCallback, useEffect, useRef } from 'react';
import { syncPendingProgress } from '../lib/sync/progressSync';
import { useAuth } from './useAuth';

/**
 * Запускает синхронизацию:
 * - при появлении сети (navigator.onLine)
 * - при фокусе вкладки (visibilitychange)
 * - вручную через triggerSync() — вызывается после каждого ответа на задачу
 */
export function useProgressSync() {
  const { user } = useAuth();
  const syncingRef = useRef(false);

  const triggerSync = useCallback(async () => {
    if (!user || syncingRef.current) return;
    if (!navigator.onLine) return;

    syncingRef.current = true;
    try {
      await syncPendingProgress(user.id);
    } catch (e) {
      console.error('[useProgressSync] sync error:', e);
    } finally {
      syncingRef.current = false;
    }
  }, [user]);

  // При появлении сети
  useEffect(() => {
    window.addEventListener('online', triggerSync);
    return () => window.removeEventListener('online', triggerSync);
  }, [triggerSync]);

  // При фокусе вкладки
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') triggerSync();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [triggerSync]);

  // При монтировании (на случай пропущенных записей)
  useEffect(() => {
    triggerSync();
  }, [triggerSync]);

  return { triggerSync };
}
