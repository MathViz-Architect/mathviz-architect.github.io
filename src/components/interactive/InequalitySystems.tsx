import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { CoordinateGrid } from './CoordinateGrid';
import { ModuleInstructions } from './ModuleInstructions';

type InequalitySign = '>' | '<' | '>=' | '<=';

export const InequalitySystems: React.FC = () => {
    const [a1, setA1] = useState(1);
    const [b1, setB1] = useState(2);
    const [sign1, setSign1] = useState<InequalitySign>('>');

    const [a2, setA2] = useState(-1);
    const [b2, setB2] = useState(3);
    const [sign2, setSign2] = useState<InequalitySign>('<');

    const instructions = [
        'Настройте параметры двух линейных неравенств',
        'Измените коэффициенты a и b для каждой прямой',
        'Выберите знак неравенства (>, <, ≥, ≤)',
        'Синяя область — первое неравенство',
        'Зелёная область — второе неравенство',
        'Тёмная область — пересечение (решение системы)'
    ];

    const reset = () => {
        setA1(1);
        setB1(2);
        setSign1('>');
        setA2(-1);
        setB2(3);
        setSign2('<');
    };

    const width = 800;
    const height = 600;
    const originX = width / 2;
    const originY = height / 2;
    const scale = 50;

    // Check if point satisfies inequality
    const satisfiesInequality = (x: number, y: number, a: number, b: number, sign: InequalitySign): boolean => {
        const lineY = a * x + b;
        switch (sign) {
            case '>': return y > lineY;
            case '<': return y < lineY;
            case '>=': return y >= lineY;
            case '<=': return y <= lineY;
        }
    };

    // Generate line points
    const generateLine = (a: number, b: number) => {
        const xMin = -originX / scale;
        const xMax = (width - originX) / scale;

        const x1 = xMin;
        const y1 = a * x1 + b;
        const x2 = xMax;
        const y2 = a * x2 + b;

        return {
            x1: originX + x1 * scale,
            y1: originY - y1 * scale,
            x2: originX + x2 * scale,
            y2: originY - y2 * scale
        };
    };

    // Generate shaded region for inequality
    const generateShadedRegion = (a: number, b: number, sign: InequalitySign): string => {
        const xMin = -originX / scale;
        const xMax = (width - originX) / scale;
        const yMin = -originY / scale;
        const yMax = (height - originY) / scale;

        const y1 = a * xMin + b;
        const y2 = a * xMax + b;

        let points: string;

        if (sign === '>' || sign === '>=') {
            // Shade above the line
            points = `
                ${originX + xMin * scale},${originY - y1 * scale}
                ${originX + xMax * scale},${originY - y2 * scale}
                ${originX + xMax * scale},${originY - yMax * scale}
                ${originX + xMin * scale},${originY - yMax * scale}
            `;
        } else {
            // Shade below the line
            points = `
                ${originX + xMin * scale},${originY - y1 * scale}
                ${originX + xMax * scale},${originY - y2 * scale}
                ${originX + xMax * scale},${originY - yMin * scale}
                ${originX + xMin * scale},${originY - yMin * scale}
            `;
        }

        return points;
    };

    const line1 = generateLine(a1, b1);
    const line2 = generateLine(a2, b2);

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
                        <defs>
                            <clipPath id="canvas-clip">
                                <rect x="0" y="0" width={width} height={height} />
                            </clipPath>
                        </defs>

                        <CoordinateGrid
                            width={width}
                            height={height}
                            originX={originX}
                            originY={originY}
                            scale={scale}
                        />

                        {/* Shaded regions */}
                        <g clipPath="url(#canvas-clip)">
                            {/* First inequality region */}
                            <polygon
                                points={generateShadedRegion(a1, b1, sign1)}
                                fill="#3b82f6"
                                opacity="0.2"
                            />

                            {/* Second inequality region */}
                            <polygon
                                points={generateShadedRegion(a2, b2, sign2)}
                                fill="#10b981"
                                opacity="0.2"
                            />
                        </g>

                        {/* Intersection region using mask */}
                        <defs>
                            <mask id="intersection-mask">
                                <rect x="0" y="0" width={width} height={height} fill="white" />
                                <polygon
                                    points={generateShadedRegion(a1, b1, sign1)}
                                    fill="black"
                                />
                            </mask>
                        </defs>
                        <g clipPath="url(#canvas-clip)" mask="url(#intersection-mask)">
                            <polygon
                                points={generateShadedRegion(a2, b2, sign2)}
                                fill="#6366f1"
                                opacity="0.3"
                            />
                        </g>

                        {/* Lines */}
                        <line
                            x1={line1.x1}
                            y1={line1.y1}
                            x2={line1.x2}
                            y2={line1.y2}
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray={sign1.includes('=') ? '0' : '8,4'}
                        />
                        <line
                            x1={line2.x1}
                            y1={line2.y1}
                            x2={line2.x2}
                            y2={line2.y2}
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeDasharray={sign2.includes('=') ? '0' : '8,4'}
                        />

                        {/* Labels */}
                        <text
                            x={line1.x2 - 40}
                            y={line1.y2 - 10}
                            className="text-sm fill-blue-600 font-medium"
                        >
                            y {sign1} {a1}x + {b1}
                        </text>
                        <text
                            x={line2.x2 - 40}
                            y={line2.y2 + 20}
                            className="text-sm fill-green-600 font-medium"
                        >
                            y {sign2} {a2}x + {b2}
                        </text>
                    </svg>
                </div>

                <div className="w-96 border-l bg-white overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Системы неравенств</h3>
                            <span className="text-sm text-gray-500">y {sign1} a₁x + b₁ и y {sign2} a₂x + b₂</span>
                        </div>

                        {/* First inequality */}
                        <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                            <h4 className="font-medium text-blue-800">Первое неравенство</h4>
                            <div className="text-sm font-mono text-blue-700 bg-white px-3 py-2 rounded">
                                y {sign1} {a1.toFixed(1)}x + {b1.toFixed(1)}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Знак неравенства</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['>', '<', '>=', '<='] as InequalitySign[]).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSign1(s)}
                                            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${sign1 === s
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-blue-100'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Коэффициент a₁ = {a1.toFixed(1)}
                                </label>
                                <input
                                    type="range"
                                    min="-3"
                                    max="3"
                                    step="0.1"
                                    value={a1}
                                    onChange={(e) => setA1(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Свободный член b₁ = {b1.toFixed(1)}
                                </label>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    value={b1}
                                    onChange={(e) => setB1(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        </div>

                        {/* Second inequality */}
                        <div className="p-4 bg-green-50 rounded-lg space-y-4">
                            <h4 className="font-medium text-green-800">Второе неравенство</h4>
                            <div className="text-sm font-mono text-green-700 bg-white px-3 py-2 rounded">
                                y {sign2} {a2.toFixed(1)}x + {b2.toFixed(1)}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Знак неравенства</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['>', '<', '>=', '<='] as InequalitySign[]).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSign2(s)}
                                            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${sign2 === s
                                                ? 'bg-green-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-green-100'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Коэффициент a₂ = {a2.toFixed(1)}
                                </label>
                                <input
                                    type="range"
                                    min="-3"
                                    max="3"
                                    step="0.1"
                                    value={a2}
                                    onChange={(e) => setA2(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Свободный член b₂ = {b2.toFixed(1)}
                                </label>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    value={b2}
                                    onChange={(e) => setB2(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                            <div className="font-medium text-gray-700">Обозначения:</div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-400 opacity-40"></div>
                                <span>Область первого неравенства</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-400 opacity-40"></div>
                                <span>Область второго неравенства</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-indigo-500 opacity-60"></div>
                                <span>Решение системы (пересечение)</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                                Пунктирная линия — строгое неравенство (&gt; или &lt;)<br />
                                Сплошная линия — нестрогое неравенство (≥ или ≤)
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

export default InequalitySystems;
