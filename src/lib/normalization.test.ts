import { describe, it, expect } from 'vitest';
import { convertFractions, normalizeMathExpression, hasLatexCommands } from './math/normalization';

describe('Normalization', () => {
    describe('convertFractions', () => {
        it('should convert simple fractions', () => {
            expect(convertFractions('1/2')).toBe('\\frac{1}{2}');
        });

        it('should convert variable fractions', () => {
            expect(convertFractions('x/y')).toBe('\\frac{x}{y}');
        });

        it('should convert power fractions', () => {
            expect(convertFractions('x^2/y')).toBe('\\frac{x^2}{y}');
        });

        it('should not convert when no slash', () => {
            expect(convertFractions('x + y')).toBe('x + y');
        });

        it('should preserve existing \\frac', () => {
            expect(convertFractions('\\frac{1}{2} + 1/3')).toBe('\\frac{1}{2} + \\frac{1}{3}');
        });

        it('should not convert ratios with colon', () => {
            expect(convertFractions('1:2')).toBe('1:2');
        });

        it('should handle empty string', () => {
            expect(convertFractions('')).toBe('');
        });

        it('should handle complex expressions', () => {
            expect(convertFractions('(x+1)/(y-1)')).toBe('(x+1)/(y-1)');
        });

        it('should handle multiple fractions', () => {
            expect(convertFractions('1/2 + 3/4')).toBe('\\frac{1}{2} + \\frac{3}{4}');
        });
    });

    describe('normalizeMathExpression', () => {
        it('should normalize multiplication symbol', () => {
            expect(normalizeMathExpression('a * b')).toBe('a \\cdot b');
        });

        it('should normalize unicode multiplication', () => {
            expect(normalizeMathExpression('a ⋅ b')).toBe('a \\cdot b');
        });

        it('should remove spaces between number and variable', () => {
            expect(normalizeMathExpression('2x')).toBe('2x');
        });

        it('should simplify 1*x to x', () => {
            expect(normalizeMathExpression('1x')).toBe('x');
        });

        it('should simplify x+0 to x', () => {
            expect(normalizeMathExpression('x + 0')).toBe('x');
        });

        it('should normalize unicode superscripts', () => {
            expect(normalizeMathExpression('x²')).toBe('x^2');
        });

        it('should handle newlines', () => {
            expect(normalizeMathExpression('x\n+\ny')).toBe('x + y');
        });

        it('should normalize minus signs', () => {
            expect(normalizeMathExpression('+ - x')).toBe('− x');
        });

        it('should normalize double minus', () => {
            expect(normalizeMathExpression('-- x')).toBe('+ x');
        });

        it('should return empty string for empty input', () => {
            expect(normalizeMathExpression('')).toBe('');
        });
    });

    describe('hasLatexCommands', () => {
        it('should detect \\frac', () => {
            expect(hasLatexCommands('\\frac{1}{2}')).toBe(true);
        });

        it('should detect \\sqrt', () => {
            expect(hasLatexCommands('\\sqrt{x}')).toBe(true);
        });

        it('should detect caret', () => {
            expect(hasLatexCommands('x^2')).toBe(true);
        });

        it('should detect underscore', () => {
            expect(hasLatexCommands('x_1')).toBe(true);
        });

        it('should detect fraction with variables', () => {
            expect(hasLatexCommands('a / b')).toBe(true);
        });

        it('should detect parenthesized fraction', () => {
            expect(hasLatexCommands('(x+1) / (y-1)')).toBe(true);
        });

        it('should return false for plain text', () => {
            expect(hasLatexCommands('x + y = 2')).toBe(false);
        });
    });
});
