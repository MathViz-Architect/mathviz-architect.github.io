import { AnyCanvasObject } from '@/lib/types';

/**
 * Convert screen coordinates to canvas (SVG viewBox) coordinates.
 *
 * ## Coordinate System Protocol
 *
 * Layout hierarchy:
 *   viewport div  — overflow:hidden, fills the screen panel
 *     world div   — CSS transform: translate(panX px, panY px) scale(zoom), transformOrigin: '0 0'
 *       SVG       — logical canvas, width=CANVAS_WIDTH, height=CANVAS_HEIGHT
 *
 * Forward transform (canvas → screen):
 *   screenX = canvasX * zoom + panX + viewportRect.left
 *   screenY = canvasY * zoom + panY + viewportRect.top
 *
 * Inverse transform (screen → canvas):
 *   canvasX = (screenX - viewportRect.left - panX) / zoom
 *   canvasY = (screenY - viewportRect.top  - panY) / zoom
 *
 * NOTE: canvasWidth/canvasHeight are NOT used in the conversion — the CSS
 * transform is the only scaling applied. These parameters are kept for
 * API compatibility but are intentionally ignored.
 */
export const screenToCanvas = (
    screenX: number,
    screenY: number,
    viewportRect: DOMRect,
    _canvasWidth: number,
    _canvasHeight: number,
    zoom: number = 1,
    panX: number = 0,
    panY: number = 0
): { x: number; y: number } => {
    return {
        x: (screenX - viewportRect.left - panX) / zoom,
        y: (screenY - viewportRect.top - panY) / zoom,
    };
};

/**
 * Convert canvas (SVG viewBox) coordinates to screen coordinates.
 * Exact inverse of screenToCanvas.
 *
 * NOTE: canvasWidth/canvasHeight are kept for API compatibility but unused.
 */
export const canvasToScreen = (
    canvasX: number,
    canvasY: number,
    viewportRect: DOMRect,
    _canvasWidth: number,
    _canvasHeight: number,
    zoom: number = 1,
    panX: number = 0,
    panY: number = 0
): { x: number; y: number } => {
    return {
        x: canvasX * zoom + panX + viewportRect.left,
        y: canvasY * zoom + panY + viewportRect.top,
    };
};

/**
 * Apply delta (dx, dy) to an object, handling special cases like line objects
 */
export const applyDelta = (
    obj: AnyCanvasObject,
    dx: number,
    dy: number
): Partial<AnyCanvasObject> => {
    if (obj.type === 'line') {
        const d = obj.data as { x1: number; y1: number; x2: number; y2: number; color: string; strokeWidth: number };
        return {
            x: obj.x + dx,
            y: obj.y + dy,
            data: {
                ...d,
                x1: d.x1 + dx,
                y1: d.y1 + dy,
                x2: d.x2 + dx,
                y2: d.y2 + dy,
            },
        };
    }

    // For all other objects, just update x and y
    return {
        x: obj.x + dx,
        y: obj.y + dy,
    };
};
