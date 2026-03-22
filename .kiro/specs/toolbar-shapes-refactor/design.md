# Design Document: toolbar-shapes-refactor

## Overview

Рефакторинг затрагивает два компонента: `ToolSidebar.tsx` и `Canvas.tsx`. Цель — убрать цветную заливку у всех создаваемых фигур (заменить на `transparent`), переработать popup выбора фигур в компактную сетку 3×3 с иконками и тултипами, и добавить `overflow-y-auto` к боковой панели.

Изменения минимальны и локализованы: не затрагивают типы данных, контекст, логику рендеринга или другие инструменты.

## Architecture

```mermaid
graph TD
    ToolSidebar -->|setShapeType| EditorContext
    ToolSidebar -->|setMode('shape')| EditorContext
    EditorContext -->|shapeType| Canvas
    Canvas -->|onAddObject| EditorContext
    EditorContext -->|objects| AppState

    subgraph "Изменяемые части"
        ToolSidebar
        Canvas
    end

    subgraph "Без изменений"
        EditorContext
        AppState
        ObjectRenderer
    end
```

Поток данных не меняется. Меняется только:
1. Как `ToolSidebar` рендерит popup для группы "Фигуры" (grid вместо list).
2. Какие значения `fill`/`stroke` `Canvas` записывает в `data` при создании фигуры.

## Components and Interfaces

### ToolSidebar — ShapePopup

Текущий popup рендерит список `<button>` с иконкой и текстом (`flex-col gap-1 min-w-[130px]`). После рефакторинга для группы `shapes` popup рендерит сетку:

```tsx
// Только для group.id === 'shapes'
<div className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50"
     style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', width: '120px' }}>
  {group.tools.map((tool) => (
    <button
      key={tool.id}
      onClick={() => handleToolClick(tool)}
      title={tool.name}                          // tooltip через стандартный title
      className={`p-2 rounded-lg flex items-center justify-center transition-all
        ${isActiveShape(tool) ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <tool.icon size={18} />
    </button>
  ))}
</div>
```

Активное состояние (`isActiveShape`) — кнопка получает `ring-2 ring-indigo-400` поверх `bg-indigo-100`, что даёт контрастную рамку, хорошо различимую на светлом фоне.

Функция `isActiveShape(tool)`:
```ts
const isActiveShape = (tool: ToolDef) =>
  mode === 'shape' && shapeToolToType[tool.id] === shapeType;
```

Для остальных групп (не `shapes`) popup остаётся прежним (список с текстом).

### Canvas — создание фигур

В `handleCanvasPointerUp`, блок `if (isDrawingShape ...)`, заменяем `fill` во всех `case`:

| shapeType | Было | Станет |
|---|---|---|
| `rectangle` (default) | `fill: '#4F46E5'` | `fill: 'transparent'` |
| `circle` | `fill: '#10B981'` | `fill: 'transparent'` |
| `triangle` | `fill: '#F59E0B'` | `fill: 'transparent'` |
| `polygon` / `trapezoid` / `rhombus` / `parallelogram` | `fill: '#F59E0B'` | `fill: 'transparent'` |
| `geoshape-*` | нет `fill` | без изменений (уже нет fill) |

`stroke` и `strokeWidth` остаются `'#374151'` и `2` для всех типов (уже так для geoshape, приводим к единому стандарту для остальных).

### ToolSidebar — прокрутка

Корневой `<div>` сайдбара получает `overflow-y-auto` и `h-full`:

```tsx
// Было:
const wrapperClasses = `w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 relative ...`;

// Станет:
const wrapperClasses = `w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 relative h-full overflow-y-auto ...`;
```

## Data Models

Изменений в типах нет. `AnyCanvasObject` и `ShapeType` в `EditorContext` остаются прежними.

Единственное изменение — значение поля `data.fill` в объектах, создаваемых Canvas:

```ts
// Пример для rectangle (после изменения):
{
  id: `obj_${Date.now()}_...`,
  type: 'rectangle',
  x, y, width, height,
  rotation: 0, opacity: 1, visible: true, locked: false,
  data: {
    fill: 'transparent',   // было '#4F46E5'
    stroke: '#374151',
    strokeWidth: 2,
    cornerRadius: 0,
  }
}
```

Значение `'transparent'` — валидная CSS-строка, корректно обрабатываемая SVG-рендерером (`ObjectRenderer`).


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Прозрачная заливка и корректные стили для всех фигур

*For any* shapeType из множества `{rectangle, circle, triangle, polygon, trapezoid, rhombus, parallelogram}`, объект, созданный Canvas при рисовании фигуры, должен иметь `data.fill === 'transparent'`, `data.stroke === '#374151'` и `data.strokeWidth === 2`.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Каждая кнопка фигуры имеет title-атрибут равный имени фигуры

*For any* кнопки в ShapePopup (сетке фигур), атрибут `title` должен быть равен `tool.name` соответствующего инструмента — то есть для любого элемента конфигурации `TOOL_GROUPS['shapes'].tools` кнопка рендерится с `title={tool.name}`.

**Validates: Requirements 3.3**

## Error Handling

| Ситуация | Поведение |
|---|---|
| `shapeType` не входит в известные значения | `switch` падает в `default` → создаётся `rectangle` с `fill: 'transparent'` |
| Фигура нарисована слишком маленькой (w ≤ 5 или h ≤ 5) | Объект не создаётся (существующая проверка `if (w > 5 && h > 5)`) |
| `data.fill = 'transparent'` в SVG | Корректно интерпретируется браузером как отсутствие заливки; `ObjectRenderer` не требует изменений |

## Testing Strategy

### Unit-тесты (примеры)

**Конфигурация TOOL_GROUPS:**
- Группа `shapes` содержит ровно 9 инструментов (по одному на каждый ShapeType).
- Ни один инструмент в группе `shapes` не имеет в имени слов "Закрашенный" / "Filled".
- `shapeToolToType` содержит ровно 9 ключей, покрывающих все ShapeType.

**CSS-классы ToolSidebar:**
- `wrapperClasses` содержит `overflow-y-auto`.
- `wrapperClasses` содержит `h-full`.

**Рендеринг ShapePopup (snapshot / RTL):**
- При `openGroupId === 'shapes'` popup рендерится как grid-контейнер с 3 колонками.
- Кнопки в popup не содержат текстовых узлов (только иконку).

### Property-тесты

Используется библиотека **fast-check** (TypeScript/React).

**Property 1: Прозрачная заливка**

```ts
// Feature: toolbar-shapes-refactor, Property 1: transparent fill and correct styles for all shape types
fc.assert(
  fc.property(
    fc.constantFrom('rectangle', 'circle', 'triangle', 'polygon', 'trapezoid', 'rhombus', 'parallelogram'),
    fc.record({ x: fc.integer(), y: fc.integer(), w: fc.integer({ min: 6, max: 500 }), h: fc.integer({ min: 6, max: 500 }) }),
    (shapeType, { x, y, w, h }) => {
      const obj = buildShapeObject(shapeType, x, y, w, h);
      return obj.data.fill === 'transparent'
        && obj.data.stroke === '#374151'
        && obj.data.strokeWidth === 2;
    }
  ),
  { numRuns: 100 }
);
```

`buildShapeObject` — вспомогательная функция, извлечённая из `switch`-блока Canvas (или тестирующая его напрямую через рефакторинг в чистую функцию `createShapeObject(shapeType, sx, sy, w, h)`).

**Property 2: title-атрибут кнопок**

```ts
// Feature: toolbar-shapes-refactor, Property 2: each shape button has title equal to tool.name
fc.assert(
  fc.property(
    fc.constantFrom(...TOOL_GROUPS.find(g => g.id === 'shapes')!.tools),
    (tool) => {
      const { getByTitle } = render(<ShapePopupGrid tools={[tool]} ... />);
      return !!getByTitle(tool.name);
    }
  ),
  { numRuns: 100 }
);
```

**Конфигурация:** минимум 100 итераций на каждый property-тест (`numRuns: 100`).
