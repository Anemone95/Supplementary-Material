import { Component } from '../component';
import { PythonProject } from './python-project';
/**
 * (experimental) Options for python sample code.
 *
 * @experimental
 */
export interface PythonSampleOptions {
}
/**
 * (experimental) Python code sample.
 *
 * @experimental
 */
export declare class PythonSample extends Component {
    /**
     * @experimental
     */
    constructor(project: PythonProject, _options: PythonSampleOptions);
}
