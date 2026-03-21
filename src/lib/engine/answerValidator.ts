/**
 * Answer validation
 * Handles normalization and comparison of user answers
 * Includes MathJS integration for symbolic comparisons
 */

import { GeneratedProblem, AnswerType } from '../types';
import { toMathJSExpression } from '../math/normalization';
import { checkEquivalence, compareExpressions, extractVariables } from './equivalence';
import { parseIntervalSet, intervalSetsEqual } from './intervals';

// Re-export for consumers that import compareExpressions from this module
export { compareExpressions };

/**
 * String-accepting wrapper around intervalSetsEqual.
 * Parses both arguments before comparing.
 */
export function compareIntervals(a: string, b: string): boolean {
    try {
        const setA = parseIntervalSet(a);
        const setB = parseIntervalSet(b);
        if (setA.length === 0 && setB.length > 0) return false;
        if (setB.length === 0 && setA.length > 0) return false;
        return intervalSetsEqual(setA, setB);
    } catch {
        return false;
    }
}

/**
 * Calculate Greatest Common Divisor using Euclidean algorithm
 */
function gcd(a: number, b: number): number {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

/**
 * Parse fraction string to [numerator, denominator]
 * Accepts: "3/4", "3 / 4"
 * Returns null if not a valid fraction
 */
function parseFractionToRational(input: string): [number, number] | null {
    const trimmed = input.trim();
    const fractionMatch = trimmed.match(/^\s*(-?\d+)\s*\/\s*(-?\d+)\s*$/);

    if (fractionMatch) {
        const numerator = parseInt(fractionMatch[1], 10);
        const denominator = parseInt(fractionMatch[2], 10);
        if (denominator !== 0) {
            return [numerator, denominator];
        }
    }

    return null;
}

/**
 * Reduce fraction to simplest form
 */
function reduceFraction(numerator: number, denominator: number): [number, number] {
    if (denominator === 0) return [numerator, denominator];

    const divisor = gcd(numerator, denominator);
    let num = numerator / divisor;
    let den = denominator / divisor;

    // Keep denominator positive
    if (den < 0) {
        num = -num;
        den = -den;
    }

    return [num, den];
}

/**
 * Strict parser for fraction validation.
 * Accepts ONLY:
 *   - Pure decimal strings: "0.75", "3,14" (comma as decimal separator)
 *   - Fraction strings matched by parseFractionToRational: "3/4", "-1/2"
 * Rejects anything parseFloat would silently truncate: "1/0", "4abc", "1/2/3"
 * Returns null for any invalid or ambiguous input.
 */
function parseStrictFractionValue(input: string): number | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // If it contains '/', it must be a valid a/b fraction — no fallback to parseFloat
    if (trimmed.includes('/')) {
        const rational = parseFractionToRational(trimmed);
        if (!rational) return null;
        const value = rational[0] / rational[1];
        if (!isFinite(value)) return null;
        return value;
    }

    // Pure decimal: must match exactly (no trailing garbage)
    const normalized = trimmed.replace(',', '.');
    // Reject if not a valid decimal literal (e.g. "4abc" would pass parseFloat)
    if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
    const decimal = Number(normalized);
    if (!isFinite(decimal)) return null;
    return decimal;
}

/**
 * Parse coordinate string to [x, y]
 * Accepts: "(3, 4)", "3, 4", "3;4"
 */
function parseCoordinate(input: string): [number, number] | null {
    const trimmed = input.trim();

    // Remove parentheses if present
    const cleaned = trimmed.replace(/^\(|\)$/g, '');

    // Try comma or semicolon separator
    const parts = cleaned.split(/[,;]/).map(p => p.trim());

    if (parts.length === 2) {
        const x = parseFloat(parts[0].replace(',', '.'));
        const y = parseFloat(parts[1].replace(',', '.'));

        if (!isNaN(x) && !isNaN(y)) {
            return [x, y];
        }
    }

    return null;
}

/**
 * Validate user answer against problem answer
 *
 * CONTRACT:
 * - userAnswer: any string (including empty, whitespace, null/undefined — all handled)
 * - problem.answer: number | string (NaN/Infinity in numeric answer → false)
 * - answerType: determines parsing strategy
 *
 * TOLERANCE POLICY:
 * - 'number': tolerance = 0.001 — tight, for exact numeric answers (e.g. "3.14")
 * - 'fraction' fallback: tolerance = 0.01 — looser, to handle repeating decimals (e.g. 0.333 ≈ 1/3)
 * - 'expression': tolerance = 1e-9 (inside checkEquivalence) — symbolic, near-exact
 * - 'interval': no tolerance — structural equality only
 * Tolerance is NOT applied to expression or interval types.
 */
export function validateAnswer(
    problem: GeneratedProblem,
    userAnswer: string,
    answerType: AnswerType = 'number'
): boolean {
    // Guard: coerce non-string inputs (defensive — callers should pass strings)
    if (userAnswer === null || userAnswer === undefined) return false;
    const safeUserAnswer = String(userAnswer);

    const answer = problem.answer;
    const tolerance = 0.001;

    switch (answerType) {
        case 'number': {
            // CONTRACT: accepts only finite numbers.
            // Strict regex rejects "4abc", "4x", "1/2" — anything parseFloat would silently truncate.
            // Comma is accepted as decimal separator ("3,14" → 3.14).
            const normalized = safeUserAnswer.replace(',', '.').trim();
            // Allow: optional minus, digits, optional decimal point + digits
            // Also allow: ".5" and "5." (parseFloat-compatible edge cases)
            if (!/^-?(\d+\.?\d*|\.\d+)$/.test(normalized)) {
                // Not a valid number literal — fall back to text comparison only
                return normalized.toLowerCase() === String(answer).trim().toLowerCase();
            }
            const parsed = Number(normalized);
            const expected = parseFloat(String(answer));

            if (!isNaN(parsed) && !isNaN(expected) && isFinite(parsed) && isFinite(expected)) {
                return Math.abs(parsed - expected) < tolerance;
            }

            return false;
        }

        case 'fraction': {
            // CONTRACT: accepts only a/b fractions or strict decimals — no parseFloat fallback.
            // See parseStrictFractionValue for exact rules.
            const userRational = parseFractionToRational(safeUserAnswer);

            // Parse expected answer
            let expectedRational: [number, number] | null = null;

            if (typeof answer === 'number') {
                if (!isFinite(answer)) return false;
                // Numeric answer: compare user input (strict) against the numeric value
                const userDecimal = userRational
                    ? userRational[0] / userRational[1]
                    : parseStrictFractionValue(safeUserAnswer);

                if (userDecimal === null || !isFinite(userDecimal)) {
                    return false;
                }

                return Math.abs(userDecimal - answer) < 0.01;
            } else if (typeof answer === 'string') {
                expectedRational = parseFractionToRational(answer);
            }

            // If both are fractions, compare as rational numbers (exact, no parseFloat)
            if (userRational && expectedRational) {
                const [userNum, userDen] = reduceFraction(userRational[0], userRational[1]);
                const [expNum, expDen] = reduceFraction(expectedRational[0], expectedRational[1]);

                return userNum === expNum && userDen === expDen;
            }

            // Fallback: both sides parsed strictly — no parseFloat truncation
            const userValue = parseStrictFractionValue(safeUserAnswer);
            const expectedValue = typeof answer === 'number'
                ? (isFinite(answer) ? answer : null)
                : parseStrictFractionValue(String(answer));

            if (userValue === null || expectedValue === null) {
                return false;
            }

            return Math.abs(userValue - expectedValue) < 0.01;
        }

        case 'coordinate': {
            const userCoord = parseCoordinate(safeUserAnswer);

            // Parse expected answer
            let expectedCoord: [number, number] | null = null;
            if (typeof answer === 'string') {
                expectedCoord = parseCoordinate(answer);
            } else if (Array.isArray(answer) && answer.length === 2) {
                expectedCoord = [Number(answer[0]), Number(answer[1])];
            }

            if (userCoord === null || expectedCoord === null) {
                return false;
            }

            return (
                Math.abs(userCoord[0] - expectedCoord[0]) < tolerance &&
                Math.abs(userCoord[1] - expectedCoord[1]) < tolerance
            );
        }

        case 'expression': {
            const expectedStr = String(answer);
            const processedUserAnswer = toMathJSExpression(safeUserAnswer);
            const processedExpectedAnswer = toMathJSExpression(expectedStr);
            // Extract variables dynamically from both expressions instead of using
            // a hardcoded list — handles templates with t, n, k, m, etc.
            const vars = extractVariables(processedUserAnswer + ' ' + processedExpectedAnswer);
            const result = checkEquivalence(processedUserAnswer, processedExpectedAnswer, vars);
            return result.isEquivalent && result.confidence >= 0.99;
        }

        case 'interval': {
            try {
                const userIntervalSet = parseIntervalSet(safeUserAnswer);
                const expectedIntervalSet = parseIntervalSet(String(answer));
                // Disallow empty sets from being valid if the other is not.
                if (userIntervalSet.length === 0 && expectedIntervalSet.length > 0) {
                    return false;
                }
                return intervalSetsEqual(userIntervalSet, expectedIntervalSet);
            } catch (e) {
                // If parsing fails, the answer is incorrect.
                return false;
            }
        }
        case 'set':
            throw new Error('AnswerType "set" is not yet implemented');

        default:
            // Fallback to number validation (mirrors 'number' case)
            const parsed = parseFloat(safeUserAnswer.replace(',', '.').trim());
            const expected = parseFloat(String(answer));

            if (!isNaN(parsed) && !isNaN(expected) && isFinite(parsed) && isFinite(expected)) {
                return Math.abs(parsed - expected) < tolerance;
            }

            return safeUserAnswer.trim().toLowerCase() === String(answer).trim().toLowerCase();
    }
}
