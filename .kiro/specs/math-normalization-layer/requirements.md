# Requirements Document

## Introduction

В системе нормализации математических выражений логика обработки чисел (десятичный разделитель, бесконечности) и функций (sqrt, log, ln) рассредоточена по трём модулям: `normalization.ts`, `intervals.ts`, `equivalence.ts`. Это создаёт риск рассинхронизации: одно и то же входное значение может интерпретироваться по-разному в зависимости от точки входа.

Цель фичи — ввести единый модуль `normalizeNumbers`, который централизует всю числовую нормализацию, встроить его в pipeline `normalizeMathExpression` на правильной позиции, и заставить `intervals.ts` и `equivalence.ts` использовать его вместо локальных хаков. Дополнительно — формализовать контракт `normalizeFunctions` (один проход, без рекурсии).

## Glossary

- **NormalizationPipeline**: Последовательность этапов в `normalizeMathExpression` внутри `src/lib/math/normalization.ts`.
- **normalizeNumbers**: Новый этап/функция, централизующая нормализацию десятичного разделителя и символов бесконечности.
- **normalizeUnicode**: Существующий этап pipeline (этап 2): конвертирует unicode-символы в ASCII/LaTeX.
- **normalizeOperators**: Существующий этап pipeline (этап 3): упрощает коэффициенты и знаки.
- **normalizeFunctions**: Существующий этап pipeline (этап 4): конвертирует sqrt/log/ln в LaTeX.
- **IntervalParser**: Функция `parseIntervalSet` в `src/lib/engine/intervals.ts`.
- **ExpressionComparator**: Функция `compareExpressions` в `src/lib/engine/equivalence.ts`.
- **InfinityVariant**: Любое из представлений бесконечности: `inf`, `+inf`, `-inf`, `∞`, `+∞`, `-∞`.
- **DecimalComma**: Запятая как десятичный разделитель: `3,14` → `3.14`.
- **CanonicalInfinity**: Каноническое представление бесконечности в системе: `Infinity` (положительная) и `-Infinity` (отрицательная).
- **LatexProtectedZone**: Фрагменты выражения, защищённые этапом `protectLatex` и восстанавливаемые этапом `restoreLatex`. `normalizeNumbers` не должен затрагивать эти зоны.
- **IntervalSyntaxChars**: Символы синтаксиса интервалов: `;`, `(`, `)`, `[`, `]`. `normalizeNumbers` не должен их изменять.

## Requirements

### Requirement 1: Централизация числовой нормализации

**User Story:** As a developer, I want a single `normalizeNumbers` function, so that decimal separators and infinity variants are handled consistently across the entire system.

#### Acceptance Criteria

1. THE NormalizationPipeline SHALL contain a `normalizeNumbers` stage that converts `DecimalComma` to a decimal point (`,` → `.`).
2. THE NormalizationPipeline SHALL contain a `normalizeNumbers` stage that converts all `InfinityVariant` forms (`inf`, `+inf`, `-inf`, `∞`, `+∞`, `-∞`) to `CanonicalInfinity` (`Infinity` or `-Infinity`) respectively.
3. WHEN `normalizeNumbers` is applied to an expression, THE NormalizationPipeline SHALL produce the same result regardless of whether the expression entered via `normalizeMathExpression`, `IntervalParser`, or `ExpressionComparator`.
4. THE `normalizeNumbers` function SHALL be exported from `src/lib/math/normalization.ts` for use by other modules.
5. IF an expression contains no `DecimalComma` and no `InfinityVariant`, THEN THE `normalizeNumbers` function SHALL return the expression unchanged.
6. THE `normalizeNumbers` function SHALL NOT modify `LatexProtectedZone` content — it operates only on the unprotected portion of the expression, between `protectLatex` and `restoreLatex` pipeline stages.
7. THE `normalizeNumbers` function SHALL NOT modify `IntervalSyntaxChars` (`;`, `(`, `)`, `[`, `]`) — only numeric tokens and infinity variants are transformed.

### Requirement 2: Позиция normalizeNumbers в pipeline

**User Story:** As a developer, I want `normalizeNumbers` to run at a fixed position in the pipeline, so that downstream stages always receive normalized numeric tokens.

#### Acceptance Criteria

1. THE NormalizationPipeline SHALL execute `normalizeNumbers` after `normalizeUnicode` and before `normalizeOperators`.
2. WHEN the pipeline processes an expression, THE NormalizationPipeline SHALL apply stages in the following order: `protectLatex` → `normalizeUnicode` → `normalizeNumbers` → `normalizeOperators` → `normalizeFunctions` → `convertFractions` → `normalizeSpacing` → `restoreLatex`.

### Requirement 3: Унификация IntervalParser

**User Story:** As a developer, I want `IntervalParser` to delegate number normalization to `normalizeNumbers`, so that infinity handling is not duplicated.

#### Acceptance Criteria

1. WHEN `parseIntervalSet` receives a string with `InfinityVariant` tokens, THE IntervalParser SHALL call `normalizeNumbers` before applying its own parsing logic.
2. THE IntervalParser SHALL NOT contain inline `replace` calls for `InfinityVariant` normalization after `normalizeNumbers` is introduced.
3. WHEN `parseIntervalSet` is called with `"(-∞; 5]"`, THE IntervalParser SHALL produce the same result as when called with `"(-Infinity; 5]"`.

### Requirement 4: Унификация ExpressionComparator

**User Story:** As a developer, I want `compareExpressions` to delegate number normalization to `normalizeNumbers`, so that the comma-replacement hack is removed.

#### Acceptance Criteria

1. WHEN `compareExpressions` receives expressions with `DecimalComma`, THE ExpressionComparator SHALL call `normalizeNumbers` on each expression before passing them to `checkEquivalence`.
2. THE ExpressionComparator SHALL NOT contain an inline `.replace(',', '.')` call after `normalizeNumbers` is introduced.
3. FOR ALL pairs of expressions `(e1, e2)`, calling `compareExpressions(e1, e2)` before and after this change SHALL produce the same boolean result (round-trip equivalence of behaviour).

### Requirement 5: Формализация контракта normalizeFunctions

**User Story:** As a developer, I want `normalizeFunctions` to have an explicit single-pass contract, so that its behaviour is predictable and verifiable.

#### Acceptance Criteria

1. THE `normalizeFunctions` stage SHALL process each function token (sqrt, log, ln, lg) in exactly one pass using a single `replace` call per pattern — without loops or recursive calls.
2. THE `normalizeFunctions` stage SHALL be documented with an explicit comment stating: "Single pass — no loops, no recursion. Each pattern is applied once."
3. WHEN `normalizeFunctions` is applied to an expression containing nested function calls, THE NormalizationPipeline SHALL NOT apply `normalizeFunctions` more than once to the same expression.

### Requirement 6: Запрет дублирования

**User Story:** As a developer, I want number normalization logic to exist in exactly one place, so that future changes require editing only one function.

#### Acceptance Criteria

1. THE codebase SHALL NOT contain `replace` calls for `InfinityVariant` normalization outside of `normalizeNumbers`.
2. THE codebase SHALL NOT contain `replace` calls for `DecimalComma` normalization outside of `normalizeNumbers`.
3. WHEN a code review is performed, THE codebase SHALL have exactly one definition of the mapping `InfinityVariant → Infinity / -Infinity`.
