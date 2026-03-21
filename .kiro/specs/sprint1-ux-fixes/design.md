# Sprint 1 UX Fixes — Bugfix Design

## Overview

Three issues are addressed in this sprint:

1. **BUG 1 (CRITICAL)** — Canvas event handlers are wired to `onMouseDown/Move/Up` (React synthetic mouse events). Stylus and touch input arrives as `PointerEvent` with `pointerType === 'pen'` or `'touch'`, which never matches the mouse-only code paths. Fix: replace mouse handlers on the canvas viewport with pointer handlers and update the button-press guard.

2. **BUG 2** — The `shapeType === 'polygon'` case is absent from the `switch` in `Canvas.tsx`'s `handleCanvasMouseUp`, so polygon draws fall through to the `default` branch and produce a `type: 'rectangle'` object. The SVG draw-preview IIFE also has no `polygon` branch. Fix: add both cases.

3. **FEATURE** — "Clear Board" button in `TopBar`, teacher-only, undoable. The existing `clearCanvas()` in `useAppState` already uses `BatchCommand` + `CommandHistory`, so the feature only needs a UI button and a `publishLocalChange` call after execution.

---

## Glossary

- **Bug_Condition (C)**: The set of inputs that trigger the defect.
- **Property (P)**: The correct output/behavior expected for inputs in C.
- **Preservation**: Behaviors that must remain byte-for-byte identical after the fix.
- **`handleCanvasMouseDown/Move/Up`**: The three React synthetic-event handlers in `Canvas.tsx` that route all drawing actions.
- **`useFreehandTool`**: Hook in `src/components/canvas/tools/useFreehandTool.ts` — exposes `onMouseDown(x,y)`, `onMouseMove(x,y)`, `onMouseUp()` (coordinate-only, pointer-type-agnostic).
- **`shapeType`**: String from `EditorContext` that selects which shape to create (`'rectangle'`, `'circle'`, `'triangle'`, `'polygon'`, `'geoshape-*'`).
- **`clearCanvas()`**: Existing function in `useAppState` — deletes all objects via `BatchCommand` through `CommandHistory`, fully undoable.
- **`publishLocalChange(snapshot)`**: Yjs sync entry point — MUST be called after every state-mutating action.
- **`canEdit`**: Boolean from `useCollaborationContext` — false for student role.
- **`roomState.role`**: `'teacher' | 'student' | null` from `useCollaborationContext`.

---

## Bug Details

### BUG 1 — Stylus Input Ignored

#### Bug Condition

The canvas viewport attaches `onMouseDown`, `onMouseMove`, `onMouseUp` React handlers. These fire only for `pointerType === 'mouse'`. Stylus (`pen`) and touch events are dispatched as `PointerEvent` but the React synthetic `MouseEvent` handlers do not fire for them unless the browser synthesizes compatibility mouse events — which is suppressed when `touch-action: none` is set on the viewport.

Additionally, the existing guard `if (e.button !== 0) return` rejects stylus barrel-button presses where `e.button` may be `5` but `e.buttons === 1` (primary contact active).

**Formal Specification:**
```
FUNCTION isBugCondition_Stylus(E)
  INPUT: E of type PointerEvent
  OUTPUT: boolean

  RETURN (E.pointerType = 'pen' OR E.pointerType = 'touch')
         AND E.buttons > 0
         AND drawing_action_started = FALSE
END FUNCTION
```

#### Examples

- User draws with Apple Pencil → cursor moves, no stroke created.
- User taps with finger in shape mode → no shape drawn.
- User presses stylus barrel button while drawing → event ignored because `e.button !== 0`.
- Mouse left-click → works correctly (not in bug condition).

---

### BUG 2 — Polygon Renders as Rectangle

#### Bug Condition

In `Canvas.tsx` `handleCanvasMouseUp`, the `switch (shapeType)` block handles `'circle'`, `'triangle'`, `'geoshape-circle'`, `'geoshape-triangle'`, `'geoshape-quad'`, and falls through to `default` for everything else — including `'polygon'`. The draw-preview SVG overlay (rendered during `isDrawingShape`) also has no `polygon` branch.

**Formal Specification:**
```
FUNCTION isBugCondition_Polygon(shapeType)
  INPUT: shapeType of type string
  OUTPUT: boolean

  RETURN shapeType = 'polygon'
END FUNCTION
```

#### Examples

- User selects pentagon tool, draws → object created with `type: 'rectangle'`, renders as rectangle.
- Draw-preview during drag shows a `<rect>` instead of a `<polygon>`.
- User selects circle tool, draws → `type: 'circle'` created correctly (not in bug condition).

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Mouse (`pointerType === 'mouse'`) drawing for all modes (freehand, shape, arrow, line, eraser, geo tools) must be identical before and after the fix.
- `type: 'rectangle'`, `'circle'`, `'triangle'`, `'geoshape'` creation logic is untouched.
- Yjs collaboration sync, undo/redo, and `publishState()` call sites are unchanged.
- Student role cannot edit canvas — `canEdit` guard remains in place.
- "Clear Board" button is invisible to students (`roomState.role !== 'teacher'`).

**Scope:**
All inputs where `pointerType === 'mouse'` and `shapeType !== 'polygon'` must produce exactly the same result as before.

---

## Hypothesized Root Cause

### BUG 1

1. **Wrong event type on viewport**: `onMouseDown/Move/Up` props on the canvas `<div>` only fire for synthesized mouse events. Stylus/touch events are `PointerEvent` and require `onPointerDown/Move/Up`.

2. **Button guard rejects stylus barrel**: `if (e.button !== 0) return` in `handleCanvasMouseDown` rejects events where `e.button` is non-zero (stylus barrel button). The correct guard for "no active contact" is `if (e.buttons === 0) return`.

3. **`touch-action` may not be set**: If the viewport container lacks `touch-action: none`, the browser may consume pointer events for scrolling before they reach React handlers.

### BUG 2

1. **Missing `case 'polygon'`** in the `switch (shapeType)` block inside `handleCanvasMouseUp` in `Canvas.tsx`.

2. **Missing polygon preview branch** in the draw-preview IIFE inside the SVG overlay section of `Canvas.tsx`.

3. **`ObjectRenderer.tsx` already has a `case 'polygon'`** that renders `<polygon points="...">` using normalized `data.points` — so the renderer is correct; only creation is broken.

---

## Correctness Properties

Property 1: Bug Condition — Stylus/Touch Pointer Events Trigger Drawing

_For any_ `PointerEvent` E where `isBugCondition_Stylus(E)` is true (pointerType is `'pen'` or `'touch'` and `buttons > 0`), the fixed canvas pointer handlers SHALL start, continue, and finalize a drawing action (freehand stroke or shape) identically to how a `pointerType === 'mouse'` event with the same coordinates would behave.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation — Mouse Input Behavior Unchanged

_For any_ `PointerEvent` E where `isBugCondition_Stylus(E)` is false (i.e., `pointerType === 'mouse'`), the fixed canvas handlers SHALL produce exactly the same drawing state transitions as the original handlers, preserving all existing mouse-based drawing behavior.

**Validates: Requirements 3.1**

Property 3: Bug Condition — Polygon Shape Creation

_For any_ draw action where `isBugCondition_Polygon(shapeType)` is true (shapeType is `'polygon'`), the fixed `handleCanvasMouseUp` SHALL create an object with `type: 'polygon'` and `data.points` containing normalized vertex coordinates for the correct polygon geometry.

**Validates: Requirements 2.5, 2.6**

Property 4: Preservation — Non-Polygon Shape Creation Unchanged

_For any_ draw action where `isBugCondition_Polygon(shapeType)` is false (shapeType is not `'polygon'`), the fixed `handleCanvasMouseUp` SHALL produce exactly the same object as the original code, preserving all existing shape creation behavior.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

---

## Fix Implementation

### BUG 1 — Stylus Support

**File**: `src/components/Canvas.tsx`

**Changes**:

1. **Replace mouse event props with pointer event props on the viewport `<div>`**:
   ```
   // REMOVE:
   onMouseDown={handleCanvasMouseDown}
   onMouseMove={handleCanvasMouseMove}
   onMouseUp={handleCanvasMouseUp}

   // ADD:
   onPointerDown={handleCanvasPointerDown}
   onPointerMove={handleCanvasPointerMove}
   onPointerUp={handleCanvasPointerUp}
   ```

2. **Rename handlers** (or add pointer-specific wrappers that delegate to the same logic):
   - `handleCanvasMouseDown` → `handleCanvasPointerDown` — accepts `React.PointerEvent<HTMLDivElement>`
   - `handleCanvasMouseMove` → `handleCanvasPointerMove`
   - `handleCanvasMouseUp` → `handleCanvasPointerUp`

3. **Replace button guard** in `handleCanvasPointerDown`:
   ```
   // REMOVE:
   if (e.button !== 0) return;

   // ADD (skip only if no active contact — covers mouse, pen, touch):
   if (e.buttons === 0) return;
   ```

4. **Add `touch-action: none`** on the viewport container `<div>` (the element that receives pointer events) to prevent browser scroll/zoom from consuming pointer events before React sees them:
   ```tsx
   style={{ touchAction: 'none', ... }}
   ```

5. **`handleObjectMouseDown`** — this handler is passed to `ObjectRenderer` as `onMouseDown`. Since `ObjectRenderer` uses `onMouseDown` on SVG `<g>` elements, and SVG elements do receive pointer events via `onPointerDown`, update the prop name and type:
   - Rename prop `onMouseDown` → `onPointerDown` in `ObjectRendererProps`
   - Update the `md` binding inside `ObjectRenderer`: `const md = (e: React.PointerEvent) => onPointerDown(e, obj.id)`
   - Update `handleObjectMouseDown` signature to accept `React.PointerEvent`

**File**: `src/components/canvas/tools/useFreehandTool.ts`

No changes needed — `onMouseDown(x, y)`, `onMouseMove(x, y)`, `onMouseUp()` are coordinate-only and pointer-type-agnostic. The fix is entirely in the event routing layer in `Canvas.tsx`.

---

### BUG 2 — Polygon Shape Creation

**File**: `src/components/Canvas.tsx`

**Change 1 — Add `case 'polygon'` to the shape creation switch** (inside `handleCanvasPointerUp`, in the `isDrawingShape` block):

```typescript
case 'polygon': {
  // Pentagon (5 vertices) as default polygon; normalized to [0,1] space
  const sides = 5;
  const points = Array.from({ length: sides }, (_, i) => {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    return {
      x: 0.5 + 0.5 * Math.cos(angle),  // normalized [0,1]
      y: 0.5 + 0.5 * Math.sin(angle),
    };
  });
  newShape = {
    id, type: 'polygon',
    x: sx, y: sy, width: w, height: h,
    rotation: 0, opacity: 1, visible: true, locked: false,
    data: { points, fill: '#F59E0B', stroke: '#D97706', strokeWidth: 2 },
  };
  break;
}
```

**Change 2 — Add polygon preview to the SVG draw-overlay IIFE**:

The draw-preview renders a temporary shape while the user is dragging. Add a `polygon` branch alongside the existing `circle` and `triangle` branches:

```typescript
// Inside the draw-preview IIFE, after the triangle branch:
if (shapeType === 'polygon') {
  const sides = 5;
  const cx = sx + w / 2, cy = sy + h / 2;
  const pts = Array.from({ length: sides }, (_, i) => {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    return `${cx + (w / 2) * Math.cos(angle)},${cy + (h / 2) * Math.sin(angle)}`;
  }).join(' ');
  return <polygon points={pts} fill="#F59E0B" stroke="#D97706" strokeWidth={2} fillOpacity={0.3} />;
}
```

**File**: `src/components/canvas/ObjectRenderer.tsx`

No changes needed — `case 'polygon'` already exists and correctly renders using `data.points`.

---

### FEATURE — Clear Board Button

**File**: `src/lib/commands.ts`

Add `ClearCanvasCommand` following the existing pattern:

```typescript
export class ClearCanvasCommand implements Command {
  description = 'Очистить холст';
  private previousObjects: AnyCanvasObject[];

  constructor(
    private objects: AnyCanvasObject[],
    private setObjects: (objects: AnyCanvasObject[]) => void
  ) {
    this.previousObjects = [...objects];
  }

  execute() {
    this.setObjects([]);
  }

  undo() {
    this.setObjects(this.previousObjects);
  }
}
```

Note: The existing `clearCanvas()` in `useAppState` uses `BatchCommand` of individual `DeleteObjectCommand`s, which works but is verbose. `ClearCanvasCommand` is simpler and stores the full snapshot for undo — preferred for this feature.

**File**: `src/hooks/useAppState.ts`

Expose a `clearBoard` function that uses `ClearCanvasCommand` (distinct from the existing `clearCanvas` which also handles partial selection deletion):

```typescript
const clearBoard = useCallback(() => {
  const command = new ClearCanvasCommand(objectsRef.current, setObjects);
  historyRef.current.execute(command);
  setState(prev => ({ ...prev, selectedObjectIds: [] }));
}, [setObjects]);
```

Add `clearBoard` to the return value.

**File**: `src/contexts/EditorContext.tsx`

Expose `clearBoard` from `useAppState` through the context value (alongside existing `clearCanvas`).

**File**: `src/components/TopBar.tsx`

1. Import `Trash2` from `lucide-react` (already imported).
2. Pull `clearBoard` from `useEditorContext`.
3. Pull `canEdit`, `roomState`, `publishLocalChange`, `getCanvasSnapshot` — `canEdit` and `roomState` from `useCollaborationContext` (already imported).
4. Add button, visible only when `roomState.role === 'teacher'`:

```tsx
{roomState.role === 'teacher' && (
  <button
    onClick={() => {
      clearBoard();
      publishLocalChange(getCanvasSnapshot());
    }}
    className="p-1.5 rounded hover:bg-red-50 text-red-500"
    title="Очистить холст"
  >
    <Trash2 size={18} />
  </button>
)}
```

Place this button in the right-side actions section, before the Share button divider.

---

## Testing Strategy

### Validation Approach

Two-phase: first run exploratory tests on unfixed code to confirm root causes, then run fix-checking and preservation tests on fixed code.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples on unfixed code to confirm root cause analysis.

**Test Plan**: Dispatch synthetic `PointerEvent` with `pointerType: 'pen'` on the canvas element and assert that drawing state is activated. Run on unfixed code — expect failure.

**Test Cases**:
1. **Stylus pointerdown — freehand mode**: Dispatch `pointerdown` with `pointerType: 'pen'`, `buttons: 1` on canvas in freehand mode → assert `freehand.isDrawing === true` (will fail on unfixed code — `onMouseDown` not called).
2. **Stylus pointermove — freehand mode**: After pointerdown, dispatch `pointermove` → assert points array grows (will fail).
3. **Stylus pointerup — freehand mode**: After pointermove, dispatch `pointerup` → assert a `freehand` object is added to canvas (will fail).
4. **Polygon shape creation**: Set `shapeType = 'polygon'`, simulate mousedown + mouseup drag → assert created object has `type === 'polygon'` (will fail — gets `'rectangle'`).

**Expected Counterexamples**:
- `freehand.isDrawing` remains `false` after stylus pointerdown.
- Created shape has `type: 'rectangle'` when `shapeType === 'polygon'`.

---

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces the expected behavior.

**Pseudocode:**
```
FOR ALL E WHERE isBugCondition_Stylus(E) DO
  result := handleCanvasPointerDown_fixed(E)
  ASSERT drawing_state_activated(result) = TRUE
END FOR

FOR ALL S WHERE isBugCondition_Polygon(S) DO
  result := handleCanvasPointerUp_fixed(S, drawBounds)
  ASSERT result.type = 'polygon'
  ASSERT result.data.points IS array of length >= 3
END FOR
```

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original.

**Pseudocode:**
```
FOR ALL E WHERE NOT isBugCondition_Stylus(E) DO  // pointerType = 'mouse'
  ASSERT handleCanvasPointerDown_original(E) = handleCanvasPointerDown_fixed(E)
END FOR

FOR ALL S WHERE NOT isBugCondition_Polygon(S) DO  // shapeType != 'polygon'
  ASSERT createShape_original(S, bounds) = createShape_fixed(S, bounds)
END FOR
```

**Testing Approach**: Property-based testing generates random `pointerType: 'mouse'` events and random non-polygon `shapeType` values to verify preservation across the full input domain.

**Test Cases**:
1. **Mouse freehand preservation**: Random mouse pointerdown/move/up sequences → same freehand objects created.
2. **Rectangle/circle/triangle preservation**: Random draw bounds with each non-polygon shapeType → same object type and data.
3. **Clear board undo**: After `clearBoard()`, call `undo()` → all objects restored exactly.
4. **Student role**: `roomState.role === 'student'` → Clear Board button not rendered.

---

### Unit Tests

- Stylus `pointerdown` with `pointerType: 'pen'` activates freehand drawing.
- Stylus `pointerup` finalizes stroke and calls `publishState`.
- `shapeType === 'polygon'` creates object with `type: 'polygon'` and 5-vertex `data.points`.
- Polygon draw-preview renders `<polygon>` SVG element (not `<rect>`).
- `ClearCanvasCommand.execute()` sets objects to `[]`.
- `ClearCanvasCommand.undo()` restores previous objects array.
- Clear Board button not rendered when `roomState.role !== 'teacher'`.

### Property-Based Tests

- For any `pointerType` in `['mouse', 'pen', 'touch']` with `buttons > 0`, freehand drawing produces a valid stroke object.
- For any `shapeType` in `['rectangle', 'circle', 'triangle']`, shape creation result is identical before and after the polygon fix.
- For any canvas state, `clearBoard()` followed by `undo()` restores the exact same objects array.

### Integration Tests

- Full stylus draw flow: pointerdown → pointermove (multiple) → pointerup → object appears on canvas and is synced via Yjs.
- Polygon draw: select polygon tool → drag → release → polygon object rendered by `ObjectRenderer` with correct vertex count.
- Clear Board: teacher clicks button → canvas empty → undo → objects restored → Yjs state consistent.
- Collaboration: student connected to room → Clear Board button absent from their TopBar.
