import { ProblemTemplate } from '../../types';

// ============================================================
// Grade 8 — Уравнения с модулем (4 шаблона)
// ============================================================
// СТРАТЕГИЯ ГЕНЕРАЦИИ:
//   |ax + b| = c
//   Решения: ax + b = c и ax + b = -c
//   Учитывать c >= 0
// ============================================================

export const grade8AbsoluteValueEqTemplates: ProblemTemplate[] = [

    // ===== 1. |ax + b| = c =====
    {
        id: 'grade8-abs-eq-basic',
        class: 8,
        subject: 'algebra',
        section: 'Уравнения с модулем',
        topic: 'absoluteValueEq',
        topic_title: 'Уравнения с модулем',
        problemType: 'text',
        skills: ['absolute-value', 'equations'],
        difficulties: {
            // Уровень 1 — положительный коэффициент
            1: {
                template: 'Решите уравнение |{a}x + {b}| = {c}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -10, max: 10 },
                    c: { type: 'int', min: 0, max: 10 },
                },
                constraints: ['c >= 0'],
                answer_formula: 'c === 0 ? -b/a + "" : (-b + c)/a + ", " + (-b - c)/a',
                answer_type: 'text',
                hint: 'Модуль равен c, значит ax + b = c или ax + b = -c.',
                solution: [
                    { explanation: 'Уравнение: |{a}x + {b}| = {c}' },
                    { explanation: '{a}x + {b} = {c} или {a}x + {b} = -{c}' },
                    { explanation: '{a}x = {c - b}, x = {(c - b)/a}' },
                    { explanation: '{a}x = {-c - b}, x = {(-c - b)/a}' },
                    { explanation: 'Ответ: x = {(c - b)/a}, x = {(-c - b)/a}' },
                ],
            },
            // Уровень 2 — отрицательный коэффициент
            2: {
                template: 'Решите уравнение |{a}x + {b}| = {c}.',
                parameters: {
                    a: { type: 'int', min: -3, max: -1 },
                    b: { type: 'int', min: -10, max: 10 },
                    c: { type: 'int', min: 0, max: 10 },
                },
                constraints: ['c >= 0'],
                answer_formula: 'c === 0 ? `-b/a` : `(-b + c)/a, (-b - c)/a`',
                answer_type: 'text',
                hint: 'Разложите модуль на два случая.',
                solution: [
                    { explanation: 'Уравнение: |{a}x + {b}| = {c}' },
                    { explanation: '{a}x + {b} = {c} ⇒ x = {(c - b)/a}' },
                    { explanation: '{a}x + {b} = -{c} ⇒ x = {(-c - b)/a}' },
                    { explanation: 'Ответ: x = {(c - b)/a}, x = {(-c - b)/a}' },
                ],
            },
            // Уровень 3 — дробные решения
            3: {
                template: 'Решите уравнение |{a}x + {b}| = {c}.',
                parameters: {
                    a: { type: 'int', min: -5, max: 5 },
                    b: { type: 'int', min: -15, max: 15 },
                    c: { type: 'int', min: 0, max: 15 },
                },
                constraints: ['a !== 0', 'c >= 0', 'Math.abs(a) > 1'],
                answer_formula: 'c === 0 ? `-b/a` : `(-b + c)/a, (-b - c)/a`',
                answer_type: 'text',
                hint: 'Модуль даёт два уравнения.',
                solution: [
                    { explanation: 'Уравнение: |{a}x + {b}| = {c}' },
                    { explanation: 'Решения: x = {(-b + c)/a}, x = {(-b - c)/a}' },
                    { explanation: 'Ответ: x = {(-b + c)/a}, x = {(-b - c)/a}' },
                ],
            },
            // Уровень 4 — с проверкой
            4: {
                template: 'Решите уравнение |{a}x + {b}| = {c} и проверьте корни.',
                parameters: {
                    a: { type: 'int', min: -8, max: 8 },
                    b: { type: 'int', min: -20, max: 20 },
                    c: { type: 'int', min: 0, max: 20 },
                },
                constraints: ['a !== 0', 'c >= 0'],
                answer_formula: 'c === 0 ? `-b/a` : `(-b + c)/a, (-b - c)/a`',
                answer_type: 'text',
                hint: 'Найдите корни и подставьте в исходное уравнение.',
                solution: [
                    { explanation: 'Уравнение: |{a}x + {b}| = {c}' },
                    { explanation: 'Корни: x₁ = {(-b + c)/a}, x₂ = {(-b - c)/a}' },
                    { explanation: 'Проверка x₁: |{a}×{(-b + c)/a} + {b}| = |{c}| = {c} ✓' },
                    { explanation: 'Проверка x₂: |{a}×{(-b - c)/a} + {b}| = |{-c}| = {c} ✓' },
                    { explanation: 'Ответ: x = {(-b + c)/a}, x = {(-b - c)/a}' },
                ],
            },
        },
    },

    // ===== 2. |ax + b| = |cx + d| =====
    {
        id: 'grade8-abs-eq-equal',
        class: 8,
        subject: 'algebra',
        section: 'Уравнения с модулем',
        topic: 'absoluteValueEq',
        topic_title: 'Уравнения с модулем',
        problemType: 'text',
        skills: ['absolute-value', 'equations'],
        difficulties: {
            // Уровень 1 — простое
            1: {
                template: 'Решите уравнение |{a}x + {b}| = |{c}x + {d}|.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -5, max: 5 },
                    c: { type: 'int', min: 1, max: 3 },
                    d: { type: 'int', min: -5, max: 5 },
                },
                constraints: ['a !== c'],
                answer_formula: '(d - b) / (a - c)',
                answer_type: 'text',
                hint: 'Модули равны, когда выражения внутри равны или противоположны.',
                solution: [
                    { explanation: 'Уравнение: |{a}x + {b}| = |{c}x + {d}|' },
                    { explanation: '{a}x + {b} = {c}x + {d} или {a}x + {b} = -({c}x + {d})' },
                    { explanation: 'x = {(d - b)/(a - c)} или x = {( -d - b)/(a - c)}' },
                    { explanation: 'Ответ: x = {(d - b)/(a - c)}, x = {(-d - b)/(a - c)}' },
                ],
            },
            // Уровень 2 — с отрицательными
            2: {
                template: 'Решите уравнение |{a}x + {b}| = |{c}x + {d}|.',
                parameters: {
                    a: { type: 'int', min: -3, max: 3 },
                    b: { type: 'int', min: -10, max: 10 },
                    c: { type: 'int', min: -3, max: 3 },
                    d: { type: 'int', min: -10, max: 10 },
                },
                constraints: ['a !== c', 'a !== 0', 'c !== 0'],
                answer_formula: '(d - b) / (a - c) + ", " + (-d - b) / (a - c)',
                answer_type: 'text',
                hint: 'Рассмотрите четыре случая для знаков выражений.',
                solution: [
                    { explanation: 'Уравнение: |{a}x + {b}| = |{c}x + {d}|' },
                    { explanation: 'Корни: x = {(d - b)/(a - c)}, x = {(-d - b)/(a - c)}' },
                    { explanation: 'Ответ: x = {(d - b)/(a - c)}, x = {(-d - b)/(a - c)}' },
                ],
            },
        },
    },

    // ===== 3. |ax + b| = kx + m =====
    {
        id: 'grade8-abs-eq-linear',
        class: 8,
        subject: 'algebra',
        section: 'Уравнения с модулем',
        topic: 'absoluteValueEq',
        topic_title: 'Уравнения с модулем',
        problemType: 'text',
        skills: ['absolute-value', 'equations'],
        difficulties: {
            // Уровень 1 — положительная правая часть
            1: {
                template: 'Решите уравнение |{a}x + {b}| = {k}x + {m}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -5, max: 5 },
                    k: { type: 'int', min: 1, max: 3 },
                    m: { type: 'int', min: 0, max: 10 },
                },
                constraints: ['k > 0'],
                answer_formula: '(m - b) / (a - k) + ", " + (-m - b) / (a + k)',
                answer_type: 'text',
                hint: 'Разложите модуль на два случая.',
                solution: [
                    { explanation: 'Уравнение: |{a}x + {b}| = {k}x + {m}' },
                    { explanation: 'Случай 1: {a}x + {b} = {k}x + {m} ⇒ x = {(m - b)/(a - k)}' },
                    { explanation: 'Случай 2: {a}x + {b} = -({k}x + {m}) ⇒ x = {(-m - b)/(a + k)}' },
                    { explanation: 'Ответ: x = {(m - b)/(a - k)}, x = {(-m - b)/(a + k)}' },
                ],
            },
            // Уровень 2 — общий случай
            2: {
                template: 'Решите уравнение |{a}x + {b}| = {k}x + {m}.',
                parameters: {
                    a: { type: 'int', min: -3, max: 3 },
                    b: { type: 'int', min: -10, max: 10 },
                    k: { type: 'int', min: -3, max: 3 },
                    m: { type: 'int', min: -10, max: 10 },
                },
                constraints: ['a !== 0', 'a !== k', 'a !== -k'],
                answer_formula: '(m - b) / (a - k) + ", " + (-m - b) / (a + k)',
                answer_type: 'text',
                hint: 'Модуль даёт два линейных уравнения.',
                solution: [
                    { explanation: 'Уравнение: |{a}x + {b}| = {k}x + {m}' },
                    { explanation: 'Решения: x = {(m - b)/(a - k)}, x = {(-m - b)/(a + k)}' },
                    { explanation: 'Ответ: x = {(m - b)/(a - k)}, x = {(-m - b)/(a + k)}' },
                ],
            },
        },
    },

    // ===== 4. Неравенства с модулем =====
    {
        id: 'grade8-abs-inequality',
        class: 8,
        subject: 'algebra',
        section: 'Уравнения с модулем',
        topic: 'absoluteValueEq',
        topic_title: 'Уравнения с модулем',
        problemType: 'text',
        skills: ['absolute-value', 'inequalities'],
        difficulties: {
            // Уровень 1 — |ax + b| < c
            1: {
                template: 'Решите неравенство |{a}x + {b}| < {c}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -5, max: 5 },
                    c: { type: 'int', min: 1, max: 10 },
                },
                constraints: ['c > 0'],
                answer_formula: '(-c - b)/a + ", " + (c - b)/a',
                hint: 'Модуль меньше c означает -c < ax + b < c.',
                solution: [
                    { explanation: 'Неравенство: |{a}x + {b}| < {c}' },
                    { explanation: '-{c} < {a}x + {b} < {c}' },
                    { explanation: '-{c} - {b} < {a}x < {c} - {b}' },
                    { explanation: '{(-c - b)/a} < x < {(c - b)/a}' },
                    { explanation: 'Ответ:', result: '(-c - b)/a + ", " + (c - b)/a' },
                ],
            },
            // Уровень 2 — |ax + b| > c
            2: {
                template: 'Решите неравенство |{a}x + {b}| > {c}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -5, max: 5 },
                    c: { type: 'int', min: 0, max: 10 },
                },
                constraints: ['c >= 0'],
                answer_formula: 'c === 0 ? "x ∈ ℝ \\\\ {" + (-b/a) + "}" : "x < " + ((-c - b)/a) + " или x > " + ((c - b)/a)',
                hint: 'Модуль больше c: ax + b > c или ax + b < -c.',
                solution: [
                    { explanation: 'Неравенство: |{a}x + {b}| > {c}' },
                    { explanation: '{a}x + {b} > {c} или {a}x + {b} < -{c}' },
                    { explanation: 'x > {(c - b)/a} или x < {(-c - b)/a}' },
                    { explanation: 'Ответ:', result: 'c === 0 ? "x ∈ ℝ \\\\ {" + (-b/a) + "}" : "x < " + ((-c - b)/a) + " или x > " + ((c - b)/a)' },
                ],
            },
        },
    },
];