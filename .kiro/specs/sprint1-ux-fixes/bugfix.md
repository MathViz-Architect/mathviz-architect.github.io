# Bugfix Requirements Document

## Introduction

Sprint 1 UX fixes reported by a teacher using a stylus tablet. Three issues are addressed:

1. **BUG 1 (CRITICAL)** — Stylus (pen) input does not draw or create shapes. The canvas only responds to mouse events, blocking tablet users entirely.
2. **BUG 2** — Polygon/pentagon shapes render as rectangles due to a missing `shapeType` case in the shape-creation switch and a missing preview branch in the draw overlay.
3. **FEATURE** — "Clear Board" button in the TopBar, visible to the teacher role, undoable via CommandHistory, and synced via Yjs collaboration.

---

## Bug Analysis

### Current Behavior (Defect)

**BUG 1 — Stylus input ignored**

1.1 WHEN a user draws with a stylus (pointerType === 'pen') on the canvas viewport THEN the system moves the cursor but does not start a freehand stroke, create a shape, or trigger any drawing action

1.2 WHEN a stylus button is pressed (e.buttons > 0 but e.button !== 0) on the canvas THEN the system ignores the event because handlers cast PointerEvents to MouseEvents and rely on mouse-specific button semantics

1.3 WHEN a stylus moves while drawing THEN the system does not call freehand.onMouseMove because the pointer-move handler receives a PointerEvent cast as a MouseEvent with no guard for pointerType === 'pen'

1.4 WHEN a stylus lifts from the canvas THEN the system does not finalize the stroke because the pointer-up handler does not fire for pen pointerType

**BUG 2 — Polygon renders as rectangle**

2.1 WHEN a user selects the pentagon/polygon shape tool and draws on the canvas THEN the system creates an object with type: 'rectangle' because the shapeType switch in Canvas.tsx has no 'polygon' case and falls through to the default rectangle branch

2.2 WHEN a user draws a polygon shape THEN the system renders a rectangle preview overlay because the draw-preview IIFE in the SVG only checks for 'circle' and 'triangle', defaulting to `<rect>` for all other shapeTypes

### Expected Behavior (Correct)

**BUG 1 — Stylus input**

2.1 WHEN a user draws with a stylus (pointerType === 'pen' or 'touch') on the canvas viewport THEN the system SHALL start, continue, and finalize a freehand stroke or shape exactly as it does for mouse input

2.2 WHEN a stylus button is pressed (e.buttons > 0) on the canvas THEN the system SHALL treat the event as an active pointer-down and route it through the same drawing logic as a mouse button-0 press

2.3 WHEN a stylus moves while drawing THEN the system SHALL call freehand.onMouseMove (or the equivalent shape/arrow move handler) with the correct canvas coordinates

2.4 WHEN a stylus lifts from the canvas THEN the system SHALL finalize the stroke or shape and call publishState() exactly as it does for mouse pointer-up

**BUG 2 — Polygon renders correctly**

2.5 WHEN a user selects the polygon shape tool and draws on the canvas THEN the system SHALL create an object with type: 'polygon' and a normalized points array representing the correct polygon geometry (e.g. pentagon: 5 vertices)

2.6 WHEN a user draws a polygon shape THEN the system SHALL render a polygon preview overlay (SVG `<polygon>` with the correct vertex count) instead of a rectangle

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user draws with a mouse (pointerType === 'mouse') THEN the system SHALL CONTINUE TO handle all drawing modes (freehand, shape, arrow, line, eraser) without any change in behavior

3.2 WHEN a user creates a rectangle shape THEN the system SHALL CONTINUE TO produce an object with type: 'rectangle' and correct dimensions

3.3 WHEN a user creates a circle shape THEN the system SHALL CONTINUE TO produce an object with type: 'circle' and correct dimensions

3.4 WHEN a user creates a triangle shape THEN the system SHALL CONTINUE TO produce an object with type: 'triangle' and correct dimensions

3.5 WHEN a user creates a geoshape (circle/triangle/quadrilateral) THEN the system SHALL CONTINUE TO produce an object with type: 'geoshape' and the correct shapeKind data

3.6 WHEN the "Clear Board" button is clicked THEN the system SHALL clear all objects on the active page, record the action in CommandHistory (undoable), and publish the new state via publishLocalChange(getCanvasSnapshot()) — without breaking Yjs collaboration sync

3.7 WHEN a student (non-teacher role) is connected to a room THEN the system SHALL CONTINUE TO prevent canvas edits; the "Clear Board" button SHALL NOT be visible or actionable for non-teacher roles

3.8 WHEN a user undoes after clearing the board THEN the system SHALL CONTINUE TO restore all previously cleared objects via CommandHistory

---

## Bug Condition Pseudocode

### BUG 1 — Stylus Input

```pascal
FUNCTION isBugCondition_Stylus(E)
  INPUT: E of type PointerEvent
  OUTPUT: boolean

  RETURN E.pointerType = 'pen' OR E.pointerType = 'touch'
END FUNCTION

// Property: Fix Checking — all pointer types trigger drawing
FOR ALL E WHERE isBugCondition_Stylus(E) DO
  result ← handleCanvasPointerDown'(E)
  ASSERT drawing_state_activated(result) = TRUE
END FOR

// Property: Preservation Checking
FOR ALL E WHERE NOT isBugCondition_Stylus(E) DO  // i.e. pointerType = 'mouse'
  ASSERT handleCanvasPointerDown(E) = handleCanvasPointerDown'(E)
END FOR
```

### BUG 2 — Polygon Shape Creation

```pascal
FUNCTION isBugCondition_Polygon(shapeType)
  INPUT: shapeType of type string
  OUTPUT: boolean

  RETURN shapeType = 'polygon'
END FUNCTION

// Property: Fix Checking — polygon shapeType produces polygon object
FOR ALL S WHERE isBugCondition_Polygon(S) DO
  result ← createShape'(S, drawBounds)
  ASSERT result.type = 'polygon'
  ASSERT result.data.points IS array of normalized vertices
END FOR

// Property: Preservation Checking
FOR ALL S WHERE NOT isBugCondition_Polygon(S) DO
  ASSERT createShape(S, drawBounds) = createShape'(S, drawBounds)
END FOR
```
