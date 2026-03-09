import { ProblemTemplate } from './types';

export const problemTemplates: ProblemTemplate[] = [
    // ===== ALGEBRA - Comparison =====
    {
        id: 'grade5-comparison',
        class: 5,
        subject: 'algebra',
        section: 'Числа и операции',
        topic: 'comparison',
        topic_title: 'Сравнение чисел',
        problemType: 'comparison',
        difficulties: {
            1: {
                template: 'Сравните числа {a} и {b}. Выберите правильный знак.',
                parameters: {
                    a: { type: 'int', min: 10, max: 99 },
                    b: { type: 'int', min: 10, max: 99 },
                },
                answer_formula: 'a > b ? ">" : a < b ? "<" : "="',
                hint: 'Сравните числа поразрядно: десятки, затем единицы',
            },
            2: {
                template: 'Сравните числа {a} и {b}. Выберите правильный знак.',
                parameters: {
                    a: { type: 'int', min: 100, max: 999 },
                    b: { type: 'int', min: 100, max: 999 },
                },
                answer_formula: 'a > b ? ">" : a < b ? "<" : "="',
                hint: 'Сравните числа поразрядно: сотни, десятки, единицы',
            },
        },
    },

    // ===== ALGEBRA - Arithmetic =====
    {
        id: 'grade5-arithmetic',
        class: 5,
        subject: 'algebra',
        section: 'Арифметические операции',
        topic: 'arithmetic',
        topic_title: 'Порядок действий',
        problemType: 'numeric',
        difficulties: {
            1: {
                template: 'Вычислите: {a} + {b} × {c} = ?',
                parameters: {
                    a: { type: 'int', min: 10, max: 50 },
                    b: { type: 'int', min: 2, max: 9 },
                    c: { type: 'int', min: 2, max: 9 },
                },
                answer_formula: 'a + b * c',
                hint: 'Сначала выполните умножение, затем сложение (порядок действий)',
            },
            2: {
                template: 'Вычислите: {a} × {b} − {c} = ?',
                parameters: {
                    a: { type: 'int', min: 2, max: 12 },
                    b: { type: 'int', min: 2, max: 12 },
                    c: { type: 'int', min: 1, max: 20 },
                },
                constraints: ['a * b - c > 0'],
                answer_formula: 'a * b - c',
                hint: 'Сначала выполните умножение, затем вычитание',
            },
            3: {
                template: 'Вычислите: ({a} + {b}) × {c} = ?',
                parameters: {
                    a: { type: 'int', min: 2, max: 10 },
                    b: { type: 'int', min: 2, max: 10 },
                    c: { type: 'int', min: 2, max: 9 },
                },
                answer_formula: '(a + b) * c',
                hint: 'Сначала выполните действие в скобках, затем умножение',
            },
        },
    },

    // ===== LOGIC - Patterns/Sequences =====
    {
        id: 'grade5-patterns',
        class: 5,
        subject: 'logic',
        section: 'Закономерности',
        topic: 'patterns',
        topic_title: 'Числовые последовательности',
        problemType: 'numeric',
        difficulties: {
            1: {
                template: 'Найдите следующее число в последовательности: {t1}, {t2}, {t3}, {t4}, ?',
                parameters: {
                    a0: { type: 'int', min: 1, max: 10 },
                    d: { type: 'int', min: 1, max: 5 },
                    t1: { type: 'expression', value: 'a0' },
                    t2: { type: 'expression', value: 'a0 + d' },
                    t3: { type: 'expression', value: 'a0 + d * 2' },
                    t4: { type: 'expression', value: 'a0 + d * 3' },
                },
                answer_formula: 'a0 + d * 4',
                hint: 'Найдите разность между соседними числами',
            },
            2: {
                template: 'Найдите следующее число в последовательности: {t1}, {t2}, {t3}, {t4}, ?',
                parameters: {
                    a0: { type: 'int', min: 1, max: 5 },
                    r: { type: 'int', min: 2, max: 3 },
                    t1: { type: 'expression', value: 'a0' },
                    t2: { type: 'expression', value: 'a0 * r' },
                    t3: { type: 'expression', value: 'a0 * r * r' },
                    t4: { type: 'expression', value: 'a0 * r * r * r' },
                },
                answer_formula: 'a0 * r * r * r * r',
                hint: 'Каждое следующее число получается умножением предыдущего на одно и то же число',
            },
            3: {
                template: 'Найдите пропущенное число: {t1}, {t2}, ?, {t4}, {t5}',
                parameters: {
                    a0: { type: 'int', min: 2, max: 8 },
                    d: { type: 'int', min: 2, max: 6 },
                    t1: { type: 'expression', value: 'a0' },
                    t2: { type: 'expression', value: 'a0 + d' },
                    t4: { type: 'expression', value: 'a0 + d * 3' },
                    t5: { type: 'expression', value: 'a0 + d * 4' },
                },
                answer_formula: 'a0 + d * 2',
                hint: 'Найдите разность между соседними числами',
            },
        },
    },

    // ===== ALGEBRA - Divisors =====
    {
        id: 'grade5-divisors',
        class: 5,
        subject: 'algebra',
        section: 'Делимость',
        topic: 'divisors',
        topic_title: 'Делимость на 2',
        problemType: 'numeric',
        difficulties: {
            1: {
                template: 'Число {n} делится на 2 без остатка?',
                parameters: {
                    n: { type: 'int', min: 10, max: 99 },
                },
                answer_formula: 'n % 2 === 0 ? 1 : 0',
                hint: 'Число делится на 2, если его последняя цифра чётная (0, 2, 4, 6, 8). Ответьте 1 (да) или 0 (нет)',
            },
        },
    },

    // ===== ALGEBRA - Simple Equations =====
    {
        id: 'grade5-equations',
        class: 5,
        subject: 'algebra',
        section: 'Простые уравнения',
        topic: 'arithmetic',
        topic_title: 'Решение уравнений',
        problemType: 'numeric',
        difficulties: {
            1: {
                template: 'Решите уравнение: x + {a} = {b}',
                parameters: {
                    a: { type: 'int', min: 5, max: 20 },
                    b: { type: 'int', min: 15, max: 50 },
                },
                constraints: ['b > a'],
                answer_formula: 'b - a',
                hint: 'Чтобы найти x, вычтите {a} из обеих частей уравнения',
            },
            2: {
                template: 'Решите уравнение: {a} × x = {b}',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    x: { type: 'int', min: 2, max: 12 },
                    b: { type: 'expression', value: 'a * x' },
                },
                answer_formula: 'x',
                hint: 'Чтобы найти x, разделите {b} на {a}',
            },
            3: {
                template: 'Решите уравнение: x − {a} = {b}',
                parameters: {
                    a: { type: 'int', min: 5, max: 15 },
                    b: { type: 'int', min: 10, max: 30 },
                },
                answer_formula: 'a + b',
                hint: 'Чтобы найти x, прибавьте {a} к обеим частям уравнения',
            },
        },
    },

    // ===== GEOMETRY - Perimeter =====
    {
        id: 'grade5-perimeter',
        class: 5,
        subject: 'geometry',
        section: 'Периметр и площадь',
        topic: 'perimeter',
        topic_title: 'Периметр фигур',
        problemType: 'numeric',
        difficulties: {
            1: {
                template: 'Прямоугольник имеет длину {a} см и ширину {b} см. Чему равен его периметр?',
                parameters: {
                    a: { type: 'int', min: 3, max: 20 },
                    b: { type: 'int', min: 3, max: 20 },
                },
                constraints: ['a !== b'],
                answer_formula: '2 * (a + b)',
                hint: 'Периметр = 2 × (длина + ширина)',
                solution: [
                    { explanation: 'Периметр прямоугольника — сумма всех четырёх сторон' },
                    { explanation: 'Две длины и две ширины:', expression: '2 × {a} + 2 × {b}' },
                    { explanation: 'Считаем:', expression: '2 × ({a} + {b})', result: '{answer} см' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Ты сложил стороны только один раз. Периметр = 2 × (a + b).' },
                    { pattern: 'a * b', feedback: 'Это формула площади, а не периметра.' },
                ],
            },
            2: {
                template: 'Квадрат имеет сторону {a} см. Чему равен его периметр?',
                parameters: {
                    a: { type: 'int', min: 3, max: 15 },
                },
                answer_formula: '4 * a',
                hint: 'Периметр квадрата = 4 × сторона',
                common_mistakes: [
                    { pattern: 'a', feedback: 'Это длина одной стороны. Периметр квадрата = 4 × сторона.' },
                    { pattern: 'a * a', feedback: 'Это формула площади квадрата, а не периметра.' },
                    { pattern: '2 * a', feedback: 'Ты умножил на 2, но у квадрата 4 стороны.' },
                ],
            },
        },
    },

    // ===== GEOMETRY - Area =====
    {
        id: 'grade5-area',
        class: 5,
        subject: 'geometry',
        section: 'Периметр и площадь',
        topic: 'area',
        topic_title: 'Площадь фигур',
        problemType: 'numeric',
        relatedModule: 'coordinate-plane',
        difficulties: {
            1: {
                template: 'Прямоугольник имеет длину {a} см и ширину {b} см. Чему равна его площадь?',
                parameters: {
                    a: { type: 'int', min: 3, max: 15 },
                    b: { type: 'int', min: 3, max: 15 },
                },
                constraints: ['a !== b'],
                answer_formula: 'a * b',
                hint: 'Площадь = длина × ширина',
                solution: [
                    { explanation: 'Площадь прямоугольника вычисляется по формуле:', expression: 'Площадь = длина × ширина' },
                    { explanation: 'Подставляем значения:', expression: '{a} × {b}' },
                    { explanation: 'Ответ:', result: '{answer} см²' },
                ],
                common_mistakes: [
                    { pattern: '2 * (a + b)', feedback: 'Это формула периметра, а не площади. Площадь = длина × ширина.' },
                    { pattern: 'a + b', feedback: 'Площадь считается умножением, а не сложением.' },
                ],
            },
            2: {
                template: 'Квадрат имеет сторону {a} см. Чему равна его площадь?',
                parameters: {
                    a: { type: 'int', min: 3, max: 12 },
                },
                answer_formula: 'a * a',
                hint: 'Площадь квадрата = сторона × сторона',
                common_mistakes: [
                    { pattern: '4 * a', feedback: 'Это формула периметра квадрата. Площадь = сторона × сторона.' },
                    { pattern: 'a', feedback: 'Это длина стороны. Площадь квадрата = сторона².' },
                ],
            },
            3: {
                template: 'Квадрат имеет площадь {s} см². Чему равна его сторона?',
                parameters: {
                    a: { type: 'int', min: 2, max: 10 },
                    s: { type: 'expression', value: 'a * a' },
                },
                answer_formula: 'a',
                hint: 'Сторона квадрата = √площадь',
            },
        },
    },

    // ===== GEOMETRY - Triangle Types =====
    {
        id: 'grade5-triangle',
        class: 5,
        subject: 'geometry',
        section: 'Треугольники',
        topic: 'triangles',
        topic_title: 'Свойства треугольников',
        problemType: 'text',
        relatedModule: 'triangle-similarity',
        difficulties: {
            1: {
                template: 'В треугольнике два угла равны {a}° и {b}°. Чему равен третий угол?',
                parameters: {
                    a: { type: 'int', min: 30, max: 70 },
                    b: { type: 'int', min: 30, max: 70 },
                },
                constraints: ['a + b < 180'],
                answer_formula: '180 - a - b',
                hint: 'Сумма углов в треугольнике равна 180°',
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Сумма углов треугольника равна 180°. Третий угол = 180 − a − b.' },
                    { pattern: '90 - a - b', feedback: 'Сумма углов треугольника равна 180°, а не 90°.' },
                ],
            },
            2: {
                template: 'Треугольник имеет стороны {a} см, {b} см и {c} см. Какой это треугольник? (равносторонний, равнобедренный или разносторонний)',
                parameters: {
                    type: { type: 'choice', values: ['equilateral', 'isosceles', 'scalene'] },
                    a: { type: 'int', min: 3, max: 10 },
                    b: { type: 'expression', value: 'type === "equilateral" ? a : type === "isosceles" ? a : a + 1' },
                    c: { type: 'expression', value: 'type === "equilateral" ? a : type === "isosceles" ? a + 2 : a + 2' },
                },
                answer_formula: 'type === "equilateral" ? "равносторонний" : type === "isosceles" ? "равнобедренный" : "разносторонний"',
                hint: 'Равносторонний: все стороны равны. Равнобедренный: две стороны равны. Разносторонний: все стороны разные',
            },
            3: {
                template: 'Можно ли построить треугольник со сторонами {a} см, {b} см и {c} см? Ответьте 1 (да) или 0 (нет)',
                parameters: {
                    a: { type: 'int', min: 2, max: 10 },
                    b: { type: 'int', min: 2, max: 10 },
                    c: { type: 'int', min: 2, max: 10 },
                },
                answer_formula: '(a + b > c && a + c > b && b + c > a) ? 1 : 0',
                hint: 'Неравенство треугольника: сумма любых двух сторон должна быть больше третьей',
            },
        },
    },

    // ===== LOGIC - Magic Squares =====
    {
        id: 'grade5-magic',
        class: 5,
        subject: 'logic',
        section: 'Логические задачи',
        topic: 'magicSquare',
        topic_title: 'Магический квадрат',
        problemType: 'numeric',
        difficulties: {
            3: {
                template: 'В магическом квадрате сумма чисел в каждой строке, столбце и диагонали равна {sum}. Найдите пропущенное число: [{a}, {b}, ?]',
                parameters: {
                    sum: { type: 'int', min: 15, max: 30 },
                    a: { type: 'int', min: 1, max: 10 },
                    b: { type: 'int', min: 1, max: 10 },
                },
                constraints: ['sum > a + b'],
                answer_formula: 'sum - a - b',
                hint: 'Сумма всех трёх чисел должна равняться магической константе',
            },
        },
    },

    // ===== OLYMPIAD LEVEL (Difficulty 4) =====
    {
        id: 'grade5-olympiad',
        class: 5,
        subject: 'logic',
        section: 'Олимпиадные задачи',
        topic: 'olympiad',
        topic_title: 'Олимпиадные задачи',
        problemType: 'numeric',
        difficulties: {
            4: {
                template: 'В ребусе AB + BA = {sum}, где A и B — разные цифры. Найдите значение A (большую цифру).',
                parameters: {
                    a: { type: 'int', min: 2, max: 8 },
                    b: { type: 'int', min: 1, max: 7 },
                    sum: { type: 'expression', value: '(a * 10 + b) + (b * 10 + a)' },
                },
                constraints: ['a !== b', 'a > b'],
                answer_formula: 'a',
                hint: 'AB + BA = (10A + B) + (10B + A) = 11A + 11B = 11(A + B). Разделите {sum} на 11, затем найдите A и B.',
                solution: [
                    { explanation: 'Запишем двузначные числа через разряды:', expression: 'AB = 10A + B, BA = 10B + A' },
                    { explanation: 'Сложим их:', expression: '(10A + B) + (10B + A) = 11A + 11B = 11(A + B)' },
                    { explanation: 'Получаем:', expression: '11(A + B) = {sum}' },
                    { explanation: 'Делим на 11:', expression: 'A + B = {sum} ÷ 11' },
                    { explanation: 'Так как A > B и оба — цифры, находим A =', result: '{answer}' },
                ],
            },
        },
    },
];
