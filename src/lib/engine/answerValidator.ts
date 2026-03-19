/**
 * Answer validation
 * Handles normalization and comparison of user answers
 * Includes MathJS integration for symbolic comparisons
 */

import { GeneratedProblem, AnswerType } from '../types';
import {
    simplify,
    evaluate
} from 'mathjs';

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
 * Parse fraction string to decimal
 * Accepts: "3/4", "3 / 4", "0.75"
 * NOTE: used only outside the fraction validation path (e.g. expression fallback).
 */
function parseFraction(input: string): number | null {
    const trimmed = input.trim();

    // Try decimal first
    const decimal = parseFloat(trimmed.replace(',', '.'));
    if (!isNaN(decimal)) {
        return decimal;
    }

    // Try fraction format: a/b
    const rational = parseFractionToRational(trimmed);
    if (rational) {
        return rational[0] / rational[1];
    }

    return null;
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
 * Compare two mathematical expressions for symbolic equivalence
 * Uses mathjs to simplify and compare expressions
 * Examples: 0.5 vs 1/2, sqrt(8) vs 2*sqrt(2), x^2 vs x*x
 */
export function compareExpressions(userAnswer: string, expectedAnswer: string): boolean {
    const tolerance = 1e-9;
    const cleanedUser = userAnswer.trim().replace(/\s+/g, ' ').replace(/,/g, '.');
    const cleanedExpected = expectedAnswer.trim().replace(/\s+/g, ' ').replace(/,/g, '.');

    const userFrac = parseFractionToRational(cleanedUser);
    const expectedFrac = parseFractionToRational(cleanedExpected);

    if (userFrac && expectedFrac) {
        return Math.abs(userFrac[0] / userFrac[1] - expectedFrac[0] / expectedFrac[1]) < tolerance;
    }

    if (userFrac && !expectedFrac) {
        const expectedNumeric = parseFloat(cleanedExpected);
        if (!isNaN(expectedNumeric)) {
            return Math.abs(userFrac[0] / userFrac[1] - expectedNumeric) < tolerance;
        }
        try {
            const expectedNum = Number(evaluate(cleanedExpected));
            if (!isNaN(expectedNum)) {
                return Math.abs(userFrac[0] / userFrac[1] - expectedNum) < tolerance;
            }
        } catch { /* ignore */ }
    }

    if (expectedFrac && !userFrac) {
        const userNumeric = parseFloat(cleanedUser);
        if (!isNaN(userNumeric)) {
            return Math.abs(userNumeric - expectedFrac[0] / expectedFrac[1]) < tolerance;
        }
        try {
            const userNum = Number(evaluate(cleanedUser));
            if (!isNaN(userNum)) {
                return Math.abs(userNum - expectedFrac[0] / expectedFrac[1]) < tolerance;
            }
        } catch { /* ignore */ }
    }

    try {
        const userResult = evaluate(cleanedUser);
        const expectedResult = evaluate(cleanedExpected);

        const userNum = typeof userResult === 'number' ? userResult : Number(userResult);
        const expectedNum = typeof expectedResult === 'number' ? expectedResult : Number(expectedResult);

        if (!isNaN(userNum) && !isNaN(expectedNum)) {
            return Math.abs(userNum - expectedNum) < tolerance;
        }
    } catch {
        // Fall through
    }

    try {
        const simplifiedUser = simplify(cleanedUser);
        const simplifiedExpected = simplify(cleanedExpected);

        const userStr = simplifiedUser.toString();
        const expectedStr = simplifiedExpected.toString();

        if (userStr === expectedStr) {
            return true;
        }

        try {
            const userCanonical = simplify(cleanedUser, { exact: true });
            const expectedCanonical = simplify(cleanedExpected, { exact: true });

            if (userCanonical.toString() === expectedCanonical.toString()) {
                return true;
            }
        } catch { /* ignore */ }

        try {
            const diff = simplify(`(${simplifiedUser.toString()}) - (${simplifiedExpected.toString()})`);

            const testValues = [0, 1, 2, -1, 0.5];
            let allZero = true;

            for (const val of testValues) {
                const substituted = diff.evaluate({ x: val });
                const num = Number(substituted);
                if (!isNaN(num) && Math.abs(num) > tolerance) {
                    allZero = false;
                    break;
                }
            }

            if (allZero) {
                return true;
            }
        } catch { /* ignore */ }

    } catch {
        // Simplify failed
    }

    return false;
}

/**
 * Parse interval string to structured interval object
 * Supports formats: [2; +inf), (-3; 5], [a; b], (a; b)
 */
interface ParsedInterval {
    left: number | '-inf' | '+inf';
    right: number | '-inf' | '+inf';
    leftInclusive: boolean;
    rightInclusive: boolean;
}

function parseInterval(input: string): ParsedInterval | null {
    const trimmed = input.trim();

    // Match interval patterns like [2; +inf), (-3; 5], [0; 10)
    const match = trimmed.match(/^[\(\[]\s*([^;]+)\s*;\s*([^)\]]+)\s*[\)\]]$/);

    if (!match) {
        return null;
    }

    const leftStr = match[1].trim();
    const rightStr = match[2].trim();

    let left: number | '-inf' | '+inf';
    let right: number | '-inf' | '+inf';

    if (leftStr.toLowerCase() === '-inf' || leftStr === '-∞') {
        left = '-inf';
    } else if (leftStr.toLowerCase() === '+inf' || leftStr === '+∞' || leftStr === 'inf') {
        left = '+inf';
    } else {
        const parsed = parseFloat(leftStr.replace(',', '.'));
        if (isNaN(parsed)) return null;
        left = parsed;
    }

    if (rightStr.toLowerCase() === '-inf' || rightStr === '-∞') {
        right = '-inf';
    } else if (rightStr.toLowerCase() === '+inf' || rightStr === '+∞' || rightStr === 'inf') {
        right = '+inf';
    } else {
        const parsed = parseFloat(rightStr.replace(',', '.'));
        if (isNaN(parsed)) return null;
        right = parsed;
    }

    const leftInclusive = trimmed.startsWith('[');
    const rightInclusive = trimmed.endsWith(']');

    return { left, right, leftInclusive, rightInclusive };
}

/**
 * Check if a number is within an interval
 */
function isInInterval(value: number, interval: ParsedInterval): boolean {
    let inLeft: boolean;
    let inRight: boolean;

    // Check left bound
    if (interval.left === '-inf') {
        inLeft = true;
    } else if (interval.leftInclusive) {
        inLeft = value >= (interval.left as number);
    } else {
        inLeft = value > (interval.left as number);
    }

    // Check right bound
    if (interval.right === '+inf') {
        inRight = true;
    } else if (interval.rightInclusive) {
        inRight = value <= (interval.right as number);
    } else {
        inRight = value < (interval.right as number);
    }

    return inLeft && inRight;
}

/**
 * Compare two intervals for equality
 */
export function compareIntervals(userAnswer: string, expectedAnswer: string): boolean {
    const userInterval = parseInterval(userAnswer);
    const expectedInterval = parseInterval(expectedAnswer);

    if (!userInterval || !expectedInterval) {
        return false;
    }

    // Compare bounds
    if (userInterval.left !== expectedInterval.left ||
        userInterval.right !== expectedInterval.right ||
        userInterval.leftInclusive !== expectedInterval.leftInclusive ||
        userInterval.rightInclusive !== expectedInterval.rightInclusive) {
        return false;
    }

    return true;
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
 * - 'expression': tolerance = 1e-9 (inside compareExpressions) — symbolic, near-exact
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

        case 'expression':
            return compareExpressions(safeUserAnswer, String(answer));

        case 'interval':
            return compareIntervals(safeUserAnswer, String(answer));

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
