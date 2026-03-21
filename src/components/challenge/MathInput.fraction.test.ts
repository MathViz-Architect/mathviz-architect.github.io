import { describe, it, expect } from 'vitest';
import {
    processFractionInsert,
    findFracAtCursor,
    processFracNavigation,
    processFracBackspace,
    processDelete,
    unifiedInputPipeline,
} from './hooks/useMathInputLogic';

const cursorAt = (pos: number) => ({ selectionStart: pos, selectionEnd: pos, hasSelection: false });

describe('Fraction Input', () => {
    describe('processFractionInsert', () => {
        it('inserts \\frac{}{} at cursor in empty string', () => {
            const result = processFractionInsert('', cursorAt(0));
            expect(result.value).toBe('\\frac{}{}');
        });

        it('places cursor inside numerator (position 7)', () => {
            const result = processFractionInsert('', cursorAt(0));
            expect(result.cursorPosition).toBe(7);
        });

        it('inserts at cursor position mid-string', () => {
            const result = processFractionInsert('1+2', cursorAt(1));
            expect(result.value).toBe('1\\frac{}{}+2');
            expect(result.cursorPosition).toBe(8); // 1 + 7
        });

        it('inserts at end of string', () => {
            const result = processFractionInsert('3+', cursorAt(2));
            expect(result.value).toBe('3+\\frac{}{}');
            expect(result.cursorPosition).toBe(9);
        });
    });

    describe('findFracAtCursor', () => {
        it('finds frac when cursor is inside numerator', () => {
            const val = '\\frac{}{}';
            const frac = findFracAtCursor(val, 7); // inside first {}
            expect(frac).not.toBeNull();
            expect(frac!.fracStart).toBe(0);
            expect(frac!.numStart).toBe(6);
            expect(frac!.numEnd).toBe(6);
            expect(frac!.denStart).toBe(8);
            expect(frac!.denEnd).toBe(8);
        });

        it('finds frac when cursor is inside denominator', () => {
            const val = '\\frac{}{}';
            const frac = findFracAtCursor(val, 8);
            expect(frac).not.toBeNull();
        });

        it('returns null when cursor is outside any frac', () => {
            const val = '1+2';
            expect(findFracAtCursor(val, 1)).toBeNull();
        });

        it('returns null for empty string', () => {
            expect(findFracAtCursor('', 0)).toBeNull();
        });

        it('finds frac with content inside', () => {
            const val = '\\frac{1}{2}';
            const frac = findFracAtCursor(val, 7); // cursor after '1'
            expect(frac).not.toBeNull();
            expect(val.slice(frac!.numStart, frac!.numEnd)).toBe('1');
            expect(val.slice(frac!.denStart, frac!.denEnd)).toBe('2');
        });
    });

    describe('processFracNavigation', () => {
        it('ArrowRight at end of numerator jumps to denominator start', () => {
            const val = '\\frac{}{}';
            // cursor at numEnd = 6 (empty numerator, so numStart === numEnd === 6)
            const result = processFracNavigation(val, cursorAt(6), 'right');
            expect(result).not.toBeNull();
            expect(result!.cursorPosition).toBe(8); // denStart
        });

        it('ArrowLeft at start of denominator jumps to numerator end', () => {
            const val = '\\frac{}{}';
            const result = processFracNavigation(val, cursorAt(8), 'left');
            expect(result).not.toBeNull();
            expect(result!.cursorPosition).toBe(6); // numEnd
        });

        it('returns null when cursor is not at boundary', () => {
            const val = '\\frac{12}{}';
            // cursor at pos 7 (between '1' and '2'), not at numEnd
            const result = processFracNavigation(val, cursorAt(7), 'right');
            expect(result).toBeNull();
        });

        it('returns null when not inside a frac', () => {
            const result = processFracNavigation('1+2', cursorAt(1), 'right');
            expect(result).toBeNull();
        });
    });

    describe('processFracBackspace', () => {
        it('removes entire \\frac{}{} when both parts are empty', () => {
            const val = '\\frac{}{}';
            const result = processFracBackspace(val, cursorAt(7));
            expect(result).not.toBeNull();
            expect(result!.value).toBe('');
            expect(result!.cursorPosition).toBe(0);
        });

        it('returns null when numerator has content', () => {
            const val = '\\frac{1}{}';
            const result = processFracBackspace(val, cursorAt(7));
            expect(result).toBeNull();
        });

        it('returns null when denominator has content', () => {
            const val = '\\frac{}{2}';
            const result = processFracBackspace(val, cursorAt(8));
            expect(result).toBeNull();
        });

        it('removes \\frac{}{} embedded in expression', () => {
            const val = '3+\\frac{}{}';
            const result = processFracBackspace(val, cursorAt(9)); // inside numerator
            expect(result).not.toBeNull();
            expect(result!.value).toBe('3+');
            expect(result!.cursorPosition).toBe(2);
        });
    });

    describe('processDelete with frac', () => {
        it('Backspace on empty \\frac{}{} removes whole structure', () => {
            const val = '\\frac{}{}';
            const result = processDelete(val, cursorAt(7));
            expect(result.value).toBe('');
        });

        it('Backspace inside numerator with content does normal delete', () => {
            const val = '\\frac{5}{}';
            const result = processDelete(val, cursorAt(7)); // cursor after '5'
            expect(result.value).toBe('\\frac{}{}');
        });
    });

    describe('unifiedInputPipeline fraction type', () => {
        it('type "fraction" inserts \\frac{}{} and positions cursor', () => {
            const result = unifiedInputPipeline('', cursorAt(0), { type: 'fraction' });
            expect(result).not.toBeNull();
            expect(result!.value).toBe('\\frac{}{}');
            expect(result!.cursorPosition).toBe(7);
        });

        it('type "move" right at numEnd navigates to denominator', () => {
            const val = '\\frac{}{}';
            const result = unifiedInputPipeline(val, cursorAt(6), { type: 'move', direction: 'right' });
            expect(result).not.toBeNull();
            expect(result!.cursorPosition).toBe(8);
        });

        it('type "move" left at denStart navigates to numerator', () => {
            const val = '\\frac{}{}';
            const result = unifiedInputPipeline(val, cursorAt(8), { type: 'move', direction: 'left' });
            expect(result).not.toBeNull();
            expect(result!.cursorPosition).toBe(6);
        });
    });
});
