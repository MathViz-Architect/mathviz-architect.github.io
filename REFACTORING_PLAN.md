# Refactoring Plan — MathViz Architect

## Phase 1: Safety Fixes (Завершено)

- [x] `answerValidator.ts` — удалён опасный `parseFloat` fallback в `default:` ветке (`validateAnswer` теперь возвращает `false` вместо случайного совпадения)
- [x] `supabaseClient.ts` — добавлен guard на env-переменные (бросает ошибку при старте, если `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` не заданы)
- [x] `Canvas.tsx` — все 9 вхождений `obj_${Date.now()}` заменены на `generateId()` (детерминированные ID, нет коллизий при быстром создании)
- [x] `variantGenerator.ts` — удалён TRACE debug-блок с тремя `console.log`

## Phase 2: Normalization Pipeline (В процессе)

- [x] PR-1: Исправление `processAbs` и `normalizeOperators`
  - `processAbs`: добавлен look-ahead для разрешения `||` амбигвитета (`|x||y|` → два отдельных abs)
  - `normalizeOperators`: lookbehind `(?<![{0-9\\])` предотвращает порчу `x^{1n}`, `\log_{10}`, `10x`
- [x] PR-2: Расширение `protectLatex` — поддержка команд без скобок
  - Regex `(\{[^{}]*\})+` → `(\{[^{}]*\})*` (скобки опциональны)
  - Теперь `\cdot`, `\le`, `\pi`, `\infty`, `\left`, `\right` защищаются плейсхолдером до остальных стадий
- [ ] PR-3: Маркер идемпотентности — предотвращение повторной нормализации
  - Добавить проверку в начало `normalizeMathExpression`: если строка уже нормализована — вернуть как есть
- [x] PR-3: Маркер идемпотентности — предотвращение повторной нормализации
  - `NORM_MARKER = '__NORM_v1__:'` — прозрачный строковый префикс
  - `isNormalized`, `markNormalized`, `stripMarker` — экспортированные утилиты
  - `normalizeMathExpression`: early return если маркер присутствует (идемпотентность)
  - `katexAdapter.ts` — единая точка входа в KaTeX, снимает маркер перед рендером
  - `MathText.tsx`, `MathInputField.tsx`, `PreviewDisplay.tsx` — переведены на `renderKatex`
  - `katex.renderToString` вызывается только в `katexAdapter.ts`
- [x] PR-4: Выделение `mathJsAdapter.ts` — изоляция внешней зависимости MathJS
  - Создан `src/lib/math/mathJsAdapter.ts` с `evaluateMath` и `isValidMathExpression`
  - `equivalence.ts`, `answerValidator.ts`, `useMathInputLogic.ts` — переведены на адаптер
  - `import * as math from 'mathjs'` / `import { evaluate } from 'mathjs'` удалены из всех файлов кроме адаптера
- [x] PR-5: Устранение двойной нормализации и унификация pipeline
  - `PreviewDisplay.tsx` — удалён лишний `normalizeMathExpression`, теперь только `renderKatex(value)`
  - `variantGenerator.ts` / `normalizeMathFragments` — добавлен `stripMarker` после нормализации (маркер не утекает в `$$...$$` шаблоны)
  - `normalizeMathExpression` вызывается только внутри `katexAdapter.ts` (граница рендера)
  - UI не знает о формате строки — передаёт raw, `renderKatex` делает всё остальное

## Phase 3: Canvas Decomposition

- [ ] PR-7 — PR-10: Декомпозиция `Canvas.tsx`
  - Разделение логики рендеринга, стейта и событий
  - `Canvas.tsx` (~1500 строк) → отдельные хуки и компоненты по зонам ответственности

## Phase 4: Geometry & Interaction (Завершено)

- [x] PR-6: Advanced Snapping & Geometry Core
  - `SnapKind = 'point' | 'intersection' | 'midpoint' | 'on-path'` — типизированный результат привязки
  - `SnapResult` расширен полями `kind` и `sourceIds: string[]` (id сегментов-источников)
  - `getSnapPoint` — четыре уровня приоритетов; bounding-box фильтр перед O(n²) перебором пар для пересечений
  - `getPointSegmentProjection(P, A, B)` — проекция точки на отрезок, `t ∈ [0,1]`
  - `getSegmentIntersection(A, B, C, D)` — Крамер, `null` при параллельных/невзаимных отрезках
  - 11 новых тестов в `geometry.test.ts` (edge cases: параллельные, коллинеарные, вырожденные, T-shape miss)
  - Canvas: клик в режиме `on-path/midpoint/intersection` создаёт `geopoint` в snap-координатах
  - Canvas shortcuts: refs-based keyboard listener — стабильная подписка без gap между remove/add
  - Canvas resize: `resizeStartPosRef` + rAF throttling — плавный resize без re-render на каждый `pointermove`
