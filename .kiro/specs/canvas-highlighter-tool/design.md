# Design Document: Canvas Highlighter Tool

## Overview

The Highlighter tool adds a semi-transparent, thick freehand stroke capability to the canvas. It is architecturally parallel to the existing Pencil (`freehand`) tool — sharing the same drawing hook pattern — but renders with `mix-blend-mode: multiply` and 0.4 opacity so it visually darkens underlying shapes rather than covering them. This makes it ideal for tutors who want to highlight parts of geometric figures (e.g., marking equal sides of triangles) without obscuring the underlying drawing.

The implementation touches four files:
- `src/lib/types.ts` — new type and mode
- `src/components/canvas/tools/useHighlighterTool.ts` — new drawing hook (mirrors `useFreehandTool`)
- `src/components/canvas/ObjectRenderer.tsx` — new render case
- `src/components/ToolSidebar.tsx` — toolbar entry

## Architecture

The highlighter follows the same layered architecture as the freehand tool:

```mermaid
flowchart TD
    ToolSidebar -->|setMode('highlighter')| EditorContext
    EditorContext -->|mode, penSettings| Canvas
    Canvas -->|useHighlighterTool| Hook[useHighlighterTool]
    Hook -->|overlay| Canvas
    Hook -->|onAddObject(HighlighterObject)| EditorContext
    Canvas -->|objects| ObjectRenderer
    ObjectRenderer -->|SVG path + multiply blend| SVGOutput
```

The in-progress stroke is rendered as an overlay directly in `Canvas.tsx` (same pattern as the freehand overlay). Once the pointer is released, the hook finalizes the stroke into a `HighlighterObject` and adds it to the canvas object list, where `ObjectRenderer` takes over for all subsequent renders.

## Components and Interfaces

### useHighlighterTool hook

Mirrors `useFreehandTool` exactly. Accepts the same options shape and returns the same interface:

```ts
interface UseHighlighterToolOptions {
  penSettings: { width: number; color: string };
  onAddObject: (obj: AnyCanvasObject) => void;
  publishState: () => void;
}

export interface HighlighterOverlay {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export function useHighlighterTool(options: UseHighlighterToolOptions): {
  isDrawing: boolean;
  onMouseDown: (x: number, y: number) => void;
  onMouseMove: (x: number, y: number) => void;
  onMouseUp: () => void;
  overlay: HighlighterOverlay | null;
}
```

The only behavioral difference from `useFreehandTool` is that `onMouseUp` creates a `HighlighterObject` (type `'highlighter'`) instead of a `FreehandPathObject`.

### Canvas.tsx changes

- Instantiate `useHighlighterTool` alongside `useFreehandTool`.
- In `handleCanvasPointerDown`: add `if (mode === 'highlighter') { highlighter.onMouseDown(x, y); e.stopPropagation(); }`.
- In `handleCanvasPointerMove`: add `if (mode === 'highlighter' && highlighter.isDrawing) { highlighter.onMouseMove(x, y); }`.
- In `handleCanvasPointerUp`: add `if (mode === 'highlighter') { highlighter.onMouseUp(); }`.
- In `handleCanvasPointerCancel`: call `highlighter.onMouseUp()` (same as freehand cancel path).
- In `handleObjectPointerDown`: add `'highlighter'` to the early-return mode guard.
- In `handleImageResizeStart`: add `'highlighter'` to the early-return mode guard.
- Render the in-progress overlay (when `highlighter.overlay` is non-null) as an SVG `<path>` with the same visual properties as the final rendered object.

### ObjectRenderer.tsx changes

Add a `case 'highlighter':` block that renders the stored points as a smooth quadratic Bézier path with:
- `strokeWidth`: `data.width ?? 28`
- `opacity`: `0.4`
- `style={{ mixBlendMode: 'multiply' }}`
- `fill="none"`, `strokeLinecap="round"`, `strokeLinejoin="round"`
- Selection indicator: a second path with amber dashed stroke (same pattern as `freehand`)

### ToolSidebar.tsx changes

Add `{ id: 'highlighter', name: 'Выделитель', icon: Highlighter, mode: 'highlighter' }` to the `freehand` tool group. The `Highlighter` icon is imported from `lucide-react`.

## Data Models

### HighlighterObject

```ts
export interface HighlighterObject extends CanvasObject {
  type: 'highlighter';
  data: {
    points: { x: number; y: number }[];
    color: string;
    width: number;
  };
}
```

### Updated CanvasObject type union

```ts
export type CanvasObject = {
  type: 'rectangle' | 'circle' | 'line' | 'text' | 'image' | 'chart'
      | 'fraction' | 'arrow' | 'group' | 'triangle' | 'polygon'
      | 'geoshape' | 'geopoint' | 'geosegment' | 'geoangle'
      | 'freehand' | 'highlighter';  // ← added
  // ...
}
```

### Updated AnyCanvasObject union

```ts
export type AnyCanvasObject = RectangleObject | CircleObject | ... | FreehandPathObject | HighlighterObject | CanvasObject;
```

### Updated AppMode

```ts
export type AppMode = 'select' | 'draw' | 'text' | 'shape' | 'library' | 'challenge'
  | 'interactive' | 'fraction' | 'chart' | 'arrow' | 'line' | 'eraser'
  | 'projects' | 'geopoint' | 'geosegment' | 'geoangle' | 'freehand' | 'highlighter';
```

### Default visual parameters

| Property | Value | Rationale |
|---|---|---|
| `strokeWidth` | `28` | Wide enough to visibly cover a shape edge |
| `opacity` | `0.4` | Semi-transparent; darkens without obscuring |
| `mixBlendMode` | `'multiply'` | Darkens underlying pixels realistically |
| `strokeLinecap` | `'round'` | Smooth stroke ends |
| `strokeLinejoin` | `'round'` | Smooth stroke joins |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: HighlighterObject data shape

*For any* `HighlighterObject` created by the hook, the `data` field must contain `points` (an array of `{x, y}` objects), `color` (a string), and `width` (a number).

**Validates: Requirements 1.3**

### Property 2: Drawing hook collects points above threshold

*For any* sequence of pointer-move coordinates, only coordinates that are more than 2px away from the previous recorded point are appended to the in-progress stroke. Coordinates within 2px of the last point are silently ignored.

**Validates: Requirements 2.2**

### Property 3: Successful stroke produces HighlighterObject and publishes state

*For any* stroke with 2 or more collected points, calling `onMouseUp` on the hook must result in exactly one call to `onAddObject` with a `HighlighterObject` (type `'highlighter'`) AND exactly one call to `publishState`.

**Validates: Requirements 2.3, 2.6**

### Property 4: Short or cancelled strokes are discarded

*For any* stroke with fewer than 2 collected points (including zero), calling `onMouseUp` must not call `onAddObject`. Similarly, a pointer-cancel must not call `onAddObject` regardless of how many points were collected.

**Validates: Requirements 2.4, 2.5**

### Property 5: Rendered path has correct visual attributes

*For any* `HighlighterObject` with a valid points array, the SVG path rendered by `ObjectRenderer` must have: `strokeWidth` equal to `data.width` (or `28` if absent), `opacity` equal to `0.4`, `style.mixBlendMode` equal to `'multiply'`, `fill` equal to `'none'`, `strokeLinecap` equal to `'round'`, and `strokeLinejoin` equal to `'round'`.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 6: In-progress overlay matches final object properties

*For any* active highlighter stroke, the overlay returned by the hook must have the same `color` and `width` as the `penSettings` that would be used to create the final `HighlighterObject`. After `onMouseUp` or `onMouseUp` (cancel path), the overlay must be `null`.

**Validates: Requirements 4.1, 4.2**

## Error Handling

| Scenario | Handling |
|---|---|
| `onMouseMove` called before `onMouseDown` | `isDrawingRef.current` is false; move is silently ignored |
| `onMouseUp` called with 0 or 1 points | Stroke discarded; `onAddObject` not called |
| `buildSmoothPath` receives empty array | Returns empty string `''`; `<path d="">` renders nothing |
| `ObjectRenderer` receives `HighlighterObject` with empty `points` | `buildSmoothPath` returns `''`; component returns `null` (same guard as freehand) |
| `visible: false` on a `HighlighterObject` | Rendered with `opacity: 0.3` (standard hidden-object convention) |

## Testing Strategy

### Unit tests

Focus on specific examples and edge cases:

- Render a `HighlighterObject` and assert the SVG path has `opacity=0.4`, `mixBlendMode='multiply'`, `fill='none'`.
- Render a selected `HighlighterObject` and assert a selection indicator path is present.
- Render a `HighlighterObject` with `visible: false` and assert `opacity=0.3`.
- Render `ToolSidebar` and assert the `'Выделитель'` button exists in the freehand group.
- Simulate a click on the Highlighter button and assert `setMode('highlighter')` was called.
- Simulate pointer-down on a canvas object while in `'highlighter'` mode and assert no drag state is initiated.

### Property-based tests

Use **fast-check** (already available in the JS ecosystem and compatible with Vitest).

Each property test runs a minimum of **100 iterations**.

Tag format: `// Feature: canvas-highlighter-tool, Property N: <property text>`

**Property 1 test** — `useHighlighterTool` data shape:
Generate random arrays of `{x, y}` points, a random color string, and a random width. Call `onMouseDown` + `onMouseMove` for each point + `onMouseUp`. Assert the object passed to `onAddObject` has `data.points`, `data.color`, `data.width` with correct types.
`// Feature: canvas-highlighter-tool, Property 1: HighlighterObject data shape`

**Property 2 test** — distance threshold:
Generate a starting point and a sequence of subsequent points. For each point, assert it is added to the stroke if and only if its distance from the previous recorded point is > 2px.
`// Feature: canvas-highlighter-tool, Property 2: Drawing hook collects points above threshold`

**Property 3 test** — successful stroke:
Generate random strokes with >= 2 points. Assert `onAddObject` called once with type `'highlighter'` and `publishState` called once.
`// Feature: canvas-highlighter-tool, Property 3: Successful stroke produces HighlighterObject and publishes state`

**Property 4 test** — short/cancelled strokes:
Generate strokes with 0 or 1 points. Assert `onAddObject` is never called.
`// Feature: canvas-highlighter-tool, Property 4: Short or cancelled strokes are discarded`

**Property 5 test** — rendered path attributes:
Generate random `HighlighterObject` instances with varying `data.width` values (including absent). Render via `ObjectRenderer` and assert all visual attributes are correct.
`// Feature: canvas-highlighter-tool, Property 5: Rendered path has correct visual attributes`

**Property 6 test** — overlay lifecycle:
Generate random strokes. While drawing, assert overlay is non-null and matches `penSettings`. After `onMouseUp`, assert overlay is `null`.
`// Feature: canvas-highlighter-tool, Property 6: In-progress overlay matches final object properties`
