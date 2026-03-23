# Bugfix Requirements Document

## Introduction

Три независимых бага в системе математических задач, влияющих на корректность валидации ответов и отображение подсказок:

1. **НОК/НОД — ложные срабатывания валидации**: генератор вариантов вычисляет expression-параметры в непредсказуемом порядке, из-за чего параметры с зависимостями получают значение 0 или вызывают ошибку, что приводит к некорректным задачам и ложным отклонениям правильных ответов.

2. **sqrt(109) не принимается как правильный ответ**: задачи теоремы Пифагора с иррациональным ответом имеют `answer_type: 'number'` по умолчанию, из-за чего валидатор пытается распарсить `sqrt(109)` как число, получает NaN и отклоняет верный ответ.

3. **LaTeX не рендерится в подсказках**: формулы в полях `hint` записаны без `$`-делимитеров, поэтому компонент MathText выводит их как сырой текст вместо красивых математических формул.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN генератор вариантов вычисляет expression-параметры в Pass 2 через `Object.entries` THEN система вычисляет параметры в непредсказуемом порядке, из-за чего зависимые параметры (например `l`, зависящий от `i`) вычисляются раньше своих зависимостей и получают значение 0 или вызывают исключение

1.2 WHEN задача НОК/НОД генерируется с некорректными параметрами (например `l = 0`) THEN система создаёт невалидную задачу, которая проходит constraint-проверку или приводит к ложному отклонению правильного ответа пользователя

1.3 WHEN пользователь вводит ответ в формате `sqrt(109)` на задачу теоремы Пифагора с иррациональным ответом THEN система пытается распарсить строку как число, получает NaN и возвращает `false` (неверный ответ), хотя ответ математически верен

1.4 WHEN задача теоремы Пифагора difficulty 2 или 3 имеет `answer_formula: 'Math.sqrt(...)'` без явного `answer_type` THEN система использует тип `'number'` по умолчанию, что делает невозможным принятие символьных ответов вида `sqrt(N)`

1.5 WHEN компонент MathText получает строку hint с голым LaTeX (например `\sqrt{a^2 + b^2}`) без `$`-делимитеров THEN система выводит формулу как сырой текст, а не рендерит её математически

### Expected Behavior (Correct)

2.1 WHEN генератор вариантов вычисляет expression-параметры THEN система SHALL вычислять их итеративно с повторными попытками (до N проходов), гарантируя что все зависимости разрешены в правильном порядке независимо от порядка ключей в объекте

2.2 WHEN все expression-параметры вычислены корректно THEN система SHALL генерировать задачи НОК/НОД с валидными параметрами, при которых правильные ответы принимаются, а неправильные — отклоняются

2.3 WHEN пользователь вводит ответ `sqrt(109)` на задачу теоремы Пифагора с иррациональным ответом THEN система SHALL принять ответ как верный, вычислив и сравнив числовые значения с точностью до 1e-9

2.4 WHEN задача теоремы Пифагора имеет иррациональный ответ (difficulty 2 и 3 для hypotenuse/leg, difficulty 1–3 для distance) THEN система SHALL использовать `answer_type: 'expression'`, позволяя принимать символьные ответы

2.5 WHEN компонент MathText получает строку hint с LaTeX-формулами, обёрнутыми в `$...$` THEN система SHALL рендерить формулы как красивые математические выражения

### Unchanged Behavior (Regression Prevention)

3.1 WHEN задача НОД/НОК генерируется с корректными параметрами (все зависимости разрешены) THEN система SHALL CONTINUE TO принимать правильные ответы и отклонять неправильные

3.2 WHEN пользователь вводит целочисленный ответ на задачу теоремы Пифагора difficulty 1 (hypotenuse или leg) THEN система SHALL CONTINUE TO валидировать ответ как число (тип `'number'` сохраняется)

3.3 WHEN пользователь вводит символьный ответ с переменными (например `2*x + 1`) на задачу типа `'expression'` THEN система SHALL CONTINUE TO проверять эквивалентность символически через `checkEquivalence`

3.4 WHEN hint не содержит LaTeX-формул THEN система SHALL CONTINUE TO отображать текст подсказки без изменений

3.5 WHEN expression-параметры не имеют зависимостей между собой THEN система SHALL CONTINUE TO вычислять их корректно (поведение не меняется, только становится устойчивым к порядку)

---

## Bug Condition Pseudocode

### Баг 1 — НОК/НОД: порядок вычисления expression-параметров

```pascal
FUNCTION isBugCondition_1(config)
  INPUT: config of type DifficultyConfig
  OUTPUT: boolean

  expressionParams ← filter(config.parameters, type = 'expression')
  RETURN exists param P in expressionParams such that
    P depends on another expression param Q
    AND index(P) < index(Q) in Object.entries order
END FUNCTION

// Property: Fix Checking
FOR ALL config WHERE isBugCondition_1(config) DO
  params ← evaluateExpressionParams'(config)
  ASSERT all expression params have non-zero, non-error values
END FOR

// Property: Preservation Checking
FOR ALL config WHERE NOT isBugCondition_1(config) DO
  ASSERT evaluateExpressionParams(config) = evaluateExpressionParams'(config)
END FOR
```

### Баг 2 — sqrt(109): тип ответа для иррациональных задач

```pascal
FUNCTION isBugCondition_2(task, userAnswer)
  INPUT: task of type MathTask, userAnswer of type string
  OUTPUT: boolean

  RETURN task.answer_type = 'number'
    AND task.answer_formula contains 'Math.sqrt'
    AND userAnswer matches pattern 'sqrt(...)'
END FUNCTION

// Property: Fix Checking
FOR ALL (task, userAnswer) WHERE isBugCondition_2(task, userAnswer) DO
  result ← validateAnswer'(task, userAnswer)
  ASSERT result = true WHEN numeric values are equal within 1e-9
END FOR

// Property: Preservation Checking
FOR ALL (task, userAnswer) WHERE NOT isBugCondition_2(task, userAnswer) DO
  ASSERT validateAnswer(task, userAnswer) = validateAnswer'(task, userAnswer)
END FOR
```

### Баг 3 — LaTeX в hint без делимитеров

```pascal
FUNCTION isBugCondition_3(hint)
  INPUT: hint of type string
  OUTPUT: boolean

  RETURN hint contains LaTeX commands (e.g. \sqrt, \frac)
    AND hint does NOT contain '$' delimiters
END FUNCTION

// Property: Fix Checking
FOR ALL hint WHERE isBugCondition_3(hint) DO
  rendered ← MathText'(hint)
  ASSERT rendered contains rendered math formula (not raw LaTeX text)
END FOR

// Property: Preservation Checking
FOR ALL hint WHERE NOT isBugCondition_3(hint) DO
  ASSERT MathText(hint) = MathText'(hint)
END FOR
```
