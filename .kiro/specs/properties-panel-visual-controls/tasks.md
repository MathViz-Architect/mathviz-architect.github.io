# Implementation Plan: Properties Panel Visual Controls

## Overview

Реализуем визуальные контролы для панели свойств: компонент `ColorPalette` (сетка пресетных цветов) и `StrokeWidthSlider` (ползунок толщины). Затем подключаем их поочерёдно в каждый компонент свойств — по одному типу объекта за раз, чтобы можно было проверять работоспособность изолированно.

## Tasks

- [x] 1. Создать базовые компоненты ColorPalette и StrokeWidthSlider
  - [x] 1.1 Создать `src/components/PropertiesPanel/ColorPalette.tsx`
    - Реализовать интерфейс `ColorPaletteProps` с пропсами `value`, `onChange`, `label?`, `allowTransparent?`, `disabled?`
    - Определить константу `PRESET_COLORS` в порядке из дизайна
    - Компоновка контейнера: `grid grid-cols-4 gap-2`
    - Каждая кнопка: `w-6 h-6 rounded-full`, активная — `ring-2 ring-offset-1 ring-indigo-500`
    - Transparent-свотч: белый фон + красная диагональная линия через CSS или SVG
    - При `allowTransparent={false}` не рендерить кнопку `'transparent'`
    - При `disabled` — атрибут `disabled` на всех кнопках
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.2, 5.3, 5.4_

  - [ ]* 1.2 Написать property-тест для ColorPalette (Properties 1–4, 7, 8)
    - **Property 1: Каждый пресет рендерится как кнопка** — `fc.constantFrom(...PRESET_COLORS)`
    - **Property 2: Клик по пресету вызывает onChange с этим цветом** — `fc.constantFrom(...PRESET_COLORS)`
    - **Property 3: Active swatch выделяется при совпадении value** — `fc.constantFrom(...PRESET_COLORS)`
    - **Property 4: Нет active swatch при несовпадении value** — `fc.string().filter(s => !PRESET_COLORS.includes(s))`
    - **Property 7: allowTransparent управляет видимостью Transparent_Swatch** — `fc.boolean()`
    - **Property 8: Контролы disabled при locked объекте** — объект с `locked: true`
    - Файл: `src/components/PropertiesPanel/ColorPalette.test.tsx`
    - _Requirements: 1.2, 1.4, 1.5, 1.7, 5.3, 5.4_

  - [x] 1.3 Создать `src/components/PropertiesPanel/StrokeWidthSlider.tsx`
    - Реализовать интерфейс `StrokeWidthSliderProps` с пропсами `value`, `onChange`, `label?`, `disabled?`
    - Рендерить `input[type="range"]` с `min=1 max=10 step=1`
    - Числовой индикатор текущего значения рядом с ползунком
    - Зажимать значения вне [1, 10] через `Math.max(1, Math.min(10, value))`
    - При `disabled` — атрибут `disabled` на `input`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.2, 5.4_

  - [ ]* 1.4 Написать property-тест для StrokeWidthSlider (Properties 5, 8)
    - **Property 5: Ползунок отображает текущее значение** — `fc.integer({ min: 1, max: 10 })`
    - **Property 8: Контролы disabled при locked объекте** — объект с `locked: true`
    - Файл: `src/components/PropertiesPanel/StrokeWidthSlider.test.tsx`
    - _Requirements: 2.3, 5.4_

- [x] 2. Checkpoint — базовые компоненты
  - Убедиться, что `ColorPalette` и `StrokeWidthSlider` рендерятся без ошибок изолированно. Спросить пользователя, если есть вопросы.

- [x] 3. Подключить контролы в ShapeProperties (фигуры: rectangle, circle, triangle, polygon)
  - [x] 3.1 Обновить `src/components/PropertiesPanel/ShapeProperties.tsx`
    - Заменить `<ColorPicker>` на `<ColorPalette>` для полей `fill` (с `allowTransparent`) и `stroke` (с `allowTransparent={false}`)
    - Заменить `input[type="number"]` для `strokeWidth` на `<StrokeWidthSlider>`
    - Обновить метки: "Заливка", "Цвет контура", "Толщина"
    - Сохранить паттерн `onUpdate({ data: { ...object.data, [key]: value } })`
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1_

  - [ ]* 3.2 Написать property-тест для ShapeProperties (Property 6, 9)
    - **Property 6: onUpdate сохраняет остальные поля data** — `fc.record({ fill: fc.string(), stroke: fc.string(), strokeWidth: fc.integer() })`
    - **Property 9: Все типы объектов рендерят нужные контролы** — `fc.constantFrom('rectangle', 'circle', 'triangle', 'polygon')`
    - Файл: `src/components/PropertiesPanel/ShapeProperties.test.tsx`
    - _Requirements: 4.1, 4.2, 4.3, 5.1_

- [x] 4. Checkpoint — фигуры
  - Проверить, что ShapeProperties корректно работает для rectangle, circle, triangle, polygon. Спросить пользователя, если есть вопросы.

- [x] 5. Подключить контролы в LineProperties и ArrowProperties (линии и стрелки)
  - [x] 5.1 Обновить `src/components/PropertiesPanel/LineProperties.tsx`
    - Заменить `<ColorPicker>` на `<ColorPalette>` для поля `color` (с `allowTransparent={false}`)
    - Заменить `input[type="number"]` для `strokeWidth` на `<StrokeWidthSlider>`
    - Обновить метки: "Цвет", "Толщина"
    - Сохранить паттерн `onUpdate`
    - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.3, 5.1_

  - [x] 5.2 Обновить `src/components/PropertiesPanel/ArrowProperties.tsx`
    - Аналогично LineProperties: `<ColorPalette allowTransparent={false}>` + `<StrokeWidthSlider>`
    - Обновить метки: "Цвет", "Толщина"
    - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.3, 5.1_

  - [ ]* 5.3 Написать property-тест для LineProperties и ArrowProperties (Property 9)
    - **Property 9: Все типы объектов рендерят нужные контролы** — `fc.constantFrom('line', 'arrow')`
    - Файл: `src/components/PropertiesPanel/LineArrowProperties.test.tsx`
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Checkpoint — линии и стрелки
  - Проверить, что LineProperties и ArrowProperties корректно работают. Спросить пользователя, если есть вопросы.

- [x] 7. Подключить контролы в GeoSegmentProperties (геометрические отрезки)
  - [x] 7.1 Обновить `src/components/PropertiesPanel/GeoSegmentProperties.tsx`
    - Заменить `<ColorPicker>` на `<ColorPalette>` для поля `color` (с `allowTransparent={false}`)
    - Заменить `input[type="number"]` для `strokeWidth` на `<StrokeWidthSlider>`
    - Обновить метки: "Цвет", "Толщина"
    - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.3, 5.1_

  - [ ]* 7.2 Написать property-тест для GeoSegmentProperties (Property 9)
    - **Property 9: Все типы объектов рендерят нужные контролы** — `fc.constantFrom('geosegment')`
    - Файл: `src/components/PropertiesPanel/GeoSegmentProperties.test.tsx`
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 8. Подключить контролы в GeoShapeProperties и GeoAngleProperties (геометрические фигуры и углы)
  - [x] 8.1 Обновить `src/components/PropertiesPanel/GeoShapeProperties.tsx`
    - Заменить `<ColorPicker>` на `<ColorPalette>` для полей `fill` и `stroke`
    - Заменить `input[type="number"]` для `strokeWidth` на `<StrokeWidthSlider>`
    - Обновить метки: "Заливка", "Цвет контура", "Толщина"
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1_

  - [x] 8.2 Обновить `src/components/PropertiesPanel/GeoAngleProperties.tsx`
    - Заменить `<ColorPicker>` на `<ColorPalette>` для поля `color` (только цвет, без strokeWidth)
    - Обновить метку: "Цвет"
    - _Requirements: 3.4, 4.1, 5.1_

  - [ ]* 8.3 Написать property-тест для GeoShapeProperties и GeoAngleProperties (Property 9)
    - **Property 9: Все типы объектов рендерят нужные контролы** — `fc.constantFrom('geoshape', 'geoangle')`
    - Файл: `src/components/PropertiesPanel/GeoShapeAngleProperties.test.tsx`
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 9. Финальный checkpoint
  - Убедиться, что все тесты проходят, `ColorPicker.tsx` не удалён (обратная совместимость). Спросить пользователя, если есть вопросы.

## Notes

- Задачи, помеченные `*`, опциональны и могут быть пропущены для быстрого MVP
- `ColorPicker.tsx` не удаляется — оставляем для обратной совместимости
- Каждая группа (3–4, 5–6, 7, 8) самодостаточна для изолированного тестирования
- Property-тесты используют fast-check с минимум 100 итерациями
- Каждый property-тест помечается комментарием: `// Feature: properties-panel-visual-controls, Property N: <text>`
