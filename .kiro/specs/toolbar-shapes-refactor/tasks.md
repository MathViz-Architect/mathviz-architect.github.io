# Implementation Plan: toolbar-shapes-refactor

## Overview

Рефакторинг двух компонентов: `ToolSidebar.tsx` и `Canvas.tsx`. Задачи сгруппированы по компонентам и идут от изолированных изменений к интеграции.

## Tasks

- [x] 1. Исправить создание фигур в Canvas.tsx — прозрачная заливка
  - [x] 1.1 Извлечь логику создания объекта-фигуры в чистую функцию `createShapeObject`
    - В `Canvas.tsx` найти блок `if (isDrawingShape && shapeDrawStart && shapeDrawEnd)` в `handleCanvasPointerUp`
    - Вынести `switch (shapeType)` в отдельную функцию `createShapeObject(shapeType, sx, sy, w, h): AnyCanvasObject`
    - Функция должна быть экспортируемой (для тестирования)
    - Для всех типов (`rectangle`, `circle`, `triangle`, `polygon`, `trapezoid`, `rhombus`, `parallelogram`) установить `data.fill: 'transparent'`, `data.stroke: '#374151'`, `data.strokeWidth: 2`
    - Для `geoshape-*` типов оставить без изменений (у них нет `fill`)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.2 Написать property-тест для `createShapeObject`
    - **Property 1: Прозрачная заливка и корректные стили для всех фигур**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
    - Использовать `fast-check` с `fc.constantFrom('rectangle', 'circle', 'triangle', 'polygon', 'trapezoid', 'rhombus', 'parallelogram')`
    - Проверить: `obj.data.fill === 'transparent'`, `obj.data.stroke === '#374151'`, `obj.data.strokeWidth === 2`
    - Минимум 100 итераций (`numRuns: 100`)
    - Файл: `src/components/Canvas.shapes.test.ts`

- [x] 2. Рефакторинг ShapePopup в ToolSidebar.tsx — grid-layout
  - [x] 2.1 Заменить popup для группы `shapes` на grid-сетку
    - В блоке рендеринга popup (`openGroupId === group.id && group.tools.length > 1`) добавить ветку для `group.id === 'shapes'`
    - Для группы `shapes` рендерить `<div>` с `style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', width: '120px' }}`
    - Каждая кнопка: `className="p-2 rounded-lg flex items-center justify-center transition-all ..."`, только иконка (`<tool.icon size={18} />`), без текста
    - Добавить `title={tool.name}` на каждую кнопку (tooltip)
    - Активное состояние через `isActiveShape(tool)`: `bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400`
    - Функция `isActiveShape`: `mode === 'shape' && shapeToolToType[tool.id] === shapeType`
    - Для остальных групп popup остаётся прежним (список с текстом)
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.2 Написать unit-тесты для конфигурации TOOL_GROUPS и ShapePopup
    - Проверить: группа `shapes` содержит ровно 9 инструментов
    - Проверить: ни один инструмент в `shapes` не содержит "Закрашенный" / "Filled" в имени
    - Проверить: `shapeToolToType` содержит ровно 9 ключей
    - Файл: `src/components/ToolSidebar.shapes.test.tsx`

  - [ ]* 2.3 Написать property-тест для title-атрибутов кнопок ShapePopup
    - **Property 2: Каждая кнопка фигуры имеет title-атрибут равный имени фигуры**
    - **Validates: Requirements 3.3**
    - Использовать `fast-check` с `fc.constantFrom(...tools)` по инструментам группы `shapes`
    - Рендерить ShapePopup и проверять `getByTitle(tool.name)` для каждого инструмента
    - Минимум 100 итераций (`numRuns: 100`)
    - Файл: `src/components/ToolSidebar.shapes.test.tsx`

- [x] 3. Добавить прокрутку к ToolSidebar
  - [x] 3.1 Обновить `wrapperClasses` в `ToolSidebar.tsx`
    - Добавить `h-full` и `overflow-y-auto` к строке `wrapperClasses`
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 3.2 Написать unit-тест для CSS-классов ToolSidebar
    - Проверить: `wrapperClasses` содержит `overflow-y-auto`
    - Проверить: `wrapperClasses` содержит `h-full`
    - Файл: `src/components/ToolSidebar.shapes.test.tsx`

- [x] 4. Checkpoint — убедиться, что все тесты проходят
  - Запустить `vitest --run` и убедиться, что все тесты зелёные
  - Проверить вручную: создать фигуру на холсте → `data.fill` должен быть `'transparent'`
  - Проверить вручную: открыть popup фигур → кнопки отображаются в сетке 3×3, иконки центрированы через `flex items-center justify-center`
  - Проверить вручную: при наведении на кнопку фигуры появляется tooltip с именем фигуры
  - Проверить вручную: боковая панель прокручивается на маленьком экране

## Notes

- Задачи с `*` опциональны и могут быть пропущены для быстрого MVP
- `createShapeObject` должна быть экспортируемой функцией для изолированного тестирования
- `strokeWidth: 2` должен проверяться в property-тесте (Property 1)
- Иконки в grid-кнопках центрируются через `flex items-center justify-center`
- Property-тесты используют `fast-check`, unit-тесты — `vitest` + `@testing-library/react`
