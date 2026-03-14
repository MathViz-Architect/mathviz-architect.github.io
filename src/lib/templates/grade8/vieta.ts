import { ProblemTemplate } from '../../types';

// ============================================================
// Grade 8 — Теорема Виета (4 шаблона)
// ============================================================
// СТРАТЕГИЯ ГЕНЕРАЦИИ:
//   Все задачи строятся от корней r1, r2 (целые числа).
//   Сумма корней S = r1 + r2
//   Произведение корней P = r1 * r2
//   Уравнение: x² - Sx + P = 0
// ============================================================

export const grade8VietaTemplates: ProblemTemplate[] = [

    // ===== 1. Найти сумму корней =====
    {
        id: 'grade8-vieta-sum',
        class: 8,
        subject: 'algebra',
        section: 'Теорема Виета',
        topic: 'vietasTheorem',
        topic_title: 'Теорема Виета',
        problemType: 'numeric',
        skills: ['quadratic', 'vietas-theorem'],
        difficulties: {
            // Уровень 1 — простые корни, положительные
            1: {
                template: 'Найдите сумму корней уравнения x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0.',
                parameters: {
                    r1: { type: 'int', min: 1, max: 5 },
                    r2: { type: 'int', min: 1, max: 5 },
                    b: { type: 'expression', value: '-(r1 + r2)' },
                    c: { type: 'expression', value: 'r1 * r2' },
                    b_abs: { type: 'expression', value: 'Math.abs(b)' },
                    b_sign: { type: 'expression', value: 'b < 0 ? "" : "+"' },
                    c_abs: { type: 'expression', value: 'Math.abs(c)' },
                    c_sign: { type: 'expression', value: 'c < 0 ? "" : "+"' },
                },
                constraints: ['r1 !== r2', 'b !== 0'],
                answer_formula: '-b',
                hint: 'По теореме Виета сумма корней равна -b/a. Здесь a = 1, поэтому сумма = -b.',
                solution: [
                    { explanation: 'Уравнение: x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0' },
                    { explanation: 'По теореме Виета: сумма корней = -b/a = -({b}) / 1 = {-b}' },
                    { explanation: 'Ответ:', result: '{-b}' },
                ],
                common_mistakes: [
                    { pattern: 'b', feedback: 'Сумма корней = -b/a. Не забудьте знак минус.' },
                    { pattern: 'r1 + r2', feedback: 'Нельзя просто сложить коэффициенты. Используйте теорему Виета.' },
                ],
            },
            // Уровень 2 — корни с разными знаками
            2: {
                template: 'Найдите сумму корней уравнения x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0.',
                parameters: {
                    r1: { type: 'int', min: -5, max: -1 },
                    r2: { type: 'int', min: 1, max: 5 },
                    b: { type: 'expression', value: '-(r1 + r2)' },
                    c: { type: 'expression', value: 'r1 * r2' },
                    b_abs: { type: 'expression', value: 'Math.abs(b)' },
                    b_sign: { type: 'expression', value: 'b < 0 ? "" : "+"' },
                    c_abs: { type: 'expression', value: 'Math.abs(c)' },
                    c_sign: { type: 'expression', value: 'c < 0 ? "" : "+"' },
                },
                constraints: ['r1 !== r2', 'b !== 0'],
                answer_formula: '-b',
                hint: 'По теореме Виета сумма корней = -b/a.',
                solution: [
                    { explanation: 'Уравнение: x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0' },
                    { explanation: 'Сумма корней = -b/a = -({b})' },
                    { explanation: 'Ответ:', result: '{-b}' },
                ],
            },
            // Уровень 3 — больший диапазон
            3: {
                template: 'Найдите сумму корней уравнения {a}x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0.',
                parameters: {
                    a: { type: 'int', min: 2, max: 4 },
                    r1: { type: 'int', min: -6, max: 6 },
                    r2: { type: 'int', min: -6, max: 6 },
                    b: { type: 'expression', value: '-a * (r1 + r2)' },
                    c: { type: 'expression', value: 'a * r1 * r2' },
                    b_abs: { type: 'expression', value: 'Math.abs(b)' },
                    b_sign: { type: 'expression', value: 'b < 0 ? "" : "+"' },
                    c_abs: { type: 'expression', value: 'Math.abs(c)' },
                    c_sign: { type: 'expression', value: 'c < 0 ? "" : "+"' },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0', 'b !== 0'],
                answer_formula: '-b / a',
                answer_type: 'fraction',
                hint: 'По теореме Виета сумма корней = -b/a.',
                solution: [
                    { explanation: 'Уравнение: {a}x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0' },
                    { explanation: 'Сумма корней = -b/a = -({b}) / {a}' },
                    { explanation: 'Ответ:', result: '{-b}/{a}' },
                ],
            },
            // Уровень 4 — дробный ответ
            4: {
                template: 'Найдите сумму корней уравнения {a}x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0.',
                parameters: {
                    a: { type: 'int', min: 2, max: 5 },
                    r1: { type: 'int', min: -8, max: 8 },
                    r2: { type: 'int', min: -8, max: 8 },
                    b: { type: 'expression', value: '-a * (r1 + r2)' },
                    c: { type: 'expression', value: 'a * r1 * r2' },
                    b_abs: { type: 'expression', value: 'Math.abs(b)' },
                    b_sign: { type: 'expression', value: 'b < 0 ? "" : "+"' },
                    c_abs: { type: 'expression', value: 'Math.abs(c)' },
                    c_sign: { type: 'expression', value: 'c < 0 ? "" : "+"' },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0', 'b !== 0', 'Math.abs(r1 + r2) > a'],
                answer_formula: '-b / a',
                answer_type: 'fraction',
                hint: 'Сумма корней = -b/a. Не забудьте привести к несократимой дроби.',
                solution: [
                    { explanation: 'Уравнение: {a}x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0' },
                    { explanation: 'Сумма корней = -b/a = -({b}) / {a}' },
                    { explanation: 'Ответ:', result: '{-b}/{a}' },
                ],
            },
        },
    },

    // ===== 2. Найти произведение корней =====
    {
        id: 'grade8-vieta-product',
        class: 8,
        subject: 'algebra',
        section: 'Теорема Виета',
        topic: 'vietasTheorem',
        topic_title: 'Теорема Виета',
        problemType: 'numeric',
        skills: ['quadratic', 'vietas-theorem'],
        difficulties: {
            // Уровень 1 — простые корни
            1: {
                template: 'Найдите произведение корней уравнения x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0.',
                parameters: {
                    r1: { type: 'int', min: 1, max: 5 },
                    r2: { type: 'int', min: 1, max: 5 },
                    b: { type: 'expression', value: '-(r1 + r2)' },
                    c: { type: 'expression', value: 'r1 * r2' },
                    b_abs: { type: 'expression', value: 'Math.abs(b)' },
                    b_sign: { type: 'expression', value: 'b < 0 ? "" : "+"' },
                    c_abs: { type: 'expression', value: 'Math.abs(c)' },
                    c_sign: { type: 'expression', value: 'c < 0 ? "" : "+"' },
                },
                constraints: ['r1 !== r2', 'c !== 0'],
                answer_formula: 'c',
                hint: 'По теореме Виета произведение корней равно c/a. Здесь a = 1, поэтому произведение = c.',
                solution: [
                    { explanation: 'Уравнение: x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0' },
                    { explanation: 'По теореме Виета: произведение корней = c/a = {c} / 1 = {c}' },
                    { explanation: 'Ответ:', result: '{c}' },
                ],
                common_mistakes: [
                    { pattern: 'b', feedback: 'Произведение корней = c/a, не b/a.' },
                    { pattern: 'r1 * r2', feedback: 'Нельзя просто перемножить коэффициенты. Используйте теорему Виета.' },
                ],
            },
            // Уровень 2 — корни с разными знаками
            2: {
                template: 'Найдите произведение корней уравнения x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0.',
                parameters: {
                    r1: { type: 'int', min: -5, max: -1 },
                    r2: { type: 'int', min: 1, max: 5 },
                    b: { type: 'expression', value: '-(r1 + r2)' },
                    c: { type: 'expression', value: 'r1 * r2' },
                    b_abs: { type: 'expression', value: 'Math.abs(b)' },
                    b_sign: { type: 'expression', value: 'b < 0 ? "" : "+"' },
                    c_abs: { type: 'expression', value: 'Math.abs(c)' },
                    c_sign: { type: 'expression', value: 'c < 0 ? "" : "+"' },
                },
                constraints: ['r1 !== r2', 'c !== 0'],
                answer_formula: 'c',
                hint: 'По теореме Виета произведение корней = c/a.',
                solution: [
                    { explanation: 'Уравнение: x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0' },
                    { explanation: 'Произведение корней = c/a = {c}' },
                    { explanation: 'Ответ:', result: '{c}' },
                ],
            },
            // Уровень 3 — с коэффициентом a
            3: {
                template: 'Найдите произведение корней уравнения {a}x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0.',
                parameters: {
                    a: { type: 'int', min: 2, max: 4 },
                    r1: { type: 'int', min: -6, max: 6 },
                    r2: { type: 'int', min: -6, max: 6 },
                    b: { type: 'expression', value: '-a * (r1 + r2)' },
                    c: { type: 'expression', value: 'a * r1 * r2' },
                    b_abs: { type: 'expression', value: 'Math.abs(b)' },
                    b_sign: { type: 'expression', value: 'b < 0 ? "" : "+"' },
                    c_abs: { type: 'expression', value: 'Math.abs(c)' },
                    c_sign: { type: 'expression', value: 'c < 0 ? "" : "+"' },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0', 'c !== 0'],
                answer_formula: 'c / a',
                answer_type: 'fraction',
                hint: 'По теореме Виета произведение корней = c/a.',
                solution: [
                    { explanation: 'Уравнение: {a}x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0' },
                    { explanation: 'Произведение корней = c/a = {c} / {a}' },
                    { explanation: 'Ответ:', result: '{c}/{a}' },
                ],
            },
            // Уровень 4 — дробный ответ
            4: {
                template: 'Найдите произведение корней уравнения {a}x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0.',
                parameters: {
                    a: { type: 'int', min: 2, max: 5 },
                    r1: { type: 'int', min: -8, max: 8 },
                    r2: { type: 'int', min: -8, max: 8 },
                    b: { type: 'expression', value: '-a * (r1 + r2)' },
                    c: { type: 'expression', value: 'a * r1 * r2' },
                    b_abs: { type: 'expression', value: 'Math.abs(b)' },
                    b_sign: { type: 'expression', value: 'b < 0 ? "" : "+"' },
                    c_abs: { type: 'expression', value: 'Math.abs(c)' },
                    c_sign: { type: 'expression', value: 'c < 0 ? "" : "+"' },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0', 'c !== 0', 'Math.abs(r1 * r2) > a'],
                answer_formula: 'c / a',
                answer_type: 'fraction',
                hint: 'Произведение корней = c/a. Приведите к несократимой дроби.',
                solution: [
                    { explanation: 'Уравнение: {a}x² {b_sign}{b_abs}x {c_sign}{c_abs} = 0' },
                    { explanation: 'Произведение корней = c/a = {c} / {a}' },
                    { explanation: 'Ответ:', result: '{c}/{a}' },
                ],
            },
        },
    },

    // ===== 3. Составить уравнение по корням =====
    {
        id: 'grade8-vieta-equation',
        class: 8,
        subject: 'algebra',
        section: 'Теорема Виета',
        topic: 'vietasTheorem',
        topic_title: 'Теорема Виета',
        problemType: 'text',
        skills: ['quadratic', 'vietas-theorem'],
        difficulties: {
            // Уровень 1 — положительные корни
            1: {
                template: 'Составьте квадратное уравнение с корнями {r1} и {r2}.',
                parameters: {
                    r1: { type: 'int', min: 1, max: 5 },
                    r2: { type: 'int', min: 1, max: 5 },
                    s: { type: 'expression', value: 'r1 + r2' },
                    p: { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'p > 0 ? "x² - " + s + "x + " + p + " = 0" : "x² - " + s + "x " + p + " = 0"',
                hint: 'Уравнение: x² - (сумма)x + (произведение) = 0',
                solution: [
                    { explanation: 'Сумма корней = {r1} + {r2} = {s}' },
                    { explanation: 'Произведение корней = {r1} × {r2} = {p}' },
                    { explanation: 'Уравнение: x² - {s}x + {p} = 0' },
                    { explanation: 'Ответ:', result: 'x² - {s}x + {p} = 0' },
                ],
            },
            // Уровень 2 — корни с разными знаками
            2: {
                template: 'Составьте квадратное уравнение с корнями {r1} и {r2}.',
                parameters: {
                    r1: { type: 'int', min: -5, max: -1 },
                    r2: { type: 'int', min: 1, max: 5 },
                    s: { type: 'expression', value: 'r1 + r2' },
                    p: { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'p > 0 ? "x² " + (s > 0 ? "+" : "") + s + "x + " + p + " = 0" : "x² " + (s > 0 ? "+" : "") + s + "x " + p + " = 0"',
                hint: 'x² - (сумма)x + (произведение) = 0',
                solution: [
                    { explanation: 'Сумма корней = {r1} + {r2} = {s}' },
                    { explanation: 'Произведение корней = {r1} × {r2} = {p}' },
                    { explanation: 'Уравнение: x² {s > 0 ? "+" : ""}{s}x {p > 0 ? "+" : ""}{p} = 0' },
                    { explanation: 'Ответ:', result: 'x² {s > 0 ? "+" : ""}{s}x {p > 0 ? "+" : ""}{p} = 0' },
                ],
            },
            // Уровень 3 — больший диапазон
            3: {
                template: 'Составьте квадратное уравнение с корнями {r1} и {r2}.',
                parameters: {
                    r1: { type: 'int', min: -8, max: 8 },
                    r2: { type: 'int', min: -8, max: 8 },
                    s: { type: 'expression', value: 'r1 + r2' },
                    p: { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0'],
                answer_formula: '"x² " + (s === 0 ? "" : s > 0 ? "+" + s : s) + "x " + (p === 0 ? "" : p > 0 ? "+" + p : p) + " = 0"',
                hint: 'Используйте теорему Виета: x² - Sx + P = 0, где S = сумма, P = произведение.',
                solution: [
                    { explanation: 'Сумма корней = {r1} + {r2} = {s}' },
                    { explanation: 'Произведение корней = {r1} × {r2} = {p}' },
                    { explanation: 'Уравнение: x² {s === 0 ? "" : s > 0 ? "+" + s : s}x {p === 0 ? "" : p > 0 ? "+" + p : p} = 0' },
                    { explanation: 'Ответ:', result: 'x² {s === 0 ? "" : s > 0 ? "+" + s : s}x {p === 0 ? "" : p > 0 ? "+" + p : p} = 0' },
                ],
            },
            // Уровень 4 — с коэффициентом a
            4: {
                template: 'Составьте квадратное уравнение вида {a}x² + bx + c = 0 с корнями {r1} и {r2}.',
                parameters: {
                    a: { type: 'int', min: 2, max: 4 },
                    r1: { type: 'int', min: -6, max: 6 },
                    r2: { type: 'int', min: -6, max: 6 },
                    b: { type: 'expression', value: '-a * (r1 + r2)' },
                    c: { type: 'expression', value: 'a * r1 * r2' },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0'],
                answer_formula: 'a + "x² " + (b === 0 ? "" : b > 0 ? "+" + b : b) + "x " + (c === 0 ? "" : c > 0 ? "+" + c : c) + " = 0"',
                hint: 'b = -a(S), c = a(P), где S = сумма корней, P = произведение.',
                solution: [
                    { explanation: 'Сумма корней = {r1} + {r2} = {r1 + r2}' },
                    { explanation: 'Произведение корней = {r1} × {r2} = {r1 * r2}' },
                    { explanation: 'b = -a × сумма = -{a} × {r1 + r2} = {b}' },
                    { explanation: 'c = a × произведение = {a} × {r1 * r2} = {c}' },
                    { explanation: 'Уравнение: {a}x² {b === 0 ? "" : b > 0 ? "+" + b : b}x {c === 0 ? "" : c > 0 ? "+" + c : c} = 0' },
                    { explanation: 'Ответ:', result: '{a}x² {b === 0 ? "" : b > 0 ? "+" + b : b}x {c === 0 ? "" : c > 0 ? "+" + c : c} = 0' },
                ],
            },
        },
    },

    // ===== 4. Найти корни по сумме и произведению =====
    {
        id: 'grade8-vieta-roots',
        class: 8,
        subject: 'algebra',
        section: 'Теорема Виета',
        topic: 'vietasTheorem',
        topic_title: 'Теорема Виета',
        problemType: 'text',
        skills: ['quadratic', 'vietas-theorem'],
        difficulties: {
            // Уровень 1 — положительные корни
            1: {
                template: 'Найдите корни квадратного уравнения x² - {s}x + {p} = 0.',
                parameters: {
                    r1: { type: 'int', min: 1, max: 5 },
                    r2: { type: 'int', min: 1, max: 5 },
                    s: { type: 'expression', value: 'r1 + r2' },
                    p: { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2', 's > 0', 'p > 0'],
                answer_formula: 'r1 < r2 ? r1 + " и " + r2 : r2 + " и " + r1',
                hint: 'Корни: x = [S ± √(S² - 4P)]/2, где S = сумма, P = произведение.',
                solution: [
                    { explanation: 'Уравнение: x² - {s}x + {p} = 0' },
                    { explanation: 'По теореме Виета: сумма корней = {s}, произведение = {p}' },
                    { explanation: 'Корни: {r1 < r2 ? r1 : r2} и {r1 < r2 ? r2 : r1}' },
                    { explanation: 'Ответ:', result: '{r1 < r2 ? r1 : r2} и {r1 < r2 ? r2 : r1}' },
                ],
            },
            // Уровень 2 — корни с разными знаками
            2: {
                template: 'Найдите корни квадратного уравнения x² - {s}x + {p} = 0.',
                parameters: {
                    r1: { type: 'int', min: -5, max: -1 },
                    r2: { type: 'int', min: 1, max: 5 },
                    s: { type: 'expression', value: 'r1 + r2' },
                    p: { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2', 'p < 0'],
                answer_formula: 'r1 < r2 ? r1 + " и " + r2 : r2 + " и " + r1',
                hint: 'Сумма корней = {s}, произведение = {p}. Решите систему.',
                solution: [
                    { explanation: 'Уравнение: x² - {s}x + {p} = 0' },
                    { explanation: 'Корни: x₁ + x₂ = {s}, x₁ × x₂ = {p}' },
                    { explanation: 'Корни: {r1 < r2 ? r1 : r2} и {r1 < r2 ? r2 : r1}' },
                    { explanation: 'Ответ:', result: '{r1 < r2 ? r1 : r2} и {r1 < r2 ? r2 : r1}' },
                ],
            },
            // Уровень 3 — больший диапазон
            3: {
                template: 'Найдите корни квадратного уравнения x² - {s}x + {p} = 0.',
                parameters: {
                    r1: { type: 'int', min: -8, max: 8 },
                    r2: { type: 'int', min: -8, max: 8 },
                    s: { type: 'expression', value: 'r1 + r2' },
                    p: { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0', 's * s - 4 * p >= 0'],
                answer_formula: 'r1 < r2 ? r1 + " и " + r2 : r2 + " и " + r1',
                hint: 'Дискриминант D = S² - 4P. Корни: [S ± √D]/2.',
                solution: [
                    { explanation: 'Уравнение: x² - {s}x + {p} = 0' },
                    { explanation: 'Дискриминант D = {s}² - 4×{p} = {s*s - 4*p}' },
                    { explanation: 'Корни: [{s} ± √{s*s - 4*p}]/2 = {r1 < r2 ? r1 : r2} и {r1 < r2 ? r2 : r1}' },
                    { explanation: 'Ответ:', result: '{r1 < r2 ? r1 : r2} и {r1 < r2 ? r2 : r1}' },
                ],
            },
            // Уровень 4 — с проверкой
            4: {
                template: 'Найдите корни квадратного уравнения x² - {s}x + {p} = 0 и проверьте по теореме Виета.',
                parameters: {
                    r1: { type: 'int', min: -10, max: 10 },
                    r2: { type: 'int', min: -10, max: 10 },
                    s: { type: 'expression', value: 'r1 + r2' },
                    p: { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0', 's * s - 4 * p >= 0'],
                answer_formula: 'r1 < r2 ? r1 + " и " + r2 : r2 + " и " + r1',
                hint: 'Найдите корни, затем проверьте: сумма = {s}, произведение = {p}.',
                solution: [
                    { explanation: 'Уравнение: x² - {s}x + {p} = 0' },
                    { explanation: 'Корни: {r1 < r2 ? r1 : r2} и {r1 < r2 ? r2 : r1}' },
                    { explanation: 'Проверка: сумма = {r1 < r2 ? r1 : r2} + {r1 < r2 ? r2 : r1} = {s}' },
                    { explanation: 'Произведение = {r1 < r2 ? r1 : r2} × {r1 < r2 ? r2 : r1} = {p}' },
                    { explanation: 'Ответ:', result: '{r1 < r2 ? r1 : r2} и {r1 < r2 ? r2 : r1}' },
                ],
            },
        },
    },
];