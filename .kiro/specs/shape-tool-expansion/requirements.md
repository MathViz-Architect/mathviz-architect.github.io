# Requirements Document

## Introduction

Расширение набора геометрических фигур в инструменте рисования фигур (shape tool) за счёт добавления трапеции, ромба и параллелограмма, а также добавление кнопки очистки доски в интерфейс для учителя. Все три новые фигуры реализуются через тип `polygon` с нормализованными точками, аналогично существующему пятиугольнику. Кнопка очистки доски привязывается к уже существующему методу `clearBoard` из контекста.

## Glossary

- **ShapeType**: Строковый литеральный тип в `EditorContext`, определяющий активную фигуру для инструмента `shape`.
- **Shape_Tool**: Инструмент рисования фигур в режиме `mode === 'shape'` в `Canvas.tsx`.
- **ToolSidebar**: Боковая панель инструментов (`src/components/ToolSidebar.tsx`), содержащая группу фигур.
- **TopBar**: Верхняя панель (`src/components/TopBar.tsx`), содержащая кнопку очистки доски.
- **clearBoard**: Метод в `useAppState`, выполняющий `ClearCanvasCommand` — атомарная очистка всех объектов с поддержкой undo.
- **Preview_Overlay**: SVG-элемент, отображаемый во время рисования фигуры до отпускания указателя.
- **Normalized_Points**: Массив точек `{x, y}` в диапазоне `[0, 1]`, масштабируемых до реальных размеров bounding box при создании объекта.
- **Trapezoid**: Трапеция — четырёхугольник с одной парой параллельных сторон. Normalized_Points: `[{x:0.2,y:0},{x:0.8,y:0},{x:1,y:1},{x:0,y:1}]`.
- **Rhombus**: Ромб — четырёхугольник с равными сторонами. Normalized_Points: `[{x:0.5,y:0},{x:1,y:0.5},{x:0.5,y:1},{x:0,y:0.5}]`.
- **Parallelogram**: Параллелограмм — четырёхугольник с двумя парами параллельных сторон. Normalized_Points: `[{x:0.25,y:0},{x:1,y:0},{x:0.75,y:1},{x:0,y:1}]`.

## Requirements

### Requirement 1: Расширение типа ShapeType

**User Story:** As a разработчик, I want добавить три новых литерала в тип ShapeType, so that новые фигуры можно выбирать и использовать через существующий механизм контекста.

#### Acceptance Criteria

1. THE EditorContext SHALL определять тип `ShapeType` включающий литералы `'trapezoid'`, `'rhombus'` и `'parallelogram'` в дополнение к существующим.
2. THE EditorContext SHALL экспортировать `shapeType` и `setShapeType` с обновлённым типом, включающим новые литералы.
3. WHEN `setShapeType` вызывается с одним из новых литералов, THE EditorContext SHALL сохранять переданное значение в состоянии без ошибок типизации TypeScript.

---

### Requirement 2: Создание объектов новых фигур

**User Story:** As a учитель, I want рисовать трапецию, ромб и параллелограмм на холсте, so that я могу наглядно объяснять геометрические концепции ученикам.

#### Acceptance Criteria

1. WHEN пользователь завершает рисование при `shapeType === 'trapezoid'` и размер bounding box превышает 5×5 пикселей, THE Shape_Tool SHALL создавать объект типа `polygon` с `data.points` равными `[{x:0.2,y:0},{x:0.8,y:0},{x:1,y:1},{x:0,y:1}]`.
2. WHEN пользователь завершает рисование при `shapeType === 'rhombus'` и размер bounding box превышает 5×5 пикселей, THE Shape_Tool SHALL создавать объект типа `polygon` с `data.points` равными `[{x:0.5,y:0},{x:1,y:0.5},{x:0.5,y:1},{x:0,y:0.5}]`.
3. WHEN пользователь завершает рисование при `shapeType === 'parallelogram'` и размер bounding box превышает 5×5 пикселей, THE Shape_Tool SHALL создавать объект типа `polygon` с `data.points` равными `[{x:0.25,y:0},{x:1,y:0},{x:0.75,y:1},{x:0,y:1}]`.
4. THE Shape_Tool SHALL устанавливать для каждого нового объекта `fill: '#F59E0B'`, `stroke: '#D97706'`, `strokeWidth: 2` — аналогично существующему пятиугольнику.
5. WHEN объект новой фигуры создан, THE Shape_Tool SHALL добавлять его на холст и выделять его.

---

### Requirement 3: Визуальное превью во время рисования

**User Story:** As a учитель, I want видеть контур фигуры во время рисования, so that я могу точно позиционировать и масштабировать фигуру до её создания.

#### Acceptance Criteria

1. WHILE `isDrawingShape === true` и `shapeType === 'trapezoid'`, THE Preview_Overlay SHALL отображать SVG-полигон с вершинами, вычисленными из Normalized_Points трапеции, масштабированными до текущего bounding box.
2. WHILE `isDrawingShape === true` и `shapeType === 'rhombus'`, THE Preview_Overlay SHALL отображать SVG-полигон с вершинами, вычисленными из Normalized_Points ромба, масштабированными до текущего bounding box.
3. WHILE `isDrawingShape === true` и `shapeType === 'parallelogram'`, THE Preview_Overlay SHALL отображать SVG-полигон с вершинами, вычисленными из Normalized_Points параллелограмма, масштабированными до текущего bounding box.
4. THE Preview_Overlay SHALL применять стиль `fill: rgba(79,70,229,0.08)`, `stroke: #4F46E5`, `strokeWidth: 1.5`, `strokeDasharray: '6,3'` — идентично существующим превью фигур.
5. THE Preview_Overlay SHALL устанавливать `pointerEvents: 'none'` чтобы не блокировать события указателя.

---

### Requirement 4: Кнопки выбора новых фигур в ToolSidebar

**User Story:** As a учитель, I want выбирать трапецию, ромб и параллелограмм из панели инструментов, so that я могу быстро переключаться между фигурами без ручного ввода.

#### Acceptance Criteria

1. THE ToolSidebar SHALL содержать кнопки с идентификаторами `'shape-trapezoid'`, `'shape-rhombus'`, `'shape-parallelogram'` в группе фигур `'shapes'`.
2. WHEN пользователь нажимает кнопку `'shape-trapezoid'`, THE ToolSidebar SHALL вызывать `setShapeType('trapezoid')` и `setMode('shape')`.
3. WHEN пользователь нажимает кнопку `'shape-rhombus'`, THE ToolSidebar SHALL вызывать `setShapeType('rhombus')` и `setMode('shape')`.
4. WHEN пользователь нажимает кнопку `'shape-parallelogram'`, THE ToolSidebar SHALL вызывать `setShapeType('parallelogram')` и `setMode('shape')`.
5. THE ToolSidebar SHALL отображать названия кнопок на русском языке: «Трапеция», «Ромб», «Параллелограмм».

---

### Requirement 5: Кнопка очистки доски

**User Story:** As a учитель, I want нажать кнопку «Очистить доску» в интерфейсе, so that я могу быстро удалить все объекты с холста во время урока.

#### Acceptance Criteria

1. THE TopBar SHALL содержать кнопку «Очистить доску», видимую только когда `roomState.role === 'teacher'`.
2. WHEN учитель нажимает кнопку «Очистить доску», THE TopBar SHALL вызывать `clearBoard()` из контекста.
3. WHEN учитель нажимает кнопку «Очистить доску» в режиме совместной работы, THE TopBar SHALL вызывать `publishLocalChange(getCanvasSnapshot())` после `clearBoard()` для синхронизации состояния через Yjs.
4. IF `roomState.role !== 'teacher'`, THEN THE TopBar SHALL не отображать кнопку «Очистить доску».
5. THE TopBar SHALL отображать кнопку «Очистить доску» с иконкой `Trash2` из `lucide-react`.

> **Примечание**: Согласно анализу кода, кнопка «Очистить доску» уже реализована в `TopBar.tsx` (строки 125–130). Данное требование фиксирует ожидаемое поведение и служит основой для верификации. Если кнопка отсутствует в конкретной версии файла, её необходимо добавить согласно этим критериям.
