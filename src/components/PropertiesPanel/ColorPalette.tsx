import React from 'react';

export const PRESET_COLORS = [
    'transparent',
    '#000000',
    '#374151',
    '#EF4444',
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
] as const;

interface ColorPaletteProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    allowTransparent?: boolean;
    disabled?: boolean;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
    value,
    onChange,
    label,
    allowTransparent = true,
    disabled = false,
}) => {
    const colors = allowTransparent
        ? PRESET_COLORS
        : PRESET_COLORS.filter((c) => c !== 'transparent');

    return (
        <div>
            {label && (
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
            )}
            <div className={`grid grid-cols-4 gap-2 ${disabled ? 'opacity-50' : ''}`}>
                {colors.map((color) => {
                    const isActive = color === value;
                    const isTransparent = color === 'transparent';

                    return (
                        <button
                            key={color}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(color)}
                            className={[
                                'w-6 h-6 rounded-full cursor-pointer border border-gray-300',
                                isActive ? 'ring-2 ring-offset-1 ring-indigo-500' : '',
                                disabled ? 'cursor-not-allowed' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            style={isTransparent ? {} : { backgroundColor: color }}
                            title={color}
                        >
                            {isTransparent && (
                                <span className="relative flex items-center justify-center w-full h-full rounded-full bg-white overflow-hidden">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="absolute inset-0 w-full h-full"
                                        aria-hidden="true"
                                    >
                                        <line
                                            x1="2"
                                            y1="22"
                                            x2="22"
                                            y2="2"
                                            stroke="#EF4444"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
