/**
 * Answer validation
 * Handles normalization and comparison of user answers
 */

import { GeneratedProblem, AnswerType } from '../types';

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
 */
export function validateAnswer(
    problem: GeneratedProblem,
    userAnswer: string,
    answerType: AnswerType = 'number'
): boolean {
    const answer = problem.answer;
    const tolerance = 0.001;

    switch (answerType) {
        case 'number': {
            // Try numeric comparison
            const parsed = parseFloat(userAnswer.replace(',', '.').trim());
            const expected = parseFloat(String(answer));

            if (!isNaN(parsed) && !isNaN(expected)) {
                return Math.abs(parsed - expected) < tolerance;
            }

            // Fall back to text comparison
            return userAnswer.trim().toLowerCase() === String(answer).trim().toLowerCase();
        }

        case 'fraction': {
            // Try to parse user answer as a fraction
            const userRational = parseFractionToRational(userAnswer);

            // Parse expected answer
            let expectedRational: [number, number] | null = null;

            if (typeof answer === 'number') {
                // Convert decimal to fraction (with reasonable precision)
                // For example: 0.444... should match 4/9
                const userDecimal = userRational ? userRational[0] / userRational[1] : parseFraction(userAnswer);

                if (userDecimal === null) {
                    return false;
                }

                // Use larger tolerance for decimal comparison with fractions
                return Math.abs(userDecimal - answer) < 0.01;
            } else if (typeof answer === 'string') {
                expectedRational = parseFractionToRational(answer);
            }

            // If both are fractions, compare as rational numbers
            if (userRational && expectedRational) {
                const [userNum, userDen] = reduceFraction(userRational[0], userRational[1]);
                const [expNum, expDen] = reduceFraction(expectedRational[0], expectedRational[1]);

                return userNum === expNum && userDen === expDen;
            }

            // Fallback to decimal comparison
            const userValue = parseFraction(userAnswer);
            const expectedValue = typeof answer === 'number' ? answer : parseFraction(String(answer));

            if (userValue === null || expectedValue === null) {
                return false;
            }

            return Math.abs(userValue - expectedValue) < 0.01;
        }

        case 'coordinate': {
            const userCoord = parseCoordinate(userAnswer);

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
            throw new Error('AnswerType "expression" is not yet implemented');

        case 'interval':
            throw new Error('AnswerType "interval" is not yet implemented');

        case 'set':
            throw new Error('AnswerType "set" is not yet implemented');

        default:
            // Fallback to number validation
            const parsed = parseFloat(userAnswer.replace(',', '.').trim());
            const expected = parseFloat(String(answer));

            if (!isNaN(parsed) && !isNaN(expected)) {
                return Math.abs(parsed - expected) < tolerance;
            }

            return userAnswer.trim().toLowerCase() === String(answer).trim().toLowerCase();
    }
}
