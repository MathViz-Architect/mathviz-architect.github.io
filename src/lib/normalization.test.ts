import { describe, it, expect } from 'vitest';
import {
    convertFractions,
    normalizeMathExpression,
    hasLatexCommands,
    toMathJSExpression,
    isNormalized,
    markNormalized,
    stripMarker,
} from './math/normalization';

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
            expect(stripMarker(normalizeMathExpression('a * b'))).toBe('a \\cdot b');
        });

        it('should normalize unicode multiplication', () => {
            expect(stripMarker(normalizeMathExpression('a ⋅ b'))).toBe('a \\cdot b');
        });

        it('should remove spaces between number and variable', () => {
            expect(stripMarker(normalizeMathExpression('2x'))).toBe('2x');
        });

        it('should simplify 1*x to x', () => {
            expect(stripMarker(normalizeMathExpression('1x'))).toBe('x');
        });

        it('should simplify x+0 to x', () => {
            expect(stripMarker(normalizeMathExpression('x + 0'))).toBe('x');
        });

        it('should normalize unicode superscripts', () => {
            expect(stripMarker(normalizeMathExpression('x²'))).toBe('x^2');
        });

        it('should handle newlines', () => {
            expect(stripMarker(normalizeMathExpression('x\n+\ny'))).toBe('x + y');
        });

        it('should normalize minus signs', () => {
            expect(stripMarker(normalizeMathExpression('+ - x'))).toBe('− x');
        });

        it('should normalize double minus', () => {
            expect(stripMarker(normalizeMathExpression('-- x'))).toBe('+ x');
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

    // ─── P9: normalizeOperators ───────────────────────────────────────────────
    describe('normalizeOperators — coefficient stripping', () => {
        it('1x → x (bare leading coefficient)', () => {
            expect(stripMarker(normalizeMathExpression('1x'))).toBe('x');
        });

        it('2x stays 2x (non-unit coefficient)', () => {
            expect(stripMarker(normalizeMathExpression('2x'))).toBe('2x');
        });

        it('10x stays 10x (multi-digit, digit before 1)', () => {
            expect(stripMarker(normalizeMathExpression('10x'))).toBe('10x');
        });

        it('12x stays 12x', () => {
            expect(stripMarker(normalizeMathExpression('12x'))).toBe('12x');
        });

        it('\\log_{10}(x) is not corrupted', () => {
            // protectLatex shields \log_{10}, so normalizeOperators never sees it.
            // The function preserves the backslash-escaped command as-is.
            const result = normalizeMathExpression('\\log_{10}(x)');
            expect(result).toContain('log_{10}');
            expect(result).not.toContain('log_{0}');
        });

        it('log_{10}(x) raw input is not corrupted (10 has digit before 1)', () => {
            // 1 in "10" is preceded by nothing special but followed by 0 (digit, not letter)
            // so the pattern 1([a-zA-Z]) does not match
            const result = normalizeMathExpression('log_{10}(x)');
            expect(result).toContain('10');
        });

        it('\\frac{1}{2} is not corrupted', () => {
            expect(stripMarker(normalizeMathExpression('\\frac{1}{2}'))).toBe('\\frac{1}{2}');
        });

        it('x^{1n} is not corrupted (1 inside brace)', () => {
            // 1 preceded by { — lookbehind blocks the match
            expect(stripMarker(normalizeMathExpression('x^{1n}'))).toBe('x^{1n}');
        });

        it('1 + 1x simplifies correctly', () => {
            // first 1 is followed by space (not a letter), second 1x → x
            expect(stripMarker(normalizeMathExpression('1 + 1x'))).toBe('1 + x');
        });
    });

    // ─── PR-3: Idempotency marker ─────────────────────────────────────────────
    describe('idempotency marker', () => {
        it('normalizeMathExpression returns a marked string', () => {
            const result = normalizeMathExpression('x + 0');
            expect(isNormalized(result)).toBe(true);
        });

        it('normalize(normalize(x)) === normalize(x) — idempotent', () => {
            const once = normalizeMathExpression('1x + |y|');
            const twice = normalizeMathExpression(once);
            expect(twice).toBe(once);
        });

        it('pipeline is skipped on second call (no double processing)', () => {
            // If pipeline ran twice, 1x would become x twice — but result is same
            const once = normalizeMathExpression('1x');
            const twice = normalizeMathExpression(once);
            expect(twice).toBe(once);
        });

        it('stripMarker removes prefix from marked string', () => {
            const marked = markNormalized('x^2');
            expect(stripMarker(marked)).toBe('x^2');
        });

        it('stripMarker is safe on unmarked string', () => {
            expect(stripMarker('x^2')).toBe('x^2');
        });

        it('isNormalized returns false for raw input', () => {
            expect(isNormalized('x + y')).toBe(false);
        });

        it('isNormalized returns true for marked string', () => {
            expect(isNormalized(markNormalized('x + y'))).toBe(true);
        });

        it('stripMarker on normalizeMathExpression output gives clean KaTeX string', () => {
            const result = normalizeMathExpression('|x|');
            expect(stripMarker(result)).toBe('\\left|x\\right|');
        });
    });

    // ─── PR-2: protectLatex — bare commands ──────────────────────────────────
    describe('protectLatex — bare LaTeX commands preserved', () => {
        it('\\cdot preserved through pipeline', () => {
            expect(stripMarker(normalizeMathExpression('x \\cdot y'))).toBe('x \\cdot y');
        });

        it('\\le preserved through pipeline', () => {
            expect(stripMarker(normalizeMathExpression('a \\le b'))).toBe('a \\le b');
        });

        it('\\pi preserved through pipeline', () => {
            expect(stripMarker(normalizeMathExpression('\\pi r^2'))).toBe('\\pi r^2');
        });

        it('\\left| x \\right| preserved through pipeline', () => {
            expect(stripMarker(normalizeMathExpression('\\left| x \\right|'))).toBe('\\left| x \\right|');
        });

        it('+\\infty preserved through pipeline', () => {
            expect(stripMarker(normalizeMathExpression('+\\infty'))).toBe('+\\infty');
        });

        it('\\frac{1}{2} still works (regression)', () => {
            expect(stripMarker(normalizeMathExpression('\\frac{1}{2}'))).toBe('\\frac{1}{2}');
        });

        it('\\sqrt{x} still works (regression)', () => {
            expect(stripMarker(normalizeMathExpression('\\sqrt{x}'))).toBe('\\sqrt{x}');
        });
    });
    describe('processAbs — absolute value bars', () => {
        // ── Базовые ──────────────────────────────────────────────────────────
        describe('basic cases', () => {
            it('|x| → KaTeX', () => {
                expect(stripMarker(normalizeMathExpression('|x|'))).toBe('\\left|x\\right|');
            });

            it('|-3| → KaTeX', () => {
                expect(stripMarker(normalizeMathExpression('|-3|'))).toBe('\\left|-3\\right|');
            });

            it('|x+y| → KaTeX', () => {
                expect(stripMarker(normalizeMathExpression('|x+y|'))).toBe('\\left|x+y\\right|');
            });

            it('|x| → MathJS via toMathJSExpression', () => {
                expect(toMathJSExpression('|x|')).toContain('abs(x)');
            });

            it('|-3| → MathJS', () => {
                expect(toMathJSExpression('|-3|')).toContain('abs(-3)');
            });
        });

        // ── Критические ──────────────────────────────────────────────────────
        describe('critical cases', () => {
            it('|x||y| → two separate abs values (KaTeX)', () => {
                expect(stripMarker(normalizeMathExpression('|x||y|'))).toBe('\\left|x\\right|\\left|y\\right|');
            });

            it('|x|+|y| → two separate abs values (KaTeX)', () => {
                expect(stripMarker(normalizeMathExpression('|x|+|y|'))).toBe('\\left|x\\right|+\\left|y\\right|');
            });

            it('|x| + |y| with spaces (KaTeX)', () => {
                expect(stripMarker(normalizeMathExpression('|x| + |y|'))).toBe('\\left|x\\right| + \\left|y\\right|');
            });

            it('||x|| → nested abs (KaTeX)', () => {
                expect(stripMarker(normalizeMathExpression('||x||'))).toBe('\\left|\\left|x\\right|\\right|');
            });

            it('||x| + |y|| → outer abs wrapping two inner (KaTeX)', () => {
                expect(stripMarker(normalizeMathExpression('||x| + |y||'))).toBe('\\left|\\left|x\\right| + \\left|y\\right|\\right|');
            });

            it('|x + |y|| → outer abs with nested inner (KaTeX)', () => {
                expect(stripMarker(normalizeMathExpression('|x + |y||'))).toBe('\\left|x + \\left|y\\right|\\right|');
            });

            it('|x||y| → MathJS', () => {
                const result = toMathJSExpression('|x||y|');
                expect(result).toContain('abs(x)');
                expect(result).toContain('abs(y)');
            });

            it('||x|| → MathJS', () => {
                expect(toMathJSExpression('||x||')).toContain('abs(abs(x))');
            });
        });

        // ── Граничные ─────────────────────────────────────────────────────────
        describe('edge cases', () => {
            it('|x (unbalanced open) — left as-is', () => {
                // Unbalanced: opening bar with no closing — stack not empty at end,
                // but no crash. The \left| is emitted, x is emitted, nothing closes.
                const result = normalizeMathExpression('|x');
                expect(result).toContain('\\left|');
            });

            it('x| (unbalanced close) — raw | preserved', () => {
                // No opening bar before, so closing bar is left as-is
                const result = normalizeMathExpression('x|');
                expect(result).toContain('|');
                // Should not contain \right| since there was no opening
                expect(result).not.toContain('\\right|');
            });

            it('empty string → empty string', () => {
                expect(normalizeMathExpression('')).toBe('');
            });

            it('no bars → unchanged (abs-wise)', () => {
                const input = 'x + y';
                expect(stripMarker(normalizeMathExpression(input))).toBe('x + y');
            });
        });

        // ── Инварианты ────────────────────────────────────────────────────────
        describe('invariants', () => {
            const cases = [
                '|x|', '|-3|', '|x+y|', '|x||y|', '|x|+|y|',
                '||x||', '||x| + |y||', '|x + |y||',
            ];

            cases.forEach(input => {
                it(`no raw | in output for: ${input}`, () => {
                    const result = stripMarker(normalizeMathExpression(input));
                    // After normalization, any remaining | must be inside \left| or \right|
                    // Strip known \left| and \right| sequences, then check no bare | remains
                    const stripped = result.replace(/\\left\|/g, '').replace(/\\right\|/g, '');
                    expect(stripped).not.toContain('|');
                });
            });
        });
    });
});
