import * as math from 'mathjs';

/**
 * Single entry point for all MathJS calls in the application.
 *
 * Guarantees:
 *   - MathJS is never imported directly outside this module.
 *   - Evaluation errors are surfaced as thrown exceptions (callers decide how to handle).
 *   - Scope typing is kept minimal — Record<string, number> covers all current use-cases.
 */

/**
 * Evaluates a MathJS-compatible expression string.
 *
 * @param expr  Expression to evaluate (must already be in MathJS format — use toMathJSExpression first).
 * @param scope Optional variable bindings, e.g. { x: 1.5, y: -2 }.
 * @returns     The numeric result.
 * @throws      If the expression is invalid or evaluation fails.
 */
export function evaluateMath(expr: string, scope?: Record<string, number>): number {
    return scope !== undefined
        ? math.evaluate(expr, scope)
        : math.evaluate(expr);
}

// ⚠️ Currently not used in production UI.
// Will be integrated into input validation in PR-5.
/**
 * Validates whether a string is a syntactically and semantically valid MathJS expression.
 * Returns true for empty strings (callers treat empty as "allow").
 * Returns true for expressions containing inequalities/intervals (not evaluable by MathJS).
 * Never throws — evaluation errors are caught and returned as false.
 */
export function isValidMathExpression(expr: string): boolean {
    if (!expr) return true;

    // TODO(PR-5): refine inequality detection — current check is too broad
    // (e.g. "a > > b" passes through without validation)
    if (/[<>=;]/.test(expr)) return true;

    try {
        math.evaluate(expr);
        return true;
    } catch {
        return false;
    }
}
