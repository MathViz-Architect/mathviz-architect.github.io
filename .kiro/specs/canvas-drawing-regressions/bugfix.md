# Bugfix Requirements Document

## Introduction

Three critical regressions in the canvas drawing system:

1. **Clear Canvas removes objects one by one** — "Очистить холст" (without selection) uses a `BatchCommand` of individual `DeleteObjectCommand`s instead of a single atomic `ClearCanvasCommand`. Each undo step removes one object, making it behave like repeated undo rather than a single atomic clear.

2. **Click / Tap does not create a dot** — Both `useFreehandTool` and `useHighlighterTool` require `currentPoints.length >= 2` before creating an object in `onMouseUp`. A single tap (pointerdown → pointerup with no movement) produces exactly 1 point and is silently discarded.

3. **Fast clicks do nothing** — The `onMouseMove` threshold (`Math.hypot > 2`) combined with the `>= 2` point guard means rapid taps that don't move the pointer never accumulate a second point, so every fast tap is discarded.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the user clicks "Очистить холст" with no objects selected THEN the system removes objects one by one (one per undo step) instead of atomically

1.2 WHEN the user performs a single tap/click (pointerdown → pointerup with no pointer movement) in freehand mode THEN the system discards the stroke and draws nothing

1.3 WHEN the user performs a single tap/click (pointerdown → pointerup with no pointer movement) in highlighter mode THEN the system discards the stroke and draws nothing

1.4 WHEN the user performs rapid successive taps in freehand mode THEN the system draws nothing for any of the taps

1.5 WHEN the user performs rapid successive taps in highlighter mode THEN the system draws nothing for any of the taps

### Expected Behavior (Correct)

2.1 WHEN the user clicks "Очистить холст" with no objects selected THEN the system SHALL remove all objects atomically in a single undoable command (one undo step restores all objects)

2.2 WHEN the user performs a single tap/click in freehand mode THEN the system SHALL create a dot (a freehand object with a single point or two identical points) at the tap location

2.3 WHEN the user performs a single tap/click in highlighter mode THEN the system SHALL create a dot (a highlighter object with a single point or two identical points) at the tap location

2.4 WHEN the user performs rapid successive taps in freehand mode THEN the system SHALL create a dot for each tap

2.5 WHEN the user performs rapid successive taps in highlighter mode THEN the system SHALL create a dot for each tap

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user draws a multi-point freehand stroke (pointer moves between down and up) THEN the system SHALL CONTINUE TO create a freehand path object with all recorded points

3.2 WHEN the user draws a multi-point highlighter stroke (pointer moves between down and up) THEN the system SHALL CONTINUE TO create a highlighter path object with all recorded points

3.3 WHEN the user clicks "Очистить холст" with objects selected THEN the system SHALL CONTINUE TO delete only the selected objects (batch delete, not full clear)

3.4 WHEN the user undoes a full canvas clear THEN the system SHALL CONTINUE TO restore all previously cleared objects in a single undo step

3.5 WHEN the user draws in freehand mode and cancels (pointercancel) THEN the system SHALL CONTINUE TO discard the in-progress stroke without adding an object

3.6 WHEN the user draws in highlighter mode and cancels (pointercancel) THEN the system SHALL CONTINUE TO discard the in-progress stroke without adding an object
