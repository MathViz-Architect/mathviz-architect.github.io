/**
 * Expression equivalence — rational expression validation
 *
 * Tests that compareExpressions correctly handles:
 * - Rational expressions with common denominators
 * - Expressions where some test points cause division by zero
 * - Algebraically equivalent but syntactically different forms
 */

import { describe, it, expect } from 'vitest';
import { compareExpressions } from '../engine/answerValidator';
import { validateAnswer } from '../engine/answerValidator';
import type { GeneratedProblem } from '../types';

function makeProblem(answer: string): GeneratedProblem {
    return {
        id: 'test',
        template_id: 'test',
        seed: 1,
        params: {},
        question: 'Q',
        answer,
        answer_type: 'expression',
    };
}

describe('compareExpressions — rational equivalence', () => {
    it('(x-1)/(x-2) equals (2*(x-1))/(2*(x-2))', () => {
        expect(compareExpressions('(x-1)/(x-2)', '(2*(x-1))/(2*(x-2))')).toBe(true);
    });

    it('(x-1)/(x-2) does NOT equal (x-1)/(2x-4) alone — they differ by factor 2', () => {
        // (x-1)/(2x-4) = (x-1)/(2*(x-2)) = 0.5 * (x-1)/(x-2)
        // These are NOT equal — the task example requires the SUM of two such fractions
        expect(compareExpressions('(x-1)/(x-2)', '(x-1)/(2*x-4)')).toBe(false);
    });

    it('sum of equal fractions: (x-1)/(2x-4) + (x-1)/(2x-4) = (x-1)/(x-2)', () => {
        // (x-1)/(2x-4) + (x-1)/(2x-4) = 2*(x-1)/(2x-4) = (x-1)/(x-2)
        expect(compareExpressions('(x-1)/(2*x-4) + (x-1)/(2*x-4)', '(x-1)/(x-2)')).toBe(true);
    });

    it('does NOT equate different rational expressions', () => {
        expect(compareExpressions('(x-1)/(x-2)', '(x+1)/(x-2)')).toBe(false);
    });

    it('does NOT equate when denominators differ', () => {
        expect(compareExpressions('1/(x-1)', '1/(x-2)')).toBe(false);
    });

    it('x^2 - 1 equals (x-1)*(x+1)', () => {
        expect(compareExpressions('x^2 - 1', '(x-1)*(x+1)')).toBe(true);
    });

    it('(x^2 - 4)/(x-2) equals x+2 (for x != 2)', () => {
        expect(compareExpressions('(x^2 - 4)/(x-2)', 'x+2')).toBe(true);
    });

    it('handles x=2 singularity without returning false', () => {
        // Both expressions have a singularity at x=2, but are equal elsewhere
        // The sampler must skip x=2 and use other points
        expect(compareExpressions('1/(x-2)', '2/(2*x-4)')).toBe(true);
    });

    it('2/x equals 4/(2x)', () => {
        expect(compareExpressions('2/x', '4/(2*x)')).toBe(true);
    });
});

describe('validateAnswer — expression type — rational equivalence', () => {
    it('accepts (x-1)/(x-2) when expected is (x-1)/(2x-4) + (x-1)/(2x-4)', () => {
        const p = makeProblem('(x-1)/(2*x-4) + (x-1)/(2*x-4)');
        expect(validateAnswer(p, '(x-1)/(x-2)', 'expression')).toBe(true);
    });

    it('rejects wrong answer for rational expression', () => {
        const p = makeProblem('(x-1)/(x-2)');
        expect(validateAnswer(p, '(x+1)/(x-2)', 'expression')).toBe(false);
    });
});
