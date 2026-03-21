# Bugfix Requirements Document

## Introduction

Users with graphic tablets (Wacom, Genius, etc.) can move the cursor and click UI buttons, but cannot draw or insert shapes on the Canvas. The app recently migrated to pointer events, and the current pointer/button guards are blocking valid tablet stylus inputs. This fix stabilizes the pointer events pipeline to correctly accept stylus and tablet pen input alongside standard mouse input.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a graphic tablet stylus initiates a pointerdown event with `pointerType === 'pen'` or `pressure > 0` THEN the system fails to start a drawing or shape insertion operation on the Canvas.

1.2 WHEN a tablet device fires a pointerdown event with `button === -1` (some tablet drivers) THEN the system's mouse button guard rejects the event and no drawing state is initiated.

1.3 WHEN a stylus moves quickly after pointerdown THEN the system loses pointer capture, causing the active drawing stroke to be silently dropped mid-stroke.

1.4 WHEN a pointercancel event is fired (e.g., browser interrupts the gesture) THEN the system has no handler, leaving drawing/drag state active and the canvas in a broken intermediate state.

1.5 WHEN the canvas container lacks `touch-action: none` THEN the browser intercepts stylus drag events for native panning, preventing pointermove events from reaching the canvas during a stroke.

### Expected Behavior (Correct)

2.1 WHEN a graphic tablet stylus initiates a pointerdown event with `pointerType === 'pen'` or `pressure > 0` THEN the system SHALL start the appropriate drawing or shape insertion operation on the Canvas.

2.2 WHEN a tablet device fires a pointerdown event with `button === -1` or `button === 0` and `pointerType !== 'mouse'` THEN the system SHALL accept the event and initiate the drawing state.

2.3 WHEN a stylus moves quickly after pointerdown THEN the system SHALL retain pointer capture via `setPointerCapture` called on `e.currentTarget` immediately on pointerdown, ensuring all subsequent pointermove events are delivered.

2.4 WHEN a pointercancel event is fired THEN the system SHALL gracefully terminate any active drawing or drag state (equivalent to pointerup handling) and call `releasePointerCapture` if a pointer was captured.

2.5 WHEN the canvas container is rendered THEN the system SHALL apply `touch-action: none` directly on the container element to prevent the browser from consuming stylus drag events.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a standard mouse left-click (pointerType === 'mouse', button === 0) initiates a pointerdown THEN the system SHALL CONTINUE TO start drawing, shape insertion, and all other canvas interactions as before.

3.2 WHEN a standard mouse right-click or middle-click (button === 2 or button === 1) fires a pointerdown THEN the system SHALL CONTINUE TO reject the event and not initiate drawing.

3.3 WHEN the user pans with the middle mouse button or Space+drag THEN the system SHALL CONTINUE TO pan the canvas without interference.

3.4 WHEN a touch input (pointerType === 'touch') is used THEN the system SHALL CONTINUE TO handle touch-based drawing and interactions correctly.

3.5 WHEN a pointerup event fires normally THEN the system SHALL CONTINUE TO finalize the drawing stroke or shape and publish the canvas state.

3.6 WHEN the user draws a freehand stroke with a mouse THEN the system SHALL CONTINUE TO produce the same stroke output as before the fix.
