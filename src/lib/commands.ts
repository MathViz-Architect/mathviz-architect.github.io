import { AnyCanvasObject } from './types';

export interface Command {
    execute(): void;
    undo(): void;
    description: string;
}

export class AddObjectCommand implements Command {
    description = 'Добавить объект';

    constructor(
        private objects: AnyCanvasObject[],
        private object: AnyCanvasObject,
        private setObjects: (objects: AnyCanvasObject[]) => void
    ) { }

    execute() {
        this.setObjects([...this.objects, this.object]);
    }

    undo() {
        this.setObjects(this.objects.filter(o => o.id !== this.object.id));
    }
}

export class DeleteObjectCommand implements Command {
    description = 'Удалить объект';
    private deletedObject: AnyCanvasObject;

    constructor(
        private objects: AnyCanvasObject[],
        private objectId: string,
        private setObjects: (objects: AnyCanvasObject[]) => void
    ) {
        this.deletedObject = objects.find(o => o.id === objectId)!;
    }

    execute() {
        this.setObjects(this.objects.filter(o => o.id !== this.objectId));
    }

    undo() {
        this.setObjects([...this.objects, this.deletedObject]);
    }
}

export class UpdateObjectCommand implements Command {
    description = 'Изменить объект';
    private previousState: AnyCanvasObject;

    constructor(
        private objects: AnyCanvasObject[],
        private id: string,
        private updates: Partial<AnyCanvasObject>,
        private setObjects: (objects: AnyCanvasObject[]) => void
    ) {
        this.previousState = { ...objects.find(o => o.id === id)! };
    }

    execute() {
        this.setObjects(
            this.objects.map(o => o.id === this.id ? { ...o, ...this.updates } : o)
        );
    }

    undo() {
        this.setObjects(
            this.objects.map(o => o.id === this.id ? this.previousState : o)
        );
    }
}

export class MoveObjectsCommand implements Command {
    description = 'Переместить объекты';

    constructor(
        private previousObjects: AnyCanvasObject[],
        private nextObjects: AnyCanvasObject[],
        private setObjects: (objects: AnyCanvasObject[]) => void
    ) { }

    execute() {
        this.setObjects(this.nextObjects);
    }

    undo() {
        this.setObjects(this.previousObjects);
    }
}

export class BatchCommand implements Command {
    description: string;

    constructor(private commands: Command[], description: string) {
        this.description = description;
    }

    execute() {
        this.commands.forEach(c => c.execute());
    }

    undo() {
        [...this.commands].reverse().forEach(c => c.undo());
    }
}

export class ResizeObjectCommand implements Command {
    description = 'Изменить размер объекта';
    private previousState: { x: number; y: number; width: number; height: number };
    private nextState: { x: number; y: number; width: number; height: number };
    private setObjects: (objects: AnyCanvasObject[]) => void;

    constructor(
        private objects: AnyCanvasObject[],
        private id: string,
        newBounds: { x: number; y: number; width: number; height: number },
        setObjects: (objects: AnyCanvasObject[]) => void
    ) {
        const obj = objects.find(o => o.id === id)!;
        this.previousState = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
        this.nextState = newBounds;
        this.setObjects = setObjects;
    }

    execute() {
        this.applyState(this.nextState);
    }

    undo() {
        this.applyState(this.previousState);
    }

    private applyState(bounds: { x: number; y: number; width: number; height: number }) {
        this.setObjects(
            this.objects.map(o => o.id === this.id 
                ? { ...o, ...bounds } 
                : o
            )
        );
    }
}
