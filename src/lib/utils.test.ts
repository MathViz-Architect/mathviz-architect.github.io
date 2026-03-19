import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('Utils', () => {
    describe('cn', () => {
        it('should join class names', () => {
            expect(cn('foo', 'bar')).toBe('foo bar');
        });

        it('should filter out falsy values', () => {
            expect(cn('foo', false, 'bar', null, 'baz', undefined, 0)).toBe('foo bar baz');
        });

        it('should handle arrays', () => {
            expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
        });

        it('should handle objects', () => {
            expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
        });

        it('should handle mixed inputs', () => {
            expect(cn('foo', { bar: true, qux: false }, ['a', 'b'])).toBe('foo bar a b');
        });
    });
});
