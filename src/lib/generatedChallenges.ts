import { GeneratedChallenge } from './types';

// Helper function to generate random integer in range [min, max]
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generatedChallenges: GeneratedChallenge[] = [
    // ── GRADE 5 / ALGEBRA / comparison ──────────────────────────────────────

    {
        type: 'generated',
        id: 'gen-comparison-1',
        title: 'Сравнение чисел: Двузначные',
        category: 'grade5',
        topic: 'comparison',
        difficulty: 1,
        generator: () => {
            const num1 = randomInt(10, 99);
            const num2 = randomInt(10, 99);
            return { num1, num2 };
        },
        render: (data) => ({
            question: `Сравните числа ${data.num1} и ${data.num2}. Выберите правильный знак.`,
            hint: 'Сравните числа поразрядно: десятки, затем единицы',
        }),
        validate: (data, answer) => {
            const num1 = data.num1 as number;
            const num2 = data.num2 as number;
            if (num1 > num2) return answer === '>';
            if (num1 < num2) return answer === '<';
            return answer === '=';
        },
    },

    // ── GRADE 5 / ALGEBRA / arithmetic ──────────────────────────────────────

    {
        type: 'generated',
        id: 'gen-arithmetic-1',
        title: 'Арифметическое выражение: a + b × c',
        category: 'grade5',
        topic: 'arithmetic',
        difficulty: 1,
        generator: () => {
            const a = randomInt(10, 50);
            const b = randomInt(2, 9);
            const c = randomInt(2, 9);
            const result = a + b * c;
            return { a, b, c, result };
        },
        render: (data) => ({
            question: `Вычислите: ${data.a} + ${data.b} × ${data.c} = ?`,
            hint: 'Сначала выполните умножение, затем сложение (порядок действий)',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.result as number),
        explanation: (data) => `${data.a} + ${data.b} × ${data.c} = ${data.a} + ${(data.b as number) * (data.c as number)} = ${data.result}`,
    },
    {
        type: 'generated',
        id: 'gen-arithmetic-2',
        title: 'Арифметическое выражение: a × b − c',
        category: 'grade5',
        topic: 'arithmetic',
        difficulty: 1,
        generator: () => {
            let a, b, c, result;
            do {
                a = randomInt(2, 12);
                b = randomInt(2, 12);
                c = randomInt(1, 20);
                result = a * b - c;
            } while (result <= 0);
            return { a, b, c, result };
        },
        render: (data) => ({
            question: `Вычислите: ${data.a} × ${data.b} − ${data.c} = ?`,
            hint: 'Сначала выполните умножение, затем вычитание',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.result as number),
        explanation: (data) => `${data.a} × ${data.b} − ${data.c} = ${(data.a as number) * (data.b as number)} − ${data.c} = ${data.result}`,
    },
    {
        type: 'generated',
        id: 'gen-arithmetic-3',
        title: 'Арифметическое выражение: (a + b) × c',
        category: 'grade5',
        topic: 'arithmetic',
        difficulty: 1,
        generator: () => {
            const a = randomInt(2, 10);
            const b = randomInt(2, 10);
            const c = randomInt(2, 9);
            const result = (a + b) * c;
            return { a, b, c, result };
        },
        render: (data) => ({
            question: `Вычислите: (${data.a} + ${data.b}) × ${data.c} = ?`,
            hint: 'Сначала выполните действие в скобках, затем умножение',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.result as number),
        explanation: (data) => `(${data.a} + ${data.b}) × ${data.c} = ${(data.a as number) + (data.b as number)} × ${data.c} = ${data.result}`,
    },

    // ── GRADE 5 / ALGEBRA / sequence (Закономерности) ───────────────────────

    {
        type: 'generated',
        id: 'gen-sequence-1',
        title: 'Закономерность: арифметическая прогрессия',
        category: 'grade5',
        topic: 'sequence',
        difficulty: 1,
        generator: () => {
            const start = randomInt(1, 20);
            const step = randomInt(2, 10);
            const a1 = start;
            const a2 = start + step;
            const a3 = start + 2 * step;
            const a4 = start + 3 * step;
            const answer = start + 4 * step;
            return { a1, a2, a3, a4, step, answer };
        },
        render: (data) => ({
            question: `Найдите следующее число в ряду: ${data.a1}, ${data.a2}, ${data.a3}, ${data.a4}, ?`,
            hint: 'Найдите разность между соседними числами — она одинакова',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.answer as number),
        explanation: (data) => `Каждое число увеличивается на ${data.step}. Следующее: ${data.a4} + ${data.step} = ${data.answer}`,
    },
    {
        type: 'generated',
        id: 'gen-sequence-2',
        title: 'Закономерность: геометрическая прогрессия',
        category: 'grade5',
        topic: 'sequence',
        difficulty: 1,
        generator: () => {
            const start = randomInt(1, 5);
            const ratio = randomInt(2, 4);
            const a1 = start;
            const a2 = start * ratio;
            const a3 = start * ratio ** 2;
            const a4 = start * ratio ** 3;
            const answer = start * ratio ** 4;
            return { a1, a2, a3, a4, ratio, answer };
        },
        render: (data) => ({
            question: `Найдите следующее число в ряду: ${data.a1}, ${data.a2}, ${data.a3}, ${data.a4}, ?`,
            hint: 'Найдите, во сколько раз увеличивается каждое число',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.answer as number),
        explanation: (data) => `Каждое число умножается на ${data.ratio}. Следующее: ${data.a4} × ${data.ratio} = ${data.answer}`,
    },

    // ── GRADE 5 / ALGEBRA / divisors (Кратные и делители) ───────────────────

    {
        type: 'generated',
        id: 'gen-divisors-1',
        title: 'Наибольший общий делитель',
        category: 'grade5',
        topic: 'divisors',
        difficulty: 1,
        generator: () => {
            const gcd = randomInt(2, 9);
            const a = gcd * randomInt(2, 8);
            const b = gcd * randomInt(2, 8);
            const gcdFn = (x: number, y: number): number => y === 0 ? x : gcdFn(y, x % y);
            const answer = gcdFn(a, b);
            return { a, b, answer };
        },
        render: (data) => ({
            question: `Найдите НОД (наибольший общий делитель) чисел ${data.a} и ${data.b}.`,
            hint: 'Найдите все делители каждого числа и выберите наибольший общий',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.answer as number),
        explanation: (data) => `НОД(${data.a}, ${data.b}) = ${data.answer}`,
    },
    {
        type: 'generated',
        id: 'gen-divisors-2',
        title: 'Наименьшее общее кратное',
        category: 'grade5',
        topic: 'divisors',
        difficulty: 1,
        generator: () => {
            const a = randomInt(2, 12);
            const b = randomInt(2, 12);
            const gcdFn = (x: number, y: number): number => y === 0 ? x : gcdFn(y, x % y);
            const answer = (a * b) / gcdFn(a, b);
            return { a, b, answer };
        },
        render: (data) => ({
            question: `Найдите НОК (наименьшее общее кратное) чисел ${data.a} и ${data.b}.`,
            hint: 'НОК(a, b) = a × b ÷ НОД(a, b)',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.answer as number),
        explanation: (data) => `НОК(${data.a}, ${data.b}) = ${data.a} × ${data.b} ÷ НОД = ${data.answer}`,
    },

    // ── GRADE 5 / GEOMETRY / perimeter ──────────────────────────────────────

    {
        type: 'generated',
        id: 'gen-perimeter-1',
        title: 'Периметр прямоугольника',
        category: 'grade5',
        topic: 'perimeter',
        difficulty: 1,
        generator: () => {
            const width = randomInt(3, 20);
            const height = randomInt(3, 20);
            const perimeter = 2 * (width + height);
            return { width, height, perimeter };
        },
        render: (data) => ({
            question: `Прямоугольник имеет длину ${data.width} см и ширину ${data.height} см. Чему равен его периметр?`,
            hint: 'Периметр = 2 × (длина + ширина)',
        }),
        validate: (data, answer) => {
            const userAnswer = parseFloat(answer.replace(',', '.'));
            return Math.abs(userAnswer - (data.perimeter as number)) < 0.01;
        },
        explanation: (data) => `Периметр = 2 × (${data.width} + ${data.height}) = 2 × ${(data.width as number) + (data.height as number)} = ${data.perimeter} см`,
    },
    {
        type: 'generated',
        id: 'gen-perimeter-2',
        title: 'Периметр квадрата',
        category: 'grade5',
        topic: 'perimeter',
        difficulty: 1,
        generator: () => {
            const side = randomInt(3, 25);
            const perimeter = 4 * side;
            return { side, perimeter };
        },
        render: (data) => ({
            question: `Сторона квадрата равна ${data.side} см. Чему равен его периметр?`,
            hint: 'Периметр квадрата = 4 × сторона',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.perimeter as number),
        explanation: (data) => `Периметр = 4 × ${data.side} = ${data.perimeter} см`,
    },

    // ── GRADE 5 / GEOMETRY / area (Площадь прямоугольника) ──────────────────

    {
        type: 'generated',
        id: 'gen-area-1',
        title: 'Площадь прямоугольника',
        category: 'grade5',
        topic: 'area',
        difficulty: 1,
        generator: () => {
            const width = randomInt(3, 20);
            const height = randomInt(3, 20);
            const area = width * height;
            return { width, height, area };
        },
        render: (data) => ({
            question: `Прямоугольник имеет длину ${data.width} см и ширину ${data.height} см. Чему равна его площадь?`,
            hint: 'Площадь = длина × ширина',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.area as number),
        explanation: (data) => `Площадь = ${data.width} × ${data.height} = ${data.area} см²`,
    },
    {
        type: 'generated',
        id: 'gen-area-2',
        title: 'Сторона прямоугольника по площади',
        category: 'grade5',
        topic: 'area',
        difficulty: 1,
        generator: () => {
            const width = randomInt(3, 15);
            const height = randomInt(3, 15);
            const area = width * height;
            return { width, height, area };
        },
        render: (data) => ({
            question: `Площадь прямоугольника равна ${data.area} см², одна сторона равна ${data.width} см. Найдите другую сторону.`,
            hint: 'Другая сторона = Площадь ÷ известная сторона',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.height as number),
        explanation: (data) => `Другая сторона = ${data.area} ÷ ${data.width} = ${data.height} см`,
    },

    // ── GRADE 5 / GEOMETRY / triangleType (Типы треугольников) ──────────────

    {
        type: 'generated',
        id: 'gen-triangle-type-1',
        title: 'Тип треугольника по углам',
        category: 'grade5',
        topic: 'triangleType',
        difficulty: 1,
        generator: () => {
            const types = [
                { a: 60, b: 60, c: 60, answer: 'равносторонний' },
                { a: 90, b: 45, c: 45, answer: 'прямоугольный' },
                { a: 120, b: 30, c: 30, answer: 'тупоугольный' },
                { a: 70, b: 60, c: 50, answer: 'остроугольный' },
            ];
            const t = types[randomInt(0, types.length - 1)];
            return { a: t.a, b: t.b, c: t.c, answer: t.answer };
        },
        render: (data) => ({
            question: `Треугольник имеет углы ${data.a}°, ${data.b}°, ${data.c}°. Какой это треугольник? (остроугольный / прямоугольный / тупоугольный / равносторонний)`,
            hint: 'Если все углы < 90° — остроугольный, есть 90° — прямоугольный, есть > 90° — тупоугольный',
        }),
        validate: (data, answer) => answer.toLowerCase().trim() === (data.answer as string),
        explanation: (data) => `Углы ${data.a}°, ${data.b}°, ${data.c}° → ${data.answer}`,
    },
    {
        type: 'generated',
        id: 'gen-triangle-type-2',
        title: 'Тип треугольника по сторонам',
        category: 'grade5',
        topic: 'triangleType',
        difficulty: 1,
        generator: () => {
            const types = [
                { a: 5, b: 5, c: 5, answer: 'равносторонний' },
                { a: 5, b: 5, c: 7, answer: 'равнобедренный' },
                { a: 3, b: 4, c: 5, answer: 'разносторонний' },
                { a: 6, b: 6, c: 9, answer: 'равнобедренный' },
            ];
            const t = types[randomInt(0, types.length - 1)];
            return { a: t.a, b: t.b, c: t.c, answer: t.answer };
        },
        render: (data) => ({
            question: `Треугольник имеет стороны ${data.a}, ${data.b} и ${data.c}. Какой это треугольник? (равносторонний / равнобедренный / разносторонний)`,
            hint: 'Все стороны равны — равносторонний, две равны — равнобедренный, все разные — разносторонний',
        }),
        validate: (data, answer) => answer.toLowerCase().trim() === (data.answer as string),
        explanation: (data) => `Стороны ${data.a}, ${data.b}, ${data.c} → ${data.answer}`,
    },

    // ── GRADE 5 / LOGIC / magicSquare (Магические квадраты) ─────────────────

    {
        type: 'generated',
        id: 'gen-magic-1',
        title: 'Магический квадрат: найти число',
        category: 'grade5',
        topic: 'magicSquare',
        difficulty: 2,
        generator: () => {
            // Classic 3×3 magic square based on offset
            const n = randomInt(0, 5);
            // Base magic square: sum = 15 + 9n
            const base = [2, 7, 6, 9, 5, 1, 4, 3, 8];
            const sq = base.map(v => v + n * 3);
            const magicSum = 15 + n * 9;
            // Hide one cell (index 4 = center)
            const hiddenIdx = randomInt(0, 8);
            const hiddenVal = sq[hiddenIdx];
            return { sq: sq.map((v, i) => i === hiddenIdx ? 0 : v), hiddenIdx, hiddenVal, magicSum };
        },
        render: (data) => {
            const sq = data.sq as number[];
            const rows = [
                `${sq[0] || '?'}  ${sq[1] || '?'}  ${sq[2] || '?'}`,
                `${sq[3] || '?'}  ${sq[4] || '?'}  ${sq[5] || '?'}`,
                `${sq[6] || '?'}  ${sq[7] || '?'}  ${sq[8] || '?'}`,
            ];
            return {
                question: `Магический квадрат (сумма строк, столбцов и диагоналей = ${data.magicSum}):\n${rows.join('\n')}\nНайдите пропущенное число (?).`,
                hint: `Сумма каждой строки, столбца и диагонали равна ${data.magicSum}`,
            };
        },
        validate: (data, answer) => parseInt(answer, 10) === (data.hiddenVal as number),
        explanation: (data) => `Пропущенное число: ${data.hiddenVal}`,
    },

    // ── GRADE 5 / LOGIC / numberSequence (Числовые последовательности) ───────

    {
        type: 'generated',
        id: 'gen-numseq-1',
        title: 'Числовая последовательность: пропущенное число',
        category: 'grade5',
        topic: 'numberSequence',
        difficulty: 1,
        generator: () => {
            const start = randomInt(1, 30);
            const step = randomInt(3, 15);
            const pos = randomInt(1, 3); // which element is hidden (0-indexed in middle)
            const seq = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
            const answer = seq[pos + 1];
            const display = seq.map((v, i) => i === pos + 1 ? '?' : v);
            return { display, answer, step };
        },
        render: (data) => ({
            question: `Найдите пропущенное число: ${(data.display as number[]).join(', ')}`,
            hint: 'Найдите разность между соседними числами',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.answer as number),
        explanation: (data) => `Шаг последовательности: ${data.step}. Пропущенное число: ${data.answer}`,
    },
    {
        type: 'generated',
        id: 'gen-numseq-2',
        title: 'Числовая последовательность: убывающая',
        category: 'grade5',
        topic: 'numberSequence',
        difficulty: 1,
        generator: () => {
            const start = randomInt(50, 100);
            const step = randomInt(3, 12);
            const seq = [start, start - step, start - 2 * step, start - 3 * step, start - 4 * step];
            const answer = start - 5 * step;
            return { seq, answer, step };
        },
        render: (data) => ({
            question: `Найдите следующее число: ${(data.seq as number[]).join(', ')}, ?`,
            hint: 'Последовательность убывает — найдите, на сколько уменьшается каждое число',
        }),
        validate: (data, answer) => parseInt(answer, 10) === (data.answer as number),
        explanation: (data) => `Каждое число уменьшается на ${data.step}. Следующее: ${(data.seq as number[])[4]} − ${data.step} = ${data.answer}`,
    },

    // ── GRADE 7 / ALGEBRA / linear ───────────────────────────────────────────

    {
        type: 'generated',
        id: 'gen-linear-1',
        title: 'Линейная функция: Найти b',
        category: 'grade7',
        topic: 'linear',
        difficulty: 2,
        generator: () => {
            const x = randomInt(1, 10);
            const y = randomInt(5, 30);
            const b = y - 2 * x;
            return { x, y, b };
        },
        render: (data) => ({
            question: `Функция y = 2x + b проходит через точку (${data.x}, ${data.y}). Чему равен коэффициент b?`,
            hint: 'Подставьте координаты точки в формулу: y = 2x + b, затем выразите b',
        }),
        validate: (data, answer) => {
            const userAnswer = parseFloat(answer.replace(',', '.'));
            return Math.abs(userAnswer - (data.b as number)) < 0.01;
        },
        explanation: (data) => `${data.y} = 2 × ${data.x} + b → b = ${data.y} − ${2 * (data.x as number)} = ${data.b}`,
    },
];
