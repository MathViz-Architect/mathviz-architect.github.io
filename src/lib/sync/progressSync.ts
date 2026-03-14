import { db } from '../db/schema';
import { supabase } from '../supabase';

export async function syncPendingProgress(userId: string): Promise<void> {
  const pending = await db.sync_queue
    .where('status')
    .equals('pending')
    .toArray();

  if (pending.length === 0) return;

  await Promise.all(
    pending.map(item => db.sync_queue.update(item.id!, { status: 'syncing' as const }))
  );

  // Дедуплицируем по topic_key — берём последнюю запись (наибольший id).
  // Без этого upsert упадёт с "cannot affect row a second time" если
  // в очереди несколько pending-записей для одной темы.
  const latestByTopic = new Map<string, typeof pending[0]>();
  for (const item of pending) {
    const existing = latestByTopic.get(item.topicKey);
    if (!existing || (item.id ?? 0) > (existing.id ?? 0)) {
      latestByTopic.set(item.topicKey, item);
    }
  }

  const records = Array.from(latestByTopic.values()).flatMap(item => {
    try {
      const data = JSON.parse(item.payload);
      return [{
        user_id: userId,
        topic_key: item.topicKey,
        attempts: data.attempts ?? 0,
        correct: data.correct ?? 0,
        streak: data.streak ?? 0,
        level: data.level ?? 'not_started',
        last_attempt_at: data.lastAttemptAt
          ? new Date(data.lastAttemptAt).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }];
    } catch {
      console.warn('[Sync] failed to parse payload for', item.topicKey);
      return [];
    }
  });

  if (records.length === 0) {
    await Promise.all(pending.map(item => db.sync_queue.delete(item.id!)));
    return;
  }

  const { error } = await supabase
    .from('user_progress')
    .upsert(records, { onConflict: 'user_id,topic_key' });

  if (error) {
    console.error('[Sync] upsert failed:', error.message);
    await Promise.all(
      pending.map(item =>
        db.sync_queue.update(item.id!, {
          status: 'failed' as const,
          retries: (item.retries ?? 0) + 1,
          updatedAt: Date.now(),
        })
      )
    );
    return;
  }

  await Promise.all(pending.map(item => db.sync_queue.delete(item.id!)));
}
