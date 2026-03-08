import { AnyCanvasObject } from '@/lib/types';

/**
 * Convert screen coordinates to canvas (SVG viewBox) coordinates
 */
export const screenToCanvas = (
    screenX: number,
    screenY: number,
    svgRect: DOMRect,
    canvasWidth: number,
    canvasHeight: number
): { x: number; y: number } => {
    return {
        x: (screenX - svgRect.left) * (canvasWidth / svgRect.width),
        y: (screenY - svgRect.top) * (canvasHeight / svgRect.height),
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
