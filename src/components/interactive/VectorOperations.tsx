import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';
import { CoordinateGrid } from './CoordinateGrid';

export const VectorOperations: React.FC = () => {
    const [v1x, setV1x] = useState(3);
    const [v1y, setV1y] = useState(2);
    const [v2x, setV2x] = useState(1);
    const [v2y, setV2y] = useState(3);
    const [showSum, setShowSum] = useState(true);
    const [showDiff, setShowDiff] = useState(false);
    const [showParallelogram, setShowParallelogram] = useState(true);

    const instructions = [
        'Используйте слайдеры для изменения компонент векторов',
        'Вектор a показан синим цветом, вектор b — зелёным',
        'Сумма векторов (a + b) показана красным цветом',
        'Разность векторов (a - b) показана оранжевым цветом',
        'Правило параллелограмма визуализирует сложение векторов'
    ];

    const scale = 30;
    const centerX = 200;
    const centerY = 150;

    // Calculate results
    const sumX = v1x + v2x;
    const sumY = v1y + v2y;
    const diffX = v1x - v2x;
    const diffY = v1y - v2y;
    const dotProduct = v1x * v2x + v1y * v2y;
    const magnitude1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const magnitude2 = Math.sqrt(v2x * v2x + v2y * v2y);

    // Calculate angle between vectors
    const cosAngle = magnitude1 > 0 && magnitude2 > 0 ? dotProduct / (magnitude1 * magnitude2) : 0;
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle))); // Clamp to [-1, 1] for numerical stability
    const angleDeg = (angleRad * 180 / Math.PI).toFixed(1);

    // Calculate angles for each vector (for arc drawing)
    const angle1 = Math.atan2(v1y, v1x);
    const angle2 = Math.atan2(v2y, v2x);

    // Determine arc direction - always draw the shorter arc
    let startAngle = angle1;
    let endAngle = angle2;
    let angleDiff = endAngle - startAngle;

    // Normalize angle difference to [-π, π]
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    // If the arc would be > 180°, swap direction
    const sweepFlag = angleDiff > 0 ? 0 : 1;
    const largeArcFlag = 0; // Always use small arc since angleRad is always ≤ π

    const reset = () => {
        setV1x(3);
        setV1y(2);
        setV2x(1);
        setV2y(3);
        setShowSum(true);
        setShowDiff(false);
        setShowParallelogram(true);
    };

    const Arrow = ({ x1, y1, x2, y2, color, label }: any) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const angle = Math.atan2(dy, dx);
        const arrowSize = 8;

        return (
            <g>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" />
                <polygon
                    points={`${x2},${y2} ${x2 - arrowSize * Math.cos(angle - Math.PI / 6)},${y2 - arrowSize * Math.sin(angle - Math.PI / 6)} ${x2 - arrowSize * Math.cos(angle + Math.PI / 6)},${y2 - arrowSize * Math.sin(angle + Math.PI / 6)}`}
                    fill={color}
                />
                {label && (
                    <text x={(x1 + x2) / 2 + 10} y={(y1 + y2) / 2 - 10} className="text-sm font-medium" fill={color}>
                        {label}
                    </text>
                )}
            </g>
        );
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
                            <CoordinateGrid width={400} height={300} scale={30} originX={200} originY={150} gridId="grid-vec" />

                            {/* Parallelogram for sum */}
                            {showSum && showParallelogram && (
                                <g opacity="0.3">
                                    {/* Line from end of vector a, parallel to vector b */}
                                    <line
                                        x1={centerX + v1x * scale}
                                        y1={centerY - v1y * scale}
                                        x2={centerX + v1x * scale + v2x * scale}
                                        y2={centerY - v1y * scale - v2y * scale}
                                        stroke="#10B981"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                    />
                                    {/* Line from end of vector b, parallel to vector a */}
                                    <line
                                        x1={centerX + v2x * scale}
                                        y1={centerY - v2y * scale}
                                        x2={centerX + v2x * scale + v1x * scale}
                                        y2={centerY - v2y * scale - v1y * scale}
                                        stroke="#4F46E5"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                    />
                                </g>
                            )}

                            {/* Vector 1 (a) */}
                            <Arrow
                                x1={centerX}
                                y1={centerY}
                                x2={centerX + v1x * scale}
                                y2={centerY - v1y * scale}
                                color="#4F46E5"
                                label="a"
                            />

                            {/* Vector 2 (b) */}
                            <Arrow
                                x1={centerX}
                                y1={centerY}
                                x2={centerX + v2x * scale}
                                y2={centerY - v2y * scale}
                                color="#10B981"
                                label="b"
                            />

                            {/* Sum vector (a + b) */}
                            {showSum && (
                                <Arrow
                                    x1={centerX}
                                    y1={centerY}
                                    x2={centerX + sumX * scale}
                                    y2={centerY - sumY * scale}
                                    color="#EF4444"
                                    label="a + b"
                                />
                            )}

                            {/* Difference vector (a - b) */}
                            {showDiff && (
                                <Arrow
                                    x1={centerX}
                                    y1={centerY}
                                    x2={centerX + diffX * scale}
                                    y2={centerY - diffY * scale}
                                    color="#F59E0B"
                                    label="a - b"
                                />
                            )}

                            {/* Angle arc between vectors */}
                            {magnitude1 > 0 && magnitude2 > 0 && (
                                <g>
                                    <path
                                        d={`M ${centerX + 30 * Math.cos(startAngle)} ${centerY - 30 * Math.sin(startAngle)} A 30 30 0 ${largeArcFlag} ${sweepFlag} ${centerX + 30 * Math.cos(endAngle)} ${centerY - 30 * Math.sin(endAngle)}`}
                                        fill="none"
                                        stroke="#9333EA"
                                        strokeWidth="2"
                                        strokeDasharray="3,3"
                                    />
                                    <text
                                        x={centerX + 45 * Math.cos((startAngle + endAngle) / 2)}
                                        y={centerY - 45 * Math.sin((startAngle + endAngle) / 2)}
                                        className="text-xs fill-purple-600 font-medium"
                                        textAnchor="middle"
                                    >
                                        θ = {angleDeg}°
                                    </text>
                                </g>
                            )}
                        </svg>
                    </div>
                </div>

                <div className="w-96 border-l bg-white overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Векторы</h3>
                            <span className="text-sm text-gray-500">Операции с векторами на плоскости</span>
                        </div>

                        {/* Vector 1 */}
                        <div className="space-y-3 p-3 bg-indigo-50 rounded-lg">
                            <div className="font-medium text-indigo-800">Вектор a = ({v1x}, {v1y})</div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="text-indigo-700">x = {v1x}</label>
                                </div>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="1"
                                    value={v1x}
                                    onChange={(e) => setV1x(parseInt(e.target.value))}
                                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="text-indigo-700">y = {v1y}</label>
                                </div>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="1"
                                    value={v1y}
                                    onChange={(e) => setV1y(parseInt(e.target.value))}
                                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                            <div className="text-sm text-indigo-600">
                                Длина: |a| = {magnitude1.toFixed(2)}
                            </div>
                        </div>

                        {/* Vector 2 */}
                        <div className="space-y-3 p-3 bg-green-50 rounded-lg">
                            <div className="font-medium text-green-800">Вектор b = ({v2x}, {v2y})</div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="text-green-700">x = {v2x}</label>
                                </div>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="1"
                                    value={v2x}
                                    onChange={(e) => setV2x(parseInt(e.target.value))}
                                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <label className="text-green-700">y = {v2y}</label>
                                </div>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="1"
                                    value={v2y}
                                    onChange={(e) => setV2y(parseInt(e.target.value))}
                                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                            </div>
                            <div className="text-sm text-green-600">
                                Длина: |b| = {magnitude2.toFixed(2)}
                            </div>
                        </div>

                        {/* Display options */}
                        <div className="space-y-2">
                            <div className="font-medium text-gray-700 mb-2">Показать:</div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={showSum}
                                    onChange={(e) => setShowSum(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-700">Сумма (a + b)</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={showDiff}
                                    onChange={(e) => setShowDiff(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-700">Разность (a - b)</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={showParallelogram}
                                    onChange={(e) => setShowParallelogram(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-700">Параллелограмм</span>
                            </label>
                        </div>

                        {/* Results */}
                        <div className="space-y-2">
                            <div className="p-3 bg-red-50 rounded-lg">
                                <div className="text-sm text-red-600 font-medium">Сумма:</div>
                                <div className="text-red-800">a + b = ({sumX}, {sumY})</div>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <div className="text-sm text-amber-600 font-medium">Разность:</div>
                                <div className="text-amber-800">a - b = ({diffX}, {diffY})</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="text-sm text-purple-600 font-medium">Скалярное произведение:</div>
                                <div className="text-purple-800">a · b = {dotProduct}</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="text-sm text-purple-600 font-medium">Угол между векторами:</div>
                                <div className="text-purple-800">θ = {angleDeg}°</div>
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

export default VectorOperations;
