import { NodeProject } from './node-project';
export interface ProjenUpgradeOptions {
    /**
     * The secret name which contains a GitHub Access Token with `repo` and
     * `workflow` permissions. This token is used to submit the upgrade pull
     * request, which will likely include workflow updates.
     *
     * @default - auto-upgrade is disabled
     */
    readonly autoUpgradeSecret?: string;
    /**
     * Apply labels to the PR. For example, you can add the label "auto-merge",
     * which, in-tandem with mergify configuration will automatically merge these
     * PRs if their build passes.
     *
     * @default []
     */
    readonly labels?: string[];
    /**
     * Customize the projenUpgrade schedule in cron expression.
     *
     @default [ '0 6 * * *' ]
     */
    readonly autoUpgradeSchedule?: string[];
}
/**
 * Checks for new versions of projen and creates a PR with an upgrade change.
 */
export declare class ProjenUpgrade {
    constructor(project: NodeProject, options?: ProjenUpgradeOptions);
}
