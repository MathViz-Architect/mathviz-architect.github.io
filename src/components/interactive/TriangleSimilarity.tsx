import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';

export const TriangleSimilarity: React.FC = () => {
    const [sideA, setSideA] = useState(100);
    const [sideB, setSideB] = useState(120);
    const [sideC, setSideC] = useState(80);
    const [similarityRatio, setSimilarityRatio] = useState(1.5);

    const instructions = [
        'Измените стороны исходного треугольника',
        'Настройте коэффициент подобия k',
        'Наблюдайте, как изменяется подобный треугольник',
        'Углы подобных треугольников равны',
        'Стороны подобных треугольников пропорциональны'
    ];

    const reset = () => {
        setSideA(100);
        setSideB(120);
        setSideC(80);
        setSimilarityRatio(1.5);
    };

    const width = 800;
    const height = 600;

    // Calculate triangle vertices in local coordinates (unscaled)
    // Using cosine rule: c² = a² + b² - 2ab*cos(C)
    const cosC = (sideA * sideA + sideB * sideB - sideC * sideC) / (2 * sideA * sideB);
    const angleC = Math.acos(Math.max(-1, Math.min(1, cosC)));

    // First triangle vertices (local coordinates)
    const t1_local = {
        x1: 0,
        y1: 0,
        x2: sideC,
        y2: 0,
        x3: sideB * Math.cos(angleC),
        y3: -sideB * Math.sin(angleC)
    };

    // Second triangle vertices (local coordinates, scaled)
    const t2_local = {
        x1: 0,
        y1: 0,
        x2: sideC * similarityRatio,
        y2: 0,
        x3: sideB * similarityRatio * Math.cos(angleC),
        y3: -sideB * similarityRatio * Math.sin(angleC)
    };

    // Calculate bounding boxes
    const t1_minX = Math.min(t1_local.x1, t1_local.x2, t1_local.x3);
    const t1_maxX = Math.max(t1_local.x1, t1_local.x2, t1_local.x3);
    const t1_minY = Math.min(t1_local.y1, t1_local.y2, t1_local.y3);
    const t1_maxY = Math.max(t1_local.y1, t1_local.y2, t1_local.y3);

    const t2_minX = Math.min(t2_local.x1, t2_local.x2, t2_local.x3);
    const t2_maxX = Math.max(t2_local.x1, t2_local.x2, t2_local.x3);
    const t2_minY = Math.min(t2_local.y1, t2_local.y2, t2_local.y3);
    const t2_maxY = Math.max(t2_local.y1, t2_local.y2, t2_local.y3);

    const t1_width = t1_maxX - t1_minX;
    const t1_height = t1_maxY - t1_minY;
    const t2_width = t2_maxX - t2_minX;
    const t2_height = t2_maxY - t2_minY;

    // Calculate scale to fit both triangles in their halves with padding
    const padding = 80;
    const halfWidth = width / 2;
    const availableWidth = halfWidth - 2 * padding;
    const availableHeight = height - 2 * padding - 100; // Extra space for labels

    const scale1 = Math.min(availableWidth / t1_width, availableHeight / t1_height);
    const scale2 = Math.min(availableWidth / t2_width, availableHeight / t2_height);
    const scale = Math.min(scale1, scale2);

    // Center triangles in their halves
    const t1_centerX = halfWidth / 2;
    const t1_centerY = height / 2 + 30;
    const t2_centerX = halfWidth + halfWidth / 2;
    const t2_centerY = height / 2 + 30;

    // Apply scale and centering to first triangle
    const t1X1 = t1_centerX + (t1_local.x1 - (t1_minX + t1_maxX) / 2) * scale;
    const t1Y1 = t1_centerY + (t1_local.y1 - (t1_minY + t1_maxY) / 2) * scale;
    const t1X2 = t1_centerX + (t1_local.x2 - (t1_minX + t1_maxX) / 2) * scale;
    const t1Y2 = t1_centerY + (t1_local.y2 - (t1_minY + t1_maxY) / 2) * scale;
    const t1X3 = t1_centerX + (t1_local.x3 - (t1_minX + t1_maxX) / 2) * scale;
    const t1Y3 = t1_centerY + (t1_local.y3 - (t1_minY + t1_maxY) / 2) * scale;

    // Apply scale and centering to second triangle
    const t2X1 = t2_centerX + (t2_local.x1 - (t2_minX + t2_maxX) / 2) * scale;
    const t2Y1 = t2_centerY + (t2_local.y1 - (t2_minY + t2_maxY) / 2) * scale;
    const t2X2 = t2_centerX + (t2_local.x2 - (t2_minX + t2_maxX) / 2) * scale;
    const t2Y2 = t2_centerY + (t2_local.y2 - (t2_minY + t2_maxY) / 2) * scale;
    const t2X3 = t2_centerX + (t2_local.x3 - (t2_minX + t2_maxX) / 2) * scale;
    const t2Y3 = t2_centerY + (t2_local.y3 - (t2_minY + t2_maxY) / 2) * scale;

    // Calculate angles
    const cosA = (sideB * sideB + sideC * sideC - sideA * sideA) / (2 * sideB * sideC);
    const angleA = Math.acos(Math.max(-1, Math.min(1, cosA))) * (180 / Math.PI);

    const cosB = (sideA * sideA + sideC * sideC - sideB * sideB) / (2 * sideA * sideC);
    const angleB = Math.acos(Math.max(-1, Math.min(1, cosB))) * (180 / Math.PI);

    const angleCDeg = angleC * (180 / Math.PI);

    // Scaled sides
    const scaledA = sideA * similarityRatio;
    const scaledB = sideB * similarityRatio;
    const scaledC = sideC * similarityRatio;

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
                        {/* First triangle */}
                        <g>
                            <polygon
                                points={`${t1X1},${t1Y1} ${t1X2},${t1Y2} ${t1X3},${t1Y3}`}
                                fill="#3b82f6"
                                fillOpacity="0.2"
                                stroke="#3b82f6"
                                strokeWidth="3"
                            />

                            {/* Vertices */}
                            <circle cx={t1X1} cy={t1Y1} r="4" fill="#3b82f6" />
                            <circle cx={t1X2} cy={t1Y2} r="4" fill="#3b82f6" />
                            <circle cx={t1X3} cy={t1Y3} r="4" fill="#3b82f6" />

                            {/* Side labels */}
                            <text
                                x={(t1X1 + t1X2) / 2}
                                y={t1Y1 + 20}
                                className="text-sm fill-blue-700 font-medium"
                                textAnchor="middle"
                            >
                                c = {sideC.toFixed(0)}
                            </text>
                            <text
                                x={(t1X1 + t1X3) / 2 - 20}
                                y={(t1Y1 + t1Y3) / 2}
                                className="text-sm fill-blue-700 font-medium"
                                textAnchor="middle"
                            >
                                b = {sideB.toFixed(0)}
                            </text>
                            <text
                                x={(t1X2 + t1X3) / 2 + 20}
                                y={(t1Y2 + t1Y3) / 2}
                                className="text-sm fill-blue-700 font-medium"
                                textAnchor="middle"
                            >
                                a = {sideA.toFixed(0)}
                            </text>

                            {/* Angle labels */}
                            <text
                                x={t1X1 - 15}
                                y={t1Y1 - 10}
                                className="text-xs fill-blue-600 font-medium"
                            >
                                {angleCDeg.toFixed(0)}°
                            </text>
                            <text
                                x={t1X2 + 15}
                                y={t1Y2 - 10}
                                className="text-xs fill-blue-600 font-medium"
                            >
                                {angleB.toFixed(0)}°
                            </text>
                            <text
                                x={t1X3}
                                y={t1Y3 - 15}
                                className="text-xs fill-blue-600 font-medium"
                                textAnchor="middle"
                            >
                                {angleA.toFixed(0)}°
                            </text>

                            <text
                                x={(t1X1 + t1X2) / 2}
                                y={t1Y1 + 50}
                                className="text-base fill-blue-700 font-semibold"
                                textAnchor="middle"
                            >
                                Исходный треугольник
                            </text>
                        </g>

                        {/* Second triangle (similar) */}
                        <g>
                            <polygon
                                points={`${t2X1},${t2Y1} ${t2X2},${t2Y2} ${t2X3},${t2Y3}`}
                                fill="#10b981"
                                fillOpacity="0.2"
                                stroke="#10b981"
                                strokeWidth="3"
                            />

                            {/* Vertices */}
                            <circle cx={t2X1} cy={t2Y1} r="4" fill="#10b981" />
                            <circle cx={t2X2} cy={t2Y2} r="4" fill="#10b981" />
                            <circle cx={t2X3} cy={t2Y3} r="4" fill="#10b981" />

                            {/* Side labels */}
                            <text
                                x={(t2X1 + t2X2) / 2}
                                y={t2Y1 + 20}
                                className="text-sm fill-green-700 font-medium"
                                textAnchor="middle"
                            >
                                c' = {scaledC.toFixed(0)}
                            </text>
                            <text
                                x={(t2X1 + t2X3) / 2 - 20}
                                y={(t2Y1 + t2Y3) / 2}
                                className="text-sm fill-green-700 font-medium"
                                textAnchor="middle"
                            >
                                b' = {scaledB.toFixed(0)}
                            </text>
                            <text
                                x={(t2X2 + t2X3) / 2 + 20}
                                y={(t2Y2 + t2Y3) / 2}
                                className="text-sm fill-green-700 font-medium"
                                textAnchor="middle"
                            >
                                a' = {scaledA.toFixed(0)}
                            </text>

                            {/* Angle labels */}
                            <text
                                x={t2X1 - 15}
                                y={t2Y1 - 10}
                                className="text-xs fill-green-600 font-medium"
                            >
                                {angleCDeg.toFixed(0)}°
                            </text>
                            <text
                                x={t2X2 + 15}
                                y={t2Y2 - 10}
                                className="text-xs fill-green-600 font-medium"
                            >
                                {angleB.toFixed(0)}°
                            </text>
                            <text
                                x={t2X3}
                                y={t2Y3 - 15}
                                className="text-xs fill-green-600 font-medium"
                                textAnchor="middle"
                            >
                                {angleA.toFixed(0)}°
                            </text>

                            <text
                                x={(t2X1 + t2X2) / 2}
                                y={t2Y1 + 50}
                                className="text-base fill-green-700 font-semibold"
                                textAnchor="middle"
                            >
                                Подобный треугольник
                            </text>
                        </g>

                        {/* Similarity ratio indicator */}
                        <text
                            x={width / 2}
                            y={50}
                            className="text-lg fill-gray-700 font-bold"
                            textAnchor="middle"
                        >
                            Коэффициент подобия k = {similarityRatio.toFixed(2)}
                        </text>
                    </svg>
                </div>

                <div className="w-96 border-l bg-white overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Подобие треугольников</h3>
                            <span className="text-sm text-gray-500">Изучение свойств подобных фигур</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Коэффициент подобия k = {similarityRatio.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0.3"
                                max="3"
                                step="0.1"
                                value={similarityRatio}
                                onChange={(e) => setSimilarityRatio(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                            <h4 className="font-medium text-blue-800">Исходный треугольник</h4>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Сторона a = {sideA.toFixed(0)}
                                </label>
                                <input
                                    type="range"
                                    min="50"
                                    max="150"
                                    step="5"
                                    value={sideA}
                                    onChange={(e) => setSideA(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Сторона b = {sideB.toFixed(0)}
                                </label>
                                <input
                                    type="range"
                                    min="50"
                                    max="150"
                                    step="5"
                                    value={sideB}
                                    onChange={(e) => setSideB(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Сторона c = {sideC.toFixed(0)}
                                </label>
                                <input
                                    type="range"
                                    min="50"
                                    max="150"
                                    step="5"
                                    value={sideC}
                                    onChange={(e) => setSideC(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                            <div className="font-medium text-gray-700">Свойства подобия:</div>
                            <div className="text-gray-600">
                                • Углы равны: ∠A = ∠A', ∠B = ∠B', ∠C = ∠C'
                            </div>
                            <div className="text-gray-600">
                                • Стороны пропорциональны:
                            </div>
                            <div className="text-gray-600 ml-4">
                                a'/a = {(scaledA / sideA).toFixed(2)}
                            </div>
                            <div className="text-gray-600 ml-4">
                                b'/b = {(scaledB / sideB).toFixed(2)}
                            </div>
                            <div className="text-gray-600 ml-4">
                                c'/c = {(scaledC / sideC).toFixed(2)}
                            </div>
                            <div className="text-gray-600 mt-2">
                                • Все отношения равны k = {similarityRatio.toFixed(2)}
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

export default TriangleSimilarity;
