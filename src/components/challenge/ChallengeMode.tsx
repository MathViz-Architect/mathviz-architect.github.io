import React, { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, HelpCircle, Award, Star, TrendingUp, Target, Search, Lightbulb } from 'lucide-react';
import { Challenge, GeneratedData, StaticChallenge, GeneratedChallenge, ProblemTemplate, GeneratedProblem, StudentProgress, TopicProgress, SkillLevel, CurriculumCategory } from '@/lib/types';
import { problemTemplates } from '@/lib/templates/index';
import { generateProblem, validateAnswer, checkCommonMistake } from '@/lib/templateEngine';
import { getUnmetPrerequisites, topicGraph } from '@/lib/topicGraph';
import { curriculum } from '@/lib/curriculum';
import { createAdaptiveState, updateAdaptiveState, getDifficultyLabel, AdaptiveState, updateHintsUsed, getWeightedAnswer } from '@/lib/adaptiveEngine';
import { createProblemSession, selectTemplate as selectTemplateFromSession, updateSessionAfterSelection, ProblemSession } from '@/lib/problemSelector';
import { useEditorContext } from '@/contexts/EditorContext';
import SkillTree, { type SkillTreeTopic, type SkillTreeProgress } from '@/components/SkillTree/SkillTree';
import { useStudentProgress, getSkillLevel } from '@/hooks/useStudentProgress';
import MathText from './MathText';

interface OldChallenge {
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

const oldChallenges: OldChallenge[] = [
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
    hint: 'a² + b² = c², где a = b = 5. Вычислите \\sqrt{5^2 + 5^2}',
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
    hint: 'Из формулы a² + b² = c² выразите b: b = \\sqrt{c^2 - a^2}',
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

// Convert old challenges to StaticChallenge format
const staticChallenges: StaticChallenge[] = oldChallenges.map(c => ({
  type: 'static' as const,
  id: c.id,
  title: c.title,
  category: c.type === 'comparison' || c.type === 'sequence' || c.type === 'magic-square' || c.type === 'perimeter' || c.type === 'triangle-type' ? 'grade5' :
    c.type === 'fraction' ? 'algebra' :
      c.type === 'geometry' ? 'geometry' : 'algebra',
  topic: c.type === 'comparison' || c.type === 'sequence' || c.type === 'magic-square' || c.type === 'perimeter' || c.type === 'triangle-type' ? 'numbersLogic' :
    c.type === 'fraction' ? 'fractions' :
      c.type === 'geometry' ? 'pythagorean' : 'linear',
  difficulty: c.difficulty === 'easy' ? 1 : c.difficulty === 'medium' ? 2 : 3,
  question: c.task,
  hint: c.hint,
  correctAnswer: '', // Will be validated by old logic
  explanation: undefined,
}));

// Combine all challenges (static challenges only, templates will be used dynamically)
const allChallenges: Challenge[] = [...staticChallenges];

// Helper functions for student progress tracking
// loadProgress / saveProgress / getSkillLevel / updateTopicProgress
// перенесены в src/hooks/useStudentProgress.ts

function skillIcon(level: SkillLevel): { icon: React.ReactNode; color: string; label: string } {
  switch (level) {
    case 'mastered':
      return { icon: <Award size={16} className="text-yellow-500" />, color: 'text-yellow-600', label: 'Освоено' };
    case 'proficient':
      return { icon: <Star size={16} className="text-blue-500" />, color: 'text-blue-600', label: 'Уверенно' };
    case 'practicing':
      return { icon: <TrendingUp size={16} className="text-green-500" />, color: 'text-green-600', label: 'Практика' };
    case 'not_started':
      return { icon: <Target size={16} className="text-gray-400" />, color: 'text-gray-500', label: 'Не начато' };
  }
}

interface ChallengeModeProps {
  onClose?: () => void;
}

export const ChallengeMode: React.FC<ChallengeModeProps> = ({ onClose }) => {
  const { setMode, setInteractiveModuleId } = useEditorContext();
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<ProblemTemplate | null>(null);
  const [generatedProblem, setGeneratedProblem] = useState<GeneratedProblem | null>(null);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedSign, setSelectedSign] = useState<'>' | '<' | '=' | null>(null);
  const [selectedTriangleType, setSelectedTriangleType] = useState<'equilateral' | 'isosceles' | 'scalene' | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(-1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [mistakeFeedback, setMistakeFeedback] = useState<string | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress>({ topics: {} });
  const { studentProgress: savedProgress, updateTopicProgress: saveTopicProgress } = useStudentProgress();

  // Синхронизируем локальный стейт с загруженным из IndexedDB
  React.useEffect(() => {
    setStudentProgress(savedProgress);
  }, [savedProgress]);
  const [achievementMessage, setAchievementMessage] = useState<string | null>(null);
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState>(() => createAdaptiveState());
  const [problemSession, setProblemSession] = useState<ProblemSession | null>(null);
  const [problemKey, setProblemKey] = useState(0);

  // Use ref to track current difficulty without triggering useEffect
  const currentDifficultyRef = React.useRef(adaptiveState.currentDifficulty);

  // Update ref when difficulty changes
  React.useEffect(() => {
    currentDifficultyRef.current = adaptiveState.currentDifficulty;
  }, [adaptiveState.currentDifficulty]);

  // Generate problem when a template is selected or problemKey changes
  React.useEffect(() => {
    if (activeTemplate) {
      const problem = generateProblem(activeTemplate, currentDifficultyRef.current);
      setGeneratedProblem(problem);
    } else {
      setGeneratedProblem(null);
    }
  }, [activeTemplate, problemKey]); // Removed adaptiveState.currentDifficulty from dependencies

  // Generate data when a generated challenge is selected (legacy support)
  React.useEffect(() => {
    if (activeChallenge && activeChallenge.type === 'generated') {
      setGeneratedData(activeChallenge.generator());
    } else {
      setGeneratedData(null);
    }
  }, [activeChallenge]);

  // Category structure - built from curriculum
  const categoryStructure = React.useMemo(() => {
    const structure: Record<string, CurriculumCategory> = {};

    curriculum.forEach(grade => {
      const gradeKey = grade.id === 9 ? 'grade9_11' : `grade${grade.id}`;
      structure[gradeKey] = {
        name: grade.title,
        color: grade.color,
        subjects: {},
      };

      grade.subjects.forEach(subject => {
        structure[gradeKey].subjects[subject.id] = {
          name: subject.title,
          topics: {},
        };

        subject.topics.forEach(topic => {
          structure[gradeKey].subjects[subject.id].topics[topic.id] = {
            name: topic.title,
            challenges: allChallenges.filter(c => {
              // Filter logic for legacy challenges
              if (c.type === 'static') {
                const oldType = (c as any).type;
                if (topic.id === 'comparison' && oldType === 'comparison') return true;
                if (topic.id === 'patterns' && oldType === 'sequence') return true;
                if (topic.id === 'perimeter' && oldType === 'perimeter') return true;
                if (topic.id === 'triangles' && oldType === 'triangle-type') return true;
                if (topic.id === 'magicSquares' && oldType === 'magic-square') return true;
                if (topic.id === 'fractions' && oldType === 'fraction') return true;
                if (topic.id === 'linear' && oldType === 'function' && (c.id.includes('linear') || c.id.includes('function-'))) return true;
                if (topic.id === 'quadratic' && c.id.includes('quadratic')) return true;
                if (topic.id === 'pythagorean' && oldType === 'geometry') return true;
                if (topic.id === 'trigonometry' && c.id.includes('trig')) return true;
              }
              if (c.type === 'generated') {
                if (topic.id === 'linear' && c.category === 'grade7' && c.topic === 'linear') return true;
              }
              return false;
            }),
            templates: problemTemplates.filter(t => t.class === grade.id && t.topic === topic.id),
          };
        });
      });
    });

    return structure;
  }, [allChallenges]);

  const handleCheck = async () => {
    // Handle template-based problems
    if (activeTemplate && generatedProblem) {
      const isCorrect = validateAnswer(
        generatedProblem,
        userAnswer || selectedSign || selectedTriangleType || '',
        generatedProblem.answer_type || 'number'
      );

      // Calculate weighted answer for adaptive algorithm based on hints used
      // Using hints reduces the "weight" of a correct answer
      const weightedIsCorrect = getWeightedAnswer(isCorrect, hintsUsed);

      // Update progress
      const topicKey = `${activeTemplate.class}-${activeTemplate.subject}-${activeTemplate.topic}`;
      const newProgress = await saveTopicProgress(topicKey, weightedIsCorrect);
      setStudentProgress(newProgress);

      // Update adaptive state with weighted result
      const newAdaptiveState = updateAdaptiveState(adaptiveState, weightedIsCorrect);
      setAdaptiveState(newAdaptiveState);

      // Sync session with updated adaptive state
      if (problemSession) {
        const topicProgress = newProgress.topics[topicKey];
        const accuracy = topicProgress && topicProgress.attempts > 0
          ? topicProgress.correct / topicProgress.attempts
          : 0;
        setProblemSession(prev => prev ? {
          ...prev,
          streak: topicProgress?.streak ?? 0,
          accuracy,
          currentDifficulty: newAdaptiveState.currentDifficulty,
        } : null);
      }

      if (isCorrect) {
        setResult('correct');
        setMistakeFeedback(null);

        // Check for achievements
        const topicProgress = newProgress.topics[topicKey];
        if (topicProgress.streak === 3) {
          setAchievementMessage('🔥 Серия из 3 правильных ответов!');
        } else if (topicProgress.streak === 5) {
          setAchievementMessage('🔥🔥 Серия из 5 правильных ответов!');
        } else if (topicProgress.level === 'proficient' && studentProgress.topics[topicKey]?.level !== 'proficient') {
          setAchievementMessage('⭐ Уровень: Уверенно!');
        } else if (topicProgress.level === 'mastered' && studentProgress.topics[topicKey]?.level !== 'mastered') {
          setAchievementMessage('🏆 Уровень: Освоено!');
        }

        if (!completedChallenges.includes(generatedProblem.template_id)) {
          setCompletedChallenges([...completedChallenges, generatedProblem.template_id]);
        }
      } else {
        setResult('incorrect');
        const feedback = checkCommonMistake(generatedProblem, activeTemplate, userAnswer, adaptiveState.currentDifficulty);
        setMistakeFeedback(feedback);
      }
      return;
    }

    // Handle legacy challenges
    if (!activeChallenge) return;

    let isCorrect = false;

    // Handle generated challenges
    if (activeChallenge.type === 'generated') {
      if (!generatedData) return;
      isCorrect = activeChallenge.validate(generatedData, userAnswer || selectedSign || '');
    } else {
      // Handle static challenges (old logic)
      const oldChallenge = activeChallenge as any;

      switch (oldChallenge.type) {
        case 'comparison':
          isCorrect = selectedSign === oldChallenge.correctSign;
          break;

        case 'triangle-type':
          isCorrect = selectedTriangleType === oldChallenge.correctType;
          break;

        case 'sequence':
        case 'perimeter':
        case 'fraction':
        case 'function':
        case 'geometry':
          if (!userAnswer) return;
          const answer = parseFloat(userAnswer.replace(',', '.'));
          isCorrect = Math.abs(answer - (oldChallenge.targetValue || 0)) <= (oldChallenge.tolerance || 0);
          break;

        case 'magic-square':
          // For now, just check if user entered something (simplified)
          isCorrect = userAnswer !== '';
          break;
      }
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

  const handleExploreModule = () => {
    if (activeTemplate?.relatedModule) {
      setInteractiveModuleId(activeTemplate.relatedModule);
      setMode('interactive');
    }
  };

  const handleNextChallenge = () => {
    // If we have an active template and we're in a topic, select next template adaptively
    if (activeTemplate && selectedTopic && selectedCategory) {
      const [subjectKey, topicKey] = selectedTopic.split('/');
      const category = categoryStructure[selectedCategory as keyof typeof categoryStructure];
      const subject = category.subjects[subjectKey as keyof typeof category.subjects];
      const topic = subject.topics[topicKey as keyof typeof subject.topics];

      // Get available templates for this topic
      const availableTemplates = topic.templates;

      if (availableTemplates.length > 0) {
        // Initialize or update problem session
        const currentSession = problemSession || createProblemSession(topicKey, adaptiveState.currentDifficulty);
        const updatedSession: ProblemSession = {
          ...currentSession,
          topic: topicKey,
          currentDifficulty: adaptiveState.currentDifficulty,
        };

        // Use problem selector to select next template
        const nextTemplate = selectTemplateFromSession(availableTemplates, updatedSession) ?? activeTemplate;

        // Guard: ensure we have a valid template
        if (!nextTemplate) {
          return;
        }

        // Update session with selected template
        const newSession = updateSessionAfterSelection(updatedSession, nextTemplate.id);
        setProblemSession(newSession);

        // Update template only if it changed
        if (nextTemplate !== activeTemplate) {
          setActiveTemplate(nextTemplate);
        }

        // Increment problemKey to force regeneration via useEffect
        setProblemKey(k => k + 1);

        setUserAnswer('');
        setSelectedSign(null);
        setSelectedTriangleType(null);
        setResult(null);
        setShowHint(false);
        setActiveHintIndex(-1);
        setHintsUsed(0);
        setShowSolution(false);
        setMistakeFeedback(null);
        setAchievementMessage(null);
        return;
      }
    }

    // Default behavior - clear everything
    setActiveChallenge(null);
    setActiveTemplate(null);
    setGeneratedProblem(null);
    setUserAnswer('');
    setSelectedSign(null);
    setSelectedTriangleType(null);
    setResult(null);
    setShowHint(false);
    setActiveHintIndex(-1);
    setHintsUsed(0);
    setShowSolution(false);
    setMistakeFeedback(null);
    setAchievementMessage(null);
  };

  const handleBack = () => {
    if (activeChallenge || activeTemplate) {
      setActiveChallenge(null);
      setActiveTemplate(null);
      setGeneratedProblem(null);
      // Reset adaptive state when leaving a challenge
      setAdaptiveState(createAdaptiveState());
      setProblemSession(null);
    } else if (selectedTopic) {
      setSelectedTopic(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
    setUserAnswer('');
    setSelectedSign(null);
    setSelectedTriangleType(null);
    setResult(null);
    setShowHint(false);
    setShowSolution(false);
    setMistakeFeedback(null);
    setAchievementMessage(null);
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-yellow-100 text-yellow-700';
      case 3: return 'bg-orange-100 text-orange-700';
      case 4: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // If a template is selected, show the template-based challenge interface
  if (activeTemplate && generatedProblem) {
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
            <span className={`px-2 py-1 rounded text-xs font-medium ${adaptiveState.currentDifficulty === 1 ? 'bg-green-100 text-green-700' : adaptiveState.currentDifficulty === 2 ? 'bg-yellow-100 text-yellow-700' : adaptiveState.currentDifficulty === 3 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
              {adaptiveState.currentDifficulty === 1 ? 'Легко' : adaptiveState.currentDifficulty === 2 ? 'Средне' : adaptiveState.currentDifficulty === 3 ? 'Сложно' : 'Олимпиадное'}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
              ⚡ {getDifficultyLabel(adaptiveState.currentDifficulty)}
            </span>
            {completedChallenges.includes(activeTemplate.id) && (
              <CheckCircle size={20} className="text-green-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{activeTemplate.section}</h2>
        </div>

        {/* Task */}
        <div className="bg-indigo-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-indigo-800 mb-3">Задача:</h3>
          <div className="border-t border-indigo-200 pt-3">
            <MathText className="text-indigo-700">
              {generatedProblem.question}
            </MathText>
          </div>
        </div>

        {/* Hint - support both single hint and hints array */}
        {(generatedProblem.hint || (generatedProblem.hints && generatedProblem.hints.length > 0)) && (
          <div className="mb-6">
            {/* Button to show/reveal next hint */}
            <button
              onClick={() => {
                const hintsCount = generatedProblem.hints?.length || 0;
                if (hintsCount > 0) {
                  // Multi-hint mode: show next hint progressively
                  if (activeHintIndex < hintsCount - 1) {
                    const newIndex = activeHintIndex + 1;
                    setActiveHintIndex(newIndex);
                    setHintsUsed(hintsUsed + 1);
                    setShowHint(true);
                    // Update adaptive state to track hints usage
                    setAdaptiveState(prev => updateHintsUsed(prev));
                  } else if (!showHint && generatedProblem.hint) {
                    // Fall back to single hint
                    setShowHint(true);
                    setHintsUsed(hintsUsed + 1);
                    setAdaptiveState(prev => updateHintsUsed(prev));
                  }
                } else if (generatedProblem.hint) {
                  // Single hint mode
                  setShowHint(!showHint);
                  if (!showHint) {
                    setHintsUsed(hintsUsed + 1);
                    setAdaptiveState(prev => updateHintsUsed(prev));
                  }
                }
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <Lightbulb size={16} />
              {generatedProblem.hints && generatedProblem.hints.length > 0
                ? activeHintIndex < (generatedProblem.hints.length - 1)
                  ? `Подсказка ${activeHintIndex + 2}/${generatedProblem.hints.length}`
                  : activeHintIndex === (generatedProblem.hints.length - 1) && showHint
                    ? 'Скрыть подсказки'
                    : 'Показать подсказку'
                : showHint
                  ? 'Скрыть подсказку'
                  : 'Показать подсказку'
              }
            </button>
            
            {/* Display hints */}
            {showHint && (
              <div className="mt-2 space-y-2">
                {/* Show progressive hints from the array */}
                {generatedProblem.hints && generatedProblem.hints.length > 0 && (
                  <>
                    {generatedProblem.hints.slice(0, activeHintIndex + 1).map((hint, idx) => (
                      <div key={idx} className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                        <span className="font-medium">Подсказка {idx + 1}:</span> <MathText>{hint}</MathText>
                      </div>
                    ))}
                  </>
                )}
                {/* Fallback to single hint */}
                {generatedProblem.hint && (!generatedProblem.hints || generatedProblem.hints.length === 0) && (
                  <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                    💡 <MathText>{generatedProblem.hint}</MathText>
                  </div>
                )}
                {hintsUsed > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    Использовано подсказок: {hintsUsed}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Related Module Link */}
        {activeTemplate?.relatedModule && (
          <div className="mb-6">
            <button
              onClick={handleExploreModule}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Search size={16} />
              🔍 Исследовать в интерактивном модуле
            </button>
          </div>
        )}

        {/* Answer input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ваш ответ:
          </label>

          {/* Comparison problems */}
          {activeTemplate.problemType === 'comparison' && (
            <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-xl">
              {/* Left fraction/number */}
              <div className="text-center">
                {generatedProblem.params.d || generatedProblem.params.d1 ? (
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-gray-800 border-b-2 border-gray-800 px-2">
                      {generatedProblem.params.a}
                    </div>
                    <div className="text-3xl font-bold text-gray-800 px-2 mt-1">
                      {generatedProblem.params.d || generatedProblem.params.d1}
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-800">{generatedProblem.params.a}</div>
                )}
              </div>

              {/* Comparison buttons */}
              <div className="flex gap-2">
                {['>', '<', '='].map((sign) => (
                  <button
                    key={sign}
                    onClick={() => {
                      setSelectedSign(sign as '>' | '<' | '=');
                      if (result === 'incorrect') setResult(null);
                    }}
                    className={`w-16 h-16 text-2xl font-bold rounded-lg border-2 transition-all ${selectedSign === sign
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                      }`}
                  >
                    {sign}
                  </button>
                ))}
              </div>

              {/* Right fraction/number */}
              <div className="text-center">
                {generatedProblem.params.d || generatedProblem.params.d2 ? (
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-gray-800 border-b-2 border-gray-800 px-2">
                      {generatedProblem.params.b}
                    </div>
                    <div className="text-3xl font-bold text-gray-800 px-2 mt-1">
                      {generatedProblem.params.d || generatedProblem.params.d2}
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-800">{generatedProblem.params.b}</div>
                )}
              </div>
            </div>
          )}

          {/* Text problems (triangle type) */}
          {activeTemplate.problemType === 'text' && activeTemplate.topic === 'triangles' && (
            <div className="space-y-2">
              {[
                { value: 'равносторонний', label: 'Равносторонний' },
                { value: 'равнобедренный', label: 'Равнобедренный' },
                { value: 'разносторонний', label: 'Разносторонний' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setUserAnswer(option.value);
                    if (result === 'incorrect') setResult(null);
                  }}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${userAnswer === option.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Magic Square problems */}
          {activeTemplate.problemType === 'magicSquare' && (
            <div>
              <div className="flex justify-center p-6 bg-gray-50 rounded-xl mb-4">
                <div className="inline-grid grid-cols-3 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                    const cellValue = generatedProblem.params[`c${index}`];
                    const isHidden = generatedProblem.params.hiddenIndex === index;

                    return (
                      <div
                        key={index}
                        className={`w-16 h-16 flex items-center justify-center text-xl font-bold rounded-lg border-2 ${isHidden
                          ? 'border-indigo-500 bg-indigo-100 text-indigo-600'
                          : 'border-gray-300 bg-white text-gray-800'
                          }`}
                      >
                        {isHidden ? '?' : cellValue}
                      </div>
                    );
                  })}
                </div>
              </div>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  if (result === 'incorrect') setResult(null);
                }}
                placeholder="Введите пропущенное число..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && result !== 'correct' && handleCheck()}
                disabled={result === 'correct'}
              />
            </div>
          )}

          {/* Numeric problems */}
          {activeTemplate.problemType === 'numeric' && (
            <div className="flex gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  if (result === 'incorrect') setResult(null);
                }}
                placeholder={
                  generatedProblem.answer_type === 'fraction' ? 'Например: 3/4' :
                    generatedProblem.answer_type === 'coordinate' ? 'Например: (3, 4)' :
                      'Введите число...'
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && result !== 'correct' && handleCheck()}
                disabled={result === 'correct'}
              />
              {result !== 'correct' && (
                <button
                  onClick={handleCheck}
                  disabled={!userAnswer.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Проверить
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          )}

          {/* Check button for comparison, text, and magic square problems */}
          {result !== 'correct' && (
            activeTemplate.problemType === 'comparison' ||
            (activeTemplate.problemType === 'text' && activeTemplate.topic === 'triangles') ||
            activeTemplate.problemType === 'magicSquare'
          ) && (
              <button
                onClick={handleCheck}
                disabled={
                  activeTemplate.problemType === 'comparison' ? !selectedSign :
                    activeTemplate.problemType === 'magicSquare' ? !userAnswer :
                      !userAnswer
                }
                className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                <div className="flex-1">
                  <div className="font-semibold">Правильно! 🎉</div>
                  <div className="text-sm">Вы успешно решили задачу.</div>
                  {achievementMessage && (
                    <div className="mt-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium flex items-center gap-2">
                      {achievementMessage}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle size={24} />
                <div>
                  <div className="font-semibold">Неправильно 😔</div>
                  <div className="text-sm">{mistakeFeedback ?? 'Попробуйте ещё раз или посмотрите подсказку.'}</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Show Solution button */}
        {result && generatedProblem?.solution && (
          <div className="mt-4">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
            >
              <HelpCircle size={16} />
              {showSolution ? 'Скрыть решение' : 'Показать решение'}
            </button>
            {showSolution && (
              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-800 mb-3">Пошаговое решение:</div>
                <div className="space-y-3">
                  {generatedProblem.solution.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-blue-900"><MathText>{step.explanation}</MathText></div>
                        {step.expression && (
                          <div className="mt-1 font-mono text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            <MathText>{step.expression}</MathText>
                          </div>
                        )}
                        {step.result && (
                          <div className="mt-1 font-semibold text-blue-800">
                            = <MathText>{step.result}</MathText>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              {activeChallenge.difficulty === 1 ? 'Легко' : activeChallenge.difficulty === 2 ? 'Средне' : activeChallenge.difficulty === 3 ? 'Сложно' : 'Очень сложно'}
            </span>
            {completedChallenges.includes(activeChallenge.id) && (
              <CheckCircle size={20} className="text-green-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{activeChallenge.title}</h2>
          {activeChallenge.type === 'static' && (
            <p className="text-gray-600 mt-2">{activeChallenge.description}</p>
          )}
        </div>

        {/* Task */}
        <div className="bg-indigo-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-indigo-800 mb-2">Задача:</h3>
          {activeChallenge.type === 'generated' && generatedData ? (
            activeChallenge.topic === 'magicSquare' && 'sq' in generatedData ? (
              <div>
                <p className="text-indigo-700 mb-3">
                  Магический квадрат (сумма строк, столбцов и диагоналей = <strong>{generatedData.magicSum}</strong>).
                  Найдите пропущенное число:
                </p>
                <div className="inline-grid grid-cols-3 gap-1 mb-1">
                  {(generatedData.sq as number[]).map((val, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded border-2 ${val === 0
                        ? 'border-indigo-500 bg-indigo-100 text-indigo-600'
                        : 'border-gray-300 bg-white text-gray-800'
                        }`}
                    >
                      {val === 0 ? '?' : val}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-indigo-700">{activeChallenge.render(generatedData).question}</p>
            )
          ) : activeChallenge.type === 'static' ? (
            <p className="text-indigo-700">{activeChallenge.question}</p>
          ) : (
            <p className="text-indigo-700">Загрузка...</p>
          )}
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
              💡 {activeChallenge.type === 'generated' && generatedData
                ? activeChallenge.render(generatedData).hint || 'Подсказка недоступна'
                : activeChallenge.type === 'static'
                  ? activeChallenge.hint
                  : 'Подсказка недоступна'}
            </div>
          )}
        </div>

        {/* Answer input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ваш ответ:
          </label>

          {/* Generated challenge with comparison (if data has num1 and num2) */}
          {activeChallenge.type === 'generated' && generatedData && 'num1' in generatedData && 'num2' in generatedData && (
            <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-800">{generatedData.num1}</div>
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
              <div className="text-3xl font-bold text-gray-800">{generatedData.num2}</div>
            </div>
          )}

          {/* Comparison challenge */}
          {activeChallenge.type === 'static' && (activeChallenge as any).type === 'comparison' && (
            <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-800">{(activeChallenge as any).num1}</div>
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
              <div className="text-3xl font-bold text-gray-800">{(activeChallenge as any).num2}</div>
            </div>
          )}

          {/* Sequence challenge */}
          {activeChallenge.type === 'static' && (activeChallenge as any).type === 'sequence' && (
            <div>
              <div className="flex items-center justify-center gap-3 p-6 bg-gray-50 rounded-xl mb-4">
                {(activeChallenge as any).sequence?.map((num: any, idx: number) => (
                  <div key={idx} className="text-2xl font-bold text-gray-800">
                    {num !== null ? num : '?'}
                    {idx < ((activeChallenge as any).sequence?.length || 0) - 1 && <span className="mx-2 text-gray-400">,</span>}
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
          {activeChallenge.type === 'static' && (activeChallenge as any).type === 'perimeter' && (
            <div>
              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl mb-4">
                <svg width="200" height="150" className="mb-4">
                  <rect
                    x="50"
                    y="25"
                    width={(activeChallenge as any).width! * 10}
                    height={(activeChallenge as any).height! * 10}
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="2"
                  />
                  <text x="100" y="15" textAnchor="middle" className="text-sm fill-gray-700">
                    {(activeChallenge as any).width} см
                  </text>
                  <text x="30" y="75" textAnchor="middle" className="text-sm fill-gray-700">
                    {(activeChallenge as any).height} см
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
          {activeChallenge.type === 'static' && (activeChallenge as any).type === 'triangle-type' && (
            <div>
              <div className="flex items-center justify-center gap-6 p-6 bg-gray-50 rounded-xl mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Стороны треугольника:</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {(activeChallenge as any).sides?.join(', ')} см
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
          {activeChallenge.type === 'static' && (activeChallenge as any).type === 'magic-square' && (
            <div>
              <div className="flex justify-center p-6 bg-gray-50 rounded-xl mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {(activeChallenge as any).grid?.flat().map((num: any, idx: number) => (
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

          {/* Default numeric input for generated challenges and other types */}
          {(activeChallenge.type === 'generated' && generatedData && !('num1' in generatedData && 'num2' in generatedData)) ||
            (activeChallenge.type === 'static' && !['comparison', 'sequence', 'perimeter', 'triangle-type', 'magic-square'].includes((activeChallenge as any).type)) ? (
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
          ) : null}

          {/* Check button for special types */}
          {((activeChallenge.type === 'generated' && generatedData && 'num1' in generatedData && 'num2' in generatedData) ||
            (activeChallenge.type === 'static' && ['comparison', 'triangle-type'].includes((activeChallenge as any).type))) && (
              <button
                onClick={handleCheck}
                className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                Проверить
                <ArrowRight size={18} />
              </button>
            )}

          {/* Check button for input types */}
          {activeChallenge.type === 'static' && ['sequence', 'perimeter', 'magic-square'].includes((activeChallenge as any).type) && (
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
    const [subjectKey, topicKey] = selectedTopic.split('/');
    const subject = category.subjects[subjectKey as keyof typeof category.subjects];
    const topic = subject.topics[topicKey as keyof typeof subject.topics];

    // Combine challenges and templates for display
    const totalItems = topic.challenges.length + topic.templates.length;
    const completedCount = topic.challenges.filter(c => completedChallenges.includes(c.id)).length +
      topic.templates.filter(t => completedChallenges.includes(t.id)).length;

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
            {completedCount} / {totalItems} задач выполнено
          </p>
        </div>

        {/* Challenge list */}
        <div className="space-y-3">
          {/* Static challenges */}
          {topic.challenges.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => setActiveChallenge(challenge)}
              className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{challenge.title}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${challenge.difficulty === 1 ? 'bg-green-100 text-green-700' : challenge.difficulty === 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {challenge.difficulty === 1 ? 'Легко' : challenge.difficulty === 2 ? 'Средне' : 'Сложно'}
                    </span>
                    {completedChallenges.includes(challenge.id) && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                </div>
                <ArrowRight size={20} className="text-gray-400" />
              </div>
            </button>
          ))}

          {/* Template-based challenges */}
          {topic.templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setActiveTemplate(template);
                setAdaptiveState(createAdaptiveState(1));
              }}
              className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{template.section}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${Math.min(...Object.keys(template.difficulties).map(Number)) === 1 ? 'bg-green-100 text-green-700' : Math.min(...Object.keys(template.difficulties).map(Number)) === 2 ? 'bg-yellow-100 text-yellow-700' : Math.min(...Object.keys(template.difficulties).map(Number)) === 3 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {Math.min(...Object.keys(template.difficulties).map(Number)) === 1 ? 'Легко' : Math.min(...Object.keys(template.difficulties).map(Number)) === 2 ? 'Средне' : Math.min(...Object.keys(template.difficulties).map(Number)) === 3 ? 'Сложно' : 'Олимпиадное'}
                    </span>
                    {completedChallenges.includes(template.id) && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                </div>
                <ArrowRight size={20} className="text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // If a category is selected, show subjects and topics for that category
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
          <p className="text-gray-500 mt-1">Выберите предмет и тему для изучения</p>
        </div>

        {/* Skill Tree */}
        {(() => {
          // Build topics list for SkillTree from all subjects of this category
          const skillTopics: SkillTreeTopic[] = Object.entries(category.subjects).flatMap(
            ([, subject]) =>
              Object.entries(subject.topics).map(([topicKey, topic]) => {
                // Find prerequisites from topicGraph
                const node = topicGraph?.find?.((n: { id: string }) => n.id === topicKey);
                return {
                  id: topicKey,
                  title: topic.name,
                  prerequisites: node?.prerequisites ?? [],
                };
              })
          );

          // Build progress map for SkillTree
          const gradeNum = selectedCategory?.replace('grade', '') ?? '';

          // Collect topic IDs belonging to the current grade's curriculum
          const currentGradeTopicIds = new Set<string>(
            Object.values(category.subjects).flatMap(s => Object.keys(s.topics))
          );

          // Collect mastered topic IDs across ALL grades.
          // Storage key format: "${gradeNum}-${subjectId}-${topicId}"
          const globalMasteredIds = new Set<string>(
            Object.entries(studentProgress.topics)
              .filter(([, v]) => v.level === 'proficient' || v.level === 'mastered')
              .map(([k]) => {
                const parts = k.split('-');
                return (parts.length >= 3 && /^\d+$/.test(parts[0]))
                  ? parts.slice(2).join('-')
                  : k;
              })
          );

          // KEY FIX: prerequisites from a PREVIOUS grade are auto-satisfied.
          // This unlocks the first topics of each grade for new/returning students
          // without requiring them to replay previous grade exercises.
          const resolvedMasteredIds = new Set<string>(globalMasteredIds);
          for (const topicId of currentGradeTopicIds) {
            const node = topicGraph?.find?.((n: { id: string }) => n.id === topicId);
            if (node) {
              for (const prereqId of node.prerequisites) {
                if (!currentGradeTopicIds.has(prereqId)) {
                  resolvedMasteredIds.add(prereqId);
                }
              }
            }
          }

          const skillProgress: SkillTreeProgress = {};
          for (const [subjectKey, subject] of Object.entries(category.subjects)) {
            for (const topicKey of Object.keys(subject.topics)) {
              const key = `${gradeNum}-${subjectKey}-${topicKey}`;
              const tp = studentProgress.topics[key];
              const hasContent =
                (subject.topics[topicKey].challenges.length + subject.topics[topicKey].templates.length) > 0;

              if (tp && (tp.level === 'mastered' || tp.level === 'proficient')) {
                skillProgress[topicKey] = 'completed';
              } else if (!hasContent) {
                skillProgress[topicKey] = 'locked';
              } else {
                const unmet = getUnmetPrerequisites(topicKey, Array.from(resolvedMasteredIds));
                skillProgress[topicKey] = unmet.length === 0 ? 'unlocked' : 'locked';
              }
            }
          }

          // Handle topic click: find its subject and navigate
          const handleSkillTopicClick = (topicId: string) => {
            for (const [subjectKey, subject] of Object.entries(category.subjects)) {
              if (topicId in subject.topics) {
                const topic = subject.topics[topicId];
                const hasContent = (topic.challenges.length + topic.templates.length) > 0;
                if (hasContent) setSelectedTopic(`${subjectKey}/${topicId}`);
                return;
              }
            }
          };

          return (
            <SkillTree
              topics={skillTopics}
              progress={skillProgress}
              onTopicClick={handleSkillTopicClick}
            />
          );
        })()}
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
            {completedChallenges.length} / {allChallenges.length + problemTemplates.length} задач
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedChallenges.length / (allChallenges.length + problemTemplates.length)) * 100}%` }}
          />
        </div>
      </div>

      {/* Category list */}
      <div className="space-y-3">
        {Object.entries(categoryStructure).map(([categoryKey, category]) => {
          const allChallenges = Object.values(category.subjects).flatMap(s => Object.values(s.topics).flatMap(t => t.challenges));
          const allTemplates = Object.values(category.subjects).flatMap(s => Object.values(s.topics).flatMap(t => t.templates));
          const completed = allChallenges.filter(c => completedChallenges.includes(c.id)).length +
            allTemplates.filter(t => completedChallenges.includes(t.id)).length;
          const total = allChallenges.length + allTemplates.length;
          const progress = total > 0 ? (completed / total) * 100 : 0;

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
                    {Object.values(category.subjects).reduce((sum, s) => sum + Object.keys(s.topics).length, 0)} тем • {completed} / {total} задач выполнено
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
