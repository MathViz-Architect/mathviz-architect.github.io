import { describe, it, expect } from 'vitest';
import { distance, dot, cross, angleBetween, findNearbyPoint, SNAP_RADIUS } from './geometry';
import { AnyCanvasObject } from './types';

describe('Geometry', () => {
    describe('distance', () => {
        it('should calculate Euclidean distance', () => {
            expect(distance(0, 0, 3, 4)).toBe(5);
        });

        it('should return 0 for same point', () => {
            expect(distance(1, 1, 1, 1)).toBe(0);
        });

        it('should handle negative coordinates', () => {
            expect(distance(-3, -4, 0, 0)).toBe(5);
        });

        it('should handle horizontal line', () => {
            expect(distance(0, 0, 5, 0)).toBe(5);
        });

        it('should handle vertical line', () => {
            expect(distance(0, 0, 0, 5)).toBe(5);
        });
    });

    describe('dot', () => {
        it('should calculate dot product', () => {
            expect(dot(1, 2, 3, 4)).toBe(11);
        });

        it('should return 0 for perpendicular vectors', () => {
            expect(dot(1, 0, 0, 1)).toBe(0);
        });

        it('should return positive for acute angle', () => {
            expect(dot(2, 1, 3, 2)).toBe(8);
        });

        it('should return negative for obtuse angle', () => {
            expect(dot(-1, 1, 1, 1)).toBe(0);
        });
    });

    describe('cross', () => {
        it('should calculate cross product z-component', () => {
            expect(cross(1, 0, 0, 1)).toBe(1);
        });

        it('should return 0 for collinear vectors', () => {
            expect(cross(1, 1, 2, 2)).toBe(0);
        });

        it('should return negative for opposite orientation', () => {
            expect(cross(1, 1, -1, 2)).toBe(3);
        });
    });

    describe('angleBetween', () => {
        it('should return 90 degrees for right angle', () => {
            expect(angleBetween(0, 0, 1, 0, 1, 1)).toBeCloseTo(90, 5);
        });

        it('should return 180 degrees for collinear points forming a straight line', () => {
            expect(angleBetween(0, 0, 1, 0, 2, 0)).toBeCloseTo(180, 5);
        });

        it('should return 180 degrees for straight line', () => {
            expect(angleBetween(-1, 0, 0, 0, 1, 0)).toBeCloseTo(180, 5);
        });

        it('should return NaN for degenerate points', () => {
            expect(angleBetween(0, 0, 0, 0, 1, 0)).toBeNaN();
        });

        it('should handle equilateral triangle angle', () => {
            const angle = angleBetween(0, 0, 1, 0, 0.5, Math.sqrt(3) / 2);
            expect(angle).toBeCloseTo(60, 5);
        });
    });

    describe('findNearbyPoint', () => {
        const points: AnyCanvasObject[] = [
            { id: 'p1', type: 'geopoint', x: 100, y: 100, width: 20, height: 20 } as AnyCanvasObject,
            { id: 'p2', type: 'geopoint', x: 200, y: 200, width: 20, height: 20 } as AnyCanvasObject,
            { id: 'line', type: 'line', x: 0, y: 0, width: 50, height: 50, data: { x2: 50, y2: 50 } } as unknown as AnyCanvasObject,
        ];

        it('should find point within radius', () => {
            const result = findNearbyPoint(points, 105, 105);
            expect(result?.id).toBe('p1');
        });

        it('should return null when no point within radius', () => {
            const result = findNearbyPoint(points, 0, 0);
            expect(result).toBeNull();
        });

        it('should ignore non-geopoint objects', () => {
            const result = findNearbyPoint(points, 25, 25);
            expect(result).toBeNull();
        });

        it('should use custom radius', () => {
            // p2's center is (210, 210). A search at (200, 200) is distance sqrt(200) = 14.14, which is < 20.
            const result = findNearbyPoint(points, 200, 200, 20);
            expect(result?.id).toBe('p2');
        });

        it('should find closest point when multiple in range', () => {
            const pointsWithClose = [
                { id: 'p1', type: 'geopoint', x: 100, y: 100, width: 20, height: 20 } as AnyCanvasObject,
                { id: 'p2', type: 'geopoint', x: 105, y: 105, width: 20, height: 20 } as AnyCanvasObject,
            ];
            const result = findNearbyPoint(pointsWithClose, 110, 110);
            expect(result?.id).toBe('p1');
        });

        it('should return null for empty array', () => {
            const result = findNearbyPoint([], 100, 100);
            expect(result).toBeNull();
        });
    });

    describe('SNAP_RADIUS', () => {
        it('should be 12', () => {
            expect(SNAP_RADIUS).toBe(12);
        });
    });
});
