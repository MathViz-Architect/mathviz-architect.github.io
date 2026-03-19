/**
 * variantGenerator — unit + property-like tests
 *
 * Critical zones:
 * - Determinism: same seed → same output (essential for reproducibility)
 * - No undefined/NaN in generated output
 * - Constraint loop: 100 attempts exhausted → silent fallback (Bug #3)
 * - Difficulty fallback: requested level missing → nearest available
 * - All {param} placeholders substituted in question/hint/solution
 */

import { describe, it, expect } from 'vitest';
import { generateProblem } from '../engine/variantGenerator';
import type { ProblemTemplate } from '../types';

// ─── Minimal valid template factory ──────────────────────────────────────────

function makeTemplate(overrides: Partial<ProblemTemplate> = {}): ProblemTemplate {
    return {
        id: 'test-template',
        class: 7,
        subject: 'algebra',
        section: 'Equations',
        topic: 'linear',
        topic_title: 'Linear Equations',
        problemType: 'numeric',
        difficulties: {
            1: {
                template: 'Solve {a}x + {b} = {c}',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: 1, max: 10 },
                    c: { type: 'int', min: 5, max: 20 },
                },
                answer_formula: '(c - b) / a',
                answer_type: 'number',
            },
        },
        ...overrides,
    };
}

// ─── Determinism ─────────────────────────────────────────────────────────────

describe('generateProblem — determinism', () => {
    it('produces identical output for the same seed', () => {
        const template = makeTemplate();
        const p1 = generateProblem(template, 1, 42);
        const p2 = generateProblem(template, 1, 42);
        expect(p1.params).toEqual(p2.params);
        expect(p1.question).toBe(p2.question);
        expect(p1.answer).toBe(p2.answer);
    });

    it('produces different output for different seeds', () => {
        const template = makeTemplate();
        const results = new Set<string>();
        for (let seed = 0; seed < 20; seed++) {
            results.add(JSON.stringify(generateProblem(template, 1, seed).params));
        }
        // With 20 different seeds, we expect at least 2 distinct param sets
        expect(results.size).toBeGreaterThan(1);
    });

    it('id encodes template id and seed', () => {
        const p = generateProblem(makeTemplate(), 1, 99);
        expect(p.id).toBe(`test-template-99`);
        expect(p.seed).toBe(99);
        expect(p.template_id).toBe('test-template');
    });
});

// ─── Output structure ─────────────────────────────────────────────────────────

describe('generateProblem — output structure', () => {
    it('generates all required fields', () => {
        const p = generateProblem(makeTemplate(), 1, 1);
        expect(p.id).toBeDefined();
        expect(p.template_id).toBe('test-template');
        expect(p.params).toBeDefined();
        expect(p.question).toBeDefined();
        expect(p.answer).toBeDefined();
        expect(p.answer_type).toBe('number');
    });

    it('answer is not NaN', () => {
        const template = makeTemplate();
        for (let seed = 0; seed < 50; seed++) {
            const p = generateProblem(template, 1, seed);
            expect(Number.isNaN(Number(p.answer))).toBe(false);
        }
    });

    it('answer is not undefined', () => {
        const p = generateProblem(makeTemplate(), 1, 1);
        expect(p.answer).not.toBeUndefined();
    });

    it('all {param} placeholders are substituted in question', () => {
        const template = makeTemplate();
        for (let seed = 0; seed < 30; seed++) {
            const p = generateProblem(template, 1, seed);
            expect(p.question).not.toMatch(/\{[a-zA-Z_]+\}/);
        }
    });

    it('params contain all declared parameter keys', () => {
        const p = generateProblem(makeTemplate(), 1, 1);
        expect(p.params).toHaveProperty('a');
        expect(p.params).toHaveProperty('b');
        expect(p.params).toHaveProperty('c');
    });

    it('int params are within declared range', () => {
        const template = makeTemplate();
        for (let seed = 0; seed < 50; seed++) {
            const p = generateProblem(template, 1, seed);
            expect(Number(p.params.a)).toBeGreaterThanOrEqual(1);
            expect(Number(p.params.a)).toBeLessThanOrEqual(5);
            expect(Number(p.params.b)).toBeGreaterThanOrEqual(1);
            expect(Number(p.params.b)).toBeLessThanOrEqual(10);
        }
    });
});

// ─── Hint and solution substitution ──────────────────────────────────────────

describe('generateProblem — hint/solution substitution', () => {
    it('substitutes params in hint', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: 'Solve {a}x + {b} = {c}',
                    parameters: {
                        a: { type: 'int', min: 2, max: 2 },
                        b: { type: 'int', min: 3, max: 3 },
                        c: { type: 'int', min: 7, max: 7 },
                    },
                    answer_formula: '(c - b) / a',
                    answer_type: 'number',
                    hint: 'Subtract {b} from both sides',
                },
            },
        });
        const p = generateProblem(template, 1, 1);
        expect(p.hint).toBe('Subtract 3 from both sides');
        expect(p.hint).not.toMatch(/\{[a-zA-Z_]+\}/);
    });

    it('substitutes params in hints array', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: 'Solve {a}x = {c}',
                    parameters: {
                        a: { type: 'int', min: 3, max: 3 },
                        c: { type: 'int', min: 9, max: 9 },
                    },
                    answer_formula: 'c / a',
                    answer_type: 'number',
                    hints: ['Divide both sides by {a}', 'x = {c} / {a}'],
                },
            },
        });
        const p = generateProblem(template, 1, 1);
        expect(p.hints).toBeDefined();
        expect(p.hints![0]).toBe('Divide both sides by 3');
        expect(p.hints![1]).toBe('x = 9 / 3');
    });

    it('substitutes {answer} placeholder in solution steps', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: 'Solve {a}x = {c}',
                    parameters: {
                        a: { type: 'int', min: 2, max: 2 },
                        c: { type: 'int', min: 8, max: 8 },
                    },
                    answer_formula: 'c / a',
                    answer_type: 'number',
                    solution: [
                        { explanation: 'Divide both sides by {a}' },
                        { explanation: 'x = {answer}', result: '{answer}' },
                    ],
                },
            },
        });
        const p = generateProblem(template, 1, 1);
        expect(p.solution).toBeDefined();
        expect(p.solution![0].explanation).toBe('Divide both sides by 2');
        expect(p.solution![1].explanation).toBe('x = 4');
        expect(p.solution![1].result).toBe('4');
    });
});

// ─── Difficulty fallback ──────────────────────────────────────────────────────

describe('generateProblem — difficulty fallback', () => {
    it('falls back to lower difficulty when requested level missing', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: 'Easy: {a} + {b}',
                    parameters: {
                        a: { type: 'int', min: 1, max: 5 },
                        b: { type: 'int', min: 1, max: 5 },
                    },
                    answer_formula: 'a + b',
                    answer_type: 'number',
                },
                // level 2 and 3 missing
            },
        });
        // Requesting level 3 — should fall back to level 1
        const p = generateProblem(template, 3, 1);
        expect(p.question).toMatch(/^Easy:/);
    });

    it('falls back to higher difficulty when only higher available', () => {
        const template = makeTemplate({
            difficulties: {
                3: {
                    template: 'Hard: {a} * {b}',
                    parameters: {
                        a: { type: 'int', min: 10, max: 20 },
                        b: { type: 'int', min: 10, max: 20 },
                    },
                    answer_formula: 'a * b',
                    answer_type: 'number',
                },
            },
        });
        // Requesting level 1 — should fall back to level 3
        const p = generateProblem(template, 1, 1);
        expect(p.question).toMatch(/^Hard:/);
    });

    it('throws when template has no difficulty configs at all', () => {
        const template = makeTemplate({ difficulties: {} });
        expect(() => generateProblem(template, 1, 1)).toThrow();
    });
});

// ─── Constraints ─────────────────────────────────────────────────────────────

describe('generateProblem — constraints', () => {
    it('satisfies a simple constraint (a != b)', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: '{a} and {b}',
                    parameters: {
                        a: { type: 'int', min: 1, max: 3 },
                        b: { type: 'int', min: 1, max: 3 },
                    },
                    constraints: ['a != b'],
                    answer_formula: 'a + b',
                    answer_type: 'number',
                },
            },
        });
        for (let seed = 0; seed < 30; seed++) {
            const p = generateProblem(template, 1, seed);
            expect(p.params.a).not.toBe(p.params.b);
        }
    });

    it('satisfies a divisibility constraint (c % a == 0)', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: 'Solve {a}x = {c}',
                    parameters: {
                        a: { type: 'int', min: 2, max: 5 },
                        c: { type: 'int', min: 2, max: 20 },
                    },
                    constraints: ['c % a == 0'],
                    answer_formula: 'c / a',
                    answer_type: 'number',
                },
            },
        });
        for (let seed = 0; seed < 30; seed++) {
            const p = generateProblem(template, 1, seed);
            const a = Number(p.params.a);
            const c = Number(p.params.c);
            expect(c % a).toBe(0);
        }
    });

    /**
     * ⚠️ Bug #3: if constraints are impossible to satisfy in 100 attempts,
     * generateProblem silently returns params that violate the constraint.
     * This test documents the current behaviour.
     */
    it('silently returns violating params when constraint is impossible (Bug #3)', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: '{a}',
                    parameters: {
                        a: { type: 'int', min: 5, max: 5 }, // always 5
                    },
                    constraints: ['a > 10'], // impossible: a is always 5
                    answer_formula: 'a',
                    answer_type: 'number',
                },
            },
        });
        // Should not throw — silently returns a=5 despite constraint violation
        expect(() => generateProblem(template, 1, 1)).not.toThrow();
        const p = generateProblem(template, 1, 1);
        // a=5 violates a>10, but the function returns it anyway
        expect(Number(p.params.a)).toBe(5);
    });
});

// ─── Expression parameters ────────────────────────────────────────────────────

describe('generateProblem — expression parameters', () => {
    it('evaluates expression parameter from int params', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: '{a} * {b} = {product}',
                    parameters: {
                        a: { type: 'int', min: 2, max: 4 },
                        b: { type: 'int', min: 2, max: 4 },
                        product: { type: 'expression', value: 'a * b' },
                    },
                    answer_formula: 'product',
                    answer_type: 'number',
                },
            },
        });
        for (let seed = 0; seed < 20; seed++) {
            const p = generateProblem(template, 1, seed);
            const a = Number(p.params.a);
            const b = Number(p.params.b);
            const product = Number(p.params.product);
            expect(product).toBe(a * b);
        }
    });

    it('choice parameter picks from declared values', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: 'Sign: {sign}',
                    parameters: {
                        sign: { type: 'choice', values: ['+', '-', '*'] },
                    },
                    answer_formula: '0',
                    answer_type: 'number',
                },
            },
        });
        const validSigns = new Set(['+', '-', '*']);
        for (let seed = 0; seed < 30; seed++) {
            const p = generateProblem(template, 1, seed);
            expect(validSigns.has(String(p.params.sign))).toBe(true);
        }
    });
});

// ─── Missing required fields ──────────────────────────────────────────────────

describe('generateProblem — validation', () => {
    it('throws when template field is missing', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: '',
                    parameters: {},
                    answer_formula: '0',
                    answer_type: 'number',
                } as any,
            },
        });
        // empty string is falsy
        expect(() => generateProblem(template, 1, 1)).toThrow();
    });

    it('throws when answer_formula is missing', () => {
        const template = makeTemplate({
            difficulties: {
                1: {
                    template: 'Question',
                    parameters: {},
                    answer_formula: '',
                    answer_type: 'number',
                } as any,
            },
        });
        expect(() => generateProblem(template, 1, 1)).toThrow();
    });
});
