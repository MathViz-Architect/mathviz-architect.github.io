import React, { useCallback } from 'react';

export type KeyVariant = 'digit' | 'operator' | 'function' | 'action';

export interface KeyConfig {
  label: string;
  display?: string;
  action?: 'delete' | 'clear' | 'moveLeft' | 'moveRight';
  variant: KeyVariant;
  isFraction?: boolean;
}

export const KEYBOARD_LAYOUT: KeyConfig[][] = [
  [
    { label: '7', variant: 'digit' }, { label: '8', variant: 'digit' }, { label: '9', variant: 'digit' },
    { label: '(', variant: 'operator' }, { label: ')', variant: 'operator' },
    { display: 'x²', label: '^2', variant: 'function' }, { label: '^', variant: 'operator' },
  ],
  [
    { label: '4', variant: 'digit' }, { label: '5', variant: 'digit' }, { label: '6', variant: 'digit' },
    { label: '+', variant: 'operator' }, { label: '-', variant: 'operator' },
    { display: '√', label: 'sqrt()', variant: 'function' }, { display: 'π', label: 'pi', variant: 'operator' },
  ],
  [
    { label: '1', variant: 'digit' }, { label: '2', variant: 'digit' }, { label: '3', variant: 'digit' },
    { label: '*', display: '×', variant: 'operator' }, { label: '/', display: '÷', variant: 'operator' },
    { display: 'a/b', label: '/', variant: 'function', isFraction: true }, { display: 'x³', label: '^3', variant: 'function' },
  ],
  [
    { label: '0', variant: 'digit' }, { label: '.', variant: 'digit' }, { label: ',', variant: 'digit' },
    { display: '←', label: '←', action: 'moveLeft', variant: 'action' },
    { display: '→', label: '→', action: 'moveRight', variant: 'action' },
    { display: '⌫', label: '⌫', action: 'delete', variant: 'action' },
    { display: 'C', label: 'C', action: 'clear', variant: 'action' },
  ],
];

interface VirtualMathKeyboardProps {
  onKeyPress: (key: KeyConfig) => void;
  className?: string;
}

const variantStyles: Record<KeyVariant, string> = {
  digit: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300',
  operator: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-semibold',
  function: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  action: 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200',
};

export const VirtualMathKeyboard: React.FC<VirtualMathKeyboardProps> = ({ onKeyPress, className = '' }) => {
  const handleKeyPress = useCallback((key: KeyConfig) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
    onKeyPress(key);
  }, [onKeyPress]);

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-slate-200 p-2 sm:p-3 ${className} z-50`}>
      <div className="flex flex-col gap-1.5">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 flex-wrap">
            {row.map((key, keyIndex) => (
              <button
                key={keyIndex}
                type="button"
                onClick={() => handleKeyPress(key)}
                onMouseDown={(e) => e.preventDefault()}
                className={`min-w-[40px] sm:min-w-[44px] h-10 sm:h-11 px-2 sm:px-3 rounded-lg border transition-all duration-100 active:scale-95 flex items-center justify-center text-xs sm:text-sm font-medium select-none ${variantStyles[key.variant]}`}
              >
                {key.display || key.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualMathKeyboard;
