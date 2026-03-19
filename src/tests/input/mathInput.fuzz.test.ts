import { describe, it, expect } from 'vitest';
import { normalizeMathExpression, getCleanExpression, validateExpression } from '../../components/math-input/useMathInputLogic';

// Seeded pseudo-random number generator for deterministic tests
const seed = 42;
let m_w = 123456789 + seed;
let m_z = 987654321 - seed;
const mask = 0xffffffff;

const random = () => {
  m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
  m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
  let result = ((m_z << 16) + m_w) & mask;
  result /= 4294967296;
  return result;
}

const generateRandomString = (length: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789()[]{}.,/\\+-*^|&%#@!~`\\\'";:<>? ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(random() * chars.length));
  }
  return result;
};

const generateLatexLikeString = (length: number): string => {
    const fragments = [
        '\\frac{', '}{', '}', '\\sqrt{', '}', '\\sin(', ')', '\\cos(', ')',
        '\\tan(', ')', '\\log(', ')', 'x', 'y', 'z', 'pi', 'e', '+', '-', '*', '/', '^',
        '\\le', '\\ge', '\\neq', '(', ')'
    ];
    let result = '';
    while (result.length < length) {
        result += fragments[Math.floor(random() * fragments.length)];
    }
    return result.slice(0, length);
}


describe('Math Input Fuzzing', () => {

  const runFuzzTest = (func: (input: string) => any, generator: (length: number) => string, iterations = 100, maxLength = 50) => {
    for (let i = 0; i < iterations; i++) {
      const randomLength = Math.floor(random() * maxLength) + 1;
      const input = generator(randomLength);
      try {
        func(input);
      } catch (e) {
        // We expect errors, but not crashes. This test fails if an unexpected error type is thrown.
        // For this test, we are just ensuring the functions don't crash the test runner.
        expect(e).toBeInstanceOf(Error);
      }
    }
  };

  it('normalizeMathExpression should not crash on random alphanumeric input', () => {
    runFuzzTest(normalizeMathExpression, generateRandomString);
  });

  it('normalizeMathExpression should not crash on random LaTeX-like input', () => {
    runFuzzTest(normalizeMathExpression, generateLatexLikeString);
  });

  it('getCleanExpression should not crash on random alphanumeric input', () => {
    runFuzzTest(getCleanExpression, generateRandomString);
  });

  it('getCleanExpression should not crash on random LaTeX-like input', () => {
    runFuzzTest(getCleanExpression, generateLatexLikeString);
  });

  it('validateExpression should not crash on random alphanumeric input', () => {
    runFuzzTest(validateExpression, generateRandomString);
  });

  it('validateExpression should not crash on random LaTeX-like input', () => {
    runFuzzTest(validateExpression, generateLatexLikeString);
  });
});
