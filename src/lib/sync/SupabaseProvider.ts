// src/lib/sync/SupabaseProvider.ts
import * as Y from 'yjs';
import { SupabaseClient } from '@supabase/supabase-js';

// ─── Broadcast message types ────────────────────────────────────────────────

export interface AwarenessState {
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
}

interface UpdateMessage {
  payload: { update: number[] };
}

interface SyncRequestMessage {
  payload: { stateVector: number[] };
}

interface SyncResponseMessage {
  payload: { update: number[] };
}

interface AwarenessMessage {
  payload: { clientId: string; state: AwarenessState | null };
}

// ─── Type guards ─────────────────────────────────────────────────────────────

function isUpdateMessage(msg: unknown): msg is UpdateMessage {
  return (
    typeof msg === 'object' && msg !== null &&
    'payload' in msg &&
    typeof (msg as UpdateMessage).payload === 'object' &&
    Array.isArray((msg as UpdateMessage).payload?.update)
  );
}

function isSyncRequestMessage(msg: unknown): msg is SyncRequestMessage {
  return (
    typeof msg === 'object' && msg !== null &&
    'payload' in msg &&
    typeof (msg as SyncRequestMessage).payload === 'object' &&
    Array.isArray((msg as SyncRequestMessage).payload?.stateVector)
  );
}

function isSyncResponseMessage(msg: unknown): msg is SyncResponseMessage {
  return (
    typeof msg === 'object' && msg !== null &&
    'payload' in msg &&
    typeof (msg as SyncResponseMessage).payload === 'object' &&
    Array.isArray((msg as SyncResponseMessage).payload?.update)
  );
}

function isAwarenessMessage(msg: unknown): msg is AwarenessMessage {
  return (
    typeof msg === 'object' && msg !== null &&
    'payload' in msg &&
    typeof (msg as AwarenessMessage).payload === 'object' &&
    typeof (msg as AwarenessMessage).payload?.clientId === 'string'
  );
}

// ─── SimpleAwareness ─────────────────────────────────────────────────────────

type AwarenessChangeListener = (states: Map<string, AwarenessState>) => void;

// Internal state with timestamp for TTL-based stale cursor cleanup
interface AwarenessStateWithTs extends AwarenessState {
  _ts: number;
}

// How long (ms) a remote cursor is kept alive without a refresh.
// If a peer closes the tab without a graceful disconnect, their cursor
// disappears after this timeout instead of lingering forever.
const AWARENESS_TTL_MS = 10_000;

class SimpleAwareness {
  readonly clientId: string;
  private states = new Map<string, AwarenessStateWithTs>();
  private listeners = new Set<AwarenessChangeListener>();
  private localState: AwarenessState | null = null;
  private ttlInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Periodically remove cursors that haven't been refreshed within TTL.
    this.ttlInterval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      this.states.forEach((state, id) => {
        if (id !== this.clientId && now - state._ts > AWARENESS_TTL_MS) {
          this.states.delete(id);
          changed = true;
        }
      });
      if (changed) this.emit();
    }, 5_000);
  }

  setLocalState(state: AwarenessState | null) {
    this.localState = state;
    if (state === null) this.states.delete(this.clientId);
    else this.states.set(this.clientId, { ...state, _ts: Date.now() });
    this.emit();
  }

  setLocalStateField<K extends keyof AwarenessState>(field: K, value: AwarenessState[K]) {
    const current = this.localState ?? { name: '', color: '#3B82F6', cursor: null };
    this.setLocalState({ ...current, [field]: value });
  }

  getStates(): Map<string, AwarenessState> {
    // Return without internal _ts field so callers get clean AwarenessState
    const clean = new Map<string, AwarenessState>();
    this.states.forEach((state, id) => {
      const { _ts, ...rest } = state;
      clean.set(id, rest);
    });
    return clean;
  }
  getLocalState(): AwarenessState | null { return this.localState; }

  applyRemoteState(clientId: string, state: AwarenessState | null) {
    if (state === null) this.states.delete(clientId);
    else this.states.set(clientId, { ...state, _ts: Date.now() });
    this.emit();
  }

  on(_event: 'change', listener: AwarenessChangeListener) { this.listeners.add(listener); }
  off(_event: 'change', listener: AwarenessChangeListener) { this.listeners.delete(listener); }

  private emit() { this.listeners.forEach(fn => fn(this.getStates())); }
  destroy() {
    if (this.ttlInterval) clearInterval(this.ttlInterval);
    this.listeners.clear();
    this.states.clear();
  }
}

// ─── SupabaseProvider ─────────────────────────────────────────────────────────

/**
 * Tracks bootstrap sync progress:
 * - 'idle'             — sent sync-request, waiting to see if any peer exists
 * - 'waiting_response' — received a sync-request from a peer (peer exists), waiting for sync-response
 * - 'synced'           — sync-response received and applied, or timeout fired as first-in-room
 */
type SyncPhase = 'idle' | 'waiting_response' | 'synced';

export class SupabaseProvider {
  doc: Y.Doc;
  awareness: SimpleAwareness;
  private channel: ReturnType<SupabaseClient['channel']>;
  private onSyncedCallback: (() => void) | null;
  private syncedFired = false;
  private syncTimeout: ReturnType<typeof setTimeout> | null = null;
  private syncPhase: SyncPhase = 'idle';

  /**
   * @param onSynced — вызывается один раз после применения sync-response от peer.
   *   Если никто не ответил за 2s (первый в комнате) — вызывается по таймауту.
   */
  constructor(
    doc: Y.Doc,
    supabase: SupabaseClient,
    roomId: string,
    onSynced?: () => void,
  ) {
    this.doc = doc;
    this.awareness = new SimpleAwareness();
    this.onSyncedCallback = onSynced ?? null;

    console.log(`[provider] creating channel room:${roomId}`);

    this.channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { ack: true, self: false } },
    });

    this.doc.on('update', this.onLocalUpdate);

    // Fallback timeout: fires if no sync-response arrives within 2s.
    // Distinguishes between "first in room" (idle) and "peer dropped mid-sync" (waiting_response).
    this.syncTimeout = setTimeout(() => {
      if (this.syncPhase === 'waiting_response') {
        // A peer sent a sync-request (so they exist) but never sent a sync-response.
        // This can happen if the peer disconnected between our sync-request and their response.
        // We still unblock the editor — the canvas may be incomplete, but blocking is worse.
        console.warn('[provider] sync timeout: peer was detected but did not respond — canvas may be incomplete');
      }
      this.fireSynced();
    }, 2000);

    this.channel
      .on('broadcast', { event: 'update' }, (msg) => {
        console.log('[provider] received broadcast:update');
        if (!isUpdateMessage(msg)) {
          console.warn('[provider] malformed update message', msg);
          return;
        }
        this.onRemoteUpdate(msg);
      })
      .on('broadcast', { event: 'sync-request' }, (msg) => {
        console.log('[provider] received broadcast:sync-request');
        if (!isSyncRequestMessage(msg)) {
          console.warn('[provider] malformed sync-request message', msg);
          return;
        }
        this.onSyncRequest(msg);
      })
      .on('broadcast', { event: 'sync-response' }, (msg) => {
        console.log('[provider] received broadcast:sync-response');
        if (!isSyncResponseMessage(msg)) {
          console.warn('[provider] malformed sync-response message', msg);
          return;
        }
        try {
          Y.applyUpdate(this.doc, new Uint8Array(msg.payload.update), this);
        } catch (err) {
          console.error('[provider] failed to apply sync-response — payload may be corrupt', err);
          // Still unblock the editor; canvas may be empty but a crash is worse.
        }
        this.syncPhase = 'synced';
        if (this.syncTimeout) { clearTimeout(this.syncTimeout); this.syncTimeout = null; }
        this.fireSynced();
      })
      .on('broadcast', { event: 'awareness' }, (msg) => {
        if (!isAwarenessMessage(msg)) return;
        this.onRemoteAwareness(msg);
      })
      .subscribe((status, err) => {
        console.log(`[provider] channel status: ${status}`, err ?? '');
        if (status === 'SUBSCRIBED') {
          console.log('[provider] subscribed — warming up channel');
          // Warm-up delay to prevent REST API fallback
          setTimeout(() => {
            console.log('[provider] warm-up complete — sending sync-request');
            this.channel.send({
              type: 'broadcast',
              event: 'sync-request',
              payload: { stateVector: Array.from(Y.encodeStateVector(this.doc)) },
            });
            this.broadcastLocalAwareness();
          }, 50);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[provider] channel error:', status, err);
        }
      });
  }

  private fireSynced() {
    if (this.syncedFired) return;
    this.syncedFired = true;
    console.log('[provider] onSynced fired');
    this.onSyncedCallback?.();
  }

  // ─── Doc sync ───────────────────────────────────────────────────────────────

  private onLocalUpdate = (update: Uint8Array, origin: unknown) => {
    // origin === this: мы сами применили remote update — не ретранслировать.
    if (origin === this) {
      return;
    }
    console.log('[provider] broadcasting local update', update.length, 'bytes');
    this.channel.send({
      type: 'broadcast',
      event: 'update',
      payload: { update: Array.from(update) },
    });
  };

  private onRemoteUpdate(msg: UpdateMessage) {
    const update = new Uint8Array(msg.payload.update);
    console.log('[provider] applying remote update', update.length, 'bytes');
    // origin = this — onLocalUpdate не будет ретранслировать обратно
    Y.applyUpdate(this.doc, update, this);
  }

  private onSyncRequest(msg: SyncRequestMessage) {
    // A peer exists and is requesting our state — mark that we're now waiting for their response.
    if (this.syncPhase === 'idle') {
      this.syncPhase = 'waiting_response';
    }
    const sv = new Uint8Array(msg.payload.stateVector);
    const update = Y.encodeStateAsUpdate(this.doc, sv);
    console.log('[provider] responding to sync-request with', update.length, 'bytes');
    this.channel.send({
      type: 'broadcast',
      event: 'sync-response',
      payload: { update: Array.from(update) },
    });
  }

  // ─── Awareness ──────────────────────────────────────────────────────────────

  broadcastLocalAwareness() {
    this.channel.send({
      type: 'broadcast',
      event: 'awareness',
      payload: {
        clientId: this.awareness.clientId,
        state: this.awareness.getLocalState(),
      },
    });
  }

  private onRemoteAwareness(msg: AwarenessMessage) {
    this.awareness.applyRemoteState(msg.payload.clientId, msg.payload.state);
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────────

  destroy() {
    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    this.channel.send({
      type: 'broadcast',
      event: 'awareness',
      payload: { clientId: this.awareness.clientId, state: null },
    });
    this.awareness.destroy();
    this.doc.off('update', this.onLocalUpdate);
    this.channel.unsubscribe();
    console.log('[provider] destroyed');
  }
}
