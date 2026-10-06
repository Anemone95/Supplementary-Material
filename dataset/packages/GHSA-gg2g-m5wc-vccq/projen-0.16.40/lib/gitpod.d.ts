import { Component } from './component';
import { IDevEnvironment, DevEnvironmentOptions, DevEnvironmentDockerImage } from './dev-env';
import { Project } from './project';
import { Task } from './tasks';
/**
 * (experimental) Configure how the terminal should be opened relative to the previous task.
 *
 * @experimental
 */
export declare enum GitpodOpenMode {
    /**
     * (experimental) Opens in the same tab group right after the previous tab.
     *
     * @experimental
     */
    TAB_AFTER = "tab-after",
    /**
     * (experimental) Opens in the same tab group left before the previous tab.
     *
     * @experimental
     */
    TAB_BEFORE = "tab-before",
    /**
     * (experimental) Splits and adds the terminal to the right.
     *
     * @experimental
     */
    SPLIT_RIGHT = "split-right",
    /**
     * (experimental) Splits and adds the terminal to the left.
     *
     * @experimental
     */
    SPLIT_LEFT = "split-left",
    /**
     * (experimental) Splits and adds the terminal to the top.
     *
     * @experimental
     */
    SPLIT_TOP = "split-top",
    /**
     * (experimental) Splits and adds the terminal to the bottom.
     *
     * @experimental
     */
    SPLIT_BOTTOM = "split-bottom"
}
/**
 * (experimental) Configure where in the IDE the terminal should be opened.
 *
 * @experimental
 */
export declare enum GitpodOpenIn {
    /**
     * (experimental) the bottom panel (default).
     *
     * @experimental
     */
    BOTTOM = "bottom",
    /**
     * (experimental) the left panel.
     *
     * @experimental
     */
    LEFT = "left",
    /**
     * (experimental) the right panel.
     *
     * @experimental
     */
    RIGHT = "right",
    /**
     * (experimental) the main editor area.
     *
     * @experimental
     */
    MAIN = "main"
}
/**
 * (experimental) Configure options for a task to be run when opening a Gitpod workspace (e.g. running tests, or starting a dev server).
 *
 * Start Mode         | Execution
 * Fresh Workspace    | before && init && command
 * Restart Workspace  | before && command
 * Snapshot           | before && command
 * Prebuild           | before && init && prebuild
 *
 * @experimental
 */
export interface GitpodTask {
    /**
     * (experimental) Required.
     *
     * The shell command to run
     *
     * @experimental
     */
    readonly command: string;
    /**
     * (experimental) A name for this task.
     *
     * @default - task names are omitted when blank
     * @experimental
     */
    readonly name?: string;
    /**
     * (experimental) You can configure how the terminal should be opened relative to the previous task.
     *
     * @default GitpodOpenMode.TAB_AFTER
     * @experimental
     */
    readonly openMode?: GitpodOpenMode;
    /**
     * (experimental) You can configure where in the IDE the terminal should be opened.
     *
     * @default GitpodOpenIn.BOTTOM
     * @experimental
     */
    readonly openIn?: GitpodOpenIn;
    /**
     * (experimental) In case you need to run something even before init, that is a requirement for both init and command, you can use the before property.
     *
     * @default
     * @experimental
     */
    readonly before?: string;
    /**
     * (experimental) The init property can be used to specify shell commands that should only be executed after a workspace was freshly cloned and needs to be initialized somehow.
     *
     * Such tasks are usually builds or downloading
     * dependencies. Anything you only want to do once but not when you restart a workspace or start a snapshot.
     *
     * @default
     * @experimental
     */
    readonly init?: string;
    /**
     * (experimental) The optional prebuild command will be executed during prebuilds.
     *
     * It is meant to run additional long running
     * processes that could be useful, e.g. running test suites.
     *
     * @default
     * @experimental
     */
    readonly prebuild?: string;
}
/**
 * (experimental) What to do when a service on a port is detected.
 *
 * @experimental
 */
export declare enum GitpodOnOpen {
    /**
     * (experimental) Open a new browser tab.
     *
     * @experimental
     */
    OPEN_BROWSER = "open-browser",
    /**
     * (experimental) Open a preview on the right side of the IDE.
     *
     * @experimental
     */
    OPEN_PREVIEW = "open-preview",
    /**
     * (experimental) Show a notification asking the user what to do (default).
     *
     * @experimental
     */
    NOTIFY = "notify",
    /**
     * (experimental) Do nothing.
     *
     * @experimental
     */
    IGNORE = "ignore"
}
/**
 * (experimental) Whether the port visibility should be private or public.
 *
 * @experimental
 */
export declare enum GitpodPortVisibility {
    /**
     * (experimental) Allows everyone with the port URL to access the port (default).
     *
     * @experimental
     */
    PUBLIC = "public",
    /**
     * (experimental) Only allows users with workspace access to access the port.
     *
     * @experimental
     */
    PRIVATE = "private"
}
/**
 * (experimental) Options for an exposed port on Gitpod.
 *
 * @experimental
 */
export interface GitpodPort {
    /**
     * (experimental) A port that should be exposed (forwarded) from the container.
     *
     * @experimental
     * @example
     *
     * "8080"
     */
    readonly port?: string;
    /**
     * (experimental) What to do when a service on a port is detected.
     *
     * @default GitpodOnOpen.NOTIFY
     * @experimental
     */
    readonly onOpen?: GitpodOnOpen;
    /**
     * (experimental) Whether the port visibility should be private or public.
     *
     * @default GitpodPortVisibility.PUBLIC
     * @experimental
     */
    readonly visibility?: GitpodPortVisibility;
}
/**
 * (experimental) Configure the Gitpod App for prebuilds.
 *
 * Currently only GitHub is supported.
 *
 * @see https://www.gitpod.io/docs/prebuilds/
 * @experimental
 */
export interface GitpodPrebuilds {
    /**
     * (experimental) Enable for the master/default branch.
     *
     * @default true
     * @experimental
     */
    readonly master?: boolean;
    /**
     * (experimental) Enable for all branches in this repo.
     *
     * @default false
     * @experimental
     */
    readonly branches?: boolean;
    /**
     * (experimental) Enable for pull requests coming from this repo.
     *
     * @default true
     * @experimental
     */
    readonly pullRequests?: boolean;
    /**
     * (experimental) Enable for pull requests coming from forks.
     *
     * @default false
     * @experimental
     */
    readonly pullRequestsFromForks?: boolean;
    /**
     * (experimental) Add a check to pull requests.
     *
     * @default true
     * @experimental
     */
    readonly addCheck?: boolean;
    /**
     * (experimental) Add a "Review in Gitpod" button as a comment to pull requests.
     *
     * @default false
     * @experimental
     */
    readonly addComment?: boolean;
    /**
     * (experimental) Add a "Review in Gitpod" button to the pull request's description.
     *
     * @default false
     * @experimental
     */
    readonly addBadge?: boolean;
    /**
     * (experimental) Add a label once the prebuild is ready to pull requests.
     *
     * @default false
     * @experimental
     */
    readonly addLabel?: boolean;
}
/**
 * (experimental) Constructor options for the Gitpod component.
 *
 * By default, Gitpod uses the 'gitpod/workspace-full' docker image.
 *
 * @see https://github.com/gitpod-io/workspace-images/blob/master/full/Dockerfile
 *
 * By default, all tasks will be run in parallel. To run the tasks in sequence,
 * create a new task and specify the other tasks as subtasks.
 * @experimental
 */
export interface GitpodOptions extends DevEnvironmentOptions {
    /**
     * (experimental) Optional Gitpod's Github App integration for prebuilds If this is not set and Gitpod's Github App is installed, then Gitpod will apply these defaults: https://www.gitpod.io/docs/prebuilds/#configure-the-github-app.
     *
     * @default undefined
     * @experimental
     */
    readonly prebuilds?: GitpodPrebuilds;
}
/**
 * (experimental) The Gitpod component which emits .gitpod.yml.
 *
 * @experimental
 */
export declare class Gitpod extends Component implements IDevEnvironment {
    private dockerImage;
    private prebuilds;
    private readonly tasks;
    private readonly ports;
    private readonly vscodeExtensions;
    /**
     * (experimental) Direct access to the gitpod configuration (escape hatch).
     *
     * @experimental
     */
    readonly config: any;
    /**
     * @experimental
     */
    constructor(project: Project, options?: GitpodOptions);
    /**
     * (experimental) Add a custom Docker image or Dockerfile for the container.
     *
     * @param image The Docker image.
     * @experimental
     */
    addDockerImage(image: DevEnvironmentDockerImage): void;
    /**
     * (experimental) Add tasks to run when gitpod starts.
     *
     * By default, all tasks will be run in parallel. To run tasks in sequence,
     * create a new `Task` and specify the other tasks as subtasks.
     *
     * @param tasks The new tasks.
     * @experimental
     */
    addTasks(...tasks: Task[]): void;
    /**
     * (experimental) Add a prebuilds configuration for the Gitpod App.
     *
     * @param config The configuration.
     * @experimental
     */
    addPrebuilds(config: GitpodPrebuilds): void;
    /**
     * (experimental) Add a task with more granular options.
     *
     * By default, all tasks will be run in parallel. To run tasks in sequence,
     * create a new `Task` and set the other tasks as subtasks.
     *
     * @param options The task parameters.
     * @experimental
     */
    addCustomTask(options: GitpodTask): void;
    /**
     * (experimental) Add ports that should be exposed (forwarded) from the container.
     *
     * @param ports The new ports.
     * @experimental
     */
    addPorts(...ports: string[]): void;
    /**
     * (experimental) Add a list of VSCode extensions that should be automatically installed in the container.
     *
     * These must be in the format defined in the Open VSX registry.
     *
     * @param extensions The extension IDs.
     * @see https://www.gitpod.io/docs/vscode-extensions/
     * @experimental
     * @example
     *
     * 'scala-lang.scala@0.3.9:O5XmjwY5Gz+0oDZAmqneJw=='
     */
    addVscodeExtensions(...extensions: GitpodCodeExtensionId[]): void;
    private renderDockerImage;
    private renderPrebuilds;
}
/**
 * VS Code extensions as defined in the Open VSX registry
 * Example: `scala-lang.scala@0.3.9:O5XmjwY5Gz+0oDZAmqneJw==`
 */
declare type GitpodCodeExtensionId = string;
export {};
