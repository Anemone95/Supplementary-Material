import { Component } from '../component';
import { Task } from '../tasks';
import { IPythonPackaging, PythonPackagingOptions } from './python-packaging';
import { PythonProject } from './python-project';
/**
 * (experimental) Manages packaging through setuptools with a setup.py script.
 *
 * @experimental
 */
export declare class Setuptools extends Component implements IPythonPackaging {
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
}
