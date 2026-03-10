import { problemTemplates } from '../src/lib/problemTemplates';
import { generateProblem } from '../src/lib/engine/variantGenerator';

function previewTemplates() {
    for (const template of problemTemplates) {
        const difficultyKeys = Object.keys(template.difficulties) as Array<'1' | '2' | '3' | '4'>;

        for (const key of difficultyKeys) {
            const difficulty = Number(key) as 1 | 2 | 3 | 4;

            for (let i = 0; i < 5; i++) {
                const seed = Date.now() ^ Math.floor(Math.random() * 0xffffffff) ^ (difficulty * 1000 + i);
                const problem = generateProblem(template, difficulty, seed);

                console.log('---');
                console.log(`template: ${template.id}`);
                console.log(`difficulty: ${difficulty}`);
                console.log(`question: ${problem.question}`);
                console.log(`answer: ${problem.answer}`);

                if (problem.solution && problem.solution.length > 0) {
                    console.log('solution:');
                    for (const step of problem.solution) {
                        const parts: string[] = [];
                        if (step.explanation) parts.push(step.explanation);
                        if (step.expression) parts.push(step.expression);
                        if (step.result) parts.push(`= ${step.result}`);
                        console.log(`  - ${parts.join(' | ')}`);
                    }
                }
            }
        }
    }
}

previewTemplates();

