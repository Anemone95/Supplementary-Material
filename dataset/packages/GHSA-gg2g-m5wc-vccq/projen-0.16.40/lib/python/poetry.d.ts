import { Component } from '../component';
import { Task } from '../tasks';
import { TomlFile } from '../toml';
import { IPythonDeps } from './python-deps';
import { IPythonEnv } from './python-env';
import { IPythonPackaging, PythonPackagingOptions } from './python-packaging';
import { PythonProject } from './python-project';
/**
 * (experimental) Manage project dependencies, virtual environments, and packaging through the poetry CLI tool.
 *
 * @experimental
 */
export declare class Poetry extends Component implements IPythonDeps, IPythonEnv, IPythonPackaging {
    /**
     * (experimental) A task that installs and updates dependencies.
     *
     * @experimental
     */
    readonly installTask: Task;
    /**
     * (experimental) A task that packages the project for distribution.
     *
     * @experimental
     */
    readonly packageTask: Task;
    /**
     * (experimental) A task that uploads the package to a package repository.
     *
     * @experimental
     */
    readonly publishTask: Task;
    /**
     * (experimental) A task that uploads the package to the Test PyPI repository.
     *
     * @experimental
     */
    readonly publishTestTask: Task;
    /**
     * @experimental
     */
    constructor(project: PythonProject, options: PythonPackagingOptions);
    private synthDependencies;
    private synthDevDependencies;
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
     * (experimental) Initializes the virtual environment if it doesn't exist (called during post-synthesis).
     *
     * @experimental
     */
    setupEnvironment(): void;
    /**
     * (experimental) Installs dependencies (called during post-synthesis).
     *
     * @experimental
     */
    installDependencies(): void;
}
/**
 * @experimental
 */
export interface PoetryPyprojectOptionsWithoutDeps {
    /**
     * (experimental) Name of the package (required).
     *
     * @experimental
     */
    readonly name?: string;
    /**
     * (experimental) Version of the package (required).
     *
     * @experimental
     */
    readonly version?: string;
    /**
     * (experimental) A short description of the package (required).
     *
     * @experimental
     */
    readonly description?: string;
    /**
     * (experimental) License of this package as an SPDX identifier.
     *
     * If the project is proprietary and does not use a specific license, you
     * can set this value as "Proprietary".
     *
     * @experimental
     */
    readonly license?: string;
    /**
     * (experimental) The authors of the package.
     *
     * Must be in the form "name <email>"
     *
     * @experimental
     */
    readonly authors?: string[];
    /**
     * (experimental) the maintainers of the package.
     *
     * Must be in the form "name <email>"
     *
     * @experimental
     */
    readonly maintainers?: string[];
    /**
     * (experimental) The name of the readme file of the package.
     *
     * @experimental
     */
    readonly readme?: string;
    /**
     * (experimental) A URL to the website of the project.
     *
     * @experimental
     */
    readonly homepage?: string;
    /**
     * (experimental) A URL to the repository of the project.
     *
     * @experimental
     */
    readonly repository?: string;
    /**
     * (experimental) A URL to the documentation of the project.
     *
     * @experimental
     */
    readonly documentation?: string;
    /**
     * (experimental) A list of keywords (max: 5) that the package is related to.
     *
     * @experimental
     */
    readonly keywords?: string[];
    /**
     * (experimental) A list of PyPI trove classifiers that describe the project.
     *
     * @see https://pypi.org/classifiers/
     * @experimental
     */
    readonly classifiers?: string[];
    /**
     * (experimental) A list of packages and modules to include in the final distribution.
     *
     * @experimental
     */
    readonly packages?: string[];
    /**
     * (experimental) A list of patterns that will be included in the final package.
     *
     * @experimental
     */
    readonly include?: string[];
    /**
     * (experimental) A list of patterns that will be excluded in the final package.
     *
     * If a VCS is being used for a package, the exclude field will be seeded with
     * the VCS’ ignore settings (.gitignore for git for example).
     *
     * @experimental
     */
    readonly exclude?: string[];
    /**
     * (experimental) The scripts or executables that will be installed when installing the package.
     *
     * @experimental
     */
    readonly scripts?: {
        [key: string]: any;
    };
}
/**
 * @experimental
 */
export interface PoetryPyprojectOptions extends PoetryPyprojectOptionsWithoutDeps {
    /**
     * (experimental) A list of dependencies for the project.
     *
     * The python version for which your package is compatible is also required.
     *
     * @experimental
     * @example
     *
     * { requests: "^2.13.0" }
     */
    readonly dependencies?: {
        [key: string]: any;
    };
    /**
     * (experimental) A list of development dependencies for the project.
     *
     * @experimental
     * @example
     *
     * { requests: "^2.13.0" }
     */
    readonly devDependencies?: {
        [key: string]: any;
    };
}
/**
 * (experimental) Represents configuration of a pyproject.toml file for a Poetry project.
 *
 * @see https://python-poetry.org/docs/pyproject/
 * @experimental
 */
export declare class PoetryPyproject extends Component {
    /**
     * @experimental
     */
    readonly file: TomlFile;
    /**
     * @experimental
     */
    constructor(project: PythonProject, options: PoetryPyprojectOptions);
}
