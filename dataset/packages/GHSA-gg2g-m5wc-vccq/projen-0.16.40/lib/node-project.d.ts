import { GithubWorkflow } from './github';
import { AutoMerge } from './github/auto-merge';
import { DependabotOptions } from './github/dependabot';
import { MergifyOptions } from './github/mergify';
import { IgnoreFile } from './ignore-file';
import { Jest, JestOptions } from './jest';
import { NodePackage, NpmTaskExecution, NodePackageManager, NodePackageOptions } from './node-package';
import { Project, ProjectOptions } from './project';
import { Publisher } from './publisher';
import { Semver } from './semver';
import { Task } from './tasks';
/**
 * @experimental
 */
export interface NodeProjectOptions extends ProjectOptions, NodePackageOptions {
    /**
     * (experimental) License copyright owner.
     *
     * @default - defaults to the value of authorName or "" if `authorName` is undefined.
     * @experimental
     */
    readonly copyrightOwner?: string;
    /**
     * (experimental) The copyright years to put in the LICENSE file.
     *
     * @default - current year
     * @experimental
     */
    readonly copyrightPeriod?: string;
    /**
     * (experimental) Version of projen to install.
     *
     * @default Semver.latest()
     * @experimental
     */
    readonly projenVersion?: Semver;
    /**
     * (experimental) Indicates of "projen" should be installed as a devDependency.
     *
     * @default true
     * @experimental
     */
    readonly projenDevDependency?: boolean;
    /**
     * (experimental) The name of the main release branch.
     *
     * NOTE: this field is temporarily required as we migrate the default value
     * from "master" to "main". Shortly, it will be made optional with "main" as
     * the default.
     *
     * @default "main"
     * @experimental
     */
    readonly defaultReleaseBranch: string;
    /**
     * (experimental) Define a GitHub workflow for building PRs.
     *
     * @default - true if not a subproject
     * @experimental
     */
    readonly buildWorkflow?: boolean;
    /**
     * (experimental) Define a GitHub workflow step for sending code coverage metrics to https://codecov.io/ Uses codecov/codecov-action@v1 A secret is required for private repos. Configured with @codeCovTokenSecret.
     *
     * @default false
     * @experimental
     */
    readonly codeCov?: boolean;
    /**
     * (experimental) Define the secret name for a specified https://codecov.io/ token A secret is required to send coverage for private repositories.
     *
     * @default - if this option is not specified, only public repositories are supported
     * @experimental
     */
    readonly codeCovTokenSecret?: string;
    /**
     * (experimental) Define a GitHub workflow for releasing from "main" when new versions are bumped.
     *
     * Requires that `version` will be undefined.
     *
     * @default - true if not a subproject
     * @experimental
     */
    readonly releaseWorkflow?: boolean;
    /**
     * (experimental) Automatically release new versions every commit to one of branches in `releaseBranches`.
     *
     * @default true
     * @experimental
     */
    readonly releaseEveryCommit?: boolean;
    /**
     * (experimental) CRON schedule to trigger new releases.
     *
     * @default - no scheduled releases
     * @experimental
     */
    readonly releaseSchedule?: string;
    /**
     * (experimental) Branches which trigger a release.
     *
     * Default value is based on defaultReleaseBranch.
     *
     * @default [ "main" ]
     * @experimental
     */
    readonly releaseBranches?: string[];
    /**
     * (experimental) Workflow steps to use in order to bootstrap this repo.
     *
     * @default "yarn install --frozen-lockfile && yarn projen"
     * @experimental
     */
    readonly workflowBootstrapSteps?: any[];
    /**
     * (experimental) Container image to use for GitHub workflows.
     *
     * @default - default image
     * @experimental
     */
    readonly workflowContainerImage?: string;
    /**
     * (experimental) Automatically release to npm when new versions are introduced.
     *
     * @default false
     * @experimental
     */
    readonly releaseToNpm?: boolean;
    /**
     * (experimental) Checks that after build there are no modified files on git.
     *
     * @default true
     * @experimental
     */
    readonly antitamper?: boolean;
    /**
     * (experimental) The node version to use in GitHub workflows.
     *
     * @default - same as `minNodeVersion`
     * @experimental
     */
    readonly workflowNodeVersion?: string;
    /**
     * (experimental) Include dependabot configuration.
     *
     * @default true
     * @experimental
     */
    readonly dependabot?: boolean;
    /**
     * (experimental) Options for dependabot.
     *
     * @default - default options
     * @experimental
     */
    readonly dependabotOptions?: DependabotOptions;
    /**
     * (experimental) Adds mergify configuration.
     *
     * @default true
     * @experimental
     */
    readonly mergify?: boolean;
    /**
     * (experimental) Options for mergify.
     *
     * @default - default options
     * @experimental
     */
    readonly mergifyOptions?: MergifyOptions;
    /**
     * (experimental) Automatically merge PRs that build successfully and have this label.
     *
     * To disable, set this value to an empty string.
     *
     * @default "auto-merge"
     * @experimental
     */
    readonly mergifyAutoMergeLabel?: string;
    /**
     * (experimental) Periodically submits a pull request for projen upgrades (executes `yarn projen:upgrade`).
     *
     * This setting is a GitHub secret name which contains a GitHub Access Token
     * with `repo` and `workflow` permissions.
     *
     * This token is used to submit the upgrade pull request, which will likely
     * include workflow updates.
     *
     * To create a personal access token see https://github.com/settings/tokens
     *
     * @default - no automatic projen upgrade pull requests
     * @experimental
     */
    readonly projenUpgradeSecret?: string;
    /**
     * (experimental) Automatically merge projen upgrade PRs when build passes.
     *
     * Applies the `mergifyAutoMergeLabel` to the PR if enabled.
     *
     * @default - "true" if mergify auto-merge is enabled (default)
     * @experimental
     */
    readonly projenUpgradeAutoMerge?: boolean;
    /**
     * (experimental) Customize the projenUpgrade schedule in cron expression.
     *
     * @default [ "0 6 * * *" ]
     * @experimental
     */
    readonly projenUpgradeSchedule?: string[];
    /**
     * (experimental) Defines an .npmignore file. Normally this is only needed for libraries that are packaged as tarballs.
     *
     * @default true
     * @experimental
     */
    readonly npmignoreEnabled?: boolean;
    /**
     * (experimental) Additional entries to .npmignore.
     *
     * @experimental
     */
    readonly npmignore?: string[];
    /**
     * (experimental) Include a GitHub pull request template.
     *
     * @default true
     * @experimental
     */
    readonly pullRequestTemplate?: boolean;
    /**
     * (experimental) The contents of the pull request template.
     *
     * @default - default content
     * @experimental
     */
    readonly pullRequestTemplateContents?: string;
    /**
     * (experimental) Installs a GitHub workflow which is triggered when the comment "@projen rebuild" is added to a pull request.
     *
     * The workflow will run a full build and
     * commit the changes to the pull request branch. This is useful for updating
     * test snapshots and other generated files like API.md.
     *
     * @default - true if not a subproject
     * @experimental
     */
    readonly rebuildBot?: boolean;
    /**
     * (experimental) The pull request bot command to use in order to trigger a rebuild and commit of the contents of the branch.
     *
     * The command must be prefixed by "@projen", e.g. "@projen rebuild"
     * `gh pr review $pr --comment -b "@projen rebuild"`
     *
     * @default "rebuild"
     * @experimental
     */
    readonly rebuildBotCommand?: string;
    /**
     * (experimental) Additional entries to .gitignore.
     *
     * @experimental
     */
    readonly gitignore?: string[];
    /**
     * (experimental) Setup jest unit tests.
     *
     * @default true
     * @experimental
     */
    readonly jest?: boolean;
    /**
     * (experimental) Jest options.
     *
     * @default - default options
     * @experimental
     */
    readonly jestOptions?: JestOptions;
    /**
     * (experimental) Version requirement of `jsii-release` which is used to publish modules to npm.
     *
     * @default "latest"
     * @experimental
     */
    readonly jsiiReleaseVersion?: string;
    /**
     * (experimental) A directory which will contain artifacts to be published to npm.
     *
     * @default "dist"
     * @experimental
     */
    readonly artifactsDirectory?: string;
}
/**
 * (experimental) Automatic bump modes.
 *
 * @experimental
 */
export declare enum AutoRelease {
    /**
     * (experimental) Automatically bump & release a new version for every commit to "main".
     *
     * @experimental
     */
    EVERY_COMMIT = 0,
    /**
     * (experimental) Automatically bump & release a new version on a daily basis.
     *
     * @experimental
     */
    DAILY = 1
}
/**
 * (experimental) Node.js project.
 *
 * @experimental
 */
export declare class NodeProject extends Project {
    /**
     * (experimental) API for managing the node package.
     *
     * @experimental
     */
    readonly package: NodePackage;
    /**
     * (experimental) The .npmignore file.
     *
     * @experimental
     */
    readonly npmignore?: IgnoreFile;
    /**
     * @deprecated use `package.allowLibraryDependencies`
     */
    get allowLibraryDependencies(): boolean;
    /**
     * @deprecated use `package.entrypoint`
     */
    get entrypoint(): string;
    /**
     * (experimental) Compiles the code.
     *
     * By default for node.js projects this task is empty.
     *
     * @experimental
     */
    readonly compileTask: Task;
    /**
     * (experimental) Tests the code.
     *
     * @experimental
     */
    readonly testTask: Task;
    /**
     * (experimental) Compiles the test code.
     *
     * @experimental
     */
    readonly testCompileTask: Task;
    /**
     * (experimental) The task responsible for a full release build.
     *
     * It spawns: compile + test + release + package
     *
     * @experimental
     */
    readonly buildTask: Task;
    /**
     * (experimental) Automatic PR merges.
     *
     * @experimental
     */
    readonly autoMerge?: AutoMerge;
    private readonly _version;
    /**
     * (experimental) The PR build GitHub workflow.
     *
     * `undefined` if `buildWorkflow` is disabled.
     *
     * @experimental
     */
    protected readonly buildWorkflow?: GithubWorkflow;
    /**
     * @experimental
     */
    protected readonly buildWorkflowJobId?: string;
    /**
     * (experimental) The release GitHub workflow.
     *
     * `undefined` if `releaseWorkflow` is disabled.
     *
     * @experimental
     */
    readonly releaseWorkflow?: GithubWorkflow;
    /**
     * (experimental) Package publisher.
     *
     * This will be `undefined` if the project does not have a
     * release workflow.
     *
     * @experimental
     */
    readonly publisher?: Publisher;
    /**
     * (experimental) Minimum node.js version required by this package.
     *
     * @experimental
     */
    get minNodeVersion(): string | undefined;
    /**
     * (experimental) Maximum node version required by this pacakge.
     *
     * @experimental
     */
    get maxNodeVersion(): string | undefined;
    private readonly nodeVersion?;
    /**
     * (experimental) Indicates if workflows have anti-tamper checks.
     *
     * @experimental
     */
    readonly antitamper: boolean;
    /**
     * @deprecated use `package.npmDistTag`
     */
    protected readonly npmDistTag: string;
    /**
     * @deprecated use `package.npmRegistry`
     */
    protected readonly npmRegistry: string;
    /**
     * (deprecated) The package manager to use.
     *
     * @deprecated use `package.packageManager`
     */
    get packageManager(): NodePackageManager;
    /**
     * (experimental) The command to use to run scripts (e.g. `yarn run` or `npm run` depends on the package manager).
     *
     * @experimental
     */
    readonly runScriptCommand: string;
    /**
     * (experimental) The Jest configuration (if enabled).
     *
     * @experimental
     */
    readonly jest?: Jest;
    /**
     * (deprecated) Determines how tasks are executed when invoked as npm scripts (yarn/npm run xyz).
     *
     * @deprecated use `package.npmTaskExecution`
     */
    get npmTaskExecution(): NpmTaskExecution;
    /**
     * (experimental) The command to use in order to run the projen CLI.
     *
     * @experimental
     */
    get projenCommand(): string;
    /**
     * @deprecated use `package.addField(x, y)`
     */
    get manifest(): any;
    /**
     * @experimental
     */
    constructor(options: NodeProjectOptions);
    /**
     * @experimental
     */
    addBins(bins: Record<string, string>): void;
    /**
     * (experimental) Replaces the contents of an npm package.json script.
     *
     * @param name The script name.
     * @param command The command to execute.
     * @experimental
     */
    setScript(name: string, command: string): void;
    /**
     * (experimental) Removes the npm script (always successful).
     *
     * @param name The name of the script.
     * @experimental
     */
    removeScript(name: string): void;
    /**
     * (experimental) Indicates if a script by the name name is defined.
     *
     * @param name The name of the script.
     * @experimental
     */
    hasScript(name: string): boolean;
    /**
     * (deprecated) DEPRECATED.
     *
     * @deprecated use `project.compileTask.exec()`
     */
    addCompileCommand(...commands: string[]): void;
    /**
     * (deprecated) DEPRECATED.
     *
     * @deprecated use `project.testTask.exec()`
     */
    addTestCommand(...commands: string[]): void;
    /**
     * (deprecated) DEPRECATED.
     *
     * @deprecated use `project.buildTask.exec()`
     */
    addBuildCommand(...commands: string[]): void;
    /**
     * (experimental) Directly set fields in `package.json`.
     *
     * @param fields The fields to set.
     * @experimental
     */
    addFields(fields: {
        [name: string]: any;
    }): void;
    /**
     * (experimental) Adds keywords to package.json (deduplicated).
     *
     * @param keywords The keywords to add.
     * @experimental
     */
    addKeywords(...keywords: string[]): void;
    /**
     * @experimental
     */
    get installWorkflowSteps(): any[];
    /**
     * (experimental) Defines normal dependencies.
     *
     * @param deps Names modules to install.
     * @experimental
     */
    addDeps(...deps: string[]): void;
    /**
     * (experimental) Defines development/test dependencies.
     *
     * @param deps Names modules to install.
     * @experimental
     */
    addDevDeps(...deps: string[]): void;
    /**
     * (experimental) Defines peer dependencies.
     *
     * When adding peer dependencies, a devDependency will also be added on the
     * pinned version of the declared peer. This will ensure that you are testing
     * your code against the minimum version required from your consumers.
     *
     * @param deps Names modules to install.
     * @experimental
     */
    addPeerDeps(...deps: string[]): void;
    /**
     * (experimental) Defines bundled dependencies.
     *
     * Bundled dependencies will be added as normal dependencies as well as to the
     * `bundledDependencies` section of your `package.json`.
     *
     * @param deps Names modules to install.
     * @experimental
     */
    addBundledDeps(...deps: string[]): void;
    private addLicense;
    private addDefaultGitIgnore;
    private createBuildWorkflow;
    /**
     * (experimental) Returns the shell command to execute in order to run a task.
     *
     * If
     * npmTaskExecution is set to PROJEN, the command will be `npx projen TASK`.
     * If it is set to SHELL, the command will be `yarn run TASK` (or `npm run
     * TASK`).
     *
     * @param task The task for which the command is required.
     * @experimental
     */
    runTaskCommand(task: Task): string;
    private addRebuildBot;
}
/**
 * @experimental
 */
export interface NodeWorkflowSteps {
    /**
     * @experimental
     */
    readonly antitamper: any[];
    /**
     * @experimental
     */
    readonly install: any[];
}
