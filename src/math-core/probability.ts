/**
 * Pure probability calculation functions extracted from ProbabilityTree component
 */

export interface ProbabilityTreeLevel2 {
    pA: number;
    pB?: number;
    pB_A?: number;
    pB_notA?: number;
    simpleMode: boolean;
}

export interface ProbabilityTreeLevel3 extends ProbabilityTreeLevel2 {
    pC_AB: number;
    pC_AnotB: number;
    pC_notAB: number;
    pC_notAnotB: number;
}

export interface Level2Probabilities {
    pAandB: number;
    pAandNotB: number;
    pNotAandB: number;
    pNotAandNotB: number;
}

export interface Level3Probabilities {
    pABC: number;
    pABnotC: number;
    pAnotBC: number;
    pAnotBnotC: number;
    pnotABC: number;
    pnotABnotC: number;
    pnotAnotBC: number;
    pnotAnotBnotC: number;
}

/**
 * Calculate final probabilities for a 2-level probability tree
 */
export const calculateLevel2Probabilities = (params: ProbabilityTreeLevel2): Level2Probabilities => {
    const { pA, pB, pB_A, pB_notA, simpleMode } = params;
    const pNotA = 1 - pA;

    if (simpleMode && pB !== undefined) {
        const pNotB = 1 - pB;
        return {
            pAandB: pA * pB,
            pAandNotB: pA * pNotB,
            pNotAandB: pNotA * pB,
            pNotAandNotB: pNotA * pNotB
        };
    }

    if (!simpleMode && pB_A !== undefined && pB_notA !== undefined) {
        const pNotB_A = 1 - pB_A;
        const pNotB_notA = 1 - pB_notA;
        return {
            pAandB: pA * pB_A,
            pAandNotB: pA * pNotB_A,
            pNotAandB: pNotA * pB_notA,
            pNotAandNotB: pNotA * pNotB_notA
        };
    }

    throw new Error('Invalid parameters for probability calculation');
};

/**
 * Calculate final probabilities for a 3-level probability tree
 */
export const calculateLevel3Probabilities = (params: ProbabilityTreeLevel3): Level3Probabilities => {
    const level2 = calculateLevel2Probabilities(params);
    const { pC_AB, pC_AnotB, pC_notAB, pC_notAnotB } = params;

    const pNotC_AB = 1 - pC_AB;
    const pNotC_AnotB = 1 - pC_AnotB;
    const pNotC_notAB = 1 - pC_notAB;
    const pNotC_notAnotB = 1 - pC_notAnotB;

    return {
        pABC: level2.pAandB * pC_AB,
        pABnotC: level2.pAandB * pNotC_AB,
        pAnotBC: level2.pAandNotB * pC_AnotB,
        pAnotBnotC: level2.pAandNotB * pNotC_AnotB,
        pnotABC: level2.pNotAandB * pC_notAB,
        pnotABnotC: level2.pNotAandB * pNotC_notAB,
        pnotAnotBC: level2.pNotAandNotB * pC_notAnotB,
        pnotAnotBnotC: level2.pNotAandNotB * pNotC_notAnotB
    };
};

/**
 * Validate that probabilities sum to 1 (within tolerance)
 */
export const validateProbabilitySum = (probabilities: number[], tolerance = 0.001): boolean => {
    const sum = probabilities.reduce((acc, p) => acc + p, 0);
    return Math.abs(sum - 1) < tolerance;
};

/**
 * Validate that all probabilities are in valid range [0, 1]
 */
export const validateProbabilityRange = (probabilities: number[]): boolean => {
    return probabilities.every(p => p >= 0 && p <= 1);
};
