/**
 * Universal fraction converter using regex - stable and idempotent.
 * Converts: 1/2 → \frac{1}{2}, a/b → \frac{a}{b}, x^2/y → \frac{x^2}{y}
 * 
 * Key: processes in a single pass from left to right, replacing fractions with LaTeX.
 */
export function convertFractions(text: string): string {
    if (!text || typeof text !== 'string') return text || '';
    if (!text.includes('/')) return text;

    // Strategy: find each /, then look backwards/forwards to find valid numerator/denominator
    // This is more stable than multiple regex passes

    // First, protect existing \frac{...}{...} by marking them
    const protectedText = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '__FRAC_PROTECTED__$1__$2__FRAC__');

    // Now find and replace fractions
    let result = '';
    let i = 0;

    while (i < protectedText.length) {
        // Find next /
        const slashIdx = protectedText.indexOf('/', i);
        if (slashIdx === -1) {
            result += protectedText.slice(i);
            break;
        }

        // Check if preceded by protected marker or :
        if (slashIdx > 0 && (
            protectedText.slice(slashIdx - 5, slashIdx) === '__FRAC' ||
            protectedText[slashIdx - 1] === ':' ||
            protectedText[slashIdx - 1] === '\\'
        )) {
            result += protectedText.slice(i, slashIdx + 1);
            i = slashIdx + 1;
            continue;
        }

        // Find numerator (look backwards)
        let numEnd = slashIdx;
        while (numEnd > 0 && /\s/.test(protectedText[numEnd - 1])) numEnd--;

        let numStart = numEnd;
        // Allow: digits, letters, ^ for powers
        while (numStart > 0 && /[a-zA-Z0-9^]/.test(protectedText[numStart - 1])) numStart--;

        // Must have at least one valid char in numerator
        if (numStart === numEnd) {
            result += protectedText.slice(i, slashIdx + 1);
            i = slashIdx + 1;
            continue;
        }

        // Find denominator (look forwards)
        let denStart = slashIdx + 1;
        while (denStart < protectedText.length && /\s/.test(protectedText[denStart])) denStart++;

        let denEnd = denStart;
        while (denEnd < protectedText.length && /[a-zA-Z0-9^]/.test(protectedText[denEnd])) denEnd++;

        // Must have at least one valid char in denominator
        if (denStart === denEnd) {
            result += protectedText.slice(i, slashIdx + 1);
            i = slashIdx + 1;
            continue;
        }

        const numerator = protectedText.slice(numStart, numEnd);
        const denominator = protectedText.slice(denStart, denEnd);

        // Valid fraction: both parts have valid characters
        if (/^[a-zA-Z0-9^]+$/.test(numerator) && /^[a-zA-Z0-9^]+$/.test(denominator)) {
            result += protectedText.slice(i, numStart);
            result += `\\frac{${numerator}}{${denominator}}`;
            i = denEnd;
        } else {
            result += protectedText.slice(i, slashIdx + 1);
            i = slashIdx + 1;
        }
    }

    // Restore protected \frac
    return result.replace(/__FRAC_PROTECTED__([^_]+)__([^_]+)__FRAC__/g, '\\frac{$1}{$2}');
}

export function normalizeMathExpression(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let result = text;
    result = result.split('\n').map(l => l.trim()).join(' ');
    result = result.replace(/[\s\u00A0\u2007\u202F\u2009]+/g, ' ');

    // STEP 1: Convert fractions to LaTeX
    result = convertFractions(result);

    // STEP 2: Math symbol normalization
    result = result.replace(/⋅/g, '\\cdot');
    result = result.replace(/\s*\*\s*/g, ' \\cdot ');
    result = result.replace(/(\d)\s+([a-zA-Z])/g, '$1$2');
    result = result.replace(/(\d)\s+(?=\d)/g, '$1');
    result = result.replace(/(?<!\d)\s*:\s*(?!\d)/g, ' \\div ');
    result = result.replace(/(\S)\s*([+\-*/^=])\s*(\S)/g, '$1 $2 $3');
    result = result.replace(/\s*\+\s*-\s*/g, ' − ');
    result = result.replace(/\s*-\s*-\s*/g, ' + ');

    // STEP 3: Simplify expressions
    result = result.replace(/\b1([a-zA-Z])\b/g, '$1');
    result = result.replace(/\b1([a-zA-Z])\^/g, '$1^');
    result = result.replace(/\^1\s*([+\-]|$)/g, '$1');
    result = result.replace(/[a-zA-Z]\^0(?=[^0-9])/g, '1');
    result = result.replace(/\b0([a-zA-Z])\b/g, '0');
    result = result.replace(/x\s*\+\s*0(\s|$|[^+−])/g, 'x$1');
    result = result.replace(/x\s*-\s*0(\s|$|[^+−])/g, 'x$1');
    result = result.replace(/\s*\+\s*0(\s|[+\-−]|$)/g, '$1');
    result = result.replace(/\s*-\s*0(\s|[+\-−]|$)/g, '$1');

    // STEP 4: Unicode superscripts
    result = result.replace(/²/g, '^2');
    result = result.replace(/³/g, '^3');

    return result.replace(/\s+/g, ' ').trim();
}

export function hasLatexCommands(text: string): boolean {
    return /\\frac|\\sqrt|\^|_|\\cdot|\\div/.test(text) ||
           /[a-zA-Z]\s*\/\s*[a-zA-Z0-9(]/.test(text) ||
           /\([^)]+\)\s*\/\s*\([^)]+\)/.test(text);
}
