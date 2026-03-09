import { ProblemTemplate, GeneratedProblem, ParameterDef, SolutionStep } from './types';

// Helper to generate random integer in range [min, max]
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generate parameter values for a template
 */
export function generateParams(template: ProblemTemplate): Record<string, number | string> {
    const params: Record<string, number | string> = {};

    // Pass 1: generate int/choice params
    for (const [key, def] of Object.entries(template.parameters)) {
        if (def.type === 'int') {
            params[key] = randomInt(def.min, def.max);
        } else if (def.type === 'choice') {
            params[key] = def.values[randomInt(0, def.values.length - 1)];
        }
    }
    // Pass 2: evaluate expressions (all int/choice values are now available)
    for (const [key, def] of Object.entries(template.parameters)) {
        if (def.type === 'expression') {
            params[key] = evaluateFormula(def.value, params);
        }
    }

    // Check constraints and regenerate if needed
    if (template.constraints && template.constraints.length > 0) {
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            let allConstraintsMet = true;

            for (const constraint of template.constraints) {
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
            for (const [key, def] of Object.entries(template.parameters)) {
                if (def.type === 'int') {
                    params[key] = randomInt(def.min, def.max);
                } else if (def.type === 'choice') {
                    params[key] = def.values[randomInt(0, def.values.length - 1)];
                }
            }
            for (const [key, def] of Object.entries(template.parameters)) {
                if (def.type === 'expression') {
                    params[key] = evaluateFormula(def.value, params);
                }
            }

            attempts++;
        }
    }

    return params;
}

/**
 * Safely evaluate a math formula string with given parameters.
 * Does NOT use eval or new Function — CSP-safe.
 */
export function evaluateFormula(
    formula: string,
    params: Record<string, number | string>
): number | string {
    try {
        return safeEval(formula.trim(), params);
    } catch (error) {
        console.error('Formula evaluation error:', error, 'Formula:', formula, 'Params:', params);
        return 0;
    }
}

type TokenType = 'number' | 'string' | 'ident' | 'op' | 'lparen' | 'rparen' | 'comma' | 'eof';
interface Token { type: TokenType; value: string }

function tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < expr.length) {
        if (/\s/.test(expr[i])) { i++; continue; }
        // String literal
        if (expr[i] === '"' || expr[i] === "'") {
            const q = expr[i++];
            let s = '';
            while (i < expr.length && expr[i] !== q) s += expr[i++];
            i++; // closing quote
            tokens.push({ type: 'string', value: s });
            continue;
        }
        // Number
        if (/[0-9]/.test(expr[i]) || (expr[i] === '.' && /[0-9]/.test(expr[i + 1] ?? ''))) {
            let n = '';
            while (i < expr.length && /[0-9.]/.test(expr[i])) n += expr[i++];
            tokens.push({ type: 'number', value: n });
            continue;
        }
        // Identifier
        if (/[a-zA-Z_]/.test(expr[i])) {
            let id = '';
            while (i < expr.length && /[a-zA-Z0-9_.]/.test(expr[i])) id += expr[i++];
            tokens.push({ type: 'ident', value: id });
            continue;
        }
        // Three-char operators
        const three = expr.slice(i, i + 3);
        if (['!==', '==='].includes(three)) { tokens.push({ type: 'op', value: three }); i += 3; continue; }
        // Two-char operators
        const two = expr.slice(i, i + 2);
        if (['!=', '==', '>=', '<=', '&&', '||', '**'].includes(two)) { tokens.push({ type: 'op', value: two }); i += 2; continue; }
        // Single-char
        if ('+-*/%<>!'.includes(expr[i])) { tokens.push({ type: 'op', value: expr[i++] }); continue; }
        if (expr[i] === '(') { tokens.push({ type: 'lparen', value: '(' }); i++; continue; }
        if (expr[i] === ')') { tokens.push({ type: 'rparen', value: ')' }); i++; continue; }
        if (expr[i] === ',') { tokens.push({ type: 'comma', value: ',' }); i++; continue; }
        if (expr[i] === '?') { tokens.push({ type: 'op', value: '?' }); i++; continue; }
        if (expr[i] === ':') { tokens.push({ type: 'op', value: ':' }); i++; continue; }
        i++;
    }
    tokens.push({ type: 'eof', value: '' });
    return tokens;
}

function safeEval(expr: string, params: Record<string, number | string>): number | string {
    const tokens = tokenize(expr);
    let pos = 0;

    const peek = () => tokens[pos];
    const consume = () => tokens[pos++];

    function parseTernary(): number | string {
        const cond = parseOr();
        if (peek().value === '?') {
            consume(); // ?
            const then = parseTernary();
            if (peek().value !== ':') throw new Error('Expected :');
            consume(); // :
            const else_ = parseTernary();
            return cond ? then : else_;
        }
        return cond;
    }

    function parseOr(): number | string {
        let left = parseAnd();
        while (peek().value === '||') {
            consume();
            const right = parseAnd();
            left = (left || right) as number | string;
        }
        return left;
    }

    function parseAnd(): number | string {
        let left = parseEquality();
        while (peek().value === '&&') {
            consume();
            const right = parseEquality();
            left = (left && right) as number | string;
        }
        return left;
    }

    function parseEquality(): number | string {
        let left = parseComparison();
        while (['==', '!=', '===', '!=='].includes(peek().value)) {
            const op = consume().value;
            const right = parseComparison();
            if (op === '==' || op === '===') left = left == right ? 1 : 0;
            else left = left != right ? 1 : 0;
        }
        return left;
    }

    function parseComparison(): number | string {
        let left = parseAdd();
        while (['<', '>', '<=', '>='].includes(peek().value)) {
            const op = consume().value;
            const right = parseAdd();
            const l = Number(left), r = Number(right);
            if (op === '<') left = l < r ? 1 : 0;
            else if (op === '>') left = l > r ? 1 : 0;
            else if (op === '<=') left = l <= r ? 1 : 0;
            else left = l >= r ? 1 : 0;
        }
        return left;
    }

    function parseAdd(): number | string {
        let left = parseMul();
        while (['+', '-'].includes(peek().value)) {
            const op = consume().value;
            const right = parseMul();
            if (op === '+') {
                // preserve string concat
                if (typeof left === 'string' || typeof right === 'string') left = String(left) + String(right);
                else left = (left as number) + (right as number);
            } else {
                left = (Number(left)) - (Number(right));
            }
        }
        return left;
    }

    function parseMul(): number | string {
        let left = parseUnary();
        while (['*', '/', '%', '**'].includes(peek().value)) {
            const op = consume().value;
            const right = parseUnary();
            const l = Number(left), r = Number(right);
            if (op === '*') left = l * r;
            else if (op === '/') left = l / r;
            else if (op === '%') left = l % r;
            else left = Math.pow(l, r);
        }
        return left;
    }

    function parseUnary(): number | string {
        if (peek().value === '-') { consume(); return -Number(parsePrimary()); }
        if (peek().value === '!') { consume(); return parsePrimary() ? 0 : 1; }
        return parsePrimary();
    }

    function parsePrimary(): number | string {
        const t = peek();

        if (t.type === 'number') { consume(); return parseFloat(t.value); }
        if (t.type === 'string') { consume(); return t.value; }

        if (t.type === 'lparen') {
            consume();
            const val = parseTernary();
            consume(); // rparen
            return val;
        }

        if (t.type === 'ident') {
            const name = t.value;
            consume();
            // Function call
            if (peek().type === 'lparen') {
                consume(); // (
                const args: (number | string)[] = [];
                while (peek().type !== 'rparen' && peek().type !== 'eof') {
                    args.push(parseTernary());
                    if (peek().type === 'comma') consume();
                }
                consume(); // )
                // Supported math functions
                if (name === 'Math.floor' || name === 'floor') return Math.floor(Number(args[0]));
                if (name === 'Math.ceil' || name === 'ceil') return Math.ceil(Number(args[0]));
                if (name === 'Math.round' || name === 'round') return Math.round(Number(args[0]));
                if (name === 'Math.abs' || name === 'abs') return Math.abs(Number(args[0]));
                if (name === 'Math.sqrt' || name === 'sqrt') return Math.sqrt(Number(args[0]));
                if (name === 'Math.pow' || name === 'pow') return Math.pow(Number(args[0]), Number(args[1]));
                if (name === 'Math.max' || name === 'max') return Math.max(...args.map(Number));
                if (name === 'Math.min' || name === 'min') return Math.min(...args.map(Number));
                throw new Error(`Unknown function: ${name}`);
            }
            // Variable
            if (name in params) return params[name];
            if (name === 'true') return 1;
            if (name === 'false') return 0;
            throw new Error(`Unknown variable: ${name}`);
        }

        throw new Error(`Unexpected token: ${t.value}`);
    }

    return parseTernary();
}

/**
 * Generate a problem from a template
 */
export function generateProblem(template: ProblemTemplate): GeneratedProblem {
    // Validate required fields
    if (!template.template || typeof template.template !== 'string') {
        throw new Error(`Template ${template.id}: 'template' field is missing or not a string`);
    }
    if (!template.answer_formula || typeof template.answer_formula !== 'string') {
        throw new Error(`Template ${template.id}: 'answer_formula' field is missing or not a string`);
    }

    const params = generateParams(template);

    // Substitute parameters in template string
    let question = template.template;
    for (const [key, value] of Object.entries(params)) {
        question = question.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }

    // Calculate answer
    const answer = evaluateFormula(template.answer_formula, params);

    // Generate hint if template has one
    let hint: string | undefined;
    if (template.hint) {
        if (typeof template.hint !== 'string') {
            throw new Error(`Template ${template.id}: 'hint' field is not a string`);
        }
        hint = template.hint;
        for (const [key, value] of Object.entries(params)) {
            hint = hint.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        }
    }

    // Generate solution steps if template has them
    let solution: SolutionStep[] | undefined;
    if (template.solution) {
        solution = template.solution.map(step => {
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

            return generatedStep;
        });
    }

    return {
        id: `${template.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        template_id: template.id,
        params,
        question,
        answer,
        hint,
        solution,
    };
}

/**
 * Validate user answer against problem answer
 */
export function validateAnswer(problem: GeneratedProblem, userAnswer: string): boolean {
    const answer = problem.answer;

    // Try numeric comparison first
    const parsed = parseFloat(userAnswer.replace(',', '.').trim());
    const expected = parseFloat(String(answer));

    if (!isNaN(parsed) && !isNaN(expected)) {
        // Both are numeric - compare with tolerance
        return Math.abs(parsed - expected) < 0.01;
    }

    // Fall back to text comparison
    return userAnswer.trim().toLowerCase() === String(answer).trim().toLowerCase();
}

/**
 * Check if user answer matches a common mistake pattern.
 * Returns feedback string if matched, null otherwise.
 */
export function checkCommonMistake(
    problem: GeneratedProblem,
    template: ProblemTemplate,
    userAnswer: string
): string | null {
    if (!template.common_mistakes) return null;

    const parsed = parseFloat(userAnswer.replace(',', '.').trim());
    if (isNaN(parsed)) return null;

    for (const mistake of template.common_mistakes) {
        if (!mistake.pattern || typeof mistake.pattern !== 'string') {
            console.warn(`Template ${template.id}: common_mistake has invalid pattern`);
            continue;
        }
        if (!mistake.feedback || typeof mistake.feedback !== 'string') {
            console.warn(`Template ${template.id}: common_mistake has invalid feedback`);
            continue;
        }

        try {
            const mistakeValue = evaluateFormula(mistake.pattern, problem.params);
            if (Math.abs(parsed - Number(mistakeValue)) < 0.01) {
                return mistake.feedback;
            }
        } catch (error) {
            console.warn(`Template ${template.id}: error evaluating mistake pattern:`, error);
            continue;
        }
    }
    return null;
}
