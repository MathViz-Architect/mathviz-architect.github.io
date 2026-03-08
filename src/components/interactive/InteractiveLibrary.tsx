import React, { useState } from 'react';
import { Calculator, TrendingUp, Triangle, Circle, BarChart2, GitBranch, Move3d, Waves, Grid3x3, Crosshair, Layers, Minimize2, Maximize2 } from 'lucide-react';
import { QuadraticFunction } from './QuadraticFunction';
import { LinearFunction } from './LinearFunction';
import { PythagoreanTheorem } from './PythagoreanTheorem';
import { TrigonometricCircle } from './TrigonometricCircle';
import { ExponentialFunction } from './ExponentialFunction';
import { LogarithmicFunction } from './LogarithmicFunction';
import { VectorOperations } from './VectorOperations';
import { DerivativeExplorer } from './DerivativeExplorer';
import { ProbabilityTree } from './ProbabilityTree';
import { TrigonometricFunctions } from './TrigonometricFunctions';
import { CoordinatePlane } from './CoordinatePlane';
import { FunctionIntersections } from './FunctionIntersections';
import { InequalitySystems } from './InequalitySystems';
import { ParallelLines } from './ParallelLines';
import { TriangleSimilarity } from './TriangleSimilarity';

interface InteractiveModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  category: 'algebra' | 'geometry' | 'trigonometry' | 'functions';
}

const modules: InteractiveModule[] = [
  {
    id: 'linear',
    name: 'Линейная функция',
    description: 'y = kx + b, изучите влияние коэффициентов на график',
    icon: TrendingUp,
    category: 'algebra',
  },
  {
    id: 'quadratic',
    name: 'Квадратичная функция',
    description: 'y = ax² + bx + c, парабола и её параметры',
    icon: TrendingUp,
    category: 'functions',
  },
  {
    id: 'exponential',
    name: 'Показательная функция',
    description: 'y = a · bˣ + c, экспоненциальный рост и убывание',
    icon: TrendingUp,
    category: 'functions',
  },
  {
    id: 'logarithmic',
    name: 'Логарифмическая функция',
    description: 'y = a · log_b(x) + c, обратная к показательной',
    icon: TrendingUp,
    category: 'functions',
  },
  {
    id: 'derivative',
    name: 'Производная',
    description: 'Исследование функции и её производной, экстремумы',
    icon: TrendingUp,
    category: 'functions',
  },
  {
    id: 'pythagorean',
    name: 'Теорема Пифагора',
    description: 'a² + b² = c², интерактивное доказательство',
    icon: Triangle,
    category: 'geometry',
  },
  {
    id: 'vectors',
    name: 'Векторы',
    description: 'Операции с векторами: сложение, вычитание, скалярное произведение',
    icon: Move3d,
    category: 'geometry',
  },
  {
    id: 'trigonometry',
    name: 'Тригонометрическая окружность',
    description: 'Связь синуса, косинуса и тангенса с точкой на окружности',
    icon: Circle,
    category: 'trigonometry',
  },
  {
    id: 'probability',
    name: 'Вероятностное дерево',
    description: 'Визуализация условных вероятностей и формула полной вероятности',
    icon: GitBranch,
    category: 'algebra',
  },
  {
    id: 'trig-functions',
    name: 'Тригонометрические функции',
    description: 'Графики sin, cos, tan с изменением амплитуды, периода и фазы',
    icon: Waves,
    category: 'trigonometry',
  },
  {
    id: 'coordinate-plane',
    name: 'Координатная плоскость',
    description: 'Добавляйте точки кликом, изучайте координаты',
    icon: Grid3x3,
    category: 'geometry',
  },
  {
    id: 'intersections',
    name: 'Пересечения функций',
    description: 'Найдите точки пересечения двух графиков',
    icon: Crosshair,
    category: 'functions',
  },
  {
    id: 'inequalities',
    name: 'Системы неравенств',
    description: 'Визуализация решений систем линейных неравенств',
    icon: Layers,
    category: 'algebra',
  },
  {
    id: 'parallel-lines',
    name: 'Параллельные прямые',
    description: 'Углы при пересечении параллельных прямых секущей',
    icon: Minimize2,
    category: 'geometry',
  },
  {
    id: 'triangle-similarity',
    name: 'Подобие треугольников',
    description: 'Свойства подобных треугольников и коэффициент подобия',
    icon: Maximize2,
    category: 'geometry',
  },
];

interface InteractiveLibraryProps {
  onClose?: () => void;
}

export const InteractiveLibrary: React.FC<InteractiveLibraryProps> = ({ onClose }) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const renderModule = () => {
    switch (activeModule) {
      case 'linear':
        return <LinearFunction />;
      case 'quadratic':
        return <QuadraticFunction />;
      case 'exponential':
        return <ExponentialFunction />;
      case 'logarithmic':
        return <LogarithmicFunction />;
      case 'derivative':
        return <DerivativeExplorer />;
      case 'pythagorean':
        return <PythagoreanTheorem />;
      case 'vectors':
        return <VectorOperations />;
      case 'trigonometry':
        return <TrigonometricCircle />;
      case 'probability':
        return <ProbabilityTree />;
      case 'trig-functions':
        return <TrigonometricFunctions />;
      case 'coordinate-plane':
        return <CoordinatePlane />;
      case 'intersections':
        return <FunctionIntersections />;
      case 'inequalities':
        return <InequalitySystems />;
      case 'parallel-lines':
        return <ParallelLines />;
      case 'triangle-similarity':
        return <TriangleSimilarity />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      algebra: 'Алгебра',
      geometry: 'Геометрия',
      trigonometry: 'Тригонометрия',
      functions: 'Функции',
    };
    return labels[category] || category;
  };

  // Group modules by category
  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, InteractiveModule[]>);

  if (activeModule) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Back button */}
        <button
          onClick={() => setActiveModule(null)}
          className="m-4 mb-0 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          ← Назад к библиотеке
        </button>

        {/* Module content */}
        <div className="flex-1" style={{ minWidth: 0, overflow: 'hidden' }}>
          {renderModule()}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Интерактивные модули</h2>
        <p className="text-sm text-gray-500 mt-1">
          Выберите тему для изучения с помощью интерактивных визуализаций
        </p>
      </div>

      {/* Categories */}
      {Object.entries(groupedModules).map(([category, categoryModules]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
            {getCategoryLabel(category)}
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {categoryModules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className="p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <span className="text-indigo-600">
                      <module.icon size={24} />
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{module.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{module.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Coming soon */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-medium text-gray-700 mb-2">Скоро появится:</h4>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• Сечения многогранников (3D)</li>
          <li>• Интегралы и площади под кривыми</li>
        </ul>
      </div>
    </div>
  );
};

export default InteractiveLibrary;
