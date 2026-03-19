import { describe, it, expect } from 'vitest';
import {
  normalizeMathExpression,
  getCleanExpression,
  getCursorState,
  processDigitInput,
  processOperatorInput,
  processPiInput,
  processFunctionInput,
  processDelete,
  unifiedInputPipeline,
  processPhysicalKey,
  isCursorInsideKeyword,
  moveCursorToKeywordBoundary,
  KEYWORDS,
} from './hooks/useMathInputLogic';

describe('MathInput Logic Tests', () => {
  const cursorAt = (pos: number) => ({ selectionStart: pos, selectionEnd: pos, hasSelection: false });
  const selection = (start: number, end: number) => ({ selectionStart: start, selectionEnd: end, hasSelection: true });

  describe('1. Cursor Logic - Вставка', () => {
    it('Строка 123, курсор между 1 и 2 (pos=1), нажать + -> 1+23, курсор после +', () => {
      const val = '123';
      const cur = cursorAt(1);
      const result = processOperatorInput(val, cur, '+');
      expect(result.value).toBe('1+23');
      expect(result.cursorPosition).toBe(2);
    });

    it('Выделить 23 в строке 1+23 (sel 2-4), нажать sqrt -> 1+sqrt(23)', () => {
      const val = '1+23';
      const cur = selection(2, 4);
      const result = processFunctionInput(val, cur, 'sqrt()');
      expect(result.value).toBe('1+sqrt(23)');
      expect(result.cursorPosition).toBe(7);
    });
  });

  describe('2. Swap Logic - Замена операторов', () => {
    it('5/, нажать * -> 5*', () => {
      const val = '5/';
      const cur = cursorAt(2);
      const result = processOperatorInput(val, cur, '*');
      expect(result.value).toBe('5*');
    });

    it('5+, нажать - -> 5-', () => {
      const val = '5+';
      const cur = cursorAt(2);
      const result = processOperatorInput(val, cur, '-');
      expect(result.value).toBe('5-');
    });

    it('Ввести - в пустую строку -> -', () => {
      const val = '';
      const cur = cursorAt(0);
      const result = processOperatorInput(val, cur, '-');
      expect(result.value).toBe('-');
      expect(result.cursorPosition).toBe(1);
    });

    it('Ввести * в пустую строку -> пусто', () => {
      const val = '';
      const cur = cursorAt(0);
      const result = processOperatorInput(val, cur, '*');
      expect(result.value).toBe('');
    });
  });

  describe('3. Умный знаменатель и константы', () => {
    it('6/9pi -> \\frac{6}{9\\pi}', () => {
      const result = normalizeMathExpression('6/9pi');
      expect(result).toBe('\\frac{6}{9\\pi}');
    });

    it('1/x+y -> \\frac{1}{x} + y (не должен затягивать +y в знаменатель)', () => {
      const result = normalizeMathExpression('1/x+y');
      expect(result).toBe('\\frac{1}{x}+y');
    });
  });

  describe('4. Физическая клавиатура', () => {
    it('Нажатие p -> pi', () => {
      const action = processPhysicalKey('p');
      expect(action).toEqual({ type: 'pi' });
    });

    it('Нажатие P -> pi', () => {
      const action = processPhysicalKey('P');
      expect(action).toEqual({ type: 'pi' });
    });

    it('Нажатие / после * -> замена (проверка через processOperatorInput)', () => {
      const val = '5*';
      const cur = cursorAt(2);
      const result = processOperatorInput(val, cur, '/');
      expect(result.value).toBe('5/');
    });

    it('Нажатие * после / -> замена', () => {
      const val = '5/';
      const cur = cursorAt(2);
      const result = processOperatorInput(val, cur, '*');
      expect(result.value).toBe('5*');
    });
  });

  describe('5. Визуальные плейсхолдеры', () => {
    it('sqrt() -> \\sqrt{\\square}', () => {
      const result = normalizeMathExpression('sqrt()');
      expect(result).toBe('\\sqrt{\\square}');
    });

    it('sqrt(16) -> \\sqrt{16}', () => {
      const result = normalizeMathExpression('sqrt(16)');
      expect(result).toBe('\\sqrt{16}');
    });
  });

  describe('6. Guardrails - Ограничения', () => {
    it('1.2.3 -> 1.23 (вторая точка игнорируется)', () => {
      const val = '1.2';
      const cur = cursorAt(3);
      const result = processDigitInput(val, cur, '.');
      expect(result).toBeNull();
    });

    it('Начать с * -> пустая строка', () => {
      const val = '';
      const cur = cursorAt(0);
      const result = processOperatorInput(val, cur, '*');
      expect(result.value).toBe('');
    });

    it('Начать с / -> пустая строка', () => {
      const val = '';
      const cur = cursorAt(0);
      const result = processOperatorInput(val, cur, '/');
      expect(result.value).toBe('');
    });

    it('-- в пустой строке -> - (второй минус заменяет первый)', () => {
      const val = '-';
      const cur = cursorAt(1);
      const result = processOperatorInput(val, cur, '-');
      expect(result.value).toBe('-');
      expect(result.cursorPosition).toBe(1);
    });
  });

  describe('7. Глубокая вложенность (Deep Nesting)', () => {
    it('sqrt(4) -> \\sqrt{4}', () => {
      const result = normalizeMathExpression('sqrt(4)');
      expect(result).toBe('\\sqrt{4}');
    });

    it('sqrt(1/pi) -> \\sqrt{\\frac{1}{\\pi}}', () => {
      const result = normalizeMathExpression('sqrt(1/pi)');
      expect(result).toContain('\\sqrt');
      expect(result).toContain('\\frac');
    });

    it('Курсор не съезжает при вводе sqrt() после цифры', () => {
      const val = '5';
      const cur = cursorAt(1);
      const result = processFunctionInput(val, cur, 'sqrt()');
      expect(result.value).toBe('5sqrt()');
      expect(result.cursorPosition).toBe(6);
    });
  });

  describe('8. MathJS Compatibility', () => {
    it('getCleanExpression: 6/9pi -> 6/(9*pi) или 6/(9pi)', () => {
      const result = getCleanExpression('6/9pi');
      expect(result).toMatch(/6\/\(9\*?pi\)/);
    });

    it('getCleanExpression: 1/x+y -> 1/x+y', () => {
      const result = getCleanExpression('1/x+y');
      expect(result).toBe('1/x+y');
    });

    it('getCleanExpression: sqrt(4) -> sqrt(4)', () => {
      const result = getCleanExpression('sqrt(4)');
      expect(result).toBe('sqrt(4)');
    });

    it('getCleanExpression: 2^3 -> 2^3', () => {
      const result = getCleanExpression('2^3');
      expect(result).toBe('2^3');
    });
  });

  describe('9. Token Protection (Атомарные сущности)', () => {
    it('KEYWORDS содержит sqrt и pi', () => {
      expect(KEYWORDS).toContain('sqrt');
      expect(KEYWORDS).toContain('pi');
    });

    it('isCursorInsideKeyword: курсор внутри sqrt -> true', () => {
      expect(isCursorInsideKeyword('sqrt()', 2)).toBe(true);
      expect(isCursorInsideKeyword('sqrt()', 0)).toBe(true);
      expect(isCursorInsideKeyword('sqrt()', 3)).toBe(true);
    });

    it('isCursorInsideKeyword: курсор вне sqrt -> false', () => {
      expect(isCursorInsideKeyword('sqrt()', 5)).toBe(false);
      expect(isCursorInsideKeyword('sqrt()', 6)).toBe(false);
      expect(isCursorInsideKeyword('abc', 0)).toBe(false);
    });

    it('moveCursorToKeywordBoundary: сдвиг к концу слова и скобки', () => {
      expect(moveCursorToKeywordBoundary('sqrt()', 2)).toBe(5);
      expect(moveCursorToKeywordBoundary('sqrt()', 0)).toBe(5);
    });

    it('Вставка цифры внутри sqrt -> вставляется в скобки', () => {
      const val = 'sqrt()';
      const cur = cursorAt(2);
      const result = processDigitInput(val, cur, '5');
      expect(result.value).toBe('sqrt(5)');
    });

    it('Вставка оператора внутри sqrt -> вставляется в скобки', () => {
      const val = 'sqrt()';
      const cur = cursorAt(2);
      const result = processOperatorInput(val, cur, '+');
      expect(result.value).toBe('sqrt(+)');
    });
  });

  describe('10. Smart Backspace (Умное удаление)', () => {
    it('Backspace после sqrt() -> удаляет всю функцию', () => {
      const val = '5sqrt()';
      const cur = cursorAt(6);
      const result = processDelete(val, cur);
      expect(result.value).toBe('5');
      expect(result.cursorPosition).toBe(1);
    });

    it('Backspace в начале слова -> обычное удаление', () => {
      const val = 'sqrt()';
      const cur = cursorAt(1);
      const result = processDelete(val, cur);
      expect(result.value).toBe('qrt()');
      expect(result.cursorPosition).toBe(0);
    });
  });

  describe('11. Рекурсивная нормализация (Матрешки)', () => {
    it('sqrt(sqrt(16)) -> \\sqrt{\\sqrt{16}}', () => {
      const result = normalizeMathExpression('sqrt(sqrt(16))');
      expect(result).toContain('\\sqrt');
      expect(result).toContain('\\sqrt{16}');
    });

    it('sqrt(sqrt(sqrt(4))) -> тройной вложенный корень', () => {
      const result = normalizeMathExpression('sqrt(sqrt(sqrt(4)))');
      expect(result).toMatch(/\\sqrt\{.*\\sqrt\{.*\\sqrt\{4\}\}\}/);
    });
  });

  describe('12. Вложенные степени', () => {
    it('2^3 -> 2^{3}', () => {
      const result = normalizeMathExpression('2^3');
      expect(result).toBe('2^{3}');
    });
  });
});
