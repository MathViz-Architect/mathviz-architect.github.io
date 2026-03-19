// src/components/canvas/tools/useFreehandTool.ts
//
// Encapsulates all freehand drawing state and handlers.
// Extracted from Canvas.tsx to reduce its size — logic is unchanged.
//
// Usage:
//   const freehand = useFreehandTool({ penSettings, onAddObject, publishState });
//   // In mousedown: freehand.onMouseDown(x, y)
//   // In mousemove: freehand.onMouseMove(x, y)
//   // In mouseup:   freehand.onMouseUp()
//   // Overlay SVG:  freehand.overlay (null when not drawing)

import { useState, useRef, useCallback } from 'react';
import { AnyCanvasObject } from '@/lib/types';

interface UseFreehandToolOptions {
    penSettings: { width: number; color: string };
    onAddObject: (obj: AnyCanvasObject) => void;
    publishState: () => void;
}

export interface FreehandOverlay {
    points: { x: number; y: number }[];
    color: string;
    width: number;
}

export function useFreehandTool({ penSettings, onAddObject, publishState }: UseFreehandToolOptions) {
    const isDrawingRef = useRef(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    // Mirror of `points` in a ref so onMouseUp can read them synchronously
    // without a stale closure — avoids side effects inside a state updater.
    const pointsRef = useRef<{ x: number; y: number }[]>([]);

    const onMouseDown = useCallback((x: number, y: number) => {
        const firstPoint = { x, y };
        isDrawingRef.current = true;
        setIsDrawing(true);
        pointsRef.current = [firstPoint];
        setPoints([firstPoint]);
        lastPointRef.current = firstPoint;
    }, []);

    const onMouseMove = useCallback((x: number, y: number) => {
        if (!isDrawingRef.current) return;
        const last = lastPointRef.current;
        if (!last || Math.hypot(x - last.x, y - last.y) > 2) {
            const pt = { x, y };
            pointsRef.current = [...pointsRef.current, pt];
            setPoints(pointsRef.current);
            lastPointRef.current = pt;
        }
    }, []);

    const onMouseUp = useCallback(() => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        setIsDrawing(false);
        lastPointRef.current = null;

        // Read current points from ref to avoid stale closure,
        // then clear state. Side effects (onAddObject, publishState)
        // are called outside the updater — updaters must be pure.
        const currentPoints = pointsRef.current;
        setPoints([]);

        if (currentPoints.length >= 2) {
            const xs = currentPoints.map(p => p.x);
            const ys = currentPoints.map(p => p.y);
            const minX = Math.min(...xs), minY = Math.min(...ys);
            const maxX = Math.max(...xs), maxY = Math.max(...ys);
            const newPath: AnyCanvasObject = {
                id: crypto.randomUUID(),
                type: 'freehand',
                x: minX,
                y: minY,
                width: Math.max(maxX - minX, 1),
                height: Math.max(maxY - minY, 1),
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                data: { points: currentPoints, color: penSettings.color, width: penSettings.width },
            };
            onAddObject(newPath);
            publishState();
        }
    }, [isDrawing, penSettings, onAddObject, publishState]);

    // Overlay data for Canvas to render the in-progress stroke
    const overlay: FreehandOverlay | null = isDrawing && points.length > 0
        ? { points, color: penSettings.color, width: penSettings.width }
        : null;

    return { isDrawing, onMouseDown, onMouseMove, onMouseUp, overlay };
}
