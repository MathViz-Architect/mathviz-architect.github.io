// src/components/canvas/tools/useHighlighterTool.ts
//
// Hardened highlighter drawing tool.
// Mirrors useFreehandTool — all real-time logic runs off refs, never stale state.

import { useState, useRef, useCallback, useEffect } from 'react';
import { AnyCanvasObject } from '@/lib/types';

interface UseHighlighterToolOptions {
    penSettings: { width: number; color: string };
    onAddObject: (obj: AnyCanvasObject) => void;
    publishState: () => void;
    /** Current app mode — used to abort drawing on tool switch */
    mode: string;
}

export interface HighlighterOverlay {
    points: { x: number; y: number }[];
    color: string;
    width: number;
}

export function useHighlighterTool({ penSettings, onAddObject, publishState, mode }: UseHighlighterToolOptions) {
    const isDrawingRef = useRef(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [overlay, setOverlay] = useState<HighlighterOverlay | null>(null);

    const pointsRef = useRef<{ x: number; y: number }[]>([]);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const penRef = useRef(penSettings);
    penRef.current = penSettings;

    const abort = useCallback(() => {
        if (!isDrawingRef.current) return;
        console.log('[highlighter] CANCEL / ABORT');
        isDrawingRef.current = false;
        setIsDrawing(false);
        setOverlay(null);
        pointsRef.current = [];
        lastPointRef.current = null;
    }, []);

    const finalize = useCallback(() => {
        if (!isDrawingRef.current) return;
        console.log('[highlighter] DRAW END, points:', pointsRef.current.length);
        isDrawingRef.current = false;
        setIsDrawing(false);
        setOverlay(null);

        const currentPoints = pointsRef.current;
        pointsRef.current = [];
        lastPointRef.current = null;

        if (currentPoints.length < 1) return;

        const pts = currentPoints.length === 1
            ? [currentPoints[0], { ...currentPoints[0] }]
            : currentPoints;

        const xs = pts.map(p => p.x);
        const ys = pts.map(p => p.y);
        const minX = Math.min(...xs), minY = Math.min(...ys);
        const maxX = Math.max(...xs), maxY = Math.max(...ys);

        const newPath: AnyCanvasObject = {
            id: crypto.randomUUID(),
            type: 'highlighter',
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
        console.log('[highlighter] CREATE OBJECT', pts.length, 'pts at', minX, minY);
        onAddObject(newPath);
        publishState();
    }, [onAddObject, publishState]);

    const onMouseDown = useCallback((x: number, y: number) => {
        if (isDrawingRef.current) finalize();

        console.log('[highlighter] DRAW START at', x, y);
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
            console.log('[highlighter] MOVE, points:', pointsRef.current.length);
        }
    }, []);

    const onMouseUp = finalize;
    const onCancel = abort;

    useEffect(() => {
        if (mode !== 'highlighter' && isDrawingRef.current) {
            abort();
        }
    }, [mode, abort]);

    return { isDrawing, isDrawingRef, onMouseDown, onMouseMove, onMouseUp, onCancel, overlay };
}
