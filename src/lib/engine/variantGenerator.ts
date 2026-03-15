/**
 * Problem variant generator
 * Handles parameter generation, constraint checking, and template substitution
 */

import { ProblemTemplate, GeneratedProblem, SolutionStep, DifficultyConfig } from '../types';
import { evaluateFormula } from './expressionParser';

/**
 * Seeded pseudo-random number generator (mulberry32)
 * Returns a function that generates deterministic floats in [0, 1)
 */
function createSeededRng(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
        s += 0x6d2b79f5;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Helper to generate random integer in range [min, max] using provided rng
const seededInt = (rng: () => number, min: number, max: number): number =>
    Math.floor(rng() * (max - min + 1)) + min;


/**
 * Generate parameter values for a difficulty config
 */
function generateParamsForConfig(config: DifficultyConfig, rng: () => number): Record<string, number | string> {
    const params: Record<string, number | string> = {};

    // Pass 1: generate int/choice params
    for (const [key, def] of Object.entries(config.parameters)) {
        if (def.type === 'int') {
            params[key] = seededInt(rng, def.min, def.max);
        } else if (def.type === 'choice') {
            params[key] = def.values[seededInt(rng, 0, def.values.length - 1)];
        }
    }
    // Pass 2: evaluate expressions (all int/choice values are now available)
    for (const [key, def] of Object.entries(config.parameters)) {
        if (def.type === 'expression') {
            params[key] = evaluateFormula(def.value, params);
        }
    }

    // Check constraints and regenerate if needed
    if (config.constraints && config.constraints.length > 0) {
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            let allConstraintsMet = true;

            for (const constraint of config.constraints) {
                try {
                    const result = evaluateFormula(constraint, params);
                    if (!result) {
                        allConstraintsMet = false;
                        break;
                    }
                } catch (e) {
                    allConstraintsMet = false;
                    break;
                }
            }

            if (allConstraintsMet) {
                break;
            }

            // Regenerate params (two-pass: int/choice first, then expressions)
            for (const [key, def] of Object.entries(config.parameters)) {
                if (def.type === 'int') {
                    params[key] = seededInt(rng, def.min, def.max);
                } else if (def.type === 'choice') {
                    params[key] = def.values[seededInt(rng, 0, def.values.length - 1)];
                }
            }
            for (const [key, def] of Object.entries(config.parameters)) {
                if (def.type === 'expression') {
                    params[key] = evaluateFormula(def.value, params);
                }
            }

            attempts++;
        }
    }

    return params;
}

/**
 * Get difficulty config with fallback
 */
function getDifficultyConfig(template: ProblemTemplate, difficulty: 1 | 2 | 3 | 4): DifficultyConfig {
    // Try exact match
    if (template.difficulties[difficulty]) {
        return template.difficulties[difficulty]!;
    }

    // Fallback down
    for (let d = difficulty - 1; d >= 1; d--) {
        if (template.difficulties[d as 1 | 2 | 3]) {
            return template.difficulties[d as 1 | 2 | 3]!;
        }
    }

    // Fallback up
    for (let d = difficulty + 1; d <= 4; d++) {
        if (template.difficulties[d as 2 | 3 | 4]) {
            return template.difficulties[d as 2 | 3 | 4]!;
        }
    }

    throw new Error(`Template ${template.id}: no difficulty configs available`);
}

/**
 * Generate a problem from a template
 * @param seed — optional seed for reproducibility; if omitted, a random seed is generated
 */
export function generateProblem(template: ProblemTemplate, difficulty: 1 | 2 | 3 | 4 = 1, seed?: number): GeneratedProblem {
    const resolvedSeed = seed ?? (Date.now() ^ Math.floor(Math.random() * 0xffffffff));
    const rng = createSeededRng(resolvedSeed);
    const config = getDifficultyConfig(template, difficulty);

    // Validate required fields
    if (!config.template || typeof config.template !== 'string') {
        throw new Error(`Template ${template.id}: 'template' field is missing or not a string`);
    }
    if (!config.answer_formula || typeof config.answer_formula !== 'string') {
        throw new Error(`Template ${template.id}: 'answer_formula' field is missing or not a string`);
    }

    const params = generateParamsForConfig(config, rng);

    // Substitute parameters in template string
    let question = config.template;
    for (const [key, value] of Object.entries(params)) {
        question = question.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }

    // Calculate answer
    const answer = evaluateFormula(config.answer_formula, params);

    // Generate hint if config has one
    let hint: string | undefined;
    if (config.hint) {
        if (typeof config.hint !== 'string') {
            throw new Error(`Template ${template.id}: 'hint' field is not a string`);
        }
        hint = config.hint;
        for (const [key, value] of Object.entries(params)) {
            hint = hint.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        }
    }

    // Generate hints array if config has one
    let hints: string[] | undefined;
    if (config.hints && config.hints.length > 0) {
        hints = config.hints.map(h => {
            let hintText = h;
            for (const [key, value] of Object.entries(params)) {
                hintText = hintText.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
            }
            return hintText;
        });
    }

    // Generate solution steps if config has them
    let solution: SolutionStep[] | undefined;
    if (config.solution) {
        solution = config.solution.map(step => {
            const generatedStep: SolutionStep = {
                explanation: step.explanation,
            };

            // Substitute parameters in explanation
            for (const [key, value] of Object.entries(params)) {
                generatedStep.explanation = generatedStep.explanation.replace(
                    new RegExp(`\\{${key}\\}`, 'g'),
                    String(value)
                );
            }

            // Substitute parameters in expression if present
            if (step.expression) {
                generatedStep.expression = step.expression;
                for (const [key, value] of Object.entries(params)) {
                    generatedStep.expression = generatedStep.expression.replace(
                        new RegExp(`\\{${key}\\}`, 'g'),
                        String(value)
                    );
                }
            }

            // Substitute parameters in result if present
            if (step.result) {
                generatedStep.result = step.result;
                for (const [key, value] of Object.entries(params)) {
                    generatedStep.result = generatedStep.result.replace(
                        new RegExp(`\\{${key}\\}`, 'g'),
                        String(value)
                    );
                }
            }

            // Special handling for {answer} placeholder
            if (generatedStep.explanation.includes('{answer}')) {
                generatedStep.explanation = generatedStep.explanation.replace(
                    /\{answer\}/g,
                    String(answer)
                );
            }
            if (generatedStep.expression && generatedStep.expression.includes('{answer}')) {
                generatedStep.expression = generatedStep.expression.replace(
                    /\{answer\}/g,
                    String(answer)
                );
            }
            if (generatedStep.result && generatedStep.result.includes('{answer}')) {
                generatedStep.result = generatedStep.result.replace(
                    /\{answer\}/g,
                    String(answer)
                );
            }

            return generatedStep;
        });
    }

    return {
        id: `${template.id}-${resolvedSeed}`,
        template_id: template.id,
        seed: resolvedSeed,
        params,
        question,
        answer,
        hint,
        hints,
        solution,
        answer_type: config.answer_type || 'number',
    };
}
