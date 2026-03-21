# Canvas Drawing Regressions Bugfix Design

## Overview

Three regressions in the canvas drawing system require targeted fixes:

1. **Clear Canvas non-atomic**: `clearCanvas()` in `useAppState.ts` builds a `BatchCommand` of individual `DeleteObjectCommand`s when no objects are selected. Each undo step removes one object. Fix: replace with a single `ClearCanvasCommand` (already used by `clearBoard`).

2. **Tap creates no dot (freehand)**: `useFreehandTool.ts` guards `onMouseUp` with `currentPoints.length >= 2`. A tap with no pointer movement produces exactly 1 point → silently discarded. Fix: lower threshold to `>= 1` and duplicate the single point so the renderer has a valid 2-point segment.

3. **Tap creates no dot (highlighter)**: Identical issue in `useHighlighterTool.ts`.

All three fixes are surgical — no architectural changes, no new abstractions.

---

## Glossary

- **Bug_Condition (C)**: The set of inputs/states that trigger defective behavior
- **Property (P)**: The desired correct behavior when C holds
- **Preservation**: Existing correct behaviors that must remain unchanged after the fix
- **`clearCanvas()`**: Function in `src/hooks/useAppState.ts` (~line 234) that either deletes selected objects or clears the entire canvas
- **`clearBoard()`**: Separate function in `useAppState.ts` that always clears all objects using `ClearCanvasCommand` — the correct pattern
- **`ClearCanvasCommand`**: Command in `src/lib/commands.ts` that atomically sets objects to `[]` and restores them on undo
- **`BatchCommand`**: Command wrapper that groups multiple commands — each sub-command is individually undoable
- **`onMouseUp`**: Handler in `useFreehandTool` / `useHighlighterTool` that finalizes a stroke and calls `onAddObject`
- **`pointsRef`**: Ref mirror of the `points` state array, read synchronously in `onMouseUp` to avoid stale closures
- **`currentPoints`**: Local snapshot of `pointsRef.current` read at the start of `onMouseUp`

---

## Bug Details

### Bug 1: Clear Canvas Not Atomic

The `clearCanvas()` function uses different code paths for "delete selected" vs "clear all". The "clear all" path incorrectly mirrors the "delete selected" pattern, wrapping individual `DeleteObjectCommand`s in a `BatchCommand` instead of using the existing `ClearCanvasCommand`.

**Formal Specification:**
```
FUNCTION isBugCondition_clearCanvas(state)
  INPUT: state of type AppState
  OUTPUT: boolean

  RETURN state.selectedObjectIds.length === 0
         AND state.objects.length > 0
         AND clearCanvas_was_invoked
END FUNCTION
```

**Examples:**
- Canvas has 5 objects, none selected → user clicks "Очистить холст" → all 5 disappear, but undo restores them one at a time (5 undo steps needed) ← BUG
- Canvas has 5 objects, 2 selected → user clicks "Очистить холст" → only 2 deleted (batch, correct behavior, unchanged)
- Canvas has 0 objects, none selected → user clicks "Очистить холст" → no-op (correct, unchanged)

### Bug 2 & 3: Tap Creates No Dot

Both `useFreehandTool.ts` and `useHighlighterTool.ts` have the same guard in `onMouseUp`:

```typescript
if (currentPoints.length >= 2) { ... }
```

A tap (pointerdown → pointerup with no movement) records exactly 1 point in `pointsRef`. The guard silently discards it.

**Formal Specification:**
```
FUNCTION isBugCondition_tap(event)
  INPUT: event sequence of type PointerEvent[]
  OUTPUT: boolean

  RETURN event.includes(pointerdown)
         AND event.includes(pointerup)
         AND NOT event.includes(pointermove_beyond_threshold)
         AND currentPoints.length === 1
END FUNCTION
```

**Examples:**
- User taps canvas in freehand mode (no movement) → `currentPoints = [{x:100, y:200}]` → `length >= 2` is false → nothing drawn ← BUG
- User taps canvas in highlighter mode (no movement) → same result ← BUG
- User draws a stroke (moves pointer) → `currentPoints.length >= 2` → object created (correct, unchanged)
- User taps rapidly 3 times → each tap produces 1 point → all 3 discarded ← BUG

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Multi-point freehand strokes (pointer moves during draw) must continue to create `freehand` objects with all recorded points
- Multi-point highlighter strokes must continue to create `highlighter` objects with all recorded points
- "Очистить холст" with selected objects must continue to delete only selected objects via `BatchCommand`
- Undo of a full canvas clear must restore all objects in a single undo step
- `pointercancel` during freehand/highlighter drawing must continue to discard the in-progress stroke without adding an object
- The `> 2px` movement threshold in `onMouseMove` must remain unchanged (only `onMouseUp` threshold changes)

**Scope:**
All inputs that do NOT match the bug conditions above are completely unaffected. This includes:
- Any drawing operation where the pointer moves (multi-point strokes)
- Any "Очистить холст" invocation with objects selected
- All other canvas tools (arrow, line, shape, eraser, geo tools)

---

## Hypothesized Root Cause

### Bug 1: Clear Canvas Not Atomic

The `clearCanvas()` function was written to handle two cases (selected delete vs full clear) but the "full clear" branch was implemented by copy-pasting the "selected delete" pattern rather than delegating to the existing `clearBoard()` / `ClearCanvasCommand`. The `clearBoard()` function already does exactly what's needed.

### Bug 2 & 3: Tap Creates No Dot

The `>= 2` guard was likely added to prevent degenerate single-point paths from being passed to the SVG renderer (which needs at least 2 points for a valid path). The fix is to normalize the single-point case by duplicating the point, giving the renderer a valid zero-length segment that renders as a dot.

---

## Correctness Properties

Property 1: Bug Condition - Clear Canvas Is Atomic

_For any_ app state where `selectedObjectIds` is empty and `objects` is non-empty, invoking `clearCanvas()` SHALL execute a single `ClearCanvasCommand` such that exactly one undo step restores all previously cleared objects.

**Validates: Requirements 2.1, 3.4**

Property 2: Bug Condition - Tap Creates a Dot (Freehand)

_For any_ pointer event sequence where `isBugCondition_tap` holds in freehand mode, the fixed `onMouseUp` SHALL call `onAddObject` with a `freehand` object whose `data.points` contains at least 2 entries (the tap point duplicated), resulting in a visible dot at the tap location.

**Validates: Requirements 2.2, 2.4**

Property 3: Bug Condition - Tap Creates a Dot (Highlighter)

_For any_ pointer event sequence where `isBugCondition_tap` holds in highlighter mode, the fixed `onMouseUp` SHALL call `onAddObject` with a `highlighter` object whose `data.points` contains at least 2 entries (the tap point duplicated), resulting in a visible dot at the tap location.

**Validates: Requirements 2.3, 2.5**

Property 4: Preservation - Multi-Point Strokes Unchanged

_For any_ pointer event sequence where `isBugCondition_tap` does NOT hold (i.e., `currentPoints.length >= 2`), the fixed `onMouseUp` in both `useFreehandTool` and `useHighlighterTool` SHALL produce exactly the same object as the original code, preserving all multi-point stroke behavior.

**Validates: Requirements 3.1, 3.2, 3.5, 3.6**

Property 5: Preservation - Selected-Object Delete Unchanged

_For any_ app state where `selectedObjectIds.length > 0`, invoking `clearCanvas()` SHALL produce exactly the same result as the original code (batch delete of selected objects only), preserving all selective-delete behavior.

**Validates: Requirements 3.3**

---

## Fix Implementation

### Fix 1: `src/hooks/useAppState.ts` — `clearCanvas()`

Replace the "clear all" branch's `BatchCommand` of `DeleteObjectCommand`s with a single `ClearCanvasCommand`.

**Current code (buggy):**
```typescript
} else {
  // Otherwise, clear entire canvas
  const commands = currentObjects.map(
    obj => new DeleteObjectCommand(currentObjects, obj.id, setObjects)
  );
  const batchCommand = new BatchCommand(commands, 'Очистить холст');
  historyRef.current.execute(batchCommand);
}
```

**Fixed code:**
```typescript
} else {
  // Otherwise, clear entire canvas atomically
  const command = new ClearCanvasCommand(currentObjects, setObjects);
  historyRef.current.execute(command);
}
```

No other changes needed. `ClearCanvasCommand` is already imported.

### Fix 2: `src/components/canvas/tools/useFreehandTool.ts` — `onMouseUp`

Normalize single-point case before the existing object-creation block.

**Current code (buggy):**
```typescript
if (currentPoints.length >= 2) {
    // ... create freehand object
}
```

**Fixed code:**
```typescript
// Normalize tap (single point) → duplicate to form a valid 2-point segment
const normalizedPoints = currentPoints.length === 1
    ? [currentPoints[0], { ...currentPoints[0] }]
    : currentPoints;

if (normalizedPoints.length >= 1) {
    const xs = normalizedPoints.map(p => p.x);
    const ys = normalizedPoints.map(p => p.y);
    // ... rest of object creation using normalizedPoints
}
```

Alternatively (minimal diff): change the guard to `>= 1` and prepend the normalization:

```typescript
if (currentPoints.length >= 1) {
    const pts = currentPoints.length === 1
        ? [currentPoints[0], { ...currentPoints[0] }]
        : currentPoints;
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const maxX = Math.max(...xs), maxY = Math.max(...ys);
    const newPath: AnyCanvasObject = {
        id: crypto.randomUUID(),
        type: 'freehand',
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, 1),
        height: Math.max(maxY - minY, 1),
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        data: { points: pts, color: penSettings.color, width: penSettings.width },
    };
    onAddObject(newPath);
    publishState();
}
```

### Fix 3: `src/components/canvas/tools/useHighlighterTool.ts` — `onMouseUp`

Identical change to Fix 2, with `type: 'highlighter'` instead of `type: 'freehand'`.

---

## Testing Strategy

### Validation Approach

Two-phase approach: first surface counterexamples on unfixed code to confirm root cause, then verify the fix and preservation.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write unit tests that directly invoke the buggy functions with bug-condition inputs and assert the expected (correct) behavior. Run on UNFIXED code — tests should fail, confirming the root cause.

**Test Cases:**

1. **Clear Canvas Atomicity Test**: Call `clearCanvas()` with empty `selectedObjectIds` and 3 objects present. Assert that `historyRef` contains exactly 1 command (not 3). Assert that a single undo restores all 3 objects. (Will fail on unfixed code — `BatchCommand` with 3 sub-commands is recorded.)

2. **Freehand Tap Test**: Call `onMouseDown(100, 200)` then `onMouseUp()` without any `onMouseMove`. Assert that `onAddObject` was called once with a `freehand` object. (Will fail on unfixed code — `currentPoints.length === 1 < 2`, guard blocks creation.)

3. **Highlighter Tap Test**: Same as above for `useHighlighterTool`. (Will fail on unfixed code.)

4. **Rapid Tap Test**: Call `onMouseDown` / `onMouseUp` three times in sequence without `onMouseMove`. Assert `onAddObject` called 3 times. (Will fail on unfixed code.)

**Expected Counterexamples:**
- `onAddObject` is never called for single-tap sequences
- Undo history has N entries after clearing N objects instead of 1

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL state WHERE isBugCondition_clearCanvas(state) DO
  clearCanvas_fixed(state)
  ASSERT historyRef.commands.length === previousLength + 1
  ASSERT historyRef.lastCommand instanceof ClearCanvasCommand
  ASSERT objects === []
  undo()
  ASSERT objects === previousObjects
END FOR

FOR ALL eventSeq WHERE isBugCondition_tap(eventSeq) DO
  simulate(eventSeq, useFreehandTool_fixed)
  ASSERT onAddObject.calledOnce
  ASSERT onAddObject.args[0].data.points.length >= 2
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed functions produce the same result as the original.

**Pseudocode:**
```
FOR ALL state WHERE NOT isBugCondition_clearCanvas(state) DO
  ASSERT clearCanvas_original(state) === clearCanvas_fixed(state)
END FOR

FOR ALL eventSeq WHERE NOT isBugCondition_tap(eventSeq) DO
  ASSERT useFreehandTool_original(eventSeq) === useFreehandTool_fixed(eventSeq)
  ASSERT useHighlighterTool_original(eventSeq) === useHighlighterTool_fixed(eventSeq)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random point sequences automatically
- It catches edge cases (2-point strokes, very long strokes, strokes with duplicate points)
- It provides strong guarantees that multi-point stroke behavior is unchanged

**Test Cases:**
1. **Multi-Point Freehand Preservation**: Generate random point sequences with length >= 2. Assert fixed tool produces identical objects to original.
2. **Multi-Point Highlighter Preservation**: Same for highlighter.
3. **Selected-Delete Preservation**: Call `clearCanvas()` with `selectedObjectIds` non-empty. Assert `BatchCommand` of `DeleteObjectCommand`s is used (unchanged path).
4. **Undo Preservation**: After a multi-point stroke, assert undo removes the object (unchanged undo behavior).

### Unit Tests

- Test `clearCanvas()` with no selection: assert single `ClearCanvasCommand` in history
- Test `clearCanvas()` with selection: assert `BatchCommand` of `DeleteObjectCommand`s (unchanged)
- Test `onMouseUp` after tap (1 point): assert `onAddObject` called with 2-point `data.points`
- Test `onMouseUp` after stroke (N >= 2 points): assert `onAddObject` called with original N points
- Test `onMouseUp` without prior `onMouseDown`: assert `onAddObject` not called
- Test `pointercancel` path: assert `onAddObject` not called

### Property-Based Tests

- Generate random `points[]` with `length >= 2` → assert fixed `onMouseUp` produces same object as original
- Generate random `objects[]` with `selectedObjectIds = []` → assert fixed `clearCanvas` records exactly 1 history entry
- Generate random `objects[]` with `selectedObjectIds` non-empty → assert fixed `clearCanvas` records same `BatchCommand` as original

### Integration Tests

- Full tap flow in freehand mode: pointerdown → pointerup → assert dot visible on canvas
- Full tap flow in highlighter mode: same
- Full clear flow: add 5 objects → clear → assert canvas empty → undo → assert all 5 restored in one step
- Multi-stroke session: mix of taps and strokes → assert all produce objects
