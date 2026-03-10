#!/usr/bin/env tsx
/**
 * Coverage CLI — shows how many templates cover each skill/tag
 *
 * Usage:
 *   pnpm coverage:skills           — group by skills
 *   pnpm coverage:skills --tags    — group by tags
 *   pnpm coverage:skills --class 6 — filter by class
 */

import { problemTemplates } from '../src/lib/problemTemplates';

const args = process.argv.slice(2);
const useTags = args.includes('--tags');
const classFilter = args.includes('--class')
    ? Number(args[args.indexOf('--class') + 1])
    : undefined;

const templates = classFilter
    ? problemTemplates.filter(t => t.class === classFilter)
    : problemTemplates;

const field = useTags ? 'tags' : 'skills';
const counter: Record<string, number> = {};

for (const template of templates) {
    const keys = (template[field] as string[] | undefined) ?? [];
    for (const key of keys) {
        counter[key] = (counter[key] ?? 0) + 1;
    }
}

const sorted = Object.entries(counter).sort((a, b) => b[1] - a[1]);

const label = useTags ? 'Tags' : 'Skills';
const filterLabel = classFilter ? ` (class ${classFilter})` : '';
console.log(`\n📊 Template coverage by ${label.toLowerCase()}${filterLabel}\n`);

if (sorted.length === 0) {
    console.log('  No data found. Make sure templates have the `skills` or `tags` field.');
} else {
    const maxKey = Math.max(...sorted.map(([k]) => k.length));
    for (const [key, count] of sorted) {
        const dots = '.'.repeat(Math.max(2, maxKey - key.length + 4));
        const bar = '█'.repeat(count);
        console.log(`  ${key} ${dots} ${String(count).padStart(2)} template${count === 1 ? ' ' : 's'} ${bar}`);
    }
}

// Warn about templates without skills/tags
const missing = templates.filter(t => !((t[field] as string[] | undefined)?.length));
if (missing.length > 0) {
    console.log(`\n⚠️  ${missing.length} template${missing.length > 1 ? 's' : ''} without ${field}:`);
    for (const t of missing) {
        console.log(`   - ${t.id} (class ${t.class})`);
    }
}

console.log('');
