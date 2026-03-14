// src/hooks/useAwareness.ts
//
// Cursor tracking and user presence via SupabaseProvider's SimpleAwareness.
// No y-protocols dependency required.
//
// Usage:
//   const { peers, updateCursor } = useAwareness(getProvider, { name, color });
//
// `peers` — OTHER connected users (excludes self).
// Call `updateCursor({ x, y })` on canvas mousemove.
// Call `updateCursor(null)` on mouseleave.

import { useEffect, useRef, useCallback, useState } from 'react';
import { SupabaseProvider, AwarenessState } from '@/lib/sync/SupabaseProvider';

export interface AwarenessUser {
  clientId: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
}

interface UseAwarenessOptions {
  name: string;
  color: string;
}

// Throttle helper.
function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastCall = 0;
  return ((...args: Parameters<T>) => {
    const remaining = ms - (Date.now() - lastCall);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      lastCall = Date.now();
      fn(...args);
    } else {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { lastCall = Date.now(); timer = null; fn(...args); }, remaining);
    }
  }) as T;
}

export function useAwareness(
  getProvider: () => SupabaseProvider | null,
  options: UseAwarenessOptions | null,
) {
  const [peers, setPeers] = useState<AwarenessUser[]>([]);
  const providerRef = useRef<SupabaseProvider | null>(null);

  // ─── Attach to provider awareness ──────────────────────────────────────────
  useEffect(() => {
    if (!options) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 20;

    const attach = () => {
      const provider = getProvider();
      if (!provider) return false;

      providerRef.current = provider;
      const { awareness } = provider;

      // Set our initial local state.
      awareness.setLocalState({
        name: options.name,
        color: options.color,
        cursor: null,
      });

      // Announce ourselves to peers.
      provider.broadcastLocalAwareness();

      // Listen for changes and rebuild peers list.
      const onUpdate = (states: Map<string, AwarenessState>) => {
        const myId = awareness.clientId;
        const updated: AwarenessUser[] = [];
        states.forEach((state, clientId) => {
          if (clientId === myId) return; // skip self
          updated.push({
            clientId,
            name: state.name ?? 'Участник',
            color: state.color ?? '#3B82F6',
            cursor: state.cursor ?? null,
          });
        });
        setPeers(updated);
      };

      awareness.on('change', onUpdate);
      // Read current state immediately.
      onUpdate(awareness.getStates());

      return () => {
        awareness.off('change', onUpdate);
        awareness.setLocalState(null);
        provider.broadcastLocalAwareness();
        providerRef.current = null;
      };
    };

    // Try immediately; if provider not ready yet, poll briefly.
    let cleanup: (() => void) | false = attach();
    if (cleanup) return cleanup;

    const interval = setInterval(() => {
      attempts++;
      cleanup = attach();
      if (cleanup || attempts >= MAX_ATTEMPTS) clearInterval(interval);
    }, 100);

    return () => {
      clearInterval(interval);
      if (typeof cleanup === 'function') cleanup();
    };
  }, [getProvider, options?.name, options?.color]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Update cursor position (throttled to 50ms = 20fps) ────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateCursor = useCallback(
    throttle((position: { x: number; y: number } | null) => {
      const provider = providerRef.current;
      if (!provider || !options) return;
      provider.awareness.setLocalStateField('cursor', position);
      provider.broadcastLocalAwareness();
    }, 50),
    [options?.name, options?.color],
  );

  return { peers, updateCursor };
}
