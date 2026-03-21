import { ProblemTemplate } from '../../types';

// ============================================================
// Grade 8 — Рациональные выражения (4 шаблона)
// ============================================================
// СТРАТЕГИЯ ГЕНЕРАЦИИ:
//   Дроби вида (ax + b)/(cx + d)
//   Упрощение, сложение, умножение
//   Избегать случаев когда знаменатель = 0
// ============================================================

export const grade8RationalExpressionTemplates: ProblemTemplate[] = [

    // ===== 1. Упрощение рационального выражения =====
    {
        id: 'grade8-rational-simplify',
        class: 8,
        subject: 'algebra',
        section: 'Рациональные выражения',
        topic: 'rationalExpression',
        topic_title: 'Рациональные выражения',
        problemType: 'text',
        skills: ['fractions', 'polynomials'],
        difficulties: {
            // Уровень 1 — простое сокращение (числовой коэффициент)
            1: {
                template: 'Упростите выражение $\\frac{{k}({a}x + {b})}{{m}({a}x + {b})}$.',
                parameters: {
                    k: { type: 'int', min: 2, max: 6 },
                    m: { type: 'int', min: 2, max: 6 },
                    a: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: 1, max: 8 },
                },
                constraints: ['k !== m'],
                answer_formula: 'k + "/" + m',
                answer_type: 'fraction',
                hint: 'Сократите общий множитель $({a}x + {b})$ в числителе и знаменателе.',
                solution: [
                    { explanation: 'Исходное выражение: $\\frac{{k}({a}x + {b})}{{m}({a}x + {b})}$' },
                    { explanation: 'Сокращаем общий множитель $({a}x + {b})$:' },
                    { explanation: 'Результат:', result: '$\\frac{{k}}{{m}}$' },
                ],
            },
            // Уровень 2 — сокращение на НОД числовых коэффициентов
            2: {
                template: 'Упростите выражение $\\frac{{k}({a}x + {b})}{{m}({c}x + {d})}$.',
                parameters: {
                    g: { type: 'choice', values: [2, 3, 5] },
                    p: { type: 'int', min: 2, max: 4 },
                    q: { type: 'int', min: 2, max: 4 },
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: 1, max: 6 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: 1, max: 6 },
                    k: { type: 'expression', value: 'g * p' },
                    m: { type: 'expression', value: 'g * q' },
                },
                constraints: ['p !== q', 'a !== c || b !== d'],
                answer_formula: 'p + "/" + q',
                answer_type: 'fraction',
                hint: 'Найдите НОД числовых коэффициентов {k} и {m}, затем сократите.',
                solution: [
                    { explanation: 'Исходное выражение: $\\frac{{k}({a}x + {b})}{{m}({c}x + {d})}$' },
                    { explanation: 'НОД({k}, {m}) = {g}. Делим числитель и знаменатель на {g}:' },
                    { explanation: 'Результат:', result: '$\\frac{{p}({a}x + {b})}{{q}({c}x + {d})}$' },
                ],
            },
        },
    },

    // ===== 2. Сложение рациональных выражений =====
    {
        id: 'grade8-rational-add',
        class: 8,
        subject: 'algebra',
        section: 'Рациональные выражения',
        topic: 'rationalExpression',
        topic_title: 'Рациональные выражения',
        problemType: 'text',
        skills: ['fractions', 'algebra'],
        difficulties: {
            // Уровень 1 — одинаковые знаменатели
            1: {
                template: 'Вычислите $\\frac{{a}x + {b}}{{c}x + {d}} + \\frac{{e}x + {f}}{{c}x + {d}}$.',
                parameters: {
                    a: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: 1, max: 8 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: 1, max: 6 },
                    e: { type: 'int', min: 1, max: 4 },
                    f: { type: 'int', min: 1, max: 8 },
                    ae: { type: 'expression', value: 'a + e' },
                    bf: { type: 'expression', value: 'b + f' },
                },
                constraints: ['c !== 0'],
                answer_formula: '"\\\\frac{" + ae + "x + " + bf + "}{" + c + "x + " + d + "}"',
                answer_type: 'text',
                hint: 'Сложите числители, знаменатель общий.',
                solution: [
                    { explanation: 'Знаменатели одинаковы: $({c}x + {d})$' },
                    { explanation: 'Складываем числители:' },
                    { explanation: '$({a}x + {b}) + ({e}x + {f}) = {ae}x + {bf}$' },
                    { explanation: 'Результат:', result: '$\\frac{{ae}x + {bf}}{{c}x + {d}}$' },
                ],
            },
            // Уровень 2 — приведение к общему знаменателю
            2: {
                template: 'Вычислите $\\frac{{a}}{{c}x + {d}} + \\frac{{e}}{{g}x + {h}}$.',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: 1, max: 6 },
                    e: { type: 'int', min: 1, max: 5 },
                    g: { type: 'int', min: 1, max: 3 },
                    h: { type: 'int', min: 1, max: 6 },
                },
                constraints: ['c !== g || d !== h'],
                answer_formula: '"\\\\frac{" + a + "(" + g + "x + " + h + ") + " + e + "(" + c + "x + " + d + ")}{(" + c + "x + " + d + ")(" + g + "x + " + h + ")}"',
                answer_type: 'text',
                hint: 'Общий знаменатель: $({c}x + {d})({g}x + {h})$.',
                solution: [
                    { explanation: 'Общий знаменатель: $({c}x + {d})({g}x + {h})$' },
                    { explanation: 'Приводим первую дробь: умножаем числитель и знаменатель на $({g}x + {h})$' },
                    { explanation: 'Приводим вторую дробь: умножаем числитель и знаменатель на $({c}x + {d})$' },
                    { explanation: 'Результат:', result: '$\\frac{{a}({g}x + {h}) + {e}({c}x + {d})}{({c}x + {d})({g}x + {h})}$' },
                ],
            },
        },
    },

    // ===== 3. Умножение рациональных выражений =====
    {
        id: 'grade8-rational-multiply',
        class: 8,
        subject: 'algebra',
        section: 'Рациональные выражения',
        topic: 'rationalExpression',
        topic_title: 'Рациональные выражения',
        problemType: 'text',
        skills: ['fractions', 'algebra'],
        difficulties: {
            // Уровень 1 — простое умножение
            1: {
                template: 'Вычислите $\\frac{{a}x + {b}}{{c}x + {d}} \\cdot \\frac{{e}x + {f}}{{g}x + {h}}$.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: 1, max: 6 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: 1, max: 6 },
                    e: { type: 'int', min: 1, max: 3 },
                    f: { type: 'int', min: 1, max: 6 },
                    g: { type: 'int', min: 1, max: 3 },
                    h: { type: 'int', min: 1, max: 6 },
                },
                constraints: ['c !== 0', 'g !== 0'],
                answer_formula: '"\\\\frac{(" + a + "x + " + b + ")(" + e + "x + " + f + ")}{(" + c + "x + " + d + ")(" + g + "x + " + h + ")}"',
                answer_type: 'text',
                hint: 'Перемножьте числители и знаменатели.',
                solution: [
                    { explanation: 'Перемножаем числители и знаменатели:' },
                    { explanation: 'Результат:', result: '$\\frac{({a}x + {b})({e}x + {f})}{({c}x + {d})({g}x + {h})}$' },
                ],
            },
            // Уровень 2 — с сокращением общего множителя
            2: {
                template: 'Упростите $\\frac{{a}x + {b}}{{c}x + {d}} \\cdot \\frac{{c}x + {d}}{{e}x + {f}}$.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: 1, max: 6 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: 1, max: 6 },
                    e: { type: 'int', min: 1, max: 3 },
                    f: { type: 'int', min: 1, max: 6 },
                },
                constraints: ['c !== 0', 'e !== 0', 'a !== e || b !== f'],
                answer_formula: '"\\\\frac{" + a + "x + " + b + "}{" + e + "x + " + f + "}"',
                answer_type: 'text',
                hint: 'Сократите общий множитель $({c}x + {d})$.',
                solution: [
                    { explanation: 'Множитель $({c}x + {d})$ присутствует в числителе второй дроби и знаменателе первой.' },
                    { explanation: 'Сокращаем $({c}x + {d})$:' },
                    { explanation: 'Результат:', result: '$\\frac{{a}x + {b}}{{e}x + {f}}$' },
                ],
            },
        },
    },

    // ===== 4. Деление рациональных выражений =====
    {
        id: 'grade8-rational-divide',
        class: 8,
        subject: 'algebra',
        section: 'Рациональные выражения',
        topic: 'rationalExpression',
        topic_title: 'Рациональные выражения',
        problemType: 'text',
        skills: ['fractions', 'algebra'],
        difficulties: {
            // Уровень 1 — простое деление
            1: {
                template: 'Вычислите $\\frac{{a}x + {b}}{{c}x + {d}} : \\frac{{e}x + {f}}{{g}x + {h}}$.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: 1, max: 6 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: 1, max: 6 },
                    e: { type: 'int', min: 1, max: 3 },
                    f: { type: 'int', min: 1, max: 6 },
                    g: { type: 'int', min: 1, max: 3 },
                    h: { type: 'int', min: 1, max: 6 },
                },
                constraints: ['c !== 0', 'g !== 0'],
                answer_formula: '"\\\\frac{(" + a + "x + " + b + ")(" + g + "x + " + h + ")}{(" + c + "x + " + d + ")(" + e + "x + " + f + ")}"',
                answer_type: 'text',
                hint: 'Деление на дробь — умножение на обратную дробь.',
                solution: [
                    { explanation: 'Заменяем деление умножением на обратную дробь:' },
                    { explanation: '$\\frac{{a}x + {b}}{{c}x + {d}} \\cdot \\frac{{g}x + {h}}{{e}x + {f}}$' },
                    { explanation: 'Результат:', result: '$\\frac{({a}x + {b})({g}x + {h})}{({c}x + {d})({e}x + {f})}$' },
                ],
            },
        },
    },
];
