# Requirements Document

## Introduction

A semi-transparent Highlighter (Выделитель) tool for the Canvas that allows tutors to color specific parts of geometric shapes (e.g., to visually demonstrate triangle equality or similarity) without obscuring the underlying strokes. The tool behaves like the existing Freehand/Pencil tool but renders with a thick, semi-transparent stroke using `mix-blend-mode: multiply` so it realistically darkens the area beneath it rather than covering it with an opaque color.

## Glossary

- **Highlighter**: The new canvas tool that draws semi-transparent, thick freehand strokes over existing objects.
- **HighlighterObject**: A canvas object of type `'highlighter'` storing the drawn points, color, and stroke width.
- **Canvas**: The main SVG drawing surface managed by `Canvas.tsx`.
- **ObjectRenderer**: The component `src/components/canvas/ObjectRenderer.tsx` responsible for rendering all canvas objects as SVG elements.
- **ToolSidebar**: The left-side toolbar component `src/components/ToolSidebar.tsx` where drawing tools are selected.
- **AppMode**: The union type in `src/lib/types.ts` that enumerates all valid tool modes.
- **AnyCanvasObject**: The union type in `src/lib/types.ts` that enumerates all valid canvas object types.
- **useFreehandTool**: The existing hook `src/components/canvas/tools/useFreehandTool.ts` that manages freehand drawing state.
- **penSettings**: The current pen color and width settings provided by `EditorContext`.
- **mixBlendMode**: The CSS `mix-blend-mode: multiply` property applied to the SVG path to blend the highlight with underlying shapes.

## Requirements

### Requirement 1: Highlighter Object Type

**User Story:** As a developer, I want a dedicated `HighlighterObject` type and `'highlighter'` AppMode, so that highlighter strokes are stored and identified separately from regular freehand strokes.

#### Acceptance Criteria

1. THE `CanvasObject` type union SHALL include `'highlighter'` as a valid value for the `type` field.
2. THE `AnyCanvasObject` union type SHALL include `HighlighterObject`.
3. THE `HighlighterObject` SHALL have a `data` field containing `points: { x: number; y: number }[]`, `color: string`, and `width: number`.
4. THE `AppMode` type SHALL include `'highlighter'` as a valid mode value.

### Requirement 2: Highlighter Drawing Logic

**User Story:** As a tutor, I want the Highlighter tool to collect pointer points exactly like the Pencil tool, so that drawing feels natural and consistent.

#### Acceptance Criteria

1. WHEN the active mode is `'highlighter'` and a pointer-down event occurs on the Canvas, THE Canvas SHALL begin collecting pointer coordinates into a new highlighter stroke.
2. WHEN the active mode is `'highlighter'` and a pointer-move event occurs while drawing, THE Canvas SHALL append the current pointer coordinates to the in-progress stroke, subject to the same minimum distance threshold (> 2px) used by the Pencil tool.
3. WHEN the active mode is `'highlighter'` and a pointer-up event occurs, THE Canvas SHALL finalize the stroke and add a `HighlighterObject` to the canvas objects list via `onAddObject`.
4. WHEN the active mode is `'highlighter'` and a pointer-up event occurs with fewer than 2 collected points, THE Canvas SHALL discard the stroke without adding any object.
5. WHEN the active mode is `'highlighter'` and a pointer-cancel event occurs, THE Canvas SHALL discard the in-progress stroke without adding any object.
6. THE Canvas SHALL call `publishState()` after successfully adding a `HighlighterObject`.

### Requirement 3: Highlighter Rendering

**User Story:** As a tutor, I want the highlighter stroke to appear as a thick, semi-transparent mark that darkens the shapes beneath it, so that I can highlight parts of geometric figures without hiding them.

#### Acceptance Criteria

1. WHEN the ObjectRenderer renders a `HighlighterObject`, THE ObjectRenderer SHALL render the stroke path using the smooth quadratic Bézier algorithm (same as the Pencil tool).
2. WHEN the ObjectRenderer renders a `HighlighterObject`, THE ObjectRenderer SHALL apply a `strokeWidth` of `28` pixels by default (using `data.width` if provided, otherwise `28`).
3. WHEN the ObjectRenderer renders a `HighlighterObject`, THE ObjectRenderer SHALL apply `opacity: 0.4` to the stroke path element.
4. WHEN the ObjectRenderer renders a `HighlighterObject`, THE ObjectRenderer SHALL apply `style={{ mixBlendMode: 'multiply' }}` to the SVG `<path>` element so the highlight darkens underlying shapes.
5. WHEN the ObjectRenderer renders a `HighlighterObject`, THE ObjectRenderer SHALL set `fill="none"` and `strokeLinecap="round"` and `strokeLinejoin="round"` on the path.
6. WHEN a `HighlighterObject` is selected, THE ObjectRenderer SHALL render a selection indicator (dashed amber outline path) consistent with the Pencil tool selection style.
7. WHEN a `HighlighterObject` has `visible: false`, THE ObjectRenderer SHALL render it with `opacity: 0.3` (the standard hidden-object opacity).

### Requirement 4: In-Progress Stroke Overlay

**User Story:** As a tutor, I want to see the highlighter stroke as I draw it, so that I have immediate visual feedback.

#### Acceptance Criteria

1. WHILE the Highlighter tool is actively drawing, THE Canvas SHALL render an in-progress overlay SVG path with the same visual properties as the final rendered `HighlighterObject` (thick stroke, 0.4 opacity, `mix-blend-mode: multiply`).
2. WHEN the drawing ends (pointer-up or pointer-cancel), THE Canvas SHALL remove the in-progress overlay.

### Requirement 5: Toolbar Integration

**User Story:** As a tutor, I want a Highlighter button in the tool sidebar next to the Pencil tool, so that I can easily switch to the Highlighter tool.

#### Acceptance Criteria

1. THE ToolSidebar SHALL include a Highlighter tool entry with the `Highlighter` icon from the `lucide-react` library.
2. THE ToolSidebar SHALL display the Highlighter tool with the Russian label `'Выделитель'`.
3. WHEN the Highlighter tool button is clicked, THE ToolSidebar SHALL set the active mode to `'highlighter'`.
4. WHEN the active mode is `'highlighter'`, THE ToolSidebar SHALL render the Highlighter button in the active (highlighted) state, consistent with the active state style of other tools in the same group.
5. THE ToolSidebar SHALL place the Highlighter tool in the same group as the Pencil (`freehand`) tool.

### Requirement 6: Object Interaction Exclusion

**User Story:** As a tutor, I want the Highlighter tool to prevent accidental object selection or dragging while drawing, so that I can draw freely over existing shapes.

#### Acceptance Criteria

1. WHEN the active mode is `'highlighter'`, THE Canvas `handleObjectPointerDown` handler SHALL return early without initiating a drag or selection, consistent with the behavior of the `'freehand'` mode.
2. WHEN the active mode is `'highlighter'`, THE Canvas `handleImageResizeStart` handler SHALL return early without initiating a resize, consistent with the behavior of the `'freehand'` mode.
