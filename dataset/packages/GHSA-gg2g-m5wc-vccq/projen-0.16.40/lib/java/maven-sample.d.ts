import { Component } from '../component';
import { Project } from '../project';
/**
 * @experimental
 */
export interface MavenSampleOptions {
    /**
     * (experimental) Project root java package.
     *
     * @experimental
     */
    readonly package: string;
}
/**
 * (experimental) Java code sample.
 *
 * @experimental
 */
export declare class MavenSample extends Component {
    /**
     * @experimental
     */
    constructor(project: Project, options: MavenSampleOptions);
}
