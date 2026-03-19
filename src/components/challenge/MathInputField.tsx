import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import { VirtualMathKeyboard, KeyConfig } from './MathKeyboard';
import { PreviewDisplay } from './PreviewDisplay';
import { unifiedInputPipeline, getCursorState, processPhysicalKey, hasDecimalInNumber } from './hooks/useMathInputLogic';

export interface MathInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const MathInputField: React.FC<MathInputFieldProps> = ({
  value,
  onChange,
  placeholder = 'Введите ответ...',
  disabled = false,
  className = '',
  autoFocus = false,
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!isInternalUpdate.current && inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
    isInternalUpdate.current = false;
  }, [value]);

  const applyInput = useCallback((
    type: 'digit' | 'operator' | 'function' | 'delete' | 'clear' | 'move' | 'pi',
    inputValue?: string,
    direction?: 'left' | 'right'
  ) => {
    const input = inputRef.current;
    if (!input || disabled) return;

    const currentValue = input.value;
    const cursor = getCursorState(input, currentValue.length);

    const result = unifiedInputPipeline(currentValue, cursor, {
      type,
      value: inputValue,
      direction,
    });

    if (!result) return;

    isInternalUpdate.current = true;
    input.value = result.value;
    input.setSelectionRange(result.cursorPosition, result.cursorPosition);
    input.focus();
    onChange(result.value);
  }, [disabled, onChange]);

  const handleKeyPress = useCallback((key: KeyConfig) => {
    if (key.action === 'delete') {
      applyInput('delete');
    } else if (key.action === 'clear') {
      applyInput('clear');
    } else if (key.action === 'moveLeft') {
      applyInput('move', undefined, 'left');
    } else if (key.action === 'moveRight') {
      applyInput('move', undefined, 'right');
    } else if (key.variant === 'digit') {
      applyInput('digit', key.label);
    } else if (key.label === 'pi') {
      applyInput('pi');
    } else if (key.variant === 'operator') {
      applyInput('operator', key.label);
    } else if (key.variant === 'function') {
      applyInput('function', key.label);
    }
  }, [applyInput]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    if (!input) return;

    const newValue = e.target.value;
    const oldValue = value;

    if (newValue.length > oldValue.length) {
      const addedChar = newValue[oldValue.length];
      
      if (addedChar === '.') {
        if (hasDecimalInNumber(newValue, oldValue.length + 1)) {
          input.value = oldValue;
          onChange(oldValue);
          return;
        }
      }

      if ((addedChar === '*' || addedChar === '/' || addedChar === '^') && oldValue.length === 0) {
        input.value = '';
        onChange('');
        return;
      }
    }

    onChange(newValue);
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const input = inputRef.current;
    if (!input) return;

    const key = e.key;
    const currentValue = input.value;

    if (key === 'Delete') {
      e.preventDefault();
      if (input.selectionStart !== null && input.selectionStart < currentValue.length) {
        const cursor = getCursorState(input, currentValue.length);
        const result = unifiedInputPipeline(currentValue, cursor, { type: 'delete' });
        if (result) {
          input.value = result.value;
          input.setSelectionRange(result.cursorPosition, result.cursorPosition);
          onChange(result.value);
        }
      }
      return;
    }

    const action = processPhysicalKey(key);

    if (action.type === 'skip') {
      e.preventDefault();
      return;
    }

    if (action.type === 'none') {
      return;
    }

    if (action.type === 'digit' && action.value === '.') {
      const cursor = getCursorState(input, currentValue.length);
      if (hasDecimalInNumber(currentValue, cursor.selectionStart)) {
        e.preventDefault();
        return;
      }
    }

    if (action.type === 'digit' && currentValue.length === 0) {
      return;
    }

    if (action.type === 'operator' && input.selectionStart === 0) {
      if (action.value === '*' || action.value === '/' || action.value === '^') {
        e.preventDefault();
        return;
      }
    }

    e.preventDefault();
    applyInput(
      action.type as 'digit' | 'operator' | 'function' | 'delete' | 'clear' | 'move' | 'pi',
      action.value,
      action.direction
    );
  }, [disabled, applyInput, onChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={`w-full px-4 py-3 pr-12 text-lg font-mono border-2 rounded-xl transition-all outline-none
              ${disabled 
                ? 'bg-slate-50 border-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-white border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
              }`}
            onFocus={() => setIsKeyboardVisible(true)}
          />
          <button
            type="button"
            onClick={() => setIsKeyboardVisible(!isKeyboardVisible)}
            onMouseDown={(e) => e.preventDefault()}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
              ${isKeyboardVisible 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            tabIndex={-1}
          >
            <Keyboard size={20} />
          </button>
        </div>
      </div>

      {value && (
        <div className="mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg max-h-24 overflow-y-auto">
          <PreviewDisplay value={value} />
        </div>
      )}

      {isKeyboardVisible && !disabled && (
        <div className="mt-2">
          <VirtualMathKeyboard onKeyPress={handleKeyPress} />
        </div>
      )}
    </div>
  );
};

export default MathInputField;
