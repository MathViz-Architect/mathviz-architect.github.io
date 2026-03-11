import React from 'react';
import {
  X,
  PenLine,
  Shapes,
  Type,
  MousePointer2,
  BookOpen,
  Brain,
  FunctionSquare,
  Triangle,
  Dot,
  Keyboard,
} from 'lucide-react';

interface WelcomeScreenProps {
  onClose: () => void;
}

const features = [
  {
    icon: <MousePointer2 size={22} className="text-indigo-500" />,
    bg: 'bg-indigo-50',
    title: 'Рисование',
    desc: 'Фигуры, линии, карандаш, текст, ластик. Выбери инструмент слева, кликни и тяни на холсте.',
  },
  {
    icon: <Triangle size={22} className="text-violet-500" />,
    bg: 'bg-violet-50',
    title: 'Интерактивная геометрия',
    desc: 'Точки, отрезки, углы. Объекты связаны — перемести точку, и отрезок обновится автоматически.',
  },
  {
    icon: <PenLine size={22} className="text-pink-500" />,
    bg: 'bg-pink-50',
    title: 'Карандаш',
    desc: 'Свободное рисование от руки. Настрой толщину и цвет в панели справа до начала рисования.',
  },
  {
    icon: <Shapes size={22} className="text-emerald-500" />,
    bg: 'bg-emerald-50',
    title: 'Геометрические фигуры',
    desc: 'Треугольники и четырёхугольники с настройкой сторон. Параметры меняются в панели справа.',
  },
  {
    icon: <FunctionSquare size={22} className="text-blue-500" />,
    bg: 'bg-blue-50',
    title: 'Интерактивные модули',
    desc: '18 готовых математических визуализаций: функции, геометрия, тригонометрия. Меняй параметры и наблюдай результат.',
  },
  {
    icon: <Brain size={22} className="text-amber-500" />,
    bg: 'bg-amber-50',
    title: 'Режим задач',
    desc: 'Адаптивные задачи для 5–6 класса. Система подбирает сложность автоматически.',
  },
  {
    icon: <BookOpen size={22} className="text-teal-500" />,
    bg: 'bg-teal-50',
    title: 'Библиотека шаблонов',
    desc: 'Готовые шаблоны для быстрого старта. Выбери шаблон и начни работу сразу.',
  },
  {
    icon: <Keyboard size={22} className="text-gray-500" />,
    bg: 'bg-gray-50',
    title: 'Горячие клавиши',
    desc: 'V — выбор, E — ластик, F — карандаш, T — текст, P — точка, S — отрезок, A — угол, L — линия.',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-7 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white mb-1">
            Добро пожаловать в MathViz Architect! 🎉
          </h1>
          <p className="text-indigo-200 text-sm">
            Твой помощник для визуального изучения математики
          </p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          <p className="text-gray-600 text-sm text-center mb-6">
            Здесь ты можешь рисовать, изучать математику через интерактивные визуализации и решать задачи.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center flex-shrink-0`}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 mb-0.5">{f.title}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex-shrink-0 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400">Несколько страниц, автосохранение, экспорт проекта</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors flex-shrink-0"
          >
            Начать работу →
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
