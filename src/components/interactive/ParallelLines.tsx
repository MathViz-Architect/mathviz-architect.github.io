import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';

type AngleHighlight = 'corresponding' | 'alternate' | 'consecutive' | 'none';

export const ParallelLines: React.FC = () => {
    const [transversalAngle, setTransversalAngle] = useState(30);
    const [highlight, setHighlight] = useState<AngleHighlight>('none');

    const instructions = [
        'Измените угол наклона секущей прямой',
        'Выберите тип углов для подсветки',
        'Соответственные углы равны (одинаковый цвет)',
        'Накрест лежащие углы равны (одинаковый цвет)',
        'Односторонние углы в сумме дают 180°'
    ];

    const reset = () => {
        setTransversalAngle(30);
        setHighlight('none');
    };

    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Parallel lines positions
    const line1Y = centerY - 100;
    const line2Y = centerY + 100;

    const angleRad = (transversalAngle * Math.PI) / 180;

    // Anchor transversal at centerX, centerY (midpoint between the two parallel lines).
    const slopeSVG = -Math.tan(angleRad); // dy/dx in SVG coords (Y-down)

    // Intersections: transversal through (centerX, centerY) with each parallel line
    // x = centerX + (lineY - centerY) / slopeSVG
    // For shallow angles slopeSVG → 0 and intersectX → ±∞, so clamp to SVG bounds
    const margin = 60; // keep labels visible
    const clamp = (v: number) => Math.max(margin, Math.min(width - margin, v));
    const safeSlope = Math.abs(slopeSVG) < 0.001 ? (slopeSVG < 0 ? -0.001 : 0.001) : slopeSVG;
    const intersect1X = clamp(centerX + (line1Y - centerY) / safeSlope);
    const intersect1Y = line1Y;
    const intersect2X = clamp(centerX + (line2Y - centerY) / safeSlope);
    const intersect2Y = line2Y;

    // Transversal endpoints: extend far enough to cross both parallel lines visually
    const extendLength = 800;
    const transX1 = centerX - extendLength;
    const transY1 = centerY - slopeSVG * extendLength;
    const transX2 = centerX + extendLength;
    const transY2 = centerY + slopeSVG * extendLength;

    // Calculate ray directions from intersection point using atan2
    const getRayAngles = () => {
        // Angles in MATH coords (CCW, Y-up).
        const rawRays = [
            { angle: 0, name: 'right' },
            { angle: Math.PI, name: 'left' },
            { angle: angleRad, name: 'transUp' },
            { angle: angleRad + Math.PI, name: 'transDown' }
        ];
        rawRays.forEach(r => {
            r.angle = ((r.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        });
        rawRays.sort((a, b) => a.angle - b.angle);
        return rawRays;
    };

    const rays = getRayAngles();

    // Identify each sector by the names of its two bounding rays.
    // Rays are sorted, so sector[i] goes from rays[i].name to rays[(i+1)%4].name.
    const getSectorKey = (i: number): string => {
        const a = rays[i].name;
        const b = rays[(i + 1) % rays.length].name;
        return [a, b].sort().join('|');
    };

    // Stable sector identities regardless of angle sign:
    // 'right|transUp' or 'right|transDown' = acute sector between horizontal-right and transversal
    // 'left|transUp' or 'left|transDown'   = acute sector between horizontal-left and transversal
    // Sectors containing both horizontal rays = obtuse sectors
    const isAcuteSector = (key: string) =>
        (key.includes('right') && key.includes('trans')) ||
        (key.includes('left') && key.includes('trans'));

    // For alternate interior angles: we want the two sectors at each intersection
    // that face INWARD (toward the space between the two parallel lines).
    // At point1 (top line): inward = below the line = sectors whose mid-angle is in (π, 2π) in math coords
    // At point2 (bottom line): inward = above the line = sectors whose mid-angle is in (0, π) in math coords
    const isInteriorSector = (i: number, pointIndex: 1 | 2): boolean => {
        const startAngle = rays[i].angle;
        let endAngle = rays[(i + 1) % rays.length].angle;
        if (i === rays.length - 1) endAngle += 2 * Math.PI;
        const mid = ((startAngle + endAngle) / 2) % (2 * Math.PI);
        // math coords: angles π..2π point downward in SVG = interior for point1 (below line1)
        // angles 0..π point upward in SVG = interior for point2 (above line2)
        if (pointIndex === 1) return mid > Math.PI; // below line1
        return mid < Math.PI; // above line2
    };

    // Get which "side" of the transversal a sector is on: 'transRight' or 'transLeft'
    // A sector is on the right side of transversal if it contains the 'right' ray
    const getSectorSide = (i: number): 'right' | 'left' => {
        const key = getSectorKey(i);
        return key.includes('right') ? 'right' : 'left';
    };

    // Draw angle arc with filled sector
    const drawAngleArc = (x: number, y: number, startAngle: number, endAngle: number, radius: number, color: string, filled: boolean) => {
        const diff = endAngle - startAngle;
        const steps = Math.max(8, Math.round(diff * 16));
        const arcPoints: string[] = [];
        for (let i = 0; i <= steps; i++) {
            const a = startAngle + (diff * i) / steps;
            arcPoints.push(`${(x + Math.cos(a) * radius).toFixed(2)},${(y - Math.sin(a) * radius).toFixed(2)}`);
        }

        // Filled sector path: M center, L start, arc points, L center, Z
        const sectorD = [
            `M ${x.toFixed(2)},${y.toFixed(2)}`,
            `L ${arcPoints[0]}`,
            ...arcPoints.slice(1).map(p => `L ${p}`),
            'Z'
        ].join(' ');

        return (
            <g>
                {filled && (
                    <path d={sectorD} fill={color} fillOpacity="0.25" stroke="none" />
                )}
                <polyline points={arcPoints.join(' ')} stroke={color} strokeWidth="2" fill="none" />
            </g>
        );
    };

    // Calculate angle values
    const angle1 = Math.abs(transversalAngle);
    const angle2 = 180 - angle1;

    // Get color for each angle based on ray-name sector identity
    const getAngleColor = (pointIndex: 1 | 2, sectorIndex: number): string => {
        if (highlight === 'none') return '#94a3b8';

        const key = getSectorKey(sectorIndex);

        if (highlight === 'corresponding') {
            // Corresponding angles: exactly 4 total (one per quadrant, one per intersection).
            // Each corresponding pair shares the same quadrant but one is exterior to point1,
            // the other exterior to point2. Exterior = NOT between the parallel lines.
            const isExterior = !isInteriorSector(sectorIndex, pointIndex);
            if (!isExterior) return '#94a3b8';
            const startAngle = rays[sectorIndex].angle;
            let endAngle = rays[(sectorIndex + 1) % rays.length].angle;
            if (sectorIndex === rays.length - 1) endAngle += 2 * Math.PI;
            const mid = ((startAngle + endAngle) / 2) % (2 * Math.PI);
            if (mid < Math.PI / 2) return '#3b82f6';       // UR - blue
            if (mid < Math.PI)     return '#10b981';       // UL - green
            if (mid < 3 * Math.PI / 2) return '#f59e0b';  // LL - orange
            return '#ef4444';                              // LR - red
        }

        if (highlight === 'alternate') {
            // Alternate interior: 'right|transUp' interior at point1 + 'left|transDown' interior at point2
            // (or vice versa depending on angle sign) — always one per intersection, facing inward
            const altKeys = new Set(['right|transUp', 'left|transDown']);
            if (altKeys.has(key) && isInteriorSector(sectorIndex, pointIndex)) return '#10b981';
        }

        if (highlight === 'consecutive') {
            // Co-interior (same-side interior): 2 interior angles summing to 180°.
            // Show only interior sectors, colored by which side of transversal they're on.
            // Same side = same color (one blue pair, one green pair across both intersections).
            if (!isInteriorSector(sectorIndex, pointIndex)) return '#94a3b8';
            // Side of transversal = which horizontal ray bounds this sector
            return getSectorSide(sectorIndex) === 'right' ? '#3b82f6' : '#10b981';
        }

        return '#94a3b8';
    };

    // Render angles at an intersection point
    const renderAngles = (x: number, y: number, pointIndex: 1 | 2) => {
        return rays.map((ray, i) => {
            const nextRay = rays[(i + 1) % rays.length];
            const startAngle = ray.angle;
            let endAngle = nextRay.angle;
            if (i === rays.length - 1) endAngle += 2 * Math.PI;

            const diff = endAngle - startAngle;
            const angleDeg = (diff * 180) / Math.PI;
            const displayAngle = Math.abs(angleDeg - angle1) < Math.abs(angleDeg - angle2) ? angle1 : angle2;
            const color = getAngleColor(pointIndex, i);
            const isHighlighted = highlight !== 'none' && color !== '#94a3b8';

            const midAngle = startAngle + diff / 2;
            const isAcute = angleDeg <= 90;
            const radius = 24;
            const labelDist = isAcute ? radius + 14 : radius - 4;
            const labelX = x + Math.cos(midAngle) * labelDist;
            const labelY = y - Math.sin(midAngle) * labelDist;

            return (
                <g key={`angle-${pointIndex}-${i}`}>
                    {isAcute
                        ? drawAngleArc(x, y, startAngle, endAngle, radius, color, isHighlighted)
                        : isHighlighted && drawAngleArc(x, y, startAngle, endAngle, radius + 8, color, true)
                    }
                    <text x={labelX} y={labelY} fill={color} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="500">
                        {Math.round(displayAngle)}°
                    </text>
                </g>
            );
        });
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
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                        {/* Parallel lines */}
                        <line
                            x1="0"
                            y1={line1Y}
                            x2={width}
                            y2={line1Y}
                            stroke="#6366f1"
                            strokeWidth="3"
                        />
                        <line
                            x1="0"
                            y1={line2Y}
                            x2={width}
                            y2={line2Y}
                            stroke="#6366f1"
                            strokeWidth="3"
                        />

                        {/* Transversal line through both intersections */}
                        <line
                            x1={transX1}
                            y1={transY1}
                            x2={transX2}
                            y2={transY2}
                            stroke="#10b981"
                            strokeWidth="3"
                        />

                        {/* Angles at both intersections */}
                        {renderAngles(intersect1X, intersect1Y, 1)}
                        {renderAngles(intersect2X, intersect2Y, 2)}

                        {/* Labels */}
                        <text x="20" y={line1Y - 10} className="text-sm fill-indigo-600 font-medium">
                            Прямая 1
                        </text>
                        <text x="20" y={line2Y - 10} className="text-sm fill-indigo-600 font-medium">
                            Прямая 2
                        </text>
                        {/* "Секущая" label: placed above line1, to the right of intersection, along the transversal */}
                        {(() => {
                            // Place label above line1 on the right side of intersection1
                            const offset = transversalAngle >= 0 ? 80 : -80;
                            const lx = Math.min(width - 60, Math.max(60, intersect1X + Math.abs(offset)));
                            const ly = line1Y - 30;
                            return (
                                <text x={lx} y={ly} fill="#10b981" fontSize="14" fontWeight="600" textAnchor="middle">
                                    Секущая
                                </text>
                            );
                        })()}
                    </svg>
                </div>

                <div className="w-96 border-l bg-white overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Параллельные прямые и секущая</h3>
                            <span className="text-sm text-gray-500">Изучение углов при пересечении</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Угол секущей: {transversalAngle}°
                            </label>
                            <input
                                type="range"
                                min="-89"
                                max="89"
                                step="1"
                                value={transversalAngle}
                                onChange={(e) => setTransversalAngle(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Подсветка углов</label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setHighlight('none')}
                                    className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${highlight === 'none'
                                        ? 'bg-gray-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Без подсветки
                                </button>
                                <button
                                    onClick={() => setHighlight('corresponding')}
                                    className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${highlight === 'corresponding'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        }`}
                                >
                                    Соответственные углы
                                </button>
                                <button
                                    onClick={() => setHighlight('alternate')}
                                    className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${highlight === 'alternate'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                >
                                    Накрест лежащие углы
                                </button>
                                <button
                                    onClick={() => setHighlight('consecutive')}
                                    className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${highlight === 'consecutive'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        }`}
                                >
                                    Односторонние углы
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                            <div className="font-medium text-gray-700">Свойства углов:</div>
                            {highlight === 'corresponding' && (
                                <div className="text-gray-600">
                                    Соответственные углы равны при параллельных прямых.
                                    Углы одного цвета равны между собой.
                                </div>
                            )}
                            {highlight === 'alternate' && (
                                <div className="text-gray-600">
                                    Накрест лежащие углы равны при параллельных прямых.
                                    Противоположные углы одного цвета равны.
                                </div>
                            )}
                            {highlight === 'consecutive' && (
                                <div className="text-gray-600">
                                    Односторонние углы в сумме дают 180° при параллельных прямых.
                                    Синий + зелёный = {angle1.toFixed(0)}° + {angle2.toFixed(0)}° = 180°
                                </div>
                            )}
                            {highlight === 'none' && (
                                <div className="text-gray-600">
                                    Выберите тип углов для подсветки и изучения их свойств.
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

export default ParallelLines;
