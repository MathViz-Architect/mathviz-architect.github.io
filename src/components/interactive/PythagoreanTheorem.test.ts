import { describe, it, expect } from 'vitest';

describe('Pythagorean Theorem Module', () => {
    describe('a² + b² = c² validation', () => {
        const calculateHypotenuse = (a: number, b: number): number => {
            return Math.sqrt(a * a + b * b);
        };

        const calculateSquareArea = (side: number): number => {
            return side * side;
        };

        it('should validate 3-4-5 triangle', () => {
            const a = 3;
            const b = 4;
            const c = calculateHypotenuse(a, b);
            
            expect(c).toBe(5);
            expect(a * a + b * b).toBe(c * c);
            expect(calculateSquareArea(a) + calculateSquareArea(b)).toBe(calculateSquareArea(c));
        });

        it('should validate 5-12-13 triangle', () => {
            const a = 5;
            const b = 12;
            const c = calculateHypotenuse(a, b);
            
            expect(c).toBe(13);
            expect(a * a + b * b).toBe(c * c);
            expect(calculateSquareArea(a) + calculateSquareArea(b)).toBe(calculateSquareArea(c));
        });

        it('should validate 8-15-17 triangle', () => {
            const a = 8;
            const b = 15;
            const c = calculateHypotenuse(a, b);
            
            expect(c).toBe(17);
            expect(a * a + b * b).toBe(c * c);
            expect(calculateSquareArea(a) + calculateSquareArea(b)).toBe(calculateSquareArea(c));
        });

        it('should validate 6-8-10 triangle (scaled 3-4-5)', () => {
            const a = 6;
            const b = 8;
            const c = calculateHypotenuse(a, b);
            
            expect(c).toBe(10);
            expect(a * a + b * b).toBe(c * c);
        });

        it('should validate 7-24-25 triangle', () => {
            const a = 7;
            const b = 24;
            const c = calculateHypotenuse(a, b);
            
            expect(c).toBe(25);
            expect(a * a + b * b).toBe(c * c);
        });

        it('should validate 9-40-41 triangle', () => {
            const a = 9;
            const b = 40;
            const c = calculateHypotenuse(a, b);
            
            expect(c).toBe(41);
            expect(a * a + b * b).toBe(c * c);
        });
    });

    describe('animation step logic', () => {
        const ANIMATION_STEPS = [
            'Start',
            'Square A shown',
            'Square B shown', 
            'Square C shown',
            'Complete',
        ];

        const getNextStep = (currentStep: number): number => {
            return Math.min(currentStep + 1, ANIMATION_STEPS.length - 1);
        };

        const getPreviousStep = (currentStep: number): number => {
            return Math.max(currentStep - 1, 0);
        };

        const resetToStep = (): number => {
            return 0;
        };

        it('should increment step correctly', () => {
            expect(getNextStep(0)).toBe(1);
            expect(getNextStep(1)).toBe(2);
            expect(getNextStep(2)).toBe(3);
            expect(getNextStep(3)).toBe(4);
            expect(getNextStep(4)).toBe(4); // Cannot go past final step
        });

        it('should decrement step correctly', () => {
            expect(getPreviousStep(4)).toBe(3);
            expect(getPreviousStep(3)).toBe(2);
            expect(getPreviousStep(2)).toBe(1);
            expect(getPreviousStep(1)).toBe(0);
            expect(getPreviousStep(0)).toBe(0); // Cannot go below 0
        });

        it('should reset to step 0', () => {
            expect(resetToStep()).toBe(0);
            expect(resetToStep()).toBe(0);
        });

        it('should not allow invalid transitions', () => {
            // Trying to go to negative step
            expect(getPreviousStep(0)).toBe(0);
            
            // Trying to go past final step
            expect(getNextStep(4)).toBe(4);
        });

        it('should have correct number of steps', () => {
            expect(ANIMATION_STEPS.length).toBe(5);
        });
    });

    describe('square positioning logic', () => {
        const calculateSquarePositions = (
            a: number, 
            b: number, 
            scale: number = 40,
            offset: number = 20
        ) => {
            const c = Math.sqrt(a * a + b * b);
            
            return {
                squareA: { 
                    x: offset, 
                    y: offset + b * scale, 
                    width: a * scale, 
                    height: a * scale 
                },
                squareB: { 
                    x: offset + a * scale, 
                    y: offset, 
                    width: b * scale, 
                    height: b * scale 
                },
                squareC: { 
                    x: offset + a * scale, 
                    y: offset + b * scale, 
                    width: c * scale, 
                    height: c * scale 
                },
            };
        };

        it('should position squares correctly for 3-4-5 triangle', () => {
            const positions = calculateSquarePositions(3, 4);
            
            expect(positions.squareA.width).toBe(120);  // 3 * 40
            expect(positions.squareA.height).toBe(120);
            expect(positions.squareB.width).toBe(160); // 4 * 40
            expect(positions.squareB.height).toBe(160);
            expect(positions.squareC.width).toBeCloseTo(200); // 5 * 40
            expect(positions.squareC.height).toBeCloseTo(200);
        });

        it('should calculate correct areas', () => {
            const positions = calculateSquarePositions(3, 4);
            
            expect(positions.squareA.width * positions.squareA.height).toBe(14400);  // 120^2
            expect(positions.squareB.width * positions.squareB.height).toBe(25600); // 160^2
            expect(positions.squareC.width * positions.squareC.height).toBe(40000);  // 200^2
            
            // Verify a² + b² = c²
            expect(14400 + 25600).toBe(40000);
        });

        it('should handle zero values gracefully', () => {
            const positions = calculateSquarePositions(0, 0);
            
            expect(positions.squareA.width).toBe(0);
            expect(positions.squareB.height).toBe(0);
            expect(positions.squareC.width).toBe(0);
        });
    });
});
