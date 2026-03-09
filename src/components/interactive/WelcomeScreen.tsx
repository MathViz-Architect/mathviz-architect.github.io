import React, { useState } from 'react';
import { X, Square, Pentagon, FunctionSquare, Library, Brain, Save, Keyboard } from 'lucide-react';

interface WelcomeScreenProps {
    onClose: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClose }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('welcomeScreenShown', 'true');
        }
        onClose();
    };

    const features = [
        {
            icon: Square,
            color: 'bg-blue-100 text-blue-600',
            title: '🎨 Рисование',
            description: 'Фигуры, линии, текст, ластик. Выбери инструмент слева, кликни и тяни на холсте.'
        },
        {
            icon: Pentagon,
            color: 'bg-purple-100 text-purple-600',
            title: '📐 Геометрические фигуры',
            description: 'Треугольники и четырёхугольники с настройкой сторон. Настрой каждую сторону отдельно в панели справа.'
        },
        {
            icon: FunctionSquare,
            color: 'bg-indigo-100 text-indigo-600',
            title: '📊 Интерактивные модули',
            description: '18 готовых математических визуализаций: функции, геометрия, тригонометрия. Меняй параметры и наблюдай результат!'
        },
        {
            icon: Library,
            color: 'bg-emerald-100 text-emerald-600',
            title: '📚 Библиотека шаблонов',
            description: 'Готовые шаблоны для быстрого старта. Выбери шаблон и начни работу сразу.'
        },
        {
            icon: Brain,
            color: 'bg-amber-100 text-amber-600',
            title: '🎯 Режим задач',
            description: 'Математические задачи с проверкой ответов. Проверь свои знания и получи мгновенную обратную связь.'
        },
        {
            icon: Save,
            color: 'bg-rose-100 text-rose-600',
            title: '💾 Сохранение',
            description: 'Сохрани проект кнопкой вверху слева. Открой сохранённый файл там же в любое время.'
        },
        {
            icon: Keyboard,
            color: 'bg-cyan-100 text-cyan-600',
            title: '⌨️ Горячие клавиши',
            description: 'Ctrl+Z — отмена, Ctrl+Y — повтор, Delete — удалить объект, Space+перетаскивание — панорамирование холста.'
        },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-t-2xl">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Закрыть"
                    >
                        <X size={24} />
                    </button>
                    <h1 className="text-4xl font-bold mb-3">Добро пожаловать в MathViz Architect! 🎉</h1>
                    <p className="text-indigo-100 text-xl">
                        Твой помощник для визуального изучения математики
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Introduction */}
                    <div className="text-center">
                        <p className="text-gray-700 text-lg leading-relaxed">
                            Здесь ты можешь рисовать, изучать математику через интерактивные визуализации и решать задачи.
                            <br />
                            Давай посмотрим, что умеет это приложение! 👇
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
                            >
                                <div className="flex gap-4 items-start">
                                    <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center flex-shrink-0`}>
                                        <feature.icon size={28} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 text-lg mb-2">{feature.title}</h3>
                                        <p className="text-gray-600 text-base leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Start Tip */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-2xl">💡</span>
                            Совет для начала
                        </h2>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            Начни с раздела <span className="font-semibold text-indigo-600">"Интерактивные модули"</span> в левой панели.
                            Выбери любой модуль и попробуй изменить параметры ползунками — увидишь, как математика оживает! ✨
                        </p>
                    </div>

                    {/* Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer justify-center">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700 text-base">Больше не показывать это окно</span>
                    </label>

                    {/* Button */}
                    <button
                        onClick={handleClose}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        Начать работу 🚀
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
