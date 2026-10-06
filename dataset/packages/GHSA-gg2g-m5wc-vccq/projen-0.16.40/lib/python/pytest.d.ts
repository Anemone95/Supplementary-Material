import { Component } from '../component';
import { Task } from '../tasks';
import { PythonProject } from './python-project';
/**
 * @experimental
 */
export interface PytestOptions {
    /**
     * (experimental) Pytest version.
     *
     * @default "6.2.1"
     * @experimental
     */
    readonly version?: string;
    /**
     * (experimental) Directory with tests.
     *
     * @default 'tests'
     * @experimental
     */
    readonly testdir?: string;
    /**
     * (experimental) Stop the testing process after the first N failures.
     *
     * @experimental
     */
    readonly maxFailures?: number;
}
/**
 * @experimental
 */
export declare class Pytest extends Component {
    /**
     * @experimental
     */
    readonly testTask: Task;
    /**
     * @experimental
     */
    constructor(project: PythonProject, options?: PytestOptions);
}
