import { registerModule } from '@/lib/moduleRegistry';
import {
    TrendingUp,
    Triangle,
    Circle,
    GitBranch,
    Move3d,
    Waves,
    Grid3x3,
    Crosshair,
    Layers,
    Minimize2,
    Maximize2,
    ArrowUpDown,
    Search,
    Waves as WavesIcon,
} from 'lucide-react';

// Import all module components
import { LinearFunction } from '@/components/interactive/LinearFunction';
import { QuadraticFunction } from '@/components/interactive/QuadraticFunction';
import { ExponentialFunction } from '@/components/interactive/ExponentialFunction';
import { LogarithmicFunction } from '@/components/interactive/LogarithmicFunction';
import { DerivativeExplorer } from '@/components/interactive/DerivativeExplorer';
import { PythagoreanTheorem } from '@/components/interactive/PythagoreanTheorem';
import { VectorOperations } from '@/components/interactive/VectorOperations';
import { TrigonometricCircle } from '@/components/interactive/TrigonometricCircle';
import { ProbabilityTree } from '@/components/interactive/ProbabilityTree';
import { TrigonometricFunctions } from '@/components/interactive/TrigonometricFunctions';
import { CoordinatePlane } from '@/components/interactive/CoordinatePlane';
import { FunctionIntersections } from '@/components/interactive/FunctionIntersections';
import { InequalitySystems } from '@/components/interactive/InequalitySystems';
import { ParallelLines } from '@/components/interactive/ParallelLines';
import { TriangleSimilarity } from '@/components/interactive/TriangleSimilarity';
import { FunctionTransformations } from '@/components/interactive/FunctionTransformations';
import { FunctionAnalysis } from '@/components/interactive/FunctionAnalysis';
import { TrigCircleGraph } from '@/components/interactive/TrigCircleGraph';

// Register all modules
registerModule({
    id: 'linear',
    name: 'Линейная функция',
    description: 'y = kx + b, изучите влияние коэффициентов на график',
    icon: TrendingUp,
    category: 'algebra',
    component: LinearFunction,
});

registerModule({
    id: 'quadratic',
    name: 'Квадратичная функция',
    description: 'y = ax² + bx + c, парабола и её параметры',
    icon: TrendingUp,
    category: 'functions',
    component: QuadraticFunction,
});

registerModule({
    id: 'exponential',
    name: 'Показательная функция',
    description: 'y = a · bˣ + c, экспоненциальный рост и убывание',
    icon: TrendingUp,
    category: 'functions',
    component: ExponentialFunction,
});

registerModule({
    id: 'logarithmic',
    name: 'Логарифмическая функция',
    description: 'y = a · log_b(x) + c, обратная к показательной',
    icon: TrendingUp,
    category: 'functions',
    component: LogarithmicFunction,
});

registerModule({
    id: 'derivative',
    name: 'Производная',
    description: 'Исследование функции и её производной, экстремумы',
    icon: TrendingUp,
    category: 'functions',
    component: DerivativeExplorer,
});

registerModule({
    id: 'pythagorean',
    name: 'Теорема Пифагора',
    description: 'a² + b² = c², интерактивное доказательство',
    icon: Triangle,
    category: 'geometry',
    component: PythagoreanTheorem,
});

registerModule({
    id: 'vectors',
    name: 'Векторы',
    description: 'Операции с векторами: сложение, вычитание, скалярное произведение',
    icon: Move3d,
    category: 'geometry',
    component: VectorOperations,
});

registerModule({
    id: 'trigonometry',
    name: 'Тригонометрическая окружность',
    description: 'Связь синуса, косинуса и тангенса с точкой на окружности',
    icon: Circle,
    category: 'trigonometry',
    component: TrigonometricCircle,
});

registerModule({
    id: 'probability',
    name: 'Вероятностное дерево',
    description: 'Визуализация условных вероятностей и формула полной вероятности',
    icon: GitBranch,
    category: 'algebra',
    component: ProbabilityTree,
});

registerModule({
    id: 'trig-functions',
    name: 'Тригонометрические функции',
    description: 'Графики sin, cos, tan с изменением амплитуды, периода и фазы',
    icon: Waves,
    category: 'trigonometry',
    component: TrigonometricFunctions,
});

registerModule({
    id: 'coordinate-plane',
    name: 'Координатная плоскость',
    description: 'Добавляйте точки кликом, изучайте координаты',
    icon: Grid3x3,
    category: 'geometry',
    component: CoordinatePlane,
});

registerModule({
    id: 'intersections',
    name: 'Пересечения функций',
    description: 'Найдите точки пересечения двух графиков',
    icon: Crosshair,
    category: 'functions',
    component: FunctionIntersections,
});

registerModule({
    id: 'inequalities',
    name: 'Системы неравенств',
    description: 'Визуализация решений систем линейных неравенств',
    icon: Layers,
    category: 'algebra',
    component: InequalitySystems,
});

registerModule({
    id: 'parallel-lines',
    name: 'Параллельные прямые',
    description: 'Углы при пересечении параллельных прямых секущей',
    icon: Minimize2,
    category: 'geometry',
    component: ParallelLines,
});

registerModule({
    id: 'triangle-similarity',
    name: 'Подобие треугольников',
    description: 'Свойства подобных треугольников и коэффициент подобия',
    icon: Maximize2,
    category: 'geometry',
    component: TriangleSimilarity,
});

registerModule({
    id: 'function-transformations',
    name: 'Преобразования функций',
    description: 'Сдвиг, растяжение и отражение графиков',
    icon: ArrowUpDown,
    category: 'functions',
    component: FunctionTransformations,
});

registerModule({
    id: 'function-analysis',
    name: 'Исследование функции',
    description: 'Экстремумы, монотонность, выпуклость, точки перегиба',
    icon: Search,
    category: 'functions',
    component: FunctionAnalysis,
});

registerModule({
    id: 'trig-circle-graph',
    name: 'Окружность и график',
    description: 'Анимация: как окружность порождает синусоиду',
    icon: WavesIcon,
    category: 'trigonometry',
    component: TrigCircleGraph,
});
