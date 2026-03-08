import React from 'react';

interface CoordinateGridProps {
    width: number;
    height: number;
    scale: number;
    originX: number;
    originY: number;
    gridId?: string;
}

export const CoordinateGrid: React.FC<CoordinateGridProps> = ({
    width,
    height,
    scale,
    originX,
    originY,
    gridId = 'coord-grid',
}) => {
    // Calculate grid range
    const minX = Math.floor(-originX / scale);
    const maxX = Math.ceil((width - originX) / scale);
    const minY = Math.floor(-originY / scale);
    const maxY = Math.ceil((height - originY) / scale);

    // Calculate grid offset so it aligns with origin
    const offsetX = originX % scale;
    const offsetY = originY % scale;

    return (
        <g>
            {/* Grid lines */}
            <defs>
                <pattern id={gridId} width={scale} height={scale} patternUnits="userSpaceOnUse" x={offsetX} y={offsetY}>
                    <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#f0f0f0" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width={width} height={height} fill={`url(#${gridId})`} />

            {/* Main axes */}
            <line x1={originX} y1="0" x2={originX} y2={height} stroke="#374151" strokeWidth="2" />
            <line x1="0" y1={originY} x2={width} y2={originY} stroke="#374151" strokeWidth="2" />

            {/* Axis labels */}
            <text x={width - 10} y={originY - 5} className="text-xs fill-gray-600">x</text>
            <text x={originX + 5} y="15" className="text-xs fill-gray-600">y</text>

            {/* X-axis tick marks and labels */}
            {Array.from({ length: maxX - minX + 1 }, (_, i) => minX + i).map((x) => {
                if (x === 0) return null; // Skip origin
                const px = originX + x * scale;
                if (px < 0 || px > width) return null;
                return (
                    <g key={`x-${x}`}>
                        <line x1={px} y1={originY - 3} x2={px} y2={originY + 3} stroke="#374151" strokeWidth="1" />
                        <text x={px} y={originY + 15} className="text-xs fill-gray-600" textAnchor="middle">
                            {x}
                        </text>
                    </g>
                );
            })}

            {/* Y-axis tick marks and labels */}
            {Array.from({ length: maxY - minY + 1 }, (_, i) => minY + i).map((y) => {
                if (y === 0) return null; // Skip origin
                const py = originY - y * scale;
                if (py < 0 || py > height) return null;
                return (
                    <g key={`y-${y}`}>
                        <line x1={originX - 3} y1={py} x2={originX + 3} y2={py} stroke="#374151" strokeWidth="1" />
                        <text x={originX - 8} y={py + 4} className="text-xs fill-gray-600" textAnchor="end">
                            {y}
                        </text>
                    </g>
                );
            })}

            {/* Origin label */}
            <text x={originX - 8} y={originY + 15} className="text-xs fill-gray-600" textAnchor="end">
                0
            </text>
        </g>
    );
};

export default CoordinateGrid;
