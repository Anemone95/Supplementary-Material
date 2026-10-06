import { Component } from '../component';
import { Project } from '../project';
/**
 * @experimental
 */
export interface AutoMergeOptions {
    /**
     * (experimental) The GitHub job ID of the build workflow.
     *
     * @experimental
     */
    readonly buildJob?: string;
    /**
     * (experimental) Number of approved code reviews.
     *
     * @default 1
     * @experimental
     */
    readonly approvedReviews?: number;
    /**
     * (experimental) Automatically merge PRs that build successfully and have this label.
     *
     * To disable, set this value to an empty string.
     *
     * @default "auto-merge"
     * @experimental
     */
    readonly autoMergeLabel?: string;
}
/**
 * (experimental) Sets up mergify to merging approved pull requests.
 *
 * If `buildJob` is specified, the specified GitHub workflow job ID is required
 * to succeed in order for the PR to be merged.
 *
 * `approvedReviews` specified the number of code review approvals required for
 * the PR to be merged.
 *
 * @experimental
 */
export declare class AutoMerge extends Component {
    /**
     * @experimental
     */
    readonly autoMergeLabel: string;
    /**
     * @experimental
     */
    constructor(project: Project, options?: AutoMergeOptions);
}
