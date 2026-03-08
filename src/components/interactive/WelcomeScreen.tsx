import React, { useState } from 'react';
import { X, BookOpen, Lightbulb, Zap } from 'lucide-react';

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-t-2xl">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Закрыть"
                    >
                        <X size={24} />
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Добро пожаловать в MathViz Architect!</h1>
                    <p className="text-indigo-100 text-lg">
                        Приложение для визуального изучения школьной математики
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Introduction */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Что это за приложение?</h2>
                        <p className="text-gray-600 leading-relaxed">
                            MathViz Architect превращает абстрактные математические понятия в интерактивные визуальные объекты.
                            Здесь вы можете изучать математику через динамические чертежи, графики, анимации и 3D-модели.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Возможности приложения:</h2>

                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 mb-1">Интерактивные модули</h3>
                                <p className="text-gray-600 text-sm">
                                    Изучайте теорему Пифагора, линейные и квадратичные функции, тригонометрию через интерактивные визуализации.
                                    Изменяйте параметры и наблюдайте, как меняются графики и фигуры в реальном времени.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 mb-1">Библиотека шаблонов</h3>
                                <p className="text-gray-600 text-sm">
                                    Используйте готовые шаблоны геометрических фигур, графиков и математических объектов.
                                    Создавайте собственные визуализации на холсте.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Zap className="text-amber-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 mb-1">Режим заданий</h3>
                                <p className="text-gray-600 text-sm">
                                    Проверьте свои знания в интерактивных математических заданиях и челленджах.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How to start */}
                    <div className="bg-indigo-50 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Как начать?</h2>
                        <ol className="space-y-2 text-gray-700">
                            <li className="flex gap-2">
                                <span className="font-semibold text-indigo-600">1.</span>
                                <span>Выберите режим в левой панели: Интерактивные модули, Библиотека или Задания</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-semibold text-indigo-600">2.</span>
                                <span>В интерактивных модулях используйте слайдеры для изменения параметров</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-semibold text-indigo-600">3.</span>
                                <span>Наблюдайте, как визуализация меняется в реальном времени</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-semibold text-indigo-600">4.</span>
                                <span>Читайте инструкции внутри каждого модуля для лучшего понимания</span>
                            </li>
                        </ol>
                    </div>

                    {/* Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">Больше не показывать это окно</span>
                    </label>

                    {/* Button */}
                    <button
                        onClick={handleClose}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Начать работу
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
