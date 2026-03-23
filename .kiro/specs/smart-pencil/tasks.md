# Implementation Plan: Умный карандаш (Smart Pencil)

## Overview

Реализация нового инструмента рисования с автоматическим улучшением штриха (RDP + Bezier). Архитектурно повторяет `useFreehandTool`: изолированный хук + интеграция в Canvas + кнопка в тулбаре + панель свойств.

## Tasks

- [x] 1. Добавить `'smart-pencil'` в тип `AppMode`
  - В файле `src/lib/types.ts` добавить строковый литерал `'smart-pencil'` в union-тип `AppMode`
  - _Requirements: 5.1_

- [x] 2. Создать хук `useSmartPencilTool` с pipeline улучшения
  - Создать файл `src/components/canvas/tools/useSmartPencilTool.ts`
  - Объявить константы: `SMOOTHING_TENSION = 0.5`, `MIN_POINTS = 3`, `RDP_EPSILON = 3`, `MAX_POINTS = 2000`
  - Реализовать `rdpSimplify(points, epsilon)` — алгоритм Ramer–Douglas–Peucker, возвращает подмножество входных точек
  - Реализовать `bezierSmooth(points, tension)` — генерирует промежуточные точки для квадратичных кривых Безье, возвращает `{x,y}[]`
  - Реализовать `finalize()`: downsample если `> MAX_POINTS`, применить RDP + Bezier если `>= MIN_POINTS`, fallback если RDP вернул `< 2` точек, дублировать точку при tap (1 точка), сбросить состояние до `onAddObject`, вызвать `onAddObject(obj, true)` затем `publishState()`
  - Реализовать `onMouseDown`, `onMouseMove` (порог 2px), `onCancel` (abort без объекта)
  - Добавить `useEffect` на `mode` для abort при смене инструмента
  - Возвращаемый интерфейс идентичен `useFreehandTool`: `{ isDrawing, isDrawingRef, onMouseDown, onMouseMove, onMouseUp, onCancel, overlay }`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1–2.11, 3.1–3.7_

  - [ ]* 2.1 Property test: onMouseDown активирует рисование (P1)
    - **Property 1: onMouseDown активирует рисование**
    - Для любых `(x, y)` после `onMouseDown` → `isDrawing === true` и `overlay.points[0]` содержит `{x, y}`
    - **Validates: Requirements 1.4**

  - [ ]* 2.2 Property test: порог добавления точек 2px (P2)
    - **Property 2: Порог добавления точек 2px**
    - Точки с расстоянием ≤ 2px от предыдущей не добавляются в `pointsRef`
    - **Validates: Requirements 1.5**

  - [ ]* 2.3 Property test: Cancel не создаёт объект (P3)
    - **Property 3: Cancel не создаёт объект**
    - После `onCancel()`: `isDrawing === false`, `overlay === null`, `onAddObject` не вызван
    - **Validates: Requirements 1.6**

  - [ ]* 2.4 Property test: Abort при смене режима (P4)
    - **Property 4: Abort при смене режима**
    - При изменении `mode !== 'smart-pencil'` во время рисования → `isDrawing === false`
    - **Validates: Requirements 1.7**

  - [ ]* 2.5 Property test: RDP возвращает подмножество входных точек (P5)
    - **Property 5: RDP возвращает подмножество входных точек**
    - Каждая точка результата `rdpSimplify` присутствует во входном массиве
    - **Validates: Requirements 2.1**

  - [ ]* 2.6 Property test: Bezier возвращает `{x,y}[]` (P6)
    - **Property 6: Bezier_Smoother возвращает `{x,y}[]`**
    - Каждый элемент результата `bezierSmooth` имеет числовые поля `x` и `y`
    - **Validates: Requirements 2.2, 2.11**

  - [ ]* 2.7 Property test: Pipeline применяется по порогу MIN_POINTS (P7)
    - **Property 7: Pipeline применяется при достаточном числе точек**
    - При `length >= MIN_POINTS` — pipeline применяется; при `< MIN_POINTS` — исходные точки
    - **Validates: Requirements 2.3, 2.4**

  - [ ]* 2.8 Property test: Pipeline всегда возвращает >= 2 точек (P8)
    - **Property 8: Pipeline всегда возвращает >= 2 точек**
    - Для любых входных точек (включая коллинеарные) результат pipeline содержит `>= 2` точек
    - **Validates: Requirements 2.5, 2.8**

  - [ ]* 2.9 Property test: Downsample при превышении MAX_POINTS (P9)
    - **Property 9: Downsample при превышении MAX_POINTS**
    - При `length > MAX_POINTS` в RDP передаётся `<= MAX_POINTS` точек
    - **Validates: Requirements 2.10**

  - [ ]* 2.10 Property test: Созданный объект имеет `type === 'freehand'` (P10)
    - **Property 10: Созданный объект имеет type 'freehand'**
    - `onAddObject` вызывается с `obj.type === 'freehand'` и `data.points` — массив `{x,y}[]`
    - **Validates: Requirements 3.1**

  - [ ]* 2.11 Property test: skipSelection всегда true (P11)
    - **Property 11: skipSelection всегда true**
    - Второй аргумент `onAddObject` всегда равен `true`
    - **Validates: Requirements 3.2**

  - [ ]* 2.12 Property test: Bounding box >= 1 (P12)
    - **Property 12: Bounding box >= 1**
    - `obj.width >= 1 && obj.height >= 1` для любых точек
    - **Validates: Requirements 3.5**

  - [ ]* 2.13 Property test: Состояние сбрасывается до onAddObject (P13)
    - **Property 13: Состояние сбрасывается до onAddObject**
    - В момент вызова `onAddObject`: `isDrawing === false` и `overlay === null`
    - **Validates: Requirements 3.7**

- [x] 3. Checkpoint — убедиться, что хук компилируется без ошибок TypeScript
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Интегрировать `useSmartPencilTool` в `Canvas.tsx`
  - [x] 4.1 Импортировать и инициализировать хук в `Canvas.tsx`
    - Добавить `import { useSmartPencilTool } from './canvas/tools/useSmartPencilTool'`
    - Инициализировать: `const smartPencil = useSmartPencilTool({ penSettings, onAddObject, publishState, mode })`
    - _Requirements: 4.1_

  - [x] 4.2 Добавить обработку событий pointer в Canvas
    - В `handleCanvasPointerDown`: добавить блок `if (mode === 'smart-pencil') { smartPencil.onMouseDown(x, y); e.stopPropagation(); }`
    - В `handleCanvasPointerMove`: добавить блок `if (mode === 'smart-pencil' && smartPencil.isDrawingRef.current) { smartPencil.onMouseMove(x, y); }`
    - В `handleCanvasPointerUp` (или аналоге): добавить вызов `smartPencil.onMouseUp()` при `smartPencil.isDrawingRef.current`
    - В `handleCanvasPointerCancel`: добавить `smartPencil.onCancel()`
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 4.3 Добавить SVG overlay для smart-pencil
    - По аналогии с `freehand.overlay` добавить рендер `smartPencil.overlay` в SVG-разметку Canvas
    - Атрибуты: `strokeLinecap="round"`, `strokeLinejoin="round"`, `opacity={0.7}`
    - _Requirements: 4.6_

  - [x] 4.4 Заблокировать drag/resize и установить курсор
    - Добавить `'smart-pencil'` в список режимов в `handleObjectPointerDown` (ранний return)
    - Добавить `'smart-pencil'` в список режимов в `handleImageResizeStart` (ранний return)
    - Добавить `'smart-pencil'` в условие стиля курсора `crosshair`
    - _Requirements: 4.7, 4.8_

- [x] 5. Добавить кнопку в `ToolSidebar.tsx`
  - Добавить импорт `PencilLine` из `lucide-react`
  - Добавить в группу `'freehand'` инструмент: `{ id: 'smart-pencil', name: 'Умный карандаш', icon: PencilLine, mode: 'smart-pencil' }`
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6. Обновить `PropertiesPanel.tsx` и `App.tsx`
  - В `PropertiesPanel.tsx`: добавить `if (mode === 'smart-pencil') { return <PenSettingsPanel penSettings={penSettings} setPenSettings={setPenSettings} />; }` по аналогии с `'freehand'`
  - В `App.tsx`: добавить `'smart-pencil'` в массив режимов, при которых `PropertiesPanel` видима (условие рядом с `'freehand'`, `'highlighter'`, `'shape'`, `'text'`)
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 7. Final checkpoint — убедиться, что все тесты проходят и TypeScript не выдаёт ошибок
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Задачи с `*` — опциональные (property-based тесты), можно пропустить для быстрого MVP
- Библиотека для property-тестов: **fast-check**
- Каждый property-тест запускается минимум 100 итераций
- Тег в тестах: `// Feature: smart-pencil, Property N: <текст>`
- Smart Pencil создаёт объекты типа `'freehand'` — undo/redo работает автоматически через существующий `onAddObject`
