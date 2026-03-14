import { ProblemTemplate } from '../../types';

export const grade6Templates: ProblemTemplate[] = [
    // =====================================================================
    // GRADE 6
    // =====================================================================

    // ===== FRACTION PROPERTY (Основное свойство дроби) =====
    {
        id: 'grade6-fraction-property',
        class: 6,
        subject: 'algebra',
        section: 'Дроби',
        topic: 'fraction_property',
        topic_title: 'Основное свойство дроби',
        problemType: 'numeric',
        skills: ['fraction_equivalence', 'fraction_property'],
        tags: ['fractions', 'equivalence', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // a/b = x/c, c = b*k → x = a*k (умножение числителя и знаменателя на k).
                // Кортежи [a, b, c, x]: i=0:(1,2,4,2) i=1:(1,2,6,3) i=2:(1,2,8,4) i=3:(1,2,10,5)
                // i=4:(2,3,9,6) i=5:(2,3,12,8) i=6:(2,3,15,10) i=7:(3,4,12,9)
                template: 'Заполните пропуск: {a}/{b} = x/{c}. Найдите x.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i<=3?1:i<=6?2:3' },
                    b: { type: 'expression', value: 'i<=3?2:i<=6?3:4' },
                    c: { type: 'expression', value: 'i===0?4:i===1?6:i===2?8:i===3?10:i===4?9:i===5?12:i===6?15:12' },
                    k: { type: 'expression', value: 'i===0?2:i===1?3:i===2?4:i===3?5:i===4?3:i===5?4:i===6?5:3' },
                    x: { type: 'expression', value: 'i===0?2:i===1?3:i===2?4:i===3?5:i===4?6:i===5?8:i===6?10:9' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Найдите, во сколько раз {c} больше {b}: {c} ÷ {b} = {k}. Умножьте числитель на то же число: {a} × {k}.',
                solution: [
                    { explanation: '{c} ÷ {b} = {k} — знаменатель умножили на {k}.' },
                    { explanation: 'Числитель тоже умножаем на {k}: {a} × {k} =', result: '{x}' },
                ],
                common_mistakes: [
                    { pattern: 'a + k', feedback: 'Нужно умножить числитель на {k}, а не прибавлять: {a} × {k} = {x}.' },
                    { pattern: 'c / b', feedback: 'Это множитель {k}, но нужно умножить числитель: {a} × {k} = {x}.' },
                ],
            },
            2: {
                // a/b = x/c, c = b/k → x = a/k (деление, сокращение).
                // Кортежи [a, b, c, x]: i=0:(2,4,2,1) i=1:(4,6,3,2) i=2:(6,8,4,3) i=3:(8,10,5,4)
                // i=4:(10,12,6,5) i=5:(12,14,7,6) i=6:(14,16,8,7) i=7:(16,18,9,8)
                template: 'Заполните пропуск: {a}/{b} = x/{c}. Найдите x.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?2:i===1?4:i===2?6:i===3?8:i===4?10:i===5?12:i===6?14:16' },
                    b: { type: 'expression', value: 'i===0?4:i===1?6:i===2?8:i===3?10:i===4?12:i===5?14:i===6?16:18' },
                    c: { type: 'expression', value: 'i===0?2:i===1?3:i===2?4:i===3?5:i===4?6:i===5?7:i===6?8:9' },
                    k: { type: 'expression', value: '2' },
                    x: { type: 'expression', value: 'i===0?1:i===1?2:i===2?3:i===3?4:i===4?5:i===5?6:i===6?7:8' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Знаменатель уменьшился: {b} ÷ {c} = {k}. Числитель тоже делим на {k}: {a} ÷ {k}.',
                solution: [
                    { explanation: '{b} ÷ {c} = {k} — знаменатель разделили на {k}.' },
                    { explanation: 'Числитель тоже делим на {k}: {a} ÷ {k} =', result: '{x}' },
                ],
                common_mistakes: [
                    { pattern: 'a - k', feedback: 'Нужно разделить числитель на {k}: {a} ÷ {k} = {x}.' },
                    { pattern: 'a * k', feedback: 'Знаменатель уменьшился (делили на {k}), значит числитель тоже делим: {a} ÷ {k} = {x}.' },
                ],
            },
            3: {
                // Крупные коэффициенты. Кортежи [a, b, c, x, k] — все проверены.
                // i=0:(3,5,15,9,3) i=1:(2,7,21,6,3) i=2:(3,8,24,9,3) i=3:(5,6,18,15,3)
                // i=4:(4,9,27,12,3) i=5:(3,4,16,12,4) i=6:(5,8,32,20,4) i=7:(2,5,20,8,4)
                template: 'Заполните пропуск: {a}/{b} = x/{c}. Найдите x.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?3:i===1?2:i===2?3:i===3?5:i===4?4:i===5?3:i===6?5:2' },
                    b: { type: 'expression', value: 'i===0?5:i===1?7:i===2?8:i===3?6:i===4?9:i===5?4:i===6?8:5' },
                    c: { type: 'expression', value: 'i===0?15:i===1?21:i===2?24:i===3?18:i===4?27:i===5?16:i===6?32:20' },
                    k: { type: 'expression', value: 'i<=4?3:4' },
                    x: { type: 'expression', value: 'i===0?9:i===1?6:i===2?9:i===3?15:i===4?12:i===5?12:i===6?20:8' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: '{c} ÷ {b} = {k}. Умножьте числитель на {k}: {a} × {k} = ?',
                solution: [
                    { explanation: '{c} ÷ {b} = {k} — знаменатель умножили на {k}.' },
                    { explanation: 'Числитель умножаем на {k}: {a} × {k} =', result: '{x}' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'Нужно умножить числитель на множитель {k}: {a} × {k} = {x}.' },
                    { pattern: 'c / a', feedback: 'Ответ — новый числитель: {a} × {k} = {x}.' },
                ],
            },
        },
    },

    // ===== RATIOS (Отношения) =====
    {
        id: 'grade6-ratios',
        class: 6,
        subject: 'algebra',
        section: 'Отношения и пропорции',
        topic: 'ratios',
        topic_title: 'Отношения',
        problemType: 'numeric',
        skills: ['ratios', 'fraction_reduction'],
        tags: ['ratios', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // a : b — целое (a кратно b). Кортежи [a, b, ans] — все проверены.
                // i=0:(6,2,3) i=1:(10,5,2) i=2:(12,3,4) i=3:(15,5,3)
                // i=4:(20,4,5) i=5:(18,6,3) i=6:(14,7,2) i=7:(24,8,3)
                template: 'Найдите отношение числа {a} к числу {b}.',
                parameters: {
                    i:   { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a:   { type: 'expression', value: 'i===0?6:i===1?10:i===2?12:i===3?15:i===4?20:i===5?18:i===6?14:24' },
                    b:   { type: 'expression', value: 'i===0?2:i===1?5:i===2?3:i===3?5:i===4?4:i===5?6:i===6?7:8' },
                    ans: { type: 'expression', value: 'i===0?3:i===1?2:i===2?4:i===3?3:i===4?5:i===5?3:i===6?2:3' },
                },
                constraints: [],
                answer_formula: 'ans',
                answer_type: 'number',
                hint: 'Отношение a к b = a ÷ b = {a} ÷ {b}.',
                solution: [
                    { explanation: 'Отношение {a} к {b} = {a} ÷ {b} =', result: '{ans}' },
                ],
                common_mistakes: [
                    { pattern: 'a - b', feedback: 'Отношение — это деление, а не вычитание: {a} ÷ {b} = {ans}.' },
                    { pattern: 'b / a', feedback: 'Отношение {a} к {b} = {a}/{b} = {ans}, а не {b}/{a}.' },
                ],
            },
            2: {
                // a : b — несократимая дробь n/d. Кортежи [a, b, n, d] — все проверены.
                // i=0:(6,4,3,2) i=1:(10,6,5,3) i=2:(8,6,4,3) i=3:(9,12,3,4)
                // i=4:(4,6,2,3) i=5:(14,6,7,3) i=6:(9,15,3,5) i=7:(10,8,5,4)
                template: 'Найдите отношение числа {a} к числу {b}. Ответ дайте в виде несократимой дроби.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?6:i===1?10:i===2?8:i===3?9:i===4?4:i===5?14:i===6?9:10' },
                    b: { type: 'expression', value: 'i===0?4:i===1?6:i===2?6:i===3?12:i===4?6:i===5?6:i===6?15:8' },
                    n: { type: 'expression', value: 'i===0?3:i===1?5:i===2?4:i===3?3:i===4?2:i===5?7:i===6?3:5' },
                    d: { type: 'expression', value: 'i===0?2:i===1?3:i===2?3:i===3?4:i===4?3:i===5?3:i===6?5:4' },
                },
                constraints: [],
                answer_formula: 'n / d',
                answer_type: 'fraction',
                hint: 'Отношение {a} к {b} = {a}/{b}. Сократите дробь на НОД({a}, {b}).',
                solution: [
                    { explanation: '{a} : {b} = {a}/{b}.' },
                    { explanation: 'Сокращаем на НОД({a}, {b}):', result: '{n}/{d}' },
                ],
                common_mistakes: [
                    { pattern: 'a / b', feedback: 'Дробь {a}/{b} нужно сократить до несократимой: {n}/{d}.' },
                    { pattern: 'd / n', feedback: 'Отношение {a} к {b} = {n}/{d}, а не {d}/{n}. Порядок важен.' },
                ],
            },
            3: {
                // Отношение величин с разными единицами — переводим в одни.
                // Кортежи [small, large, n, d]:
                // i=0: 500г:2кг → 500:2000 = 1/4
                // i=1: 30мин:1ч → 30:60 = 1/2
                // i=2: 25см:1м → 25:100 = 1/4
                // i=3: 250г:1кг → 250:1000 = 1/4
                // i=4: 15мин:1ч → 15:60 = 1/4
                // i=5: 200м:1км → 200:1000 = 1/5
                // i=6: 50см:2м → 50:200 = 1/4
                // i=7: 400г:2кг → 400:2000 = 1/5
                template: 'Найдите отношение {descA} к {descB}. Ответ дайте в виде несократимой дроби.',
                parameters: {
                    i:     { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    descA: { type: 'expression', value: 'i===0?"500 г":i===1?"30 мин":i===2?"25 см":i===3?"250 г":i===4?"15 мин":i===5?"200 м":i===6?"50 см":"400 г"' },
                    descB: { type: 'expression', value: 'i===0?"2 кг":i===1?"1 ч":i===2?"1 м":i===3?"1 кг":i===4?"1 ч":i===5?"1 км":i===6?"2 м":"2 кг"' },
                    small: { type: 'expression', value: 'i===0?500:i===1?30:i===2?25:i===3?250:i===4?15:i===5?200:i===6?50:400' },
                    large: { type: 'expression', value: 'i===0?2000:i===1?60:i===2?100:i===3?1000:i===4?60:i===5?1000:i===6?200:2000' },
                    n:     { type: 'expression', value: '1' },
                    d:     { type: 'expression', value: 'i===0?4:i===1?2:i===2?4:i===3?4:i===4?4:i===5?5:i===6?4:5' },
                },
                constraints: [],
                answer_formula: 'n / d',
                answer_type: 'fraction',
                hint: 'Переведите обе величины в одни единицы, затем запишите дробь и сократите.',
                solution: [
                    { explanation: 'Переводим в одни единицы: {small} и {large}.' },
                    { explanation: 'Отношение {small}/{large} =', result: '{n}/{d}' },
                ],
                common_mistakes: [
                    { pattern: 'small / large', feedback: 'Верно начало — {small}/{large}. Теперь сократите на НОД({small},{large}).' },
                    { pattern: 'd / n', feedback: 'Порядок важен: отношение первой величины ко второй = {n}/{d}.' },
                ],
            },
        },
    },

    // ===== PERCENT BASICS (Понятие процента) =====
    {
        id: 'grade6-percent-basics',
        class: 6,
        subject: 'algebra',
        section: 'Проценты',
        topic: 'percent_basics',
        topic_title: 'Понятие процента',
        problemType: 'numeric',
        skills: ['percent', 'fraction_equivalence'],
        tags: ['percent', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // p% → числитель дроби p/100. Ответ = p (число).
                // p ∈ {1, 5, 10, 20, 25, 50, 75, 100}.
                template: 'Запишите {p}% в виде дроби со знаменателем 100. Чему равен числитель?',
                parameters: {
                    p: { type: 'choice', values: [1, 5, 10, 20, 25, 50, 75, 100] },
                },
                constraints: [],
                answer_formula: 'p',
                answer_type: 'number',
                hint: '1% = 1/100. Значит {p}% = {p}/100. Числитель равен количеству процентов.',
                solution: [
                    { explanation: '{p}% означает «{p} из 100».' },
                    { explanation: '{p}% = {p}/100.', result: 'числитель = {p}' },
                ],
                common_mistakes: [
                    { pattern: '100', feedback: 'Знаменатель равен 100, а вопрос про числитель — он равен {p}.' },
                    { pattern: 'p / 100', feedback: 'Правильно, что {p}% = {p}/100. Числитель этой дроби = {p}.' },
                ],
            },
            2: {
                // Дробь → %. answer = a*100/b (целое число).
                // Кортежи [a, b, p] — все проверены (p = a*100/b целое).
                // i=0:(1,2,50) i=1:(1,4,25) i=2:(3,4,75) i=3:(1,5,20)
                // i=4:(2,5,40) i=5:(3,5,60) i=6:(4,5,80) i=7:(1,10,10)
                template: 'Выразите дробь {a}/{b} в процентах.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?1:i===1?1:i===2?3:i===3?1:i===4?2:i===5?3:i===6?4:1' },
                    b: { type: 'expression', value: 'i===0?2:i===1?4:i===2?4:i===3?5:i===4?5:i===5?5:i===6?5:10' },
                    p: { type: 'expression', value: 'i===0?50:i===1?25:i===2?75:i===3?20:i===4?40:i===5?60:i===6?80:10' },
                },
                constraints: [],
                answer_formula: 'p',
                answer_type: 'number',
                hint: 'Чтобы перевести дробь в проценты, умножьте на 100: {a}/{b} × 100 = ?',
                solution: [
                    { explanation: '{a}/{b} × 100 = {a} × 100 ÷ {b}.' },
                    { explanation: 'Результат:', result: '{p}%' },
                ],
                common_mistakes: [
                    { pattern: 'a / b', feedback: 'Это десятичная запись. Для процентов умножьте на 100: ({a}/{b}) × 100 = {p}.' },
                    { pattern: 'a * b', feedback: 'Умножьте дробь на 100: ({a}/{b}) × 100 = {p}%.' },
                ],
            },
            3: {
                // p% → несократимая дробь (answer_type: fraction).
                // Кортежи [p, n, d]: p/100 сокращается до n/d — все проверены.
                // i=0:(5,1,20) i=1:(10,1,10) i=2:(20,1,5) i=3:(25,1,4)
                // i=4:(40,2,5) i=5:(50,1,2) i=6:(60,3,5) i=7:(75,3,4)
                template: 'Запишите {p}% в виде несократимой дроби.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    p: { type: 'expression', value: 'i===0?5:i===1?10:i===2?20:i===3?25:i===4?40:i===5?50:i===6?60:75' },
                    n: { type: 'expression', value: 'i===0?1:i===1?1:i===2?1:i===3?1:i===4?2:i===5?1:i===6?3:3' },
                    d: { type: 'expression', value: 'i===0?20:i===1?10:i===2?5:i===3?4:i===4?5:i===5?2:i===6?5:4' },
                },
                constraints: [],
                answer_formula: 'n / d',
                answer_type: 'fraction',
                hint: '{p}% = {p}/100. Сократите дробь: НОД({p}, 100) = ?',
                solution: [
                    { explanation: '{p}% = {p}/100.' },
                    { explanation: 'Сокращаем на НОД({p}, 100):', result: '{n}/{d}' },
                ],
                common_mistakes: [
                    { pattern: 'p / 100', feedback: 'Верно, {p}% = {p}/100. Но нужно сократить: ответ = {n}/{d}.' },
                    { pattern: 'd / n', feedback: 'Проверьте порядок: {p}% = {n}/{d}, а не {d}/{n}.' },
                ],
            },
        },
    },

    // ===== FRACTIONS - Fraction Reduction (Сокращение дробей) =====
    {
        id: 'grade6-fraction-reduction',
        class: 6,
        subject: 'algebra',
        section: 'Обыкновенные дроби',
        topic: 'fraction_reduction',
        topic_title: 'Сокращение дробей',
        problemType: 'numeric',
        skills: ['fraction_reduction', 'gcd'],
        version: 1,
        difficulties: {
            1: {
                // Сократить дробь — числитель и знаменатель делятся на одно число
                template: 'Сократите дробь {num}/{den}. Чему равен числитель результата?',
                parameters: {
                    k:   { type: 'choice', values: [2, 3, 4, 5] },
                    p:   { type: 'choice', values: [1, 1, 2, 3, 1] },
                    q:   { type: 'choice', values: [2, 3, 5, 7, 4] },
                    num: { type: 'expression', value: 'p * k' },
                    den: { type: 'expression', value: 'q * k' },
                },
                constraints: ['p < q'],
                answer_formula: 'p',
                hint: 'Найдите НОД числителя и знаменателя и разделите оба на него.',
                solution: [
                    { explanation: 'Находим общий множитель:', expression: 'НОД({num}, {den}) = {k}' },
                    { explanation: 'Делим числитель и знаменатель на {k}:', expression: '{num} ÷ {k} = {p},  {den} ÷ {k} = {q}' },
                    { explanation: 'Результат:', result: '{p}/{q}' },
                ],
            },
            2: {
                // Сократить дробь — нужно найти знаменатель результата
                template: 'Сократите дробь {num}/{den}. Чему равен знаменатель результата?',
                parameters: {
                    k:   { type: 'choice', values: [2, 3, 4, 5, 6] },
                    p:   { type: 'choice', values: [1, 2, 3, 1, 3] },
                    q:   { type: 'choice', values: [3, 5, 7, 4, 4] },
                    num: { type: 'expression', value: 'p * k' },
                    den: { type: 'expression', value: 'q * k' },
                },
                constraints: ['p < q'],
                answer_formula: 'q',
                hint: 'Разделите знаменатель на НОД числителя и знаменателя.',
                solution: [
                    { explanation: 'Находим общий множитель:', expression: 'НОД({num}, {den}) = {k}' },
                    { explanation: 'Знаменатель после сокращения:', expression: '{den} ÷ {k} = {q}' },
                    { explanation: 'Результат:', result: '{p}/{q}' },
                ],
            },
            3: {
                // Дробь уже несократима — проверить это
                template: 'Является ли дробь {num}/{den} несократимой? Ответьте 1 (да) или 0 (нет).',
                parameters: {
                    // p,q — взаимно простые числа (несократимая пара)
                    p: { type: 'choice', values: [1, 2, 3, 5, 7] },
                    q: { type: 'choice', values: [5, 7, 11, 13] },
                    // k=1 → несократимая (num=p, den=q), k>1 → сократимая
                    k: { type: 'choice', values: [1, 1, 2, 3] }, // 1 встречается чаще
                    num: { type: 'expression', value: 'p * k' },
                    den: { type: 'expression', value: 'q * k' },
                },
                constraints: ['p < q', 'p !== q'],
                answer_formula: 'k === 1 ? 1 : 0',
                hint: 'Дробь несократима, если НОД числителя и знаменателя равен 1.',
                solution: [
                    { explanation: 'Находим НОД({num}, {den}).' },
                    { explanation: 'Если НОД = 1 — дробь несократима, иначе — сократима.' },
                ],
            },
            4: {
                // Найти наименьшую форму дроби — ответить суммой числителя и знаменателя
                // p и q выбраны взаимно простыми, чтобы p*k / q*k сокращалось ровно на k
                template: 'Сократите дробь {num}/{den} до конца. Найдите сумму числителя и знаменателя результата.',
                parameters: {
                    k: { type: 'choice', values: [2, 3, 4, 5] },
                    // взаимно простые пары (p,q)
                    p: { type: 'choice', values: [1, 1, 1, 2, 3] },
                    q: { type: 'choice', values: [2, 3, 4, 5, 7] },
                    num: { type: 'expression', value: 'p * k' },
                    den: { type: 'expression', value: 'q * k' },
                },
                constraints: ['p < q'],
                answer_formula: 'p + q',
                hint: 'Сократите дробь и сложите числитель и знаменатель результата.',
                solution: [
                    { explanation: 'НОД({num}, {den}) = {k}.' },
                    { explanation: 'Сокращённая дробь: {p}/{q}.' },
                    { explanation: 'Сумма: {p} + {q} = {answer}.' },
                ],
            },
        },
    },

    // ===== FRACTIONS - Common Denominator (Приведение к общему знаменателю) =====
    {
        id: 'grade6-common-denominator',
        class: 6,
        subject: 'algebra',
        section: 'Обыкновенные дроби',
        topic: 'common_denominator',
        topic_title: 'Приведение дробей к общему знаменателю',
        problemType: 'numeric',
        skills: ['fraction_reduction', 'common_denominator'],
        version: 1,
        difficulties: {
            1: {
                // Привести одну дробь к заданному знаменателю.
                // b и m независимы → lcm = b*m всегда корректен (b ≠ m гарантирует b*m > b).
                template: 'Приведите дробь {a}/{b} к знаменателю {lcm}. Введите результат в виде дроби.',
                parameters: {
                    b:   { type: 'choice', values: [2, 3, 4, 5, 3, 4] },
                    m:   { type: 'choice', values: [3, 4, 3, 4, 5, 5] },
                    a:   { type: 'int', min: 1, max: 4 },
                    lcm: { type: 'expression', value: 'b * m' },
                    num: { type: 'expression', value: 'a * m' },
                },
                constraints: ['a < b', 'b !== m', 'b * m <= 60'],
                answer_formula: 'num / lcm',
                answer_type: 'fraction',
                hint: 'Найдите, на сколько надо умножить знаменатель {b}, чтобы получить {lcm}. Умножьте числитель на то же число.',
                solution: [
                    { explanation: 'Знаменатель {b} умножаем на {m}, чтобы получить {lcm}.' },
                    { explanation: 'Умножаем числитель на то же число:', expression: '{a} × {m} = {num}' },
                    { explanation: 'Результат:', result: '{num}/{lcm}' },
                ],
            },
            2: {
                // Привести дробь к НОК двух знаменателей, где НОК < b*d.
                // Используем один choice-индекс i для синхронного выбора пары (b, d, lcm).
                // Пары: (4,6,12), (6,4,12), (3,9,9), (6,9,18), (4,12,12)
                template: 'Приведите дробь {a}/{b} к общему знаменателю дробей {a}/{b} и {c}/{d}. Введите результат в виде дроби.',
                parameters: {
                    i:   { type: 'choice', values: [0, 1, 2, 3, 4] },
                    b:   { type: 'expression', value: 'i === 0 ? 4 : i === 1 ? 6 : i === 2 ? 3 : i === 3 ? 6 : 4' },
                    d:   { type: 'expression', value: 'i === 0 ? 6 : i === 1 ? 4 : i === 2 ? 9 : i === 3 ? 9 : 12' },
                    lcm: { type: 'expression', value: 'i === 0 ? 12 : i === 1 ? 12 : i === 2 ? 9 : i === 3 ? 18 : 12' },
                    mb:  { type: 'expression', value: 'lcm / b' },
                    md:  { type: 'expression', value: 'lcm / d' },
                    a:   { type: 'int', min: 1, max: 3 },
                    c:   { type: 'int', min: 1, max: 3 },
                    num: { type: 'expression', value: 'a * mb' },
                },
                constraints: ['a < b', 'c < d'],
                answer_formula: 'num / lcm',
                answer_type: 'fraction',
                hint: 'НОК({b}, {d}) = {lcm}. Умножьте числитель и знаменатель дроби {a}/{b} на {mb}.',
                solution: [
                    { explanation: 'Находим НОК({b}, {d}) = {lcm}.' },
                    { explanation: 'Множитель для {a}/{b}:', expression: '{lcm} ÷ {b} = {mb}' },
                    { explanation: 'Умножаем числитель:', expression: '{a} × {mb} = {num}' },
                    { explanation: 'Результат:', result: '{num}/{lcm}' },
                ],
            },
            3: {
                // Сложить две дроби, где НОК = b*d (знаменатели взаимно просты).
                // Пары (b,d): (2,3),(2,5),(3,5),(3,7),(5,7) — все с НОД=1.
                // Для этих пар при a<b, c<d суммы a/b+c/d всегда несократимы (проверено перебором).
                // Один индекс i синхронизирует b и d — исключает b===d.
                template: 'Вычислите: {a}/{b} + {c}/{d}. Введите ответ в виде несократимой дроби.',
                parameters: {
                    i:    { type: 'choice', values: [0, 1, 2, 3, 4] },
                    b:    { type: 'expression', value: 'i===0?2:i===1?2:i===2?3:i===3?3:5' },
                    d:    { type: 'expression', value: 'i===0?3:i===1?5:i===2?5:i===3?7:7' },
                    a:    { type: 'int', min: 1, max: 4 },
                    c:    { type: 'int', min: 1, max: 4 },
                    lcm:  { type: 'expression', value: 'b * d' },
                    an:   { type: 'expression', value: 'a * d' },
                    cn:   { type: 'expression', value: 'c * b' },
                    snum: { type: 'expression', value: 'a * d + c * b' },
                },
                constraints: ['a < b', 'c < d'],
                answer_formula: 'snum / lcm',
                answer_type: 'fraction',
                hint: 'НОК({b}, {d}) = {lcm}. Приведите дроби к общему знаменателю, затем сложите числители.',
                solution: [
                    { explanation: 'НОК({b}, {d}) = {lcm}.' },
                    { explanation: 'Приводим дроби:', expression: '{a}/{b} = {an}/{lcm},  {c}/{d} = {cn}/{lcm}' },
                    { explanation: 'Складываем числители:', expression: '{an} + {cn} = {snum}' },
                    { explanation: 'Результат:', result: '{snum}/{lcm}' },
                ],
                common_mistakes: [
                    { pattern: 'a + c + "/" + (b + d)', feedback: 'Нельзя складывать числители и знаменатели отдельно. Нужно привести к общему знаменателю.' },
                ],
            },
            4: {
                // Сложить две дроби, где НОК < b*d.
                // Все параметры (a,b,c,d,lcm) зашиты как safe-кортежи через один индекс i —
                // это гарантирует что сумма snum/lcm всегда несократима (проверено перебором).
                // Кортежи: [a, b, c, d, lcm]
                // 0:(1,4,1,6,12) 1:(1,4,2,6,12) 2:(3,4,1,6,12) 3:(3,4,2,6,12)
                // 4:(1,6,1,9,18) 5:(1,6,2,9,18) 6:(3,6,1,9,18) 7:(3,6,2,9,18)
                // 8:(1,3,1,9,9)  9:(1,3,2,9,9)  10:(2,3,1,9,9) 11:(2,3,2,9,9)
                // 12:(1,6,1,4,12) 13:(1,6,3,4,12) 14:(2,6,1,4,12) 15:(2,6,3,4,12)
                // 16:(1,4,1,9,36) 17:(1,4,2,9,36) 18:(3,4,1,9,36) 19:(3,4,2,9,36)
                template: 'Вычислите: {a}/{b} + {c}/{d}. Введите ответ в виде несократимой дроби.',
                parameters: {
                    i:    { type: 'choice', values: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19] },
                    a:    { type: 'expression', value: 'i===0?1:i===1?1:i===2?3:i===3?3:i===4?1:i===5?1:i===6?3:i===7?3:i===8?1:i===9?1:i===10?2:i===11?2:i===12?1:i===13?1:i===14?2:i===15?2:i===16?1:i===17?1:i===18?3:3' },
                    b:    { type: 'expression', value: 'i<=3?4:i<=7?6:i<=11?3:i<=15?6:4' },
                    c:    { type: 'expression', value: 'i===0?1:i===1?2:i===2?1:i===3?2:i===4?1:i===5?2:i===6?1:i===7?2:i===8?1:i===9?2:i===10?1:i===11?2:i===12?1:i===13?3:i===14?1:i===15?3:i===16?1:i===17?2:i===18?1:2' },
                    d:    { type: 'expression', value: 'i<=3?6:i<=7?9:i<=11?9:i<=15?4:9' },
                    lcm:  { type: 'expression', value: 'i<=3?12:i<=7?18:i<=11?9:i<=15?12:36' },
                    mb:   { type: 'expression', value: 'lcm / b' },
                    md:   { type: 'expression', value: 'lcm / d' },
                    an:   { type: 'expression', value: 'a * mb' },
                    cn:   { type: 'expression', value: 'c * md' },
                    snum: { type: 'expression', value: 'a * mb + c * md' },
                },
                answer_formula: 'snum / lcm',
                answer_type: 'fraction',
                hint: 'НОК({b}, {d}) = {lcm} — это меньше {b}×{d}. Найдите множители для каждой дроби.',
                solution: [
                    { explanation: 'НОК({b}, {d}) = {lcm}.' },
                    { explanation: 'Множители: для {b} → ×{mb}, для {d} → ×{md}.' },
                    { explanation: 'Приводим дроби:', expression: '{a}/{b} = {an}/{lcm},  {c}/{d} = {cn}/{lcm}' },
                    { explanation: 'Складываем:', expression: '{an} + {cn} = {snum}' },
                    { explanation: 'Результат:', result: '{snum}/{lcm}' },
                ],
                common_mistakes: [
                    { pattern: 'a + c + "/" + (b * d)', feedback: 'НОК({b}, {d}) = {lcm}, а не {b}×{d}. Используй наименьший общий знаменатель.' },
                ],
            },
        },
    },

    // ===== FIGURE AREA (Площадь треугольника и трапеции) =====
    {
        id: 'grade6-figureArea',
        class: 6,
        subject: 'geometry',
        section: 'Геометрия',
        topic: 'figureArea',
        topic_title: 'Площадь треугольника и трапеции',
        problemType: 'numeric',
        skills: ['area', 'triangle_area', 'trapezoid_area'],
        tags: ['area', 'geometry', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // Прямоугольный треугольник: S = a*b/2. Один катет чётный → S целая.
                // Кортежи [a, b, s] — все проверены.
                // i=0:(4,5,10)  i=1:(6,5,15)  i=2:(8,5,20)  i=3:(4,7,14)
                // i=4:(6,7,21)  i=5:(8,7,28)  i=6:(10,6,30) i=7:(6,9,27)
                template: 'Найдите площадь прямоугольного треугольника с катетами {a} см и {b} см.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?4:i===1?6:i===2?8:i===3?4:i===4?6:i===5?8:i===6?10:6' },
                    b: { type: 'expression', value: 'i===0?5:i===1?5:i===2?5:i===3?7:i===4?7:i===5?7:i===6?6:9' },
                    s: { type: 'expression', value: 'i===0?10:i===1?15:i===2?20:i===3?14:i===4?21:i===5?28:i===6?30:27' },
                },
                constraints: [],
                answer_formula: 's',
                answer_type: 'number',
                hint: 'Площадь прямоугольного треугольника = (катет × катет) ÷ 2. Не забудь поделить на 2!',
                solution: [
                    { explanation: 'Формула: S = (a × b) ÷ 2.' },
                    { explanation: 'S = ({a} × {b}) ÷ 2 =', result: '{s} см²' },
                ],
                common_mistakes: [
                    { pattern: 'a * b', feedback: 'Это площадь прямоугольника. Треугольник — половина: ({a} × {b}) ÷ 2 = {s}.' },
                    { pattern: 'a + b', feedback: 'Сумма катетов — не площадь. S = ({a} × {b}) ÷ 2 = {s} см².' },
                ],
            },
            2: {
                // Произвольный треугольник: S = a*h/2. Основание чётное → S целая.
                // Кортежи [a, h, s] — все проверены.
                // i=0:(6,5,15)  i=1:(8,5,20)  i=2:(10,4,20) i=3:(6,7,21)
                // i=4:(8,6,24)  i=5:(10,5,25) i=6:(12,4,24) i=7:(8,9,36)
                template: 'Найдите площадь треугольника, если его основание равно {a} см, а высота, проведённая к нему, равна {h} см.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?6:i===1?8:i===2?10:i===3?6:i===4?8:i===5?10:i===6?12:8' },
                    h: { type: 'expression', value: 'i===0?5:i===1?5:i===2?4:i===3?7:i===4?6:i===5?5:i===6?4:9' },
                    s: { type: 'expression', value: 'i===0?15:i===1?20:i===2?20:i===3?21:i===4?24:i===5?25:i===6?24:36' },
                },
                constraints: [],
                answer_formula: 's',
                answer_type: 'number',
                hint: 'Площадь треугольника = (основание × высота) ÷ 2. Не забудь поделить на 2!',
                solution: [
                    { explanation: 'Формула: S = (a × h) ÷ 2.' },
                    { explanation: 'S = ({a} × {h}) ÷ 2 =', result: '{s} см²' },
                ],
                common_mistakes: [
                    { pattern: 'a * h', feedback: 'Это площадь параллелограмма. Треугольник — половина: ({a} × {h}) ÷ 2 = {s}.' },
                    { pattern: 'a + h', feedback: 'S = (основание × высота) ÷ 2 = ({a} × {h}) ÷ 2 = {s} см².' },
                ],
            },
            3: {
                // Трапеция: S = (a+b)/2 * h. a+b чётное → S целая.
                // Кортежи [a, b, h, s] — все проверены.
                // i=0:(5,3,4,16)  i=1:(7,3,5,25)  i=2:(6,4,6,30)  i=3:(8,4,5,30)
                // i=4:(9,5,4,28)  i=5:(7,5,6,36)  i=6:(10,4,5,35) i=7:(8,6,7,49)
                template: 'Найдите площадь трапеции с основаниями {a} см и {b} см и высотой {h} см.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?5:i===1?7:i===2?6:i===3?8:i===4?9:i===5?7:i===6?10:8' },
                    b: { type: 'expression', value: 'i===0?3:i===1?3:i===2?4:i===3?4:i===4?5:i===5?5:i===6?4:6' },
                    h: { type: 'expression', value: 'i===0?4:i===1?5:i===2?6:i===3?5:i===4?4:i===5?6:i===6?5:7' },
                    s: { type: 'expression', value: 'i===0?16:i===1?25:i===2?30:i===3?30:i===4?28:i===5?36:i===6?35:49' },
                },
                constraints: [],
                answer_formula: 's',
                answer_type: 'number',
                hint: 'Формула площади трапеции: S = (a + b) ÷ 2 × h. Сначала сложи основания, потом раздели на 2 и умножь на высоту.',
                solution: [
                    { explanation: 'Формула: S = (a + b) ÷ 2 × h.' },
                    { explanation: 'S = ({a} + {b}) ÷ 2 × {h} = {s} см²', result: '{s} см²' },
                ],
                common_mistakes: [
                    { pattern: '(a + b) * h', feedback: 'Не забудь поделить сумму оснований на 2: ({a}+{b}) ÷ 2 × {h} = {s}.' },
                    { pattern: 'a * h / 2', feedback: 'Нужно учесть оба основания: ({a}+{b}) ÷ 2 × {h} = {s} см².' },
                ],
            },
        },
    },

    // ===== QUADRANTS (Четверти координатной плоскости) =====
    {
        id: 'grade6-quadrants',
        class: 6,
        subject: 'geometry',
        section: 'Координатная плоскость',
        topic: 'quadrants',
        topic_title: 'Четверти координатной плоскости',
        problemType: 'numeric',
        skills: ['coordinate_plane', 'quadrants'],
        tags: ['coordinates', 'quadrants', 'grade6'],
        relatedModule: 'coordinate-plane',
        version: 1,
        difficulties: {
            1: {
                // Точки только в I и II четвертях (y > 0).
                // Кортежи [px, py, q] — все проверены.
                // i=0:(5,3,1) i=1:(7,1,1) i=2:(2,8,1)
                // i=3:(-2,4,2) i=4:(-5,7,2) i=5:(-8,3,2)
                template: 'В какой координатной четверти находится точка A({px}; {py})? Введите номер (1, 2, 3 или 4).',
                parameters: {
                    i:  { type: 'choice', values: [0, 1, 2, 3, 4, 5] },
                    px: { type: 'expression', value: 'i===0?5:i===1?7:i===2?2:i===3?-2:i===4?-5:-8' },
                    py: { type: 'expression', value: 'i===0?3:i===1?1:i===2?8:i===3?4:i===4?7:3' },
                    q:  { type: 'expression', value: 'i<=2?1:2' },
                },
                constraints: [],
                answer_formula: 'q',
                answer_type: 'number',
                hint: 'I четверть: x>0, y>0. II четверть: x<0, y>0. III четверть: x<0, y<0. IV четверть: x>0, y<0.',
                solution: [
                    { explanation: 'Смотрим знаки: x={px}, y={py}.' },
                    { explanation: 'Оба положительных → I. x отрицательный, y положительный → II.' },
                    { explanation: 'Ответ:', result: '{q} четверть' },
                ],
                common_mistakes: [
                    { pattern: '1', feedback: 'I четверть только при x>0 и y>0. Проверьте знаки: x={px}, y={py}.' },
                    { pattern: '4', feedback: 'IV четверть — это x>0, y<0. Здесь y={py}.' },
                ],
            },
            2: {
                // Точки во всех четырёх четвертях.
                // i=0:(5,3,1) i=1:(7,1,1) i=2:(-2,4,2) i=3:(-8,3,2)
                // i=4:(-3,-6,3) i=5:(-7,-2,3) i=6:(4,-5,4) i=7:(6,-3,4)
                template: 'В какой координатной четверти находится точка A({px}; {py})? Введите номер (1, 2, 3 или 4).',
                parameters: {
                    i:  { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    px: { type: 'expression', value: 'i===0?5:i===1?7:i===2?-2:i===3?-8:i===4?-3:i===5?-7:i===6?4:6' },
                    py: { type: 'expression', value: 'i===0?3:i===1?1:i===2?4:i===3?3:i===4?-6:i===5?-2:i===6?-5:-3' },
                    q:  { type: 'expression', value: 'i<=1?1:i<=3?2:i<=5?3:4' },
                },
                constraints: [],
                answer_formula: 'q',
                answer_type: 'number',
                hint: 'I: (+,+) | II: (−,+) | III: (−,−) | IV: (+,−).',
                solution: [
                    { explanation: 'x={px}, y={py}. Определяем знаки и находим четверть.' },
                    { explanation: 'Ответ:', result: '{q} четверть' },
                ],
                common_mistakes: [
                    { pattern: '1', feedback: 'I четверть только при x>0 и y>0. Здесь x={px}, y={py}.' },
                    { pattern: '3', feedback: 'III четверть — оба отрицательные. Здесь x={px}, y={py}.' },
                ],
            },
            3: {
                // Нестандартные: большие числа, «ловушки» близко к осям.
                // i=0:(9,-1,4) i=1:(-1,-9,3) i=2:(1,9,1) i=3:(-9,1,2)
                // i=4:(8,-7,4) i=5:(-6,-8,3) i=6:(3,7,1) i=7:(-4,6,2)
                template: 'В какой координатной четверти находится точка A({px}; {py})? Введите номер (1, 2, 3 или 4).',
                parameters: {
                    i:  { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    px: { type: 'expression', value: 'i===0?9:i===1?-1:i===2?1:i===3?-9:i===4?8:i===5?-6:i===6?3:-4' },
                    py: { type: 'expression', value: 'i===0?-1:i===1?-9:i===2?9:i===3?1:i===4?-7:i===5?-8:i===6?7:6' },
                    q:  { type: 'expression', value: 'i===0?4:i===1?3:i===2?1:i===3?2:i===4?4:i===5?3:i===6?1:2' },
                },
                constraints: [],
                answer_formula: 'q',
                answer_type: 'number',
                hint: 'Не путайте: координата x — первое число, y — второе. I: (+,+) | II: (−,+) | III: (−,−) | IV: (+,−).',
                solution: [
                    { explanation: 'x={px}, y={py}.' },
                    { explanation: 'Ответ:', result: '{q} четверть' },
                ],
                common_mistakes: [
                    { pattern: '2', feedback: 'II четверть — x<0, y>0. Проверьте: x={px}, y={py}.' },
                    { pattern: '1', feedback: 'I четверть — оба положительные. Проверьте знаки: x={px}, y={py}.' },
                ],
            },
        },
    },

    // ===== DISTANCE ON AXIS (Расстояние на числовой оси) =====
    {
        id: 'grade6-distance-on-axis',
        class: 6,
        subject: 'geometry',
        section: 'Координатная плоскость',
        topic: 'distance_on_axis',
        topic_title: 'Расстояние на числовой оси',
        problemType: 'numeric',
        skills: ['distance', 'absolute_value', 'coordinate_plane'],
        tags: ['coordinates', 'distance', 'grade6'],
        relatedModule: 'coordinate-plane',
        version: 1,
        difficulties: {
            1: {
                // Оба числа положительные. d = b - a (b > a).
                // i=0:(1,6,5) i=1:(2,9,7) i=2:(3,8,5) i=3:(0,9,9)
                // i=4:(4,10,6) i=5:(5,12,7) i=6:(2,10,8) i=7:(3,12,9)
                template: 'Найдите расстояние между точками A({a}) и B({b}) на числовой оси.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?1:i===1?2:i===2?3:i===3?0:i===4?4:i===5?5:i===6?2:3' },
                    b: { type: 'expression', value: 'i===0?6:i===1?9:i===2?8:i===3?9:i===4?10:i===5?12:i===6?10:12' },
                    d: { type: 'expression', value: 'i===0?5:i===1?7:i===2?5:i===3?9:i===4?6:i===5?7:i===6?8:9' },
                },
                constraints: [],
                answer_formula: 'd',
                answer_type: 'number',
                hint: 'Расстояние = |B − A| = |{b} − {a}|. Результат всегда положительный.',
                solution: [
                    { explanation: 'Расстояние = |{b} − {a}| = {d}.' },
                    { explanation: 'Ответ:', result: '{d}' },
                ],
                common_mistakes: [
                    { pattern: 'a - b', feedback: 'Расстояние — это модуль разности: |{b}−{a}| = {d}, всегда ≥ 0.' },
                    { pattern: 'a + b', feedback: 'Нужна разность координат, а не сумма: |{b}−{a}| = {d}.' },
                ],
            },
            2: {
                // Одно число отрицательное. d = |a - b|.
                // i=0:(-2,5,7) i=1:(-4,3,7) i=2:(-5,2,7) i=3:(-3,6,9)
                // i=4:(0,7,7)  i=5:(-6,-1,5) i=6:(4,-3,7) i=7:(-4,4,8)
                template: 'Найдите расстояние между точками A({a}) и B({b}) на числовой оси.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?-2:i===1?-4:i===2?-5:i===3?-3:i===4?0:i===5?-6:i===6?4:-4' },
                    b: { type: 'expression', value: 'i===0?5:i===1?3:i===2?2:i===3?6:i===4?7:i===5?-1:i===6?-3:4' },
                    d: { type: 'expression', value: 'i===0?7:i===1?7:i===2?7:i===3?9:i===4?7:i===5?5:i===6?7:8' },
                },
                constraints: [],
                answer_formula: 'd',
                answer_type: 'number',
                hint: 'Расстояние = |{a} − {b}|. При отрицательных числах не забудьте учесть знак.',
                solution: [
                    { explanation: 'Расстояние = |{a} − {b}| = |{a} − ({b})| = {d}.' },
                    { explanation: 'Ответ:', result: '{d}' },
                ],
                common_mistakes: [
                    { pattern: 'a - b', feedback: '|{a} − {b}| = {d}. Расстояние не может быть отрицательным — берём модуль.' },
                    { pattern: 'a + b', feedback: 'Расстояние — это |разность|, а не сумма: |{a}−{b}| = {d}.' },
                ],
            },
            3: {
                // Оба числа отрицательные или большой диапазон.
                // i=0:(-3,-8,5) i=1:(2,-5,7) i=2:(-7,1,8) i=3:(-3,-8,5)
                // i=4:(-9,0,9)  i=5:(-4,-9,5) i=6:(6,-2,8) i=7:(-1,-8,7)
                template: 'Найдите расстояние между точками A({a}) и B({b}) на числовой оси.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?-3:i===1?2:i===2?-7:i===3?-3:i===4?-9:i===5?-4:i===6?6:-1' },
                    b: { type: 'expression', value: 'i===0?-8:i===1?-5:i===2?1:i===3?-8:i===4?0:i===5?-9:i===6?-2:-8' },
                    d: { type: 'expression', value: 'i===0?5:i===1?7:i===2?8:i===3?5:i===4?9:i===5?5:i===6?8:7' },
                },
                constraints: [],
                answer_formula: 'd',
                answer_type: 'number',
                hint: 'Расстояние = |{a} − {b}|. Нарисуйте числовую ось и отметьте оба числа.',
                solution: [
                    { explanation: 'Расстояние = |{a} − ({b})| = {d}.' },
                    { explanation: 'Ответ:', result: '{d}' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'При двух отрицательных числах: |{a}−{b}| = {d}. Не складывайте модули!' },
                    { pattern: 'b - a', feedback: 'Расстояние от A до B = расстояние от B до A = |{a}−{b}| = {d}.' },
                ],
            },
        },
    },

    // ===== ANGLES (Смежные и вертикальные углы) =====
    {
        id: 'grade6-angles-basic',
        class: 6,
        subject: 'geometry',
        section: 'Геометрия',
        topic: 'angles',
        topic_title: 'Смежные и вертикальные углы',
        problemType: 'numeric',
        skills: ['angles', 'vertical_angles', 'adjacent_angles'],
        tags: ['angles', 'geometry', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // Вертикальные углы равны. Ответ = исходный угол.
                template: 'Два прямых пересекаются. Один из углов равен {alpha}°. Найдите вертикальный угол.',
                parameters: {
                    alpha: { type: 'choice', values: [30, 45, 60, 70, 80, 110, 120, 135, 150] },
                },
                constraints: [],
                answer_formula: 'alpha',
                answer_type: 'number',
                hint: 'Вертикальные углы — это углы, образованные пересечением двух прямых, расположенные напротив друг друга. Они всегда равны.',
                solution: [
                    { explanation: 'Вертикальные углы равны между собой.' },
                    { explanation: 'Ответ:', result: '{alpha}°' },
                ],
                common_mistakes: [
                    { pattern: '180 - alpha', feedback: '180° − {alpha}° — это смежный угол. Вертикальный угол равен исходному: {alpha}°.' },
                    { pattern: '90', feedback: 'Вертикальный угол не обязательно равен 90°. Он равен исходному: {alpha}°.' },
                ],
            },
            2: {
                // Смежный угол = 180 - alpha.
                template: 'Один из смежных углов равен {alpha}°. Найдите второй смежный угол.',
                parameters: {
                    alpha:   { type: 'choice', values: [40, 55, 65, 75, 85, 95, 100, 115, 130] },
                    supp:    { type: 'expression', value: '180 - alpha' },
                },
                constraints: [],
                answer_formula: 'supp',
                answer_type: 'number',
                hint: 'Сумма смежных углов равна 180°. Значит, второй угол = 180° − {alpha}°.',
                solution: [
                    { explanation: 'Смежные углы в сумме дают 180° (развёрнутый угол).' },
                    { explanation: '180° − {alpha}° =', result: '{supp}°' },
                ],
                common_mistakes: [
                    { pattern: 'alpha', feedback: 'Смежные углы не обязательно равны (только если оба по 90°). Ответ: 180° − {alpha}° = {supp}°.' },
                    { pattern: '360 - alpha', feedback: '360° — это полный оборот. Смежные углы дают 180°: 180° − {alpha}° = {supp}°.' },
                ],
            },
            3: {
                // Два угла при пересечении: дан один, найти смежный и вертикальный.
                // Ответ — смежный к смежному = вертикальный к исходному = alpha.
                // Задача: даны 3 угла из 4, найти 4-й. Он равен первому (вертикальный).
                template: 'При пересечении двух прямых один угол равен {alpha}°, смежный с ним — {supp}°. Найдите угол, вертикальный к углу в {supp}°.',
                parameters: {
                    alpha: { type: 'choice', values: [35, 50, 70, 80, 100, 110, 125, 140] },
                    supp:  { type: 'expression', value: '180 - alpha' },
                },
                constraints: [],
                answer_formula: 'alpha',
                answer_type: 'number',
                hint: 'Вертикальный к смежному = исходному углу. Нарисуй пересечение: все 4 угла попарно равны.',
                solution: [
                    { explanation: 'Смежный к {alpha}° равен {supp}°.' },
                    { explanation: 'Вертикальный к {supp}° = смежному = равен {alpha}° (вертикальные углы равны).' },
                    { explanation: 'Ответ:', result: '{alpha}°' },
                ],
                common_mistakes: [
                    { pattern: 'supp', feedback: 'Вертикальный к {supp}° — это угол напротив него, а не сам {supp}°. Ответ: {alpha}°.' },
                    { pattern: '90', feedback: 'Углы равны 90° только при перпендикулярных прямых. Здесь вертикальный = {alpha}°.' },
                ],
            },
        },
    },

    // ===== CIRCLES (Длина окружности и площадь круга) =====
    {
        id: 'grade6-circles',
        class: 6,
        subject: 'geometry',
        section: 'Геометрия',
        topic: 'circles',
        topic_title: 'Длина окружности и площадь круга',
        problemType: 'numeric',
        skills: ['circle_circumference', 'circle_area'],
        tags: ['circles', 'geometry', 'grade6'],
        relatedModule: 'pie-chart',
        version: 1,
        difficulties: {
            1: {
                // Длина окружности: C = 2πr ≈ 6r (π=3).
                // r ∈ {2,3,4,5,6,7,8,10}, C = 6r.
                template: 'Найдите длину окружности с радиусом {r} см. Считайте π = 3.',
                parameters: {
                    r: { type: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 10] },
                    c: { type: 'expression', value: '6 * r' },
                },
                constraints: [],
                answer_formula: 'c',
                answer_type: 'number',
                hint: 'Формула длины окружности: C = 2 × π × r. При π = 3: C = 6 × {r}.',
                solution: [
                    { explanation: 'C = 2 × π × r = 2 × 3 × {r}.' },
                    { explanation: 'C = 6 × {r} =', result: '{c} см' },
                ],
                common_mistakes: [
                    { pattern: 'r * r * 3', feedback: 'Это формула площади круга: S = π × r². Длина окружности: C = 2 × π × r = 6 × {r} = {c}.' },
                    { pattern: '2 * r', feedback: 'Не забудьте умножить на π = 3: C = 2 × 3 × {r} = {c}.' },
                ],
            },
            2: {
                // Площадь круга: S = πr² ≈ 3r² (π=3).
                // r ∈ {2,3,4,5,6,7,8,10}, S = 3r².
                template: 'Найдите площадь круга с радиусом {r} см. Считайте π = 3.',
                parameters: {
                    r: { type: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 10] },
                    s: { type: 'expression', value: '3 * r * r' },
                },
                constraints: [],
                answer_formula: 's',
                answer_type: 'number',
                hint: 'Формула площади круга: S = π × r². При π = 3: S = 3 × {r}².',
                solution: [
                    { explanation: 'S = π × r² = 3 × {r}².' },
                    { explanation: 'S = 3 × {r} × {r} =', result: '{s} см²' },
                ],
                common_mistakes: [
                    { pattern: '6 * r', feedback: 'Это формула длины окружности. Площадь: S = π × r² = 3 × {r}² = {s}.' },
                    { pattern: 'r * r', feedback: 'Не забудьте умножить на π = 3: S = 3 × {r}² = {s}.' },
                ],
            },
            3: {
                // По длине окружности найти радиус: r = C / (2π) = C / 6.
                // C = 6r → r = C/6. Выбираем C кратное 6: 12,18,24,30,36,42,48,60.
                template: 'Длина окружности равна {c} см. Найдите радиус. Считайте π = 3.',
                parameters: {
                    c: { type: 'choice', values: [12, 18, 24, 30, 36, 42, 48, 60] },
                    r: { type: 'expression', value: 'c / 6' },
                },
                constraints: [],
                answer_formula: 'r',
                answer_type: 'number',
                hint: 'Из формулы C = 2 × π × r = 6r выразите r: r = C ÷ 6 = {c} ÷ 6.',
                solution: [
                    { explanation: 'C = 6 × r, значит r = C ÷ 6.' },
                    { explanation: 'r = {c} ÷ 6 =', result: '{r} см' },
                ],
                common_mistakes: [
                    { pattern: 'c / 3', feedback: 'Делить нужно на 6 (= 2π), а не на 3: r = {c} ÷ 6 = {r}.' },
                    { pattern: 'c / 2', feedback: 'r = C ÷ (2π) = {c} ÷ 6 = {r}. Делите на 6, не на 2.' },
                ],
            },
        },
    },

    // ===== DIVISIBILITY RULES (Признаки делимости) =====
    {
        id: 'grade6-divisibility-rules',
        class: 6,
        subject: 'algebra',
        section: 'Делимость',
        topic: 'divisibility_rules',
        topic_title: 'Признаки делимости',
        problemType: 'numeric',
        skills: ['divisibility', 'number_properties'],
        tags: ['divisibility', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // Делимость на 2, 5, 10. Ответ — единственное число из набора, которое делится.
                // Кортежи [d, correct, w1, w2, w3] — все проверены.
                // i=0:(2,48,53,71,39)    i=1:(2,124,87,63,55)
                // i=2:(5,85,83,86,89)    i=3:(5,120,121,122,123)
                // i=4:(10,70,72,75,73)   i=5:(10,130,131,132,133)
                template: 'Какое из чисел делится на {d} без остатка: {w1}, {w2}, {correct} или {w3}?',
                parameters: {
                    i:       { type: 'choice', values: [0, 1, 2, 3, 4, 5] },
                    d:       { type: 'expression', value: 'i<=1?2:i<=3?5:10' },
                    correct: { type: 'expression', value: 'i===0?48:i===1?124:i===2?85:i===3?120:i===4?70:130' },
                    w1:      { type: 'expression', value: 'i===0?53:i===1?87:i===2?83:i===3?121:i===4?72:131' },
                    w2:      { type: 'expression', value: 'i===0?71:i===1?63:i===2?86:i===3?122:i===4?75:132' },
                    w3:      { type: 'expression', value: 'i===0?39:i===1?55:i===2?89:i===3?123:i===4?73:133' },
                },
                constraints: [],
                answer_formula: 'correct',
                answer_type: 'number',
                hint: 'На 2 делятся чётные числа (последняя цифра 0, 2, 4, 6, 8). На 5 — числа с последней цифрой 0 или 5. На 10 — числа с последней цифрой 0.',
                solution: [
                    { explanation: 'Признак делимости на {d}: смотрим на последнюю цифру числа.' },
                    { explanation: 'Из чисел {w1}, {w2}, {correct}, {w3} — только {correct} делится на {d}.' },
                    { explanation: 'Ответ:', result: '{correct}' },
                ],
                common_mistakes: [
                    { pattern: 'w1', feedback: '{w1} не делится на {d}: остаток = ' + '{w1} mod {d} ≠ 0.' },
                    { pattern: 'w2', feedback: '{w2} не делится на {d}. Проверь последнюю цифру по признаку.' },
                ],
            },
            2: {
                // Делимость на 3, 9. Признак: сумма цифр делится на 3 (или 9).
                // Кортежи [d, correct, w1, w2, w3] — все проверены.
                // i=0:(3,123,124,125,128)  i=1:(3,252,253,254,256)
                // i=2:(9,126,124,125,128)  i=3:(9,243,241,244,245)
                // i=4:(3,315,316,317,319)  i=5:(9,189,190,191,193)
                template: 'Какое из чисел делится на {d} без остатка: {w1}, {w2}, {correct} или {w3}?',
                parameters: {
                    i:       { type: 'choice', values: [0, 1, 2, 3, 4, 5] },
                    d:       { type: 'expression', value: 'i===0?3:i===1?3:i===2?9:i===3?9:i===4?3:9' },
                    correct: { type: 'expression', value: 'i===0?123:i===1?252:i===2?126:i===3?243:i===4?315:189' },
                    w1:      { type: 'expression', value: 'i===0?124:i===1?253:i===2?124:i===3?241:i===4?316:190' },
                    w2:      { type: 'expression', value: 'i===0?125:i===1?254:i===2?125:i===3?244:i===4?317:191' },
                    w3:      { type: 'expression', value: 'i===0?128:i===1?256:i===2?128:i===3?245:i===4?319:193' },
                },
                constraints: [],
                answer_formula: 'correct',
                answer_type: 'number',
                hint: 'На 3 делится число, у которого сумма цифр делится на 3. На 9 — если сумма цифр делится на 9.',
                solution: [
                    { explanation: 'Считаем сумму цифр каждого числа.' },
                    { explanation: 'Только у числа {correct} сумма цифр делится на {d}.' },
                    { explanation: 'Ответ:', result: '{correct}' },
                ],
                common_mistakes: [
                    { pattern: 'w1', feedback: 'Посчитай сумму цифр {w1}. Она не делится на {d}.' },
                    { pattern: 'w3', feedback: 'Посчитай сумму цифр {w3}. Она не делится на {d}.' },
                ],
            },
            3: {
                // Делимость на 4, 6. На 4: последние 2 цифры делятся на 4. На 6: делится на 2 и на 3.
                // Кортежи [d, correct, w1, w2, w3] — все проверены.
                // i=0:(4,124,125,126,127)  i=1:(4,232,233,234,235)
                // i=2:(6,126,127,128,130)  i=3:(6,252,253,254,256)
                // i=4:(4,316,314,315,317)  i=5:(6,318,316,317,319)
                template: 'Какое из чисел делится на {d} без остатка: {w1}, {w2}, {correct} или {w3}?',
                parameters: {
                    i:       { type: 'choice', values: [0, 1, 2, 3, 4, 5] },
                    d:       { type: 'expression', value: 'i===0?4:i===1?4:i===2?6:i===3?6:i===4?4:6' },
                    correct: { type: 'expression', value: 'i===0?124:i===1?232:i===2?126:i===3?252:i===4?316:318' },
                    w1:      { type: 'expression', value: 'i===0?125:i===1?233:i===2?127:i===3?253:i===4?314:316' },
                    w2:      { type: 'expression', value: 'i===0?126:i===1?234:i===2?128:i===3?254:i===4?315:317' },
                    w3:      { type: 'expression', value: 'i===0?127:i===1?235:i===2?130:i===3?256:i===4?317:319' },
                },
                constraints: [],
                answer_formula: 'correct',
                answer_type: 'number',
                hint: 'На 4: последние 2 цифры числа делятся на 4. На 6: число должно делиться и на 2, и на 3 одновременно.',
                solution: [
                    { explanation: 'Признак делимости на {d}: для 4 — смотрим последние 2 цифры; для 6 — проверяем делимость на 2 и на 3.' },
                    { explanation: 'Только {correct} удовлетворяет признаку делимости на {d}.' },
                    { explanation: 'Ответ:', result: '{correct}' },
                ],
                common_mistakes: [
                    { pattern: 'w2', feedback: '{w2} не делится на {d}. Проверь признак делимости.' },
                    { pattern: 'w3', feedback: '{w3} не делится на {d}. Проверь признак делимости.' },
                ],
            },
        },
    },

    // ===== PRIME FACTORIZATION (Разложение на простые множители) =====
    {
        id: 'grade6-prime-factorization',
        class: 6,
        subject: 'algebra',
        section: 'Делимость',
        topic: 'prime_factorization',
        topic_title: 'Разложение на простые множители',
        problemType: 'numeric',
        skills: ['prime_factorization', 'divisibility'],
        tags: ['primes', 'factorization', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // Наименьший простой множитель числа n.
                // Кортежи [n, factor]: n делится на factor (простое), factor — наименьший.
                // i=0:(12,2) i=1:(18,2) i=2:(24,2) i=3:(36,2)
                // i=4:(15,3) i=5:(21,3) i=6:(27,3) i=7:(45,3)
                template: 'Найдите наименьший простой множитель числа {n}.',
                parameters: {
                    i:      { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    n:      { type: 'expression', value: 'i===0?12:i===1?18:i===2?24:i===3?36:i===4?15:i===5?21:i===6?27:45' },
                    factor: { type: 'expression', value: 'i<=3?2:3' },
                },
                constraints: [],
                answer_formula: 'factor',
                answer_type: 'number',
                hint: 'Пробуйте делить на простые числа по порядку: 2, 3, 5, 7... Первое, на которое делится без остатка — и есть ответ.',
                solution: [
                    { explanation: 'Проверяем: делится ли {n} на 2? Если последняя цифра чётная — да.' },
                    { explanation: 'Наименьший простой множитель {n} = {factor}.' },
                    { explanation: 'Ответ:', result: '{factor}' },
                ],
                common_mistakes: [
                    { pattern: 'n', feedback: '{n} — само число, а не его простой множитель. Ищем наименьший делитель > 1.' },
                    { pattern: '1', feedback: '1 не является простым числом. Простые числа начинаются с 2.' },
                ],
            },
            2: {
                // Количество простых множителей в разложении (с повторениями).
                // n = p1^k1 * p2^k2, count = k1 + k2.
                // i=0: 12=2²×3 → 3    i=1: 18=2×3² → 3    i=2: 20=2²×5 → 3
                // i=3: 28=2²×7 → 3    i=4: 8=2³ → 3       i=5: 27=3³ → 3
                // i=6: 36=2²×3² → 4   i=7: 24=2³×3 → 4
                template: 'Сколько простых множителей (с повторениями) в разложении числа {n}? Например, 12 = 2×2×3, ответ — 3.',
                parameters: {
                    i:     { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    n:     { type: 'expression', value: 'i===0?12:i===1?18:i===2?20:i===3?28:i===4?8:i===5?27:i===6?36:24' },
                    count: { type: 'expression', value: 'i<=5?3:4' },
                },
                constraints: [],
                answer_formula: 'count',
                answer_type: 'number',
                hint: 'Разложите число на простые множители методом деления: {n} ÷ 2 ÷ ... Считайте каждый делитель отдельно.',
                solution: [
                    { explanation: 'Делим {n} на простые числа до конца: записываем каждый делитель.' },
                    { explanation: 'Считаем все множители (включая повторения).' },
                    { explanation: 'Ответ:', result: '{count}' },
                ],
                common_mistakes: [
                    { pattern: '2', feedback: 'Считайте каждый простой делитель отдельно. Например, 12=2×2×3 — это 3 множителя, а не 2.' },
                    { pattern: 'n / 2', feedback: 'Нужно подсчитать количество простых множителей, а не разделить число.' },
                ],
            },
            3: {
                // Сумма всех простых множителей в разложении (с повторениями).
                // i=0: 12=2+2+3=7  i=1: 18=2+3+3=8  i=2: 20=2+2+5=9  i=3: 28=2+2+7=11
                // i=4: 30=2+3+5=10 i=5: 45=3+3+5=11 i=6: 36=2+2+3+3=10 i=7: 24=2+2+2+3=9
                template: 'Найдите сумму всех простых множителей числа {n} (с повторениями). Например, для 12=2×2×3 сумма = 2+2+3 = 7.',
                parameters: {
                    i:   { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    n:   { type: 'expression', value: 'i===0?12:i===1?18:i===2?20:i===3?28:i===4?30:i===5?45:i===6?36:24' },
                    ans: { type: 'expression', value: 'i===0?7:i===1?8:i===2?9:i===3?11:i===4?10:i===5?11:i===6?10:9' },
                },
                constraints: [],
                answer_formula: 'ans',
                answer_type: 'number',
                hint: 'Сначала разложите {n} на простые множители, затем сложите их все.',
                solution: [
                    { explanation: 'Раскладываем {n} на простые множители.' },
                    { explanation: 'Складываем все множители с повторениями.' },
                    { explanation: 'Ответ:', result: '{ans}' },
                ],
                common_mistakes: [
                    { pattern: 'n', feedback: 'Нужна сумма простых множителей, а не само число {n}.' },
                    { pattern: 'count', feedback: 'Нужна именно сумма множителей, а не их количество.' },
                ],
            },
        },
    },

    // ===== GCD (Наибольший общий делитель) =====
    {
        id: 'grade6-gcd',
        class: 6,
        subject: 'algebra',
        section: 'Делимость',
        topic: 'gcd',
        topic_title: 'Наибольший общий делитель',
        problemType: 'numeric',
        skills: ['gcd', 'prime_factorization'],
        tags: ['gcd', 'divisibility', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // Маленькие числа до 30. Кортежи [a, b, g] — все проверены.
                // i=0:(6,8,2)  i=1:(6,9,3)  i=2:(8,12,4) i=3:(10,15,5)
                // i=4:(12,18,6) i=5:(14,21,7) i=6:(16,24,8) i=7:(18,27,9)
                template: 'Найдите наибольший общий делитель чисел {a} и {b}.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?6:i===1?6:i===2?8:i===3?10:i===4?12:i===5?14:i===6?16:18' },
                    b: { type: 'expression', value: 'i===0?8:i===1?9:i===2?12:i===3?15:i===4?18:i===5?21:i===6?24:27' },
                    g: { type: 'expression', value: 'i===0?2:i===1?3:i===2?4:i===3?5:i===4?6:i===5?7:i===6?8:9' },
                },
                constraints: [],
                answer_formula: 'g',
                answer_type: 'number',
                hint: 'Разложите {a} и {b} на простые множители. НОД — произведение общих множителей.',
                solution: [
                    { explanation: 'Разложим {a} и {b} на простые множители.' },
                    { explanation: 'Выписываем общие простые множители.' },
                    { explanation: 'НОД({a}, {b}) =', result: '{g}' },
                ],
                common_mistakes: [
                    { pattern: 'a * b / g', feedback: 'Это формула НОК, а не НОД. НОД — наибольший из общих делителей.' },
                    { pattern: 'a - b', feedback: 'Разность чисел не равна НОД. Нужно найти общие простые множители.' },
                ],
            },
            2: {
                // Средние числа 20-80. Кортежи [a, b, g] — все проверены.
                // i=0:(20,24,4)  i=1:(20,25,5)  i=2:(21,24,3)  i=3:(21,28,7)
                // i=4:(24,30,6)  i=5:(24,32,8)  i=6:(27,36,9)  i=7:(30,40,10)
                template: 'Найдите наибольший общий делитель чисел {a} и {b}.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?20:i===1?20:i===2?21:i===3?21:i===4?24:i===5?24:i===6?27:30' },
                    b: { type: 'expression', value: 'i===0?24:i===1?25:i===2?24:i===3?28:i===4?30:i===5?32:i===6?36:40' },
                    g: { type: 'expression', value: 'i===0?4:i===1?5:i===2?3:i===3?7:i===4?6:i===5?8:i===6?9:10' },
                },
                constraints: [],
                answer_formula: 'g',
                answer_type: 'number',
                hint: 'Можно использовать алгоритм Евклида: НОД(a, b) = НОД(b, a mod b).',
                solution: [
                    { explanation: 'Алгоритм Евклида: делим большее на меньшее, берём остаток.' },
                    { explanation: 'Повторяем до остатка 0. Последний ненулевой остаток — НОД.' },
                    { explanation: 'НОД({a}, {b}) =', result: '{g}' },
                ],
                common_mistakes: [
                    { pattern: 'a / b', feedback: 'Деление даёт частное, а не НОД. Используй алгоритм Евклида или разложение.' },
                    { pattern: 'b', feedback: 'НОД ≤ меньшего числа, но обычно меньше него. Найди общие делители.' },
                ],
            },
            3: {
                // Крупные числа 60-200. Кортежи [a, b, g] — все проверены.
                // i=0:(60,72,12)  i=1:(60,78,6)   i=2:(72,90,18)  i=3:(72,96,24)
                // i=4:(90,120,30) i=5:(108,144,36) i=6:(126,168,42) i=7:(144,192,48)
                template: 'Найдите наибольший общий делитель чисел {a} и {b}.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?60:i===1?60:i===2?72:i===3?72:i===4?90:i===5?108:i===6?126:144' },
                    b: { type: 'expression', value: 'i===0?72:i===1?78:i===2?90:i===3?96:i===4?120:i===5?144:i===6?168:192' },
                    g: { type: 'expression', value: 'i===0?12:i===1?6:i===2?18:i===3?24:i===4?30:i===5?36:i===6?42:48' },
                },
                constraints: [],
                answer_formula: 'g',
                answer_type: 'number',
                hint: 'Алгоритм Евклида: НОД({a}, {b}) = НОД({b}, {a} mod {b}) = ...',
                solution: [
                    { explanation: 'Применяем алгоритм Евклида последовательно.' },
                    { explanation: 'НОД({a}, {b}) =', result: '{g}' },
                ],
                common_mistakes: [
                    { pattern: 'a - b', feedback: 'Это не НОД. Используй алгоритм Евклида: делим {a} на {b}, берём остаток.' },
                ],
            },
        },
    },

    // ===== LCM (Наименьшее общее кратное) =====
    {
        id: 'grade6-lcm',
        class: 6,
        subject: 'algebra',
        section: 'Делимость',
        topic: 'lcm',
        topic_title: 'Наименьшее общее кратное',
        problemType: 'numeric',
        skills: ['lcm', 'prime_factorization', 'common_denominator'],
        tags: ['lcm', 'divisibility', 'grade6'],
        relatedModule: 'coordinate-plane',
        version: 1,
        difficulties: {
            1: {
                // НОК<=60, НОД>1. Кортежи [a, b, l] — все проверены.
                // i=0:(4,6,12)  i=1:(4,10,20)  i=2:(4,14,28)  i=3:(6,8,24)
                // i=4:(6,9,18)  i=5:(6,10,30)  i=6:(6,14,42)  i=7:(8,10,40)
                template: 'Найдите наименьшее общее кратное чисел {a} и {b}.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?4:i===1?4:i===2?4:i===3?6:i===4?6:i===5?6:i===6?6:8' },
                    b: { type: 'expression', value: 'i===0?6:i===1?10:i===2?14:i===3?8:i===4?9:i===5?10:i===6?14:10' },
                    l: { type: 'expression', value: 'i===0?12:i===1?20:i===2?28:i===3?24:i===4?18:i===5?30:i===6?42:40' },
                },
                constraints: [],
                answer_formula: 'l',
                answer_type: 'number',
                hint: 'НОК(a, b) = a × b ÷ НОД(a, b). Найдите НОД({a}, {b}), затем вычислите НОК.',
                solution: [
                    { explanation: 'Разложим {a} и {b} на простые множители.' },
                    { explanation: 'НОК = произведение всех множителей, каждый берётся с наибольшим показателем.' },
                    { explanation: 'НОК({a}, {b}) =', result: '{l}' },
                ],
                common_mistakes: [
                    { pattern: 'a * b', feedback: '{a}×{b}=' + '{a*b}' + '. Но НОК может быть меньше: НОК = a×b÷НОД.' },
                    { pattern: 'a + b', feedback: 'НОК — это не сумма, а наименьшее общее кратное: {l}.' },
                ],
            },
            2: {
                // НОК 30-120. Кортежи [a, b, l] — все проверены.
                // i=0:(4,18,36)  i=1:(4,22,44)  i=2:(6,16,48)  i=3:(6,20,60)
                // i=4:(8,12,24)  i=5:(9,12,36)  i=6:(10,12,60) i=7:(12,16,48)
                template: 'Найдите наименьшее общее кратное чисел {a} и {b}.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?4:i===1?4:i===2?6:i===3?6:i===4?8:i===5?9:i===6?10:12' },
                    b: { type: 'expression', value: 'i===0?18:i===1?22:i===2?16:i===3?20:i===4?12:i===5?12:i===6?12:16' },
                    l: { type: 'expression', value: 'i===0?36:i===1?44:i===2?48:i===3?60:i===4?24:i===5?36:i===6?60:48' },
                },
                constraints: [],
                answer_formula: 'l',
                answer_type: 'number',
                hint: 'Используйте формулу: НОК(a, b) = a × b ÷ НОД(a, b). Или разложите на множители и возьмите каждый с максимальным показателем.',
                solution: [
                    { explanation: 'Находим НОД({a}, {b}) через разложение или алгоритм Евклида.' },
                    { explanation: 'НОК = {a} × {b} ÷ НОД({a},{b}).' },
                    { explanation: 'НОК({a}, {b}) =', result: '{l}' },
                ],
                common_mistakes: [
                    { pattern: 'a * b', feedback: 'Это произведение, а не НОК. Правильно: {a}×{b}÷НОД({a},{b}) = {l}.' },
                    { pattern: 'gcd', feedback: 'Вы нашли НОД — наибольший общий делитель. НОК = {a}×{b}÷НОД = {l}.' },
                ],
            },
            3: {
                // НОК 60-200. Кортежи [a, b, l] — все проверены.
                // i=0:(8,18,72)   i=1:(8,22,88)   i=2:(8,26,104)  i=3:(8,30,120)
                // i=4:(9,21,63)   i=5:(9,30,90)   i=6:(12,18,36)  i=7:(15,20,60)
                template: 'Найдите наименьшее общее кратное чисел {a} и {b}.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?8:i===1?8:i===2?8:i===3?8:i===4?9:i===5?9:i===6?12:15' },
                    b: { type: 'expression', value: 'i===0?18:i===1?22:i===2?26:i===3?30:i===4?21:i===5?30:i===6?18:20' },
                    l: { type: 'expression', value: 'i===0?72:i===1?88:i===2?104:i===3?120:i===4?63:i===5?90:i===6?36:60' },
                },
                constraints: [],
                answer_formula: 'l',
                answer_type: 'number',
                hint: 'НОК = a × b ÷ НОД(a, b). Сначала найдите НОД({a}, {b}).',
                solution: [
                    { explanation: 'НОД({a}, {b}) — алгоритм Евклида.' },
                    { explanation: 'НОК({a}, {b}) = {a} × {b} ÷ НОД = {l}.' },
                    { explanation: 'Ответ:', result: '{l}' },
                ],
                common_mistakes: [
                    { pattern: 'a + b', feedback: 'НОК — не сумма. Используй формулу: {a}×{b}÷НОД({a},{b}) = {l}.' },
                    { pattern: 'a * b', feedback: '{a}×{b} слишком велико. НОК = {a}×{b}÷НОД({a},{b}) = {l}.' },
                ],
            },
        },
    },

    // ===== COORDINATES (Координатная плоскость) =====
    {
        id: 'grade6-coordinates',
        class: 6,
        subject: 'geometry',
        section: 'Координатная плоскость',
        topic: 'coordinate_plane',
        topic_title: 'Координатная плоскость',
        problemType: 'numeric',
        skills: ['coordinate_plane', 'coordinates_reading'],
        tags: ['coordinates', 'geometry', 'grade6'],
        relatedModule: 'coordinate-plane',
        version: 1,
        difficulties: {
            1: {
                // Точка A(px, py). ask=0 → абсцисса, ask=1 → ордината.
                // Кортежи [px, py, ask, ans] — все проверены.
                // i=0:(3,5,0,3)   i=1:(-4,7,1,7)  i=2:(6,-2,0,6)  i=3:(-3,-5,1,-5)
                // i=4:(8,4,0,8)   i=5:(2,-7,1,-7) i=6:(-6,3,0,-6) i=7:(5,-4,1,-4)
                template: 'Дана точка A({px}; {py}). Чему равна {question} точки A?',
                parameters: {
                    i:        { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    px:       { type: 'expression', value: 'i===0?3:i===1?-4:i===2?6:i===3?-3:i===4?8:i===5?2:i===6?-6:5' },
                    py:       { type: 'expression', value: 'i===0?5:i===1?7:i===2?-2:i===3?-5:i===4?4:i===5?-7:i===6?3:-4' },
                    ask:      { type: 'expression', value: 'i===0?0:i===1?1:i===2?0:i===3?1:i===4?0:i===5?1:i===6?0:1' },
                    question: { type: 'expression', value: 'ask === 0 ? "абсцисса (координата x)" : "ордината (координата y)"' },
                    ans:      { type: 'expression', value: 'i===0?3:i===1?7:i===2?6:i===3?-5:i===4?8:i===5?-7:i===6?-6:-4' },
                },
                constraints: [],
                answer_formula: 'ans',
                answer_type: 'number',
                hint: 'Абсцисса — это координата x (первое число в скобках). Ордината — координата y (второе число).',
                solution: [
                    { explanation: 'Точка A({px}; {py}): первое число — абсцисса (x), второе — ордината (y).' },
                    { explanation: 'Ответ:', result: '{ans}' },
                ],
                common_mistakes: [
                    { pattern: 'py', feedback: 'Абсцисса — это x (первое число). Ордината — y (второе число). Не перепутай!' },
                    { pattern: 'px', feedback: 'Ордината — это y (второе число в скобках), а не первое.' },
                ],
            },
            2: {
                // Четверть по знакам: I(+,+) II(-,+) III(-,-) IV(+,-)
                // Кортежи [px, py, q] — все проверены.
                // i=0:(3,5,1)  i=1:(-4,7,2)  i=2:(-3,-5,3) i=3:(6,-2,4)
                // i=4:(8,1,1)  i=5:(-7,2,2)  i=6:(-2,-8,3) i=7:(4,-6,4)
                template: 'В какой координатной четверти находится точка A({px}; {py})? Введите номер четверти (1, 2, 3 или 4).',
                parameters: {
                    i:  { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    px: { type: 'expression', value: 'i===0?3:i===1?-4:i===2?-3:i===3?6:i===4?8:i===5?-7:i===6?-2:4' },
                    py: { type: 'expression', value: 'i===0?5:i===1?7:i===2?-5:i===3?-2:i===4?1:i===5?2:i===6?-8:-6' },
                    q:  { type: 'expression', value: 'i===0?1:i===1?2:i===2?3:i===3?4:i===4?1:i===5?2:i===6?3:4' },
                },
                constraints: [],
                answer_formula: 'q',
                answer_type: 'number',
                hint: 'I: x>0, y>0 | II: x<0, y>0 | III: x<0, y<0 | IV: x>0, y<0.',
                solution: [
                    { explanation: 'Смотрим знаки: x={px}, y={py}.' },
                    { explanation: 'I четверть: x>0, y>0. II: x<0, y>0. III: x<0, y<0. IV: x>0, y<0.' },
                    { explanation: 'Ответ:', result: '{q} четверть' },
                ],
                common_mistakes: [
                    { pattern: '1', feedback: 'I четверть — только x>0 и y>0. Проверьте знаки: x={px}, y={py}.' },
                    { pattern: '2', feedback: 'II четверть — только x<0 и y>0. Проверьте знаки: x={px}, y={py}.' },
                ],
            },
            3: {
                // Расстояние между двумя точками на одной прямой (горизонталь или вертикаль).
                // Кортежи [x1, y1, x2, y2, dist] — все проверены.
                // i=0:(2,3,7,3,5)    i=1:(-3,4,5,4,8)   i=2:(4,1,4,6,5)
                // i=3:(-2,-5,-2,3,8) i=4:(1,2,7,2,6)    i=5:(3,-4,3,5,9)
                // i=6:(-4,0,4,0,8)   i=7:(-1,-3,6,-3,7)
                template: 'Найдите расстояние между точками A({x1}; {y1}) и B({x2}; {y2}).',
                parameters: {
                    i:    { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    x1:   { type: 'expression', value: 'i===0?2:i===1?-3:i===2?4:i===3?-2:i===4?1:i===5?3:i===6?-4:-1' },
                    y1:   { type: 'expression', value: 'i===0?3:i===1?4:i===2?1:i===3?-5:i===4?2:i===5?-4:i===6?0:-3' },
                    x2:   { type: 'expression', value: 'i===0?7:i===1?5:i===2?4:i===3?-2:i===4?7:i===5?3:i===6?4:6' },
                    y2:   { type: 'expression', value: 'i===0?3:i===1?4:i===2?6:i===3?3:i===4?2:i===5?5:i===6?0:-3' },
                    dist: { type: 'expression', value: 'i===0?5:i===1?8:i===2?5:i===3?8:i===4?6:i===5?9:i===6?8:7' },
                },
                constraints: [],
                answer_formula: 'dist',
                answer_type: 'number',
                hint: 'Если ординаты одинаковы — расстояние равно |x₂ − x₁|. Если абсциссы — |y₂ − y₁|.',
                solution: [
                    { explanation: 'Точки A({x1}; {y1}) и B({x2}; {y2}) лежат на одной прямой.' },
                    { explanation: 'Расстояние = модуль разности координат, которые различаются.' },
                    { explanation: 'Ответ:', result: '{dist}' },
                ],
                common_mistakes: [
                    { pattern: 'x2 - x1', feedback: 'Расстояние всегда положительное — берите модуль разности: |{x2} − {x1}|.' },
                    { pattern: 'x1 + x2', feedback: 'Расстояние — это разность координат, а не сумма: |{x2} − {x1}| = {dist}.' },
                ],
            },
        },
    },

    // ===== LINEAR EQUATIONS (Линейные уравнения) =====
    {
        id: 'grade6-linear-equations',
        class: 6,
        subject: 'algebra',
        section: 'Линейные уравнения',
        topic: 'linear_equations_basic',
        topic_title: 'Линейные уравнения',
        problemType: 'numeric',
        skills: ['linear_equations', 'solving_equations'],
        tags: ['equations', 'linear', 'grade6'],
        relatedModule: 'balance-scale',
        version: 1,
        difficulties: {
            1: {
                // x + a = b (op=1) → x = b - a
                // x - a = b (op=-1) → x = b + a
                // Кортежи [a, op, b, x] — все проверены.
                // i=0:(5,+,12,7)  i=1:(7,+,3,-4)  i=2:(4,-,9,13)  i=3:(8,-,2,10)
                // i=4:(5,+,-3,-8) i=5:(6,+,-1,-7)  i=6:(3,-,15,18) i=7:(9,+,-4,-13)
                template: 'Решите уравнение: x {sign} {a} = {b}.',
                parameters: {
                    i:    { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a:    { type: 'expression', value: 'i===0?5:i===1?7:i===2?4:i===3?8:i===4?5:i===5?6:i===6?3:9' },
                    op:   { type: 'expression', value: 'i===0?1:i===1?1:i===2?-1:i===3?-1:i===4?1:i===5?1:i===6?-1:1' },
                    b:    { type: 'expression', value: 'i===0?12:i===1?3:i===2?9:i===3?2:i===4?-3:i===5?-1:i===6?15:-4' },
                    sign: { type: 'expression', value: 'op === 1 ? "+" : "−"' },
                    x:    { type: 'expression', value: 'i===0?7:i===1?-4:i===2?13:i===3?10:i===4?-8:i===5?-7:i===6?18:-13' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Перенесите {a} в правую часть, изменив знак: x = {b} {sign} {a}.',
                solution: [
                    { explanation: 'Переносим {a} в правую часть, меняя знак.' },
                    { explanation: 'x = {b} − ({sign}{a})', result: 'x = {x}' },
                ],
                common_mistakes: [
                    { pattern: 'b + a', feedback: 'При переносе слагаемого знак меняется на противоположный.' },
                    { pattern: 'a - b', feedback: 'x выражается из уравнения: x = {b} − ({sign}{a}) = {x}.' },
                ],
            },
            2: {
                // ax + b = c → x = (c - b) / a
                // Кортежи [a, b, c, x] — все проверены.
                // i=0:(2,3,11,4)   i=1:(3,-6,9,5)   i=2:(2,-4,10,7)  i=3:(3,6,-9,-5)
                // i=4:(4,-8,16,6)  i=5:(2,5,-9,-7)  i=6:(3,-3,-12,-3) i=7:(5,5,-20,-5)
                // i=8:(4,2,18,4)   i=9:(5,-5,20,5)
                template: 'Решите уравнение: {a}x {signB} {absB} = {c}.',
                parameters: {
                    i:    { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
                    a:    { type: 'expression', value: 'i===0?2:i===1?3:i===2?2:i===3?3:i===4?4:i===5?2:i===6?3:i===7?5:i===8?4:5' },
                    b:    { type: 'expression', value: 'i===0?3:i===1?-6:i===2?-4:i===3?6:i===4?-8:i===5?5:i===6?-3:i===7?5:i===8?2:-5' },
                    c:    { type: 'expression', value: 'i===0?11:i===1?9:i===2?10:i===3?-9:i===4?16:i===5?-9:i===6?-12:i===7?-20:i===8?18:20' },
                    signB:{ type: 'expression', value: 'b >= 0 ? "+" : "−"' },
                    absB: { type: 'expression', value: 'b >= 0 ? b : -b' },
                    x:    { type: 'expression', value: 'i===0?4:i===1?5:i===2?7:i===3?-5:i===4?6:i===5?-7:i===6?-3:i===7?-5:i===8?4:5' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Перенесите {b} в правую часть: {a}x = {c} − ({b}). Затем разделите на {a}.',
                solution: [
                    { explanation: 'Переносим {b} в правую часть: {a}x = {c} − ({b}).' },
                    { explanation: '{a}x = {c} − ({b})' },
                    { explanation: 'Делим обе части на {a}:', result: 'x = {x}' },
                ],
                common_mistakes: [
                    { pattern: 'c / a', feedback: 'Сначала перенесите {b} в правую часть: {a}x = {c} − ({b}), затем делите на {a}.' },
                    { pattern: '(c + b) / a', feedback: 'При переносе знак меняется: {a}x = {c} − ({b}), не плюс.' },
                ],
            },
            3: {
                // ax + b = cx + d → x = (d - b) / (a - c)
                // Кортежи [a, b, c, d, x] — вычислены как d=(a-c)*x+b, все проверены.
                // i=0:(5,-3,2,6,3)   i=1:(4,2,1,8,2)    i=2:(3,8,1,0,-4)
                // i=3:(4,-5,2,7,6)   i=4:(5,4,3,-2,-3)  i=5:(7,-6,4,9,5)
                // i=6:(6,3,2,-17,-5) i=7:(5,-2,3,6,4)
                template: 'Решите уравнение: {a}x {signB} {absB} = {c}x {signD} {absD}.',
                parameters: {
                    i:    { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a:    { type: 'expression', value: 'i===0?5:i===1?4:i===2?3:i===3?4:i===4?5:i===5?7:i===6?6:5' },
                    b:    { type: 'expression', value: 'i===0?-3:i===1?2:i===2?8:i===3?-5:i===4?4:i===5?-6:i===6?3:-2' },
                    c:    { type: 'expression', value: 'i===0?2:i===1?1:i===2?1:i===3?2:i===4?3:i===5?4:i===6?2:3' },
                    d:    { type: 'expression', value: 'i===0?6:i===1?8:i===2?0:i===3?7:i===4?-2:i===5?9:i===6?-17:6' },
                    signB:{ type: 'expression', value: 'b >= 0 ? "+" : "−"' },
                    absB: { type: 'expression', value: 'b >= 0 ? b : -b' },
                    signD:{ type: 'expression', value: 'd >= 0 ? "+" : "−"' },
                    absD: { type: 'expression', value: 'd >= 0 ? d : -d' },
                    diff: { type: 'expression', value: 'a - c' },
                    rhs:  { type: 'expression', value: 'd - b' },
                    x:    { type: 'expression', value: 'i===0?3:i===1?2:i===2?-4:i===3?6:i===4?-3:i===5?5:i===6?-5:4' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Перенесите {c}x в левую часть, {b} — в правую. Получите {diff}x = {rhs}, затем разделите.',
                solution: [
                    { explanation: 'Переносим {c}x влево, {b} вправо:' },
                    { explanation: '{a}x − {c}x = {d} − ({b})' },
                    { explanation: '{diff}x = {rhs}', result: 'x = {x}' },
                ],
                common_mistakes: [
                    { pattern: 'd / c', feedback: 'Нельзя делить правую часть на коэффициент из правой части. Сначала перенесите x-члены влево.' },
                    { pattern: '(d + b) / (a - c)', feedback: 'При переносе {b} знак меняется: {a}x − {c}x = {d} − ({b}) = {rhs}.' },
                ],
            },
        },
    },

    // ===== LINEAR EQUATIONS WITH BRACKETS (Уравнения со скобками) =====
    {
        id: 'grade6-linear-equations-brackets',
        class: 6,
        subject: 'algebra',
        section: 'Линейные уравнения',
        topic: 'linear_equations_brackets',
        topic_title: 'Уравнения со скобками',
        problemType: 'numeric',
        skills: ['linear_equations', 'expanding_brackets'],
        tags: ['equations', 'brackets', 'grade6'],
        relatedModule: 'balance-scale',
        version: 1,
        difficulties: {
            1: {
                // a(x+b)=c → x = c/a - b. c кратно a, x — целое.
                // Кортежи [a, b, c, x] — все проверены.
                // i=0:(2,3,14,4)  i=1:(3,2,15,3)  i=2:(2,-4,12,10) i=3:(4,1,20,4)
                // i=4:(3,-3,18,9) i=5:(2,5,18,4)  i=6:(4,-2,24,8)  i=7:(3,4,21,3)
                template: 'Решите уравнение: {a}(x {signB} {absB}) = {c}.',
                parameters: {
                    i:     { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a:     { type: 'expression', value: 'i===0?2:i===1?3:i===2?2:i===3?4:i===4?3:i===5?2:i===6?4:3' },
                    b:     { type: 'expression', value: 'i===0?3:i===1?2:i===2?-4:i===3?1:i===4?-3:i===5?5:i===6?-2:4' },
                    c:     { type: 'expression', value: 'i===0?14:i===1?15:i===2?12:i===3?20:i===4?18:i===5?18:i===6?24:21' },
                    signB: { type: 'expression', value: 'b >= 0 ? "+" : "−"' },
                    absB:  { type: 'expression', value: 'b >= 0 ? b : -b' },
                    x:     { type: 'expression', value: 'i===0?4:i===1?3:i===2?10:i===3?4:i===4?9:i===5?4:i===6?8:3' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Раскройте скобки: {a}x {signB} {a}×{absB} = {c}. Затем перенесите число в правую часть.',
                solution: [
                    { explanation: 'Раскрываем скобки: {a}x {signB} {a}·{absB} = {c}.' },
                    { explanation: 'Переносим: {a}x = {c} − ({b}·{a} ÷ {a} · {a}).' },
                    { explanation: 'x = {c} ÷ {a} − ({b}) =', result: '{x}' },
                ],
                common_mistakes: [
                    { pattern: 'c / a', feedback: 'Не забудьте вычесть {b}: x = {c}/{a} − ({b}) = {x}.' },
                    { pattern: 'c - b', feedback: 'Сначала делите {c} на {a}: x = {c}/{a} − ({b}) = {x}.' },
                ],
            },
            2: {
                // -a(x+b)=c → x = -c/a - b. Задаём a,b,x → c = -a*(x+b).
                // Кортежи [a, b, c, x] — все проверены.
                // i=0:(2,3,-14,4)  i=1:(2,-5,14,-2)  i=2:(2,-4,-6,7)  i=3:(4,1,8,-3)
                // i=4:(3,-2,-9,5)  i=5:(2,5,-4,-3)   i=6:(4,3,8,-5)   i=7:(3,-4,-6,6)
                template: 'Решите уравнение: −{a}(x {signB} {absB}) = {c}.',
                parameters: {
                    i:     { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a:     { type: 'expression', value: 'i===0?2:i===1?2:i===2?2:i===3?4:i===4?3:i===5?2:i===6?4:3' },
                    b:     { type: 'expression', value: 'i===0?3:i===1?-5:i===2?-4:i===3?1:i===4?-2:i===5?5:i===6?3:-4' },
                    c:     { type: 'expression', value: 'i===0?-14:i===1?14:i===2?-6:i===3?8:i===4?-9:i===5?-4:i===6?8:-6' },
                    signB: { type: 'expression', value: 'b >= 0 ? "+" : "−"' },
                    absB:  { type: 'expression', value: 'b >= 0 ? b : -b' },
                    x:     { type: 'expression', value: 'i===0?4:i===1?-2:i===2?7:i===3?-3:i===4?5:i===5?-3:i===6?-5:6' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Раскройте скобки: −{a}x {signB} (−{a})·{absB} = {c}. Перенесите слагаемые.',
                solution: [
                    { explanation: 'Раскрываем: −{a}x − {a}·({b}) = {c}.' },
                    { explanation: '−{a}x = {c} + {a}·({b}).' },
                    { explanation: 'x = −({c} + {a}·{b}) ÷ {a} =', result: '{x}' },
                ],
                common_mistakes: [
                    { pattern: 'c / a', feedback: 'Знак минус перед {a} меняет всё! x = −{c}/{a} − ({b}) = {x}.' },
                    { pattern: '-c / a', feedback: 'Не забудьте вычесть {b}: x = −{c}/{a} − ({b}) = {x}.' },
                ],
            },
            3: {
                // a(x+b)+d=k → x = (k-d)/a - b.
                // Задаём a,b,d,x → k = a*(x+b)+d. Кортежи [a, b, d, k, x] — все проверены.
                // i=0:(2,3,5,19,4)   i=1:(3,2,-6,9,3)   i=2:(2,-4,8,-6,-3) i=3:(4,1,3,27,5)
                // i=4:(2,3,-4,-2,-2) i=5:(3,-2,6,12,4)  i=6:(2,5,-10,-2,-1) i=7:(4,-1,5,9,2)
                template: 'Решите уравнение: {a}(x {signB} {absB}) {signD} {absD} = {k}.',
                parameters: {
                    i:     { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a:     { type: 'expression', value: 'i===0?2:i===1?3:i===2?2:i===3?4:i===4?2:i===5?3:i===6?2:4' },
                    b:     { type: 'expression', value: 'i===0?3:i===1?2:i===2?-4:i===3?1:i===4?3:i===5?-2:i===6?5:-1' },
                    d:     { type: 'expression', value: 'i===0?5:i===1?-6:i===2?8:i===3?3:i===4?-4:i===5?6:i===6?-10:5' },
                    k:     { type: 'expression', value: 'i===0?19:i===1?9:i===2?-6:i===3?27:i===4?-2:i===5?12:i===6?-2:9' },
                    signB: { type: 'expression', value: 'b >= 0 ? "+" : "−"' },
                    absB:  { type: 'expression', value: 'b >= 0 ? b : -b' },
                    signD: { type: 'expression', value: 'd >= 0 ? "+" : "−"' },
                    absD:  { type: 'expression', value: 'd >= 0 ? d : -d' },
                    x:     { type: 'expression', value: 'i===0?4:i===1?3:i===2?-3:i===3?5:i===4?-2:i===5?4:i===6?-1:2' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Перенесите {d} вправо, затем раскройте скобки и найдите x.',
                solution: [
                    { explanation: 'Переносим {d}: {a}(x {signB} {absB}) = {k} − ({d}).' },
                    { explanation: 'Раскрываем скобки, делим на {a}.' },
                    { explanation: 'x =', result: '{x}' },
                ],
                common_mistakes: [
                    { pattern: 'k / a', feedback: 'Сначала перенесите {d}: {a}(x{signB}{absB}) = {k}−({d}), затем делите на {a}.' },
                    { pattern: 'k - d', feedback: 'После переноса {d} нужно ещё раскрыть скобки и вычесть {b}.' },
                ],
            },
        },
    },

    // ===== TEXT PROBLEMS (Текстовые задачи через уравнения) =====
    {
        id: 'grade6-text-problems',
        class: 6,
        subject: 'algebra',
        section: 'Линейные уравнения',
        topic: 'word_problems_equations',
        topic_title: 'Текстовые задачи',
        problemType: 'numeric',
        skills: ['linear_equations', 'problem_solving', 'algebraic_modelling'],
        tags: ['word_problems', 'equations', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // Задачи на сумму: k·x + x = c → x = c/(k+1).
                // Меньшая часть — x. Кортежи [k, c, x] — все проверены.
                // i=0:(3,24,6) i=1:(4,20,4) i=2:(2,18,6) i=3:(3,28,7)
                // i=4:(5,24,4) i=5:(2,27,9) i=6:(4,25,5) i=7:(3,32,8)
                template: 'В первой корзине в {k} раза больше {item}, чем во второй. Всего в двух корзинах {c} {item}. Сколько {item} во второй корзине?',
                parameters: {
                    i:    { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    k:    { type: 'expression', value: 'i===0?3:i===1?4:i===2?2:i===3?3:i===4?5:i===5?2:i===6?4:3' },
                    c:    { type: 'expression', value: 'i===0?24:i===1?20:i===2?18:i===3?28:i===4?24:i===5?27:i===6?25:32' },
                    item: { type: 'expression', value: 'i===0?"яблок":i===1?"конфет":i===2?"книг":i===3?"тетрадей":i===4?"орехов":i===5?"карандашей":i===6?"монет":"марок"' },
                    x:    { type: 'expression', value: 'i===0?6:i===1?4:i===2?6:i===3?7:i===4?4:i===5?9:i===6?5:8' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Пусть x — число {item} во второй корзине. Тогда в первой {k}x. Составьте уравнение: {k}x + x = {c}.',
                solution: [
                    { explanation: 'Пусть x — {item} во второй корзине, тогда в первой {k}x.' },
                    { explanation: 'Уравнение: {k}x + x = {c} → {k+1}x = {c}.' },
                    { explanation: 'x = {c} ÷ {k+1} =', result: '{x}' },
                ],
                common_mistakes: [
                    { pattern: 'c / k', feedback: 'Суммарный коэффициент = {k}+1 = {k+1}, а не {k}: x = {c} ÷ {k+1} = {x}.' },
                    { pattern: 'c - k', feedback: 'Составьте уравнение: {k}x + x = {c} → x = {c} ÷ {k+1} = {x}.' },
                ],
            },
            2: {
                // Задачи на разность: x + (x + d) = c → x = (c−d)/2.
                // x — тот, у кого меньше. Кортежи [d, c, x] — все проверены.
                // i=0:(15,45,15) i=1:(8,36,14) i=2:(10,50,20) i=3:(6,30,12)
                // i=4:(14,48,17) i=5:(18,54,18) i=6:(4,26,11) i=7:(20,64,22)
                template: 'У {nameA} на {d} {item} больше, чем у {nameB}. Вместе у них {c} {item}. Сколько {item} у {nameB}?',
                parameters: {
                    i:     { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    d:     { type: 'expression', value: 'i===0?15:i===1?8:i===2?10:i===3?6:i===4?14:i===5?18:i===6?4:20' },
                    c:     { type: 'expression', value: 'i===0?45:i===1?36:i===2?50:i===3?30:i===4?48:i===5?54:i===6?26:64' },
                    item:  { type: 'expression', value: 'i===0?"марок":i===1?"книг":i===2?"открыток":i===3?"значков":i===4?"монет":i===5?"наклеек":i===6?"фишек":"карточек"' },
                    nameA: { type: 'expression', value: 'i===0?"Петя":i===1?"Маша":i===2?"Саша":i===3?"Лена":i===4?"Коля":i===5?"Дима":i===6?"Аня":"Вася"' },
                    nameB: { type: 'expression', value: 'i===0?"Коля":i===1?"Вася":i===2?"Таня":i===3?"Миша":i===4?"Юля":i===5?"Катя":i===6?"Боря":"Ира"' },
                    x:     { type: 'expression', value: 'i===0?15:i===1?14:i===2?20:i===3?12:i===4?17:i===5?18:i===6?11:22' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Пусть x — число {item} у {nameB}. Тогда у {nameA} x + {d}. Уравнение: x + (x + {d}) = {c}.',
                solution: [
                    { explanation: 'Пусть x — {item} у {nameB}, тогда у {nameA} — (x + {d}).' },
                    { explanation: 'Уравнение: x + (x + {d}) = {c} → 2x + {d} = {c} → 2x = {c} − {d}.' },
                    { explanation: 'x = ({c} − {d}) ÷ 2 =', result: '{x}' },
                ],
                common_mistakes: [
                    { pattern: 'c / 2', feedback: 'Сначала вычтите {d}: 2x = {c} − {d} = {c-d}, затем x = {c-d} ÷ 2 = {x}.' },
                    { pattern: '(c + d) / 2', feedback: 'Знак неверный: 2x = {c} − {d}, а не плюс: x = {x}.' },
                ],
            },
            3: {
                // Два типа задач чередуются:
                // Тип A (движение навстречу, чётные i): (v1+v2)*t = dist → t = dist/(v1+v2)
                //   i=0: dist=120,v1=40,v2=20,t=2
                //   i=2: dist=300,v1=60,v2=40,t=3
                //   i=4: dist=480,v1=80,v2=40,t=4
                //   i=6: dist=500,v1=75,v2=25,t=5
                // Тип B (пересыпание, нечётные i): k*x − d = x → x = d/(k−1)
                //   i=1: k=3,d=10,x=5
                //   i=3: k=3,d=12,x=6
                //   i=5: k=3,d=16,x=8
                //   i=7: k=4,d=12,x=4
                template: '{problemText}',
                parameters: {
                    i:           { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    // Тип A: движение навстречу
                    dist:        { type: 'expression', value: 'i===0?120:i===2?300:i===4?480:i===6?500:0' },
                    v1:          { type: 'expression', value: 'i===0?40:i===2?60:i===4?80:i===6?75:0' },
                    v2:          { type: 'expression', value: 'i===0?20:i===2?40:i===4?40:i===6?25:0' },
                    // Тип B: пересыпание (k раз больше, переложили d → стало поровну → x*k − d = x)
                    kB:          { type: 'expression', value: 'i===1?3:i===3?3:i===5?3:i===7?4:0' },
                    dB:          { type: 'expression', value: 'i===1?10:i===3?12:i===5?16:i===7?12:0' },
                    problemText: { type: 'expression', value: 'i===0?"Из двух городов навстречу друг другу выехали велосипедисты со скоростями 40 и 20 км/ч. Расстояние между городами 120 км. Через сколько часов они встретятся?":i===1?"В одном мешке в 3 раза больше крупы, чем в другом. Если из большого мешка переложить 10 кг в малый, крупы станет поровну. Сколько кг крупы в малом мешке?":i===2?"Из двух городов навстречу выехали автобусы со скоростями 60 и 40 км/ч. Расстояние 300 км. Через сколько часов они встретятся?":i===3?"В одной бочке в 3 раза больше воды, чем в другой. Если из большой перелить 12 л в малую, воды станет поровну. Сколько литров в малой бочке?":i===4?"Два поезда выехали навстречу со скоростями 80 и 40 км/ч. Расстояние 480 км. Через сколько часов встретятся?":i===5?"На одной полке в 3 раза больше книг, чем на другой. Если с большой переставить 16 книг на малую, книг станет поровну. Сколько книг на малой полке?":i===6?"Два велосипедиста выехали навстречу со скоростями 75 и 25 км/ч. Расстояние 500 км. Через сколько часов встретятся?":"В одной стопке в 4 раза больше листов, чем в другой. Если из большой переложить 12 листов в малую, листов станет поровну. Сколько листов в малой стопке?"' },
                    x:           { type: 'expression', value: 'i===0?2:i===1?5:i===2?3:i===3?6:i===4?4:i===5?8:i===6?5:4' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Для задач на движение: расстояние = (v₁ + v₂) × t. Для задач на пересыпание: пусть x — меньшая часть, тогда большая = kx; kx − d = x → x = d ÷ (k−1).',
                solution: [
                    { explanation: 'Читаем условие и определяем неизвестное x.' },
                    { explanation: 'Составляем уравнение и решаем.' },
                    { explanation: 'Ответ:', result: '{x}' },
                ],
                common_mistakes: [
                    { pattern: 'dist / v1', feedback: 'Скорости нужно сложить: t = dist ÷ (v₁ + v₂). При движении навстречу скорости складываются.' },
                    { pattern: 'dB / kB', feedback: 'Уравнение: {kB}x − {dB} = x → ({kB}−1)x = {dB} → x = {dB} ÷ ({kB}−1) = {x}.' },
                ],
            },
        },
    },

    // ===== PROPORTIONALITY (Прямая и обратная пропорциональность) =====
    {
        id: 'grade6-proportionality',
        class: 6,
        subject: 'algebra',
        section: 'Отношения и пропорции',
        topic: 'direct_proportion',
        topic_title: 'Прямая и обратная пропорциональность',
        problemType: 'numeric',
        skills: ['proportionality', 'inverse_proportionality'],
        tags: ['proportionality', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // Прямая пропорциональность. Ответ: 1 = прямая, 2 = обратная.
                // Все задания diff1 — прямая (ответ 1).
                template: 'Чем больше {descA}, тем {comparative} {descB}. Какой тип зависимости? Введите: 1 — прямая, 2 — обратная.',
                parameters: {
                    i:          { type: 'choice', values: [0, 1, 2, 3, 4, 5] },
                    descA:      { type: 'expression', value: 'i===0?"товаров купили":i===1?"часов работали":i===2?"метров ткани купили":i===3?"кг муки взяли":i===4?"дней работали":i===5?"литров бензина залили"' },
                    comparative:{ type: 'expression', value: '"больше"' },
                    descB:      { type: 'expression', value: 'i===0?"больше денег заплатили":i===1?"больше работы выполнили":i===2?"больше денег потратили":i===3?"больше блинов испекли":i===4?"больше деталей сделали":i===5?"дальше проедет машина"' },
                },
                constraints: [],
                answer_formula: '1',
                answer_type: 'number',
                hint: 'Прямая пропорциональность: если одна величина увеличивается, другая тоже увеличивается. Обратная — одна растёт, другая убывает.',
                solution: [
                    { explanation: 'Чем больше {descA} — тем больше {descB}. Обе величины изменяются в одну сторону.' },
                    { explanation: 'Это прямая пропорциональность.', result: '1' },
                ],
                common_mistakes: [
                    { pattern: '2', feedback: 'Обратная — когда одно растёт, другое убывает. Здесь обе величины растут → прямая пропорциональность.' },
                ],
            },
            2: {
                // Обратная пропорциональность. Ответ: 2.
                template: 'Чем больше {descA}, тем {comparative} {descB}. Какой тип зависимости? Введите: 1 — прямая, 2 — обратная.',
                parameters: {
                    i:          { type: 'choice', values: [0, 1, 2, 3, 4, 5] },
                    descA:      { type: 'expression', value: 'i===0?"рабочих на стройке":i===1?"скорость машины":i===2?"кранов работает":i===3?"насосов откачивают":i===4?"бригад работает":i===5?"тракторов пашет"' },
                    comparative:{ type: 'expression', value: '"меньше"' },
                    descB:      { type: 'expression', value: 'i===0?"дней потребуется":i===1?"меньше времени в пути":i===2?"меньше часов уйдёт на работу":i===3?"меньше времени откачки":i===4?"меньше дней строительства":i===5?"меньше дней пахоты"' },
                },
                constraints: [],
                answer_formula: '2',
                answer_type: 'number',
                hint: 'Обратная пропорциональность: если одна величина увеличивается, другая уменьшается. Их произведение постоянно.',
                solution: [
                    { explanation: 'Чем больше {descA} — тем меньше {descB}. Одна растёт, другая убывает.' },
                    { explanation: 'Это обратная пропорциональность.', result: '2' },
                ],
                common_mistakes: [
                    { pattern: '1', feedback: 'Прямая — когда обе величины изменяются в одну сторону. Здесь одна растёт, другая убывает → обратная.' },
                ],
            },
            3: {
                // Расчёт по обратной пропорциональности: n1*t1 = n2*t2.
                // Кортежи [n1, t1, n2, t2] — все проверены.
                // i=0:(2,6,3,4)  i=1:(3,8,4,6)  i=2:(4,9,6,6)  i=3:(2,10,5,4)
                // i=4:(3,12,4,9) i=5:(5,6,3,10) i=6:(6,4,3,8)  i=7:(4,15,6,10)
                template: '{n1} рабочих выполняют задание за {t1} часов. За сколько часов выполнят то же задание {n2} рабочих?',
                parameters: {
                    i:  { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    n1: { type: 'expression', value: 'i===0?2:i===1?3:i===2?4:i===3?2:i===4?3:i===5?5:i===6?6:4' },
                    t1: { type: 'expression', value: 'i===0?6:i===1?8:i===2?9:i===3?10:i===4?12:i===5?6:i===6?4:15' },
                    n2: { type: 'expression', value: 'i===0?3:i===1?4:i===2?6:i===3?5:i===4?4:i===5?3:i===6?3:6' },
                    t2: { type: 'expression', value: 'i===0?4:i===1?6:i===2?6:i===3?4:i===4?9:i===5?10:i===6?8:10' },
                },
                constraints: [],
                answer_formula: 't2',
                answer_type: 'number',
                hint: 'Обратная пропорциональность: n₁ × t₁ = n₂ × t₂. Найдите t₂ = {n1} × {t1} ÷ {n2}.',
                solution: [
                    { explanation: 'n₁ × t₁ = n₂ × t₂ → t₂ = {n1} × {t1} ÷ {n2}.' },
                    { explanation: 't₂ = {n1} × {t1} ÷ {n2} =', result: '{t2} часов' },
                ],
                common_mistakes: [
                    { pattern: 'n1 * t1 * n2', feedback: 'Нужно делить: t₂ = {n1} × {t1} ÷ {n2} = {t2}.' },
                    { pattern: 't1 * n2 / n1', feedback: 'Обратная пропорциональность: t₂ = n₁ × t₁ ÷ n₂ = {n1} × {t1} ÷ {n2} = {t2}.' },
                ],
            },
        },
    },

    // ===== PERCENT CHANGE (Процентное изменение) =====
    {
        id: 'grade6-percent-change',
        class: 6,
        subject: 'algebra',
        section: 'Проценты',
        topic: 'percent_change',
        topic_title: 'Процентное изменение',
        problemType: 'numeric',
        skills: ['percent', 'percent_change'],
        tags: ['percent', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // Увеличение: new = old * (1 + p/100). Кортежи с p ∈ {10,20,25,50}.
                // i=0:(40,44,10) i=1:(40,48,20) i=2:(40,50,25) i=3:(40,60,50)
                // i=4:(60,66,10) i=5:(60,72,20) i=6:(60,75,25) i=7:(60,90,50)
                template: 'Цена товара {dir} с {old} руб. до {nv} руб. На сколько процентов {question}?',
                parameters: {
                    i:        { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    old:      { type: 'expression', value: 'i<=3?40:60' },
                    nv:       { type: 'expression', value: 'i===0?44:i===1?48:i===2?50:i===3?60:i===4?66:i===5?72:i===6?75:90' },
                    pct:      { type: 'expression', value: 'i===0?10:i===1?20:i===2?25:i===3?50:i===4?10:i===5?20:i===6?25:50' },
                    dir:      { type: 'expression', value: '"выросла"' },
                    question: { type: 'expression', value: '"она выросла"' },
                },
                constraints: [],
                answer_formula: 'pct',
                answer_type: 'number',
                hint: 'Процент изменения = (новое − старое) ÷ старое × 100 = ({nv} − {old}) ÷ {old} × 100.',
                solution: [
                    { explanation: '({nv} − {old}) ÷ {old} × 100.' },
                    { explanation: '= ({nv} − {old}) ÷ {old} × 100 =', result: '{pct}%' },
                ],
                common_mistakes: [
                    { pattern: 'nv - old', feedback: 'Это абсолютное изменение. Для процентов делим на старое и умножаем на 100: ({nv}−{old})÷{old}×100={pct}%.' },
                    { pattern: '(nv - old) / nv * 100', feedback: 'Делить нужно на СТАРОЕ значение {old}, а не на новое: ({nv}−{old})÷{old}×100={pct}%.' },
                ],
            },
            2: {
                // Уменьшение: new = old * (1 - p/100).
                // i=0:(40,36,10) i=1:(40,32,20) i=2:(40,30,25) i=3:(40,20,50)
                // i=4:(80,72,10) i=5:(80,64,20) i=6:(80,60,25) i=7:(80,40,50)
                template: 'Цена товара снизилась с {old} руб. до {nv} руб. На сколько процентов она уменьшилась?',
                parameters: {
                    i:   { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    old: { type: 'expression', value: 'i<=3?40:80' },
                    nv:  { type: 'expression', value: 'i===0?36:i===1?32:i===2?30:i===3?20:i===4?72:i===5?64:i===6?60:40' },
                    pct: { type: 'expression', value: 'i===0?10:i===1?20:i===2?25:i===3?50:i===4?10:i===5?20:i===6?25:50' },
                },
                constraints: [],
                answer_formula: 'pct',
                answer_type: 'number',
                hint: 'Процент снижения = (старое − новое) ÷ старое × 100 = ({old} − {nv}) ÷ {old} × 100.',
                solution: [
                    { explanation: '({old} − {nv}) ÷ {old} × 100.' },
                    { explanation: '= ({old} − {nv}) ÷ {old} × 100 =', result: '{pct}%' },
                ],
                common_mistakes: [
                    { pattern: 'old - nv', feedback: 'Это абсолютное снижение. Для % делим на старое: ({old}−{nv})÷{old}×100={pct}%.' },
                    { pattern: '(old - nv) / nv * 100', feedback: 'Делить нужно на СТАРОЕ значение {old}: ({old}−{nv})÷{old}×100={pct}%.' },
                ],
            },
            3: {
                // Смешанные: задание через слова, нужно найти исходное значение.
                // new = old * (1 + p/100), найти old. Кортежи [nv, p, old].
                // i=0:(44,10,40)  i=1:(60,50,40) i=2:(75,25,60) i=3:(96,20,80)
                // i=4:(110,10,100) i=5:(150,50,100) i=6:(50,25,40) i=7:(72,20,60)
                template: 'После повышения на {p}% товар стал стоить {nv} руб. Сколько стоил товар до повышения?',
                parameters: {
                    i:   { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    nv:  { type: 'expression', value: 'i===0?44:i===1?60:i===2?75:i===3?96:i===4?110:i===5?150:i===6?50:72' },
                    p:   { type: 'expression', value: 'i===0?10:i===1?50:i===2?25:i===3?20:i===4?10:i===5?50:i===6?25:20' },
                    old: { type: 'expression', value: 'i===0?40:i===1?40:i===2?60:i===3?80:i===4?100:i===5?100:i===6?40:60' },
                },
                constraints: [],
                answer_formula: 'old',
                answer_type: 'number',
                hint: 'new = old × (1 + p/100). Значит old = new ÷ (1 + {p}/100) = {nv} ÷ {1+p/100}.',
                solution: [
                    { explanation: '{nv} = old × (1 + {p}/100) = old × {1+p/100}.' },
                    { explanation: 'old = {nv} ÷ {1+p/100} =', result: '{old} руб.' },
                ],
                common_mistakes: [
                    { pattern: 'nv * (1 - p/100)', feedback: 'Нельзя просто вычесть проценты от нового значения. old = {nv} ÷ (1+{p}/100) = {old}.' },
                    { pattern: 'nv - nv*p/100', feedback: 'old = new ÷ (1+{p}/100) = {nv} ÷ {1+p/100} = {old}.' },
                ],
            },
        },
    },

    // ===== PERCENT - NUMBER BY PERCENT (Нахождение числа по проценту) =====
    {
        id: 'grade6-percent-by-number',
        class: 6,
        subject: 'algebra',
        section: 'Проценты',
        topic: 'number_by_percent',
        topic_title: 'Нахождение числа по проценту',
        problemType: 'numeric',
        skills: ['percent', 'number_by_percent'],
        tags: ['percent', 'grade6'],
        relatedModule: 'pie-chart',
        version: 1,
        difficulties: {
            1: {
                // p% числа = v → n = v * 100 / p. p ∈ {10,50}, «удобные» проценты.
                // i=0:(10,90,9→900/10=90) … кортежи из оригинального diff2 i=0..3,12..15
                // i=0:(10,90,9)   i=1:(10,120,12) i=2:(10,250,25) i=3:(10,400,40)
                // i=4:(50,70,35)  i=5:(50,90,45)  i=6:(50,160,80) i=7:(50,300,150)
                template: 'Найдите число, если {p}% от него равны {v}.',
                parameters: {
                    i:   { type: 'choice', values: [0,1,2,3,4,5,6,7] },
                    p:   { type: 'expression', value: 'i<=3?10:50' },
                    n:   { type: 'expression', value: 'i===0?90:i===1?120:i===2?250:i===3?400:i===4?70:i===5?90:i===6?160:300' },
                    v:   { type: 'expression', value: 'i===0?9:i===1?12:i===2?25:i===3?40:i===4?35:i===5?45:i===6?80:150' },
                },
                constraints: [],
                answer_formula: 'n',
                answer_type: 'number',
                hint: 'Если {p}% числа = {v}, то 1% = {v} ÷ {p}, а всё число (100%) = (1%) × 100.',
                solution: [
                    { explanation: '{p}% числа = {v}.' },
                    { explanation: '1% числа: {v} ÷ {p}.' },
                    { explanation: '100% (всё число): ({v} ÷ {p}) × 100 =', result: '{n}' },
                ],
                common_mistakes: [
                    { pattern: 'v * p / 100', feedback: 'Это формула нахождения % от числа. Здесь обратная задача: ({v} ÷ {p}) × 100 = {n}.' },
                    { pattern: 'v + p', feedback: 'Нельзя прибавить процент. ({v} ÷ {p}) × 100 = {n}.' },
                ],
            },
            2: {
                // p ∈ {20,25}. Кортежи из оригинального diff2 i=4..11.
                // i=0:(20,75,15) i=1:(20,90,18)  i=2:(20,150,30) i=3:(20,400,80)
                // i=4:(25,60,15) i=5:(25,80,20)  i=6:(25,160,40) i=7:(25,240,60)
                template: 'Найдите число, если {p}% от него равны {v}.',
                parameters: {
                    i:   { type: 'choice', values: [0,1,2,3,4,5,6,7] },
                    p:   { type: 'expression', value: 'i<=3?20:25' },
                    n:   { type: 'expression', value: 'i===0?75:i===1?90:i===2?150:i===3?400:i===4?60:i===5?80:i===6?160:240' },
                    v:   { type: 'expression', value: 'i===0?15:i===1?18:i===2?30:i===3?80:i===4?15:i===5?20:i===6?40:60' },
                },
                constraints: [],
                answer_formula: 'n',
                answer_type: 'number',
                hint: 'Если {p}% числа = {v}: 1% = {v} ÷ {p}, всё число = ({v} ÷ {p}) × 100.',
                solution: [
                    { explanation: '1% = {v} ÷ {p}.' },
                    { explanation: '100% = ({v} ÷ {p}) × 100 =', result: '{n}' },
                ],
                common_mistakes: [
                    { pattern: 'v * p / 100', feedback: 'Обратная задача: ({v} ÷ {p}) × 100 = {n}, а не {v} × {p} ÷ 100.' },
                    { pattern: 'v / p', feedback: 'Это только 1%. Нужно умножить ещё на 100: ({v} ÷ {p}) × 100 = {n}.' },
                ],
            },
            3: {
                // Текстовая обёртка. Кортежи те же что diff2 i=0..7, формулировка через контекст.
                template: 'В классе {v} учеников, что составляет {p}% от всех учеников школы. Сколько учеников в школе?',
                parameters: {
                    i:   { type: 'choice', values: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
                    p:   { type: 'expression', value: 'i<=3?10:i<=7?20:i<=11?25:50' },
                    n:   { type: 'expression', value: 'i===0?90:i===1?120:i===2?250:i===3?400:i===4?75:i===5?90:i===6?150:i===7?400:i===8?60:i===9?80:i===10?160:i===11?240:i===12?70:i===13?90:i===14?160:300' },
                    v:   { type: 'expression', value: 'i===0?9:i===1?12:i===2?25:i===3?40:i===4?15:i===5?18:i===6?30:i===7?80:i===8?15:i===9?20:i===10?40:i===11?60:i===12?35:i===13?45:i===14?80:150' },
                },
                constraints: [],
                answer_formula: 'n',
                answer_type: 'number',
                hint: '{p}% = {v} учеников. Значит 1% = {v} ÷ {p}, а 100% = ({v} ÷ {p}) × 100.',
                solution: [
                    { explanation: '{p}% от всех = {v}.' },
                    { explanation: '1% = {v} ÷ {p}.' },
                    { explanation: '100% = ({v} ÷ {p}) × 100 =', result: '{n} учеников' },
                ],
                common_mistakes: [
                    { pattern: 'v * p', feedback: 'Нужно делить, а не умножать: ({v} ÷ {p}) × 100 = {n}.' },
                    { pattern: 'v + p', feedback: 'Составьте пропорцию: если {p}% = {v}, то 100% = {n}.' },
                ],
            },
        },
    },

    // ===== PERCENT (Нахождение процента от числа) =====
    {
        id: 'grade6-percent',
        class: 6,
        subject: 'algebra',
        section: 'Проценты',
        topic: 'percent_of_number',
        topic_title: 'Нахождение процента от числа',
        problemType: 'numeric',
        skills: ['percent', 'percent_of_number'],
        tags: ['percent', 'grade6'],
        relatedModule: 'pie-chart',
        version: 1,
        difficulties: {
            1: {
                // p% от n → n * p / 100. Только «удобные» проценты: 10, 20, 25, 50.
                // Кортежи (p, n, ans): гарантируют целый ответ.
                // i=0:(10,80,8)  i=1:(10,150,15) i=2:(10,200,20) i=3:(10,350,35)
                // i=4:(20,60,12) i=5:(20,150,30) i=6:(20,200,40) i=7:(20,350,70)
                // i=8:(25,40,10) i=9:(25,80,20)  i=10:(25,120,30) i=11:(25,200,50)
                // i=12:(50,60,30) i=13:(50,80,40) i=14:(50,150,75) i=15:(50,200,100)
                template: 'Найдите {p}% от числа {n}.',
                parameters: {
                    i:   { type: 'choice', values: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
                    p:   { type: 'expression', value: 'i<=3?10:i<=7?20:i<=11?25:50' },
                    n:   { type: 'expression', value: 'i===0?80:i===1?150:i===2?200:i===3?350:i===4?60:i===5?150:i===6?200:i===7?350:i===8?40:i===9?80:i===10?120:i===11?200:i===12?60:i===13?80:i===14?150:200' },
                    ans: { type: 'expression', value: 'i===0?8:i===1?15:i===2?20:i===3?35:i===4?12:i===5?30:i===6?40:i===7?70:i===8?10:i===9?20:i===10?30:i===11?50:i===12?30:i===13?40:i===14?75:100' },
                },
                constraints: [],
                answer_formula: 'ans',
                answer_type: 'number',
                hint: '1% — это одна сотая часть числа. Чтобы найти {p}%, раздели {n} на 100 и умножь на {p}.',
                solution: [
                    { explanation: '1% от {n} = {n} ÷ 100.' },
                    { explanation: '{p}% = 1% × {p}:', expression: '({n} ÷ 100) × {p} = {ans}' },
                    { explanation: 'Ответ:', result: '{ans}' },
                ],
                common_mistakes: [
                    { pattern: 'n / p', feedback: 'Нужно разделить на 100, а не на {p}. Затем умножить на {p}.' },
                    { pattern: 'n + p', feedback: 'Процент — это доля числа, а не прибавка. ({n} ÷ 100) × {p} = {ans}.' },
                ],
            },
            2: {
                // Процентное изменение (скидки/наценки). Новая цена = a ± a*p/100 = a*(100±p)/100.
                // op=1: наценка, op=-1: скидка. Кортежи (a, p, ans) — целые.
                // i=0:(200,10,180) i=1:(500,20,400) i=2:(120,25,90)  i=3:(400,50,200)
                // i=4:(150,10,135) i=5:(300,20,240) i=6:(80,25,60)   i=7:(600,50,300)
                // i=8:(200,10,220) i=9:(500,20,600) i=10:(120,25,150) i=11:(400,50,600)
                // i=12:(150,10,165) i=13:(300,20,360) i=14:(80,25,100) i=15:(600,50,900)
                // i=0..7 — скидки, i=8..15 — наценки
                template: 'Товар стоил {a} руб. Его цена {action} на {p}%. Сколько стал стоить товар?',
                parameters: {
                    i:      { type: 'choice', values: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] },
                    a:      { type: 'expression', value: 'i===0?200:i===1?500:i===2?120:i===3?400:i===4?150:i===5?300:i===6?80:i===7?600:i===8?200:i===9?500:i===10?120:i===11?400:i===12?150:i===13?300:i===14?80:600' },
                    p:      { type: 'expression', value: 'i===0?10:i===1?20:i===2?25:i===3?50:i===4?10:i===5?20:i===6?25:i===7?50:i===8?10:i===9?20:i===10?25:i===11?50:i===12?10:i===13?20:i===14?25:50' },
                    action: { type: 'expression', value: 'i <= 7 ? "снизилась" : "выросла"' },
                    delta:  { type: 'expression', value: 'i===0?20:i===1?100:i===2?30:i===3?200:i===4?15:i===5?60:i===6?20:i===7?300:i===8?20:i===9?100:i===10?30:i===11?200:i===12?15:i===13?60:i===14?20:300' },
                    ans:    { type: 'expression', value: 'i===0?180:i===1?400:i===2?90:i===3?200:i===4?135:i===5?240:i===6?60:i===7?300:i===8?220:i===9?600:i===10?150:i===11?600:i===12?165:i===13?360:i===14?100:900' },
                },
                constraints: [],
                answer_formula: 'ans',
                answer_type: 'number',
                hint: 'Найди {p}% от {a}: ({a} ÷ 100) × {p} = {delta}. Затем вычти/прибавь к исходной цене.',
                solution: [
                    { explanation: 'Находим {p}% от {a}:', expression: '({a} ÷ 100) × {p} = {delta}' },
                    { explanation: 'Новая цена:', expression: '{a} ± {delta} = {ans}' },
                    { explanation: 'Ответ:', result: '{ans} руб.' },
                ],
                common_mistakes: [
                    { pattern: 'a - p', feedback: 'Нельзя просто вычесть процент из цены. Сначала найди {p}% от {a} = {delta}, затем {a} ± {delta}.' },
                    { pattern: 'a * p / 100', feedback: 'Это только размер скидки/наценки ({delta} руб.), а не итоговая цена. Нужно {a} ± {delta} = {ans}.' },
                ],
            },
        },
    },

    // ===== PROPORTIONS (Пропорции) =====
    {
        id: 'grade6-proportions',
        class: 6,
        subject: 'algebra',
        section: 'Отношения и пропорции',
        topic: 'proportions',
        topic_title: 'Пропорции',
        problemType: 'numeric',
        skills: ['proportions', 'cross_multiplication'],
        tags: ['proportions', 'grade6'],
        relatedModule: 'coordinate-plane',
        version: 1,
        difficulties: {
            1: {
                // x : a = b : c → x = a*b/c (целое, проверено).
                // i=0:(2,6,3,4) i=1:(3,4,6,2) i=2:(4,6,8,3) i=3:(5,6,10,3)
                // i=4:(3,8,4,6) i=5:(4,10,8,5) i=6:(6,4,3,8) i=7:(5,4,2,10)
                template: 'Найдите неизвестный член пропорции: x : {a} = {b} : {c}.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?2:i===1?3:i===2?4:i===3?5:i===4?3:i===5?4:i===6?6:5' },
                    b: { type: 'expression', value: 'i===0?6:i===1?4:i===2?6:i===3?6:i===4?8:i===5?10:i===6?4:4' },
                    c: { type: 'expression', value: 'i===0?3:i===1?6:i===2?8:i===3?10:i===4?4:i===5?8:i===6?3:2' },
                    x: { type: 'expression', value: 'i===0?4:i===1?2:i===2?3:i===3?3:i===4?6:i===5?5:i===6?8:10' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'Основное свойство пропорции: произведение крайних = произведению средних. x × {c} = {a} × {b}.',
                solution: [
                    { explanation: 'Крайние члены: x и {c}. Средние члены: {a} и {b}.' },
                    { explanation: 'x × {c} = {a} × {b}' },
                    { explanation: 'x = ({a} × {b}) ÷ {c}', result: 'x = {x}' },
                ],
                common_mistakes: [
                    { pattern: 'a * c / b', feedback: 'Перемножь средние члены ({a} и {b}), затем раздели на крайний {c}.' },
                    { pattern: 'b / c', feedback: 'Не забудь умножить на {a}: x = {a} × {b} ÷ {c} = {x}.' },
                ],
            },
            2: {
                // a : b = x : d → x = a*d/b (целое, проверено).
                // i=0:(2,3,6,4) i=1:(3,4,8,6) i=2:(5,2,8,20) i=3:(4,3,9,12)
                // i=4:(3,5,10,6) i=5:(2,5,15,6) i=6:(6,4,8,12) i=7:(7,2,6,21)
                template: 'Найдите неизвестный член пропорции: {a} : {b} = x : {d}.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a: { type: 'expression', value: 'i===0?2:i===1?3:i===2?5:i===3?4:i===4?3:i===5?2:i===6?6:7' },
                    b: { type: 'expression', value: 'i===0?3:i===1?4:i===2?2:i===3?3:i===4?5:i===5?5:i===6?4:2' },
                    d: { type: 'expression', value: 'i===0?6:i===1?8:i===2?8:i===3?9:i===4?10:i===5?15:i===6?8:6' },
                    x: { type: 'expression', value: 'i===0?4:i===1?6:i===2?20:i===3?12:i===4?6:i===5?6:i===6?12:21' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'x = {a} × {d} ÷ {b}. Перемножь крайние члены и раздели на известный средний.',
                solution: [
                    { explanation: 'Основное свойство пропорции: {a} × {d} = {b} × x.' },
                    { explanation: 'x = ({a} × {d}) ÷ {b}', result: 'x = {x}' },
                ],
                common_mistakes: [
                    { pattern: 'a + d - b', feedback: 'В пропорции используется перекрёстное умножение, а не сложение и вычитание.' },
                    { pattern: 'b * d / a', feedback: 'Перемножить нужно {a} и {d}, затем разделить на {b}: {a}×{d}÷{b} = {x}.' },
                ],
            },
            3: {
                // a : b = c : x → x = b*c/a (целое, проверено).
                // i=0:(4,6,8,12) i=1:(5,15,6,18) i=2:(3,9,7,21) i=3:(8,12,6,9)
                // i=4:(6,10,9,15) i=5:(4,10,8,20) i=6:(9,12,6,8) i=7:(15,6,20,8)
                // i=8:(6,8,9,12) i=9:(10,4,25,10)
                template: 'Найдите неизвестный член пропорции: {a} : {b} = {c} : x.',
                parameters: {
                    i: { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
                    a: { type: 'expression', value: 'i===0?4:i===1?5:i===2?3:i===3?8:i===4?6:i===5?4:i===6?9:i===7?15:i===8?6:10' },
                    b: { type: 'expression', value: 'i===0?6:i===1?15:i===2?9:i===3?12:i===4?10:i===5?10:i===6?12:i===7?6:i===8?8:4' },
                    c: { type: 'expression', value: 'i===0?8:i===1?6:i===2?7:i===3?6:i===4?9:i===5?8:i===6?6:i===7?20:i===8?9:25' },
                    x: { type: 'expression', value: 'i===0?12:i===1?18:i===2?21:i===3?9:i===4?15:i===5?20:i===6?8:i===7?8:i===8?12:10' },
                },
                constraints: [],
                answer_formula: 'x',
                answer_type: 'number',
                hint: 'x = {b} × {c} ÷ {a}. Произведение крайних членов равно произведению средних.',
                solution: [
                    { explanation: 'Основное свойство пропорции: {a} × x = {b} × {c}.' },
                    { explanation: 'x = ({b} × {c}) ÷ {a}', result: 'x = {x}' },
                ],
                common_mistakes: [
                    { pattern: 'a * c / b', feedback: 'Для нахождения x перемножь {b} и {c}, затем раздели на {a}: {b}×{c}÷{a} = {x}.' },
                    { pattern: 'b + c - a', feedback: 'В пропорции применяется перекрёстное умножение: {a} × x = {b} × {c}.' },
                ],
            },
        },
    },

    // ===== FRACTIONS - Multiplication (Умножение дробей) =====
    {
        id: 'grade6-fraction-mul',
        class: 6,
        subject: 'algebra',
        section: 'Дроби',
        topic: 'fraction_mul',
        topic_title: 'Умножение дробей',
        problemType: 'numeric',
        skills: ['fraction_multiplication', 'fraction_reduction'],
        tags: ['fractions', 'multiplication', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // Простое умножение a/b × c/d, знаменатели взаимно просты → результат несократим.
                // Пары (b,d): (2,3),(2,5),(3,5),(3,7),(5,7),(2,7) — НОД=1.
                template: 'Вычислите: {a}/{b} × {c}/{d}. Введите ответ в виде несократимой дроби.',
                parameters: {
                    i:    { type: 'choice', values: [0, 1, 2, 3, 4, 5] },
                    b:    { type: 'expression', value: 'i===0?2:i===1?2:i===2?3:i===3?3:i===4?5:2' },
                    d:    { type: 'expression', value: 'i===0?3:i===1?5:i===2?5:i===3?7:i===4?7:7' },
                    a:    { type: 'int', min: 1, max: 4 },
                    c:    { type: 'int', min: 1, max: 4 },
                    num:  { type: 'expression', value: 'a * c' },
                    den:  { type: 'expression', value: 'b * d' },
                },
                constraints: ['a < b', 'c < d', 'a > 1 || c > 1'],
                answer_formula: 'num / den',
                answer_type: 'fraction',
                hint: 'Перемножьте числители, затем перемножьте знаменатели: ({a}×{c}) / ({b}×{d}).',
                solution: [
                    { explanation: 'Умножаем числители:', expression: '{a} × {c} = {num}' },
                    { explanation: 'Умножаем знаменатели:', expression: '{b} × {d} = {den}' },
                    { explanation: 'Результат:', result: '{num}/{den}' },
                ],
                common_mistakes: [
                    { pattern: '(a + c) + "/" + (b + d)', feedback: 'При умножении дробей нужно перемножать числители и знаменатели, а не складывать.' },
                    { pattern: '(a * c) + "/" + (b + d)', feedback: 'Числители перемножены верно, но знаменатели тоже нужно перемножить: {b} × {d} = {den}.' },
                    { pattern: 'a + "/" + (b * d)', feedback: 'Не забудь умножить оба числителя: {a} × {c} = {num}.' },
                ],
            },
            2: {
                // Дробь × целое число. a/b × n → (a*n)/b → сокращается если a*n делится на b.
                // Используем пары (b, n) где b | n*a не гарантировано — валидатор принимает эквивалент.
                template: 'Вычислите: {a}/{b} × {n}. Введите ответ в виде дроби или целого числа.',
                parameters: {
                    b:    { type: 'choice', values: [2, 3, 4, 5, 6] },
                    n:    { type: 'int', min: 2, max: 9 },
                    a:    { type: 'int', min: 1, max: 5 },
                    num:  { type: 'expression', value: 'a * n' },
                },
                constraints: ['a < b', 'n > 1', 'a * n !== b'],
                answer_formula: 'num / b',
                answer_type: 'fraction',
                hint: 'Целое число {n} = {n}/1. Умножьте: ({a}×{n}) / {b} = {num}/{b}, затем сократите.',
                solution: [
                    { explanation: 'Представляем {n} как дробь {n}/1.' },
                    { explanation: 'Умножаем числители:', expression: '{a} × {n} = {num}' },
                    { explanation: 'Знаменатель остаётся {b}.' },
                    { explanation: 'Результат (сократить если возможно):', result: '{num}/{b}' },
                ],
                common_mistakes: [
                    { pattern: 'a + "/" + (b * n)', feedback: 'На целое число умножается числитель ({a}×{n}), а не знаменатель.' },
                    { pattern: '(a + n) + "/" + b', feedback: 'Целое число нужно умножить на числитель, а не прибавлять.' },
                ],
            },
            3: {
                // Перекрёстное сокращение до умножения.
                // Кортежи (a, b, c, d) где можно сократить a с d или b с c до умножения.
                // i=0:(2,3,3,4)→1/2  i=1:(3,4,2,9)→1/6  i=2:(4,5,5,8)→1/2
                // i=3:(2,5,5,6)→1/3  i=4:(3,8,4,9)→1/6  i=5:(5,6,3,5)→1/2
                // i=6:(2,9,3,4)→1/6  i=7:(4,7,7,8)→1/2
                template: 'Вычислите: {a}/{b} × {c}/{d}. Попробуйте сократить дроби до умножения. Введите ответ в виде несократимой дроби.',
                parameters: {
                    i:   { type: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
                    a:   { type: 'expression', value: 'i===0?2:i===1?3:i===2?4:i===3?2:i===4?3:i===5?5:i===6?2:4' },
                    b:   { type: 'expression', value: 'i===0?3:i===1?4:i===2?5:i===3?5:i===4?8:i===5?6:i===6?9:7' },
                    c:   { type: 'expression', value: 'i===0?3:i===1?2:i===2?5:i===3?5:i===4?4:i===5?3:i===6?3:7' },
                    d:   { type: 'expression', value: 'i===0?4:i===1?9:i===2?8:i===3?6:i===4?9:i===5?5:i===6?4:8' },
                    num: { type: 'expression', value: 'a * c' },
                    den: { type: 'expression', value: 'b * d' },
                },
                constraints: [],
                answer_formula: 'num / den',
                answer_type: 'fraction',
                hint: 'Перед умножением проверь: можно ли сократить числитель одной дроби со знаменателем другой?',
                solution: [
                    { explanation: 'Ищем общие множители по диагонали: числитель одной дроби и знаменатель другой.' },
                    { explanation: 'Умножаем сокращённые числители и знаменатели.' },
                    { explanation: 'Результат:', result: '{num}/{den}' },
                ],
                common_mistakes: [
                    { pattern: '(a * c) + "/" + (b + d)', feedback: 'Знаменатели нужно перемножать, а не складывать: {b} × {d} = {den}.' },
                    { pattern: '(a + c) + "/" + (b * d)', feedback: 'Числители нужно перемножать, а не складывать: {a} × {c} = {num}.' },
                    { pattern: 'a + "/" + d', feedback: 'Нельзя просто брать числитель первой и знаменатель второй дроби. Перемножь {a}×{c} и {b}×{d}.' },
                ],
            },
            4: {
                // Три дроби a/b × c/d × e/f. Знаменатели попарно взаимно просты → результат несократим.
                // Кортежи (b,d,f): (2,3,5),(2,3,7),(2,5,7),(3,5,7)
                template: 'Вычислите: {a}/{b} × {c}/{d} × {e}/{f}. Введите ответ в виде несократимой дроби.',
                parameters: {
                    j:   { type: 'choice', values: [0, 1, 2, 3] },
                    b:   { type: 'expression', value: 'j===0?2:j===1?2:j===2?2:3' },
                    d:   { type: 'expression', value: 'j===0?3:j===1?3:j===2?5:5' },
                    f:   { type: 'expression', value: 'j===0?5:j===1?7:j===2?7:7' },
                    a:   { type: 'int', min: 1, max: 3 },
                    c:   { type: 'int', min: 1, max: 3 },
                    e:   { type: 'int', min: 1, max: 3 },
                    num: { type: 'expression', value: 'a * c * e' },
                    den: { type: 'expression', value: 'b * d * f' },
                },
                constraints: ['a < b', 'c < d', 'e < f', 'a > 1 || c > 1 || e > 1'],
                answer_formula: 'num / den',
                answer_type: 'fraction',
                hint: 'Перемножьте все числители и все знаменатели: ({a}×{c}×{e}) / ({b}×{d}×{f}).',
                solution: [
                    { explanation: 'Умножаем все числители:', expression: '{a} × {c} × {e} = {num}' },
                    { explanation: 'Умножаем все знаменатели:', expression: '{b} × {d} × {f} = {den}' },
                    { explanation: 'Результат:', result: '{num}/{den}' },
                ],
                common_mistakes: [
                    { pattern: '(a + c + e) + "/" + (b + d + f)', feedback: 'При умножении дробей числители и знаменатели перемножаются, а не складываются.' },
                    { pattern: '(a * c * e) + "/" + (b + d + f)', feedback: 'Числители перемножены верно ({num}), но знаменатели тоже нужно перемножить: {b}×{d}×{f} = {den}.' },
                    { pattern: 'a + "/" + (b * d * f)', feedback: 'Все три числителя нужно перемножить: {a}×{c}×{e} = {num}.' },
                ],
            },
        },
    },

    // ===== FRACTIONS - Division (Деление дробей) =====
    {
        id: 'grade6-fraction-div',
        class: 6,
        subject: 'algebra',
        section: 'Дроби',
        topic: 'fraction_div',
        topic_title: 'Деление дробей',
        problemType: 'numeric',
        skills: ['fraction_division', 'fraction_reduction', 'fraction_multiplication'],
        tags: ['fractions', 'division', 'grade6'],
        version: 1,
        difficulties: {
            1: {
                // a/b ÷ c/d, знаменатели взаимно просты → результат (a*d)/(b*c) несократим.
                // Пары (b,d): (2,3),(2,5),(3,5),(3,7),(5,7) — НОД=1.
                // Дополнительно: a*d и b*c не должны иметь общих делителей (гарантировано выбором пар).
                template: 'Вычислите: {a}/{b} ÷ {c}/{d}. Введите ответ в виде несократимой дроби.',
                parameters: {
                    i:   { type: 'choice', values: [0, 1, 2, 3, 4] },
                    b:   { type: 'expression', value: 'i===0?2:i===1?2:i===2?3:i===3?3:5' },
                    d:   { type: 'expression', value: 'i===0?3:i===1?5:i===2?5:i===3?7:7' },
                    a:   { type: 'int', min: 1, max: 4 },
                    c:   { type: 'int', min: 1, max: 4 },
                    num: { type: 'expression', value: 'a * d' },
                    den: { type: 'expression', value: 'b * c' },
                },
                constraints: ['a < b', 'c < d', 'a !== c'],
                answer_formula: 'num / den',
                answer_type: 'fraction',
                hint: 'Переверни вторую дробь и замени деление умножением: {a}/{b} × {d}/{c}.',
                solution: [
                    { explanation: 'Переворачиваем вторую дробь: {c}/{d} → {d}/{c}.' },
                    { explanation: 'Заменяем деление умножением:', expression: '{a}/{b} × {d}/{c}' },
                    { explanation: 'Умножаем числители:', expression: '{a} × {d} = {num}' },
                    { explanation: 'Умножаем знаменатели:', expression: '{b} × {c} = {den}' },
                    { explanation: 'Результат:', result: '{num}/{den}' },
                ],
                common_mistakes: [
                    { pattern: '(a * c) + "/" + (b * d)', feedback: 'Это умножение, а не деление. При делении нужно перевернуть вторую дробь: {a}/{b} × {d}/{c}.' },
                    { pattern: '(a * d) + "/" + (b + c)', feedback: 'Числитель верный ({num}), но знаменатели нужно перемножить: {b} × {c} = {den}.' },
                    { pattern: '(a + d) + "/" + (b * c)', feedback: 'Знаменатель верный ({den}), но числители нужно перемножить: {a} × {d} = {num}.' },
                ],
            },
            2: {
                // Деление дроби на целое число и целого на дробь.
                // op=0: a/b ÷ n → a/(b*n); op=1: n ÷ (a/b) → n*b/a
                // Используем choice для типа задачи.
                template: 'Вычислите: {question}. Введите ответ в виде дроби или целого числа.',
                parameters: {
                    op:  { type: 'choice', values: [0, 1] },
                    b:   { type: 'choice', values: [2, 3, 4, 5, 6] },
                    n:   { type: 'int', min: 2, max: 8 },
                    a:   { type: 'int', min: 1, max: 5 },
                    question: { type: 'expression', value: 'op === 0 ? "{a}/{b} ÷ " + n : n + " ÷ {a}/{b}"' },
                    num: { type: 'expression', value: 'op === 0 ? a : n * b' },
                    den: { type: 'expression', value: 'op === 0 ? b * n : a' },
                },
                constraints: ['a < b', 'n > 1', 'a !== 1 || op === 0'],
                answer_formula: 'num / den',
                answer_type: 'fraction',
                hint: 'Целое число {n} = {n}/1. Переверни делитель и умножай.',
                solution: [
                    { explanation: 'Представляем целое число как дробь с знаменателем 1.' },
                    { explanation: 'Переворачиваем делитель и заменяем деление умножением.' },
                    { explanation: 'Результат:', result: '{num}/{den}' },
                ],
                common_mistakes: [
                    { pattern: 'a + "/" + (b + n)', feedback: 'Знаменатели нельзя складывать. При делении на {n} умножай знаменатель: {b} × {n} = {den}.' },
                    { pattern: '(a * n) + "/" + b', feedback: 'При делении на целое число {n} умножается знаменатель, а не числитель.' },
                ],
            },
            3: {
                // Деление дробей с сокращением результата.
                // Кортежи (a,b,c,d) где (a*d) и (b*c) имеют общий множитель → результат сокращается.
                // i=0:(1,2,3,6)→1/1=1  i=1:(2,3,4,6)→12/12=1  i=2:(3,4,6,8)→24/24=1
                // i=3:(1,4,3,6)→6/12=1/2  i=4:(2,5,4,6)→12/20=3/5  i=5:(3,5,6,10)→30/30=1
                // i=6:(1,3,2,6)→6/6=1  i=7:(2,4,3,6)→12/12=1  i=8:(1,6,2,4)→4/12=1/3
                // i=9:(3,8,6,4)→12/48=1/4
                template: 'Вычислите: {a}/{b} ÷ {c}/{d}. Сократите ответ до несократимой дроби.',
                parameters: {
                    i:   { type: 'choice', values: [3, 4, 8, 9] },
                    a:   { type: 'expression', value: 'i===3?1:i===4?2:i===8?1:3' },
                    b:   { type: 'expression', value: 'i===3?4:i===4?5:i===8?6:8' },
                    c:   { type: 'expression', value: 'i===3?3:i===4?4:i===8?2:6' },
                    d:   { type: 'expression', value: 'i===3?6:i===4?6:i===8?4:4' },
                    num: { type: 'expression', value: 'a * d' },
                    den: { type: 'expression', value: 'b * c' },
                },
                constraints: [],
                answer_formula: 'num / den',
                answer_type: 'fraction',
                hint: 'После умножения на перевёрнутую дробь — не забудь сократить результат.',
                solution: [
                    { explanation: 'Переворачиваем вторую дробь: {c}/{d} → {d}/{c}.' },
                    { explanation: 'Умножаем:', expression: '{a}/{b} × {d}/{c} = {num}/{den}' },
                    { explanation: 'Сокращаем дробь {num}/{den} — найди НОД числителя и знаменателя.' },
                    { explanation: 'Результат:', result: '{num}/{den}' },
                ],
                common_mistakes: [
                    { pattern: 'num + "/" + den', feedback: 'Правильно, но дробь {num}/{den} можно сократить — найди НОД({num}, {den}).' },
                    { pattern: '(a * c) + "/" + (b * d)', feedback: 'При делении вторую дробь нужно перевернуть: {a}/{b} × {d}/{c}, а не {a}/{b} × {c}/{d}.' },
                ],
            },
        },
    },

];
