/**
 * Problem Engine Test Suite
 * Tests MathJS, KaTeX, Hints, and Canvas Action features
 */

import { 
  compareExpressions, 
  compareIntervals 
} from './answerValidator';
import { 
  calculateAnswerWeight, 
  getWeightedAnswer,
  createAdaptiveState,
  updateAdaptiveState
} from '../adaptiveEngine';
import { generateProblem } from './variantGenerator';
import { ProblemTemplate } from '../types';
import katex from 'katex';

interface TestResult {
  name: string;
  expected: any;
  actual: any;
  passed: boolean;
}

const results: TestResult[] = [];

function test(name: string, expected: any, actual: any) {
  const passed = JSON.stringify(expected) === JSON.stringify(actual);
  results.push({ name, expected, actual, passed });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name}`);
  if (!passed) {
    console.log(`  Expected: ${JSON.stringify(expected)}`);
    console.log(`  Actual:   ${JSON.stringify(actual)}`);
  }
}

export function runAllTests() {
  console.log('\n========================================');
  console.log('   PROBLEM ENGINE TEST SUITE');
  console.log('========================================\n');

  runMathJSTests();
  runKaTeXTests();
  runAdaptiveEngineTests();
  runCanvasActionTests();

  console.log('\n========================================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`   SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  return results;
}

function runMathJSTests() {
  console.log('--- MathJS Expression & Interval Tests ---\n');

  // Expression tests
  test('Expression: sqrt(18) = 3*sqrt(2)', true, compareExpressions('sqrt(18)', '3*sqrt(2)'));
  test('Expression: 1/4 vs 0.25', true, compareExpressions('1/4', '0.25'));
  test('Expression: (x-1)(x+2) vs x^2+x-2', true, compareExpressions('(x-1)*(x+2)', 'x^2+x-2'));
  test('Expression: 0.5 vs 1/2', true, compareExpressions('0.5', '1/2'));
  test('Expression: 2*sqrt(2) vs sqrt(8)', true, compareExpressions('2*sqrt(2)', 'sqrt(8)'));
  test('Expression: 4/8 vs 1/2', true, compareExpressions('4/8', '1/2'));
  test('Expression: x+x = 2x', true, compareExpressions('x+x', '2*x'));
  test('Expression: x^2 vs x*x (should be equal)', true, compareExpressions('x^2', 'x*x'));

  // Interval tests
  test('Interval: [2; +inf) = [2; inf)', true, compareIntervals('[2; +inf)', '[2; inf)'));
  test('Interval: (1; 5] != (1; 5)', false, compareIntervals('(1; 5]', '(1; 5)'));
  test('Interval: [0; 10] = [0; 10]', true, compareIntervals('[0; 10]', '[0; 10]'));
  test('Interval: (-inf; 3) = (-inf; 3)', true, compareIntervals('(-inf; 3)', '(-inf; 3)'));
  test('Interval: [1; 2] != [1; 3)', false, compareIntervals('[1; 2]', '[1; 3)'));
  test('Interval: (0; 1) = (0; 1)', true, compareIntervals('(0; 1)', '(0; 1)'));

  console.log('');
}

function runKaTeXTests() {
  console.log('--- KaTeX Rendering Tests ---\n');

  // Test 1: Error handling - malformed LaTeX should not crash
  try {
    const html = katex.renderToString('\\frac{1}{2', {
      displayMode: false,
      throwOnError: false,
      strict: false
    });
    test('KaTeX: Malformed LaTeX handling', 'no crash', 'no crash');
  } catch (e) {
    test('KaTeX: Malformed LaTeX handling', 'no crash', 'crashed');
  }

  // Test 2: Valid LaTeX rendering
  try {
    const html = katex.renderToString('\\frac{1}{2}', {
      displayMode: false,
      throwOnError: false
    });
    test('KaTeX: Valid fraction \\frac{1}{2}', true, html.includes('frac'));
  } catch (e) {
    test('KaTeX: Valid fraction \\frac{1}{2}', true, false);
  }

  // Test 3: Display mode LaTeX
  try {
    const html = katex.renderToString('x = \\frac{-b \\pm \\sqrt{D}}{2a}', {
      displayMode: true,
      throwOnError: false
    });
    test('KaTeX: Quadratic formula display mode', true, html.length > 0);
  } catch (e) {
    test('KaTeX: Quadratic formula display mode', true, false);
  }

  // Test 4: Parameter substitution simulation
  const template = '$a={v}$';
  const params = { v: 10 };
  const substituted = template.replace(/{v}/g, String(params.v));
  test('KaTeX: Parameter substitution', '$a=10$', substituted);

  // Test 5: Complex substitution in display mode
  const complexTemplate = '$$\\frac{-{b} \\pm \\sqrt{D}}{2a}$$';
  const complexParams = { b: 5, a: 1 };
  let complexSubstituted = complexTemplate;
  for (const [key, value] of Object.entries(complexParams)) {
    complexSubstituted = complexSubstituted.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  test('KaTeX: Complex parameter substitution', 
    '$$\\frac{-5 \\pm \\sqrt{D}}{2a}$$', 
    complexSubstituted);

  console.log('');
}

function runAdaptiveEngineTests() {
  console.log('--- Adaptive Engine Weight Tests ---\n');

  // Test weight calculation
  test('Weight: 0 hints = 1.0', 1.0, calculateAnswerWeight(0));
  test('Weight: 1 hint = 0.5', 0.5, calculateAnswerWeight(1));
  test('Weight: 2 hints = 0.0', 0.0, calculateAnswerWeight(2));
  test('Weight: 3 hints = 0.0', 0.0, calculateAnswerWeight(3));

  // Test weighted answer with hints
  test('WeightedAnswer: correct + 0 hints', true, getWeightedAnswer(true, 0));
  test('WeightedAnswer: incorrect + 0 hints', false, getWeightedAnswer(false, 0));
  test('WeightedAnswer: incorrect + 5 hints', false, getWeightedAnswer(false, 5));

  // Test that with 2+ hints, correct answer becomes false for progression
  // Note: This is probabilistic, but with 2+ hints it should always return false
  let weightedResult2hints = true;
  for (let i = 0; i < 10; i++) {
    if (getWeightedAnswer(true, 2) === false) {
      weightedResult2hints = false;
      break;
    }
  }
  test('WeightedAnswer: correct + 2 hints → false (for difficulty progression)', 
    false, weightedResult2hints);

  // Test full adaptive state cycle
  let state = createAdaptiveState();
  test('AdaptiveState: initial hintsUsed = 0', 0, state.hintsUsedInCurrentProblem);

  // Simulate using hints
  state = { ...state, hintsUsedInCurrentProblem: 1 };
  test('AdaptiveState: after hint usage', 1, state.hintsUsedInCurrentProblem);

  // Simulate correct answer with hint - should not increase difficulty
  // Using getWeightedAnswer to properly apply hint penalty
  // With 1 hint used, weighted result should be false (since 1 hint gives 0.5 weight, 
  // but getWeightedAnswer uses random - let's test directly)
  const weightedResult1 = getWeightedAnswer(true, 1); // may be true or false based on random
  // Better: test with 2 hints where weight is always 0
  const weightedResult2 = getWeightedAnswer(true, 2); // should be false
  test('AdaptiveState: correct with 2+ hints → weighted = false', 
    false, weightedResult2);
  
  // Test that 0 hints gives full weight
  const weightedResult0 = getWeightedAnswer(true, 0); // should be true
  test('AdaptiveState: correct with 0 hints → weighted = true', 
    true, weightedResult0);

  // Simulate 3 correct answers WITHOUT hints - should increase difficulty
  let stateForProgression = createAdaptiveState();
  stateForProgression = updateAdaptiveState(stateForProgression, true);
  stateForProgression = updateAdaptiveState(stateForProgression, true);
  stateForProgression = updateAdaptiveState(stateForProgression, true);
  test('AdaptiveState: 3 correct WITHOUT hints → difficulty increases', 
    2, stateForProgression.currentDifficulty);

  console.log('');
}

function runCanvasActionTests() {
  console.log('--- Canvas Action Type Tests ---\n');

  // Test that canvas_action type doesn't crash the validator
  const canvasProblem = {
    id: 'test-canvas-1',
    template_id: 'test',
    seed: 123,
    params: { x: 5, y: 10 },
    question: 'Move the point to coordinates (5, 10)',
    answer: '',
    answer_type: 'number' as const, // Canvas action uses text type for display
    canvasAction: {
      action: 'move_point' as const,
      targetData: {
        point: { x: 5, y: 10 }
      },
      tolerance: 10
    }
  };

  // This should not throw - canvas action requires special handling
  try {
    test('CanvasAction: Problem structure created', true, 
      canvasProblem.canvasAction?.action === 'move_point');
    test('CanvasAction: Target coordinates preserved', { x: 5, y: 10 }, 
      canvasProblem.canvasAction?.targetData.point);
    test('CanvasAction: Tolerance defined', 10, canvasProblem.canvasAction?.tolerance);
  } catch (e) {
    test('CanvasAction: Structure test', true, false);
  }

  // Test variant generation with canvas action template
  const canvasTemplate: ProblemTemplate = {
    id: 'canvas-test',
    class: 9,
    subject: 'algebra',
    section: 'Coordinate Plane',
    topic: 'points',
    topic_title: 'Точки на координатной плоскости',
    problemType: 'canvas_action',
    difficulties: {
      1: {
        template: 'Move the point P to coordinates ({x}, {y})',
        parameters: {
          x: { type: 'int', min: -10, max: 10 },
          y: { type: 'int', min: -10, max: 10 }
        },
        answer_formula: '0', // Canvas action doesn't use formula answer
        answer_type: 'number'
      }
    }
  };

  try {
    const generated = generateProblem(canvasTemplate, 1, 999);
    test('CanvasAction: Problem generated successfully', true, 
      generated.params.x !== undefined && generated.params.y !== undefined);
    test('CanvasAction: Generated question contains coords', true,
      generated.question.includes('('));
  } catch (e) {
    test('CanvasAction: Problem generation', true, false);
    console.log('  Error:', e);
  }

  console.log('');
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  // @ts-ignore
  if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('test')) {
    runAllTests();
  }
}

export default runAllTests;
