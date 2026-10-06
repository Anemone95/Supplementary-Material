import { Component } from '../component';
import { IPythonEnv } from './python-env';
import { PythonProject } from './python-project';
/**
 * (experimental) Options for venv.
 *
 * @experimental
 */
export interface VenvOptions {
    /**
     * (experimental) Name of directory to store the environment in.
     *
     * @default ".env"
     * @experimental
     */
    readonly envdir?: string;
}
/**
 * (experimental) Manages a virtual environment through the Python venv module.
 *
 * @experimental
 */
export declare class Venv extends Component implements IPythonEnv {
    /**
     * Name of directory to store the environment in
     */
    private readonly envdir;
    /**
     * @experimental
     */
    constructor(project: PythonProject, options?: VenvOptions);
    /**
     * (experimental) Initializes the virtual environment if it doesn't exist (called during post-synthesis).
     *
     * @experimental
     */
    setupEnvironment(): void;
}
