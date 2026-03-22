
import { normalizeNumbers } from '../math/normalization';

export type BoundaryValue = number | '-Infinity' | '+Infinity';

export interface IntervalBoundary {
  value: BoundaryValue;
  inclusive: boolean;
}

export interface Interval {
  start: IntervalBoundary;
  end: IntervalBoundary;
}

export type IntervalSet = Interval[];

const BOUNDARY_REGEX = /([(\[])\s*(-Infinity|[\d.-]+)\s*;\s*([\d.-]+|\+?Infinity)\s*([)\]])/;

/**
 * Парсит строковое представление одного интервала, например "(-Infinity; -2]".
 * @param input - Строка для парсинга.
 * @returns {Interval | null} - Распарсенный интервал или null, если строка невалидна.
 */
function parseSingleInterval(input: string): Interval | null {
  const match = input.trim().match(BOUNDARY_REGEX);
  if (!match) return null;

  const [, startBracket, startValStr, endValStr, endBracket] = match;

  const startValue = startValStr === '-Infinity' ? '-Infinity' : parseFloat(startValStr);
  const endValue = (endValStr === '+Infinity' || endValStr === 'Infinity') ? '+Infinity' : parseFloat(endValStr);

  if (typeof startValue === 'number' && typeof endValue === 'number' && startValue > endValue) {
    return null; // Некорректный интервал, начало больше конца
  }

  return {
    start: {
      value: startValue,
      inclusive: startBracket === '[',
    },
    end: {
      value: endValue,
      inclusive: endBracket === ']',
    },
  };
}


/**
 * Парсит строку, представляющую собой объединение интервалов.
 * Пример: "(-Infinity; -2] \cup [2; +Infinity)"
 * @param input - Входная строка.
 * @returns {IntervalSet} - Массив интервалов.
 */
export function parseIntervalSet(input: string): IntervalSet {
  const normalized = normalizeNumbers(input);

  const parts = normalized.split(/\cup/g);
  return parts
    .map(part => parseSingleInterval(part.trim()))
    .filter((interval): interval is Interval => interval !== null);
}

/**
 * Проверяет, принадлежит ли точка данному интервалу.
 * @param point - Числовая точка.
 * @param interval - Интервал.
 * @returns {boolean} - True, если точка принадлежит интервалу.
 */
function isPointInInterval(point: number, interval: Interval): boolean {
  const { start, end } = interval;

  const startValue = start.value === '-Infinity' ? -Infinity : Number(start.value);
  const endValue = end.value === '+Infinity' ? Infinity : Number(end.value);

  const isAfterStart = start.value === '-Infinity' || (start.inclusive ? point >= startValue : point > startValue);
  const isBeforeEnd = end.value === '+Infinity' || (end.inclusive ? point <= endValue : point < endValue);

  return isAfterStart && isBeforeEnd;
}

/**
 * Проверяет, принадлежит ли точка множеству интервалов.
 * @param point - Числовая точка.
 * @param set - Множество интервалов.
 * @returns {boolean} - True, если точка принадлежит хотя бы одному интервалу в множестве.
 */
function isPointInIntervalSet(point: number, set: IntervalSet): boolean {
  return set.some(interval => isPointInInterval(point, interval));
}


/**
 * Сравнивает два множества интервалов на равенство путем сэмплирования контрольных точек.
 * @param set1 - Первое множество интервалов.
 * @param set2 - Второе множество интервалов.
 * @returns {boolean} - True, если множества эквивалентны.
 */
export function intervalSetsEqual(set1: IntervalSet, set2: IntervalSet): boolean {
  const testPoints = new Set<number>();
  const epsilon = 1e-9;

  const allIntervals = [...set1, ...set2];

  // 1. Собираем все конечные точки границ
  allIntervals.forEach(({ start, end }) => {
    if (typeof start.value === 'number') {
      testPoints.add(start.value);
      testPoints.add(start.value - epsilon);
      testPoints.add(start.value + epsilon);
    }
    if (typeof end.value === 'number') {
      testPoints.add(end.value);
      testPoints.add(end.value - epsilon);
      testPoints.add(end.value + epsilon);
    }
  });

  // 2. Добавляем случайные точки для большей надежности
  for (let i = 0; i < 50; i++) {
    const randomPoint = Math.random() * 200 - 100;
    testPoints.add(randomPoint);
  }

  // 3. Проверяем каждую точку
  for (const point of testPoints) {
    const inSet1 = isPointInIntervalSet(point, set1);
    const inSet2 = isPointInIntervalSet(point, set2);

    if (inSet1 !== inSet2) {
      return false;
    }
  }

  return true;
}
