import { useState, useRef, useCallback, useEffect } from 'react';
import { isValidMathExpression } from '../../lib/math/mathJsAdapter';
import { toMathJSExpression } from '../../lib/math/normalization';


// --- Constants and Types ---

const MATH_FUNCTIONS = ['sqrt', 'sin', 'cos', 'tan', 'log'];
const CONSTANTS = ['pi', 'e'];
const VARIABLES = ['x', 'y', 'z', 'k', 'm', 'n', 'a', 'b', 'c'];
const SPECIAL_CHARS = ['\\le', '\\ge', '\\neq', '\\approx', '\\infty', '\\angle', '\\perp', '^\\circ'];
const TOKENS = [...MATH_FUNCTIONS, ...CONSTANTS, ...SPECIAL_CHARS, ...VARIABLES];

const ATOMIC_TOKENS = [
  '\\le',
  '\\ge',
  '\\neq',
  '\\infty',
  'sqrt',
  'sin',
  'cos',
  'tan',
  'pi'
];

type InputState = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

// --- Core Hook ---

export const useMathInputLogic = ({
  initialValue = '',
  onChange,
}: {
  initialValue?: string;
  onChange: (cleanValue: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [expression, setExpression] = useState(initialValue ?? '');
  const [cursorPosition, setCursorPosition] = useState(initialValue.length);

  const getSnapshot = (): InputState => {
    if (!inputRef.current) {
      return { value: expression, selectionStart: cursorPosition, selectionEnd: cursorPosition };
    }
    const { value, selectionStart, selectionEnd } = inputRef.current;
    return { value, selectionStart: selectionStart ?? 0, selectionEnd: selectionEnd ?? 0 };
  };

  useEffect(() => {
    // Sync raw value if prop changes from parent
    if (inputRef.current && initialValue !== inputRef.current.value) {
      inputRef.current.value = initialValue;
      setExpression(initialValue);
    }
  }, [initialValue]);

  const applyChange = (value: string, selection: number) => {
    setExpression(value);
    setCursorPosition(selection);
    if (inputRef.current) {
      inputRef.current.value = value;
      inputRef.current.selectionStart = selection;
      inputRef.current.selectionEnd = selection;
    }
    onChange(toMathJSExpression(value));
  };

  const handleInput = useCallback(
    (key: string) => {
      const { value, selectionStart } = getSnapshot();

      // Prevent typing inside a token
      const cursorAtToken = TOKENS.find((token) => {
        const tokenIndex = value.lastIndexOf(token, selectionStart);
        return (
          tokenIndex !== -1 &&
          selectionStart > tokenIndex &&
          selectionStart < tokenIndex + token.length
        );
      });

      if (cursorAtToken) {
        applyChange(
          value,
          value.lastIndexOf(cursorAtToken, selectionStart) +
          cursorAtToken.length
        );
        return;
      }

      let newValue = value;
      let newSelection = selectionStart;

      if (key === 'Backspace') {
        const preceding = value.slice(0, selectionStart);

        // Check if preceding text ends with any known token
        // First try exact match
        let tokenToDelete = TOKENS.find(token => preceding.endsWith(token));

        if (!tokenToDelete && preceding.endsWith(' ')) {
          // Try finding token before the trailing space
          const beforeSpace = preceding.slice(0, -1);
          tokenToDelete = TOKENS.find(token => beforeSpace.endsWith(token));
          if (tokenToDelete) {
            // Include the space in what we delete
            const tokenStartIndex = beforeSpace.lastIndexOf(tokenToDelete);
            newValue = value.slice(0, tokenStartIndex) + value.slice(selectionStart);
            newSelection = tokenStartIndex;
          }
        } else if (tokenToDelete) {
          const tokenStartIndex = preceding.lastIndexOf(tokenToDelete);
          newValue = value.slice(0, tokenStartIndex) + value.slice(selectionStart);
          newSelection = tokenStartIndex;
        } else if (selectionStart < value.length && value[selectionStart] === ' ') {
          // Cursor before a space - check if there's a token before that space
          const afterSpace = value.slice(selectionStart + 1);
          const tokenAfterSpace = TOKENS.find(token => afterSpace.startsWith(token));
          if (tokenAfterSpace) {
            // Delete space + token
            newValue = value.slice(0, selectionStart) + value.slice(selectionStart + 1 + tokenAfterSpace.length);
            newSelection = selectionStart;
          } else {
            // Normal backspace
            newValue = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
            newSelection = selectionStart - 1;
          }
        } else {
          // Normal backspace
          newValue = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
          newSelection = selectionStart - 1;
        }
      } else if (MATH_FUNCTIONS.includes(key)) {
        const insert = `${key}()`;
        newValue = value.slice(0, selectionStart) + insert + value.slice(selectionStart);
        newSelection = selectionStart + key.length + 1;
      } else {
        newValue = value.slice(0, selectionStart) + key + value.slice(selectionStart);
        newSelection = selectionStart + key.length;
      }

      applyChange(newValue, newSelection);
    },
    [onChange, expression, cursorPosition]
  );

  const setCursorPos = useCallback((pos: number) => {
    setCursorPosition(pos);
    return pos;
  }, []);

  return { inputRef, expression, handleInput, setCursorPos };
};

// --- Smart Backspace ---

export function smartBackspace(value: string, cursor: number): { value: string; cursor: number } {
  if (cursor === 0) return { value, cursor };

  for (const token of ATOMIC_TOKENS) {
    const start = cursor - token.length;

    if (start >= 0 && value.slice(start, cursor) === token) {
      const newValue = value.slice(0, start) + value.slice(cursor);

      return {
        value: newValue,
        cursor: start
      };
    }
  }

  const newValue = value.slice(0, cursor - 1) + value.slice(cursor);

  return {
    value: newValue,
    cursor: cursor - 1
  };
};

/**
 * Validates the expression using mathjs.
 * Note: This will fail for intervals or pure inequalities.
 */
export const validateExpression = (text: string): boolean => {
  const cleaned = toMathJSExpression(text);
  return isValidMathExpression(cleaned);
};


export function getCleanExpression(input: string): string {
  return toMathJSExpression(input)
}
export { normalizeMathExpression } from '../../lib/math/normalization'
