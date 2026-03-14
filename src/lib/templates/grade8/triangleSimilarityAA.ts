import { ProblemTemplate } from '../../types';

// ============================================================
// Grade 8 — Подобие треугольников (4 шаблона)
// ============================================================
// СТРАТЕГИЯ ГЕНЕРАЦИИ:
//   Подобные треугольники с коэффициентом k
//   Соответствующие стороны пропорциональны
//   Углы равны
// ============================================================

export const grade8TriangleSimilarityAATemplates: ProblemTemplate[] = [

    // ===== 1. Найти коэффициент подобия =====
    {
        id: 'grade8-similarity-ratio',
        class: 8,
        subject: 'geometry',
        section: 'Подобие треугольников',
        topic: 'triangleSimilarityAA',
        topic_title: 'Подобие треугольников',
        problemType: 'numeric',
        relatedModule: 'triangle-similarity',
        skills: ['similarity', 'triangles'],
        difficulties: {
            // Уровень 1 — по двум сторонам
            1: {
                template: 'Треугольники ABC и A₁B₁C₁ подобны. Стороны: AB = {ab}, A₁B₁ = {a1b1}. Найдите коэффициент подобия.',
                parameters: {
                    ab: { type: 'int', min: 4, max: 10 },
                    a1b1: { type: 'int', min: 2, max: 5 },
                },
                constraints: ['ab > a1b1'],
                answer_formula: 'a1b1 / ab',
                hint: 'Коэффициент подобия = соответствующая сторона меньшего треугольника / соответствующая сторона большего.',
                solution: [
                    { explanation: 'Коэффициент подобия k = A₁B₁ / AB = {a1b1} / {ab}' },
                    { explanation: 'Ответ:', result: 'a1b1 / ab' },
                ],
            },
            // Уровень 2 — по трём сторонам
            2: {
                template: 'Треугольники подобны с коэффициентом k. Стороны большего: {a}, {b}, {c}. Найдите k.',
                parameters: {
                    a: { type: 'int', min: 6, max: 12 },
                    b: { type: 'int', min: 4, max: 10 },
                    c: { type: 'int', min: 5, max: 11 },
                    a1: { type: 'int', min: 3, max: 6 },
                },
                constraints: ['a > a1', 'a1 < b', 'a1 < c'],
                answer_formula: 'a1 / a',
                hint: 'k = сторона меньшего / соответствующая сторона большего.',
                solution: [
                    { explanation: 'k = {a1} / {a}' },
                    { explanation: 'Ответ:', result: 'a1 / a' },
                ],
            },
            // Уровень 3 — дробный коэффициент
            3: {
                template: 'Треугольники ABC и A₁B₁C₁ подобны. AB = {ab}, BC = {bc}, A₁B₁ = {a1b1}. Найдите коэффициент подобия.',
                parameters: {
                    ab: { type: 'int', min: 6, max: 12 },
                    bc: { type: 'int', min: 4, max: 10 },
                    a1b1: { type: 'int', min: 2, max: 5 },
                },
                constraints: ['ab > a1b1'],
                answer_formula: 'a1b1 / ab',
                answer_type: 'fraction',
                hint: 'Коэффициент подобия одинаков для всех соответствующих сторон.',
                solution: [
                    { explanation: 'k = A₁B₁ / AB = {a1b1} / {ab}' },
                    { explanation: 'Ответ:', result: 'a1b1 / ab' },
                ],
            },
        },
    },

    // ===== 2. Найти сторону по коэффициенту подобия =====
    {
        id: 'grade8-similarity-side',
        class: 8,
        subject: 'geometry',
        section: 'Подобие треугольников',
        topic: 'triangleSimilarityAA',
        topic_title: 'Подобие треугольников',
        problemType: 'numeric',
        relatedModule: 'triangle-similarity',
        skills: ['similarity', 'triangles'],
        difficulties: {
            // Уровень 1 — найти большую сторону
            1: {
                template: 'Треугольники подобны с коэффициентом k = {k}. Сторона меньшего треугольника {small}. Найдите соответствующую сторону большего.',
                parameters: {
                    k: { type: 'int', min: 2, max: 4 },
                    small: { type: 'int', min: 3, max: 8 },
                },
                answer_formula: 'small / k',
                hint: 'Сторона большего = сторона меньшего / k.',
                solution: [
                    { explanation: 'Сторона большего = {small} / {k} = {small / k}' },
                    { explanation: 'Ответ:', result: 'small / k' },
                ],
            },
            // Уровень 2 — найти меньшую сторону
            2: {
                template: 'Треугольники подобны с коэффициентом k = {k}. Сторона большего треугольника {big}. Найдите соответствующую сторону меньшего.',
                parameters: {
                    k: { type: 'int', min: 2, max: 4 },
                    big: { type: 'int', min: 6, max: 12 },
                },
                answer_formula: 'big * k',
                hint: 'Сторона меньшего = сторона большего × k.',
                solution: [
                    { explanation: 'Сторона меньшего = {big} × {k} = {big * k}' },
                    { explanation: 'Ответ:', result: 'big * k' },
                ],
            },
            // Уровень 3 — дробный коэффициент
            3: {
                template: 'Треугольники подобны с коэффициентом k = {num}/{den}. Сторона меньшего {small}. Найдите соответствующую сторону большего.',
                parameters: {
                    num: { type: 'int', min: 1, max: 3 },
                    den: { type: 'int', min: 2, max: 4 },
                    small: { type: 'int', min: 4, max: 10 },
                },
                constraints: ['num < den'],
                answer_formula: 'small / (num / den)',
                answer_type: 'fraction',
                hint: 'Сторона большего = сторона меньшего / k.',
                solution: [
                    { explanation: 'k = {num}/{den}' },
                    { explanation: 'Сторона большего = {small} / ({num}/{den}) = {small} × ({den}/{num}) = {(small * den) / num}' },
                    { explanation: 'Ответ:', result: 'small / (num / den)' },
                ],
            },
        },
    },

    // ===== 3. Найти периметр подобного треугольника =====
    {
        id: 'grade8-similarity-perimeter',
        class: 8,
        subject: 'geometry',
        section: 'Подобие треугольников',
        topic: 'triangleSimilarityAA',
        topic_title: 'Подобие треугольников',
        problemType: 'numeric',
        relatedModule: 'triangle-similarity',
        skills: ['similarity', 'triangles'],
        difficulties: {
            // Уровень 1 — найти периметр большего
            1: {
                template: 'Треугольники подобны с коэффициентом k = {k}. Периметр меньшего треугольника {p_small}. Найдите периметр большего.',
                parameters: {
                    k: { type: 'int', min: 2, max: 4 },
                    p_small: { type: 'int', min: 10, max: 20 },
                },
                answer_formula: 'p_small / k',
                hint: 'Периметр большего = периметр меньшего / k.',
                solution: [
                    { explanation: 'Периметр большего = {p_small} / {k} = {p_small / k}' },
                    { explanation: 'Ответ:', result: 'p_small / k' },
                ],
            },
            // Уровень 2 — найти периметр меньшего
            2: {
                template: 'Треугольники подобны с коэффициентом k = {k}. Периметр большего треугольника {p_big}. Найдите периметр меньшего.',
                parameters: {
                    k: { type: 'int', min: 2, max: 4 },
                    p_big: { type: 'int', min: 15, max: 30 },
                },
                answer_formula: 'p_big * k',
                hint: 'Периметр меньшего = периметр большего × k.',
                solution: [
                    { explanation: 'Периметр меньшего = {p_big} × {k} = {p_big * k}' },
                    { explanation: 'Ответ:', result: 'p_big * k' },
                ],
            },
            // Уровень 3 — дробный коэффициент
            3: {
                template: 'Треугольники подобны с коэффициентом k = {num}/{den}. Периметр меньшего {p_small}. Найдите периметр большего.',
                parameters: {
                    num: { type: 'int', min: 1, max: 3 },
                    den: { type: 'int', min: 2, max: 4 },
                    p_small: { type: 'int', min: 12, max: 24 },
                },
                constraints: ['num < den'],
                answer_formula: 'p_small / (num / den)',
                answer_type: 'fraction',
                hint: 'Периметр большего = периметр меньшего / k.',
                solution: [
                    { explanation: 'k = {num}/{den}' },
                    { explanation: 'Периметр большего = {p_small} / ({num}/{den}) = {p_small} × ({den}/{num}) = {(p_small * den) / num}' },
                    { explanation: 'Ответ:', result: 'p_small / (num / den)' },
                ],
            },
        },
    },

    // ===== 4. Найти площадь подобного треугольника =====
    {
        id: 'grade8-similarity-area',
        class: 8,
        subject: 'geometry',
        section: 'Подобие треугольников',
        topic: 'triangleSimilarityAA',
        topic_title: 'Подобие треугольников',
        problemType: 'numeric',
        relatedModule: 'triangle-similarity',
        skills: ['similarity', 'triangles', 'area'],
        difficulties: {
            // Уровень 1 — найти площадь большего
            1: {
                template: 'Треугольники подобны с коэффициентом k = {k}. Площадь меньшего треугольника {area_small}. Найдите площадь большего.',
                parameters: {
                    k: { type: 'int', min: 2, max: 4 },
                    area_small: { type: 'int', min: 5, max: 15 },
                },
                answer_formula: 'area_small / (k * k)',
                hint: 'Площадь большего = площадь меньшего / k².',
                solution: [
                    { explanation: 'Площадь большего = {area_small} / {k}² = {area_small / (k * k)}' },
                    { explanation: 'Ответ:', result: 'area_small / (k * k)' },
                ],
            },
            // Уровень 2 — найти площадь меньшего
            2: {
                template: 'Треугольники подобны с коэффициентом k = {k}. Площадь большего треугольника {area_big}. Найдите площадь меньшего.',
                parameters: {
                    k: { type: 'int', min: 2, max: 4 },
                    area_big: { type: 'int', min: 10, max: 25 },
                },
                answer_formula: 'area_big * k * k',
                hint: 'Площадь меньшего = площадь большего × k².',
                solution: [
                    { explanation: 'Площадь меньшего = {area_big} × {k}² = {area_big * k * k}' },
                    { explanation: 'Ответ:', result: 'area_big * k * k' },
                ],
            },
            // Уровень 3 — дробный коэффициент
            3: {
                template: 'Треугольники подобны с коэффициентом k = {num}/{den}. Площадь меньшего {area_small}. Найдите площадь большего.',
                parameters: {
                    num: { type: 'int', min: 1, max: 3 },
                    den: { type: 'int', min: 2, max: 4 },
                    area_small: { type: 'int', min: 6, max: 18 },
                },
                constraints: ['num < den'],
                answer_formula: 'area_small / ((num / den) * (num / den))',
                answer_type: 'fraction',
                hint: 'Площадь большего = площадь меньшего / k².',
                solution: [
                    { explanation: 'k = {num}/{den}' },
                    { explanation: 'k² = ({num}/{den})² = {num*num}/{den*den}' },
                    { explanation: 'Площадь большего = {area_small} / ({num*num}/{den*den}) = {area_small} × ({den*den}/{num*num}) = {(area_small * den * den) / (num * num)}' },
                    { explanation: 'Ответ:', result: 'area_small / ((num / den) * (num / den))' },
                ],
            },
        },
    },
];