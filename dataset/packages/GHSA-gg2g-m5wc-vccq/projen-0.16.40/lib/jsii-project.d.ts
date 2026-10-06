import { Eslint, EslintOptions } from './eslint';
import { NodeProjectOptions } from './node-project';
import { JsiiReleaseGo, JsiiReleaseMaven, JsiiReleasePyPi, JsiiReleaseNuget } from './publisher';
import { TypeScriptProject } from './typescript';
/**
 * @experimental
 */
export interface JsiiProjectOptions extends NodeProjectOptions {
    /**
     * @default "."
     * @experimental
     */
    readonly rootdir?: string;
    /**
     * (experimental) Git repository URL.
     *
     * @default $GIT_REMOTE
     * @experimental
     */
    readonly repositoryUrl: string;
    /**
     * (experimental) The name of the library author.
     *
     * @default $GIT_USER_NAME
     * @experimental
     */
    readonly author: string;
    /**
     * (experimental) Email or URL of the library author.
     *
     * @default $GIT_USER_EMAIL
     * @experimental
     */
    readonly authorAddress: string;
    /**
     * (experimental) Publish to maven.
     *
     * @default - no publishing
     * @experimental
     */
    readonly publishToMaven?: JsiiJavaTarget;
    /**
     * (experimental) Publish to pypi.
     *
     * @default - no publishing
     * @experimental
     */
    readonly publishToPypi?: JsiiPythonTarget;
    /**
     * (experimental) Publish Go bindings to a git repository.
     *
     * @default - no publishing
     * @experimental
     */
    readonly publishToGo?: JsiiGoTarget;
    /**
     * @deprecated use `publishToPyPi`
     */
    readonly python?: JsiiPythonTarget;
    /**
     * (experimental) Publish to NuGet.
     *
     * @default - no publishing
     * @experimental
     */
    readonly publishToNuget?: JsiiDotNetTarget;
    /**
     * @deprecated use `publishToNuget`
     */
    readonly dotnet?: JsiiDotNetTarget;
    /**
     * (experimental) Install eslint.
     *
     * @default true
     * @experimental
     */
    readonly eslint?: boolean;
    /**
     * (experimental) Eslint options.
     *
     * @default - opinionated default options
     * @experimental
     */
    readonly eslintOptions?: EslintOptions;
    /**
     * (experimental) Generate one-time sample in `src/` and `test/` if there are no files there.
     *
     * @default true
     * @experimental
     */
    readonly sampleCode?: boolean;
    /**
     * (experimental) Automatically generate API.md from jsii.
     *
     * @default true
     * @experimental
     */
    readonly docgen?: boolean;
    /**
     * (experimental) Automatically run API compatibility test against the latest version published to npm after compilation.
     *
     * - You can manually run compatibility tests using `yarn compat` if this feature is disabled.
     * - You can ignore compatibility failures by adding lines to a ".compatignore" file.
     *
     * @default false
     * @experimental
     */
    readonly compat?: boolean;
    /**
     * (experimental) Name of the ignore file for API compatibility tests.
     *
     * @default ".compatignore"
     * @experimental
     */
    readonly compatIgnore?: string;
    /**
     * (experimental) Accepts a list of glob patterns.
     *
     * Files matching any of those patterns will be excluded from the TypeScript compiler input.
     *
     * By default, jsii will include all *.ts files (except .d.ts files) in the TypeScript compiler input.
     * This can be problematic for example when the package's build or test procedure generates .ts files
     * that cannot be compiled with jsii's compiler settings.
     *
     * @experimental
     */
    readonly excludeTypescript?: string[];
}
/**
 * @experimental
 */
export declare enum Stability {
    /**
     * @experimental
     */
    EXPERIMENTAL = "experimental",
    /**
     * @experimental
     */
    STABLE = "stable",
    /**
     * @experimental
     */
    DEPRECATED = "deprecated"
}
/**
 * @experimental
 */
export interface JsiiJavaTarget extends JsiiReleaseMaven {
    /**
     * @experimental
     */
    readonly javaPackage: string;
    /**
     * @experimental
     */
    readonly mavenGroupId: string;
    /**
     * @experimental
     */
    readonly mavenArtifactId: string;
}
/**
 * @experimental
 */
export interface JsiiPythonTarget extends JsiiReleasePyPi {
    /**
     * @experimental
     */
    readonly distName: string;
    /**
     * @experimental
     */
    readonly module: string;
}
/**
 * @experimental
 */
export interface JsiiDotNetTarget extends JsiiReleaseNuget {
    /**
     * @experimental
     */
    readonly dotNetNamespace: string;
    /**
     * @experimental
     */
    readonly packageId: string;
}
/**
 * (experimental) Go target configuration.
 *
 * @experimental
 */
export interface JsiiGoTarget extends JsiiReleaseGo {
    /**
     * (experimental) The name of the target go module.
     *
     * @experimental
     * @example
     *
     * github.com/owner/repo/subdir
     */
    readonly moduleName: string;
}
/**
 * (experimental) Multi-language jsii library project.
 *
 * @experimental
 */
export declare class JsiiProject extends TypeScriptProject {
    /**
     * @experimental
     */
    readonly eslint?: Eslint;
    /**
     * @experimental
     */
    constructor(options: JsiiProjectOptions);
}
