/**
 * (experimental) Schema for `tasks.json`.
 *
 * @experimental
 */
export interface TasksManifest {
    /**
     * (experimental) All tasks available for this project.
     *
     * @experimental
     */
    readonly tasks?: {
        [name: string]: TaskSpec;
    };
    /**
     * (experimental) Environment for all tasks.
     *
     * @experimental
     */
    readonly env?: {
        [name: string]: string;
    };
}
/**
 * @experimental
 */
export interface TaskCommonOptions {
    /**
     * (experimental) The description of this build command.
     *
     * @default - the task name
     * @experimental
     */
    readonly description?: string;
    /**
     * (experimental) Category for start menu.
     *
     * @default TaskCategory.MISC
     * @experimental
     */
    readonly category?: TaskCategory;
    /**
     * (experimental) Defines environment variables for the execution of this task.
     *
     * Values in this map will be evaluated in a shell, so you can do stuff like `$(echo "foo")`.
     *
     * @default {}
     * @experimental
     */
    readonly env?: {
        [name: string]: string;
    };
    /**
     * (experimental) A shell command which determines if the this task should be executed.
     *
     * If
     * the program exits with a zero exit code, steps will be executed. A non-zero
     * code means that task will be skipped.
     *
     * @experimental
     */
    readonly condition?: string;
    /**
     * (experimental) The working directory for all steps in this task (unless overridden by the step).
     *
     * @default - process.cwd()
     * @experimental
     */
    readonly cwd?: string;
}
/**
 * @experimental
 */
export declare enum TaskCategory {
    /**
     * @experimental
     */
    BUILD = "00.build",
    /**
     * @experimental
     */
    TEST = "10.test",
    /**
     * @experimental
     */
    RELEASE = "20.release",
    /**
     * @experimental
     */
    MAINTAIN = "30.maintain",
    /**
     * @experimental
     */
    MISC = "99.misc"
}
/**
 * (experimental) Specification of a single task.
 *
 * @experimental
 */
export interface TaskSpec extends TaskCommonOptions {
    /**
     * (experimental) Task name.
     *
     * @experimental
     */
    readonly name: string;
    /**
     * (experimental) Task steps.
     *
     * @experimental
     */
    readonly steps?: TaskStep[];
}
/**
 * (experimental) Options for task steps.
 *
 * @experimental
 */
export interface TaskStepOptions {
    /**
     * (experimental) Step name.
     *
     * @default - no name
     * @experimental
     */
    readonly name?: string;
    /**
     * (experimental) The working directory for this step.
     *
     * @default - determined by the task
     * @experimental
     */
    readonly cwd?: string;
}
/**
 * (experimental) A single step within a task.
 *
 * The step could either be  the execution of a
 * shell command or execution of a sub-task, by name.
 *
 * @experimental
 */
export interface TaskStep extends TaskStepOptions {
    /**
     * (experimental) Shell command to execute.
     *
     * @default - don't execute a shell command
     * @experimental
     */
    readonly exec?: string;
    /**
     * (experimental) Subtask to execute.
     *
     * @default - don't spawn a subtask
     * @experimental
     */
    readonly spawn?: string;
    /**
     * (experimental) Print a message.
     *
     * @default - don't say anything
     * @experimental
     */
    readonly say?: string;
}
