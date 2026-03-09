#!/usr/bin/env tsx
/**
 * Template Testing Script
 * Tests all problem templates by generating 1000 variants per difficulty level
 */

import { problemTemplates } from '../src/lib/problemTemplates';
import { generateProblem } from '../src/lib/engine/variantGenerator';
import { ProblemTemplate } from '../src/lib/types';

interface TestResult {
    templateId: string;
    difficulty: 1 | 2 | 3 | 4;
    total: number;
    passed: number;
    failed: number;
    errors: Array<{
        message: string;
        params?: Record<string, number | string>;
    }>;
}

function testTemplate(template: ProblemTemplate, difficulty: 1 | 2 | 3 | 4, iterations: number = 1000): TestResult {
    const result: TestResult = {
        templateId: template.id,
        difficulty,
        total: iterations,
        passed: 0,
        failed: 0,
        errors: [],
    };

    for (let i = 0; i < iterations; i++) {
        try {
            const problem = generateProblem(template, difficulty);
            let isValid = true;
            let errorMessage = '';

            // Check 1: answer is not NaN or Infinity
            if (typeof problem.answer === 'number') {
                if (isNaN(problem.answer)) {
                    isValid = false;
                    errorMessage = 'answer is NaN';
                } else if (!isFinite(problem.answer)) {
                    isValid = false;
                    errorMessage = 'answer is Infinity';
                }
            }

            // Check 2: answer is not undefined/null
            if (problem.answer === undefined || problem.answer === null) {
                isValid = false;
                errorMessage = 'answer is undefined/null';
            }

            // Check 3: all {parameters} are substituted in question
            if (problem.question.includes('{') || problem.question.includes('}')) {
                isValid = false;
                errorMessage = 'unsubstituted parameters in question';
            }

            // Check 4: for numeric problems, answer must be a number
            if (template.problemType === 'numeric' && typeof problem.answer !== 'number') {
                isValid = false;
                errorMessage = `answer is not a number (got ${typeof problem.answer})`;
            }

            // Check 5: for comparison problems, answer must be <, >, or =
            if (template.problemType === 'comparison') {
                if (!['<', '>', '='].includes(String(problem.answer))) {
                    isValid = false;
                    errorMessage = `invalid comparison answer: ${problem.answer}`;
                }
            }

            // Check 6: for geometry templates, all numeric parameters must be > 0
            if (template.subject === 'geometry') {
                for (const [key, value] of Object.entries(problem.params)) {
                    if (typeof value === 'number' && value <= 0) {
                        isValid = false;
                        errorMessage = `geometry parameter ${key} is <= 0`;
                        break;
                    }
                }
            }

            // Check 7: validate answer_type parsing
            if (problem.answer_type) {
                try {
                    switch (problem.answer_type) {
                        case 'fraction': {
                            // Try parsing as fraction
                            const answerStr = String(problem.answer);
                            const fractionMatch = answerStr.match(/^\s*(-?\d+)\s*\/\s*(-?\d+)\s*$/);
                            const decimal = parseFloat(answerStr.replace(',', '.'));
                            if (!fractionMatch && isNaN(decimal)) {
                                isValid = false;
                                errorMessage = `answer_type is 'fraction' but answer cannot be parsed: ${answerStr}`;
                            }
                            break;
                        }
                        case 'coordinate': {
                            // Try parsing as coordinate
                            const answerStr = String(problem.answer);
                            const cleaned = answerStr.replace(/^\(|\)$/g, '');
                            const parts = cleaned.split(/[,;]/).map(p => p.trim());
                            if (parts.length !== 2 || isNaN(parseFloat(parts[0])) || isNaN(parseFloat(parts[1]))) {
                                isValid = false;
                                errorMessage = `answer_type is 'coordinate' but answer cannot be parsed: ${answerStr}`;
                            }
                            break;
                        }
                    }
                } catch (error) {
                    isValid = false;
                    errorMessage = `answer_type validation failed: ${error instanceof Error ? error.message : String(error)}`;
                }
            }

            if (isValid) {
                result.passed++;
            } else {
                result.failed++;
                // Only store first 5 errors to avoid memory issues
                if (result.errors.length < 5) {
                    result.errors.push({
                        message: errorMessage,
                        params: problem.params,
                    });
                }
            }
        } catch (error) {
            result.failed++;
            if (result.errors.length < 5) {
                result.errors.push({
                    message: `Exception: ${error instanceof Error ? error.message : String(error)}`,
                });
            }
        }
    }

    return result;
}

function main() {
    console.log('🧪 Testing Problem Templates\n');
    console.log('='.repeat(60));

    const allResults: TestResult[] = [];
    let totalTests = 0;
    let totalPassed = 0;

    for (const template of problemTemplates) {
        const difficulties = Object.keys(template.difficulties).map(Number) as (1 | 2 | 3 | 4)[];

        for (const difficulty of difficulties) {
            process.stdout.write(`Testing ${template.id} [difficulty ${difficulty}]... `);

            const result = testTemplate(template, difficulty);
            allResults.push(result);
            totalTests++;
            totalPassed += result.failed === 0 ? 1 : 0;

            if (result.failed === 0) {
                console.log(`${result.passed}/${result.total} ✅`);
            } else {
                console.log(`${result.passed}/${result.total} ❌`);
                for (const error of result.errors) {
                    console.log(`  - ${error.message}`);
                    if (error.params) {
                        console.log(`    params: ${JSON.stringify(error.params)}`);
                    }
                }
                if (result.errors.length < result.failed) {
                    console.log(`  - ... and ${result.failed - result.errors.length} more errors`);
                }
            }
        }
    }

    console.log('='.repeat(60));
    console.log(`\n📊 Results: ${totalPassed}/${totalTests} passed`);

    const failedTests = allResults.filter(r => r.failed > 0);
    if (failedTests.length > 0) {
        console.log('\n❌ Failed:');
        for (const test of failedTests) {
            console.log(`  - ${test.templateId} [diff ${test.difficulty}]: ${test.failed}/${test.total} failures`);
        }
        process.exit(1);
    } else {
        console.log('\n✅ All tests passed!');
        process.exit(0);
    }
}

main();
