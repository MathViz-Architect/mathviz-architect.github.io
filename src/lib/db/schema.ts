// src/lib/db/schema.ts
// Локальная база данных на IndexedDB через Dexie.js.
// Обеспечивает offline-first хранение прогресса и очередь синхронизации.

import Dexie, { type EntityTable } from 'dexie';

// ── Таблица: user_progress ─────────────────────────────────
// Хранит прогресс ученика по каждой теме.
// Заменяет localStorage-ключ 'studentProgress'.

export interface UserProgress {
  topicKey: string;       // PK — уникальный ключ темы, напр. 'grade8-abs-eq-basic'
  attempts: number;       // всего попыток
  correct: number;        // правильных ответов
  streak: number;         // текущая серия правильных ответов
  level: 'not_started' | 'practicing' | 'proficient' | 'mastered';
  lastAttemptAt: number;  // timestamp (Date.now())
  updatedAt: number;      // timestamp последнего изменения (для sync)
}

// ── Таблица: sync_queue ────────────────────────────────────
// Очередь изменений для синхронизации с Supabase.
// pending → syncing → synced (удаляется) или failed (retry).

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SyncQueueItem {
  id?: number;            // PK autoincrement
  topicKey: string;       // к какой теме относится событие
  payload: string;        // JSON-сериализованные данные изменения
  status: SyncStatus;
  createdAt: number;      // timestamp создания записи
  updatedAt?: number;     // timestamp последнего обновления статуса
  retries: number;        // количество попыток отправки
}

// ── Dexie instance ─────────────────────────────────────────

class MathVizDB extends Dexie {
  user_progress!: EntityTable<UserProgress, 'topicKey'>;
  sync_queue!: EntityTable<SyncQueueItem, 'id'>;

  constructor() {
    super('MathVizDB');

    this.version(1).stores({
      // Индексируемые поля: первое — PK, остальные — для запросов
      user_progress: 'topicKey, level, updatedAt',
      sync_queue:    '++id, topicKey, status, createdAt',
    });

    // Версия 2: добавлено поле updatedAt в sync_queue (миграция данных не нужна —
    // поле optional, существующие записи получат undefined)
    this.version(2).stores({
      user_progress: 'topicKey, level, updatedAt',
      sync_queue:    '++id, topicKey, status, createdAt, updatedAt',
    });
  }
}

export const db = new MathVizDB();
