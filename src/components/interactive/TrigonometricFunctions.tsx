import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { CoordinateGrid } from './CoordinateGrid';
import { ModuleInstructions } from './ModuleInstructions';

type FunctionType = 'sin' | 'cos' | 'tan' | 'cot';

export const TrigonometricFunctions: React.FC = () => {
    const [functionType, setFunctionType] = useState<FunctionType>('sin');
    const [amplitude, setAmplitude] = useState(1);
    const [frequency, setFrequency] = useState(1);
    const [phase, setPhase] = useState(0);

    const instructions = [
        'Выберите тригонометрическую функцию для отображения',
        'Измените амплитуду A (высоту волны)',
        'Измените частоту B (количество периодов)',
        'Измените фазу C (горизонтальный сдвиг)',
        'Нули, максимумы и минимумы отмечены на графике'
    ];

    const reset = () => {
        setFunctionType('sin');
        setAmplitude(1);
        setFrequency(1);
        setPhase(0);
    };

    const width = 800;
    const height = 600;
    const originX = width / 2;
    const originY = height / 2;
    const scale = 50;

    // Generate function points
    const generatePoints = (func: 'sin' | 'cos' | 'tan' | 'cot', samples = 200) => {
        const segments: { x: number; y: number }[][] = [];
        let currentSegment: { x: number; y: number }[] = [];

        const xMin = -originX / scale;
        const xMax = (width - originX) / scale;
        const step = (xMax - xMin) / samples;
        let prevDenominatorSign: number | null = null;

        for (let i = 0; i <= samples; i++) {
            const x = xMin + i * step;
            const angle = frequency * x + phase;
            let y: number;
            let shouldBreak = false;
            let denominatorSign: number | null = null;

            if (func === 'sin') {
                y = amplitude * Math.sin(angle);
            } else if (func === 'cos') {
                y = amplitude * Math.cos(angle);
            } else if (func === 'tan') {
                const cosValue = Math.cos(angle);
                denominatorSign = Math.sign(cosValue);

                // Check if denominator sign changed (asymptote crossed)
                if (prevDenominatorSign !== null && denominatorSign !== prevDenominatorSign && Math.abs(cosValue) < 0.1) {
                    shouldBreak = true;
                }

                y = amplitude * Math.tan(angle);

                // Also break if value is too large
                if (Math.abs(y) > (height / scale) * 0.8) {
                    shouldBreak = true;
                }
            } else { // cot
                const sinValue = Math.sin(angle);
                denominatorSign = Math.sign(sinValue);

                // Check if denominator sign changed (asymptote crossed)
                if (prevDenominatorSign !== null && denominatorSign !== prevDenominatorSign && Math.abs(sinValue) < 0.1) {
                    shouldBreak = true;
                }

                if (Math.abs(sinValue) < 0.001) {
                    shouldBreak = true;
                    y = 0; // dummy value
                } else {
                    y = amplitude * Math.cos(angle) / sinValue;

                    // Also break if value is too large
                    if (Math.abs(y) > (height / scale) * 0.8) {
                        shouldBreak = true;
                    }
                }
            }

            if (shouldBreak) {
                if (currentSegment.length > 0) {
                    segments.push(currentSegment);
                    currentSegment = [];
                }
                prevDenominatorSign = null;
            } else {
                currentSegment.push({
                    x: originX + x * scale,
                    y: originY - y * scale
                });
                if (func === 'tan' || func === 'cot') {
                    prevDenominatorSign = denominatorSign;
                }
            }
        }

        if (currentSegment.length > 0) {
            segments.push(currentSegment);
        }

        return segments;
    };

    // Find zeros, maxima, minima
    const findCriticalPoints = (func: 'sin' | 'cos') => {
        const points: { x: number; y: number; type: 'zero' | 'max' | 'min' }[] = [];
        const period = (2 * Math.PI) / frequency;
        const xMin = -originX / scale;
        const xMax = (width - originX) / scale;

        // Find zeros
        for (let n = Math.floor((xMin * frequency + phase) / Math.PI); n <= Math.ceil((xMax * frequency + phase) / Math.PI); n++) {
            const x = (n * Math.PI - phase) / frequency;
            if (x >= xMin && x <= xMax) {
                if (func === 'sin') {
                    points.push({ x, y: 0, type: 'zero' });
                } else if (func === 'cos' && n % 2 !== 0) {
                    points.push({ x, y: 0, type: 'zero' });
                }
            }
        }

        // Find maxima and minima
        for (let n = Math.floor((xMin * frequency + phase) / (Math.PI / 2)); n <= Math.ceil((xMax * frequency + phase) / (Math.PI / 2)); n++) {
            const x = (n * Math.PI / 2 - phase) / frequency;
            if (x >= xMin && x <= xMax) {
                const angle = frequency * x + phase;
                if (func === 'sin') {
                    const y = Math.sin(angle);
                    if (Math.abs(y - 1) < 0.01) {
                        points.push({ x, y: amplitude, type: 'max' });
                    } else if (Math.abs(y + 1) < 0.01) {
                        points.push({ x, y: -amplitude, type: 'min' });
                    }
                } else if (func === 'cos') {
                    const y = Math.cos(angle);
                    if (Math.abs(y - 1) < 0.01) {
                        points.push({ x, y: amplitude, type: 'max' });
                    } else if (Math.abs(y + 1) < 0.01) {
                        points.push({ x, y: -amplitude, type: 'min' });
                    }
                }
            }
        }

        return points;
    };

    const renderFunction = (func: 'sin' | 'cos' | 'tan' | 'cot', color: string) => {
        const segments = generatePoints(func);
        if (segments.length === 0) return null;

        return (
            <g key={func}>
                {segments.map((segment, segIndex) => {
                    if (segment.length < 2) return null;
                    const pathData = segment.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    return (
                        <path
                            key={segIndex}
                            d={pathData}
                            stroke={color}
                            strokeWidth="2"
                            fill="none"
                        />
                    );
                })}
                {(func === 'sin' || func === 'cos') && findCriticalPoints(func).map((point, i) => (
                    <g key={`critical-${i}`}>
                        <circle
                            cx={originX + point.x * scale}
                            cy={originY - point.y * scale}
                            r="4"
                            fill={point.type === 'zero' ? '#6366f1' : point.type === 'max' ? '#10b981' : '#ef4444'}
                        />
                    </g>
                ))}
            </g>
        );
    };

    const period = (2 * Math.PI) / frequency;

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b">
                <ModuleInstructions
                    title="Как использовать этот модуль"
                    instructions={instructions}
                    defaultExpanded={false}
                />
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 bg-gray-50 p-8 overflow-auto">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                        <CoordinateGrid
                            width={width}
                            height={height}
                            originX={originX}
                            originY={originY}
                            scale={scale}
                        />

                        {/* Amplitude and period visualization */}
                        {functionType !== 'tan' && functionType !== 'cot' && (
                            <>
                                {/* Amplitude lines */}
                                <line
                                    x1={originX}
                                    y1={originY - amplitude * scale}
                                    x2={originX + period * scale}
                                    y2={originY - amplitude * scale}
                                    stroke="#10b981"
                                    strokeWidth="1"
                                    strokeDasharray="4"
                                    opacity="0.5"
                                />
                                <line
                                    x1={originX}
                                    y1={originY + amplitude * scale}
                                    x2={originX + period * scale}
                                    y2={originY + amplitude * scale}
                                    stroke="#ef4444"
                                    strokeWidth="1"
                                    strokeDasharray="4"
                                    opacity="0.5"
                                />
                                {/* Period marker */}
                                <line
                                    x1={originX + period * scale}
                                    y1={originY - amplitude * scale - 10}
                                    x2={originX + period * scale}
                                    y2={originY + amplitude * scale + 10}
                                    stroke="#6366f1"
                                    strokeWidth="2"
                                    strokeDasharray="4"
                                />
                                <text
                                    x={originX + period * scale / 2}
                                    y={originY + amplitude * scale + 30}
                                    className="text-xs fill-indigo-600 font-medium"
                                    textAnchor="middle"
                                >
                                    Период: {period.toFixed(2)}
                                </text>
                            </>
                        )}

                        {/* Function graphs */}
                        {functionType === 'sin' && renderFunction('sin', '#3b82f6')}
                        {functionType === 'cos' && renderFunction('cos', '#10b981')}
                        {functionType === 'tan' && renderFunction('tan', '#f59e0b')}
                        {functionType === 'cot' && renderFunction('cot', '#8b5cf6')}
                    </svg>
                </div>

                <div className="w-96 border-l bg-white overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Тригонометрические функции</h3>
                            <span className="text-sm text-gray-500">y = A·f(Bx + C)</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Функция</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'sin' as const, label: 'sin(x)', color: 'blue' },
                                    { value: 'cos' as const, label: 'cos(x)', color: 'green' },
                                    { value: 'tan' as const, label: 'tan(x)', color: 'amber' },
                                    { value: 'cot' as const, label: 'cot(x)', color: 'purple' }
                                ].map(({ value, label, color }) => (
                                    <button
                                        key={value}
                                        onClick={() => setFunctionType(value)}
                                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${functionType === value
                                            ? `bg-${color}-100 text-${color}-700 border-2 border-${color}-500`
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Амплитуда A = {amplitude.toFixed(1)}
                                </label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.1"
                                    value={amplitude}
                                    onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Частота B = {frequency.toFixed(1)}
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="3"
                                    step="0.1"
                                    value={frequency}
                                    onChange={(e) => setFrequency(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Фаза C = {phase.toFixed(2)}
                                </label>
                                <input
                                    type="range"
                                    min="-3.14"
                                    max="3.14"
                                    step="0.1"
                                    value={phase}
                                    onChange={(e) => setPhase(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                            <div className="font-medium text-gray-700">Параметры:</div>
                            <div>Амплитуда: {amplitude.toFixed(2)}</div>
                            <div>Период: {period.toFixed(2)}</div>
                            <div>Фаза: {phase.toFixed(2)} рад</div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg space-y-2 text-sm">
                            <div className="font-medium text-blue-700">Обозначения:</div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                <span>Нули функции</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span>Максимумы</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span>Минимумы</span>
                            </div>
                        </div>

                        <button
                            onClick={reset}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            <RotateCcw size={18} />
                            Сброс
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrigonometricFunctions;
