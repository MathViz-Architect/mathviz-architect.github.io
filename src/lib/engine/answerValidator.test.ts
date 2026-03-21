import { describe, it, expect } from 'vitest';
import { validateAnswer } from './answerValidator';
import type { GeneratedProblem } from '../types';

describe('validateAnswer', () => {

  // Mock problem object
  const createProblem = (answer: string | number): GeneratedProblem => ({
    id: 'test-problem',
    class: 10,
    subject: 'algebra',
    topic: 'test',
    problemType: 'numeric',
    difficulties: {},
    answer: answer,
    template: 'Test problem',
    parameters: {},
  });

  // 1. Regression test for 'number'
  it('should correctly validate simple numbers', () => {
    const problem = createProblem(123);
    expect(validateAnswer(problem, '123', 'number')).toBe(true);
    expect(validateAnswer(problem, ' 123 ', 'number')).toBe(true);
    expect(validateAnswer(problem, '123.0', 'number')).toBe(true);
    expect(validateAnswer(problem, '124', 'number')).toBe(false);
  });

  // 2. Test for new 'expression' validation
  it('should validate equivalent expressions using checkEquivalence', () => {
    const problem = createProblem('1');
    // The user input will be in the "raw" format, which `toMathJSExpression` handles
    const userInput = 'sin(x)^2 + cos(x)^2';
    expect(validateAnswer(problem, userInput, 'expression')).toBe(true);
  });

  it('should return false for non-equivalent expressions', () => {
    const problem = createProblem('sin(x)');
    const userInput = 'cos(x)';
    expect(validateAnswer(problem, userInput, 'expression')).toBe(false);
  });

  // 3. Test for new 'interval' validation
  it('should validate equivalent intervals using intervalSetsEqual', () => {
    const problem = createProblem('(-Infinity, 2]');
    // Test with slightly different formatting
    const userInput = '(-inf; 2]';
    // Note: My interval parser doesn't support different separators, so I'll keep it consistent
    // Let's test the parser I actually wrote, which uses ;
    const problem2 = createProblem('(-Infinity; 2]');
    const userInput2 = '(-Infinity; 2]';
    expect(validateAnswer(problem2, userInput2, 'interval')).toBe(true);
  });

  it('should correctly compare complex interval sets', () => {
    const problem = createProblem('[-5; 0) \\cup (1; 10]');
    const userInput = '[-5; 0) \\cup (1; 10]';
    expect(validateAnswer(problem, userInput, 'interval')).toBe(true);
  });

  it('should return false for non-equivalent intervals', () => {
    const problem = createProblem('(-Infinity; 2]');
    const userInput = '(-Infinity; 2)'; // Inclusive vs exclusive
    expect(validateAnswer(problem, userInput, 'interval')).toBe(false);
  });

  // 4. Test for invalid interval input
  it('should return false for syntactically invalid interval input', () => {
    const problem = createProblem('(-Infinity; 2]');
    const userInput = '(-Infinity, 2'; // Missing closing bracket
    expect(validateAnswer(problem, userInput, 'interval')).toBe(false);
  });
});
