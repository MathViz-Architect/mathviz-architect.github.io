/**
 * answerValidator — edge cases
 *
 * Existing tests cover happy-path. This file covers:
 * - Empty / whitespace input
 * - Division by zero in fraction (1/0)
 * - Infinity / NaN as expected answer
 * - Comma as decimal separator
 * - Negative fractions
 * - Partial numeric strings ("4abc" → Bug #7)
 * - Interval edge cases (Unicode ∞, comma separator, boundary inclusivity)
 * - Expression comparison edge cases
 * - Tolerance boundary for fraction comparison
 */

import { describe, it, expect } from 'vitest';
import { validateAnswer, compareExpressions, compareIntervals } from '../engine/answerValidator';
import type { GeneratedProblem } from '../types';

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeProblem(answer: number | string, answerType = 'number'): GeneratedProblem {
    return {
        id: 'test',
        template_id: 'test',
        seed: 1,
        params: {},
        question: 'Q',
        answer,
        answer_type: answerType as any,
    };
}

// ─── Number type — edge cases ─────────────────────────────────────────────────

describe('validateAnswer — number — edge cases', () => {
    it('empty string returns false', () => {
        expect(validateAnswer(makeProblem(4), '', 'number')).toBe(false);
    });

    it('whitespace-only string returns false', () => {
        expect(validateAnswer(makeProblem(4), '   ', 'number')).toBe(false);
    });

    it('comma decimal separator is accepted ("3,14" → 3.14)', () => {
        expect(validateAnswer(makeProblem(3.14), '3,14', 'number')).toBe(true);
    });

    it('negative answer matches negative input', () => {
        expect(validateAnswer(makeProblem(-5), '-5', 'number')).toBe(true);
    });

    it('zero answer matches "0"', () => {
        expect(validateAnswer(makeProblem(0), '0', 'number')).toBe(true);
    });

    it('within tolerance (0.0009 difference)', () => {
        // tolerance is 0.001
        expect(validateAnswer(makeProblem(1), '1.0009', 'number')).toBe(true);
    });

    it('outside tolerance (0.002 difference)', () => {
        expect(validateAnswer(makeProblem(1), '1.002', 'number')).toBe(false);
    });

    /**
     * Bug #7 FIXED: strict regex rejects "4abc" — no longer parsed as 4.
     */
    it('partial numeric string "4abc" is rejected (Bug #7 fixed)', () => {
        expect(validateAnswer(makeProblem(4), '4abc', 'number')).toBe(false);
    });

    it('pure text string returns false for numeric answer', () => {
        expect(validateAnswer(makeProblem(4), 'four', 'number')).toBe(false);
    });

    // NaN / Infinity in expected answer
    it('Infinity as expected answer returns false', () => {
        expect(validateAnswer(makeProblem(Infinity), '1', 'number')).toBe(false);
    });

    it('NaN as expected answer returns false', () => {
        expect(validateAnswer(makeProblem(NaN), '1', 'number')).toBe(false);
    });

    it('Infinity as user input returns false', () => {
        expect(validateAnswer(makeProblem(1), 'Infinity', 'number')).toBe(false);
    });

    // Whitespace around valid number
    it('"  5  " (padded) is accepted', () => {
        expect(validateAnswer(makeProblem(5), '  5  ', 'number')).toBe(true);
    });

    // Decimal edge cases — document parseFloat behaviour
    it('"5." is accepted (parseFloat stops at dot)', () => {
        expect(validateAnswer(makeProblem(5), '5.', 'number')).toBe(true);
    });

    it('".5" is accepted as 0.5', () => {
        expect(validateAnswer(makeProblem(0.5), '.5', 'number')).toBe(true);
    });
});

// ─── Fraction type — edge cases ───────────────────────────────────────────────

describe('validateAnswer — fraction — edge cases', () => {
    it('empty string returns false', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '', 'fraction')).toBe(false);
    });

    /**
     * ⚠️ Bug FIXED: parseFractionToRational('1/0') returns null (denominator=0 guard ✓).
     * Previously fell through to parseFraction fallback: parseFloat('1/0') = 1.
     * Now uses parseStrictFractionValue — '1/0' returns null → false.
     */
    it('division by zero in user input (1/0) returns false', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '1/0', 'fraction')).toBe(false);
    });

    it('negative fraction -3/4 matches -3/4', () => {
        expect(validateAnswer(makeProblem('-3/4', 'fraction'), '-3/4', 'fraction')).toBe(true);
    });

    it('equivalent negative fractions: -6/8 matches -3/4', () => {
        expect(validateAnswer(makeProblem('-3/4', 'fraction'), '-6/8', 'fraction')).toBe(true);
    });

    /**
     * Bug FIXED: parseStrictFractionValue('3/4') uses parseFractionToRational → 0.75.
     * expectedValue = parseFractionToRational('3/4') → [3,4] → rational comparison.
     * Both sides now parsed correctly.
     */
    it('decimal 0.75 matches string answer "3/4"', () => {
        expect(validateAnswer(makeProblem('3/4', 'fraction'), '0.75', 'fraction')).toBe(true);
    });

    it('decimal 0.5 matches string answer "1/2"', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '0.5', 'fraction')).toBe(true);
    });

    it('wrong fraction 1/3 does not match 1/2', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '1/3', 'fraction')).toBe(false);
    });

    it('spaces around slash are accepted ("3 / 4")', () => {
        expect(validateAnswer(makeProblem('3/4', 'fraction'), '3 / 4', 'fraction')).toBe(true);
    });

    /**
     * Bug FIXED: parseStrictFractionValue('4/2') uses parseFractionToRational → [4,2] → 2.0.
     * userValue = parseStrictFractionValue('2') → 2. |2 - 2| = 0 < 0.01 → true.
     */
    it('whole number "2" matches string answer "4/2"', () => {
        expect(validateAnswer(makeProblem('4/2', 'fraction'), '2', 'fraction')).toBe(true);
    });

    // When answer is a NUMBER (not string), decimal comparison works correctly
    it('decimal 0.75 matches numeric answer 0.75', () => {
        expect(validateAnswer(makeProblem(0.75, 'fraction'), '0.75', 'fraction')).toBe(true);
    });

    it('fraction 3/4 matches numeric answer 0.75', () => {
        expect(validateAnswer(makeProblem(0.75, 'fraction'), '3/4', 'fraction')).toBe(true);
    });

    // Strict validation — inputs that parseFloat would silently accept but are invalid
    it('"1/2/3" is rejected (not a valid fraction)', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '1/2/3', 'fraction')).toBe(false);
    });

    it('"abc" is rejected', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), 'abc', 'fraction')).toBe(false);
    });

    it('"4abc" is rejected (strict parser, no parseFloat truncation)', () => {
        expect(validateAnswer(makeProblem(4, 'fraction'), '4abc', 'fraction')).toBe(false);
    });

    // NaN / Infinity in expected answer
    it('Infinity as expected answer returns false', () => {
        expect(validateAnswer(makeProblem(Infinity, 'fraction'), '1', 'fraction')).toBe(false);
    });

    it('NaN as expected answer returns false', () => {
        expect(validateAnswer(makeProblem(NaN, 'fraction'), '1', 'fraction')).toBe(false);
    });

    // Whitespace handling
    it('" 1/2 " (padded) is accepted', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), ' 1/2 ', 'fraction')).toBe(true);
    });

    it('"1 / 2" (spaces around slash) is accepted', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '1 / 2', 'fraction')).toBe(true);
    });

    it('"1/ 2" (space after slash) is accepted', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '1/ 2', 'fraction')).toBe(true);
    });

    it('"1 /2" (space before slash) is accepted', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '1 /2', 'fraction')).toBe(true);
    });

    // Leading zeros
    it('"01/02" (leading zeros) is accepted as 1/2', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '01/02', 'fraction')).toBe(true);
    });

    // Unicode minus (−, U+2212) — documents current behaviour
    it('"−1/2" (unicode minus U+2212) is rejected (not matched by regex)', () => {
        // parseFractionToRational regex expects ASCII hyphen-minus (U+002D)
        // Unicode minus is not supported — documents current behaviour
        expect(validateAnswer(makeProblem('-1/2', 'fraction'), '\u22121/2', 'fraction')).toBe(false);
    });

    // Double slash
    it('"//2" is rejected', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '//2', 'fraction')).toBe(false);
    });

    it('"1//2" is rejected', () => {
        expect(validateAnswer(makeProblem('1/2', 'fraction'), '1//2', 'fraction')).toBe(false);
    });
});

// ─── Coordinate type — edge cases ─────────────────────────────────────────────

describe('validateAnswer — coordinate — edge cases', () => {
    it('empty string returns false', () => {
        expect(validateAnswer(makeProblem('(1, 2)', 'coordinate'), '', 'coordinate')).toBe(false);
    });

    it('semicolon separator is accepted "(3; 4)"', () => {
        expect(validateAnswer(makeProblem('(3, 4)', 'coordinate'), '(3; 4)', 'coordinate')).toBe(true);
    });

    it('negative coordinates match', () => {
        expect(validateAnswer(makeProblem('(-3, -4)', 'coordinate'), '(-3, -4)', 'coordinate')).toBe(true);
    });

    it('without parentheses "3, 4" is accepted', () => {
        expect(validateAnswer(makeProblem('(3, 4)', 'coordinate'), '3, 4', 'coordinate')).toBe(true);
    });

    it('swapped coordinates (4, 3) do not match (3, 4)', () => {
        expect(validateAnswer(makeProblem('(3, 4)', 'coordinate'), '(4, 3)', 'coordinate')).toBe(false);
    });

    it('origin (0, 0) matches', () => {
        expect(validateAnswer(makeProblem('(0, 0)', 'coordinate'), '(0, 0)', 'coordinate')).toBe(true);
    });
});

// ─── Interval type — edge cases ───────────────────────────────────────────────

describe('compareIntervals — edge cases', () => {
    it('open vs closed bracket: (0; 10) != [0; 10]', () => {
        expect(compareIntervals('(0; 10)', '[0; 10]')).toBe(false);
    });

    it('left-open right-closed: (2; 5] matches (2; 5]', () => {
        expect(compareIntervals('(2; 5]', '(2; 5]')).toBe(true);
    });

    it('Unicode ∞ symbol is accepted: [0; +∞)', () => {
        expect(compareIntervals('[0; +∞)', '[0; +inf)')).toBe(true);
    });

    it('Unicode -∞ symbol is accepted: (-∞; 0]', () => {
        expect(compareIntervals('(-∞; 0]', '(-inf; 0]')).toBe(true);
    });

    it('negative bounds: [-5; -1] matches [-5; -1]', () => {
        expect(compareIntervals('[-5; -1]', '[-5; -1]')).toBe(true);
    });

    it('empty string returns false', () => {
        expect(compareIntervals('', '[0; 10]')).toBe(false);
    });

    it('malformed input returns false', () => {
        expect(compareIntervals('0 to 10', '[0; 10]')).toBe(false);
    });

    /**
     * ⚠️ Bug #4: comma separator not supported.
     * "[2, +inf)" returns false even though it's a common notation.
     * This test documents the current behaviour.
     */
    it('comma separator "[2, +inf)" is NOT accepted (Bug #4 — documents current behaviour)', () => {
        expect(compareIntervals('[2, +inf)', '[2; +inf)')).toBe(false);
    });

    it('whole-line interval (-inf; +inf) matches', () => {
        expect(compareIntervals('(-inf; +inf)', '(-inf; +inf)')).toBe(true);
    });

    it('single-point interval [3; 3] matches [3; 3]', () => {
        expect(compareIntervals('[3; 3]', '[3; 3]')).toBe(true);
    });
});

describe('validateAnswer — interval type', () => {
    it('correct interval passes', () => {
        const p = makeProblem('[2; +inf)', 'interval');
        expect(validateAnswer(p, '[2; +inf)', 'interval')).toBe(true);
    });

    it('wrong bound fails', () => {
        const p = makeProblem('[2; +inf)', 'interval');
        expect(validateAnswer(p, '[3; +inf)', 'interval')).toBe(false);
    });

    it('empty string fails', () => {
        const p = makeProblem('[2; +inf)', 'interval');
        expect(validateAnswer(p, '', 'interval')).toBe(false);
    });
});

// ─── Expression type — edge cases ─────────────────────────────────────────────

describe('compareExpressions — edge cases', () => {
    it('empty string vs number returns false', () => {
        expect(compareExpressions('', '4')).toBe(false);
    });

    it('both empty strings', () => {
        // Both evaluate to nothing — mathjs may throw or return NaN
        // Either way, should not crash
        expect(() => compareExpressions('', '')).not.toThrow();
    });

    it('Infinity vs Infinity', () => {
        // Documents behaviour — may or may not be true depending on mathjs
        expect(() => compareExpressions('1/0', '1/0')).not.toThrow();
    });

    it('numeric string "4" matches number expression "2+2"', () => {
        expect(compareExpressions('4', '2+2')).toBe(true);
    });

    it('fraction 1/2 matches 0.5', () => {
        expect(compareExpressions('1/2', '0.5')).toBe(true);
    });

    it('x^2 + 2x + 1 matches (x+1)^2', () => {
        expect(compareExpressions('x^2 + 2*x + 1', '(x+1)^2')).toBe(true);
    });

    it('different polynomials are not equal', () => {
        expect(compareExpressions('x^2 + 1', 'x^2 + 2')).toBe(false);
    });

    it('comma decimal "3,14" is treated as 3.14', () => {
        expect(compareExpressions('3,14', '3.14')).toBe(true);
    });
});

// ─── Null / undefined guard ───────────────────────────────────────────────────

describe('validateAnswer — null/undefined guard', () => {
    it('null userAnswer returns false without throwing', () => {
        expect(() => validateAnswer(makeProblem(4), null as any, 'number')).not.toThrow();
        expect(validateAnswer(makeProblem(4), null as any, 'number')).toBe(false);
    });

    it('undefined userAnswer returns false without throwing', () => {
        expect(() => validateAnswer(makeProblem(4), undefined as any, 'number')).not.toThrow();
        expect(validateAnswer(makeProblem(4), undefined as any, 'number')).toBe(false);
    });

    it('null userAnswer for fraction type returns false without throwing', () => {
        expect(() => validateAnswer(makeProblem('1/2', 'fraction'), null as any, 'fraction')).not.toThrow();
        expect(validateAnswer(makeProblem('1/2', 'fraction'), null as any, 'fraction')).toBe(false);
    });
});
