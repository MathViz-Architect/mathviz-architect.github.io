# Requirements Document

## Introduction

Инструмент «Умный карандаш» (Smart Pencil) — новый режим рисования на Canvas, который в реальном времени собирает точки штриха, а после завершения (pointerup) автоматически применяет pipeline улучшения: упрощение точек алгоритмом Ramer–Douglas–Peucker (RDP) и сглаживание квадратичными кривыми Безье. Результат сохраняется как стандартный `FreehandPathObject`, полностью совместимый с undo/redo, коллаборацией и панелью свойств.

Инструмент архитектурно повторяет `useFreehandTool` и `useHighlighterTool`, не нарушает существующий lifecycle Canvas и не добавляет новых зависимостей.

## Glossary

- **Smart_Pencil**: Новый инструмент рисования с автоматическим улучшением штриха после завершения.
- **Canvas**: Компонент `src/components/Canvas.tsx`, управляющий всеми инструментами рисования.
- **Stroke**: Последовательность точек `{x, y}`, собранных между `pointerdown` и `pointerup`.
- **Overlay**: Временный SVG-путь, отображаемый во время рисования до финализации.
- **RDP_Simplifier**: Функция упрощения точек по алгоритму Ramer–Douglas–Peucker.
- **Bezier_Smoother**: Функция сглаживания точек через квадратичные кривые Безье.
- **FreehandPathObject**: Существующий тип объекта Canvas (`type: 'freehand'`) с полями `data.points`, `data.color`, `data.width`.
- **AppMode**: Тип `'select' | 'freehand' | 'highlighter' | ...` из `src/lib/types.ts`, определяющий активный инструмент.
- **PenSettingsPanel**: Существующий компонент панели свойств для настройки цвета и толщины пера.
- **Tool_Hook**: React-хук, инкапсулирующий логику инструмента (аналог `useFreehandTool`).
- **SMOOTHING_TENSION**: Константа коэффициента сглаживания (0–1), управляющая степенью скругления кривых.
- **MIN_POINTS**: Константа минимального числа точек, ниже которого pipeline улучшения не применяется.

---

## Requirements

### Requirement 1: Хук инструмента Smart Pencil

**User Story:** Как разработчик, я хочу иметь изолированный хук `useSmartPencilTool`, чтобы логика инструмента не смешивалась с Canvas и была легко тестируемой.

#### Acceptance Criteria

1. THE Smart_Pencil SHALL быть реализован в файле `src/components/canvas/tools/useSmartPencilTool.ts` в виде React-хука, экспортирующего `{ isDrawing, isDrawingRef, onMouseDown, onMouseMove, onMouseUp, onCancel, overlay }`.
2. THE Smart_Pencil SHALL использовать `isDrawingRef` (тип `React.MutableRefObject<boolean>`) как авторитетный флаг состояния рисования, не подверженный устареванию в колбэках.
3. THE Smart_Pencil SHALL использовать `pointsRef` (тип `React.MutableRefObject<{x:number;y:number}[]>`) для накопления точек штриха без перерендеров.
4. WHEN `onMouseDown(x, y)` вызывается, THE Smart_Pencil SHALL установить `isDrawingRef.current = true`, инициализировать `pointsRef.current` первой точкой и обновить `overlay`.
5. WHEN `onMouseMove(x, y)` вызывается и расстояние от последней точки превышает 2px, THE Smart_Pencil SHALL добавить точку в `pointsRef.current` и обновить `overlay`.
6. WHEN `onCancel()` вызывается, THE Smart_Pencil SHALL сбросить `isDrawingRef.current`, очистить `pointsRef.current` и установить `overlay` в `null` без создания объекта.
7. WHILE `mode !== 'smart-pencil'` и `isDrawingRef.current === true`, THE Smart_Pencil SHALL вызвать `abort()` для отмены незавершённого штриха.

---

### Requirement 2: Pipeline улучшения штриха

**User Story:** Как пользователь, я хочу, чтобы нарисованная линия автоматически сглаживалась после завершения штриха, чтобы рукописные линии выглядели аккуратнее.

#### Acceptance Criteria

1. THE RDP_Simplifier SHALL принимать массив точек и параметр `epsilon` (порог отклонения в пикселях) и возвращать упрощённый массив точек, сохраняющий форму кривой.
2. THE Bezier_Smoother SHALL быть реализован как алгоритм Chaikin corner-cutting (или moving average): на каждой итерации каждый сегмент заменяется двумя точками на 25% и 75% от его длины. Функция принимает массив точек и параметр `tension` (SMOOTHING_TENSION) и возвращает новый массив `{x: number; y: number}[]`. НЕ использовать вычисление контрольных точек настоящих кривых Безье.
3. WHEN `finalize()` вызывается и `pointsRef.current.length >= MIN_POINTS`, THE Smart_Pencil SHALL последовательно применить `RDP_Simplifier`, затем `Bezier_Smoother` к собранным точкам.
4. WHEN `finalize()` вызывается и `pointsRef.current.length < MIN_POINTS`, THE Smart_Pencil SHALL использовать исходные точки без применения pipeline улучшения.
5. IF `RDP_Simplifier` возвращает менее 2 точек, THEN THE Smart_Pencil SHALL использовать первую и последнюю точки исходного массива для формирования минимального валидного пути.
6. THE Smart_Pencil SHALL определять `SMOOTHING_TENSION` как именованную константу со значением по умолчанию `0.5`.
7. THE Smart_Pencil SHALL определять `MIN_POINTS` как именованную константу со значением по умолчанию `3`.
8. FOR ALL наборов точек, результат применения pipeline улучшения SHALL содержать не менее 2 точек.
9. THE Smart_Pencil SHALL определять `RDP_EPSILON` как именованную константу со значением по умолчанию `3` (пикселей) — порог отклонения для алгоритма RDP.
10. THE Smart_Pencil SHALL определять `MAX_POINTS` как именованную константу со значением по умолчанию `2000`. WHEN `pointsRef.current.length > MAX_POINTS` перед применением pipeline, THE Smart_Pencil SHALL выполнить равномерный downsample по формуле `step = Math.ceil(length / MAX_POINTS)`, `points.filter((_, i) => i % step === 0)`, с обязательным включением последней точки для сохранения конца штриха.
11. THE Bezier_Smoother SHALL возвращать массив точек `{x: number; y: number}[]` (НЕ SVG path-команды строкой), чтобы результат оставался совместимым с существующим рендерером `FreehandPathObject`.
12. WHEN суммарная длина штриха (сумма расстояний между соседними точками) меньше 2px, THE Smart_Pencil SHALL трактовать штрих как точку (dot): дублировать единственную точку без применения pipeline.

---

### Requirement 3: Финализация и создание объекта

**User Story:** Как пользователь, я хочу, чтобы после завершения штриха на Canvas появлялся улучшенный путь, корректно интегрированный с undo/redo и коллаборацией.

#### Acceptance Criteria

1. WHEN `finalize()` вызывается и `pointsRef.current.length >= 1`, THE Smart_Pencil SHALL создать объект типа `FreehandPathObject` с `type: 'freehand'` и улучшенными точками.
2. THE Smart_Pencil SHALL вызвать `onAddObject(newPath, true)` с флагом `skipSelection: true`, чтобы панель свойств инструмента оставалась видимой после каждого штриха.
3. THE Smart_Pencil SHALL вызвать `publishState()` после `onAddObject` для синхронизации с коллаборацией через Yjs.
4. WHEN `finalize()` вызывается и `pointsRef.current.length === 1`, THE Smart_Pencil SHALL дублировать единственную точку для формирования валидного 2-точечного сегмента (отображается как точка благодаря `strokeLinecap="round"`).
5. THE Smart_Pencil SHALL вычислять `x`, `y`, `width`, `height` объекта из bounding box улучшенных точек с минимальным значением `width` и `height` равным `1`.
6. THE Smart_Pencil SHALL использовать `crypto.randomUUID()` для генерации уникального `id` объекта.
7. WHEN `finalize()` вызывается, THE Smart_Pencil SHALL сбросить `isDrawingRef.current = false`, очистить `pointsRef.current` и установить `overlay` в `null` до вызова `onAddObject`.

---

### Requirement 4: Интеграция в Canvas

**User Story:** Как разработчик, я хочу, чтобы Smart Pencil был подключён к Canvas по тому же паттерну, что и `useFreehandTool` и `useHighlighterTool`, без нарушения существующих инструментов.

#### Acceptance Criteria

1. THE Canvas SHALL инициализировать `useSmartPencilTool` с параметрами `{ penSettings, onAddObject, publishState, mode }` аналогично `useFreehandTool`.
2. WHEN `mode === 'smart-pencil'` и происходит `pointerdown`, THE Canvas SHALL вызвать `smartPencil.onMouseDown(x, y)` и остановить всплытие события.
3. WHEN `mode === 'smart-pencil'` и `smartPencil.isDrawingRef.current === true` и происходит `pointermove`, THE Canvas SHALL вызвать `smartPencil.onMouseMove(x, y)`.
4. WHEN `smartPencil.isDrawingRef.current === true` и происходит `pointerup`, THE Canvas SHALL вызвать `smartPencil.onMouseUp()`.
5. WHEN происходит `pointercancel`, THE Canvas SHALL вызвать `smartPencil.onCancel()`.
6. WHEN `mode === 'smart-pencil'` и `smartPencil.overlay` не равен `null`, THE Canvas SHALL отображать overlay-путь с теми же SVG-атрибутами, что и `freehand.overlay` (`strokeLinecap="round"`, `strokeLinejoin="round"`, `opacity={0.7}`).
7. THE Canvas SHALL добавить `'smart-pencil'` в список режимов, при которых `handleObjectPointerDown` и `handleImageResizeStart` возвращают управление без действия.
8. THE Canvas SHALL добавить `'smart-pencil'` в список режимов для стиля курсора `crosshair`.

---

### Requirement 5: Тип AppMode

**User Story:** Как разработчик, я хочу, чтобы `'smart-pencil'` был добавлен в тип `AppMode`, чтобы TypeScript обеспечивал типобезопасность во всём приложении.

#### Acceptance Criteria

1. THE Smart_Pencil SHALL добавить строковый литерал `'smart-pencil'` в тип `AppMode` в файле `src/lib/types.ts`.
2. THE Smart_Pencil SHALL НЕ добавлять новый тип объекта Canvas — созданные объекты используют существующий тип `'freehand'`.

---

### Requirement 6: Кнопка в панели инструментов

**User Story:** Как пользователь, я хочу видеть кнопку «Умный карандаш» в левой панели рядом с обычным карандашом, чтобы легко переключаться между инструментами.

#### Acceptance Criteria

1. THE Smart_Pencil SHALL добавить инструмент `{ id: 'smart-pencil', name: 'Умный карандаш', icon: PencilLine, mode: 'smart-pencil' }` в группу `'freehand'` массива `TOOL_GROUPS` в `ToolSidebar.tsx`.
2. THE Smart_Pencil SHALL использовать иконку `PencilLine` из `lucide-react` для визуального отличия от обычного карандаша (`Pencil`).
3. WHEN `mode === 'smart-pencil'`, THE ToolSidebar SHALL отображать кнопку инструмента с активным стилем `bg-indigo-100 text-indigo-600`.
4. THE Smart_Pencil SHALL отображать tooltip `'Умный карандаш'` при наведении на кнопку инструмента.

---

### Requirement 7: Панель свойств

**User Story:** Как пользователь, я хочу настраивать цвет и толщину умного карандаша через существующую панель свойств, чтобы не изучать новый интерфейс.

#### Acceptance Criteria

1. WHEN `mode === 'smart-pencil'`, THE PropertiesPanel SHALL отображать `PenSettingsPanel` с теми же `penSettings` и `setPenSettings`, что и для режима `'freehand'`.
2. THE Smart_Pencil SHALL НЕ добавлять новых компонентов панели свойств.
3. WHEN `mode === 'smart-pencil'`, THE App SHALL отображать `PropertiesPanel` (условие в `App.tsx` должно включать `'smart-pencil'` в список режимов, при которых панель видима).

---

### Requirement 8: Корректность undo/redo

**User Story:** Как пользователь, я хочу, чтобы undo/redo работал корректно для штрихов умного карандаша, как и для обычного карандаша.

#### Acceptance Criteria

1. WHEN пользователь вызывает undo после завершения штриха Smart Pencil, THE Canvas SHALL удалить последний добавленный `FreehandPathObject` из истории.
2. WHEN пользователь вызывает redo после undo, THE Canvas SHALL восстановить удалённый `FreehandPathObject`.
3. THE Smart_Pencil SHALL использовать существующий механизм `onAddObject` без обхода истории команд, чтобы undo/redo работал автоматически.
