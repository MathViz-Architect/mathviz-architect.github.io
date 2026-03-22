import React from 'react';

interface StrokeWidthSliderProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    disabled?: boolean;
}

export const StrokeWidthSlider: React.FC<StrokeWidthSliderProps> = ({
    value,
    onChange,
    label,
    disabled = false,
}) => {
    const clamped = Math.max(1, Math.min(10, value));

    return (
        <div className={disabled ? 'opacity-50' : ''}>
            {label && (
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
            )}
            <div className="flex items-center gap-2">
                <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={clamped}
                    disabled={disabled}
                    onChange={(e) => onChange(parseInt(e.target.value, 10))}
                    className="flex-1 accent-indigo-500 disabled:cursor-not-allowed"
                />
                <span className="text-xs font-mono text-gray-700 w-4 text-right">
                    {clamped}
                </span>
            </div>
        </div>
    );
};
