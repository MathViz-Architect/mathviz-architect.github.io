/**
 * Problem variant generator
 * Handles parameter generation, constraint checking, and template substitution
 */

import { ProblemTemplate, GeneratedProblem, SolutionStep, DifficultyConfig } from '../types';
import { evaluateFormula } from './expressionParser';

// Helper to generate random integer in range [min, max]
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generate parameter values for a difficulty config
 */
function generateParamsForConfig(config: DifficultyConfig): Record<string, number | string> {
    const params: Record<string, number | string> = {};

    // Pass 1: generate int/choice params
    for (const [key, def] of Object.entries(config.parameters)) {
        if (def.type === 'int') {
            params[key] = randomInt(def.min, def.max);
        } else if (def.type === 'choice') {
            params[key] = def.values[randomInt(0, def.values.length - 1)];
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
                    params[key] = randomInt(def.min, def.max);
                } else if (def.type === 'choice') {
                    params[key] = def.values[randomInt(0, def.values.length - 1)];
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
 */
export function generateProblem(template: ProblemTemplate, difficulty: 1 | 2 | 3 | 4 = 1): GeneratedProblem {
    console.log('[generateProblem] Called with:', {
        templateId: template.id,
        difficulty,
        timestamp: Date.now(),
    });

    const config = getDifficultyConfig(template, difficulty);

    // Validate required fields
    if (!config.template || typeof config.template !== 'string') {
        throw new Error(`Template ${template.id}: 'template' field is missing or not a string`);
    }
    if (!config.answer_formula || typeof config.answer_formula !== 'string') {
        throw new Error(`Template ${template.id}: 'answer_formula' field is missing or not a string`);
    }

    const params = generateParamsForConfig(config);

    // Substitute parameters in template string
    let question = config.template;
    for (const [key, value] of Object.entries(params)) {
        question = question.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }

    // Calculate answer
    const answer = evaluateFormula(config.answer_formula, params);

    console.log('[generateProblem] Generated:', {
        templateId: template.id,
        params,
        answer,
        question: question.substring(0, 50) + '...',
    });

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
        id: `${template.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        template_id: template.id,
        params,
        question,
        answer,
        hint,
        solution,
        answer_type: config.answer_type || 'number',
    };
}
