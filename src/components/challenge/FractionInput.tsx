import React from 'react';

interface FractionInputProps {
  numerator: string;
  denominator: string;
  onNumeratorChange: (value: string) => void;
  onDenominatorChange: (value: string) => void;
  denominatorFixed?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const FractionInput: React.FC<FractionInputProps> = ({
  numerator,
  denominator,
  onNumeratorChange,
  onDenominatorChange,
  denominatorFixed = false,
  disabled = false,
}) => {
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <input
        type="text"
        value={numerator}
        onChange={(e) => onNumeratorChange(e.target.value)}
        disabled={disabled}
        placeholder="?"
        className="w-14 sm:w-16 px-2 py-1.5 text-center text-lg font-semibold border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed outline-none transition-all"
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const denominatorInput = document.getElementById('fraction-denominator');
            if (denominatorInput && !denominatorFixed) denominatorInput.focus();
          }
        }}
      />
      <div className="w-full h-0.5 bg-gray-600 rounded-full" />
      <input
        id="fraction-denominator"
        type="text"
        value={denominator}
        onChange={(e) => onDenominatorChange(e.target.value)}
        disabled={disabled || denominatorFixed}
        className="w-14 sm:w-16 px-2 py-1.5 text-center text-lg font-semibold border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed outline-none transition-all"
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            const numeratorInput = document.getElementById('fraction-numerator');
            if (numeratorInput) numeratorInput.focus();
          }
        }}
      />
    </div>
  );
};

export default FractionInput;
