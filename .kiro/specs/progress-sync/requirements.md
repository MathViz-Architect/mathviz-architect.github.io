# Progress Sync: Technical Specification

## Executive Summary

This specification defines the implementation of a robust, offline-first progress synchronization system for MathViz Architect. The system will sync student progress data between localStorage (client) and Supabase (server) with conflict resolution, ensuring data consistency across web and Electron platforms.

---

## 1. Problem Statement

### Current State
- **Web:** Progress stored in `localStorage` under key `mathviz_student_progress`
- **Electron:** Progress stored in Electron's persistent storage (separate from web)
- **Supabase:** Currently only stores problem templates, not user progress
- **Sync:** No synchronization mechanism exists

### Critical Issues
1. **Data Loss Risk:** Browser cache clear → all progress lost
2. **Multi-Device Divergence:** Student uses school computer + home computer → two separate progress states
3. **Platform Isolation:** Electron and web versions have completely separate progress
4. **No Backup:** Single point of failure (localStorage)

### Success Criteria
- ✅ Progress persists across browser cache clears
- ✅ Progress syncs across multiple devices
- ✅ Offline-first: app works without internet, syncs when online
- ✅ Conflict resolution: handles concurrent edits gracefully
- ✅ Zero data loss: all progress changes are eventually persisted
- ✅ Performance: sync operations don't block UI (<100ms perceived latency)

---

## 2. Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser/Electron)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │  Component   │─────▶│ ProgressSync │─────▶│ IndexedDB │ │
│  │ (Challenge)  │      │   Manager    │      │  (Local)  │ │
│  └──────────────┘      └──────┬───────┘      └───────────┘ │
│                               │                              │
│                               │ Sync Queue                   │
│                               ▼                              │
│                        ┌──────────────┐                      │
│                        │ Sync Worker  │                      │
│                        │  (Background)│                      │
│                        └──────┬───────┘                      │
└───────────────────────────────┼──────────────────────────────┘
                                │
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase (Server)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │  PostgreSQL  │◀─────│  Row Level   │◀─────│  Realtime │ │
│  │  (progress)  │      │   Security   │      │ (optional)│ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Write Path (Student completes problem):**
```
1. Component updates progress state
2. ProgressSyncManager.save(progress)
   ├─▶ Write to IndexedDB (instant, <5ms)
   ├─▶ Enqueue sync operation
   └─▶ Return immediately (non-blocking)
3. Background worker picks up sync operation
4. When online: POST to Supabase with conflict resolution
5. On success: Mark operation as synced
```

**Read Path (Student opens app):**
```
1. ProgressSyncManager.load()
2. Read from IndexedDB (instant, <10ms)
3. Return cached data immediately
4. Background: Check Supabase for updates
5. If remote newer: Merge and update local cache
6. Notify component of updates (if any)
```

---

## 3. Database Schema

### 3.1 Supabase Schema

#### Table: `user_progress`

```sql
CREATE TABLE user_progress (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User identification (anonymous for now, can add auth later)
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  
  -- Progress data
  topic_id TEXT NOT NULL,
  progress_data JSONB NOT NULL,
  
  -- Versioning for conflict resolution
  version INTEGER NOT NULL DEFAULT 1,
  last_modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Sync metadata
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_timestamp BIGINT NOT NULL,
  
  -- Indexes
  CONSTRAINT unique_user_topic UNIQUE (user_id, topic_id)
);

-- Indexes for performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_topic_id ON user_progress(topic_id);
CREATE INDEX idx_user_progress_modified ON user_progress(last_modified_at DESC);

-- RLS Policies
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read/write their own progress
-- (In future, can add auth.uid() check)
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  USING (true);  -- For now, allow all reads (can restrict by user_id later)

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (true);  -- For now, allow all inserts

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (true);  -- For now, allow all updates
```

#### Table: `sync_log` (for debugging and analytics)

```sql
CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  operation TEXT NOT NULL,  -- 'push', 'pull', 'conflict'
  topic_id TEXT,
  status TEXT NOT NULL,  -- 'success', 'conflict', 'error'
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_log_user_device ON sync_log(user_id, device_id);
CREATE INDEX idx_sync_log_created ON sync_log(created_at DESC);
```

### 3.2 IndexedDB Schema (Client)

```typescript
// Database name: 'mathviz_db'
// Version: 1

interface ProgressRecord {
  id: string;  // topic_id
  data: TopicProgress;
  version: number;
  lastModified: number;  // timestamp
  syncStatus: 'synced' | 'pending' | 'conflict';
  syncedAt?: number;
}

interface SyncQueueItem {
  id: string;  // unique operation id
  operation: 'upsert' | 'delete';
  topicId: string;
  data: TopicProgress;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

// Object stores:
// 1. 'progress' - stores progress records
// 2. 'sync_queue' - stores pending sync operations
// 3. 'metadata' - stores sync metadata (last sync time, user_id, device_id)
```

---

## 4. TypeScript Interfaces

### 4.1 Core Types

```typescript
// Student progress for a single topic
interface TopicProgress {
  topicId: string;
  masteryLevel: 'not_started' | 'practicing' | 'confident' | 'mastered';
  problemsAttempted: number;
  problemsCorrect: number;
  currentDifficulty: number;
  streak: number;
  lastAttemptedAt: number;  // timestamp
  history: ProblemAttempt[];
}

interface ProblemAttempt {
  templateId: string;
  difficulty: number;
  correct: boolean;
  timeSpentMs: number;
  timestamp: number;
}

// Full student progress (all topics)
interface StudentProgress {
  topics: Record<string, TopicProgress>;
}

// Sync metadata
interface SyncMetadata {
  userId: string;
  deviceId: string;
  lastSyncAt: number;
  lastPullAt: number;
  pendingOperations: number;
}

// Conflict resolution
interface ConflictResolution {
  strategy: 'local_wins' | 'remote_wins' | 'merge';
  local: TopicProgress;
  remote: TopicProgress;
  resolved: TopicProgress;
  reason: string;
}
```

### 4.2 API Interfaces

```typescript
interface ProgressSyncManager {
  // Core operations
  save(topicId: string, progress: TopicProgress): Promise<void>;
  load(topicId: string): Promise<TopicProgress | null>;
  loadAll(): Promise<StudentProgress>;
  
  // Sync operations
  sync(): Promise<SyncResult>;
  pull(): Promise<PullResult>;
  push(): Promise<PushResult>;
  
  // Status
  getSyncStatus(): Promise<SyncStatus>;
  getPendingOperations(): Promise<number>;
  
  // Conflict resolution
  resolveConflict(topicId: string, resolution: ConflictResolution): Promise<void>;
  
  // Utilities
  clearLocal(): Promise<void>;
  exportProgress(): Promise<string>;  // JSON export
  importProgress(json: string): Promise<void>;
}

interface SyncResult {
  success: boolean;
  pulled: number;
  pushed: number;
  conflicts: number;
  errors: string[];
}

interface SyncStatus {
  online: boolean;
  lastSyncAt: number;
  pendingOperations: number;
  syncInProgress: boolean;
}
```

---

## 5. Sync Algorithm

### 5.1 Conflict Resolution Strategy

**Conflict Detection:**
A conflict occurs when:
- Local version > 1 AND remote version > 1
- Local `lastModified` and remote `last_modified_at` differ
- Both have been modified since last sync

**Resolution Strategy: Smart Merge**

```typescript
function resolveConflict(
  local: TopicProgress,
  remote: TopicProgress
): ConflictResolution {
  // Strategy 1: Most recent wins for simple fields
  const resolved: TopicProgress = {
    topicId: local.topicId,
    masteryLevel: local.lastAttemptedAt > remote.lastAttemptedAt
      ? local.masteryLevel
      : remote.masteryLevel,
    
    // Strategy 2: Max values for counters (assume both are valid)
    problemsAttempted: Math.max(local.problemsAttempted, remote.problemsAttempted),
    problemsCorrect: Math.max(local.problemsCorrect, remote.problemsCorrect),
    
    // Strategy 3: Most recent for difficulty and streak
    currentDifficulty: local.lastAttemptedAt > remote.lastAttemptedAt
      ? local.currentDifficulty
      : remote.currentDifficulty,
    streak: local.lastAttemptedAt > remote.lastAttemptedAt
      ? local.streak
      : remote.streak,
    
    // Strategy 4: Most recent timestamp
    lastAttemptedAt: Math.max(local.lastAttemptedAt, remote.lastAttemptedAt),
    
    // Strategy 5: Merge histories (union, deduplicate by timestamp)
    history: mergeHistories(local.history, remote.history)
  };
  
  return {
    strategy: 'merge',
    local,
    remote,
    resolved,
    reason: 'Smart merge: max counters, recent wins for state'
  };
}

function mergeHistories(
  local: ProblemAttempt[],
  remote: ProblemAttempt[]
): ProblemAttempt[] {
  const combined = [...local, ...remote];
  const unique = new Map<number, ProblemAttempt>();
  
  // Deduplicate by timestamp (keep first occurrence)
  combined.forEach(attempt => {
    if (!unique.has(attempt.timestamp)) {
      unique.set(attempt.timestamp, attempt);
    }
  });
  
  // Sort by timestamp descending, keep last 100
  return Array.from(unique.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 100);
}
```

### 5.2 Sync Flow

**Full Sync Algorithm:**

```typescript
async function sync(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    pulled: 0,
    pushed: 0,
    conflicts: 0,
    errors: []
  };
  
  try {
    // Step 1: Check online status
    if (!navigator.onLine) {
      return { ...result, success: false, errors: ['Offline'] };
    }
    
    // Step 2: Pull remote changes
    const pullResult = await pull();
    result.pulled = pullResult.updated;
    result.conflicts += pullResult.conflicts;
    
    // Step 3: Push local changes
    const pushResult = await push();
    result.pushed = pushResult.pushed;
    result.conflicts += pushResult.conflicts;
    result.errors.push(...pushResult.errors);
    
    // Step 4: Update sync metadata
    await updateSyncMetadata({
      lastSyncAt: Date.now(),
      lastPullAt: Date.now()
    });
    
    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(error.message);
    return result;
  }
}
```

**Pull Algorithm:**

```typescript
async function pull(): Promise<PullResult> {
  // 1. Get last pull timestamp
  const metadata = await getMetadata();
  const lastPullAt = metadata.lastPullAt || 0;
  
  // 2. Fetch remote changes since last pull
  const { data: remoteRecords, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', metadata.userId)
    .gt('last_modified_at', new Date(lastPullAt).toISOString());
  
  if (error) throw error;
  
  const result = { updated: 0, conflicts: 0 };
  
  // 3. For each remote record, merge with local
  for (const remote of remoteRecords) {
    const local = await getLocalProgress(remote.topic_id);
    
    if (!local) {
      // No local copy, just save remote
      await saveLocalProgress(remote.topic_id, remote.progress_data, {
        version: remote.version,
        syncStatus: 'synced',
        syncedAt: Date.now()
      });
      result.updated++;
    } else if (local.version < remote.version) {
      // Remote is newer, check for conflict
      if (local.syncStatus === 'pending') {
        // Conflict: local has unsync changes, remote is newer
        const resolution = resolveConflict(local.data, remote.progress_data);
        await saveLocalProgress(remote.topic_id, resolution.resolved, {
          version: remote.version + 1,
          syncStatus: 'pending',  // Need to push resolved version
          syncedAt: Date.now()
        });
        result.conflicts++;
      } else {
        // No conflict, remote wins
        await saveLocalProgress(remote.topic_id, remote.progress_data, {
          version: remote.version,
          syncStatus: 'synced',
          syncedAt: Date.now()
        });
        result.updated++;
      }
    }
    // else: local is same or newer, skip
  }
  
  return result;
}
```

**Push Algorithm:**

```typescript
async function push(): Promise<PushResult> {
  const result = { pushed: 0, conflicts: 0, errors: [] };
  
  // 1. Get all pending operations from sync queue
  const pending = await getSyncQueue();
  
  // 2. Process each operation
  for (const operation of pending) {
    try {
      const local = await getLocalProgress(operation.topicId);
      if (!local) continue;
      
      // 3. Upsert to Supabase
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: metadata.userId,
          device_id: metadata.deviceId,
          topic_id: operation.topicId,
          progress_data: local.data,
          version: local.version,
          client_timestamp: local.lastModified,
          last_modified_at: new Date(local.lastModified).toISOString()
        }, {
          onConflict: 'user_id,topic_id',
          returning: 'representation'
        });
      
      if (error) {
        // Check if it's a version conflict
        if (error.code === '23505' || error.message.includes('version')) {
          // Conflict detected, need to pull and merge
          result.conflicts++;
          await logSyncOperation('push', operation.topicId, 'conflict', {
            error: error.message
          });
        } else {
          result.errors.push(`${operation.topicId}: ${error.message}`);
        }
        continue;
      }
      
      // 4. Mark as synced
      await updateLocalProgress(operation.topicId, {
        syncStatus: 'synced',
        syncedAt: Date.now()
      });
      
      // 5. Remove from sync queue
      await removeSyncQueueItem(operation.id);
      
      result.pushed++;
      
    } catch (error) {
      result.errors.push(`${operation.topicId}: ${error.message}`);
      
      // Increment retry count
      await incrementRetryCount(operation.id);
    }
  }
  
  return result;
}
```

---

## 6. Implementation Plan

### Phase 1: Foundation (Week 1)

**Tasks:**
1. Create Supabase tables (`user_progress`, `sync_log`)
2. Implement IndexedDB wrapper (`src/lib/db/indexedDB.ts`)
3. Generate user_id and device_id (UUID, stored in IndexedDB)
4. Migrate existing localStorage data to IndexedDB

**Deliverables:**
- ✅ Database schema deployed
- ✅ IndexedDB operational
- ✅ Migration script tested

### Phase 2: Core Sync Logic (Week 2)

**Tasks:**
1. Implement `ProgressSyncManager` class
2. Implement conflict resolution algorithm
3. Implement pull/push/sync methods
4. Add sync queue management
5. Add error handling and retry logic

**Deliverables:**
- ✅ ProgressSyncManager API complete
- ✅ Unit tests for conflict resolution
- ✅ Integration tests for sync flow

### Phase 3: Integration (Week 3)

**Tasks:**
1. Integrate ProgressSyncManager into ChallengeMode component
2. Add background sync worker
3. Add online/offline detection
4. Add sync status UI indicator
5. Add manual sync button

**Deliverables:**
- ✅ ChallengeMode uses ProgressSyncManager
- ✅ Background sync operational
- ✅ UI shows sync status

### Phase 4: Testing & Polish (Week 4)

**Tasks:**
1. End-to-end testing (multi-device scenarios)
2. Performance testing (large progress datasets)
3. Error scenario testing (network failures, conflicts)
4. Add analytics/telemetry for sync operations
5. Documentation and migration guide

**Deliverables:**
- ✅ All tests passing
- ✅ Performance benchmarks met
- ✅ Documentation complete

---

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
describe('ProgressSyncManager', () => {
  describe('conflict resolution', () => {
    it('should merge histories without duplicates', () => {
      const local = createProgress({ history: [attempt1, attempt2] });
      const remote = createProgress({ history: [attempt2, attempt3] });
      const resolved = resolveConflict(local, remote);
      expect(resolved.resolved.history).toHaveLength(3);
    });
    
    it('should use max values for counters', () => {
      const local = createProgress({ problemsAttempted: 10, problemsCorrect: 7 });
      const remote = createProgress({ problemsAttempted: 8, problemsCorrect: 8 });
      const resolved = resolveConflict(local, remote);
      expect(resolved.resolved.problemsAttempted).toBe(10);
      expect(resolved.resolved.problemsCorrect).toBe(8);
    });
  });
  
  describe('sync operations', () => {
    it('should push pending changes when online', async () => {
      const manager = new ProgressSyncManager();
      await manager.save('topic1', progress1);
      const result = await manager.push();
      expect(result.pushed).toBe(1);
    });
    
    it('should handle offline gracefully', async () => {
      mockOffline();
      const manager = new ProgressSyncManager();
      const result = await manager.sync();
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Offline');
    });
  });
});
```

### 7.2 Integration Tests

```typescript
describe('Multi-device sync', () => {
  it('should sync progress across two devices', async () => {
    // Device 1: Complete problem
    const device1 = new ProgressSyncManager({ deviceId: 'device1' });
    await device1.save('topic1', progress1);
    await device1.push();
    
    // Device 2: Pull changes
    const device2 = new ProgressSyncManager({ deviceId: 'device2' });
    await device2.pull();
    const synced = await device2.load('topic1');
    
    expect(synced).toEqual(progress1);
  });
  
  it('should resolve conflicts when both devices edit same topic', async () => {
    // Device 1: Complete problem A
    const device1 = new ProgressSyncManager({ deviceId: 'device1' });
    await device1.save('topic1', { ...progress1, problemsAttempted: 5 });
    
    // Device 2: Complete problem B (offline)
    const device2 = new ProgressSyncManager({ deviceId: 'device2' });
    await device2.save('topic1', { ...progress1, problemsAttempted: 3 });
    
    // Device 1 pushes first
    await device1.push();
    
    // Device 2 pushes (conflict)
    await device2.push();
    
    // Both pull
    await device1.pull();
    await device2.pull();
    
    // Both should have merged result
    const result1 = await device1.load('topic1');
    const result2 = await device2.load('topic1');
    
    expect(result1.problemsAttempted).toBe(5);  // Max wins
    expect(result2.problemsAttempted).toBe(5);
  });
});
```

### 7.3 Performance Tests

```typescript
describe('Performance', () => {
  it('should save progress in <5ms', async () => {
    const manager = new ProgressSyncManager();
    const start = performance.now();
    await manager.save('topic1', progress1);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(5);
  });
  
  it('should load progress in <10ms', async () => {
    const manager = new ProgressSyncManager();
    await manager.save('topic1', progress1);
    
    const start = performance.now();
    await manager.load('topic1');
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10);
  });
  
  it('should sync 100 topics in <2s', async () => {
    const manager = new ProgressSyncManager();
    
    // Create 100 topics
    for (let i = 0; i < 100; i++) {
      await manager.save(`topic${i}`, createProgress());
    }
    
    const start = performance.now();
    await manager.sync();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});
```

---

## 8. Migration Strategy

### 8.1 Migrate Existing localStorage Data

```typescript
async function migrateFromLocalStorage(): Promise<void> {
  try {
    // 1. Check if migration already done
    const migrated = await db.metadata.get('migration_completed');
    if (migrated) return;
    
    // 2. Read from localStorage
    const oldData = localStorage.getItem('mathviz_student_progress');
    if (!oldData) {
      await db.metadata.put({ key: 'migration_completed', value: true });
      return;
    }
    
    // 3. Parse old format
    const oldProgress: StudentProgress = JSON.parse(oldData);
    
    // 4. Write to IndexedDB
    const manager = new ProgressSyncManager();
    for (const [topicId, progress] of Object.entries(oldProgress.topics)) {
      await manager.save(topicId, progress);
    }
    
    // 5. Mark migration complete
    await db.metadata.put({ key: 'migration_completed', value: true });
    
    // 6. Keep localStorage as backup for 30 days
    localStorage.setItem('mathviz_migration_date', Date.now().toString());
    
    console.log('✅ Migration complete:', Object.keys(oldProgress.topics).length, 'topics');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration on app startup
migrateFromLocalStorage().catch(console.error);
```

### 8.2 Rollback Plan

If critical issues arise:

1. **Immediate:** Disable sync, revert to localStorage-only mode
2. **Data recovery:** Export all IndexedDB data to JSON
3. **Restore:** Import JSON back to localStorage
4. **Fix:** Address issues in staging environment
5. **Re-deploy:** Gradual rollout with monitoring

---

## 9. Monitoring & Analytics

### 9.1 Metrics to Track

```typescript
interface SyncMetrics {
  // Performance
  syncDuration: number;
  pullDuration: number;
  pushDuration: number;
  
  // Success rates
  syncSuccessRate: number;
  conflictRate: number;
  errorRate: number;
  
  // Volume
  totalSyncs: number;
  totalPulls: number;
  totalPushes: number;
  totalConflicts: number;
  
  // User behavior
  avgSyncInterval: number;
  offlineUsagePercent: number;
}
```

### 9.2 Logging

```typescript
// Log all sync operations to sync_log table
async function logSyncOperation(
  operation: string,
  topicId: string,
  status: string,
  details: any
): Promise<void> {
  await supabase.from('sync_log').insert({
    user_id: metadata.userId,
    device_id: metadata.deviceId,
    operation,
    topic_id: topicId,
    status,
    details
  });
}
```

---

## 10. Security Considerations

### 10.1 Data Privacy

- **Anonymous by default:** No PII required, use generated UUIDs
- **Optional auth:** Can add Supabase Auth later for multi-user households
- **RLS policies:** Ensure users can only access their own data

### 10.2 Data Validation

```typescript
// Validate progress data before saving
function validateProgress(progress: TopicProgress): boolean {
  return (
    typeof progress.topicId === 'string' &&
    ['not_started', 'practicing', 'confident', 'mastered'].includes(progress.masteryLevel) &&
    progress.problemsAttempted >= 0 &&
    progress.problemsCorrect >= 0 &&
    progress.problemsCorrect <= progress.problemsAttempted &&
    progress.currentDifficulty >= 1 &&
    progress.currentDifficulty <= 4 &&
    Array.isArray(progress.history)
  );
}
```

---

## 11. Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Real-time sync:** Use Supabase Realtime for instant updates
2. **Collaborative features:** Share progress with teachers/parents
3. **Cloud backup:** Export/import progress as JSON
4. **Analytics dashboard:** Visualize progress over time
5. **Offline mode indicator:** Show sync status in UI
6. **Conflict resolution UI:** Let users choose resolution strategy
7. **Multi-user support:** Add Supabase Auth for family accounts

---

## 12. Success Metrics

### KPIs

- **Data Loss Rate:** < 0.01% (target: 0%)
- **Sync Success Rate:** > 99%
- **Conflict Rate:** < 5%
- **Sync Latency (p95):** < 500ms
- **Offline Capability:** 100% (app fully functional offline)
- **User Satisfaction:** > 90% (measured via feedback)

---

## Appendix A: File Structure

```
src/
├── lib/
│   ├── db/
│   │   ├── indexedDB.ts          # IndexedDB wrapper
│   │   ├── schema.ts              # DB schema definitions
│   │   └── migrations.ts          # Migration utilities
│   ├── sync/
│   │   ├── ProgressSyncManager.ts # Main sync manager
│   │   ├── conflictResolution.ts  # Conflict resolution logic
│   │   ├── syncWorker.ts          # Background sync worker
│   │   └── types.ts               # Sync-related types
│   └── supabaseClient.ts          # Supabase client (existing)
├── hooks/
│   └── useProgressSync.ts         # React hook for sync
└── components/
    └── challenge/
        └── ChallengeMode.tsx      # Updated to use sync
```

---

## Appendix B: API Reference

See implementation files for detailed API documentation.

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-13  
**Author:** Kiro (Senior Solutions Architect)  
**Status:** Ready for Implementation
