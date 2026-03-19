
import { describe, it, expect } from 'vitest';
import { screenToCanvas, canvasToScreen } from '../../math-core/transforms';

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
  return result;
}

const randomInRange = (min, max) => random() * (max - min) + min;

const randomPoint = (max = 1000) => ({
  x: randomInRange(-max, max),
  y: randomInRange(-max, max),
});

describe('Transform Properties', () => {
  it('screenToCanvas(canvasToScreen(p)) should be approximately equal to p', () => {
    const viewportRect = {
      left: 0,
      top: 0,
      width: 1920,
      height: 1080,
      right: 1920,
      bottom: 1080,
      x: 0,
      y: 0,
      toJSON: () => ""
    };
    const canvasWidth = 1920;
    const canvasHeight = 1080;

    for (let i = 0; i < 100; i++) {
      const pan = {
        x: randomInRange(-1000, 1000),
        y: randomInRange(-1000, 1000),
      };
      const zoom = randomInRange(0.1, 10);
      const point = randomPoint(10000);

      const screenPoint = canvasToScreen(
        point.x,
        point.y,
        viewportRect,
        canvasWidth,
        canvasHeight,
        zoom,
        pan.x,
        pan.y
      );

      const finalPoint = screenToCanvas(
        screenPoint.x,
        screenPoint.y,
        viewportRect,
        canvasWidth,
        canvasHeight,
        zoom,
        pan.x,
        pan.y
      );

      expect(finalPoint.x).toBeCloseTo(point.x, 3);
      expect(finalPoint.y).toBeCloseTo(point.y, 3);
    }
  });
});
