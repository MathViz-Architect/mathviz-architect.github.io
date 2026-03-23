import { AnyCanvasObject } from '@/lib/types';
import { getPointSegmentProjection, getSegmentIntersection } from '@/math-core';

export type SnapKind = 'point' | 'intersection' | 'midpoint' | 'on-path';

export interface SnapResult {
    x: number;
    y: number;
    snapped: boolean;
    /** For 'point': id of the geopoint. For others: undefined (use sourceIds). */
    targetId?: string;
    kind?: SnapKind;
    /** Segment ids involved in the snap (1 for midpoint/on-path, 2 for intersection). */
    sourceIds?: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface SegmentEndpoints {
    id: string;
    ax: number; ay: number;
    bx: number; by: number;
}

/**
 * Resolve geosegment objects to their absolute endpoint coordinates.
 * Builds a point-id → center map in one pass to avoid O(n) find() per segment.
 */
function resolveSegments(objects: AnyCanvasObject[]): SegmentEndpoints[] {
    // Build center map for geopoints
    const centers = new Map<string, { x: number; y: number }>();
    for (const o of objects) {
        if (o.type === 'geopoint') {
            centers.set(o.id, { x: o.x + o.width / 2, y: o.y + o.height / 2 });
        }
    }

    const result: SegmentEndpoints[] = [];
    for (const o of objects) {
        if (o.type !== 'geosegment') continue;
        const data = o.data as { pointAId: string; pointBId: string };
        const A = centers.get(data.pointAId);
        const B = centers.get(data.pointBId);
        if (!A || !B) continue;
        result.push({ id: o.id, ax: A.x, ay: A.y, bx: B.x, by: B.y });
    }
    return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Find the best snap candidate near (x, y) within `radius`.
 *
 * Priority (highest → lowest):
 *   1. point       — existing geopoint vertex
 *   2. intersection — where two geosegments cross
 *   3. midpoint    — centre of a geosegment
 *   4. on-path     — closest point on any geosegment
 *
 * Intersection candidates are pre-filtered: only segments whose bounding box
 * overlaps a (2 * radius) square around the cursor are considered, keeping
 * the worst-case cost well below O(n²) for typical drawings.
 */
export function getSnapPoint(
    objects: AnyCanvasObject[],
    x: number,
    y: number,
    radius: number,
): SnapResult {
    // ── 1. Existing geopoint ────────────────────────────────────────────────
    let bestDist = radius;
    let bestPoint: AnyCanvasObject | null = null;

    for (const o of objects) {
        if (o.type !== 'geopoint') continue;
        const cx = o.x + o.width / 2;
        const cy = o.y + o.height / 2;
        const d = Math.hypot(cx - x, cy - y);
        if (d <= bestDist) { bestDist = d; bestPoint = o; }
    }

    if (bestPoint) {
        return {
            x: bestPoint.x + bestPoint.width / 2,
            y: bestPoint.y + bestPoint.height / 2,
            snapped: true,
            targetId: bestPoint.id,
            kind: 'point',
        };
    }

    // Resolve segments once — shared by all remaining checks
    const segments = resolveSegments(objects);
    if (segments.length === 0) return { x, y, snapped: false };

    // ── 2. Intersection ─────────────────────────────────────────────────────
    // Pre-filter: keep only segments whose AABB overlaps the snap zone
    const snapZone = radius * 2;
    const nearby = segments.filter(s =>
        Math.min(s.ax, s.bx) <= x + snapZone &&
        Math.max(s.ax, s.bx) >= x - snapZone &&
        Math.min(s.ay, s.by) <= y + snapZone &&
        Math.max(s.ay, s.by) >= y - snapZone
    );

    let bestIntersection: { x: number; y: number; ids: [string, string] } | null = null;
    bestDist = radius;

    for (let i = 0; i < nearby.length; i++) {
        for (let j = i + 1; j < nearby.length; j++) {
            const s1 = nearby[i], s2 = nearby[j];
            const pt = getSegmentIntersection(s1.ax, s1.ay, s1.bx, s1.by, s2.ax, s2.ay, s2.bx, s2.by);
            if (!pt) continue;
            const d = Math.hypot(pt.x - x, pt.y - y);
            if (d <= bestDist) { bestDist = d; bestIntersection = { x: pt.x, y: pt.y, ids: [s1.id, s2.id] }; }
        }
    }

    if (bestIntersection) {
        return {
            x: bestIntersection.x,
            y: bestIntersection.y,
            snapped: true,
            kind: 'intersection',
            sourceIds: bestIntersection.ids,
        };
    }

    // ── 3. Midpoint ─────────────────────────────────────────────────────────
    let bestMidpoint: { x: number; y: number; id: string } | null = null;
    bestDist = radius;

    for (const s of segments) {
        const mx = (s.ax + s.bx) / 2;
        const my = (s.ay + s.by) / 2;
        const d = Math.hypot(mx - x, my - y);
        if (d <= bestDist) { bestDist = d; bestMidpoint = { x: mx, y: my, id: s.id }; }
    }

    if (bestMidpoint) {
        return {
            x: bestMidpoint.x,
            y: bestMidpoint.y,
            snapped: true,
            kind: 'midpoint',
            sourceIds: [bestMidpoint.id],
        };
    }

    // ── 4. On-path ──────────────────────────────────────────────────────────
    let bestOnPath: { x: number; y: number; id: string } | null = null;
    bestDist = radius;

    for (const s of segments) {
        const proj = getPointSegmentProjection(x, y, s.ax, s.ay, s.bx, s.by);
        const d = Math.hypot(proj.x - x, proj.y - y);
        if (d <= bestDist) { bestDist = d; bestOnPath = { x: proj.x, y: proj.y, id: s.id }; }
    }

    if (bestOnPath) {
        return {
            x: bestOnPath.x,
            y: bestOnPath.y,
            snapped: true,
            kind: 'on-path',
            sourceIds: [bestOnPath.id],
        };
    }

    return { x, y, snapped: false };
}
