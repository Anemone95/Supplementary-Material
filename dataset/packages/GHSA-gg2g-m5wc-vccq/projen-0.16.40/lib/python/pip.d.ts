import { Component } from '../component';
import { Task } from '../tasks';
import { IPythonDeps } from './python-deps';
import { PythonProject } from './python-project';
/**
 * (experimental) Options for pip.
 *
 * @experimental
 */
export interface PipOptions {
}
/**
 * (experimental) Manages dependencies using a requirements.txt file and the pip CLI tool.
 *
 * @experimental
 */
export declare class Pip extends Component implements IPythonDeps {
    /**
     * (experimental) A task that installs and updates dependencies.
     *
     * @experimental
     */
    readonly installTask: Task;
    /**
     * @experimental
     */
    constructor(project: PythonProject, _options?: PipOptions);
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
     * (experimental) Installs dependencies (called during post-synthesis).
     *
     * @experimental
     */
    installDependencies(): void;
}
