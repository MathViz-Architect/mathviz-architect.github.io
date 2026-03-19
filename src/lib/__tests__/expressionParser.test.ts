/**
 * expressionParser — unit + edge case tests
 *
 * Critical zone: this is the CSP-safe eval used for ALL formula evaluation
 * in the problem engine. Bugs here silently produce wrong answers.
 */

import { describe, it, expect } from 'vitest';
import { evaluateFormula } from '../engine/expressionParser';

// ─── Basic arithmetic ────────────────────────────────────────────────────────

describe('evaluateFormula — basic arithmetic', () => {
    it('adds two numbers', () => {
        expect(evaluateFormula('2 + 3', {})).toBe(5);
    });

    it('subtracts', () => {
        expect(evaluateFormula('10 - 4', {})).toBe(6);
    });

    it('multiplies', () => {
        expect(evaluateFormula('3 * 4', {})).toBe(12);
    });

    it('divides', () => {
        expect(evaluateFormula('10 / 4', {})).toBe(2.5);
    });

    it('respects operator precedence (* before +)', () => {
        expect(evaluateFormula('2 + 3 * 4', {})).toBe(14);
    });

    it('respects parentheses', () => {
        expect(evaluateFormula('(2 + 3) * 4', {})).toBe(20);
    });

    it('handles exponentiation (**)', () => {
        expect(evaluateFormula('2 ** 10', {})).toBe(1024);
    });

    it('handles modulo (%)', () => {
        expect(evaluateFormula('10 % 3', {})).toBe(1);
    });

    it('handles unary minus', () => {
        expect(evaluateFormula('-5', {})).toBe(-5);
    });

    it('handles nested parentheses', () => {
        expect(evaluateFormula('((2 + 3) * (4 - 1))', {})).toBe(15);
    });
});

// ─── Variable substitution ───────────────────────────────────────────────────

describe('evaluateFormula — variable substitution', () => {
    it('substitutes a single variable', () => {
        expect(evaluateFormula('a + 1', { a: 5 })).toBe(6);
    });

    it('substitutes multiple variables', () => {
        expect(evaluateFormula('a * b + c', { a: 2, b: 3, c: 4 })).toBe(10);
    });

    it('handles answer_formula pattern (c - b) / a', () => {
        // Typical linear equation answer: ax + b = c → x = (c-b)/a
        expect(evaluateFormula('(c - b) / a', { a: 2, b: 3, c: 7 })).toBe(2);
    });
});

// ─── Math functions ──────────────────────────────────────────────────────────

describe('evaluateFormula — math functions', () => {
    it('floor()', () => {
        expect(evaluateFormula('floor(3.7)', {})).toBe(3);
    });

    it('ceil()', () => {
        expect(evaluateFormula('ceil(3.2)', {})).toBe(4);
    });

    it('round()', () => {
        expect(evaluateFormula('round(3.5)', {})).toBe(4);
    });

    it('abs() of negative', () => {
        expect(evaluateFormula('abs(-7)', {})).toBe(7);
    });

    it('sqrt()', () => {
        expect(evaluateFormula('sqrt(9)', {})).toBe(3);
    });

    it('pow()', () => {
        expect(evaluateFormula('pow(2, 8)', {})).toBe(256);
    });

    it('max()', () => {
        expect(evaluateFormula('max(3, 7, 2)', {})).toBe(7);
    });

    it('min()', () => {
        expect(evaluateFormula('min(3, 7, 2)', {})).toBe(2);
    });

    it('Math.floor() prefix form', () => {
        expect(evaluateFormula('Math.floor(2.9)', {})).toBe(2);
    });
});

// ─── Comparison and logical operators ────────────────────────────────────────

describe('evaluateFormula — comparisons', () => {
    it('returns 1 for true comparison', () => {
        expect(evaluateFormula('3 > 2', {})).toBe(1);
    });

    it('returns 0 for false comparison', () => {
        expect(evaluateFormula('2 > 3', {})).toBe(0);
    });

    it('ternary: true branch', () => {
        expect(evaluateFormula('a > 0 ? a : -a', { a: 5 })).toBe(5);
    });

    it('ternary: false branch', () => {
        expect(evaluateFormula('a > 0 ? a : -a', { a: -3 })).toBe(3);
    });

    it('equality ==', () => {
        expect(evaluateFormula('2 == 2', {})).toBe(1);
        expect(evaluateFormula('2 == 3', {})).toBe(0);
    });
});

// ─── Edge cases — division by zero ───────────────────────────────────────────

describe('evaluateFormula — division by zero', () => {
    /**
     * ⚠️ Bug #1: division by zero returns Infinity, not an error.
     * evaluateFormula silently returns Infinity — callers must handle this.
     * This test documents the CURRENT behaviour (not ideal, but known).
     */
    it('returns Infinity for n/0 (documents current behaviour)', () => {
        const result = evaluateFormula('a / b', { a: 1, b: 0 });
        expect(result).toBe(Infinity);
    });

    it('returns -Infinity for negative/0', () => {
        const result = evaluateFormula('a / b', { a: -1, b: 0 });
        expect(result).toBe(-Infinity);
    });

    it('returns NaN for 0/0', () => {
        const result = evaluateFormula('a / b', { a: 0, b: 0 });
        expect(Number.isNaN(result as number)).toBe(true);
    });
});

// ─── Edge cases — unknown variables ──────────────────────────────────────────

describe('evaluateFormula — unknown variables', () => {
    /**
     * ⚠️ Bug #5: unknown variable throws internally, caught by evaluateFormula,
     * which returns 0. A typo in a template parameter silently produces answer=0.
     * This test documents the current behaviour.
     */
    it('returns 0 for unknown variable (documents current behaviour)', () => {
        const result = evaluateFormula('z + 1', {});
        expect(result).toBe(0);
    });

    it('returns 0 for unknown function (documents current behaviour)', () => {
        const result = evaluateFormula('unknownFn(5)', {});
        expect(result).toBe(0);
    });
});

// ─── Edge cases — large / small numbers ──────────────────────────────────────

describe('evaluateFormula — extreme values', () => {
    it('handles large integers', () => {
        expect(evaluateFormula('a * b', { a: 999999, b: 999999 })).toBe(999998000001);
    });

    it('handles very small decimals', () => {
        const result = evaluateFormula('a / b', { a: 1, b: 1000000 });
        expect(result).toBeCloseTo(0.000001, 10);
    });

    it('handles negative exponent via expression', () => {
        // 2^(-3) = 0.125
        expect(evaluateFormula('pow(2, -3)', {})).toBeCloseTo(0.125, 10);
    });
});

// ─── String / choice parameters ──────────────────────────────────────────────

describe('evaluateFormula — string parameters', () => {
    it('string concatenation with +', () => {
        expect(evaluateFormula('"hello" + " world"', {})).toBe('hello world');
    });

    it('string variable substitution', () => {
        expect(evaluateFormula('label', { label: 'x' })).toBe('x');
    });
});
