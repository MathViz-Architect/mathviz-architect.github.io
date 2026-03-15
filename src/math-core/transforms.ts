import { AnyCanvasObject } from '@/lib/types';

/**
 * Convert screen coordinates to canvas (SVG viewBox) coordinates
 * Accounts for zoom and pan transformations applied to the world div
 * 
 * Architecture:
 * - viewport: screen-sized container with overflow:hidden
 * - world: transformed div with translate(panX, panY) scale(zoom)
 * - svg: static logical canvas inside world
 * 
 * Coordinate conversion:
 * 1. Get mouse position relative to viewport
 * 2. Subtract pan offset (in screen pixels)
 * 3. Divide by zoom to get world coordinates
 * 4. These are already in canvas (viewBox) coordinates
 */
export const screenToCanvas = (
    screenX: number,
    screenY: number,
    viewportRect: DOMRect,
    canvasWidth: number,
    canvasHeight: number,
    zoom: number = 1,
    panX: number = 0,
    panY: number = 0
): { x: number; y: number } => {
    // Position relative to viewport top-left
    const viewportX = screenX - viewportRect.left;
    const viewportY = screenY - viewportRect.top;
    
    // Subtract pan offset and divide by zoom to get world coordinates
    const worldX = (viewportX - panX) / zoom;
    const worldY = (viewportY - panY) / zoom;
    
    // These world coordinates map directly to canvas viewBox coordinates
    // (since SVG viewBox matches canvasWidth/canvasHeight)
    return {
        x: worldX,
        y: worldY,
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
