// scripts/generateProblemsJson.ts
// Генерирует public/problems.json из актуальных TypeScript-шаблонов.
// Запуск: npx tsx scripts/generateProblemsJson.ts

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Импортируем шаблоны напрямую из grade-папок, минуя defineTemplates
// (defineTemplates использует import.meta.env.DEV — Vite-специфично, не работает в Node)
import { grade5Templates } from '../src/lib/templates/grade5/index.ts';
import { grade6Templates } from '../src/lib/templates/grade6/index.ts';
import { grade7Templates } from '../src/lib/templates/grade7/index.ts';
import { grade8Templates } from '../src/lib/templates/grade8/index.ts';

const allTemplates = [
    ...grade5Templates,
    ...grade6Templates,
    ...grade7Templates,
    ...grade8Templates,
];

// Дедупликация по id
const seen = new Map<string, any>();
for (const t of allTemplates) {
    if (seen.has(t.id)) {
        console.warn(`⚠️  Дубль id="${t.id}" — пропущен`);
    } else {
        seen.set(t.id, t);
    }
}
const unique = Array.from(seen.values());

const outPath = resolve(process.cwd(), 'public/problems.json');
writeFileSync(outPath, JSON.stringify(unique, null, 2), 'utf-8');
console.log(`✅ Записано ${unique.length} шаблонов → public/problems.json`);

// Проверка: pythagorean шаблоны должны иметь sum/c_val, не старый c
const pythag = unique.filter((t: any) => t.topic === 'pythagoreanTheorem');
console.log(`\n🔍 Проверка pythagorean шаблонов (${pythag.length} шт.):`);
for (const t of pythag) {
    for (const [level, cfg] of Object.entries(t.difficulties as Record<string, any>)) {
        const keys = Object.keys(cfg.parameters ?? {});
        const ok = keys.includes('sum') || !t.id.includes('hypotenuse');
        const marker = ok ? '✅' : '❌ СТАРЫЙ ФОРМАТ';
        console.log(`  ${marker} [${t.id}] level ${level}: [${keys.join(', ')}]`);
    }
}
