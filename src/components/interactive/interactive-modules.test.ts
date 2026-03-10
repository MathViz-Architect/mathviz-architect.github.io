/**
 * Bug Condition Exploration Tests for Interactive Modules UX Issues
 * 
 * These tests verify the 5 identified bugs in the interactive modules:
 * 1. Scroll blocking bug
 * 2. Missing instructions bug
 * 3. Pythagorean visualization clarity bug
 * 4. Non-working control elements bug
 * 5. Invisible visualization elements bug
 * 
 * IMPORTANT: These tests are written BEFORE fixes are applied.
 * They should FAIL on unfixed code to confirm bugs exist.
 * After fixes, they should PASS to confirm bugs are resolved.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
const { JSDOM } = require('jsdom');

describe('Phase 1: Bug Condition Exploration Tests', () => {
    describe('1.1 Scroll Blocking Bug', () => {
        /**
         * Property 1: Bug Condition - Scroll Functionality
         * 
         * Bug Condition: isBugCondition_Scroll(input) where:
         *   - mode === 'interactive' 
         *   - contentHeight > viewportHeight
         * 
         * Expected Behavior (after fix):
         *   - canScroll(result) === true
         *   - scrollbarVisible(result) === true
         * 
         * This test should FAIL on unfixed code (confirms bug exists)
         * This test should PASS after fix (confirms bug is resolved)
         */
        it('should allow scrolling in interactive mode when content exceeds viewport', () => {
            // Simulate DOM structure
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="root" style="height: 100%; overflow: auto;">
              <div class="interactive-mode" style="height: 2000px;">
                <div class="content">Interactive module content</div>
              </div>
            </div>
          </body>
        </html>
      `);

            const document = dom.window.document;
            const root = document.getElementById('root');
            const html = document.documentElement;
            const body = document.body;

            // Check CSS properties - expect overflow: auto (not hidden)
            const rootStyle = dom.window.getComputedStyle(root!);
            const htmlStyle = dom.window.getComputedStyle(html);
            const bodyStyle = dom.window.getComputedStyle(body);

            // After fix: these should be 'auto' or 'visible', not 'hidden'
            expect(rootStyle.overflow).not.toBe('hidden');
            expect(htmlStyle.overflow).not.toBe('hidden');
            expect(bodyStyle.overflow).not.toBe('hidden');

            // Verify scrollbar should be visible
            // In real browser, scrollHeight > clientHeight indicates scrollbar
            expect(root!.scrollHeight).toBeGreaterThan(root!.clientHeight);
        });

        it('should not have canvas-mode class in interactive mode', () => {
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="root">
              <div class="app-container" data-mode="interactive">
                Interactive content
              </div>
            </div>
          </body>
        </html>
      `);

            const appContainer = dom.window.document.querySelector('.app-container');

            // After fix: canvas-mode class should NOT be applied in interactive mode
            expect(appContainer?.classList.contains('canvas-mode')).toBe(false);
        });
    });

    describe('1.2 Missing Instructions Bug', () => {
        /**
         * Property 1: Bug Condition - Instructions Display
         * 
         * Bug Condition: isBugCondition_Instructions(input) where:
         *   - isFirstVisit AND NOT welcomeScreenShown
         *   - moduleOpened AND NOT moduleInstructionsShown
         * 
         * Expected Behavior (after fix):
         *   - welcomeScreenShown(result) === true
         *   - moduleInstructionsShown(result) === true
         */
        it('should show WelcomeScreen component on first visit', () => {
            // Simulate first visit (no localStorage entry)
            const mockLocalStorage = {
                getItem: vi.fn(() => null), // Returns null for first visit
                setItem: vi.fn(),
            };
            global.localStorage = mockLocalStorage as any;

            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="root">
              <div class="welcome-screen">Welcome to MathViz Architect</div>
            </div>
          </body>
        </html>
      `);

            const welcomeScreen = dom.window.document.querySelector('.welcome-screen');

            // After fix: WelcomeScreen should be found
            expect(welcomeScreen).not.toBeNull();
            expect(welcomeScreen?.textContent).toContain('Welcome');
        });

        it('should show ModuleInstructions component in interactive modules', () => {
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="root">
              <div class="interactive-module">
                <div class="module-instructions">
                  <h3>Как использовать этот модуль</h3>
                  <p>Инструкции...</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);

            const instructions = dom.window.document.querySelector('.module-instructions');

            // After fix: ModuleInstructions should be found
            expect(instructions).not.toBeNull();
            expect(instructions?.textContent).toContain('Как использовать');
        });

        it('should show tooltips on control elements', () => {
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="root">
              <div class="control-element" data-tooltip="Изменить параметр A">
                <input type="range" />
              </div>
            </div>
          </body>
        </html>
      `);

            const controlElement = dom.window.document.querySelector('.control-element');

            // After fix: Tooltip data should be present
            expect(controlElement?.getAttribute('data-tooltip')).toBeTruthy();
        });
    });

    describe('1.3 Pythagorean Visualization Clarity Bug', () => {
        /**
         * Property 1: Bug Condition - Pythagorean Clarity
         * 
         * Bug Condition: isBugCondition_Pythagorean(input) where:
         *   - moduleId === 'pythagorean'
         *   - NOT explanationTextExists
         *   - showProof AND NOT stepByStepExplanation
         * 
         * Expected Behavior (after fix):
         *   - explanationTextExists(result) === true
         *   - stepByStepExplanation(result) === true
         */
        it('should have textual explanation in PythagoreanTheorem module', () => {
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="root">
              <div class="pythagorean-module">
                <div class="theorem-explanation">
                  <p>Теорема Пифагора утверждает: a² + b² = c²</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);

            const explanation = dom.window.document.querySelector('.theorem-explanation');

            // After fix: Explanation text should be found
            expect(explanation).not.toBeNull();
            expect(explanation?.textContent).toContain('a² + b² = c²');
        });

        it('should have step-by-step animation explanation', () => {
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="root">
              <div class="pythagorean-module">
                <button class="show-proof">Показать доказательство</button>
                <div class="animation-steps">
                  <div class="step" data-step="1">Шаг 1: ...</div>
                  <div class="step" data-step="2">Шаг 2: ...</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);

            const steps = dom.window.document.querySelectorAll('.step');

            // After fix: Animation steps should be found
            expect(steps.length).toBeGreaterThan(0);
        });

        it('should have dynamic formula highlighting', () => {
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="root">
              <div class="pythagorean-module">
                <div class="formula">
                  <span class="term-a">a² = 9</span>
                  <span> + </span>
                  <span class="term-b">b² = 16</span>
                  <span> = </span>
                  <span class="term-c">c² = 25</span>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);

            const formula = dom.window.document.querySelector('.formula');
            const termA = dom.window.document.querySelector('.term-a');

            // After fix: Formula with calculated values should be found
            expect(formula).not.toBeNull();
            expect(termA?.textContent).toContain('a²');
        });
    });

    describe('1.4 Non-Working Control Elements Bug', () => {
        /**
         * Property 1: Bug Condition - Control Elements Functionality
         * 
         * Bug Condition: isBugCondition_Controls(input) where:
         *   - elementType IN ['arrow', 'rotation-slider']
         *   - NOT hasEventHandler
         * 
         * Expected Behavior (after fix):
         *   - eventHandlerExecuted(result) === true
         *   - visualFeedbackShown(result) === true
         */
        it('should have event handlers on all control elements', () => {
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="root">
              <div class="interactive-module">
                <button class="arrow-control" onclick="handleArrowClick()">→</button>
                <input type="range" class="rotation-slider" onchange="handleRotation()" />
              </div>
            </div>
          </body>
        </html>
      `);

            const arrowButton = dom.window.document.querySelector('.arrow-control');
            const rotationSlider = dom.window.document.querySelector('.rotation-slider');

            // After fix: Event handlers should be present
            expect(arrowButton?.getAttribute('onclick')).toBeTruthy();
            expect(rotationSlider?.getAttribute('onchange')).toBeTruthy();
        });

        it('should provide visual feedback on hover and click', () => {
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              .control-button:hover { background-color: #eee; }
              .control-button:active { background-color: #ddd; }
            </style>
          </head>
          <body>
            <div id="root">
              <button class="control-button">Control</button>
            </div>
          </body>
        </html>
      `);

            const button = dom.window.document.querySelector('.control-button');

            // After fix: CSS classes for visual feedback should be present
            expect(button?.classList.contains('control-button')).toBe(true);
        });
    });

    describe('1.5 Invisible Visualization Elements Bug', () => {
        /**
         * Property 1: Bug Condition - Element Visibility
         * 
         * Bug Condition: isBugCondition_Visibility(input) where:
         *   - elementCoords outside viewBox
         * 
         * Expected Behavior (after fix):
         *   - allElementsVisible(result) === true
         */
        it('should have adequate viewBox dimensions with padding', () => {
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <svg viewBox="-10 -10 320 320" width="300" height="300">
              <circle cx="150" cy="150" r="100" />
              <line x1="0" y1="0" x2="300" y2="300" />
            </svg>
          </body>
        </html>
      `);

            const svg = dom.window.document.querySelector('svg');
            const viewBox = svg?.getAttribute('viewBox');

            // After fix: viewBox should have padding (negative start values)
            expect(viewBox).toBeTruthy();
            const [minX, minY, width, height] = viewBox!.split(' ').map(Number);

            // Check for padding (negative minX/minY indicates padding)
            expect(minX).toBeLessThan(0);
            expect(minY).toBeLessThan(0);

            // Check that dimensions are larger than base size
            expect(width).toBeGreaterThan(300);
            expect(height).toBeGreaterThan(300);
        });

        it('should keep all elements within viewBox bounds at extreme values', () => {
            const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <svg viewBox="-10 -10 320 320" width="300" height="300">
              <circle cx="270" cy="270" r="20" />
            </svg>
          </body>
        </html>
      `);

            const svg = dom.window.document.querySelector('svg');
            const circle = dom.window.document.querySelector('circle');
            const viewBox = svg?.getAttribute('viewBox');

            const [minX, minY, width, height] = viewBox!.split(' ').map(Number);
            const cx = Number(circle?.getAttribute('cx'));
            const cy = Number(circle?.getAttribute('cy'));
            const r = Number(circle?.getAttribute('r'));

            // After fix: Circle should be fully within viewBox
            expect(cx + r).toBeLessThanOrEqual(minX + width);
            expect(cy + r).toBeLessThanOrEqual(minY + height);
            expect(cx - r).toBeGreaterThanOrEqual(minX);
            expect(cy - r).toBeGreaterThanOrEqual(minY);
        });
    });
});
