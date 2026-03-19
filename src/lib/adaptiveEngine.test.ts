import { describe, it, expect, beforeEach } from 'vitest';
import {
    createAdaptiveState,
    updateAdaptiveState,
    selectTemplate,
    getDifficultyLabel,
    calculateAnswerWeight,
    updateHintsUsed,
    getWeightedAnswer,
    AdaptiveState,
} from './adaptiveEngine';

describe('Adaptive Engine', () => {
    describe('createAdaptiveState', () => {
        it('should create state with default difficulty 1', () => {
            const state = createAdaptiveState();
            expect(state.currentDifficulty).toBe(1);
            expect(state.consecutiveCorrect).toBe(0);
            expect(state.consecutiveWrong).toBe(0);
            expect(state.recentAnswers).toEqual([]);
            expect(state.hintsUsedInCurrentProblem).toBe(0);
        });

        it('should clamp difficulty to valid range', () => {
            expect(createAdaptiveState(0).currentDifficulty).toBe(1);
            expect(createAdaptiveState(5).currentDifficulty).toBe(4);
            expect(createAdaptiveState(3).currentDifficulty).toBe(3);
        });

        it('should use provided initial difficulty', () => {
            const state = createAdaptiveState(2);
            expect(state.currentDifficulty).toBe(2);
        });
    });

    describe('updateAdaptiveState', () => {
        it('should increment consecutive correct on correct answer', () => {
            let state = createAdaptiveState(1);
            state = updateAdaptiveState(state, true);
            expect(state.consecutiveCorrect).toBe(1);
            expect(state.consecutiveWrong).toBe(0);
        });

        it('should increment consecutive wrong on wrong answer', () => {
            let state = createAdaptiveState(1);
            state = updateAdaptiveState(state, false);
            expect(state.consecutiveWrong).toBe(1);
            expect(state.consecutiveCorrect).toBe(0);
        });

        it('should increase difficulty after 3 correct in a row', () => {
            let state = createAdaptiveState(1);
            state = updateAdaptiveState(state, true);
            state = updateAdaptiveState(state, true);
            state = updateAdaptiveState(state, true);
            expect(state.currentDifficulty).toBe(2);
            expect(state.consecutiveCorrect).toBe(0);
        });

        it('should decrease difficulty after 3 wrong in a row', () => {
            let state = createAdaptiveState(3);
            state = updateAdaptiveState(state, false);
            state = updateAdaptiveState(state, false);
            state = updateAdaptiveState(state, false);
            expect(state.currentDifficulty).toBe(2);
            expect(state.consecutiveWrong).toBe(0);
        });

        it('should not exceed difficulty 4', () => {
            let state = createAdaptiveState(4);
            state = updateAdaptiveState(state, true);
            state = updateAdaptiveState(state, true);
            state = updateAdaptiveState(state, true);
            expect(state.currentDifficulty).toBe(4);
        });

        it('should not go below difficulty 1', () => {
            let state = createAdaptiveState(1);
            state = updateAdaptiveState(state, false);
            state = updateAdaptiveState(state, false);
            state = updateAdaptiveState(state, false);
            expect(state.currentDifficulty).toBe(1);
        });

        it('should maintain recent answers up to 10', () => {
            let state = createAdaptiveState(1);
            for (let i = 0; i < 15; i++) {
                state = updateAdaptiveState(state, i % 2 === 0);
            }
            expect(state.recentAnswers.length).toBe(10);
        });

        it('should track accuracy over last 10 answers', () => {
            let state = createAdaptiveState(2);
            // 8 correct, 2 wrong. Accuracy = 80%.
            // Difficulty increases from 2->3 on 3rd correct, then 3->4 on 6th correct.
            // Accuracy rule for >80% is not met. Final should be 4.
            for (let i = 0; i < 8; i++) {
                state = updateAdaptiveState(state, true);
            }
            for (let i = 0; i < 2; i++) {
                state = updateAdaptiveState(state, false);
            }
            expect(state.currentDifficulty).toBe(4);
        });

        it('should decrease difficulty when accuracy < 40%', () => {
            let state = createAdaptiveState(3);
            // 10 wrong answers.
            // Difficulty decreases from 3->2 on 3rd wrong, then 2->1 on 6th.
            // At 10th answer, accuracy is 0%, which triggers another decrease, but it's capped at 1.
            for (let i = 0; i < 10; i++) {
                state = updateAdaptiveState(state, false);
            }
            expect(state.currentDifficulty).toBe(1);
        });

        it('should reset hints used after each answer', () => {
            let state = createAdaptiveState(1);
            state = updateHintsUsed(state);
            state = updateHintsUsed(state);
            state = updateAdaptiveState(state, true);
            expect(state.hintsUsedInCurrentProblem).toBe(0);
        });
    });

    describe('selectTemplate', () => {
        const templates = [
            { id: 't1', difficulties: { 1: {}, 2: {} } } as any,
            { id: 't2', difficulties: { 2: {}, 3: {} } } as any,
            { id: 't3', difficulties: { 4: {} } } as any,
        ];

        it('should throw when no templates available', () => {
            expect(() => selectTemplate([], 1)).toThrow('No templates available');
        });

        it('should return template with exact difficulty match', () => {
            const result = selectTemplate(templates, 3);
            expect(result.id).toBe('t2');
        });

        it('should fallback to closest difficulty', () => {
            const result = selectTemplate(templates, 3.5);
            expect(['t2', 't3']).toContain(result.id);
        });
    });

    describe('getDifficultyLabel', () => {
        it('should return correct labels', () => {
            expect(getDifficultyLabel(1)).toBe('Легко');
            expect(getDifficultyLabel(2)).toBe('Средне');
            expect(getDifficultyLabel(3)).toBe('Сложно');
            expect(getDifficultyLabel(4)).toBe('Олимпиадное');
        });
    });

    describe('calculateAnswerWeight', () => {
        it('should return 1.0 when no hints used', () => {
            expect(calculateAnswerWeight(0)).toBe(1.0);
        });

        it('should return 0.5 when 1 hint used', () => {
            expect(calculateAnswerWeight(1)).toBe(0.5);
        });

        it('should return 0.0 when 2+ hints used', () => {
            expect(calculateAnswerWeight(2)).toBe(0.0);
            expect(calculateAnswerWeight(5)).toBe(0.0);
        });
    });

    describe('updateHintsUsed', () => {
        it('should increment hints used', () => {
            const state = createAdaptiveState();
            const updated = updateHintsUsed(updateHintsUsed(state));
            expect(updated.hintsUsedInCurrentProblem).toBe(2);
        });
    });

    describe('getWeightedAnswer', () => {
        it('should return false for wrong answer', () => {
            expect(getWeightedAnswer(false, 0)).toBe(false);
        });

        it('should return true for correct with no hints', () => {
            const results = Array.from({ length: 20 }, () => getWeightedAnswer(true, 0));
            expect(results.every(r => r === true)).toBe(true);
        });
    });
});
