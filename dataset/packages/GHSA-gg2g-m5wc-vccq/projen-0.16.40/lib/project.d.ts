import { Component } from './component';
import { Dependencies } from './deps';
import { FileBase } from './file';
import { GitHub } from './github';
import { Gitpod } from './gitpod';
import { IgnoreFile } from './ignore-file';
import { JsonFile } from './json';
import { Logger, LoggerOptions } from './logger';
import { ObjectFile } from './object-file';
import { SampleReadmeProps } from './readme';
import { TaskOptions } from './tasks';
import { Tasks } from './tasks/tasks';
import { VsCode, DevContainer } from './vscode';
/**
 * @experimental
 */
export interface ProjectOptions {
    /**
     * (experimental) This is the name of your project.
     *
     * @default $BASEDIR
     * @experimental
     */
    readonly name: string;
    /**
     * (experimental) The parent project, if this project is part of a bigger project.
     *
     * @experimental
     */
    readonly parent?: Project;
    /**
     * (experimental) The root directory of the project.
     *
     * Relative to this directory, all files are synthesized.
     *
     * If this project has a parent, this directory is relative to the parent
     * directory and it cannot be the same as the parent or any of it's other
     * sub-projects.
     *
     * @default "."
     * @experimental
     */
    readonly outdir?: string;
    /**
     * (experimental) Add a Gitpod development environment.
     *
     * @default false
     * @experimental
     */
    readonly gitpod?: boolean;
    /**
     * (experimental) Add a VSCode development environment (used for GitHub Codespaces).
     *
     * @default false
     * @experimental
     */
    readonly devContainer?: boolean;
    /**
     * (experimental) Add a `clobber` task which resets the repo to origin.
     *
     * @default true
     * @experimental
     */
    readonly clobber?: boolean;
    /**
     * (experimental) The README setup.
     *
     * @default - { filename: 'README.md', contents: '# replace this' }
     * @experimental
     * @example
     *
     * "{ filename: 'readme.md', contents: '# title' }"
     */
    readonly readme?: SampleReadmeProps;
    /**
     * (experimental) Which type of project this is (library/app).
     *
     * @default ProjectType.UNKNOWN
     * @experimental
     */
    readonly projectType?: ProjectType;
    /**
     * (experimental) Configure logging options such as verbosity.
     *
     * @default {}
     * @experimental
     */
    readonly logging?: LoggerOptions;
    /**
     * (experimental) The JSII FQN (fully qualified name) of the project class.
     *
     * @default undefined
     * @experimental
     */
    readonly jsiiFqn?: string;
}
/**
 * (experimental) Base project.
 *
 * @experimental
 */
export declare class Project {
    /**
     * (experimental) The name of the default task (the task executed when `projen` is run without arguments).
     *
     * Normally
     * this task should synthesize the project files.
     *
     * @experimental
     */
    static readonly DEFAULT_TASK = "default";
    /**
     * (experimental) Project name.
     *
     * @experimental
     */
    readonly name: string;
    /**
     * (experimental) .gitignore.
     *
     * @experimental
     */
    readonly gitignore: IgnoreFile;
    /**
     * (experimental) A parent project.
     *
     * If undefined, this is the root project.
     *
     * @experimental
     */
    readonly parent?: Project;
    /**
     * (experimental) Absolute output directory of this project.
     *
     * @experimental
     */
    readonly outdir: string;
    /**
     * (experimental) The root project.
     *
     * @experimental
     */
    readonly root: Project;
    /**
     * (experimental) Access all github components.
     *
     * This will be `undefined` for subprojects.
     *
     * @experimental
     */
    readonly github: GitHub | undefined;
    /**
     * (experimental) Access all VSCode components.
     *
     * This will be `undefined` for subprojects.
     *
     * @experimental
     */
    readonly vscode: VsCode | undefined;
    /**
     * @experimental
     */
    readonly tasks: Tasks;
    /**
     * (experimental) Access for Gitpod.
     *
     * This will be `undefined` if gitpod boolean is false
     *
     * @experimental
     */
    readonly gitpod: Gitpod | undefined;
    /**
     * (experimental) Access for .devcontainer.json (used for GitHub Codespaces).
     *
     * This will be `undefined` if devContainer boolean is false
     *
     * @experimental
     */
    readonly devContainer: DevContainer | undefined;
    /**
     * @experimental
     */
    readonly projectType: ProjectType;
    /**
     * (experimental) Project dependencies.
     *
     * @experimental
     */
    readonly deps: Dependencies;
    /**
     * (experimental) Logging utilities.
     *
     * @experimental
     */
    readonly logger: Logger;
    /**
     * (experimental) The JSII FQN of the project type (if known).
     *
     * @experimental
     */
    readonly jsiiFqn?: string;
    private readonly _components;
    private readonly subprojects;
    private readonly tips;
    private readonly excludeFromCleanup;
    /**
     * @experimental
     */
    constructor(options: ProjectOptions);
    /**
     * (experimental) Returns all the components within this project.
     *
     * @experimental
     */
    get components(): Component[];
    /**
     * (experimental) All files in this project.
     *
     * @experimental
     */
    get files(): FileBase[];
    /**
     * (experimental) Adds a new task to this project.
     *
     * This will fail if the project already has
     * a task with this name.
     *
     * @param name The task name to add.
     * @param props Task properties.
     * @experimental
     */
    addTask(name: string, props?: TaskOptions): import("./tasks").Task;
    /**
     * (experimental) Finds a file at the specified relative path within this project and all its subprojects.
     *
     * @param filePath The file path.
     * @returns a `FileBase` or undefined if there is no file in that path
     * @experimental
     */
    tryFindFile(filePath: string): FileBase | undefined;
    /**
     * (deprecated) Finds a json file by name.
     *
     * @param filePath The file path.
     * @deprecated use `tryFindObjectFile`
     */
    tryFindJsonFile(filePath: string): JsonFile | undefined;
    /**
     * (experimental) Finds an object file (like JsonFile, YamlFile, etc.) by name.
     *
     * @param filePath The file path.
     * @experimental
     */
    tryFindObjectFile(filePath: string): ObjectFile | undefined;
    /**
     * (deprecated) Prints a "tip" message during synthesis.
     *
     * @param message The message.
     * @deprecated - use `project.logger.info(message)` to show messages during synthesis
     */
    addTip(message: string): void;
    /**
     * (experimental) Exclude the matching files from pre-synth cleanup.
     *
     * Can be used when, for example, some
     * source files include the projen marker and we don't want them to be erased during synth.
     *
     * @param globs The glob patterns to match.
     * @experimental
     */
    addExcludeFromCleanup(...globs: string[]): void;
    /**
     * (experimental) Synthesize all project files into `outdir`.
     *
     * 1. Call "this.preSynthesize()"
     * 2. Delete all generated files
     * 3. Synthesize all sub-projects
     * 4. Synthesize all components of this project
     * 5. Call "postSynthesize()" for all components of this project
     * 6. Call "this.postSynthesize()"
     *
     * @experimental
     */
    synth(): void;
    /**
     * (experimental) Called before all components are synthesized.
     *
     * @experimental
     */
    preSynthesize(): void;
    /**
     * (experimental) Called after all components are synthesized.
     *
     * Order is *not* guaranteed.
     *
     * @experimental
     */
    postSynthesize(): void;
    /**
     * Adds a component to the project.
     * @internal
     */
    _addComponent(component: Component): void;
    /**
     * Adds a sub-project to this project.
     *
     * This is automatically called when a new project is created with `parent`
     * pointing to this project, so there is no real need to call this manually.
     *
     * @param sub-project The child project to add.
     * @internal
     */
    _addSubProject(subproject: Project): void;
}
/**
 * (experimental) Which type of project this is.
 *
 * @experimental
 */
export declare enum ProjectType {
    /**
     * (experimental) This module may be a either a library or an app.
     *
     * @experimental
     */
    UNKNOWN = "unknown",
    /**
     * (experimental) This is a library, intended to be published to a package manager and consumed by other projects.
     *
     * @experimental
     */
    LIB = "lib",
    /**
     * (experimental) This is an app (service, tool, website, etc).
     *
     * Its artifacts are intended to
     * be deployed or published for end-user consumption.
     *
     * @experimental
     */
    APP = "app"
}
