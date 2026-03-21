/**
 * Shared mathematical constants used across normalization, equivalence checking,
 * and input logic. Single source of truth — import from here, not redeclare.
 */

/** Trig functions recognized for power notation: sin^2(x) → (sin(x))^2 */
export const TRIG_FUNCTIONS = [
    'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
    'arcsin', 'arccos', 'arctan',
] as const;

export type TrigFunction = typeof TRIG_FUNCTIONS[number];

/**
 * Variables used for implicit multiplication expansion (e.g. "2x" → "2*x").
 * Order matters: longer names must come before shorter ones to avoid partial matches.
 */
export const IMPLICIT_MULT_VARS = [
    'pi', 'e',
    'x', 'y', 'z',
    'a', 'b', 'c',
    'k', 'm', 'n', 't',
] as const;

/**
 * Default variable set for equivalence sampling when no variables can be
 * extracted from the expression. Covers the vast majority of school problems.
 */
export const DEFAULT_EQUIVALENCE_VARS = ['x', 'y', 'z', 'a', 'b', 'c', 'k', 'm', 'n', 't'] as const;

/**
 * Atomic keyword tokens protected from mid-token cursor insertion / smart backspace.
 * Extend this list when adding new function tokens to the input pipeline.
 */
export const ATOMIC_KEYWORDS = [
    'sqrt', 'pi',
    'log_', 'ln', 'lg',
    'arcsin', 'arccos', 'arctan',
] as const;

export type AtomicKeyword = typeof ATOMIC_KEYWORDS[number];
