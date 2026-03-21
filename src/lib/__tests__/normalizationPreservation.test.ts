/**
 * normalizeMathExpression — LaTeX preservation tests
 *
 * Ensures that already-LaTeX expressions are NOT corrupted by normalization.
 * The "broken solution rendering" bug: operator spacing regex was running
 * inside \frac{}{} braces, producing artifacts like "\frac{a \\cdot b}{c}".
 */

import { describe, it, expect } from 'vitest';
import { normalizeMathExpression } from '../math/normalization';
import { normalizeMathFragments } from '../engine/variantGenerator';

describe('normalizeMathExpression — LaTeX preservation', () => {
    it('does not corrupt \\frac{1}{2}', () => {
        const result = normalizeMathExpression('\\frac{1}{2}');
        expect(result).toBe('\\frac{1}{2}');
        expect(result).not.toContain('"');
        expect(result).not.toContain('frac"');
    });

    it('does not corrupt \\frac{x-1}{x-2}', () => {
        const result = normalizeMathExpression('\\frac{x-1}{x-2}');
        expect(result).toBe('\\frac{x-1}{x-2}');
    });

    it('does not corrupt \\frac{a+b}{c-d}', () => {
        const result = normalizeMathExpression('\\frac{a+b}{c-d}');
        expect(result).toBe('\\frac{a+b}{c-d}');
    });

    it('does not corrupt \\sqrt{x^2 + 1}', () => {
        const result = normalizeMathExpression('\\sqrt{x^2 + 1}');
        expect(result).toBe('\\sqrt{x^2 + 1}');
    });

    it('does not insert \\cdot inside \\frac numerator', () => {
        const result = normalizeMathExpression('\\frac{2*x}{3}');
        // Should not turn 2*x into 2 \\cdot x inside the frac
        expect(result).not.toContain('"');
        expect(result).not.toContain('frac"');
    });

    it('does not produce string concatenation artifacts', () => {
        const inputs = [
            '\\frac{1}{2}',
            '\\frac{x+1}{x-1}',
            '\\sqrt{4}',
            '\\frac{a}{b} + \\frac{c}{d}',
        ];
        for (const input of inputs) {
            const result = normalizeMathExpression(input);
            expect(result).not.toContain('"');
            expect(result).not.toContain("'");
            expect(result).not.toMatch(/frac"\s*\+/);
            expect(result).not.toMatch(/"\s*\+\s*"frac/);
        }
    });

    it('still normalizes plain expressions (no LaTeX)', () => {
        expect(normalizeMathExpression('1x')).toBe('x');
        expect(normalizeMathExpression('x + 0')).toBe('x');
        expect(normalizeMathExpression('1/2')).toBe('\\frac{1}{2}');
    });

    it('normalizes + - to minus in LaTeX expressions', () => {
        const result = normalizeMathExpression('\\frac{1}{2} + - 3');
        expect(result).not.toMatch(/\+\s*-/);
    });

    it('normalizes -- to + in LaTeX expressions', () => {
        const result = normalizeMathExpression('\\frac{1}{2} - - 3');
        expect(result).not.toMatch(/-\s*-/);
    });
});

describe('normalizeMathFragments — LaTeX preservation in templates', () => {
    it('does not corrupt \\frac inside $...$', () => {
        const result = normalizeMathFragments('Simplify $\\frac{1}{2} + \\frac{1}{3}$');
        expect(result).not.toContain('"');
        expect(result).not.toMatch(/frac"\s*\+/);
        expect(result).toContain('\\frac{1}{2}');
        expect(result).toContain('\\frac{1}{3}');
    });

    it('does not corrupt \\frac inside $$...$$', () => {
        const result = normalizeMathFragments('$$\\frac{x-1}{x-2}$$');
        expect(result).toContain('\\frac{x-1}{x-2}');
        expect(result).not.toContain('"');
    });

    it('plain text with \\frac is left untouched outside math blocks', () => {
        const result = normalizeMathFragments('Use \\frac notation for fractions');
        // Outside $...$, normalizeMathFragments does not touch content
        expect(result).toBe('Use \\frac notation for fractions');
    });
});
