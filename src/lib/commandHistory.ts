import { Command } from './commands';

export class CommandHistory {
    private past: Command[] = [];
    private future: Command[] = [];
    private readonly maxSize = 50;

    execute(command: Command) {
        command.execute();
        this.past.push(command);
        if (this.past.length > this.maxSize) this.past.shift();
        this.future = []; // clear redo stack
    }

    undo(): boolean {
        const command = this.past.pop();
        if (!command) return false;
        command.undo();
        this.future.unshift(command);
        return true;
    }

    redo(): boolean {
        const command = this.future.shift();
        if (!command) return false;
        command.execute();
        this.past.push(command);
        return true;
    }

    canUndo() {
        return this.past.length > 0;
    }

    canRedo() {
        return this.future.length > 0;
    }

    clear() {
        this.past = [];
        this.future = [];
    }
}
