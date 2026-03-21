import * as math from 'mathjs';
import { DEFAULT_EQUIVALENCE_VARS } from '../math/constants';

/**
 * Результат сравнения двух математических выражений на эквивалентность.
 */
export interface EquivalenceResult {
  isEquivalent: boolean;
  /** Доля точек, на которых оба выражения совпали (0–1). */
  confidence: number;
  validPointsUsed: number;
  error?: string;
}

const EPSILON = 1e-9;
const REQUIRED_VALID_POINTS = 7;

/**
 * Извлекает имена переменных из выражения с помощью regex.
 * Исключает известные константы и функции MathJS.
 *
 * Используется как fallback, когда вызывающий код не передаёт variables явно.
 */
const MATHJS_BUILTINS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'asin', 'acos', 'atan', 'atan2',
  'log', 'log2', 'log10', 'exp', 'sqrt', 'abs',
  'pi', 'e', 'i', 'Infinity', 'NaN',
  'floor', 'ceil', 'round', 'sign', 'mod',
  'max', 'min', 'pow',
]);

export function extractVariables(expr: string): string[] {
  const matches = expr.match(/\b[a-zA-Z][a-zA-Z0-9]*\b/g) ?? [];
  const unique = new Set(
    matches.filter(m => !MATHJS_BUILTINS.has(m) && !/^\d/.test(m))
  );
  return unique.size > 0 ? [...unique] : [...DEFAULT_EQUIVALENCE_VARS];
}

/**
 * Строит пул точек-кандидатов для сэмплирования.
 *
 * Включает:
 * - Иррациональные точки (π/4, π/3, √2, √3, e) — защита от периодических функций
 *   типа sin(π·x), которые обнуляются на целых x
 * - Jitter: небольшой случайный сдвиг к каждой точке — защита от симметричных нулей
 * - Равномерно распределённые случайные точки из [-10, 10]
 */
function buildCandidatePoints(count: number): number[] {
  const irrational = [
    Math.PI / 4,          // ~0.785
    Math.PI / 3,          // ~1.047
    Math.PI / 6,          // ~0.524
    Math.sqrt(2),         // ~1.414
    Math.sqrt(3),         // ~1.732
    Math.E,               // ~2.718
    Math.E / 2,           // ~1.359
    1 / Math.PI,          // ~0.318
    Math.LOG2E,           // ~1.443
    -Math.PI / 4,
    -Math.sqrt(2),
    -Math.E,
  ];

  const jitter = () => (Math.random() - 0.5) * 0.03;

  const random = Array.from(
    { length: count - irrational.length },
    () => (Math.random() * 20 - 10) + jitter()
  );

  // Apply jitter to irrational points too — prevents accidental cancellation
  return [...irrational.map(p => p + jitter()), ...random];
}

/**
 * Проверяет эквивалентность двух выражений методом сэмплирования.
 *
 * @param expr1 Первое выражение (MathJS-совместимая строка).
 * @param expr2 Второе выражение (MathJS-совместимая строка).
 * @param variables Переменные для подстановки. Если не передан — извлекаются автоматически.
 * @param options Настройки точности и количества точек.
 */
export function checkEquivalence(
  expr1: string,
  expr2: string,
  variables?: string[],
  options?: { epsilon?: number; minPoints?: number; sampleSize?: number }
): EquivalenceResult {
  const epsilon = options?.epsilon ?? EPSILON;
  const minPoints = options?.minPoints ?? REQUIRED_VALID_POINTS;
  const sampleSize = options?.sampleSize ?? 24;

  // Auto-detect variables if not provided
  const vars = variables && variables.length > 0
    ? variables
    : extractVariables(expr1 + ' ' + expr2);

  const candidates = buildCandidatePoints(sampleSize);
  const validResults: { val1: number; val2: number }[] = [];

  for (const value of candidates) {
    if (validResults.length >= minPoints) break;

    // For multi-variable expressions, assign the same value to all vars.
    // This is intentional: we test along the diagonal of the variable space,
    // which is sufficient for detecting non-equivalence in practice.
    const scope: Record<string, number> = {};
    vars.forEach(v => { scope[v] = value; });

    try {
      const val1 = math.evaluate(expr1, scope);
      const val2 = math.evaluate(expr2, scope);

      if (
        typeof val1 === 'number' && typeof val2 === 'number' &&
        isFinite(val1) && isFinite(val2)
      ) {
        validResults.push({ val1, val2 });
      }
    } catch {
      // Domain error (log of negative, sqrt of negative, etc.) — skip point
    }
  }

  if (validResults.length === 0) {
    return {
      isEquivalent: expr1.trim() === expr2.trim(),
      confidence: 0,
      validPointsUsed: 0,
      error: 'No valid sample points found — expressions may have restricted domains',
    };
  }

  if (validResults.length < minPoints) {
    // Not enough valid points — lower confidence, still check what we have
    const allMatch = validResults.every(({ val1, val2 }) => Math.abs(val1 - val2) < epsilon);
    return {
      isEquivalent: false,
      confidence: allMatch ? validResults.length / minPoints : 0,
      validPointsUsed: validResults.length,
      error: `Only ${validResults.length}/${minPoints} valid sample points found`,
    };
  }

  let equivalentCount = 0;
  for (const { val1, val2 } of validResults) {
    if (Math.abs(val1 - val2) < epsilon) equivalentCount++;
  }

  const confidence = equivalentCount / validResults.length;

  return {
    isEquivalent: confidence === 1.0,
    confidence,
    validPointsUsed: validResults.length,
  };
}

/**
 * Удобная обёртка для прямого сравнения двух выражений.
 * Используется в тестах и в answerValidator для case 'expression'.
 */
export function compareExpressions(expr1: string, expr2: string): boolean {
  const result = checkEquivalence(expr1, expr2);
  return result.isEquivalent && result.confidence >= 0.99;
}
