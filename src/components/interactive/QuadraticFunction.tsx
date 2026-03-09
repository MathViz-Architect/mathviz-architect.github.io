import React, { useState, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';
import { CoordinateGrid } from './CoordinateGrid';

interface QuadraticFunctionProps {
  onInsert?: (params: { a: number; b: number; c: number }) => void;
}

export const QuadraticFunction: React.FC<QuadraticFunctionProps> = ({ onInsert }) => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [animating, setAnimating] = useState(false);

  const instructions = [
    'Параметр a управляет направлением ветвей параболы (вверх/вниз) и её шириной',
    'Параметр b сдвигает вершину параболы по горизонтали',
    'Параметр c сдвигает параболу по вертикали',
    'Дискриминант показывает количество корней уравнения',
    'Нажмите "Анимация" для автоматического изменения параметра a'
  ];

  // Calculate parabola points
  const points = useMemo(() => {
    const pts = [];
    const width = 400;
    const height = 300;
    const scaleX = 40; // pixels per unit
    const scaleY = 40; // pixels per unit
    const centerX = width / 2;
    const centerY = height / 2;

    for (let x = -5; x <= 5; x += 0.1) {
      const y = a * x * x + b * x + c;
      const px = centerX + x * scaleX;
      const py = centerY - y * scaleY;

      if (py >= -100 && py <= height + 100) {
        pts.push({ x: px, y: py, valueX: x, valueY: y });
      }
    }
    return pts;
  }, [a, b, c]);

  // Generate path for parabola
  const pathData = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  // Calculate vertex
  const vertex = useMemo(() => {
    const x = -b / (2 * a);
    const y = a * x * x + b * x + c;
    const width = 400;
    const height = 300;
    const scaleX = 40;
    const scaleY = 40;
    const centerX = width / 2;
    const centerY = height / 2;
    return {
      x: centerX + x * scaleX,
      y: centerY - y * scaleY,
      xValue: x,
      yValue: y
    };
  }, [a, b, c]);

  // Calculate discriminant and roots
  const discriminant = b * b - 4 * a * c;
  const roots = discriminant >= 0 && a !== 0
    ? [(-b + Math.sqrt(discriminant)) / (2 * a), (-b - Math.sqrt(discriminant)) / (2 * a)]
    : [];

  // Animation
  React.useEffect(() => {
    if (!animating) return;

    const interval = setInterval(() => {
      setA(prev => {
        let next = prev + 0.05;
        if (next > 3) next = -3;
        return Math.round(next * 100) / 100;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [animating]);

  const reset = () => {
    setA(1);
    setB(0);
    setC(0);
    setAnimating(false);
  };

  const toggleAnimation = () => {
    setAnimating(!animating);
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
            <svg viewBox="-20 -20 440 340" className="w-full h-auto border border-gray-200 rounded-lg bg-white shadow-sm">
              <CoordinateGrid width={400} height={300} scale={40} originX={200} originY={150} gridId="grid-quad" />

              {/* Parabola */}
              <path
                d={pathData}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Vertex */}
              <circle
                cx={vertex.x}
                cy={vertex.y}
                r="6"
                fill="#F59E0B"
                stroke="#B45309"
                strokeWidth="2"
              />
              <text x={vertex.x + 10} y={vertex.y - 10} className="text-xs fill-amber-600 font-medium">
                ({vertex.xValue.toFixed(1)}, {vertex.yValue.toFixed(1)})
              </text>

              {/* Roots */}
              {roots.map((root, i) => {
                const width = 400;
                const height = 300;
                const scaleX = 40;
                const centerX = width / 2;
                const centerY = height / 2;
                const rx = centerX + root * scaleX;
                return (
                  <circle
                    key={i}
                    cx={rx}
                    cy={centerY}
                    r="5"
                    fill="#10B981"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-96 border-l bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Квадратичная функция</h3>
              <span className="text-sm text-gray-500">y = ax² + bx + c</span>
            </div>

            {/* Formula display */}
            <div className="text-center py-3 bg-gray-50 rounded-lg">
              <span className="text-xl font-mono">
                y = {a}x² {b >= 0 ? '+' : '-'} {Math.abs(b)}x {c >= 0 ? '+' : '-'} {Math.abs(c)}
              </span>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Parameter a */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">a = {a.toFixed(2)}</label>
                  <span className="text-gray-500">{a > 0 ? 'Ветви вверх' : 'Ветви вниз'}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={a}
                  onChange={(e) => setA(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  disabled={animating}
                />
              </div>

              {/* Parameter b */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">b = {b.toFixed(2)}</label>
                  <span className="text-gray-500">Сдвиг вершины</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={b}
                  onChange={(e) => setB(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  disabled={animating}
                />
              </div>

              {/* Parameter c */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">c = {c.toFixed(2)}</label>
                  <span className="text-gray-500">Сдвиг по Y</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={c}
                  onChange={(e) => setC(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  disabled={animating}
                />
              </div>
            </div>

            {/* Animation controls */}
            <div className="flex gap-2">
              <button
                onClick={toggleAnimation}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${animating ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                  } hover:opacity-80`}
              >
                {animating ? <Pause size={18} /> : <Play size={18} />}
                {animating ? 'Пауза' : 'Анимация'}
              </button>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <RotateCcw size={18} />
                Сброс
              </button>
            </div>

            {/* Info panel */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Дискриминант: </span>
                <span className={`font-medium ${discriminant >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  D = {discriminant.toFixed(2)}
                </span>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Корни: </span>
                <span className="font-medium text-green-600">
                  {roots.length > 0 ? `x₁=${roots[0].toFixed(2)}, x₂=${roots[1].toFixed(2)}` : 'Нет'}
                </span>
              </div>
            </div>

            {/* Insert button */}
            {onInsert && (
              <button
                onClick={() => onInsert({ a, b, c })}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Добавить на холст
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuadraticFunction;
