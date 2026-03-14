// src/hooks/useStudentProgress.ts
// Хук для работы с прогрессом ученика через IndexedDB (Dexie).
// Drop-in замена localStorage-функций loadProgress/saveProgress из ChallengeMode.tsx.

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db/schema';
import { StudentProgress, TopicProgress, SkillLevel } from '@/lib/types';
import { useProgressSync } from '@/hooks/useProgressSync';

// ── Вспомогательные функции ────────────────────────────────

// Конвертируем запись из IndexedDB в формат StudentProgress
function dbRowToTopicProgress(row: {
  topicKey: string;
  attempts: number;
  correct: number;
  streak: number;
  level: SkillLevel;
}): TopicProgress {
  return {
    topicKey: row.topicKey,
    attempts: row.attempts,
    correct: row.correct,
    streak: row.streak,
    level: row.level,
  };
}

// ── Хук ───────────────────────────────────────────────────

export function useStudentProgress() {
  const [studentProgress, setStudentProgress] = useState<StudentProgress>({ topics: {} });
  const [isLoading, setIsLoading] = useState(true);
  const { triggerSync } = useProgressSync();

  // Загрузка прогресса из IndexedDB при монтировании
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rows = await db.user_progress.toArray();
        if (cancelled) return;

        const topics: Record<string, TopicProgress> = {};
        for (const row of rows) {
          topics[row.topicKey] = dbRowToTopicProgress(row);
        }
        setStudentProgress({ topics });
      } catch (error) {
        console.error('[useStudentProgress] Ошибка загрузки прогресса:', error);

        // Fallback: читаем из localStorage если IndexedDB недоступен
        try {
          const saved = localStorage.getItem('mathviz_student_progress');
          if (saved && !cancelled) {
            setStudentProgress(JSON.parse(saved));
          }
        } catch {
          // Оба источника недоступны — начинаем с чистого листа
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Обновление прогресса по одной теме
  const updateTopicProgress = useCallback(async (
    topicKey: string,
    isCorrect: boolean
  ): Promise<StudentProgress> => {
    const current = studentProgress.topics[topicKey] ?? {
      topicKey,
      attempts: 0,
      correct: 0,
      streak: 0,
      level: 'not_started' as SkillLevel,
    };

    const newCorrect = current.correct + (isCorrect ? 1 : 0);
    const newAttempts = current.attempts + 1;
    const newStreak = isCorrect ? current.streak + 1 : 0;
    const newLevel = getSkillLevel(newCorrect, newAttempts);

    const updated: TopicProgress = {
      topicKey,
      attempts: newAttempts,
      correct: newCorrect,
      streak: newStreak,
      level: newLevel,
    };

    const newProgress: StudentProgress = {
      ...studentProgress,
      topics: { ...studentProgress.topics, [topicKey]: updated },
    };

    // Сохраняем в IndexedDB
    try {
      await db.user_progress.put({
        topicKey,
        attempts: newAttempts,
        correct: newCorrect,
        streak: newStreak,
        level: newLevel,
        lastAttemptAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Добавляем в sync_queue для будущей синхронизации с Supabase
      await db.sync_queue.add({
        topicKey,
        payload: JSON.stringify({ topicKey, attempts: newAttempts, correct: newCorrect, streak: newStreak, level: newLevel }),
        status: 'pending',
        createdAt: Date.now(),
        retries: 0,
      });

      // Запускаем синхронизацию с Supabase
      triggerSync();
    } catch (error) {
      console.error('[useStudentProgress] Ошибка сохранения в IndexedDB:', error);

      // Fallback: сохраняем в localStorage
      try {
        localStorage.setItem('mathviz_student_progress', JSON.stringify(newProgress));
      } catch { /* игнорируем */ }
    }

    setStudentProgress(newProgress);
    return newProgress;
  }, [studentProgress, triggerSync]);

  return { studentProgress, updateTopicProgress, isLoading };
}

// ── Утилита (повторяет логику из ChallengeMode.tsx) ────────

export function getSkillLevel(correct: number, attempts: number): SkillLevel {
  if (attempts === 0) return 'not_started';
  const accuracy = correct / attempts;
  if (correct >= 10 && accuracy >= 0.9) return 'mastered';
  if (correct >= 5 && accuracy >= 0.75) return 'proficient';
  return 'practicing';
}
