import { Component } from '../component';
import { GitHub } from './github';
/**
 * @experimental
 */
export interface MergifyRule {
    /**
     * @experimental
     */
    readonly name: string;
    /**
     * @experimental
     */
    readonly conditions: string[];
    /**
     * @experimental
     */
    readonly actions: {
        [action: string]: any;
    };
}
/**
 * @experimental
 */
export interface MergifyOptions {
    /**
     * @experimental
     */
    readonly rules?: MergifyRule[];
}
/**
 * @experimental
 */
export declare class Mergify extends Component {
    private readonly rules;
    /**
     * @experimental
     */
    constructor(github: GitHub, options?: MergifyOptions);
    /**
     * @experimental
     */
    addRule(rule: MergifyRule): void;
}
