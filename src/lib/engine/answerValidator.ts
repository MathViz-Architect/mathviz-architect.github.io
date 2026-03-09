/**
 * Answer validation
 * Handles normalization and comparison of user answers
 */

import { GeneratedProblem, AnswerType } from '../types';

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
    const fractionMatch = trimmed.match(/^\s*(-?\d+)\s*\/\s*(-?\d+)\s*$/);
    if (fractionMatch) {
        const numerator = parseInt(fractionMatch[1], 10);
        const denominator = parseInt(fractionMatch[2], 10);
        if (denominator !== 0) {
            return numerator / denominator;
        }
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
            const userValue = parseFraction(userAnswer);
            const expectedValue = typeof answer === 'number' ? answer : parseFraction(String(answer));

            if (userValue === null || expectedValue === null) {
                return false;
            }

            return Math.abs(userValue - expectedValue) < tolerance;
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
