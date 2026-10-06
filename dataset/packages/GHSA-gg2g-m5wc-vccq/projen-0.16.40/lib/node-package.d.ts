import { Component } from './component';
import { Project } from './project';
/**
 * @experimental
 */
export interface NodePackageOptions {
    /**
     * (experimental) The "name" in package.json.
     *
     * @default - defaults to project name
     * @experimental
     */
    readonly packageName?: string;
    /**
     * (experimental) The description is just a string that helps people understand the purpose of the package.
     *
     * It can be used when searching for packages in a package manager as well.
     * See https://classic.yarnpkg.com/en/docs/package-json/#toc-description
     *
     * @experimental
     */
    readonly description?: string;
    /**
     * (experimental) Runtime dependencies of this module.
     *
     * The recommendation is to only specify the module name here (e.g.
     * `express`). This will behave similar to `yarn add` or `npm install` in the
     * sense that it will add the module as a dependency to your `package.json`
     * file with the latest version (`^`). You can specify semver requirements in
     * the same syntax passed to `npm i` or `yarn add` (e.g. `express@^2`) and
     * this will be what you `package.json` will eventually include.
     *
     * @default []
     * @experimental
     * @example
     *
     * [ 'express', 'lodash', 'foo@^2' ]
     */
    readonly deps?: string[];
    /**
     * (experimental) Build dependencies for this module.
     *
     * These dependencies will only be
     * available in your build environment but will not be fetched when this
     * module is consumed.
     *
     * The recommendation is to only specify the module name here (e.g.
     * `express`). This will behave similar to `yarn add` or `npm install` in the
     * sense that it will add the module as a dependency to your `package.json`
     * file with the latest version (`^`). You can specify semver requirements in
     * the same syntax passed to `npm i` or `yarn add` (e.g. `express@^2`) and
     * this will be what you `package.json` will eventually include.
     *
     * @default []
     * @experimental
     * @example
     *
     * [ 'typescript', '@types/express' ]
     */
    readonly devDeps?: string[];
    /**
     * (experimental) Peer dependencies for this module.
     *
     * Dependencies listed here are required to
     * be installed (and satisfied) by the _consumer_ of this library. Using peer
     * dependencies allows you to ensure that only a single module of a certain
     * library exists in the `node_modules` tree of your consumers.
     *
     * Note that prior to npm@7, peer dependencies are _not_ automatically
     * installed, which means that adding peer dependencies to a library will be a
     * breaking change for your customers.
     *
     * Unless `peerDependencyOptions.pinnedDevDependency` is disabled (it is
     * enabled by default), projen will automatically add a dev dependency with a
     * pinned version for each peer dependency. This will ensure that you build &
     * test your module against the lowest peer version required.
     *
     * @default []
     * @experimental
     */
    readonly peerDeps?: string[];
    /**
     * (experimental) List of dependencies to bundle into this module.
     *
     * These modules will be
     * added both to the `dependencies` section and `peerDependencies` section of
     * your `package.json`.
     *
     * The recommendation is to only specify the module name here (e.g.
     * `express`). This will behave similar to `yarn add` or `npm install` in the
     * sense that it will add the module as a dependency to your `package.json`
     * file with the latest version (`^`). You can specify semver requirements in
     * the same syntax passed to `npm i` or `yarn add` (e.g. `express@^2`) and
     * this will be what you `package.json` will eventually include.
     *
     * @experimental
     */
    readonly bundledDeps?: string[];
    /**
     * (experimental) Options for `peerDeps`.
     *
     * @experimental
     */
    readonly peerDependencyOptions?: PeerDependencyOptions;
    /**
     * (experimental) Allow the project to include `peerDependencies` and `bundledDependencies`.
     *
     * This is normally only allowed for libraries. For apps, there's no meaning
     * for specifying these.
     *
     * @default true
     * @experimental
     */
    readonly allowLibraryDependencies?: boolean;
    /**
     * (experimental) Keywords to include in `package.json`.
     *
     * @experimental
     */
    readonly keywords?: string[];
    /**
     * (experimental) Module entrypoint (`main` in `package.json`).
     *
     * Set to an empty string to not include `main` in your package.json
     *
     * @default "lib/index.js"
     * @experimental
     */
    readonly entrypoint?: string;
    /**
     * (experimental) Binary programs vended with your module.
     *
     * You can use this option to add/customize how binaries are represented in
     * your `package.json`, but unless `autoDetectBin` is `false`, every
     * executable file under `bin` will automatically be added to this section.
     *
     * @experimental
     */
    readonly bin?: Record<string, string>;
    /**
     * (experimental) Automatically add all executables under the `bin` directory to your `package.json` file under the `bin` section.
     *
     * @default true
     * @experimental
     */
    readonly autoDetectBin?: boolean;
    /**
     * (experimental) npm scripts to include.
     *
     * If a script has the same name as a standard script,
     * the standard script will be overwritten.
     *
     * @default {}
     * @experimental
     */
    readonly scripts?: {
        [name: string]: string;
    };
    /**
     * (experimental) Determines how tasks are executed when invoked as npm scripts (yarn/npm run xyz).
     *
     * @default NpmTaskExecution.PROJEN
     * @experimental
     */
    readonly npmTaskExecution?: NpmTaskExecution;
    /**
     * (experimental) The shell command to use in order to run the projen CLI.
     *
     * Can be used to customize in special environments.
     *
     * @default "npx projen"
     * @experimental
     */
    readonly projenCommand?: string;
    /**
     * (experimental) The Node Package Manager used to execute scripts.
     *
     * @default NodePackageManager.YARN
     * @experimental
     */
    readonly packageManager?: NodePackageManager;
    /**
     * (experimental) The repository is the location where the actual code for your package lives.
     *
     * See https://classic.yarnpkg.com/en/docs/package-json/#toc-repository
     *
     * @experimental
     */
    readonly repository?: string;
    /**
     * (experimental) If the package.json for your package is not in the root directory (for example if it is part of a monorepo), you can specify the directory in which it lives.
     *
     * @experimental
     */
    readonly repositoryDirectory?: string;
    /**
     * (experimental) Author's name.
     *
     * @experimental
     */
    readonly authorName?: string;
    /**
     * (experimental) Author's e-mail.
     *
     * @experimental
     */
    readonly authorEmail?: string;
    /**
     * (experimental) Author's URL / Website.
     *
     * @experimental
     */
    readonly authorUrl?: string;
    /**
     * (experimental) Author's Organization.
     *
     * @experimental
     */
    readonly authorOrganization?: boolean;
    /**
     * (experimental) Package's Homepage / Website.
     *
     * @experimental
     */
    readonly homepage?: string;
    /**
     * (experimental) Package's Stability.
     *
     * @experimental
     */
    readonly stability?: string;
    /**
     * (experimental) Minimum Node.js version to require via package.json `engines` (inclusive).
     *
     * @default - no "engines" specified
     * @experimental
     */
    readonly minNodeVersion?: string;
    /**
     * (experimental) Minimum node.js version to require via `engines` (inclusive).
     *
     * @default - no max
     * @experimental
     */
    readonly maxNodeVersion?: string;
    /**
     * (experimental) License's SPDX identifier.
     *
     * See https://github.com/projen/projen/tree/master/license-text for a list of supported licenses.
     *
     * @default "Apache-2.0"
     * @experimental
     */
    readonly license?: string;
    /**
     * (experimental) Indicates if a license should be added.
     *
     * @default true
     * @experimental
     */
    readonly licensed?: boolean;
    /**
     * (experimental) Tags can be used to provide an alias instead of version numbers.
     *
     * For example, a project might choose to have multiple streams of development
     * and use a different tag for each stream, e.g., stable, beta, dev, canary.
     *
     * By default, the `latest` tag is used by npm to identify the current version
     * of a package, and `npm install <pkg>` (without any `@<version>` or `@<tag>`
     * specifier) installs the latest tag. Typically, projects only use the
     * `latest` tag for stable release versions, and use other tags for unstable
     * versions such as prereleases.
     *
     * The `next` tag is used by some projects to identify the upcoming version.
     *
     * @default "latest"
     * @experimental
     */
    readonly npmDistTag?: string;
    /**
     * (experimental) The base URL of the npm package registry.
     *
     * Must be a URL (e.g. start with "https://" or "http://")
     *
     * @default "https://registry.npmjs.org"
     * @experimental
     */
    readonly npmRegistryUrl?: string;
    /**
     * (deprecated) The host name of the npm registry to publish to.
     *
     * Cannot be set together with `npmRegistryUrl`.
     *
     * @deprecated use `npmRegistryUrl` instead
     */
    readonly npmRegistry?: string;
    /**
     * (experimental) Access level of the npm package.
     *
     * @default - for scoped packages (e.g. `foo@bar`), the default is
     * `NpmAccess.RESTRICTED`, for non-scoped packages, the default is
     * `NpmAccess.PUBLIC`.
     * @experimental
     */
    readonly npmAccess?: NpmAccess;
}
/**
 * (experimental) Represents the npm `package.json` file.
 *
 * @experimental
 */
export declare class NodePackage extends Component {
    /**
     * (experimental) The name of the npm package.
     *
     * @experimental
     */
    readonly packageName: string;
    /**
     * (experimental) The module's entrypoint (e.g. `lib/index.js`).
     *
     * @experimental
     */
    readonly entrypoint: string;
    /**
     * (experimental) Determines how tasks are executed when invoked as npm scripts (yarn/npm/pnpm run xyz).
     *
     * @experimental
     */
    readonly npmTaskExecution: NpmTaskExecution;
    /**
     * (experimental) The command to use in order to run the projen CLI.
     *
     * @experimental
     */
    readonly projenCommand: string;
    /**
     * (experimental) Allow project to take library dependencies.
     *
     * @experimental
     */
    readonly allowLibraryDependencies: boolean;
    /**
     * (experimental) The package manager to use.
     *
     * @experimental
     */
    readonly packageManager: NodePackageManager;
    /**
     * @deprecated use `addField(x, y)`
     */
    readonly manifest: any;
    /**
     * (experimental) Minimum node.js version required by this package.
     *
     * @default - no minimum
     * @experimental
     */
    readonly minNodeVersion?: string;
    /**
     * (experimental) Maximum node version required by this pacakge.
     *
     * @default - no maximum.
     * @experimental
     */
    readonly maxNodeVersion?: string;
    /**
     * (experimental) The SPDX license of this module.
     *
     * `undefined` if this package is not licensed.
     *
     * @experimental
     */
    readonly license?: string;
    /**
     * (experimental) npm distribution tag.
     *
     * @experimental
     */
    readonly npmDistTag: string;
    /**
     * (experimental) npm registry (e.g. `https://registry.npmjs.org`). Use `npmRegistryHost` to get just the host name.
     *
     * @experimental
     */
    readonly npmRegistryUrl: string;
    /**
     * (experimental) The npm registry host (e.g. `registry.npmjs.org`).
     *
     * @experimental
     */
    readonly npmRegistry: string;
    /**
     * (experimental) npm package access level.
     *
     * @experimental
     */
    readonly npmAccess: NpmAccess;
    private readonly keywords;
    private readonly bin;
    private readonly scripts;
    private readonly engines;
    private readonly peerDependencyOptions;
    private _renderedDeps?;
    /**
     * @experimental
     */
    constructor(project: Project, options?: NodePackageOptions);
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
    /**
     * (experimental) Adds an `engines` requirement to your package.
     *
     * @param engine The engine (e.g. `node`).
     * @param version The semantic version requirement (e.g. `^10`).
     * @experimental
     */
    addEngine(engine: string, version: string): void;
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
    addBin(bins: Record<string, string>): void;
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
     * (experimental) Directly set fields in `package.json`.
     *
     * @param name field name.
     * @param value field value.
     * @experimental
     * @escape true
     */
    addField(name: string, value: any): void;
    /**
     * (experimental) Sets the package version.
     *
     * @param version Package version.
     * @experimental
     */
    addVersion(version: string): void;
    /**
     * (experimental) Returns the command to execute in order to install all dependencies (always frozen).
     *
     * @experimental
     */
    get installCommand(): string;
    /**
     * (experimental) Called before synthesis.
     *
     * @experimental
     */
    preSynthesize(): void;
    /**
     * (experimental) Called after synthesis.
     *
     * Order is *not* guaranteed.
     *
     * @experimental
     */
    postSynthesize(): void;
    private parseNpmOptions;
    private addNodeEngine;
    private renderInstallCommand;
    private processDeps;
    private renderDependencies;
    private resolveDepsAndWritePackageJson;
    private renderPublishConfig;
    private renderKeywords;
    private renderEngines;
    private autoDiscoverBinaries;
    private renderAuthor;
    private renderBin;
    private renderScripts;
    private npmScriptForTask;
}
/**
 * @experimental
 */
export declare enum NpmTaskExecution {
    /**
     * (experimental) `package.json` scripts invoke to the projen CLI.
     *
     * @experimental
     * @example
     *
     * scripts: {
     *   "compile": "projen compile"
     * }
     */
    PROJEN = "projen",
    /**
     * (experimental) Task is implemented directly as a shell script within `package.json`.
     *
     * @experimental
     * @example
     *
     * scripts: {
     *   "compile": "tsc"
     * }
     */
    SHELL = "shell"
}
/**
 * @experimental
 */
export interface PeerDependencyOptions {
    /**
     * (experimental) Automatically add a pinned dev dependency.
     *
     * @default true
     * @experimental
     */
    readonly pinnedDevDependency?: boolean;
}
/**
 * (experimental) The node package manager to use.
 *
 * @experimental
 */
export declare enum NodePackageManager {
    /**
     * (experimental) Use `yarn` as the package manager.
     *
     * @experimental
     */
    YARN = "yarn",
    /**
     * (experimental) Use `npm` as the package manager.
     *
     * @experimental
     */
    NPM = "npm",
    /**
     * (experimental) Use `pnpm` as the package manager.
     *
     * @experimental
     */
    PNPM = "pnpm"
}
/**
 * (experimental) Npm package access level.
 *
 * @experimental
 */
export declare enum NpmAccess {
    /**
     * (experimental) Package is public.
     *
     * @experimental
     */
    PUBLIC = "public",
    /**
     * (experimental) Package can only be accessed with credentials.
     *
     * @experimental
     */
    RESTRICTED = "restricted"
}
