import React, { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { CoordinateGrid } from './CoordinateGrid';
import { ModuleInstructions } from './ModuleInstructions';

interface Point {
    id: string;
    x: number;
    y: number;
}

export const CoordinatePlane: React.FC = () => {
    const [points, setPoints] = useState<Point[]>([]);
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number } | null>(null);

    const instructions = [
        'Кликните по координатной плоскости чтобы добавить точку',
        'Наведите на точку чтобы увидеть её координаты',
        'Список всех точек отображается в панели справа',
        'Удалите точку нажав на кнопку корзины',
        'Кнопка "Очистить всё" удаляет все точки'
    ];

    const width = 800;
    const height = 600;
    const originX = width / 2;
    const originY = height / 2;
    const scale = 40;

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert to SVG coordinates
        const svgX = (clickX / rect.width) * width;
        const svgY = (clickY / rect.height) * height;

        // Convert to mathematical coordinates
        const mathX = (svgX - originX) / scale;
        const mathY = (originY - svgY) / scale;

        // Round to 1 decimal place
        const roundedX = Math.round(mathX * 10) / 10;
        const roundedY = Math.round(mathY * 10) / 10;

        const newPoint: Point = {
            id: Date.now().toString(),
            x: roundedX,
            y: roundedY
        };

        setPoints([...points, newPoint]);
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Convert to SVG coordinates
        const svgX = (mouseX / rect.width) * width;
        const svgY = (mouseY / rect.height) * height;

        // Convert to mathematical coordinates
        const mathX = (svgX - originX) / scale;
        const mathY = (originY - svgY) / scale;

        // Round to 1 decimal place
        const roundedX = Math.round(mathX * 10) / 10;
        const roundedY = Math.round(mathY * 10) / 10;

        setHoveredPoint({ x: roundedX, y: roundedY });
    };

    const handleMouseLeave = () => {
        setHoveredPoint(null);
    };

    const deletePoint = (id: string) => {
        setPoints(points.filter(p => p.id !== id));
    };

    const clearAll = () => {
        setPoints([]);
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
                <div className="flex-1 bg-gray-50 p-8 overflow-auto">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="w-full h-auto border border-gray-200 rounded-lg bg-white shadow-sm cursor-crosshair"
                        onClick={handleClick}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <CoordinateGrid
                            width={width}
                            height={height}
                            originX={originX}
                            originY={originY}
                            scale={scale}
                        />

                        {/* Points */}
                        {points.map((point) => (
                            <g key={point.id}>
                                <circle
                                    cx={originX + point.x * scale}
                                    cy={originY - point.y * scale}
                                    r="5"
                                    fill="#3b82f6"
                                    stroke="#1e40af"
                                    strokeWidth="2"
                                />
                                <text
                                    x={originX + point.x * scale + 10}
                                    y={originY - point.y * scale - 10}
                                    className="text-xs fill-blue-600 font-medium"
                                >
                                    ({point.x}, {point.y})
                                </text>
                            </g>
                        ))}

                        {/* Hover indicator */}
                        {hoveredPoint && (
                            <g>
                                <circle
                                    cx={originX + hoveredPoint.x * scale}
                                    cy={originY - hoveredPoint.y * scale}
                                    r="3"
                                    fill="#6366f1"
                                    opacity="0.5"
                                />
                                <text
                                    x={originX + hoveredPoint.x * scale + 10}
                                    y={originY - hoveredPoint.y * scale - 10}
                                    className="text-xs fill-indigo-600 font-medium"
                                    opacity="0.7"
                                >
                                    ({hoveredPoint.x}, {hoveredPoint.y})
                                </text>
                            </g>
                        )}
                    </svg>
                </div>

                <div className="w-96 border-l bg-white overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Координатная плоскость</h3>
                            <span className="text-sm text-gray-500">Добавляйте точки кликом</span>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg space-y-2 text-sm">
                            <div className="font-medium text-blue-700">Информация:</div>
                            <div>Всего точек: {points.length}</div>
                            {hoveredPoint && (
                                <div className="text-indigo-600">
                                    Курсор: ({hoveredPoint.x}, {hoveredPoint.y})
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-700">Список точек</h4>
                                {points.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        Очистить всё
                                    </button>
                                )}
                            </div>

                            {points.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg">
                                    Нет точек. Кликните по плоскости чтобы добавить.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {points.map((point, index) => (
                                        <div
                                            key={point.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800">
                                                        ({point.x}, {point.y})
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        x: {point.x}, y: {point.y}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deletePoint(point.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={clearAll}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            <RotateCcw size={18} />
                            Очистить всё
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoordinatePlane;
