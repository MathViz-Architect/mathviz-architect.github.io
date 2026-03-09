/**
 * CSP-safe expression parser and evaluator
 * Handles tokenization, parsing, and evaluation of mathematical expressions
 * without using eval() or new Function()
 */

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
