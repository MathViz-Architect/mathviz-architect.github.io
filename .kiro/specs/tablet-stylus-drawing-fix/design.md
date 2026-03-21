# Tablet Stylus Drawing Fix — Bugfix Design

## Overview

Graphic tablet users (Wacom, Genius, etc.) cannot draw or insert shapes on the Canvas. The app
recently migrated to pointer events, and four defects in the pointer pipeline collectively block
valid stylus input: an overly strict button guard, pointer capture called on the wrong target,
a missing `pointercancel` handler, and an absent `touch-action: none` CSS rule.

The fix is surgical — four targeted changes across two files — and must not alter any existing
mouse or touch behaviour.

## Glossary

- **Bug_Condition (C)**: The set of pointer events that should start/continue/end a drawing
  operation but are incorrectly blocked or dropped by the current implementation.
- **Property (P)**: The desired outcome for any event in C — the drawing pipeline starts,
  continues, and finalises correctly.
- **Preservation**: All pointer interactions that are NOT in C must behave identically before
  and after the fix.
- **pointerType**: The `PointerEvent.pointerType` string — `'mouse'`, `'pen'`, or `'touch'`.
- **button guard**: The conditional in `handleCanvasPointerDown` that filters out non-primary
  pointer buttons.
- **pointer capture**: The browser mechanism (`setPointerCapture`) that routes all subsequent
  pointer events for a given `pointerId` to a specific element regardless of where the pointer
  moves.
- **`isBugCondition`**: Pseudocode predicate that returns `true` for any pointer event that
  triggers one of the four defects.
- **`handleCanvasPointerDown`**: The React `onPointerDown` handler in `Canvas.tsx`.
- **`useFreehandTool`**: The hook in `src/components/canvas/tools/useFreehandTool.ts` that
  manages freehand stroke state.

## Bug Details

### Bug Condition

The bug manifests across four distinct failure modes, all triggered by graphic tablet stylus
input. Together they prevent any drawing or shape insertion from completing.

**Formal Specification:**
```
FUNCTION isBugCondition(event)
  INPUT: event of type PointerEvent
  OUTPUT: boolean

  // Defect 1 — button guard rejects valid pen pointerdown
  IF event.type = 'pointerdown'
     AND event.pointerType IN ['pen', 'touch']
     AND event.button = -1
  THEN RETURN true

  // Defect 2 — pointer capture lost on fast stylus move
  IF event.type = 'pointerdown'
     AND event.pointerType IN ['pen', 'touch']
     AND setPointerCapture is called on event.target (not event.currentTarget)
  THEN RETURN true   // capture will be lost when target changes under fast move

  // Defect 3 — no pointercancel handler leaves state stuck
  IF event.type = 'pointercancel'
     AND isDrawing = true
  THEN RETURN true

  // Defect 4 — browser swallows stylus drag (touch-action not set)
  IF event.type = 'pointermove'
     AND event.pointerType IN ['pen', 'touch']
     AND canvasContainer.style.touchAction != 'none'
  THEN RETURN true

  RETURN false
END FUNCTION
```

### Examples

- **Defect 1**: User presses stylus on canvas → `pointerdown` fires with `pointerType='pen'`,
  `button=-1`. Current guard: `if (!isPenLike && e.pointerType === 'mouse' && e.button !== 0)`
  — the `isPenLike` check is correct but `setPointerCapture` is still called on `e.target`
  (Defect 2), so capture is immediately fragile.
- **Defect 2**: User draws quickly → stylus moves off the original SVG child element →
  `e.target` changes → pointer capture is lost → `pointermove` events stop arriving →
  stroke silently drops mid-draw.
- **Defect 3**: Browser fires `pointercancel` (e.g., system gesture, palm rejection) →
  no handler exists → `freehand.isDrawing` stays `true` → canvas is stuck in drawing mode
  until the user reloads.
- **Defect 4**: Canvas container has no `touch-action: none` → browser intercepts stylus
  drag for native scroll/pan → `pointermove` events never reach React handlers → stroke
  never progresses past the first point.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Standard mouse left-click (`pointerType='mouse'`, `button=0`) must continue to start all
  drawing and shape insertion operations exactly as before.
- Right-click and middle-click (`button=2`, `button=1`) must continue to be rejected by the
  button guard and must not initiate drawing.
- Middle-mouse-button pan and Space+drag pan must continue to work without interference.
- Touch input (`pointerType='touch'`) drawing and interactions must continue to work correctly.
- `pointerup` must continue to finalise strokes and publish canvas state.
- Freehand mouse strokes must produce identical output (same points, same object shape) as
  before the fix.

**Scope:**
All pointer events where `pointerType='mouse'` and `button=0` (or the existing pan/space
shortcuts) are completely outside the bug condition and must be unaffected. The CSS change
(`touch-action: none`) is additive and does not alter any existing event routing for mouse.

## Hypothesized Root Cause

1. **Incomplete button guard logic**: The guard correctly identifies `isPenLike` but the
   condition structure still allows `button=-1` pen events to slip through inconsistently
   depending on driver. The guard needs to be rewritten to: accept any `pointerType !== 'mouse'`
   unconditionally for primary-action events, and only apply the `button === 0` restriction
   to `pointerType === 'mouse'`.

2. **Wrong capture target**: `(e.target as Element).setPointerCapture(e.pointerId)` captures
   on the child SVG element that received the event. When the stylus moves fast, the hit-tested
   target changes, breaking capture. The fix is `(e.currentTarget as Element).setPointerCapture`
   — `currentTarget` is always the stable container div.

3. **Missing `pointercancel` handler**: The component handles `pointerdown`, `pointermove`,
   and `pointerup` but has no `onPointerCancel`. When the browser cancels a pointer sequence
   (palm rejection, system gesture, window blur), all drawing state remains active. The fix
   is to add `onPointerCancel` that delegates to the same cleanup logic as `pointerup`.

4. **Missing `touch-action: none`**: The canvas container div does not set `touch-action: none`,
   so the browser's default touch/stylus handling intercepts drag gestures before they reach
   the React pointer event handlers. Adding `touch-action: none` inline or via CSS gives the
   app full control over stylus drag events.

## Correctness Properties

Property 1: Bug Condition — Stylus Pointer Events Reach the Drawing Pipeline

_For any_ pointer event where `isBugCondition(event)` returns true (pen/touch pointerdown with
any button value, fast stylus move after capture, pointercancel during drawing, or stylus
pointermove without touch-action guard), the fixed Canvas SHALL correctly route the event into
the active drawing or shape insertion pipeline — starting, continuing, or gracefully terminating
the operation — without dropping the stroke or leaving drawing state stuck.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation — Mouse and Non-Buggy Pointer Behaviour Unchanged

_For any_ pointer event where `isBugCondition(event)` returns false (standard mouse left-click,
right/middle-click rejection, pan gestures, touch drawing, normal pointerup), the fixed Canvas
SHALL produce exactly the same behaviour as the original Canvas, preserving all existing drawing,
selection, pan, and shape insertion interactions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

**File 1**: `src/components/Canvas.tsx`

**Function**: `handleCanvasPointerDown`

**Specific Changes**:

1. **Fix button guard** — replace the current two-line guard:
   ```ts
   // BEFORE
   const isPenLike = e.pointerType === 'pen' || e.pointerType === 'touch' || e.pressure > 0;
   if (!isPenLike && e.pointerType === 'mouse' && e.button !== 0) return;
   ```
   with a single, unambiguous check:
   ```ts
   // AFTER
   if (e.pointerType === 'mouse' && e.button !== 0) return;
   ```
   Pen and touch events are accepted regardless of `button` value (including `-1`).

2. **Fix pointer capture target** — change:
   ```ts
   // BEFORE
   (e.target as Element).setPointerCapture(e.pointerId);
   ```
   to:
   ```ts
   // AFTER
   (e.currentTarget as Element).setPointerCapture(e.pointerId);
   ```

3. **Fix pointer release target** — apply the same correction in `handleCanvasPointerUp`:
   ```ts
   // BEFORE
   (e.target as Element).releasePointerCapture(e.pointerId);
   // AFTER
   (e.currentTarget as Element).releasePointerCapture(e.pointerId);
   ```

4. **Add `onPointerCancel` handler** — add a new handler that mirrors the cleanup in
   `handleCanvasPointerUp` (stop drawing, release capture, reset all active drawing state):
   ```ts
   const handleCanvasPointerCancel = (e: React.PointerEvent) => {
     (e.currentTarget as Element).releasePointerCapture(e.pointerId);
     if (freehand.isDrawing) freehand.onMouseUp();
     setIsPanning(false); setPanStart(null);
     setIsDrawingArrow(false); setArrowStart(null); setArrowEnd(null);
     setIsDrawingLine(false); setLineStart(null); setLineEnd(null);
     setIsDrawingShape(false); setShapeDrawStart(null); setShapeDrawEnd(null);
     setIsErasing(false);
     setIsMarqueeSelecting(false); setMarqueeStart(null); setMarqueeEnd(null);
     setIsDragging(false); setDragStart(null); setDragObjectId(null);
     setIsResizing(false); setResizeHandle(null); setResizeStartPos(null); setResizeObjectId(null);
   };
   ```
   Wire it to the container div: `onPointerCancel={handleCanvasPointerCancel}`.

5. **Add `touch-action: none`** — on the outermost canvas container `<div>` (the one that
   receives `onPointerDown`), add `style={{ touchAction: 'none' }}` (or add the class if a
   Tailwind utility is available: `touch-none`).

**File 2**: `src/components/canvas/tools/useFreehandTool.ts`

No changes required — the hook's `onMouseDown`/`onMouseMove`/`onMouseUp` API is pointer-type
agnostic. The fix in `Canvas.tsx` is sufficient to route pen events into the existing hook.

## Testing Strategy

### Validation Approach

Two-phase approach: first run exploratory tests against the **unfixed** code to surface
counterexamples and confirm root causes; then run fix-checking and preservation tests against
the **fixed** code.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each of the four defects on unfixed code.
Confirm or refute the root cause analysis.

**Test Plan**: Dispatch synthetic `PointerEvent`s with `pointerType='pen'` and `button=-1`
directly onto the canvas container and assert that drawing state is initiated. Run on unfixed
code — expect failures.

**Test Cases**:
1. **Pen pointerdown with button=-1** (Defect 1): Dispatch `pointerdown` with
   `pointerType='pen'`, `button=-1` → assert `freehand.isDrawing` becomes `true`.
   Will fail on unfixed code.
2. **Fast stylus move loses capture** (Defect 2): Dispatch `pointerdown` on a child SVG
   element, then dispatch `pointermove` on a different child → assert move events are still
   received. Will fail on unfixed code.
3. **pointercancel leaves state stuck** (Defect 3): Start a freehand stroke, dispatch
   `pointercancel` → assert `freehand.isDrawing` is `false` afterwards. Will fail on unfixed
   code (no handler exists).
4. **Stylus drag without touch-action** (Defect 4): Verify `touch-action` CSS property on
   container is `'none'`. Will fail on unfixed code.

**Expected Counterexamples**:
- Drawing state is not initiated for pen events with `button=-1`.
- `pointermove` events stop arriving after the pointer moves to a different child element.
- `freehand.isDrawing` remains `true` after `pointercancel`.
- Container `touchAction` is not `'none'`.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces
the expected drawing behaviour.

**Pseudocode:**
```
FOR ALL event WHERE isBugCondition(event) DO
  result := dispatchToFixedCanvas(event)
  ASSERT drawingPipelineActivated(result)
         OR strokeContinued(result)
         OR drawingStateCleanedUp(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed Canvas
produces the same behaviour as the original.

**Pseudocode:**
```
FOR ALL event WHERE NOT isBugCondition(event) DO
  ASSERT originalCanvas(event) = fixedCanvas(event)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random pointer event sequences automatically.
- It catches edge cases (e.g., rapid button combinations, mixed pointerType sequences) that
  manual tests miss.
- It provides strong guarantees that mouse behaviour is unchanged across the full input domain.

**Test Plan**: Observe mouse drawing behaviour on unfixed code first, capture the output, then
write property-based tests asserting the same output on fixed code.

**Test Cases**:
1. **Mouse left-click draw preservation**: Verify `pointerdown` with `pointerType='mouse'`,
   `button=0` still initiates drawing and produces the same freehand object.
2. **Right/middle-click rejection preservation**: Verify `button=1` and `button=2` mouse
   events are still rejected and do not start drawing.
3. **Pan preservation**: Verify middle-mouse-button pan and Space+drag pan still work.
4. **pointerup finalisation preservation**: Verify `pointerup` still finalises strokes and
   calls `publishState`.

### Unit Tests

- Test `handleCanvasPointerDown` with `pointerType='pen'`, `button=-1` → drawing starts.
- Test `handleCanvasPointerDown` with `pointerType='pen'`, `button=0` → drawing starts.
- Test `handleCanvasPointerDown` with `pointerType='mouse'`, `button=0` → drawing starts.
- Test `handleCanvasPointerDown` with `pointerType='mouse'`, `button=2` → drawing does NOT start.
- Test `handleCanvasPointerCancel` → all drawing state is reset to initial values.
- Test that `setPointerCapture` is called on `currentTarget`, not `target`.
- Test that canvas container has `touch-action: none` in rendered output.

### Property-Based Tests

- Generate random `pointerType IN ['pen', 'touch']` events with random `button` values and
  verify drawing always starts (Property 1).
- Generate random `pointerType='mouse'`, `button=0` event sequences and verify the resulting
  freehand object is identical before and after the fix (Property 2).
- Generate random non-drawing pointer events (pan, right-click, middle-click) and verify
  no drawing state is initiated (Property 2).

### Integration Tests

- Full stylus stroke: `pointerdown (pen)` → multiple `pointermove` → `pointerup` → assert
  a `freehand` object is added to canvas state with correct points.
- Interrupted stroke: `pointerdown (pen)` → `pointermove` → `pointercancel` → assert canvas
  is in clean idle state (no stuck drawing mode).
- Mixed input: mouse draw followed immediately by pen draw → both strokes appear as separate
  freehand objects with correct data.
- Shape insertion with stylus: `pointerdown (pen)` in `shape` mode → `pointermove` → `pointerup`
  → assert shape object is added with correct bounds.
