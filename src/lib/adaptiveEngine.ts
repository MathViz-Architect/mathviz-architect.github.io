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
    // Update recent answers (keep last 10)
    const newRecentAnswers = [...state.recentAnswers, isCorrect].slice(-10);

    // Update consecutive counters
    let newConsecutiveCorrect = state.consecutiveCorrect;
    let newConsecutiveWrong = state.consecutiveWrong;

    if (isCorrect) {
        newConsecutiveCorrect++;
        newConsecutiveWrong = 0; // Reset wrong streak
    } else {
        newConsecutiveWrong++;
        newConsecutiveCorrect = 0; // Reset correct streak
    }

    // Calculate accuracy from recent answers (if we have enough data)
    let accuracy = 0;
    if (newRecentAnswers.length >= 5) {
        const correctCount = newRecentAnswers.filter(a => a).length;
        accuracy = correctCount / newRecentAnswers.length;
    }

    // Determine new difficulty
    let newDifficulty = state.currentDifficulty;

    // Rule 1: 3 correct in a row → increase difficulty
    if (newConsecutiveCorrect >= 3) {
        newDifficulty = Math.min(4, newDifficulty + 1) as 1 | 2 | 3 | 4;
        newConsecutiveCorrect = 0; // Reset after applying
    }

    // Rule 2: 3 wrong in a row → decrease difficulty
    if (newConsecutiveWrong >= 3) {
        newDifficulty = Math.max(1, newDifficulty - 1) as 1 | 2 | 3 | 4;
        newConsecutiveWrong = 0; // Reset after applying
    }

    // Rule 3: Low accuracy (< 40%) → decrease difficulty
    if (newRecentAnswers.length >= 10 && accuracy < 0.4) {
        newDifficulty = Math.max(1, newDifficulty - 1) as 1 | 2 | 3 | 4;
    }

    // Rule 4: High accuracy (> 80%) → increase difficulty
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
 * Select a template based on current difficulty
 * Priority: templates with difficulty === currentDifficulty
 * Fallback: closest difficulty
 * Random selection among matching templates
 */
export function selectTemplate(
    templates: ProblemTemplate[],
    difficulty: number
): ProblemTemplate {
    if (templates.length === 0) {
        throw new Error('No templates available');
    }

    // Filter templates by exact difficulty match
    const exactMatches = templates.filter(t => t.difficulty === difficulty);

    if (exactMatches.length > 0) {
        // Random selection from exact matches
        return exactMatches[Math.floor(Math.random() * exactMatches.length)];
    }

    // No exact match - find closest difficulty
    const sortedByCloseness = [...templates].sort((a, b) => {
        const diffA = Math.abs(a.difficulty - difficulty);
        const diffB = Math.abs(b.difficulty - difficulty);
        return diffA - diffB;
    });

    // Get all templates with the closest difficulty
    const closestDiff = Math.abs(sortedByCloseness[0].difficulty - difficulty);
    const closestMatches = sortedByCloseness.filter(
        t => Math.abs(t.difficulty - difficulty) === closestDiff
    );

    // Random selection from closest matches
    return closestMatches[Math.floor(Math.random() * closestMatches.length)];
}

/**
 * Get difficulty label for UI display
 */
export function getDifficultyLabel(difficulty: 1 | 2 | 3 | 4): string {
    switch (difficulty) {
        case 1:
            return 'Легко';
        case 2:
            return 'Средне';
        case 3:
            return 'Сложно';
        case 4:
            return 'Олимпиадное';
    }
}
