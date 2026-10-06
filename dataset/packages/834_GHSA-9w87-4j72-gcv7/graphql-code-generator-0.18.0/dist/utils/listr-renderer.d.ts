import { ListrTask } from 'listr';
import { DetailedError } from '../errors';
export declare class Renderer {
    private updateRenderer;
    constructor(tasks: ListrTask, options: any);
    render(): any;
    end(err: Error & {
        errors?: (Error | DetailedError)[];
    }): void;
}
