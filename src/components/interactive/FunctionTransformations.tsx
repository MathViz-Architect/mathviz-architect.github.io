import React, { useState, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';
import { CoordinateGrid } from './CoordinateGrid';

type BaseFunction = 'x2' | 'x3' | 'sin' | 'cos' | 'abs' | 'sqrt';

interface BaseFunctionDef {
    id: BaseFunction;
    label: string;
    fn: (x: number) => number;
}

const baseFunctions: BaseFunctionDef[] = [
    { id: 'x2', label: 'x² (парабола)', fn: (x) => x * x },
    { id: 'x3', label: 'x³ (кубическая)', fn: (x) => x * x * x },
    { id: 'sin', label: 'sin(x)', fn: (x) => Math.sin(x) },
    { id: 'cos', label: 'cos(x)', fn: (x) => Math.cos(x) },
    { id: 'abs', label: '|x| (модуль)', fn: (x) => Math.abs(x) },
    { id: 'sqrt', label: '√x (корень)', fn: (x) => (x >= 0 ? Math.sqrt(x) : NaN) },
];

export const FunctionTransformations: React.FC = () => {
    const [baseFunc, setBaseFunc] = useState<BaseFunction>('x2');
    const [c, setC] = useState(0); // vertical shift
    const [a, setA] = useState(0); // horizontal shift
    const [k, setK] = useState(1); // vertical stretch
    const [d, setD] = useState(1); // horizontal stretch

    const instructions = [
        'Выберите базовую функцию из выпадающего списка',
        'Серый пунктирный график — исходная функция f(x)',
        'Синий график — преобразованная функция y = k·f(d·x - a) + c',
        'c — вертикальный сдвиг (вверх/вниз)',
        'a — горизонтальный сдвиг (влево/вправо)',
        'k — вертикальное растяжение/сжатие',
        'd — горизонтальное растяжение/сжатие',
    ];

    const selectedFunc = baseFunctions.find((f) => f.id === baseFunc)!;

    // Calculate original function points
    const originalPoints = useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        const width = 400;
        const height = 300;
        const scaleX = 40;
        const scaleY = 40;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let x = -10; x <= 10; x += 0.05) {
            const y = selectedFunc.fn(x);
            if (isNaN(y) || !isFinite(y) || Math.abs(y) > 15) continue;

            const px = centerX + x * scaleX;
            const py = centerY - y * scaleY;
            pts.push({ x: px, y: py });
        }
        return pts;
    }, [baseFunc]);

    // Calculate transformed function points: y = k * f(d*x - a) + c
    const transformedPoints = useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        const width = 400;
        const height = 300;
        const scaleX = 40;
        const scaleY = 40;
        const centerX = width / 2;
        const centerY = height / 2;

        for (let x = -10; x <= 10; x += 0.05) {
            const y = k * selectedFunc.fn(d * x - a) + c;
            if (isNaN(y) || !isFinite(y) || Math.abs(y) > 15) continue;

            const px = centerX + x * scaleX;
            const py = centerY - y * scaleY;
            pts.push({ x: px, y: py });
        }
        return pts;
    }, [baseFunc, c, a, k, d]);

    // Generate path for original function
    const originalPath = useMemo(() => {
        if (originalPoints.length === 0) return '';
        return originalPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }, [originalPoints]);

    // Generate path for transformed function
    const transformedPath = useMemo(() => {
        if (transformedPoints.length === 0) return '';
        return transformedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }, [transformedPoints]);

    const reset = () => {
        setC(0);
        setA(0);
        setK(1);
        setD(1);
    };

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
                <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
                    <div className="w-full max-w-2xl">
                        <svg viewBox="0 0 400 300" className="w-full h-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                            <CoordinateGrid width={400} height={300} scale={40} originX={200} originY={150} gridId="grid-transform" />

                            {/* Original function (grey, dashed) */}
                            <path
                                d={originalPath}
                                fill="none"
                                stroke="#9CA3AF"
                                strokeWidth="1.5"
                                strokeDasharray="4,4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Transformed function (indigo, solid) */}
                            <path
                                d={transformedPath}
                                fill="none"
                                stroke="#4F46E5"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="w-80 border-l bg-white overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Преобразования функций</h3>
                            <p className="text-sm text-gray-500 mt-1">y = k·f(d·x - a) + c</p>
                        </div>

                        {/* Base function selector */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Базовая функция f(x)</label>
                            <select
                                value={baseFunc}
                                onChange={(e) => setBaseFunc(e.target.value as BaseFunction)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {baseFunctions.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Combined formula display */}
                        <div className="text-center py-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-mono text-gray-700">
                                y = {k !== 1 ? `${k.toFixed(1)}·` : ''}f(
                                {d !== 1 ? `${d.toFixed(1)}·` : ''}x
                                {a !== 0 ? ` ${a >= 0 ? '-' : '+'} ${Math.abs(a).toFixed(1)}` : ''}
                                ){c !== 0 ? ` ${c >= 0 ? '+' : '-'} ${Math.abs(c).toFixed(1)}` : ''}
                            </span>
                        </div>

                        {/* Transformations */}
                        <div className="space-y-4">
                            {/* Vertical shift (c) */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">c = {c.toFixed(1)}</label>
                                    <span className="text-gray-500">Вертикальный сдвиг</span>
                                </div>
                                <p className="text-xs text-gray-500">f(x) + c</p>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.5"
                                    value={c}
                                    onChange={(e) => setC(parseFloat(e.target.value))}
                                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            {/* Horizontal shift (a) */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">a = {a.toFixed(1)}</label>
                                    <span className="text-gray-500">Горизонтальный сдвиг</span>
                                </div>
                                <p className="text-xs text-gray-500">f(x - a)</p>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.5"
                                    value={a}
                                    onChange={(e) => setA(parseFloat(e.target.value))}
                                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            {/* Vertical stretch (k) */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">k = {k.toFixed(1)}</label>
                                    <span className="text-gray-500">Вертикальное растяжение</span>
                                </div>
                                <p className="text-xs text-gray-500">k · f(x)</p>
                                <input
                                    type="range"
                                    min="-3"
                                    max="3"
                                    step="0.1"
                                    value={k}
                                    onChange={(e) => setK(parseFloat(e.target.value))}
                                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            {/* Horizontal stretch (d) */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="font-medium text-gray-700">d = {d.toFixed(1)}</label>
                                    <span className="text-gray-500">Горизонтальное растяжение</span>
                                </div>
                                <p className="text-xs text-gray-500">f(d · x)</p>
                                <input
                                    type="range"
                                    min="-3"
                                    max="3"
                                    step="0.1"
                                    value={d}
                                    onChange={(e) => setD(parseFloat(e.target.value))}
                                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
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
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-gray-400 border-dashed border-t-2 border-gray-400"></div>
                                <span className="text-gray-600">Исходная функция f(x)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-indigo-500"></div>
                                <span className="text-gray-600">Преобразованная функция</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FunctionTransformations;
