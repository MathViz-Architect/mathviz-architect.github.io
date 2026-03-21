import { describe, it, expect, vi } from 'vitest';
import {
    AddObjectCommand,
    DeleteObjectCommand,
    UpdateObjectCommand,
    MoveObjectsCommand,
    BatchCommand,
    ResizeObjectCommand,
} from './commands';
import type { AnyCanvasObject } from './types';

function createMockObject(id: string): AnyCanvasObject {
    return {
        id,
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        data: { fill: '#fff', stroke: '#000', strokeWidth: 1, cornerRadius: 0 },
    };
}

describe('Commands', () => {
    describe('AddObjectCommand', () => {
        it('should add object on execute', () => {
            const objects: AnyCanvasObject[] = [createMockObject('1')];
            const newObj = createMockObject('2');
            const setObjects = vi.fn();

            const cmd = new AddObjectCommand(objects, newObj, setObjects);
            cmd.execute();

            expect(setObjects).toHaveBeenCalledWith([objects[0], newObj]);
        });

        it('should remove object on undo', () => {
            const objects: AnyCanvasObject[] = [createMockObject('1')];
            const newObj = createMockObject('2');
            const setObjects = vi.fn();

            const cmd = new AddObjectCommand(objects, newObj, setObjects);
            cmd.undo();

            expect(setObjects).toHaveBeenCalledWith([objects[0]]);
        });

        it('should have description', () => {
            const cmd = new AddObjectCommand([], createMockObject('1'), vi.fn());
            expect(cmd.description).toBe('Добавить объект');
        });
    });

    describe('DeleteObjectCommand', () => {
        it('should remove object on execute', () => {
            const objects: AnyCanvasObject[] = [createMockObject('1'), createMockObject('2')];
            const setObjects = vi.fn();

            const cmd = new DeleteObjectCommand(objects, '1', setObjects);
            cmd.execute();

            expect(setObjects).toHaveBeenCalledWith([objects[1]]);
        });

        it('should restore object on undo', () => {
            const objects: AnyCanvasObject[] = [createMockObject('1'), createMockObject('2')];
            const setObjects = vi.fn();

            const cmd = new DeleteObjectCommand(objects, '1', setObjects);
            cmd.undo();

            expect(setObjects).toHaveBeenCalledWith(objects);
        });

        it('should have description', () => {
            const cmd = new DeleteObjectCommand([createMockObject('1')], '1', vi.fn());
            expect(cmd.description).toBe('Удалить объект');
        });
    });

    describe('UpdateObjectCommand', () => {
        it('should update object on execute', () => {
            const objects: AnyCanvasObject[] = [createMockObject('1'), createMockObject('2')];
            const setObjects = vi.fn();

            const cmd = new UpdateObjectCommand(objects, '1', { x: 100 }, setObjects);
            cmd.execute();

            const calledObjects: AnyCanvasObject[] = setObjects.mock.calls[0][0];
            expect(calledObjects.find(o => o.id === '1')?.x).toBe(100);
        });

        it('should restore previous state on undo', () => {
            const objects: AnyCanvasObject[] = [createMockObject('1')];
            const setObjects = vi.fn();

            const cmd = new UpdateObjectCommand(objects, '1', { x: 100 }, setObjects);
            cmd.execute();
            cmd.undo();

            const calledObjects: AnyCanvasObject[] = setObjects.mock.calls[1][0];
            expect(calledObjects.find(o => o.id === '1')?.x).toBe(0);
        });
    });

    describe('MoveObjectsCommand', () => {
        it('should set next objects on execute', () => {
            const prev: AnyCanvasObject[] = [createMockObject('1')];
            const next: AnyCanvasObject[] = [createMockObject('1'), createMockObject('2')];
            const setObjects = vi.fn();

            const cmd = new MoveObjectsCommand(prev, next, setObjects);
            cmd.execute();

            expect(setObjects).toHaveBeenCalledWith(next);
        });

        it('should restore previous objects on undo', () => {
            const prev: AnyCanvasObject[] = [createMockObject('1')];
            const next: AnyCanvasObject[] = [createMockObject('1'), createMockObject('2')];
            const setObjects = vi.fn();

            const cmd = new MoveObjectsCommand(prev, next, setObjects);
            cmd.undo();

            expect(setObjects).toHaveBeenCalledWith(prev);
        });
    });

    describe('BatchCommand', () => {
        it('should execute all commands', () => {
            const setObjects = vi.fn();
            const cmd1 = new AddObjectCommand([], createMockObject('1'), setObjects);
            const cmd2 = new AddObjectCommand([], createMockObject('2'), setObjects);

            const batch = new BatchCommand([cmd1, cmd2], 'Add 2 objects');
            batch.execute();

            expect(setObjects).toHaveBeenCalledTimes(2);
        });

        it('should undo all commands in reverse order', () => {
            const setObjects = vi.fn();
            const cmd1 = new AddObjectCommand([], createMockObject('1'), setObjects);
            const cmd2 = new AddObjectCommand([], createMockObject('2'), setObjects);

            const batch = new BatchCommand([cmd1, cmd2], 'Add 2 objects');
            batch.undo();

            expect(setObjects).toHaveBeenCalledTimes(2);
        });

        it('should have custom description', () => {
            const batch = new BatchCommand([], 'Custom description');
            expect(batch.description).toBe('Custom description');
        });
    });

    describe('ResizeObjectCommand', () => {
        it('should apply new bounds on execute', () => {
            const objects: AnyCanvasObject[] = [createMockObject('1')];
            const setObjects = vi.fn();

            const cmd = new ResizeObjectCommand(objects, '1', { x: 10, y: 20, width: 100, height: 200 }, setObjects);
            cmd.execute();

            const calledObjects: AnyCanvasObject[] = setObjects.mock.calls[0][0];
            expect(calledObjects[0]).toEqual({ ...createMockObject('1'), x: 10, y: 20, width: 100, height: 200 });
        });

        it('should restore previous bounds on undo', () => {
            const objects: AnyCanvasObject[] = [createMockObject('1')];
            const setObjects = vi.fn();

            const cmd = new ResizeObjectCommand(objects, '1', { x: 10, y: 20, width: 100, height: 200 }, setObjects);
            cmd.execute();
            cmd.undo();

            const calledObjects: AnyCanvasObject[] = setObjects.mock.calls[1][0];
            expect(calledObjects[0]).toEqual(createMockObject('1'));
        });
    });
});
