/**
 * Problem Selection Layer
 * Handles template selection with session-based filtering to avoid repetition
 */

import { ProblemTemplate } from './types';

export interface ProblemSession {
    topic: string;
    currentDifficulty: number;
    streak: number;
    recentTemplateIds: string[];  // последние 5, чтобы избегать повторов
    accuracy: number;              // за последние 10 задач
}

/**
 * Weights for difficulty selection.
 * Lower difficulties appear more often — pedagogically appropriate.
 */
const DIFFICULTY_WEIGHTS: Record<1 | 2 | 3 | 4, number> = {
    1: 0.40,
    2: 0.35,
    3: 0.20,
    4: 0.05,
};

/**
 * Weighted random selection from an array of items with associated difficulties.
 */
function weightedRandom<T extends { difficulty: number }>(items: T[]): T {
    const weights = items.map(item => DIFFICULTY_WEIGHTS[item.difficulty as 1 | 2 | 3 | 4] ?? 0.1);
    const total = weights.reduce((sum, w) => sum + w, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        rand -= weights[i];
        if (rand <= 0) return items[i];
    }
    return items[items.length - 1];
}

/**
 * Create initial problem session
 */
export function createProblemSession(topic: string, difficulty: number = 1): ProblemSession {
    return {
        topic,
        currentDifficulty: Math.max(1, Math.min(4, difficulty)),
        streak: 0,
        recentTemplateIds: [],
        accuracy: 0,
    };
}

/**
 * Get difficulty config with fallback (reused from adaptiveEngine logic)
 */
function getDifficultyForTemplate(template: ProblemTemplate, targetDifficulty: number): number | null {
    // Try exact match
    if (template.difficulties[targetDifficulty as 1 | 2 | 3 | 4]) {
        return targetDifficulty;
    }

    // Fallback down
    for (let d = targetDifficulty - 1; d >= 1; d--) {
        if (template.difficulties[d as 1 | 2 | 3]) {
            return d;
        }
    }

    // Fallback up
    for (let d = targetDifficulty + 1; d <= 4; d++) {
        if (template.difficulties[d as 2 | 3 | 4]) {
            return d;
        }
    }

    return null;
}

/**
 * Select a template based on session state
 * Algorithm:
 * 1. Filter by topic
 * 2. Remove recently used templates (if possible)
 * 3. Filter by difficulty (with fallback)
 * 4. Random selection from remaining
 */
export function selectTemplate(
    templates: ProblemTemplate[],
    session: ProblemSession
): ProblemTemplate | null {
    if (templates.length === 0) {
        return null;
    }

    // Step 1: Filter by topic
    let candidates = templates.filter(t => t.topic === session.topic);

    if (candidates.length === 0) {
        return null;
    }

    // Step 2: Remove recently used templates (if we have alternatives)
    const notRecent = candidates.filter(t => !session.recentTemplateIds.includes(t.id));
    if (notRecent.length > 0) {
        candidates = notRecent;
    }

    // Step 3: Filter by difficulty with fallback
    const withDifficulty = candidates
        .map(t => ({
            template: t,
            difficulty: getDifficultyForTemplate(t, session.currentDifficulty),
        }))
        .filter(item => item.difficulty !== null);

    if (withDifficulty.length === 0) {
        return null;
    }

    // Find closest difficulty
    const sortedByCloseness = withDifficulty.sort((a, b) => {
        const diffA = Math.abs(a.difficulty! - session.currentDifficulty);
        const diffB = Math.abs(b.difficulty! - session.currentDifficulty);
        return diffA - diffB;
    });

    const closestDiff = Math.abs(sortedByCloseness[0].difficulty! - session.currentDifficulty);
    // Keep only closest-difficulty candidates for weighted selection
    const closestMatches = sortedByCloseness.filter(
        item => Math.abs(item.difficulty! - session.currentDifficulty) === closestDiff
    );

    // Step 4: Weighted random selection by difficulty
    const selected = weightedRandom(closestMatches);
    return selected.template;
}

/**
 * Update session after selecting a template
 */
export function updateSessionAfterSelection(
    session: ProblemSession,
    templateId: string
): ProblemSession {
    const newRecentIds = [...session.recentTemplateIds, templateId].slice(-5);

    return {
        ...session,
        recentTemplateIds: newRecentIds,
    };
}
