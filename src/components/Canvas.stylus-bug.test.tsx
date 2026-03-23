/**
 * Canvas Stylus Bug — Exploration Tests (Task 1)
 *
 * Tests EXPECTED TO FAIL on unfixed Canvas.tsx — failure confirms bugs exist.
 * DO NOT fix the code or the tests when they fail.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll } from 'vitest';
import { Canvas } from './Canvas';

// jsdom does not implement ResizeObserver — polyfill so Canvas can mount
beforeAll(() => {
  if (typeof window.ResizeObserver === 'undefined') {
    window.ResizeObserver = class ResizeObserver {
      observe() { }
      unobserve() { }
      disconnect() { }
    };
  }
});

// ─── Minimal context mocks ────────────────────────────────────────────────────

const mockAddObject = vi.fn();
const mockPublishLocalChange = vi.fn();
const mockGetCanvasSnapshot = vi.fn(() => ({ objects: [], pages: [], activePageId: 'p1' }));

vi.mock('@/contexts/EditorContext', () => ({
  useEditorContext: () => ({
    state: {
      objects: [],
      selectedObjectIds: [],
      mode: 'freehand',
      pages: [{ id: 'p1', name: 'Page 1', objects: [] }],
      activePageId: 'p1',
    },
    zoom: 1,
    setZoom: vi.fn(),
    showGrid: false,
    gridWeight: 'thin',
    penSettings: { width: 3, color: '#374151' },
    shapeType: 'rectangle',
    selectObject: vi.fn(),
    selectMultiple: vi.fn(),
    updateObject: vi.fn(),
    updateObjectDirect: vi.fn(),
    executeCommand: vi.fn(),
    setObjectsFn: vi.fn(() => vi.fn()),
    handleAddObject: mockAddObject,
    handleDeleteObject: vi.fn(),
    moveObjects: vi.fn(),
    getCanvasSnapshot: mockGetCanvasSnapshot,
    handleZoomIn: vi.fn(),
    handleZoomOut: vi.fn(),
    handleZoomReset: vi.fn(),
    handleToggleGrid: vi.fn(),
    handleToggleGridWeight: vi.fn(),
    setPenSettings: vi.fn(),
    setShapeType: vi.fn(),
    setMode: vi.fn(),
    addObject: vi.fn(),
    removeObject: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: vi.fn(() => false),
    canRedo: vi.fn(() => false),
    newProject: vi.fn(),
    loadProject: vi.fn(),
    loadRemoteState: vi.fn(),
    setProjectPath: vi.fn(),
    setProjectName: vi.fn(),
    markAsSaved: vi.fn(),
    clearCanvas: vi.fn(),
    clearBoard: vi.fn(),
    addPage: vi.fn(),
    removePage: vi.fn(),
    switchPage: vi.fn(),
    setActivePageId: vi.fn(),
    interactiveModuleId: null,
    setInteractiveModuleId: vi.fn(),
    saveProjectToStorage: vi.fn(),
    getSavedProjects: vi.fn(() => []),
    loadProjectFromStorage: vi.fn(),
    deleteProjectFromStorage: vi.fn(),
    handleSelectTemplate: vi.fn(),
    handleToggleVisibility: vi.fn(),
    handleToggleLock: vi.fn(),
    copyToClipboard: vi.fn(),
    pasteFromClipboard: vi.fn(),
    selectAll: vi.fn(),
    duplicateSelected: vi.fn(),
    selectedObjects: [],
  }),
}));

vi.mock('@/hooks/useCollaborationContext', () => ({
  useCollaborationContext: () => ({
    roomState: { isConnected: false, roomId: null },
    user: null,
    boardSettings: { mode: 'edit', activeStudentId: null },
    canEdit: true,
    peers: [],
    createRoom: vi.fn(),
    leaveRoom: vi.fn(),
    closeRoom: vi.fn(),
    copyRoomLink: vi.fn(),
    updateBoardSettings: vi.fn(),
    publishLocalChange: mockPublishLocalChange,
    updateCursor: vi.fn(),
  }),
}));

vi.mock('@/components/room/RemoteCursors', () => ({
  RemoteCursors: () => null,
}));

vi.mock('./SmartShapeToolbar', () => ({
  SmartShapeToolbar: () => null,
}));

// ─── Helper ───────────────────────────────────────────────────────────────────

function makePointerEvent(
  type: string,
  overrides: {
    pointerType?: string;
    button?: number;
    buttons?: number;
    pressure?: number;
    clientX?: number;
    clientY?: number;
    pointerId?: number;
    bubbles?: boolean;
    cancelable?: boolean;
  } = {},
): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: 100,
    clientY: 100,
    pointerId: 1,
    pointerType: 'mouse',
    button: 0,
    buttons: 1,
    pressure: 0,
    isPrimary: true,
    ...overrides,
  });
}

function mockRect(el: HTMLElement) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: 0, top: 0, width: 800, height: 600,
    right: 800, bottom: 600, x: 0, y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Canvas Stylus Bug — Exploration Tests (EXPECTED TO FAIL on unfixed code)', () => {

  /**
   * Sub-property A — Defect 1 (button guard)
   *
   * Current guard in handleCanvasPointerDown:
   *   const isPenLike = e.pointerType === 'pen' || e.pointerType === 'touch' || e.pressure > 0;
   *   if (!isPenLike && e.pointerType === 'mouse' && e.button !== 0) return;
   *
   * Failing case: some tablet drivers report pointerType='mouse' with button=-1 and pressure=0.
   *   isPenLike = false (pointerType='mouse', pressure=0)
   *   !isPenLike = true
   *   pointerType === 'mouse' = true
   *   button !== 0 = true  (-1 !== 0)
   *   → BLOCKED — drawing never starts
   *
   * The fix (per design.md): simplify to `if (e.pointerType === 'mouse' && e.button !== 0) return;`
   * This still blocks right/middle-click (button=1,2) but the isPenLike check is removed,
   * so pen events that report as pointerType='pen' with any button value are accepted.
   *
   * We test: pointerType='mouse', button=-1, pressure=0 (tablet driver quirk).
   * EXPECTED FAIL: current guard blocks this event → no freehand object added.
   *
   * Validates: Requirements 1.1, 1.2
   */
  it('Sub-property A — tablet pointerdown with pointerType=mouse, button=-1 should initiate freehand drawing', async () => {
    mockAddObject.mockClear();
    const { container } = render(<Canvas />);
    const viewport = container.querySelector('.canvas-viewport') as HTMLElement;
    expect(viewport).toBeTruthy();
    mockRect(viewport);
    viewport.setPointerCapture = vi.fn();
    viewport.releasePointerCapture = vi.fn();

    // Tablet driver reports pointerType='mouse' with button=-1, pressure=0
    // Current guard: isPenLike=false, pointerType='mouse', button!==0 → BLOCKED
    await act(async () => {
      viewport.dispatchEvent(makePointerEvent('pointerdown', {
        pointerType: 'mouse', button: -1, buttons: 1, pressure: 0,
        clientX: 200, clientY: 200,
      }));
    });
    await act(async () => {
      viewport.dispatchEvent(makePointerEvent('pointermove', {
        pointerType: 'mouse', button: -1, buttons: 1, pressure: 0,
        clientX: 260, clientY: 260,
      }));
    });
    await act(async () => {
      viewport.dispatchEvent(makePointerEvent('pointerup', {
        pointerType: 'mouse', button: -1, buttons: 0, pressure: 0,
        clientX: 320, clientY: 320,
      }));
    });

    // EXPECTED (fixed): freehand object added — drawing was initiated
    // ACTUAL (unfixed): guard blocks mouse+button=-1 → mockAddObject NOT called
    expect(mockAddObject).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'freehand' }),
      true
    );
  });

  /**
   * Sub-property B — Defect 2 (capture target)
   *
   * Current code: `(e.target as Element).setPointerCapture(e.pointerId)`
   * Fix:          `(e.currentTarget as Element).setPointerCapture(e.pointerId)`
   *
   * When pointerdown is dispatched on the SVG child element and bubbles up to the
   * container's onPointerDown handler:
   *   e.target      = SVG child element
   *   e.currentTarget = container div (the stable element)
   *
   * Unfixed: setPointerCapture called on SVG child → capture lost when target changes.
   * Fixed:   setPointerCapture called on container → capture retained for full stroke.
   *
   * We spy on both elements and assert the container's spy was called.
   *
   * Validates: Requirements 1.3
   */
  it('Sub-property B — setPointerCapture should be called on currentTarget (container), not e.target (SVG child)', async () => {
    const { container } = render(<Canvas />);
    const viewport = container.querySelector('.canvas-viewport') as HTMLElement;
    const svgEl = container.querySelector('svg[data-canvas-svg]') as SVGSVGElement;
    expect(viewport).toBeTruthy();
    expect(svgEl).toBeTruthy();
    mockRect(viewport);

    const captureOnViewport = vi.fn();
    const captureOnSvg = vi.fn();
    viewport.setPointerCapture = captureOnViewport;
    viewport.releasePointerCapture = vi.fn();
    svgEl.setPointerCapture = captureOnSvg;
    svgEl.releasePointerCapture = vi.fn();

    // Dispatch on SVG child — bubbles to container's onPointerDown
    // In handler: e.target = svgEl, e.currentTarget = viewport
    await act(async () => {
      svgEl.dispatchEvent(makePointerEvent('pointerdown', {
        pointerType: 'pen', button: 0, buttons: 1, pressure: 0.5,
        clientX: 200, clientY: 200,
      }));
    });

    // EXPECTED (fixed): capture on container (viewport)
    // ACTUAL (unfixed): capture on e.target (svgEl)
    expect(captureOnViewport).toHaveBeenCalledWith(1);
    expect(captureOnSvg).not.toHaveBeenCalled();
  });

  /**
   * Sub-property C — Defect 3 (missing pointercancel)
   *
   * Canvas.tsx has NO onPointerCancel handler.
   * When pointercancel fires, drawing state stays stuck (freehand.isDrawing = true).
   *
   * We verify the handler exists by checking that releasePointerCapture is called
   * after a pointercancel event. On unfixed code, no handler exists, so
   * releasePointerCapture is never called in response to pointercancel.
   *
   * Validates: Requirements 1.4
   */
  it('Sub-property C — pointercancel should call releasePointerCapture and clean up drawing state', async () => {
    const { container } = render(<Canvas />);
    const viewport = container.querySelector('.canvas-viewport') as HTMLElement;
    expect(viewport).toBeTruthy();
    mockRect(viewport);

    const releaseCaptureSpy = vi.fn();
    viewport.setPointerCapture = vi.fn();
    viewport.releasePointerCapture = releaseCaptureSpy;

    // Start a freehand stroke
    await act(async () => {
      viewport.dispatchEvent(makePointerEvent('pointerdown', {
        pointerType: 'pen', button: 0, buttons: 1, pressure: 0.5,
        clientX: 100, clientY: 100,
      }));
    });
    await act(async () => {
      viewport.dispatchEvent(makePointerEvent('pointermove', {
        pointerType: 'pen', button: 0, buttons: 1, pressure: 0.5,
        clientX: 150, clientY: 150,
      }));
    });

    // Clear spy — only track calls triggered by pointercancel
    releaseCaptureSpy.mockClear();

    // Browser cancels the pointer sequence
    await act(async () => {
      viewport.dispatchEvent(makePointerEvent('pointercancel', {
        pointerType: 'pen', button: 0, buttons: 0, pressure: 0,
        pointerId: 1, clientX: 150, clientY: 150,
      }));
    });

    // EXPECTED (fixed): onPointerCancel handler calls releasePointerCapture(1)
    // ACTUAL (unfixed): no handler — releasePointerCapture is NOT called
    expect(releaseCaptureSpy).toHaveBeenCalledWith(1);
  });

  /**
   * Sub-property D — Defect 4 (touch-action)
   *
   * Per design.md: "Canvas container has no touch-action: none → browser intercepts
   * stylus drag for native scroll/pan → pointermove events never reach React handlers."
   *
   * The fix: add `style={{ touchAction: 'none' }}` to the container div.
   *
   * FINDING: Inspection of the current Canvas.tsx shows `style={{ touchAction: 'none', ... }}`
   * IS already present on the `.canvas-viewport` div. This means Defect 4 may have been
   * partially fixed already, or the spec's description of the defect is inaccurate for
   * this codebase. This test confirms the property IS set (and will PASS on current code).
   *
   * The test is written to assert the EXPECTED (fixed) state. If the property were missing,
   * this test would fail — confirming the defect.
   *
   * Validates: Requirements 1.5
   */
  it('Sub-property D — canvas container should have touchAction: none', () => {
    const { container } = render(<Canvas />);
    const viewport = container.querySelector('.canvas-viewport') as HTMLElement;
    expect(viewport).toBeTruthy();

    // EXPECTED (fixed): touchAction is 'none'
    // ACTUAL (unfixed per spec): touchAction is '' or not set
    // NOTE: Current Canvas.tsx already has touchAction: 'none' — this test PASSES,
    // indicating Defect 4 is already present in the codebase (or was pre-fixed).
    expect(viewport.style.touchAction).toBe('none');
  });
});
