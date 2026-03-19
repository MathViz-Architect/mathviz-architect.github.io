import React, { useDeferredValue, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { 
  useMathInputLogic, 
  normalizeMathExpression, 
  validateExpression 
} from './useMathInputLogic';
import { MathKeyboard } from './MathKeyboard';

// --- KaTeX Preview Component ---

interface KatexPreviewProps {
  expression: string;
  isValid: boolean;
  placeholder: string;
}

const KatexPreview: React.FC<KatexPreviewProps> = React.memo(({ expression, isValid, placeholder }) => {
  const deferredExpression = useDeferredValue(expression);

  const html = useMemo(() => {
    if (!deferredExpression) {
      return `<span class="text-gray-400">${placeholder}</span>`;
    }
    const normalized = normalizeMathExpression(deferredExpression);
    return katex.renderToString(normalized, {
      displayMode: true,
      throwOnError: false,
      strict: false,
    });
  }, [deferredExpression, placeholder]);

  const borderColor = isValid ? 'border-gray-300' : 'border-red-500';

  return (
    <div
      className={`p-4 rounded-t-lg border-2 ${borderColor} bg-white min-h-[60px] flex items-center justify-center transition-colors`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

// --- Main Math Input Field Component ---

interface MathInputFieldProps {
  value: string;
  onChange: (cleanValue: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const MathInputField: React.FC<MathInputFieldProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Введите математическое выражение...',
  disabled = false,
  autoFocus = false,
}) => {
  const { inputRef, expression, handleInput } = useMathInputLogic({
    initialValue: value,
    onChange: onChange,
  });

  const isValid = useMemo(() => validateExpression(expression), [expression]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto font-sans">
      <KatexPreview expression={expression} isValid={isValid} placeholder={placeholder} />
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="none" // Prevents mobile keyboard
          onKeyDown={handleKeyDown}
          className="w-full p-2 text-lg bg-gray-100 border-2 border-t-0 border-gray-300 rounded-b-lg outline-none text-gray-700 caret-blue-500 disabled:bg-gray-200"
          defaultValue={value} // Set initial value, hook will manage updates
          disabled={disabled}
          autoFocus={autoFocus}
        />
      </div>
      {!disabled && <MathKeyboard onKeyPress={handleInput} />}
    </div>
  );
};
