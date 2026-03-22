# Implementation Plan: geometric-shapes-expansion

## Overview

Минимальное изменение: расширить тип `shapeType` в `EditorContext.tsx`, добавив три новых значения.
`Canvas.tsx`, `ObjectRenderer.tsx` и `ToolSidebar.tsx` уже содержат полную реализацию — требуется только верификация.
После этого написать property-based тесты с fast-check для Properties 1, 2, 4, 9.

## Tasks

- [x] 1. Расширить тип shapeType в EditorContext.tsx
  - В интерфейсе `EditorContextValue` добавить `'trapezoid' | 'rhombus' | 'parallelogram'` к объединению типов `shapeType`
  - В `useState<EditorContextValue['shapeType']>` убедиться, что тип выводится из интерфейса (изменений не требуется, если тип выводится автоматически)
  - _Requirements: 1.1, 1.2_

  - [ ]* 1.1 Проверить компиляцию TypeScript после изменения
    - Убедиться, что `tsc --noEmit` не выдаёт ошибок, связанных с `shapeType`
    - _Requirements: 1.3_

- [x] 2. Верифицировать Canvas.tsx — создание объектов и preview overlay
  - Убедиться, что `switch`-ветки `'trapezoid'`, `'rhombus'`, `'parallelogram'` в `handleCanvasPointerUp` создают `Polygon_Object` с корректными нормализованными вершинами
  - Убедиться, что preview overlay для трёх фигур отображается в JSX с правильными стилями (`fill: 'rgba(79,70,229,0.08)'`, `stroke: '#4F46E5'`, `strokeDasharray: '6,3'`)
  - Убедиться, что проверка `if (w > 5 && h > 5)` присутствует для всех трёх фигур
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4_

- [x] 3. Верифицировать ObjectRenderer.tsx — рендеринг polygon
  - Убедиться, что ветка `case 'polygon'` вычисляет `pts` по формуле `px = vertex.x * obj.width + x`, `py = vertex.y * obj.height + y`
  - Убедиться, что `fill`, `stroke`, `strokeWidth`, `opacity` применяются корректно
  - Убедиться, что selection ring (`SEL`) отображается при `isSelected = true`
  - Убедиться, что `dragDelta` применяется к `x` и `y` перед вычислением вершин
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Верифицировать ToolSidebar.tsx — иконки и маппинг
  - Убедиться, что `TrapezoidIcon`, `RhombusIcon`, `ParallelogramIcon` используют `strokeWidth="2"` и `vectorEffect="non-scaling-stroke"` (или эквивалент)
  - Убедиться, что `shapeToolToType` содержит маппинг для `'shape-trapezoid'`, `'shape-rhombus'`, `'shape-parallelogram'`
  - Убедиться, что клик по кнопке вызывает `setShapeType` с правильным значением и `setMode('shape')`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 5. Написать property-based тесты с fast-check
  - Создать файл `src/components/Canvas.geometric-shapes.test.ts`
  - Вынести вспомогательные функции `createShapeObject`, `tryCreateShapeObject`, `computePolygonPoints` из логики Canvas для тестирования
  - Определить константу `EXPECTED_POINTS` с эталонными вершинами для трёх фигур

  - [ ]* 5.1 Property 1: нормализованные вершины соответствуют shapeType
    - **Property 1: Normalized vertices match shapeType**
    - Для любого `shapeType` из `{'trapezoid', 'rhombus', 'parallelogram'}` и `w > 5`, `h > 5` — созданный объект имеет `type: 'polygon'` и `data.points` совпадают с эталоном
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 5.2 Property 2: объект не создаётся при малой области
    - **Property 2: No object created for small areas**
    - Для любого `shapeType` из новых фигур и `w ≤ 5` или `h ≤ 5` — объект не добавляется
    - **Validates: Requirements 2.4**

  - [ ]* 5.3 Property 4: формула вычисления SVG points
    - **Property 4: SVG points formula correctness**
    - Для произвольных `x`, `y`, `width`, `height` и нормализованных вершин — `computePolygonPoints` возвращает строку, вычисленную по формуле `px = vertex.x * width + x`
    - **Validates: Requirements 3.1**

  - [ ]* 5.4 Property 9: applyDelta не изменяет data.points
    - **Property 9: applyDelta preserves data.points**
    - Для любого `Polygon_Object` и произвольного `(dx, dy)` — `data.points` после `applyDelta` идентичны исходным
    - **Validates: Requirements 6.3**

- [x] 6. Финальная проверка — все тесты проходят
  - Убедиться, что все тесты проходят, задать вопросы пользователю при необходимости.

## Notes

- Задачи с `*` опциональны и могут быть пропущены для быстрого MVP
- Единственный файл с реальными изменениями кода — `EditorContext.tsx` (задача 1)
- Задачи 2–4 — верификация существующей реализации без изменений кода
- Property-тесты используют fast-check; каждый тест помечается комментарием `// Feature: geometric-shapes-expansion, Property N`
