import React from 'react';

interface HighlighterSettingsPanelProps {
    highlighterSettings: { width: number; color: string };
    setHighlighterSettings: (settings: Partial<{ width: number; color: string }>) => void;
}

const HIGHLIGHTER_COLORS = [
    { color: '#FAFF00', name: 'Жёлтый' },
    { color: '#ADFF2F', name: 'Салатовый' },
    { color: '#00FFFF', name: 'Голубой' },
    { color: '#FF69B4', name: 'Розовый' },
    { color: '#FF8C00', name: 'Оранжевый' },
    { color: '#DA70D6', name: 'Сиреневый' },
];

export const HighlighterSettingsPanel: React.FC<HighlighterSettingsPanelProps> = ({
    highlighterSettings,
    setHighlighterSettings,
}) => {
    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto overflow-x-hidden">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">Выделитель</h3>
                <p className="text-xs text-gray-400 mt-1">Настройки инструмента</p>
            </div>

            <div className="p-4 space-y-5">
                {/* Color Section */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Цвет маркера</label>
                    <div className="flex flex-wrap gap-2">
                        {HIGHLIGHTER_COLORS.map((preset) => (
                            <button
                                key={preset.color}
                                onClick={() => setHighlighterSettings({ color: preset.color })}
                                title={preset.name}
                                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 ${highlighterSettings.color === preset.color
                                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                style={{ backgroundColor: preset.color }}
                                aria-label={preset.name}
                            />
                        ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <input
                            type="color"
                            value={highlighterSettings.color}
                            onChange={(e) => setHighlighterSettings({ color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                            aria-label="Выбрать цвет маркера"
                        />
                        <input
                            type="text"
                            value={highlighterSettings.color}
                            onChange={(e) => setHighlighterSettings({ color: e.target.value })}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="#FAFF00"
                        />
                    </div>
                </div>

                {/* Thickness Section */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                        Толщина: {highlighterSettings.width}px
                    </label>
                    <input
                        type="range"
                        value={highlighterSettings.width}
                        onChange={(e) => setHighlighterSettings({ width: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        min={10}
                        max={60}
                        step={2}
                        aria-label="Толщина маркера"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>10px</span>
                        <span>60px</span>
                    </div>
                </div>

                {/* Preview */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Предпросмотр</label>
                    <div className="h-14 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                        <svg width="200" height="40" viewBox="0 0 200 40" aria-hidden="true">
                            {/* Simulated text underneath */}
                            <text x="10" y="28" fontSize="14" fill="#374151" fontFamily="sans-serif">
                                Пример текста
                            </text>
                            {/* Highlighter stroke on top */}
                            <path
                                d="M 8 22 Q 50 18, 100 22 T 192 22"
                                stroke={highlighterSettings.color}
                                strokeWidth={highlighterSettings.width}
                                fill="none"
                                strokeLinecap="round"
                                opacity={0.4}
                                style={{ mixBlendMode: 'multiply' }}
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};
