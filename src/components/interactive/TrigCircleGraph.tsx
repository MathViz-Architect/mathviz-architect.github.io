import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';

type TrigFunction = 'sin' | 'cos';

interface TrailPoint {
    theta: number;
    value: number;
}

export const TrigCircleGraph: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [func, setFunc] = useState<TrigFunction>('sin');
    const [theta, setTheta] = useState(0);
    const [trail, setTrail] = useState<TrailPoint[]>([]);

    const animationRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);

    const instructions = [
        'Нажмите Play, чтобы запустить анимацию',
        'Точка движется по единичной окружности слева',
        'Справа одновременно рисуется график sin(x) или cos(x)',
        'Пунктирные линии показывают проекции точки на оси',
        'Переключайте между sin и cos, чтобы увидеть разницу',
        'Регулируйте скорость анимации ползунком',
    ];

    // Animation loop
    useEffect(() => {
        if (!isPlaying) return;

        const animate = (currentTime: number) => {
            if (lastTimeRef.current === 0) {
                lastTimeRef.current = currentTime;
            }

            const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
            lastTimeRef.current = currentTime;

            setTheta((prevTheta) => {
                const newTheta = prevTheta + 0.02 * speed * 60 * deltaTime; // 60 fps baseline

                // Reset after 4π
                if (newTheta >= 4 * Math.PI) {
                    setTrail([]);
                    return 0;
                }

                return newTheta;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            lastTimeRef.current = 0;
        };
    }, [isPlaying, speed]);

    // Update trail when theta changes
    useEffect(() => {
        if (isPlaying && theta > 0) {
            const value = func === 'sin' ? Math.sin(theta) : Math.cos(theta);
            setTrail((prev) => [...prev, { theta, value }]);
        }
    }, [theta, func, isPlaying]);

    const reset = () => {
        setIsPlaying(false);
        setTheta(0);
        setTrail([]);
        lastTimeRef.current = 0;
    };

    const togglePlay = () => {
        setIsPlaying((prev) => !prev);
    };

    // Circle calculations
    const circleRadius = 120;
    const circleCenterX = 160;
    const circleCenterY = 160;
    const pointX = circleCenterX + circleRadius * Math.cos(theta);
    const pointY = circleCenterY - circleRadius * Math.sin(theta);

    const sinValue = Math.sin(theta);
    const cosValue = Math.cos(theta);
    const currentValue = func === 'sin' ? sinValue : cosValue;

    // Graph calculations
    const graphWidth = 500;
    const graphHeight = 320;
    const graphPadding = 40;
    const graphMaxX = graphWidth - graphPadding;
    const graphMinX = graphPadding;
    const graphCenterY = graphHeight / 2;

    const mapThetaToX = (t: number): number => {
        return graphMinX + ((t / (4 * Math.PI)) * (graphMaxX - graphMinX));
    };

    const mapValueToY = (v: number): number => {
        return graphCenterY - v * (graphCenterY - 20);
    };

    // Generate graph path
    const graphPath = trail.length > 0
        ? trail.map((p, i) => {
            const x = mapThetaToX(p.theta);
            const y = mapValueToY(p.value);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ')
        : '';

    const currentGraphX = mapThetaToX(theta);
    const currentGraphY = mapValueToY(currentValue);

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

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Two panels side by side */}
                <div className="flex-1 flex items-center justify-center gap-8 p-6 bg-gray-50">
                    {/* Left: Unit Circle */}
                    <div className="flex flex-col items-center gap-4">
                        <svg width="320" height="320" className="border border-gray-200 rounded-lg bg-white shadow-sm">
                            {/* Circle */}
                            <circle
                                cx={circleCenterX}
                                cy={circleCenterY}
                                r={circleRadius}
                                fill="none"
                                stroke="#D1D5DB"
                                strokeWidth="2"
                            />

                            {/* Axes */}
                            <line
                                x1={circleCenterX - circleRadius - 20}
                                y1={circleCenterY}
                                x2={circleCenterX + circleRadius + 20}
                                y2={circleCenterY}
                                stroke="#374151"
                                strokeWidth="2"
                            />
                            <line
                                x1={circleCenterX}
                                y1={circleCenterY - circleRadius - 20}
                                x2={circleCenterX}
                                y2={circleCenterY + circleRadius + 20}
                                stroke="#374151"
                                strokeWidth="2"
                            />

                            {/* Axis labels */}
                            <text x={circleCenterX + circleRadius + 25} y={circleCenterY + 5} className="text-xs fill-gray-600">x</text>
                            <text x={circleCenterX + 5} y={circleCenterY - circleRadius - 25} className="text-xs fill-gray-600">y</text>

                            {/* Projection lines */}
                            {/* Vertical line (sin) */}
                            <line
                                x1={pointX}
                                y1={pointY}
                                x2={pointX}
                                y2={circleCenterY}
                                stroke={func === 'sin' ? '#4F46E5' : '#D1D5DB'}
                                strokeWidth={func === 'sin' ? 2 : 1}
                                strokeDasharray="4,4"
                                opacity={func === 'sin' ? 1 : 0.5}
                            />

                            {/* Horizontal line (cos) */}
                            <line
                                x1={pointX}
                                y1={pointY}
                                x2={circleCenterX}
                                y2={pointY}
                                stroke={func === 'cos' ? '#4F46E5' : '#D1D5DB'}
                                strokeWidth={func === 'cos' ? 2 : 1}
                                strokeDasharray="4,4"
                                opacity={func === 'cos' ? 1 : 0.5}
                            />

                            {/* Radius line */}
                            <line
                                x1={circleCenterX}
                                y1={circleCenterY}
                                x2={pointX}
                                y2={pointY}
                                stroke="#6B7280"
                                strokeWidth="2"
                            />

                            {/* Moving point */}
                            <circle
                                cx={pointX}
                                cy={pointY}
                                r="6"
                                fill="#4F46E5"
                            />

                            {/* Angle arc — use theta mod 2π so it never exceeds a full circle */}
                            {theta > 0 && (() => {
                                const t = theta % (2 * Math.PI);
                                if (t < 0.01) return null;
                                return (
                                    <path
                                        d={`M ${circleCenterX + 30} ${circleCenterY} A 30 30 0 ${t > Math.PI ? 1 : 0} 0 ${circleCenterX + 30 * Math.cos(t)} ${circleCenterY - 30 * Math.sin(t)}`}
                                        fill="none"
                                        stroke="#F59E0B"
                                        strokeWidth="2"
                                    />
                                );
                            })()}

                            {/* Angle label */}
                            <text
                                x={circleCenterX + 40}
                                y={circleCenterY - 10}
                                className="text-xs fill-orange-600 font-medium"
                            >
                                θ = {((theta * 180) / Math.PI).toFixed(0)}°
                            </text>
                        </svg>

                        {/* Values display */}
                        <div className="text-sm space-y-1">
                            <p className="text-gray-700">
                                <span className={func === 'sin' ? 'font-semibold text-indigo-600' : ''}>
                                    sin(θ) = {sinValue.toFixed(2)}
                                </span>
                            </p>
                            <p className="text-gray-700">
                                <span className={func === 'cos' ? 'font-semibold text-indigo-600' : ''}>
                                    cos(θ) = {cosValue.toFixed(2)}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Right: Graph */}
                    <div className="flex flex-col items-center">
                        <svg width={graphWidth} height={graphHeight} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                            {/* Y axis */}
                            <line
                                x1={graphMinX}
                                y1={20}
                                x2={graphMinX}
                                y2={graphHeight - 20}
                                stroke="#374151"
                                strokeWidth="2"
                            />

                            {/* X axis */}
                            <line
                                x1={graphMinX}
                                y1={graphCenterY}
                                x2={graphMaxX}
                                y2={graphCenterY}
                                stroke="#374151"
                                strokeWidth="2"
                            />

                            {/* Y axis labels */}
                            <text x={graphMinX - 25} y={mapValueToY(1) + 5} className="text-xs fill-gray-600">1</text>
                            <text x={graphMinX - 25} y={mapValueToY(0) + 5} className="text-xs fill-gray-600">0</text>
                            <text x={graphMinX - 30} y={mapValueToY(-1) + 5} className="text-xs fill-gray-600">-1</text>

                            {/* X axis labels */}
                            {[0, Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI, 5 * Math.PI / 2, 3 * Math.PI, 7 * Math.PI / 2, 4 * Math.PI].map((angle, i) => {
                                const x = mapThetaToX(angle);
                                const labels = ['0', 'π/2', 'π', '3π/2', '2π', '5π/2', '3π', '7π/2', '4π'];
                                return (
                                    <g key={i}>
                                        <line
                                            x1={x}
                                            y1={graphCenterY - 3}
                                            x2={x}
                                            y2={graphCenterY + 3}
                                            stroke="#374151"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={x}
                                            y={graphCenterY + 15}
                                            className="text-xs fill-gray-600"
                                            textAnchor="middle"
                                        >
                                            {labels[i]}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Grid lines */}
                            <line x1={graphMinX} y1={mapValueToY(1)} x2={graphMaxX} y2={mapValueToY(1)} stroke="#F0F0F0" strokeWidth="1" />
                            <line x1={graphMinX} y1={mapValueToY(-1)} x2={graphMaxX} y2={mapValueToY(-1)} stroke="#F0F0F0" strokeWidth="1" />

                            {/* Trail path */}
                            {graphPath && (
                                <path
                                    d={graphPath}
                                    fill="none"
                                    stroke="#4F46E5"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                            {/* Current point */}
                            {theta > 0 && (
                                <circle
                                    cx={currentGraphX}
                                    cy={currentGraphY}
                                    r="5"
                                    fill="#4F46E5"
                                />
                            )}

                            {/* Function label */}
                            <text
                                x={graphMinX + 10}
                                y={30}
                                className="text-sm fill-indigo-600 font-semibold"
                            >
                                y = {func}(x)
                            </text>
                        </svg>
                    </div>
                </div>

                {/* Controls */}
                <div className="border-t bg-white p-6">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {/* Play/Pause and Reset */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={togglePlay}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                {isPlaying ? 'Пауза' : 'Старт'}
                            </button>

                            <button
                                onClick={reset}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                <RotateCcw size={18} />
                                Сброс
                            </button>

                            {/* Function selector */}
                            <div className="flex items-center gap-2 ml-8">
                                <label className="text-sm font-medium text-gray-700">Функция:</label>
                                <button
                                    onClick={() => setFunc('sin')}
                                    className={`px-3 py-1 rounded ${func === 'sin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    sin(x)
                                </button>
                                <button
                                    onClick={() => setFunc('cos')}
                                    className={`px-3 py-1 rounded ${func === 'cos' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    cos(x)
                                </button>
                            </div>
                        </div>

                        {/* Speed slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <label className="font-medium text-gray-700">Скорость: {speed.toFixed(1)}x</label>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrigCircleGraph;
