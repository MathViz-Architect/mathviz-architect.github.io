import React, { useState, useMemo } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';
import { CoordinateGrid } from './CoordinateGrid';

interface CriticalPoint {
    x: number;
    y: number;
    type: 'max' | 'min';
}

interface InflectionPoint {
    x: number;
    y: number;
}

export const FunctionAnalysis: React.FC = () => {
    const [a, setA] = useState(1);
    const [b, setB] = useState(0);
    const [c, setC] = useState(-3);
    const [d, setD] = useState(0);

    const instructions = [
        'Настройте коэффициенты функции y = ax³ + bx² + cx + d',
        'График функции показан синим цветом',
        'График производной f\'(x) показан зелёным пунктиром',
        'Оранжевые точки — экстремумы (максимум/минимум)',
        'Фиолетовая точка — точка перегиба',
        'Анализ обновляется автоматически при изменении параметров',
    ];

    // f(x) = ax³ + bx² + cx + d
    const f = (x: number): number => a * x ** 3 + b * x ** 2 + c * x + d;

    // f'(x) = 3ax² + 2bx + c
    const fPrime = (x: number): number => 3 * a * x ** 2 + 2 * b * x + c;

    // f''(x) = 6ax + 2b
    const fDoublePrime = (x: number): number => 6 * a * x + 2 * b;

    // Calculate critical points (extrema)
    const criticalPoints = useMemo((): CriticalPoint[] => {
        if (a === 0) return []; // Not a cubic function

        // Solve 3ax² + 2bx + c = 0
        const A = 3 * a;
        const B = 2 * b;
        const C = c;

        const discriminant = B * B - 4 * A * C;

        if (discriminant < 0) return []; // No real roots

        const points: CriticalPoint[] = [];

        if (discriminant === 0) {
            // One critical point
            const x = -B / (2 * A);
            const y = f(x);
            const type = fDoublePrime(x) > 0 ? 'min' : 'max';
            points.push({ x, y, type });
        } else {
            // Two critical points
            const sqrtD = Math.sqrt(discriminant);
            const x1 = (-B - sqrtD) / (2 * A);
            const x2 = (-B + sqrtD) / (2 * A);

            const y1 = f(x1);
            const y2 = f(x2);

            const type1 = fDoublePrime(x1) > 0 ? 'min' : 'max';
            const type2 = fDoublePrime(x2) > 0 ? 'min' : 'max';

            points.push({ x: x1, y: y1, type: type1 });
            points.push({ x: x2, y: y2, type: type2 });
        }

        return points;
    }, [a, b, c, d]);

    // Calculate inflection point
    const inflectionPoint = useMemo((): InflectionPoint | null => {
        if (a === 0) return null; // Not a cubic function

        // Solve 6ax + 2b = 0
        const x = -b / (3 * a);
        const y = f(x);

        return { x, y };
    }, [a, b, c, d]);

    // Calculate monotonicity intervals
    const monotonicity = useMemo((): string => {
        if (criticalPoints.length === 0) {
            // No critical points - always increasing or decreasing
            return a > 0 ? '↑ (-∞, +∞)' : '↓ (-∞, +∞)';
        }

        if (criticalPoints.length === 1) {
            const cp = criticalPoints[0];
            if (cp.type === 'min') {
                return `↓ (-∞, ${cp.x.toFixed(2)}), ↑ (${cp.x.toFixed(2)}, +∞)`;
            } else {
                return `↑ (-∞, ${cp.x.toFixed(2)}), ↓ (${cp.x.toFixed(2)}, +∞)`;
            }
        }

        // Two critical points
        const [cp1, cp2] = criticalPoints.sort((a, b) => a.x - b.x);
        if (cp1.type === 'max') {
            return `↑ (-∞, ${cp1.x.toFixed(2)}), ↓ (${cp1.x.toFixed(2)}, ${cp2.x.toFixed(2)}), ↑ (${cp2.x.toFixed(2)}, +∞)`;
        } else {
            return `↓ (-∞, ${cp1.x.toFixed(2)}), ↑ (${cp1.x.toFixed(2)}, ${cp2.x.toFixed(2)}), ↓ (${cp2.x.toFixed(2)}, +∞)`;
        }
    }, [criticalPoints, a]);

    // Calculate convexity intervals
    const convexity = useMemo((): string => {
        if (!inflectionPoint) return '';

        const x0 = inflectionPoint.x;
        if (a > 0) {
            return `∩ (-∞, ${x0.toFixed(2)}), ∪ (${x0.toFixed(2)}, +∞)`;
        } else {
            return `∪ (-∞, ${x0.toFixed(2)}), ∩ (${x0.toFixed(2)}, +∞)`;
        }
    }, [inflectionPoint, a]);

    // Calculate function points for graph
    const functionPoints = useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        const width = 500;
        const height = 380;
        const scale = 40;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let x = -8; x <= 8; x += 0.05) {
            const y = f(x);
            if (isNaN(y) || !isFinite(y) || Math.abs(y) > 20) continue;

            const px = centerX + x * scale;
            const py = centerY - y * scale;
            pts.push({ x: px, y: py });
        }
        return pts;
    }, [a, b, c, d]);

    // Calculate derivative points for graph
    const derivativePoints = useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        const width = 500;
        const height = 380;
        const scale = 40;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let x = -8; x <= 8; x += 0.05) {
            const y = fPrime(x);
            if (isNaN(y) || !isFinite(y) || Math.abs(y) > 20) continue;

            const px = centerX + x * scale;
            const py = centerY - y * scale;
            pts.push({ x: px, y: py });
        }
        return pts;
    }, [a, b, c]);

    // Generate path for function
    const functionPath = useMemo(() => {
        if (functionPoints.length === 0) return '';
        return functionPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }, [functionPoints]);

    // Generate path for derivative
    const derivativePath = useMemo(() => {
        if (derivativePoints.length === 0) return '';
        return derivativePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }, [derivativePoints]);

    const reset = () => {
        setA(1);
        setB(0);
        setC(-3);
        setD(0);
    };

    // Convert critical points to screen coordinates
    const criticalPointsScreen = useMemo(() => {
        const width = 500;
        const height = 380;
        const scale = 40;
        const centerX = width / 2;
        const centerY = height / 2;

        return criticalPoints.map((cp) => ({
            ...cp,
            px: centerX + cp.x * scale,
            py: centerY - cp.y * scale,
        }));
    }, [criticalPoints]);

    // Convert inflection point to screen coordinates
    const inflectionPointScreen = useMemo(() => {
        if (!inflectionPoint) return null;

        const width = 500;
        const height = 380;
        const scale = 40;
        const centerX = width / 2;
        const centerY = height / 2;

        return {
            ...inflectionPoint,
            px: centerX + inflectionPoint.x * scale,
            py: centerY - inflectionPoint.y * scale,
        };
    }, [inflectionPoint]);

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Instructions */}
            <div className="p-4 border-b">
                <ModuleInstructions
                    title="Как использовать этот модуль"
                    instructions={instructions}
                    defaultExpanded={false}
                />
            </div>

            {/* Main content - two columns */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Graph */}
                <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
                    <div className="w-full max-w-2xl">
                        <svg viewBox="0 0 500 380" className="w-full h-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                            <CoordinateGrid width={500} height={380} scale={40} originX={250} originY={190} gridId="grid-analysis" />

                            {/* Function f(x) - indigo */}
                            <path
                                d={functionPath}
                                fill="none"
                                stroke="#4F46E5"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Derivative f'(x) - emerald, dashed */}
                            <path
                                d={derivativePath}
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="1.5"
                                strokeDasharray="4,4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Critical points - orange */}
                            {criticalPointsScreen.map((cp, i) => (
                                <g key={`cp-${i}`}>
                                    <circle cx={cp.px} cy={cp.py} r="4" fill="#F59E0B" />
                                    <text
                                        x={cp.px}
                                        y={cp.py - 10}
                                        className="text-xs fill-orange-600"
                                        textAnchor="middle"
                                    >
                                        {cp.type === 'max' ? 'max' : 'min'}
                                    </text>
                                </g>
                            ))}

                            {/* Inflection point - purple */}
                            {inflectionPointScreen && (
                                <g>
                                    <circle cx={inflectionPointScreen.px} cy={inflectionPointScreen.py} r="4" fill="#8B5CF6" />
                                    <text
                                        x={inflectionPointScreen.px}
                                        y={inflectionPointScreen.py - 10}
                                        className="text-xs fill-purple-600"
                                        textAnchor="middle"
                                    >
                                        перегиб
                                    </text>
                                </g>
                            )}
                        </svg>
                    </div>
                </div>

                {/* Right: Controls and Analysis */}
                <div className="w-96 border-l bg-white overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Исследование функции</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                y = {a !== 0 && `${a.toFixed(1)}x³`}
                                {b !== 0 && ` ${b >= 0 ? '+' : ''} ${b.toFixed(1)}x²`}
                                {c !== 0 && ` ${c >= 0 ? '+' : ''} ${c.toFixed(1)}x`}
                                {d !== 0 && ` ${d >= 0 ? '+' : ''} ${d.toFixed(1)}`}
                            </p>
                        </div>

                        {/* Parameter sliders */}
                        <div className="space-y-4">
                            {/* a */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">a = {a.toFixed(1)}</label>
                                    <span className="text-gray-500">Коэффициент при x³</span>
                                </div>
                                <input
                                    type="range"
                                    min="-3"
                                    max="3"
                                    step="0.1"
                                    value={a}
                                    onChange={(e) => setA(parseFloat(e.target.value))}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            {/* b */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">b = {b.toFixed(1)}</label>
                                    <span className="text-gray-500">Коэффициент при x²</span>
                                </div>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    value={b}
                                    onChange={(e) => setB(parseFloat(e.target.value))}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            {/* c */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">c = {c.toFixed(1)}</label>
                                    <span className="text-gray-500">Коэффициент при x</span>
                                </div>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    value={c}
                                    onChange={(e) => setC(parseFloat(e.target.value))}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            {/* d */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">d = {d.toFixed(1)}</label>
                                    <span className="text-gray-500">Свободный член</span>
                                </div>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    value={d}
                                    onChange={(e) => setD(parseFloat(e.target.value))}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </div>

                        {/* Analysis Results */}
                        <div className="space-y-4 border-t pt-4">
                            <h4 className="font-semibold text-gray-800">Анализ</h4>

                            {/* Critical points */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Критические точки:</p>
                                {criticalPoints.length === 0 ? (
                                    <p className="text-sm text-gray-500">Нет критических точек</p>
                                ) : (
                                    <div className="space-y-1">
                                        {criticalPoints.map((cp, i) => (
                                            <p key={i} className="text-sm text-gray-600">
                                                x = {cp.x.toFixed(2)}, y = {cp.y.toFixed(2)} ({cp.type === 'max' ? 'максимум' : 'минимум'})
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Inflection point */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Точка перегиба:</p>
                                {inflectionPoint ? (
                                    <p className="text-sm text-gray-600">
                                        x = {inflectionPoint.x.toFixed(2)}, y = {inflectionPoint.y.toFixed(2)}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">Нет точки перегиба</p>
                                )}
                            </div>

                            {/* Monotonicity */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Монотонность:</p>
                                <p className="text-sm text-gray-600">{monotonicity}</p>
                            </div>

                            {/* Convexity */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Выпуклость:</p>
                                <p className="text-sm text-gray-600">{convexity}</p>
                            </div>
                        </div>

                        {/* Reset button */}
                        <button
                            onClick={reset}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            <RotateCcw size={18} />
                            Сброс
                        </button>

                        {/* Legend */}
                        <div className="space-y-2 text-sm border-t pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-indigo-500"></div>
                                <span className="text-gray-600">Функция f(x)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-emerald-500 border-dashed border-t-2 border-emerald-500"></div>
                                <span className="text-gray-600">Производная f'(x)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <span className="text-gray-600">Экстремумы</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span className="text-gray-600">Точка перегиба</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FunctionAnalysis;
