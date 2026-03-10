import React, { useState, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';
import { CoordinateGrid } from './CoordinateGrid';

export const LogarithmicFunction: React.FC = () => {
    const [a, setA] = useState(1);
    const [b, setB] = useState(2);
    const [c, setC] = useState(0);
    const [animating, setAnimating] = useState(false);

    const instructions = [
        'Используйте слайдер a для изменения масштаба функции',
        'Используйте слайдер b для изменения основания логарифма',
        'Используйте слайдер c для вертикального сдвига',
        'Вертикальная асимптота x = 0 показана пунктирной линией',
        'Область определения: x > 0'
    ];

    // Calculate logarithmic points
    const points = useMemo(() => {
        const width = 400;
        const height = 300;
        const scaleX = 40;
        const scaleY = 40;
        const centerX = width / 2;
        const centerY = height / 2;

        const pts = [];
        for (let x = 0.1; x <= 5; x += 0.05) {
            const y = a * (Math.log(x) / Math.log(b)) + c;
            const px = centerX + x * scaleX;
            const py = centerY - y * scaleY;
            if (py >= -50 && py <= 350) {
                pts.push({ x: px, y: py });
            }
        }
        return pts;
    }, [a, b, c]);

    const pathData = useMemo(() => {
        if (points.length === 0) return '';
        return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }, [points]);

    React.useEffect(() => {
        if (!animating) return;

        const interval = setInterval(() => {
            setB(prev => {
                let next = prev + 0.05;
                if (next > 5) next = 1.1;
                if (Math.abs(next - 1) < 0.1) next = 1.1;
                return Math.round(next * 100) / 100;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [animating]);

    const reset = () => {
        setA(1);
        setB(2);
        setC(0);
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
                            <CoordinateGrid width={400} height={300} scale={40} originX={200} originY={150} gridId="grid-log" />

                            {/* Vertical asymptote at x = 0 */}
                            <line
                                x1="200"
                                y1="0"
                                x2="200"
                                y2="300"
                                stroke="#EF4444"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                            />
                            <text x="185" y="20" className="text-xs fill-red-600 font-medium" textAnchor="end">
                                x = 0
                            </text>

                            {/* Shaded region for x < 0 (undefined) */}
                            <rect x="0" y="0" width="200" height="300" fill="#fee2e2" opacity="0.3" />
                            <text x="100" y="150" className="text-sm fill-red-600 font-medium" textAnchor="middle">
                                x ≤ 0
                            </text>

                            <path
                                d={pathData}
                                fill="none"
                                stroke="#4F46E5"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>

                <div className="w-96 border-l bg-white overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Логарифмическая функция</h3>
                            <span className="text-sm text-gray-500">y = a · log<sub>b</sub>(x) + c</span>
                        </div>

                        <div className="text-center py-3 bg-gray-50 rounded-lg">
                            <span className="text-xl font-mono">
                                y = {a.toFixed(1)} · log<sub>{b.toFixed(1)}</sub>(x) {c >= 0 ? '+' : '-'} {Math.abs(Number(c.toFixed(1)))}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">a = {a.toFixed(2)}</label>
                                    <span className="text-gray-500">Множитель</span>
                                </div>
                                <input
                                    type="range"
                                    min="-3"
                                    max="3"
                                    step="0.1"
                                    value={a}
                                    onChange={(e) => setA(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">b = {b.toFixed(2)}</label>
                                    <span className="text-gray-500">Основание (b ≠ 1)</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="5"
                                    step="0.1"
                                    value={b}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (Math.abs(val - 1) > 0.1) setB(val);
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    disabled={animating}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">c = {c.toFixed(2)}</label>
                                    <span className="text-gray-500">Сдвиг по Y</span>
                                </div>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.5"
                                    value={c}
                                    onChange={(e) => setC(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
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
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-gray-50 rounded">
                                <span className="text-gray-500">Асимптота: </span>
                                <span className="font-medium">x = 0</span>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                                <span className="text-gray-500">Область опр.: </span>
                                <span className="font-medium">x &gt; 0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogarithmicFunction;
