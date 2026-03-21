import { TRIG_FUNCTIONS, IMPLICIT_MULT_VARS } from './constants';

/**
 * Handles vertical bars | for absolute values, using a stack-based approach
 * to correctly handle nested structures.
 *
 * @param text The input string.
 * @param format 'KaTeX' or 'MathJS'.
 * @returns The processed string.
 */
function processAbs(text: string, format: 'KaTeX' | 'MathJS'): string {
    let result = '';
    const stack: ('abs' | 'other')[] = [];

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '|') {
            const prevChar = text[i - 1] || '';
            // Heuristic: a bar is "opening" if it's at the start,
            // or preceded by an operator/space, or an opening bracket.
            const isOpening = i === 0 || /[\s(+\-*/^=]/.test(prevChar);

            if (isOpening) {
                stack.push('abs');
                result += format === 'KaTeX' ? '\\left| ' : 'abs(';
            } else {
                if (stack.length > 0) {
                    stack.pop();
                    result += format === 'KaTeX' ? ' \\right|' : ')';
                } else {
                    // Unmatched closing bar, treat as a literal character
                    result += '|';
                }
            }
        } else {
            result += text[i];
        }
    }

    // This simplistic approach assumes well-formed input.
    // A more advanced parser would be needed for complex ambiguous cases.
    return result;
}


/**
 * Converts an expression to a format compatible with the MathJS library.
 * This includes handling functions, powers, and special constants.
 *
 * @param text The raw mathematical expression.
 * @returns A string that can be safely evaluated by MathJS.
 */
export function toMathJSExpression(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let result = text.trim();

    // 1. Unicode and LaTeX to ASCII/MathJS syntax
    result = result.replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/≠/g, '!=');
    result = result.replace(/⋅/g, '*').replace(/\\cdot/g, '*');
    result = result.replace(/\\le/g, '<=').replace(/\\ge/g, '>=').replace(/\\neq/g, '!=');
    result = result.replace(/\\approx/g, '~').replace(/\\infty/g, 'Infinity');
    result = result.replace(/\^\\circ/g, 'deg');
    result = result.replace(/\\cup/g, '').replace(/\\in/g, ''); // Remove set operators for now

    // 2. Handle absolute values: |x| -> abs(x)
    result = processAbs(result, 'MathJS');

    // 3. Handle logarithms
    result = result.replace(/log_\{?([\w\d().]+)\}?\s*\((.*?)\)/g, 'log($2, $1)');
    result = result.replace(/\bln\s*\((.*?)\)/g, 'log($1)');
    result = result.replace(/\blg\s*\((.*?)\)/g, 'log($1, 10)');

    // 4. Handle trigonometric powers: sin^2(x) -> (sin(x))^2
    TRIG_FUNCTIONS.forEach(func => {
        const regex = new RegExp(`\\b${func}\\^([-+]?\\d+)\\s*\\((.*?)\\)`, 'g');
        result = result.replace(regex, `(${func}($2))^$1`);
    });

    // 5. Add implicit multiplication (e.g., 2x -> 2*x)
    IMPLICIT_MULT_VARS.forEach(v => {
        // Add multiplication between a digit and a variable (e.g., "2x" -> "2*x")
        const digitVarRegex = new RegExp(`(\\d)(${v})`, 'g');
        result = result.replace(digitVarRegex, `$1*${v}`);
        // Add multiplication between a variable and a digit (e.g., "x2" -> "x*2")
        const varDigitRegex = new RegExp(`(${v})(\\d)`, 'g');
        result = result.replace(varDigitRegex, `$1*$2`);
    });

    return result;
}


/**
 * Normalizes a raw math expression for KaTeX rendering.
 */
export function normalizeMathExpression(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let result = text;

    // 1. Use the robust handler for absolute values
    result = processAbs(result, 'KaTeX');

    // 2. LaTeX symbol normalization
    result = result.replace(/⋅/g, '\\cdot').replace(/\s*\*\s*/g, ' \\cdot ');
    result = result.replace(/<=/g, '\\le ').replace(/>=/g, '\\ge ');

    // 3. Handle logarithms for KaTeX
    result = result.replace(/log_\{?([\w\d]+)\}?\s*\((.*?)\)/g, '\\log_{$1}($2)');
    result = result.replace(/\bln\((.*?)\)/g, '\\ln($1)');
    result = result.replace(/\blg\((.*?)\)/g, '\\lg($1)');

    // 4. Basic structural cleanup for better display
    result = result.replace(/(\S)\s*([+\-*/^=])\s*(\S)/g, '$1 $2 $3');

    return result.trim();
}

// BACKWARD COMPAT
export function convertFractions(input: string): string {
    return normalizeMathExpression(input)
}
export function hasLatexCommands(input: string): boolean {
    return /\\[a-zA-Z]+/.test(input)
}
