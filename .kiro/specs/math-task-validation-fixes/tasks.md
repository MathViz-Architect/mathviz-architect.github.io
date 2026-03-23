# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Expression Parameter Dependency Order + Irrational Answer Rejection
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **GOAL**: Surface counterexamples that demonstrate all three bugs exist
  - **Scoped PBT Approach**: Scope each property to the concrete failing cases for reproducibility

  - Баг 1 — `isBugCondition_1`: создать конфиг где expression-параметр `x` объявлен ДО параметра `i`, но зависит от него (как в `grade6-fraction-property` difficulty 1). Вызвать `generateParamsForConfig` и проверить что `x !== 0` и `x !== undefined`. На нефиксированном коде тест УПАДЁТ (x = 0 или NaN).
  - Баг 1 — дополнительный случай: конфиг `grade6-common-denominator` difficulty 2 — параметр `num = a * mb`, `mb` объявлен после `num`. Проверить `num !== 0`.
  - Баг 2 — `isBugCondition_2`: вызвать `validateAnswer({answer: Math.sqrt(13), answer_type: 'number'}, 'sqrt(13)')`. На нефиксированном коде вернёт `false` (баг подтверждён). Тест ожидает `true` — УПАДЁТ.
  - Баг 2 — дополнительный случай: `validateAnswer({answer: Math.sqrt(109), answer_type: 'number'}, 'sqrt(109)')` → ожидаем `true`, получаем `false` (баг).
  - Баг 3 — `isBugCondition_3`: проверить что hint `'Гипотенуза = \\sqrt{a^2 + b^2}'` (без `$`) НЕ содержит `$`-делимитеров. Тест фиксирует наличие бага в исходных данных шаблона.
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found (e.g., `x = 0` при seed X, `validateAnswer` → `false` для `sqrt(13)`)
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Independent Expression Params + Integer Pythagoras + Symbolic Expressions
  - **IMPORTANT**: Follow observation-first methodology — observe UNFIXED code behavior first
  - **Observe**: `generateParamsForConfig` с конфигом где expression-параметры НЕ зависят друг от друга → записать результаты
  - **Observe**: `validateAnswer({answer: 5, answer_type: 'number'}, '5')` → `true` на нефиксированном коде
  - **Observe**: `validateAnswer({answer: 5, answer_type: 'number'}, '6')` → `false` на нефиксированном коде
  - **Observe**: `validateAnswer({answer_type: 'expression', answer: ...}, '2*x + 1')` с переменными → результат через `checkEquivalence`

  - Preservation 1 (Баг 1): для конфигов где `isBugCondition_1 = false` (нет зависимостей между expression-параметрами) — результат `generateParamsForConfig` идентичен до и после исправления. Property: для всех таких конфигов все expression-параметры имеют корректные значения.
  - Preservation 2 (Баг 2): для задач теоремы Пифагора difficulty 1 с целым ответом (`isBugCondition_2 = false`) — `validateAnswer` с `answer_type: 'number'` принимает правильный числовой ответ и отклоняет неправильный. Поведение не меняется.
  - Preservation 3 (Баг 2): для `answer_type: 'expression'` с переменными в ответе — путь через `checkEquivalence` не затронут. `validateAnswer` продолжает работать корректно.
  - Preservation 4 (Баг 3): hint без LaTeX-команд (`'Гипотенуза² = катет₁² + катет₂²'`) отображается без изменений.
  - Write property-based tests: для всех N (не полных квадратов) `validateAnswer` с `answer_type: 'number'` отклоняет `sqrt(N)` — это СОХРАНЯЕМОЕ поведение для `answer_type: 'number'` (не меняем этот тип).
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix: expression param ordering + irrational answer validation + hint LaTeX delimiters

  - [x] 3.1 Implement iterative `evaluateExpressionParams` in `src/lib/engine/variantGenerator.ts`
    - Заменить Pass 2 (однопроходный `for...of Object.entries`) на итеративный алгоритм
    - `remaining ← keys where parameters[key].type = 'expression'`
    - `maxPasses ← remaining.length + 1` — достаточно для любой цепочки зависимостей
    - В каждом проходе: для каждого ключа из `remaining` попытаться вычислить через `evaluateFormula(params[key].value, currentParams)`, если результат не `undefined`/`NaN` — сохранить и убрать из `remaining`
    - После `maxPasses` проходов: принудительно вычислить оставшиеся (циклические зависимости или ошибки)
    - Применить тот же алгоритм внутри constraint-retry цикла (Pass 2 вызывается при каждой retry-попытке)
    - _Bug_Condition: `isBugCondition_1(config)` — exists param P зависящий от Q, Q встречается позже в `Object.entries` порядке_
    - _Expected_Behavior: все expression-параметры имеют корректные ненулевые значения независимо от порядка ключей_
    - _Preservation: конфиги без зависимостей между expression-параметрами дают идентичный результат_
    - _Requirements: 2.1, 2.2, 3.5_

  - [x] 3.2 Add numeric fallback in `case 'expression'` in `src/lib/engine/answerValidator.ts`
    - В `case 'expression'`: перед вызовом `checkEquivalence` вычислить `vars ← extractVariables(processedUserAnswer + ' ' + processedExpectedAnswer)`
    - Если `vars.length === 0`: вычислить `userNum = math.evaluate(processedUserAnswer)` и `expectedNum = math.evaluate(processedExpectedAnswer)` (через try/catch)
    - Если оба конечны и `Math.abs(userNum - expectedNum) < 1e-9` → вернуть `true`
    - Иначе (есть переменные или числовое сравнение не прошло) → продолжить существующую логику `checkEquivalence`
    - _Bug_Condition: `isBugCondition_2(task, userAnswer)` — `answer_type = 'number'` + `Math.sqrt` в формуле + `sqrt(N)` в ответе_
    - _Expected_Behavior: `validateAnswer` возвращает `true` для `sqrt(N)` когда числовые значения совпадают с точностью `1e-9`_
    - _Preservation: путь через `checkEquivalence` для ответов с переменными не затронут_
    - _Requirements: 2.3, 3.3_

  - [x] 3.3 Add `answer_type: 'expression'` to irrational difficulty levels in `src/lib/templates/grade8/pythagoreanTheorem.ts`
    - `grade8-pythag-hypotenuse` difficulty 2 и 3: добавить `answer_type: 'expression'`
    - `grade8-pythag-leg` difficulty 2 и 3: добавить `answer_type: 'expression'`
    - `grade8-pythag-distance` difficulty 1, 2 и 3: добавить `answer_type: 'expression'` (все уровни могут давать иррациональный ответ)
    - Difficulty 1 для hypotenuse и leg (целый ответ) — НЕ трогать, оставить `answer_type: 'number'`
    - _Requirements: 2.4_

  - [x] 3.4 Wrap bare LaTeX in `$...$` in hint fields in `src/lib/templates/grade8/pythagoreanTheorem.ts`
    - `grade8-pythag-hypotenuse` d2: `'Гипотенуза = \\sqrt{a^2 + b^2}'` → `'Гипотенуза = $\\sqrt{a^2 + b^2}$'`
    - `grade8-pythag-leg` d2: `'b = \\sqrt{c^2 - a^2}'` → `'$b = \\sqrt{c^2 - a^2}$'`
    - `grade8-pythag-leg` d3: `'Второй катет = \\sqrt{гипотенуза^2 - катет^2}'` → `'Второй катет = $\\sqrt{\\text{гипотенуза}^2 - \\text{катет}^2}$'`
    - `grade8-pythag-distance` d1: `'Расстояние = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}'` → `'Расстояние = $\\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$'`
    - Hint без LaTeX (`'Гипотенуза² = катет₁² + катет₂²'`) — НЕ трогать
    - _Bug_Condition: `isBugCondition_3(hint)` — hint содержит LaTeX-команды без `$`-делимитеров_
    - _Expected_Behavior: MathText рендерит формулы через KaTeX вместо сырого текста_
    - _Requirements: 2.5_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Expression Param Ordering + Irrational Answer Acceptance
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - Run bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms all three bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Independent Params + Integer Answers + Symbolic Expressions + Plain Hints
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm: difficulty 1 integer Pythagoras answers still validated as `'number'`
    - Confirm: `checkEquivalence` path for symbolic answers with variables unchanged
    - Confirm: plain-text hints unchanged

- [x] 4. Checkpoint — Ensure all tests pass
  - Запустить полный набор тестов: `pnpm test --run`
  - Убедиться что все тесты из задач 1–3 проходят
  - Проверить интеграционный сценарий: `generateProblem(grade8-pythag-hypotenuse, difficulty=2)` → вычислить ответ в формате `sqrt(N)` → `validateAnswer` возвращает `true`
  - Проверить интеграционный сценарий: `generateProblem(grade6-fraction-property, difficulty=1)` → все параметры корректны, правильный ответ принимается
  - Если возникают вопросы — уточнить у пользователя
