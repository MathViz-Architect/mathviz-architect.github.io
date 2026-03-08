import { AnyCanvasObject } from '@/lib/types';

/**
 * Calculate distance from a point to a line segment
 */
export const pointToSegmentDistance = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
        return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    }

    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
};

/**
 * Point-in-polygon test using ray casting algorithm
 */
const pointInPolygon = (x: number, y: number, points: { x: number; y: number }[]): boolean => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x;
        const yi = points[i].y;
        const xj = points[j].x;
        const yj = points[j].y;

        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

/**
 * Check if a point is inside an object (with tolerance for lines/arrows)
 */
export const isPointInObject = (x: number, y: number, obj: AnyCanvasObject): boolean => {
    if (obj.type === 'line') {
        const data = obj.data as { x1: number; y1: number; x2: number; y2: number };
        const distance = pointToSegmentDistance(x, y, data.x1, data.y1, data.x2, data.y2);
        return distance < 10;
    }

    if (obj.type === 'arrow') {
        const x1 = obj.x;
        const y1 = obj.y;
        const x2 = obj.x + obj.width;
        const y2 = obj.y + obj.height;
        const distance = pointToSegmentDistance(x, y, x1, y1, x2, y2);
        return distance < 10;
    }

    if (obj.type === 'polygon') {
        const data = obj.data as { points: { x: number; y: number }[] };
        // Convert normalized points to absolute coordinates
        const absolutePoints = data.points.map(p => ({
            x: obj.x + p.x * obj.width,
            y: obj.y + p.y * obj.height,
        }));
        return pointInPolygon(x, y, absolutePoints);
    }

    // For all other objects, use bounding box
    return x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height;
};

/**
 * Get bounding box for any object type
 */
export const getBoundingBox = (
    obj: AnyCanvasObject
): { minX: number; minY: number; maxX: number; maxY: number } => {
    if (obj.type === 'line') {
        const d = obj.data as { x1: number; y1: number; x2: number; y2: number; strokeWidth?: number };
        const tolerance = (d.strokeWidth || 2) + 3;
        return {
            minX: Math.min(d.x1, d.x2) - tolerance,
            maxX: Math.max(d.x1, d.x2) + tolerance,
            minY: Math.min(d.y1, d.y2) - tolerance,
            maxY: Math.max(d.y1, d.y2) + tolerance,
        };
    }

    if (obj.type === 'arrow') {
        const d = obj.data as { strokeWidth?: number };
        const tolerance = (d.strokeWidth || 2) + 3;
        return {
            minX: Math.min(obj.x, obj.x + obj.width) - tolerance,
            maxX: Math.max(obj.x, obj.x + obj.width) + tolerance,
            minY: Math.min(obj.y, obj.y + obj.height) - tolerance,
            maxY: Math.max(obj.y, obj.y + obj.height) + tolerance,
        };
    }

    // Standard objects (including polygon - use bounding box)
    return {
        minX: obj.x,
        maxX: obj.x + obj.width,
        minY: obj.y,
        maxY: obj.y + obj.height,
    };
};

/**
 * Check if an object intersects with a rectangle (for marquee selection)
 */
export const objectsIntersectRect = (
    obj: AnyCanvasObject,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
): boolean => {
    const bbox = getBoundingBox(obj);
    // AABB intersection test
    return bbox.minX < maxX && bbox.maxX > minX && bbox.minY < maxY && bbox.maxY > minY;
};

/**
 * Calculate arrow head angle from two points
 */
export const calculateArrowAngle = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.atan2(y2 - y1, x2 - x1);
};

/**
 * Calculate arrow head points
 */
export const calculateArrowHeadPoints = (
    x: number,
    y: number,
    angle: number,
    headLength: number,
    direction: 'forward' | 'backward'
): { point1X: number; point1Y: number; point2X: number; point2Y: number } => {
    const sign = direction === 'forward' ? -1 : 1;
    return {
        point1X: x + sign * headLength * Math.cos(angle - Math.PI / 6),
        point1Y: y + sign * headLength * Math.sin(angle - Math.PI / 6),
        point2X: x + sign * headLength * Math.cos(angle + Math.PI / 6),
        point2Y: y + sign * headLength * Math.sin(angle + Math.PI / 6),
    };
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
};
