# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - answer_type, constraints и LaTeX-интерполяция
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Scoped PBT Approach**: Scope to concrete failing cases — конкретные уровни и поля с багами
  - Test 1: `grade8-pythag-hypotenuse` уровень 1 — проверить `difficulties[1].answer_type === 'expression'` (упадёт: undefined)
  - Test 2: `grade8-pythag-hypotenuse` уровень 1 — проверить, что constraints содержит проверку на целую гипотенузу (упадёт: только `a !== b`)
  - Test 3: Проверить, что a=5, b=8 отклоняется constraint уровня 1 (упадёт: constraint допускает √89)
  - Test 4: Проверить, что все строки `solution` с `\sqrt{expr}` используют двойные скобки `\sqrt{{expr}}` во всех затронутых шаблонах (упадёт: одинарные скобки)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bugs exist)
  - Document counterexamples: `answer_type` is `undefined`, constraint допускает a=5 b=8, строки содержат `\sqrt{a*a + b*b}` вместо `\sqrt{{a*a + b*b}}`
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Уровни 2-4 гипотенузы, шаблон check, leg уровень 1 constraint
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `grade8-pythag-hypotenuse` уровни 2, 3, 4 имеют `answer_type: 'expression'` и корректные constraints
  - Observe: `grade8-pythag-check` уровни 1, 2 — `answer_formula` и `solution` не содержат `\sqrt`
  - Observe: `grade8-pythag-leg` уровень 1 — constraint `Math.sqrt(c*c - a*a) === Math.floor(...)` уже присутствует
  - Observe: `grade8-pythag-distance` уровень 2 — `\sqrt{{...}}` уже корректен
  - Write property-based test: для всех уровней, не попадающих под isBugCondition, поля `answer_type`, `constraints`, `solution`, `hint`, `answer_formula` идентичны оригиналу
  - Verify test passes on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix pythagoreanTheorem.ts — 8 точечных правок

  - [x] 3.1 Fix 1 — grade8-pythag-hypotenuse уровень 1: добавить answer_type и constraint на целую гипотенузу
    - Добавить `answer_type: 'expression'` после `answer_formula`
    - Расширить `constraints` с `['a !== b']` до `['a !== b', 'Math.sqrt(a*a + b*b) === Math.floor(Math.sqrt(a*a + b*b))']`
    - _Bug_Condition: isBugCondition('grade8-pythag-hypotenuse', 1, 'answer_type') = true_
    - _Bug_Condition: isBugCondition('grade8-pythag-hypotenuse', 1, 'constraints') = true_
    - _Expected_Behavior: difficulties[1].answer_type === 'expression' AND constraints содержит проверку на целую гипотенузу_
    - _Preservation: уровни 2, 3, 4 не затронуты_
    - _Requirements: 2.1, 2.3_

  - [x] 3.2 Fix 2 — grade8-pythag-hypotenuse уровень 1: исправить интерполяцию в solution
    - Заменить `'c = $\\sqrt{a*a + b*b}$'` на `'c = $\\sqrt{{a*a + b*b}}$'`
    - _Bug_Condition: isBugCondition('grade8-pythag-hypotenuse', 1, 'solution') = true_
    - _Expected_Behavior: строка solution содержит двойные фигурные скобки вокруг выражения_
    - _Requirements: 2.2_

  - [x] 3.3 Fix 3 — grade8-pythag-hypotenuse уровень 2: исправить интерполяцию в solution
    - Заменить `'c = $\\sqrt{a*a + b*b}$'` на `'c = $\\sqrt{{a*a + b*b}}$'`
    - _Bug_Condition: isBugCondition('grade8-pythag-hypotenuse', 2, 'solution') = true_
    - _Requirements: 2.2_

  - [x] 3.4 Fix 4 — grade8-pythag-hypotenuse уровень 3: исправить интерполяцию в solution
    - Заменить `'$\\sqrt{a*a + b*b}$'` (второй `\sqrt`) на `'$\\sqrt{{a*a + b*b}}$'`
    - Первый `$\\sqrt{{a}^2 + {b}^2}$` уже корректен — не трогать
    - _Bug_Condition: isBugCondition('grade8-pythag-hypotenuse', 3, 'solution') = true_
    - _Requirements: 2.2_

  - [x] 3.5 Fix 5 — grade8-pythag-leg уровень 1: исправить интерполяцию в solution
    - Заменить `'b = $\\sqrt{c*c - a*a}$'` на `'b = $\\sqrt{{c*c - a*a}}$'`
    - _Bug_Condition: isBugCondition('grade8-pythag-leg', 1, 'solution') = true_
    - _Requirements: 2.5_

  - [x] 3.6 Fix 6 — grade8-pythag-leg уровень 2: исправить интерполяцию в solution
    - Заменить `'b = $\\sqrt{c*c - a*a}$'` на `'b = $\\sqrt{{c*c - a*a}}$'`
    - _Bug_Condition: isBugCondition('grade8-pythag-leg', 2, 'solution') = true_
    - _Requirements: 2.5_

  - [x] 3.7 Fix 7 — grade8-pythag-leg уровень 3: исправить интерполяцию в solution
    - Заменить финальный `'$\\sqrt{c*c - a*a}$'` на `'$\\sqrt{{c*c - a*a}}$'`
    - Первый `$\\sqrt{{c}^2 - {a}^2}$` уже корректен — не трогать
    - _Bug_Condition: isBugCondition('grade8-pythag-leg', 3, 'solution') = true_
    - _Requirements: 2.5_

  - [x] 3.8 Fix 8 — grade8-pythag-distance уровень 1: исправить интерполяцию в solution
    - Заменить финальный `'$\\sqrt{(x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1)}$'` на `'$\\sqrt{{(x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1)}}$'`
    - `({x2 - x1})` и `({y2 - y1})` в первой части строки корректны — не трогать
    - _Bug_Condition: isBugCondition('grade8-pythag-distance', 1, 'solution') = true_
    - _Preservation: grade8-pythag-distance уровень 2 уже использует двойные скобки — не трогать_
    - _Requirements: 2.5_

  - [x] 3.9 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - answer_type, constraints и LaTeX-интерполяция
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms all 8 bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 3.10 Verify preservation tests still pass
    - **Property 2: Preservation** - Уровни 2-4 гипотенузы, шаблон check, leg уровень 1 constraint
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
