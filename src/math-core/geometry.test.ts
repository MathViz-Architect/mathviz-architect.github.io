import { describe, it, expect } from 'vitest';
import {
    pointToSegmentDistance,
    isPointInObject,
    getBoundingBox,
    objectsIntersectRect,
    calculateDistance,
    calculateArrowAngle,
    calculateArrowHeadPoints,
} from './geometry';
import { AnyCanvasObject } from '@/lib/types';

describe('pointToSegmentDistance', () => {
    it('should return ~0 for point on segment', () => {
        const distance = pointToSegmentDistance(2, 2, 0, 0, 4, 4);
        expect(distance).toBeCloseTo(0, 1);
    });

    it('should return correct perpendicular distance for point off segment', () => {
        const distance = pointToSegmentDistance(2, 0, 0, 0, 4, 0);
        expect(distance).toBeCloseTo(0, 1);

        const distance2 = pointToSegmentDistance(2, 3, 0, 0, 4, 0);
        expect(distance2).toBeCloseTo(3, 1);
    });

    it('should handle degenerate segment (start === end)', () => {
        const distance = pointToSegmentDistance(5, 5, 2, 2, 2, 2);
        const expected = Math.sqrt((5 - 2) ** 2 + (5 - 2) ** 2);
        expect(distance).toBeCloseTo(expected, 1);
    });
});

describe('isPointInObject', () => {
    it('should return true for point inside rectangle', () => {
        const rect: AnyCanvasObject = {
            id: 'rect1',
            type: 'rectangle',
            x: 10,
            y: 10,
            width: 50,
            height: 30,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            data: {},
        };
        expect(isPointInObject(30, 20, rect)).toBe(true);
    });

    it('should return false for point outside rectangle', () => {
        const rect: AnyCanvasObject = {
            id: 'rect1',
            type: 'rectangle',
            x: 10,
            y: 10,
            width: 50,
            height: 30,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            data: {},
        };
        expect(isPointInObject(5, 5, rect)).toBe(false);
        expect(isPointInObject(100, 100, rect)).toBe(false);
    });

    it('should return true for point inside circle (within radius)', () => {
        const circle: AnyCanvasObject = {
            id: 'circle1',
            type: 'circle',
            x: 50,
            y: 50,
            width: 40,
            height: 40,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            data: {},
        };
        // Center is at (70, 70), radius is 20
        expect(isPointInObject(70, 70, circle)).toBe(true);
        expect(isPointInObject(75, 70, circle)).toBe(true);
    });

    it('should return false for point outside circle', () => {
        const circle: AnyCanvasObject = {
            id: 'circle1',
            type: 'circle',
            x: 50,
            y: 50,
            width: 40,
            height: 40,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            data: {},
        };
        expect(isPointInObject(10, 10, circle)).toBe(false);
        expect(isPointInObject(150, 150, circle)).toBe(false);
    });

    it('should handle line objects with tolerance', () => {
        const line: AnyCanvasObject = {
            id: 'line1',
            type: 'line',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            data: {
                x1: 0,
                y1: 0,
                x2: 100,
                y2: 100,
            },
        };
        // Point on line should be within tolerance
        expect(isPointInObject(50, 50, line)).toBe(true);
        // Point far from line should be outside tolerance
        expect(isPointInObject(50, 100, line)).toBe(false);
    });
});

describe('getBoundingBox', () => {
    it('should return correct bounding box for rectangle', () => {
        const rect: AnyCanvasObject = {
            id: 'rect1',
            type: 'rectangle',
            x: 10,
            y: 20,
            width: 50,
            height: 30,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            data: {},
        };
        const bbox = getBoundingBox(rect);
        expect(bbox).toEqual({
            minX: 10,
            maxX: 60,
            minY: 20,
            maxY: 50,
        });
    });

    it('should return correct bounding box for line with tolerance', () => {
        const line: AnyCanvasObject = {
            id: 'line1',
            type: 'line',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            data: {
                x1: 10,
                y1: 10,
                x2: 50,
                y2: 50,
                strokeWidth: 2,
            },
        };
        const bbox = getBoundingBox(line);
        const tolerance = 2 + 3; // strokeWidth + 3
        expect(bbox.minX).toBe(10 - tolerance);
        expect(bbox.maxX).toBe(50 + tolerance);
        expect(bbox.minY).toBe(10 - tolerance);
        expect(bbox.maxY).toBe(50 + tolerance);
    });
});

describe('objectsIntersectRect', () => {
    const rect: AnyCanvasObject = {
        id: 'rect1',
        type: 'rectangle',
        x: 20,
        y: 20,
        width: 40,
        height: 40,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        data: {},
    };

    it('should return true for object fully inside rect', () => {
        expect(objectsIntersectRect(rect, 10, 10, 70, 70)).toBe(true);
    });

    it('should return false for object fully outside rect', () => {
        expect(objectsIntersectRect(rect, 100, 100, 200, 200)).toBe(false);
        expect(objectsIntersectRect(rect, 0, 0, 10, 10)).toBe(false);
    });

    it('should return true for object partially overlapping rect', () => {
        expect(objectsIntersectRect(rect, 30, 30, 100, 100)).toBe(true);
        expect(objectsIntersectRect(rect, 0, 0, 30, 30)).toBe(true);
    });
});

describe('calculateDistance', () => {
    it('should calculate distance (0,0) to (3,4) as 5', () => {
        const distance = calculateDistance(0, 0, 3, 4);
        expect(distance).toBe(5);
    });

    it('should calculate distance (0,0) to (0,0) as 0', () => {
        const distance = calculateDistance(0, 0, 0, 0);
        expect(distance).toBe(0);
    });

    it('should calculate distance (1,1) to (4,5) as 5', () => {
        const distance = calculateDistance(1, 1, 4, 5);
        expect(distance).toBe(5);
    });

    it('should handle negative coordinates', () => {
        const distance = calculateDistance(-3, -4, 0, 0);
        expect(distance).toBe(5);
    });
});

describe('geometry bounds and edge cases', () => {
    const VIEWBOX_WIDTH = 800;
    const VIEWBOX_HEIGHT = 600;
    const PADDING = 20;

    const clampToViewBox = (x: number, y: number): { x: number; y: number } => {
        return {
            x: Math.max(PADDING, Math.min(VIEWBOX_WIDTH - PADDING, x)),
            y: Math.max(PADDING, Math.min(VIEWBOX_HEIGHT - PADDING, y)),
        };
    };

    const isInViewBox = (x: number, y: number): boolean => {
        return x >= PADDING && x <= VIEWBOX_WIDTH - PADDING &&
               y >= PADDING && y <= VIEWBOX_HEIGHT - PADDING;
    };

    it('should clamp points to viewBox bounds', () => {
        // Very large values should be clamped
        expect(clampToViewBox(1000, 1000)).toEqual({ x: 780, y: 580 });
        expect(clampToViewBox(-100, -100)).toEqual({ x: 20, y: 20 });
        
        // Values within bounds should remain unchanged
        expect(clampToViewBox(400, 300)).toEqual({ x: 400, y: 300 });
    });

    it('should keep points inside viewBox for typical triangle (3-4-5)', () => {
        // Triangle with sides 3-4-5
        const a = 3 * 40;  // 120
        const b = 4 * 40;  // 160
        const c = 5 * 40;  // 200
        
        // Right triangle vertices
        const vertices = [
            { x: PADDING + 50, y: VIEWBOX_HEIGHT - PADDING - 50 },  // Right angle
            { x: PADDING + 50, y: VIEWBOX_HEIGHT - PADDING - 50 - a },  // Top
            { x: PADDING + 50 + b, y: VIEWBOX_HEIGHT - PADDING - 50 },  // Right
        ];
        
        for (const v of vertices) {
            expect(isInViewBox(v.x, v.y)).toBe(true);
        }
    });

    it('should handle degenerate triangle (collinear points)', () => {
        // All points on a line
        const points = [
            { x: 100, y: 100 },
            { x: 200, y: 200 },
            { x: 300, y: 300 },
        ];
        
        for (const p of points) {
            expect(isInViewBox(p.x, p.y)).toBe(true);
        }
        
        // All points outside should still be detected
        expect(isInViewBox(1000, 1000)).toBe(false);
        expect(isInViewBox(-100, -100)).toBe(false);
    });

    it('should handle zero area polygon', () => {
        const degeneratePolygon: AnyCanvasObject = {
            id: 'degenerate',
            type: 'polygon',
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            data: { points: [] },
        };
        
        const bbox = getBoundingBox(degeneratePolygon);
        expect(bbox.minX).toBe(0);
        expect(bbox.minY).toBe(0);
        expect(bbox.maxX).toBe(0);
        expect(bbox.maxY).toBe(0);
    });

    it('should handle very large triangle within bounds', () => {
        const largeTriangle = [
            { x: 100, y: 500 },
            { x: 400, y: 100 },
            { x: 700, y: 500 },
        ];
        
        for (const p of largeTriangle) {
            const clamped = clampToViewBox(p.x, p.y);
            expect(clamped.x).toBeGreaterThanOrEqual(PADDING);
            expect(clamped.x).toBeLessThanOrEqual(VIEWBOX_WIDTH - PADDING);
        }
    });

    it('should handle line at extreme values', () => {
        const extremeLine: AnyCanvasObject = {
            id: 'line',
            type: 'line',
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            data: {
                x1: -10000,
                y1: -10000,
                x2: 10000,
                y2: 10000,
                color: '#000',
                strokeWidth: 2,
            },
        };
        
        const bbox = getBoundingBox(extremeLine);
        // Should handle extreme values without crashing
        expect(bbox.minX).toBeLessThan(bbox.maxX);
        expect(bbox.minY).toBeLessThan(bbox.maxY);
    });

    it('should handle circle with very large radius', () => {
        const largeCircle: AnyCanvasObject = {
            id: 'circle',
            type: 'circle',
            x: 400,
            y: 300,
            width: 1000,
            height: 1000,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            data: { fill: '#f00', stroke: '#000', strokeWidth: 1 },
        };
        
        const bbox = getBoundingBox(largeCircle);
        expect(bbox.maxX - bbox.minX).toBe(1000);
        expect(bbox.maxY - bbox.minY).toBe(1000);
    });

    describe('arrow calculations', () => {
        it('should calculate arrow angle correctly', () => {
            // 0 degrees (pointing right)
            expect(calculateArrowAngle(0, 0, 1, 0)).toBeCloseTo(0, 5);
            
            // 90 degrees (pointing down)
            expect(calculateArrowAngle(0, 0, 0, 1)).toBeCloseTo(Math.PI / 2, 5);
            
            // 180 degrees (pointing left)
            expect(calculateArrowAngle(0, 0, -1, 0)).toBeCloseTo(Math.PI, 5);
            
            // -90 degrees (pointing up)
            expect(calculateArrowAngle(0, 0, 0, -1)).toBeCloseTo(-Math.PI / 2, 5);
        });

        it('should calculate arrow head points for forward direction', () => {
            const result = calculateArrowHeadPoints(0, 0, 0, 10, 'forward');
            
            expect(result.point1X).not.toBeNaN();
            expect(result.point1Y).not.toBeNaN();
            expect(result.point2X).not.toBeNaN();
            expect(result.point2Y).not.toBeNaN();
        });

        it('should calculate arrow head points for backward direction', () => {
            const result = calculateArrowHeadPoints(0, 0, 0, 10, 'backward');
            
            expect(result.point1X).not.toBeNaN();
            expect(result.point1Y).not.toBeNaN();
            expect(result.point2X).not.toBeNaN();
            expect(result.point2Y).not.toBeNaN();
        });

        it('should handle zero length arrow', () => {
            const result = calculateArrowHeadPoints(0, 0, 0, 0, 'forward');
            
            expect(result.point1X).toBe(0);
            expect(result.point1Y).toBe(0);
        });
    });

    describe('pointInObject edge cases', () => {
        it('should handle polygon at origin', () => {
            const polygon: AnyCanvasObject = {
                id: 'polygon',
                type: 'polygon',
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                data: {
                    points: [
                        { x: 0, y: 0 },
                        { x: 100, y: 0 },
                        { x: 100, y: 100 },
                        { x: 0, y: 100 },
                    ],
                },
            };
            
            expect(isPointInObject(50, 50, polygon)).toBe(true);
            // Note: Point outside the bounding box of the normalized points might still be detected
            expect(isPointInObject(-50, -50, polygon)).toBe(false);
        });

        it('should handle line with zero length', () => {
            const zeroLine: AnyCanvasObject = {
                id: 'line',
                type: 'line',
                x: 50,
                y: 50,
                width: 0,
                height: 0,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                data: {
                    x1: 50,
                    y1: 50,
                    x2: 50,
                    y2: 50,
                    color: '#000',
                    strokeWidth: 2,
                },
            };
            
            // Point at the endpoint should be within tolerance
            expect(isPointInObject(50, 50, zeroLine)).toBe(true);
            // Points outside tolerance should return false
            expect(isPointInObject(100, 100, zeroLine)).toBe(false);
        });
    });

    describe('objectsIntersectRect edge cases', () => {
        it('should handle objects at negative coordinates', () => {
            const obj: AnyCanvasObject = {
                id: 'obj',
                type: 'rectangle',
                x: -50,
                y: -50,
                width: 100,
                height: 100,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                data: {},
            };
            
            expect(objectsIntersectRect(obj, -100, -100, 0, 0)).toBe(true);
            expect(objectsIntersectRect(obj, 100, 100, 200, 200)).toBe(false);
        });

        it('should handle line intersecting rectangle', () => {
            const line: AnyCanvasObject = {
                id: 'line',
                type: 'line',
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                data: {
                    x1: 0,
                    y1: 0,
                    x2: 100,
                    y2: 100,
                    color: '#000',
                    strokeWidth: 2,
                },
            };
            
            expect(objectsIntersectRect(line, 0, 0, 50, 50)).toBe(true);
            expect(objectsIntersectRect(line, 200, 200, 300, 300)).toBe(false);
        });
    });
});
