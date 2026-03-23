/**
 * Problem variant generator
 * Handles parameter generation, constraint checking, and template substitution
 */

import { ProblemTemplate, GeneratedProblem, SolutionStep, DifficultyConfig } from '../types';
import { evaluateFormula } from './expressionParser';
import { normalizeMathExpression } from '../math/normalization';

/**
 * Normalize only the math fragments ($...$ and $$...$$) inside a string.
 * Plain text between math blocks is left untouched.
 *
 * This is the correct architectural boundary: normalization happens once,
 * here in the generator, before the output reaches any UI renderer.
 */
export function normalizeMathFragments(text: string): string {
    if (!text || typeof text !== 'string') return text ?? '';

    // Split on $$...$$ first (display math), then $...$ (inline math).
    // We process display math first to avoid the inline regex consuming $$ as two $.
    // Strategy: replace each math block with its normalized version.
    return text.replace(
        /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g,
        (match) => {
            const isDisplay = match.startsWith('$$');
            const delim = isDisplay ? '$$' : '$';
            const inner = match.slice(delim.length, match.length - delim.length);
            const normalized = normalizeMathExpression(inner);
            return `${delim}${normalized}${delim}`;
        }
    );
}

/**
 * Seeded pseudo-random number generator (mulberry32)
 * Returns a function that generates deterministic floats in [0, 1)
 */
function createSeededRng(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
        s += 0x6d2b79f5;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Helper to generate random integer in range [min, max] using provided rng
const seededInt = (rng: () => number, min: number, max: number): number =>
    Math.floor(rng() * (max - min + 1)) + min;


/**
 * Iteratively evaluate expression-type parameters, resolving dependency chains.
 * Up to N+1 passes ensures any linear dependency chain is fully resolved.
 */
function evaluateExpressionParams(
    config: DifficultyConfig,
    params: Record<string, number | string>
): void {
    const expressionKeys = Object.entries(config.parameters)
        .filter(([, def]) => def.type === 'expression')
        .map(([key]) => key);

    // Up to N+1 passes to resolve dependency chains
    for (let pass = 0; pass < expressionKeys.length + 1; pass++) {
        for (const key of expressionKeys) {
            const def = config.parameters[key];
            if (def.type === 'expression') {
                try {
                    const value = evaluateFormula(def.value, params);
                    if (value !== undefined && !Number.isNaN(value as number)) {
                        params[key] = value;
                    }
                } catch {
                    // dependency not yet resolved, will retry next pass
                }
            }
        }
    }
}

/**
 * Evaluate expression placeholders like {a*a}, {a*a + b*b}, {Math.sqrt(a*a + b*b)}
 * inside a string, substituting computed values.
 * NOTE: Content inside $...$ math blocks is NOT processed — those are LaTeX expressions.
 */
function evaluateExpressionPlaceholders(text: string, params: Record<string, number | string>): string {
    if (!text || typeof text !== 'string') return text ?? '';

    // Split on $...$ blocks to avoid processing LaTeX content
    // Strategy: replace math blocks with placeholders, process the rest, restore
    const mathBlocks: string[] = [];
    const withoutMath = text.replace(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g, (match) => {
        const idx = mathBlocks.length;
        mathBlocks.push(match);
        return `\x00MATH${idx}\x00`;
    });

    const processed = withoutMath.replace(/\{([^{}]+)\}/g, (match, expr) => {
        // Skip simple variable names — already substituted
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr)) return match;
        try {
            const result = evaluateFormula(expr, params);
            if (result === undefined || (typeof result === 'number' && !isFinite(result))) return match;
            // For Math.sqrt results, format as integer or sqrt(N)
            if (expr.startsWith('Math.sqrt') || expr.startsWith('sqrt')) {
                const num = Number(result);
                if (!isFinite(num)) return match;
                // Get the inner expression value
                const innerMatch = expr.match(/Math\.sqrt\((.+)\)|sqrt\((.+)\)/);
                if (innerMatch) {
                    const innerExpr = innerMatch[1] || innerMatch[2];
                    const innerVal = evaluateFormula(innerExpr, params);
                    if (typeof innerVal === 'number' && isFinite(innerVal)) {
                        const sq = Math.round(Math.sqrt(innerVal));
                        return sq * sq === innerVal ? String(sq) : `sqrt(${innerVal})`;
                    }
                }
                return String(num.toFixed(4));
            }
            return String(result);
        } catch {
            return match;
        }
    });

    // Restore math blocks
    return processed.replace(/\x00MATH(\d+)\x00/g, (_, idx) => mathBlocks[Number(idx)]);
}

/**
 * Resolve `sqrt({N})` patterns that appear after parameter substitution in result/explanation fields.
 * e.g. "sqrt({169})" → "sqrt(169)" → already-numeric arg → resolves to "13" or "sqrt(169)"
 * Also resolves "sqrt(N)" where N is a plain number (no braces).
 */
function resolveSqrtLiterals(text: string): string {
    if (!text || typeof text !== 'string') return text ?? '';
    // Match sqrt({N}) or sqrt(N) where N is a numeric literal (possibly with braces)
    return text.replace(/sqrt\(\{?(\d+(?:\.\d+)?)\}?\)/g, (match, numStr) => {
        const n = Number(numStr);
        if (!isFinite(n)) return match;
        const sq = Math.round(Math.sqrt(n));
        return sq * sq === n ? String(sq) : `sqrt(${n})`;
    });
}

/**
 * Warn if a generated string still contains raw math operators — sign of an unevaluated expression.
 * In development this surfaces template bugs early.
 */
function assertNoRawMath(text: string, context: string): void {
    if (!text || typeof text !== 'string') return;
    // Strip LaTeX blocks before checking — operators inside $...$ are intentional
    const stripped = text.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*?\$/g, '');
    if (/[*+]|\bMath\./.test(stripped)) {
        console.warn(
            `[variantGenerator] Raw math operator detected in ${context}: "${text}". ` +
            `Add a computed parameter instead of an inline expression.`
        );
    }
}

/**
 * Generate parameter values for a difficulty config
 */
function generateParamsForConfig(config: DifficultyConfig, rng: () => number): Record<string, number | string> {
    const params: Record<string, number | string> = {};

    // Pass 1: generate int/choice params
    for (const [key, def] of Object.entries(config.parameters)) {
        if (def.type === 'int') {
            params[key] = seededInt(rng, def.min, def.max);
        } else if (def.type === 'choice') {
            params[key] = def.values[seededInt(rng, 0, def.values.length - 1)];
        }
    }
    // Pass 2: evaluate expressions iteratively (resolves dependency chains)
    evaluateExpressionParams(config, params);

    // Check constraints and regenerate if needed
    if (config.constraints && config.constraints.length > 0) {
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            let allConstraintsMet = true;

            for (const constraint of config.constraints) {
                try {
                    const result = evaluateFormula(constraint, params);
                    if (!result) {
                        allConstraintsMet = false;
                        break;
                    }
                } catch (e) {
                    allConstraintsMet = false;
                    break;
                }
            }

            if (allConstraintsMet) {
                break;
            }

            // Regenerate params (two-pass: int/choice first, then expressions)
            for (const [key, def] of Object.entries(config.parameters)) {
                if (def.type === 'int') {
                    params[key] = seededInt(rng, def.min, def.max);
                } else if (def.type === 'choice') {
                    params[key] = def.values[seededInt(rng, 0, def.values.length - 1)];
                }
            }
            // Pass 2 (retry): evaluate expressions iteratively
            evaluateExpressionParams(config, params);

            attempts++;
        }
    }

    return params;
}

/**
 * Get difficulty config with fallback
 */
function getDifficultyConfig(template: ProblemTemplate, difficulty: 1 | 2 | 3 | 4): DifficultyConfig {
    // Try exact match
    if (template.difficulties[difficulty]) {
        return template.difficulties[difficulty]!;
    }

    // Fallback down
    for (let d = difficulty - 1; d >= 1; d--) {
        if (template.difficulties[d as 1 | 2 | 3]) {
            return template.difficulties[d as 1 | 2 | 3]!;
        }
    }

    // Fallback up
    for (let d = difficulty + 1; d <= 4; d++) {
        if (template.difficulties[d as 2 | 3 | 4]) {
            return template.difficulties[d as 2 | 3 | 4]!;
        }
    }

    throw new Error(`Template ${template.id}: no difficulty configs available`);
}

/**
 * Generate a problem from a template
 * @param seed — optional seed for reproducibility; if omitted, a random seed is generated
 */
export function generateProblem(template: ProblemTemplate, difficulty: 1 | 2 | 3 | 4 = 1, seed?: number): GeneratedProblem {
    const resolvedSeed = seed ?? (Date.now() ^ Math.floor(Math.random() * 0xffffffff));
    const rng = createSeededRng(resolvedSeed);
    const config = getDifficultyConfig(template, difficulty);

    // Validate required fields
    if (!config.template || typeof config.template !== 'string') {
        throw new Error(`Template ${template.id}: 'template' field is missing or not a string`);
    }
    if (!config.answer_formula || typeof config.answer_formula !== 'string') {
        throw new Error(`Template ${template.id}: 'answer_formula' field is missing or not a string`);
    }

    const params = generateParamsForConfig(config, rng);

    // Substitute parameters in template string
    let question = config.template;
    for (const [key, value] of Object.entries(params)) {
        question = question.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }

    // Calculate answer
    let answer: number | string = evaluateFormula(config.answer_formula, params);

    // Convert Math.sqrt answers to canonical form:
    // - perfect square  → integer (e.g. sqrt(169) → 13)
    // - irrational      → "sqrt(N)" string (e.g. sqrt(34) → "sqrt(34)")
    // Applied regardless of answer_type so validateAnswer always gets a consistent value.
    if (typeof answer === 'number' && isFinite(answer)) {
        const formula = config.answer_formula.trim();
        const sqrtMatch = formula.match(/^Math\.sqrt\((.+)\)$/);
        if (sqrtMatch) {
            const innerVal = evaluateFormula(sqrtMatch[1], params);
            if (typeof innerVal === 'number' && isFinite(innerVal)) {
                const sq = Math.round(Math.sqrt(innerVal));
                if (sq * sq === innerVal) {
                    answer = sq;                    // perfect square → integer
                } else {
                    answer = `sqrt(${innerVal})`;  // irrational → symbolic
                }
            }
        }
    }

    // Guard: answer_formula must not produce NaN or Infinity.
    // If it does, the template has a logic error (e.g. division by zero in formula,
    // or a param that evaluates to an unexpected value). Log a warning so template
    // authors can catch it during development; the problem is still returned so the
    // UI doesn't crash, but validateAnswer will correctly return false for any input.
    if (typeof answer === 'number' && !isFinite(answer)) {
        console.warn(
            `[variantGenerator] Template "${template.id}" answer_formula "${config.answer_formula}" ` +
            `produced ${answer} with params ${JSON.stringify(params)}. ` +
            `Check for division by zero or invalid param combinations.`
        );
    }

    // Generate hint if config has one
    let hint: string | undefined;
    if (config.hint) {
        if (typeof config.hint !== 'string') {
            throw new Error(`Template ${template.id}: 'hint' field is not a string`);
        }
        hint = config.hint;
        for (const [key, value] of Object.entries(params)) {
            hint = hint.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        }
    }

    // Generate hints array if config has one
    let hints: string[] | undefined;
    if (config.hints && config.hints.length > 0) {
        hints = config.hints.map(h => {
            let hintText = h;
            for (const [key, value] of Object.entries(params)) {
                hintText = hintText.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
            }
            return hintText;
        });
    }

    // Generate solution steps if config has them
    let solution: SolutionStep[] | undefined;
    if (config.solution) {
        solution = config.solution.map(step => {
            const generatedStep: SolutionStep = {
                explanation: step.explanation,
            };

            // Substitute parameters in explanation
            for (const [key, value] of Object.entries(params)) {
                generatedStep.explanation = generatedStep.explanation.replace(
                    new RegExp(`\\{${key}\\}`, 'g'),
                    String(value)
                );
            }

            // Substitute parameters in expression if present
            if (step.expression) {
                generatedStep.expression = step.expression;
                for (const [key, value] of Object.entries(params)) {
                    generatedStep.expression = generatedStep.expression.replace(
                        new RegExp(`\\{${key}\\}`, 'g'),
                        String(value)
                    );
                }
            }

            // Substitute parameters in result if present
            if (step.result) {
                generatedStep.result = step.result;
                for (const [key, value] of Object.entries(params)) {
                    generatedStep.result = generatedStep.result.replace(
                        new RegExp(`\\{${key}\\}`, 'g'),
                        String(value)
                    );
                }
            }

            // Evaluate expression placeholders like {a*a}, {a*a + b*b}
            generatedStep.explanation = evaluateExpressionPlaceholders(generatedStep.explanation, params);
            if (generatedStep.expression) generatedStep.expression = evaluateExpressionPlaceholders(generatedStep.expression, params);
            if (generatedStep.result) generatedStep.result = evaluateExpressionPlaceholders(generatedStep.result, params);

            // Resolve sqrt(N) / sqrt({N}) literals that remain after param substitution
            // e.g. template "sqrt({sum})" → after key-replace → "sqrt(169)" → "13" or "sqrt(169)"
            generatedStep.explanation = resolveSqrtLiterals(generatedStep.explanation);
            if (generatedStep.expression) generatedStep.expression = resolveSqrtLiterals(generatedStep.expression);
            if (generatedStep.result) generatedStep.result = resolveSqrtLiterals(generatedStep.result);

            // Special handling for {answer} placeholder
            if (generatedStep.explanation.includes('{answer}')) {
                generatedStep.explanation = generatedStep.explanation.replace(
                    /\{answer\}/g,
                    String(answer)
                );
            }
            if (generatedStep.expression && generatedStep.expression.includes('{answer}')) {
                generatedStep.expression = generatedStep.expression.replace(
                    /\{answer\}/g,
                    String(answer)
                );
            }
            if (generatedStep.result && generatedStep.result.includes('{answer}')) {
                generatedStep.result = generatedStep.result.replace(
                    /\{answer\}/g,
                    String(answer)
                );
            }

            // Dev guard: warn if raw math operators survived substitution
            if (process.env.NODE_ENV !== 'production') {
                assertNoRawMath(generatedStep.explanation, `${template.id} explanation`);
                if (generatedStep.result) assertNoRawMath(generatedStep.result, `${template.id} result`);
            }

            return generatedStep;
        });
    }

    // ─── Normalize math fragments ────────────────────────────────────────────
    // Apply normalization to all math blocks ($...$, $$...$$) in generated text.
    // This is the single normalization boundary — UI renderers must NOT re-normalize.
    question = normalizeMathFragments(question);
    if (hint) hint = normalizeMathFragments(hint);
    if (hints) hints = hints.map(normalizeMathFragments);
    if (solution) {
        solution = solution.map(step => ({
            ...step,
            explanation: normalizeMathFragments(step.explanation),
            ...(step.expression !== undefined && { expression: normalizeMathFragments(step.expression) }),
            ...(step.result !== undefined && { result: normalizeMathFragments(step.result) }),
        }));
    }

    return {
        id: `${template.id}-${resolvedSeed}`,
        template_id: template.id,
        seed: resolvedSeed,
        params,
        question,
        answer,
        hint,
        hints,
        solution,
        answer_type: config.answer_type || 'number',
    };
}
