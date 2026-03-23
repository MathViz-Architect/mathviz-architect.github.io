/**
 * Tests for Pythagorean theorem sqrt answer validation and solution steps.
 * Covers the two bugs described in the task:
 *   Bug 1: sqrt(89) not accepted as correct answer
 *   Bug 2: solution steps show raw expressions instead of computed values
 */

import { describe, it, expect } from 'vitest';
import { generateProblem } from './variantGenerator';
import { validateAnswer } from './answerValidator';
import { grade8PythagoreanTheoremTemplates } from '../templates/grade8/pythagoreanTheorem';

const hypotTemplate = grade8PythagoreanTheoremTemplates.find(t => t.id === 'grade8-pythag-hypotenuse')!;

// ─── Bug 1: sqrt(N) accepted as correct answer ───────────────────────────────

describe('Bug 1 — sqrt(N) accepted as correct answer', () => {
    it('validateAnswer accepts sqrt(89) when answer = "sqrt(89)" (string)', () => {
        const problem = {
            id: 'test',
            template_id: 'grade8-pythag-hypotenuse',
            seed: 0,
            params: {},
            question: 'test',
            answer: 'sqrt(89)',
            answer_type: 'expression' as const,
        };
        expect(validateAnswer(problem, 'sqrt(89)', 'expression')).toBe(true);
    });

    it('validateAnswer accepts sqrt(89) when answer = Math.sqrt(89) (number)', () => {
        const problem = {
            id: 'test',
            template_id: 'grade8-pythag-hypotenuse',
            seed: 0,
            params: {},
            question: 'test',
            answer: Math.sqrt(89),
            answer_type: 'expression' as const,
        };
        expect(validateAnswer(problem, 'sqrt(89)', 'expression')).toBe(true);
    });

    it('validateAnswer rejects 9.434 (approximate decimal) when answer = "sqrt(89)"', () => {
        const problem = {
            id: 'test',
            template_id: 'grade8-pythag-hypotenuse',
            seed: 0,
            params: {},
            question: 'test',
            answer: 'sqrt(89)',
            answer_type: 'expression' as const,
        };
        // 9.434 differs from sqrt(89) ≈ 9.43398... by more than 1e-9
        expect(validateAnswer(problem, '9.434', 'expression')).toBe(false);
    });

    it('generateProblem for grade8-pythag-hypotenuse d2 returns answer as "sqrt(N)" string', () => {
        // Use a seed that produces non-perfect-square sum (a=5, b=8 → 89)
        // We iterate seeds to find one that gives irrational answer
        let found = false;
        for (let seed = 1; seed <= 200; seed++) {
            const p = generateProblem(hypotTemplate, 2, seed);
            if (typeof p.answer === 'string' && p.answer.startsWith('sqrt(')) {
                found = true;
                // Verify it's a valid sqrt(N) format
                expect(p.answer).toMatch(/^sqrt\(\d+\)$/);
                break;
            }
        }
        expect(found).toBe(true);
    });

    it('generateProblem answer "sqrt(89)" is accepted by validateAnswer', () => {
        // Find a problem with a=5, b=8 (or equivalent giving sqrt(89))
        for (let seed = 1; seed <= 500; seed++) {
            const p = generateProblem(hypotTemplate, 2, seed);
            if (p.answer === 'sqrt(89)') {
                expect(validateAnswer(p, 'sqrt(89)', 'expression')).toBe(true);
                expect(validateAnswer(p, 'sqrt(90)', 'expression')).toBe(false);
                return;
            }
        }
        // If sqrt(89) not found, just verify any sqrt(N) answer works
        for (let seed = 1; seed <= 200; seed++) {
            const p = generateProblem(hypotTemplate, 2, seed);
            if (typeof p.answer === 'string' && p.answer.startsWith('sqrt(')) {
                expect(validateAnswer(p, p.answer as string, 'expression')).toBe(true);
                return;
            }
        }
    });
});

// ─── Bug 2: solution steps show computed values ───────────────────────────────

describe('Bug 2 — solution steps show computed values, not raw expressions', () => {
    it('solution step result contains "sqrt(N)", not "Math.sqrt(...)" or a decimal', () => {
        for (let seed = 1; seed <= 200; seed++) {
            const p = generateProblem(hypotTemplate, 2, seed);
            if (typeof p.answer === 'string' && p.answer.startsWith('sqrt(')) {
                const resultStep = p.solution?.find(s => s.result);
                expect(resultStep).toBeDefined();
                expect(resultStep!.result).not.toContain('Math.sqrt');
                expect(resultStep!.result).toMatch(/^sqrt\(\d+\)$/);
                return;
            }
        }
    });

    it('solution step explanation for step 2 contains both addends (e.g. "25 + 64 = 89")', () => {
        // Find problem with a=5, b=8
        for (let seed = 1; seed <= 500; seed++) {
            const p = generateProblem(hypotTemplate, 2, seed);
            const a = p.params['a'] as number;
            const b = p.params['b'] as number;
            if (a === 5 && b === 8) {
                // Step 1: c² = 5² + 8² = 25 + 64 = 89
                const step1 = p.solution?.[0];
                expect(step1?.explanation).toContain('25');
                expect(step1?.explanation).toContain('64');
                expect(step1?.explanation).toContain('89');
                return;
            }
        }
        // Fallback: check any problem has numeric values in step 1
        const p = generateProblem(hypotTemplate, 2, 42);
        const a = p.params['a'] as number;
        const b = p.params['b'] as number;
        const step1 = p.solution?.[0];
        expect(step1?.explanation).toContain(String(a * a + b * b));
    });

    it('solution step result does not contain raw "Math.sqrt" for any seed', () => {
        for (let seed = 1; seed <= 50; seed++) {
            const p = generateProblem(hypotTemplate, 2, seed);
            const resultStep = p.solution?.find(s => s.result);
            if (resultStep) {
                expect(resultStep.result).not.toContain('Math.sqrt');
            }
        }
    });
});
