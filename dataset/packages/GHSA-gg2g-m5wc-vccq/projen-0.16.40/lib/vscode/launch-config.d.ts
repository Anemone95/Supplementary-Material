import { Component } from '../component';
import { VsCode } from './vscode';
/**
 * (experimental) Controls the visibility of the VSCode Debug Console panel during a debugging session Source: https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes.
 *
 * @experimental
 */
export declare enum InternalConsoleOptions {
    /**
     * @experimental
     */
    NEVER_OPEN = "neverOpen",
    /**
     * @experimental
     */
    OPEN_ON_FIRST_SESSION_START = "openOnFirstSessionStart",
    /**
     * @experimental
     */
    OPEN_ON_SESSION_START = "openOnSessionStart"
}
/**
 * (experimental) VSCode launch configuration Presentation interface "using the order, group, and hidden attributes in the presentation object you can sort, group, and hide configurations and compounds in the Debug configuration dropdown and in the Debug quick pick." Source: https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes.
 *
 * @experimental
 */
export interface Presentation {
    /**
     * @experimental
     */
    readonly hidden: boolean;
    /**
     * @experimental
     */
    readonly group: string;
    /**
     * @experimental
     */
    readonly order: number;
}
/**
 * (experimental) VSCode launch configuration ServerReadyAction interface "if you want to open a URL in a web browser whenever the program under debugging outputs a specific message to the debug console or integrated terminal." Source: https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes.
 *
 * @experimental
 */
export interface ServerReadyAction {
    /**
     * @experimental
     */
    readonly action: string;
    /**
     * @experimental
     */
    readonly pattern?: string;
    /**
     * @experimental
     */
    readonly uriFormat?: string;
}
/**
 * (experimental) Options for a 'VsCodeLaunchConfigurationEntry' Source: https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes.
 *
 * @experimental
 */
export interface VsCodeLaunchConfigurationEntry {
    /**
     * @experimental
     */
    readonly type: string;
    /**
     * @experimental
     */
    readonly request: string;
    /**
     * @experimental
     */
    readonly name: string;
    /**
     * @experimental
     */
    readonly args?: string[];
    /**
     * @experimental
     */
    readonly debugServer?: number;
    /**
     * @experimental
     */
    readonly internalConsoleOptions?: InternalConsoleOptions;
    /**
     * @experimental
     */
    readonly runtimeArgs?: string[];
    /**
     * @experimental
     */
    readonly postDebugTask?: string;
    /**
     * @experimental
     */
    readonly preLaunchTask?: string;
    /**
     * @experimental
     */
    readonly presentation?: Presentation;
    /**
     * @experimental
     */
    readonly program?: string;
    /**
     * @experimental
     */
    readonly serverReadyAction?: ServerReadyAction;
    /**
     * @experimental
     */
    readonly skipFiles?: string[];
    /**
     * @experimental
     */
    readonly outFiles?: string[];
    /**
     * @experimental
     */
    readonly url?: string;
    /**
     * @experimental
     */
    readonly webRoot?: string;
}
/**
 * (experimental) VSCode launch configuration file (launch.json), useful for enabling in-editor debugger.
 *
 * @experimental
 */
export declare class VsCodeLaunchConfig extends Component {
    private readonly content;
    /**
     * @experimental
     */
    constructor(vscode: VsCode);
    /**
     * (experimental) Adds a VsCodeLaunchConfigurationEntry (e.g. a node.js debugger) to `.vscode/launch.json. Each configuration entry has following mandatory fields: type, request and name. See https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes for details.
     *
     * @param cfg VsCodeLaunchConfigurationEntry.
     * @experimental
     */
    addConfiguration(cfg: VsCodeLaunchConfigurationEntry): void;
}
