import { Task } from '../tasks';
import { PoetryPyprojectOptionsWithoutDeps } from './poetry';
/**
 * @experimental
 */
export interface IPythonPackaging {
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
}
/**
 * @experimental
 */
export interface PythonPackagingOptions {
    /**
     * (experimental) Author's name.
     *
     * @default $GIT_USER_NAME
     * @experimental
     */
    readonly authorName: string;
    /**
     * (experimental) Author's e-mail.
     *
     * @default $GIT_USER_EMAIL
     * @experimental
     */
    readonly authorEmail: string;
    /**
     * (experimental) Version of the package.
     *
     * @default "0.1.0"
     * @experimental
     */
    readonly version: string;
    /**
     * (experimental) A short description of the package.
     *
     * @experimental
     */
    readonly description?: string;
    /**
     * (experimental) License of this package as an SPDX identifier.
     *
     * @experimental
     */
    readonly license?: string;
    /**
     * (experimental) A URL to the website of the project.
     *
     * @experimental
     */
    readonly homepage?: string;
    /**
     * (experimental) A list of PyPI trove classifiers that describe the project.
     *
     * @see https://pypi.org/classifiers/
     * @experimental
     */
    readonly classifiers?: string[];
    /**
     * (experimental) Additional fields to pass in the setup() function if using setuptools.
     *
     * @experimental
     */
    readonly setupConfig?: {
        [key: string]: any;
    };
    /**
     * (experimental) Additional options to set for poetry if using poetry.
     *
     * @experimental
     */
    readonly poetryOptions?: PoetryPyprojectOptionsWithoutDeps;
}
