/**
 * Bug Condition Exploration Tests — math-task-validation-fixes
 *
 * CRITICAL: These tests MUST FAIL on unfixed code.
 * Failure confirms the bugs exist. DO NOT fix the code or tests when they fail.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect } from 'vitest';
import { generateProblem } from './variantGenerator';
import { validateAnswer } from './answerValidator';
import { grade8PythagoreanTheoremTemplates } from '../templates/grade8/pythagoreanTheorem';

// ─────────────────────────────────────────────────────────────────────────────
// Баг 1 — isBugCondition_1: порядок вычисления expression-параметров
//
// В grade6-fraction-property difficulty 1 параметр `x` объявлен ПОСЛЕ `i`,
// но зависит от него. В grade6-common-denominator difficulty 2 параметр `num`
// зависит от `mb`, который объявлен раньше `num` в объекте, но `mb` зависит
// от `lcm`, который тоже expression. Если Object.entries обходит их в порядке
// объявления, `mb` вычисляется раньше `lcm` → mb = 0 → num = 0.
//
// На нефиксированном коде: x = 0 или num = 0 (зависит от seed/порядка ключей).
// Тест ожидает ненулевые значения → УПАДЁТ на нефиксированном коде.
// ─────────────────────────────────────────────────────────────────────────────

describe('isBugCondition_1 — expression parameter dependency order', () => {
    it('config where dependent expression param is declared BEFORE its dependency: result should not be 0', () => {
        // Синтетический конфиг воспроизводящий баг:
        // параметр `result` объявлен ДО `base`, но зависит от него.
        // В нефиксированном коде Pass 2 итерирует Object.entries в порядке объявления:
        //   1. result = base * 2  → base ещё undefined → result = 0
        //   2. base = 5           → base = 5
        // Тест ожидает result = 10 → УПАДЁТ на нефиксированном коде.
        //
        // Counterexample: result = 0 (base не вычислен в момент вычисления result)
        const template = {
            id: 'bug1-test',
            class: 6 as const,
            subject: 'algebra' as const,
            section: 'test',
            topic: 'test',
            topic_title: 'test',
            problemType: 'numeric' as const,
            skills: [],
            difficulties: {
                1: {
                    template: 'result = {result}',
                    parameters: {
                        // result объявлен ПЕРВЫМ, но зависит от base
                        result: { type: 'expression' as const, value: 'base * 2' },
                        // base объявлен ВТОРЫМ
                        base: { type: 'expression' as const, value: '5' },
                    },
                    constraints: [],
                    answer_formula: 'result',
                },
            },
        };

        const problem = generateProblem(template, 1, 42);
        // На нефиксированном коде: result = 0 (base не вычислен)
        // На исправленном коде: result = 10
        expect(problem.params['result']).toBe(10);
    });

    it('grade6-common-denominator d2: param num (= a * mb) should not be 0', () => {
        // mb = lcm / b, num = a * mb
        // В конфиге: mb объявлен ДО num, но mb зависит от lcm, который тоже expression.
        // Порядок в объекте: i, b, d, lcm, mb, md, a, c, num
        // Если lcm вычисляется корректно (нет зависимостей), mb = lcm/b корректно,
        // num = a * mb корректно. Но если порядок нарушен — mb = 0 → num = 0.
        //
        // Синтетический конфиг с явным нарушением порядка:
        // num объявлен ДО mb, mb объявлен ДО lcm
        const template = {
            id: 'bug1-chain-test',
            class: 6 as const,
            subject: 'algebra' as const,
            section: 'test',
            topic: 'test',
            topic_title: 'test',
            problemType: 'numeric' as const,
            skills: [],
            difficulties: {
                1: {
                    template: 'num = {num}',
                    parameters: {
                        // num объявлен ПЕРВЫМ, зависит от mb
                        num: { type: 'expression' as const, value: 'a * mb' },
                        // mb объявлен ВТОРЫМ, зависит от lcm
                        mb: { type: 'expression' as const, value: 'lcm / b' },
                        // lcm объявлен ТРЕТЬИМ — независимый
                        lcm: { type: 'expression' as const, value: '12' },
                        // b и a — независимые
                        b: { type: 'expression' as const, value: '4' },
                        a: { type: 'int' as const, min: 1, max: 3 },
                    },
                    constraints: [],
                    answer_formula: 'num',
                },
            },
        };

        const problem = generateProblem(template, 1, 42);
        const mb = problem.params['mb'];
        const num = problem.params['num'];

        // На нефиксированном коде: mb = 0 (lcm не вычислен), num = 0
        // На исправленном коде: mb = 3, num = a * 3 (ненулевое)
        expect(mb).toBe(3);
        expect(num).not.toBe(0);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Баг 2 — isBugCondition_2: иррациональный ответ отклоняется валидатором
//
// validateAnswer с answer_type: 'number' пытается распарсить 'sqrt(13)' как
// число → NaN → возвращает false. Тест ожидает true → УПАДЁТ.
// ─────────────────────────────────────────────────────────────────────────────

describe('isBugCondition_2 — irrational answer rejected by validator', () => {
    it('validateAnswer should accept sqrt(13) when answer = Math.sqrt(13)', () => {
        // Исправление бага 2: answer_type='expression' + числовой fallback в case 'expression'
        // позволяет принять 'sqrt(13)' когда числовые значения совпадают.
        //
        // Counterexample (нефиксированный код): validateAnswer с answer_type='expression'
        // и 'sqrt(13)' возвращал false из-за отсутствия числового fallback в checkEquivalence.
        const problem = {
            id: 'test-bug2-sqrt13',
            template_id: 'grade8-pythag-hypotenuse',
            seed: 0,
            params: {},
            question: 'test',
            answer: Math.sqrt(13),
            answer_type: 'expression' as const,
        };

        const result = validateAnswer(problem, 'sqrt(13)', 'expression');
        expect(result).toBe(true);
    });

    it('validateAnswer should accept sqrt(109) when answer = Math.sqrt(109)', () => {
        // Counterexample (нефиксированный код): validateAnswer с answer_type='expression'
        // и 'sqrt(109)' возвращал false из-за отсутствия числового fallback.
        const problem = {
            id: 'test-bug2-sqrt109',
            template_id: 'grade8-pythag-distance',
            seed: 0,
            params: {},
            question: 'test',
            answer: Math.sqrt(109),
            answer_type: 'expression' as const,
        };

        const result = validateAnswer(problem, 'sqrt(109)', 'expression');
        expect(result).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Баг 3 — isBugCondition_3: hint содержит голый LaTeX без $-делимитеров
//
// Тест фиксирует наличие бага в исходных данных шаблона.
// Тест ОЖИДАЕТ что hint СОДЕРЖИТ $-делимитеры.
// На нефиксированном коде hint не содержит $ → тест УПАДЁТ.
// ─────────────────────────────────────────────────────────────────────────────

describe('isBugCondition_3 — hint LaTeX without $ delimiters', () => {
    const pythagoreanTemplates = grade8PythagoreanTheoremTemplates;

    it('grade8-pythag-hypotenuse d2 hint should contain $ delimiters', () => {
        // Нефиксированный hint: 'Гипотенуза = \\sqrt{a^2 + b^2}' — без $
        // Counterexample: hint = 'Гипотенуза = \\sqrt{a^2 + b^2}' (нет $)
        const template = pythagoreanTemplates.find((t) => t.id === 'grade8-pythag-hypotenuse')!;
        const hint = template.difficulties[2]?.hint ?? '';
        expect(hint).toContain('$');
    });

    it('grade8-pythag-leg d2 hint should contain $ delimiters', () => {
        // Нефиксированный hint: 'b = \\sqrt{c^2 - a^2}' — без $
        // Counterexample: hint = 'b = \\sqrt{c^2 - a^2}' (нет $)
        const template = pythagoreanTemplates.find((t) => t.id === 'grade8-pythag-leg')!;
        const hint = template.difficulties[2]?.hint ?? '';
        expect(hint).toContain('$');
    });

    it('grade8-pythag-leg d3 hint should contain $ delimiters', () => {
        // Нефиксированный hint: 'Второй катет = \\sqrt{гипотенуза^2 - катет^2}' — без $
        const template = pythagoreanTemplates.find((t) => t.id === 'grade8-pythag-leg')!;
        const hint = template.difficulties[3]?.hint ?? '';
        expect(hint).toContain('$');
    });

    it('grade8-pythag-distance d1 hint should contain $ delimiters', () => {
        // Нефиксированный hint: 'Расстояние = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}' — без $
        // Counterexample: hint = 'Расстояние = \\sqrt{...}' (нет $)
        const template = pythagoreanTemplates.find((t) => t.id === 'grade8-pythag-distance')!;
        const hint = template.difficulties[1]?.hint ?? '';
        expect(hint).toContain('$');
    });
});
