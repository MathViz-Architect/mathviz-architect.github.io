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
            // Уровень 1 — простое сокращение
            1: {
                template: 'Упростите выражение \\frac{{a}x + {b}}{{c}x + {d}}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: -5, max: 5 },
                    c: { type: 'int', min: 1, max: 5 },
                    d: { type: 'int', min: -5, max: 5 },
                },
                constraints: ['a !== 0', 'c !== 0', 'b !== 0', 'd !== 0'],
                answer_formula: '1', // Placeholder for text answer
                answer_type: 'text',
                hint: 'Выделите общий множитель в числителе и знаменателе.',
                solution: [
                    { explanation: 'Выражение: \\frac{{a}x + {b}}{{c}x + {d}}' },
                    { explanation: 'Общий множитель: 1' },
                    { explanation: 'Ответ: \\frac{{a}x + {b}}{{c}x + {d}}' },
                    { explanation: 'Ответ: \\frac{{a}x + {b}}{{c}x + {d}}' },
                ],
            },
            // Уровень 2 — с сокращением
            2: {
                template: 'Упростите выражение \\frac{{k}({a}x + {b})}{{m}({c}x + {d})}, где {k} и {m} — целые числа.',
                parameters: {
                    gcd: { type: 'choice', values: [1, 2, 3, 5] },
                    k: { type: 'int', min: 2, max: 10 },
                    m: { type: 'int', min: 2, max: 10 },
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -3, max: 3 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: -3, max: 3 },
                },
                constraints: ['k % gcd === 0', 'm % gcd === 0', 'k / gcd !== m / gcd', 'k / gcd > 1 || m / gcd > 1'],
                answer_formula: '(k / gcd) === 1 ? ((m / gcd) === 1 ? "\\\\frac{" + a + "x " + (b > 0 ? "+" + b : b) + "}{" + c + "x " + (d > 0 ? "+" + d : d) + "}" : "\\\\frac{1}{" + (m / gcd) + "} \\\\frac{" + a + "x " + (b > 0 ? "+" + b : b) + "}{" + c + "x " + (d > 0 ? "+" + d : d) + "}") : "\\\\frac{" + (k / gcd) + "}{" + (m / gcd) + "} \\\\frac{" + a + "x " + (b > 0 ? "+" + b : b) + "}{" + c + "x " + (d > 0 ? "+" + d : d) + "}"',
                answer_type: 'text',
                hint: 'Сократите числовые коэффициенты.',
                solution: [
                    { explanation: 'Выражение: \\frac{{k}({a}x + {b})}{{m}({c}x + {d})}' },
                    { explanation: 'Сократим {k} и {m} на НОД = {gcd}' },
                    { explanation: 'Получим: \\frac{{nk}({a}x + {b})}{{nm}({c}x + {d})}' },
                    { explanation: 'Ответ:', result: '(k / gcd) === 1 ? ((m / gcd) === 1 ? "\\\\frac{" + a + "x " + (b > 0 ? "+" + b : b) + "}{" + c + "x " + (d > 0 ? "+" + d : d) + "}" : "\\\\frac{1}{" + (m / gcd) + "} \\\\frac{" + a + "x " + (b > 0 ? "+" + b : b) + "}{" + c + "x " + (d > 0 ? "+" + d : d) + "}") : "\\\\frac{" + (k / gcd) + "}{" + (m / gcd) + "} \\\\frac{" + a + "x " + (b > 0 ? "+" + b : b) + "}{" + c + "x " + (d > 0 ? "+" + d : d) + "}"' },
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
                template: 'Вычислите \\frac{{a}x + {b}}{{c}x + {d}} + \\frac{{e}x + {f}}{{c}x + {d}}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -5, max: 5 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: -5, max: 5 },
                    e: { type: 'int', min: 1, max: 3 },
                    f: { type: 'int', min: -5, max: 5 },
                },
                constraints: ['c !== 0'],
                answer_formula: '"\\\\frac{" + (a + e) + "x + " + (b + f) + "}{" + c + "x + " + d + "}"',
                answer_type: 'text',
                hint: 'Сложите числители, знаменатель общий.',
                solution: [
                    { explanation: 'Выражение: \\frac{{a}x + {b}}{{c}x + {d}} + \\frac{{e}x + {f}}{{c}x + {d}}' },
                    { explanation: '= \\frac{({a}x + {b}) + ({e}x + {f})}{{c}x + {d}}' },
                    { explanation: '= \\frac{{a + e}x + {b + f}}{{c}x + {d}}' },
                    { explanation: 'Ответ:', result: '"\\\\frac{" + (a + e) + "x + " + (b + f) + "}{" + c + "x + " + d + "}"' },
                ],
            },
            // Уровень 2 — приведение к общему знаменателю
            2: {
                template: 'Вычислите \\frac{{a}x + {b}}{{c}x + {d}} + \\frac{{e}x + {f}}{{g}x + {h}}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -5, max: 5 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: -5, max: 5 },
                    e: { type: 'int', min: 1, max: 3 },
                    f: { type: 'int', min: -5, max: 5 },
                    g: { type: 'int', min: 1, max: 3 },
                    h: { type: 'int', min: -5, max: 5 },
                },
                constraints: ['c !== g', 'c !== 0', 'g !== 0'],
                answer_formula: '"\\\\frac{(" + a + "x + " + b + ")(" + g + "x + " + h + ") + (" + e + "x + " + f + ")(" + c + "x + " + d + ")}{(" + c + "x + " + d + ")(" + g + "x + " + h + ")}"',
                answer_type: 'text',
                hint: 'Приведите к общему знаменателю.',
                solution: [
                    { explanation: 'Общий знаменатель: ({c}x + {d})({g}x + {h})' },
                    { explanation: 'Первая дробь: \\frac{({a}x + {b})({g}x + {h})}{({c}x + {d})({g}x + {h})}' },
                    { explanation: 'Вторая дробь: \\frac{({e}x + {f})({c}x + {d})}{({c}x + {d})({g}x + {h})}' },
                    { explanation: 'Сумма: \\frac{({a}x + {b})({g}x + {h}) + ({e}x + {f})({c}x + {d})}{({c}x + {d})({g}x + {h})}' },
                    { explanation: 'Ответ:', result: '"\\\\frac{(" + a + "x + " + b + ")(" + g + "x + " + h + ") + (" + e + "x + " + f + ")(" + c + "x + " + d + ")}{(" + c + "x + " + d + ")(" + g + "x + " + h + ")}"' },
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
                template: 'Вычислите \\frac{{a}x + {b}}{{c}x + {d}} \\cdot \\frac{{e}x + {f}}{{g}x + {h}}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -3, max: 3 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: -3, max: 3 },
                    e: { type: 'int', min: 1, max: 3 },
                    f: { type: 'int', min: -3, max: 3 },
                    g: { type: 'int', min: 1, max: 3 },
                    h: { type: 'int', min: -3, max: 3 },
                },
                constraints: ['c !== 0', 'g !== 0'],
                answer_formula: '"\\\\frac{(" + a + "x + " + b + ")(" + e + "x + " + f + ")}{(" + c + "x + " + d + ")(" + g + "x + " + h + ")}"',
                answer_type: 'text',
                hint: 'Перемножьте числители и знаменатели.',
                solution: [
                    { explanation: 'Выражение: \\frac{{a}x + {b}}{{c}x + {d}} \\cdot \\frac{{e}x + {f}}{{g}x + {h}}' },
                    { explanation: '= \\frac{({a}x + {b})({e}x + {f})}{({c}x + {d})({g}x + {h})}' },
                    { explanation: 'Ответ:', result: '"\\\\frac{(" + a + "x + " + b + ")(" + e + "x + " + f + ")}{(" + c + "x + " + d + ")(" + g + "x + " + h + ")}"' },
                ],
            },
            // Уровень 2 — с сокращением
            2: {
                template: 'Упростите \\frac{{a}x + {b}}{{c}x + {d}} \\cdot \\frac{{c}x + {d}}{{e}x + {f}}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -3, max: 3 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: -3, max: 3 },
                    e: { type: 'int', min: 1, max: 3 },
                    f: { type: 'int', min: -3, max: 3 },
                },
                constraints: ['c !== 0', 'e !== 0'],
                answer_formula: '"\\\\frac{" + a + "x + " + b + "}{" + e + "x + " + f + "}"',
                answer_type: 'text',
                hint: 'Сократите общий множитель.',
                solution: [
                    { explanation: 'Выражение: \\frac{{a}x + {b}}{{c}x + {d}} \\cdot \\frac{{c}x + {d}}{{e}x + {f}}' },
                    { explanation: '({c}x + {d}) сокращается' },
                    { explanation: '= \\frac{{a}x + {b}}{{e}x + {f}}' },
                    { explanation: 'Ответ:', result: '"\\\\frac{" + a + "x + " + b + "}{" + e + "x + " + f + "}"' },
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
                template: 'Вычислите \\frac{{a}x + {b}}{{c}x + {d}} : \\frac{{e}x + {f}}{{g}x + {h}}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -3, max: 3 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: -3, max: 3 },
                    e: { type: 'int', min: 1, max: 3 },
                    f: { type: 'int', min: -3, max: 3 },
                    g: { type: 'int', min: 1, max: 3 },
                    h: { type: 'int', min: -3, max: 3 },
                },
                constraints: ['c !== 0', 'g !== 0'],
                answer_formula: '"\\\\frac{(" + a + "x + " + b + ")(" + g + "x + " + h + ")}{(" + c + "x + " + d + ")(" + e + "x + " + f + ")}"',
                answer_type: 'text',
                hint: 'Умножьте на обратную дробь.',
                solution: [
                    { explanation: 'Выражение: \\frac{{a}x + {b}}{{c}x + {d}} : \\frac{{e}x + {f}}{{g}x + {h}}' },
                    { explanation: '= \\frac{{a}x + {b}}{{c}x + {d}} \\cdot \\frac{{g}x + {h}}{{e}x + {f}}' },
                    { explanation: '= \\frac{({a}x + {b})({g}x + {h})}{({c}x + {d})({e}x + {f})}' },
                    { explanation: 'Ответ:', result: '"\\\\frac{(" + a + "x + " + b + ")(" + g + "x + " + h + ")}{(" + c + "x + " + d + ")(" + e + "x + " + f + ")}"' },
                ],
            },
        },
    },
];