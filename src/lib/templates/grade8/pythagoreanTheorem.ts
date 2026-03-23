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
        topic_title: 'Найти гипотенузу',
        problemType: 'numeric',
        relatedModule: 'pythagorean',
        skills: ['pythagorean', 'right-triangles'],
        difficulties: {
            // Уровень 1 — целые стороны (пифагоровы тройки, ответ — целое число)
            1: {
                template: 'В прямоугольном треугольнике катеты {a} см и {b} см. Найдите гипотенузу.',
                parameters: {
                    a: { type: 'int', min: 3, max: 10 },
                    b: { type: 'int', min: 3, max: 10 },
                    a2: { type: 'expression', value: 'a*a' },
                    b2: { type: 'expression', value: 'b*b' },
                    sum: { type: 'expression', value: 'a*a + b*b' },
                    c_val: { type: 'expression', value: 'Math.round(Math.sqrt(a*a + b*b))' },
                },
                constraints: [
                    'a !== b',
                    'Math.sqrt(sum) % 1 === 0',
                ],
                answer_formula: 'Math.sqrt(sum)',
                hint: 'Гипотенуза² = катет₁² + катет₂²',
                solution: [
                    { explanation: 'По теореме Пифагора: c² = a² + b²' },
                    { explanation: 'c² = {a}² + {b}² = {a2} + {b2} = {sum}' },
                    { explanation: 'c = $\\sqrt{{sum}}$ = {c_val}' },
                    { explanation: 'Ответ:', result: '{c_val}' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Нужно возвести в квадрат и сложить, не просто сложить.' },
                    { pattern: 'Math.sqrt(a + b)', feedback: 'Сначала сложите квадраты, потом извлеките корень.' },
                ],
            },
            // Уровень 2 — иррациональная гипотенуза
            2: {
                template: 'В прямоугольном треугольнике катеты {a} см и {b} см. Найдите гипотенузу.',
                parameters: {
                    a: { type: 'int', min: 1, max: 7 },
                    b: { type: 'int', min: 1, max: 7 },
                    a2: { type: 'expression', value: 'a*a' },
                    b2: { type: 'expression', value: 'b*b' },
                    sum: { type: 'expression', value: 'a*a + b*b' },
                },
                constraints: [
                    'a !== b',
                    'Math.sqrt(sum) % 1 !== 0',
                ],
                answer_formula: 'Math.sqrt(sum)',
                answer_type: 'expression',
                hint: 'Гипотенуза = $\\sqrt{a^2 + b^2}$',
                solution: [
                    { explanation: 'c² = {a}² + {b}² = {a2} + {b2} = {sum}' },
                    { explanation: 'c = $\\sqrt{{sum}}$' },
                    { explanation: 'Ответ:', result: 'sqrt({sum})' },
                ],
            },
            // Уровень 3 — иррациональная гипотенуза, сложнее
            3: {
                template: 'В прямоугольном треугольнике катеты {a} и {b}. Найдите гипотенузу.',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: 1, max: 5 },
                    k: { type: 'int', min: 2, max: 4 },
                    a2: { type: 'expression', value: 'a*a' },
                    b2: { type: 'expression', value: 'b*b' },
                    sum: { type: 'expression', value: 'a*a + b*b' },
                },
                constraints: ['a !== b'],
                answer_formula: 'Math.sqrt(sum)',
                answer_type: 'expression',
                hint: 'Примените теорему Пифагора.',
                solution: [
                    { explanation: 'Катеты: {a}, {b}' },
                    { explanation: 'c² = {a}² + {b}² = {sum}' },
                    { explanation: 'c = $\\sqrt{{sum}}$' },
                    { explanation: 'Ответ:', result: 'sqrt({sum})' },
                ],
            },
            // Уровень 4 — с проверкой
            4: {
                template: 'В прямоугольном треугольнике катеты {a} см и {b} см. Найдите гипотенузу и проверьте теорему.',
                parameters: {
                    a: { type: 'int', min: 3, max: 8 },
                    b: { type: 'int', min: 3, max: 8 },
                    a2: { type: 'expression', value: 'a*a' },
                    b2: { type: 'expression', value: 'b*b' },
                    sum: { type: 'expression', value: 'a*a + b*b' },
                },
                constraints: ['a !== b'],
                answer_formula: 'Math.sqrt(sum)',
                answer_type: 'expression',
                hint: 'Найдите гипотенузу и убедитесь, что c² = a² + b².',
                solution: [
                    { explanation: 'c² = {a}² + {b}² = {sum}' },
                    { explanation: 'c = $\\sqrt{{sum}}$' },
                    { explanation: 'Проверка: ($\\sqrt{{sum}}$)² = {sum} ✓' },
                    { explanation: 'Ответ:', result: 'sqrt({sum})' },
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
        topic_title: 'Найти катет',
        problemType: 'numeric',
        relatedModule: 'pythagorean',
        skills: ['pythagorean', 'right-triangles'],
        difficulties: {
            // Уровень 1 — целый катет (пифагорова тройка)
            1: {
                template: 'В прямоугольном треугольнике гипотенуза {c} см, один катет {a} см. Найдите второй катет.',
                parameters: {
                    c: { type: 'int', min: 5, max: 13 },
                    a: { type: 'int', min: 3, max: 8 },
                    c2: { type: 'expression', value: 'c*c' },
                    a2: { type: 'expression', value: 'a*a' },
                    diff: { type: 'expression', value: 'c*c - a*a' },
                    b_val: { type: 'expression', value: 'Math.round(Math.sqrt(c*c - a*a))' },
                },
                constraints: [
                    'c > a',
                    'diff > 0',
                    'Math.sqrt(diff) % 1 === 0',
                ],
                answer_formula: 'Math.sqrt(diff)',
                hint: 'Катет² = гипотенуза² - другой катет²',
                solution: [
                    { explanation: 'b² = c² - a²' },
                    { explanation: 'b² = {c}² - {a}² = {c2} - {a2} = {diff}' },
                    { explanation: 'b = $\\sqrt{{diff}}$ = {b_val}' },
                    { explanation: 'Ответ:', result: '{b_val}' },
                ],
            },
            // Уровень 2 — иррациональный катет
            2: {
                template: 'В прямоугольном треугольнике гипотенуза {c} см, один катет {a} см. Найдите второй катет.',
                parameters: {
                    c: { type: 'int', min: 5, max: 15 },
                    a: { type: 'int', min: 1, max: 10 },
                    c2: { type: 'expression', value: 'c*c' },
                    a2: { type: 'expression', value: 'a*a' },
                    diff: { type: 'expression', value: 'c*c - a*a' },
                },
                constraints: ['c > a', 'diff > 0'],
                answer_formula: 'Math.sqrt(diff)',
                answer_type: 'expression',
                hint: '$b = \\sqrt{c^2 - a^2}$',
                solution: [
                    { explanation: 'b² = {c}² - {a}² = {c2} - {a2} = {diff}' },
                    { explanation: 'b = $\\sqrt{{diff}}$' },
                    { explanation: 'Ответ:', result: 'sqrt({diff})' },
                ],
            },
            // Уровень 3 — иррациональный катет, сложнее
            3: {
                template: 'В прямоугольном треугольнике гипотенуза {c}, один катет {a}. Найдите второй катет.',
                parameters: {
                    c: { type: 'int', min: 5, max: 10 },
                    a: { type: 'int', min: 1, max: 7 },
                    k: { type: 'int', min: 2, max: 3 },
                    c2: { type: 'expression', value: 'c*c' },
                    a2: { type: 'expression', value: 'a*a' },
                    diff: { type: 'expression', value: 'c*c - a*a' },
                },
                constraints: ['c > a', 'diff > 0'],
                answer_formula: 'Math.sqrt(diff)',
                answer_type: 'expression',
                hint: 'Второй катет = $\\sqrt{\\text{гипотенуза}^2 - \\text{катет}^2}$',
                solution: [
                    { explanation: 'b² = {c}² - {a}² = {diff}' },
                    { explanation: 'b = $\\sqrt{{diff}}$' },
                    { explanation: 'Ответ:', result: 'sqrt({diff})' },
                ],
            },
        },
    },

    // ===== 3. Проверка на прямоугольный треугольник (да/нет) =====
    {
        id: 'grade8-pythag-check',
        class: 8,
        subject: 'geometry',
        section: 'Теорема Пифагора',
        topic: 'pythagoreanTheorem',
        topic_title: 'Прямоугольный треугольник?',
        problemType: 'text',
        relatedModule: 'pythagorean',
        skills: ['pythagorean', 'right-triangles'],
        difficulties: {
            // Уровень 1 — да/нет
            1: {
                template: 'Является ли треугольник со сторонами {a}, {b}, {c} прямоугольным?',
                parameters: {
                    a: { type: 'int', min: 3, max: 10 },
                    b: { type: 'int', min: 3, max: 10 },
                    c: { type: 'int', min: 4, max: 15 },
                    a2: { type: 'expression', value: 'a*a' },
                    b2: { type: 'expression', value: 'b*b' },
                    c2: { type: 'expression', value: 'c*c' },
                    ab2: { type: 'expression', value: 'a*a + b*b' },
                    isRight: { type: 'expression', value: 'a*a + b*b === c*c ? 1 : 0' },
                },
                constraints: ['a < c', 'b < c', 'a + b > c'],
                answer_formula: 'a*a + b*b === c*c ? "да" : "нет"',
                answer_type: 'text',
                hint: 'Проверьте: a² + b² = c²? Если да — треугольник прямоугольный.',
                solution: [
                    { explanation: 'Проверяем: {a}² + {b}² = {ab2}, {c}² = {c2}' },
                    { explanation: '{ab2} и {c2} — сравниваем суммы квадратов' },
                    { explanation: 'Ответ:', result: '{answer}' },
                ],
            },
        },
    },

    // ===== 3b. Найти гипотенузу в прямоугольном треугольнике =====
    // Стратегия: выбираем индекс пифагоровой тройки (0–4), затем вычисляем
    // стороны через цепочки условий. Это гарантирует валидный треугольник.
    // Тройки: [3,4,5], [5,12,13], [8,15,17], [6,8,10], [9,12,15]
    // Перемешивание: swap = choice(0,1,2) — меняет порядок предъявления сторон
    {
        id: 'grade8-pythag-find-hyp',
        class: 8,
        subject: 'geometry',
        section: 'Теорема Пифагора',
        topic: 'pythagoreanTheorem',
        topic_title: 'Какая сторона — гипотенуза?',
        problemType: 'numeric',
        relatedModule: 'pythagorean',
        skills: ['pythagorean', 'right-triangles'],
        difficulties: {
            1: {
                template: 'В прямоугольном треугольнике со сторонами {s1}, {s2}, {s3} укажите гипотенузу.',
                parameters: {
                    // Индекс тройки: 0=[3,4,5], 1=[5,12,13], 2=[8,15,17], 3=[6,8,10], 4=[9,12,15]
                    ti: { type: 'choice', values: [0, 1, 2, 3, 4] },
                    // Порядок предъявления: 0=abc, 1=bca, 2=cab
                    sw: { type: 'choice', values: [0, 1, 2] },
                    // Катет 1 (меньший)
                    leg1: { type: 'expression', value: 'ti === 0 ? 3 : ti === 1 ? 5 : ti === 2 ? 8 : ti === 3 ? 6 : 9' },
                    // Катет 2 (больший)
                    leg2: { type: 'expression', value: 'ti === 0 ? 4 : ti === 1 ? 12 : ti === 2 ? 15 : ti === 3 ? 8 : 12' },
                    // Гипотенуза
                    hyp: { type: 'expression', value: 'ti === 0 ? 5 : ti === 1 ? 13 : ti === 2 ? 17 : ti === 3 ? 10 : 15' },
                    // Перемешанные стороны для отображения
                    s1: { type: 'expression', value: 'sw === 0 ? leg1 : sw === 1 ? leg2 : hyp' },
                    s2: { type: 'expression', value: 'sw === 0 ? leg2 : sw === 1 ? hyp : leg1' },
                    s3: { type: 'expression', value: 'sw === 0 ? hyp : sw === 1 ? leg1 : leg2' },
                    // Квадраты для решения
                    s1_2: { type: 'expression', value: 's1*s1' },
                    s2_2: { type: 'expression', value: 's2*s2' },
                    s3_2: { type: 'expression', value: 's3*s3' },
                    s12_s22: { type: 'expression', value: 's1*s1 + s2*s2' },
                },
                constraints: [],
                answer_formula: 'hyp',
                hint: 'Гипотенуза — наибольшая сторона, для которой выполняется теорема Пифагора.',
                solution: [
                    { explanation: 'Проверим: {s1}² + {s2}² = {s12_s22}, {s3}² = {s3_2}' },
                    { explanation: 'Гипотенуза — та сторона, квадрат которой равен сумме квадратов двух других.' },
                    { explanation: 'Гипотенуза:', result: '{hyp}' },
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
        topic_title: 'Расстояние между точками',
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
                    dx: { type: 'expression', value: 'x2 - x1' },
                    dy: { type: 'expression', value: 'y2 - y1' },
                    dsum: { type: 'expression', value: '(x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1)' },
                },
                constraints: ['x1 !== x2 || y1 !== y2'],
                answer_formula: 'Math.sqrt(dsum)',
                answer_type: 'expression',
                hint: 'Расстояние = $\\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$',
                solution: [
                    { explanation: 'Δx = {x2} - {x1} = {dx}' },
                    { explanation: 'Δy = {y2} - {y1} = {dy}' },
                    { explanation: 'Расстояние = $\\sqrt{({dx})^2 + ({dy})^2}$ = $\\sqrt{{dsum}}$' },
                    { explanation: 'Ответ:', result: 'sqrt({dsum})' },
                ],
            },
            // Уровень 2 — с корнем, координаты могут быть отрицательными
            2: {
                template: 'Найдите расстояние между точками A({x1}, {y1}) и B({x2}, {y2}).',
                parameters: {
                    x1: { type: 'int', min: -5, max: 5 },
                    y1: { type: 'int', min: -5, max: 5 },
                    x2: { type: 'int', min: -5, max: 5 },
                    y2: { type: 'int', min: -5, max: 5 },
                    dx: { type: 'expression', value: 'x2 - x1' },
                    dy: { type: 'expression', value: 'y2 - y1' },
                    dsum: { type: 'expression', value: '(x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1)' },
                },
                constraints: ['x1 !== x2 || y1 !== y2'],
                answer_formula: 'Math.sqrt(dsum)',
                answer_type: 'expression',
                hint: 'Используйте формулу расстояния.',
                solution: [
                    { explanation: 'Δx = {dx}, Δy = {dy}' },
                    { explanation: 'd = $\\sqrt{({dx})^2 + ({dy})^2}$ = $\\sqrt{{dsum}}$' },
                    { explanation: 'Ответ:', result: 'sqrt({dsum})' },
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
                    dx: { type: 'expression', value: 'x2 - x1' },
                    dy: { type: 'expression', value: 'y2 - y1' },
                    dsum: { type: 'expression', value: '(x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1)' },
                },
                constraints: ['x1 !== x2 || y1 !== y2'],
                answer_formula: 'Math.sqrt(dsum)',
                answer_type: 'expression',
                hint: 'Расстояние между точками на плоскости.',
                solution: [
                    { explanation: 'Δx = {dx}, Δy = {dy}' },
                    { explanation: 'd = $\\sqrt{{dsum}}$' },
                    { explanation: 'Ответ:', result: 'sqrt({dsum})' },
                ],
            },
        },
    },
];
