# Implementation Plan

- [ ] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Tap Discarded & Clear Canvas Non-Atomic
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: Tests encode expected behavior — they will validate the fix when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - **Scoped PBT Approach**: Scope each property to the concrete failing case(s) for reproducibility

  - Freehand tap test: call `onMouseDown(100, 200)` then `onMouseUp()` with no `onMouseMove`; assert `onAddObject` called once with a `freehand` object whose `data.points.length >= 2`
    - Bug condition: `currentPoints.length === 1` (single tap, no movement)
    - Expected behavior: `onAddObject` called with `data.points = [{x:100,y:200},{x:100,y:200}]`
    - Run on UNFIXED code — `currentPoints.length >= 2` guard blocks creation → **EXPECTED OUTCOME: FAIL**

  - Highlighter tap test: identical sequence for `useHighlighterTool`; assert `onAddObject` called once with a `highlighter` object whose `data.points.length >= 2`
    - Bug condition: same as freehand
    - Run on UNFIXED code → **EXPECTED OUTCOME: FAIL**

  - Rapid-tap test: call `onMouseDown`/`onMouseUp` three times in sequence (no `onMouseMove`); assert `onAddObject` called exactly 3 times
    - Run on UNFIXED code → **EXPECTED OUTCOME: FAIL** (called 0 times)

  - Clear canvas atomicity test: invoke `clearCanvas()` with `selectedObjectIds = []` and 3 objects present; assert history records exactly 1 new command and that command is a `ClearCanvasCommand`; assert a single undo restores all 3 objects
    - Bug condition: `selectedObjectIds.length === 0 AND objects.length > 0`
    - Run on UNFIXED code — `BatchCommand` of 3 `DeleteObjectCommand`s recorded → **EXPECTED OUTCOME: FAIL**

  - Document all counterexamples found to understand root cause
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Multi-Point Strokes & Selected-Delete Unchanged
  - **IMPORTANT**: Follow observation-first methodology — observe UNFIXED code behavior for non-buggy inputs first
  - **Scoped to non-bug-condition inputs**: `currentPoints.length >= 2` for stroke tools; `selectedObjectIds.length > 0` for clearCanvas

  - Multi-point freehand preservation: generate random point sequences with `length >= 2`; assert fixed tool produces identical objects to original (same `data.points`, same bounding box)
    - Observe on UNFIXED code: `onMouseDown(0,0)`, `onMouseMove(10,10)`, `onMouseUp()` → `onAddObject` called with 2 points
    - Property: for all `pts` where `pts.length >= 2`, fixed `onMouseUp` produces same object as original

  - Multi-point highlighter preservation: identical property for `useHighlighterTool`

  - Selected-delete preservation: call `clearCanvas()` with `selectedObjectIds` non-empty; assert a `BatchCommand` of `DeleteObjectCommand`s is used (unchanged code path)
    - Observe on UNFIXED code: 2 objects selected → `clearCanvas()` → `BatchCommand` with 2 sub-commands recorded

  - Undo preservation: after a multi-point stroke, assert undo removes the object (unchanged undo behavior)

  - `pointercancel` preservation: simulate `onMouseDown` then `onMouseUp` via the cancel path; assert `onAddObject` not called (stroke discarded)

  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: All preservation tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Fix canvas drawing regressions

  - [ ] 3.1 Fix `clearCanvas()` in `src/hooks/useAppState.ts`
    - In the "no selection" branch, replace the `BatchCommand` of `DeleteObjectCommand`s with a single `ClearCanvasCommand(currentObjects, setObjects)`
    - `ClearCanvasCommand` is already imported — no new imports needed
    - Remove the `commands` array and `BatchCommand` construction; replace with one `historyRef.current.execute(new ClearCanvasCommand(currentObjects, setObjects))`
    - _Bug_Condition: `state.selectedObjectIds.length === 0 AND state.objects.length > 0`_
    - _Expected_Behavior: single `ClearCanvasCommand` recorded; one undo step restores all objects_
    - _Preservation: when `selectedObjectIds.length > 0`, the `BatchCommand` path is untouched_
    - _Requirements: 2.1, 3.3, 3.4_

  - [ ] 3.2 Fix `onMouseUp` in `src/components/canvas/tools/useFreehandTool.ts`
    - Change guard from `currentPoints.length >= 2` to `currentPoints.length >= 1`
    - After reading `currentPoints`, normalize: `const pts = currentPoints.length === 1 ? [currentPoints[0], { ...currentPoints[0] }] : currentPoints;`
    - Use `pts` (not `currentPoints`) for all subsequent bounding-box and object-creation logic
    - _Bug_Condition: `currentPoints.length === 1` (tap with no pointer movement)_
    - _Expected_Behavior: `onAddObject` called with `freehand` object; `data.points` has 2 entries (tap point duplicated)_
    - _Preservation: when `currentPoints.length >= 2`, `pts === currentPoints` — behavior identical to original_
    - _Requirements: 2.2, 2.4, 3.1, 3.5_

  - [ ] 3.3 Fix `onMouseUp` in `src/components/canvas/tools/useHighlighterTool.ts`
    - Identical change to 3.2 with `type: 'highlighter'`
    - Change guard from `>= 2` to `>= 1`; add same single-point normalization using `pts`
    - _Bug_Condition: `currentPoints.length === 1` (tap with no pointer movement)_
    - _Expected_Behavior: `onAddObject` called with `highlighter` object; `data.points` has 2 entries_
    - _Preservation: multi-point highlighter strokes produce identical objects to original_
    - _Requirements: 2.3, 2.5, 3.2, 3.6_

  - [ ] 3.4 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Tap Creates Dot & Clear Canvas Is Atomic
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run all four exploration tests from step 1
    - **EXPECTED OUTCOME**: All tests PASS (confirms all three bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Multi-Point Strokes & Selected-Delete Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
    - Confirm multi-point strokes, selected-delete, undo, and cancel paths are all unchanged

- [ ] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite; confirm all tests pass
  - Ask the user if any questions arise
