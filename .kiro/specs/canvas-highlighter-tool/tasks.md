# Implementation Plan: Canvas Highlighter Tool

## Overview

Implement the Highlighter tool by extending the type system, creating a drawing hook that mirrors `useFreehandTool`, wiring it into `Canvas.tsx`, adding a render case to `ObjectRenderer.tsx`, and adding the toolbar button to `ToolSidebar.tsx`.

## Tasks

- [x] 1. Extend type definitions in `src/lib/types.ts`
  - Add `'highlighter'` to the `type` field union inside `CanvasObject`
  - Add `'highlighter'` to the `AppMode` union type
  - Define and export `HighlighterObject` interface with `data: { points: { x: number; y: number }[]; color: string; width: number }`
  - Add `HighlighterObject` to the `AnyCanvasObject` union type
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Create `useHighlighterTool` hook
  - [x] 2.1 Implement `src/components/canvas/tools/useHighlighterTool.ts`
    - Mirror `useFreehandTool` structure exactly (same refs, state, distance threshold > 2px)
    - `onMouseUp` creates a `HighlighterObject` (type `'highlighter'`) and calls `onAddObject` + `publishState`
    - Discard stroke and skip `onAddObject` when fewer than 2 points collected
    - Export `HighlighterOverlay` interface and `useHighlighterTool` function
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.2 Write property test: HighlighterObject data shape (Property 1)
    - **Property 1: HighlighterObject data shape**
    - Generate random point arrays, color strings, and widths; assert `data.points`, `data.color`, `data.width` have correct types on the created object
    - **Validates: Requirements 1.3**
    - `// Feature: canvas-highlighter-tool, Property 1: HighlighterObject data shape`

  - [ ]* 2.3 Write property test: distance threshold (Property 2)
    - **Property 2: Drawing hook collects points above threshold**
    - Generate a start point and subsequent points; assert each is recorded iff distance from previous > 2px
    - **Validates: Requirements 2.2**
    - `// Feature: canvas-highlighter-tool, Property 2: Drawing hook collects points above threshold`

  - [ ]* 2.4 Write property test: successful stroke (Property 3)
    - **Property 3: Successful stroke produces HighlighterObject and publishes state**
    - Generate strokes with >= 2 points; assert `onAddObject` called once with type `'highlighter'` and `publishState` called once
    - **Validates: Requirements 2.3, 2.6**
    - `// Feature: canvas-highlighter-tool, Property 3: Successful stroke produces HighlighterObject and publishes state`

  - [ ]* 2.5 Write property test: short/cancelled strokes discarded (Property 4)
    - **Property 4: Short or cancelled strokes are discarded**
    - Generate strokes with 0 or 1 points; assert `onAddObject` is never called
    - **Validates: Requirements 2.4, 2.5**
    - `// Feature: canvas-highlighter-tool, Property 4: Short or cancelled strokes are discarded`

  - [ ]* 2.6 Write property test: overlay lifecycle (Property 6)
    - **Property 6: In-progress overlay matches final object properties**
    - While drawing assert overlay is non-null and matches `penSettings`; after `onMouseUp` assert overlay is `null`
    - **Validates: Requirements 4.1, 4.2**
    - `// Feature: canvas-highlighter-tool, Property 6: In-progress overlay matches final object properties`

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Add highlighter render case to `ObjectRenderer.tsx`
  - [x] 4.1 Add `case 'highlighter':` block in `ObjectRenderer`
    - Reuse `buildSmoothPath` helper already in the file
    - Render `<path>` with `strokeWidth={data.width ?? 28}`, `opacity={0.4}`, `style={{ mixBlendMode: 'multiply' }}`, `fill="none"`, `strokeLinecap="round"`, `strokeLinejoin="round"`
    - Apply `opacity: 0.3` when `obj.visible` is false (standard hidden-object convention)
    - Render selection indicator (amber dashed path) when `isSelected` is true, consistent with the `freehand` case
    - Return `null` when `buildSmoothPath` returns an empty string
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 4.2 Write property test: rendered path attributes (Property 5)
    - **Property 5: Rendered path has correct visual attributes**
    - Generate random `HighlighterObject` instances with varying `data.width` values (including absent); render via `ObjectRenderer` and assert `opacity`, `mixBlendMode`, `fill`, `strokeLinecap`, `strokeLinejoin`, and `strokeWidth` are correct
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
    - `// Feature: canvas-highlighter-tool, Property 5: Rendered path has correct visual attributes`

  - [ ]* 4.3 Write unit tests for ObjectRenderer highlighter case
    - Assert `opacity=0.4` and `mixBlendMode='multiply'` on the rendered path
    - Assert selection indicator path is present when `isSelected=true`
    - Assert `opacity=0.3` when `visible=false`
    - _Requirements: 3.3, 3.4, 3.6, 3.7_

- [ ] 5. Wire highlighter into `Canvas.tsx`
  - [x] 5.1 Instantiate `useHighlighterTool` and handle pointer events
    - Import and call `useHighlighterTool` alongside `useFreehandTool`
    - In `handleCanvasPointerDown`: add `if (mode === 'highlighter') { highlighter.onMouseDown(x, y); e.stopPropagation(); }`
    - In `handleCanvasPointerMove`: add `if (mode === 'highlighter' && highlighter.isDrawing) { highlighter.onMouseMove(x, y); }`
    - In `handleCanvasPointerUp`: add `if (mode === 'highlighter') { highlighter.onMouseUp(); }`
    - In `handleCanvasPointerCancel`: call `highlighter.onMouseUp()` (same as freehand cancel path)
    - Add `'highlighter'` to the early-return guard in `handleObjectPointerDown`
    - Add `'highlighter'` to the early-return guard in `handleImageResizeStart`
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 6.1, 6.2_

  - [x] 5.2 Render in-progress overlay in `Canvas.tsx`
    - When `highlighter.overlay` is non-null, render an SVG `<path>` overlay with the same visual properties as the final `HighlighterObject` (strokeWidth, opacity 0.4, mixBlendMode multiply, fill none, round caps/joins)
    - Remove overlay when drawing ends
    - _Requirements: 4.1, 4.2_

- [x] 6. Add Highlighter button to `ToolSidebar.tsx`
  - Import `Highlighter` icon from `lucide-react`
  - Add `{ id: 'highlighter', name: 'Выделитель', icon: Highlighter, mode: 'highlighter' }` to the `freehand` tool group in `TOOL_GROUPS`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 6.1 Write unit tests for ToolSidebar highlighter entry
    - Assert `'Выделитель'` button exists in the freehand group
    - Simulate click and assert `setMode('highlighter')` was called
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use **fast-check** with a minimum of 100 iterations each
- Each property test file should include the tag comment: `// Feature: canvas-highlighter-tool, Property N: <text>`
- The highlighter hook is intentionally a near-copy of `useFreehandTool` — the only difference is the object type it creates
