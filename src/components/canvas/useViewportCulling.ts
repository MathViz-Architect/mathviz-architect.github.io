// src/components/canvas/useViewportCulling.ts
//
// Filters canvas objects to only those visible in the current viewport.
// Prevents rendering hundreds of off-screen objects, which degrades performance.
//
// Usage:
//   const visibleObjects = useViewportCulling(objects, zoom, panOffset, containerRef);
//
// Objects within CULL_PADDING pixels of the viewport edge are always included
// to prevent pop-in during fast panning.

import { useMemo } from 'react';
import { AnyCanvasObject } from '@/lib/types';

const CULL_PADDING = 150; // px in canvas coordinates

interface PanOffset {
    x: number;
    y: number;
}

/**
 * Returns the bounding box of an object in canvas coordinates.
 * Uses x/y/width/height which all AnyCanvasObject types have.
 */
function getObjectBounds(obj: AnyCanvasObject) {
    return {
        left: obj.x,
        top: obj.y,
        right: obj.x + obj.width,
        bottom: obj.y + obj.height,
    };
}

/**
 * Returns the visible canvas rect in canvas coordinates,
 * given the viewport size, zoom, and pan offset.
 */
function getVisibleRect(
    viewportWidth: number,
    viewportHeight: number,
    zoom: number,
    panOffset: PanOffset,
) {
    // panOffset shifts the canvas-world div; to find what canvas coords are visible,
    // we invert: canvas_x = (screen_x - panOffset.x) / zoom
    const left = (-panOffset.x) / zoom - CULL_PADDING;
    const top = (-panOffset.y) / zoom - CULL_PADDING;
    const right = (viewportWidth - panOffset.x) / zoom + CULL_PADDING;
    const bottom = (viewportHeight - panOffset.y) / zoom + CULL_PADDING;
    return { left, top, right, bottom };
}

export function useViewportCulling(
    objects: AnyCanvasObject[],
    zoom: number,
    panOffset: PanOffset,
    viewportWidth: number,
    viewportHeight: number,
): AnyCanvasObject[] {
    return useMemo(() => {
        // Skip culling when viewport size is unknown (SSR / first render)
        if (viewportWidth === 0 || viewportHeight === 0) return objects;

        const vr = getVisibleRect(viewportWidth, viewportHeight, zoom, panOffset);

        return objects.filter(obj => {
            const b = getObjectBounds(obj);
            // Include if object overlaps the visible rect
            return b.right >= vr.left && b.left <= vr.right &&
                b.bottom >= vr.top && b.top <= vr.bottom;
        });
    }, [objects, zoom, panOffset, viewportWidth, viewportHeight]);
}
