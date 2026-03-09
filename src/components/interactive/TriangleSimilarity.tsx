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

    // Build triangle with:
    // B = (0, 0), C = (a, 0) — основание BC = a
    // A найдём через угол при B: cosB = (a² + c² - b²) / (2ac)
    // AB = c, AC = b, BC = a
    const buildTriangle = (a: number, b: number, c: number) => {
        const cosB = (a * a + c * c - b * b) / (2 * a * c);
        const angleB = Math.acos(Math.max(-1, Math.min(1, cosB)));
        return {
            x1: 0,          y1: 0,           // B
            x2: a,          y2: 0,           // C
            x3: c * Math.cos(angleB),        // A
            y3: -c * Math.sin(angleB),
        };
    };

    const t1 = buildTriangle(sideA, sideB, sideC);
    const t2 = buildTriangle(sideA * similarityRatio, sideB * similarityRatio, sideC * similarityRatio);

    // Calculate bounding boxes
    const bbox = (t: typeof t1) => ({
        minX: Math.min(t.x1, t.x2, t.x3),
        maxX: Math.max(t.x1, t.x2, t.x3),
        minY: Math.min(t.y1, t.y2, t.y3),
        maxY: Math.max(t.y1, t.y2, t.y3),
    });

    const bb1 = bbox(t1);
    const bb2 = bbox(t2);

    const padding = 80;
    const halfWidth = width / 2;
    const availableWidth = halfWidth - 2 * padding;
    const availableHeight = height - 2 * padding - 100;

    const scale1 = Math.min(availableWidth / (bb1.maxX - bb1.minX), availableHeight / (bb1.maxY - bb1.minY));
    const scale2 = Math.min(availableWidth / (bb2.maxX - bb2.minX), availableHeight / (bb2.maxY - bb2.minY));
    const scale = Math.min(scale1, scale2);

    const applyTransform = (t: typeof t1, bb: typeof bb1, centerX: number, centerY: number) => {
        const cx = (bb.minX + bb.maxX) / 2;
        const cy = (bb.minY + bb.maxY) / 2;
        return {
            x1: centerX + (t.x1 - cx) * scale,
            y1: centerY + (t.y1 - cy) * scale,
            x2: centerX + (t.x2 - cx) * scale,
            y2: centerY + (t.y2 - cy) * scale,
            x3: centerX + (t.x3 - cx) * scale,
            y3: centerY + (t.y3 - cy) * scale,
        };
    };

    const t1c = applyTransform(t1, bb1, halfWidth / 2, height / 2 + 30);
    const t2c = applyTransform(t2, bb2, halfWidth + halfWidth / 2, height / 2 + 30);

    // Calculate angles for labels
    const cosA = (sideB * sideB + sideC * sideC - sideA * sideA) / (2 * sideB * sideC);
    const angleA = Math.acos(Math.max(-1, Math.min(1, cosA))) * (180 / Math.PI);

    const cosB_val = (sideA * sideA + sideC * sideC - sideB * sideB) / (2 * sideA * sideC);
    const angleBDeg = Math.acos(Math.max(-1, Math.min(1, cosB_val))) * (180 / Math.PI);

    const angleCDeg = 180 - angleA - angleBDeg;

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
                                points={`${t1c.x1},${t1c.y1} ${t1c.x2},${t1c.y2} ${t1c.x3},${t1c.y3}`}
                                fill="#3b82f6"
                                fillOpacity="0.2"
                                stroke="#3b82f6"
                                strokeWidth="3"
                            />
                            <circle cx={t1c.x1} cy={t1c.y1} r="4" fill="#3b82f6" />
                            <circle cx={t1c.x2} cy={t1c.y2} r="4" fill="#3b82f6" />
                            <circle cx={t1c.x3} cy={t1c.y3} r="4" fill="#3b82f6" />

                            {/* Side labels: BC=a, AB=c, AC=b */}
                            <text x={(t1c.x1 + t1c.x2) / 2} y={Math.max(t1c.y1, t1c.y2) + 20} className="text-sm fill-blue-700 font-medium" textAnchor="middle">
                                a = {sideA.toFixed(0)}
                            </text>
                            <text x={(t1c.x1 + t1c.x3) / 2 - 20} y={(t1c.y1 + t1c.y3) / 2} className="text-sm fill-blue-700 font-medium" textAnchor="middle">
                                c = {sideC.toFixed(0)}
                            </text>
                            <text x={(t1c.x2 + t1c.x3) / 2 + 20} y={(t1c.y2 + t1c.y3) / 2} className="text-sm fill-blue-700 font-medium" textAnchor="middle">
                                b = {sideB.toFixed(0)}
                            </text>

                            {/* Angle labels: B, C, A */}
                            <text x={t1c.x1 - 15} y={t1c.y1 + 5} className="text-xs fill-blue-600 font-medium">{angleBDeg.toFixed(0)}°</text>
                            <text x={t1c.x2 + 8} y={t1c.y2 + 5} className="text-xs fill-blue-600 font-medium">{angleCDeg.toFixed(0)}°</text>
                            <text x={t1c.x3} y={t1c.y3 - 10} className="text-xs fill-blue-600 font-medium" textAnchor="middle">{angleA.toFixed(0)}°</text>

                            <text x={(t1c.x1 + t1c.x2) / 2} y={Math.max(t1c.y1, t1c.y2) + 50} className="text-base fill-blue-700 font-semibold" textAnchor="middle">
                                Исходный треугольник
                            </text>
                        </g>

                        {/* Second triangle */}
                        <g>
                            <polygon
                                points={`${t2c.x1},${t2c.y1} ${t2c.x2},${t2c.y2} ${t2c.x3},${t2c.y3}`}
                                fill="#10b981"
                                fillOpacity="0.2"
                                stroke="#10b981"
                                strokeWidth="3"
                            />
                            <circle cx={t2c.x1} cy={t2c.y1} r="4" fill="#10b981" />
                            <circle cx={t2c.x2} cy={t2c.y2} r="4" fill="#10b981" />
                            <circle cx={t2c.x3} cy={t2c.y3} r="4" fill="#10b981" />

                            <text x={(t2c.x1 + t2c.x2) / 2} y={Math.max(t2c.y1, t2c.y2) + 20} className="text-sm fill-green-700 font-medium" textAnchor="middle">
                                a' = {scaledA.toFixed(0)}
                            </text>
                            <text x={(t2c.x1 + t2c.x3) / 2 - 20} y={(t2c.y1 + t2c.y3) / 2} className="text-sm fill-green-700 font-medium" textAnchor="middle">
                                c' = {scaledC.toFixed(0)}
                            </text>
                            <text x={(t2c.x2 + t2c.x3) / 2 + 20} y={(t2c.y2 + t2c.y3) / 2} className="text-sm fill-green-700 font-medium" textAnchor="middle">
                                b' = {scaledB.toFixed(0)}
                            </text>

                            <text x={t2c.x1 - 15} y={t2c.y1 + 5} className="text-xs fill-green-600 font-medium">{angleBDeg.toFixed(0)}°</text>
                            <text x={t2c.x2 + 8} y={t2c.y2 + 5} className="text-xs fill-green-600 font-medium">{angleCDeg.toFixed(0)}°</text>
                            <text x={t2c.x3} y={t2c.y3 - 10} className="text-xs fill-green-600 font-medium" textAnchor="middle">{angleA.toFixed(0)}°</text>

                            <text x={(t2c.x1 + t2c.x2) / 2} y={Math.max(t2c.y1, t2c.y2) + 50} className="text-base fill-green-700 font-semibold" textAnchor="middle">
                                Подобный треугольник
                            </text>
                        </g>

                        <text x={width / 2} y={50} className="text-lg fill-gray-700 font-bold" textAnchor="middle">
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
                                type="range" min="0.3" max="3" step="0.1"
                                value={similarityRatio}
                                onChange={(e) => setSimilarityRatio(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                            <h4 className="font-medium text-blue-800">Исходный треугольник</h4>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Сторона a = {sideA.toFixed(0)}</label>
                                <input type="range" min="50" max="150" step="5" value={sideA}
                                    onChange={(e) => setSideA(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Сторона b = {sideB.toFixed(0)}</label>
                                <input type="range" min="50" max="150" step="5" value={sideB}
                                    onChange={(e) => setSideB(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Сторона c = {sideC.toFixed(0)}</label>
                                <input type="range" min="50" max="150" step="5" value={sideC}
                                    onChange={(e) => setSideC(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                            <div className="font-medium text-gray-700">Свойства подобия:</div>
                            <div className="text-gray-600">• Углы равны: ∠A = ∠A', ∠B = ∠B', ∠C = ∠C'</div>
                            <div className="text-gray-600">• Стороны пропорциональны:</div>
                            <div className="text-gray-600 ml-4">a'/a = {(scaledA / sideA).toFixed(2)}</div>
                            <div className="text-gray-600 ml-4">b'/b = {(scaledB / sideB).toFixed(2)}</div>
                            <div className="text-gray-600 ml-4">c'/c = {(scaledC / sideC).toFixed(2)}</div>
                            <div className="text-gray-600 mt-2">• Все отношения равны k = {similarityRatio.toFixed(2)}</div>
                        </div>

                        <button onClick={reset} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
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
