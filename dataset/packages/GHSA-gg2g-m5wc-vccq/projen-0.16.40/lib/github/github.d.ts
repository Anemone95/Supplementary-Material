import { Component } from '../component';
import { Dependabot, DependabotOptions } from './dependabot';
import { MergifyRule } from './mergify';
import { PullRequestTemplate } from './pr-template';
import { GithubWorkflow } from './workflows';
/**
 * @experimental
 */
export declare class GitHub extends Component {
    private mergify?;
    /**
     * @experimental
     */
    addMergifyRules(...rules: MergifyRule[]): void;
    /**
     * @experimental
     */
    addWorkflow(name: string): GithubWorkflow;
    /**
     * @experimental
     */
    addPullRequestTemplate(...content: string[]): PullRequestTemplate;
    /**
     * @experimental
     */
    addDependabot(options?: DependabotOptions): Dependabot;
}
