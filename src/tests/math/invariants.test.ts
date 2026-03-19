
import { describe, it, expect } from 'vitest';
import { calculateDistance } from '../../math-core/geometry';

// Seeded pseudo-random number generator for deterministic tests
const seed = 42;
let m_w = 123456789 + seed;
let m_z = 987654321 - seed;
const mask = 0xffffffff;

const random = () => {
  m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
  m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
  let result = ((m_z << 16) + m_w) & mask;
  result /= 4294967296;
  return result + 0.5;
}

const randomCoordinate = (max = 1000) => (random() - 0.5) * 2 * max;

describe('Math Invariants', () => {
  it('should maintain distance symmetry: distance(A, B) === distance(B, A)', () => {
    for (let i = 0; i < 50; i++) {
      const p1 = { x: randomCoordinate(), y: randomCoordinate() };
      const p2 = { x: randomCoordinate(), y: randomCoordinate() };

      const dist1 = calculateDistance(p1.x, p1.y, p2.x, p2.y);
      const dist2 = calculateDistance(p2.x, p2.y, p1.x, p1.y);

      expect(dist1).toBeCloseTo(dist2);
    }
  });

  it('should satisfy the triangle inequality: a + b >= c', () => {
    for (let i = 0; i < 50; i++) {
      const p1 = { x: randomCoordinate(), y: randomCoordinate() };
      const p2 = { x: randomCoordinate(), y: randomCoordinate() };
      const p3 = { x: randomCoordinate(), y: randomCoordinate() };

      const a = calculateDistance(p1.x, p1.y, p2.x, p2.y);
      const b = calculateDistance(p2.x, p2.y, p3.x, p3.y);
      const c = calculateDistance(p1.x, p1.y, p3.x, p3.y);

      expect(a + b).toBeGreaterThanOrEqual(c);
      expect(a + c).toBeGreaterThanOrEqual(b);
      expect(b + c).toBeGreaterThanOrEqual(a);
    }
  });

  it('should be correct for Pythagorean theorem: a^2 + b^2 = c^2 for right triangles', () => {
    for (let i = 0; i < 50; i++) {
      const p1 = { x: randomCoordinate(), y: randomCoordinate() };
      const p2 = { x: randomCoordinate(), y: p1.y }; // Same y for horizontal leg
      const p3 = { x: p1.x, y: randomCoordinate() }; // Same x for vertical leg

      const a = calculateDistance(p1.x, p1.y, p3.x, p3.y); // Vertical leg
      const b = calculateDistance(p1.x, p1.y, p2.x, p2.y); // Horizontal leg
      const c = calculateDistance(p2.x, p2.y, p3.x, p3.y); // Hypotenuse

      expect(a * a + b * b).toBeCloseTo(c * c, 3);
    }
  });
});
