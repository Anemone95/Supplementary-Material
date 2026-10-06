import { Component } from './component';
import { NodeProject } from './node-project';
import { Task } from './tasks';
/**
 * @experimental
 */
export interface VersionOptions {
    /**
     * (experimental) The name of the release branch where the code and tags are pushed to.
     *
     * @experimental
     */
    readonly releaseBranch: string;
}
/**
 * @experimental
 */
export declare class Version extends Component {
    /**
     * @experimental
     */
    readonly bumpTask: Task;
    /**
     * @experimental
     */
    constructor(project: NodeProject, options: VersionOptions);
    /**
     * (experimental) Returns the current version of the project.
     *
     * @experimental
     */
    get currentVersion(): any;
}
