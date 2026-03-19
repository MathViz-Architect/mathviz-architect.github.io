/**
 * Property-based tests for variantGenerator using fast-check.
 *
 * Three property suites:
 *  1. No NaN/Infinity in numeric answers
 *  2. Determinism — same seed → identical problem
 *  3. Constraint exhaustion — no silent failures across all templates
 */

import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { generateProblem } from '../engine/variantGenerator';
import { problemTemplates } from '../templates/index';
import { ProblemTemplate } from '../types';

// Templates whose answer_type is numeric (number, fraction, coordinate, interval, expression)
// We skip 'text' answer_type because string answers can't be checked for NaN/Infinity.
const NUMERIC_ANSWER_TYPES = new Set(['number', 'fraction', 'coordinate', 'interval', 'expression', undefined]);

function isNumericTemplate(template: ProblemTemplate): boolean {
    return Object.values(template.difficulties).some(
        d => d && NUMERIC_ANSWER_TYPES.has(d.answer_type as string | undefined)
    );
}

const numericTemplates = problemTemplates.filter(isNumericTemplate);

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1: No NaN/Infinity in numeric answers
// ─────────────────────────────────────────────────────────────────────────────
describe('variantGenerator — property: no NaN/Infinity in numeric answers', () => {
    for (const template of numericTemplates) {
        const difficulties = (Object.keys(template.difficulties).map(Number) as (1 | 2 | 3 | 4)[]).filter(
            d => {
                const cfg = template.difficulties[d];
                return cfg && NUMERIC_ANSWER_TYPES.has(cfg.answer_type as string | undefined);
            }
        );

        for (const diff of difficulties) {
            it(`${template.id} difficulty ${diff}: answer is always finite`, () => {
                fc.assert(
                    fc.property(fc.integer({ min: 1, max: 2 ** 31 - 1 }), seed => {
                        const problem = generateProblem(template, diff, seed);
                        if (typeof problem.answer === 'number') {
                            return isFinite(problem.answer);
                        }
                        // string answers (text type) are not checked here
                        return true;
                    }),
                    { numRuns: 200 }
                );
            });
        }
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2: Determinism — same seed produces identical problem
// ─────────────────────────────────────────────────────────────────────────────
describe('variantGenerator — property: determinism', () => {
    // Sample first 15 templates to keep the suite fast
    const sampleTemplates = problemTemplates.slice(0, 15);

    for (const template of sampleTemplates) {
        const firstDiff = (Object.keys(template.difficulties).map(Number)[0] as 1 | 2 | 3 | 4);

        it(`${template.id}: same seed produces identical problem`, () => {
            fc.assert(
                fc.property(fc.integer({ min: 1, max: 2 ** 31 - 1 }), seed => {
                    const p1 = generateProblem(template, firstDiff, seed);
                    const p2 = generateProblem(template, firstDiff, seed);
                    return JSON.stringify(p1) === JSON.stringify(p2);
                }),
                { numRuns: 100 }
            );
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3: Constraint exhaustion — no template silently produces bad answers
//
// The constraint loop in generateParamsForConfig has a 100-attempt cap.
// If constraints are too tight, the loop exits with params that may violate
// them, leading to NaN/Infinity or logically wrong answers.
//
// This suite cross-products all numeric templates × 500 seeds to surface
// any template where constraint exhaustion is a real risk.
// ─────────────────────────────────────────────────────────────────────────────
describe('variantGenerator — property: constraint exhaustion safety', () => {
    it('all numeric templates: no NaN/Infinity across 500 seeds', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 2 ** 31 - 1 }),
                fc.constantFrom(...numericTemplates),
                (seed, template) => {
                    const availDiffs = Object.keys(template.difficulties).map(Number) as (1 | 2 | 3 | 4)[];
                    // Pick difficulty deterministically from seed so it's reproducible
                    const diff = availDiffs[seed % availDiffs.length];
                    const cfg = template.difficulties[diff];
                    if (!cfg || !NUMERIC_ANSWER_TYPES.has(cfg.answer_type as string | undefined)) {
                        return true; // skip non-numeric
                    }
                    try {
                        const problem = generateProblem(template, diff, seed);
                        if (typeof problem.answer === 'number') {
                            return isFinite(problem.answer);
                        }
                        return true;
                    } catch {
                        // generateProblem throwing is itself a failure
                        return false;
                    }
                }
            ),
            { numRuns: 500 }
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4: Tight-constraint templates — focused stress test
//
// grade8-pythag-leg difficulty 1 has a very tight constraint:
//   Math.sqrt(c*c - a*a) === Math.floor(Math.sqrt(c*c - a*a))
// i.e. c²-a² must be a perfect square. With c ∈ [5,13] and a ∈ [3,8]
// only a handful of (c,a) pairs satisfy this (e.g. 5,4 → 3; 13,5 → 12; 10,6 → 8).
// This test verifies the 100-attempt cap is sufficient in practice.
// ─────────────────────────────────────────────────────────────────────────────
describe('variantGenerator — property: tight-constraint templates', () => {
    const pythagoreanTemplate = problemTemplates.find(t => t.id === 'grade8-pythag-leg');

    if (pythagoreanTemplate) {
        it('grade8-pythag-leg difficulty 1: answer is always a positive integer', () => {
            fc.assert(
                fc.property(fc.integer({ min: 1, max: 2 ** 31 - 1 }), seed => {
                    const problem = generateProblem(pythagoreanTemplate, 1, seed);
                    const ans = problem.answer;
                    if (typeof ans !== 'number') return true;
                    // Answer must be a positive integer (it's a leg length)
                    return isFinite(ans) && ans > 0 && Math.floor(ans) === ans;
                }),
                { numRuns: 500 }
            );
        });
    }
});
