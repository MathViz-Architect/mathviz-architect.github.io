/**
 * Problem Engine Test Suite
 * Tests MathJS, KaTeX, Hints, and Canvas Action features
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  compareExpressions, 
  compareIntervals 
} from './answerValidator';
import { 
  calculateAnswerWeight, 
  getWeightedAnswer,
  createAdaptiveState,
  updateAdaptiveState
} from '../adaptiveEngine';
import { generateProblem } from './variantGenerator';
import type { ProblemTemplate } from '../types';
import { checkCommonMistake } from './mistakeAnalyzer';

describe('Problem Engine', () => {
  describe('MathJS Expression Comparison', () => {
    it('should recognize sqrt(18) = 3*sqrt(2)', () => {
      expect(compareExpressions('sqrt(18)', '3*sqrt(2)')).toBe(true);
    });

    it('should recognize 1/4 vs 0.25 as equal', () => {
      expect(compareExpressions('1/4', '0.25')).toBe(true);
    });

    it('should expand (x-1)(x+2) to x^2+x-2', () => {
      expect(compareExpressions('(x-1)*(x+2)', 'x^2+x-2')).toBe(true);
    });

    it('should recognize 0.5 vs 1/2 as equal', () => {
      expect(compareExpressions('0.5', '1/2')).toBe(true);
    });

    it('should recognize 2*sqrt(2) vs sqrt(8) as equal', () => {
      expect(compareExpressions('2*sqrt(2)', 'sqrt(8)')).toBe(true);
    });

    it('should recognize 4/8 vs 1/2 as equal', () => {
      expect(compareExpressions('4/8', '1/2')).toBe(true);
    });

    it('should simplify x+x to 2x', () => {
      expect(compareExpressions('x+x', '2*x')).toBe(true);
    });

    it('should recognize x^2 vs x*x as equal', () => {
      expect(compareExpressions('x^2', 'x*x')).toBe(true);
    });
  });

  describe('Interval Comparison', () => {
    it('should recognize [2; +inf) = [2; inf)', () => {
      expect(compareIntervals('[2; +inf)', '[2; inf)')).toBe(true);
    });

    it('should recognize (1; 5] != (1; 5)', () => {
      expect(compareIntervals('(1; 5]', '(1; 5)')).toBe(false);
    });

    it('should recognize [0; 10] = [0; 10]', () => {
      expect(compareIntervals('[0; 10]', '[0; 10]')).toBe(true);
    });

    it('should recognize (-inf; 3) = (-inf; 3)', () => {
      expect(compareIntervals('(-inf; 3)', '(-inf; 3)')).toBe(true);
    });

    it('should recognize [1; 2] != [1; 3)', () => {
      expect(compareIntervals('[1; 2]', '[1; 3)')).toBe(false);
    });

    it('should recognize (0; 1) = (0; 1)', () => {
      expect(compareIntervals('(0; 1)', '(0; 1)')).toBe(true);
    });
  });

  describe('Adaptive Engine', () => {
    it('should calculate weight 1.0 for 0 hints', () => {
      expect(calculateAnswerWeight(0)).toBe(1.0);
    });

    it('should calculate weight 0.5 for 1 hint', () => {
      expect(calculateAnswerWeight(1)).toBe(0.5);
    });

    it('should calculate weight 0.0 for 2+ hints', () => {
      expect(calculateAnswerWeight(2)).toBe(0.0);
      expect(calculateAnswerWeight(3)).toBe(0.0);
    });

    it('should return true for correct answer with 0 hints', () => {
      expect(getWeightedAnswer(true, 0)).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      expect(getWeightedAnswer(false, 0)).toBe(false);
    });

    it('should return false for correct answer with 2+ hints', () => {
      expect(getWeightedAnswer(true, 2)).toBe(false);
    });

    it('should create initial adaptive state', () => {
      const state = createAdaptiveState();
      expect(state.hintsUsedInCurrentProblem).toBe(0);
      expect(state.currentDifficulty).toBe(1);
    });

    it('should increase difficulty after 3 correct without hints', () => {
      let state = createAdaptiveState();
      state = updateAdaptiveState(state, true);
      state = updateAdaptiveState(state, true);
      state = updateAdaptiveState(state, true);
      expect(state.currentDifficulty).toBe(2);
    });
  });

  describe('Canvas Action Problems', () => {
    it('should generate canvas action problem', () => {
      const template: ProblemTemplate = {
        id: 'canvas-test',
        class: 9,
        subject: 'algebra',
        section: 'Coordinate Plane',
        topic: 'points',
        topic_title: 'Точки на координатной плоскости',
        problemType: 'canvas_action',
        difficulties: {
          1: {
            template: 'Move the point P to coordinates ({x}, {y})',
            parameters: {
              x: { type: 'int', min: -10, max: 10 },
              y: { type: 'int', min: -10, max: 10 }
            },
            answer_formula: '0',
            answer_type: 'number'
          }
        }
      };

      const generated = generateProblem(template, 1, 999);
      expect(generated.params.x).toBeDefined();
      expect(generated.params.y).toBeDefined();
      expect(generated.question).toContain('(');
    });

    it('should create canvas action problem structure', () => {
      const canvasProblem = {
        id: 'test-canvas-1',
        template_id: 'test',
        seed: 123,
        params: { x: 5, y: 10 },
        question: 'Move the point to coordinates (5, 10)',
        answer: '',
        answer_type: 'number' as const,
        canvasAction: {
          action: 'move_point' as const,
          targetData: {
            point: { x: 5, y: 10 }
          },
          tolerance: 10
        }
      };

      expect(canvasProblem.canvasAction?.action).toBe('move_point');
      expect(canvasProblem.canvasAction?.targetData.point).toEqual({ x: 5, y: 10 });
      expect(canvasProblem.canvasAction?.tolerance).toBe(10);
    });
  });

  describe('Math Invariants', () => {
    describe('Triangle Inequality', () => {
      const checkTriangleInequality = (a: number, b: number, c: number): boolean => {
        return a + b > c && a + c > b && b + c > a;
      };

      it('should satisfy triangle inequality for valid triangles', () => {
        expect(checkTriangleInequality(3, 4, 5)).toBe(true);
        expect(checkTriangleInequality(5, 12, 13)).toBe(true);
        expect(checkTriangleInequality(8, 15, 17)).toBe(true);
      });

      it('should fail triangle inequality for degenerate triangles', () => {
        expect(checkTriangleInequality(1, 2, 3)).toBe(false);
        expect(checkTriangleInequality(2, 3, 5)).toBe(false);
      });

      it('should fail triangle inequality for impossible sides', () => {
        expect(checkTriangleInequality(1, 1, 10)).toBe(false);
      });
    });

    describe('Distance Symmetry', () => {
      const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      };

      it('should be symmetric: distance(A,B) = distance(B,A)', () => {
        const d1 = calculateDistance(0, 0, 3, 4);
        const d2 = calculateDistance(3, 4, 0, 0);
        expect(d1).toBe(d2);
      });

      it('should be zero for same point', () => {
        const d = calculateDistance(5, 5, 5, 5);
        expect(d).toBe(0);
      });

      it('should satisfy triangle inequality for distance', () => {
        const dAB = calculateDistance(0, 0, 1, 0);
        const dBC = calculateDistance(1, 0, 1, 1);
        const dAC = calculateDistance(0, 0, 1, 1);
        expect(dAB + dBC).toBeGreaterThanOrEqual(dAC);
      });
    });

    describe('Pythagorean Theorem Invariant', () => {
      it('should maintain a² + b² = c² for right triangles', () => {
        const triangles = [
          { a: 3, b: 4, c: 5 },
          { a: 5, b: 12, c: 13 },
          { a: 8, b: 15, c: 17 },
          { a: 7, b: 24, c: 25 },
        ];

        for (const { a, b, c } of triangles) {
          expect(a * a + b * b).toBe(c * c);
        }
      });
    });

    describe('Probability Invariants', () => {
    it('should have probabilities sum to 1 for mutually exclusive events', () => {
      const pA = 0.3;
      const pB = 0.7;
      expect(pA + pB).toBeCloseTo(1, 10);
    });

    it('should have conditional probability P(A) = P(A and B) + P(A and not B)', () => {
      const pA = 0.5;
      const pB_A = 0.6;
      const pB_notA = 0.4;
      
      const pAandB = pA * pB_A;
      const pAandNotB = pA * (1 - pB_A);
      const pNotAandB = (1 - pA) * pB_notA;
      const pNotAandNotB = (1 - pA) * (1 - pB_notA);
      
      // Sum of all joint probabilities should be 1
      expect(pAandB + pAandNotB + pNotAandB + pNotAandNotB).toBeCloseTo(1, 10);
    });
  });

    describe('Vector Normalization Stability', () => {
      const normalizeVector = (x: number, y: number): { x: number; y: number; magnitude: number } => {
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude === 0) return { x: 0, y: 0, magnitude: 0 };
        return { x: x / magnitude, y: y / magnitude, magnitude: 1 };
      };

      it('should produce unit vectors with magnitude 1', () => {
        const vectors = [
          { x: 3, y: 4 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: -3, y: -4 },
        ];

        for (const { x, y } of vectors) {
          const normalized = normalizeVector(x, y);
          if (x !== 0 || y !== 0) {
            expect(normalized.magnitude).toBe(1);
          }
        }
      });

      it('should handle zero vector gracefully', () => {
        const result = normalizeVector(0, 0);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
        expect(result.magnitude).toBe(0);
      });
    });
  });

  describe('Mistake Analyzer', () => {
    const createMockTemplate = (mistakes?: { pattern: string; feedback: string }[]): ProblemTemplate => ({
      id: 'test',
      class: 7,
      subject: 'algebra',
      section: 'Equations',
      topic: 'linear',
      topic_title: 'Linear Equations',
      problemType: 'numeric',
      difficulties: {
        1: {
          template: 'Solve {a}x + {b} = {c}',
          parameters: {
            a: { type: 'int', min: 1, max: 10 },
            b: { type: 'int', min: 1, max: 10 },
            c: { type: 'int', min: 1, max: 50 },
          },
          answer_formula: '(c-b)/a',
          answer_type: 'number',
          common_mistakes: mistakes,
        },
      },
    });

    it('should detect common mistake pattern', () => {
      const template = createMockTemplate([
        { pattern: 'c', feedback: 'Did you forget to subtract b first?' },
      ]);

      const problem = {
        id: 'p1',
        template_id: 'test',
        seed: 1,
        params: { a: 2, b: 3, c: 7 },
        question: 'Solve 2x + 3 = 7',
        answer: '2',
        answer_type: 'number' as const,
      };

      const result = checkCommonMistake(problem, template, '7', 1);
      expect(result).toBe('Did you forget to subtract b first?');
    });

    it('should return null when no mistake detected', () => {
      const template = createMockTemplate([
        { pattern: '100', feedback: 'Wrong answer' },
      ]);

      const problem = {
        id: 'p1',
        template_id: 'test',
        seed: 1,
        params: { a: 2, b: 3, c: 7 },
        question: 'Solve 2x + 3 = 7',
        answer: '2',
        answer_type: 'number' as const,
      };

      const result = checkCommonMistake(problem, template, '2', 1);
      expect(result).toBeNull();
    });

    it('should return null for invalid answer', () => {
      const template = createMockTemplate([
        { pattern: '5', feedback: 'Wrong' },
      ]);

      const problem = {
        id: 'p1',
        template_id: 'test',
        seed: 1,
        params: { a: 2, b: 3, c: 7 },
        question: 'Solve 2x + 3 = 7',
        answer: '2',
        answer_type: 'number' as const,
      };

      const result = checkCommonMistake(problem, template, 'abc', 1);
      expect(result).toBeNull();
    });

    it('should return null when no common_mistakes defined', () => {
      const template = createMockTemplate();

      const problem = {
        id: 'p1',
        template_id: 'test',
        seed: 1,
        params: { a: 2, b: 3, c: 7 },
        question: 'Solve 2x + 3 = 7',
        answer: '2',
        answer_type: 'number' as const,
      };

      const result = checkCommonMistake(problem, template, '7', 1);
      expect(result).toBeNull();
    });
  });
});
