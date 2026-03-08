import React, { useState, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';
import { CoordinateGrid } from './CoordinateGrid';

export const DerivativeExplorer: React.FC = () => {
    const [a, setA] = useState(0.1);
    const [b, setB] = useState(0);
    const [c, setC] = useState(-1);
    const [d, setD] = useState(0);
    const [x0, setX0] = useState(0);
    const [animating, setAnimating] = useState(false);

    const instructions = [
        'Используйте слайдеры a, b, c, d для изменения функции',
        'Синяя кривая — исходная функция f(x)',
        'Оранжевая кривая — производная f\'(x)',
        'Красная линия — касательная в точке x₀',
        'Точки экстремумов отмечены зелёным (max) и красным (min)',
        'Точки перегиба отмечены фиолетовым цветом'
    ];

    const scale = 40;
    const centerX = 200;
    const centerY = 150;

    // Calculate function and derivative
    const f = (x: number) => a * x * x * x + b * x * x + c * x + d;
    const df = (x: number) => 3 * a * x * x + 2 * b * x + c;
    const ddf = (x: number) => 6 * a * x + 2 * b;

    // Find extrema (where f'(x) = 0)
    const extrema = useMemo(() => {
        const points: { x: number; y: number; type: 'max' | 'min' }[] = [];
        if (Math.abs(a) < 0.001) return points;

        const discriminant = 4 * b * b - 12 * a * c;
        if (discriminant >= 0) {
            const x1 = (-2 * b + Math.sqrt(discriminant)) / (6 * a);
            const x2 = (-2 * b - Math.sqrt(discriminant)) / (6 * a);

            if (Math.abs(x1) <= 5) {
                const type = ddf(x1) > 0 ? 'min' : 'max';
                points.push({ x: x1, y: f(x1), type });
            }
            if (Math.abs(x2) <= 5 && Math.abs(x1 - x2) > 0.01) {
                const type = ddf(x2) > 0 ? 'min' : 'max';
                points.push({ x: x2, y: f(x2), type });
            }
        }
        return points;
    }, [a, b, c, d]);

    // Find inflection point (where f''(x) = 0)
    const inflectionPoint = useMemo(() => {
        if (Math.abs(a) < 0.001) return null;
        const x = -b / (3 * a);
        if (Math.abs(x) <= 5) {
            return { x, y: f(x) };
        }
        return null;
    }, [a, b]);

    // Calculate function points
    const functionPoints = useMemo(() => {
        const pts = [];
        for (let x = -5; x <= 5; x += 0.1) {
            const y = f(x);
            const px = centerX + x * scale;
            const py = centerY - y * scale;
            if (py >= -50 && py <= 350) {
                pts.push({ x: px, y: py });
            }
        }
        return pts;
    }, [a, b, c, d]);

    // Calculate derivative points
    const derivativePoints = useMemo(() => {
        const pts = [];
        for (let x = -5; x <= 5; x += 0.1) {
            const y = df(x);
            const px = centerX + x * scale;
            const py = centerY - y * scale;
            if (py >= -50 && py <= 350) {
                pts.push({ x: px, y: py });
            }
        }
        return pts;
    }, [a, b, c]);

    // Tangent line at x0
    const tangentLine = useMemo(() => {
        const y0 = f(x0);
        const slope = df(x0);
        const x1 = x0 - 2;
        const x2 = x0 + 2;
        const y1 = y0 + slope * (x1 - x0);
        const y2 = y0 + slope * (x2 - x0);
        return {
            x1: centerX + x1 * scale,
            y1: centerY - y1 * scale,
            x2: centerX + x2 * scale,
            y2: centerY - y2 * scale,
        };
    }, [a, b, c, d, x0]);

    const pathData = (points: { x: number; y: number }[]) => {
        if (points.length === 0) return '';
        return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    };

    React.useEffect(() => {
        if (!animating) return;
        const interval = setInterval(() => {
            setX0(prev => {
                let next = prev + 0.1;
                if (next > 5) next = -5;
                return Math.round(next * 10) / 10;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [animating]);

    const reset = () => {
        setA(0.1);
        setB(0);
        setC(-1);
        setD(0);
        setX0(0);
        setAnimating(false);
    };

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
                <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
                    <div className="w-full max-w-2xl">
                        <svg viewBox="0 0 400 300" className="w-full h-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                            <CoordinateGrid width={400} height={300} scale={40} originX={200} originY={150} gridId="grid-deriv" />

                            {/* Function curve */}
                            <path d={pathData(functionPoints)} fill="none" stroke="#4F46E5" strokeWidth="3" />

                            {/* Derivative curve */}
                            <path d={pathData(derivativePoints)} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,5" />

                            {/* Tangent line */}
                            <line
                                x1={tangentLine.x1}
                                y1={tangentLine.y1}
                                x2={tangentLine.x2}
                                y2={tangentLine.y2}
                                stroke="#EF4444"
                                strokeWidth="2"
                            />

                            {/* Point at x0 */}
                            <circle cx={centerX + x0 * scale} cy={centerY - f(x0) * scale} r="4" fill="#EF4444" />

                            {/* Extrema */}
                            {extrema.map((pt, i) => (
                                <g key={i}>
                                    <circle
                                        cx={centerX + pt.x * scale}
                                        cy={centerY - pt.y * scale}
                                        r="5"
                                        fill={pt.type === 'max' ? '#10B981' : '#EF4444'}
                                    />
                                    <text
                                        x={centerX + pt.x * scale}
                                        y={centerY - pt.y * scale - 10}
                                        className="text-xs font-medium"
                                        fill={pt.type === 'max' ? '#10B981' : '#EF4444'}
                                        textAnchor="middle"
                                    >
                                        {pt.type}
                                    </text>
                                </g>
                            ))}

                            {/* Inflection point */}
                            {inflectionPoint && (
                                <g>
                                    <circle
                                        cx={centerX + inflectionPoint.x * scale}
                                        cy={centerY - inflectionPoint.y * scale}
                                        r="5"
                                        fill="#9333EA"
                                    />
                                    <text
                                        x={centerX + inflectionPoint.x * scale}
                                        y={centerY - inflectionPoint.y * scale - 10}
                                        className="text-xs font-medium fill-purple-600"
                                        textAnchor="middle"
                                    >
                                        перегиб
                                    </text>
                                </g>
                            )}
                        </svg>
                    </div>
                </div>

                <div className="w-96 border-l bg-white overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Производная</h3>
                            <span className="text-sm text-gray-500">Исследование функции</span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="p-2 bg-indigo-50 rounded">
                                <div className="font-mono text-indigo-800">
                                    f(x) = {a.toFixed(2)}x³ {b >= 0 ? '+' : ''}{b.toFixed(2)}x² {c >= 0 ? '+' : ''}{c.toFixed(2)}x {d >= 0 ? '+' : ''}{d.toFixed(2)}
                                </div>
                            </div>
                            <div className="p-2 bg-amber-50 rounded">
                                <div className="font-mono text-amber-800">
                                    f'(x) = {(3 * a).toFixed(2)}x² {2 * b >= 0 ? '+' : ''}{(2 * b).toFixed(2)}x {c >= 0 ? '+' : ''}{c.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">a = {a.toFixed(2)}</label>
                                <input
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.05"
                                    value={a}
                                    onChange={(e) => setA(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">b = {b.toFixed(2)}</label>
                                <input
                                    type="range"
                                    min="-3"
                                    max="3"
                                    step="0.1"
                                    value={b}
                                    onChange={(e) => setB(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">c = {c.toFixed(2)}</label>
                                <input
                                    type="range"
                                    min="-3"
                                    max="3"
                                    step="0.1"
                                    value={c}
                                    onChange={(e) => setC(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">d = {d.toFixed(2)}</label>
                                <input
                                    type="range"
                                    min="-3"
                                    max="3"
                                    step="0.1"
                                    value={d}
                                    onChange={(e) => setD(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">x₀ = {x0.toFixed(1)}</label>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    value={x0}
                                    onChange={(e) => setX0(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                    disabled={animating}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setAnimating(!animating)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${animating ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'} hover:opacity-80`}
                            >
                                {animating ? <Pause size={18} /> : <Play size={18} />}
                                {animating ? 'Пауза' : 'Анимация'}
                            </button>
                            <button
                                onClick={reset}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                <RotateCcw size={18} />
                                Сброс
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="p-2 bg-gray-50 rounded">
                                <span className="text-gray-600">f(x₀) = </span>
                                <span className="font-medium">{f(x0).toFixed(2)}</span>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <span className="text-gray-600">f'(x₀) = </span>
                                <span className="font-medium">{df(x0).toFixed(2)}</span>
                            </div>
                        </div>

                        {extrema.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700">Экстремумы:</div>
                                {extrema.map((pt, i) => (
                                    <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                                        <span className={pt.type === 'max' ? 'text-green-600' : 'text-red-600'}>
                                            {pt.type === 'max' ? 'Максимум' : 'Минимум'}:
                                        </span>
                                        {' '}({pt.x.toFixed(2)}, {pt.y.toFixed(2)})
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DerivativeExplorer;
