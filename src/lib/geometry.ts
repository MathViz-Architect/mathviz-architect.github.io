// geometry.ts — утилиты для интерактивной геометрии

import { AnyCanvasObject } from '@/lib/types';

export const SNAP_RADIUS = 12;

/** Евклидово расстояние */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/** Скалярное произведение векторов (ax,ay)·(bx,by) */
export function dot(ax: number, ay: number, bx: number, by: number): number {
  return ax * bx + ay * by;
}

/** Векторное произведение (z-компонента) (ax,ay)×(bx,by) */
export function cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

/**
 * Угол ∠ABC (вершина B) в градусах.
 * Возвращает NaN, если точки вырождены.
 */
export function angleBetween(
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number,
): number {
  const baX = ax - bx; const baY = ay - by;
  const bcX = cx - bx; const bcY = cy - by;
  const lenBA = Math.hypot(baX, baY);
  const lenBC = Math.hypot(bcX, bcY);
  if (lenBA < 1e-6 || lenBC < 1e-6) return NaN;
  const cosA = Math.max(-1, Math.min(1, dot(baX, baY, bcX, bcY) / (lenBA * lenBC)));
  return Math.acos(cosA) * 180 / Math.PI;
}

/**
 * Находит существующую GeoPoint в пределах radius от (x,y).
 * Возвращает найденный объект или null.
 */
export function findNearbyPoint(
  objects: AnyCanvasObject[],
  x: number,
  y: number,
  radius = SNAP_RADIUS,
): AnyCanvasObject | null {
  let best: AnyCanvasObject | null = null;
  let bestDist = radius;
  for (const o of objects) {
    if (o.type !== 'geopoint') continue;
    const cx = o.x + o.width / 2;
    const cy = o.y + o.height / 2;
    const d = distance(cx, cy, x, y);
    if (d <= bestDist) {
      bestDist = d;
      best = o;
    }
  }
  return best;
}
