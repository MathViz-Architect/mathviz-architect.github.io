import { ProblemTemplate } from '../../types';

// ============================================================
// Grade 8 — Линейные неравенства (4 шаблона)
// ============================================================
// СТРАТЕГИЯ ГЕНЕРАЦИИ:
//   ax + b > c или ax + b < c
//   Решение: x > (c - b)/a или x < (c - b)/a
//   Учитывать направление неравенства при a < 0
// ============================================================

export const grade8LinearInequalityTemplates: ProblemTemplate[] = [

    // ===== 1. Решить линейное неравенство (положительный коэффициент) =====
    {
        id: 'grade8-linear-inequality-basic',
        class: 8,
        subject: 'algebra',
        section: 'Линейные неравенства',
        topic: 'linearInequality',
        topic_title: 'Линейные неравенства',
        problemType: 'text',
        skills: ['inequalities', 'linear-equations'],
        difficulties: {
            // Уровень 1 — положительный коэффициент, простые числа
            1: {
                template: 'Решите неравенство {a}x + {b} {sign} {c}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: -10, max: 10 },
                    c: { type: 'int', min: -10, max: 10 },
                    sign: { type: 'choice', values: ['>', '<'] },
                },
                constraints: ['a !== 0'],
                answer_formula: 'sign === ">" ? "x > " + (c - b) / a : "x < " + (c - b) / a',
                hint: 'Перенесите все члены с x в одну сторону, остальные в другую.',
                solution: [
                    { explanation: 'Неравенство: {a}x + {b} {sign} {c}' },
                    { explanation: '{a}x {sign} {c} - {b}' },
                    { explanation: '{a}x {sign} {c - b}' },
                    { explanation: 'x {sign} {(c - b) / a}' },
                    { explanation: 'Ответ: x {sign} {(c - b) / a}' },
                ],
            },
            // Уровень 2 — отрицательный коэффициент
            2: {
                template: 'Решите неравенство {a}x + {b} {sign} {c}.',
                parameters: {
                    a: { type: 'int', min: -5, max: -1 },
                    b: { type: 'int', min: -10, max: 10 },
                    c: { type: 'int', min: -10, max: 10 },
                    sign: { type: 'choice', values: ['>', '<'] },
                },
                constraints: ['a !== 0'],
                answer_formula: 'sign === ">" ? "x < " + (c - b) / a : "x > " + (c - b) / a',
                hint: 'При делении на отрицательное число неравенство меняет направление.',
                solution: [
                    { explanation: 'Неравенство: {a}x + {b} {sign} {c}' },
                    { explanation: '{a}x {sign} {c} - {b}' },
                    { explanation: '{a}x {sign} {c - b}' },
                    { explanation: 'Делим на {a} < 0, меняем знак: x {sign === ">" ? "<" : ">"} {(c - b) / a}' },
                    { explanation: 'Ответ: x {sign === ">" ? "<" : ">"} {(c - b) / a}' },
                ],
            },
            // Уровень 3 — дробные коэффициенты
            3: {
                template: 'Решите неравенство {a}x + {b} {sign} {c}.',
                parameters: {
                    a: { type: 'int', min: -8, max: 8 },
                    b: { type: 'int', min: -15, max: 15 },
                    c: { type: 'int', min: -15, max: 15 },
                    sign: { type: 'choice', values: ['>', '<'] },
                },
                constraints: ['a !== 0', 'Math.abs(a) > 1'],
                answer_formula: 'a > 0 ? (sign === ">" ? "x > " + (c - b) / a : "x < " + (c - b) / a) : (sign === ">" ? "x < " + (c - b) / a : "x > " + (c - b) / a)',
                answer_type: 'fraction',
                hint: 'Перенесите все в одну сторону и разделите на коэффициент при x.',
                solution: [
                    { explanation: 'Неравенство: {a}x + {b} {sign} {c}' },
                    { explanation: '{a}x {sign} {c - b}' },
                    { explanation: 'x {a > 0 ? sign : (sign === ">" ? "<" : ">")} {(c - b) / a}' },
                    { explanation: 'Ответ: x {a > 0 ? sign : (sign === ">" ? "<" : ">")} {(c - b) / a}' },
                ],
            },
            // Уровень 4 — с проверкой
            4: {
                template: 'Решите неравенство {a}x + {b} {sign} {c} и проверьте решение на числе {test}.',
                parameters: {
                    a: { type: 'int', min: -10, max: 10 },
                    b: { type: 'int', min: -20, max: 20 },
                    c: { type: 'int', min: -20, max: 20 },
                    sign: { type: 'choice', values: ['>', '<'] },
                    test: { type: 'int', min: -10, max: 10 },
                },
                constraints: ['a !== 0'],
                answer_formula: 'a > 0 ? (sign === ">" ? "x > " + (c - b) / a : "x < " + (c - b) / a) : (sign === ">" ? "x < " + (c - b) / a : "x > " + (c - b) / a)',
                answer_type: 'fraction',
                hint: 'Решите неравенство, затем подставьте проверочное число.',
                solution: [
                    { explanation: 'Неравенство: {a}x + {b} {sign} {c}' },
                    { explanation: 'Решение: x {a > 0 ? sign : (sign === ">" ? "<" : ">")} {(c - b) / a}' },
                    { explanation: 'Проверка при x = {test}:' },
                    { explanation: '{a}×{test} + {b} = {a*test + b}, которое {a*test + b > c ? ">" : a*test + b < c ? "<" : "="} {c}' },
                    { explanation: 'Ответ: x {a > 0 ? sign : (sign === ">" ? "<" : ">")} {(c - b) / a}' },
                ],
            },
        },
    },

    // ===== 2. Система двух линейных неравенств =====
    {
        id: 'grade8-linear-inequality-system',
        class: 8,
        subject: 'algebra',
        section: 'Линейные неравенства',
        topic: 'linearInequality',
        topic_title: 'Линейные неравенства',
        problemType: 'text',
        skills: ['inequalities', 'systems'],
        difficulties: {
            // Уровень 1 — простая система
            1: {
                template: 'Решите систему неравенств: {a1}x {sign1} {b1}, {a2}x {sign2} {b2}.',
                parameters: {
                    a1: { type: 'int', min: 1, max: 3 },
                    b1: { type: 'int', min: -10, max: 10 },
                    a2: { type: 'int', min: 1, max: 3 },
                    b2: { type: 'int', min: -10, max: 10 },
                    sign1: { type: 'choice', values: ['>', '<'] },
                    sign2: { type: 'choice', values: ['>', '<'] },
                },
                constraints: ['a1 !== 0', 'a2 !== 0'],
                answer_formula: 'sign1 === ">" ? "x > " + b1/a1 : "x < " + b1/a1 + " и " + (sign2 === ">" ? "x > " + b2/a2 : "x < " + b2/a2)',
                hint: 'Решите каждое неравенство отдельно, затем найдите пересечение решений.',
                solution: [
                    { explanation: 'Первое неравенство: x {sign1} {b1/a1}' },
                    { explanation: 'Второе неравенство: x {sign2} {b2/a2}' },
                    { explanation: 'Пересечение: x {sign1} {b1/a1} и x {sign2} {b2/a2}' },
                    { explanation: 'Ответ:', result: 'sign1 === ">" ? "x > " + b1/a1 : "x < " + b1/a1 + " и " + (sign2 === ">" ? "x > " + b2/a2 : "x < " + b2/a2)' },
                ],
            },
            // Уровень 2 — с отрицательными коэффициентами
            2: {
                template: 'Решите систему неравенств: {a1}x {sign1} {b1}, {a2}x {sign2} {b2}.',
                parameters: {
                    a1: { type: 'int', min: -3, max: 3 },
                    b1: { type: 'int', min: -10, max: 10 },
                    a2: { type: 'int', min: -3, max: 3 },
                    b2: { type: 'int', min: -10, max: 10 },
                    sign1: { type: 'choice', values: ['>', '<'] },
                    sign2: { type: 'choice', values: ['>', '<'] },
                },
                constraints: ['a1 !== 0', 'a2 !== 0'],
                answer_formula: 'a1 > 0 ? (sign1 === ">" ? "x > " + b1/a1 : "x < " + b1/a1) : (sign1 === ">" ? "x < " + b1/a1 : "x > " + b1/a1) + " и " + (a2 > 0 ? (sign2 === ">" ? "x > " + b2/a2 : "x < " + b2/a2) : (sign2 === ">" ? "x < " + b2/a2 : "x > " + b2/a2))',
                hint: 'Учитывайте знак коэффициента при делении.',
                solution: [
                    { explanation: 'Первое неравенство: x {a1 > 0 ? sign1 : (sign1 === ">" ? "<" : ">")} {b1/a1}' },
                    { explanation: 'Второе неравенство: x {a2 > 0 ? sign2 : (sign2 === ">" ? "<" : ">")} {b2/a2}' },
                    { explanation: 'Ответ:', result: 'a1 > 0 ? (sign1 === ">" ? "x > " + b1/a1 : "x < " + b1/a1) : (sign1 === ">" ? "x < " + b1/a1 : "x > " + b1/a1) + " и " + (a2 > 0 ? (sign2 === ">" ? "x > " + b2/a2 : "x < " + b2/a2) : (sign2 === ">" ? "x < " + b2/a2 : "x > " + b2/a2))' },
                ],
            },
            // Уровень 3 — с дробными решениями
            3: {
                template: 'Решите систему неравенств: {a1}x {sign1} {b1}, {a2}x {sign2} {b2}.',
                parameters: {
                    a1: { type: 'int', min: -5, max: 5 },
                    b1: { type: 'int', min: -15, max: 15 },
                    a2: { type: 'int', min: -5, max: 5 },
                    b2: { type: 'int', min: -15, max: 15 },
                    sign1: { type: 'choice', values: ['>', '<'] },
                    sign2: { type: 'choice', values: ['>', '<'] },
                },
                constraints: ['a1 !== 0', 'a2 !== 0', 'Math.abs(a1) > 1', 'Math.abs(a2) > 1'],
                answer_formula: 'a1 > 0 ? (sign1 === ">" ? "x > " + b1/a1 : "x < " + b1/a1) : (sign1 === ">" ? "x < " + b1/a1 : "x > " + b1/a1) + " и " + (a2 > 0 ? (sign2 === ">" ? "x > " + b2/a2 : "x < " + b2/a2) : (sign2 === ">" ? "x < " + b2/a2 : "x > " + b2/a2))',
                answer_type: 'fraction',
                hint: 'Решите каждое неравенство, найдите общую область решений.',
                solution: [
                    { explanation: 'Решения: x {a1 > 0 ? sign1 : (sign1 === ">" ? "<" : ">")} {b1/a1} и x {a2 > 0 ? sign2 : (sign2 === ">" ? "<" : ">")} {b2/a2}' },
                    { explanation: 'Ответ:', result: 'a1 > 0 ? (sign1 === ">" ? "x > " + b1/a1 : "x < " + b1/a1) : (sign1 === ">" ? "x < " + b1/a1 : "x > " + b1/a1) + " и " + (a2 > 0 ? (sign2 === ">" ? "x > " + b2/a2 : "x < " + b2/a2) : (sign2 === ">" ? "x < " + b2/a2 : "x > " + b2/a2))' },
                ],
            },
        },
    },

    // ===== 3. Неравенство с переменной в обеих частях =====
    {
        id: 'grade8-linear-inequality-variable',
        class: 8,
        subject: 'algebra',
        section: 'Линейные неравенства',
        topic: 'linearInequality',
        topic_title: 'Линейные неравенства',
        problemType: 'text',
        skills: ['inequalities', 'algebra'],
        difficulties: {
            // Уровень 1 — простое
            1: {
                template: 'Решите неравенство {a}x + {b} {sign} {c}x + {d}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: -10, max: 10 },
                    c: { type: 'int', min: 1, max: 5 },
                    d: { type: 'int', min: -10, max: 10 },
                    sign: { type: 'choice', values: ['>', '<'] },
                },
                constraints: ['a !== c'],
                answer_formula: 'sign === ">" ? "x " + (a - c > 0 ? ">" : "<") + " " + ((d - b) / (a - c)) : "x " + (a - c > 0 ? "<" : ">") + " " + ((d - b) / (a - c))',
                hint: 'Перенесите все члены с x в одну сторону.',
                solution: [
                    { explanation: 'Неравенство: {a}x + {b} {sign} {c}x + {d}' },
                    { explanation: '{a}x - {c}x {sign} {d} - {b}' },
                    { explanation: '{a - c}x {sign} {d - b}' },
                    { explanation: 'x {sign} {(d - b) / (a - c)}' },
                    { explanation: 'Учитывая знак коэффициента: x {a - c > 0 ? sign : (sign === ">" ? "<" : ">")} {(d - b) / (a - c)}' },
                    { explanation: 'Ответ:', result: 'sign === ">" ? "x " + (a - c > 0 ? ">" : "<") + " " + ((d - b) / (a - c)) : "x " + (a - c > 0 ? "<" : ">") + " " + ((d - b) / (a - c))' },
                ],
            },
            // Уровень 2 — отрицательные коэффициенты
            2: {
                template: 'Решите неравенство {a}x + {b} {sign} {c}x + {d}.',
                parameters: {
                    a: { type: 'int', min: -5, max: 5 },
                    b: { type: 'int', min: -10, max: 10 },
                    c: { type: 'int', min: -5, max: 5 },
                    d: { type: 'int', min: -10, max: 10 },
                    sign: { type: 'choice', values: ['>', '<'] },
                },
                constraints: ['a !== c', 'a !== 0', 'c !== 0'],
                answer_formula: '(d - b) / (a - c)',
                hint: 'Приведите подобные члены.',
                solution: [
                    { explanation: 'Неравенство: {a}x + {b} {sign} {c}x + {d}' },
                    { explanation: '{a - c}x {sign} {d - b}' },
                    { explanation: 'x {sign} {(d - b) / (a - c)}' },
                    { explanation: 'С учётом знака коэффициента: x {a - c > 0 ? sign : (sign === ">" ? "<" : ">")} {(d - b) / (a - c)}' },
                    { explanation: 'Ответ:', result: 'sign === ">" ? "x " + ((a - c) > 0 ? ">" : "<") + " " + ((d - b) / (a - c)) : "x " + ((a - c) > 0 ? "<" : ">") + " " + ((d - b) / (a - c))' },
                ],
            },
        },
    },

    // ===== 4. Графическое решение неравенства =====
    {
        id: 'grade8-linear-inequality-graph',
        class: 8,
        subject: 'algebra',
        section: 'Линейные неравенства',
        topic: 'linearInequality',
        topic_title: 'Линейные неравенства',
        problemType: 'text',
        skills: ['inequalities', 'coordinate-plane'],
        difficulties: {
            // Уровень 1 — прямая x = k
            1: {
                template: 'На координатной плоскости заштрихуйте область, где x {sign} {k}.',
                parameters: {
                    k: { type: 'int', min: -10, max: 10 },
                    sign: { type: 'choice', values: ['>', '<'] },
                },
                answer_formula: 'sign === ">" ? "x > " + k : "x < " + k',
                hint: 'Прямая x = {k} делит плоскость на две полуплоскости.',
                solution: [
                    { explanation: 'Область: все точки, где x {sign} {k}' },
                    { explanation: 'Ответ:', result: 'sign === ">" ? "x > " + k : "x < " + k' },
                ],
            },
            // Уровень 2 — линейная функция
            2: {
                template: 'На координатной плоскости заштрихуйте область, где {a}x + {b} {sign} {c}.',
                parameters: {
                    a: { type: 'int', min: -5, max: 5 },
                    b: { type: 'int', min: -10, max: 10 },
                    c: { type: 'int', min: -10, max: 10 },
                    sign: { type: 'choice', values: ['>', '<'] },
                },
                constraints: ['a !== 0'],
                answer_formula: 'a > 0 ? (sign === ">" ? "x > " + ((c - b)/a) : "x < " + ((c - b)/a)) : (sign === ">" ? "x < " + ((c - b)/a) : "x > " + ((c - b)/a))',
                hint: 'Найдите границу неравенства и определите полуплоскость.',
                solution: [
                    { explanation: 'Граница: прямая {a}x + {b} = {c}, или x = {(c - b)/a}' },
                    { explanation: 'Область: {a > 0 ? (sign === ">" ? "справа" : "слева") : (sign === ">" ? "слева" : "справа")} от границы' },
                    { explanation: 'Ответ:', result: 'a > 0 ? (sign === ">" ? "x > " + ((c - b)/a) : "x < " + ((c - b)/a)) : (sign === ">" ? "x < " + ((c - b)/a) : "x > " + ((c - b)/a))' },
                ],
            },
        },
    },
];