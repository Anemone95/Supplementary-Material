import { TaskCategory, TaskCommonOptions, TaskSpec, TaskStep, TaskStepOptions } from './model';
import { Tasks } from './tasks';
/**
 * @experimental
 */
export interface TaskOptions extends TaskCommonOptions {
    /**
     * (experimental) Shell command to execute as the first command of the task.
     *
     * @default - add steps using `task.exec(command)` or `task.spawn(subtask)`
     * @experimental
     */
    readonly exec?: string;
}
/**
 * (experimental) A task that can be performed on the project.
 *
 * Modeled as a series of shell
 * commands and subtasks.
 *
 * @experimental
 */
export declare class Task {
    /**
     * (experimental) Task name.
     *
     * @experimental
     */
    readonly name: string;
    /**
     * (experimental) The description of the task.
     *
     * @experimental
     */
    readonly description?: string;
    /**
     * (experimental) The start menu category of the task.
     *
     * @experimental
     */
    readonly category?: TaskCategory;
    /**
     * (experimental) A command to execute which determines if the task should be skipped.
     *
     * If it
     * returns a zero exit code, the task will not be executed.
     *
     * @experimental
     */
    readonly condition?: string;
    private readonly _steps;
    private readonly _env;
    private readonly cwd?;
    private readonly tasks;
    /**
     * @experimental
     */
    constructor(tasks: Tasks, name: string, props?: TaskOptions);
    /**
     * (experimental) Reset the task so it no longer has any commands.
     *
     * @param command the first command to add to the task after it was cleared.
     * @experimental
     */
    reset(command?: string): void;
    /**
     * (experimental) Executes a shell command.
     *
     * @param command Shell command.
     * @param options Options.
     * @experimental
     */
    exec(command: string, options?: TaskStepOptions): void;
    /**
     * (experimental) Say something.
     *
     * @param message Your message.
     * @param options Options.
     * @experimental
     */
    say(message: string, options?: TaskStepOptions): void;
    /**
     * (deprecated) Adds a command at the beginning of the task.
     *
     * @param shell The command to add.
     * @deprecated use `prependExec()`
     */
    prepend(shell: string, options?: TaskStepOptions): void;
    /**
     * (experimental) Spawns a sub-task.
     *
     * @param subtask The subtask to execute.
     * @experimental
     */
    spawn(subtask: Task, options?: TaskStepOptions): void;
    /**
     * (experimental) Adds a command at the beginning of the task.
     *
     * @param shell The command to add.
     * @experimental
     */
    prependExec(shell: string, options?: TaskStepOptions): void;
    /**
     * (experimental) Adds a spawn instruction at the beginning of the task.
     *
     * @param subtask The subtask to execute.
     * @experimental
     */
    prependSpawn(subtask: Task, options?: TaskStepOptions): void;
    /**
     * (experimental) Says something at the beginning of the task.
     *
     * @param message Your message.
     * @experimental
     */
    prependSay(message: string, options?: TaskStepOptions): void;
    /**
     * (experimental) Adds an environment variable to this task.
     *
     * @param name The name of the variable.
     * @param value The value.
     * @experimental
     */
    env(name: string, value: string): void;
    /**
     * (experimental) Returns an immutable copy of all the step specifications of the task.
     *
     * @experimental
     */
    get steps(): TaskStep[];
    /**
     * (experimental) Renders this task as a single shell command.
     *
     * @experimental
     */
    toShellCommand(): string;
    /**
     * Renders a task spec into the manifest.
     *
     * @internal
     */
    _renderSpec(): TaskSpec;
}
