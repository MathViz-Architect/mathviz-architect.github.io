import React, { useState, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ModuleInstructions } from './ModuleInstructions';

interface TrigonometricCircleProps {
  onInsert?: (params: { angle: number }) => void;
}

export const TrigonometricCircle: React.FC<TrigonometricCircleProps> = ({ onInsert }) => {
  const [angle, setAngle] = useState(45);
  const [angleUnit, setAngleUnit] = useState<'deg' | 'rad'>('deg');
  const [showProjections, setShowProjections] = useState(true);
  const [showSine, setShowSine] = useState(true);
  const [showCosine, setShowCosine] = useState(true);
  const [showTangent, setShowTangent] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(1);

  const instructions = [
    'Изменяйте угол с помощью слайдера для наблюдения за изменением sin, cos и tg',
    'Переключайтесь между градусами (°) и радианами (рад) с помощью кнопок',
    'Используйте чекбоксы для отображения/скрытия проекций и линий',
    'Красная линия показывает синус (вертикальная проекция)',
    'Зелёная линия показывает косинус (горизонтальная проекция)',
    'Оранжевая линия показывает тангенс',
    'Нажмите "Анимация" для автоматического вращения угла'
  ];

  // Convert angle to radians for calculations (angle is always stored in degrees internally)
  const angleRad = (angle * Math.PI) / 180;
  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);
  const tanVal = Math.abs(cosVal) > 0.001 ? Math.tan(angleRad) : Infinity;

  // Display value based on selected unit
  const displayValue = angleUnit === 'deg' ? angle : angleRad;

  // Animation with smooth frame rate
  React.useEffect(() => {
    if (!animating) return;

    let animationFrameId: number;
    let lastTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;

      // Update angle approximately every 30ms for smooth animation
      if (deltaTime >= 30) {
        setAngle(prev => {
          let next = prev + 2 * animationDirection;
          // Always work in degrees internally
          if (next > 360) next = 0;
          else if (next < 0) next = 360;
          return next;
        });
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animating, animationDirection]);

  const reset = () => {
    setAngle(45);
    setAnimating(false);
  };

  const centerX = 200;
  const centerY = 200;
  const radius = 120;

  // Calculate point on circle
  const pointX = centerX + radius * cosVal;
  const pointY = centerY - radius * sinVal;

  // Projection line lengths
  const projectionLength = 80;

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
            <svg viewBox="0 0 400 400" className="w-full h-auto border border-gray-200 rounded-lg bg-white shadow-sm">
              {/* Background */}
              <rect width="400" height="400" fill="#FAFAFA" />

              {/* Unit circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="white"
                stroke="#374151"
                strokeWidth="2"
              />

              {/* Axes */}
              <line x1="60" y1={centerY} x2="340" y2={centerY} stroke="#9CA3AF" strokeWidth="1" />
              <line x1={centerX} y1="60" x2={centerX} y2="340" stroke="#9CA3AF" strokeWidth="1" />

              {/* Quadrant labels */}
              <text x="300" y="100" className="text-xs fill-gray-400">I</text>
              <text x="100" y="100" className="text-xs fill-gray-400">II</text>
              <text x="100" y="310" className="text-xs fill-gray-400">III</text>
              <text x="300" y="310" className="text-xs fill-gray-400">IV</text>



              {/* Radius line to point */}
              <line
                x1={centerX}
                y1={centerY}
                x2={pointX}
                y2={pointY}
                stroke="#4F46E5"
                strokeWidth="2"
              />

              {/* Point on circle */}
              <circle
                cx={pointX}
                cy={pointY}
                r="6"
                fill="#4F46E5"
                stroke="white"
                strokeWidth="2"
              />

              {/* Sine - vertical projection */}
              {showProjections && showSine && (
                <>
                  <line
                    x1={pointX}
                    y1={pointY}
                    x2={pointX}
                    y2={centerY}
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  <line
                    x1={pointX}
                    y1={centerY}
                    x2={pointX}
                    y2={centerY - sinVal * radius}
                    stroke="#EF4444"
                    strokeWidth="3"
                  />
                  <text x={pointX + 5} y={centerY - sinVal * radius / 2} className="text-xs fill-red-500 font-medium">
                    sin
                  </text>
                </>
              )}

              {/* Cosine - horizontal projection */}
              {showProjections && showCosine && (
                <>
                  <line
                    x1={pointX}
                    y1={pointY}
                    x2={centerX}
                    y2={pointY}
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  <line
                    x1={centerX}
                    y1={pointY}
                    x2={centerX + cosVal * radius}
                    y2={pointY}
                    stroke="#10B981"
                    strokeWidth="3"
                  />
                  <text x={centerX + cosVal * radius / 2} y={pointY - 8} className="text-xs fill-green-500 font-medium">
                    cos
                  </text>
                </>
              )}

              {/* Tangent */}
              {showProjections && showTangent && Math.abs(cosVal) > 0.1 && (
                <>
                  <line
                    x1={centerX + radius}
                    y1={centerY}
                    x2={centerX + radius}
                    y2={centerY - tanVal * radius * 0.3}
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  <circle
                    cx={centerX + radius}
                    cy={centerY - tanVal * radius * 0.3}
                    r="4"
                    fill="#F59E0B"
                  />
                  <text x={centerX + radius + 5} y={centerY - tanVal * radius * 0.3} className="text-xs fill-amber-500 font-medium">
                    tg
                  </text>
                </>
              )}

              {/* Axis labels */}
              <text x="340" y={centerY + 15} className="text-xs fill-gray-600">1</text>
              <text x={centerX - 15} y="65" className="text-xs fill-gray-600">1</text>
            </svg>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-96 border-l bg-white overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Тригонометрическая окружность</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setAngleUnit('deg')}
                  className={`px-2 py-1 text-xs rounded ${angleUnit === 'deg' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                >
                  °
                </button>
                <button
                  onClick={() => setAngleUnit('rad')}
                  className={`px-2 py-1 text-xs rounded ${angleUnit === 'rad' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                >
                  рад
                </button>
              </div>
            </div>

            {/* Formula display */}
            <div className="text-center py-3 bg-gray-50 rounded-lg">
              <span className="text-xl font-mono">
                sin({angleUnit === 'deg' ? angle.toFixed(1) : angleRad.toFixed(2)}{angleUnit === 'deg' ? '°' : ''}) = {sinVal.toFixed(3)}
              </span>
              <div className="text-lg mt-1">
                cos({angleUnit === 'deg' ? angle.toFixed(1) : angleRad.toFixed(2)}{angleUnit === 'deg' ? '°' : ''}) = {cosVal.toFixed(3)}
              </div>
              {Math.abs(tanVal) < 100 && (
                <div className="text-lg">
                  tg({angleUnit === 'deg' ? angle.toFixed(1) : angleRad.toFixed(2)}{angleUnit === 'deg' ? '°' : ''}) = {tanVal.toFixed(3)}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Angle slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">
                    Угол {angleUnit === 'deg' ? 'α' : 'x'} = {angleUnit === 'deg' ? angle.toFixed(1) + '°' : angleRad.toFixed(2)}
                  </label>
                  <span className="text-gray-500">
                    {angleUnit === 'deg'
                      ? `${(angleRad / Math.PI).toFixed(2)}π`
                      : `${angle.toFixed(1)}°`
                    }
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={angleUnit === 'deg' ? '360' : (2 * Math.PI).toFixed(2)}
                  step={angleUnit === 'deg' ? '1' : '0.01'}
                  value={angleUnit === 'deg' ? angle : angleRad}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    // Convert to degrees for internal storage
                    setAngle(angleUnit === 'deg' ? val : (val * 180) / Math.PI);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  disabled={animating}
                />
              </div>

              {/* Toggle projections */}
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showProjections}
                    onChange={(e) => setShowProjections(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  Линии проекций
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showSine}
                    onChange={(e) => setShowSine(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  sin
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showCosine}
                    onChange={(e) => setShowCosine(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  cos
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showTangent}
                    onChange={(e) => setShowTangent(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  tg
                </label>
              </div>
            </div>

            {/* Animation controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setAnimating(!animating)}
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

            {/* Values table */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-red-50 rounded text-center">
                <div className="text-gray-500">sin α</div>
                <div className="text-lg font-bold text-red-600">{sinVal.toFixed(3)}</div>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <div className="text-gray-500">cos α</div>
                <div className="text-lg font-bold text-green-600">{cosVal.toFixed(3)}</div>
              </div>
              <div className="p-2 bg-amber-50 rounded text-center">
                <div className="text-gray-500">tg α</div>
                <div className="text-lg font-bold text-amber-600">
                  {Math.abs(tanVal) < 100 ? tanVal.toFixed(3) : '—'}
                </div>
              </div>
            </div>

            {/* Insert button */}
            {onInsert && (
              <button
                onClick={() => onInsert({ angle })}
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

export default TrigonometricCircle;
