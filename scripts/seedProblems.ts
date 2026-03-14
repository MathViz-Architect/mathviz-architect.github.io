// scripts/seedProblems.ts
// Запуск: npx tsx scripts/seedProblems.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Не найдены переменные окружения.');
  process.exit(1);
}

console.log('🔗 Подключаемся к:', url);

const supabase = createClient(url, key);

async function seed() {
  // Сначала проверим соединение простым запросом
  console.log('🔍 Проверка соединения...');
  try {
    const { data, error } = await supabase.from('problems').select('id').limit(1);
    if (error) {
      console.error('❌ Ошибка соединения:', error.message);
      console.error('   code:', error.code);
      console.error('   details:', error.details);
      process.exit(1);
    }
    console.log('✅ Соединение OK, строк в таблице уже:', data?.length ?? 0);
  } catch (e: any) {
    console.error('❌ Сетевая ошибка:', e.message);
    console.error('   cause:', e.cause?.message ?? e.cause);
    process.exit(1);
  }

  const raw = readFileSync(resolve(process.cwd(), 'public/problems.json'), 'utf-8');
  const problems = JSON.parse(raw);

  // Дедупликация
  const seen = new Map<string, any>();
  for (const t of problems) {
    if (seen.has(t.id)) {
      console.warn(`⚠️  Дубль id="${t.id}" — пропущен`);
    } else {
      seen.set(t.id, t);
    }
  }
  const unique = Array.from(seen.values());
  console.log(`📦 Уникальных шаблонов: ${unique.length}`);

  const rows = unique.map((t: any) => ({
    id:      t.id,
    grade:   t.class,
    subject: t.subject,
    topic:   t.topic,
    data:    t,
  }));

  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('problems')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Ошибка на батче ${i}–${i + batch.length}:`, error.message);
      process.exit(1);
    }
    console.log(`   ✓ ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }

  console.log('✅ Seed завершён успешно!');
}

seed();
