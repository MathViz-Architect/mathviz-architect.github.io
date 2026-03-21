export const OPERATORS = ['+', '-', '*', '/', '^'];

export const KEYWORDS = ['sqrt', 'pi'] as const;
export type Keyword = typeof KEYWORDS[number];

export interface InputResult { value: string; cursorPosition: number; }

export interface CursorState {
  selectionStart: number;
  selectionEnd: number;
  hasSelection: boolean;
}

export const getCursorState = (input: HTMLInputElement, defaultPos: number): CursorState => {
  const start = input.selectionStart ?? defaultPos;
  const end = input.selectionEnd ?? defaultPos;
  return { selectionStart: start, selectionEnd: end, hasSelection: start !== end };
};

export const findKeywordAtPosition = (text: string, pos: number): { keyword: Keyword; start: number; end: number } | null => {
  for (const kw of KEYWORDS) {
    let searchStart = 0;
    let idx = text.indexOf(kw);
    while (idx !== -1) {
      const end = idx + kw.length;
      if (pos >= idx && pos <= end) {
        return { keyword: kw, start: idx, end };
      }
      searchStart = end;
      idx = text.indexOf(kw, searchStart);
    }
  }
  return null;
};

export const isCursorInsideKeyword = (text: string, pos: number): boolean => {
  return findKeywordAtPosition(text, pos) !== null;
};

export const moveCursorToKeywordBoundary = (text: string, pos: number, direction: 'left' | 'right' = 'right'): number => {
  const kw = findKeywordAtPosition(text, pos);
  if (!kw) return pos;

  if (direction === 'right') {
    const afterKw = kw.end;
    if (text[afterKw] === '(') {
      return afterKw + 1;
    }
    return kw.end;
  }
  return kw.start;
};

const getClosingParen = (text: string, openPos: number): number => {
  let depth = 1;
  for (let i = openPos + 1; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

const getOpeningParen = (text: string, closePos: number): number => {
  let depth = 1;
  for (let i = closePos - 1; i >= 0; i--) {
    if (text[i] === ')') depth++;
    else if (text[i] === '(') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

export const normalizeMathExpression = (text: string): string => {
  if (!text.trim()) return '';
  let result = text;

  result = result.replace(/pi/g, '\\pi').replace(/(\d+)\\pi/g, '$1\\pi');
  result = result.replace(/\^(\d+)/g, '^{$1}');
  result = result.replace(/\^$/g, '^{\\square}').replace(/\^(\d+)$/g, '^{$1}');

  const processSqrt = (s: string): string => {
    const sqrtRegex = /sqrt\(([^()]*)\)/g;
    let match;
    let localIterations = 0;
    const maxIterations = 50;
    while ((match = sqrtRegex.exec(s)) !== null && localIterations < maxIterations) {
      const content = match[1];
      const replacement = content ? `\\sqrt{${content}}` : '\\sqrt{\\square}';
      s = s.replace(match[0], replacement);
      localIterations++;
    }
    return s;
  };

  let prev;
  let outerIterations = 0;
  do {
    prev = result;
    result = processSqrt(result);
    outerIterations++;
  } while (result !== prev && outerIterations < 10);

  // Auto-convert fraction patterns to \frac{}{} for preview rendering.
  // Applied before the legacy digit-only rule so it takes precedence.
  result = autoConvertFractions(result);

  return result;
};

/**
 * Convert natural fraction notation to LaTeX \frac{}{} for preview rendering.
 *
 * Handles (in order of precedence):
 *   (expr)/(expr)  →  \frac{expr}{expr}
 *   token/token    →  \frac{token}{token}
 *
 * A "token" is a maximal run of: word chars, digits, ^, _, \, {, }, ., spaces inside parens.
 * Already-converted \frac{}{} blocks are left untouched.
 *
 * This function is ONLY used in the preview/normalization path.
 * The raw input value is never mutated during typing.
 */
export const autoConvertFractions = (text: string): string => {
  if (!text.includes('/')) return text;

  // Protect existing \frac{}{} so we don't double-process them.
  // Replace each \frac{N}{D} with a placeholder, restore at the end.
  const protected_: string[] = [];
  let s = text.replace(/\\frac\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\}/g, (m) => {
    protected_.push(m);
    return `\x00FRAC${protected_.length - 1}\x00`;
  });

  // Pass 1: (expr)/(expr) — parenthesized numerator and/or denominator
  // Match: optional_paren_or_token / optional_paren_or_token
  s = s.replace(
    /\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g,
    (_, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`
  );

  // Pass 2: (expr)/token — parenthesized numerator, plain denominator
  s = s.replace(
    /\(([^()]+)\)\s*\/\s*([\w.\\^_]+)/g,
    (_, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`
  );

  // Pass 3: token/(expr) — plain numerator, parenthesized denominator
  s = s.replace(
    /([\w.\\^_]+)\s*\/\s*\(([^()]+)\)/g,
    (_, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`
  );

  // Pass 4: token/token — both plain (no parens)
  // Token: sequence of word chars, digits, backslash sequences, ^, _, .
  // Must not match inside already-converted \frac
  s = s.replace(
    /([\w.\\^_]+)\s*\/\s*([\w.\\^_]+)/g,
    (_, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`
  );

  // Restore protected \frac blocks
  s = s.replace(/\x00FRAC(\d+)\x00/g, (_, i) => protected_[Number(i)]);

  return s;
};

export const getCleanExpression = (text: string): string => {
  if (!text.trim()) return '';
  let result = text;
  result = result.replace(/pi/g, 'pi');
  result = result.replace(/(\d+)\/(\d+pi)/g, '$1/($2)');
  result = result.replace(/(\d+)\/(\d+[a-z])/g, '$1/($2)');
  result = result.replace(/sqrt\(([^)]*)\)/g, 'sqrt($1)');
  return result;
};

const replaceAt = (val: string, pos: number, insert: string, cursorOffset: number): InputResult => ({
  value: val.slice(0, pos) + insert + val.slice(pos),
  cursorPosition: pos + cursorOffset
});

const replaceSelection = (val: string, cur: CursorState, insert: string, cursorOffset: number): InputResult => ({
  value: val.slice(0, cur.selectionStart) + insert + val.slice(cur.selectionEnd),
  cursorPosition: cur.selectionStart + cursorOffset
});

const hasDecimal = (text: string, pos: number): boolean => {
  for (let i = pos - 1; i >= 0 && /[\d.]/.test(text[i]); i--) {
    if (text[i] === '.') return true;
  }
  return false;
};

const getLastNumber = (text: string, pos: number): { start: number; value: string } | null => {
  let i = pos - 1;
  while (i >= 0 && /[\d.]/.test(text[i])) i--;
  const start = i + 1;
  return start === pos ? null : { start, value: text.slice(start, pos) };
};

const findFunctionBeforeCursor = (text: string, cursorPos: number): { name: string; openPos: number; closePos: number } | null => {
  for (let i = cursorPos - 1; i >= 0; i--) {
    if (text[i] === ')') {
      const closePos = i;
      const openPos = getOpeningParen(text, closePos);
      if (openPos > 0) {
        const nameStart = text.lastIndexOf(KEYWORDS.join('|').split('|').reverse().join('|'), openPos - 1);
        if (nameStart !== -1) {
          const possibleNames = KEYWORDS.filter(kw => text.slice(nameStart, openPos).startsWith(kw));
          if (possibleNames.length > 0) {
            return { name: possibleNames[0], openPos, closePos };
          }
        }
      }
    }
  }
  return null;
};

export const processDigitInput = (val: string, cur: CursorState, digit: string): InputResult | null => {
  if (digit === '.' && hasDecimal(val, cur.selectionStart)) return null;
  if (digit === ',') return null;

  if (cur.hasSelection) {
    return replaceSelection(val, cur, digit, 1);
  }

  if (isCursorInsideKeyword(val, cur.selectionStart)) {
    const newPos = moveCursorToKeywordBoundary(val, cur.selectionStart, 'right');
    return replaceAt(val, newPos, digit, 1);
  }

  return replaceAt(val, cur.selectionStart, digit, 1);
};

export const processOperatorInput = (val: string, cur: CursorState, op: string): InputResult => {
  const { selectionStart, hasSelection } = cur;
  if (hasSelection) return replaceSelection(val, cur, op, op.length);

  if (selectionStart === 0) {
    if (op === '*' || op === '/' || op === '^') return { value: val, cursorPosition: 0 };
    return replaceAt(val, 0, op, 1);
  }

  const prev = val[selectionStart - 1];
  if (OPERATORS.includes(prev)) {
    if (prev === '-') return { value: val.slice(0, selectionStart - 1) + '-' + val.slice(selectionStart), cursorPosition: selectionStart };
    if (op === '-') return { value: val.slice(0, selectionStart - 1) + '-' + val.slice(selectionStart), cursorPosition: selectionStart };
    return { value: val.slice(0, selectionStart - 1) + op + val.slice(selectionStart), cursorPosition: selectionStart };
  }

  if (prev === '(' && (op === '*' || op === '/' || op === '^')) return { value: val, cursorPosition: selectionStart };

  if (isCursorInsideKeyword(val, selectionStart)) {
    const newPos = moveCursorToKeywordBoundary(val, selectionStart, 'right');
    return replaceAt(val, newPos, op, op.length);
  }

  return replaceAt(val, selectionStart, op, op.length);
};

export const processPiInput = (val: string, cur: CursorState): InputResult => {
  if (cur.hasSelection) {
    return replaceSelection(val, cur, 'pi', 2);
  }

  if (isCursorInsideKeyword(val, cur.selectionStart)) {
    const newPos = moveCursorToKeywordBoundary(val, cur.selectionStart, 'right');
    return replaceAt(val, newPos, 'pi', 2);
  }

  return replaceAt(val, cur.selectionStart, 'pi', 2);
};

export const processFunctionInput = (val: string, cur: CursorState, func: string): InputResult => {
  const { selectionStart, selectionEnd, hasSelection } = cur;

  if (func === 'sqrt()') {
    if (hasSelection) {
      return { value: val.slice(0, selectionStart) + `sqrt(${val.slice(selectionStart, selectionEnd)})` + val.slice(selectionEnd), cursorPosition: selectionStart + 5 };
    }
    return replaceAt(val, selectionStart, 'sqrt()', 5);
  }
  if (func === '^2' || func === '^3') {
    if (hasSelection) {
      const selected = val.slice(selectionStart, selectionEnd);
      const power = func === '^2' ? `(${selected})^2` : `(${selected})^3`;
      return { value: val.slice(0, selectionStart) + power + val.slice(selectionEnd), cursorPosition: selectionStart + power.length };
    }
    return replaceAt(val, selectionStart, func, 0);
  }
  if (func === '/') {
    const lastNum = getLastNumber(val, selectionStart);
    if (lastNum) {
      const newVal = val.slice(0, lastNum.start) + lastNum.value + '/' + val.slice(selectionStart);
      return { value: newVal, cursorPosition: lastNum.start + lastNum.value.length + 1 };
    }
    return replaceAt(val, selectionStart, '/', 1);
  }

  if (isCursorInsideKeyword(val, selectionStart)) {
    const newPos = moveCursorToKeywordBoundary(val, selectionStart, 'right');
    return replaceAt(val, newPos, func, func.length);
  }

  return replaceAt(val, selectionStart, func, func.length);
};

export const processDelete = (val: string, cur: CursorState): InputResult => {
  if (cur.hasSelection) {
    return { value: val.slice(0, cur.selectionStart) + val.slice(cur.selectionEnd), cursorPosition: cur.selectionStart };
  }
  if (cur.selectionStart === 0) return { value: val, cursorPosition: 0 };

  const pos = cur.selectionStart;

  // Atomic backspace for empty \\frac{}{}
  const fracResult = processFracBackspace(val, cur);
  if (fracResult) return fracResult;

  if (pos >= 4) {
    const before = val.slice(0, pos);
    for (const kw of KEYWORDS) {
      const kwStart = before.lastIndexOf(kw);
      if (kwStart !== -1) {
        const afterKw = kwStart + kw.length;
        if (val[afterKw] === '(') {
          const closeParenPos = getClosingParen(val, afterKw);
          if (closeParenPos !== -1 && closeParenPos === pos) {
            const newVal = val.slice(0, kwStart) + val.slice(closeParenPos + 1);
            return { value: newVal, cursorPosition: kwStart };
          }
        }
      }
    }
  }

  return { value: val.slice(0, pos - 1) + val.slice(pos), cursorPosition: pos - 1 };
};

export const processMoveCursor = (val: string, cur: CursorState, dir: 'left' | 'right'): InputResult => {
  let newPos = dir === 'left' ? Math.max(0, cur.selectionStart - 1) : Math.min(val.length, cur.selectionStart + 1);

  if (dir === 'left' && newPos > 0) {
    for (const kw of KEYWORDS) {
      const kwEnd = val.slice(0, newPos).lastIndexOf(kw);
      if (kwEnd !== -1 && kwEnd + kw.length === newPos) {
        newPos = kwEnd;
        break;
      }
    }
  }

  return { value: val, cursorPosition: newPos };
};

// --- Fraction support ---

const FRAC_TEMPLATE = '\\frac{}{}';
// Positions within \\frac{}{}: numerator starts at 7 (after "\\frac{"), denominator starts at 9 (after "\\frac{}{")
const FRAC_NUMERATOR_OFFSET = 7;   // cursor inside first {}
const FRAC_DENOMINATOR_OFFSET = 9; // cursor inside second {}

/**
 * Inserts \\frac{}{} at cursor position and places cursor inside the numerator.
 */
export const processFractionInsert = (val: string, cur: CursorState): InputResult => {
  const pos = cur.hasSelection ? cur.selectionStart : cur.selectionStart;
  const before = val.slice(0, pos);
  const after = val.slice(cur.hasSelection ? cur.selectionEnd : pos);
  const newVal = before + FRAC_TEMPLATE + after;
  return { value: newVal, cursorPosition: pos + FRAC_NUMERATOR_OFFSET };
};

/**
 * Finds the \\frac{}{} structure that the cursor is currently inside.
 * Returns the start index of the \\frac token, or -1 if not inside one.
 */
export const findFracAtCursor = (val: string, pos: number): { fracStart: number; numStart: number; numEnd: number; denStart: number; denEnd: number } | null => {
  // Search backwards for \\frac{ that contains the cursor
  let searchFrom = pos;
  while (searchFrom >= 0) {
    const fracIdx = val.lastIndexOf('\\frac{', searchFrom);
    if (fracIdx === -1) return null;

    // Parse \\frac{num}{den} from fracIdx
    const openNum = fracIdx + 6; // index of char after first {
    // find matching } for numerator
    let depth = 1;
    let closeNum = -1;
    for (let i = openNum; i < val.length; i++) {
      if (val[i] === '{') depth++;
      else if (val[i] === '}') { depth--; if (depth === 0) { closeNum = i; break; } }
    }
    if (closeNum === -1) { searchFrom = fracIdx - 1; continue; }

    if (val[closeNum + 1] !== '{') { searchFrom = fracIdx - 1; continue; }
    const openDen = closeNum + 2;
    depth = 1;
    let closeDen = -1;
    for (let i = openDen; i < val.length; i++) {
      if (val[i] === '{') depth++;
      else if (val[i] === '}') { depth--; if (depth === 0) { closeDen = i; break; } }
    }
    if (closeDen === -1) { searchFrom = fracIdx - 1; continue; }

    // Check if cursor is inside this frac structure
    if (pos >= openNum && pos <= closeDen + 1) {
      return { fracStart: fracIdx, numStart: openNum, numEnd: closeNum, denStart: openDen, denEnd: closeDen };
    }
    searchFrom = fracIdx - 1;
  }
  return null;
};

/**
 * Handles ArrowRight/Left navigation between numerator and denominator of \\frac{}{}.
 * Returns null if no special navigation needed (fall through to normal move).
 */
export const processFracNavigation = (val: string, cur: CursorState, dir: 'left' | 'right'): InputResult | null => {
  const frac = findFracAtCursor(val, cur.selectionStart);
  if (!frac) return null;

  const { numEnd, denStart, denEnd } = frac;

  if (dir === 'right' && cur.selectionStart === numEnd) {
    // At end of numerator → jump into denominator
    return { value: val, cursorPosition: denStart };
  }
  if (dir === 'left' && cur.selectionStart === denStart) {
    // At start of denominator → jump back to end of numerator
    return { value: val, cursorPosition: numEnd };
  }
  // Also: if cursor is right after the closing } of denominator, don't do special nav
  return null;
};

/**
 * Handles Backspace for \\frac{}{} — removes the whole structure if both parts are empty.
 */
export const processFracBackspace = (val: string, cur: CursorState): InputResult | null => {
  const frac = findFracAtCursor(val, cur.selectionStart);
  if (!frac) return null;

  const { fracStart, numStart, numEnd, denStart, denEnd } = frac;
  const numeratorContent = val.slice(numStart, numEnd);
  const denominatorContent = val.slice(denStart, denEnd);

  if (numeratorContent === '' && denominatorContent === '') {
    // Remove entire \\frac{}{} token
    const fracEnd = denEnd + 1; // position after closing }
    const newVal = val.slice(0, fracStart) + val.slice(fracEnd);
    return { value: newVal, cursorPosition: fracStart };
  }
  return null;
};

export const unifiedInputPipeline = (val: string, cur: CursorState, input: { type: string; value?: string; direction?: 'left' | 'right' }): InputResult | null => {
  switch (input.type) {
    case 'digit': return processDigitInput(val, cur, input.value || '');
    case 'operator': return processOperatorInput(val, cur, input.value || '');
    case 'pi': return processPiInput(val, cur);
    case 'function': return processFunctionInput(val, cur, input.value || '');
    case 'fraction': return processFractionInsert(val, cur);
    case 'delete': return processDelete(val, cur);
    case 'clear': return { value: '', cursorPosition: 0 };
    case 'move': {
      const dir = input.direction || 'left';
      const fracNav = processFracNavigation(val, cur, dir);
      if (fracNav) return fracNav;
      return processMoveCursor(val, cur, dir);
    }
    default: return null;
  }
};

export const processPhysicalKey = (key: string): { type: string; value?: string; direction?: 'left' | 'right' } => {
  if (key === 'Backspace' || key === 'Delete') return { type: 'delete' };
  if (key === 'ArrowLeft') return { type: 'move', direction: 'left' };
  if (key === 'ArrowRight') return { type: 'move', direction: 'right' };
  if (key === 'Escape') return { type: 'clear' };
  if (key === 'Enter') return { type: 'skip' };
  if (/[\d]/.test(key)) return { type: 'digit', value: key };
  if (key === '.' || key === ',') return { type: 'digit', value: '.' };
  if (['+', '-', '*', '/', '^'].includes(key)) return { type: 'operator', value: key };
  if (key === 'p' || key === 'P') return { type: 'pi' };
  return { type: 'none' };
};

export const hasDecimalInNumber = hasDecimal;
