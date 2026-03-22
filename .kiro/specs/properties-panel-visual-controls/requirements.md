# Requirements Document

## Introduction

Панель свойств (Properties Panel) в MathViz Architect сейчас отображает параметры фигур (заливка, обводка, толщина) через текстовые поля с сырыми hex-кодами. Это неудобно для учителей математики, которым нужно быстро выделять геометрические элементы цветом и менять толщину линий в ходе урока. Данная фича заменяет текстовые контролы на визуальные: цветовую палитру пресетов и ползунок толщины.

Затронутые компоненты:
- `src/components/PropertiesPanel/ColorPicker.tsx` — заменяется на визуальную палитру
- `src/components/PropertiesPanel/ShapeProperties.tsx` — использует новый ColorPicker и ползунок
- `src/components/PropertiesPanel/GeoSegmentProperties.tsx` — аналогично
- `src/components/PropertiesPanel/GeoShapeProperties.tsx` — аналогично
- `src/components/PropertiesPanel/LineProperties.tsx` — аналогично
- `src/components/PropertiesPanel/ArrowProperties.tsx` — аналогично

## Glossary

- **Properties_Panel**: правая боковая панель приложения, отображающая свойства выделенного объекта на холсте
- **Color_Palette**: компонент-сетка круглых кнопок с предустановленными цветами, заменяющий текстовый ввод hex-кода
- **Stroke_Width_Slider**: компонент-ползунок для выбора толщины линии/обводки в диапазоне 1–10
- **Preset_Color**: один из заранее заданных цветов в Color_Palette, полезных для геометрических построений
- **Transparent_Swatch**: специальная кнопка в Color_Palette, обозначающая отсутствие заливки (transparent)
- **Active_Swatch**: кнопка в Color_Palette, соответствующая текущему выбранному цвету объекта

## Requirements

### Requirement 1: Цветовая палитра пресетов

**User Story:** Как учитель математики, я хочу выбирать цвет заливки и обводки фигуры одним кликом из набора готовых цветов, чтобы не вводить hex-коды вручную во время урока.

#### Acceptance Criteria

1. THE Color_Palette SHALL содержать следующие цвета в указанном порядке: `transparent`, `#000000`, `#374151`, `#EF4444`, `#3B82F6`, `#10B981`, `#F59E0B`, `#8B5CF6`.
2. THE Color_Palette SHALL отображать каждый Preset_Color в виде круглой кнопки размером 24×24 px (`w-6 h-6 rounded-full`).
3. THE Transparent_Swatch SHALL отображаться как белый круг с красной диагональной линией, чтобы учитель визуально понимал отсутствие заливки.
4. WHEN учитель нажимает на Preset_Color, THE Color_Palette SHALL немедленно применить выбранный цвет к соответствующему свойству объекта (fill или stroke).
5. THE Active_Swatch SHALL визуально выделяться кольцом `ring-2 ring-offset-1 ring-indigo-500`, чтобы учитель видел текущий активный цвет.
6. THE Color_Palette SHALL располагать кнопки в сетке с отступами `gap-2 flex flex-wrap`.
7. WHEN значение цвета объекта не совпадает ни с одним Preset_Color, THE Color_Palette SHALL не выделять ни одну кнопку как Active_Swatch.

### Requirement 2: Ползунок толщины линии

**User Story:** Как учитель математики, я хочу регулировать толщину обводки/линии ползунком, чтобы быстро менять визуальный вес геометрических элементов без ввода числа.

#### Acceptance Criteria

1. THE Stroke_Width_Slider SHALL заменить поле `input[type="number"]` для толщины обводки во всех компонентах свойств, использующих strokeWidth.
2. THE Stroke_Width_Slider SHALL использовать `input[type="range"]` с атрибутами `min="1"`, `max="10"`, `step="1"`.
3. THE Stroke_Width_Slider SHALL отображать текущее числовое значение рядом с ползунком в виде небольшого текстового индикатора.
4. WHEN учитель перемещает ползунок, THE Stroke_Width_Slider SHALL немедленно обновлять свойство `strokeWidth` объекта без задержки.
5. IF значение `strokeWidth` объекта выходит за пределы диапазона [1, 10], THEN THE Stroke_Width_Slider SHALL отображать ближайшее граничное значение (1 или 10) без ошибки.

### Requirement 3: Локализованные заголовки секций

**User Story:** Как учитель математики, я хочу видеть понятные русскоязычные подписи в панели свойств, чтобы не тратить время на перевод технических терминов.

#### Acceptance Criteria

1. THE Properties_Panel SHALL отображать метку "Заливка" вместо "Fill" для свойства fill.
2. THE Properties_Panel SHALL отображать метку "Цвет контура" вместо "Stroke" для свойства stroke.
3. THE Properties_Panel SHALL отображать метку "Толщина" вместо "Stroke Width" для свойства strokeWidth.
4. THE Properties_Panel SHALL отображать метку "Цвет" вместо "Color" для свойства color в геометрических объектах (geosegment, geoangle, geopoint).

### Requirement 4: Применение визуальных контролов ко всем типам объектов с цветом/толщиной

**User Story:** Как учитель математики, я хочу, чтобы визуальные контролы работали одинаково для всех типов фигур, чтобы не переключаться между разными интерфейсами.

#### Acceptance Criteria

1. THE Color_Palette SHALL использоваться в компонентах свойств для типов объектов: `rectangle`, `circle`, `triangle`, `polygon`, `geoshape`, `geosegment`, `geoangle`, `line`, `arrow`.
2. THE Stroke_Width_Slider SHALL использоваться в компонентах свойств для типов объектов: `rectangle`, `circle`, `triangle`, `polygon`, `geosegment`, `line`, `arrow`.
3. WHEN учитель выбирает объект любого из перечисленных типов, THE Properties_Panel SHALL отображать Color_Palette и Stroke_Width_Slider с текущими значениями объекта.
4. THE Color_Palette SHALL корректно инициализировать Active_Swatch при первом отображении панели для выбранного объекта.

### Requirement 5: Сохранение совместимости с существующей архитектурой

**User Story:** Как разработчик, я хочу, чтобы новые визуальные контролы не нарушали существующую систему обновления объектов и коллаборации, чтобы не вводить регрессии.

#### Acceptance Criteria

1. WHEN Color_Palette или Stroke_Width_Slider изменяют свойство объекта, THE Properties_Panel SHALL вызывать `onUpdate` с корректным объектом обновления `{ data: { ...existingData, [key]: value } }`.
2. THE Color_Palette и Stroke_Width_Slider SHALL быть реализованы как переиспользуемые React-компоненты с пропсами `value`, `onChange` и опциональным `label`.
3. THE Color_Palette SHALL принимать проп `allowTransparent: boolean` для управления отображением Transparent_Swatch, чтобы компонент можно было использовать для stroke (где transparent не применим).
4. WHILE объект заблокирован (`locked: true`), THE Properties_Panel SHALL отображать контролы в неактивном состоянии (disabled), не позволяя изменять свойства.
