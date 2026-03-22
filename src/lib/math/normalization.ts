import { TRIG_FUNCTIONS, IMPLICIT_MULT_VARS } from './constants';

// ─── Pipeline state ───────────────────────────────────────────────────────────

interface PipelineState {
    text: string;
    latexPlaceholders: string[];
}

// ─── Stage 1: protectLatex ────────────────────────────────────────────────────

/**
 * Replaces \cmd{...} sequences with null-byte placeholders so later stages
 * never touch already-valid LaTeX.
 */
function protectLatex(state: PipelineState): PipelineState {
    const placeholders: string[] = [];
    const text = state.text.replace(/\\[a-zA-Z]+(\{[^{}]*\})+/g, (match) => {
        const idx = placeholders.length;
        placeholders.push(match);
        return `\x00LATEX${idx}\x00`;
    });
    return { text, latexPlaceholders: placeholders };
}

// ─── Stage 2: normalizeUnicode ────────────────────────────────────────────────

/**
 * Converts unicode characters to their ASCII/LaTeX equivalents.
 * Newlines → spaces, superscripts ² ³ → ^2 ^3.
 */
function normalizeUnicode(state: PipelineState): PipelineState {
    let text = state.text;
    text = text.replace(/\n/g, ' ');
    text = text.replace(/²/g, '^2').replace(/³/g, '^3');
    return { ...state, text };
}

// ─── Stage 3: normalizeNumbers ───────────────────────────────────────────────

/**
 * Normalizes numeric tokens in a math expression:
 *   - DecimalComma: "3,14" → "3.14"
 *   - InfinityVariants: inf, +inf, -inf, ∞, +∞, -∞ → Infinity / -Infinity
 *
 * Does NOT modify IntervalSyntaxChars (;, (, ), [, ]).
 * Intended to run on unprotected text (between protectLatex and restoreLatex).
 *
 * @param input Raw math expression string (no LaTeX placeholders).
 * @returns Normalized string.
 */
export function normalizeNumbers(input: string): string {
    if (!input || typeof input !== 'string') return '';

    let result = input;

    // DecimalComma: only between digits to avoid touching IntervalSyntaxChars
    result = result.replace(/(\d),(\d)/g, '$1.$2');

    // InfinityVariants → CanonicalInfinity
    result = result.replace(
        /(?<![a-zA-Z])([-+]?∞|[-+]?inf|[-+]?Inf)(?![a-zA-Z])/g,
        (match) => (match.startsWith('-') ? '-Infinity' : 'Infinity')
    );

    return result;
}

function normalizeNumbersStage(state: PipelineState): PipelineState {
    return { ...state, text: normalizeNumbers(state.text) };
}

// ─── Stage 4: normalizeOperators ─────────────────────────────────────────────

/**
 * Simplifies trivial coefficients and sign combinations:
 *   1x → x, x+0 → x, -- → +, +- → −
 */
function normalizeOperators(state: PipelineState): PipelineState {
    let text = state.text;
    text = text.replace(/\b1([a-zA-Z])/g, '$1');
    text = text.replace(/([a-zA-Z0-9_^{}])\s*[+\-]\s*0\b/g, '$1');
    text = text.replace(/-\s*-\s*/g, '+ ');
    text = text.replace(/\+\s*-\s*/g, '− ');
    return { ...state, text };
}

// ─── Stage 4: normalizeFunctions ─────────────────────────────────────────────

/**
 * Converts sqrt() → \sqrt{} for KaTeX and log/ln/lg → LaTeX equivalents.
 *
 * Single pass — no loops, no recursion. Each pattern is applied once.
 */
function normalizeFunctions(state: PipelineState): PipelineState {
    let text = state.text;
    text = text.replace(/\bsqrt\(([^()]*)\)/g, '\\sqrt{$1}');
    text = text.replace(/log_\{?([\w\d]+)\}?\s*\((.*?)\)/g, '\\log_{$1}($2)');
    text = text.replace(/\bln\((.*?)\)/g, '\\ln($1)');
    text = text.replace(/\blg\((.*?)\)/g, '\\lg($1)');
    return { ...state, text };
}

// ─── Stage 5: convertFractions ────────────────────────────────────────────────

/**
 * Converts simple slash fractions (no parentheses) to \frac{}{}.
 * e.g. 1/2 → \frac{1}{2}, x^2/y → \frac{x^2}{y}
 * Parenthesized fractions like (x+1)/(y-1) are left as-is.
 */
export function convertFractions(input: string): string {
    if (!input || typeof input !== 'string') return input ?? '';

    // Protect existing \frac{}{} from double-processing
    const placeholders: string[] = [];
    let result = input.replace(/\\frac\{[^}]*\}\{[^}]*\}/g, (match) => {
        const idx = placeholders.length;
        placeholders.push(match);
        return `\x00FRAC${idx}\x00`;
    });

    result = result.replace(
        /([a-zA-Z0-9_^{}]+)\/([a-zA-Z0-9_^{}]+)/g,
        '\\frac{$1}{$2}'
    );

    result = result.replace(/\x00FRAC(\d+)\x00/g, (_, idx) => placeholders[Number(idx)]);
    return result;
}

function convertFractionsStage(state: PipelineState): PipelineState {
    return { ...state, text: convertFractions(state.text) };
}

// ─── Stage 6: normalizeSpacing ────────────────────────────────────────────────

/**
 * Converts operator symbols to their LaTeX equivalents and normalises spacing:
 *   * → \cdot, ⋅ → \cdot, <= → \le, >= → \ge
 */
function normalizeSpacing(state: PipelineState): PipelineState {
    let text = state.text;
    text = text.replace(/⋅/g, '\\cdot').replace(/\s*\*\s*/g, ' \\cdot ');
    text = text.replace(/<=/g, '\\le ').replace(/>=/g, '\\ge ');
    return { ...state, text };
}

// ─── Stage 7: restoreLatex ────────────────────────────────────────────────────

/**
 * Replaces null-byte placeholders back with the original LaTeX blocks.
 */
function restoreLatex(state: PipelineState): PipelineState {
    const text = state.text.replace(
        /\x00LATEX(\d+)\x00/g,
        (_, idx) => state.latexPlaceholders[Number(idx)]
    );
    return { ...state, text };
}

// ─── Absolute value helper (shared) ──────────────────────────────────────────

/**
 * Handles vertical bars | for absolute values using a stack-based approach.
 */
function processAbs(text: string, format: 'KaTeX' | 'MathJS'): string {
    let result = '';
    const stack: ('abs' | 'other')[] = [];

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '|') {
            const prevChar = text[i - 1] || '';
            const isOpening = i === 0 || /[\s(+\-*/^=]/.test(prevChar);

            if (isOpening) {
                stack.push('abs');
                result += format === 'KaTeX' ? '\\left| ' : 'abs(';
            } else {
                if (stack.length > 0) {
                    stack.pop();
                    result += format === 'KaTeX' ? ' \\right|' : ')';
                } else {
                    result += '|';
                }
            }
        } else {
            result += text[i];
        }
    }

    return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Normalizes a raw math expression for KaTeX rendering.
 *
 * Pipeline (in order):
 *   1. protectLatex      — shield existing \cmd{} blocks with placeholders
 *   2. normalizeUnicode  — newlines → spaces, ² ³ → ^2 ^3
 *   3. normalizeNumbers  — DecimalComma → dot, InfinityVariants → Infinity
 *   4. normalizeOperators — 1x→x, x+0→x, --→+, +-→−
 *   5. normalizeFunctions — sqrt()→\sqrt{}, ln/lg/log_
 *   6. convertFractions  — a/b → \frac{a}{b}
 *   7. normalizeSpacing  — * → \cdot, <= → \le, >= → \ge
 *   8. restoreLatex      — put original LaTeX blocks back
 *   9. processAbs        — |x| → \left|x\right|
 */
export function normalizeMathExpression(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let state: PipelineState = { text, latexPlaceholders: [] };

    state = protectLatex(state);
    state = normalizeUnicode(state);
    state = normalizeNumbersStage(state);
    state = normalizeOperators(state);
    state = normalizeFunctions(state);
    state = convertFractionsStage(state);
    state = normalizeSpacing(state);
    state = restoreLatex(state);

    // processAbs operates on the final string (needs full context after restore)
    return processAbs(state.text, 'KaTeX').trim();
}

// ─── MathJS conversion ────────────────────────────────────────────────────────

/**
 * Converts an expression to a format compatible with the MathJS library.
 */
export function toMathJSExpression(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let result = text;

    result = result.replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!=');
    result = result.replace(/⋅/g, '*').replace(/\\cdot/g, '*');
    result = result.replace(/\\le/g, '<=').replace(/\\ge/g, '>=').replace(/\\neq/g, '!=');
    result = result.replace(/\\approx/g, '~').replace(/\\infty/g, 'Infinity');
    result = result.replace(/\^\\circ/g, 'deg');
    result = result.replace(/\\cup/g, '').replace(/\\in/g, '');

    result = processAbs(result, 'MathJS');

    result = result.replace(/log_\{?([\w\d().]+)\}?\s*\((.*?)\)/g, 'log($2, $1)');
    result = result.replace(/\bln\s*\((.*?)\)/g, 'log($1)');
    result = result.replace(/\blg\s*\((.*?)\)/g, 'log($1, 10)');

    TRIG_FUNCTIONS.forEach(func => {
        const regex = new RegExp(`\\b${func}\\^([-+]?\\d+)\\s*\\((.*?)\\)`, 'g');
        result = result.replace(regex, `(${func}($2))^$1`);
    });

    IMPLICIT_MULT_VARS.forEach(v => {
        const digitVarRegex = new RegExp(`(\\d)(${v})`, 'g');
        result = result.replace(digitVarRegex, `$1*${v}`);
        const varDigitRegex = new RegExp(`(${v})(\\d)`, 'g');
        result = result.replace(varDigitRegex, `$1*$2`);
    });

    return result;
}

export function hasLatexCommands(input: string): boolean {
    return /\\[a-zA-Z]+|[\^_/]/.test(input);
}
