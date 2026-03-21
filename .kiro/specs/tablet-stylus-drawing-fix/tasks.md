# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Stylus Pointer Events Blocked by Defective Pipeline
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate all four defects on unfixed Canvas.tsx
  - **Scoped PBT Approach**: Scope each sub-property to the concrete failing case to ensure reproducibility
  - Test file: `src/components/Canvas.stylus-bug.test.tsx`
  - Sub-property A — Defect 1 (button guard): dispatch synthetic `pointerdown` with `pointerType='pen'`, `button=-1` onto the canvas container; assert `freehand.isDrawing` becomes `true`. Will FAIL on unfixed code because the `isPenLike` guard still lets `button=-1` slip through inconsistently.
  - Sub-property B — Defect 2 (capture target): dispatch `pointerdown` on a child SVG element, then dispatch `pointermove` on a different child element; assert the move event is still received by the container handler. Will FAIL on unfixed code because `setPointerCapture` is called on `e.target` (the child) not `e.currentTarget` (the stable container).
  - Sub-property C — Defect 3 (missing pointercancel): start a freehand stroke, then dispatch `pointercancel`; assert `freehand.isDrawing` is `false` afterwards. Will FAIL on unfixed code because no `onPointerCancel` handler exists.
  - Sub-property D — Defect 4 (touch-action): render the canvas container and assert its computed `touchAction` style is `'none'`. Will FAIL on unfixed code because the property is absent.
  - Run all sub-properties on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found (e.g., "pen pointerdown with button=-1 does not set isDrawing=true", "freehand.isDrawing remains true after pointercancel", "touchAction is not 'none'")
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Mouse and Non-Buggy Pointer Behaviour Unchanged
  - **IMPORTANT**: Follow observation-first methodology — observe actual behaviour on UNFIXED code first
  - Test file: `src/components/Canvas.preservation.test.tsx`
  - Observe: `pointerdown` with `pointerType='mouse'`, `button=0` sets `freehand.isDrawing=true` on unfixed code
  - Observe: `pointerdown` with `pointerType='mouse'`, `button=2` does NOT set `freehand.isDrawing=true` on unfixed code
  - Observe: `pointerdown` with `pointerType='mouse'`, `button=1` does NOT set `freehand.isDrawing=true` on unfixed code
  - Observe: `pointerup` after a freehand stroke calls `publishState` and resets `freehand.isDrawing` to `false`
  - Write property-based test: for all `pointerType='mouse'`, `button=0` pointerdown events, drawing state is initiated (from Preservation Requirements 3.1 in design)
  - Write property-based test: for all `button=1` or `button=2` mouse pointerdown events, drawing state is NOT initiated (from Preservation Requirements 3.2 in design)
  - Write property-based test: for all `pointerup` events following a started stroke, `freehand.isDrawing` becomes `false` and `publishState` is called (from Preservation Requirements 3.5 in design)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behaviour to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Fix tablet stylus drawing pipeline in Canvas.tsx

  - [x] 3.1 Simplify button guard in handleCanvasPointerDown
    - Remove the two-line `isPenLike` guard:
      ```ts
      // DELETE these two lines:
      const isPenLike = e.pointerType === 'pen' || e.pointerType === 'touch' || e.pressure > 0;
      if (!isPenLike && e.pointerType === 'mouse' && e.button !== 0) return;
      ```
    - Replace with single unambiguous check:
      ```ts
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      ```
    - Pen and touch events are now accepted regardless of `button` value (including `-1`)
    - _Bug_Condition: isBugCondition(event) — Defect 1: pointerType IN ['pen','touch'] AND button=-1_
    - _Expected_Behavior: drawing pipeline starts for all pen/touch pointerdown events_
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 Fix pointer capture target in handleCanvasPointerDown
    - Change `(e.target as Element).setPointerCapture(e.pointerId)` to `(e.currentTarget as Element).setPointerCapture(e.pointerId)`
    - `currentTarget` is always the stable container div; `target` changes when the stylus moves over child SVG elements
    - _Bug_Condition: isBugCondition(event) — Defect 2: setPointerCapture called on e.target_
    - _Expected_Behavior: pointer capture is retained on the container for the full stroke duration_
    - _Requirements: 2.3_

  - [x] 3.3 Fix pointer release target in handleCanvasPointerUp
    - Change `(e.target as Element).releasePointerCapture(e.pointerId)` to `(e.currentTarget as Element).releasePointerCapture(e.pointerId)`
    - Matches the corrected capture target from 3.2
    - _Requirements: 2.3_

  - [x] 3.4 Add handleCanvasPointerCancel handler
    - Add new handler that mirrors cleanup logic from handleCanvasPointerUp:
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
    - Wire to the canvas container div: add `onPointerCancel={handleCanvasPointerCancel}`
    - _Bug_Condition: isBugCondition(event) — Defect 3: pointercancel fires while isDrawing=true_
    - _Expected_Behavior: all drawing state is reset to idle; no stuck drawing mode_
    - _Preservation: pointerup finalisation path is unchanged (3.5)_
    - _Requirements: 2.4_

  - [x] 3.5 Add touch-action: none to canvas container div
    - The canvas container div already has a `style` prop — confirm `touchAction: 'none'` is present
    - If missing, add it: `style={{ touchAction: 'none', cursor: ... }}`
    - This prevents the browser from intercepting stylus drag events for native scroll/pan
    - _Bug_Condition: isBugCondition(event) — Defect 4: canvasContainer.style.touchAction != 'none'_
    - _Expected_Behavior: all stylus pointermove events reach React handlers during a stroke_
    - _Requirements: 2.5_

  - [x] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Stylus Pointer Events Reach the Drawing Pipeline
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior for all four defects
    - Run `src/components/Canvas.stylus-bug.test.tsx` on the FIXED code
    - **EXPECTED OUTCOME**: All four sub-properties PASS (confirms all four defects are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Mouse and Non-Buggy Pointer Behaviour Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run `src/components/Canvas.preservation.test.tsx` on the FIXED code
    - **EXPECTED OUTCOME**: All preservation tests PASS (confirms no regressions in mouse behaviour)
    - Confirm mouse left-click drawing, right/middle-click rejection, and pointerup finalisation are all unchanged
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite to confirm no regressions
  - Verify both `Canvas.stylus-bug.test.tsx` and `Canvas.preservation.test.tsx` pass
  - Confirm no TypeScript errors in `src/components/Canvas.tsx`
  - Ask the user if any questions arise
