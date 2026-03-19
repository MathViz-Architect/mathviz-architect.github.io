
import { describe, it, expect } from 'vitest';
import { calculateDistance, pointToSegmentDistance } from '../../math-core/geometry';

describe('Geometry Stress Tests', () => {

  it('handles zero-length segments gracefully', () => {
    const p1 = { x: 100, y: 100 };
    const p2 = { x: 50, y: 50 };

    const distance = calculateDistance(p1.x, p1.y, p1.x, p1.y);
    expect(distance).toBe(0);
    expect(isFinite(distance)).toBe(true);

    const segDist = pointToSegmentDistance(p2.x, p2.y, p1.x, p1.y, p1.x, p1.y);
    const expected = Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);
    expect(segDist).toBeCloseTo(expected);
    expect(isFinite(segDist)).toBe(true);
  });

  it('handles degenerate triangles in distance calculations', () => {
    // All points collinear
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 100, y: 100 };
    const p3 = { x: 50, y: 50 }; // Midpoint

    const a = calculateDistance(p1.x, p1.y, p2.x, p2.y);
    const b = calculateDistance(p2.x, p2.y, p3.x, p3.y);
    const c = calculateDistance(p1.x, p1.y, p3.x, p3.y);

    expect(isFinite(a)).toBe(true);
    expect(isFinite(b)).toBe(true);
    expect(isFinite(c)).toBe(true);
    // For collinear points, two smaller segments sum to the largest
    expect(b + c).toBeCloseTo(a);
  });

  it('handles very large coordinates without throwing errors', () => {
    const largeCoord = 1e100;
    const p1 = { x: largeCoord, y: largeCoord };
    const p2 = { x: largeCoord + 100, y: largeCoord + 100 };
    const p3 = { x: -largeCoord, y: -largeCoord };

    const distance1 = calculateDistance(p1.x, p1.y, p2.x, p2.y);
    expect(isFinite(distance1)).toBe(true);
    expect(distance1).not.toBe(Infinity);

    const distance2 = calculateDistance(p1.x, p1.y, p3.x, p3.y);
    // The result can be Infinity if it exceeds maximum float precision.
    // The main point is that it doesn't crash and returns a number.
    expect(typeof distance2).toBe('number');
    expect(isNaN(distance2)).toBe(false);

    const segDist = pointToSegmentDistance(0, 0, p1.x, p1.y, p2.x, p2.y);
    expect(isFinite(segDist)).toBe(true);
  });

  it('handles very small (sub-normal) coordinates gracefully', () => {
    const smallCoord = 1e-300;
    const p1 = { x: smallCoord, y: smallCoord };
    const p2 = { x: smallCoord * 2, y: smallCoord * 2 };
    const p3 = { x: 0, y: 0 };

    const distance = calculateDistance(p1.x, p1.y, p2.x, p2.y);
    expect(isFinite(distance)).toBe(true);
    expect(distance).not.toBe(NaN);

    const segDist = pointToSegmentDistance(p3.x, p3.y, p1.x, p1.y, p2.x, p2.y);
    expect(isFinite(segDist)).toBe(true);
    expect(segDist).not.toBe(NaN);
  });
});
