/**
 * Preservation Property Tests — grade8-pythag-bugfixes
 *
 * These tests document the baseline behavior that must be preserved
 * after all fixes are applied. All tests must PASS.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { describe, it, expect } from 'vitest';
import { grade8PythagoreanTheoremTemplates } from './pythagoreanTheorem';

type DifficultyLevel = {
    template?: string;
    parameters?: Record<string, unknown>;
    constraints?: string[];
    answer_formula?: string;
    answer_type?: string;
    hint?: string;
    solution?: Array<{ explanation?: string; result?: string }>;
    common_mistakes?: Array<{ pattern: string; feedback: string }>;
};

const hypotTemplate = grade8PythagoreanTheoremTemplates.find(
    (t) => t.id === 'grade8-pythag-hypotenuse',
)!;

const legTemplate = grade8PythagoreanTheoremTemplates.find(
    (t) => t.id === 'grade8-pythag-leg',
)!;

const checkTemplate = grade8PythagoreanTheoremTemplates.find(
    (t) => t.id === 'grade8-pythag-check',
)!;

const distanceTemplate = grade8PythagoreanTheoremTemplates.find(
    (t) => t.id === 'grade8-pythag-distance',
)!;

const getDifficulty = (template: typeof hypotTemplate, level: number): DifficultyLevel =>
    (template.difficulties as Record<number, DifficultyLevel>)[level];

describe('Preservation — grade8-pythag-bugfixes', () => {

    /**
     * Preservation 1: grade8-pythag-hypotenuse answer_type per level
     * Level 1: no answer_type (integer answer via pythagorean triples)
     * Levels 2, 3, 4: answer_type === 'expression' (irrational results)
     * Validates: Requirements 3.1
     */
    describe('grade8-pythag-hypotenuse — answer_type per level', () => {
        it('level 1 has no answer_type (integer answer)', () => {
            const level1 = getDifficulty(hypotTemplate, 1);
            expect(level1.answer_type).toBeUndefined();
        });

        it('level 2 has answer_type === "expression"', () => {
            const level2 = getDifficulty(hypotTemplate, 2);
            expect(level2.answer_type).toBe('expression');
        });

        it('level 3 has answer_type === "expression"', () => {
            const level3 = getDifficulty(hypotTemplate, 3);
            expect(level3.answer_type).toBe('expression');
        });

        it('level 4 has answer_type === "expression"', () => {
            const level4 = getDifficulty(hypotTemplate, 4);
            expect(level4.answer_type).toBe('expression');
        });
    });

    /**
     * Preservation 2: grade8-pythag-hypotenuse constraints per level
     * Validates: Requirements 3.1
     */
    describe('grade8-pythag-hypotenuse — constraints preserved', () => {
        it('level 1 constraints include a !== b and integer-hypotenuse check', () => {
            const level1 = getDifficulty(hypotTemplate, 1);
            expect(level1.constraints).toContain('a !== b');
            const hasIntegerCheck = (level1.constraints ?? []).some(
                (c) => c.includes('Math.sqrt(a*a + b*b)') && c.includes('% 1 === 0'),
            );
            expect(hasIntegerCheck).toBe(true);
        });

        it('level 2 constraints include a !== b and irrational-hypotenuse check', () => {
            const level2 = getDifficulty(hypotTemplate, 2);
            expect(level2.constraints).toContain('a !== b');
            const hasIrrationalCheck = (level2.constraints ?? []).some(
                (c) => c.includes('Math.sqrt(a*a + b*b)') && c.includes('% 1 !== 0'),
            );
            expect(hasIrrationalCheck).toBe(true);
        });

        it('level 3 constraints contain a !== b', () => {
            const level3 = getDifficulty(hypotTemplate, 3);
            expect(level3.constraints).toContain('a !== b');
        });

        it('level 4 constraints contain a !== b', () => {
            const level4 = getDifficulty(hypotTemplate, 4);
            expect(level4.constraints).toContain('a !== b');
        });
    });

    /**
     * Preservation 3: grade8-pythag-check — not touched by fix
     * Validates: Requirements 3.3
     */
    describe('grade8-pythag-check — not touched by fix', () => {
        it('level 1 answer_formula does not contain sqrt', () => {
            const level1 = getDifficulty(checkTemplate, 1);
            expect(level1.answer_formula).not.toContain('sqrt');
            expect(level1.answer_formula).toBe('a*a + b*b === c*c ? "да" : "нет"');
        });

        it('level 2 answer_formula does not contain sqrt', () => {
            const level2 = getDifficulty(checkTemplate, 2);
            expect(level2.answer_formula).not.toContain('sqrt');
            expect(level2.answer_formula).toBe('a*a + b*b === c*c ? c : a*a + c*c === b*b ? b : a');
        });

        it('level 1 solution steps do not contain \\sqrt', () => {
            const level1 = getDifficulty(checkTemplate, 1);
            for (const step of level1.solution ?? []) {
                expect(step.explanation ?? '').not.toContain('\\sqrt');
            }
        });

        it('level 2 solution steps do not contain \\sqrt', () => {
            const level2 = getDifficulty(checkTemplate, 2);
            for (const step of level2.solution ?? []) {
                expect(step.explanation ?? '').not.toContain('\\sqrt');
            }
        });

        it('level 1 template text is unchanged', () => {
            const level1 = getDifficulty(checkTemplate, 1);
            expect(level1.template).toBe(
                'Могут ли стороны {a}, {b}, {c} быть сторонами прямоугольного треугольника?',
            );
        });

        it('level 2 template text is unchanged', () => {
            const level2 = getDifficulty(checkTemplate, 2);
            expect(level2.template).toBe(
                'В треугольнике со сторонами {a}, {b}, {c} найдите гипотенузу, если он прямоугольный.',
            );
        });
    });

    /**
     * Preservation 4: grade8-pythag-leg level 1 — integer-leg constraint
     * Uses % 1 === 0 pattern (not Math.floor)
     * Validates: Requirements 3.2
     */
    describe('grade8-pythag-leg level 1 — integer-leg constraint preserved', () => {
        it('level 1 constraints include integer-leg check via % 1 === 0', () => {
            const level1 = getDifficulty(legTemplate, 1);
            const hasIntegerCheck = (level1.constraints ?? []).some(
                (c) => c.includes('Math.sqrt') && c.includes('% 1 === 0'),
            );
            expect(hasIntegerCheck).toBe(true);
        });

        it('level 1 constraints include c > a', () => {
            const level1 = getDifficulty(legTemplate, 1);
            expect(level1.constraints).toContain('c > a');
        });

        it('level 1 constraints include diff > 0', () => {
            const level1 = getDifficulty(legTemplate, 1);
            expect(level1.constraints).toContain('diff > 0');
        });
    });

    /**
     * Preservation 5: grade8-pythag-distance — uses pre-computed dsum param
     * Solution references $\sqrt{dsum}$ (not double-brace interpolation)
     * Validates: Requirements 3.4
     */
    describe('grade8-pythag-distance — dsum expression param used in solution', () => {
        it('level 1 solution references $\\sqrt{dsum}$', () => {
            const level1 = getDifficulty(distanceTemplate, 1);
            const hasDsumRef = (level1.solution ?? []).some(
                (step) => (step.explanation ?? '').includes('\\sqrt{dsum}'),
            );
            expect(hasDsumRef).toBe(true);
        });

        it('level 2 solution references $\\sqrt{dsum}$', () => {
            const level2 = getDifficulty(distanceTemplate, 2);
            const hasDsumRef = (level2.solution ?? []).some(
                (step) => (step.explanation ?? '').includes('\\sqrt{dsum}'),
            );
            expect(hasDsumRef).toBe(true);
        });

        it('level 2 answer_type is "expression"', () => {
            const level2 = getDifficulty(distanceTemplate, 2);
            expect(level2.answer_type).toBe('expression');
        });

        it('level 2 answer_formula is correct', () => {
            const level2 = getDifficulty(distanceTemplate, 2);
            expect(level2.answer_formula).toBe(
                'Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1))',
            );
        });
    });

    /**
     * Preservation 6: grade8-pythag-distance level 3 — not touched by fix
     * Validates: Requirements 3.4
     */
    describe('grade8-pythag-distance level 3 — not touched by fix', () => {
        it('level 3 answer_type is "expression"', () => {
            const level3 = getDifficulty(distanceTemplate, 3);
            expect(level3.answer_type).toBe('expression');
        });

        it('level 3 answer_formula is correct', () => {
            const level3 = getDifficulty(distanceTemplate, 3);
            expect(level3.answer_formula).toBe(
                'Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1))',
            );
        });
    });

    /**
     * Preservation 7: All templates — core fields preserved
     * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
     */
    describe('All templates — core fields preserved', () => {
        it('grade8-pythag-hypotenuse level 1 answer_formula is unchanged', () => {
            const level1 = getDifficulty(hypotTemplate, 1);
            expect(level1.answer_formula).toBe('Math.sqrt(a*a + b*b)');
        });

        it('grade8-pythag-hypotenuse level 2 answer_formula is unchanged', () => {
            const level2 = getDifficulty(hypotTemplate, 2);
            expect(level2.answer_formula).toBe('Math.sqrt(a*a + b*b)');
        });

        it('grade8-pythag-hypotenuse level 3 answer_formula is unchanged', () => {
            const level3 = getDifficulty(hypotTemplate, 3);
            expect(level3.answer_formula).toBe('Math.sqrt(a*a + b*b)');
        });

        it('grade8-pythag-leg level 1 answer_formula is unchanged', () => {
            const level1 = getDifficulty(legTemplate, 1);
            expect(level1.answer_formula).toBe('Math.sqrt(c*c - a*a)');
        });

        it('grade8-pythag-leg level 1 hint is unchanged', () => {
            const level1 = getDifficulty(legTemplate, 1);
            expect(level1.hint).toBe('Катет² = гипотенуза² - другой катет²');
        });

        it('grade8-pythag-hypotenuse level 2 hint contains "Гипотенуза"', () => {
            const level2 = getDifficulty(hypotTemplate, 2);
            expect(level2.hint).toContain('Гипотенуза');
        });

        it('grade8-pythag-check level 1 hint is unchanged', () => {
            const level1 = getDifficulty(checkTemplate, 1);
            expect(level1.hint).toBe('Проверьте теорему Пифагора для каждой возможной гипотенузы.');
        });

        it('grade8-pythag-hypotenuse level 1 solution result is a computed integer (not sqrt string)', () => {
            const level1 = getDifficulty(hypotTemplate, 1);
            const lastStep = (level1.solution ?? []).at(-1);
            // Level 1 result should be {Math.sqrt(sum)} — a number, not sqrt(N)
            expect(lastStep?.result).toContain('Math.sqrt');
            expect(lastStep?.result).not.toContain('sqrt({');
        });

        it('grade8-pythag-leg level 1 solution result is a computed integer (not sqrt string)', () => {
            const level1 = getDifficulty(legTemplate, 1);
            const lastStep = (level1.solution ?? []).at(-1);
            // Level 1 result should be {Math.sqrt(diff)} — a number, not sqrt(N)
            expect(lastStep?.result).toContain('Math.sqrt');
            expect(lastStep?.result).not.toContain('sqrt({');
        });
    });
});
