import { ProblemTemplate } from '../../types';

// ============================================================
// Grade 8 — Площади четырехугольников (4 шаблона)
// ============================================================
// СТРАТЕГИЯ ГЕНЕРАЦИИ:
//   Параллелограммы, трапеции, ромбы, прямоугольники
//   Формулы площадей с основаниями и высотами
// ============================================================

export const grade8QuadrilateralAreaTemplates: ProblemTemplate[] = [

    // ===== 1. Площадь параллелограмма =====
    {
        id: 'grade8-parallelogram-area',
        class: 8,
        subject: 'geometry',
        section: 'Площади четырехугольников',
        topic: 'quadrilateralArea',
        topic_title: 'Площади четырехугольников',
        problemType: 'numeric',
        relatedModule: 'quadrilateral-area',
        skills: ['area', 'parallelogram'],
        difficulties: {
            // Уровень 1 — основание и высота целые
            1: {
                template: 'Найдите площадь параллелограмма с основанием {base} см и высотой {height} см.',
                parameters: {
                    base: { type: 'int', min: 5, max: 15 },
                    height: { type: 'int', min: 3, max: 10 },
                },
                answer_formula: 'base * height',
                hint: 'Площадь параллелограмма = основание × высота.',
                solution: [
                    { explanation: 'S = {base} × {height} = {base * height} см²' },
                    { explanation: 'Ответ:', result: 'base * height' },
                ],
            },
            // Уровень 2 — с дробной высотой
            2: {
                template: 'Найдите площадь параллелограмма с основанием {base} см и высотой {num}/{den} см.',
                parameters: {
                    base: { type: 'int', min: 6, max: 12 },
                    num: { type: 'int', min: 1, max: 5 },
                    den: { type: 'int', min: 2, max: 4 },
                },
                constraints: ['num < den'],
                answer_formula: 'base * num / den',
                answer_type: 'fraction',
                hint: 'Площадь параллелограмма = основание × высота.',
                solution: [
                    { explanation: 'S = {base} × {num}/{den} = {base * num}/{den} см²' },
                    { explanation: 'Ответ:', result: 'base * num / den' },
                ],
            },
            // Уровень 3 — найти основание
            3: {
                template: 'Площадь параллелограмма {area} см², высота {height} см. Найдите основание.',
                parameters: {
                    area: { type: 'int', min: 20, max: 60 },
                    height: { type: 'int', min: 4, max: 8 },
                },
                constraints: ['area % height === 0'],
                answer_formula: 'area / height',
                hint: 'Основание = площадь / высота.',
                solution: [
                    { explanation: 'Основание = {area} / {height} = {area / height} см' },
                    { explanation: 'Ответ:', result: 'area / height' },
                ],
            },
        },
    },

    // ===== 2. Площадь трапеции =====
    {
        id: 'grade8-trapezoid-area',
        class: 8,
        subject: 'geometry',
        section: 'Площади четырехугольников',
        topic: 'quadrilateralArea',
        topic_title: 'Площади четырехугольников',
        problemType: 'numeric',
        relatedModule: 'quadrilateral-area',
        skills: ['area', 'trapezoid'],
        difficulties: {
            // Уровень 1 — среднее арифметическое оснований
            1: {
                template: 'Найдите площадь трапеции с основаниями {a} см и {b} см, высотой {h} см.',
                parameters: {
                    a: { type: 'int', min: 8, max: 15 },
                    b: { type: 'int', min: 4, max: 7 },
                    h: { type: 'int', min: 3, max: 8 },
                },
                constraints: ['a > b'],
                answer_formula: '(a + b) * h / 2',
                hint: 'Площадь трапеции = (сумма оснований × высота) / 2.',
                solution: [
                    { explanation: 'S = ({a} + {b}) × {h} / 2 = {(a + b) * h / 2} см²' },
                    { explanation: 'Ответ:', result: '(a + b) * h / 2' },
                ],
            },
            // Уровень 2 — дробная высота
            2: {
                template: 'Найдите площадь трапеции с основаниями {a} см и {b} см, высотой {num}/{den} см.',
                parameters: {
                    a: { type: 'int', min: 10, max: 18 },
                    b: { type: 'int', min: 5, max: 9 },
                    num: { type: 'int', min: 2, max: 6 },
                    den: { type: 'int', min: 2, max: 4 },
                },
                constraints: ['a > b', 'num < den'],
                answer_formula: '(a + b) * num / den / 2',
                answer_type: 'fraction',
                hint: 'Площадь трапеции = (сумма оснований × высота) / 2.',
                solution: [
                    { explanation: 'S = ({a} + {b}) × {num}/{den} / 2 = {(a + b) * num}/{den} / 2 = {(a + b) * num}/{den * 2} см²' },
                    { explanation: 'Ответ:', result: '(a + b) * num / den / 2' },
                ],
            },
            // Уровень 3 — найти высоту
            3: {
                template: 'Площадь трапеции {area} см², основания {a} см и {b} см. Найдите высоту.',
                parameters: {
                    area: { type: 'int', min: 25, max: 75 },
                    a: { type: 'int', min: 9, max: 16 },
                    b: { type: 'int', min: 4, max: 8 },
                },
                constraints: ['a > b', '(area * 2) % (a + b) === 0'],
                answer_formula: 'area * 2 / (a + b)',
                hint: 'Высота = (площадь × 2) / сумма оснований.',
                solution: [
                    { explanation: 'h = {area} × 2 / ({a} + {b}) = {area * 2 / (a + b)} см' },
                    { explanation: 'Ответ:', result: 'area * 2 / (a + b)' },
                ],
            },
        },
    },

    // ===== 3. Площадь ромба =====
    {
        id: 'grade8-rhombus-area',
        class: 8,
        subject: 'geometry',
        section: 'Площади четырехугольников',
        topic: 'quadrilateralArea',
        topic_title: 'Площади четырехугольников',
        problemType: 'numeric',
        relatedModule: 'quadrilateral-area',
        skills: ['area', 'rhombus'],
        difficulties: {
            // Уровень 1 — по диагоналям
            1: {
                template: 'Найдите площадь ромба с диагоналями {d1} см и {d2} см.',
                parameters: {
                    d1: { type: 'int', min: 6, max: 12 },
                    d2: { type: 'int', min: 4, max: 10 },
                },
                answer_formula: 'd1 * d2 / 2',
                hint: 'Площадь ромба = (диагональ₁ × диагональ₂) / 2.',
                solution: [
                    { explanation: 'S = {d1} × {d2} / 2 = {d1 * d2 / 2} см²' },
                    { explanation: 'Ответ:', result: 'd1 * d2 / 2' },
                ],
            },
            // Уровень 2 — по стороне и высоте
            2: {
                template: 'Найдите площадь ромба со стороной {side} см и высотой {height} см.',
                parameters: {
                    side: { type: 'int', min: 5, max: 11 },
                    height: { type: 'int', min: 3, max: 8 },
                },
                answer_formula: 'side * height',
                hint: 'Площадь ромба = сторона × высота.',
                solution: [
                    { explanation: 'S = {side} × {height} = {side * height} см²' },
                    { explanation: 'Ответ:', result: 'side * height' },
                ],
            },
            // Уровень 3 — найти диагональ
            3: {
                template: 'Площадь ромба {area} см², диагонали {d1} см и d₂. Найдите d₂.',
                parameters: {
                    area: { type: 'int', min: 20, max: 60 },
                    d1: { type: 'int', min: 6, max: 12 },
                },
                constraints: ['(area * 2) % d1 === 0'],
                answer_formula: 'area * 2 / d1',
                hint: 'd₂ = (площадь × 2) / d₁.',
                solution: [
                    { explanation: 'd₂ = {area} × 2 / {d1} = {area * 2 / d1} см' },
                    { explanation: 'Ответ:', result: 'area * 2 / d1' },
                ],
            },
        },
    },

    // ===== 4. Площадь прямоугольника =====
    {
        id: 'grade8-rectangle-area',
        class: 8,
        subject: 'geometry',
        section: 'Площади четырехугольников',
        topic: 'quadrilateralArea',
        topic_title: 'Площади четырехугольников',
        problemType: 'numeric',
        relatedModule: 'quadrilateral-area',
        skills: ['area', 'rectangle'],
        difficulties: {
            // Уровень 1 — длина и ширина
            1: {
                template: 'Найдите площадь прямоугольника со сторонами {a} см и {b} см.',
                parameters: {
                    a: { type: 'int', min: 5, max: 12 },
                    b: { type: 'int', min: 3, max: 9 },
                },
                answer_formula: 'a * b',
                hint: 'Площадь прямоугольника = длина × ширина.',
                solution: [
                    { explanation: 'S = {a} × {b} = {a * b} см²' },
                    { explanation: 'Ответ:', result: 'a * b' },
                ],
            },
            // Уровень 2 — найти сторону
            2: {
                template: 'Площадь прямоугольника {area} см², одна сторона {a} см. Найдите другую сторону.',
                parameters: {
                    area: { type: 'int', min: 20, max: 60 },
                    a: { type: 'int', min: 4, max: 10 },
                },
                constraints: ['area % a === 0'],
                answer_formula: 'area / a',
                hint: 'Другая сторона = площадь / известная сторона.',
                solution: [
                    { explanation: 'Сторона = {area} / {a} = {area / a} см' },
                    { explanation: 'Ответ:', result: 'area / a' },
                ],
            },
            // Уровень 3 — периметр и сторона
            3: {
                template: 'Периметр прямоугольника {perimeter} см, одна сторона {a} см. Найдите площадь.',
                parameters: {
                    perimeter: { type: 'int', min: 24, max: 48 },
                    a: { type: 'int', min: 4, max: 10 },
                },
                constraints: ['perimeter % 2 === 0', 'perimeter > a * 2'],
                answer_formula: 'a * (perimeter / 2 - a)',
                hint: 'Найдите вторую сторону: (периметр / 2) - первая сторона.',
                solution: [
                    { explanation: 'Вторая сторона = {perimeter}/2 - {a} = {perimeter / 2 - a} см' },
                    { explanation: 'S = {a} × {perimeter / 2 - a} = {a * (perimeter / 2 - a)} см²' },
                    { explanation: 'Ответ:', result: 'a * (perimeter / 2 - a)' },
                ],
            },
        },
    },
];