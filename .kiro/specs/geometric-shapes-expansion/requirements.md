# Requirements Document

## Introduction

Расширение библиотеки фигур Canvas-редактора: добавление поддержки трапеции, ромба и параллелограмма.
Новые фигуры используют систему нормализованных координат (0..1) для описания вершин и обрабатываются
аналогично существующему типу `polygon` — через SVG `<polygon>` с расчётом точек по формуле
`px = vertex.x * width + x`, `py = vertex.y * height + y`.

Анализ кодовой базы показал, что часть реализации уже присутствует в `Canvas.tsx` и `ToolSidebar.tsx`,
однако тип `shapeType` в `EditorContext.tsx` не включает новые значения, что приводит к TypeScript-ошибкам.
Фича закрывает этот разрыв и обеспечивает полную, согласованную поддержку трёх новых фигур.

## Glossary

- **Canvas_Editor**: компонент `src/components/Canvas.tsx`, управляющий событиями холста и отрисовкой превью
- **ObjectRenderer**: компонент `src/components/canvas/ObjectRenderer.tsx`, рендерящий отдельный `CanvasObject` как SVG
- **EditorContext**: провайдер `src/components/EditorContext.tsx`, хранящий глобальное состояние редактора, включая `shapeType`
- **ToolSidebar**: компонент `src/components/ToolSidebar.tsx`, содержащий кнопки выбора инструментов
- **ShapeType**: объединение строковых литералов, определяющее допустимые значения `shapeType` в `EditorContext`
- **Normalized_Vertex**: точка `{x: number, y: number}` с координатами в диапазоне `[0, 1]`
- **Polygon_Object**: объект холста с `type: 'polygon'` и полем `data.points: Normalized_Vertex[]`
- **Preview_Overlay**: временный SVG-элемент, отображаемый во время рисования фигуры до отпускания кнопки мыши

## Requirements

### Requirement 1: Расширение типа ShapeType

**User Story:** Как разработчик, я хочу, чтобы `shapeType` в `EditorContext` принимал значения `'trapezoid'`, `'rhombus'` и `'parallelogram'`, чтобы компилятор TypeScript не выдавал ошибок при использовании новых фигур.

#### Acceptance Criteria

1. THE EditorContext SHALL включать `'trapezoid'`, `'rhombus'` и `'parallelogram'` в объединение типов `shapeType`.
2. THE EditorContext SHALL экспортировать `setShapeType`, принимающий все три новых значения без ошибок типизации.
3. WHEN проект компилируется командой `tsc --noEmit`, THE Canvas_Editor SHALL не выдавать ошибок, связанных с типом `shapeType`.

---

### Requirement 2: Создание объектов новых фигур

**User Story:** Как учитель, я хочу нарисовать трапецию, ромб или параллелограмм на холсте, чтобы использовать их в учебных материалах.

#### Acceptance Criteria

1. WHEN пользователь выбирает инструмент `'trapezoid'` и рисует область на холсте, THE Canvas_Editor SHALL создавать `Polygon_Object` с `data.points = [{x:0.2,y:0},{x:0.8,y:0},{x:1,y:1},{x:0,y:1}]`.
2. WHEN пользователь выбирает инструмент `'rhombus'` и рисует область на холсте, THE Canvas_Editor SHALL создавать `Polygon_Object` с `data.points = [{x:0.5,y:0},{x:1,y:0.5},{x:0.5,y:1},{x:0,y:0.5}]`.
3. WHEN пользователь выбирает инструмент `'parallelogram'` и рисует область на холсте, THE Canvas_Editor SHALL создавать `Polygon_Object` с `data.points = [{x:0.25,y:0},{x:1,y:0},{x:0.75,y:1},{x:0,y:1}]`.
4. WHEN ширина или высота нарисованной области меньше 5 пикселей, THE Canvas_Editor SHALL не создавать объект.
5. THE Canvas_Editor SHALL инициализировать новые объекты со значениями `fill: '#F59E0B'`, `stroke: '#D97706'`, `strokeWidth: 2`, совпадающими с существующим `polygon`.

---

### Requirement 3: Рендеринг новых фигур

**User Story:** Как пользователь, я хочу видеть корректно отрисованные трапецию, ромб и параллелограмм на холсте, чтобы они выглядели как настоящие геометрические фигуры.

#### Acceptance Criteria

1. WHEN ObjectRenderer получает `Polygon_Object` с любым из трёх наборов вершин, THE ObjectRenderer SHALL рендерить SVG-элемент `<polygon>` с атрибутом `points`, вычисленным по формуле `px = vertex.x * object.width + object.x`, `py = vertex.y * object.height + object.y`.
2. THE ObjectRenderer SHALL применять к новым фигурам те же атрибуты `fill`, `stroke`, `strokeWidth` и `opacity`, что и к существующему `polygon`.
3. WHEN объект выбран, THE ObjectRenderer SHALL отображать прямоугольный selection ring (`SEL`) вокруг bounding box фигуры, аналогично существующему `polygon`.
4. THE ObjectRenderer SHALL корректно применять `dragDelta` к координатам новых фигур во время перетаскивания.

---

### Requirement 4: Preview Overlay при рисовании

**User Story:** Как пользователь, я хочу видеть контур фигуры во время рисования (до отпускания кнопки мыши), чтобы понимать итоговую форму.

#### Acceptance Criteria

1. WHILE пользователь удерживает кнопку мыши и перемещает курсор в режиме `'trapezoid'`, THE Canvas_Editor SHALL отображать `Preview_Overlay` с вершинами трапеции, масштабированными по текущей области рисования.
2. WHILE пользователь удерживает кнопку мыши и перемещает курсор в режиме `'rhombus'`, THE Canvas_Editor SHALL отображать `Preview_Overlay` с вершинами ромба, масштабированными по текущей области рисования.
3. WHILE пользователь удерживает кнопку мыши и перемещает курсор в режиме `'parallelogram'`, THE Canvas_Editor SHALL отображать `Preview_Overlay` с вершинами параллелограмма, масштабированными по текущей области рисования.
4. THE Preview_Overlay SHALL использовать стиль `fill: 'rgba(79,70,229,0.08)'`, `stroke: '#4F46E5'`, `strokeDasharray: '6,3'`, совпадающий со стилем превью существующих фигур.

---

### Requirement 5: Кнопки выбора фигур в ToolSidebar

**User Story:** Как пользователь, я хочу выбирать трапецию, ромб и параллелограмм через боковую панель инструментов, чтобы не использовать клавиатурные команды.

#### Acceptance Criteria

1. THE ToolSidebar SHALL содержать кнопки `'shape-trapezoid'`, `'shape-rhombus'` и `'shape-parallelogram'` в группе `'shapes'`.
2. WHEN пользователь нажимает кнопку `'shape-trapezoid'`, THE ToolSidebar SHALL вызывать `setShapeType('trapezoid')` и `setMode('shape')`.
3. WHEN пользователь нажимает кнопку `'shape-rhombus'`, THE ToolSidebar SHALL вызывать `setShapeType('rhombus')` и `setMode('shape')`.
4. WHEN пользователь нажимает кнопку `'shape-parallelogram'`, THE ToolSidebar SHALL вызывать `setShapeType('parallelogram')` и `setMode('shape')`.
5. THE ToolSidebar SHALL отображать для каждой новой кнопки inline SVG-иконку, визуально соответствующую форме фигуры.
6. THE ToolSidebar SHALL применять к новым кнопкам те же классы активного/неактивного состояния, что и к существующим кнопкам фигур.

---

### Requirement 6: Совместимость с существующей логикой

**User Story:** Как разработчик, я хочу, чтобы новые фигуры не нарушали существующую логику resize, rotation и snapping, чтобы не вводить регрессии.

#### Acceptance Criteria

1. THE Canvas_Editor SHALL не изменять логику `handleImageResizeStart`, `handleImageResizeMove`, `handleImageResizeEnd` при добавлении новых фигур.
2. THE Canvas_Editor SHALL не изменять логику snapping (`getSnapPoint`, `SNAP_RADIUS`) при добавлении новых фигур.
3. WHEN объект типа `polygon` (включая трапецию, ромб, параллелограмм) перемещается, THE Canvas_Editor SHALL применять `applyDelta` к координатам объекта без изменения `data.points`.
4. THE Canvas_Editor SHALL не добавлять новые npm-зависимости для реализации новых фигур.
