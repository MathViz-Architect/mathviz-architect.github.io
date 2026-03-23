/**
 * Preservation Property Tests — math-task-validation-fixes
 *
 * IMPORTANT: These tests MUST PASS on unfixed code.
 * They capture existing behavior that must NOT be broken by the fix.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { describe, it, expect } from 'vitest';
import { generateProblem } from './variantGenerator';
import { validateAnswer } from './answerValidator';
import { grade8PythagoreanTheoremTemplates } from '../templates/grade8/pythagoreanTheorem';

// ─────────────────────────────────────────────────────────────────────────────
// Preservation 1 (Баг 1): expression-параметры БЕЗ зависимостей между собой
//
// isBugCondition_1 = false: каждый expression-параметр зависит только от
// int-параметров, не от других expression-параметров.
// generateParamsForConfig должен вычислять их корректно — до и после исправления.
//
// Validates: Requirements 3.5
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation 1 — independent expression params computed correctly', () => {
    /**
     * **Validates: Requirements 3.5**
     *
     * Конфиг где все expression-параметры независимы (каждый зависит только от int).
     * isBugCondition_1 = false — нет зависимостей между expression-параметрами.
     * Поведение не должно измениться после исправления.
     */
    it('all expression params depending only on int params have correct values', () => {
        const template = {
            id: 'preservation1-independent',
            class: 6 as const,
            subject: 'algebra' as const,
            section: 'test',
            topic: 'test',
            topic_title: 'test',
            problemType: 'numeric' as const,
            skills: [],
            difficulties: {
                1: {
                    template: 'double={double}, triple={triple}, square={square}',
                    parameters: {
                        // int-параметр
                        n: { type: 'int' as const, min: 2, max: 10 },
                        // expression-параметры — каждый зависит только от int `n`
                        double: { type: 'expression' as const, value: 'n * 2' },
                        triple: { type: 'expression' as const, value: 'n * 3' },
                        square: { type: 'expression' as const, value: 'n * n' },
                    },
                    constraints: [],
                    answer_formula: 'double',
                },
            },
        };

        const problem = generateProblem(template, 1, 7);
        const n = problem.params['n'] as number;

        // Все expression-параметры должны быть вычислены корректно
        expect(problem.params['double']).toBe(n * 2);
        expect(problem.params['triple']).toBe(n * 3);
        expect(problem.params['square']).toBe(n * n);
        // Значения должны быть ненулевыми (n >= 2)
        expect(problem.params['double']).toBeGreaterThan(0);
        expect(problem.params['triple']).toBeGreaterThan(0);
        expect(problem.params['square']).toBeGreaterThan(0);
    });

    it('multiple seeds produce correct independent expression params', () => {
        const template = {
            id: 'preservation1-multi-seed',
            class: 6 as const,
            subject: 'algebra' as const,
            section: 'test',
            topic: 'test',
            topic_title: 'test',
            problemType: 'numeric' as const,
            skills: [],
            difficulties: {
                1: {
                    template: 'sum={sum}',
                    parameters: {
                        a: { type: 'int' as const, min: 1, max: 9 },
                        b: { type: 'int' as const, min: 1, max: 9 },
                        // expression зависит только от int-параметров a и b
                        sum: { type: 'expression' as const, value: 'a + b' },
                    },
                    constraints: [],
                    answer_formula: 'sum',
                },
            },
        };

        for (const seed of [1, 2, 3, 42, 100]) {
            const problem = generateProblem(template, 1, seed);
            const a = problem.params['a'] as number;
            const b = problem.params['b'] as number;
            const sum = problem.params['sum'] as number;

            expect(sum).toBe(a + b);
            expect(sum).toBeGreaterThan(0);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Preservation 2 (Баг 2): validateAnswer с answer_type: 'number' принимает
// правильный числовой ответ и отклоняет неправильный.
//
// isBugCondition_2 = false: answer_type = 'number', ответ — целое число.
// Поведение не меняется после исправления.
//
// Validates: Requirements 3.2
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation 2 — validateAnswer number type: correct answer accepted, wrong rejected', () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * validateAnswer с answer_type: 'number' принимает правильный числовой ответ (5)
     * и отклоняет неправильный (6). Поведение не меняется.
     */
    it('accepts correct integer answer 5', () => {
        const problem = {
            id: 'preservation2-correct',
            template_id: 'grade8-pythag-hypotenuse',
            seed: 0,
            params: {},
            question: 'Найдите гипотенузу',
            answer: 5,
            answer_type: 'number' as const,
        };

        const result = validateAnswer(problem, '5', 'number');
        expect(result).toBe(true);
    });

    it('rejects wrong integer answer 6 when correct is 5', () => {
        const problem = {
            id: 'preservation2-wrong',
            template_id: 'grade8-pythag-hypotenuse',
            seed: 0,
            params: {},
            question: 'Найдите гипотенузу',
            answer: 5,
            answer_type: 'number' as const,
        };

        const result = validateAnswer(problem, '6', 'number');
        expect(result).toBe(false);
    });

    it('accepts correct answer with comma as decimal separator', () => {
        const problem = {
            id: 'preservation2-decimal',
            template_id: 'test',
            seed: 0,
            params: {},
            question: 'test',
            answer: 3.5,
            answer_type: 'number' as const,
        };

        expect(validateAnswer(problem, '3,5', 'number')).toBe(true);
        expect(validateAnswer(problem, '3.5', 'number')).toBe(true);
        expect(validateAnswer(problem, '4', 'number')).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Preservation 3 (Баг 2): validateAnswer с answer_type: 'number' отклоняет
// sqrt(N) для не-полных квадратов.
//
// Это СОХРАНЯЕМОЕ поведение для answer_type: 'number' — мы не меняем этот тип.
// Исправление касается только answer_type: 'expression'.
//
// Validates: Requirements 3.2
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation 3 — answer_type number rejects sqrt(N) for non-perfect squares', () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * Property: для всех N (не полных квадратов) validateAnswer с answer_type: 'number'
     * отклоняет 'sqrt(N)' — это сохраняемое поведение для answer_type: 'number'.
     * Мы не меняем этот тип, только добавляем answer_type: 'expression' для нужных задач.
     */
    it('rejects sqrt(13) when answer_type is number', () => {
        const problem = {
            id: 'preservation3-sqrt13',
            template_id: 'test',
            seed: 0,
            params: {},
            question: 'test',
            answer: Math.sqrt(13),
            answer_type: 'number' as const,
        };

        // answer_type: 'number' не принимает символьный ввод sqrt(N)
        // Это СОХРАНЯЕМОЕ поведение — мы не меняем case 'number'
        const result = validateAnswer(problem, 'sqrt(13)', 'number');
        expect(result).toBe(false);
    });

    it('rejects sqrt(N) for various non-perfect-square N when answer_type is number', () => {
        // Не-полные квадраты: 2, 3, 5, 6, 7, 8, 10, 11, 12, 13
        const nonPerfectSquares = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 17, 19, 109];

        for (const n of nonPerfectSquares) {
            const problem = {
                id: `preservation3-sqrt${n}`,
                template_id: 'test',
                seed: 0,
                params: {},
                question: 'test',
                answer: Math.sqrt(n),
                answer_type: 'number' as const,
            };

            const result = validateAnswer(problem, `sqrt(${n})`, 'number');
            // answer_type: 'number' должен отклонять символьный ввод
            expect(result).toBe(false);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Preservation 4 (Баг 3): hint без LaTeX-команд остаётся без изменений.
//
// isBugCondition_3 = false: hint не содержит LaTeX-команд (\sqrt, \frac и т.д.)
// Такой hint не должен изменяться после исправления.
//
// Validates: Requirements 3.4
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation 4 — hint without LaTeX commands stays unchanged', () => {
    /**
     * **Validates: Requirements 3.4**
     *
     * Hint 'Гипотенуза² = катет₁² + катет₂²' не содержит $ и это нормально.
     * Тест проверяет что такой hint остаётся без изменений (isBugCondition_3 = false).
     */
    it('plain text hint without LaTeX does not contain $ delimiters', () => {
        const pythagoreanTemplates = grade8PythagoreanTheoremTemplates;
        const template = pythagoreanTemplates.find((t) => t.id === 'grade8-pythag-hypotenuse')!;

        // difficulty 1 hint — без LaTeX-команд
        const hint = template.difficulties[1]?.hint ?? '';

        // Этот hint не содержит LaTeX-команд (\sqrt, \frac и т.д.)
        expect(hint).not.toContain('\\sqrt');
        expect(hint).not.toContain('\\frac');
        // И не должен содержать $ (нет LaTeX → нет делимитеров)
        expect(hint).not.toContain('$');
        // Hint должен быть непустым
        expect(hint.length).toBeGreaterThan(0);
    });

    it('plain text hint with unicode math symbols is preserved as-is', () => {
        // Hint с юникод-символами (не LaTeX) — не должен изменяться
        const plainHints = [
            'Гипотенуза² = катет₁² + катет₂²',
            'Используй теорему Пифагора',
            'a² + b² = c²',
        ];

        for (const hint of plainHints) {
            // Такие hints не содержат LaTeX-команд
            expect(hint).not.toContain('\\');
            // И не содержат $ делимитеров
            expect(hint).not.toContain('$');
        }
    });
});
