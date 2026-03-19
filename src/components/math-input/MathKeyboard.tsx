import React, { useState } from 'react';

interface MathKeyboardProps {
  onKeyPress: (key: string) => void;
}

type Key = {
  label: string;
  value: string;
  className?: string;
};

const KEY_LAYOUTS: Record<string, Key[]> = {
  '123': [
    { label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }, { label: '÷', value: '/' },
    { label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' }, { label: '×', value: '*' },
    { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '−', value: '-' },
    { label: '0', value: '0' }, { label: '.', value: '.' }, { label: 'π', value: 'pi' }, { label: '+', value: '+' },
    { label: '√', value: 'sqrt' }, { label: 'a/b', value: '/' }, { label: 'x^y', value: '^' }, { label: '⌫', value: 'Backspace', className: 'bg-red-200 hover:bg-red-300' },
  ],
  'f(x)': [
    { label: 'x', value: 'x' }, { label: 'y', value: 'y' }, { label: 'a', value: 'a' }, { label: 'b', value: 'b' },
    { label: '=', value: '=' }, { label: '≠', value: '\\neq' }, { label: '≈', value: '\\approx' }, { label: '⌫', value: 'Backspace', className: 'bg-red-200 hover:bg-red-300' },
    { label: '<', value: '<' }, { label: '>', value: '>' }, { label: '≤', value: '\\le' }, { label: '≥', value: '\\ge' },
    { label: 'sin', value: 'sin' }, { label: 'cos', value: 'cos' }, { label: 'tan', value: 'tan' }, { label: 'log', value: 'log' },
  ],
  '[;]': [
    { label: '(', value: '(' }, { label: ')', value: ')' }, { label: '[', value: '[' }, { label: ']', value: ']' },
    { label: '{', value: '{' }, { label: '}', value: '}' }, { label: ';', value: ';' }, { label: '⌫', value: 'Backspace', className: 'bg-red-200 hover:bg-red-300' },
    { label: '∞', value: '\\infty' }, { label: '°', value: '^\\circ' }, { label: '∠', value: '\\angle' }, { label: '⊥', value: '\\perp' },
  ],
};

const KeyboardButton: React.FC<{
  label: string;
  value: string;
  onKeyPress: (key: string) => void;
  className?: string;
}> = ({ label, value, onKeyPress, className = '' }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent input from losing focus
    onKeyPress(value);
  };

  return (
    <button
      type="button" // Prevent form submission
      onMouseDown={handleMouseDown}
      className={`h-12 rounded-lg bg-gray-200 hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-sans text-lg ${className}`}
      dangerouslySetInnerHTML={{ __html: label }}
    />
  );
};

export const MathKeyboard: React.FC<MathKeyboardProps> = ({ onKeyPress }) => {
  const [activeTab, setActiveTab] = useState<'123' | 'f(x)' | '[;]'>('123');

  const TabButton: React.FC<{ name: '123' | 'f(x)' | '[;]' }> = ({ name }) => (
    <button
      type="button"
      onClick={() => setActiveTab(name)}
      className={`flex-1 py-2 text-sm font-medium rounded-t-md focus:outline-none ${
        activeTab === name
          ? 'bg-gray-100 text-indigo-600'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      }`}
    >
      {name}
    </button>
  );

  return (
    <div className="mt-2 bg-gray-200 rounded-lg shadow-inner select-none" style={{ zIndex: 50 }}>
      <div className="flex">
        <TabButton name="123" />
        <TabButton name="f(x)" />
        <TabButton name="[;]" />
      </div>
      <div className="grid grid-cols-4 gap-2 p-2 bg-gray-100 rounded-b-lg">
        {KEY_LAYOUTS[activeTab].map((key) => (
          <KeyboardButton
            key={key.label}
            label={key.label}
            value={key.value}
            onKeyPress={onKeyPress}
            className={key.className}
          />
        ))}
      </div>
    </div>
  );
};
