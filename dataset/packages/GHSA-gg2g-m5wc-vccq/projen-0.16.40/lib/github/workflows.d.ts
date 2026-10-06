import { Component } from '../component';
import { YamlFile } from '../yaml';
import { GitHub } from './github';
/**
 * @experimental
 */
export declare class GithubWorkflow extends Component {
    private readonly name;
    private events;
    private jobs;
    /**
     * @experimental
     */
    readonly file: YamlFile;
    /**
     * @experimental
     */
    constructor(github: GitHub, name: string);
    /**
     * @experimental
     */
    on(events: {
        [event: string]: any;
    }): void;
    /**
     * @experimental
     */
    addJobs(jobs: {
        [jobid: string]: any;
    }): void;
    private renderWorkflow;
}
