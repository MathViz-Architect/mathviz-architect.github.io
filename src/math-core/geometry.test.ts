import { describe, it, expect } from 'vitest';
import {
    pointToSegmentDistance,
    isPointInObject,
    getBoundingBox,
    objectsIntersectRect,
    calculateDistance,
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
