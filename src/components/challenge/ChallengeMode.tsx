import React, { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, HelpCircle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  task: string;
  type: 'fraction' | 'function' | 'geometry' | 'comparison' | 'sequence' | 'magic-square' | 'perimeter' | 'triangle-type';
  targetValue?: number;
  tolerance?: number;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  // For comparison challenges
  num1?: number;
  num2?: number;
  correctSign?: '>' | '<' | '=';
  // For sequence challenges
  sequence?: number[];
  missingIndex?: number;
  // For magic square challenges
  grid?: (number | null)[][];
  missingCells?: { row: number; col: number; value: number }[];
  // For perimeter challenges
  width?: number;
  height?: number;
  // For triangle type challenges
  sides?: [number, number, number];
  correctType?: 'equilateral' | 'isosceles' | 'scalene';
}

const challenges: Challenge[] = [
  // Numbers and Logic (Grade 5)
  {
    id: 'comparison-1',
    title: 'Сравнение чисел: Трёхзначные',
    description: 'Сравните два числа',
    task: 'Выберите правильный знак',
    type: 'comparison',
    num1: 345,
    num2: 354,
    correctSign: '<',
    hint: 'Сравните числа поразрядно: сотни, десятки, единицы',
    difficulty: 'easy',
  },
  {
    id: 'comparison-2',
    title: 'Сравнение чисел: Четырёхзначные',
    description: 'Сравните два числа',
    task: 'Выберите правильный знак',
    type: 'comparison',
    num1: 1234,
    num2: 1234,
    correctSign: '=',
    hint: 'Если все разряды равны, числа равны',
    difficulty: 'easy',
  },
  {
    id: 'sequence-1',
    title: 'Найди закономерность: Чётные числа',
    description: 'Продолжите числовой ряд',
    task: 'Какое число пропущено?',
    type: 'sequence',
    sequence: [2, 4, 6, 8, null as any],
    missingIndex: 4,
    targetValue: 10,
    tolerance: 0,
    hint: 'Каждое следующее число больше предыдущего на 2',
    difficulty: 'easy',
  },
  {
    id: 'sequence-2',
    title: 'Найди закономерность: Умножение',
    description: 'Продолжите числовой ряд',
    task: 'Какое число пропущено?',
    type: 'sequence',
    sequence: [3, 6, 12, 24, null as any],
    missingIndex: 4,
    targetValue: 48,
    tolerance: 0,
    hint: 'Каждое следующее число в 2 раза больше предыдущего',
    difficulty: 'medium',
  },
  {
    id: 'magic-square-1',
    title: 'Магический квадрат: Простой',
    description: 'Заполните пропущенные числа',
    task: 'Сумма в каждой строке, столбце и диагонали должна быть равна 15',
    type: 'magic-square',
    grid: [
      [2, 7, 6],
      [9, 5, 1],
      [4, 3, 8],
    ],
    missingCells: [
      { row: 0, col: 0, value: 2 },
      { row: 1, col: 2, value: 1 },
      { row: 2, col: 1, value: 3 },
    ],
    hint: 'Сумма чисел в каждой строке, столбце и диагонали равна 15',
    difficulty: 'medium',
  },
  {
    id: 'perimeter-1',
    title: 'Периметр прямоугольника: Простой',
    description: 'Вычислите периметр',
    task: 'Чему равен периметр прямоугольника?',
    type: 'perimeter',
    width: 5,
    height: 3,
    targetValue: 16,
    tolerance: 0,
    hint: 'Периметр = 2 × (длина + ширина)',
    difficulty: 'easy',
  },
  {
    id: 'perimeter-2',
    title: 'Периметр прямоугольника: Средний',
    description: 'Вычислите периметр',
    task: 'Чему равен периметр прямоугольника?',
    type: 'perimeter',
    width: 12,
    height: 8,
    targetValue: 40,
    tolerance: 0,
    hint: 'Периметр = 2 × (12 + 8)',
    difficulty: 'easy',
  },
  {
    id: 'triangle-type-1',
    title: 'Тип треугольника: Равносторонний',
    description: 'Определите тип треугольника',
    task: 'Какой это треугольник?',
    type: 'triangle-type',
    sides: [5, 5, 5],
    correctType: 'equilateral',
    hint: 'Если все стороны равны, треугольник равносторонний',
    difficulty: 'easy',
  },
  {
    id: 'triangle-type-2',
    title: 'Тип треугольника: Равнобедренный',
    description: 'Определите тип треугольника',
    task: 'Какой это треугольник?',
    type: 'triangle-type',
    sides: [5, 5, 3],
    correctType: 'isosceles',
    hint: 'Если две стороны равны, треугольник равнобедренный',
    difficulty: 'easy',
  },
  {
    id: 'triangle-type-3',
    title: 'Тип треугольника: Разносторонний',
    description: 'Определите тип треугольника',
    task: 'Какой это треугольник?',
    type: 'triangle-type',
    sides: [3, 4, 5],
    correctType: 'scalene',
    hint: 'Если все стороны разные, треугольник разносторонний',
    difficulty: 'easy',
  },
  // Fractions
  {
    id: 'fraction-1',
    title: 'Дроби: Половина',
    description: 'Преобразуйте дробь в десятичное число',
    task: 'Чему равна дробь 1/2 в десятичной форме?',
    type: 'fraction',
    targetValue: 0.5,
    tolerance: 0.01,
    hint: 'Разделите числитель на знаменатель: 1 ÷ 2',
    difficulty: 'easy',
  },
  {
    id: 'fraction-2',
    title: 'Дроби: Три четверти',
    description: 'Преобразуйте дробь в десятичное число',
    task: 'Чему равна дробь 3/4 в десятичной форме?',
    type: 'fraction',
    targetValue: 0.75,
    tolerance: 0.01,
    hint: 'Разделите числитель на знаменатель: 3 ÷ 4',
    difficulty: 'easy',
  },
  {
    id: 'fraction-3',
    title: 'Дроби: Две трети',
    description: 'Преобразуйте дробь в десятичное число',
    task: 'Чему равна дробь 2/3 в десятичной форме? (округлите до сотых)',
    type: 'fraction',
    targetValue: 0.67,
    tolerance: 0.01,
    hint: 'Разделите 2 на 3 и округлите до сотых: 2 ÷ 3 ≈ 0.67',
    difficulty: 'medium',
  },
  {
    id: 'function-1',
    title: 'Линейная функция: Точка пересечения',
    description: 'Найдите точку пересечения с осью Y',
    task: 'При каком b график y = x + b проходит через точку (0, 2)?',
    type: 'function',
    targetValue: 2,
    tolerance: 0.1,
    hint: 'Точка пересечения с осью Y имеет координату x = 0. Подставьте x = 0 в формулу',
    difficulty: 'easy',
  },
  {
    id: 'function-2',
    title: 'Линейная функция: Наклон',
    description: 'Определите коэффициент наклона',
    task: 'Если график проходит через точки (0, 0) и (2, 6), чему равен коэффициент k в формуле y = kx?',
    type: 'function',
    targetValue: 3,
    tolerance: 0.1,
    hint: 'k = (y₂ - y₁) / (x₂ - x₁)',
    difficulty: 'medium',
  },
  {
    id: 'pythagorean-1',
    title: 'Теорема Пифагора: Египетский треугольник',
    description: 'Найдите гипотенузу',
    task: 'Если катеты a = 3 и b = 4, чему равна гипотенуза c?',
    type: 'geometry',
    targetValue: 5,
    tolerance: 0.1,
    hint: 'Используйте формулу a² + b² = c². Вычислите 3² + 4² и извлеките корень',
    difficulty: 'easy',
  },
  {
    id: 'pythagorean-2',
    title: 'Теорема Пифагора: Равнобедренный треугольник',
    description: 'Найдите гипотенузу равнобедренного треугольника',
    task: 'Если оба катета равны 5, чему равна гипотенуза c? (округлите до десятых)',
    type: 'geometry',
    targetValue: 7.1,
    tolerance: 0.1,
    hint: 'a² + b² = c², где a = b = 5. Вычислите √(5² + 5²)',
    difficulty: 'medium',
  },
  {
    id: 'pythagorean-3',
    title: 'Теорема Пифагора: Обратная задача',
    description: 'Найдите катет',
    task: 'Если гипотенуза c = 10, а катет a = 6, чему равен катет b?',
    type: 'geometry',
    targetValue: 8,
    tolerance: 0.1,
    hint: 'Из формулы a² + b² = c² выразите b: b = √(c² - a²)',
    difficulty: 'hard',
  },
  {
    id: 'linear-function-3',
    title: 'Линейная функция: Параллельные прямые',
    description: 'Найдите коэффициент параллельной прямой',
    task: 'Прямая y = 2x + 3 параллельна прямой y = kx + 5. Чему равен k?',
    type: 'function',
    targetValue: 2,
    tolerance: 0.1,
    hint: 'Параллельные прямые имеют одинаковый коэффициент наклона k',
    difficulty: 'easy',
  },
  {
    id: 'quadratic-1',
    title: 'Квадратичная функция: Вершина параболы',
    description: 'Найдите координату вершины',
    task: 'Для функции y = x² - 4x + 3, чему равна x-координата вершины параболы?',
    type: 'function',
    targetValue: 2,
    tolerance: 0.1,
    hint: 'Формула для x-координаты вершины: x = -b/(2a), где a=1, b=-4',
    difficulty: 'medium',
  },
  {
    id: 'quadratic-2',
    title: 'Квадратичная функция: Нули функции',
    description: 'Найдите корень уравнения',
    task: 'Решите уравнение x² - 5x + 6 = 0. Чему равен меньший корень?',
    type: 'function',
    targetValue: 2,
    tolerance: 0.1,
    hint: 'Разложите на множители: (x-2)(x-3) = 0, или используйте формулу корней',
    difficulty: 'medium',
  },
  {
    id: 'trig-1',
    title: 'Тригонометрия: Синус 30°',
    description: 'Вычислите значение синуса',
    task: 'Чему равен sin(30°)?',
    type: 'function',
    targetValue: 0.5,
    tolerance: 0.01,
    hint: 'sin(30°) = 1/2 = 0.5 — это табличное значение',
    difficulty: 'easy',
  },
  {
    id: 'trig-2',
    title: 'Тригонометрия: Косинус 60°',
    description: 'Вычислите значение косинуса',
    task: 'Чему равен cos(60°)?',
    type: 'function',
    targetValue: 0.5,
    tolerance: 0.01,
    hint: 'cos(60°) = 1/2 = 0.5 — это табличное значение',
    difficulty: 'easy',
  },
  {
    id: 'trig-3',
    title: 'Тригонометрия: Тангенс 45°',
    description: 'Вычислите значение тангенса',
    task: 'Чему равен tg(45°)?',
    type: 'function',
    targetValue: 1,
    tolerance: 0.01,
    hint: 'tg(45°) = sin(45°)/cos(45°) = 1 — это табличное значение',
    difficulty: 'easy',
  },
];

interface ChallengeModeProps {
  onClose?: () => void;
}

export const ChallengeMode: React.FC<ChallengeModeProps> = ({ onClose }) => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedSign, setSelectedSign] = useState<'>' | '<' | '=' | null>(null);
  const [selectedTriangleType, setSelectedTriangleType] = useState<'equilateral' | 'isosceles' | 'scalene' | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Category structure
  const categoryStructure = {
    grade5: {
      name: '5 класс',
      color: 'blue',
      topics: {
        numbersLogic: {
          name: 'Числа и логика',
          challenges: challenges.filter(c =>
            c.type === 'comparison' ||
            c.type === 'sequence' ||
            c.type === 'magic-square' ||
            c.type === 'perimeter' ||
            c.type === 'triangle-type'
          )
        },
      },
    },
    algebra: {
      name: 'Алгебра',
      color: 'indigo',
      topics: {
        fractions: { name: 'Дроби', challenges: challenges.filter(c => c.type === 'fraction') },
        linear: { name: 'Линейные функции', challenges: challenges.filter(c => c.type === 'function' && (c.id.includes('linear') || c.id.includes('function-'))) },
        quadratic: { name: 'Квадратичные функции', challenges: challenges.filter(c => c.id.includes('quadratic')) },
      },
    },
    geometry: {
      name: 'Геометрия',
      color: 'green',
      topics: {
        pythagorean: { name: 'Теорема Пифагора', challenges: challenges.filter(c => c.type === 'geometry') },
      },
    },
    trigonometry: {
      name: 'Тригонометрия',
      color: 'red',
      topics: {
        basic: { name: 'Основные функции', challenges: challenges.filter(c => c.id.includes('trig')) },
      },
    },
  };

  const handleCheck = () => {
    if (!activeChallenge) return;

    let isCorrect = false;

    switch (activeChallenge.type) {
      case 'comparison':
        isCorrect = selectedSign === activeChallenge.correctSign;
        break;

      case 'triangle-type':
        isCorrect = selectedTriangleType === activeChallenge.correctType;
        break;

      case 'sequence':
      case 'perimeter':
      case 'fraction':
      case 'function':
      case 'geometry':
        if (!userAnswer) return;
        const answer = parseFloat(userAnswer.replace(',', '.'));
        isCorrect = Math.abs(answer - (activeChallenge.targetValue || 0)) <= (activeChallenge.tolerance || 0);
        break;

      case 'magic-square':
        // For now, just check if user entered something (simplified)
        isCorrect = userAnswer !== '';
        break;
    }

    if (isCorrect) {
      setResult('correct');
      if (!completedChallenges.includes(activeChallenge.id)) {
        setCompletedChallenges([...completedChallenges, activeChallenge.id]);
      }
    } else {
      setResult('incorrect');
    }
  };

  const handleNextChallenge = () => {
    setActiveChallenge(null);
    setUserAnswer('');
    setSelectedSign(null);
    setSelectedTriangleType(null);
    setResult(null);
    setShowHint(false);
  };

  const handleBack = () => {
    if (activeChallenge) {
      // From challenge to topic
      setActiveChallenge(null);
      setUserAnswer('');
      setResult(null);
      setShowHint(false);
    } else if (selectedTopic) {
      // From topic to category
      setSelectedTopic(null);
    } else if (selectedCategory) {
      // From category to main
      setSelectedCategory(null);
    }
    // Reset states
    setUserAnswer('');
    setSelectedSign(null);
    setSelectedTriangleType(null);
    setResult(null);
    setShowHint(false);
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
    }
  };

  // If a challenge is selected, show the challenge interface
  if (activeChallenge) {
    return (
      <div className="h-full overflow-auto bg-white p-6">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          ← Назад к задачам
        </button>

        {/* Challenge header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(activeChallenge.difficulty)}`}>
              {activeChallenge.difficulty === 'easy' ? 'Легко' : activeChallenge.difficulty === 'medium' ? 'Средне' : 'Сложно'}
            </span>
            {completedChallenges.includes(activeChallenge.id) && (
              <CheckCircle size={20} className="text-green-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{activeChallenge.title}</h2>
          <p className="text-gray-600 mt-2">{activeChallenge.description}</p>
        </div>

        {/* Task */}
        <div className="bg-indigo-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-indigo-800 mb-2">Задача:</h3>
          <p className="text-indigo-700">{activeChallenge.task}</p>
        </div>

        {/* Hint */}
        <div className="mb-6">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <HelpCircle size={16} />
            {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
          </button>
          {showHint && (
            <div className="mt-2 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
              💡 {activeChallenge.hint}
            </div>
          )}
        </div>

        {/* Answer input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ваш ответ:
          </label>

          {/* Comparison challenge */}
          {activeChallenge.type === 'comparison' && (
            <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-800">{activeChallenge.num1}</div>
              <div className="flex gap-2">
                {['>', '<', '='].map((sign) => (
                  <button
                    key={sign}
                    onClick={() => setSelectedSign(sign as '>' | '<' | '=')}
                    className={`w-16 h-16 text-2xl font-bold rounded-lg border-2 transition-all ${selectedSign === sign
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                      }`}
                  >
                    {sign}
                  </button>
                ))}
              </div>
              <div className="text-3xl font-bold text-gray-800">{activeChallenge.num2}</div>
            </div>
          )}

          {/* Sequence challenge */}
          {activeChallenge.type === 'sequence' && (
            <div>
              <div className="flex items-center justify-center gap-3 p-6 bg-gray-50 rounded-xl mb-4">
                {activeChallenge.sequence?.map((num, idx) => (
                  <div key={idx} className="text-2xl font-bold text-gray-800">
                    {num !== null ? num : '?'}
                    {idx < (activeChallenge.sequence?.length || 0) - 1 && <span className="mx-2 text-gray-400">,</span>}
                  </div>
                ))}
              </div>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Введите пропущенное число..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              />
            </div>
          )}

          {/* Perimeter challenge */}
          {activeChallenge.type === 'perimeter' && (
            <div>
              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl mb-4">
                <svg width="200" height="150" className="mb-4">
                  <rect
                    x="50"
                    y="25"
                    width={activeChallenge.width! * 10}
                    height={activeChallenge.height! * 10}
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="2"
                  />
                  <text x="100" y="15" textAnchor="middle" className="text-sm fill-gray-700">
                    {activeChallenge.width} см
                  </text>
                  <text x="30" y="75" textAnchor="middle" className="text-sm fill-gray-700">
                    {activeChallenge.height} см
                  </text>
                </svg>
              </div>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Введите периметр в см..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              />
            </div>
          )}

          {/* Triangle type challenge */}
          {activeChallenge.type === 'triangle-type' && (
            <div>
              <div className="flex items-center justify-center gap-6 p-6 bg-gray-50 rounded-xl mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Стороны треугольника:</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {activeChallenge.sides?.join(', ')} см
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'equilateral', label: 'Равносторонний' },
                  { value: 'isosceles', label: 'Равнобедренный' },
                  { value: 'scalene', label: 'Разносторонний' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTriangleType(option.value as any)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${selectedTriangleType === option.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Magic square challenge */}
          {activeChallenge.type === 'magic-square' && (
            <div>
              <div className="flex justify-center p-6 bg-gray-50 rounded-xl mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {activeChallenge.grid?.flat().map((num, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-16 flex items-center justify-center border-2 border-gray-300 rounded-lg bg-white text-xl font-bold text-gray-800"
                    >
                      {num !== null ? num : '?'}
                    </div>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Введите пропущенные числа через запятую..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              />
            </div>
          )}

          {/* Default numeric input for other types */}
          {!['comparison', 'sequence', 'perimeter', 'triangle-type', 'magic-square'].includes(activeChallenge.type) && (
            <div className="flex gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Введите число..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              />
              <button
                onClick={handleCheck}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                Проверить
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Check button for special types */}
          {['comparison', 'triangle-type'].includes(activeChallenge.type) && (
            <button
              onClick={handleCheck}
              className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              Проверить
              <ArrowRight size={18} />
            </button>
          )}

          {/* Check button for input types */}
          {['sequence', 'perimeter', 'magic-square'].includes(activeChallenge.type) && (
            <button
              onClick={handleCheck}
              className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              Проверить
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${result === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result === 'correct' ? (
              <>
                <CheckCircle size={24} />
                <div>
                  <div className="font-semibold">Правильно! 🎉</div>
                  <div className="text-sm">Вы успешно решили задачу.</div>
                </div>
              </>
            ) : (
              <>
                <XCircle size={24} />
                <div>
                  <div className="font-semibold">Неправильно 😔</div>
                  <div className="text-sm">Попробуйте ещё раз или посмотрите подсказку.</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Next button */}
        {result === 'correct' && (
          <button
            onClick={handleNextChallenge}
            className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Следующая задача →
          </button>
        )}
      </div>
    );
  }

  // If a topic is selected, show challenges for that topic
  if (selectedTopic && selectedCategory) {
    const category = categoryStructure[selectedCategory as keyof typeof categoryStructure];
    const topic = category.topics[selectedTopic as keyof typeof category.topics];

    return (
      <div className="h-full overflow-auto bg-white p-6">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          ← Назад к темам
        </button>

        {/* Topic header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{topic.name}</h2>
          <p className="text-gray-500 mt-1">
            {topic.challenges.filter(c => completedChallenges.includes(c.id)).length} / {topic.challenges.length} задач выполнено
          </p>
        </div>

        {/* Challenge list */}
        <div className="space-y-3">
          {topic.challenges.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => setActiveChallenge(challenge)}
              className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty === 'easy' ? 'Легко' : challenge.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                    </span>
                    {completedChallenges.includes(challenge.id) && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                  <div className="font-medium text-gray-800">{challenge.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{challenge.description}</div>
                </div>
                <ArrowRight size={20} className="text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // If a category is selected, show topics for that category
  if (selectedCategory) {
    const category = categoryStructure[selectedCategory as keyof typeof categoryStructure];

    return (
      <div className="h-full overflow-auto bg-white p-6">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="mb-4 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          ← Назад к категориям
        </button>

        {/* Category header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
          <p className="text-gray-500 mt-1">Выберите тему для изучения</p>
        </div>

        {/* Topic list */}
        <div className="space-y-3">
          {Object.entries(category.topics).map(([topicKey, topic]) => {
            const completed = topic.challenges.filter(c => completedChallenges.includes(c.id)).length;
            const total = topic.challenges.length;
            const progress = (completed / total) * 100;

            return (
              <button
                key={topicKey}
                onClick={() => setSelectedTopic(topicKey)}
                className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{topic.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {completed} / {total} задач выполнено
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-400" />
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`bg-${category.color}-600 h-1.5 rounded-full transition-all`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Show category list (main view)
  return (
    <div className="h-full overflow-auto bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Задачи и упражнения</h2>
        <p className="text-gray-500 mt-1">
          Решайте математические задачи и проверяйте свои знания
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Общий прогресс</span>
          <span className="text-sm text-gray-500">
            {completedChallenges.length} / {challenges.length} задач
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedChallenges.length / challenges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category list */}
      <div className="space-y-3">
        {Object.entries(categoryStructure).map(([categoryKey, category]) => {
          const allChallenges = Object.values(category.topics).flatMap(t => t.challenges);
          const completed = allChallenges.filter(c => completedChallenges.includes(c.id)).length;
          const total = allChallenges.length;
          const progress = (completed / total) * 100;

          return (
            <button
              key={categoryKey}
              onClick={() => setSelectedCategory(categoryKey)}
              className="w-full p-5 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3 h-3 bg-${category.color}-500 rounded-full`} />
                    <div className="font-semibold text-lg text-gray-800">{category.name}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {Object.keys(category.topics).length} {Object.keys(category.topics).length === 1 ? 'тема' : 'темы'} • {completed} / {total} задач выполнено
                  </div>
                </div>
                <ArrowRight size={24} className="text-gray-400" />
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${category.color}-600 h-2 rounded-full transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Coming soon notice */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-500 text-center">
          📝 В разработке: больше задач по тригонометрии, графикам функций и стереометрии
        </p>
      </div>
    </div>
  );
};

export default ChallengeMode;
