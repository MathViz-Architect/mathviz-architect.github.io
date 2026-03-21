import { AnyCanvasObject } from '@/lib/types';

export interface SnapResult {
    x: number;
    y: number;
    snapped: boolean;
    targetId?: string;
}

/**
 * Find the nearest geopoint within `radius` of (x, y).
 * Returns snapped coordinates (center of the point) when found,
 * otherwise returns the original coordinates with snapped: false.
 */
export function getSnapPoint(
    objects: AnyCanvasObject[],
    x: number,
    y: number,
    radius: number,
): SnapResult {
    let best: AnyCanvasObject | null = null;
    let bestDist = radius;

    for (const o of objects) {
        if (o.type !== 'geopoint') continue;
        const cx = o.x + o.width / 2;
        const cy = o.y + o.height / 2;
        const d = Math.hypot(cx - x, cy - y);
        if (d <= bestDist) {
            bestDist = d;
            best = o;
        }
    }

    if (best) {
        return {
            x: best.x + best.width / 2,
            y: best.y + best.height / 2,
            snapped: true,
            targetId: best.id,
        };
    }

    return { x, y, snapped: false };
}
