import { ProblemTemplate } from '../../types';

// ============================================================
// Grade 8 — Квадратные темы (6 штук)
// ============================================================
// СТРАТЕГИЯ ГЕНЕРАЦИИ:
//   Все квадратные уравнения строятся ОТ КОРНЕЙ:
//     выбираем r1, r2  →  b = -a*(r1+r2),  c = a*r1*r2
//   Тогда D = b² - 4ac = a²*(r1-r2)² — всегда точный квадрат.
//   Иррациональных корней и несовпадений с template быть не может.
// ============================================================

export const grade8QuadraticTemplates: ProblemTemplate[] = [

    // ===== 1. Квадратный трёхчлен =====
    {
        id: 'grade8-quadraticTrinomial',
        class: 8,
        subject: 'algebra',
        section: 'Квадратный трёхчлен',
        topic: 'quadraticTrinomial',
        topic_title: 'Квадратный трёхчлен',
        problemType: 'numeric',
        skills: ['quadratic', 'polynomials'],
        difficulties: {
            // Уровень 1 — назвать коэффициент b (параметры a,b,c независимые, задача на понятие)
            1: {
                template: 'Запишите коэффициент b трёхчлена {a}x² + {b}x + {c}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: -9, max: 9 },
                    c: { type: 'int', min: -9, max: 9 },
                },
                constraints: ['b !== 0', 'c !== 0'],
                answer_formula: 'b',
                hint: 'Коэффициент b — это число при x в первой степени',
                solution: [
                    { explanation: 'В трёхчлене ax² + bx + c: a = {a}, b = {b}, c = {c}' },
                    { explanation: 'Ответ:', result: '{b}' },
                ],
                common_mistakes: [
                    { pattern: 'a', feedback: 'Это коэффициент a (при x²). Нужен коэффициент b (при x).' },
                    { pattern: 'c', feedback: 'Это свободный член c. Нужен коэффициент b (при x).' },
                ],
            },
            // Уровень 2 — вычислить значение трёхчлена
            2: {
                template: 'Вычислите значение трёхчлена {a}x² + {b}x + {c} при x = {x}.',
                parameters: {
                    a:  { type: 'int', min: 1, max: 3 },
                    r1: { type: 'int', min: -4, max: 4 },
                    r2: { type: 'int', min: -4, max: 4 },
                    b:  { type: 'expression', value: '-(r1 + r2)' },
                    c:  { type: 'expression', value: 'r1 * r2' },
                    x:  { type: 'int', min: -3, max: 3 },
                },
                constraints: ['r1 !== r2', 'x !== 0', 'x !== r1', 'x !== r2'],
                answer_formula: 'a * x * x + b * x + c',
                hint: 'Подставьте x = {x}: {a}·({x})² + {b}·({x}) + {c}',
                solution: [
                    { explanation: '{a}·({x})² = {a*x*x}' },
                    { explanation: '{b}·({x}) = {b*x}' },
                    { explanation: 'Сумма: {a*x*x} + {b*x} + {c} =', result: '{answer}' },
                ],
            },
            // Уровень 3 — вычислить дискриминант (строим через корни → D = (r1-r2)²)
            3: {
                template: 'Вычислите дискриминант трёхчлена {a}x² + {b}x + {c}.',
                parameters: {
                    a:  { type: 'int', min: 1, max: 3 },
                    r1: { type: 'int', min: -5, max: 5 },
                    r2: { type: 'int', min: -5, max: 5 },
                    b:  { type: 'expression', value: '-a * (r1 + r2)' },
                    c:  { type: 'expression', value: 'a * r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'b * b - 4 * a * c',
                hint: 'D = b² − 4ac',
                solution: [
                    { explanation: 'D = ({b})² − 4·{a}·({c})' },
                    { explanation: 'D = {b*b} − {4*a*c} =', result: '{answer}' },
                ],
            },
            // Уровень 4 — a≠1, найти b² (восстановление через D)
            4: {
                template: 'Трёхчлен {a}x² + {b}x + {c} имеет D = {d}. Найдите b².',
                parameters: {
                    a:  { type: 'int', min: 2, max: 4 },
                    r1: { type: 'int', min: -6, max: -1 },
                    r2: { type: 'int', min: 1, max: 6 },
                    b:  { type: 'expression', value: '-a * (r1 + r2)' },
                    c:  { type: 'expression', value: 'a * r1 * r2' },
                    d:  { type: 'expression', value: 'b * b - 4 * a * c' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'b * b',
                hint: 'D = b² − 4ac → b² = D + 4ac',
                solution: [
                    { explanation: 'b² = D + 4ac = {d} + 4·{a}·{c}', result: '{answer}' },
                ],
            },
        },
    },

    // ===== 2. Разложение трёхчлена на множители =====
    {
        id: 'grade8-trinomialFactoring',
        class: 8,
        subject: 'algebra',
        section: 'Квадратный трёхчлен',
        topic: 'trinomialFactoring',
        topic_title: 'Разложение трёхчлена на множители',
        problemType: 'numeric',
        skills: ['factoring', 'quadratic'],
        difficulties: {
            // Уровень 1 — оба корня положительные, a = 1
            1: {
                template: 'Разложите на множители x² − {s}x + {p}. Найдите больший корень.',
                parameters: {
                    r1: { type: 'int', min: 1, max: 5 },
                    r2: { type: 'int', min: 1, max: 5 },
                    s:  { type: 'expression', value: 'r1 + r2' },
                    p:  { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'Math.max(r1, r2)',
                hint: 'Подберите два числа с суммой {s} и произведением {p}',
                solution: [
                    { explanation: 'Числа {r1} и {r2}: сумма = {s}, произведение = {p}' },
                    { explanation: 'Разложение: (x − {r1})(x − {r2})' },
                    { explanation: 'Корни: {r1} и {r2}. Больший:', result: '{answer}' },
                ],
            },
            // Уровень 2 — корни разных знаков, a = 1
            2: {
                template: 'Разложите на множители x² + {b}x + {c}. Найдите больший корень.',
                parameters: {
                    r1: { type: 'int', min: -7, max: -1 },
                    r2: { type: 'int', min: 1, max: 7 },
                    b:  { type: 'expression', value: 'r1 + r2' },
                    c:  { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== -r2'],
                // Корни уравнения (x-r1)(x-r2)=0 — это r1 и r2.
                // Так как r1<0 и r2>0, больший корень = r2
                answer_formula: 'r2',
                hint: 'c < 0 → корни разных знаков. Найдите числа с суммой {b} и произведением {c}.',
                solution: [
                    { explanation: 'Ищем числа с суммой {b} и произведением {c}' },
                    { explanation: 'Это {r1} и {r2}: ({r1}) + {r2} = {b}, ({r1})·{r2} = {c}' },
                    { explanation: 'Разложение: (x − ({r1}))(x − {r2})' },
                    { explanation: 'Корни: {r1} и {r2}. Больший:', result: '{answer}' },
                ],
            },
            // Уровень 3 — a > 1, найти произведение корней (теорема Виета)
            3: {
                template: 'Разложите на множители {a}x² + {b}x + {c}. Найдите произведение корней.',
                parameters: {
                    a:  { type: 'int', min: 2, max: 4 },
                    r1: { type: 'int', min: -5, max: -1 },
                    r2: { type: 'int', min: 1, max: 5 },
                    b:  { type: 'expression', value: '-a * (r1 + r2)' },
                    c:  { type: 'expression', value: 'a * r1 * r2' },
                },
                answer_formula: 'r1 * r2',
                hint: 'По теореме Виета x₁·x₂ = c/a',
                solution: [
                    { explanation: '{a}x² + {b}x + {c} = {a}(x − {r1})(x − {r2})' },
                    { explanation: 'x₁·x₂ = c/a = {c}/{a} =', result: '{answer}' },
                ],
            },
            // Уровень 4 — оба корня отрицательные, a > 1, найти сумму корней
            // Добавлена поддержка кратных и отрицательных корней
            4: {
                template: 'Разложите {a}x² + {b}x + {c}. Найдите сумму корней.',
                parameters: {
                    a:  { type: 'int', min: 2, max: 5 },
                    r1: { type: 'int', min: -7, max: -1 },
                    r2: { type: 'int', min: -7, max: -1 },
                    b:  { type: 'expression', value: '-a * (r1 + r2)' },
                    c:  { type: 'expression', value: 'a * r1 * r2' },
                },
                // r1 === r2 разрешено — кратный корень
                answer_formula: 'r1 + r2',
                hint: 'По теореме Виета x₁ + x₂ = −b/a',
                solution: [
                    { explanation: 'x₁ + x₂ = −b/a = −({b})/{a} =', result: '{answer}' },
                ],
            },
        },
    },

    // ===== 3. Неполные квадратные уравнения =====
    {
        id: 'grade8-quadraticIncomplete',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные уравнения',
        topic: 'quadraticIncomplete',
        topic_title: 'Неполные квадратные уравнения',
        problemType: 'numeric',
        skills: ['quadratic', 'squareRoot'],
        difficulties: {
            // Уровень 1 — x² = c (строим от корня)
            1: {
                template: 'Решите уравнение x² = {c}. Найдите положительный корень.',
                parameters: {
                    r: { type: 'int', min: 2, max: 10 },
                    c: { type: 'expression', value: 'r * r' },
                },
                answer_formula: 'r',
                hint: 'x² = {c} → x = ±\\sqrt{c}',
                solution: [
                    { explanation: 'x = ±\\sqrt{c} = ±{r}' },
                    { explanation: 'Положительный корень:', result: '{r}' },
                ],
                common_mistakes: [
                    { pattern: 'c', feedback: 'Нужно \\sqrt{c}, а не {c} — не забудьте извлечь корень.' },
                ],
            },
            // Уровень 2 — ax² = c (строим от корня)
            2: {
                template: 'Решите уравнение {a}x² − {c} = 0. Найдите положительный корень.',
                parameters: {
                    a: { type: 'int', min: 2, max: 6 },
                    r: { type: 'int', min: 1, max: 7 },
                    c: { type: 'expression', value: 'a * r * r' },
                },
                answer_formula: 'r',
                hint: '{a}x² = {c} → x² = {c}/{a}',
                solution: [
                    { explanation: '{a}x² = {c}' },
                    { explanation: 'x² = {c} ÷ {a} = {r*r}' },
                    { explanation: 'x = ±\\sqrt{r*r} = ±{r}. Положительный:', result: '{r}' },
                ],
            },
            // Уровень 3 — ax² + bx = 0 (один корень 0, другой -b/a)
            3: {
                template: 'Решите уравнение {a}x² + {b}x = 0. Найдите ненулевой корень.',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    r: { type: 'int', min: -8, max: 8 },
                    b: { type: 'expression', value: '-a * r' },
                },
                constraints: ['r !== 0'],
                answer_formula: 'r',
                hint: 'Вынесите x: x({a}x + {b}) = 0',
                solution: [
                    { explanation: 'x·({a}x + {b}) = 0' },
                    { explanation: 'x = 0  или  {a}x = −({b})' },
                    { explanation: 'Ненулевой корень: x =', result: '{r}' },
                ],
            },
            // Уровень 4 — (x + p)² = q, найти сумму корней
            4: {
                template: 'Решите уравнение (x + {p})² = {q}. Найдите сумму корней.',
                parameters: {
                    p: { type: 'int', min: -6, max: 6 },
                    r: { type: 'int', min: 1, max: 6 },
                    q: { type: 'expression', value: 'r * r' },
                },
                constraints: ['p !== 0'],
                // x₁ = r - p, x₂ = -r - p  →  сумма = -2p
                answer_formula: '-2 * p',
                hint: 'x + {p} = ±{r} → два корня. Их сумма = ?',
                solution: [
                    { explanation: 'x + {p} = {r}  →  x₁ = {r} − {p} = {r - p}' },
                    { explanation: 'x + {p} = −{r}  →  x₂ = −{r} − {p} = {-r - p}' },
                    { explanation: 'Сумма x₁ + x₂ =', result: '{answer}' },
                ],
            },
        },
    },

    // ===== 4. Формула корней (дискриминант) =====
    {
        id: 'grade8-quadraticFormula',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные уравнения',
        topic: 'quadraticFormula',
        topic_title: 'Формула корней квадратного уравнения',
        problemType: 'numeric',
        skills: ['quadratic', 'discriminant'],
        difficulties: {
            // Уровень 1 — вычислить D, a = 1
            1: {
                template: 'Вычислите дискриминант уравнения x² + {b}x + {c} = 0.',
                parameters: {
                    r1: { type: 'int', min: -6, max: 6 },
                    r2: { type: 'int', min: -6, max: 6 },
                    b:  { type: 'expression', value: '-(r1 + r2)' },
                    c:  { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'b * b - 4 * c',
                hint: 'D = b² − 4·1·c = {b}² − 4·({c})',
                solution: [
                    { explanation: 'D = ({b})² − 4·({c})' },
                    { explanation: 'D = {b*b} − {4*c} =', result: '{answer}' },
                ],
                common_mistakes: [
                    { pattern: 'b * b + 4 * c', feedback: 'D = b² − 4ac (минус, не плюс).' },
                ],
            },
            // Уровень 2 — найти меньший корень, a = 1
            2: {
                template: 'Решите уравнение x² + {b}x + {c} = 0. Найдите меньший корень.',
                parameters: {
                    r1: { type: 'int', min: -8, max: 8 },
                    r2: { type: 'int', min: -8, max: 8 },
                    b:  { type: 'expression', value: '-(r1 + r2)' },
                    c:  { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'Math.min(r1, r2)',
                hint: 'Вычислите D, затем x = (−{b} ± \\sqrt{D}) / 2',
                solution: [
                    { explanation: 'D = ({b})² − 4·({c}) = {b*b - 4*c}' },
                    { explanation: 'x₁,₂ = (−({b}) ± \\sqrt{{b*b - 4*c}}) / 2' },
                    { explanation: 'Меньший корень:', result: '{answer}' },
                ],
            },
            // Уровень 3 — a > 1, найти больший корень
            3: {
                template: 'Решите уравнение {a}x² + {b}x + {c} = 0. Найдите больший корень.',
                parameters: {
                    a:  { type: 'int', min: 2, max: 5 },
                    r1: { type: 'int', min: -6, max: 6 },
                    r2: { type: 'int', min: -6, max: 6 },
                    b:  { type: 'expression', value: '-a * (r1 + r2)' },
                    c:  { type: 'expression', value: 'a * r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'Math.max(r1, r2)',
                hint: 'D = ({b})² − 4·{a}·({c}). Корни: x = (−{b} ± \\sqrt{D}) / (2·{a})',
                solution: [
                    { explanation: 'D = {b*b} − 4·{a}·{c} = {b*b - 4*a*c}' },
                    { explanation: 'x₁,₂ = (−{b} ± \\sqrt{{b*b - 4*a*c}}) / {2*a}' },
                    { explanation: 'Больший корень:', result: '{answer}' },
                ],
            },
            // Уровень 4 — отрицательные / кратные корни, a≠1; найти оба корня (через запятую)
            // Формат ответа: меньший, больший (или одно число если кратные)
            4: {
                template: 'Решите уравнение {a}x² + {b}x + {c} = 0. Запишите корни через запятую (по возрастанию).',
                parameters: {
                    a:  { type: 'int', min: 2, max: 4 },
                    // r1 <= r2, один или оба могут быть отрицательными или равными
                    r1: { type: 'int', min: -8, max: 0 },
                    r2: { type: 'int', min: -4, max: 4 },
                    b:  { type: 'expression', value: '-a * (r1 + r2)' },
                    c:  { type: 'expression', value: 'a * r1 * r2' },
                },
                // r1 === r2 разрешено (кратный корень)
                // answer_formula возвращает строку "r1, r2" или "r1" если равны
                answer_formula: 'r1 === r2 ? String(r1) : Math.min(r1,r2) + ", " + Math.max(r1,r2)',
                hint: 'D = b² − 4ac = {a}²·(r1−r2)². Корни: (−b ± \\sqrt{D}) / (2a)',
                solution: [
                    { explanation: 'D = ({b})² − 4·{a}·({c}) = {b*b - 4*a*c}' },
                    { explanation: 'x₁,₂ = (−({b}) ± \\sqrt{{b*b - 4*a*c}}) / {2*a}', result: '{answer}' },
                ],
            },
        },
    },

    // ===== 5. Теорема Виета =====
    {
        id: 'grade8-vietasTheorem',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные уравнения',
        topic: 'vietasTheorem',
        topic_title: 'Теорема Виета',
        problemType: 'numeric',
        skills: ['quadratic', 'vietasTheorem'],
        difficulties: {
            // Уровень 1 — найти b по корням (a = 1)
            1: {
                template: 'Корни уравнения x² + bx + c = 0 равны {r1} и {r2}. Найдите b.',
                parameters: {
                    r1: { type: 'int', min: -7, max: 7 },
                    r2: { type: 'int', min: -7, max: 7 },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0'],
                answer_formula: '-(r1 + r2)',
                hint: 'x₁ + x₂ = −b → b = −(x₁ + x₂)',
                solution: [
                    { explanation: 'x₁ + x₂ = {r1} + ({r2}) = {r1 + r2}' },
                    { explanation: 'b = −({r1 + r2}) =', result: '{answer}' },
                ],
            },
            // Уровень 2 — найти c по корням (a = 1)
            2: {
                template: 'Составьте уравнение (a = 1) с корнями {r1} и {r2}. Найдите c.',
                parameters: {
                    r1: { type: 'int', min: -7, max: 7 },
                    r2: { type: 'int', min: -7, max: 7 },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0'],
                answer_formula: 'r1 * r2',
                hint: 'x₁ · x₂ = c (теорема Виета)',
                solution: [
                    { explanation: 'c = x₁ · x₂ = ({r1}) · ({r2}) =', result: '{answer}' },
                ],
            },
            // Уровень 3 — найти r₁² + r₂² через теорему Виета
            3: {
                template: 'Корни уравнения {a}x² + {b}x + {c} = 0 равны r₁ и r₂. Найдите r₁² + r₂².',
                parameters: {
                    a:  { type: 'int', min: 1, max: 4 },
                    r1: { type: 'int', min: -5, max: 5 },
                    r2: { type: 'int', min: -5, max: 5 },
                    b:  { type: 'expression', value: '-a * (r1 + r2)' },
                    c:  { type: 'expression', value: 'a * r1 * r2' },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0'],
                answer_formula: 'r1 * r1 + r2 * r2',
                hint: 'r₁² + r₂² = (r₁+r₂)² − 2r₁r₂. Из т. Виета: r₁+r₂ = −b/a, r₁r₂ = c/a',
                solution: [
                    { explanation: 'r₁ + r₂ = −{b}/{a} = {-(b/a)}' },
                    { explanation: 'r₁ · r₂ = {c}/{a} = {c/a}' },
                    { explanation: 'r₁²+r₂² = ({-(b/a)})² − 2·({c/a}) =', result: '{answer}' },
                ],
            },
            // Уровень 4 — a≠1, отрицательные / кратные корни, найти (r₁−r₂)²
            4: {
                template: 'Корни уравнения {a}x² + {b}x + {c} = 0. Найдите (r₁ − r₂)².',
                parameters: {
                    a:  { type: 'int', min: 2, max: 4 },
                    r1: { type: 'int', min: -6, max: 0 },
                    r2: { type: 'int', min: -6, max: 4 },
                    b:  { type: 'expression', value: '-a * (r1 + r2)' },
                    c:  { type: 'expression', value: 'a * r1 * r2' },
                },
                // r1 === r2 → ответ 0 (кратный корень — допустимо)
                answer_formula: '(r1 - r2) * (r1 - r2)',
                hint: '(r₁−r₂)² = (r₁+r₂)² − 4r₁r₂ = D / a²',
                solution: [
                    { explanation: 'D = {b*b} − 4·{a}·{c} = {b*b - 4*a*c}' },
                    { explanation: '(r₁−r₂)² = D / a² = {b*b - 4*a*c} / {a*a} =', result: '{answer}' },
                ],
            },
        },
    },

    // ===== 6. Задачи на квадратные уравнения =====
    {
        id: 'grade8-quadraticWordProblems',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные уравнения',
        topic: 'quadraticWordProblems',
        topic_title: 'Задачи на квадратные уравнения',
        problemType: 'numeric',
        skills: ['quadratic', 'wordProblems'],
        difficulties: {
            // Уровень 1 — ГЕОМЕТРИЧЕСКАЯ: прямоугольник (целые стороны гарантированы)
            1: {
                template: 'Прямоугольник: длина на {d} см больше ширины, площадь {area} см². Найдите ширину.',
                parameters: {
                    // Ширина w, длина w+d; строим от целых сторон
                    w:    { type: 'int', min: 3, max: 10 },
                    d:    { type: 'int', min: 1, max: 6 },
                    area: { type: 'expression', value: 'w * (w + d)' },
                },
                constraints: ['d < w'],
                answer_formula: 'w',
                hint: 'Пусть ширина = x, тогда x(x + {d}) = {area}',
                solution: [
                    { explanation: 'Ширина = x, длина = x + {d}' },
                    { explanation: 'x(x + {d}) = {area}' },
                    { explanation: 'x² + {d}x − {area} = 0' },
                    { explanation: 'Корни уравнения: {w} и {-(w+d)}. Подходит x = {w} (длина > 0)' },
                    { explanation: 'Ширина:', result: '{w} см' },
                ],
                common_mistakes: [
                    { pattern: 'w + d', feedback: 'Это длина, а не ширина.' },
                ],
            },
            // Уровень 2 — ЧИСЛОВАЯ: два числа (целые корни гарантированы через r1,r2)
            2: {
                template: 'Найдите два натуральных числа: сумма = {s}, произведение = {p}. Укажите меньшее.',
                parameters: {
                    r1: { type: 'int', min: 2, max: 8 },
                    r2: { type: 'int', min: 2, max: 8 },
                    s:  { type: 'expression', value: 'r1 + r2' },
                    p:  { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 < r2'],
                answer_formula: 'r1',
                hint: 'Составьте уравнение: x² − {s}x + {p} = 0',
                solution: [
                    { explanation: 'Пусть меньшее = x, тогда большее = {s} − x' },
                    { explanation: 'x · ({s} − x) = {p}' },
                    { explanation: 'x² − {s}x + {p} = 0' },
                    { explanation: 'Корни: {r1} и {r2}. Меньшее:', result: '{r1}' },
                ],
            },
            // Уровень 3 — ГЕОМЕТРИЧЕСКАЯ: площадь прямоугольного треугольника
            // Гарантируем целые катеты через pythagorean-like построение от r
            3: {
                template: 'В прямоугольном треугольнике один катет на {d} см длиннее другого, площадь = {area} см². Найдите меньший катет.',
                parameters: {
                    a:    { type: 'int', min: 3, max: 9 },   // меньший катет
                    d:    { type: 'int', min: 1, max: 5 },   // разность
                    area: { type: 'expression', value: 'a * (a + d) / 2' },
                },
                // area должна быть целой → a*(a+d) чётное
                constraints: ['(a * (a + d)) % 2 === 0'],
                answer_formula: 'a',
                hint: 'Пусть меньший катет = x, тогда x(x + {d})/2 = {area}',
                solution: [
                    { explanation: 'x · (x + {d}) / 2 = {area}' },
                    { explanation: 'x² + {d}x − {2*area} = 0' },
                    { explanation: 'Корень: x =', result: '{a} см' },
                ],
            },
            // Уровень 4 — ЧИСЛОВАЯ: разность квадратов с отрицательными числами
            // Строим от двух чисел с заданными знаками
            4: {
                template: 'Сумма квадратов двух чисел равна {sumSq}, а их произведение равно {prod}. Найдите сумму чисел.',
                parameters: {
                    r1: { type: 'int', min: -8, max: -1 },
                    r2: { type: 'int', min: 1, max: 8 },
                    sumSq: { type: 'expression', value: 'r1*r1 + r2*r2' },
                    prod:  { type: 'expression', value: 'r1 * r2' },
                },
                // Сумма = r1 + r2 (может быть отрицательной — учим работать с отриц. ответами)
                answer_formula: 'r1 + r2',
                hint: '(r₁+r₂)² = r₁² + r₂² + 2r₁r₂ = {sumSq} + 2·({prod})',
                solution: [
                    { explanation: '(r₁+r₂)² = {sumSq} + 2·({prod}) = {sumSq + 2*prod}' },
                    { explanation: 'r₁+r₂ = ±\\sqrt{{sumSq + 2*prod}}' },
                    { explanation: 'Произведение {prod} < 0 → знаки разные → проверяем оба знака' },
                    { explanation: 'Ответ:', result: '{answer}' },
                ],
            },
        },
    },

];
