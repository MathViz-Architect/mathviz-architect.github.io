/**
 * TemplateDebug — QA инструмент для визуального аудита шаблонов задач.
 * Маршрут: /debug/templates
 *
 * Использование: добавить в App.tsx или роутер (см. README раздел "QA").
 * Только для dev-окружения — не включать в production bundle.
 */

import React, { useState, useCallback } from 'react';
import { problemTemplates } from '@/lib/templates/index';
import { generateProblem } from '@/lib/engine/variantGenerator';
import { ProblemTemplate, GeneratedProblem } from '@/lib/types';
import MathText from './MathText';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewEntry {
    seed: number;
    problem: GeneratedProblem;
    error?: never;
}

interface ErrorEntry {
    seed: number;
    error: string;
    problem?: never;
}

type VariantEntry = PreviewEntry | ErrorEntry;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Group templates by class number */
function groupByClass(templates: ProblemTemplate[]): Map<number, ProblemTemplate[]> {
    const map = new Map<number, ProblemTemplate[]>();
    for (const t of templates) {
        const list = map.get(t.class) ?? [];
        list.push(t);
        map.set(t.class, list);
    }
    return new Map([...map.entries()].sort((a, b) => a[0] - b[0]));
}

/** Generate N variants for a template at a given difficulty */
function generateVariants(template: ProblemTemplate, difficulty: 1 | 2 | 3 | 4, count: number): VariantEntry[] {
    const results: VariantEntry[] = [];
    for (let i = 0; i < count; i++) {
        const seed = 1000 + i * 997; // deterministic but spread seeds
        try {
            const problem = generateProblem(template, difficulty, seed);
            results.push({ seed, problem });
        } catch (e) {
            results.push({ seed, error: e instanceof Error ? e.message : String(e) });
        }
    }
    return results;
}

/** Available difficulties for a template */
function availableDifficulties(template: ProblemTemplate): (1 | 2 | 3 | 4)[] {
    return ([1, 2, 3, 4] as const).filter(d => template.difficulties[d] !== undefined);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ParamBadge: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono">
        <span className="text-slate-400">{label}=</span>
        <span>{String(value)}</span>
    </span>
);

const AnswerBadge: React.FC<{ answer: string | number; answerType?: string }> = ({ answer, answerType }) => {
    const isInvalid = typeof answer === 'number' && !isFinite(answer);
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-semibold
            ${isInvalid ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700'}`}>
            {isInvalid ? '⚠️ ' : '✓ '}
            {String(answer)}
            {answerType && answerType !== 'number' && (
                <span className="ml-1 text-slate-400 font-normal">({answerType})</span>
            )}
        </span>
    );
};

const VariantCard: React.FC<{ entry: VariantEntry; index: number }> = ({ entry, index }) => {
    if (entry.error) {
        return (
            <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                <div className="text-xs text-red-500 font-mono mb-1">Вариант {index + 1} · seed={entry.seed}</div>
                <div className="text-sm text-red-700">⚠️ {entry.error}</div>
            </div>
        );
    }

    const { problem } = entry;
    const params = Object.entries(problem.params);

    return (
        <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="text-xs text-slate-400 font-mono mb-2">
                Вариант {index + 1} · seed={entry.seed}
            </div>

            {/* Question */}
            <div className="mb-3">
                <MathText>{problem.question}</MathText>
            </div>

            {/* Params */}
            {params.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {params.map(([k, v]) => <ParamBadge key={k} label={k} value={v} />)}
                </div>
            )}

            {/* Answer */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Ответ:</span>
                <AnswerBadge answer={problem.answer} answerType={problem.answer_type} />
            </div>

            {/* Hints count */}
            {problem.hints && problem.hints.length > 0 && (
                <div className="mt-1 text-xs text-slate-400">
                    {problem.hints.length} подсказок
                </div>
            )}
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const TemplateDebug: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4>(1);
    const [variantCount, setVariantCount] = useState(3);
    const [search, setSearch] = useState('');

    const grouped = groupByClass(problemTemplates);

    const filtered = search.trim()
        ? problemTemplates.filter(t =>
            t.id.toLowerCase().includes(search.toLowerCase()) ||
            t.topic.toLowerCase().includes(search.toLowerCase()) ||
            t.section.toLowerCase().includes(search.toLowerCase())
        )
        : null;

    const selectedTemplate = selectedId
        ? problemTemplates.find(t => t.id === selectedId) ?? null
        : null;

    const variants = selectedTemplate
        ? generateVariants(selectedTemplate, difficulty, variantCount)
        : [];

    const handleSelect = useCallback((id: string, template: ProblemTemplate) => {
        setSelectedId(id);
        // Auto-select first available difficulty
        const avail = availableDifficulties(template);
        if (avail.length > 0 && !avail.includes(difficulty)) {
            setDifficulty(avail[0]);
        }
    }, [difficulty]);

    const difficultyLabel: Record<number, string> = { 1: 'Лёгкий', 2: 'Средний', 3: 'Сложный', 4: 'Олимпиадный' };

    return (
        <div className="h-screen flex flex-col bg-slate-50 font-sans">
            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4">
                <span className="font-semibold text-slate-800">🔍 Template Debug</span>
                <span className="text-xs text-slate-400">{problemTemplates.length} шаблонов</span>
                <input
                    type="text"
                    placeholder="Поиск по id / topic / section..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="ml-auto w-64 px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-indigo-400"
                />
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
                    {filtered ? (
                        <div className="p-2">
                            <div className="text-xs text-slate-400 px-2 py-1">
                                Результаты: {filtered.length}
                            </div>
                            {filtered.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleSelect(t.id, t)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                                        ${selectedId === t.id
                                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                                            : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="font-mono text-xs text-slate-400">{t.id}</div>
                                    <div className="truncate">{t.section}</div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        [...grouped.entries()].map(([cls, templates]) => (
                            <div key={cls}>
                                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-100">
                                    {cls} класс · {templates.length} шт.
                                </div>
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleSelect(t.id, t)}
                                        className={`w-full text-left px-3 py-2 text-sm transition-colors border-b border-slate-50
                                            ${selectedId === t.id
                                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="font-mono text-xs text-slate-400 truncate">{t.id}</div>
                                        <div className="truncate text-xs mt-0.5">{t.section}</div>
                                    </button>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {/* Main area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!selectedTemplate ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            Выберите шаблон из списка слева
                        </div>
                    ) : (
                        <div className="max-w-2xl">
                            {/* Template meta */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-mono text-sm text-slate-500">{selectedTemplate.id}</span>
                                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">{selectedTemplate.class} кл.</span>
                                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs">{selectedTemplate.subject}</span>
                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">{selectedTemplate.topic}</span>
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800">{selectedTemplate.section}</h2>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-4 mb-5 p-3 bg-white rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Сложность:</span>
                                    <div className="flex gap-1">
                                        {([1, 2, 3, 4] as const).map(d => {
                                            const avail = selectedTemplate.difficulties[d] !== undefined;
                                            return (
                                                <button
                                                    key={d}
                                                    onClick={() => avail && setDifficulty(d)}
                                                    disabled={!avail}
                                                    className={`px-2 py-1 rounded text-xs transition-colors
                                                        ${!avail ? 'opacity-30 cursor-not-allowed text-slate-400' :
                                                            difficulty === d ? 'bg-indigo-600 text-white' :
                                                                'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                >
                                                    {difficultyLabel[d]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-xs text-slate-500">Вариантов:</span>
                                    {[3, 5].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setVariantCount(n)}
                                            className={`px-2 py-1 rounded text-xs transition-colors
                                                ${variantCount === n ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Variants */}
                            <div className="flex flex-col gap-3">
                                {variants.map((entry, i) => (
                                    <VariantCard key={entry.seed} entry={entry} index={i} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateDebug;
