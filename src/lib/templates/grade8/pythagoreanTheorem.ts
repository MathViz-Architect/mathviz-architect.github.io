import { ProblemTemplate } from '../../types';

// ============================================================
// Grade 8 — Теорема Пифагора (4 шаблона)
// ============================================================
// СТРАТЕГИЯ ГЕНЕРАЦИИ:
//   Прямоугольные треугольники с целыми сторонами
//   c² = a² + b²
//   Избегать вырожденных случаев
// ============================================================

export const grade8PythagoreanTheoremTemplates: ProblemTemplate[] = [

    // ===== 1. Найти гипотенузу =====
    {
        id: 'grade8-pythag-hypotenuse',
        class: 8,
        subject: 'geometry',
        section: 'Теорема Пифагора',
        topic: 'pythagoreanTheorem',
        topic_title: 'Теорема Пифагора',
        problemType: 'numeric',
        relatedModule: 'pythagorean',
        skills: ['pythagorean', 'right-triangles'],
        difficulties: {
            // Уровень 1 — целые стороны
            1: {
                template: 'В прямоугольном треугольнике катеты {a} см и {b} см. Найдите гипотенузу.',
                parameters: {
                    a: { type: 'int', min: 3, max: 10 },
                    b: { type: 'int', min: 3, max: 10 },
                },
                constraints: ['a !== b'],
                answer_formula: 'Math.sqrt(a*a + b*b)',
                hint: 'Гипотенуза² = катет₁² + катет₂²',
                solution: [
                    { explanation: 'По теореме Пифагора: c² = a² + b²' },
                    { explanation: 'c² = {a}² + {b}² = {a*a} + {b*b} = {a*a + b*b}' },
                    { explanation: 'c = √{a*a + b*b}' },
                    { explanation: 'Ответ:', result: 'Math.sqrt(a*a + b*b)' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Нужно возвести в квадрат и сложить, не просто сложить.' },
                    { pattern: 'Math.sqrt(a + b)', feedback: 'Сначала сложите квадраты, потом извлеките корень.' },
                ],
            },
            // Уровень 2 — с корнем
            2: {
                template: 'В прямоугольном треугольнике катеты {a} см и {b} см. Найдите гипотенузу.',
                parameters: {
                    a: { type: 'int', min: 1, max: 7 },
                    b: { type: 'int', min: 1, max: 7 },
                },
                constraints: ['a !== b', 'a*a + b*b !== Math.floor(Math.sqrt(a*a + b*b)) * Math.floor(Math.sqrt(a*a + b*b))'],
                answer_formula: 'Math.sqrt(a*a + b*b)',
                hint: 'Гипотенуза = √(a² + b²)',
                solution: [
                    { explanation: 'c² = {a}² + {b}² = {a*a + b*b}' },
                    { explanation: 'c = √{a*a + b*b}' },
                    { explanation: 'Ответ:', result: 'Math.sqrt(a*a + b*b)' },
                ],
            },
            // Уровень 3 — дробные стороны
            3: {
                template: 'В прямоугольном треугольнике катеты {a} и {b}. Найдите гипотенузу.',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: 1, max: 5 },
                    k: { type: 'int', min: 2, max: 4 },
                },
                constraints: ['a !== b'],
                answer_formula: 'Math.sqrt(a*a + b*b)',
                hint: 'Примените теорему Пифагора.',
                solution: [
                    { explanation: 'Катеты: {a}, {b}' },
                    { explanation: 'Гипотенуза: √({a}² + {b}²) = √{a*a + b*b}' },
                    { explanation: 'Ответ:', result: 'Math.sqrt(a*a + b*b)' },
                ],
            },
            // Уровень 4 — с проверкой
            4: {
                template: 'В прямоугольном треугольнике катеты {a} см и {b} см. Найдите гипотенузу и проверьте теорему.',
                parameters: {
                    a: { type: 'int', min: 3, max: 8 },
                    b: { type: 'int', min: 3, max: 8 },
                },
                constraints: ['a !== b'],
                answer_formula: 'Math.sqrt(a*a + b*b)',
                hint: 'Найдите гипотенузу и убедитесь, что c² = a² + b².',
                solution: [
                    { explanation: 'c = √({a}² + {b}²) = √{a*a + b*b} = {Math.sqrt(a*a + b*b)}' },
                    { explanation: 'Проверка: {Math.sqrt(a*a + b*b)}² = {a*a + b*b} ✓' },
                    { explanation: 'Ответ:', result: 'Math.sqrt(a*a + b*b)' },
                ],
            },
        },
    },

    // ===== 2. Найти катет =====
    {
        id: 'grade8-pythag-leg',
        class: 8,
        subject: 'geometry',
        section: 'Теорема Пифагора',
        topic: 'pythagoreanTheorem',
        topic_title: 'Теорема Пифагора',
        problemType: 'numeric',
        relatedModule: 'pythagorean',
        skills: ['pythagorean', 'right-triangles'],
        difficulties: {
            // Уровень 1 — найти катет по гипотенузе и другому катету
            1: {
                template: 'В прямоугольном треугольнике гипотенуза {c} см, один катет {a} см. Найдите второй катет.',
                parameters: {
                    c: { type: 'int', min: 5, max: 13 },
                    a: { type: 'int', min: 3, max: 8 },
                },
                constraints: ['c > a', 'c*c - a*a > 0', 'Math.sqrt(c*c - a*a) === Math.floor(Math.sqrt(c*c - a*a))'],
                answer_formula: 'Math.sqrt(c*c - a*a)',
                hint: 'Катет² = гипотенуза² - другой катет²',
                solution: [
                    { explanation: 'b² = c² - a²' },
                    { explanation: 'b² = {c}² - {a}² = {c*c} - {a*a} = {c*c - a*a}' },
                    { explanation: 'b = √{c*c - a*a}' },
                    { explanation: 'Ответ:', result: 'Math.sqrt(c*c - a*a)' },
                ],
            },
            // Уровень 2 — с корнем
            2: {
                template: 'В прямоугольном треугольнике гипотенуза {c} см, один катет {a} см. Найдите второй катет.',
                parameters: {
                    c: { type: 'int', min: 5, max: 15 },
                    a: { type: 'int', min: 1, max: 10 },
                },
                constraints: ['c > a', 'c*c - a*a > 0'],
                answer_formula: 'Math.sqrt(c*c - a*a)',
                hint: 'b = √(c² - a²)',
                solution: [
                    { explanation: 'b² = {c}² - {a}² = {c*c - a*a}' },
                    { explanation: 'b = √{c*c - a*a}' },
                    { explanation: 'Ответ:', result: 'Math.sqrt(c*c - a*a)' },
                ],
            },
            // Уровень 3 — дробный ответ
            3: {
                template: 'В прямоугольном треугольнике гипотенуза {c}, один катет {a}. Найдите второй катет.',
                parameters: {
                    c: { type: 'int', min: 5, max: 10 },
                    a: { type: 'int', min: 1, max: 7 },
                    k: { type: 'int', min: 2, max: 3 },
                },
                constraints: ['c > a', 'c*c - a*a > 0'],
                answer_formula: 'Math.sqrt(c*c - a*a)',
                hint: 'Второй катет = √(гипотенуза² - катет²)',
                solution: [
                    { explanation: 'b = √({c}² - {a}²) = √{c*c - a*a}' },
                    { explanation: 'Ответ:', result: 'Math.sqrt(c*c - a*a)' },
                ],
            },
        },
    },

    // ===== 3. Проверка на прямоугольный треугольник =====
    {
        id: 'grade8-pythag-check',
        class: 8,
        subject: 'geometry',
        section: 'Теорема Пифагора',
        topic: 'pythagoreanTheorem',
        topic_title: 'Теорема Пифагора',
        problemType: 'text',
        relatedModule: 'pythagorean',
        skills: ['pythagorean', 'right-triangles'],
        difficulties: {
            // Уровень 1 — да/нет
            1: {
                template: 'Могут ли стороны {a}, {b}, {c} быть сторонами прямоугольного треугольника?',
                parameters: {
                    a: { type: 'int', min: 3, max: 10 },
                    b: { type: 'int', min: 3, max: 10 },
                    c: { type: 'int', min: 4, max: 15 },
                },
                constraints: ['a < c', 'b < c', 'a + b > c'],
                answer_formula: 'a*a + b*b === c*c ? "да" : "нет"',
                hint: 'Проверьте теорему Пифагора для каждой возможной гипотенузы.',
                solution: [
                    { explanation: 'Возможная гипотенуза: {c}' },
                    { explanation: 'Проверка: {a}² + {b}² = {a*a + b*b}, {c}² = {c*c}' },
                    { explanation: '{a*a + b*b === c*c ? "Равны" : "Не равны"}' },
                    { explanation: 'Ответ:', result: 'a*a + b*b === c*c ? "да" : "нет"' },
                ],
            },
            // Уровень 2 — определить гипотенузу
            2: {
                template: 'В треугольнике со сторонами {a}, {b}, {c} найдите гипотенузу, если он прямоугольный.',
                parameters: {
                    a: { type: 'int', min: 3, max: 8 },
                    b: { type: 'int', min: 3, max: 8 },
                    c: { type: 'int', min: 5, max: 12 },
                },
                constraints: ['a*a + b*b === c*c || a*a + c*c === b*b || b*b + c*c === a*a'],
                answer_formula: 'a*a + b*b === c*c ? c : a*a + c*c === b*b ? b : a',
                hint: 'Гипотенуза — наибольшая сторона, для которой выполняется теорема Пифагора.',
                solution: [
                    { explanation: 'Проверим для каждой стороны:' },
                    { explanation: 'Если гипотенуза {c}: {a}² + {b}² {a*a + b*b === c*c ? "=" : "≠"} {c}²' },
                    { explanation: 'Если гипотенуза {b}: {a}² + {c}² {a*a + c*c === b*b ? "=" : "≠"} {b}²' },
                    { explanation: 'Если гипотенуза {a}: {b}² + {c}² {b*b + c*c === a*a ? "=" : "≠"} {a}²' },
                    { explanation: 'Гипотенуза:', result: 'a*a + b*b === c*c ? c : a*a + c*c === b*b ? b : a' },
                ],
            },
        },
    },

    // ===== 4. Расстояние между точками =====
    {
        id: 'grade8-pythag-distance',
        class: 8,
        subject: 'geometry',
        section: 'Теорема Пифагора',
        topic: 'pythagoreanTheorem',
        topic_title: 'Теорема Пифагора',
        problemType: 'numeric',
        relatedModule: 'pythagorean',
        skills: ['pythagorean', 'coordinate-plane'],
        difficulties: {
            // Уровень 1 — целые координаты
            1: {
                template: 'Найдите расстояние между точками A({x1}, {y1}) и B({x2}, {y2}).',
                parameters: {
                    x1: { type: 'int', min: 0, max: 5 },
                    y1: { type: 'int', min: 0, max: 5 },
                    x2: { type: 'int', min: 0, max: 5 },
                    y2: { type: 'int', min: 0, max: 5 },
                },
                constraints: ['x1 !== x2 || y1 !== y2'],
                answer_formula: 'Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1))',
                hint: 'Расстояние = √((x₂ - x₁)² + (y₂ - y₁)²)',
                solution: [
                    { explanation: 'Δx = {x2} - {x1} = {x2 - x1}' },
                    { explanation: 'Δy = {y2} - {y1} = {y2 - y1}' },
                    { explanation: 'Расстояние = √(({x2 - x1})² + ({y2 - y1})²) = √{ (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1) }' },
                    { explanation: 'Ответ:', result: 'Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1))' },
                ],
            },
            // Уровень 2 — с корнем
            2: {
                template: 'Найдите расстояние между точками A({x1}, {y1}) и B({x2}, {y2}).',
                parameters: {
                    x1: { type: 'int', min: -5, max: 5 },
                    y1: { type: 'int', min: -5, max: 5 },
                    x2: { type: 'int', min: -5, max: 5 },
                    y2: { type: 'int', min: -5, max: 5 },
                },
                constraints: ['x1 !== x2 || y1 !== y2'],
                answer_formula: 'Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1))',
                hint: 'Используйте формулу расстояния.',
                solution: [
                    { explanation: 'd = √((x₂ - x₁)² + (y₂ - y₁)²)' },
                    { explanation: '= √({(x2 - x1)*(x2 - x1)} + {(y2 - y1)*(y2 - y1)}) = √{(x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1)}' },
                    { explanation: 'Ответ:', result: 'Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1))' },
                ],
            },
            // Уровень 3 — дробные координаты
            3: {
                template: 'Найдите расстояние между точками A({x1}, {y1}) и B({x2}, {y2}).',
                parameters: {
                    x1: { type: 'int', min: -3, max: 3 },
                    y1: { type: 'int', min: -3, max: 3 },
                    x2: { type: 'int', min: -3, max: 3 },
                    y2: { type: 'int', min: -3, max: 3 },
                    k: { type: 'int', min: 2, max: 3 },
                },
                constraints: ['x1 !== x2 || y1 !== y2'],
                answer_formula: 'Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1))',
                hint: 'Расстояние между точками на плоскости.',
                solution: [
                    { explanation: 'd = √((x₂ - x₁)² + (y₂ - y₁)²)' },
                    { explanation: 'Ответ:', result: 'Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1))' },
                ],
            },
        },
    },
];