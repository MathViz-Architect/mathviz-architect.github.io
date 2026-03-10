export interface CurriculumTopic {
    id: string;
    title: string;
}

export interface CurriculumSubject {
    id: string;
    title: string;
    topics: CurriculumTopic[];
}

export interface CurriculumGrade {
    id: number;
    title: string;
    color: string;
    subjects: CurriculumSubject[];
}

export const curriculum: CurriculumGrade[] = [
    {
        id: 5,
        title: '5 класс',
        color: 'blue',
        subjects: [
            {
                id: 'algebra',
                title: 'Алгебра',
                topics: [
                    { id: 'comparison', title: 'Сравнение чисел' },
                    { id: 'arithmetic', title: 'Арифметика и уравнения' },
                    { id: 'decimals', title: 'Десятичные дроби' },
                    { id: 'fractionsIntro', title: 'Обыкновенные дроби' },
                    { id: 'gcdLcm', title: 'НОД и НОК' },
                    { id: 'divisors', title: 'Кратные и делители' },
                    { id: 'patterns', title: 'Закономерности' },
                    { id: 'priceQuantity', title: 'Цена и стоимость' },
                    { id: 'speedTimeDistance', title: 'Скорость, время, расстояние' },
                    { id: 'parts', title: 'Задачи на части' },
                    { id: 'percentages', title: 'Проценты' },
                    { id: 'timeUnits', title: 'Единицы времени' },
                    { id: 'measureUnits', title: 'Единицы измерения' },
                    { id: 'average', title: 'Среднее арифметическое' },
                    { id: 'primeNumbers', title: 'Простые числа' },
                ],
            },
            {
                id: 'geometry',
                title: 'Геометрия',
                topics: [
                    { id: 'perimeter', title: 'Периметр фигур' },
                    { id: 'area', title: 'Площадь прямоугольника' },
                    { id: 'triangles', title: 'Типы треугольников' },
                    { id: 'angles', title: 'Углы' },
                    { id: 'coordinates', title: 'Координатная плоскость' },
                ],
            },
            {
                id: 'logic',
                title: 'Логика',
                topics: [
                    { id: 'magicSquare', title: 'Магические квадраты' },
                    { id: 'olympiad', title: 'Олимпиадные задачи' },
                ],
            },
        ],
    },
    {
        id: 6,
        title: '6 класс',
        color: 'indigo',
        subjects: [
            {
                id: 'algebra',
                title: 'Алгебра',
                topics: [
                    // Делимость
                    { id: 'divisibility_rules', title: 'Признаки делимости' },
                    { id: 'prime_factorization', title: 'Разложение на простые множители' },
                    { id: 'gcd', title: 'Наибольший общий делитель' },
                    { id: 'lcm', title: 'Наименьшее общее кратное' },
                    // Дроби
                    { id: 'fraction_property', title: 'Основное свойство дроби' },
                    { id: 'fraction_reduction', title: 'Сокращение дробей' },
                    { id: 'common_denominator', title: 'Общий знаменатель' },
                    { id: 'fraction_add_sub', title: 'Сложение и вычитание дробей' },
                    { id: 'fraction_mul', title: 'Умножение дробей' },
                    { id: 'fraction_div', title: 'Деление дробей' },
                    // Отношения и пропорции
                    { id: 'ratios', title: 'Отношения' },
                    { id: 'proportions', title: 'Пропорции' },
                    { id: 'direct_proportion', title: 'Прямая и обратная пропорциональность' },
                    // Проценты
                    { id: 'percent_basics', title: 'Понятие процента' },
                    { id: 'percent_of_number', title: 'Нахождение процента от числа' },
                    { id: 'number_by_percent', title: 'Нахождение числа по проценту' },
                    { id: 'percent_change', title: 'Процентное изменение' },
                    // Линейные уравнения
                    { id: 'linear_equations_basic', title: 'Линейные уравнения' },
                    { id: 'linear_equations_brackets', title: 'Уравнения со скобками' },
                    { id: 'word_problems_equations', title: 'Текстовые задачи через уравнения' },
                ],
            },
            {
                id: 'geometry',
                title: 'Геометрия',
                topics: [
                    { id: 'coordinate_plane', title: 'Координатная плоскость' },
                    { id: 'quadrants', title: 'Четверти координатной плоскости' },
                    { id: 'distance_on_axis', title: 'Расстояние на числовой оси' },
                    { id: 'angles', title: 'Смежные и вертикальные углы' },
                    { id: 'circles', title: 'Длина окружности и площадь круга' },
                    { id: 'figureArea', title: 'Площадь треугольника и трапеции' },
                ],
            },
        ],
    },
    {
        id: 7,
        title: '7 класс',
        color: 'green',
        subjects: [
            {
                id: 'algebra',
                title: 'Алгебра',
                topics: [
                    { id: 'equations', title: 'Линейные уравнения' },
                    { id: 'linear', title: 'Линейные функции' },
                    { id: 'systems', title: 'Системы уравнений' },
                ],
            },
            {
                id: 'geometry',
                title: 'Геометрия',
                topics: [
                    { id: 'triangles', title: 'Треугольники' },
                    { id: 'equality', title: 'Равенство треугольников' },
                    { id: 'medians', title: 'Медианы и биссектрисы' },
                ],
            },
        ],
    },
    {
        id: 8,
        title: '8 класс',
        color: 'amber',
        subjects: [
            {
                id: 'algebra',
                title: 'Алгебра',
                topics: [
                    { id: 'quadratic', title: 'Квадратные уравнения' },
                    { id: 'graphs', title: 'Графики функций' },
                    { id: 'systemsAdvanced', title: 'Системы уравнений' },
                ],
            },
            {
                id: 'geometry',
                title: 'Геометрия',
                topics: [
                    { id: 'similarity', title: 'Подобие' },
                    { id: 'pythagorean', title: 'Теорема Пифагора' },
                    { id: 'triangleArea', title: 'Площадь треугольника' },
                ],
            },
        ],
    },
    {
        id: 9,
        title: '9–11 класс',
        color: 'red',
        subjects: [
            {
                id: 'algebra',
                title: 'Алгебра',
                topics: [
                    { id: 'derivatives', title: 'Производные' },
                    { id: 'analysis', title: 'Исследование функций' },
                    { id: 'logarithms', title: 'Логарифмы' },
                    { id: 'exponential', title: 'Показательные функции' },
                ],
            },
            {
                id: 'geometry',
                title: 'Геометрия',
                topics: [
                    { id: 'trigonometry', title: 'Тригонометрия' },
                    { id: 'vectors', title: 'Векторы' },
                    { id: 'coordinates', title: 'Координатная геометрия' },
                ],
            },
            {
                id: 'probability',
                title: 'Вероятность',
                topics: [
                    { id: 'events', title: 'Вероятность событий' },
                    { id: 'combinatorics', title: 'Комбинаторика' },
                    { id: 'trees', title: 'Вероятностные деревья' },
                ],
            },
        ],
    },
];
