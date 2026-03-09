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
                    { id: 'arithmetic', title: 'Арифметические выражения' },
                    { id: 'patterns', title: 'Закономерности' },
                    { id: 'divisors', title: 'Кратные и делители' },
                ],
            },
            {
                id: 'geometry',
                title: 'Геометрия',
                topics: [
                    { id: 'perimeter', title: 'Периметр фигур' },
                    { id: 'area', title: 'Площадь прямоугольника' },
                    { id: 'triangles', title: 'Типы треугольников' },
                ],
            },
            {
                id: 'logic',
                title: 'Логика',
                topics: [
                    { id: 'magicSquares', title: 'Магические квадраты' },
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
                    { id: 'fractions', title: 'Дроби' },
                    { id: 'proportions', title: 'Пропорции' },
                    { id: 'percentages', title: 'Проценты' },
                ],
            },
            {
                id: 'geometry',
                title: 'Геометрия',
                topics: [
                    { id: 'angles', title: 'Углы' },
                    { id: 'circles', title: 'Окружность' },
                    { id: 'figureArea', title: 'Площадь фигур' },
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
