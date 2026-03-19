
import { describe, it, expect } from 'vitest';
import {
  validateAnswer,
  compareExpressions,
  compareIntervals,
} from './AnswerValidator';
import type { GeneratedProblem } from '../types';

describe('AnswerValidator', () => {
  describe('validateAnswer', () => {
    it('should validate a correct number answer', () => {
      const problem: GeneratedProblem = {
        id: '1',
        template_id: '1',
        seed: 1,
        params: {},
        question: 'What is 2+2?',
        answer: '4',
        answer_type: 'number',
      };
      expect(validateAnswer(problem, '4', 'number')).toBe(true);
    });

    it('should invalidate an incorrect number answer', () => {
      const problem: GeneratedProblem = {
        id: '1',
        template_id: '1',
        seed: 1,
        params: {},
        question: 'What is 2+2?',
        answer: '4',
        answer_type: 'number',
      };
      expect(validateAnswer(problem, '5', 'number')).toBe(false);
    });

    it('should validate a correct fraction answer', () => {
      const problem: GeneratedProblem = {
        id: '1',
        template_id: '1',
        seed: 1,
        params: {},
        question: 'What is 1/2?',
        answer: '1/2',
        answer_type: 'fraction',
      };
      expect(validateAnswer(problem, '1/2', 'fraction')).toBe(true);
    });

    it('should validate an equivalent fraction answer', () => {
        const problem: GeneratedProblem = {
          id: '1',
          template_id: '1',
          seed: 1,
          params: {},
          question: 'What is 1/2?',
          answer: '1/2',
          answer_type: 'fraction',
        };
        expect(validateAnswer(problem, '2/4', 'fraction')).toBe(true);
      });

    it('should invalidate an incorrect fraction answer', () => {
      const problem: GeneratedProblem = {
        id: '1',
        template_id: '1',
        seed: 1,
        params: {},
        question: 'What is 1/2?',
        answer: '1/2',
        answer_type: 'fraction',
      };
      expect(validateAnswer(problem, '1/3', 'fraction')).toBe(false);
    });

    it('should validate a correct coordinate answer', () => {
      const problem: GeneratedProblem = {
        id: '1',
        template_id: '1',
        seed: 1,
        params: {},
        question: 'What are the coordinates?',
        answer: '(1, 2)',
        answer_type: 'coordinate',
      };
      expect(validateAnswer(problem, '(1, 2)', 'coordinate')).toBe(true);
    });

    it('should invalidate an incorrect coordinate answer', () => {
      const problem: GeneratedProblem = {
        id: '1',
        template_id: '1',
        seed: 1,
        params: {},
        question: 'What are the coordinates?',
        answer: '(1, 2)',
        answer_type: 'coordinate',
      };
      expect(validateAnswer(problem, '(2, 1)', 'coordinate')).toBe(false);
    });

    it('should validate a correct expression answer', () => {
      const problem: GeneratedProblem = {
        id: '1',
        template_id: '1',
        seed: 1,
        params: {},
        question: 'What is x+x?',
        answer: '2*x',
        answer_type: 'expression',
      };
      expect(validateAnswer(problem, 'x+x', 'expression')).toBe(true);
    });

    it('should invalidate an incorrect expression answer', () => {
      const problem: GeneratedProblem = {
        id: '1',
        template_id: '1',
        seed: 1,
        params: {},
        question: 'What is x+x?',
        answer: '2*x',
        answer_type: 'expression',
      };
      expect(validateAnswer(problem, 'x*x', 'expression')).toBe(false);
    });

    it('should validate a correct interval answer', () => {
        const problem: GeneratedProblem = {
            id: '1',
            template_id: '1',
            seed: 1,
            params: {},
            question: 'What is the interval?',
            answer: '[0; 10]',
            answer_type: 'interval',
          };
          expect(validateAnswer(problem, '[0; 10]', 'interval')).toBe(true);
    });

    it('should invalidate an incorrect interval answer', () => {
        const problem: GeneratedProblem = {
            id: '1',
            template_id: '1',
            seed: 1,
            params: {},
            question: 'What is the interval?',
            answer: '[0; 10]',
            answer_type: 'interval',
          };
          expect(validateAnswer(problem, '[0; 11]', 'interval')).toBe(false);
    });

    it('should throw an error for unimplemented answer type "set"', () => {
      const problem: GeneratedProblem = {
        id: '1',
        template_id: '1',
        seed: 1,
        params: {},
        question: 'What is the set?',
        answer: '{1, 2, 3}',
        answer_type: 'set',
      };
      expect(() => validateAnswer(problem, '{1, 2, 3}', 'set')).toThrow(
        'AnswerType "set" is not yet implemented'
      );
    });
  });

  describe('compareExpressions', () => {
    it('should return false for completely different expressions', () => {
      expect(compareExpressions('x+1', 'x+2')).toBe(false);
    });
  });

  describe('compareIntervals', () => {
    it('should return false for different interval types', () => {
      expect(compareIntervals('[0; 10]', '(0; 10)')).toBe(false);
    });
  });
});
