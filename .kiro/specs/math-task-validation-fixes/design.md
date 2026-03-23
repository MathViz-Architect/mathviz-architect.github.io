# math-task-validation-fixes Bugfix Design

## Overview

Три независимых бага в системе математических задач:

1. **variantGenerator.ts — Pass 2**: `Object.entries` не гарантирует порядок обхода, из-за чего expression-параметры с зависимостями вычисляются раньше своих зависимостей и получают значение 0 или вызывают исключение. Исправление: итеративный алгоритм `evaluateExpressionParams` с повторными попытками (до N проходов).

2. **pythagoreanTheorem.ts + answerValidator.ts — иррациональные ответы**: задачи с `answer_formula: 'Math.sqrt(...)'` используют `answer_type: 'number'` по умолчанию. Валидатор пытается распарсить `sqrt(109)` как число, получает NaN и отклоняет верный ответ. Исправление: явный `answer_type: 'expression'` для нужных difficulty-уровней + численное сравнение в `case 'expression'` когда нет переменных.

3. **pythagoreanTheorem.ts — hint без $-делимитеров**: поля `hint` содержат голый LaTeX (например `\sqrt{a^2 + b^2}`), который MathText выводит как сырой текст. Исправление: обернуть LaTeX в `$...$`.

---

## Glossary

- **Bug_Condition (C)**: условие, при котором проявляется баг
- **Property (P)**: ожидаемое корректное поведение при выполнении C
- **Preservation**: существующее поведение, которое не должно измениться после исправления
- **evaluateExpressionParams**: логика Pass 2 в `generateParamsForConfig` — вычисление expression-параметров через `evaluateFormula`
- **isBugCondition**: псевдокод-функция, формально определяющая входные данные, на которых проявляется баг
- **DifficultyConfig**: объект конфигурации уровня сложности шаблона задачи (`src/lib/types.ts`)
- **answer_type**: поле конфига, определяющее стратегию валидации ответа (`'number' | 'fraction' | 'expression' | ...`)
- **checkEquivalence**: функция в `src/lib/engine/equivalence.ts`, проверяющая символическую эквивалентность выражений
- **extractVariables**: функция в `src/lib/engine/equivalence.ts`, извлекающая переменные из выражения

---

## Bug Details

### Баг 1 — Порядок вычисления expression-параметров

Pass 2 в `generateParamsForConfig` (`src/lib/engine/variantGenerator.ts`) итерирует параметры через `Object.entries`, порядок которого в JS не гарантирован для числовых ключей и может отличаться от порядка объявления. Если параметр `x` зависит от параметра `y`, а `y` встречается позже в порядке итерации, `x` вычисляется с `y = undefined` (→ 0 или NaN).

**Formal Specification:**
```
FUNCTION isBugCondition_1(config)
  INPUT: config of type DifficultyConfig
  OUTPUT: boolean

  expressionParams ← filter(config.parameters, p.type = 'expression')
  RETURN exists param P in expressionParams such that
    P.value references another expression param Q
    AND Q appears after P in Object.entries(config.parameters) iteration order
END FUNCTION
```

**Примеры:**
- `grade6-fraction-property` difficulty 1: параметр `x` зависит от `i`, `a`, `b` — все expression. Если `x` вычисляется первым, `i` ещё не определён → `x = 0`
- `grade6-common-denominator` difficulty 2: `mb = lcm / b`, `num = a * mb` — `num` зависит от `mb`, если `num` вычисляется раньше `mb`, получаем `num = 0`
- `grade6-ratios` difficulty 3: `descA`, `descB` зависят от `i` — если `i` не вычислен, строки получают `undefined`

### Баг 2 — answer_type для иррациональных задач

Задачи `grade8-pythag-hypotenuse` (difficulty 2, 3), `grade8-pythag-leg` (difficulty 2, 3), `grade8-pythag-distance` (difficulty 1, 2, 3) имеют `answer_formula: 'Math.sqrt(...)'`, но не задают явный `answer_type`. Генератор использует `config.answer_type || 'number'`, поэтому тип всегда `'number'`. Валидатор в `case 'number'` отклоняет строку `sqrt(109)` — она не проходит regex `/^-?(\d+\.?\d*|\.\d+)$/`.

Дополнительно: в `case 'expression'` `checkEquivalence` работает через символическое сравнение с подстановкой переменных. Когда переменных нет (чисто числовое выражение), `extractVariables` возвращает `[]`, и `checkEquivalence` может не дать `confidence >= 0.99` для `sqrt(109)` vs числового значения.

**Formal Specification:**
```
FUNCTION isBugCondition_2(task, userAnswer)
  INPUT: task of type GeneratedProblem, userAnswer of type string
  OUTPUT: boolean

  RETURN task.answer_type = 'number'
    AND task.answer (numeric) = Math.sqrt(N) for some non-perfect-square N
    AND userAnswer matches pattern /^sqrt\(\d+\)$/
END FUNCTION
```

**Примеры:**
- `grade8-pythag-hypotenuse` difficulty 2, a=3, b=4 → answer=5 (целое, не баг)
- `grade8-pythag-hypotenuse` difficulty 2, a=2, b=3 → answer=√13 ≈ 3.606, userAnswer=`sqrt(13)` → NaN → false (баг)
- `grade8-pythag-distance` difficulty 1, x1=0,y1=0,x2=3,y2=4 → answer=5 (целое, не баг)
- `grade8-pythag-distance` difficulty 2, x1=1,y1=1,x2=4,y2=5 → answer=√25=5 (целое, не баг)
- `grade8-pythag-distance` difficulty 2, x1=0,y1=0,x2=2,y2=3 → answer=√13, userAnswer=`sqrt(13)` → false (баг)

### Баг 3 — LaTeX без $-делимитеров в hint

Поля `hint` в `pythagoreanTheorem.ts` содержат голый LaTeX без `$...$`. Компонент `MathText` ищет `$...$` блоки для рендеринга через KaTeX — без них формула выводится как сырой текст.

**Formal Specification:**
```
FUNCTION isBugCondition_3(hint)
  INPUT: hint of type string
  OUTPUT: boolean

  RETURN hint contains LaTeX commands (\sqrt, \frac, ^, _)
    AND hint does NOT contain '$' delimiters
END FUNCTION
```

**Примеры затронутых hint:**
- `grade8-pythag-hypotenuse` d2: `'Гипотенуза = \\sqrt{a^2 + b^2}'` → сырой текст
- `grade8-pythag-leg` d2: `'b = \\sqrt{c^2 - a^2}'` → сырой текст
- `grade8-pythag-leg` d3: `'Второй катет = \\sqrt{гипотенуза^2 - катет^2}'` → сырой текст
- `grade8-pythag-distance` d1: `'Расстояние = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}'` → сырой текст

---

## Expected Behavior

### Preservation Requirements

**Неизменяемое поведение:**
- Expression-параметры без зависимостей между собой вычисляются корректно (поведение не меняется, только становится устойчивым к порядку)
- Задачи теоремы Пифагора difficulty 1 с целым ответом продолжают валидироваться как `'number'`
- Символьные ответы с переменными (например `2*x + 1`) на задачи типа `'expression'` продолжают проверяться через `checkEquivalence`
- Hint без LaTeX-формул отображается без изменений
- Все остальные типы ответов (`'fraction'`, `'coordinate'`, `'interval'`) не затрагиваются

**Scope:**
- Баг 1: только Pass 2 в `generateParamsForConfig`. Pass 1 (int/choice) и constraint-проверка не меняются.
- Баг 2: только `case 'expression'` в `answerValidator.ts` (добавление численного fallback) и поля `answer_type` в `pythagoreanTheorem.ts`.
- Баг 3: только строки `hint` в `pythagoreanTheorem.ts` (и при необходимости `grade6/index.ts`).

---

## Hypothesized Root Cause

### Баг 1

1. **Порядок Object.entries**: В V8 порядок итерации объекта для строковых ключей соответствует порядку вставки, но expression-параметры вычисляются в одном проходе без учёта топологического порядка зависимостей. Если шаблон объявляет `x` до `i`, а `x` зависит от `i`, то при вычислении `x` значение `i` ещё `undefined`.

2. **Отсутствие retry-логики для Pass 2**: Constraint-retry (строки 60–90 в variantGenerator.ts) регенерирует int/choice параметры, но Pass 2 внутри retry также итерирует через `Object.entries` без учёта зависимостей — баг воспроизводится при каждой попытке.

### Баг 2

1. **Отсутствие явного answer_type**: Генератор использует `config.answer_type || 'number'`. Шаблоны pythagoreanTheorem не задают `answer_type: 'expression'` для уровней с иррациональным ответом.

2. **checkEquivalence без переменных**: `extractVariables('sqrt(109)')` возвращает `[]`. `checkEquivalence` с пустым массивом переменных делает одну числовую подстановку, но `sqrt(109)` как строка может не распарситься корректно через `toMathJSExpression`, либо confidence < 0.99.

### Баг 3

1. **Отсутствие $-делимитеров**: Авторы шаблонов записали LaTeX напрямую в строку hint без оборачивания в `$...$`. `normalizeMathFragments` в variantGenerator обрабатывает только уже обёрнутые блоки.

---

## Correctness Properties

Property 1: Bug Condition — Итеративное вычисление expression-параметров

_For any_ `DifficultyConfig` где хотя бы один expression-параметр зависит от другого expression-параметра (`isBugCondition_1` returns true), исправленная функция `generateParamsForConfig` SHALL вычислить все expression-параметры с корректными ненулевыми значениями, независимо от порядка ключей в объекте `parameters`.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation — Expression-параметры без зависимостей

_For any_ `DifficultyConfig` где expression-параметры не зависят друг от друга (`isBugCondition_1` returns false), исправленная функция SHALL производить те же значения параметров, что и оригинальная функция.

**Validates: Requirements 3.5**

Property 3: Bug Condition — Принятие иррационального ответа

_For any_ задачи с `answer_type: 'expression'` и числовым ответом вида `Math.sqrt(N)` (N — не полный квадрат), исправленный `validateAnswer` SHALL вернуть `true` для пользовательского ввода `sqrt(N)`, вычислив и сравнив числовые значения с точностью до `1e-9`.

**Validates: Requirements 2.3, 2.4**

Property 4: Preservation — Целочисленные задачи Пифагора

_For any_ задачи теоремы Пифагора difficulty 1 с целым ответом (`isBugCondition_2` returns false), исправленный валидатор SHALL продолжать принимать правильные числовые ответы и отклонять неправильные — поведение не меняется.

**Validates: Requirements 3.2**

Property 5: Preservation — Символьные ответы с переменными

_For any_ вызова `validateAnswer` с `answer_type: 'expression'` где ответ содержит переменные (`isBugCondition_2` returns false), исправленный валидатор SHALL продолжать использовать `checkEquivalence` — поведение не меняется.

**Validates: Requirements 3.3**

---

## Fix Implementation

### Изменение 1 — `src/lib/engine/variantGenerator.ts`

**Функция**: `generateParamsForConfig`

**Изменение**: заменить Pass 2 (однопроходный `for...of Object.entries`) на итеративный алгоритм с повторными попытками:

```
FUNCTION evaluateExpressionParams(config, params)
  INPUT: config.parameters, params (уже содержит int/choice значения)
  OUTPUT: params с вычисленными expression-значениями

  remaining ← keys where config.parameters[key].type = 'expression'
  maxPasses ← remaining.length + 1  // N+1 проходов достаточно для любой цепочки зависимостей

  REPEAT maxPasses times:
    FOR each key in remaining:
      TRY:
        value ← evaluateFormula(config.parameters[key].value, params)
        IF value is not undefined AND not NaN:
          params[key] ← value
          remove key from remaining
      CATCH: skip (зависимость ещё не вычислена)
    IF remaining is empty: BREAK

  // Оставшиеся параметры (циклические зависимости или ошибки) вычисляем принудительно
  FOR each key in remaining:
    params[key] ← evaluateFormula(config.parameters[key].value, params)

  RETURN params
END FUNCTION
```

Этот алгоритм применяется как в основном вычислении, так и внутри constraint-retry цикла.

### Изменение 2 — `src/lib/engine/answerValidator.ts`

**Функция**: `validateAnswer`, `case 'expression'`

**Изменение**: добавить численный fallback перед `checkEquivalence` когда переменных нет:

```
case 'expression':
  vars ← extractVariables(processedUserAnswer + ' ' + processedExpectedAnswer)
  
  IF vars.length = 0:
    // Нет переменных — сравниваем численно
    userNum ← evaluateNumeric(processedUserAnswer)   // через math.evaluate
    expectedNum ← evaluateNumeric(processedExpectedAnswer)
    IF both are finite AND |userNum - expectedNum| < 1e-9:
      RETURN true
  
  // Символьное сравнение (существующая логика)
  result ← checkEquivalence(processedUserAnswer, processedExpectedAnswer, vars)
  RETURN result.isEquivalent AND result.confidence >= 0.99
```

### Изменение 3 — `src/lib/templates/grade8/pythagoreanTheorem.ts`

**Изменение A**: добавить `answer_type: 'expression'` для difficulty-уровней с иррациональным ответом:
- `grade8-pythag-hypotenuse`: difficulty 2, 3
- `grade8-pythag-leg`: difficulty 2, 3
- `grade8-pythag-distance`: difficulty 1, 2, 3 (все уровни могут давать иррациональный ответ)

**Изменение B**: обернуть голый LaTeX в hint в `$...$`:
- `grade8-pythag-hypotenuse` d1: `'Гипотенуза² = катет₁² + катет₂²'` — без LaTeX, не трогать
- `grade8-pythag-hypotenuse` d2: `'Гипотенуза = \\sqrt{a^2 + b^2}'` → `'Гипотенуза = $\\sqrt{a^2 + b^2}$'`
- `grade8-pythag-leg` d2: `'b = \\sqrt{c^2 - a^2}'` → `'$b = \\sqrt{c^2 - a^2}$'`
- `grade8-pythag-leg` d3: `'Второй катет = \\sqrt{гипотенуза^2 - катет^2}'` → `'Второй катет = $\\sqrt{\\text{гипотенуза}^2 - \\text{катет}^2}$'`
- `grade8-pythag-distance` d1: `'Расстояние = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}'` → `'Расстояние = $\\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$'`

### Изменение 4 — `src/lib/templates/grade6/index.ts`

Проверить hint-поля на наличие голого LaTeX. По результатам анализа файла: hint в grade6 используют только текст и `{param}` подстановки без LaTeX-команд — изменений не требуется.

---

## Testing Strategy

### Validation Approach

Двухфазный подход: сначала воспроизвести баги на нефиксированном коде (exploratory), затем верифицировать исправления и отсутствие регрессий.

### Exploratory Bug Condition Checking

**Goal**: Воспроизвести все три бага на нефиксированном коде, подтвердить root cause.

**Test Cases:**

**Баг 1:**
1. `generateProblem(grade6FractionPropertyTemplate, 1, seed)` — проверить что параметр `x` не равен 0 (будет равен 0 на нефиксированном коде если `x` вычисляется раньше `i`)
2. `generateProblem(grade6CommonDenominatorTemplate, 2, seed)` — проверить что `num = a * mb` корректно (будет 0 если `mb` не вычислен)

**Баг 2:**
3. `validateAnswer({answer: Math.sqrt(13), answer_type: 'number'}, 'sqrt(13)')` → ожидаем `false` (баг подтверждён)
4. `validateAnswer({answer: Math.sqrt(13), answer_type: 'expression'}, 'sqrt(13)')` → ожидаем `true` (после исправления)

**Баг 3:**
5. Проверить что `normalizeMathFragments('Гипотенуза = \\sqrt{a^2 + b^2}')` возвращает строку без изменений (нет `$` → нет нормализации → сырой текст)

**Expected Counterexamples:**
- Параметр `x` в grade6-fraction-property = 0 при определённых seed
- `validateAnswer` возвращает `false` для `sqrt(13)` с типом `'number'`
- hint отображается как `\sqrt{a^2 + b^2}` вместо формулы

### Fix Checking

**Goal**: Верифицировать что для всех входных данных где выполняется bug condition, исправленный код даёт ожидаемое поведение.

**Pseudocode:**
```
// Баг 1
FOR ALL config WHERE isBugCondition_1(config) DO
  params ← generateParamsForConfig_fixed(config, rng)
  ASSERT all expression params have defined, non-NaN values
END FOR

// Баг 2
FOR ALL (task, userAnswer) WHERE isBugCondition_2(task, userAnswer) DO
  result ← validateAnswer_fixed(task, userAnswer, 'expression')
  ASSERT result = true
END FOR

// Баг 3
FOR ALL hint WHERE isBugCondition_3(hint) DO
  fixed_hint ← hint with LaTeX wrapped in $...$
  ASSERT normalizeMathFragments(fixed_hint) produces rendered math
END FOR
```

### Preservation Checking

**Goal**: Верифицировать что для входных данных где bug condition НЕ выполняется, поведение не изменилось.

**Pseudocode:**
```
// Баг 1
FOR ALL config WHERE NOT isBugCondition_1(config) DO
  ASSERT generateParamsForConfig_original(config) = generateParamsForConfig_fixed(config)
END FOR

// Баг 2
FOR ALL (task, userAnswer) WHERE NOT isBugCondition_2(task, userAnswer) DO
  ASSERT validateAnswer_original(task, userAnswer) = validateAnswer_fixed(task, userAnswer)
END FOR
```

**Testing Approach**: Property-based testing рекомендуется для Бага 1 (генерация случайных конфигов с зависимыми параметрами) и Бага 2 (генерация случайных числовых выражений без переменных).

### Unit Tests

- Баг 1: тест `generateParamsForConfig` с конфигом где expression-параметры объявлены в обратном порядке зависимостей
- Баг 1: тест что constraint-retry также использует исправленный Pass 2
- Баг 2: тест `validateAnswer` с `answer_type: 'expression'`, ответ `Math.sqrt(13)`, ввод `'sqrt(13)'` → `true`
- Баг 2: тест `validateAnswer` с `answer_type: 'expression'`, ответ `Math.sqrt(13)`, ввод `'sqrt(14)'` → `false`
- Баг 2: тест что `answer_type: 'number'` для difficulty 1 (целый ответ) продолжает работать
- Баг 3: тест что hint с `$\sqrt{a^2+b^2}$` проходит через `normalizeMathFragments` корректно

### Property-Based Tests

- Баг 1 (Property 1): генерировать случайные конфиги с expression-параметрами в произвольном порядке — все параметры должны иметь корректные значения
- Баг 1 (Property 2): для конфигов без зависимостей — результат идентичен оригинальному алгоритму
- Баг 2 (Property 3): генерировать случайные N (не полные квадраты) — `validateAnswer` с `answer_type: 'expression'` принимает `sqrt(N)` и отклоняет `sqrt(N+1)`
- Баг 2 (Property 5): генерировать случайные выражения с переменными — `checkEquivalence` путь не затронут

### Integration Tests

- Полный цикл `generateProblem` → `validateAnswer` для `grade8-pythag-hypotenuse` difficulty 2: сгенерировать задачу, вычислить правильный ответ в формате `sqrt(N)`, убедиться что валидатор принимает
- Полный цикл для `grade6-fraction-property` difficulty 1: все параметры корректны, правильный ответ принимается
- Проверка hint-рендеринга: hint из `grade8-pythag-distance` difficulty 1 содержит `$...$` после исправления
