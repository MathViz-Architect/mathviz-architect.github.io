# Implementation Plan: Shape Tool Expansion

## Overview

Расширение инструмента фигур тремя новыми полигонами (трапеция, ромб, параллелограмм) через минимальные хирургические изменения в четырёх файлах: `EditorContext.tsx`, `Canvas.tsx`, `ToolSidebar.tsx`. Дополнительно: исправление ввода стилуса и диагностический лог.

## Tasks

- [x] 1. Расширить тип ShapeType в EditorContext
  - В `src/contexts/EditorContext.tsx` добавить `'trapezoid' | 'rhombus' | 'parallelogram'` в тип `shapeType` в интерфейсе `EditorContextValue` (строка с `shapeType:`) и в `useState` (инициализация)
  - Оба места должны содержать одинаковый расширенный union-тип
  - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 1.1 Написать property-тест для ShapeType
    - **Property 5: ShapeType принимает новые литералы без ошибок**
    - **Validates: Requirements 1.1, 1.2, 1.3**
    - Проверить, что `setShapeType('trapezoid')`, `setShapeType('rhombus')`, `setShapeType('parallelogram')` не вызывают TypeScript-ошибок (статическая проверка через `fc.constantFrom`)

- [x] 2. Добавить создание объектов новых фигур в Canvas.tsx
  - В `src/components/Canvas.tsx`, в `handleCanvasPointerUp`, в `switch (shapeType)` добавить три новых `case` перед `default`:
    - `case 'trapezoid'`: polygon с points `[{x:0.2,y:0},{x:0.8,y:0},{x:1,y:1},{x:0,y:1}]`
    - `case 'rhombus'`: polygon с points `[{x:0.5,y:0},{x:1,y:0.5},{x:0.5,y:1},{x:0,y:0.5}]`
    - `case 'parallelogram'`: polygon с points `[{x:0.25,y:0},{x:1,y:0},{x:0.75,y:1},{x:0,y:1}]`
  - Каждый объект: `type: 'polygon'`, `fill: '#F59E0B'`, `stroke: '#D97706'`, `strokeWidth: 2`
  - После создания вызывать `onAddObject(newShape); onSelectObject(newShape.id)` — аналогично существующему `polygon`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.1 Написать property-тест: round trip через тип (Property 2)
    - **Property 2: Создание фигуры — round trip через тип**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Извлечь логику создания объекта в чистую функцию `createShapeObject(shapeType, sx, sy, w, h)` и протестировать через `fc.assert` с `fc.constantFrom('trapezoid','rhombus','parallelogram')` и `fc.integer({min:6,max:500})`

  - [ ]* 2.2 Написать property-тест: нормализованные точки корректны (Property 1)
    - **Property 1: Нормализованные точки новых фигур корректны**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Для каждого shapeType проверить, что все точки `data.points` имеют `x ∈ [0,1]` и `y ∈ [0,1]`

  - [ ]* 2.3 Написать property-тест: стиль совпадает с пятиугольником (Property 4)
    - **Property 4: Стиль новых фигур совпадает с пятиугольником**
    - **Validates: Requirements 2.4**
    - Проверить `data.fill === '#F59E0B'`, `data.stroke === '#D97706'`, `data.strokeWidth === 2` для всех трёх shapeType

- [x] 3. Добавить SVG-превью новых фигур в Canvas.tsx
  - В `src/components/Canvas.tsx`, в inline IIFE рендера превью (`isDrawingShape && shapeDrawStart && shapeDrawEnd`), добавить три ветки перед `return <rect .../>`:
    - `trapezoid`: `[[x+w*0.2,y],[x+w*0.8,y],[x+w,y+h],[x,y+h]]`
    - `rhombus`: `[[x+w*0.5,y],[x+w,y+h*0.5],[x+w*0.5,y+h],[x,y+h*0.5]]`
    - `parallelogram`: `[[x+w*0.25,y],[x+w,y],[x+w*0.75,y+h],[x,y+h]]`
  - Применять те же стили `p` (`fill: rgba(79,70,229,0.08)`, `stroke: #4F46E5`, `strokeDasharray: '6,3'`, `pointerEvents: 'none'`)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.1 Написать property-тест: превью соответствует финальной фигуре (Property 3)
    - **Property 3: Превью соответствует финальной фигуре**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Извлечь `computePreviewPoints(shapeType, x, y, w, h)` и проверить, что точки превью совпадают с `SHAPE_POINTS[shapeType].map(p => ({x: x+p.x*w, y: y+p.y*h}))`

- [x] 4. Checkpoint — убедиться, что тесты проходят
  - Убедиться, что все тесты проходят, спросить пользователя если возникнут вопросы.

- [x] 5. Исправить обработку ввода стилуса и добавить диагностический лог в Canvas.tsx
  - В `src/components/Canvas.tsx`, в `handleCanvasPointerDown`, заменить проверку `isDrawingInput` на:
    ```ts
    const isDrawingInput =
      (e.pointerType === 'pen') ||
      (e.pointerType === 'touch') ||
      (e.pointerType === 'mouse' && e.button === 0);
    ```
  - Добавить в самое начало `handleCanvasPointerDown` (до любых проверок):
    ```ts
    console.log('[Pointer Debug]', e.pointerType, e.button, e.pressure);
    ```
  - Убедиться, что `pen` проверяется первым и без условия на `e.button` — стилус рисует даже при `button === -1`
  - _Requirements: (stylus fix — дополнительное требование пользователя)_

- [x] 6. Добавить кнопки новых фигур в ToolSidebar с кастомными SVG-иконками
  - В `src/components/ToolSidebar.tsx`:
    - Создать три кастомных SVG-иконки как React-компоненты (или inline SVG в `icon`-поле) для трапеции, ромба и параллелограмма — визуально отличимые друг от друга и от прямоугольника
    - Добавить в `TOOL_GROUPS`, в группу `'shapes'`, три новых `ToolDef`:
      ```ts
      { id: 'shape-trapezoid',     name: 'Трапеция',       icon: TrapezoidIcon,     mode: 'shape' },
      { id: 'shape-rhombus',       name: 'Ромб',            icon: RhombusIcon,       mode: 'shape' },
      { id: 'shape-parallelogram', name: 'Параллелограмм',  icon: ParallelogramIcon, mode: 'shape' },
      ```
    - Добавить в `shapeToolToType`:
      ```ts
      'shape-trapezoid':     'trapezoid',
      'shape-rhombus':       'rhombus',
      'shape-parallelogram': 'parallelogram',
      ```
  - Названия кнопок на русском: «Трапеция», «Ромб», «Параллелограмм»
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 6.1 Написать property-тест: кнопки toolbar вызывают правильный shapeType (Property 6)
    - **Property 6: Кнопки toolbar вызывают правильный shapeType**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    - Проверить, что `shapeToolToType['shape-trapezoid'] === 'trapezoid'` и т.д. для всех трёх кнопок

- [x] 7. Верифицировать кнопку «Очистить доску» в TopBar
  - Проверить `src/components/TopBar.tsx` строки 125–130: кнопка должна быть видима только при `roomState.role === 'teacher'`, вызывать `clearBoard()` + `publishLocalChange(getCanvasSnapshot())`, иметь иконку `Trash2`
  - Если кнопка отсутствует — добавить согласно требованиям 5.1–5.5
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8. Финальный checkpoint — убедиться, что все тесты проходят
  - Убедиться, что все тесты проходят, спросить пользователя если возникнут вопросы.

## Notes

- Задачи с `*` опциональны и могут быть пропущены для быстрого MVP
- Каждая задача ссылается на конкретные требования для трассируемости
- Property-тесты используют `fast-check` (уже в стеке через Vitest)
- Кастомные SVG-иконки для трапеции/ромба/параллелограмма обязательны — `Pentagon` не подходит визуально
- Диагностический `console.log('[Pointer Debug]', ...)` временный — удалить перед релизом
