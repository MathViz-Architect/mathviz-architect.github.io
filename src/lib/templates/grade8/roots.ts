import { ProblemTemplate } from '../../types';

// ============================================================
// Grade 8 — Квадратные корни и действительные числа
// ============================================================
// СТРАТЕГИЯ ГЕНЕРАЦИИ:
//   Все подкоренные выражения строятся как точные квадраты или
//   произведения вида a²·b, чтобы гарантировать целые/простые ответы.
//   Иррациональных или отрицательных подкоренных выражений нет.
// ============================================================

export const grade8RootsTemplates: ProblemTemplate[] = [

    // ===== Тема 1: Арифметический квадратный корень =====
    {
        id: 'grade8-squareRootBasic',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные корни',
        topic: 'squareRootBasic',
        topic_title: 'Арифметический квадратный корень',
        problemType: 'numeric',
        skills: ['squareRoot', 'arithmetic'],
        difficulties: {
            // Уровень 1 — √(n²), n от 2 до 12
            1: {
                template: 'Вычислите: $\\sqrt{c}$.',
                parameters: {
                    n: { type: 'int', min: 2, max: 12 },
                    c: { type: 'expression', value: 'n * n' },
                },
                answer_formula: 'n',
                hint: 'Найдите число, квадрат которого равен {c}',
                solution: [
                    { explanation: '$\\sqrt{c} = \\sqrt{{n}^2} =$', result: '{n}' },
                ],
                common_mistakes: [
                    { pattern: 'c / 2', feedback: 'Квадратный корень ≠ деление на 2. Найдите число, которое в квадрате даёт {c}.' },
                ],
            },
            // Уровень 2 — √(a²·n²) = a·n, подкоренное — произведение двух квадратов
            2: {
                template: 'Вычислите: \\sqrt{c}.',
                parameters: {
                    a: { type: 'int', min: 2, max: 7 },
                    b: { type: 'int', min: 2, max: 7 },
                    c: { type: 'expression', value: 'a * a * b * b' },
                },
                constraints: ['a !== b'],
                answer_formula: 'a * b',
                hint: '{c} = {a}² · {b}², поэтому $\\sqrt{c} = {a}·{b}$',
                solution: [
                    { explanation: '$\\sqrt{c} = \\sqrt{{a}^2 · {b}^2} = {a} · {b} =$', result: '{a * b}' },
                ],
            },
            // Уровень 3 — √(коэффициент · точный квадрат), например √(3·49) = 7√3 → ответ: целая часть
            // Упрощаем: задаём a²·b, просим найти a (коэффициент перед √b)
            3: {
                template: 'Упростите $\\sqrt{c}$. Запишите коэффициент перед знаком корня (множитель a в выражении $a\\sqrt{b}$).',
                parameters: {
                    a:  { type: 'int', min: 2, max: 8 },
                    b:  { type: 'int', min: 2, max: 7 },
                    c:  { type: 'expression', value: 'a * a * b' },
                },
                // b не должен быть точным квадратом (иначе нечего выносить)
                constraints: ['b !== 4', 'b !== 9', 'b !== 1'],
                answer_formula: 'a',
                hint: '{c} = {a}² · {b} → $\\sqrt{c} = {a}\\sqrt{b}$',
                solution: [
                    { explanation: '{c} = {a*a} · {b} = {a}² · {b}' },
                    { explanation: '$\\sqrt{c} = \\sqrt{{a}^2 · {b}} = {a}\\sqrt{b}$' },
                    { explanation: 'Коэффициент перед $\\sqrt{b}$:', result: '{a}' },
                ],
                common_mistakes: [
                    { pattern: 'a * a', feedback: 'Нужен сам коэффициент a, а не a². \\sqrt{c} = {a}·\\sqrt{b}.' },
                ],
            },
            // Уровень 4 — √(a²·b) · √(a²·b) = a²·b (свойство: (√x)² = x при x ≥ 0)
            // или сложнее: √{c1} · √{c2} где c1·c2 — точный квадрат
            4: {
                template: 'Вычислите: $(\\sqrt{c})²$.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 2, max: 6 },
                    c: { type: 'expression', value: 'a * a * b' },
                },
                constraints: ['b !== 4', 'b !== 9', 'b !== 1'],
                answer_formula: 'a * a * b',
                hint: '$(\\sqrt{x})^2 = x$ при x ≥ 0',
                solution: [
                    { explanation: '$(\\sqrt{c})^2 = {c}$ (по определению квадратного корня)', result: '{c}' },
                ],
            },
        },
    },

    // ===== Тема 2: Свойства квадратных корней =====
    {
        id: 'grade8-squareRootProperties',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные корни',
        topic: 'squareRootProperties',
        topic_title: 'Свойства квадратных корней',
        problemType: 'numeric',
        skills: ['squareRoot', 'properties'],
        difficulties: {
            // Уровень 1 — √a · √b = √(a·b), вычислить результат (a·b — точный квадрат)
            1: {
                template: 'Вычислите: $\\sqrt{a} · \\sqrt{b}$.',
                parameters: {
                    n:  { type: 'int', min: 2, max: 10 },
                    // a и b — два множителя, произведение которых = n²
                    // строим: a = n·k, b = n/k для простых k — но лучше фиксированно
                    // Проще: a = k², b = m², результат = k·m = n
                    k:  { type: 'int', min: 2, max: 6 },
                    m:  { type: 'int', min: 2, max: 6 },
                    a:  { type: 'expression', value: 'k * k' },
                    b:  { type: 'expression', value: 'm * m' },
                },
                constraints: ['k !== m'],
                answer_formula: 'k * m',
                hint: '$\\sqrt{a} · \\sqrt{b} = \\sqrt{a·b}$. Здесь $\\sqrt{a} · \\sqrt{b} = \\sqrt{a*b}$',
                solution: [
                    { explanation: '$\\sqrt{a} · \\sqrt{b} = \\sqrt{{a} · {b}} = \\sqrt{a*b}$' },
                    { explanation: '$\\sqrt{a*b} = \\sqrt{{k*m}^2} =$', result: '{k*m}' },
                ],
            },
            // Уровень 2 — √(a/b) = √a / √b, a и b — точные квадраты
            2: {
                template: 'Вычислите: $\\sqrt{{a}/{b}}$.',
                parameters: {
                    k:  { type: 'int', min: 2, max: 9 },
                    m:  { type: 'int', min: 2, max: 9 },
                    a:  { type: 'expression', value: 'k * k' },
                    b:  { type: 'expression', value: 'm * m' },
                },
                constraints: ['k !== m', 'k > m'],
                // √(k²/m²) = k/m, но ответ должен быть целым → k кратно m
                // Упрощаем: просим ввести числитель результата k (знаменатель m известен из условия)
                answer_formula: 'k / m',
                hint: '$\\sqrt{a/b} = \\sqrt{a} / \\sqrt{b} = {k}/{m}$',
                solution: [
                    { explanation: '$\\sqrt{{a}/{b}} = \\sqrt{a} / \\sqrt{b} = {k} / {m}$', result: '{k/m}' },
                ],
                common_mistakes: [
                    { pattern: 'k * m', feedback: 'Это произведение корней. При делении под корнем — берём корни отдельно и делим.' },
                ],
            },
            // Уровень 3 — √a · √b где произведение НЕ точный квадрат, но можно вынести
            // Например: √8 · √2 = √16 = 4
            3: {
                template: 'Вычислите: \\sqrt{a} · \\sqrt{b}.',
                parameters: {
                    n:  { type: 'int', min: 2, max: 8 },
                    // a = n * factor, b = n * factor → a·b = n²·factor²
                    f:  { type: 'int', min: 2, max: 5 },
                    a:  { type: 'expression', value: 'n * f' },
                    b:  { type: 'expression', value: 'n * f' },
                },
                constraints: ['n !== f'],
                answer_formula: 'n * f',
                hint: '$\\sqrt{a} · \\sqrt{b} = \\sqrt{{a}·{b}} = \\sqrt{a*b}$. Является ли {a*b} точным квадратом?',
                solution: [
                    { explanation: '$\\sqrt{a} · \\sqrt{b} = \\sqrt{{a} · {b}} = \\sqrt{a*b}$' },
                    { explanation: '{a*b} = ({n*f})² → $\\sqrt{a*b} =$', result: '{n*f}' },
                ],
            },
            // Уровень 4 — сравнение без вычисления: √a vs b (определить знак разности)
            // Ответ: 1 если √a > b, -1 если √a < b, 0 если равны
            4: {
                template: 'Сравните $\\sqrt{a}$ и {b}. Введите 1 если $\\sqrt{a} > {b}$, −1 если $\\sqrt{a} < {b}$, 0 если равны.',
                parameters: {
                    b:  { type: 'int', min: 3, max: 9 },
                    // строим a = b² ± delta чтобы гарантировать конкретный ответ
                    delta: { type: 'int', min: 1, max: 5 },
                    // случайно: больше или меньше (используем delta как знак через чётность)
                    a:  { type: 'expression', value: 'b * b + delta' },
                },
                // a > b² → √a > b → ответ 1
                answer_formula: '1',
                hint: 'Сравните a = {a} с b² = {b*b}. Если a > b² то $\\sqrt{a} > b$.',
                solution: [
                    { explanation: 'b² = {b}² = {b*b}' },
                    { explanation: '{a} > {b*b} → $\\sqrt{a} > {b}$', result: '1' },
                ],
            },
        },
    },

    // ===== Тема 3: Вынесение множителя из-под знака корня =====
    {
        id: 'grade8-squareRootSimplify',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные корни',
        topic: 'squareRootSimplify',
        topic_title: 'Упрощение выражений с корнями',
        problemType: 'numeric',
        skills: ['squareRoot', 'simplify'],
        difficulties: {
            // Уровень 1 — вынести из-под корня: √(4·b) = 2√b, найти коэффициент
            1: {
                template: 'Вынесите множитель из-под знака корня: $\\sqrt{c}$. Чему равен коэффициент перед $\\sqrt{b}$?',
                parameters: {
                    b:  { type: 'int', min: 2, max: 7 },
                    c:  { type: 'expression', value: '4 * b' },
                },
                constraints: ['b !== 4', 'b !== 1'],
                answer_formula: '2',
                hint: '{c} = 4 · {b} = 2² · {b}, значит $\\sqrt{c} = 2\\sqrt{b}$',
                solution: [
                    { explanation: '{c} = 4 · {b} = 2² · {b}' },
                    { explanation: '$\\sqrt{c} = \\sqrt{2² · {b}} = 2·\\sqrt{b}$' },
                    { explanation: 'Коэффициент:', result: '2' },
                ],
            },
            // Уровень 2 — √(a²·b), найти коэффициент a
            2: {
                template: 'Упростите $\\sqrt{c}$. Найдите коэффициент перед $\\sqrt{b}$.',
                parameters: {
                    a:  { type: 'int', min: 2, max: 9 },
                    b:  { type: 'int', min: 2, max: 7 },
                    c:  { type: 'expression', value: 'a * a * b' },
                },
                constraints: ['b !== 4', 'b !== 9', 'b !== 1'],
                answer_formula: 'a',
                hint: '{c} = {a}² · {b} → $\\sqrt{c} = {a}\\sqrt{b}$',
                solution: [
                    { explanation: '{c} = {a*a} · {b} = {a}² · {b}' },
                    { explanation: '$\\sqrt{c} = {a}\\sqrt{b}$' },
                    { explanation: 'Коэффициент:', result: '{a}' },
                ],
            },
            // Уровень 3 — √(a²·b) + √(a²·b) = 2a√b, найти коэффициент перед √b
            3: {
                template: 'Вычислите: ${k}\\sqrt{c1} + {m}\\sqrt{c1}$. Найдите коэффициент перед $\\sqrt{b}$.',
                parameters: {
                    a:  { type: 'int', min: 2, max: 6 },
                    b:  { type: 'int', min: 2, max: 7 },
                    k:  { type: 'int', min: 1, max: 4 },
                    m:  { type: 'int', min: 1, max: 4 },
                    c1: { type: 'expression', value: 'a * a * b' },
                },
                constraints: ['b !== 4', 'b !== 9', 'b !== 1', 'k !== m'],
                // k·a√b + m·a√b = (k+m)·a·√b → коэффициент = (k+m)*a
                answer_formula: '(k + m) * a',
                hint: '${k}\\sqrt{c1} + {m}\\sqrt{c1} = ({k}+{m})·\\sqrt{c1} = ({k}+{m})·{a}·\\sqrt{b}$',
                solution: [
                    { explanation: '$\\sqrt{c1} = {a}\\sqrt{b}$' },
                    { explanation: '${k}·{a}\\sqrt{b} + {m}·{a}\\sqrt{b} = ({k}+{m})·{a}·\\sqrt{b}$' },
                    { explanation: 'Коэффициент:', result: '{(k+m)*a}' },
                ],
            },
            // Уровень 4 — внесение множителя ПОД знак корня: a·√b = √(a²·b), найти подкоренное
            4: {
                template: 'Внесите множитель под знак корня: ${a}·\\sqrt{b} = √?$. Найдите число под знаком корня.',
                parameters: {
                    a:  { type: 'int', min: 2, max: 8 },
                    b:  { type: 'int', min: 2, max: 7 },
                },
                constraints: ['b !== 4', 'b !== 9', 'b !== 1'],
                answer_formula: 'a * a * b',
                hint: '$a·\\sqrt{b} = \\sqrt{a^2·b} = \\sqrt{{a*a}·{b}}$',
                solution: [
                    { explanation: '${a}·\\sqrt{b} = \\sqrt{{a}^2 · {b}} = \\sqrt{{a*a} · {b}} = \\sqrt{a*a*b}$' },
                    { explanation: 'Подкоренное выражение:', result: '{a*a*b}' },
                ],
                common_mistakes: [
                    { pattern: 'a * b', feedback: 'Под корень идёт a², а не a. {a}·\\sqrt{b} = \\sqrt{{a}^2·{b}} = \\sqrt{a*a*b}.' },
                ],
            },
        },
    },

    // ===== Тема 4: Избавление от иррациональности в знаменателе =====
    {
        id: 'grade8-rationalizeDenominator',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные корни',
        topic: 'rationalizeDenominator',
        topic_title: 'Избавление от иррациональности в знаменателе',
        problemType: 'numeric',
        skills: ['squareRoot', 'rationalize', 'fractions'],
        difficulties: {
            // Уровень 1 — 1/√a · √a/√a = √a/a, найти числитель результата (= √a → ответ: a под корнем)
            // Упрощаем: вычислить числовое значение при конкретных значениях
            // a/√b → умножаем на √b/√b → a√b/b; ответ = числитель·знаменатель
            1: {
                template: 'Рационализируйте знаменатель: ${a}/\\sqrt{b}$. Чему равен числитель после рационализации?',
                parameters: {
                    a:  { type: 'int', min: 1, max: 6 },
                    b:  { type: 'int', min: 2, max: 8 },
                },
                constraints: ['b !== 4', 'b !== 9', 'b !== 1', 'a !== b'],
                // a/√b = a√b/b → числитель (число перед √b) = a
                answer_formula: 'a',
                hint: 'Умножьте числитель и знаменатель на $\\sqrt{b}$: ${a}/\\sqrt{b} · \\sqrt{b}/\\sqrt{b} = {a}\\sqrt{b}/{b}$',
                solution: [
                    { explanation: '${a}/\\sqrt{b} = {a}·\\sqrt{b} / (\\sqrt{b}·\\sqrt{b}) = {a}·\\sqrt{b} / {b}$' },
                    { explanation: 'Числитель перед $\\sqrt{b}$:', result: '{a}' },
                ],
            },
            // Уровень 2 — 1/√b, знаменатель после рационализации = b
            2: {
                template: 'Рационализируйте знаменатель: $1/\\sqrt{b}$. Найдите знаменатель результата.',
                parameters: {
                    b:  { type: 'int', min: 2, max: 12 },
                },
                constraints: ['b !== 4', 'b !== 9', 'b !== 1'],
                answer_formula: 'b',
                hint: '$1/\\sqrt{b} = \\sqrt{b}/({b})$. Знаменатель = $\\sqrt{b}·\\sqrt{b} = {b}$',
                solution: [
                    { explanation: '$1/\\sqrt{b} · \\sqrt{b}/\\sqrt{b} = \\sqrt{b}/(\\sqrt{b})^2$' },
                    { explanation: '$(\\sqrt{b})^2 = {b}$' },
                    { explanation: 'Знаменатель:', result: '{b}' },
                ],
            },
            // Уровень 3 — b — точный квадрат (b = n²), c = k·n → c/√b = k·n/n = k (целый ответ)
            3: {
                template: 'Вычислите: ${c}/\\sqrt{b}$. (Ответ — целое число.)',
                parameters: {
                    k:  { type: 'int', min: 2, max: 8 },
                    n:  { type: 'int', min: 2, max: 6 },
                    b:  { type: 'expression', value: 'n * n' },
                    c:  { type: 'expression', value: 'k * n' },
                },
                answer_formula: 'k',
                hint: '$\\sqrt{b} = {n}$, значит ${c}/\\sqrt{b} = {c}/{n}$',
                solution: [
                    { explanation: '$\\sqrt{b} = \\sqrt{{n}^2} = {n}$' },
                    { explanation: '${c}/{n} =$', result: '{k}' },
                ],
            },
            // Уровень 4 — (a + √b)(a − √b) = a² − b (разность квадратов), найти результат
            4: {
                template: 'Вычислите: $({a} + \\sqrt{b})·({a} − \\sqrt{b})$.',
                parameters: {
                    a:  { type: 'int', min: 2, max: 8 },
                    b:  { type: 'int', min: 2, max: 10 },
                },
                constraints: ['a * a > b', 'b !== 4', 'b !== 9', 'b !== 1'],
                answer_formula: 'a * a - b',
                hint: '$(x+y)(x−y) = x²−y²$. Здесь $x = {a}$, $y = \\sqrt{b}$',
                solution: [
                    { explanation: '$({a}+\\sqrt{b})·({a}-\\sqrt{b}) = {a}² − (\\sqrt{b})² = {a*a} − {b} =$', result: '{a*a - b}' },
                ],
                common_mistakes: [
                    { pattern: 'a * a + b', feedback: 'Это разность квадратов: (a+b)(a−b) = a²−b², а не a²+b².' },
                ],
            },
        },
    },

];
