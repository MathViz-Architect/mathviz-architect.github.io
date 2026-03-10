import { ProblemTemplate } from './types';

export interface AdaptiveState {
    currentDifficulty: 1 | 2 | 3 | 4;
    consecutiveCorrect: number;
    consecutiveWrong: number;
    recentAnswers: boolean[]; // последние 10 ответов
}

/**
 * Initialize adaptive state for a topic
 */
export function createAdaptiveState(initialDifficulty: number = 1): AdaptiveState {
    return {
        currentDifficulty: Math.max(1, Math.min(4, initialDifficulty)) as 1 | 2 | 3 | 4,
        consecutiveCorrect: 0,
        consecutiveWrong: 0,
        recentAnswers: [],
    };
}

/**
 * Update adaptive state after each answer
 * Algorithm:
 * - 3 correct in a row → difficulty +1 (max 4)
 * - 3 wrong in a row → difficulty -1 (min 1)
 * - Accuracy < 40% in last 10 → difficulty -1
 * - Accuracy > 80% in last 10 → difficulty +1
 * - Reset consecutive counters when streak changes
 */
export function updateAdaptiveState(
    state: AdaptiveState,
    isCorrect: boolean
): AdaptiveState {
    const newRecentAnswers = [...state.recentAnswers, isCorrect].slice(-10);

    let newConsecutiveCorrect = state.consecutiveCorrect;
    let newConsecutiveWrong = state.consecutiveWrong;

    if (isCorrect) {
        newConsecutiveCorrect++;
        newConsecutiveWrong = 0;
    } else {
        newConsecutiveWrong++;
        newConsecutiveCorrect = 0;
    }

    let accuracy = 0;
    if (newRecentAnswers.length >= 5) {
        const correctCount = newRecentAnswers.filter(a => a).length;
        accuracy = correctCount / newRecentAnswers.length;
    }

    let newDifficulty = state.currentDifficulty;

    if (newConsecutiveCorrect >= 3) {
        newDifficulty = Math.min(4, newDifficulty + 1) as 1 | 2 | 3 | 4;
        newConsecutiveCorrect = 0;
    }

    if (newConsecutiveWrong >= 3) {
        newDifficulty = Math.max(1, newDifficulty - 1) as 1 | 2 | 3 | 4;
        newConsecutiveWrong = 0;
    }

    if (newRecentAnswers.length >= 10 && accuracy < 0.4) {
        newDifficulty = Math.max(1, newDifficulty - 1) as 1 | 2 | 3 | 4;
    }

    if (newRecentAnswers.length >= 10 && accuracy > 0.8) {
        newDifficulty = Math.min(4, newDifficulty + 1) as 1 | 2 | 3 | 4;
    }

    return {
        currentDifficulty: newDifficulty,
        consecutiveCorrect: newConsecutiveCorrect,
        consecutiveWrong: newConsecutiveWrong,
        recentAnswers: newRecentAnswers,
    };
}

/**
 * Returns the available difficulty levels for a template (sorted ascending).
 */
function getAvailableLevels(t: ProblemTemplate): number[] {
    return (Object.keys(t.difficulties) as string[]).map(Number).sort((a, b) => a - b);
}

/**
 * Select a template based on current difficulty.
 * Priority: templates that have the exact difficulty level configured.
 * Fallback: templates whose closest available level is nearest to requested difficulty.
 */
export function selectTemplate(
    templates: ProblemTemplate[],
    difficulty: number
): ProblemTemplate {
    if (templates.length === 0) {
        throw new Error('No templates available');
    }

    // Exact match: template has this difficulty level configured
    const exactMatches = templates.filter(
        t => t.difficulties[difficulty as 1 | 2 | 3 | 4] !== undefined
    );

    if (exactMatches.length > 0) {
        return exactMatches[Math.floor(Math.random() * exactMatches.length)];
    }

    // Fallback: find templates with the closest available difficulty level
    const closestDistance = (t: ProblemTemplate) =>
        Math.min(...getAvailableLevels(t).map(d => Math.abs(d - difficulty)));

    const sortedByCloseness = [...templates].sort(
        (a, b) => closestDistance(a) - closestDistance(b)
    );

    const minDist = closestDistance(sortedByCloseness[0]);
    const closestMatches = sortedByCloseness.filter(t => closestDistance(t) === minDist);

    return closestMatches[Math.floor(Math.random() * closestMatches.length)];
}

/**
 * Get difficulty label for UI display
 */
export function getDifficultyLabel(difficulty: 1 | 2 | 3 | 4): string {
    switch (difficulty) {
        case 1: return 'Легко';
        case 2: return 'Средне';
        case 3: return 'Сложно';
        case 4: return 'Олимпиадное';
    }
}
