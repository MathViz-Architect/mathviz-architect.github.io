import { ProblemTemplate, GeneratedProblem, ParameterDef } from './types';

// Helper to generate random integer in range [min, max]
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generate parameter values for a template
 */
export function generateParams(template: ProblemTemplate): Record<string, number | string> {
    const params: Record<string, number | string> = {};

    // Pass 1: generate int/choice params
    for (const [key, def] of Object.entries(template.parameters)) {
        if (def.type === 'int') {
            params[key] = randomInt(def.min, def.max);
        } else if (def.type === 'choice') {
            params[key] = def.values[randomInt(0, def.values.length - 1)];
        }
    }
    // Pass 2: evaluate expressions (all int/choice values are now available)
    for (const [key, def] of Object.entries(template.parameters)) {
        if (def.type === 'expression') {
            params[key] = evaluateFormula(def.value, params);
        }
    }

    // Check constraints and regenerate if needed
    if (template.constraints && template.constraints.length > 0) {
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            let allConstraintsMet = true;

            for (const constraint of template.constraints) {
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
            for (const [key, def] of Object.entries(template.parameters)) {
                if (def.type === 'int') {
                    params[key] = randomInt(def.min, def.max);
                } else if (def.type === 'choice') {
                    params[key] = def.values[randomInt(0, def.values.length - 1)];
                }
            }
            for (const [key, def] of Object.entries(template.parameters)) {
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
 * Evaluate a formula string with given parameters
 */
export function evaluateFormula(formula: string, params: Record<string, number | string>): number | string {
    try {
        // Create function with parameter names as arguments
        const paramNames = Object.keys(params);
        const paramValues = Object.values(params);

        // Create safe evaluation function
        const func = new Function(...paramNames, `return ${formula}`);
        const result = func(...paramValues);

        return result;
    } catch (error) {
        console.error('Formula evaluation error:', error, 'Formula:', formula, 'Params:', params);
        return 0;
    }
}

/**
 * Generate a problem from a template
 */
export function generateProblem(template: ProblemTemplate): GeneratedProblem {
    const params = generateParams(template);

    // Substitute parameters in template string
    let question = template.template;
    for (const [key, value] of Object.entries(params)) {
        question = question.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }

    // Calculate answer
    const answer = evaluateFormula(template.answer_formula, params);

    // Generate hint if template has one
    let hint: string | undefined;
    if (template.hint) {
        hint = template.hint;
        for (const [key, value] of Object.entries(params)) {
            hint = hint.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        }
    }

    return {
        id: `${template.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        template_id: template.id,
        params,
        question,
        answer,
        hint,
    };
}

/**
 * Validate user answer against problem answer
 */
export function validateAnswer(problem: GeneratedProblem, userAnswer: string): boolean {
    const answer = problem.answer;

    if (typeof answer === 'number') {
        // Numeric answer
        const parsed = parseFloat(userAnswer.replace(',', '.'));
        if (isNaN(parsed)) return false;
        return Math.abs(parsed - answer) < 0.01;
    } else {
        // Text answer - case insensitive match
        return userAnswer.trim().toLowerCase() === String(answer).trim().toLowerCase();
    }
}
