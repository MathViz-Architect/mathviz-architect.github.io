/**
 * Canvas Preservation Tests (Task 2)
 *
 * Property 2: Preservation — Mouse and Non-Buggy Pointer Behaviour Unchanged
 *
 * These tests MUST PASS on unfixed Canvas.tsx — they establish the baseline
 * behaviour that must not regress after the fix.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function setupViewport(container: HTMLElement) {
    const viewport = container.querySelector('.canvas-viewport') as HTMLElement;
    expect(viewport).toBeTruthy();
    mockRect(viewport);
    viewport.setPointerCapture = vi.fn();
    viewport.releasePointerCapture = vi.fn();
    return viewport;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Canvas Preservation Tests (MUST PASS on unfixed code)', () => {

    beforeEach(() => {
        mockAddObject.mockClear();
        mockPublishLocalChange.mockClear();
    });

    /**
     * Preservation 3.1 — Mouse left-click (pointerType='mouse', button=0) initiates freehand drawing
     *
     * Observes: pointerdown with pointerType='mouse', button=0 sets freehand.isDrawing=true
     * on unfixed code. After pointerdown → pointermove → pointerup, mockAddObject is called
     * with a freehand object.
     *
     * Validates: Requirements 3.1, 3.6
     */
    it('mouse left-click (button=0) initiates freehand drawing — mockAddObject called with freehand object', async () => {
        const { container } = render(<Canvas />);
        const viewport = setupViewport(container);

        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointerdown', {
                pointerType: 'mouse', button: 0, buttons: 1, pressure: 0,
                clientX: 100, clientY: 100,
            }));
        });
        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointermove', {
                pointerType: 'mouse', button: 0, buttons: 1, pressure: 0,
                clientX: 200, clientY: 200,
            }));
        });
        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointerup', {
                pointerType: 'mouse', button: 0, buttons: 0, pressure: 0,
                clientX: 300, clientY: 300,
            }));
        });

        expect(mockAddObject).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'freehand' }),
            true
        );
    });

    /**
     * Preservation 3.2 — Right-click (pointerType='mouse', button=2) does NOT initiate drawing
     *
     * Observes: pointerdown with pointerType='mouse', button=2 does NOT set freehand.isDrawing=true
     * on unfixed code. mockAddObject must NOT be called.
     *
     * Validates: Requirements 3.2
     */
    it('right-click (button=2) does NOT initiate drawing — mockAddObject not called', async () => {
        const { container } = render(<Canvas />);
        const viewport = setupViewport(container);

        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointerdown', {
                pointerType: 'mouse', button: 2, buttons: 2, pressure: 0,
                clientX: 100, clientY: 100,
            }));
        });
        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointermove', {
                pointerType: 'mouse', button: 2, buttons: 2, pressure: 0,
                clientX: 200, clientY: 200,
            }));
        });
        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointerup', {
                pointerType: 'mouse', button: 2, buttons: 0, pressure: 0,
                clientX: 300, clientY: 300,
            }));
        });

        expect(mockAddObject).not.toHaveBeenCalled();
    });

    /**
     * Preservation 3.2 — Middle-click (pointerType='mouse', button=1) does NOT initiate drawing
     *
     * Observes: pointerdown with pointerType='mouse', button=1 does NOT set freehand.isDrawing=true
     * on unfixed code. mockAddObject must NOT be called.
     *
     * Note: button=1 triggers panning, not drawing — this is the expected baseline behaviour.
     *
     * Validates: Requirements 3.2, 3.3
     */
    it('middle-click (button=1) does NOT initiate drawing — mockAddObject not called', async () => {
        const { container } = render(<Canvas />);
        const viewport = setupViewport(container);

        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointerdown', {
                pointerType: 'mouse', button: 1, buttons: 4, pressure: 0,
                clientX: 100, clientY: 100,
            }));
        });
        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointermove', {
                pointerType: 'mouse', button: 1, buttons: 4, pressure: 0,
                clientX: 200, clientY: 200,
            }));
        });
        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointerup', {
                pointerType: 'mouse', button: 1, buttons: 0, pressure: 0,
                clientX: 300, clientY: 300,
            }));
        });

        expect(mockAddObject).not.toHaveBeenCalled();
    });

    /**
     * Preservation 3.5 — pointerup after a started stroke finalises the stroke
     *
     * Observes: pointerup after a freehand stroke calls publishState (via mockPublishLocalChange)
     * and mockAddObject is called with a freehand object (drawing state resets).
     *
     * Validates: Requirements 3.5, 3.6
     */
    it('pointerup after a started stroke finalises the stroke — mockAddObject called and publishState invoked', async () => {
        const { container } = render(<Canvas />);
        const viewport = setupViewport(container);

        // Start stroke
        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointerdown', {
                pointerType: 'mouse', button: 0, buttons: 1, pressure: 0,
                clientX: 50, clientY: 50,
            }));
        });
        // Move to accumulate points
        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointermove', {
                pointerType: 'mouse', button: 0, buttons: 1, pressure: 0,
                clientX: 150, clientY: 150,
            }));
        });
        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointermove', {
                pointerType: 'mouse', button: 0, buttons: 1, pressure: 0,
                clientX: 250, clientY: 250,
            }));
        });

        // Finalise stroke
        await act(async () => {
            viewport.dispatchEvent(makePointerEvent('pointerup', {
                pointerType: 'mouse', button: 0, buttons: 0, pressure: 0,
                clientX: 350, clientY: 350,
            }));
        });

        // Stroke should be finalised: freehand object added and state published
        expect(mockAddObject).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'freehand' }),
            true
        );
        expect(mockPublishLocalChange).toHaveBeenCalled();
    });
});
