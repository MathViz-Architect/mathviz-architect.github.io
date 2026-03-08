import React, { useState, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';
import { Tooltip } from './Tooltip';
import { CoordinateGrid } from './CoordinateGrid';

interface LinearFunctionProps {
  onInsert?: (params: { k: number; b: number }) => void;
}

export const LinearFunction: React.FC<LinearFunctionProps> = ({ onInsert }) => {
  const [k, setK] = useState(1);
  const [b, setB] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'k' | 'b' | 'both'>('both');

  const instructions = [
    'Используйте слайдер k для изменения угла наклона прямой',
    'Используйте слайдер b для вертикального сдвига прямой',
    'Наблюдайте, как меняется график при изменении параметров',
    'Нажмите "Анимация" для автоматического изменения параметров',
    'Точки пересечения с осями показаны цветными кружками'
  ];

  // Calculate line points
  const points = useMemo(() => {
    const width = 400;
    const height = 300;
    const scaleX = 40;
    const scaleY = 40;
    const centerX = width / 2;
    const centerY = height / 2;

    const pts = [];
    for (let x = -5; x <= 5; x += 0.1) {
      const y = k * x + b;
      const px = centerX + x * scaleX;
      const py = centerY - y * scaleY;
      pts.push({ x: px, y: py });
    }
    return pts;
  }, [k, b]);

  // Generate path
  const pathData = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  // Calculate intercepts
  const yIntercept = b;
  const xIntercept = k !== 0 ? -b / k : null;

  // Animation
  React.useEffect(() => {
    if (!animating) return;

    const interval = setInterval(() => {
      if (animationType === 'k' || animationType === 'both') {
        setK(prev => {
          let next = prev + 0.05;
          if (next > 3) next = -3;
          if (Math.abs(next) < 0.1) next = 0.1;
          return Math.round(next * 100) / 100;
        });
      }
      if (animationType === 'b' || animationType === 'both') {
        setB(prev => {
          let next = prev + 0.1;
          if (next > 5) next = -5;
          return Math.round(next * 10) / 10;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [animating, animationType]);

  const reset = () => {
    setK(1);
    setB(0);
    setAnimating(false);
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
            <svg viewBox="0 0 400 300" className="w-full h-auto border border-gray-200 rounded-lg bg-white shadow-sm">
              <CoordinateGrid width={400} height={300} scale={40} originX={200} originY={150} gridId="grid-linear" />

              {/* Line */}
              <path
                d={pathData}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Y-intercept point */}
              <circle
                cx={200}
                cy={150 - b * 40}
                r="5"
                fill="#F59E0B"
              />
              <text x={210} y={150 - b * 40 - 5} className="text-xs fill-amber-600 font-medium">
                (0, {b.toFixed(1)})
              </text>

              {/* X-intercept point */}
              {xIntercept !== null && xIntercept >= -5 && xIntercept <= 5 && (
                <>
                  <circle
                    cx={200 + xIntercept * 40}
                    cy={150}
                    r="5"
                    fill="#10B981"
                  />
                  <text x={200 + xIntercept * 40 + 5} y={145} className="text-xs fill-green-600 font-medium">
                    ({xIntercept.toFixed(1)}, 0)
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-96 border-l bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Линейная функция</h3>
              <span className="text-sm text-gray-500">y = kx + b</span>
            </div>

            {/* Formula display */}
            <div className="text-center py-3 bg-gray-50 rounded-lg">
              <span className="text-xl font-mono">
                y = {k.toFixed(1)}x {b >= 0 ? '+' : '-'} {Math.abs(b.toFixed(1))}
              </span>
              <div className="text-sm text-gray-500 mt-1">
                Угол наклона: α = arctg({k.toFixed(1)}) = {Math.atan(k).toFixed(2)} рад
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Parameter k */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">k = {k.toFixed(2)}</label>
                  <span className="text-gray-500">
                    {k > 0 ? 'Возрастает' : k < 0 ? 'Убывает' : 'Параллельно оси'}
                  </span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={k}
                  onChange={(e) => setK(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  disabled={animating && (animationType === 'k' || animationType === 'both')}
                />
              </div>

              {/* Parameter b */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">b = {b.toFixed(2)}</label>
                  <span className="text-gray-500">Сдвиг по оси Y</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={b}
                  onChange={(e) => setB(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  disabled={animating && (animationType === 'b' || animationType === 'both')}
                />
              </div>

              {/* Animation type */}
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => setAnimationType('k')}
                  className={`px-3 py-1 rounded ${animationType === 'k' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                  disabled={animating}
                >
                  Анимировать k
                </button>
                <button
                  onClick={() => setAnimationType('b')}
                  className={`px-3 py-1 rounded ${animationType === 'b' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                  disabled={animating}
                >
                  Анимировать b
                </button>
                <button
                  onClick={() => setAnimationType('both')}
                  className={`px-3 py-1 rounded ${animationType === 'both' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                  disabled={animating}
                >
                  Оба
                </button>
              </div>
            </div>

            {/* Animation controls */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setAnimating(!animating)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${animating ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'} hover:opacity-80`}
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
            </div>

            {/* Info panel */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Точка пересечения с Y: </span>
                <span className="font-medium">(0, {b.toFixed(1)})</span>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-gray-500">Точка пересечения с X: </span>
                <span className="font-medium">
                  {xIntercept !== null ? `(${xIntercept.toFixed(1)}, 0)` : 'Нет'}
                </span>
              </div>
            </div>

            {/* Insert button */}
            {onInsert && (
              <button
                onClick={() => onInsert({ k, b })}
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

export default LinearFunction;
