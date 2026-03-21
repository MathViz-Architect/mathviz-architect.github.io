
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { checkEquivalence } from '../engine/equivalence';
import { parseIntervalSet } from '../engine/intervals';

describe('Property-based tests for stability', () => {

  /**
   * Test that checkEquivalence does not throw unhandled exceptions with arbitrary string inputs.
   * It's expected to fail gracefully (e.g., return isEquivalent: false) but not crash.
   */
  it('checkEquivalence should not crash on garbage string expressions', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (str1, str2) => {
        try {
          // We are testing with a single variable 'x' for simplicity.
          // The goal is to ensure no unhandled exceptions occur.
          const result = checkEquivalence(str1, str2, ['x']);
          
          // We can perform a basic check on the result structure.
          expect(result).toHaveProperty('isEquivalent');
          expect(result).toHaveProperty('confidence');
          expect(result).toHaveProperty('validPointsUsed');

        } catch (error) {
          // This catch block will fail the test if any error is thrown.
          expect.fail(`checkEquivalence threw an unexpected error: ${error}`);
        }
      }),
      {
        numRuns: 100,
        verbose: false,
      }
    );
  });

  /**
   * Test that parseIntervalSet does not throw unhandled exceptions with arbitrary string inputs.
   * It's expected to return an empty array or partially parsed set, but not crash.
   */
  it('parseIntervalSet should not crash on garbage string input', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        try {
          const result = parseIntervalSet(input);
          
          // The result should always be an array (even if empty).
          expect(Array.isArray(result)).toBe(true);

        } catch (error) {
          // This catch block will fail the test if any error is thrown.
          expect.fail(`parseIntervalSet threw an unexpected error: ${error}`);
        }
      }),
      {
        numRuns: 100,
        verbose: false,
      }
    );
  });

});
