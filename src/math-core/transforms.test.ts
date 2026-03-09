import { describe, it, expect } from 'vitest';
import { screenToCanvas, applyDelta } from './transforms';
import type { AnyCanvasObject } from '@/lib/types';

describe('transforms', () => {
    describe('screenToCanvas', () => {
        it('should convert screen coordinates to canvas coordinates', () => {
            const svgRect: DOMRect = {
                left: 100,
                top: 50,
                width: 800,
                height: 600,
                right: 900,
                bottom: 650,
                x: 100,
                y: 50,
                toJSON: () => ({})
            };

            const result = screenToCanvas(500, 350, svgRect, 1600, 1200);

            expect(result.x).toBe(800); // (500 - 100) * (1600 / 800)
            expect(result.y).toBe(600); // (350 - 50) * (1200 / 600)
        });

        it('should handle top-left corner', () => {
            const svgRect: DOMRect = {
                left: 0,
                top: 0,
                width: 400,
                height: 300,
                right: 400,
                bottom: 300,
                x: 0,
                y: 0,
                toJSON: () => ({})
            };

            const result = screenToCanvas(0, 0, svgRect, 800, 600);

            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });

        it('should handle scaling when SVG is smaller than canvas', () => {
            const svgRect: DOMRect = {
                left: 0,
                top: 0,
                width: 200,
                height: 150,
                right: 200,
                bottom: 150,
                x: 0,
                y: 0,
                toJSON: () => ({})
            };

            const result = screenToCanvas(100, 75, svgRect, 800, 600);

            expect(result.x).toBe(400); // 100 * (800 / 200)
            expect(result.y).toBe(300); // 75 * (600 / 150)
        });
    });

    describe('applyDelta', () => {
        it('should apply delta to line object with data coordinates', () => {
            const lineObj: AnyCanvasObject = {
                id: 'line1',
                type: 'line',
                x: 100,
                y: 100,
                width: 0,
                height: 0,
                rotation: 0,
                data: {
                    x1: 100,
                    y1: 100,
                    x2: 200,
                    y2: 200,
                    color: '#000000',
                    strokeWidth: 2
                }
            };

            const result = applyDelta(lineObj, 50, 30);

            expect(result.x).toBe(150);
            expect(result.y).toBe(130);
            expect(result.data).toEqual({
                x1: 150,
                y1: 130,
                x2: 250,
                y2: 230,
                color: '#000000',
                strokeWidth: 2
            });
        });

        it('should apply delta to rectangle object', () => {
            const rectObj: AnyCanvasObject = {
                id: 'rect1',
                type: 'rectangle',
                x: 50,
                y: 50,
                width: 100,
                height: 80,
                rotation: 0,
                data: {
                    fill: '#FF0000',
                    stroke: '#000000',
                    strokeWidth: 1
                }
            };

            const result = applyDelta(rectObj, 25, -10);

            expect(result.x).toBe(75);
            expect(result.y).toBe(40);
            expect(result.data).toBeUndefined(); // Non-line objects don't modify data
        });

        it('should apply negative delta', () => {
            const obj: AnyCanvasObject = {
                id: 'obj1',
                type: 'circle',
                x: 200,
                y: 150,
                width: 50,
                height: 50,
                rotation: 0,
                data: {
                    fill: '#0000FF',
                    stroke: '#000000',
                    strokeWidth: 1
                }
            };

            const result = applyDelta(obj, -50, -75);

            expect(result.x).toBe(150);
            expect(result.y).toBe(75);
        });

        it('should handle zero delta', () => {
            const obj: AnyCanvasObject = {
                id: 'obj1',
                type: 'ellipse',
                x: 100,
                y: 100,
                width: 60,
                height: 40,
                rotation: 0,
                data: {
                    fill: '#00FF00',
                    stroke: '#000000',
                    strokeWidth: 1
                }
            };

            const result = applyDelta(obj, 0, 0);

            expect(result.x).toBe(100);
            expect(result.y).toBe(100);
        });
    });
});
