import { Project, ProjectOptions } from '../project';
import { Pytest, PytestOptions } from './pytest';
import { IPythonDeps } from './python-deps';
import { IPythonEnv } from './python-env';
import { IPythonPackaging, PythonPackagingOptions } from './python-packaging';
import { VenvOptions } from './venv';
/**
 * (experimental) Options for `PythonProject`.
 *
 * @experimental
 */
export interface PythonProjectOptions extends ProjectOptions, PythonPackagingOptions {
    /**
     * (experimental) Name of the python package as used in imports and filenames.
     *
     * Must only consist of alphanumeric characters and underscores.
     *
     * @default $PYTHON_MODULE_NAME
     * @experimental
     */
    readonly moduleName: string;
    /**
     * (experimental) List of runtime dependencies for this project.
     *
     * Dependencies use the format: `<module>@<semver>`
     *
     * Additional dependencies can be added via `project.addDependency()`.
     *
     * @default []
     * @experimental
     */
    readonly deps?: string[];
    /**
     * (experimental) List of dev dependencies for this project.
     *
     * Dependencies use the format: `<module>@<semver>`
     *
     * Additional dependencies can be added via `project.addDevDependency()`.
     *
     * @default []
     * @experimental
     */
    readonly devDeps?: string[];
    /**
     * (experimental) Use pip with a requirements.txt file to track project dependencies.
     *
     * @default true
     * @experimental
     */
    readonly pip?: boolean;
    /**
     * (experimental) Use venv to manage a virtual environment for installing dependencies inside.
     *
     * @default true
     * @experimental
     */
    readonly venv?: boolean;
    /**
     * (experimental) Venv options.
     *
     * @default - defaults
     * @experimental
     */
    readonly venvOptions?: VenvOptions;
    /**
     * (experimental) Use setuptools with a setup.py script for packaging and publishing.
     *
     * @default - true if the project type is library
     * @experimental
     */
    readonly setuptools?: boolean;
    /**
     * (experimental) Use poetry to manage your project dependencies, virtual environment, and (optional) packaging/publishing.
     *
     * @default false
     * @experimental
     */
    readonly poetry?: boolean;
    /**
     * (experimental) Include pytest tests.
     *
     * @default true
     * @experimental
     */
    readonly pytest?: boolean;
    /**
     * (experimental) pytest options.
     *
     * @default - defaults
     * @experimental
     */
    readonly pytestOptions?: PytestOptions;
    /**
     * (experimental) Include sample code and test if the relevant directories don't exist.
     *
     * @default true
     * @experimental
     */
    readonly sample?: boolean;
}
/**
 * (experimental) Python project.
 *
 * @experimental
 * @pjid python
 */
export declare class PythonProject extends Project {
    /**
     * (experimental) Python module name (the project name, with any hyphens or periods replaced with underscores).
     *
     * @experimental
     */
    readonly moduleName: string;
    /**
     * (experimental) Version of the package for distribution (should follow semver).
     *
     * @experimental
     */
    readonly version: string;
    /**
     * (experimental) API for managing dependencies.
     *
     * @experimental
     */
    readonly depsManager: IPythonDeps;
    /**
     * (experimental) API for mangaging the Python runtime environment.
     *
     * @experimental
     */
    readonly envManager: IPythonEnv;
    /**
     * (experimental) API for managing packaging the project as a library.
     *
     * Only applies when the `projectType` is LIB.
     *
     * @experimental
     */
    readonly packagingManager?: IPythonPackaging;
    /**
     * (experimental) Pytest component.
     *
     * @experimental
     */
    readonly pytest?: Pytest;
    /**
     * @experimental
     */
    constructor(options: PythonProjectOptions);
    /**
     * Adds default gitignore options for a Python project based on
     * https://github.com/github/gitignore/blob/master/Python.gitignore
     */
    private addDefaultGitIgnore;
    /**
     * (experimental) Adds a runtime dependency.
     *
     * @param spec Format `<module>@<semver>`.
     * @experimental
     */
    addDependency(spec: string): void;
    /**
     * (experimental) Adds a dev dependency.
     *
     * @param spec Format `<module>@<semver>`.
     * @experimental
     */
    addDevDependency(spec: string): void;
    /**
     * (experimental) Called after all components are synthesized.
     *
     * Order is *not* guaranteed.
     *
     * @experimental
     */
    postSynthesize(): void;
}
