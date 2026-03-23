import React, { useDeferredValue, useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { useMathInputLogic } from './useMathInputLogic';
import { renderKatex } from '../../lib/math/katexAdapter';
import { MathKeyboard } from './MathKeyboard';

// --- KaTeX Preview Component ---

interface KatexPreviewProps {
  expression: string;
  placeholder: string;
}

const KatexPreview: React.FC<KatexPreviewProps> = React.memo(({ expression, placeholder }) => {
  const deferredExpression = useDeferredValue(expression);

  const html = useMemo(() => {
    if (!deferredExpression) {
      return `<span class="text-gray-400">${placeholder}</span>`;
    }
    return renderKatex(deferredExpression, { displayMode: true });
  }, [deferredExpression, placeholder]);

  return (
    <div
      className={`p-4 rounded-t-lg border-2 border-gray-300 bg-white min-h-[60px] flex items-center justify-center transition-colors`}
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto font-sans">
      <KatexPreview expression={expression} placeholder={placeholder} />
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
