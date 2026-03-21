import { describe, it, expect } from 'vitest';
import { screenToCanvas, canvasToScreen, applyDelta } from './transforms';
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

            // zoom=1, pan=0: canvasX = (screenX - left - panX) / zoom
            const result = screenToCanvas(500, 350, svgRect, 1600, 1200);

            expect(result.x).toBe(400); // (500 - 100 - 0) / 1
            expect(result.y).toBe(300); // (350 - 50  - 0) / 1
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

        it('should handle zoom=2 with no pan', () => {
            const svgRect: DOMRect = {
                left: 0,
                top: 0,
                width: 800,
                height: 600,
                right: 800,
                bottom: 600,
                x: 0,
                y: 0,
                toJSON: () => ({})
            };

            // zoom=2: canvasX = (screenX - 0 - 0) / 2
            const result = screenToCanvas(400, 300, svgRect, 2000, 2000, 2, 0, 0);

            expect(result.x).toBe(200); // 400 / 2
            expect(result.y).toBe(150); // 300 / 2
        });

        it('should handle zoom and pan together', () => {
            const svgRect: DOMRect = {
                left: 0,
                top: 0,
                width: 800,
                height: 600,
                right: 800,
                bottom: 600,
                x: 0,
                y: 0,
                toJSON: () => ({})
            };

            // zoom=2, pan=(100,50): canvasX = (screenX - 0 - 100) / 2
            const result = screenToCanvas(500, 350, svgRect, 2000, 2000, 2, 100, 50);

            expect(result.x).toBe(200); // (500 - 0 - 100) / 2
            expect(result.y).toBe(150); // (350 - 0 - 50)  / 2
        });

        it('should handle viewport with non-zero offset', () => {
            const svgRect: DOMRect = {
                left: 200,
                top: 100,
                width: 800,
                height: 600,
                right: 1000,
                bottom: 700,
                x: 200,
                y: 100,
                toJSON: () => ({})
            };

            // canvasX = (screenX - left - panX) / zoom = (700 - 200 - 0) / 1 = 500
            const result = screenToCanvas(700, 400, svgRect, 2000, 2000, 1, 0, 0);

            expect(result.x).toBe(500);
            expect(result.y).toBe(300);
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
                opacity: 1,
                visible: true,
                locked: false,
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
                opacity: 1,
                visible: true,
                locked: false,
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
                opacity: 1,
                visible: true,
                locked: false,
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
                type: 'circle',
                x: 100,
                y: 100,
                width: 60,
                height: 40,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
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

    describe('canvasToScreen', () => {
        it('should convert canvas coordinates to screen coordinates', () => {
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

            // zoom=1, pan=0: screenX = canvasX * zoom + panX + left
            const result = canvasToScreen(400, 300, svgRect, 1600, 1200);

            expect(result.x).toBe(500); // 400 * 1 + 0 + 100
            expect(result.y).toBe(350); // 300 * 1 + 0 + 50
        });

        it('should handle origin point', () => {
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

            const result = canvasToScreen(0, 0, svgRect, 800, 600);

            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });

        it('should handle zoom=2 with no pan', () => {
            const svgRect: DOMRect = {
                left: 0,
                top: 0,
                width: 800,
                height: 600,
                right: 800,
                bottom: 600,
                x: 0,
                y: 0,
                toJSON: () => ({})
            };

            // screenX = canvasX * zoom + panX + left = 200 * 2 + 0 + 0 = 400
            const result = canvasToScreen(200, 150, svgRect, 2000, 2000, 2, 0, 0);

            expect(result.x).toBe(400);
            expect(result.y).toBe(300);
        });

        it('should handle zoom and pan together', () => {
            const svgRect: DOMRect = {
                left: 0,
                top: 0,
                width: 800,
                height: 600,
                right: 800,
                bottom: 600,
                x: 0,
                y: 0,
                toJSON: () => ({})
            };

            // screenX = 200 * 2 + 100 + 0 = 500
            const result = canvasToScreen(200, 150, svgRect, 2000, 2000, 2, 100, 50);

            expect(result.x).toBe(500);
            expect(result.y).toBe(350);
        });
    });

    describe('coordinate round-trip invariance', () => {
        const createRect = (left: number, top: number, width: number, height: number): DOMRect => ({
            left, top, width, height,
            right: left + width,
            bottom: top + height,
            x: left, y: top,
            toJSON: () => ({})
        });

        it('should maintain round-trip accuracy at identity transform', () => {
            const rect = createRect(0, 0, 800, 600);

            for (let x = 0; x <= 800; x += 100) {
                for (let y = 0; y <= 600; y += 100) {
                    const screen = canvasToScreen(x, y, rect, 800, 600, 1, 0, 0);
                    const back = screenToCanvas(screen.x, screen.y, rect, 800, 600, 1, 0, 0);

                    expect(back.x).toBeCloseTo(x, 10);
                    expect(back.y).toBeCloseTo(y, 10);
                }
            }
        });

        it('should maintain round-trip accuracy with zoom', () => {
            const rect = createRect(0, 0, 800, 600);
            const zoom = 2;
            const panX = 100;
            const panY = 50;

            for (let x = 100; x <= 700; x += 100) {
                for (let y = 100; y <= 500; y += 100) {
                    const screen = canvasToScreen(x, y, rect, 800, 600, zoom, panX, panY);
                    const back = screenToCanvas(screen.x, screen.y, rect, 800, 600, zoom, panX, panY);

                    expect(back.x).toBeCloseTo(x, 5);
                    expect(back.y).toBeCloseTo(y, 5);
                }
            }
        });

        it('should maintain round-trip accuracy with various zoom levels', () => {
            const rect = createRect(50, 50, 400, 300);
            const zoomLevels = [0.1, 0.5, 1, 2, 5, 10];

            for (const zoom of zoomLevels) {
                const x = 400;
                const y = 300;
                const panX = 200;
                const panY = 150;

                const screen = canvasToScreen(x, y, rect, 800, 600, zoom, panX, panY);
                const back = screenToCanvas(screen.x, screen.y, rect, 800, 600, zoom, panX, panY);

                expect(back.x).toBeCloseTo(x, 3);
                expect(back.y).toBeCloseTo(y, 3);
            }
        });

        it('should maintain round-trip accuracy with large pan values', () => {
            const rect = createRect(0, 0, 800, 600);
            const panValues = [-1000, -500, 500, 1000];

            for (const panX of panValues) {
                for (const panY of panValues) {
                    const x = 400;
                    const y = 300;

                    const screen = canvasToScreen(x, y, rect, 800, 600, 1, panX, panY);
                    const back = screenToCanvas(screen.x, screen.y, rect, 800, 600, 1, panX, panY);

                    expect(back.x).toBeCloseTo(x, 3);
                    expect(back.y).toBeCloseTo(y, 3);
                }
            }
        });

        it('should handle extreme zoom values without precision explosion', () => {
            const rect = createRect(0, 0, 800, 600);

            // Test zoom = 0.1
            const screen1 = canvasToScreen(400, 300, rect, 800, 600, 0.1, 0, 0);
            const back1 = screenToCanvas(screen1.x, screen1.y, rect, 800, 600, 0.1, 0, 0);
            expect(back1.x).not.toBeNaN();
            expect(back1.y).not.toBeNaN();
            expect(back1.x).not.toBe(Infinity);
            expect(back1.y).not.toBe(Infinity);

            // Test zoom = 10
            const screen2 = canvasToScreen(400, 300, rect, 800, 600, 10, 0, 0);
            const back2 = screenToCanvas(screen2.x, screen2.y, rect, 800, 600, 10, 0, 0);
            expect(back2.x).not.toBeNaN();
            expect(back2.y).not.toBeNaN();
            expect(back2.x).not.toBe(Infinity);
            expect(back2.y).not.toBe(Infinity);
        });
    });

    describe('screenToCanvas with various transforms', () => {
        const createRect = (left: number, top: number, width: number, height: number): DOMRect => ({
            left, top, width, height,
            right: left + width,
            bottom: top + height,
            x: left, y: top,
            toJSON: () => ({})
        });

        it('should handle negative pan values', () => {
            const rect = createRect(0, 0, 800, 600);
            const result = screenToCanvas(100, 100, rect, 800, 600, 1, -100, -100);
            expect(result.x).not.toBeNaN();
            expect(result.y).not.toBeNaN();
        });

        it('should handle zero viewport dimensions gracefully', () => {
            const rect = createRect(0, 0, 0, 0);
            const result = screenToCanvas(0, 0, rect, 800, 600);
            // With the correct formula (screenX - left - panX) / zoom,
            // zero viewport size doesn't cause division by zero — result is (0, 0).
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });

        it('should handle fractional zoom values', () => {
            const rect = createRect(0, 0, 800, 600);
            const result = screenToCanvas(400, 300, rect, 800, 600, 0.25, 0, 0);
            expect(result.x).not.toBeNaN();
            expect(result.y).not.toBeNaN();
        });

        it('should handle very small positive coordinates', () => {
            const rect = createRect(0, 0, 800, 600);
            const result = screenToCanvas(0.001, 0.001, rect, 800, 600, 1, 0, 0);
            expect(result.x).toBeCloseTo(0.001, 3);
            expect(result.y).toBeCloseTo(0.001, 3);
        });

        it('should handle coordinates outside viewport', () => {
            const rect = createRect(0, 0, 800, 600);
            const result = screenToCanvas(-100, -100, rect, 800, 600, 1, 0, 0);
            expect(result.x).toBeLessThan(0);
            expect(result.y).toBeLessThan(0);
        });
    });

    describe('canvasToScreen with various transforms', () => {
        const createRect = (left: number, top: number, width: number, height: number): DOMRect => ({
            left, top, width, height,
            right: left + width,
            bottom: top + height,
            x: left, y: top,
            toJSON: () => ({})
        });

        it('should handle negative pan values', () => {
            const rect = createRect(0, 0, 800, 600);
            const result = canvasToScreen(100, 100, rect, 800, 600, 1, -100, -100);
            expect(result.x).not.toBeNaN();
            expect(result.y).not.toBeNaN();
        });

        it('should handle fractional zoom values', () => {
            const rect = createRect(0, 0, 800, 600);
            // screenX = canvasX * zoom + panX + left = 400 * 0.25 + 0 + 0 = 100
            const result = canvasToScreen(400, 300, rect, 800, 600, 0.25, 0, 0);
            expect(result.x).toBeCloseTo(100, 1);
            expect(result.y).toBeCloseTo(75, 1);
        });

        it('should handle coordinates outside canvas', () => {
            const rect = createRect(0, 0, 800, 600);
            const result = canvasToScreen(-100, -100, rect, 800, 600, 1, 0, 0);
            expect(result.x).toBeLessThan(0);
            expect(result.y).toBeLessThan(0);
        });
    });
});
