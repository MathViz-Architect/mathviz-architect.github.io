import React, { useState, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { CoordinateGrid } from './CoordinateGrid';
import { ModuleInstructions } from './ModuleInstructions';

type FunctionType = 'linear' | 'quadratic' | 'sin' | 'cos';

interface FunctionParams {
    type: FunctionType;
    // Linear: y = kx + b
    k?: number;
    b?: number;
    // Quadratic: y = ax² + bx + c
    a?: number;
    bQuad?: number;
    c?: number;
    // Trig: y = A·sin(x) or y = A·cos(x)
    amplitude?: number;
}

export const FunctionIntersections: React.FC = () => {
    const [func1, setFunc1] = useState<FunctionParams>({
        type: 'linear',
        k: 1,
        b: 0
    });

    const [func2, setFunc2] = useState<FunctionParams>({
        type: 'quadratic',
        a: 0.5,
        bQuad: 0,
        c: -2
    });

    const instructions = [
        'Выберите тип функции для каждого графика',
        'Настройте параметры функций с помощью слайдеров',
        'Точки пересечения отмечены красными кружками',
        'Координаты точек пересечения показаны в панели справа',
        'Используйте для изучения систем уравнений'
    ];

    const width = 800;
    const height = 600;
    const originX = width / 2;
    const originY = height / 2;
    const scale = 40;

    // Calculate function value
    const calculateY = (x: number, params: FunctionParams): number => {
        switch (params.type) {
            case 'linear':
                return (params.k || 0) * x + (params.b || 0);
            case 'quadratic':
                return (params.a || 0) * x * x + (params.bQuad || 0) * x + (params.c || 0);
            case 'sin':
                return (params.amplitude || 1) * Math.sin(x);
            case 'cos':
                return (params.amplitude || 1) * Math.cos(x);
            default:
                return 0;
        }
    };

    // Generate function points
    const generatePoints = (params: FunctionParams, samples = 200) => {
        const points: { x: number; y: number }[] = [];
        const xMin = -originX / scale;
        const xMax = (width - originX) / scale;
        const step = (xMax - xMin) / samples;

        for (let i = 0; i <= samples; i++) {
            const x = xMin + i * step;
            const y = calculateY(x, params);

            points.push({
                x: originX + x * scale,
                y: originY - y * scale
            });
        }

        return points;
    };

    // Find intersections
    const findIntersections = useMemo(() => {
        const intersections: { x: number; y: number }[] = [];
        const xMin = -originX / scale;
        const xMax = (width - originX) / scale;
        const step = 0.1;

        let prevDiff = calculateY(xMin, func1) - calculateY(xMin, func2);

        for (let x = xMin + step; x <= xMax; x += step) {
            const y1 = calculateY(x, func1);
            const y2 = calculateY(x, func2);
            const diff = y1 - y2;

            // Sign change indicates intersection
            if (prevDiff * diff < 0) {
                // Refine with binary search
                let left = x - step;
                let right = x;
                for (let i = 0; i < 10; i++) {
                    const mid = (left + right) / 2;
                    const midDiff = calculateY(mid, func1) - calculateY(mid, func2);
                    if (midDiff * prevDiff < 0) {
                        right = mid;
                    } else {
                        left = mid;
                    }
                }
                const intersectX = (left + right) / 2;
                const intersectY = calculateY(intersectX, func1);
                intersections.push({ x: intersectX, y: intersectY });
            }

            prevDiff = diff;
        }

        return intersections;
    }, [func1, func2]);

    const reset = () => {
        setFunc1({ type: 'linear', k: 1, b: 0 });
        setFunc2({ type: 'quadratic', a: 0.5, bQuad: 0, c: -2 });
    };

    const renderFunctionControls = (
        params: FunctionParams,
        setParams: React.Dispatch<React.SetStateAction<FunctionParams>>,
        label: string,
        color: string
    ) => (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800">{label}</h4>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Тип функции</label>
                <select
                    value={params.type}
                    onChange={(e) => {
                        const type = e.target.value as FunctionType;
                        if (type === 'linear') {
                            setParams({ type, k: 1, b: 0 });
                        } else if (type === 'quadratic') {
                            setParams({ type, a: 0.5, bQuad: 0, c: -2 });
                        } else {
                            setParams({ type, amplitude: 1 });
                        }
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                >
                    <option value="linear">Линейная (y = kx + b)</option>
                    <option value="quadratic">Квадратичная (y = ax² + bx + c)</option>
                    <option value="sin">Синус (y = A·sin(x))</option>
                    <option value="cos">Косинус (y = A·cos(x))</option>
                </select>
            </div>

            {params.type === 'linear' && (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">k = {params.k?.toFixed(1)}</label>
                        <input
                            type="range"
                            min="-3"
                            max="3"
                            step="0.1"
                            value={params.k || 0}
                            onChange={(e) => setParams({ ...params, k: parseFloat(e.target.value) })}
                            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${color}-600`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">b = {params.b?.toFixed(1)}</label>
                        <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.1"
                            value={params.b || 0}
                            onChange={(e) => setParams({ ...params, b: parseFloat(e.target.value) })}
                            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${color}-600`}
                        />
                    </div>
                </>
            )}

            {params.type === 'quadratic' && (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">a = {params.a?.toFixed(2)}</label>
                        <input
                            type="range"
                            min="-2"
                            max="2"
                            step="0.1"
                            value={params.a || 0}
                            onChange={(e) => setParams({ ...params, a: parseFloat(e.target.value) })}
                            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${color}-600`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">b = {params.bQuad?.toFixed(1)}</label>
                        <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.1"
                            value={params.bQuad || 0}
                            onChange={(e) => setParams({ ...params, bQuad: parseFloat(e.target.value) })}
                            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${color}-600`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">c = {params.c?.toFixed(1)}</label>
                        <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.1"
                            value={params.c || 0}
                            onChange={(e) => setParams({ ...params, c: parseFloat(e.target.value) })}
                            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${color}-600`}
                        />
                    </div>
                </>
            )}

            {(params.type === 'sin' || params.type === 'cos') && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">A = {params.amplitude?.toFixed(1)}</label>
                    <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={params.amplitude || 1}
                        onChange={(e) => setParams({ ...params, amplitude: parseFloat(e.target.value) })}
                        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${color}-600`}
                    />
                </div>
            )}
        </div>
    );

    const points1 = generatePoints(func1);
    const points2 = generatePoints(func2);
    const pathData1 = points1.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const pathData2 = points2.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

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

                        {/* Function 1 */}
                        <path d={pathData1} stroke="#3b82f6" strokeWidth="2" fill="none" />

                        {/* Function 2 */}
                        <path d={pathData2} stroke="#10b981" strokeWidth="2" fill="none" />

                        {/* Intersections */}
                        {findIntersections.map((point, i) => (
                            <g key={i}>
                                <circle
                                    cx={originX + point.x * scale}
                                    cy={originY - point.y * scale}
                                    r="6"
                                    fill="#ef4444"
                                    stroke="#991b1b"
                                    strokeWidth="2"
                                />
                                <text
                                    x={originX + point.x * scale + 10}
                                    y={originY - point.y * scale - 10}
                                    className="text-xs fill-red-600 font-medium"
                                >
                                    ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                <div className="w-96 border-l bg-white overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Пересечения функций</h3>
                            <span className="text-sm text-gray-500">Решение систем уравнений</span>
                        </div>

                        {renderFunctionControls(func1, setFunc1, 'Функция 1 (синяя)', 'blue')}
                        {renderFunctionControls(func2, setFunc2, 'Функция 2 (зелёная)', 'green')}

                        <div className="p-4 bg-red-50 rounded-lg space-y-2">
                            <div className="font-medium text-red-700">
                                Точки пересечения: {findIntersections.length}
                            </div>
                            {findIntersections.length === 0 ? (
                                <div className="text-sm text-gray-600">Функции не пересекаются</div>
                            ) : (
                                <div className="space-y-2">
                                    {findIntersections.map((point, i) => (
                                        <div key={i} className="text-sm">
                                            Точка {i + 1}: ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                                        </div>
                                    ))}
                                </div>
                            )}
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

export default FunctionIntersections;
