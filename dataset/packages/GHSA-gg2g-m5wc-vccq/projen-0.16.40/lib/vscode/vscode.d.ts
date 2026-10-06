import { Component } from '../component';
import { Project } from '../project';
import { VsCodeLaunchConfig } from './launch-config';
/**
 * @experimental
 */
export declare class VsCode extends Component {
    private _launchConfig?;
    /**
     * @experimental
     */
    constructor(project: Project);
    /**
     * @experimental
     */
    get launchConfiguration(): VsCodeLaunchConfig;
}
