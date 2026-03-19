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
    
    // Calculate scaling factor between screen pixels and logical canvas
    // This accounts for when SVG is smaller/larger than the logical canvas
    const scaleX = canvasWidth / viewportRect.width;
    const scaleY = canvasHeight / viewportRect.height;
    
    // Convert to canvas coordinates (logical space)
    const canvasX = viewportX * scaleX;
    const canvasY = viewportY * scaleY;
    
    // Apply pan and zoom transformations
    const worldX = (canvasX - panX) / zoom;
    const worldY = (canvasY - panY) / zoom;
    
    return {
        x: worldX,
        y: worldY,
    };
};

/**
 * Convert canvas (SVG viewBox) coordinates to screen coordinates
 * Inverse of screenToCanvas
 */
export const canvasToScreen = (
    canvasX: number,
    canvasY: number,
    viewportRect: DOMRect,
    canvasWidth: number,
    canvasHeight: number,
    zoom: number = 1,
    panX: number = 0,
    panY: number = 0
): { x: number; y: number } => {
    // Apply pan and zoom in reverse
    const worldX = canvasX * zoom + panX;
    const worldY = canvasY * zoom + panY;
    
    // Calculate scaling factor
    const scaleX = viewportRect.width / canvasWidth;
    const scaleY = viewportRect.height / canvasHeight;
    
    // Convert to screen coordinates
    const screenX = worldX * scaleX + viewportRect.left;
    const screenY = worldY * scaleY + viewportRect.top;
    
    return {
        x: screenX,
        y: screenY,
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
