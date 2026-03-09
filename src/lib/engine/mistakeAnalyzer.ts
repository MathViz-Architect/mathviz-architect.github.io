/**
 * Common mistake analyzer
 * Checks user answers against known mistake patterns and provides feedback
 */

import { GeneratedProblem, ProblemTemplate, DifficultyConfig } from '../types';
import { evaluateFormula } from './expressionParser';

/**
 * Get difficulty config with fallback
 */
function getDifficultyConfig(template: ProblemTemplate, difficulty: 1 | 2 | 3 | 4): DifficultyConfig {
    if (template.difficulties[difficulty]) {
        return template.difficulties[difficulty]!;
    }
    for (let d = difficulty - 1; d >= 1; d--) {
        if (template.difficulties[d as 1 | 2 | 3]) {
            return template.difficulties[d as 1 | 2 | 3]!;
        }
    }
    for (let d = difficulty + 1; d <= 4; d++) {
        if (template.difficulties[d as 2 | 3 | 4]) {
            return template.difficulties[d as 2 | 3 | 4]!;
        }
    }
    throw new Error(`Template ${template.id}: no difficulty configs available`);
}

/**
 * Check if user answer matches a common mistake pattern.
 * Returns feedback string if matched, null otherwise.
 */
export function checkCommonMistake(
    problem: GeneratedProblem,
    template: ProblemTemplate,
    userAnswer: string,
    difficulty: 1 | 2 | 3 | 4 = 1
): string | null {
    const config = getDifficultyConfig(template, difficulty);
    if (!config.common_mistakes) return null;

    const parsed = parseFloat(userAnswer.replace(',', '.').trim());
    if (isNaN(parsed)) return null;

    for (const mistake of config.common_mistakes) {
        if (!mistake.pattern || typeof mistake.pattern !== 'string') {
            console.warn(`Template ${template.id}: common_mistake has invalid pattern`);
            continue;
        }
        if (!mistake.feedback || typeof mistake.feedback !== 'string') {
            console.warn(`Template ${template.id}: common_mistake has invalid feedback`);
            continue;
        }

        try {
            const mistakeValue = evaluateFormula(mistake.pattern, problem.params);
            if (Math.abs(parsed - Number(mistakeValue)) < 0.01) {
                return mistake.feedback;
            }
        } catch (error) {
            console.warn(`Template ${template.id}: error evaluating mistake pattern:`, error);
            continue;
        }
    }
    return null;
}
