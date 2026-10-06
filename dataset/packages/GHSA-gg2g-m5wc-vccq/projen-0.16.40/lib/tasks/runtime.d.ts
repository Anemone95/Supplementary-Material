import { TasksManifest, TaskSpec } from './model';
/**
 * (experimental) The runtime component of the tasks engine.
 *
 * @experimental
 */
export declare class TaskRuntime {
    /**
     * (experimental) The contents of tasks.json.
     *
     * @experimental
     */
    readonly manifest: TasksManifest;
    /**
     * (experimental) The root directory of the project and the cwd for executing tasks.
     *
     * @experimental
     */
    readonly workdir: string;
    /**
     * @experimental
     */
    constructor(workdir: string);
    /**
     * (experimental) The tasks in this project.
     *
     * @experimental
     */
    get tasks(): TaskSpec[];
    /**
     * (experimental) Find a task by name, or `undefined` if not found.
     *
     * @experimental
     */
    tryFindTask(name: string): TaskSpec | undefined;
    /**
     * (experimental) Runs the task.
     *
     * @param name The task name.
     * @experimental
     */
    runTask(name: string, parents?: string[]): void;
}
