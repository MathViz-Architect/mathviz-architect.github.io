# Design Document: Properties Panel Visual Controls

## Overview

Заменяем текстовые контролы (hex-поля и number-инпуты) в панели свойств на визуальные компоненты:
- `ColorPalette` — сетка круглых кнопок с пресетными цветами
- `StrokeWidthSlider` — ползунок толщины линии с числовым индикатором

Оба компонента переиспользуются во всех шести компонентах свойств. Изменения применяются мгновенно (без кнопки «Сохранить»), что критично для скорости работы на уроке.

## Architecture

Изменения затрагивают только слой UI — компоненты `PropertiesPanel`. Логика обновления объектов (`onUpdate` → `publishLocalChange`) остаётся неизменной.

```
PropertiesPanel/
  ColorPalette.tsx        ← новый компонент (заменяет ColorPicker)
  StrokeWidthSlider.tsx   ← новый компонент
  ShapeProperties.tsx     ← использует ColorPalette + StrokeWidthSlider
  GeoSegmentProperties.tsx
  GeoShapeProperties.tsx
  LineProperties.tsx
  ArrowProperties.tsx
  GeoAngleProperties.tsx  ← только ColorPalette (нет strokeWidth)
  ColorPicker.tsx         ← оставляем для обратной совместимости (не удаляем)
```

Поток данных не меняется:

```
User click → onChange prop → handleUpdateData → onUpdate({ data: { ...existing, key: value } }) → publishLocalChange
```

## Components and Interfaces

### ColorPalette

```tsx
interface ColorPaletteProps {
  label?: string;
  value: string;           // текущий hex или 'transparent'
  onChange: (value: string) => void;
  allowTransparent?: boolean; // default: true
  disabled?: boolean;
}
```

Пресеты (в порядке отображения):

```ts
const PRESET_COLORS = [
  'transparent',
  '#000000', '#374151',
  '#EF4444', '#3B82F6',
  '#10B981', '#F59E0B',
  '#8B5CF6',
];
```

Компоновка: `grid grid-cols-4 gap-2` — 4 колонки × 2 ряда. При добавлении новых цветов сетка расширяется вниз, не растягивая панель по горизонтали.

Каждая кнопка: `w-6 h-6 rounded-full` (24×24 px). Активная кнопка: `ring-2 ring-offset-1 ring-indigo-500`. Transparent-свотч: белый фон + красная диагональная линия (SVG или CSS `::after`).

### StrokeWidthSlider

```tsx
interface StrokeWidthSliderProps {
  label?: string;
  value: number;           // 1–10
  onChange: (value: number) => void;
  disabled?: boolean;
}
```

Рендер: `input[type="range"]` с `min=1 max=10 step=1` + числовой индикатор справа. Значения вне диапазона зажимаются к границам через `Math.max(1, Math.min(10, value))`.

### Обновлённые компоненты свойств

Все шесть компонентов заменяют:
- `<ColorPicker label="..." value={...} onChange={...} />` → `<ColorPalette label="..." value={...} onChange={...} />`
- `<input type="number" ...>` для strokeWidth → `<StrokeWidthSlider value={...} onChange={...} />`

Для `stroke`-полей передаётся `allowTransparent={false}`.

Локализованные метки:
| Свойство | Метка |
|---|---|
| fill | Заливка |
| stroke | Цвет контура |
| strokeWidth | Толщина |
| color (geo-объекты) | Цвет |

## Data Models

Модели данных объектов не меняются. Компоненты читают и пишут те же поля:

```ts
// Фигуры (rectangle, circle, triangle, polygon, geoshape)
{ fill: string; stroke: string; strokeWidth: number }

// Линии/стрелки (line, arrow)
{ color: string; strokeWidth: number }

// Гео-объекты (geosegment, geoangle)
{ color: string; strokeWidth?: number }
```

`onUpdate` вызывается с паттерном:
```ts
onUpdate({ data: { ...object.data, [key]: value } })
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Каждый пресет рендерится как кнопка

*For any* цвета из массива `PRESET_COLORS`, компонент `ColorPalette` должен рендерить кнопку с CSS-классами `w-6 h-6 rounded-full` для каждого из них.

**Validates: Requirements 1.2**

### Property 2: Клик по пресету вызывает onChange с этим цветом

*For any* цвета из `PRESET_COLORS`, клик по соответствующей кнопке должен вызывать `onChange` ровно с этим значением цвета.

**Validates: Requirements 1.4**

### Property 3: Active swatch выделяется при совпадении value

*For any* значения `value`, совпадающего с одним из `PRESET_COLORS`, соответствующая кнопка должна содержать классы `ring-2 ring-offset-1 ring-indigo-500`, и только она одна.

**Validates: Requirements 1.5, 4.4**

### Property 4: Нет active swatch при несовпадении value

*For any* значения `value`, не входящего в `PRESET_COLORS`, ни одна кнопка не должна содержать ring-классы.

**Validates: Requirements 1.7**

### Property 5: Ползунок отображает текущее значение

*For any* числового значения `value` в диапазоне [1, 10], компонент `StrokeWidthSlider` должен рендерить текстовый индикатор, содержащий это число.

**Validates: Requirements 2.3**

### Property 6: Изменение контрола вызывает onUpdate с корректной структурой

*For any* объекта с полями `data` и любого нового значения цвета или толщины, вызов `onChange` в `ColorPalette` или `StrokeWidthSlider` должен приводить к вызову `onUpdate` с объектом вида `{ data: { ...existingData, [key]: newValue } }`, сохраняя все остальные поля `data` нетронутыми.

**Validates: Requirements 1.4, 2.4, 5.1**

### Property 7: allowTransparent управляет видимостью Transparent_Swatch

*For any* рендера `ColorPalette` с `allowTransparent={false}`, кнопка для значения `'transparent'` не должна присутствовать в DOM. При `allowTransparent={true}` (или по умолчанию) — должна присутствовать.

**Validates: Requirements 5.3**

### Property 8: Контролы disabled при locked объекте

*For any* объекта с `locked: true`, все интерактивные элементы (`button`, `input`) в `ColorPalette` и `StrokeWidthSlider` должны иметь атрибут `disabled`.

**Validates: Requirements 5.4**

### Property 9: Все типы объектов рендерят нужные контролы

*For any* объекта типа из множества `{rectangle, circle, triangle, polygon, geoshape, geosegment, geoangle, line, arrow}`, соответствующий компонент свойств должен рендерить `ColorPalette`. Для типов `{rectangle, circle, triangle, polygon, geosegment, line, arrow}` — также `StrokeWidthSlider`.

**Validates: Requirements 4.1, 4.2, 4.3**

## Error Handling

| Ситуация | Поведение |
|---|---|
| `strokeWidth` вне [1, 10] | `Math.max(1, Math.min(10, value))` — зажимаем к границе, без ошибки |
| `value` цвета не в PRESET_COLORS | Ни одна кнопка не активна; значение передаётся в `onChange` как есть при клике |
| `value` = `undefined` / `null` | Компонент использует fallback (`'transparent'` для fill, `'#374151'` для stroke) |
| Объект `locked` | Все контролы `disabled`, `onChange` не вызывается |

## Testing Strategy

### Unit-тесты (примеры и edge-cases)

Фокус на конкретных сценариях:

- `ColorPalette` рендерит ровно 8 кнопок (7 цветов + transparent)
- `ColorPalette` с `allowTransparent={false}` рендерит 7 кнопок
- Transparent-свотч содержит визуальный индикатор (красная линия)
- Контейнер `ColorPalette` имеет классы `grid grid-cols-4 gap-2`
- `StrokeWidthSlider` рендерит `input[type="range"]` с `min=1 max=10 step=1`
- Метки локализованы: "Заливка", "Цвет контура", "Толщина", "Цвет"
- `strokeWidth=0` → ползунок показывает `1`; `strokeWidth=15` → показывает `10`

### Property-based тесты

Используем **fast-check** (уже в экосистеме TypeScript/Vite). Минимум 100 итераций на тест.

Каждый тест помечается комментарием:
```
// Feature: properties-panel-visual-controls, Property N: <text>
```

| Тест | Property | Генератор |
|---|---|---|
| Каждый пресет рендерится как кнопка | Property 1 | `fc.constantFrom(...PRESET_COLORS)` |
| Клик вызывает onChange с правильным цветом | Property 2 | `fc.constantFrom(...PRESET_COLORS)` |
| Active swatch при совпадении value | Property 3 | `fc.constantFrom(...PRESET_COLORS)` |
| Нет active swatch при несовпадении | Property 4 | `fc.string().filter(s => !PRESET_COLORS.includes(s))` |
| Ползунок показывает текущее значение | Property 5 | `fc.integer({ min: 1, max: 10 })` |
| onUpdate сохраняет остальные поля data | Property 6 | `fc.record({ fill: fc.string(), stroke: fc.string(), strokeWidth: fc.integer() })` |
| allowTransparent управляет свотчем | Property 7 | `fc.boolean()` |
| disabled при locked | Property 8 | произвольный объект с `locked: true` |
| Все типы рендерят нужные контролы | Property 9 | `fc.constantFrom(...OBJECT_TYPES)` |

Каждый property-тест реализуется одним тестом с `fc.assert(fc.property(...))`.
