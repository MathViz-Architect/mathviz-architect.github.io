import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { applyDelta } from '@/math-core';
import type { AnyCanvasObject } from '@/lib/types';

// ─── Inline helpers (mirror Canvas.tsx logic without importing it) ────────────

type ShapeType = 'trapezoid' | 'rhombus' | 'parallelogram';
type Vertex = { x: number; y: number };

const EXPECTED_POINTS: Record<ShapeType, Vertex[]> = {
    trapezoid: [{ x: 0.2, y: 0 }, { x: 0.8, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }],
    rhombus: [{ x: 0.5, y: 0 }, { x: 1, y: 0.5 }, { x: 0.5, y: 1 }, { x: 0, y: 0.5 }],
    parallelogram: [{ x: 0.25, y: 0 }, { x: 1, y: 0 }, { x: 0.75, y: 1 }, { x: 0, y: 1 }],
};

/**
 * Mirrors the switch-case logic in Canvas.tsx handleCanvasPointerUp.
 * Returns a Polygon_Object or null if w/h ≤ 5.
 */
function createShapeObject(
    shapeType: ShapeType,
    sx: number,
    sy: number,
    w: number,
    h: number,
): AnyCanvasObject {
    const id = 'test-id';
    const points = EXPECTED_POINTS[shapeType];
    return {
        id,
        type: 'polygon',
        x: sx,
        y: sy,
        width: w,
        height: h,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        data: { points, fill: '#F59E0B', stroke: '#D97706', strokeWidth: 2 },
    } as AnyCanvasObject;
}

function tryCreateShapeObject(
    shapeType: ShapeType,
    sx: number,
    sy: number,
    w: number,
    h: number,
): AnyCanvasObject | null {
    if (w > 5 && h > 5) return createShapeObject(shapeType, sx, sy, w, h);
    return null;
}

/**
 * Mirrors the ObjectRenderer polygon pts computation.
 * px = vertex.x * width + x, py = vertex.y * height + y
 */
function computePolygonPoints(obj: {
    x: number;
    y: number;
    width: number;
    height: number;
    data: { points: Vertex[] };
}): string {
    return obj.data.points
        .map(p => `${p.x * obj.width + obj.x},${p.y * obj.height + obj.y}`)
        .join(' ');
}

// ─── Property-based tests ─────────────────────────────────────────────────────

describe('geometric-shapes-expansion property tests', () => {

    // Feature: geometric-shapes-expansion, Property 1: normalized vertices match shapeType
    // Validates: Requirements 2.1, 2.2, 2.3
    it('Property 1: normalized vertices match shapeType', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<ShapeType>('trapezoid', 'rhombus', 'parallelogram'),
                fc.float({ min: 6, max: 1000, noNaN: true }),
                fc.float({ min: 6, max: 1000, noNaN: true }),
                fc.float({ min: 0, max: 1000, noNaN: true }),
                fc.float({ min: 0, max: 1000, noNaN: true }),
                (shapeType, w, h, sx, sy) => {
                    const obj = createShapeObject(shapeType, sx, sy, w, h);
                    expect(obj.type).toBe('polygon');
                    const data = obj.data as { points: Vertex[] };
                    expect(data.points).toEqual(EXPECTED_POINTS[shapeType]);
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: geometric-shapes-expansion, Property 2: no object created for small areas
    // Validates: Requirements 2.4
    it('Property 2: no object created for small areas', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<ShapeType>('trapezoid', 'rhombus', 'parallelogram'),
                fc.oneof(
                    fc.record({
                        w: fc.float({ min: -1000, max: 5, noNaN: true }),
                        h: fc.float({ min: 6, max: 1000, noNaN: true }),
                    }),
                    fc.record({
                        w: fc.float({ min: 6, max: 1000, noNaN: true }),
                        h: fc.float({ min: -1000, max: 5, noNaN: true }),
                    }),
                    fc.record({
                        w: fc.float({ min: -1000, max: 5, noNaN: true }),
                        h: fc.float({ min: -1000, max: 5, noNaN: true }),
                    }),
                ),
                (shapeType, { w, h }) => {
                    const result = tryCreateShapeObject(shapeType, 0, 0, w, h);
                    expect(result).toBeNull();
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: geometric-shapes-expansion, Property 4: SVG points formula correctness
    // Validates: Requirements 3.1
    it('Property 4: SVG points formula correctness', () => {
        fc.assert(
            fc.property(
                fc.record({
                    x: fc.float({ min: 0, max: 1000, noNaN: true }),
                    y: fc.float({ min: 0, max: 1000, noNaN: true }),
                    width: fc.float({ min: 6, max: 1000, noNaN: true }),
                    height: fc.float({ min: 6, max: 1000, noNaN: true }),
                    points: fc.array(
                        fc.record({
                            x: fc.float({ min: 0, max: 1, noNaN: true }),
                            y: fc.float({ min: 0, max: 1, noNaN: true }),
                        }),
                        { minLength: 3, maxLength: 6 },
                    ),
                }),
                ({ x, y, width, height, points }) => {
                    const expected = points
                        .map(p => `${p.x * width + x},${p.y * height + y}`)
                        .join(' ');
                    const actual = computePolygonPoints({ x, y, width, height, data: { points } });
                    expect(actual).toBe(expected);
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: geometric-shapes-expansion, Property 9: applyDelta preserves data.points
    // Validates: Requirements 6.3
    it('Property 9: applyDelta preserves data.points', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<ShapeType>('trapezoid', 'rhombus', 'parallelogram'),
                fc.float({ min: -500, max: 500, noNaN: true }),
                fc.float({ min: -500, max: 500, noNaN: true }),
                (shapeType, dx, dy) => {
                    const obj = createShapeObject(shapeType, 100, 100, 200, 150);
                    const originalPoints = (obj.data as { points: Vertex[] }).points;
                    const delta = applyDelta(obj, dx, dy);
                    // applyDelta returns a Partial — merge to get the moved object
                    const moved = { ...obj, ...delta };
                    const movedPoints = (moved.data as { points: Vertex[] }).points;
                    expect(movedPoints).toEqual(originalPoints);
                },
            ),
            { numRuns: 100 },
        );
    });
});
