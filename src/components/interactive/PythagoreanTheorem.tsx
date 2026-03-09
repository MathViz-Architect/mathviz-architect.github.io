import React, { useState, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';
import { Tooltip } from './Tooltip';

interface PythagoreanTheoremProps {
  onInsert?: (params: { a: number; b: number }) => void;
}

export const PythagoreanTheorem: React.FC<PythagoreanTheoremProps> = ({ onInsert }) => {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [animationStep, setAnimationStep] = useState(0);

  const c = Math.sqrt(a * a + b * b);

  // Animation steps with explanations
  const animationSteps = [
    'Начинаем с прямоугольного треугольника со сторонами a и b',
    'Строим квадрат на катете a (синий). Его площадь равна a²',
    'Строим квадрат на катете b (зелёный). Его площадь равна b²',
    'Строим квадрат на гипотенузе c (оранжевый). Его площадь равна c²',
    'Площадь квадрата на гипотенузе равна сумме площадей квадратов на катетах: a² + b² = c²!'
  ];

  const startAnimation = () => {
    setAnimationStep(0);
    const steps = [0, 1, 2, 3, 4];
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setAnimationStep(steps[currentStep]);
      } else {
        clearInterval(interval);
      }
    }, 2000); // 2 seconds per step
  };

  const reset = () => {
    setA(3);
    setB(4);
    setAnimationStep(0);
  };

  // Generate square points
  const squarePositions = useMemo(() => {
    const size = 50;
    const offset = 20;
    return {
      squareA: { x: offset, y: offset + b * size, width: a * size, height: a * size },
      squareB: { x: offset + a * size, y: offset, width: b * size, height: b * size },
      squareC: { x: offset + a * size, y: offset + b * size, width: c * size, height: c * size },
    };
  }, [a, b, c]);

  const instructions = [
    'Используйте слайдеры для изменения длин катетов a и b',
    'Наблюдайте, как меняется длина гипотенузы c',
    'Нажмите "Показать доказательство" для визуализации теоремы',
    'Обратите внимание: площадь оранжевого квадрата (c²) всегда равна сумме площадей синего (a²) и зелёного (b²) квадратов'
  ];

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
            <svg viewBox="-20 -20 640 590" className="w-full h-auto border border-gray-200 rounded-lg bg-white shadow-sm">
              {/* Background grid */}
              <defs>
                <pattern id="grid2" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#f5f5f5" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="600" height="550" fill="url(#grid2)" />

              {(() => {
                // Single scale factor for all elements
                const scale = 40;

                // SVG canvas dimensions
                const svgWidth = 600;
                const svgHeight = 550;

                // Triangle vertices (before centering)
                // C = origin (right angle), A = top (cathetus a goes UP), B = right (cathetus b goes RIGHT)
                const C_x = 0;
                const C_y = 0;
                const A_x = 0;
                const A_y = -a * scale; // cathetus a goes UP
                const B_x = b * scale; // cathetus b goes RIGHT
                const B_y = 0;

                // Square a² extends to the LEFT from cathetus CA
                const sqA_x = -a * scale;
                const sqA_y = A_y;
                const sqA_width = a * scale;
                const sqA_height = a * scale;

                // Square b² extends DOWN from cathetus CB
                const sqB_x = C_x;
                const sqB_y = C_y;
                const sqB_width = b * scale;
                const sqB_height = b * scale;

                // Square c² - calculate perpendicular offset (outward from triangle)
                // Hypotenuse vector from A to B
                const dx = B_x - A_x;
                const dy = B_y - A_y;
                const cPixels = c * scale;

                // Perpendicular vector pointing OUTWARD: (dy, -dx) normalized * length
                const perpX = (dy / cPixels) * cPixels;
                const perpY = (-dx / cPixels) * cPixels;

                // Four vertices of square c²
                const sqC_P1x = A_x;
                const sqC_P1y = A_y;
                const sqC_P2x = B_x;
                const sqC_P2y = B_y;
                const sqC_P3x = B_x + perpX;
                const sqC_P3y = B_y + perpY;
                const sqC_P4x = A_x + perpX;
                const sqC_P4y = A_y + perpY;

                // Overall bounding box
                const minX = Math.min(
                  C_x, A_x, B_x,
                  sqA_x, sqA_x + sqA_width,
                  sqB_x, sqB_x + sqB_width,
                  sqC_P1x, sqC_P2x, sqC_P3x, sqC_P4x
                );
                const maxX = Math.max(
                  C_x, A_x, B_x,
                  sqA_x, sqA_x + sqA_width,
                  sqB_x, sqB_x + sqB_width,
                  sqC_P1x, sqC_P2x, sqC_P3x, sqC_P4x
                );
                const minY = Math.min(
                  C_y, A_y, B_y,
                  sqA_y, sqA_y + sqA_height,
                  sqB_y, sqB_y + sqB_height,
                  sqC_P1y, sqC_P2y, sqC_P3y, sqC_P4y
                );
                const maxY = Math.max(
                  C_y, A_y, B_y,
                  sqA_y, sqA_y + sqA_height,
                  sqB_y, sqB_y + sqB_height,
                  sqC_P1y, sqC_P2y, sqC_P3y, sqC_P4y
                );

                const compositionWidth = maxX - minX;
                const compositionHeight = maxY - minY;

                // Center offset
                const offsetX = (svgWidth - compositionWidth) / 2 - minX;
                const offsetY = (svgHeight - compositionHeight) / 2 - minY;

                // Apply offset to all coordinates
                const C = { x: C_x + offsetX, y: C_y + offsetY };
                const A = { x: A_x + offsetX, y: A_y + offsetY };
                const B = { x: B_x + offsetX, y: B_y + offsetY };

                return (
                  <>
                    {/* Triangle CAB */}
                    <polygon
                      points={`${C.x},${C.y} ${A.x},${A.y} ${B.x},${B.y}`}
                      fill="#DBEAFE"
                      stroke="#2563EB"
                      strokeWidth="3"
                    />

                    {/* Right angle marker at C */}
                    <path
                      d={`M ${C.x},${C.y - 15} L ${C.x + 15},${C.y - 15} L ${C.x + 15},${C.y}`}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2"
                    />

                    {/* Labels */}
                    <text x={C.x - 20} y={(C.y + A.y) / 2} className="text-lg fill-indigo-600 font-medium">a</text>
                    <text x={(C.x + B.x) / 2} y={C.y + 25} className="text-lg fill-indigo-600 font-medium">b</text>
                    <text x={(A.x + B.x) / 2 + 20} y={(A.y + B.y) / 2 - 10} className="text-lg fill-amber-600 font-medium">c</text>

                    {/* Squares - shown step by step */}
                    {animationStep >= 1 && (
                      <>
                        {/* Square on side a (vertical cathetus CA - left) */}
                        <rect
                          x={sqA_x + offsetX}
                          y={sqA_y + offsetY}
                          width={sqA_width}
                          height={sqA_height}
                          fill="rgba(37, 99, 235, 0.3)"
                          stroke="#2563EB"
                          strokeWidth="2"
                        />
                        <text
                          x={sqA_x + offsetX + sqA_width / 2}
                          y={sqA_y + offsetY + sqA_height / 2 + 5}
                          className="text-sm fill-indigo-600 font-medium"
                          textAnchor="middle"
                        >
                          a²
                        </text>
                      </>
                    )}

                    {animationStep >= 2 && (
                      <>
                        {/* Square on side b (horizontal cathetus CB - bottom) */}
                        <rect
                          x={sqB_x + offsetX}
                          y={sqB_y + offsetY}
                          width={sqB_width}
                          height={sqB_height}
                          fill="rgba(16, 185, 129, 0.3)"
                          stroke="#10B981"
                          strokeWidth="2"
                        />
                        <text
                          x={sqB_x + offsetX + sqB_width / 2}
                          y={sqB_y + offsetY + sqB_height / 2 + 5}
                          className="text-sm fill-green-600 font-medium"
                          textAnchor="middle"
                        >
                          b²
                        </text>
                      </>
                    )}

                    {animationStep >= 3 && (
                      <>
                        {/* Square on hypotenuse c² - positioned along the hypotenuse (outward) */}
                        <polygon
                          points={`${sqC_P1x + offsetX},${sqC_P1y + offsetY} ${sqC_P2x + offsetX},${sqC_P2y + offsetY} ${sqC_P3x + offsetX},${sqC_P3y + offsetY} ${sqC_P4x + offsetX},${sqC_P4y + offsetY}`}
                          fill="rgba(245, 158, 11, 0.3)"
                          stroke="#F59E0B"
                          strokeWidth="2"
                        />
                        <text
                          x={(sqC_P1x + sqC_P2x + sqC_P3x + sqC_P4x) / 4 + offsetX}
                          y={(sqC_P1y + sqC_P2y + sqC_P3y + sqC_P4y) / 4 + offsetY}
                          className="text-sm fill-amber-600 font-medium"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          c²
                        </text>
                      </>
                    )}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-96 border-l bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Теорема Пифагора</h3>
              <span className="text-sm text-gray-500">a² + b² = c²</span>
            </div>

            {/* Formula */}
            <div className="text-center py-3 bg-gray-50 rounded-lg">
              <span className="text-2xl font-mono">
                {a}² + {b}² = {c.toFixed(2)}²
              </span>
              <div className="text-lg mt-1">
                {a * a} + {b * b} = {(c * c).toFixed(2)}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Cathetus a */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">Катет a = {a}</label>
                  <span className="text-gray-500">Сторона треугольника</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={a}
                  onChange={(e) => setA(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Cathetus b */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">Катет b = {b}</label>
                  <span className="text-gray-500">Сторона треугольника</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={b}
                  onChange={(e) => setB(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* Animation controls */}
            <div className="flex gap-2">
              <button
                onClick={startAnimation}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
              >
                <Play size={18} />
                Показать доказательство
              </button>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <RotateCcw size={18} />
                Сброс
              </button>
            </div>

            {/* Animation step explanation */}
            {animationStep > 0 && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {animationStep}
                  </div>
                  <p className="text-gray-800 font-medium text-sm">{animationSteps[animationStep]}</p>
                </div>
              </div>
            )}

            {/* Info panel */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-indigo-50 rounded text-center">
                <div className="text-gray-500">Катет a</div>
                <div className="text-lg font-bold text-indigo-600">{a}</div>
                <div className="text-xs text-gray-400">a² = {a * a}</div>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <div className="text-gray-500">Катет b</div>
                <div className="text-lg font-bold text-green-600">{b}</div>
                <div className="text-xs text-gray-400">b² = {b * b}</div>
              </div>
              <div className="p-2 bg-amber-50 rounded text-center">
                <div className="text-gray-500">Гипотенуза c</div>
                <div className="text-lg font-bold text-amber-600">{c.toFixed(2)}</div>
                <div className="text-xs text-gray-400">c² = {(c * c).toFixed(2)}</div>
              </div>
            </div>

            {/* Insert button */}
            {onInsert && (
              <button
                onClick={() => onInsert({ a, b })}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Добавить на холст
              </button>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default PythagoreanTheorem;
