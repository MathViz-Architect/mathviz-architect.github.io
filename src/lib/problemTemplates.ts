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
        skills: ['number_comparison', 'place_value'],
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
        skills: ['order_of_operations', 'multiplication', 'addition'],
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
        skills: ['pattern_recognition', 'arithmetic_sequence', 'geometric_sequence'],
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
        skills: ['divisibility', 'even_odd'],
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
        skills: ['linear_equation', 'inverse_operations'],
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
        skills: ['perimeter_formula', 'multiplication', 'addition'],
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
        skills: ['area_formula', 'multiplication', 'square_root'],
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
        skills: ['triangle_types', 'angle_sum', 'triangle_inequality'],
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
        skills: ['logical_reasoning', 'addition'],
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
        skills: ['logical_reasoning', 'number_theory'],
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

    // ===== ALGEBRA - Decimals =====
    {
        id: 'grade5-decimals',
        class: 5,
        subject: 'algebra',
        section: 'Десятичные дроби',
        topic: 'decimals',
        topic_title: 'Десятичные дроби',
        problemType: 'numeric',
        relatedModule: 'linear',
        skills: ['decimal_addition', 'decimal_multiplication', 'place_value'],
        difficulties: {
            1: {
                template: 'Вычислите: {aDecimal} + {bDecimal} = ?',
                parameters: {
                    a: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: 1, max: 9 },
                    aDecimal: { type: 'expression', value: 'a / 10' },
                    bDecimal: { type: 'expression', value: 'b / 10' },
                },
                answer_formula: '(a + b) / 10',
                hint: 'Складывайте десятичные дроби поразрядно',
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Не забудьте про запятую! Ответ должен быть десятичной дробью.' },
                ],
            },
            2: {
                template: 'Вычислите: {aDecimal} × {b} = ?',
                parameters: {
                    a: { type: 'int', min: 1, max: 9 },
                    b: { type: 'int', min: 2, max: 9 },
                    aDecimal: { type: 'expression', value: 'a / 10' },
                },
                answer_formula: '(a * b) / 10',
                hint: 'Умножьте {aDecimal} на {b}. После умножения перенесите запятую на один знак влево.',
                common_mistakes: [
                    { pattern: 'a * b', feedback: 'Не забудьте про запятую в ответе!' },
                ],
            },
            3: {
                template: 'Вычислите: {aDecimal} − {bDecimal} = ?',
                parameters: {
                    a: { type: 'int', min: 2, max: 9 },
                    b: { type: 'int', min: 1, max: 9 },
                    c: { type: 'int', min: 1, max: 9 },
                    aDecimal: { type: 'expression', value: 'a + b / 10' },
                    bDecimal: { type: 'expression', value: 'c / 10' },
                },
                constraints: ['a + b / 10 > c / 10', 'b !== c'],
                answer_formula: 'a + (b - c) / 10',
                hint: 'Вычитайте поразрядно: сначала целые части, затем десятые',
                solution: [
                    { explanation: 'Вычитаем десятые доли:', expression: '{b}/10 − {c}/10' },
                    { explanation: 'Прибавляем целую часть:', expression: '{a} + ({b} − {c})/10', result: '{answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a', feedback: 'Не забудьте вычесть десятые доли.' },
                ],
            },
        },
    },

    // ===== ALGEBRA - Fractions Comparison =====
    {
        id: 'grade5-fractions-comparison',
        class: 5,
        subject: 'algebra',
        section: 'Обыкновенные дроби',
        topic: 'fractionsIntro',
        topic_title: 'Сравнение дробей',
        problemType: 'comparison',
        skills: ['fraction_concept', 'fraction_comparison'],
        difficulties: {
            1: {
                template: 'Сравните дроби {a}/{d} и {b}/{d}. Выберите правильный знак.',
                parameters: {
                    d: { type: 'int', min: 3, max: 8 },
                    a: { type: 'int', min: 1, max: 7 },
                    b: { type: 'int', min: 1, max: 7 },
                },
                constraints: ['a < d', 'b < d', 'a !== b'],
                answer_formula: 'a > b ? ">" : a < b ? "<" : "="',
                hint: 'Если знаменатели равны, сравните числители',
            },
            2: {
                template: 'Сравните дроби {a}/{d1} и {b}/{d2}, где {d1} и {d2} — разные знаменатели. Приведите к общему знаменателю {lcm} и выберите знак.',
                parameters: {
                    d1: { type: 'choice', values: [2, 3, 4] },
                    d2: { type: 'choice', values: [3, 4, 6] },
                    a: { type: 'int', min: 1, max: 2 },
                    b: { type: 'int', min: 1, max: 3 },
                    lcm: { type: 'expression', value: 'd1 === 2 && d2 === 3 ? 6 : d1 === 2 && d2 === 4 ? 4 : d1 === 2 && d2 === 6 ? 6 : d1 === 3 && d2 === 4 ? 12 : d1 === 3 && d2 === 6 ? 6 : d1 === 4 && d2 === 6 ? 12 : 12' },
                    a1: { type: 'expression', value: 'a * (lcm / d1)' },
                    b1: { type: 'expression', value: 'b * (lcm / d2)' },
                },
                constraints: ['d1 !== d2', 'a < d1', 'b < d2'],
                answer_formula: 'a1 > b1 ? ">" : a1 < b1 ? "<" : "="',
                hint: 'Приведите дроби к общему знаменателю {lcm}, затем сравните числители',
            },
            3: {
                template: 'Сравните дроби {a}/{d} и {b}/{d}. Выберите правильный знак.',
                parameters: {
                    d: { type: 'int', min: 5, max: 12 },
                    a: { type: 'int', min: 1, max: 10 },
                    b: { type: 'int', min: 1, max: 10 },
                },
                constraints: ['a < d', 'b < d', 'a !== b'],
                answer_formula: 'a > b ? ">" : a < b ? "<" : "="',
                hint: 'Если знаменатели равны, сравните числители',
            },
        },
    },

    // ===== ALGEBRA - Fractions Operations =====
    {
        id: 'grade5-fractions-intro',
        class: 5,
        subject: 'algebra',
        section: 'Обыкновенные дроби',
        topic: 'fractionsIntro',
        topic_title: 'Действия с дробями',
        problemType: 'numeric',
        skills: ['fraction_addition', 'fraction_of_number'],
        difficulties: {
            1: {
                template: 'Вычислите: {a}/{d} + {b}/{d} = ? (ответ в виде десятичной дроби с точностью до сотых)',
                parameters: {
                    d: { type: 'int', min: 4, max: 10 },
                    a: { type: 'int', min: 1, max: 5 },
                    b: { type: 'int', min: 1, max: 5 },
                },
                constraints: ['a < d', 'b < d', 'a + b < d'],
                answer_formula: 'Math.round((a + b) / d * 100) / 100',
                hint: 'Сложите числители, знаменатель оставьте тем же: ({a} + {b})/{d}',
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Не забудьте разделить на знаменатель {d}' },
                ],
            },
            2: {
                template: 'Найдите {a}/{d} от числа {n}',
                parameters: {
                    d: { type: 'choice', values: [2, 4, 5, 10] },
                    a: { type: 'int', min: 1, max: 3 },
                    multiplier: { type: 'int', min: 2, max: 8 },
                    n: { type: 'expression', value: 'd * multiplier' },
                },
                constraints: ['a < d'],
                answer_formula: '(n * a) / d',
                hint: 'Разделите {n} на {d}, затем умножьте на {a}',
                common_mistakes: [
                    { pattern: 'n / d', feedback: 'Вы нашли 1/{d}, а нужно найти {a}/{d}. Умножьте результат на {a}.' },
                ],
            },
            3: {
                template: 'Вычислите: {a}/{d} + {b}/{d} = ? (ответ в виде десятичной дроби с точностью до сотых)',
                parameters: {
                    d: { type: 'int', min: 5, max: 12 },
                    a: { type: 'int', min: 1, max: 8 },
                    b: { type: 'int', min: 1, max: 8 },
                },
                constraints: ['a < d', 'b < d', 'a + b < d'],
                answer_formula: 'Math.round((a + b) / d * 100) / 100',
                hint: 'Сложите числители, знаменатель оставьте тем же: ({a} + {b})/{d}',
                solution: [
                    { explanation: 'Складываем дроби с одинаковым знаменателем:', expression: '{a}/{d} + {b}/{d} = ({a} + {b})/{d}' },
                    { explanation: 'Вычисляем:', expression: '{a + b}/{d} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Не забудьте разделить на знаменатель {d}' },
                ],
            },
        },
    },

    // ===== ALGEBRA - GCD and LCM =====
    {
        id: 'grade5-gcd-lcm',
        class: 5,
        subject: 'algebra',
        section: 'Делимость',
        topic: 'gcdLcm',
        topic_title: 'НОД и НОК',
        problemType: 'numeric',
        skills: ['gcd', 'lcm', 'prime_factorization'],
        difficulties: {
            1: {
                template: 'Найдите наибольший общий делитель (НОД) чисел {a} и {b}',
                parameters: {
                    gcd: { type: 'choice', values: [2, 3, 4, 5, 6] },
                    m: { type: 'int', min: 2, max: 4 },
                    n: { type: 'int', min: 2, max: 4 },
                    a: { type: 'expression', value: 'gcd * m' },
                    b: { type: 'expression', value: 'gcd * n' },
                },
                constraints: ['m !== n', 'a <= 20', 'b <= 20'],
                answer_formula: 'gcd',
                hint: 'НОД — наибольшее число, на которое делятся оба числа',
            },
            2: {
                template: 'Найдите наименьшее общее кратное (НОК) чисел {a} и {b}',
                parameters: {
                    a: { type: 'choice', values: [2, 3, 4, 5, 6] },
                    b: { type: 'choice', values: [3, 4, 5, 6, 8] },
                },
                constraints: ['a !== b', 'a < b'],
                answer_formula: '(a * b) / ((a > b ? (a % b === 0 ? b : (b % a === 0 ? a : 1)) : (b % a === 0 ? a : (a % b === 0 ? b : 1))))',
                hint: 'НОК — наименьшее число, которое делится на оба числа',
            },
            3: {
                template: 'Найдите НОД чисел {a}, {b} и {c}',
                parameters: {
                    gcd: { type: 'choice', values: [2, 3, 4] },
                    m: { type: 'int', min: 2, max: 3 },
                    n: { type: 'int', min: 2, max: 3 },
                    k: { type: 'int', min: 2, max: 3 },
                    a: { type: 'expression', value: 'gcd * m' },
                    b: { type: 'expression', value: 'gcd * n' },
                    c: { type: 'expression', value: 'gcd * k' },
                },
                constraints: ['m !== n', 'n !== k', 'm !== k', 'a <= 24', 'b <= 24', 'c <= 24'],
                answer_formula: 'gcd',
                hint: 'Найдите наибольшее число, на которое делятся все три числа',
                solution: [
                    { explanation: 'НОД трёх чисел — наибольший общий делитель всех трёх' },
                    { explanation: 'Проверяем делители:', expression: '{a} = {gcd} × {m}, {b} = {gcd} × {n}, {c} = {gcd} × {k}' },
                    { explanation: 'НОД =', result: '{answer}' },
                ],
            },
        },
    },

    // ===== GEOMETRY - Angles =====
    {
        id: 'grade5-angles',
        class: 5,
        subject: 'geometry',
        section: 'Геометрия углов',
        topic: 'angles',
        topic_title: 'Углы',
        problemType: 'numeric',
        relatedModule: 'parallel-lines',
        skills: ['angle_types', 'adjacent_angles', 'vertical_angles'],
        difficulties: {
            1: {
                template: 'Два угла смежные. Один из них равен {a}°. Чему равен другой угол?',
                parameters: {
                    a: { type: 'int', min: 30, max: 150 },
                },
                constraints: ['a !== 90'],
                answer_formula: '180 - a',
                hint: 'Смежные углы в сумме дают 180°',
                common_mistakes: [
                    { pattern: '90 - a', feedback: 'Смежные углы дают 180°, а не 90°' },
                    { pattern: 'a', feedback: 'Нужно найти другой угол, а не повторить данный' },
                ],
            },
            2: {
                template: 'Два угла вертикальные. Один из них равен {a}°. Чему равен другой угол?',
                parameters: {
                    a: { type: 'int', min: 30, max: 150 },
                },
                answer_formula: 'a',
                hint: 'Вертикальные углы равны',
            },
            3: {
                template: 'Два смежных угла относятся как {m}:{n}. Найдите меньший угол.',
                parameters: {
                    m: { type: 'int', min: 1, max: 3 },
                    n: { type: 'int', min: 2, max: 4 },
                },
                constraints: ['m < n', 'm + n <= 6'],
                answer_formula: '180 * m / (m + n)',
                hint: 'Сумма смежных углов равна 180°. Если углы относятся как {m}:{n}, то меньший угол = 180° × {m}/({m}+{n})',
                solution: [
                    { explanation: 'Пусть углы равны {m}x и {n}x' },
                    { explanation: 'Их сумма:', expression: '{m}x + {n}x = 180°' },
                    { explanation: 'Упрощаем:', expression: '{m + n}x = 180°' },
                    { explanation: 'Находим x:', expression: 'x = 180° ÷ {m + n} = {180 / (m + n)}°' },
                    { explanation: 'Меньший угол:', expression: '{m}x = {m} × {180 / (m + n)}° = {answer}°' },
                ],
            },
        },
    },

    // ===== GEOMETRY - Coordinates =====
    {
        id: 'grade5-coordinates',
        class: 5,
        subject: 'geometry',
        section: 'Координатная плоскость',
        topic: 'coordinates',
        topic_title: 'Координатная плоскость',
        problemType: 'numeric',
        relatedModule: 'coordinate-plane',
        skills: ['coordinate_plane', 'coordinates_reading'],
        difficulties: {
            1: {
                template: 'Точка A имеет координаты ({x}, {y}). Чему равна координата x?',
                parameters: {
                    x: { type: 'int', min: 1, max: 10 },
                    y: { type: 'int', min: 1, max: 10 },
                },
                answer_formula: 'x',
                hint: 'Координата x — это первое число в скобках',
            },
            2: {
                template: 'Точка B имеет координаты ({x}, {y}). Чему равна координата y?',
                parameters: {
                    x: { type: 'int', min: 1, max: 10 },
                    y: { type: 'int', min: 1, max: 10 },
                },
                answer_formula: 'y',
                hint: 'Координата y — это второе число в скобках',
            },
            3: {
                template: 'Точки A({a}, {c}) и B({b}, {c}) лежат на одной горизонтальной прямой. Найдите расстояние между ними.',
                parameters: {
                    a: { type: 'int', min: 1, max: 8 },
                    b: { type: 'int', min: 3, max: 12 },
                    c: { type: 'int', min: 1, max: 10 },
                },
                constraints: ['b > a', 'b - a >= 2'],
                answer_formula: 'b - a',
                hint: 'Если точки на одной горизонтальной прямой (y одинаковый), расстояние = |x₂ - x₁|',
                solution: [
                    { explanation: 'Точки на одной горизонтальной прямой (y = {c})' },
                    { explanation: 'Расстояние:', expression: '|{b} - {a}| = {answer}' },
                ],
            },
        },
    },

    // ===== ALGEBRA - Price Problems =====
    {
        id: 'grade5-price',
        class: 5,
        subject: 'algebra',
        section: 'Текстовые задачи',
        topic: 'priceQuantity',
        topic_title: 'Цена, количество, стоимость',
        problemType: 'numeric',
        skills: ['price_quantity', 'multiplication', 'division'],
        difficulties: {
            1: {
                template: 'Одна тетрадь стоит {price} рублей. Сколько стоят {quantity} тетрадей?',
                parameters: {
                    price: { type: 'int', min: 5, max: 20 },
                    quantity: { type: 'int', min: 3, max: 10 },
                },
                answer_formula: 'price * quantity',
                hint: 'Стоимость = цена × количество',
                common_mistakes: [
                    { pattern: 'price + quantity', feedback: 'Нужно умножить, а не сложить' },
                ],
            },
            2: {
                template: 'За {quantity} карандашей заплатили {cost} рублей. Сколько стоит один карандаш?',
                parameters: {
                    price: { type: 'int', min: 5, max: 15 },
                    quantity: { type: 'int', min: 3, max: 8 },
                    cost: { type: 'expression', value: 'price * quantity' },
                },
                answer_formula: 'price',
                hint: 'Цена = стоимость ÷ количество',
                common_mistakes: [
                    { pattern: 'cost', feedback: 'Это общая стоимость. Нужно разделить на количество.' },
                ],
            },
            3: {
                template: 'Ручка стоит {price} рублей. Купили {quantity} ручек и дали {paid} рублей. Сколько рублей сдачи получили?',
                parameters: {
                    price: { type: 'int', min: 8, max: 15 },
                    quantity: { type: 'int', min: 2, max: 5 },
                    extra: { type: 'int', min: 10, max: 30 },
                    paid: { type: 'expression', value: 'price * quantity + extra' },
                },
                answer_formula: 'extra',
                hint: 'Сначала найдите стоимость покупки, затем вычтите из {paid}',
                solution: [
                    { explanation: 'Стоимость покупки:', expression: '{price} × {quantity} = {price * quantity} руб.' },
                    { explanation: 'Сдача:', expression: '{paid} - {price * quantity} = {answer} руб.' },
                ],
                common_mistakes: [
                    { pattern: 'paid - price', feedback: 'Нужно вычесть стоимость всех ручек, а не одной' },
                ],
            },
        },
    },

    // ===== ALGEBRA - Speed Problems =====
    {
        id: 'grade5-speed',
        class: 5,
        subject: 'algebra',
        section: 'Текстовые задачи',
        topic: 'speedTimeDistance',
        topic_title: 'Скорость, время, расстояние',
        problemType: 'numeric',
        skills: ['speed_time_distance', 'multiplication', 'division'],
        difficulties: {
            1: {
                template: 'Велосипедист едет со скоростью {v} км/ч. Какое расстояние он проедет за {t} часов?',
                parameters: {
                    v: { type: 'int', min: 10, max: 20 },
                    t: { type: 'int', min: 2, max: 5 },
                },
                answer_formula: 'v * t',
                hint: 'Расстояние = скорость × время',
                common_mistakes: [
                    { pattern: 'v + t', feedback: 'Нужно умножить скорость на время, а не сложить' },
                ],
            },
            2: {
                template: 'Автомобиль проехал {s} км со скоростью {v} км/ч. Сколько времени он был в пути?',
                parameters: {
                    v: { type: 'int', min: 40, max: 80 },
                    t: { type: 'int', min: 2, max: 5 },
                    s: { type: 'expression', value: 'v * t' },
                },
                answer_formula: 't',
                hint: 'Время = расстояние ÷ скорость',
                common_mistakes: [
                    { pattern: 's * v', feedback: 'Нужно делить, а не умножать' },
                ],
            },
            3: {
                template: 'Пешеход прошёл {s} км за {t} часов. С какой скоростью он шёл?',
                parameters: {
                    v: { type: 'int', min: 3, max: 6 },
                    t: { type: 'int', min: 2, max: 4 },
                    s: { type: 'expression', value: 'v * t' },
                },
                answer_formula: 'v',
                hint: 'Скорость = расстояние ÷ время',
                solution: [
                    { explanation: 'Используем формулу:', expression: 'v = S ÷ t' },
                    { explanation: 'Подставляем:', expression: 'v = {s} ÷ {t} = {answer} км/ч' },
                ],
                common_mistakes: [
                    { pattern: 's * t', feedback: 'Нужно делить расстояние на время, а не умножать' },
                ],
            },
        },
    },

    // ===== ALGEBRA - Parts Problems =====
    {
        id: 'grade5-parts',
        class: 5,
        subject: 'algebra',
        section: 'Текстовые задачи',
        topic: 'parts',
        topic_title: 'Задачи на части',
        problemType: 'numeric',
        skills: ['fraction_of_number', 'percentage_concept', 'division'],
        difficulties: {
            1: {
                template: 'Найдите 1/{n} от числа {total}',
                parameters: {
                    n: { type: 'choice', values: [2, 3, 4, 5] },
                    part: { type: 'int', min: 3, max: 12 },
                    total: { type: 'expression', value: 'n * part' },
                },
                answer_formula: 'part',
                hint: 'Чтобы найти 1/{n} от числа, разделите число на {n}',
                common_mistakes: [
                    { pattern: 'total', feedback: 'Нужно разделить на {n}' },
                ],
            },
            2: {
                template: 'Найдите {m}/{n} от числа {total}',
                parameters: {
                    n: { type: 'choice', values: [4, 5, 10] },
                    m: { type: 'int', min: 1, max: 3 },
                    multiplier: { type: 'int', min: 2, max: 6 },
                    total: { type: 'expression', value: 'n * multiplier' },
                },
                constraints: ['m < n'],
                answer_formula: '(total * m) / n',
                hint: 'Разделите {total} на {n}, затем умножьте на {m}',
                common_mistakes: [
                    { pattern: 'total / n', feedback: 'Вы нашли 1/{n}. Умножьте результат на {m}' },
                ],
            },
            3: {
                template: 'Число {part} составляет 1/{n} от неизвестного числа. Найдите это число.',
                parameters: {
                    n: { type: 'choice', values: [2, 3, 4, 5] },
                    part: { type: 'int', min: 5, max: 15 },
                },
                answer_formula: 'part * n',
                hint: 'Если {part} — это 1/{n}, то целое число в {n} раз больше',
                solution: [
                    { explanation: 'Если 1/{n} числа равна {part}' },
                    { explanation: 'То всё число:', expression: '{part} × {n} = {answer}' },
                ],
                common_mistakes: [
                    { pattern: 'part / n', feedback: 'Нужно умножить на {n}, а не делить' },
                ],
            },
        },
    },
];
