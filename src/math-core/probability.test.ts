import { describe, it, expect } from 'vitest';
import {
    calculateLevel2Probabilities,
    calculateLevel3Probabilities,
    validateProbabilitySum,
    validateProbabilityRange
} from './probability';

describe('probability', () => {
    describe('calculateLevel2Probabilities', () => {
        it('should calculate probabilities in simple mode', () => {
            const result = calculateLevel2Probabilities({
                pA: 0.6,
                pB: 0.7,
                simpleMode: true
            });

            expect(result.pAandB).toBeCloseTo(0.42, 5); // 0.6 * 0.7
            expect(result.pAandNotB).toBeCloseTo(0.18, 5); // 0.6 * 0.3
            expect(result.pNotAandB).toBeCloseTo(0.28, 5); // 0.4 * 0.7
            expect(result.pNotAandNotB).toBeCloseTo(0.12, 5); // 0.4 * 0.3
        });

        it('should calculate probabilities with conditional probabilities', () => {
            const result = calculateLevel2Probabilities({
                pA: 0.6,
                pB_A: 0.7,
                pB_notA: 0.4,
                simpleMode: false
            });

            expect(result.pAandB).toBeCloseTo(0.42, 5); // 0.6 * 0.7
            expect(result.pAandNotB).toBeCloseTo(0.18, 5); // 0.6 * 0.3
            expect(result.pNotAandB).toBeCloseTo(0.16, 5); // 0.4 * 0.4
            expect(result.pNotAandNotB).toBeCloseTo(0.24, 5); // 0.4 * 0.6
        });

        it('should sum to 1 in simple mode', () => {
            const result = calculateLevel2Probabilities({
                pA: 0.5,
                pB: 0.5,
                simpleMode: true
            });

            const sum = result.pAandB + result.pAandNotB + result.pNotAandB + result.pNotAandNotB;
            expect(sum).toBeCloseTo(1, 5);
        });

        it('should sum to 1 with conditional probabilities', () => {
            const result = calculateLevel2Probabilities({
                pA: 0.3,
                pB_A: 0.8,
                pB_notA: 0.2,
                simpleMode: false
            });

            const sum = result.pAandB + result.pAandNotB + result.pNotAandB + result.pNotAandNotB;
            expect(sum).toBeCloseTo(1, 5);
        });

        it('should throw error with invalid parameters', () => {
            expect(() => {
                calculateLevel2Probabilities({
                    pA: 0.5,
                    simpleMode: false
                });
            }).toThrow('Invalid parameters for probability calculation');
        });
    });

    describe('calculateLevel3Probabilities', () => {
        it('should calculate 3-level probabilities in simple mode', () => {
            const result = calculateLevel3Probabilities({
                pA: 0.6,
                pB: 0.7,
                simpleMode: true,
                pC_AB: 0.5,
                pC_AnotB: 0.5,
                pC_notAB: 0.5,
                pC_notAnotB: 0.5
            });

            // Each level 2 probability should be split 50/50
            expect(result.pABC).toBeCloseTo(0.21, 5); // 0.42 * 0.5
            expect(result.pABnotC).toBeCloseTo(0.21, 5); // 0.42 * 0.5
            expect(result.pAnotBC).toBeCloseTo(0.09, 5); // 0.18 * 0.5
            expect(result.pAnotBnotC).toBeCloseTo(0.09, 5); // 0.18 * 0.5
            expect(result.pnotABC).toBeCloseTo(0.14, 5); // 0.28 * 0.5
            expect(result.pnotABnotC).toBeCloseTo(0.14, 5); // 0.28 * 0.5
            expect(result.pnotAnotBC).toBeCloseTo(0.06, 5); // 0.12 * 0.5
            expect(result.pnotAnotBnotC).toBeCloseTo(0.06, 5); // 0.12 * 0.5
        });

        it('should calculate 3-level probabilities with conditional probabilities', () => {
            const result = calculateLevel3Probabilities({
                pA: 0.6,
                pB_A: 0.7,
                pB_notA: 0.4,
                simpleMode: false,
                pC_AB: 0.8,
                pC_AnotB: 0.3,
                pC_notAB: 0.6,
                pC_notAnotB: 0.2
            });

            expect(result.pABC).toBeCloseTo(0.336, 5); // 0.42 * 0.8
            expect(result.pABnotC).toBeCloseTo(0.084, 5); // 0.42 * 0.2
            expect(result.pAnotBC).toBeCloseTo(0.054, 5); // 0.18 * 0.3
            expect(result.pAnotBnotC).toBeCloseTo(0.126, 5); // 0.18 * 0.7
            expect(result.pnotABC).toBeCloseTo(0.096, 5); // 0.16 * 0.6
            expect(result.pnotABnotC).toBeCloseTo(0.064, 5); // 0.16 * 0.4
            expect(result.pnotAnotBC).toBeCloseTo(0.048, 5); // 0.24 * 0.2
            expect(result.pnotAnotBnotC).toBeCloseTo(0.192, 5); // 0.24 * 0.8
        });

        it('should sum to 1', () => {
            const result = calculateLevel3Probabilities({
                pA: 0.5,
                pB: 0.5,
                simpleMode: true,
                pC_AB: 0.3,
                pC_AnotB: 0.7,
                pC_notAB: 0.4,
                pC_notAnotB: 0.9
            });

            const sum = result.pABC + result.pABnotC + result.pAnotBC + result.pAnotBnotC +
                result.pnotABC + result.pnotABnotC + result.pnotAnotBC + result.pnotAnotBnotC;
            expect(sum).toBeCloseTo(1, 5);
        });
    });

    describe('validateProbabilitySum', () => {
        it('should return true when probabilities sum to 1', () => {
            expect(validateProbabilitySum([0.25, 0.25, 0.25, 0.25])).toBe(true);
            expect(validateProbabilitySum([0.5, 0.3, 0.2])).toBe(true);
            expect(validateProbabilitySum([1.0])).toBe(true);
        });

        it('should return true when sum is within tolerance', () => {
            expect(validateProbabilitySum([0.3333, 0.3333, 0.3334])).toBe(true);
            expect(validateProbabilitySum([0.1, 0.2, 0.3, 0.4001], 0.001)).toBe(true); // sum = 1.0001, within 0.001
            expect(validateProbabilitySum([0.1, 0.2, 0.3, 0.405], 0.001)).toBe(false); // sum = 1.005, outside 0.001
            expect(validateProbabilitySum([0.1, 0.2, 0.3, 0.405], 0.01)).toBe(true); // sum = 1.005, within 0.01
        });

        it('should return false when sum is not 1', () => {
            expect(validateProbabilitySum([0.5, 0.3])).toBe(false);
            expect(validateProbabilitySum([0.3, 0.3, 0.3, 0.3])).toBe(false);
            expect(validateProbabilitySum([0.6, 0.5])).toBe(false);
        });

        it('should handle empty array', () => {
            expect(validateProbabilitySum([])).toBe(false);
        });
    });

    describe('validateProbabilityRange', () => {
        it('should return true for valid probabilities', () => {
            expect(validateProbabilityRange([0, 0.5, 1])).toBe(true);
            expect(validateProbabilityRange([0.1, 0.2, 0.3, 0.4])).toBe(true);
            expect(validateProbabilityRange([0])).toBe(true);
            expect(validateProbabilityRange([1])).toBe(true);
        });

        it('should return false for probabilities outside [0, 1]', () => {
            expect(validateProbabilityRange([-0.1, 0.5])).toBe(false);
            expect(validateProbabilityRange([0.5, 1.1])).toBe(false);
            expect(validateProbabilityRange([2])).toBe(false);
            expect(validateProbabilityRange([-1])).toBe(false);
        });

        it('should handle empty array', () => {
            expect(validateProbabilityRange([])).toBe(true);
        });
    });
});
