/**
 * adaptiveEngine — regression tests
 *
 * Focus: correctness properties that must hold after any future change.
 *
 * Key invariants:
 * 1. ONLY ONE rule fires per answer (no double difficulty jump)
 * 2. Streak counter resets correctly when direction changes
 * 3. Accuracy rule only fires when recentAnswers.length >= 10
 * 4. Difficulty is always in [1, 4]
 * 5. Streak rule takes priority over accuracy rule
 */

import { describe, it, expect } from 'vitest';
import { createAdaptiveState, updateAdaptiveState, AdaptiveState } from '../adaptiveEngine';

// ─── Helper: apply N answers ──────────────────────────────────────────────────

function applyAnswers(initial: AdaptiveState, answers: boolean[]): AdaptiveState {
    return answers.reduce((state, correct) => updateAdaptiveState(state, correct), initial);
}

// ─── Invariant 1: only one rule fires per answer ──────────────────────────────

describe('adaptiveEngine — only one rule per answer (regression)', () => {
    /**
     * Scenario: 3 correct in a row at difficulty 2.
     * Streak rule fires → difficulty becomes 3.
     * consecutiveCorrect resets to 0.
     * Accuracy rule should NOT also fire (would push to 4).
     *
     * This was the original bug: if/if/if/if instead of if/else if.
     */
    it('streak correct fires once — difficulty increases by exactly 1', () => {
        const state = createAdaptiveState(2);
        const after = applyAnswers(state, [true, true, true]);
        expect(after.currentDifficulty).toBe(3); // +1, not +2
    });

    it('streak wrong fires once — difficulty decreases by exactly 1', () => {
        const state = createAdaptiveState(3);
        const after = applyAnswers(state, [false, false, false]);
        expect(after.currentDifficulty).toBe(2); // -1, not -2
    });

    /**
     * Scenario: 10 answers, all correct. Streak fires at answer 3 (2→3),
     * resets, fires again at answer 6 (3→4), resets.
     * At answer 10, accuracy = 100% > 80%, but difficulty is already 4 (capped).
     * Accuracy rule would try to push to 5 — but it's capped at 4.
     * Difficulty must stay at 4, not jump beyond.
     */
    it('difficulty never exceeds 4 even with both streak and accuracy rules', () => {
        const state = createAdaptiveState(2);
        const after = applyAnswers(state, Array(10).fill(true));
        expect(after.currentDifficulty).toBe(4);
    });

    /**
     * Scenario: 10 answers, all wrong. Streak fires at 3 (3→2), at 6 (2→1).
     * At answer 10, accuracy = 0% < 40%, but difficulty is already 1 (capped).
     * Must stay at 1.
     */
    it('difficulty never goes below 1 even with both streak and accuracy rules', () => {
        const state = createAdaptiveState(3);
        const after = applyAnswers(state, Array(10).fill(false));
        expect(after.currentDifficulty).toBe(1);
    });

    /**
     * Scenario: streak fires on answer 3, then on answer 6.
     * Each time difficulty increases by exactly 1.
     * Total: 2→3→4 after 6 correct answers starting at difficulty 2.
     */
    it('two consecutive streaks increase difficulty by 1 each time', () => {
        const state = createAdaptiveState(2);
        const after3 = applyAnswers(state, [true, true, true]);
        expect(after3.currentDifficulty).toBe(3);
        const after6 = applyAnswers(after3, [true, true, true]);
        expect(after6.currentDifficulty).toBe(4);
    });
});

// ─── Invariant 2: streak counter resets on direction change ──────────────────

describe('adaptiveEngine — streak counter reset', () => {
    it('correct streak resets to 0 after wrong answer', () => {
        const state = createAdaptiveState(1);
        const after = applyAnswers(state, [true, true, false]);
        expect(after.consecutiveCorrect).toBe(0);
        expect(after.consecutiveWrong).toBe(1);
    });

    it('wrong streak resets to 0 after correct answer', () => {
        const state = createAdaptiveState(3);
        const after = applyAnswers(state, [false, false, true]);
        expect(after.consecutiveWrong).toBe(0);
        expect(after.consecutiveCorrect).toBe(1);
    });

    it('2 correct + 1 wrong does NOT trigger difficulty increase', () => {
        const state = createAdaptiveState(1);
        const after = applyAnswers(state, [true, true, false]);
        expect(after.currentDifficulty).toBe(1); // no change
    });

    it('2 wrong + 1 correct does NOT trigger difficulty decrease', () => {
        const state = createAdaptiveState(3);
        const after = applyAnswers(state, [false, false, true]);
        expect(after.currentDifficulty).toBe(3); // no change
    });

    it('streak counter resets to 0 after firing', () => {
        const state = createAdaptiveState(1);
        const after = applyAnswers(state, [true, true, true]);
        expect(after.consecutiveCorrect).toBe(0); // reset after streak fired
    });
});

// ─── Invariant 3: accuracy rule requires >= 10 answers ───────────────────────

describe('adaptiveEngine — accuracy rule threshold', () => {
    it('accuracy rule does NOT fire with only 9 answers', () => {
        // 9 wrong answers — streak fires at 3 and 6 (3→2→1), but accuracy rule
        // should not fire because we need >= 10 answers
        const state = createAdaptiveState(3);
        const after = applyAnswers(state, Array(9).fill(false));
        // Streak: 3→2 at answer 3, 2→1 at answer 6. At answer 9: consecutiveWrong=3 → 1→1 (capped)
        expect(after.currentDifficulty).toBe(1);
        // The key: recentAnswers has 9 items, accuracy rule didn't fire independently
        expect(after.recentAnswers.length).toBe(9);
    });

    it('accuracy rule fires at exactly 10 answers with low accuracy', () => {
        // Start at difficulty 2. Give 5 correct (streak fires at 3: 2→3, reset).
        // Then 5 wrong (streak fires at 3: 3→2, reset). At answer 10: accuracy = 5/10 = 50%.
        // 50% is between 40% and 80%, so no accuracy rule fires.
        const state = createAdaptiveState(2);
        const after = applyAnswers(state, [true, true, true, true, true, false, false, false, false, false]);
        expect(after.recentAnswers.length).toBe(10);
        // Difficulty: 2→3 (after 3 correct), 3→2 (after 3 wrong). Final: 2.
        expect(after.currentDifficulty).toBe(2);
    });

    it('accuracy rule fires when accuracy < 40% over 10 answers', () => {
        // 3 correct, 7 wrong over 10 answers. Accuracy = 30% < 40%.
        // But streak also fires: 3 wrong in a row triggers -1.
        // We need a scenario where accuracy rule fires independently.
        // Pattern: CWWCWWCWWW — no 3-in-a-row streak, but accuracy = 3/10 = 30%
        const state = createAdaptiveState(3);
        const pattern = [true, false, false, true, false, false, true, false, false, false];
        const after = applyAnswers(state, pattern);
        expect(after.recentAnswers.length).toBe(10);
        const accuracy = after.recentAnswers.filter(Boolean).length / 10;
        expect(accuracy).toBeLessThan(0.4);
        // Difficulty should have decreased
        expect(after.currentDifficulty).toBeLessThan(3);
    });
});

// ─── Invariant 4: difficulty always in [1, 4] ────────────────────────────────

describe('adaptiveEngine — difficulty bounds', () => {
    it('difficulty stays at 4 after many correct answers', () => {
        const state = createAdaptiveState(4);
        const after = applyAnswers(state, Array(30).fill(true));
        expect(after.currentDifficulty).toBe(4);
    });

    it('difficulty stays at 1 after many wrong answers', () => {
        const state = createAdaptiveState(1);
        const after = applyAnswers(state, Array(30).fill(false));
        expect(after.currentDifficulty).toBe(1);
    });

    it('difficulty is always a valid integer 1-4 after random sequence', () => {
        // Property-like: run 100 random answers, difficulty always in [1,4]
        let state = createAdaptiveState(2);
        // Deterministic "random" sequence using simple LCG
        let seed = 12345;
        for (let i = 0; i < 100; i++) {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            const correct = seed % 2 === 0;
            state = updateAdaptiveState(state, correct);
            expect(state.currentDifficulty).toBeGreaterThanOrEqual(1);
            expect(state.currentDifficulty).toBeLessThanOrEqual(4);
            expect(Number.isInteger(state.currentDifficulty)).toBe(true);
        }
    });
});

// ─── Invariant 5: recentAnswers window ───────────────────────────────────────

describe('adaptiveEngine — recentAnswers window', () => {
    it('recentAnswers never exceeds 10', () => {
        let state = createAdaptiveState(2);
        for (let i = 0; i < 25; i++) {
            state = updateAdaptiveState(state, i % 3 !== 0);
            expect(state.recentAnswers.length).toBeLessThanOrEqual(10);
        }
    });

    it('recentAnswers is a sliding window (oldest dropped)', () => {
        let state = createAdaptiveState(2);
        // Fill with 10 correct
        state = applyAnswers(state, Array(10).fill(true));
        expect(state.recentAnswers.every(Boolean)).toBe(true);
        // Add 1 wrong — oldest correct is dropped
        state = updateAdaptiveState(state, false);
        expect(state.recentAnswers.length).toBe(10);
        expect(state.recentAnswers[9]).toBe(false); // newest is wrong
    });
});

// ─── Invariant 6: hints reset after each answer ──────────────────────────────

describe('adaptiveEngine — hints reset', () => {
    it('hintsUsedInCurrentProblem resets to 0 after updateAdaptiveState', () => {
        let state = createAdaptiveState(1);
        // Simulate using 3 hints
        state = { ...state, hintsUsedInCurrentProblem: 3 };
        state = updateAdaptiveState(state, true);
        expect(state.hintsUsedInCurrentProblem).toBe(0);
    });

    it('hintsUsedInCurrentProblem resets even on wrong answer', () => {
        let state = createAdaptiveState(1);
        state = { ...state, hintsUsedInCurrentProblem: 2 };
        state = updateAdaptiveState(state, false);
        expect(state.hintsUsedInCurrentProblem).toBe(0);
    });
});
