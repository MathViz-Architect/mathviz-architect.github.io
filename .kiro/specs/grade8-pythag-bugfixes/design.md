# grade8-pythag-bugfixes Bugfix Design

## Overview

В файле `src/lib/templates/grade8/pythagoreanTheorem.ts` обнаружены 5 багов в шаблонах задач по теореме Пифагора. Исправления минимальны и точечны: добавить `answer_type: 'expression'` в уровень 1 гипотенузы, добавить constraint на целую гипотенузу, исправить интерполяцию LaTeX во всех шаблонах (заменить `$\sqrt{expr}$` на `$\sqrt{{expr}}$`), и проверить форматирование поля `result`.

## Glossary

- **Bug_Condition (C)**: Условие, при котором проявляется баг — конкретный уровень/шаблон с некорректной конфигурацией
- **Property (P)**: Ожидаемое поведение после исправления
- **Preservation**: Поведение уровней и шаблонов, которые не затронуты исправлениями
- **answer_type**: Поле шаблона, определяющее тип ввода ответа (`'expression'` для символьных выражений типа `sqrt(N)`)
- **constraints**: Массив строк-условий, ограничивающих генерацию параметров задачи
- **interpolation**: Подстановка значений переменных в строки шаблона через `{expr}`; внутри LaTeX `\sqrt{}` требует двойных фигурных скобок `\sqrt{{expr}}`

## Bug Details

### Bug Condition

Баги проявляются в конкретных полях конкретных уровней шаблонов. Каждый баг независим.

**Formal Specification:**
```
FUNCTION isBugCondition(template, level, field)
  INPUT: template id, difficulty level, field name
  OUTPUT: boolean

  IF template = 'grade8-pythag-hypotenuse' AND level = 1
    AND field = 'answer_type' AND answer_type IS MISSING
    RETURN true  -- Bug 1.1

  IF template IN ['grade8-pythag-hypotenuse', 'grade8-pythag-leg', 'grade8-pythag-distance']
    AND field = 'solution'
    AND solution contains pattern '$\sqrt{expr}$' WITHOUT double braces
    RETURN true  -- Bug 1.2 / 1.5

  IF template = 'grade8-pythag-hypotenuse' AND level = 1
    AND field = 'constraints'
    AND constraints = ['a !== b']  -- missing integer-hypotenuse check
    RETURN true  -- Bug 1.3

  IF template IN ['grade8-pythag-hypotenuse', 'grade8-pythag-leg', 'grade8-pythag-distance']
    AND field = 'result'
    AND result contains 'sqrt({expr})' with correct interpolation
    RETURN false  -- Bug 1.4: result format is actually correct, no fix needed

  RETURN false
END FUNCTION
```

### Examples

- **Bug 1.1**: `grade8-pythag-hypotenuse` уровень 1 — нет `answer_type: 'expression'`, движок ожидает число, а не `sqrt(89)`
- **Bug 1.2**: `grade8-pythag-hypotenuse` уровень 1, строка `'c = $\\sqrt{a*a + b*b}$'` — переменные `a`, `b` не интерполируются, выводится сырой LaTeX
- **Bug 1.3**: `grade8-pythag-hypotenuse` уровень 1 — constraint `['a !== b']` допускает a=5, b=8 → √89 (иррациональная)
- **Bug 1.5**: `grade8-pythag-leg` уровень 1, строка `'b = $\\sqrt{c*c - a*a}$'` — аналогичная проблема интерполяции
- **Bug 1.4 (не баг)**: Поле `result: 'sqrt({a*a + b*b})'` использует `{expr}` — это корректный синтаксис интерполяции, исправлений не требует

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Уровни 2, 3, 4 шаблона `grade8-pythag-hypotenuse` работают без изменений
- Шаблон `grade8-pythag-check` (уровни 1, 2) не затронут
- Шаблон `grade8-pythag-distance` — только исправление интерполяции в `solution`, логика не меняется
- Шаблон `grade8-pythag-leg` уровень 1 — constraint на целый ответ уже есть, не меняется
- Поля `hint`, `template`, `parameters`, `answer_formula` во всех шаблонах не изменяются

**Scope:**
Все входные данные, не попадающие под условие бага (другие шаблоны, другие уровни, другие поля), должны остаться полностью неизменными.

## Hypothesized Root Cause

1. **Отсутствующий answer_type в уровне 1**: При создании уровня 1 `grade8-pythag-hypotenuse` предполагалось, что ответ всегда целый (пифагорова тройка), поэтому `answer_type: 'expression'` не добавили. Но constraint не гарантировал целую гипотенузу.

2. **Неправильная интерполяция LaTeX**: Шаблонизатор использует `{expr}` для подстановки переменных. Внутри LaTeX-команды `\sqrt{...}` фигурные скобки уже заняты LaTeX-синтаксисом, поэтому для интерполяции нужны двойные скобки `\sqrt{{expr}}`. Автор шаблонов не учёл это правило.

3. **Слабый constraint уровня 1**: Constraint `['a !== b']` предотвращает только равные катеты, но не гарантирует целую гипотенузу. Нужно добавить проверку `Math.sqrt(a*a + b*b) === Math.floor(Math.sqrt(a*a + b*b))`.

4. **Поле result**: После анализа кода — `result: 'sqrt({a*a + b*b})'` использует `{expr}` вне LaTeX-контекста, интерполяция работает корректно. Баг 1.4 не подтверждается.

## Correctness Properties

Property 1: Bug Condition — answer_type и constraints уровня 1 гипотенузы

_For any_ задачи `grade8-pythag-hypotenuse` уровня 1, исправленный шаблон SHALL иметь `answer_type: 'expression'` и constraint `Math.sqrt(a*a + b*b) === Math.floor(Math.sqrt(a*a + b*b))`, гарантируя что генерируются только пифагоровы тройки и движок принимает символьный ответ.

**Validates: Requirements 2.1, 2.3**

Property 2: Bug Condition — интерполяция LaTeX в solution

_For any_ строки `solution` в шаблонах `grade8-pythag-hypotenuse`, `grade8-pythag-leg`, `grade8-pythag-distance`, содержащей `\sqrt{expr}`, исправленный шаблон SHALL использовать `\sqrt{{expr}}` (двойные фигурные скобки), и шаблонизатор SHALL подставить вычисленное значение вместо имени переменной.

**Validates: Requirements 2.2, 2.5**

Property 3: Preservation — остальные уровни и шаблоны

_For any_ уровня или шаблона, не попадающего под условие бага (isBugCondition returns false), исправленный файл SHALL производить идентичное поведение с оригинальным файлом, сохраняя все существующие `answer_type`, `constraints`, `solution`, `hint`, `answer_formula`.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

**File**: `src/lib/templates/grade8/pythagoreanTheorem.ts`

---

**Fix 1 — grade8-pythag-hypotenuse, уровень 1: добавить answer_type**

```typescript
// BEFORE
1: {
    template: 'В прямоугольном треугольнике катеты {a} см и {b} см. Найдите гипотенузу.',
    parameters: { ... },
    constraints: ['a !== b'],
    answer_formula: 'Math.sqrt(a*a + b*b)',
    hint: '...',

// AFTER
1: {
    template: 'В прямоугольном треугольнике катеты {a} см и {b} см. Найдите гипотенузу.',
    parameters: { ... },
    constraints: [
        'a !== b',
        'Math.sqrt(a*a + b*b) === Math.floor(Math.sqrt(a*a + b*b))',
    ],
    answer_formula: 'Math.sqrt(a*a + b*b)',
    answer_type: 'expression',
    hint: '...',
```

---

**Fix 2 — grade8-pythag-hypotenuse, уровень 1: исправить интерполяцию в solution**

```typescript
// BEFORE
{ explanation: 'c = $\\sqrt{a*a + b*b}$' },

// AFTER
{ explanation: 'c = $\\sqrt{{a*a + b*b}}$' },
```

---

**Fix 3 — grade8-pythag-hypotenuse, уровень 2: исправить интерполяцию в solution**

```typescript
// BEFORE
{ explanation: 'c = $\\sqrt{a*a + b*b}$' },

// AFTER
{ explanation: 'c = $\\sqrt{{a*a + b*b}}$' },
```

---

**Fix 4 — grade8-pythag-hypotenuse, уровень 3: исправить интерполяцию в solution**

```typescript
// BEFORE
{ explanation: 'Гипотенуза: $\\sqrt{{a}^2 + {b}^2}$ = $\\sqrt{a*a + b*b}$' },

// AFTER
{ explanation: 'Гипотенуза: $\\sqrt{{a}^2 + {b}^2}$ = $\\sqrt{{a*a + b*b}}$' },
```

Примечание: `$\\sqrt{{a}^2 + {b}^2}$` уже корректен (двойные скобки вокруг `a` и `b`), исправляется только второй `\sqrt`.

---

**Fix 5 — grade8-pythag-leg, уровень 1: исправить интерполяцию в solution**

```typescript
// BEFORE
{ explanation: 'b = $\\sqrt{c*c - a*a}$' },

// AFTER
{ explanation: 'b = $\\sqrt{{c*c - a*a}}$' },
```

---

**Fix 6 — grade8-pythag-leg, уровень 2: исправить интерполяцию в solution**

```typescript
// BEFORE
{ explanation: 'b = $\\sqrt{c*c - a*a}$' },

// AFTER
{ explanation: 'b = $\\sqrt{{c*c - a*a}}$' },
```

---

**Fix 7 — grade8-pythag-leg, уровень 3: исправить интерполяцию в solution**

```typescript
// BEFORE
{ explanation: 'b = $\\sqrt{{c}^2 - {a}^2}$ = $\\sqrt{c*c - a*a}$' },

// AFTER
{ explanation: 'b = $\\sqrt{{c}^2 - {a}^2}$ = $\\sqrt{{c*c - a*a}}$' },
```

---

**Fix 8 — grade8-pythag-distance, уровень 1: исправить интерполяцию в solution**

```typescript
// BEFORE
{ explanation: 'Расстояние = $\\sqrt{({x2 - x1})^2 + ({y2 - y1})^2}$ = $\\sqrt{(x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1)}$' },

// AFTER
{ explanation: 'Расстояние = $\\sqrt{({x2 - x1})^2 + ({y2 - y1})^2}$ = $\\sqrt{{(x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1)}}$' },
```

Примечание: `({x2 - x1})` и `({y2 - y1})` — это `{expr}` внутри круглых скобок, не LaTeX-скобки, они корректны. Исправляется только финальный `\sqrt`.

---

**Fix 9 — grade8-pythag-distance, уровень 2: проверка**

Уровень 2 содержит:
```typescript
{ explanation: '= $\\sqrt{{(x2 - x1)*(x2 - x1)} + {(y2 - y1)*(y2 - y1)}}$' },
```
Здесь уже используются двойные скобки — `\sqrt{{ ... }}`. Исправлений не требует.

---

**Итого изменений**: 8 точечных правок в одном файле.

**Поле `result` во всех шаблонах**: Формат `'sqrt({expr})'` корректен — `{expr}` здесь не внутри LaTeX `\sqrt{}`, а внутри текстовой строки. Интерполяция работает правильно. Изменений не требует.

## Testing Strategy

### Validation Approach

Двухфазный подход: сначала запустить тесты на НЕИСПРАВЛЕННОМ коде для подтверждения багов, затем применить исправления и убедиться в корректности.

### Exploratory Bug Condition Checking

**Goal**: Подтвердить баги до исправления. Убедиться, что интерполяция ломается и constraint допускает иррациональные значения.

**Test Plan**: Написать тесты, которые:
1. Проверяют наличие `answer_type` в уровне 1 гипотенузы
2. Проверяют, что строки `solution` после интерполяции содержат числа, а не имена переменных
3. Проверяют, что constraint уровня 1 не допускает иррациональную гипотенузу

**Test Cases**:
1. **answer_type Test**: Проверить `difficulties[1].answer_type === 'expression'` для `grade8-pythag-hypotenuse` (упадёт на неисправленном коде)
2. **Interpolation Test**: Передать a=3, b=4 в шаблонизатор и проверить, что solution содержит `\sqrt{25}`, а не `\sqrt{a*a + b*b}` (упадёт на неисправленном коде)
3. **Constraint Test**: Проверить, что a=5, b=8 отклоняется constraint уровня 1 (упадёт на неисправленном коде)
4. **Irrational Hypotenuse Test**: Проверить, что все сгенерированные пары (a, b) для уровня 1 дают целую гипотенузу (упадёт на неисправленном коде)

**Expected Counterexamples**:
- `difficulties[1].answer_type` is `undefined` вместо `'expression'`
- После интерполяции строка содержит `a*a + b*b` вместо числа
- Constraint допускает a=5, b=8 (√89 — иррациональное)

### Fix Checking

**Goal**: Убедиться, что для всех входных данных, попадающих под условие бага, исправленный шаблон ведёт себя корректно.

**Pseudocode:**
```
FOR ALL (template, level, field) WHERE isBugCondition(template, level, field) DO
  result := inspect_fixed_template(template, level, field)
  ASSERT expectedBehavior(result)
END FOR
```

### Preservation Checking

**Goal**: Убедиться, что уровни и шаблоны, не затронутые исправлениями, работают идентично оригиналу.

**Pseudocode:**
```
FOR ALL (template, level) WHERE NOT isBugCondition(template, level, ANY_FIELD) DO
  ASSERT original_template(template, level) = fixed_template(template, level)
END FOR
```

**Testing Approach**: Property-based тестирование для preservation — генерирует много случайных параметров и проверяет, что поведение не изменилось.

**Test Cases**:
1. **Hypotenuse Level 2/3/4 Preservation**: Проверить, что `answer_type`, `constraints`, `solution` уровней 2-4 не изменились
2. **grade8-pythag-check Preservation**: Проверить, что шаблон check полностью неизменён
3. **grade8-pythag-leg Level 1 Constraint Preservation**: Проверить, что constraint на целый катет в уровне 1 не изменился
4. **grade8-pythag-distance All Levels Preservation**: Проверить логику вычисления расстояния

### Unit Tests

- Проверить наличие `answer_type: 'expression'` в `grade8-pythag-hypotenuse` уровень 1
- Проверить наличие constraint на целую гипотенузу в уровне 1
- Проверить, что все строки `solution` с `\sqrt` используют двойные фигурные скобки
- Проверить, что `grade8-pythag-check` не изменился

### Property-Based Tests

- Генерировать случайные (a, b) для уровня 1 гипотенузы и проверять, что `Math.sqrt(a*a + b*b)` всегда целое
- Генерировать случайные параметры для всех уровней и проверять, что интерполяция solution не содержит сырых имён переменных
- Проверять preservation: для уровней 2-4 гипотенузы поведение идентично оригиналу

### Integration Tests

- Запустить полный цикл генерации задачи для `grade8-pythag-hypotenuse` уровень 1 и проверить, что ответ принимается как `expression`
- Проверить рендеринг solution в UI: `\sqrt{25}` отображается как √25, а не как `\sqrt{a*a + b*b}`
- Проверить, что переключение между уровнями 1 и 2 гипотенузы работает корректно
