# Requirements Document

## Introduction

Расширение системы ввода математических выражений (MathInput) и движка проверки ответов (Answer Validator) до уровня 9–11 классов. Фича добавляет поддержку тригонометрических тождеств, логарифмов, модулей, объединений интервалов и проверку математической эквивалентности через eval-based стратегию. Расширяется `useMathInputLogic.ts`, `MathKeyboard.tsx` и вводится новый модуль `EquivalenceEngine`.

## Glossary

- **EquivalenceEngine**: Модуль, отвечающий за проверку математической эквивалентности двух выражений.
- **Parser**: Подсистема, преобразующая строку пользовательского ввода в нормализованное представление для KaTeX и MathJS.
- **Pretty_Printer**: Подсистема, преобразующая внутреннее представление выражения обратно в строку пользовательского ввода.
- **MathInput**: Компонент ввода математических выражений (`MathInputField.tsx` + `useMathInputLogic.ts`).
- **MathKeyboard**: Виртуальная клавиатура (`MathKeyboard.tsx`).
- **KaTeX_Expression**: Строка в формате LaTeX, пригодная для рендеринга через KaTeX.
- **MathJS_Expression**: Строка в формате, пригодном для вычисления через MathJS (`math.evaluate`, `math.simplify`).
- **Interval_Set**: Математическое множество, заданное объединением интервалов, например `(-∞; -2] ∪ [2; +∞)`.
- **Trig_Identity**: Тригонометрическое тождество, например `sin²(x) + cos²(x) = 1`.
- **Eval_Strategy**: Стратегия проверки эквивалентности путём вычисления обоих выражений на наборе случайных точек.

---

## Requirements

### Requirement 1: Equivalence Engine — базовая эквивалентность

**User Story:** As a teacher, I want the system to recognize mathematically equivalent answers, so that students are not penalized for valid alternative forms.

#### Acceptance Criteria

1. WHEN два выражения переданы в EquivalenceEngine, THE EquivalenceEngine SHALL вернуть `true`, если выражения математически эквивалентны, и `false` в противном случае.
2. WHEN EquivalenceEngine применяет Eval_Strategy, THE EquivalenceEngine SHALL вычислять оба выражения не менее чем на 7 случайных точках из диапазона `[-10, 10]` и считать выражения эквивалентными, если абсолютная разность результатов не превышает `1e-9` на каждой точке.
3. WHEN оба выражения содержат только константы (без переменных), THE EquivalenceEngine SHALL сравнивать их численно с точностью `1e-9`.
4. IF вычисление выражения на заданной точке приводит к `NaN` или `Infinity`, THEN THE EquivalenceEngine SHALL пропустить эту точку и использовать следующую из расширенного набора.
5. IF все точки дают `NaN` или `Infinity`, THEN THE EquivalenceEngine SHALL вернуть `false` и записать предупреждение в лог.

---

### Requirement 2: Equivalence Engine — тригонометрические тождества

**User Story:** As a student, I want to enter `sin²(x) + cos²(x)` and have it accepted as equivalent to `1`, so that I can express answers in natural trigonometric form.

#### Acceptance Criteria

1. WHEN пользователь вводит выражение, содержащее тригонометрические функции, THE EquivalenceEngine SHALL применять Eval_Strategy для проверки эквивалентности.
2. THE EquivalenceEngine SHALL распознавать `sin²(x)` как `(sin(x))^2` при передаче в MathJS.
3. THE EquivalenceEngine SHALL распознавать `cos²(x)`, `tan²(x)`, `sin²(x)` как `(trig(x))^2` при передаче в MathJS.
4. WHEN проверяется эквивалентность `sin²(x) + cos²(x)` и `1`, THE EquivalenceEngine SHALL вернуть `true`.
5. WHEN проверяется эквивалентность `sqrt(2)/2` и `1/sqrt(2)`, THE EquivalenceEngine SHALL вернуть `true`.

---

### Requirement 3: Equivalence Engine — алгебраическая эквивалентность

**User Story:** As a student, I want to enter `(x-2)(x+3)` and have it accepted as equivalent to `x²+x-6`, so that I can answer without expanding brackets.

#### Acceptance Criteria

1. WHEN проверяется эквивалентность двух алгебраических выражений с одной переменной, THE EquivalenceEngine SHALL применять Eval_Strategy с не менее чем 7 точками.
2. WHEN проверяется эквивалентность `x+y` и `y+x`, THE EquivalenceEngine SHALL вернуть `true` (коммутативность).
3. WHEN проверяется эквивалентность `(x-2)*(x+3)` и `x^2+x-6`, THE EquivalenceEngine SHALL вернуть `true`.
4. WHEN проверяется эквивалентность `(x+y)+z` и `x+(y+z)`, THE EquivalenceEngine SHALL вернуть `true` (ассоциативность).

---

### Requirement 4: Парсинг логарифмов

**User Story:** As a student, I want to type `log_2(8)`, `ln(x)`, `lg(x)` in the input field, so that I can express logarithmic answers naturally.

#### Acceptance Criteria

1. WHEN пользователь вводит `log_a(b)`, THE Parser SHALL преобразовывать это в `\log_{a}(b)` для KaTeX_Expression и в `log(b, a)` для MathJS_Expression.
2. WHEN пользователь вводит `ln(x)`, THE Parser SHALL преобразовывать это в `\ln(x)` для KaTeX_Expression и в `log(x)` для MathJS_Expression.
3. WHEN пользователь вводит `lg(x)`, THE Parser SHALL преобразовывать это в `\lg(x)` для KaTeX_Expression и в `log(x, 10)` для MathJS_Expression.
4. THE Pretty_Printer SHALL форматировать `log(b, a)` обратно в `log_a(b)` (round-trip property).
5. FOR ALL валидных логарифмических выражений, парсинг затем Pretty_Printer затем парсинг SHALL производить эквивалентный объект (round-trip property).
6. IF пользователь вводит `log_()` или `log_(b)` без основания, THEN THE Parser SHALL возвращать описательную ошибку валидации, не вызывая исключения.

---

### Requirement 5: Парсинг модулей

**User Story:** As a student, I want to type `|x|` or `|x+1|` and see it rendered correctly, so that I can express absolute value answers.

#### Acceptance Criteria

1. WHEN пользователь вводит `|expr|`, THE Parser SHALL преобразовывать это в `\left|expr\right|` для KaTeX_Expression и в `abs(expr)` для MathJS_Expression.
2. THE Pretty_Printer SHALL форматировать `abs(expr)` обратно в `|expr|`.
3. FOR ALL валидных выражений с модулем, парсинг затем Pretty_Printer затем парсинг SHALL производить эквивалентный объект (round-trip property).
4. IF пользователь вводит `||` (пустой модуль), THEN THE Parser SHALL отображать `\left|\square\right|` как визуальный плейсхолдер.
5. WHEN выражение содержит вложенные модули `||x|-1|`, THE Parser SHALL корректно определять границы внешнего и внутреннего модуля.

---

### Requirement 6: Парсинг тригонометрических функций (расширенный)

**User Story:** As a student, I want to type `arcsin(x)`, `arccos(x)`, `sin^2(x)` and have them parsed correctly, so that I can express inverse trig and squared trig answers.

#### Acceptance Criteria

1. WHEN пользователь вводит `arcsin(x)`, THE Parser SHALL преобразовывать это в `\arcsin(x)` для KaTeX_Expression и в `asin(x)` для MathJS_Expression.
2. WHEN пользователь вводит `arccos(x)`, THE Parser SHALL преобразовывать это в `\arccos(x)` для KaTeX_Expression и в `acos(x)` для MathJS_Expression.
3. WHEN пользователь вводит `arctan(x)`, THE Parser SHALL преобразовывать это в `\arctan(x)` для KaTeX_Expression и в `atan(x)` для MathJS_Expression.
4. WHEN пользователь вводит `sin^2(x)`, THE Parser SHALL преобразовывать это в `\sin^{2}(x)` для KaTeX_Expression и в `(sin(x))^2` для MathJS_Expression.
5. THE Pretty_Printer SHALL форматировать `asin(x)` обратно в `arcsin(x)`.
6. FOR ALL валидных тригонометрических выражений, парсинг затем Pretty_Printer затем парсинг SHALL производить эквивалентный объект (round-trip property).

---

### Requirement 7: Парсинг интервалов и множеств

**User Story:** As a student, I want to type interval unions like `(-inf; -2] U [2; +inf)`, so that I can express domain and solution set answers.

#### Acceptance Criteria

1. WHEN пользователь вводит интервал вида `(a; b)`, `[a; b]`, `(a; b]`, `[a; b)`, THE Parser SHALL распознавать его как Interval_Set.
2. WHEN пользователь вводит `(-inf; -2] U [2; +inf)`, THE Parser SHALL преобразовывать это в `(-\infty;\,-2]\cup[2;\,+\infty)` для KaTeX_Expression.
3. WHEN пользователь вводит `inf` или `+inf`, THE Parser SHALL преобразовывать это в `\infty` для KaTeX_Expression.
4. WHEN пользователь вводит `-inf`, THE Parser SHALL преобразовывать это в `-\infty` для KaTeX_Expression.
5. WHEN два Interval_Set переданы в EquivalenceEngine, THE EquivalenceEngine SHALL сравнивать их как множества (проверка принадлежности контрольных точек).
6. THE Pretty_Printer SHALL форматировать Interval_Set обратно в строку вида `(-inf; -2] U [2; +inf)`.
7. FOR ALL валидных Interval_Set, парсинг затем Pretty_Printer затем парсинг SHALL производить эквивалентный объект (round-trip property).
8. IF пользователь вводит интервал с незакрытой скобкой, THEN THE Parser SHALL возвращать описательную ошибку, не вызывая исключения.

---

### Requirement 8: Расширение MathKeyboard

**User Story:** As a student, I want to see buttons for logarithms, absolute value, union (∪), infinity (∞), and inverse trig on the virtual keyboard, so that I can enter advanced expressions without a physical keyboard.

#### Acceptance Criteria

1. THE MathKeyboard SHALL содержать кнопки: `log`, `ln`, `lg`, `|x|`, `arcsin`, `arccos`, `arctan`, `∪`, `∈`, `∞`.
2. WHEN пользователь нажимает кнопку `log` на MathKeyboard, THE MathInput SHALL вставлять токен `log_()` с курсором внутри основания.
3. WHEN пользователь нажимает кнопку `|x|` на MathKeyboard, THE MathInput SHALL вставлять токен `||` с курсором внутри.
4. WHEN пользователь нажимает кнопку `∞` на MathKeyboard, THE MathInput SHALL вставлять токен `inf`.
5. WHEN пользователь нажимает кнопку `∪` на MathKeyboard, THE MathInput SHALL вставлять токен ` U `.
6. THE MathKeyboard SHALL отображать новые кнопки в отдельной строке или вкладке, не нарушая существующий layout.

---

### Requirement 9: Расширение normalizeMathExpression

**User Story:** As a developer, I want `normalizeMathExpression` to handle all new token types, so that the KaTeX preview renders correctly for 9–11 grade expressions.

#### Acceptance Criteria

1. THE Parser SHALL обрабатывать токены `log_a(b)`, `ln(x)`, `lg(x)`, `|expr|`, `arcsin(x)`, `arccos(x)`, `arctan(x)`, `sin^2(x)`, `inf`, `U` в функции `normalizeMathExpression`.
2. WHEN `normalizeMathExpression` получает строку с несколькими новыми токенами, THE Parser SHALL обрабатывать их все за один проход без потери данных.
3. THE Parser SHALL сохранять обратную совместимость: все существующие токены (`sqrt`, `pi`, `\frac`, `^n`) SHALL обрабатываться без изменений.
4. WHEN `normalizeMathExpression` получает пустую строку, THE Parser SHALL возвращать пустую строку.

---

### Requirement 10: Устойчивость к невалидному вводу

**User Story:** As a developer, I want the Parser and EquivalenceEngine to handle invalid input gracefully, so that the application does not crash on malformed expressions.

#### Acceptance Criteria

1. IF пользователь вводит незакрытые скобки (например, `sin(`), THEN THE Parser SHALL возвращать частично нормализованное выражение или описательную ошибку, не вызывая исключения.
2. IF пользователь вводит пустой логарифм (например, `log_()`), THEN THE Parser SHALL возвращать визуальный плейсхолдер `\log_{\square}(\square)`, не вызывая исключения.
3. IF EquivalenceEngine получает синтаксически некорректное выражение, THEN THE EquivalenceEngine SHALL возвращать `false` и записывать ошибку в лог, не вызывая исключения.
4. THE Parser SHALL корректно обрабатывать произвольные строки длиной до 500 символов без падения (property: для любого ввода длиной ≤ 500 символов `normalizeMathExpression` не бросает исключение).
5. THE EquivalenceEngine SHALL корректно обрабатывать произвольные пары строк длиной до 500 символов без падения (property: для любой пары входных строк `checkEquivalence` не бросает исключение).
