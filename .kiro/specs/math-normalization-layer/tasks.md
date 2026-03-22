# Implementation Plan: Math Normalization Layer

## Overview

Вводим `normalizeNumbers` в `normalization.ts`, встраиваем в pipeline, убираем дублирующие inline-замены из `intervals.ts` и `equivalence.ts`, формализуем контракт `normalizeFunctions`.

## Tasks

- [x] 1. Добавить и экспортировать `normalizeNumbers` в `normalization.ts`
  - Реализовать функцию `normalizeNumbers(input: string): string`
  - Конвертировать `DecimalComma` (`(\d),(\d)` → `$1.$2`)
  - Конвертировать все формы `InfinityVariant` → `Infinity` / `-Infinity`
  - Экспортировать функцию из модуля
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.7, 6.1, 6.2, 6.3_

  - [ ]* 1.1 Написать property-тест: DecimalComma конвертируется в точку
    - **Property 1: DecimalComma конвертируется в точку**
    - **Validates: Requirements 1.1**

  - [ ]* 1.2 Написать property-тест: все формы InfinityVariant конвертируются
    - **Property 2: InfinityVariant converts to CanonicalInfinity**
    - **Validates: Requirements 1.2**

  - [ ]* 1.3 Написать property-тест: normalizeNumbers идемпотентна
    - **Property 3: normalizeNumbers is idempotent**
    - **Validates: Requirements 1.5**

  - [ ]* 1.4 Написать property-тест: IntervalSyntaxChars не изменяются
    - **Property 4: IntervalSyntaxChars are preserved**
    - **Validates: Requirements 1.7**

  - [ ]* 1.5 Написать property-тест: LaTeX-плейсхолдеры не изменяются
    - **Property 5: LaTeX placeholders are preserved**
    - **Validates: Requirements 1.6**

- [x] 2. Встроить `normalizeNumbers` в pipeline `normalizeMathExpression`
  - Добавить stage-адаптер `normalizeNumbersStage` (аналогично `convertFractionsStage`)
  - Вставить вызов после `normalizeUnicode` и до `normalizeOperators`
  - Итоговый порядок: `protectLatex → normalizeUnicode → normalizeNumbers → normalizeOperators → normalizeFunctions → convertFractions → normalizeSpacing → restoreLatex`
  - _Requirements: 2.1, 2.2_

- [x] 3. Формализовать контракт `normalizeFunctions`
  - Добавить в JSDoc явный комментарий: `"Single pass — no loops, no recursion. Each pattern is applied once."`
  - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 3.1 Написать property-тест: normalizeFunctions идемпотентна (через полный pipeline)
    - **Property 8: normalizeFunctions is idempotent**
    - **Validates: Requirements 5.1, 5.3**

- [x] 4. Checkpoint — убедиться, что все тесты проходят
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Обновить `intervals.ts`: делегировать нормализацию в `normalizeNumbers`
  - Импортировать `normalizeNumbers` из `../math/normalization`
  - В начале `parseIntervalSet` вызвать `normalizeNumbers(input)` и работать с результатом
  - Удалить все inline `.replace` для `InfinityVariant` из `parseIntervalSet`
  - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.3_

  - [ ]* 5.1 Написать property-тест: parseIntervalSet эквивалентен для всех форм InfinityVariant
    - **Property 6: parseIntervalSet equivalent for all InfinityVariant forms**
    - **Validates: Requirements 3.1, 3.3**

- [x] 6. Обновить `equivalence.ts`: делегировать нормализацию в `normalizeNumbers`
  - Импортировать `normalizeNumbers` из `../math/normalization`
  - В `compareExpressions` заменить `expr1.replace(',', '.')` и `expr2.replace(',', '.')` на вызовы `normalizeNumbers`
  - _Requirements: 4.1, 4.2, 4.3, 6.2_

  - [ ]* 6.1 Написать property-тест: compareExpressions корректно обрабатывает DecimalComma
    - **Property 7: compareExpressions handles DecimalComma**
    - **Validates: Requirements 4.1, 4.3**

- [x] 7. Final checkpoint — убедиться, что все тесты проходят
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Задачи с `*` опциональны и могут быть пропущены для быстрого MVP
- Каждая задача ссылается на конкретные требования для трассируемости
- Существующие тесты (`MathInput.test.ts`, `MathInput.fraction.test.ts`) не должны изменить поведение
- Property-тесты используют `fast-check` с `numRuns: 100`
