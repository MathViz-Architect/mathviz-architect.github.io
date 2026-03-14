import { ProblemTemplate } from '../../types';

export const grade7Templates: ProblemTemplate[] = [
    // =========================================================================
    // ===== GRADE 7 - ALGEBRA ================================================
    // =========================================================================

    // ===== GRADE 7 - Powers (Свойства степеней) =====
    {
        id: 'grade7-powers',
        class: 7,
        subject: 'algebra',
        section: 'Степени и одночлены',
        topic: 'powers',
        topic_title: 'Свойства степеней',
        problemType: 'numeric',
        skills: ['powers', 'exponent_rules'],
        difficulties: {
            1: {
                // a^m * a^n = a^(m+n)
                template: 'При умножении степеней с одинаковым основанием: a^{e1} · a^{e2} = a^?. Найдите показатель.',
                parameters: {
                    e1: { type: 'int', min: 2, max: 5 },
                    e2: { type: 'int', min: 2, max: 5 },
                },
                answer_formula: 'e1 + e2',
                hint: 'При умножении степеней с одинаковым основанием показатели складываются: a^m · a^n = a^(m+n)',
                solution: [
                    { explanation: 'Используем правило: a^m · a^n = a^(m+n)' },
                    { explanation: 'Складываем показатели:', expression: '{e1} + {e2} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'e1 * e2', feedback: 'При умножении степеней показатели складываются, а не перемножаются.' },
                ],
            },
            2: {
                // a^m / a^n = a^(m-n)
                template: 'При делении степеней с одинаковым основанием: a^{e1} ÷ a^{e2} = a^?. Найдите показатель.',
                parameters: {
                    e2: { type: 'int', min: 2, max: 4 },
                    diff: { type: 'int', min: 1, max: 4 },
                    e1: { type: 'expression', value: 'e2 + diff' },
                },
                answer_formula: 'e1 - e2',
                hint: 'При делении степеней с одинаковым основанием показатели вычитаются: a^m ÷ a^n = a^(m−n)',
                solution: [
                    { explanation: 'Используем правило: a^m ÷ a^n = a^(m−n)' },
                    { explanation: 'Вычитаем показатели:', expression: '{e1} − {e2} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'e1 + e2', feedback: 'При делении показатели вычитаются, а не складываются. a^m ÷ a^n = a^(m−n).' },
                ],
            },
            3: {
                // (a^m)^n = a^(m*n)
                template: 'При возведении степени в степень: (a^{e1})^{e2} = a^?. Найдите показатель.',
                parameters: {
                    e1: { type: 'int', min: 2, max: 4 },
                    e2: { type: 'int', min: 2, max: 4 },
                },
                answer_formula: 'e1 * e2',
                hint: 'При возведении степени в степень показатели перемножаются: (a^m)^n = a^(m·n)',
                solution: [
                    { explanation: 'Используем правило: (a^m)^n = a^(m·n)' },
                    { explanation: 'Перемножаем показатели:', expression: '{e1} × {e2} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'e1 + e2', feedback: 'При возведении степени в степень показатели перемножаются, а не складываются.' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Monomials (Одночлены) =====
    {
        id: 'grade7-monomials',
        class: 7,
        subject: 'algebra',
        section: 'Степени и одночлены',
        topic: 'monomials',
        topic_title: 'Одночлены',
        problemType: 'numeric',
        skills: ['monomials', 'powers'],
        difficulties: {
            1: {
                // коэффициент произведения одночленов с фиксированными степенями
                template: '{a}x² · {b}x³ = ?·x⁵. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 2, max: 9 },
                },
                answer_formula: 'a * b',
                hint: 'Коэффициенты перемножаются, показатели степеней складываются: {a}·{b} = ?',
                solution: [
                    { explanation: 'Перемножаем коэффициенты:', expression: '{a} × {b} = {answer}' },
                    { explanation: 'Показатели складываем:', expression: 'x² · x³ = x⁵' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Коэффициенты нужно перемножить, а не сложить.' },
                ],
            },
            2: {
                // коэффициент произведения с переменными степенями
                template: '{a}x^{e1} · {b}x^{e2} = ?·x^k. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 2, max: 9 },
                    e1: { type: 'int', min: 2, max: 4 },
                    e2: { type: 'int', min: 2, max: 4 },
                },
                answer_formula: 'a * b',
                hint: 'Коэффициенты перемножаются: {a} × {b}',
            },
            3: {
                // деление одночленов — найти коэффициент частного
                template: '{num}x^{e1} ÷ {b}x^{e2} = ?·x^k. Найдите коэффициент.',
                parameters: {
                    b: { type: 'int', min: 2, max: 6 },
                    k: { type: 'int', min: 2, max: 5 },
                    e2: { type: 'int', min: 2, max: 4 },
                    diff: { type: 'int', min: 1, max: 3 },
                    e1: { type: 'expression', value: 'e2 + diff' },
                    num: { type: 'expression', value: 'b * k' },
                },
                answer_formula: 'k',
                hint: 'Коэффициенты делятся: {num} ÷ {b} = ?',
                solution: [
                    { explanation: 'Делим коэффициенты:', expression: '{num} ÷ {b} = {answer}' },
                    { explanation: 'Вычитаем показатели:', expression: 'x^{e1} ÷ x^{e2} = x^{diff}' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Polynomials (Многочлены) =====
    {
        id: 'grade7-polynomials',
        class: 7,
        subject: 'algebra',
        section: 'Многочлены',
        topic: 'polynomials',
        topic_title: 'Многочлены: сложение и умножение',
        problemType: 'numeric',
        skills: ['polynomials', 'like_terms'],
        difficulties: {
            1: {
                // приведение подобных: (ax + b) + (cx + d) — найти коэффициент при x
                template: '({a}x + {b}) + ({c}x + {d}) = ?·x + k. Найдите коэффициент при x.',
                parameters: {
                    a: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: 1, max: 9 },
                    c: { type: 'int', min: 1, max: 9 },
                    d: { type: 'int', min: 1, max: 9 },
                },
                answer_formula: 'a + c',
                hint: 'Приводите подобные слагаемые: складывайте коэффициенты при x отдельно, свободные члены отдельно.',
                solution: [
                    { explanation: 'Группируем подобные слагаемые:' },
                    { explanation: 'Коэффициент при x:', expression: '{a} + {c} = {answer}' },
                    { explanation: 'Свободный член:', expression: '{b} + {d} = ?k' },
                ],
                common_mistakes: [
                    { pattern: 'a + b + c + d', feedback: 'Нельзя складывать коэффициенты при x со свободными членами.' },
                ],
            },
            2: {
                // вычитание многочленов: коэффициент при x²
                template: '({a}x² + {b}x + {c}) − ({d}x² + {e}x) = ?·x² + ... Найдите коэффициент при x².',
                parameters: {
                    d: { type: 'int', min: 1, max: 5 },
                    extra: { type: 'int', min: 1, max: 4 },
                    a: { type: 'expression', value: 'd + extra' },
                    b: { type: 'int', min: 1, max: 9 },
                    c: { type: 'int', min: 1, max: 9 },
                    e: { type: 'int', min: 1, max: 9 },
                },
                answer_formula: 'a - d',
                hint: 'При вычитании меняйте знаки у всех членов вычитаемого. Коэффициент при x²: {a} − {d}',
                solution: [
                    { explanation: 'Раскрываем скобки (меняем знаки):' },
                    { explanation: 'Коэффициент при x²:', expression: '{a} − {d} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a + d', feedback: 'При вычитании многочлена знаки у всех его членов меняются на противоположные.' },
                ],
            },
            3: {
                // умножение одночлена на многочлен: k·x·(a·x + b) — найти коэффициент при x²
                template: '{k}x({a}x + {b}) = ?·x² + {kb}x. Найдите коэффициент при x².',
                parameters: {
                    k: { type: 'int', min: 2, max: 6 },
                    a: { type: 'int', min: 2, max: 8 },
                    b: { type: 'int', min: 1, max: 8 },
                    kb: { type: 'expression', value: 'k * b' },
                },
                answer_formula: 'k * a',
                hint: 'Умножайте каждый член скобки на {k}x: {k}x · {a}x = {k*a}x²',
                solution: [
                    { explanation: 'Раскрываем скобки, умножая каждый член на {k}x:' },
                    { explanation: '{k}x · {a}x = ?x²:', expression: '{k} × {a} = {answer}' },
                    { explanation: '{k}x · {b} = {kb}x' },
                ],
                common_mistakes: [
                    { pattern: 'k + a', feedback: 'При умножении одночлена на многочлен коэффициенты перемножаются.' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Factoring / ФСУ (Формулы сокращённого умножения) =====
    {
        id: 'grade7-factoring',
        class: 7,
        subject: 'algebra',
        section: 'Многочлены',
        topic: 'factoring',
        topic_title: 'Формулы сокращённого умножения',
        problemType: 'numeric',
        skills: ['factoring', 'square_of_sum', 'difference_of_squares'],
        difficulties: {
            1: {
                // (a+b)² = a²+2ab+b² — найти 2ab
                template: '({a} + {b})² = {a2} + ? + {b2}. Найдите среднее слагаемое.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 2, max: 9 },
                    a2: { type: 'expression', value: 'a * a' },
                    b2: { type: 'expression', value: 'b * b' },
                },
                answer_formula: '2 * a * b',
                hint: 'Формула: (a + b)² = a² + 2ab + b². Найдите 2·{a}·{b}.',
                solution: [
                    { explanation: 'Используем формулу квадрата суммы: (a + b)² = a² + 2ab + b²' },
                    { explanation: 'Среднее слагаемое:', expression: '2 · {a} · {b} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a * b', feedback: 'Не забудьте умножить на 2! Формула: 2ab.' },
                    { pattern: 'a + b', feedback: 'Среднее слагаемое = 2ab = 2 · {a} · {b}.' },
                ],
            },
            2: {
                // (a−b)² = a²−2ab+b² — вычислить всё выражение
                template: 'Вычислите, используя ФСУ: ({a} − {b})² = ?',
                parameters: {
                    b: { type: 'int', min: 2, max: 9 },
                    extra: { type: 'int', min: 1, max: 10 },
                    a: { type: 'expression', value: 'b + extra' },
                },
                answer_formula: '(a - b) * (a - b)',
                hint: 'Формула: (a − b)² = a² − 2ab + b²',
                solution: [
                    { explanation: 'Применяем формулу: (a − b)² = a² − 2ab + b²' },
                    { explanation: 'Подставляем:', expression: '{a}² − 2·{a}·{b} + {b}²' },
                    { explanation: 'Вычисляем:', expression: '{a*a} − {2*a*b} + {b*b} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a * a - b * b', feedback: 'Это формула разности квадратов: (a+b)(a−b). Квадрат разности: (a−b)² = a² − 2ab + b².' },
                ],
            },
            3: {
                // (a+b)(a−b) = a²−b² — разность квадратов
                template: 'Вычислите, используя ФСУ: ({a} + {b}) · ({a} − {b}) = ?',
                parameters: {
                    b: { type: 'int', min: 2, max: 9 },
                    extra: { type: 'int', min: 1, max: 10 },
                    a: { type: 'expression', value: 'b + extra' },
                },
                answer_formula: 'a * a - b * b',
                hint: 'Формула разности квадратов: (a + b)(a − b) = a² − b²',
                solution: [
                    { explanation: 'Применяем формулу: (a + b)(a − b) = a² − b²' },
                    { explanation: 'Подставляем:', expression: '{a}² − {b}²' },
                    { explanation: 'Вычисляем:', expression: '{a*a} − {b*b} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: '(a - b) * (a - b)', feedback: 'Это (a − b)², а не (a + b)(a − b). Здесь разность квадратов: a² − b².' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Linear Equations (Линейные уравнения 7 класса) =====
    {
        id: 'grade7-linear-equations',
        class: 7,
        subject: 'algebra',
        section: 'Линейные уравнения',
        topic: 'linearEquations7',
        topic_title: 'Линейные уравнения',
        problemType: 'numeric',
        skills: ['linear_equations', 'brackets_expansion'],
        difficulties: {
            1: {
                // ax + b = c
                template: 'Решите уравнение: {a}x + {b} = {c}',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    x: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: 1, max: 15 },
                    c: { type: 'expression', value: 'a * x + b' },
                },
                answer_formula: 'x',
                hint: 'Перенесите {b} в правую часть, затем разделите на {a}: x = ({c} − {b}) ÷ {a}.',
                solution: [
                    { explanation: 'Переносим {b} вправо:' },
                    { explanation: '{a}x = {c} − {b}' },
                    { explanation: '{a}x = {c - b}' },
                    { explanation: 'x = {c - b} ÷ {a} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'c / a', feedback: 'Сначала перенесите {b} в правую часть: {a}x = {c} − {b}.' },
                    { pattern: '(c + b) / a', feedback: 'При переносе слагаемого знак меняется: {a}x = {c} − {b}.' },
                ],
            },
            2: {
                // ax + b = cx + d  (с переносом переменной в одну сторону)
                template: 'Решите уравнение: {a}x + {b} = {c}x + {d}',
                parameters: {
                    c: { type: 'int', min: 1, max: 5 },
                    diff: { type: 'int', min: 1, max: 5 },
                    a: { type: 'expression', value: 'c + diff' },
                    x: { type: 'int', min: 1, max: 9 },
                    d: { type: 'int', min: 1, max: 15 },
                    b: { type: 'expression', value: 'c * x + d - diff * x' },
                },
                constraints: ['b > 0', 'd > 0', 'd !== b'],
                answer_formula: 'x',
                hint: 'Перенесите слагаемые с x влево, свободные члены вправо.',
                solution: [
                    { explanation: 'Переносим {c}x влево, {b} вправо:' },
                    { explanation: '{a}x − {c}x = {d} − {b}' },
                    { explanation: '{diff}x = {d - b}' },
                    { explanation: 'x = {answer}' },
                ],
                common_mistakes: [
                    { pattern: '(d - b) / a', feedback: 'Сначала соберите все x в одной части: ({a}−{c})x = {d}−{b}.' },
                    { pattern: '(b - d) / diff', feedback: 'Проверьте знаки при переносе: x-члены влево, свободные — вправо.' },
                ],
            },
            3: {
                // уравнение со скобками: a(x + b) = c
                template: 'Решите уравнение: {a}(x + {b}) = {rhs}',
                parameters: {
                    a: { type: 'int', min: 2, max: 6 },
                    b: { type: 'int', min: 1, max: 8 },
                    x: { type: 'int', min: 1, max: 9 },
                    rhs: { type: 'expression', value: 'a * (x + b)' },
                },
                answer_formula: 'x',
                hint: 'Раскройте скобки: {a}·x + {a}·{b} = {rhs}, затем решите.',
                solution: [
                    { explanation: 'Раскрываем скобки:' },
                    { explanation: '{a}x + {a * b} = {rhs}' },
                    { explanation: '{a}x = {rhs} − {a * b}' },
                    { explanation: '{a}x = {rhs - a * b}' },
                    { explanation: 'x = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'rhs / a - b', feedback: 'Правильная последовательность: сначала {a}·x = {rhs} − {a * b}, потом делим на {a}.' },
                    { pattern: '(rhs - b) / a', feedback: 'Нужно вычесть {a}·{b} = {a * b}, а не просто {b}.' },
                ],
            },
            4: {
                // дробные коэффициенты: x/a + x/b = c, найти x (умножение на НОК)
                template: 'Решите уравнение: x/{a} + x/{b} = {rhs}',
                parameters: {
                    a: { type: 'choice', values: [2, 3, 4, 6] },
                    b: { type: 'choice', values: [3, 4, 6, 12] },
                    x: { type: 'int', min: 6, max: 24 },
                    lcm: { type: 'expression', value: 'a === 2 && b === 3 ? 6 : a === 2 && b === 4 ? 4 : a === 2 && b === 6 ? 6 : a === 2 && b === 12 ? 12 : a === 3 && b === 4 ? 12 : a === 3 && b === 6 ? 6 : a === 3 && b === 12 ? 12 : a === 4 && b === 6 ? 12 : a === 4 && b === 12 ? 12 : 12' },
                    rhs: { type: 'expression', value: 'x / a + x / b' },
                },
                constraints: ['a !== b', 'x % a === 0', 'x % b === 0', 'rhs % 1 === 0'],
                answer_formula: 'x',
                hint: 'Умножьте обе части на НОК({a}, {b}) = {lcm}, чтобы избавиться от дробей.',
                solution: [
                    { explanation: 'Умножаем обе части на НОК({a}, {b}) = {lcm}:' },
                    { explanation: '{lcm / a}x + {lcm / b}x = {rhs * lcm}' },
                    { explanation: '{lcm / a + lcm / b}x = {rhs * lcm}' },
                    { explanation: 'x = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'rhs * a * b', feedback: 'Умножать нужно на НОК, а не на произведение знаменателей.' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Linear Functions (Линейная функция y = kx + b) =====
    {
        id: 'grade7-linear-functions',
        class: 7,
        subject: 'algebra',
        section: 'Линейные функции',
        topic: 'linearFunctions',
        topic_title: 'Линейная функция y = kx + b',
        problemType: 'numeric',
        relatedModule: 'linear-function',
        skills: ['linear_function', 'slope', 'graph_reading'],
        difficulties: {
            1: {
                // вычислить значение функции при данном x
                template: 'Функция y = {k}x + {b}. Найдите y при x = {x}.',
                parameters: {
                    k: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: -9, max: 9 },
                    x: { type: 'int', min: 1, max: 9 },
                },
                answer_formula: 'k * x + b',
                hint: 'Подставьте x = {x} в формулу: y = {k} · {x} + ({b})',
                solution: [
                    { explanation: 'Подставляем x = {x}:' },
                    { explanation: 'y = {k} · {x} + ({b})', expression: '{k * x} + ({b}) = {answer}' },
                ],
            },
            2: {
                // найти x по значению y
                template: 'Функция y = {k}x + {b}. При каком x значение y = {y}?',
                parameters: {
                    k: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: -9, max: 9 },
                    x: { type: 'int', min: 1, max: 9 },
                    y: { type: 'expression', value: 'k * x + b' },
                },
                answer_formula: 'x',
                hint: 'Из уравнения {k}x + ({b}) = {y} выразите x: x = ({y} − ({b})) ÷ {k}',
                solution: [
                    { explanation: 'Составляем уравнение:', expression: '{k}x + ({b}) = {y}' },
                    { explanation: 'Переносим свободный член:', expression: '{k}x = {y} − ({b})' },
                    { explanation: 'Делим на {k}:', expression: 'x = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'k * y + b', feedback: 'Нужно выразить x из уравнения {k}x + ({b}) = {y}, а не подставлять y в формулу ещё раз.' },
                ],
            },
            3: {
                // определить угловой коэффициент по двум точкам
                template: 'Прямая проходит через точки ({x1}; {y1}) и ({x2}; {y2}). Найдите угловой коэффициент k.',
                parameters: {
                    x1: { type: 'int', min: 1, max: 4 },
                    k: { type: 'int', min: 1, max: 6 },
                    b: { type: 'int', min: -5, max: 5 },
                    dx: { type: 'int', min: 2, max: 5 },
                    x2: { type: 'expression', value: 'x1 + dx' },
                    y1: { type: 'expression', value: 'k * x1 + b' },
                    y2: { type: 'expression', value: 'k * x2 + b' },
                },
                answer_formula: 'k',
                hint: 'Угловой коэффициент: k = (y₂ − y₁) / (x₂ − x₁)',
                solution: [
                    { explanation: 'Применяем формулу: k = (y₂ − y₁) / (x₂ − x₁)' },
                    { explanation: 'Подставляем:', expression: '({y2} − {y1}) ÷ ({x2} − {x1})' },
                    { explanation: 'Вычисляем:', expression: '{y2 - y1} ÷ {dx} = {answer}' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Systems of Linear Equations (Системы линейных уравнений) =====
    {
        id: 'grade7-systems',
        class: 7,
        subject: 'algebra',
        section: 'Системы уравнений',
        topic: 'systems',
        topic_title: 'Системы линейных уравнений',
        problemType: 'numeric',
        skills: ['systems_of_equations', 'substitution', 'elimination'],
        difficulties: {
            1: {
                // простая система: x уже выражен явно
                template: 'Система: x = {a}, x + y = {sum}. Найдите y.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    y: { type: 'int', min: 2, max: 9 },
                    sum: { type: 'expression', value: 'a + y' },
                },
                answer_formula: 'y',
                hint: 'Подставьте x = {a} во второе уравнение: {a} + y = {sum}',
                solution: [
                    { explanation: 'Подставляем x = {a} во второе уравнение:' },
                    { explanation: '{a} + y = {sum}' },
                    { explanation: 'y = {sum} − {a} = {answer}' },
                ],
            },
            2: {
                // метод подстановки: y = kx + b, ax + y = rhs — найти x
                template: 'Система (метод подстановки): y = {k}x + {b}, {a}x + y = {rhs}. Найдите x.',
                parameters: {
                    k: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: 1, max: 6 },
                    a: { type: 'int', min: 1, max: 5 },
                    x: { type: 'int', min: 1, max: 8 },
                    rhs: { type: 'expression', value: 'a * x + k * x + b' },
                },
                answer_formula: 'x',
                hint: 'Подставьте y = {k}x + {b} во второе уравнение, затем решите относительно x.',
                solution: [
                    { explanation: 'Подставляем y = {k}x + {b} во второе уравнение:' },
                    { explanation: '{a}x + ({k}x + {b}) = {rhs}' },
                    { explanation: 'Приводим подобные:', expression: '{a + k}x + {b} = {rhs}' },
                    { explanation: '{a + k}x = {rhs - b}' },
                    { explanation: 'x = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'rhs / a', feedback: 'Не забудьте подставить y = {k}x + {b} перед решением.' },
                ],
            },
            3: {
                // метод сложения: ax + by = r1, cx − by = r2 — найти x
                template: 'Система (метод сложения): {a}x + {b}y = {r1}, {c}x − {b}y = {r2}. Найдите x.',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: 1, max: 5 },
                    c: { type: 'int', min: 1, max: 5 },
                    x: { type: 'int', min: 1, max: 8 },
                    y: { type: 'int', min: 1, max: 8 },
                    r1: { type: 'expression', value: 'a * x + b * y' },
                    r2: { type: 'expression', value: 'c * x - b * y' },
                },
                constraints: ['r1 > 0', 'r2 > 0'],
                answer_formula: 'x',
                hint: 'Сложите оба уравнения — слагаемые с y сократятся. Получите: ({a}+{c})x = {r1}+{r2}.',
                solution: [
                    { explanation: 'Складываем уравнения — y сокращается:' },
                    { explanation: '({a} + {c})x = {r1} + {r2}' },
                    { explanation: '{a + c}x = {r1 + r2}' },
                    { explanation: 'x = {r1 + r2} ÷ {a + c} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'r1 / a', feedback: 'Сначала сложите уравнения, чтобы сократить y.' },
                ],
            },
        },
    },

    // =========================================================================
    // ===== GRADE 7 - GEOMETRY ================================================
    // =========================================================================

    // ===== GRADE 7 - Parallel Lines (Параллельные прямые и секущая) =====
    {
        id: 'grade7-parallel-lines',
        class: 7,
        subject: 'geometry',
        section: 'Параллельные прямые',
        topic: 'parallelLines',
        topic_title: 'Параллельные прямые и секущая',
        problemType: 'numeric',
        relatedModule: 'parallel-lines',
        skills: ['parallel_lines', 'angles_transversal'],
        difficulties: {
            1: {
                // смежные углы при пересечении
                template: 'Секущая пересекает прямую. Один из углов при пересечении равен {angle}°. Найдите смежный с ним угол.',
                parameters: {
                    angle: { type: 'int', min: 30, max: 85 },
                },
                answer_formula: '180 - angle',
                hint: 'Смежные углы в сумме дают 180°.',
                solution: [
                    { explanation: 'Смежные углы образуют развёрнутый угол 180°.' },
                    { explanation: '180° − {angle}° = {answer}°' },
                ],
                common_mistakes: [
                    { pattern: '90 - angle', feedback: 'Смежные углы дают 180°, а не 90°.' },
                    { pattern: 'angle', feedback: 'Смежный угол отличается от данного (кроме случая 90°).' },
                ],
            },
            2: {
                // накрест лежащие углы при параллельных прямых
                template: 'Прямые a ∥ b, секущая c. Угол при пересечении с прямой a равен {angle}°. Найдите накрест лежащий угол при пересечении с прямой b.',
                parameters: {
                    angle: { type: 'int', min: 25, max: 155 },
                },
                answer_formula: 'angle',
                hint: 'Накрест лежащие углы при параллельных прямых и секущей равны.',
                solution: [
                    { explanation: 'Свойство параллельных прямых: накрест лежащие углы равны.' },
                    { explanation: 'Ответ: {answer}°' },
                ],
                common_mistakes: [
                    { pattern: '180 - angle', feedback: 'Это смежный угол. Накрест лежащие углы при параллельных прямых — равны!' },
                ],
            },
            3: {
                // соответственные углы: (kx + d) = (mx + n) → найти x
                template: 'Прямые a ∥ b, секущая. Соответственные углы: ({k}x + {d})° и ({m}x + {n})°. Найдите x.',
                parameters: {
                    k: { type: 'int', min: 2, max: 5 },
                    d: { type: 'int', min: 5, max: 30 },
                    m: { type: 'int', min: 1, max: 4 },
                    x: { type: 'int', min: 5, max: 20 },
                    n: { type: 'expression', value: '(k - m) * x + d' },
                },
                constraints: ['k > m', 'n > 0', 'k * x + d < 180'],
                answer_formula: 'x',
                hint: 'Соответственные углы равны: {k}x + {d} = {m}x + {n}.',
                solution: [
                    { explanation: 'Соответственные углы равны, составляем уравнение:' },
                    { explanation: '{k}x + {d} = {m}x + {n}' },
                    { explanation: '({k} − {m})x = {n} − {d}' },
                    { explanation: 'x = {answer}' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Triangle Congruence (Признаки равенства треугольников) =====
    {
        id: 'grade7-triangle-congruence',
        class: 7,
        subject: 'geometry',
        section: 'Треугольники',
        topic: 'triangleCongruence',
        topic_title: 'Признаки равенства треугольников',
        problemType: 'numeric',
        relatedModule: 'triangle-similarity',
        skills: ['triangle_congruence', 'triangle_properties'],
        difficulties: {
            1: {
                // 1-й признак: две стороны и угол между ними → соответственные стороны равны
                template: 'В △ABC: AB = {ab} см, BC = {bc} см, ∠B = {angle}°. В △DEF: DE = {ab} см, EF = {bc} см, ∠E = {angle}°, DF = {df} см. Чему равна AC?',
                parameters: {
                    ab: { type: 'int', min: 3, max: 12 },
                    bc: { type: 'int', min: 3, max: 12 },
                    angle: { type: 'choice', values: [30, 45, 60, 90, 120] },
                    df: { type: 'int', min: 4, max: 15 },
                },
                answer_formula: 'df',
                hint: 'По 1-му признаку равенства (две стороны и угол между ними) △ABC = △DEF, значит AC = DF.',
                solution: [
                    { explanation: '1-й признак: две стороны и угол между ними равны → треугольники равны.' },
                    { explanation: 'AB = DE, BC = EF, ∠B = ∠E → △ABC = △DEF' },
                    { explanation: 'Соответственные стороны: AC = DF = {answer} см' },
                ],
                common_mistakes: [
                    { pattern: 'ab + bc', feedback: 'Используйте признак равенства треугольников: AC = DF.' },
                ],
            },
            2: {
                // 2-й признак: сторона и два прилежащих угла → найти третий угол
                template: 'В △ABC: BC = {a} см, ∠B = {b1}°, ∠C = {b2}°. В △DEF: EF = {a} см, ∠E = {b1}°, ∠F = {b2}°. Найдите ∠A (в градусах).',
                parameters: {
                    a: { type: 'int', min: 4, max: 15 },
                    b1: { type: 'int', min: 35, max: 65 },
                    b2: { type: 'int', min: 35, max: 65 },
                },
                constraints: ['b1 + b2 < 170', 'b1 + b2 > 60'],
                answer_formula: '180 - b1 - b2',
                hint: 'Сумма углов треугольника = 180°. Треугольники равны по 2-му признаку: ∠A = ∠D = 180° − ∠B − ∠C.',
                solution: [
                    { explanation: '2-й признак: сторона и два прилежащих угла равны → треугольники равны.' },
                    { explanation: 'Сумма углов: ∠A + ∠B + ∠C = 180°' },
                    { explanation: '∠A = 180° − {b1}° − {b2}° = {answer}°' },
                ],
                common_mistakes: [
                    { pattern: 'b1 + b2', feedback: 'Это сумма двух известных углов. Третий угол: 180° − ∠B − ∠C.' },
                    { pattern: '90 - b1 - b2', feedback: 'Сумма углов треугольника равна 180°, а не 90°.' },
                ],
            },
            3: {
                // 3-й признак: три стороны → найти третью сторону по периметру
                template: 'Периметр △ABC равен {p} см, AB = {ab} см, BC = {bc} см. Найдите AC.',
                parameters: {
                    ab: { type: 'int', min: 3, max: 10 },
                    bc: { type: 'int', min: 3, max: 10 },
                    ac: { type: 'int', min: 3, max: 10 },
                    p: { type: 'expression', value: 'ab + bc + ac' },
                },
                constraints: ['ab + bc > ac', 'ab + ac > bc', 'bc + ac > ab', 'p <= 30'],
                answer_formula: 'ac',
                hint: 'AC = P − AB − BC = {p} − {ab} − {bc}',
                solution: [
                    { explanation: 'Периметр = сумма всех сторон: AB + BC + AC = P' },
                    { explanation: 'AC = {p} − {ab} − {bc} = {answer} см' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Triangle Angle Sum (Сумма углов треугольника) =====
    {
        id: 'grade7-triangle-angles',
        class: 7,
        subject: 'geometry',
        section: 'Треугольники',
        topic: 'triangleAngles',
        topic_title: 'Сумма углов треугольника',
        problemType: 'numeric',
        skills: ['triangle_angle_sum'],
        difficulties: {
            1: {
                // найти третий угол по двум данным
                template: 'В треугольнике два угла равны {a}° и {b}°. Найдите третий угол.',
                parameters: {
                    a: { type: 'int', min: 30, max: 75 },
                    b: { type: 'int', min: 30, max: 75 },
                },
                constraints: ['a + b < 175', 'a + b > 60'],
                answer_formula: '180 - a - b',
                hint: 'Сумма углов треугольника = 180°. Третий угол = 180° − {a}° − {b}°.',
                solution: [
                    { explanation: 'Сумма углов любого треугольника равна 180°.' },
                    { explanation: '180° − {a}° − {b}° = {answer}°' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Это сумма двух известных углов. Третий угол = 180° − {a}° − {b}°.' },
                    { pattern: '90 - a - b', feedback: 'Сумма углов треугольника равна 180°, а не 90°.' },
                ],
            },
            2: {
                // равнобедренный треугольник: угол при основании → угол при вершине
                template: 'Равнобедренный треугольник. Угол при основании равен {base}°. Найдите угол при вершине.',
                parameters: {
                    base: { type: 'int', min: 30, max: 75 },
                },
                answer_formula: '180 - 2 * base',
                hint: 'В равнобедренном треугольнике два угла при основании равны. Угол при вершине = 180° − 2 · {base}°.',
                solution: [
                    { explanation: 'Оба угла при основании равны {base}°.' },
                    { explanation: 'Угол при вершине = 180° − {base}° − {base}° = {answer}°' },
                ],
                common_mistakes: [
                    { pattern: '180 - base', feedback: 'В равнобедренном треугольнике ДВА угла при основании по {base}°. Вершина = 180° − 2 · {base}°.' },
                ],
            },
            3: {
                // равнобедренный: угол при вершине → угол при основании
                template: 'Равнобедренный треугольник. Угол при вершине равен {apex}°. Найдите угол при основании.',
                parameters: {
                    apex: { type: 'int', min: 20, max: 100 },
                },
                constraints: ['apex % 2 === 0', '180 - apex > 0'],
                answer_formula: '(180 - apex) / 2',
                hint: 'Оба угла при основании равны. Каждый = (180° − {apex}°) ÷ 2.',
                solution: [
                    { explanation: 'Сумма всех углов = 180°. Два угла при основании равны.' },
                    { explanation: 'Угол при основании = (180° − {apex}°) ÷ 2 = {answer}°' },
                ],
                common_mistakes: [
                    { pattern: '180 - apex', feedback: 'Это сумма ОБОИХ углов при основании. Нужно разделить на 2.' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Exterior Angle (Внешний угол треугольника) =====
    {
        id: 'grade7-exterior-angle',
        class: 7,
        subject: 'geometry',
        section: 'Треугольники',
        topic: 'exteriorAngle',
        topic_title: 'Внешний угол треугольника',
        problemType: 'numeric',
        skills: ['exterior_angle', 'triangle_angle_sum'],
        difficulties: {
            1: {
                // внешний угол = сумма двух неприлежащих, найти внешний угол
                template: 'Два угла треугольника равны {a}° и {b}°. Найдите внешний угол, смежный с третьим углом.',
                parameters: {
                    a: { type: 'int', min: 30, max: 70 },
                    b: { type: 'int', min: 30, max: 70 },
                },
                constraints: ['a + b < 170', 'a + b > 50'],
                answer_formula: 'a + b',
                hint: 'Внешний угол треугольника равен сумме двух неприлежащих внутренних углов.',
                solution: [
                    { explanation: 'Теорема о внешнем угле: внешний угол = сумма двух неприлежащих внутренних.' },
                    { explanation: '{a}° + {b}° = {answer}°' },
                ],
                common_mistakes: [
                    { pattern: '180 - a - b', feedback: 'Вы нашли третий внутренний угол. Внешний = сумма двух неприлежащих: {a}° + {b}°.' },
                    { pattern: '180 - (a + b)', feedback: 'Это смежный с внешним внутренний угол. Сам внешний угол = {a}° + {b}°.' },
                ],
            },
            2: {
                // дан внешний угол и один неприлежащий, найти другой неприлежащий
                template: 'Внешний угол треугольника равен {ext}°. Один из неприлежащих внутренних углов равен {a}°. Найдите другой неприлежащий угол.',
                parameters: {
                    a: { type: 'int', min: 25, max: 60 },
                    b: { type: 'int', min: 25, max: 60 },
                    ext: { type: 'expression', value: 'a + b' },
                },
                constraints: ['a + b < 160', 'a !== b'],
                answer_formula: 'b',
                hint: 'Внешний угол = сумма двух неприлежащих: {ext}° = {a}° + ?. Найдите ?.',
                solution: [
                    { explanation: 'По теореме о внешнем угле: ext = a + b.' },
                    { explanation: '{ext}° = {a}° + ?' },
                    { explanation: '? = {ext}° − {a}° = {answer}°' },
                ],
                common_mistakes: [
                    { pattern: '180 - ext', feedback: 'Это смежный с внешним внутренний угол. Используйте теорему: ext = a + b → b = ext − a.' },
                    { pattern: 'ext - 180 + a', feedback: 'Теорема о внешнем угле: ext = a + b, поэтому b = ext − a = {answer}°.' },
                ],
            },
            3: {
                // дан внешний угол и соотношение двух неприлежащих углов m:n, найти меньший
                template: 'Внешний угол треугольника равен {ext}°. Два неприлежащих внутренних угла относятся как {m}:{n}. Найдите меньший из них.',
                parameters: {
                    m: { type: 'int', min: 1, max: 3 },
                    n: { type: 'int', min: 2, max: 4 },
                    ext: { type: 'choice', values: [90, 100, 110, 120, 130] },
                },
                constraints: ['m < n', 'm + n <= 5'],
                answer_formula: 'ext * m / (m + n)',
                hint: 'Внешний угол = a + b = {ext}°. Углы относятся {m}:{n}, значит a = {ext}° · {m} ÷ ({m}+{n}).',
                solution: [
                    { explanation: 'Обозначим углы {m}x и {n}x. По теореме о внешнем угле:' },
                    { explanation: '{m}x + {n}x = {ext}°' },
                    { explanation: 'x = {ext}° ÷ ({m} + {n})' },
                    { explanation: 'Меньший угол = {m}x = {answer}°' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Triangle Inequality (Неравенство треугольника) =====
    {
        id: 'grade7-triangle-inequality',
        class: 7,
        subject: 'geometry',
        section: 'Треугольники',
        topic: 'triangleInequality',
        topic_title: 'Неравенство треугольника',
        problemType: 'numeric',
        skills: ['triangle_inequality'],
        difficulties: {
            1: {
                // проверить, возможен ли треугольник (ответ 1/0)
                template: 'Можно ли построить треугольник со сторонами {a} см, {b} см и {c} см? Введите 1 (да) или 0 (нет).',
                parameters: {
                    valid: { type: 'choice', values: [1, 0] },
                    a: { type: 'int', min: 2, max: 8 },
                    b: { type: 'int', min: 2, max: 8 },
                    // valid=1 → c < a+b и c > |a-b|; valid=0 → c = a+b (вырожденный)
                    c: { type: 'expression', value: 'valid === 1 ? a + b - 1 : a + b' },
                },
                answer_formula: 'valid',
                hint: 'Неравенство треугольника: каждая сторона должна быть меньше суммы двух других.',
                solution: [
                    { explanation: 'Проверяем: {a} + {b} > {c}? {a} + {c} > {b}? {b} + {c} > {a}?' },
                    { explanation: 'Наиболее критичное условие: наименьшие две стороны в сумме > наибольшая.' },
                ],
                common_mistakes: [
                    { pattern: '1 - valid', feedback: 'Проверьте условие неравенства треугольника ещё раз.' },
                ],
            },
            2: {
                // найти диапазон третьей стороны: |a-b| < c < a+b — найти max целое c
                template: 'Две стороны треугольника равны {a} см и {b} см. Каково наибольшее целое значение третьей стороны (в см)?',
                parameters: {
                    a: { type: 'int', min: 3, max: 10 },
                    b: { type: 'int', min: 3, max: 10 },
                },
                answer_formula: 'a + b - 1',
                hint: 'Третья сторона должна быть меньше суммы двух данных: c < {a} + {b}. Наибольшее целое значение: {a} + {b} − 1.',
                solution: [
                    { explanation: 'Условие: третья сторона c < a + b = {a} + {b} = {a + b}' },
                    { explanation: 'Наибольшее целое значение: {a + b} − 1 = {answer} см' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'При c = a + b треугольник вырождается в отрезок. Нужно строгое неравенство: c < a + b.' },
                ],
            },
            3: {
                // найти диапазон: min целое c (больше разности)
                template: 'Две стороны треугольника равны {a} см и {b} см, причём {a} > {b}. Каково наименьшее целое значение третьей стороны?',
                parameters: {
                    b: { type: 'int', min: 3, max: 8 },
                    extra: { type: 'int', min: 2, max: 5 },
                    a: { type: 'expression', value: 'b + extra' },
                },
                answer_formula: 'a - b + 1',
                hint: 'Третья сторона должна быть больше разности: c > {a} − {b}. Наименьшее целое значение: {a} − {b} + 1.',
                solution: [
                    { explanation: 'Условие: c > |a − b| = {a} − {b} = {extra}' },
                    { explanation: 'Наименьшее целое значение: {extra} + 1 = {answer} см' },
                ],
                common_mistakes: [
                    { pattern: 'a - b', feedback: 'При c = a − b треугольник вырождается. Нужно строгое неравенство: c > a − b.' },
                ],
            },
        },
    },

    // ===== FRACTIONS - Addition and Subtraction (Сложение и вычитание дробей) =====
    {
        id: 'grade6-fraction-add-sub',
        class: 6,
        subject: 'algebra',
        section: 'Обыкновенные дроби',
        topic: 'fraction_add_sub',
        topic_title: 'Сложение и вычитание дробей',
        problemType: 'numeric',
        skills: ['fraction_add', 'fraction_sub', 'common_denominator', 'fraction_reduction'],
        version: 1,
        difficulties: {
            1: {
                // Одинаковые знаменатели. Единый pipeline: lcm=b, mb=md=1.
                // op=1 → сложение (a+c < b, чтобы не получить целое),
                // op=-1 → вычитание (a > c).
                template: 'Вычислите: {a}/{b} {sign} {c}/{b}. Введите ответ в виде несократимой дроби.',
                parameters: {
                    b: { type: 'choice', values: [5, 6, 7, 8, 9] },
                    op: { type: 'choice', values: [1, 1, -1] }, // сложение чаще
                    a: { type: 'int', min: 1, max: 7 },
                    c: { type: 'int', min: 1, max: 7 },
                    sign: { type: 'expression', value: 'op === 1 ? "+" : "−"' },
                    lcm: { type: 'expression', value: 'b' },
                    mb: { type: 'expression', value: '1' },
                    md: { type: 'expression', value: '1' },
                    an: { type: 'expression', value: 'a' },
                    cn: { type: 'expression', value: 'c' },
                    snum: { type: 'expression', value: 'a + op * c' },
                },
                constraints: ['a < b', 'c < b', 'snum > 0', 'snum !== b'],
                answer_formula: 'snum / lcm',
                answer_type: 'fraction',
                hint: 'При одинаковых знаменателях просто {sign} числители, знаменатель остаётся {b}.',
                solution: [
                    { explanation: 'Знаменатели одинаковые ({b}), поэтому просто {sign} числители:' },
                    { explanation: '{a} {sign} {c} = {snum}' },
                    { explanation: 'Результат:', result: '{snum}/{lcm}' },
                ],
            },
            2: {
                // Разные знаменатели, НОК ≤ 20, взаимно простые пары.
                // Пары (b,d) с нулём сократимых результатов (проверено перебором):
                // i=0:(2,3) i=1:(2,5) i=2:(2,7) i=3:(3,5) i=4:(5,3) i=5:(3,2) i=6:(7,2)
                template: 'Вычислите: {a}/{b} {sign} {c}/{d}. Введите ответ в виде несократимой дроби.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6] },
                    b: { type: 'expression', value: 'i===0?2:i===1?2:i===2?2:i===3?3:i===4?5:i===5?3:7' },
                    d: { type: 'expression', value: 'i===0?3:i===1?5:i===2?7:i===3?5:i===4?3:i===5?2:2' },
                    op: { type: 'choice', values: [1, 1, -1] },
                    a: { type: 'int', min: 1, max: 6 },
                    c: { type: 'int', min: 1, max: 6 },
                    sign: { type: 'expression', value: 'op === 1 ? "+" : "−"' },
                    lcm: { type: 'expression', value: 'b * d' },
                    mb: { type: 'expression', value: 'lcm / b' },
                    md: { type: 'expression', value: 'lcm / d' },
                    an: { type: 'expression', value: 'a * mb' },
                    cn: { type: 'expression', value: 'c * md' },
                    snum: { type: 'expression', value: 'an + op * cn' },
                },
                constraints: ['a < b', 'c < d', 'snum > 0'],
                answer_formula: 'snum / lcm',
                answer_type: 'fraction',
                hint: 'НОК({b}, {d}) = {lcm}. Приведите обе дроби к знаменателю {lcm}, затем {sign} числители.',
                solution: [
                    { explanation: 'НОК({b}, {d}) = {lcm}.' },
                    { explanation: 'Приводим дроби:', expression: '{a}/{b} = {an}/{lcm},  {c}/{d} = {cn}/{lcm}' },
                    { explanation: '{an} {sign} {cn} = {snum}' },
                    { explanation: 'Результат:', result: '{snum}/{lcm}' },
                ],
                common_mistakes: [
                    { pattern: 'a + c + "/" + (b + d)', feedback: 'Нельзя складывать числители и знаменатели отдельно. Приведи дроби к общему знаменателю {lcm}.' },
                ],
            },
            3: {
                // Разные знаменатели, взаимно простые пары, НОК 21–56.
                // Пары: (3,7,21),(4,7,28),(5,6,30),(5,7,35),(4,9,36),(7,8,56)
                // Все суммы/разности несократимы (НОД=1 гарантирует это для взаимно простых пар).
                template: 'Вычислите: {a}/{b} {sign} {c}/{d}. Введите ответ в виде несократимой дроби.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5] },
                    b: { type: 'expression', value: 'i===0?3:i===1?4:i===2?5:i===3?5:i===4?4:7' },
                    d: { type: 'expression', value: 'i===0?7:i===1?7:i===2?6:i===3?7:i===4?9:8' },
                    op: { type: 'choice', values: [1, 1, -1] },
                    a: { type: 'int', min: 1, max: 4 },
                    c: { type: 'int', min: 1, max: 4 },
                    sign: { type: 'expression', value: 'op === 1 ? "+" : "−"' },
                    lcm: { type: 'expression', value: 'b * d' },
                    mb: { type: 'expression', value: 'lcm / b' },
                    md: { type: 'expression', value: 'lcm / d' },
                    an: { type: 'expression', value: 'a * mb' },
                    cn: { type: 'expression', value: 'c * md' },
                    snum: { type: 'expression', value: 'an + op * cn' },
                },
                constraints: ['a < b', 'c < d', 'snum > 0', 'b * d <= 60'],
                answer_formula: 'snum / lcm',
                answer_type: 'fraction',
                hint: 'Найдите НОК({b}, {d}), приведите дроби к общему знаменателю, затем {sign} числители.',
                solution: [
                    { explanation: 'НОК({b}, {d}) = {lcm}.' },
                    { explanation: 'Приводим дроби:', expression: '{a}/{b} = {an}/{lcm},  {c}/{d} = {cn}/{lcm}' },
                    { explanation: '{an} {sign} {cn} = {snum}' },
                    { explanation: 'Результат:', result: '{snum}/{lcm}' },
                ],
            },
            4: {
                // НОК < b*d (не взаимно простые), результат может сокращаться.
                // Пары (b,d,lcm): (4,6,12),(6,9,18),(3,9,9),(6,4,12),(9,6,18)
                // Валидатор принимает любую эквивалентную форму дроби.
                template: 'Вычислите: {a}/{b} {sign} {c}/{d}. Введите ответ в виде дроби (можно несократимой).',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4] },
                    b: { type: 'expression', value: 'i===0?4:i===1?6:i===2?3:i===3?6:9' },
                    d: { type: 'expression', value: 'i===0?6:i===1?9:i===2?9:i===3?4:6' },
                    lcm: { type: 'expression', value: 'i===0?12:i===1?18:i===2?9:i===3?12:18' },
                    op: { type: 'choice', values: [1, 1, -1] },
                    a: { type: 'int', min: 1, max: 5 },
                    c: { type: 'int', min: 1, max: 5 },
                    sign: { type: 'expression', value: 'op === 1 ? "+" : "−"' },
                    mb: { type: 'expression', value: 'lcm / b' },
                    md: { type: 'expression', value: 'lcm / d' },
                    an: { type: 'expression', value: 'a * mb' },
                    cn: { type: 'expression', value: 'c * md' },
                    snum: { type: 'expression', value: 'an + op * cn' },
                },
                constraints: ['a < b', 'c < d', 'snum > 0'],
                answer_formula: 'snum / lcm',
                answer_type: 'fraction',
                hint: 'НОК({b}, {d}) = {lcm}. Не забудьте сократить результат, если возможно.',
                solution: [
                    { explanation: 'НОК({b}, {d}) = {lcm}.' },
                    { explanation: 'Множители: для {b} → ×{mb}, для {d} → ×{md}.' },
                    { explanation: 'Приводим дроби:', expression: '{a}/{b} = {an}/{lcm},  {c}/{d} = {cn}/{lcm}' },
                    { explanation: '{an} {sign} {cn} = {snum}' },
                    { explanation: 'Результат:', result: '{snum}/{lcm}' },
                ],
                common_mistakes: [
                    { pattern: 'a + c + "/" + (b * d)', feedback: 'НОК({b}, {d}) = {lcm}, а не {b}×{d}.' },
                ],
            },
        },
    },
    // ===== GRADE 7 - Corresponding Angles (Соответственные углы) =====
    {
        id: 'grade7-corr-angles',
        class: 7,
        subject: 'geometry',
        section: 'Параллельные прямые',
        topic: 'corrAngles',
        topic_title: 'Соответственные углы',
        problemType: 'numeric',
        relatedModule: 'parallel-lines',
        skills: ['corresponding_angles'],
        difficulties: {
            1: {
                template: 'Прямые a ∥ b, секущая c. Один из соответственных углов равен {angle}°. Найдите другой соответственный угол.',
                parameters: {
                    angle: { type: 'int', min: 30, max: 150 },
                },
                answer_formula: 'angle',
                hint: 'Соответственные углы при параллельных прямых и секущей равны.',
                solution: [
                    { explanation: 'При параллельных прямых соответственные углы равны.' },
                    { explanation: 'Ответ: {answer}°' },
                ],
                common_mistakes: [
                    { pattern: '180 - angle', feedback: 'Соответственные углы РАВНЫ, а не в сумме дают 180°.' },
                ],
            },
            2: {
                template: 'Прямые a ∥ b, секущая c. Соответственный угол равен {angle}°. Найдите смежный с ним угол.',
                parameters: {
                    angle: { type: 'int', min: 30, max: 85 },
                },
                answer_formula: '180 - angle',
                hint: 'Соответственные углы равны. Смежный с соответственным = 180° − {angle}°.',
                solution: [
                    { explanation: 'Смежные углы в сумме дают 180°.' },
                    { explanation: '180° − {angle}° = {answer}°' },
                ],
            },
            3: {
                template: 'Прямые a ∥ b, секущая. Соответственные углы: ({k}x + {d})° и ({m}x + {n})°. Найдите x.',
                parameters: {
                    k: { type: 'int', min: 2, max: 5 },
                    d: { type: 'int', min: 5, max: 30 },
                    m: { type: 'int', min: 1, max: 4 },
                    x: { type: 'int', min: 5, max: 20 },
                    n: { type: 'expression', value: '(k - m) * x + d' },
                },
                constraints: ['k > m', 'n > 0', 'k * x + d < 180'],
                answer_formula: 'x',
                hint: 'Соответственные углы равны: {k}x + {d} = {m}x + {n}.',
                solution: [
                    { explanation: 'Составляем уравнение: {k}x + {d} = {m}x + {n}' },
                    { explanation: '({k} − {m})x = {n} − {d}' },
                    { explanation: 'x = {answer}' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Alternate Interior Angles (Накрест лежащие углы) =====
    {
        id: 'grade7-alt-angles',
        class: 7,
        subject: 'geometry',
        section: 'Параллельные прямые',
        topic: 'altAngles',
        topic_title: 'Накрест лежащие углы',
        problemType: 'numeric',
        relatedModule: 'parallel-lines',
        skills: ['alternate_angles'],
        difficulties: {
            1: {
                template: 'Прямые a ∥ b, секущая c. Один из накрест лежащих углов равен {angle}°. Найдите другой накрест лежащий угол.',
                parameters: {
                    angle: { type: 'int', min: 25, max: 155 },
                },
                answer_formula: 'angle',
                hint: 'Накрест лежащие углы при параллельных прямых равны.',
                solution: [
                    { explanation: 'Накрест лежащие углы при параллельных прямых равны.' },
                    { explanation: 'Ответ: {answer}°' },
                ],
                common_mistakes: [
                    { pattern: '180 - angle', feedback: 'Накрест лежащие углы РАВНЫ. 180° − угол — это смежный или односторонний.' },
                ],
            },
            2: {
                template: 'Прямые a ∥ b, секущая. Накрест лежащий угол равен {angle}°. Найдите соответственный ему угол.',
                parameters: {
                    angle: { type: 'int', min: 25, max: 155 },
                },
                answer_formula: 'angle',
                hint: 'Накрест лежащие и соответственные углы при параллельных прямых — оба равны данному.',
                solution: [
                    { explanation: 'Накрест лежащие углы равны → соответственный угол тоже равен {angle}°.' },
                    { explanation: 'Ответ: {answer}°' },
                ],
            },
            3: {
                template: 'Прямые a ∥ b, секущая. Накрест лежащие углы: (2x + {d})° и ({m}x + {n})°. Найдите угол (в градусах).',
                parameters: {
                    d: { type: 'int', min: 10, max: 40 },
                    m: { type: 'int', min: 1, max: 1 },
                    x: { type: 'int', min: 10, max: 30 },
                    n: { type: 'expression', value: 'x + d' },
                },
                answer_formula: '2 * x + d',
                hint: 'Накрест лежащие углы равны: 2x + {d} = {m}x + {n}. Найдите x, потом угол.',
                solution: [
                    { explanation: 'Накрест лежащие углы равны: 2x + {d} = x + {n}' },
                    { explanation: 'x = {n} − {d} = {x}' },
                    { explanation: 'Угол = 2·{x} + {d} = {answer}°' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Co-Interior Angles (Односторонние углы) =====
    {
        id: 'grade7-co-interior-angles',
        class: 7,
        subject: 'geometry',
        section: 'Параллельные прямые',
        topic: 'coInteriorAngles',
        topic_title: 'Односторонние углы',
        problemType: 'numeric',
        relatedModule: 'parallel-lines',
        skills: ['co_interior_angles'],
        difficulties: {
            1: {
                template: 'Прямые a ∥ b, секущая. Один из односторонних углов равен {angle}°. Найдите другой односторонний угол.',
                parameters: {
                    angle: { type: 'int', min: 30, max: 150 },
                },
                constraints: ['angle !== 90'],
                answer_formula: '180 - angle',
                hint: 'Односторонние углы при параллельных прямых в сумме дают 180°.',
                solution: [
                    { explanation: 'Односторонние (внутренние накрест лежащие) углы при параллельных прямых в сумме 180°.' },
                    { explanation: '180° − {angle}° = {answer}°' },
                ],
                common_mistakes: [
                    { pattern: 'angle', feedback: 'Односторонние углы НЕ равны, а дополняют друг друга до 180°.' },
                ],
            },
            2: {
                template: 'Прямые a ∥ b, секущая. Один из односторонних углов в {k} раз больше другого. Найдите меньший угол.',
                parameters: {
                    k: { type: 'choice', values: [2, 3, 4, 5] },
                },
                answer_formula: '180 / (k + 1)',
                hint: 'Если углы x и kx, то x + kx = 180°. Откуда x = 180° ÷ ({k} + 1).',
                solution: [
                    { explanation: 'Пусть меньший угол = x, тогда больший = {k}x.' },
                    { explanation: 'x + {k}x = 180°' },
                    { explanation: '{k + 1}x = 180°' },
                    { explanation: 'x = {answer}°' },
                ],
                constraints: ['180 % (k + 1) === 0'],
            },
            3: {
                template: 'Прямые a ∥ b, секущая. Один из односторонних углов равен ({k}x + {d})°, другой — ({m}x + {n})°. Найдите x.',
                parameters: {
                    k: { type: 'int', min: 2, max: 4 },
                    m: { type: 'int', min: 1, max: 3 },
                    x: { type: 'int', min: 5, max: 20 },
                    d: { type: 'int', min: 5, max: 30 },
                    n: { type: 'expression', value: '180 - (k + m) * x - d' },
                },
                constraints: ['n > 0', 'k * x + d < 175', 'm * x + n < 175'],
                answer_formula: 'x',
                hint: 'Односторонние углы в сумме дают 180°: ({k}x + {d}) + ({m}x + {n}) = 180.',
                solution: [
                    { explanation: 'Составляем уравнение: ({k}x + {d}) + ({m}x + {n}) = 180' },
                    { explanation: '{k + m}x + {d + n} = 180' },
                    { explanation: '{k + m}x = {180 - d - n}' },
                    { explanation: 'x = {answer}' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Congruence SSS (Признак равенства: три стороны) =====
    {
        id: 'grade7-congruence-sss',
        class: 7,
        subject: 'geometry',
        section: 'Треугольники',
        topic: 'congruenceSSS',
        topic_title: 'Признак равенства SSS (три стороны)',
        problemType: 'numeric',
        relatedModule: 'triangle-similarity',
        skills: ['triangle_congruence_sss'],
        difficulties: {
            1: {
                template: 'В △ABC и △DEF: AB = DE = {ab}, BC = EF = {bc}, AC = {ac}. По 3-му признаку равенства DF = ?',
                parameters: {
                    ab: { type: 'int', min: 3, max: 12 },
                    bc: { type: 'int', min: 3, max: 12 },
                    ac: { type: 'int', min: 3, max: 12 },
                },
                constraints: ['ab + bc > ac', 'ab + ac > bc', 'bc + ac > ab'],
                answer_formula: 'ac',
                hint: 'Третий признак: три стороны. AB=DE, BC=EF, AC=DF → △ABC = △DEF → DF = AC.',
                solution: [
                    { explanation: '3-й признак равенства треугольников: все три стороны равны.' },
                    { explanation: 'AB = DE, BC = EF, AC = DF → △ABC = △DEF' },
                    { explanation: 'DF = AC = {answer}' },
                ],
            },
            2: {
                template: 'Периметр △ABC = {p}. AB = {ab}, BC = {bc}. Равный ему △DEF имеет DE = {ab}, EF = {bc}. Найдите DF.',
                parameters: {
                    ab: { type: 'int', min: 3, max: 10 },
                    bc: { type: 'int', min: 3, max: 10 },
                    ac: { type: 'int', min: 3, max: 10 },
                    p: { type: 'expression', value: 'ab + bc + ac' },
                },
                constraints: ['ab + bc > ac', 'ab + ac > bc', 'bc + ac > ab', 'p <= 30'],
                answer_formula: 'ac',
                hint: 'AC = P − AB − BC = {p} − {ab} − {bc}. По 3-му признаку DF = AC.',
                solution: [
                    { explanation: 'Находим AC: {p} − {ab} − {bc} = {answer}' },
                    { explanation: 'По 3-му признаку △ABC = △DEF, значит DF = AC = {answer}' },
                ],
            },
            3: {
                template: 'Два треугольника имеют стороны: первый — {a}, {b}, {c}; второй — {a}, {b}, {d}. Равны ли треугольники? Введите 1 (да) или 0 (нет).',
                parameters: {
                    a: { type: 'int', min: 3, max: 10 },
                    b: { type: 'int', min: 3, max: 10 },
                    c: { type: 'int', min: 3, max: 10 },
                    d: { type: 'int', min: 3, max: 10 },
                },
                constraints: ['c !== d', 'a + b > c', 'a + b > d', 'a + c > b', 'a + d > b'],
                answer_formula: '0',
                hint: 'Для равенства по 3-му признаку все три стороны должны быть попарно равны. Третьи стороны {c} ≠ {d}.',
                solution: [
                    { explanation: 'Третьи стороны {c} ≠ {d} — треугольники не равны по 3-му признаку.' },
                    { explanation: 'Ответ: 0 (нет)' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Congruence SAS (Признак равенства: две стороны и угол) =====
    {
        id: 'grade7-congruence-sas',
        class: 7,
        subject: 'geometry',
        section: 'Треугольники',
        topic: 'congruenceSAS',
        topic_title: 'Признак равенства SAS (две стороны и угол)',
        problemType: 'numeric',
        relatedModule: 'triangle-similarity',
        skills: ['triangle_congruence_sas'],
        difficulties: {
            1: {
                template: 'В △ABC: AB = {ab}, BC = {bc}, ∠B = {angle}°. В △DEF: DE = {ab}, EF = {bc}, ∠E = {angle}°, DF = {df}. По 1-му признаку AC = ?',
                parameters: {
                    ab: { type: 'int', min: 3, max: 12 },
                    bc: { type: 'int', min: 3, max: 12 },
                    angle: { type: 'choice', values: [30, 45, 60, 90, 120] },
                    df: { type: 'int', min: 4, max: 15 },
                },
                answer_formula: 'df',
                hint: '1-й признак (SAS): AB=DE, ∠B=∠E, BC=EF → △ABC = △DEF → AC = DF.',
                solution: [
                    { explanation: '1-й признак: две стороны и угол между ними.' },
                    { explanation: 'AB = DE, ∠B = ∠E, BC = EF → △ABC = △DEF' },
                    { explanation: 'AC = DF = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'ab + bc', feedback: 'Используйте признак равенства: AC = DF = {df}.' },
                ],
            },
            2: {
                template: 'В △ABC: AB = {ab}, ∠A = {angle}°, AC = {ac}. В △DEF: DE = {ab}, ∠D = {angle}°, DF = {ac}. Найдите ∠B, если ∠E = {angE}°.',
                parameters: {
                    ab: { type: 'int', min: 3, max: 12 },
                    angle: { type: 'int', min: 30, max: 80 },
                    ac: { type: 'int', min: 3, max: 12 },
                    angE: { type: 'int', min: 20, max: 70 },
                },
                answer_formula: 'angE',
                hint: 'По 1-му признаку △ABC = △DEF, значит ∠B = ∠E.',
                solution: [
                    { explanation: '1-й признак: AB=DE, ∠A=∠D, AC=DF → △ABC = △DEF' },
                    { explanation: 'Соответственные углы равны: ∠B = ∠E = {answer}°' },
                ],
            },
            3: {
                template: 'В △ABC: AB = {ab}, BC = {bc}, ∠B = {angle}°. Периметр = {p}. В △DEF такой же набор сторон и угол. Найдите AC.',
                parameters: {
                    ab: { type: 'int', min: 3, max: 10 },
                    bc: { type: 'int', min: 3, max: 10 },
                    ac: { type: 'int', min: 3, max: 10 },
                    angle: { type: 'choice', values: [30, 45, 60, 90] },
                    p: { type: 'expression', value: 'ab + bc + ac' },
                },
                constraints: ['ab + bc > ac', 'p <= 30'],
                answer_formula: 'ac',
                hint: 'AC = P − AB − BC = {p} − {ab} − {bc}.',
                solution: [
                    { explanation: 'AC = {p} − {ab} − {bc} = {answer}' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Congruence ASA (Признак равенства: угол, сторона, угол) =====
    {
        id: 'grade7-congruence-asa',
        class: 7,
        subject: 'geometry',
        section: 'Треугольники',
        topic: 'congruenceASA',
        topic_title: 'Признак равенства ASA (угол, сторона, угол)',
        problemType: 'numeric',
        relatedModule: 'triangle-similarity',
        skills: ['triangle_congruence_asa'],
        difficulties: {
            1: {
                template: 'В △ABC: BC = {a}, ∠B = {b1}°, ∠C = {b2}°. В △DEF: EF = {a}, ∠E = {b1}°, ∠F = {b2}°. Найдите ∠A.',
                parameters: {
                    a: { type: 'int', min: 4, max: 15 },
                    b1: { type: 'int', min: 35, max: 65 },
                    b2: { type: 'int', min: 35, max: 65 },
                },
                constraints: ['b1 + b2 < 170', 'b1 + b2 > 60'],
                answer_formula: '180 - b1 - b2',
                hint: '2-й признак (ASA): BC=EF, ∠B=∠E, ∠C=∠F → △ABC = △DEF. ∠A = 180° − {b1}° − {b2}°.',
                solution: [
                    { explanation: '2-й признак: сторона и два прилежащих угла.' },
                    { explanation: '∠A = 180° − {b1}° − {b2}° = {answer}°' },
                ],
                common_mistakes: [
                    { pattern: 'b1 + b2', feedback: 'Третий угол = 180° − ∠B − ∠C = 180° − {b1}° − {b2}°.' },
                ],
            },
            2: {
                template: 'В △ABC: ∠A = {a}°, ∠B = {b}°, BC = {side}. В △DEF по 2-му признаку: ∠D = {a}°, ∠E = {b}°, EF = {side}. Найдите ∠C.',
                parameters: {
                    a: { type: 'int', min: 30, max: 70 },
                    b: { type: 'int', min: 30, max: 70 },
                    side: { type: 'int', min: 3, max: 12 },
                },
                constraints: ['a + b < 170'],
                answer_formula: '180 - a - b',
                hint: '∠C = ∠F = 180° − ∠A − ∠B.',
                solution: [
                    { explanation: 'Сумма углов: ∠C = 180° − {a}° − {b}° = {answer}°' },
                ],
            },
            3: {
                template: 'Два треугольника: в первом ∠A = {a}°, ∠B = {b}°, AB = {c}; во втором ∠D = {a}°, ∠E = {b}°, DE = {c}. Найдите ∠C.',
                parameters: {
                    a: { type: 'int', min: 40, max: 80 },
                    b: { type: 'int', min: 40, max: 80 },
                    c: { type: 'int', min: 3, max: 15 },
                },
                constraints: ['a + b < 170'],
                answer_formula: '180 - a - b',
                hint: 'По 2-му признаку треугольники равны. ∠C = 180° − ∠A − ∠B.',
                solution: [
                    { explanation: 'По 2-му признаку △ABC = △DEF.' },
                    { explanation: '∠C = 180° − {a}° − {b}° = {answer}°' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Power of Number (Степень числа) =====
    {
        id: 'grade7-power-of-number',
        class: 7,
        subject: 'algebra',
        section: 'Степени и одночлены',
        topic: 'powerOfNumber',
        topic_title: 'Степень числа',
        problemType: 'numeric',
        skills: ['powers'],
        difficulties: {
            1: {
                template: 'Вычислите: {a}² = ?',
                parameters: {
                    a: { type: 'int', min: 2, max: 12 },
                },
                answer_formula: 'a * a',
                hint: '{a}² = {a} × {a}',
                solution: [
                    { explanation: 'Степень — это произведение числа на само себя.' },
                    { explanation: '{a}² = {a} × {a} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a * 2', feedback: '{a}² означает {a} × {a}, а не {a} × 2.' },
                ],
            },
            2: {
                template: 'Вычислите: {a}³ = ?',
                parameters: {
                    a: { type: 'int', min: 2, max: 6 },
                },
                answer_formula: 'a * a * a',
                hint: '{a}³ = {a} × {a} × {a}',
                solution: [
                    { explanation: '{a}³ = {a} × {a} × {a} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a * 3', feedback: '{a}³ означает {a} × {a} × {a}, а не {a} × 3.' },
                ],
            },
            3: {
                template: 'Вычислите: (−{a})² = ?',
                parameters: {
                    a: { type: 'int', min: 2, max: 10 },
                },
                answer_formula: 'a * a',
                hint: '(−a)² = (−a) × (−a) = a². Минус на минус = плюс.',
                solution: [
                    { explanation: '(−{a})² = (−{a}) × (−{a})' },
                    { explanation: 'Знаки: (−) × (−) = (+)' },
                    { explanation: 'Результат: {answer}' },
                ],
                common_mistakes: [
                    { pattern: '-1 * a * a', feedback: '(−{a})² = +{a*a}, так как отрицательное число в чётной степени положительно.' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Monomial Standard Form (Стандартный вид одночлена) =====
    {
        id: 'grade7-monomial-std-form',
        class: 7,
        subject: 'algebra',
        section: 'Степени и одночлены',
        topic: 'monomialStdForm',
        topic_title: 'Стандартный вид одночлена',
        problemType: 'numeric',
        skills: ['monomials'],
        difficulties: {
            1: {
                // найти коэффициент одночлена
                template: 'Одночлен {a}·x·{b}·x² записан в стандартном виде как ?·x³. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 2, max: 9 },
                },
                answer_formula: 'a * b',
                hint: 'Перемножьте числовые множители: {a} · {b}. Степени x сложите: x · x² = x³.',
                solution: [
                    { explanation: 'Группируем числовые множители и степени x:' },
                    { explanation: '{a} · {b} = {answer}, x · x² = x³' },
                ],
            },
            2: {
                template: 'Одночлен {a}·x²·{b}·y записан в стандартном виде как ?·x²y. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 2, max: 9 },
                },
                answer_formula: 'a * b',
                hint: 'Коэффициент = произведение числовых множителей: {a} · {b}.',
            },
            3: {
                template: 'Одночлен 3x · (−{a}x²) · {b} записан в стандартном виде как ?·x³. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 7 },
                    b: { type: 'int', min: 2, max: 5 },
                },
                answer_formula: '-3 * a * b',
                hint: 'Перемножьте числовые части с учётом знаков: 3 · (−{a}) · {b}.',
                solution: [
                    { explanation: 'Числовая часть: 3 · (−{a}) · {b} = {answer}' },
                    { explanation: 'Буквенная часть: x · x² = x³' },
                ],
                common_mistakes: [
                    { pattern: '3 * a * b', feedback: 'Не забудьте знак «минус» у (−{a}).' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Like Terms (Подобные члены) =====
    {
        id: 'grade7-like-terms',
        class: 7,
        subject: 'algebra',
        section: 'Многочлены',
        topic: 'likeTerms',
        topic_title: 'Приведение подобных членов',
        problemType: 'numeric',
        skills: ['like_terms', 'polynomials'],
        difficulties: {
            1: {
                template: 'Приведите подобные члены: {a}x + {b}x = ?·x. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 2, max: 9 },
                },
                answer_formula: 'a + b',
                hint: 'Подобные члены — одинаковые буквенные части. Складываем коэффициенты: {a} + {b}.',
                solution: [
                    { explanation: 'Буквенные части одинаковые (x), складываем коэффициенты:' },
                    { explanation: '{a} + {b} = {answer}' },
                ],
            },
            2: {
                template: 'Упростите: {a}x² + {b}x + {c}x² − {d}x. Найдите коэффициент при x².',
                parameters: {
                    a: { type: 'int', min: 2, max: 8 },
                    b: { type: 'int', min: 1, max: 8 },
                    c: { type: 'int', min: 1, max: 5 },
                    d: { type: 'int', min: 1, max: 6 },
                },
                answer_formula: 'a + c',
                hint: 'Приводим подобные: коэффициенты при x²: {a} + {c}.',
                solution: [
                    { explanation: 'Группируем x²-члены: {a}x² + {c}x² = {a+c}x²' },
                    { explanation: 'Группируем x-члены: {b}x − {d}x' },
                    { explanation: 'Коэффициент при x²: {answer}' },
                ],
            },
            3: {
                template: 'Упростите: {a}x² − {b}x + {c} + {d}x² + {e}x − {f}. Найдите свободный член.',
                parameters: {
                    a: { type: 'int', min: 1, max: 6 },
                    b: { type: 'int', min: 1, max: 8 },
                    c: { type: 'int', min: 5, max: 20 },
                    d: { type: 'int', min: 1, max: 5 },
                    e: { type: 'int', min: 1, max: 8 },
                    f: { type: 'int', min: 1, max: 10 },
                },
                constraints: ['c > f'],
                answer_formula: 'c - f',
                hint: 'Свободные члены: {c} − {f}.',
                solution: [
                    { explanation: 'Приводим свободные члены: {c} − {f} = {answer}' },
                ],
            },
        },
    },

    // ===== GRADE 7 - Function Value (Значение функции) =====
    {
        id: 'grade7-func-value',
        class: 7,
        subject: 'algebra',
        section: 'Линейные функции',
        topic: 'funcValue',
        topic_title: 'Вычисление значения функции',
        problemType: 'numeric',
        relatedModule: 'linear-function',
        skills: ['linear_function'],
        difficulties: {
            1: {
                template: 'Функция y = {k}x. Найдите y при x = {x}.',
                parameters: {
                    k: { type: 'int', min: 2, max: 9 },
                    x: { type: 'int', min: 1, max: 9 },
                },
                answer_formula: 'k * x',
                hint: 'Подставьте x = {x}: y = {k} · {x}.',
                solution: [
                    { explanation: 'y = {k} · {x} = {answer}' },
                ],
            },
            2: {
                template: 'Функция y = {k}x + {b}. Найдите y при x = {x}.',
                parameters: {
                    k: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: -9, max: 9 },
                    x: { type: 'int', min: 1, max: 9 },
                },
                answer_formula: 'k * x + b',
                hint: 'Подставьте x = {x}: y = {k} · {x} + ({b}).',
                solution: [
                    { explanation: 'y = {k} · {x} + ({b}) = {k * x} + ({b}) = {answer}' },
                ],
            },
            3: {
                template: 'Функция y = {k}x + {b}. При каком x значение y = {y}?',
                parameters: {
                    k: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: -9, max: 9 },
                    x: { type: 'int', min: 1, max: 9 },
                    y: { type: 'expression', value: 'k * x + b' },
                },
                answer_formula: 'x',
                hint: 'Из {k}x + ({b}) = {y} → x = ({y} − ({b})) ÷ {k}.',
                solution: [
                    { explanation: '{k}x = {y} − ({b})' },
                    { explanation: 'x = {answer}' },
                ],
            },
        },
    },
    // =========================================================================
    // ===== GRADE 7 - MISSING TOPIC TEMPLATES =================================
    // =========================================================================

    // ── Степени ──────────────────────────────────────────────────────────────

    {
        id: 'grade7-product-of-powers',
        class: 7,
        subject: 'algebra',
        section: 'Степени и одночлены',
        topic: 'productOfPowers',
        topic_title: 'Произведение степеней',
        problemType: 'numeric',
        skills: ['powers'],
        difficulties: {
            1: {
                template: 'Упростите: a^{e1} · a^{e2} = a^?. Найдите показатель.',
                parameters: {
                    e1: { type: 'int', min: 2, max: 5 },
                    e2: { type: 'int', min: 2, max: 5 },
                },
                answer_formula: 'e1 + e2',
                hint: 'a^m · a^n = a^(m+n) — показатели складываются.',
                solution: [
                    { explanation: 'При умножении степеней с одинаковым основанием показатели складываются.' },
                    { explanation: '{e1} + {e2} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'e1 * e2', feedback: 'Показатели складываются, а не перемножаются.' },
                ],
            },
            2: {
                template: 'Вычислите: 2^{e1} · 2^{e2} = ?',
                parameters: {
                    e1: { type: 'int', min: 1, max: 4 },
                    e2: { type: 'int', min: 1, max: 4 },
                },
                answer_formula: 'Math.pow(2, e1 + e2)',
                hint: '2^{e1} · 2^{e2} = 2^({e1}+{e2}). Затем вычислите 2^{e1+e2}.',
                solution: [
                    { explanation: '2^{e1} · 2^{e2} = 2^{e1 + e2}' },
                    { explanation: 'Вычисляем: {answer}' },
                ],
            },
            3: {
                template: 'Упростите: x^{e1} · x^{e2} · x^{e3} = x^?. Найдите показатель.',
                parameters: {
                    e1: { type: 'int', min: 1, max: 4 },
                    e2: { type: 'int', min: 1, max: 4 },
                    e3: { type: 'int', min: 1, max: 4 },
                },
                answer_formula: 'e1 + e2 + e3',
                hint: 'Складываем все три показателя: {e1} + {e2} + {e3}.',
                solution: [
                    { explanation: 'x^{e1} · x^{e2} · x^{e3} = x^({e1}+{e2}+{e3}) = x^{answer}' },
                ],
            },
        },
    },

    {
        id: 'grade7-power-of-power',
        class: 7,
        subject: 'algebra',
        section: 'Степени и одночлены',
        topic: 'powerOfPower',
        topic_title: 'Степень степени',
        problemType: 'numeric',
        skills: ['powers'],
        difficulties: {
            1: {
                template: 'Упростите: (a^{e1})^{e2} = a^?. Найдите показатель.',
                parameters: {
                    e1: { type: 'int', min: 2, max: 5 },
                    e2: { type: 'int', min: 2, max: 4 },
                },
                answer_formula: 'e1 * e2',
                hint: '(a^m)^n = a^(m·n) — показатели перемножаются.',
                solution: [
                    { explanation: 'При возведении степени в степень показатели перемножаются.' },
                    { explanation: '{e1} × {e2} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'e1 + e2', feedback: 'При возведении степени в степень показатели перемножаются, а не складываются.' },
                ],
            },
            2: {
                template: 'Вычислите: (2^{e1})^{e2} = ?',
                parameters: {
                    e1: { type: 'int', min: 2, max: 3 },
                    e2: { type: 'int', min: 2, max: 3 },
                },
                answer_formula: 'Math.pow(2, e1 * e2)',
                hint: '(2^{e1})^{e2} = 2^({e1}×{e2}) = 2^{e1*e2}.',
                solution: [
                    { explanation: '(2^{e1})^{e2} = 2^{e1 * e2} = {answer}' },
                ],
            },
            3: {
                template: 'Упростите: ((a^{e1})^{e2})^{e3} = a^?. Найдите показатель.',
                parameters: {
                    e1: { type: 'int', min: 2, max: 3 },
                    e2: { type: 'int', min: 2, max: 3 },
                    e3: { type: 'int', min: 2, max: 3 },
                },
                answer_formula: 'e1 * e2 * e3',
                hint: 'Применяем правило дважды: сначала e1 × e2, затем × e3.',
                solution: [
                    { explanation: '((a^{e1})^{e2})^{e3} = a^({e1}×{e2}×{e3}) = a^{answer}' },
                ],
            },
        },
    },

    {
        id: 'grade7-division-of-powers',
        class: 7,
        subject: 'algebra',
        section: 'Степени и одночлены',
        topic: 'divisionOfPowers',
        topic_title: 'Деление степеней',
        problemType: 'numeric',
        skills: ['powers'],
        difficulties: {
            1: {
                template: 'Упростите: a^{e1} ÷ a^{e2} = a^?. Найдите показатель.',
                parameters: {
                    e2: { type: 'int', min: 2, max: 4 },
                    diff: { type: 'int', min: 1, max: 4 },
                    e1: { type: 'expression', value: 'e2 + diff' },
                },
                answer_formula: 'e1 - e2',
                hint: 'a^m ÷ a^n = a^(m−n) — показатели вычитаются.',
                solution: [
                    { explanation: 'При делении степеней с одинаковым основанием показатели вычитаются.' },
                    { explanation: '{e1} − {e2} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'e1 + e2', feedback: 'При делении показатели вычитаются: {e1} − {e2}.' },
                ],
            },
            2: {
                template: 'Вычислите: 3^{e1} ÷ 3^{e2} = ?',
                parameters: {
                    e2: { type: 'int', min: 1, max: 3 },
                    diff: { type: 'int', min: 1, max: 2 },
                    e1: { type: 'expression', value: 'e2 + diff' },
                },
                answer_formula: 'Math.pow(3, e1 - e2)',
                hint: '3^{e1} ÷ 3^{e2} = 3^({e1}−{e2}) = 3^{e1-e2}.',
                solution: [
                    { explanation: '3^{e1} ÷ 3^{e2} = 3^{e1 - e2} = {answer}' },
                ],
            },
            3: {
                template: 'Упростите: x^{e1} ÷ x^{e2} · x^{e3} = x^?. Найдите показатель.',
                parameters: {
                    e2: { type: 'int', min: 2, max: 4 },
                    diff: { type: 'int', min: 2, max: 4 },
                    e1: { type: 'expression', value: 'e2 + diff' },
                    e3: { type: 'int', min: 1, max: 3 },
                },
                answer_formula: 'e1 - e2 + e3',
                hint: 'Считаем слева направо: (x^{e1} ÷ x^{e2}) · x^{e3} = x^({e1}−{e2}) · x^{e3}.',
                solution: [
                    { explanation: 'x^{e1} ÷ x^{e2} = x^{e1-e2}' },
                    { explanation: 'x^{e1-e2} · x^{e3} = x^{e1-e2+e3} = x^{answer}' },
                ],
            },
        },
    },

    // ── Одночлены ─────────────────────────────────────────────────────────────

    {
        id: 'grade7-monomial-multiply',
        class: 7,
        subject: 'algebra',
        section: 'Степени и одночлены',
        topic: 'monomialMultiply',
        topic_title: 'Умножение одночленов',
        problemType: 'numeric',
        skills: ['monomials', 'powers'],
        difficulties: {
            1: {
                template: '{a}x² · {b}x³ = ?·x⁵. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 2, max: 9 },
                },
                answer_formula: 'a * b',
                hint: 'Коэффициенты перемножаем: {a} · {b}. Степени складываем: x² · x³ = x⁵.',
                solution: [
                    { explanation: 'Коэффициент: {a} × {b} = {answer}' },
                    { explanation: 'Буквенная часть: x² · x³ = x⁵' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Коэффициенты перемножаются, а не складываются.' },
                ],
            },
            2: {
                template: '{a}x^{e1} · {b}x^{e2} = ?·x^k. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 2, max: 9 },
                    e1: { type: 'int', min: 2, max: 4 },
                    e2: { type: 'int', min: 2, max: 4 },
                },
                answer_formula: 'a * b',
                hint: 'Коэффициент = {a} · {b}. Показатель k = {e1} + {e2}.',
            },
            3: {
                template: '{a}x^{e1}y · {b}xy^{e2} = ?·x^p·y^q. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 7 },
                    b: { type: 'int', min: 2, max: 7 },
                    e1: { type: 'int', min: 2, max: 4 },
                    e2: { type: 'int', min: 2, max: 4 },
                },
                answer_formula: 'a * b',
                hint: 'Перемножаем числовые части, складываем показатели каждой переменной.',
                solution: [
                    { explanation: 'Коэффициент: {a} × {b} = {answer}' },
                    { explanation: 'Степень x: {e1} + 1 = {e1+1}' },
                    { explanation: 'Степень y: 1 + {e2} = {e2+1}' },
                ],
            },
        },
    },

    {
        id: 'grade7-monomial-power',
        class: 7,
        subject: 'algebra',
        section: 'Степени и одночлены',
        topic: 'monomialPower',
        topic_title: 'Степень одночлена',
        problemType: 'numeric',
        skills: ['monomials', 'powers'],
        difficulties: {
            1: {
                template: '({a}x)² = ?·x². Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                },
                answer_formula: 'a * a',
                hint: '({a}x)² = {a}² · x² = ? · x². Возведите коэффициент в квадрат.',
                solution: [
                    { explanation: '({a}x)² = {a}² · x²' },
                    { explanation: '{a}² = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a * 2', feedback: 'Нужно возвести коэффициент в квадрат: {a}² = {a*a}, а не {a}·2.' },
                ],
            },
            2: {
                template: '({a}x^{e})² = ?·x^k. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 6 },
                    e: { type: 'int', min: 2, max: 4 },
                },
                answer_formula: 'a * a',
                hint: '({a}x^{e})² = {a}² · x^({e}·2). Коэффициент: {a}².',
                solution: [
                    { explanation: '({a}x^{e})² = {a}² · x^{2*e}' },
                    { explanation: 'Коэффициент = {a}² = {answer}' },
                ],
            },
            3: {
                template: '({a}x^{e1}y^{e2})³ = ?·x^p·y^q. Найдите коэффициент.',
                parameters: {
                    a: { type: 'int', min: 2, max: 4 },
                    e1: { type: 'int', min: 1, max: 3 },
                    e2: { type: 'int', min: 1, max: 3 },
                },
                answer_formula: 'a * a * a',
                hint: '({a}·...)³: коэффициент = {a}³.',
                solution: [
                    { explanation: 'Возводим коэффициент: {a}³ = {answer}' },
                    { explanation: 'Степень x: {e1} · 3 = {e1*3}' },
                    { explanation: 'Степень y: {e2} · 3 = {e2*3}' },
                ],
            },
        },
    },

    // ── Многочлены ────────────────────────────────────────────────────────────

    {
        id: 'grade7-poly-addition',
        class: 7,
        subject: 'algebra',
        section: 'Многочлены',
        topic: 'polyAddition',
        topic_title: 'Сложение многочленов',
        problemType: 'numeric',
        skills: ['polynomials', 'like_terms'],
        difficulties: {
            1: {
                template: '({a}x + {b}) + ({c}x + {d}) = ?·x + k. Найдите коэффициент при x.',
                parameters: {
                    a: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: 1, max: 9 },
                    c: { type: 'int', min: 1, max: 9 },
                    d: { type: 'int', min: 1, max: 9 },
                },
                answer_formula: 'a + c',
                hint: 'Складываем коэффициенты при x: {a} + {c}.',
                solution: [
                    { explanation: 'Группируем подобные слагаемые:' },
                    { explanation: 'При x: {a} + {c} = {answer}' },
                    { explanation: 'Свободные: {b} + {d}' },
                ],
            },
            2: {
                template: '({a}x² + {b}x) + ({c}x² + {d}x + {e}) = ?·x² + ... Найдите коэффициент при x².',
                parameters: {
                    a: { type: 'int', min: 1, max: 8 },
                    b: { type: 'int', min: 1, max: 8 },
                    c: { type: 'int', min: 1, max: 8 },
                    d: { type: 'int', min: 1, max: 8 },
                    e: { type: 'int', min: 1, max: 9 },
                },
                answer_formula: 'a + c',
                hint: 'Коэффициент при x²: {a} + {c}.',
                solution: [
                    { explanation: 'Коэффициент при x²: {a} + {c} = {answer}' },
                ],
            },
            3: {
                template: 'Найдите сумму свободных членов: ({a}x² + {b}x + {c}) + ({d}x² − {e}x + {f}).',
                parameters: {
                    a: { type: 'int', min: 1, max: 6 },
                    b: { type: 'int', min: 1, max: 8 },
                    c: { type: 'int', min: 1, max: 15 },
                    d: { type: 'int', min: 1, max: 6 },
                    e: { type: 'int', min: 1, max: 8 },
                    f: { type: 'int', min: 1, max: 15 },
                },
                answer_formula: 'c + f',
                hint: 'Свободные члены: {c} + {f}.',
            },
        },
    },

    {
        id: 'grade7-poly-subtraction',
        class: 7,
        subject: 'algebra',
        section: 'Многочлены',
        topic: 'polySubtraction',
        topic_title: 'Вычитание многочленов',
        problemType: 'numeric',
        skills: ['polynomials', 'like_terms'],
        difficulties: {
            1: {
                template: '({a}x + {b}) − ({c}x + {d}) = ?·x + k. Найдите коэффициент при x.',
                parameters: {
                    c: { type: 'int', min: 1, max: 5 },
                    extra: { type: 'int', min: 1, max: 4 },
                    a: { type: 'expression', value: 'c + extra' },
                    b: { type: 'int', min: 1, max: 9 },
                    d: { type: 'int', min: 1, max: 9 },
                },
                answer_formula: 'a - c',
                hint: 'При вычитании меняем знаки у всех членов вычитаемого. Коэффициент при x: {a} − {c}.',
                solution: [
                    { explanation: 'Раскрываем скобки: − ({c}x + {d}) = −{c}x − {d}' },
                    { explanation: 'Коэффициент при x: {a} − {c} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a + c', feedback: 'При вычитании знак меняется: {a}x − {c}x = {a-c}x.' },
                ],
            },
            2: {
                template: '({a}x² + {b}x + {c}) − ({d}x² + {e}x) = ?·x² + ... Найдите коэффициент при x².',
                parameters: {
                    d: { type: 'int', min: 1, max: 5 },
                    extra: { type: 'int', min: 1, max: 4 },
                    a: { type: 'expression', value: 'd + extra' },
                    b: { type: 'int', min: 1, max: 9 },
                    c: { type: 'int', min: 1, max: 9 },
                    e: { type: 'int', min: 1, max: 9 },
                },
                answer_formula: 'a - d',
                hint: 'При вычитании знаки вычитаемого меняются: {a}x² − {d}x².',
                solution: [
                    { explanation: 'Раскрываем скобку: −({d}x² + {e}x) = −{d}x² − {e}x' },
                    { explanation: 'Коэффициент при x²: {a} − {d} = {answer}' },
                ],
            },
            3: {
                template: 'Найдите свободный член: ({a}x² + {b}x + {c}) − ({d}x² + {e}x + {f}).',
                parameters: {
                    a: { type: 'int', min: 1, max: 6 },
                    b: { type: 'int', min: 1, max: 8 },
                    f: { type: 'int', min: 1, max: 8 },
                    extra: { type: 'int', min: 1, max: 7 },
                    c: { type: 'expression', value: 'f + extra' },
                    d: { type: 'int', min: 1, max: 5 },
                    e: { type: 'int', min: 1, max: 8 },
                },
                answer_formula: 'c - f',
                hint: 'Свободный член: {c} − {f}.',
                solution: [
                    { explanation: 'Свободный член: {c} − {f} = {answer}' },
                ],
            },
        },
    },

    {
        id: 'grade7-poly-multiply',
        class: 7,
        subject: 'algebra',
        section: 'Многочлены',
        topic: 'polyMultiply',
        topic_title: 'Умножение одночлена на многочлен',
        problemType: 'numeric',
        skills: ['polynomials', 'monomials'],
        difficulties: {
            1: {
                template: '{k}({a}x + {b}) = ?·x + {k*b}. Найдите коэффициент при x.',
                parameters: {
                    k: { type: 'int', min: 2, max: 8 },
                    a: { type: 'int', min: 2, max: 8 },
                    b: { type: 'int', min: 1, max: 8 },
                },
                answer_formula: 'k * a',
                hint: 'Умножаем {k} на каждый член скобки: {k}·{a}x и {k}·{b}.',
                solution: [
                    { explanation: '{k} · {a}x = {answer}x' },
                    { explanation: '{k} · {b} = {k*b}' },
                ],
                common_mistakes: [
                    { pattern: 'k + a', feedback: 'Нужно умножать: {k} · {a} = {k*a}.' },
                ],
            },
            2: {
                template: '{k}x({a}x + {b}) = ?·x² + {k*b}x. Найдите коэффициент при x².',
                parameters: {
                    k: { type: 'int', min: 2, max: 6 },
                    a: { type: 'int', min: 2, max: 8 },
                    b: { type: 'int', min: 1, max: 8 },
                },
                answer_formula: 'k * a',
                hint: '{k}x · {a}x = {k}·{a}·x² = ?x².',
                solution: [
                    { explanation: '{k}x · {a}x = {k*a}x²' },
                    { explanation: '{k}x · {b} = {k*b}x' },
                ],
            },
            3: {
                template: '{k}x({a}x² + {b}x − {c}) = ?·x³ + ... Найдите коэффициент при x³.',
                parameters: {
                    k: { type: 'int', min: 2, max: 5 },
                    a: { type: 'int', min: 2, max: 6 },
                    b: { type: 'int', min: 1, max: 8 },
                    c: { type: 'int', min: 1, max: 8 },
                },
                answer_formula: 'k * a',
                hint: '{k}x · {a}x² = {k}·{a}·x³.',
                solution: [
                    { explanation: '{k}x · {a}x² = {k*a}x³ → коэффициент: {answer}' },
                ],
            },
        },
    },

    // ── Формулы сокращённого умножения ───────────────────────────────────────

    {
        id: 'grade7-square-of-sum',
        class: 7,
        subject: 'algebra',
        section: 'Многочлены',
        topic: 'squareOfSum',
        topic_title: 'Квадрат суммы',
        problemType: 'numeric',
        skills: ['factoring', 'square_of_sum'],
        difficulties: {
            1: {
                template: '({a} + {b})² = {a2} + ? + {b2}. Найдите среднее слагаемое.',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 2, max: 9 },
                    a2: { type: 'expression', value: 'a * a' },
                    b2: { type: 'expression', value: 'b * b' },
                },
                answer_formula: '2 * a * b',
                hint: '(a + b)² = a² + 2ab + b². Среднее слагаемое: 2·{a}·{b}.',
                solution: [
                    { explanation: '(a + b)² = a² + 2ab + b²' },
                    { explanation: '2 · {a} · {b} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a * b', feedback: 'Не забудьте умножить на 2: 2ab = 2 · {a} · {b} = {2*a*b}.' },
                ],
            },
            2: {
                template: 'Раскройте скобки: ({a} + {b})² = ?',
                parameters: {
                    a: { type: 'int', min: 3, max: 12 },
                    b: { type: 'int', min: 2, max: 9 },
                },
                answer_formula: 'a * a + 2 * a * b + b * b',
                hint: '(a + b)² = a² + 2ab + b² = {a}² + 2·{a}·{b} + {b}².',
                solution: [
                    { explanation: '{a}² + 2·{a}·{b} + {b}² = {a*a} + {2*a*b} + {b*b} = {answer}' },
                ],
            },
            3: {
                template: 'Вычислите удобным способом: {a}² + 2·{a}·{b} + {b}² = ?',
                parameters: {
                    a: { type: 'int', min: 5, max: 15 },
                    b: { type: 'int', min: 2, max: 8 },
                },
                answer_formula: '(a + b) * (a + b)',
                hint: 'Это (a + b)² = ({a} + {b})².',
                solution: [
                    { explanation: 'Узнаём формулу: a² + 2ab + b² = (a + b)²' },
                    { explanation: '({a} + {b})² = {a+b}² = {answer}' },
                ],
            },
        },
    },

    {
        id: 'grade7-square-of-diff',
        class: 7,
        subject: 'algebra',
        section: 'Многочлены',
        topic: 'squareOfDiff',
        topic_title: 'Квадрат разности',
        problemType: 'numeric',
        skills: ['factoring', 'square_of_diff'],
        difficulties: {
            1: {
                template: '({a} − {b})² = {a2} − ? + {b2}. Найдите среднее слагаемое (модуль).',
                parameters: {
                    b: { type: 'int', min: 2, max: 9 },
                    extra: { type: 'int', min: 1, max: 8 },
                    a: { type: 'expression', value: 'b + extra' },
                    a2: { type: 'expression', value: 'a * a' },
                    b2: { type: 'expression', value: 'b * b' },
                },
                answer_formula: '2 * a * b',
                hint: '(a − b)² = a² − 2ab + b². Среднее слагаемое: 2·{a}·{b}.',
                solution: [
                    { explanation: '(a − b)² = a² − 2ab + b²' },
                    { explanation: '2 · {a} · {b} = {answer}' },
                ],
            },
            2: {
                template: 'Раскройте скобки: ({a} − {b})² = ?',
                parameters: {
                    b: { type: 'int', min: 2, max: 9 },
                    extra: { type: 'int', min: 1, max: 10 },
                    a: { type: 'expression', value: 'b + extra' },
                },
                answer_formula: '(a - b) * (a - b)',
                hint: '(a − b)² = a² − 2ab + b².',
                solution: [
                    { explanation: '{a}² − 2·{a}·{b} + {b}² = {a*a} − {2*a*b} + {b*b} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a * a - b * b', feedback: 'Это разность квадратов (a−b)(a+b). Квадрат разности = a² − 2ab + b².' },
                ],
            },
            3: {
                template: 'Вычислите: {a2} − {twoab} + {b2} = ? (применив формулу квадрата разности).',
                parameters: {
                    b: { type: 'int', min: 2, max: 8 },
                    extra: { type: 'int', min: 1, max: 7 },
                    a: { type: 'expression', value: 'b + extra' },
                    a2: { type: 'expression', value: 'a * a' },
                    b2: { type: 'expression', value: 'b * b' },
                    twoab: { type: 'expression', value: '2 * a * b' },
                },
                answer_formula: '(a - b) * (a - b)',
                hint: 'Узнаём формулу: a² − 2ab + b² = (a − b)².',
                solution: [
                    { explanation: 'a² − 2ab + b² = (a − b)²' },
                    { explanation: '({a} − {b})² = {a-b}² = {answer}' },
                ],
            },
        },
    },

    {
        id: 'grade7-diff-of-squares',
        class: 7,
        subject: 'algebra',
        section: 'Многочлены',
        topic: 'diffOfSquares',
        topic_title: 'Разность квадратов',
        problemType: 'numeric',
        skills: ['factoring', 'difference_of_squares'],
        difficulties: {
            1: {
                template: '({a} + {b})({a} − {b}) = ?',
                parameters: {
                    b: { type: 'int', min: 2, max: 9 },
                    extra: { type: 'int', min: 1, max: 10 },
                    a: { type: 'expression', value: 'b + extra' },
                },
                answer_formula: 'a * a - b * b',
                hint: '(a + b)(a − b) = a² − b².',
                solution: [
                    { explanation: '(a + b)(a − b) = a² − b²' },
                    { explanation: '{a}² − {b}² = {a*a} − {b*b} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: '(a - b) * (a - b)', feedback: 'Это (a−b)². Здесь разность квадратов: (a+b)(a−b) = a²−b².' },
                ],
            },
            2: {
                template: 'Вычислите, используя ФСУ: {a2} − {b2} = ? (разложите на множители и вычислите).',
                parameters: {
                    b: { type: 'int', min: 3, max: 10 },
                    extra: { type: 'int', min: 2, max: 8 },
                    a: { type: 'expression', value: 'b + extra' },
                    a2: { type: 'expression', value: 'a * a' },
                    b2: { type: 'expression', value: 'b * b' },
                },
                answer_formula: '(a + b) * (a - b)',
                hint: 'a² − b² = (a + b)(a − b) = ({a}+{b})({a}−{b}).',
                solution: [
                    { explanation: '{a2} − {b2} = ({a} + {b})({a} − {b})' },
                    { explanation: '= {a+b} · {a-b} = {answer}' },
                ],
            },
            3: {
                template: 'Вычислите удобным способом: {n1} · {n2} = ? (используйте разность квадратов).',
                parameters: {
                    mid: { type: 'int', min: 10, max: 30 },
                    delta: { type: 'int', min: 1, max: 4 },
                    n1: { type: 'expression', value: 'mid + delta' },
                    n2: { type: 'expression', value: 'mid - delta' },
                },
                answer_formula: 'mid * mid - delta * delta',
                hint: '{n1} · {n2} = ({mid}+{delta})({mid}−{delta}) = {mid}² − {delta}².',
                solution: [
                    { explanation: '{n1} · {n2} = ({mid}+{delta})({mid}−{delta}) = {mid}² − {delta}²' },
                    { explanation: '{mid*mid} − {delta*delta} = {answer}' },
                ],
            },
        },
    },

    {
        id: 'grade7-factoring-apply',
        class: 7,
        subject: 'algebra',
        section: 'Многочлены',
        topic: 'factoringApply',
        topic_title: 'Применение формул сокращённого умножения',
        problemType: 'numeric',
        skills: ['factoring'],
        difficulties: {
            1: {
                template: 'Вычислите удобным способом: {a}² − {b}² = ?',
                parameters: {
                    b: { type: 'int', min: 3, max: 15 },
                    extra: { type: 'int', min: 2, max: 8 },
                    a: { type: 'expression', value: 'b + extra' },
                },
                answer_formula: 'a * a - b * b',
                hint: 'a² − b² = (a+b)(a−b) = ({a}+{b})({a}−{b}).',
                solution: [
                    { explanation: '({a}+{b})·({a}−{b}) = {a+b}·{a-b} = {answer}' },
                ],
            },
            2: {
                template: 'Вычислите: ({a} + {b})² − ({a} − {b})² = ?',
                parameters: {
                    a: { type: 'int', min: 2, max: 8 },
                    b: { type: 'int', min: 2, max: 8 },
                },
                answer_formula: '4 * a * b',
                hint: 'Раскройте каждый квадрат и вычтите: (a²+2ab+b²) − (a²−2ab+b²) = 4ab.',
                solution: [
                    { explanation: '(a+b)² = a² + 2ab + b²' },
                    { explanation: '(a−b)² = a² − 2ab + b²' },
                    { explanation: 'Разность: (a²+2ab+b²) − (a²−2ab+b²) = 4ab = 4·{a}·{b} = {answer}' },
                ],
            },
            3: {
                template: 'Вычислите: ({a} + {b})² + ({a} − {b})² = ?',
                parameters: {
                    a: { type: 'int', min: 2, max: 8 },
                    b: { type: 'int', min: 2, max: 8 },
                },
                answer_formula: '2 * a * a + 2 * b * b',
                hint: 'Раскройте оба квадрата и сложите.',
                solution: [
                    { explanation: '(a+b)² + (a−b)² = (a²+2ab+b²) + (a²−2ab+b²)' },
                    { explanation: '= 2a² + 2b² = 2·{a*a} + 2·{b*b} = {answer}' },
                ],
            },
        },
    },

    // ── Линейные уравнения ────────────────────────────────────────────────────

    {
        id: 'grade7-linear-eq-simple',
        class: 7,
        subject: 'algebra',
        section: 'Линейные уравнения',
        topic: 'linearEqSimple',
        topic_title: 'Простые уравнения (ax + b = c)',
        problemType: 'numeric',
        skills: ['linear_equations'],
        difficulties: {
            1: {
                template: 'Решите: x + {b} = {c}',
                parameters: {
                    b: { type: 'int', min: 3, max: 15 },
                    x: { type: 'int', min: 1, max: 20 },
                    c: { type: 'expression', value: 'x + b' },
                },
                answer_formula: 'x',
                hint: 'Перенесите {b} вправо: x = {c} − {b}.',
                solution: [
                    { explanation: 'x = {c} − {b} = {answer}' },
                ],
            },
            2: {
                template: 'Решите: {a}x + {b} = {c}',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    x: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: 1, max: 15 },
                    c: { type: 'expression', value: 'a * x + b' },
                },
                answer_formula: 'x',
                hint: '{a}x = {c} − {b}, x = ({c}−{b}) ÷ {a}.',
                solution: [
                    { explanation: '{a}x = {c} − {b} = {c - b}' },
                    { explanation: 'x = {c - b} ÷ {a} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'c / a', feedback: 'Сначала вычтите {b}: {a}x = {c} − {b}.' },
                ],
            },
            3: {
                template: 'Решите: {a}x − {b} = {c}',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    x: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 1, max: 15 },
                    c: { type: 'expression', value: 'a * x - b' },
                },
                constraints: ['c > 0'],
                answer_formula: 'x',
                hint: '{a}x = {c} + {b}, x = ({c}+{b}) ÷ {a}.',
                solution: [
                    { explanation: '{a}x = {c} + {b} = {c + b}' },
                    { explanation: 'x = {c + b} ÷ {a} = {answer}' },
                ],
            },
        },
    },

    {
        id: 'grade7-linear-eq-transpose',
        class: 7,
        subject: 'algebra',
        section: 'Линейные уравнения',
        topic: 'linearEqTranspose',
        topic_title: 'Перенос членов',
        problemType: 'numeric',
        skills: ['linear_equations'],
        difficulties: {
            1: {
                template: 'Решите: {a}x + {b} = {c}x + {d}. Найдите x.',
                parameters: {
                    c: { type: 'int', min: 1, max: 4 },
                    diff: { type: 'int', min: 1, max: 4 },
                    a: { type: 'expression', value: 'c + diff' },
                    x: { type: 'int', min: 1, max: 9 },
                    d: { type: 'int', min: 1, max: 15 },
                    b: { type: 'expression', value: 'c * x + d - diff * x' },
                },
                constraints: ['b > 0', 'd > b'],
                answer_formula: 'x',
                hint: 'Переносим x-члены влево, числа вправо: {a}x − {c}x = {d} − {b}.',
                solution: [
                    { explanation: '{a}x − {c}x = {d} − {b}' },
                    { explanation: '{diff}x = {d - b}' },
                    { explanation: 'x = {answer}' },
                ],
                common_mistakes: [
                    { pattern: '(d - b) / a', feedback: 'Нужно сначала собрать x: ({a}−{c})x = {d}−{b}.' },
                ],
            },
            2: {
                template: 'Решите: {a}x − {b} = {c} − {d}x. Найдите x.',
                parameters: {
                    d: { type: 'int', min: 1, max: 4 },
                    extra: { type: 'int', min: 1, max: 4 },
                    a: { type: 'expression', value: 'd + extra' },
                    x: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: 1, max: 10 },
                    c: { type: 'expression', value: 'a * x - b - d * x' },
                },
                constraints: ['c > 0'],
                answer_formula: 'x',
                hint: 'Переносим: {a}x + {d}x = {c} + {b}.',
                solution: [
                    { explanation: '{a}x + {d}x = {c} + {b}' },
                    { explanation: '{a+d}x = {c + b}' },
                    { explanation: 'x = {answer}' },
                ],
            },
            3: {
                template: 'Решите: {a}x + {b} = {c}x − {d}. Найдите x.',
                parameters: {
                    a: { type: 'int', min: 1, max: 4 },
                    extra: { type: 'int', min: 1, max: 4 },
                    c: { type: 'expression', value: 'a + extra' },
                    x: { type: 'int', min: 1, max: 9 },
                    d: { type: 'int', min: 1, max: 10 },
                    b: { type: 'expression', value: 'c * x - d - a * x' },
                },
                constraints: ['b > 0'],
                answer_formula: 'x',
                hint: 'Переносим: {a}x − {c}x = −{d} − {b}.',
                solution: [
                    { explanation: '{a}x − {c}x = −{d} − {b}' },
                    { explanation: '−{extra}x = −{d + b}' },
                    { explanation: 'x = {d + b} ÷ {extra} = {answer}' },
                ],
            },
        },
    },

    {
        id: 'grade7-linear-eq-brackets',
        class: 7,
        subject: 'algebra',
        section: 'Линейные уравнения',
        topic: 'linearEqBrackets',
        topic_title: 'Уравнения со скобками',
        problemType: 'numeric',
        skills: ['linear_equations', 'brackets_expansion'],
        difficulties: {
            1: {
                template: 'Решите: {a}(x + {b}) = {rhs}',
                parameters: {
                    a: { type: 'int', min: 2, max: 6 },
                    b: { type: 'int', min: 1, max: 8 },
                    x: { type: 'int', min: 1, max: 9 },
                    rhs: { type: 'expression', value: 'a * (x + b)' },
                },
                answer_formula: 'x',
                hint: 'Раскройте скобки: {a}x + {a*b} = {rhs}.',
                solution: [
                    { explanation: '{a}x + {a * b} = {rhs}' },
                    { explanation: '{a}x = {rhs - a * b}' },
                    { explanation: 'x = {answer}' },
                ],
            },
            2: {
                template: 'Решите: {a}(x − {b}) + {c} = {rhs}',
                parameters: {
                    a: { type: 'int', min: 2, max: 5 },
                    b: { type: 'int', min: 1, max: 6 },
                    c: { type: 'int', min: 1, max: 10 },
                    x: { type: 'int', min: 2, max: 9 },
                    rhs: { type: 'expression', value: 'a * (x - b) + c' },
                },
                answer_formula: 'x',
                hint: 'Раскройте скобки: {a}x − {a*b} + {c} = {rhs}.',
                solution: [
                    { explanation: '{a}x − {a * b} + {c} = {rhs}' },
                    { explanation: '{a}x = {rhs} + {a * b} − {c}' },
                    { explanation: 'x = {answer}' },
                ],
            },
            3: {
                template: 'Решите: {a}(x + {b}) = {c}(x + {d})',
                parameters: {
                    c: { type: 'int', min: 1, max: 4 },
                    extra: { type: 'int', min: 1, max: 4 },
                    a: { type: 'expression', value: 'c + extra' },
                    x: { type: 'int', min: 1, max: 8 },
                    d: { type: 'int', min: 1, max: 8 },
                    b: { type: 'expression', value: 'c * x + c * d - a * x' },
                },
                constraints: ['b > 0'],
                answer_formula: 'x',
                hint: 'Раскрываем обе скобки: {a}x + {a}·{b} = {c}x + {c}·{d}.',
                solution: [
                    { explanation: 'Раскрываем: {a}x + {a * b} = {c}x + {c * d}' },
                    { explanation: '{extra}x = {c * d} − {a * b}' },
                    { explanation: 'x = {answer}' },
                ],
            },
        },
    },

    // ── Линейная функция ──────────────────────────────────────────────────────

    {
        id: 'grade7-func-coefficients',
        class: 7,
        subject: 'algebra',
        section: 'Линейные функции',
        topic: 'funcCoefficients',
        topic_title: 'Коэффициенты k и b',
        problemType: 'numeric',
        relatedModule: 'linear-function',
        skills: ['linear_function', 'slope'],
        difficulties: {
            1: {
                // определить угловой коэффициент по двум точкам
                template: 'Прямая проходит через (0; {b}) и ({x}; {y}). Найдите угловой коэффициент k.',
                parameters: {
                    k: { type: 'int', min: 1, max: 6 },
                    b: { type: 'int', min: -5, max: 5 },
                    x: { type: 'int', min: 1, max: 8 },
                    y: { type: 'expression', value: 'k * x + b' },
                },
                answer_formula: 'k',
                hint: 'k = (y − b) ÷ x = ({y} − ({b})) ÷ {x}.',
                solution: [
                    { explanation: 'k = ({y} − ({b})) ÷ {x} = {y - b} ÷ {x} = {answer}' },
                ],
            },
            2: {
                // определить b (свободный член) по k и точке
                template: 'Прямая y = {k}x + b проходит через точку ({x}; {y}). Найдите b.',
                parameters: {
                    k: { type: 'int', min: 1, max: 6 },
                    x: { type: 'int', min: 1, max: 8 },
                    b: { type: 'int', min: -8, max: 8 },
                    y: { type: 'expression', value: 'k * x + b' },
                },
                answer_formula: 'b',
                hint: 'Подставьте точку: {y} = {k} · {x} + b. Найдите b.',
                solution: [
                    { explanation: '{y} = {k} · {x} + b' },
                    { explanation: 'b = {y} − {k * x} = {answer}' },
                ],
            },
            3: {
                // определить k по двум точкам (общий случай)
                template: 'Прямая проходит через ({x1}; {y1}) и ({x2}; {y2}). Найдите k.',
                parameters: {
                    x1: { type: 'int', min: 1, max: 4 },
                    k: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: -5, max: 5 },
                    dx: { type: 'int', min: 2, max: 5 },
                    x2: { type: 'expression', value: 'x1 + dx' },
                    y1: { type: 'expression', value: 'k * x1 + b' },
                    y2: { type: 'expression', value: 'k * x2 + b' },
                },
                answer_formula: 'k',
                hint: 'k = (y₂ − y₁) ÷ (x₂ − x₁) = ({y2}−{y1}) ÷ ({x2}−{x1}).',
                solution: [
                    { explanation: 'k = ({y2} − {y1}) ÷ ({x2} − {x1}) = {y2-y1} ÷ {dx} = {answer}' },
                ],
            },
        },
    },

    // ── Системы уравнений ─────────────────────────────────────────────────────

    {
        id: 'grade7-systems-substitution',
        class: 7,
        subject: 'algebra',
        section: 'Системы уравнений',
        topic: 'systemsSubstitution',
        topic_title: 'Метод подстановки',
        problemType: 'numeric',
        skills: ['systems_of_equations', 'substitution'],
        difficulties: {
            1: {
                template: 'Система: y = {k}x + {b}, x = {a}. Найдите y.',
                parameters: {
                    k: { type: 'int', min: 1, max: 6 },
                    b: { type: 'int', min: 1, max: 9 },
                    a: { type: 'int', min: 1, max: 9 },
                },
                answer_formula: 'k * a + b',
                hint: 'Подставьте x = {a}: y = {k}·{a} + {b}.',
                solution: [
                    { explanation: 'y = {k} · {a} + {b} = {answer}' },
                ],
            },
            2: {
                template: 'Система: y = {k}x + {b}, {a}x + y = {rhs}. Найдите x.',
                parameters: {
                    k: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: 1, max: 6 },
                    a: { type: 'int', min: 1, max: 5 },
                    x: { type: 'int', min: 1, max: 8 },
                    rhs: { type: 'expression', value: 'a * x + k * x + b' },
                },
                answer_formula: 'x',
                hint: 'Подставляем y = {k}x + {b}: {a}x + {k}x + {b} = {rhs}.',
                solution: [
                    { explanation: '{a}x + ({k}x + {b}) = {rhs}' },
                    { explanation: '{a + k}x = {rhs - b}' },
                    { explanation: 'x = {answer}' },
                ],
            },
            3: {
                template: 'Система: y = {k}x − {b}, {a}x − y = {rhs}. Найдите x.',
                parameters: {
                    k: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: 1, max: 6 },
                    a: { type: 'int', min: 2, max: 6 },
                    x: { type: 'int', min: 2, max: 8 },
                    rhs: { type: 'expression', value: 'a * x - (k * x - b)' },
                },
                constraints: ['rhs > 0', 'a > k'],
                answer_formula: 'x',
                hint: 'Подставляем y = {k}x − {b}: {a}x − ({k}x − {b}) = {rhs}.',
                solution: [
                    { explanation: '{a}x − {k}x + {b} = {rhs}' },
                    { explanation: '{a - k}x = {rhs - b}' },
                    { explanation: 'x = {answer}' },
                ],
            },
        },
    },

    {
        id: 'grade7-systems-elimination',
        class: 7,
        subject: 'algebra',
        section: 'Системы уравнений',
        topic: 'systemsElimination',
        topic_title: 'Метод сложения',
        problemType: 'numeric',
        skills: ['systems_of_equations', 'elimination'],
        difficulties: {
            1: {
                // y сразу сокращается
                template: 'Система: {a}x + {b}y = {r1}, {c}x − {b}y = {r2}. Найдите x.',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: 1, max: 5 },
                    c: { type: 'int', min: 1, max: 5 },
                    x: { type: 'int', min: 1, max: 8 },
                    y: { type: 'int', min: 1, max: 8 },
                    r1: { type: 'expression', value: 'a * x + b * y' },
                    r2: { type: 'expression', value: 'c * x - b * y' },
                },
                constraints: ['r1 > 0', 'r2 > 0'],
                answer_formula: 'x',
                hint: 'Складываем уравнения — y сокращается: ({a}+{c})x = {r1}+{r2}.',
                solution: [
                    { explanation: 'Складываем: ({a}+{c})x = {r1}+{r2}' },
                    { explanation: '{a+c}x = {r1+r2}' },
                    { explanation: 'x = {answer}' },
                ],
            },
            2: {
                // находим y после нахождения x
                template: 'Система: {a}x + {b}y = {r1}, {a}x − {b}y = {r2}. Найдите y.',
                parameters: {
                    a: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: 1, max: 5 },
                    x: { type: 'int', min: 1, max: 8 },
                    y: { type: 'int', min: 1, max: 8 },
                    r1: { type: 'expression', value: 'a * x + b * y' },
                    r2: { type: 'expression', value: 'a * x - b * y' },
                },
                constraints: ['r1 > r2'],
                answer_formula: 'y',
                hint: 'Вычтем второе из первого: 2{b}y = {r1}−{r2}.',
                solution: [
                    { explanation: 'Вычитаем: 2{b}y = {r1} − {r2} = {r1-r2}' },
                    { explanation: 'y = {r1-r2} ÷ {2*b} = {answer}' },
                ],
            },
            3: {
                // умножение перед сложением
                template: 'Система: {a}x + {b}y = {r1}, {c}x + {d}y = {r2}. Найдите x (метод сложения).',
                parameters: {
                    a: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: 2, max: 5 },
                    c: { type: 'int', min: 1, max: 4 },
                    d: { type: 'expression', value: 'b' },
                    x: { type: 'int', min: 1, max: 6 },
                    y: { type: 'int', min: 1, max: 6 },
                    r1: { type: 'expression', value: 'a * x + b * y' },
                    r2: { type: 'expression', value: 'c * x + b * y' },
                },
                constraints: ['a !== c', 'r1 !== r2'],
                answer_formula: 'x',
                hint: 'Вычтем второе из первого — y сокращается: ({a}−{c})x = {r1}−{r2}.',
                solution: [
                    { explanation: 'Вычитаем второе из первого: ({a}−{c})x = {r1}−{r2}' },
                    { explanation: '{a-c}x = {r1-r2}' },
                    { explanation: 'x = {answer}' },
                ],
            },
        },
    },

    // ===== GRADE 8 - ALGEBRA: Квадратный трёхчлен =====
    {
        id: 'grade8-quadraticTrinomial-1',
        class: 8,
        subject: 'algebra',
        section: 'Квадратный трёхчлен',
        topic: 'quadraticTrinomial',
        topic_title: 'Квадратный трёхчлен',
        problemType: 'numeric',
        skills: ['quadratic', 'polynomials'],
        difficulties: {
            1: {
                template: 'Запишите коэффициенты a, b, c трёхчлена {a}x² + {b}x + {c}. Чему равен коэффициент b?',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -6, max: 6 },
                    c: { type: 'int', min: -6, max: 6 },
                },
                constraints: ['b !== 0'],
                answer_formula: 'b',
                hint: 'Коэффициент b стоит перед x в первой степени',
                solution: [
                    { explanation: 'В трёхчлене ax² + bx + c коэффициент b стоит при x¹' },
                    { explanation: 'Читаем коэффициент при x:', result: '{b}' },
                ],
            },
            2: {
                template: 'Вычислите значение трёхчлена {a}x² + {b}x + {c} при x = {x}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -5, max: 5 },
                    c: { type: 'int', min: -8, max: 8 },
                    x: { type: 'int', min: -3, max: 3 },
                },
                answer_formula: 'a * x * x + b * x + c',
                hint: 'Подставьте x = {x} в каждое слагаемое поочерёдно',
                solution: [
                    { explanation: 'Подставляем x = {x}:', expression: '{a}·({x})² + {b}·({x}) + {c}' },
                    { explanation: 'Вычисляем степень:', expression: '{a}·{x*x} + {b}·{x} + {c}' },
                    { explanation: 'Ответ:', result: '{answer}' },
                ],
            },
            3: {
                template: 'При каком значении x трёхчлен {a}x² + {b}x + {c} равен {target}?',
                parameters: {
                    a: { type: 'int', min: 1, max: 2 },
                    x: { type: 'int', min: -4, max: 4 },
                    b: { type: 'int', min: -4, max: 4 },
                    c: { type: 'int', min: -6, max: 6 },
                    target: { type: 'expression', value: 'a*x*x + b*x + c' },
                },
                answer_formula: 'x',
                hint: 'Составьте уравнение {a}x² + {b}x + {c} = {target} и решите его',
            },
        },
    },

    // ===== GRADE 8 - ALGEBRA: Разложение трёхчлена =====
    {
        id: 'grade8-trinomialFactoring-1',
        class: 8,
        subject: 'algebra',
        section: 'Квадратный трёхчлен',
        topic: 'trinomialFactoring',
        topic_title: 'Разложение трёхчлена на множители',
        problemType: 'numeric',
        skills: ['factoring', 'quadratic'],
        difficulties: {
            1: {
                template: 'Разложите на множители: x² + {s}x + {p}. Найдите меньший корень.',
                parameters: {
                    r1: { type: 'int', min: 1, max: 5 },
                    r2: { type: 'int', min: 1, max: 5 },
                    s: { type: 'expression', value: 'r1 + r2' },
                    p: { type: 'expression', value: 'r1 * r2' },
                },
                answer_formula: '-Math.max(r1, r2)',
                hint: 'Подберите два числа, сумма которых равна {s}, а произведение — {p}',
                solution: [
                    { explanation: 'Ищем числа с суммой {s} и произведением {p}' },
                    { explanation: 'Это числа {r1} и {r2}' },
                    { explanation: 'Разложение: (x + {r1})(x + {r2}), корни: x = −{r1}, x = −{r2}' },
                ],
            },
            2: {
                template: 'Разложите на множители: x² + {b}x + {c}. Найдите больший корень.',
                parameters: {
                    r1: { type: 'int', min: -6, max: -1 },
                    r2: { type: 'int', min: 1, max: 6 },
                    b: { type: 'expression', value: 'r1 + r2' },
                    c: { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'Math.max(-r1, -r2)',
                hint: 'Один корень положительный, другой отрицательный. Произведение < 0.',
                solution: [
                    { explanation: 'c = {c} < 0, значит корни разных знаков' },
                    { explanation: 'Подбираем: {r1} + {r2} = {b}, {r1} · {r2} = {c}' },
                    { explanation: 'Разложение: (x − {-r1})(x − {-r2})' },
                ],
            },
            3: {
                template: 'Разложите на множители: {a}x² + {b}x + {c}. Найдите произведение корней.',
                parameters: {
                    a: { type: 'int', min: 2, max: 4 },
                    r1: { type: 'int', min: -4, max: -1 },
                    r2: { type: 'int', min: 1, max: 4 },
                    b: { type: 'expression', value: 'a * (r1 + r2)' },
                    c: { type: 'expression', value: 'a * r1 * r2' },
                },
                answer_formula: 'r1 * r2',
                hint: 'По теореме Виета произведение корней = c/a',
                solution: [
                    { explanation: 'По теореме Виета: x₁·x₂ = c/a = {c}/{a}', result: '{answer}' },
                ],
            },
        },
    },

    // ===== GRADE 8 - ALGEBRA: Неполные квадратные уравнения =====
    {
        id: 'grade8-quadraticIncomplete-1',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные уравнения',
        topic: 'quadraticIncomplete',
        topic_title: 'Неполные квадратные уравнения',
        problemType: 'numeric',
        skills: ['quadratic', 'squareRoot'],
        difficulties: {
            1: {
                template: 'Решите уравнение: x² = {c}. Найдите положительный корень.',
                parameters: {
                    x: { type: 'int', min: 1, max: 8 },
                    c: { type: 'expression', value: 'x * x' },
                },
                answer_formula: 'x',
                hint: 'x² = {c} означает x = ±√{c}',
                solution: [
                    { explanation: 'Из уравнения x² = {c}' },
                    { explanation: 'x = ±√{c}', result: 'x = ±{x}' },
                ],
                common_mistakes: [
                    { pattern: '-x', feedback: 'Верно! Но задание просит положительный корень.' },
                ],
            },
            2: {
                template: 'Решите уравнение: {a}x² − {c} = 0. Найдите положительный корень.',
                parameters: {
                    a: { type: 'int', min: 2, max: 5 },
                    x: { type: 'int', min: 1, max: 6 },
                    c: { type: 'expression', value: 'a * x * x' },
                },
                answer_formula: 'x',
                hint: 'Перенесите {c} вправо: {a}x² = {c}, затем x² = {c}/{a}',
                solution: [
                    { explanation: 'Переносим: {a}x² = {c}' },
                    { explanation: 'x² = {c} ÷ {a} = {x*x}' },
                    { explanation: 'x = ±{x}' },
                ],
            },
            3: {
                template: 'Решите уравнение: {a}x² + {b}x = 0. Найдите все корни через запятую.',
                parameters: {
                    a: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: -8, max: 8 },
                },
                constraints: ['b !== 0'],
                answer_formula: '-b / a',
                hint: 'Вынесите x за скобку: x({a}x + {b}) = 0',
                solution: [
                    { explanation: 'Выносим x: x·({a}x + {b}) = 0' },
                    { explanation: 'x = 0  или  {a}x + {b} = 0' },
                    { explanation: 'Второй корень: x = −{b}/{a} = {answer}' },
                ],
            },
        },
    },

    // ===== GRADE 8 - ALGEBRA: Формула дискриминанта =====
    {
        id: 'grade8-quadraticFormula-1',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные уравнения',
        topic: 'quadraticFormula',
        topic_title: 'Формула корней квадратного уравнения',
        problemType: 'numeric',
        skills: ['quadratic', 'discriminant'],
        difficulties: {
            1: {
                template: 'Вычислите дискриминант уравнения x² + {b}x + {c} = 0.',
                parameters: {
                    b: { type: 'int', min: -6, max: 6 },
                    c: { type: 'int', min: -8, max: 8 },
                },
                answer_formula: 'b * b - 4 * c',
                hint: 'D = b² − 4ac. Здесь a = 1, b = {b}, c = {c}',
                solution: [
                    { explanation: 'D = b² − 4·a·c' },
                    { explanation: 'D = ({b})² − 4·1·({c})', expression: '{b*b} − {4*c}' },
                    { explanation: 'D =', result: '{answer}' },
                ],
                common_mistakes: [
                    { pattern: 'b * b + 4 * c', feedback: 'Знак неверный: D = b² − 4ac, не плюс.' },
                ],
            },
            2: {
                template: 'Решите уравнение x² + {b}x + {c} = 0. Найдите меньший корень.',
                parameters: {
                    r1: { type: 'int', min: -7, max: -1 },
                    r2: { type: 'int', min: -7, max: -1 },
                    b: { type: 'expression', value: 'r1 + r2' },
                    c: { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'Math.min(r1, r2)',
                hint: 'Вычислите D = {b}² − 4·{c}, затем x = (−{b} ± √D) / 2',
                solution: [
                    { explanation: 'D = ({b})² − 4·({c}) = {b*b - 4*c}' },
                    { explanation: 'x₁ = (−{b} − √D) / 2, x₂ = (−{b} + √D) / 2' },
                    { explanation: 'Меньший корень:', result: '{answer}' },
                ],
            },
            3: {
                template: 'Решите уравнение {a}x² + {b}x + {c} = 0. Найдите сумму корней.',
                parameters: {
                    a: { type: 'int', min: 2, max: 4 },
                    r1: { type: 'int', min: -5, max: 5 },
                    r2: { type: 'int', min: -5, max: 5 },
                    b: { type: 'expression', value: '-a * (r1 + r2)' },
                    c: { type: 'expression', value: 'a * r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'r1 + r2',
                hint: 'По теореме Виета сумма корней = −b/a',
                solution: [
                    { explanation: 'По теореме Виета: x₁ + x₂ = −b/a = −({b})/{a}', result: '{answer}' },
                ],
            },
        },
    },

    // ===== GRADE 8 - ALGEBRA: Теорема Виета =====
    {
        id: 'grade8-vietasTheorem-1',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные уравнения',
        topic: 'vietasTheorem',
        topic_title: 'Теорема Виета',
        problemType: 'numeric',
        skills: ['quadratic', 'vietasTheorem'],
        difficulties: {
            1: {
                template: 'Корни уравнения x² + bx + c = 0 равны {r1} и {r2}. Найдите b.',
                parameters: {
                    r1: { type: 'int', min: 1, max: 6 },
                    r2: { type: 'int', min: 1, max: 6 },
                },
                answer_formula: '-(r1 + r2)',
                hint: 'По теореме Виета: b = −(x₁ + x₂)',
                solution: [
                    { explanation: 'x₁ + x₂ = {r1} + {r2} = {r1+r2}' },
                    { explanation: 'b = −(x₁ + x₂) =', result: '{answer}' },
                ],
            },
            2: {
                template: 'Составьте квадратное уравнение с корнями {r1} и {r2} (при a=1). Найдите c.',
                parameters: {
                    r1: { type: 'int', min: -6, max: 6 },
                    r2: { type: 'int', min: -6, max: 6 },
                },
                constraints: ['r1 !== r2', 'r1 !== 0', 'r2 !== 0'],
                answer_formula: 'r1 * r2',
                hint: 'c = x₁ · x₂',
                solution: [
                    { explanation: 'c = x₁ · x₂ = {r1} · {r2}', result: '{answer}' },
                    { explanation: 'Уравнение: x² + {-(r1+r2)}x + {r1*r2} = 0' },
                ],
            },
            3: {
                template: 'Корни уравнения {a}x² + {b}x + {c} = 0 равны r₁ и r₂. Найдите r₁² + r₂².',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    r1: { type: 'int', min: -4, max: 4 },
                    r2: { type: 'int', min: -4, max: 4 },
                    b: { type: 'expression', value: '-a * (r1 + r2)' },
                    c: { type: 'expression', value: 'a * r1 * r2' },
                },
                constraints: ['r1 !== r2'],
                answer_formula: 'r1*r1 + r2*r2',
                hint: 'r₁² + r₂² = (r₁+r₂)² − 2r₁r₂. Используйте теорему Виета.',
                solution: [
                    { explanation: 'По теореме Виета: r₁+r₂ = −b/a, r₁·r₂ = c/a' },
                    { explanation: 'r₁²+r₂² = (r₁+r₂)² − 2r₁r₂', result: '{answer}' },
                ],
            },
        },
    },

    // ===== GRADE 8 - ALGEBRA: Задачи на квадратные уравнения =====
    {
        id: 'grade8-quadraticWordProblems-1',
        class: 8,
        subject: 'algebra',
        section: 'Квадратные уравнения',
        topic: 'quadraticWordProblems',
        topic_title: 'Задачи на квадратные уравнения',
        problemType: 'numeric',
        skills: ['quadratic', 'wordProblems'],
        difficulties: {
            1: {
                template: 'Прямоугольник имеет площадь {area} см². Его длина на {d} см больше ширины. Найдите ширину.',
                parameters: {
                    w: { type: 'int', min: 3, max: 9 },
                    d: { type: 'int', min: 1, max: 5 },
                    area: { type: 'expression', value: 'w * (w + d)' },
                },
                answer_formula: 'w',
                hint: 'Пусть ширина = x, тогда длина = x + {d}. Площадь: x·(x+{d}) = {area}',
                solution: [
                    { explanation: 'Обозначим ширину x, длину x+{d}' },
                    { explanation: 'Уравнение: x·(x+{d}) = {area}' },
                    { explanation: 'x² + {d}x − {area} = 0' },
                    { explanation: 'Ширина:', result: '{w} см' },
                ],
            },
            2: {
                template: 'Найдите два числа, если их сумма равна {s}, а произведение равно {p}.',
                parameters: {
                    r1: { type: 'int', min: 2, max: 8 },
                    r2: { type: 'int', min: 2, max: 8 },
                    s: { type: 'expression', value: 'r1 + r2' },
                    p: { type: 'expression', value: 'r1 * r2' },
                },
                constraints: ['r1 < r2'],
                answer_formula: 'r1',
                hint: 'Составьте уравнение x² − {s}x + {p} = 0',
                solution: [
                    { explanation: 'Пусть числа x и {s}−x' },
                    { explanation: 'x·({s}−x) = {p}  →  x² − {s}x + {p} = 0' },
                    { explanation: 'Меньшее число:', result: '{r1}' },
                ],
            },
            3: {
                template: 'Поезд прошёл {dist} км. Если бы скорость была на {dv} км/ч больше, он затратил бы на {dt} ч меньше. Найдите скорость поезда.',
                parameters: {
                    dist: { type: 'int', min: 200, max: 400 },
                    dv: { type: 'int', min: 10, max: 20 },
                    dt: { type: 'int', min: 1, max: 3 },
                },
                answer_formula: '(-dv + sqrt(dv*dv + 4*dist*dv/dt)) / 2',
                hint: 'Время₁ = dist/v, Время₂ = dist/(v+{dv}). Разность = {dt}',
            },
        },
    },

    // ===== GRADE 8 - ALGEBRA: Квадратичная функция — парабола =====
    {
        id: 'grade8-parabolaBasics-1',
        class: 8,
        subject: 'algebra',
        section: 'Квадратичная функция',
        topic: 'parabolaBasics',
        topic_title: 'Парабола: вершина и ось симметрии',
        problemType: 'numeric',
        skills: ['quadraticFunction', 'parabola'],
        difficulties: {
            1: {
                template: 'Найдите x-координату вершины параболы y = x² + {b}x + {c}.',
                parameters: {
                    b: { type: 'int', min: -8, max: 8 },
                    c: { type: 'int', min: -6, max: 6 },
                },
                constraints: ['b !== 0'],
                answer_formula: '-b / 2',
                hint: 'x₀ = −b / (2a). Здесь a = 1, b = {b}',
                solution: [
                    { explanation: 'Формула вершины: x₀ = −b/(2a)' },
                    { explanation: 'x₀ = −({b}) / (2·1) =', result: '{answer}' },
                ],
            },
            2: {
                template: 'Найдите координаты вершины параболы y = {a}x² + {b}x + {c}. Введите y-координату.',
                parameters: {
                    a: { type: 'int', min: 1, max: 3 },
                    b: { type: 'int', min: -6, max: 6 },
                    c: { type: 'int', min: -6, max: 6 },
                },
                constraints: ['b !== 0'],
                answer_formula: 'c - b*b / (4*a)',
                hint: 'Сначала x₀ = −b/(2a), затем y₀ = подставьте x₀ в формулу',
                solution: [
                    { explanation: 'x₀ = −{b} / (2·{a}) = {-b/(2*a)}' },
                    { explanation: 'y₀ = {a}·({-b/(2*a)})² + {b}·({-b/(2*a)}) + {c}', result: '{answer}' },
                ],
            },
            3: {
                template: 'При каком a парабола y = ax² − 4x + {c} имеет вершину при x = 1?',
                parameters: {
                    c: { type: 'int', min: -4, max: 6 },
                },
                answer_formula: '2',
                hint: 'x₀ = −b/(2a) = 1. Здесь b = −4, значит −(−4)/(2a) = 1',
                solution: [
                    { explanation: '4/(2a) = 1  →  2a = 4  →  a = 2' },
                ],
            },
        },
    },

    // ===== GRADE 8 - ALGEBRA: Неравенства =====
    {
        id: 'grade8-linearInequality-1',
        class: 8,
        subject: 'algebra',
        section: 'Неравенства',
        topic: 'linearInequality',
        topic_title: 'Линейные неравенства',
        problemType: 'numeric',
        skills: ['inequalities', 'linearEquations'],
        difficulties: {
            1: {
                template: 'Решите неравенство: x + {b} > {c}. Найдите наименьшее целое решение.',
                parameters: {
                    b: { type: 'int', min: -6, max: 6 },
                    c: { type: 'int', min: -8, max: 8 },
                },
                answer_formula: 'c - b + 1',
                hint: 'Перенесите {b} в правую часть: x > {c} − {b}',
                solution: [
                    { explanation: 'x > {c} − ({b})' },
                    { explanation: 'x > {c-b}' },
                    { explanation: 'Наименьшее целое:', result: '{answer}' },
                ],
                common_mistakes: [
                    { pattern: 'c - b', feedback: 'Это граница промежутка, она не включается. Наименьшее целое = {c-b+1}' },
                ],
            },
            2: {
                template: 'Решите неравенство: {a}x − {b} ≤ {c}. Найдите наибольшее целое решение.',
                parameters: {
                    a: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: 1, max: 8 },
                    c: { type: 'int', min: 0, max: 20 },
                    x: { type: 'expression', value: 'Math.floor((c + b) / a)' },
                },
                answer_formula: 'Math.floor((c + b) / a)',
                hint: 'Перенесите: {a}x ≤ {c} + {b}, затем разделите на {a}',
                solution: [
                    { explanation: '{a}x ≤ {c+b}' },
                    { explanation: 'x ≤ {(c+b)/a}' },
                    { explanation: 'Наибольшее целое:', result: '{answer}' },
                ],
            },
            3: {
                template: 'Решите неравенство: {a}x + {b} > {c}x + {d}. Найдите наименьшее целое решение.',
                parameters: {
                    a: { type: 'int', min: 2, max: 6 },
                    b: { type: 'int', min: -8, max: 8 },
                    c: { type: 'int', min: 1, max: 4 },
                    d: { type: 'int', min: -8, max: 8 },
                },
                constraints: ['a > c'],
                answer_formula: 'Math.floor((d - b) / (a - c)) + 1',
                hint: 'Перенесите x-члены влево, свободные — вправо. Затем делите на ({a}−{c}) > 0',
                solution: [
                    { explanation: '({a}−{c})x > {d}−{b}' },
                    { explanation: 'x > {(d-b)/(a-c)}' },
                    { explanation: 'Наименьшее целое:', result: '{answer}' },
                ],
            },
        },
    },

    // ===== GRADE 8 - ALGEBRA: Уравнения с модулем =====
    {
        id: 'grade8-absoluteValueEq-1',
        class: 8,
        subject: 'algebra',
        section: 'Уравнения с модулем',
        topic: 'absoluteValueEq',
        topic_title: 'Уравнения вида |f(x)| = a',
        problemType: 'numeric',
        skills: ['absoluteValue', 'linearEquations'],
        difficulties: {
            1: {
                template: 'Решите уравнение: |x + {b}| = {c}. Найдите наибольший корень.',
                parameters: {
                    b: { type: 'int', min: -5, max: 5 },
                    c: { type: 'int', min: 1, max: 8 },
                },
                answer_formula: 'c - b',
                hint: '|x + {b}| = {c} означает x + {b} = {c} или x + {b} = −{c}',
                solution: [
                    { explanation: 'Случай 1: x + {b} = {c}  →  x = {c-b}' },
                    { explanation: 'Случай 2: x + {b} = −{c}  →  x = {-c-b}' },
                    { explanation: 'Наибольший корень:', result: '{answer}' },
                ],
            },
            2: {
                template: 'Решите уравнение: |{a}x − {b}| = {c}. Найдите сумму корней.',
                parameters: {
                    a: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: 1, max: 8 },
                    c: { type: 'int', min: 1, max: 10 },
                },
                answer_formula: '2 * b / a',
                hint: 'Два случая: {a}x − {b} = ±{c}. Сумма корней = 2b/a',
                solution: [
                    { explanation: '{a}x = {b} + {c} = {b+c}  →  x₁ = {(b+c)/a}' },
                    { explanation: '{a}x = {b} − {c} = {b-c}  →  x₂ = {(b-c)/a}' },
                    { explanation: 'Сумма:', result: '{answer}' },
                ],
            },
            3: {
                template: 'Решите уравнение: |x² − {s}| = {d}. Найдите количество корней.',
                parameters: {
                    r: { type: 'int', min: 2, max: 5 },
                    s: { type: 'expression', value: 'r * r' },
                    d: { type: 'int', min: 1, max: 6 },
                },
                answer_formula: '4',
                hint: 'Два случая: x² = {s} + {d} и x² = {s} − {d}. Сколько решений каждый даёт?',
                solution: [
                    { explanation: 'x² = {s+d}  →  2 корня (если > 0)' },
                    { explanation: 'x² = {s-d}  →  2 корня (если > 0), 1 (если = 0), 0 (если < 0)' },
                ],
            },
        },
    },

    // ===== GRADE 8 - ALGEBRA: Алгебраические дроби =====
    {
        id: 'grade8-rationalExpression-1',
        class: 8,
        subject: 'algebra',
        section: 'Алгебраические дроби',
        topic: 'rationalExpression',
        topic_title: 'Алгебраические дроби: ОДЗ и сокращение',
        problemType: 'numeric',
        skills: ['fractions', 'factoring'],
        difficulties: {
            1: {
                template: 'Сократите дробь (x² − {a2}) / (x + {a}). При каком x она не определена?',
                parameters: {
                    a: { type: 'int', min: 1, max: 6 },
                    a2: { type: 'expression', value: 'a * a' },
                },
                answer_formula: '-a',
                hint: 'x² − {a2} = (x−{a})(x+{a}). Сократите (x+{a}).',
                solution: [
                    { explanation: 'Числитель: x² − {a2} = (x−{a})(x+{a})' },
                    { explanation: 'Сокращаем (x+{a}): результат = x − {a}' },
                    { explanation: 'ОДЗ: x ≠ −{a}', result: 'x ≠ {answer}' },
                ],
            },
            2: {
                template: 'Упростите: (x² + {b}x) / ({a}x). Найдите значение при x = {xv}.',
                parameters: {
                    a: { type: 'int', min: 1, max: 4 },
                    b: { type: 'int', min: -6, max: 6 },
                    xv: { type: 'int', min: 1, max: 5 },
                },
                constraints: ['b !== 0'],
                answer_formula: '(xv + b) / a',
                hint: 'Вынесите x в числителе: x(x+{b}). Сократите x.',
                solution: [
                    { explanation: 'x(x+{b}) / ({a}x) = (x+{b})/{a}, при x ≠ 0' },
                    { explanation: 'При x = {xv}: ({xv}+{b})/{a}', result: '{answer}' },
                ],
            },
            3: {
                template: 'Сократите дробь ({a}x² + {b}x + {c}) / (x − {r}). Найдите свободный член результата.',
                parameters: {
                    a: { type: 'int', min: 1, max: 2 },
                    r: { type: 'int', min: 1, max: 4 },
                    q: { type: 'int', min: -4, max: 4 },
                    b: { type: 'expression', value: 'a * (-r + q)' },
                    c: { type: 'expression', value: 'a * (-r) * q' },
                },
                answer_formula: 'a * q',
                hint: 'Разложите числитель: {a}(x−{r})(x−{q}), затем сократите (x−{r})',
                solution: [
                    { explanation: 'Числитель = {a}(x−{r})(x+{-q})' },
                    { explanation: 'После сокращения: {a}(x+{-q})', result: 'свободный член = {answer}' },
                ],
            },
        },
    },

    // ===== GRADE 8 - GEOMETRY: Теорема Пифагора =====
    {
        id: 'grade8-pythagoreanTheorem-1',
        class: 8,
        subject: 'geometry',
        section: 'Теорема Пифагора',
        topic: 'pythagoreanTheorem',
        topic_title: 'Теорема Пифагора',
        problemType: 'numeric',
        skills: ['pythagorean', 'squareRoot'],
        difficulties: {
            1: {
                template: 'Катеты прямоугольного треугольника равны {a} и {b}. Найдите гипотенузу.',
                parameters: {
                    a: { type: 'int', min: 3, max: 8 },
                    b: { type: 'int', min: 3, max: 8 },
                    c: { type: 'expression', value: 'Math.round(Math.sqrt(a*a + b*b) * 100) / 100' },
                },
                answer_formula: 'Math.round(Math.sqrt(a*a + b*b) * 100) / 100',
                hint: 'c = √(a² + b²) = √({a*a} + {b*b})',
                solution: [
                    { explanation: 'По теореме Пифагора: c² = a² + b²' },
                    { explanation: 'c² = {a}² + {b}² = {a*a+b*b}' },
                    { explanation: 'c = √{a*a+b*b} =', result: '{answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Это сумма катетов, не гипотенуза. Нужно: √(a²+b²)' },
                ],
            },
            2: {
                template: 'Гипотенуза прямоугольного треугольника равна {c}, один катет равен {a}. Найдите другой катет.',
                parameters: {
                    a: { type: 'int', min: 3, max: 9 },
                    b: { type: 'int', min: 3, max: 9 },
                    c: { type: 'expression', value: 'Math.round(Math.sqrt(a*a + b*b))' },
                },
                constraints: ['a*a + b*b === c*c'],
                answer_formula: 'b',
                hint: 'b = √(c² − a²) = √({c*c} − {a*a})',
                solution: [
                    { explanation: 'b² = c² − a² = {c*c} − {a*a} = {c*c-a*a}' },
                    { explanation: 'b = √{c*c-a*a} =', result: '{b}' },
                ],
            },
            3: {
                template: 'Диагональ прямоугольника равна {d}, одна сторона равна {a}. Найдите площадь прямоугольника.',
                parameters: {
                    a: { type: 'int', min: 3, max: 8 },
                    b: { type: 'int', min: 3, max: 8 },
                    d: { type: 'expression', value: 'Math.round(Math.sqrt(a*a + b*b))' },
                },
                constraints: ['a*a + b*b === d*d'],
                answer_formula: 'a * b',
                hint: 'Из теоремы Пифагора: b = √(d²−a²). Площадь = a·b',
                solution: [
                    { explanation: 'b = √({d*d}−{a*a}) = {b}' },
                    { explanation: 'Площадь = {a} · {b} =', result: '{answer} см²' },
                ],
            },
        },
    },

    // ===== GRADE 8 - GEOMETRY: Подобие треугольников =====
    {
        id: 'grade8-triangleSimilarityAA-1',
        class: 8,
        subject: 'geometry',
        section: 'Подобие треугольников',
        topic: 'triangleSimilarityAA',
        topic_title: 'Подобие треугольников (признак AA)',
        problemType: 'numeric',
        skills: ['similarity', 'proportions'],
        difficulties: {
            1: {
                template: 'Треугольники подобны с коэффициентом k = {k}. Сторона меньшего треугольника равна {a}. Найдите соответственную сторону большего.',
                parameters: {
                    k: { type: 'int', min: 2, max: 5 },
                    a: { type: 'int', min: 3, max: 8 },
                },
                answer_formula: 'k * a',
                hint: 'Соответственные стороны подобных треугольников относятся как k : 1',
                solution: [
                    { explanation: 'Сторона большего = k · сторона меньшего' },
                    { explanation: '= {k} · {a} =', result: '{answer}' },
                ],
            },
            2: {
                template: 'В треугольнике ABC и A₁B₁C₁: AB = {ab}, A₁B₁ = {a1b1}, BC = {bc}. Найдите B₁C₁.',
                parameters: {
                    ab: { type: 'int', min: 4, max: 10 },
                    k: { type: 'int', min: 2, max: 4 },
                    a1b1: { type: 'expression', value: 'ab * k' },
                    bc: { type: 'int', min: 3, max: 8 },
                },
                answer_formula: 'bc * k',
                hint: 'k = A₁B₁/AB = {a1b1}/{ab}. B₁C₁ = k · BC',
                solution: [
                    { explanation: 'k = {a1b1} / {ab} = {k}' },
                    { explanation: 'B₁C₁ = {k} · {bc} =', result: '{answer}' },
                ],
            },
            3: {
                template: 'Высота в прямоугольном треугольнике делит гипотенузу на отрезки {p} и {q}. Найдите высоту.',
                parameters: {
                    p: { type: 'int', min: 2, max: 6 },
                    q: { type: 'int', min: 2, max: 8 },
                },
                answer_formula: 'Math.round(Math.sqrt(p * q) * 100) / 100',
                hint: 'По свойству высоты: h² = p·q',
                solution: [
                    { explanation: 'h² = p·q = {p}·{q} = {p*q}' },
                    { explanation: 'h = √{p*q} =', result: '{answer}' },
                ],
            },
        },
    },

    // ===== GRADE 8 - GEOMETRY: Площади четырёхугольников =====
    {
        id: 'grade8-quadrilateralArea-1',
        class: 8,
        subject: 'geometry',
        section: 'Четырёхугольники',
        topic: 'quadrilateralArea',
        topic_title: 'Площади четырёхугольников',
        problemType: 'numeric',
        skills: ['area', 'quadrilaterals'],
        difficulties: {
            1: {
                template: 'Параллелограмм имеет основание {base} см и высоту {h} см. Найдите его площадь.',
                parameters: {
                    base: { type: 'int', min: 4, max: 12 },
                    h: { type: 'int', min: 3, max: 10 },
                },
                answer_formula: 'base * h',
                hint: 'Площадь параллелограмма = основание × высота',
                solution: [
                    { explanation: 'S = a · h = {base} · {h} =', result: '{answer} см²' },
                ],
                common_mistakes: [
                    { pattern: '2*(base+h)', feedback: 'Это периметр, а не площадь. S = основание × высота.' },
                ],
            },
            2: {
                template: 'Трапеция имеет основания {a} и {b} см, высоту {h} см. Найдите площадь.',
                parameters: {
                    a: { type: 'int', min: 4, max: 10 },
                    b: { type: 'int', min: 6, max: 14 },
                    h: { type: 'int', min: 3, max: 8 },
                },
                constraints: ['a < b'],
                answer_formula: '(a + b) * h / 2',
                hint: 'S = (a + b) / 2 · h',
                solution: [
                    { explanation: 'S = (a + b)/2 · h = ({a}+{b})/2 · {h}' },
                    { explanation: '= {(a+b)/2} · {h} =', result: '{answer} см²' },
                ],
            },
            3: {
                template: 'Ромб имеет диагонали {d1} и {d2} см. Найдите его площадь.',
                parameters: {
                    d1: { type: 'int', min: 4, max: 12 },
                    d2: { type: 'int', min: 4, max: 12 },
                },
                constraints: ['d1 !== d2'],
                answer_formula: 'd1 * d2 / 2',
                hint: 'S = d₁ · d₂ / 2',
                solution: [
                    { explanation: 'S = d₁ · d₂ / 2 = {d1} · {d2} / 2 =', result: '{answer} см²' },
                ],
            },
        },
    },

    // ===== GRADE 8 - GEOMETRY: Вписанный угол =====
    {
        id: 'grade8-inscribedAngle-1',
        class: 8,
        subject: 'geometry',
        section: 'Окружность',
        topic: 'inscribedAngle',
        topic_title: 'Вписанный угол',
        problemType: 'numeric',
        skills: ['circles', 'angles'],
        difficulties: {
            1: {
                template: 'Центральный угол AOB = {central}°. Найдите вписанный угол ACB, опирающийся на ту же дугу.',
                parameters: {
                    central: { type: 'int', min: 40, max: 160 },
                },
                answer_formula: 'central / 2',
                hint: 'Вписанный угол равен половине центрального угла, опирающегося на ту же дугу',
                solution: [
                    { explanation: 'По теореме о вписанном угле: ∠ACB = ∠AOB / 2' },
                    { explanation: '∠ACB = {central} / 2 =', result: '{answer}°' },
                ],
                common_mistakes: [
                    { pattern: 'central', feedback: 'Вписанный угол в два раза меньше центрального.' },
                    { pattern: 'central * 2', feedback: 'Это центральный угол умножен на 2. Вписанный = центральный / 2.' },
                ],
            },
            2: {
                template: 'Вписанный угол ACB = {inscribed}°. Найдите центральный угол AOB.',
                parameters: {
                    inscribed: { type: 'int', min: 20, max: 80 },
                },
                answer_formula: 'inscribed * 2',
                hint: 'Центральный угол вдвое больше вписанного',
                solution: [
                    { explanation: '∠AOB = 2 · ∠ACB = 2 · {inscribed} =', result: '{answer}°' },
                ],
            },
            3: {
                template: 'Угол, вписанный в полукруг (опирается на диаметр). Чему он равен?',
                parameters: {},
                answer_formula: '90',
                hint: 'Это следствие теоремы: угол, вписанный в полукруг, всегда равен 90°',
                solution: [
                    { explanation: 'Центральный угол на диаметре = 180°' },
                    { explanation: 'Вписанный = 180°/2 =', result: '90°' },
                ],
            },
        },
    },

    // ===== GRADE 8 - GEOMETRY: Расстояние по координатам =====
    {
        id: 'grade8-distanceFormula-1',
        class: 8,
        subject: 'geometry',
        section: 'Координатная геометрия',
        topic: 'distanceFormula',
        topic_title: 'Расстояние между двумя точками',
        problemType: 'numeric',
        skills: ['pythagorean', 'coordinatePlane'],
        difficulties: {
            1: {
                template: 'Найдите расстояние между точками A({x1}; 0) и B({x2}; 0).',
                parameters: {
                    x1: { type: 'int', min: -5, max: 0 },
                    x2: { type: 'int', min: 1, max: 6 },
                },
                answer_formula: 'x2 - x1',
                hint: 'На оси OX расстояние = |x₂ − x₁|',
                solution: [
                    { explanation: '|{x2} − ({x1})| = |{x2-x1}| =', result: '{answer}' },
                ],
            },
            2: {
                template: 'Найдите расстояние между точками A({x1}; {y1}) и B({x2}; {y2}).',
                parameters: {
                    x1: { type: 'int', min: -4, max: 4 },
                    y1: { type: 'int', min: -4, max: 4 },
                    x2: { type: 'int', min: -4, max: 4 },
                    y2: { type: 'int', min: -4, max: 4 },
                },
                answer_formula: 'Math.round(Math.sqrt((x2-x1)**2 + (y2-y1)**2) * 100) / 100',
                hint: 'AB = √((x₂−x₁)² + (y₂−y₁)²)',
                solution: [
                    { explanation: 'AB = √(({x2}−{x1})² + ({y2}−{y1})²)' },
                    { explanation: '= √({(x2-x1)**2} + {(y2-y1)**2})', result: '{answer}' },
                ],
            },
            3: {
                template: 'Периметр треугольника с вершинами A({x1};{y1}), B({x2};{y2}), C({x3};{y3}). Округлите до целых.',
                parameters: {
                    x1: { type: 'int', min: -3, max: 3 },
                    y1: { type: 'int', min: -3, max: 3 },
                    x2: { type: 'int', min: -3, max: 3 },
                    y2: { type: 'int', min: -3, max: 3 },
                    x3: { type: 'int', min: -3, max: 3 },
                    y3: { type: 'int', min: -3, max: 3 },
                },
                answer_formula: 'Math.round(Math.sqrt((x2-x1)**2+(y2-y1)**2) + Math.sqrt((x3-x2)**2+(y3-y2)**2) + Math.sqrt((x1-x3)**2+(y1-y3)**2))',
                hint: 'Найдите длины всех трёх сторон по формуле расстояния, затем сложите',
            },
        },
    },
];
