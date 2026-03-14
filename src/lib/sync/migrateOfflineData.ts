import { db } from '../db/schema';
import { supabase } from '../supabase';

const MIGRATION_KEY = 'sync_migrated_v1';

export async function migrateOfflineDataIfNeeded(userId: string): Promise<void> {
  const key = `${MIGRATION_KEY}_${userId}`;
  if (localStorage.getItem(key)) return;

  const all = await db.user_progress.toArray();
  if (all.length === 0) {
    localStorage.setItem(key, '1');
    return;
  }

  const records = all.map(item => ({
    user_id: userId,
    topic_key: item.topicKey,
    attempts: item.attempts,
    correct: item.correct,
    streak: item.streak,
    level: item.level,
    last_attempt_at: item.lastAttemptAt
      ? new Date(item.lastAttemptAt).toISOString()
      : null,
    updated_at: new Date(item.updatedAt).toISOString(),
  }));

  const { error } = await supabase
    .from('user_progress')
    .upsert(records, { onConflict: 'user_id,topic_key' });

  if (error) {
    console.error('[Migration] failed:', error.message);
    return;
  }

  localStorage.setItem(key, '1');
  console.info(`[Migration] migrated ${all.length} records for user ${userId}`);
}
