import React from 'react';
import { Circle, CircleDashed, CircleDot } from 'lucide-react';

interface PenSettingsPanelProps {
  penSettings: { width: number; color: string };
  setPenSettings: (settings: Partial<{ width: number; color: string }>) => void;
}

const COLOR_PRESETS = [
  { color: '#1F2937', name: 'Чёрный' },
  { color: '#EF4444', name: 'Красный' },
  { color: '#3B82F6', name: 'Синий' },
  { color: '#10B981', name: 'Зелёный' },
  { color: '#8B5CF6', name: 'Фиолетовый' },
  { color: '#F59E0B', name: 'Оранжевый' },
];

const THICKNESS_PRESETS = [
  { width: 2, label: 'Тонкая', Icon: CircleDashed, ariaLabel: 'Тонкая линия' },
  { width: 5, label: 'Средняя', Icon: Circle, ariaLabel: 'Средняя линия' },
  { width: 10, label: 'Толстая', Icon: CircleDot, ariaLabel: 'Толстая линия' },
];

export const PenSettingsPanel: React.FC<PenSettingsPanelProps> = ({ penSettings, setPenSettings }) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto overflow-x-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Карандаш</h3>
        <p className="text-xs text-gray-400 mt-1">Настройки инструмента</p>
      </div>
      
      <div className="p-4 space-y-5">
        {/* Color Section */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Цвет</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.color}
                onClick={() => setPenSettings({ color: preset.color })}
                title={preset.name}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  penSettings.color === preset.color
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
              value={penSettings.color}
              onChange={(e) => setPenSettings({ color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-gray-200"
              aria-label="Выбрать цвет"
            />
            <input
              type="text"
              value={penSettings.color}
              onChange={(e) => setPenSettings({ color: e.target.value })}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Thickness Section */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Толщина линии</label>
          <div className="flex gap-2 mb-3">
            {THICKNESS_PRESETS.map((preset) => {
              const Icon = preset.Icon;
              const isActive = penSettings.width === preset.width;
              return (
                <button
                  key={preset.width}
                  onClick={() => setPenSettings({ width: preset.width })}
                  title={preset.ariaLabel}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  aria-label={preset.ariaLabel}
                  aria-pressed={isActive}
                >
                  <Icon size={16} />
                  <span className="text-xs font-medium">{preset.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              value={penSettings.width}
              onChange={(e) => setPenSettings({ width: parseInt(e.target.value) })}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              min={1}
              max={20}
              aria-label="Толщина линии"
            />
            <span className="text-xs text-gray-500 font-medium w-8 text-right">{penSettings.width}px</span>
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Предпросмотр</label>
          <div className="h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <svg
              width="200"
              height="20"
              viewBox="0 0 200 20"
              className="w-full"
              aria-hidden="true"
            >
              <path
                d="M 10 10 Q 50 0, 100 10 T 190 10"
                stroke={penSettings.color}
                strokeWidth={penSettings.width}
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
