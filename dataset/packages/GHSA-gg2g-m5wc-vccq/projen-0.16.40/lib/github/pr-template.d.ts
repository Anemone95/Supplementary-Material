import { TextFile } from '../textfile';
import { GitHub } from './github';
/**
 * (experimental) Options for `PullRequestTemplate`.
 *
 * @experimental
 */
export interface PullRequestTemplateOptions {
    /**
     * (experimental) The contents of the template.
     *
     * You can use `addLine()` to add additional lines.
     *
     * @default - a standard default template will be created.
     * @experimental
     */
    readonly lines?: string[];
}
/**
 * (experimental) Template for GitHub pull requests.
 *
 * @experimental
 */
export declare class PullRequestTemplate extends TextFile {
    /**
     * @experimental
     */
    constructor(github: GitHub, options?: PullRequestTemplateOptions);
}
