/**
 * Bug Condition Exploration Tests — grade8-pythag-bugfixes
 *
 * These tests verify that the bugs described in the spec are FIXED.
 * All tests must PASS on the corrected code.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.5
 */

import { describe, it, expect } from 'vitest';
import { grade8PythagoreanTheoremTemplates } from './pythagoreanTheorem';

const hypotTemplate = grade8PythagoreanTheoremTemplates.find(
    (t) => t.id === 'grade8-pythag-hypotenuse',
)!;

const legTemplate = grade8PythagoreanTheoremTemplates.find(
    (t) => t.id === 'grade8-pythag-leg',
)!;

const distanceTemplate = grade8PythagoreanTheoremTemplates.find(
    (t) => t.id === 'grade8-pythag-distance',
)!;

describe('Bug Fixes Verified — grade8-pythag-bugfixes', () => {
    /**
     * Fix 1.1: grade8-pythag-hypotenuse level 1 produces integer answers.
     * Level 1 is "целые стороны" — answer_type must NOT be 'expression'.
     * The answer_formula produces an integer, so no answer_type override needed.
     * Validates: Requirements 1.1 (integer answer at level 1)
     */
    it('Fix 1.1: grade8-pythag-hypotenuse level 1 has no answer_type (integer answer)', () => {
        const level1 = (hypotTemplate.difficulties as Record<number, { answer_type?: string }>)[1];
        // Level 1 uses pythagorean triples → integer result → no answer_type needed
        expect(level1.answer_type).toBeUndefined();
    });

    /**
     * Fix 1.3: grade8-pythag-hypotenuse level 1 constraints enforce integer hypotenuse.
     * Uses Math.sqrt(a*a + b*b) % 1 === 0 to guarantee pythagorean triples.
     * Validates: Requirements 1.3
     */
    it('Fix 1.3: grade8-pythag-hypotenuse level 1 constraints include integer-hypotenuse check via % 1 === 0', () => {
        const level1 = (hypotTemplate.difficulties as Record<number, { constraints: string[] }>)[1];
        const hasIntegerCheck = level1.constraints.some((c) =>
            c.includes('Math.sqrt(a*a + b*b)') && c.includes('% 1 === 0'),
        );
        expect(hasIntegerCheck).toBe(true);
    });

    /**
     * Fix 1.3 (runtime): a=5, b=8 must be rejected by level 1 constraint (√89 is irrational).
     * Validates: Requirements 1.3
     */
    it('Fix 1.3 (runtime): a=5, b=8 is rejected by level 1 constraint', () => {
        const level1 = (hypotTemplate.difficulties as Record<number, { constraints: string[] }>)[1];
        const a = 5;
        const b = 8;

        const allConstraintsSatisfied = level1.constraints.every((constraintStr) => {
            // eslint-disable-next-line no-new-func
            const fn = new Function('a', 'b', `return (${constraintStr});`);
            return fn(a, b);
        });

        // √89 is irrational — level 1 must reject this pair
        expect(allConstraintsSatisfied).toBe(false);
    });

    /**
     * Fix 1.3 (runtime): a=3, b=4 must be accepted by level 1 constraint (√25 = 5, integer).
     * Validates: Requirements 1.3
     */
    it('Fix 1.3 (runtime): a=3, b=4 is accepted by level 1 constraint (3-4-5 triple)', () => {
        const level1 = (hypotTemplate.difficulties as Record<number, { constraints: string[] }>)[1];
        const a = 3;
        const b = 4;

        const allConstraintsSatisfied = level1.constraints.every((constraintStr) => {
            // eslint-disable-next-line no-new-func
            const fn = new Function('a', 'b', `return (${constraintStr});`);
            return fn(a, b);
        });

        expect(allConstraintsSatisfied).toBe(true);
    });

    /**
     * Fix 1.2 + 1.5: Solution strings use expression-type params (sum, diff, dsum)
     * referenced as $\sqrt{sum}$ — no raw arithmetic inside LaTeX blocks.
     * Validates: Requirements 1.2, 1.5
     */
    it('Fix 1.2/1.5: solution strings reference pre-computed params in \\sqrt{}, not raw arithmetic', () => {
        // Pattern that detects raw arithmetic inside \sqrt{} — these should NOT exist
        // e.g. \sqrt{a*a + b*b} or \sqrt{(x2-x1)*(x2-x1)+...}
        const rawArithmeticInSqrt = /\\sqrt\{[^{}]*[+\-*\/][^{}]*\}/g;

        const violations: string[] = [];

        const checkTemplate = (templateId: string, template: typeof hypotTemplate) => {
            const difficulties = template.difficulties as Record<
                number,
                { solution?: Array<{ explanation?: string; result?: string }> }
            >;
            for (const [level, diff] of Object.entries(difficulties)) {
                if (!diff.solution) continue;
                for (const step of diff.solution) {
                    const text = step.explanation ?? '';
                    const matches = [...text.matchAll(rawArithmeticInSqrt)];
                    for (const m of matches) {
                        violations.push(
                            `${templateId} level ${level}: raw arithmetic in \\sqrt: ${m[0]}`,
                        );
                    }
                }
            }
        };

        checkTemplate('grade8-pythag-hypotenuse', hypotTemplate);
        checkTemplate('grade8-pythag-leg', legTemplate);
        checkTemplate('grade8-pythag-distance', distanceTemplate);

        expect(violations).toEqual([]);
    });

    /**
     * Fix 1.2: expression-type parameters (sum, diff, dsum) are defined in templates.
     * These pre-compute values so $\sqrt{sum}$ renders correctly.
     * Validates: Requirements 1.2
     */
    it('Fix 1.2: hypotenuse levels 1-4 define "sum" as expression parameter', () => {
        const difficulties = hypotTemplate.difficulties as Record<
            number,
            { parameters?: Record<string, { type: string; value?: string }> }
        >;
        for (const level of [1, 2, 3, 4]) {
            const diff = difficulties[level];
            if (!diff) continue;
            expect(diff.parameters?.sum?.type).toBe('expression');
            expect(diff.parameters?.sum?.value).toBe('a*a + b*b');
        }
    });

    it('Fix 1.2: leg levels 1-3 define "diff" as expression parameter', () => {
        const difficulties = legTemplate.difficulties as Record<
            number,
            { parameters?: Record<string, { type: string; value?: string }> }
        >;
        for (const level of [1, 2, 3]) {
            const diff = difficulties[level];
            if (!diff) continue;
            expect(diff.parameters?.diff?.type).toBe('expression');
            expect(diff.parameters?.diff?.value).toBe('c*c - a*a');
        }
    });

    it('Fix 1.5: distance levels 1-3 define "dsum" as expression parameter', () => {
        const difficulties = distanceTemplate.difficulties as Record<
            number,
            { parameters?: Record<string, { type: string; value?: string }> }
        >;
        for (const level of [1, 2, 3]) {
            const diff = difficulties[level];
            if (!diff) continue;
            expect(diff.parameters?.dsum?.type).toBe('expression');
        }
    });
});
