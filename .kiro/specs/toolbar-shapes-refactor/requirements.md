# Requirements Document

## Introduction

Рефакторинг UI панели инструментов и логики фигур в MathViz Architect. Цель — улучшить UX, устранить переполнение боковой панели (Tools Sidebar) при большом количестве фигур и обеспечить, что все фигуры создаются незакрашенными по умолчанию. Заливка фигур будет реализована отдельным инструментом в будущем.

## Glossary

- **ToolSidebar**: Боковая панель инструментов (`src/components/ToolSidebar.tsx`), содержащая группы инструментов редактора.
- **ShapeType**: Тип фигуры, задаваемый через `shapeType` в `EditorContext`. Допустимые значения: `rectangle`, `circle`, `triangle`, `polygon`, `geoshape-circle`, `geoshape-triangle`, `geoshape-quad`, `trapezoid`, `rhombus`, `parallelogram`.
- **Canvas**: Компонент холста (`src/components/Canvas.tsx`), отвечающий за создание объектов при рисовании.
- **ShapeObject**: Объект-фигура типа `AnyCanvasObject`, создаваемый на холсте при использовании инструмента "Фигуры".
- **ShapePopup**: Всплывающий контейнер с кнопками выбора фигур, открывающийся при клике на группу "Фигуры" в ToolSidebar.
- **Fill**: Свойство `data.fill` объекта-фигуры, определяющее цвет заливки.

## Requirements

### Requirement 1: Прозрачная заливка по умолчанию

**User Story:** As a teacher, I want shapes to be created without fill by default, so that I can use them as outlines in geometry diagrams without needing to manually remove the fill each time.

#### Acceptance Criteria

1. WHEN THE Canvas creates a ShapeObject of type `rectangle`, THE Canvas SHALL set `data.fill` to `'transparent'`.
2. WHEN THE Canvas creates a ShapeObject of type `circle`, THE Canvas SHALL set `data.fill` to `'transparent'`.
3. WHEN THE Canvas creates a ShapeObject of type `triangle`, THE Canvas SHALL set `data.fill` to `'transparent'`.
4. WHEN THE Canvas creates a ShapeObject of type `polygon` (включая trapezoid, rhombus, parallelogram), THE Canvas SHALL set `data.fill` to `'transparent'`.
5. THE Canvas SHALL set `data.stroke` to `'#374151'` and `data.strokeWidth` to `2` for all newly created ShapeObjects.

### Requirement 2: Отсутствие дублирующих кнопок закрашенных фигур

**User Story:** As a user, I want the toolbar to show only one button per shape type, so that the interface is not cluttered with redundant options.

#### Acceptance Criteria

1. THE ToolSidebar SHALL NOT contain buttons or menu items for filled variants of shapes (например, "Закрашенный прямоугольник", "Закрашенный круг").
2. THE ToolSidebar SHALL contain exactly one button for each of the following ShapeTypes: `rectangle`, `circle`, `triangle`, `trapezoid`, `rhombus`, `parallelogram`, `geoshape-circle`, `geoshape-triangle`, `geoshape-quad`.

### Requirement 3: Компактный grid-layout для кнопок фигур

**User Story:** As a user, I want shape buttons to be displayed in a compact grid, so that all shapes are visible without scrolling even on small screens.

#### Acceptance Criteria

1. THE ShapePopup SHALL render shape buttons in a grid layout with a minimum of 3 columns.
2. THE ShapePopup SHALL display only the icon and a tooltip for each shape button, without visible text labels inside the button.
3. WHEN a user hovers over a shape button, THE ShapePopup SHALL display the shape name as a tooltip via the `title` attribute.
4. THE ShapePopup SHALL have a maximum width sufficient to display 3–4 columns of icon buttons without horizontal overflow.

### Requirement 4: Прокручиваемая боковая панель

**User Story:** As a user on a small screen, I want the tools sidebar to be scrollable, so that all tool groups remain accessible regardless of screen height.

#### Acceptance Criteria

1. THE ToolSidebar SHALL have `overflow-y-auto` applied to its main scrollable container.
2. THE ToolSidebar SHALL be constrained to the full viewport height (`h-full` или `max-h-screen`), preventing it from extending beyond the visible area.
3. WHILE the viewport height is insufficient to display all tool groups, THE ToolSidebar SHALL allow vertical scrolling to access all groups.
