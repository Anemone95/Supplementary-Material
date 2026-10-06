import { Component } from '../component';
import { Project } from '../project';
import { Task, TaskOptions } from './task';
/**
 * (experimental) Defines project tasks.
 *
 * Tasks extend the projen CLI by adding subcommands to it. Task definitions are
 * synthesized into `.projen/tasks.json`.
 *
 * @experimental
 */
export declare class Tasks extends Component {
    /**
     * (experimental) The project-relative path of the tasks manifest file.
     *
     * @experimental
     */
    static readonly MANIFEST_FILE: string;
    private readonly _tasks;
    private readonly _env;
    /**
     * @experimental
     */
    constructor(project: Project);
    /**
     * (experimental) All tasks.
     *
     * @experimental
     */
    get all(): Task[];
    /**
     * (experimental) Adds a task to a project.
     *
     * @param name The name of the task.
     * @param options Task options.
     * @experimental
     */
    addTask(name: string, options?: TaskOptions): Task;
    /**
     * (experimental) Adds global environment.
     *
     * @param name Environment variable name.
     * @param value Value.
     * @experimental
     */
    addEnvironment(name: string, value: string): void;
    /**
     * (experimental) Returns a copy of the currently global environment for this project.
     *
     * @experimental
     */
    get env(): {
        [key: string]: string;
    };
    /**
     * (experimental) Finds a task by name.
     *
     * Returns `undefined` if the task cannot be found.
     *
     * @param name The name of the task.
     * @experimental
     */
    tryFind(name: string): undefined | Task;
    private renderTasks;
}
