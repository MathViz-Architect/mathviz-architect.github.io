// src/components/canvas/tools/useFreehandTool.ts
//
// Hardened freehand drawing tool.
// All real-time logic runs off refs — never stale React state.
// Supports mouse, touch, and stylus (pen) input uniformly.

import { useState, useRef, useCallback, useEffect } from 'react';
import { AnyCanvasObject } from '@/lib/types';

interface UseFreehandToolOptions {
    penSettings: { width: number; color: string };
    onAddObject: (obj: AnyCanvasObject) => void;
    publishState: () => void;
    /** Current app mode — used to abort drawing on tool switch */
    mode: string;
}

export interface FreehandOverlay {
    points: { x: number; y: number }[];
    color: string;
    width: number;
}

export function useFreehandTool({ penSettings, onAddObject, publishState, mode }: UseFreehandToolOptions) {
    // isDrawingRef is the authoritative flag — never stale, safe in all callbacks
    const isDrawingRef = useRef(false);
    // isDrawing state is only used for overlay rendering (UI concern)
    const [isDrawing, setIsDrawing] = useState(false);
    const [overlay, setOverlay] = useState<FreehandOverlay | null>(null);

    const pointsRef = useRef<{ x: number; y: number }[]>([]);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    // Snapshot of penSettings at stroke start — avoids mid-stroke color/width changes
    const penRef = useRef(penSettings);
    penRef.current = penSettings;

    // Abort drawing cleanly without creating an object (cancel / tool switch)
    const abort = useCallback(() => {
        if (!isDrawingRef.current) return;
        console.log('[freehand] CANCEL / ABORT');
        isDrawingRef.current = false;
        setIsDrawing(false);
        setOverlay(null);
        pointsRef.current = [];
        lastPointRef.current = null;
    }, []);

    // Finalize: commit stroke as object (or abort if no points)
    const finalize = useCallback(() => {
        if (!isDrawingRef.current) return;
        console.log('[freehand] DRAW END, points:', pointsRef.current.length);
        isDrawingRef.current = false;
        setIsDrawing(false);
        setOverlay(null);

        const currentPoints = pointsRef.current;
        pointsRef.current = [];
        lastPointRef.current = null;

        if (currentPoints.length < 1) return;

        // Normalize tap (single point) → duplicate to form a valid 2-point segment
        // strokeLinecap="round" on a zero-length path renders as a visible dot
        const pts = currentPoints.length === 1
            ? [currentPoints[0], { ...currentPoints[0] }]
            : currentPoints;

        const xs = pts.map(p => p.x);
        const ys = pts.map(p => p.y);
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
            data: { points: pts, color: penRef.current.color, width: penRef.current.width },
        };
        console.log('[freehand] CREATE OBJECT', pts.length, 'pts at', minX, minY);
        onAddObject(newPath);
        publishState();
    }, [onAddObject, publishState]);

    const onMouseDown = useCallback((x: number, y: number) => {
        // If somehow already drawing (e.g. missed cancel), finalize first
        if (isDrawingRef.current) finalize();

        console.log('[freehand] DRAW START at', x, y);
        const firstPoint = { x, y };
        isDrawingRef.current = true;
        setIsDrawing(true);
        pointsRef.current = [firstPoint];
        lastPointRef.current = firstPoint;
        setOverlay({ points: [firstPoint], color: penRef.current.color, width: penRef.current.width });
    }, [finalize]);

    const onMouseMove = useCallback((x: number, y: number) => {
        if (!isDrawingRef.current) return;
        const last = lastPointRef.current;
        if (!last || Math.hypot(x - last.x, y - last.y) > 2) {
            const pt = { x, y };
            pointsRef.current = [...pointsRef.current, pt];
            lastPointRef.current = pt;
            setOverlay({ points: pointsRef.current, color: penRef.current.color, width: penRef.current.width });
            console.log('[freehand] MOVE, points:', pointsRef.current.length);
        }
    }, []);

    // onMouseUp = finalize (public alias)
    const onMouseUp = finalize;

    // onCancel = abort without creating object
    const onCancel = abort;

    // Abort drawing if tool is switched mid-stroke
    useEffect(() => {
        if (mode !== 'freehand' && isDrawingRef.current) {
            abort();
        }
    }, [mode, abort]);

    return { isDrawing, isDrawingRef, onMouseDown, onMouseMove, onMouseUp, onCancel, overlay };
}
