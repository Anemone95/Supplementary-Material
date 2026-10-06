import { Component } from '../component';
import { GitHub } from './github';
/**
 * @experimental
 */
export interface DependabotOptions {
    /**
     * (experimental) How often to check for new versions and raise pull requests.
     *
     * @default ScheduleInterval.DAILY
     * @experimental
     */
    readonly scheduleInterval?: DependabotScheduleInterval;
    /**
     * (experimental) The strategy to use when edits manifest and lock files.
     *
     * @default VersioningStrategy.LOCKFILE_ONLY The default is to only update the
     * lock file because package.json is controlled by projen and any outside
     * updates will fail the build.
     * @experimental
     */
    readonly versioningStrategy?: VersioningStrategy;
    /**
     * (experimental) Automatically merge dependabot PRs if build CI build passes.
     *
     * @default true
     * @experimental
     */
    readonly autoMerge?: boolean;
    /**
     * (experimental) You can use the `ignore` option to customize which dependencies are updated.
     *
     * The ignore option supports the following options.
     *
     * @default []
     * @experimental
     */
    readonly ignore?: DependabotIgnore[];
    /**
     * (experimental) Ignores updates to `projen`.
     *
     * This is required since projen updates may cause changes in committed files
     * and anti-tamper checks will fail.
     *
     * Projen upgrades are covered through the `ProjenUpgrade` class.
     *
     * @default true
     * @experimental
     */
    readonly ignoreProjen?: boolean;
}
/**
 * (experimental) You can use the `ignore` option to customize which dependencies are updated.
 *
 * The ignore option supports the following options.
 *
 * @experimental
 */
export interface DependabotIgnore {
    /**
     * (experimental) Use to ignore updates for dependencies with matching names, optionally using `*` to match zero or more characters.
     *
     * For Java dependencies, the format of the dependency-name attribute is:
     * `groupId:artifactId`, for example: `org.kohsuke:github-api`.
     *
     * @experimental
     */
    readonly dependencyName: string;
    /**
     * (experimental) Use to ignore specific versions or ranges of versions.
     *
     * If you want to
     * define a range, use the standard pattern for the package manager (for
     * example: `^1.0.0` for npm, or `~> 2.0` for Bundler).
     *
     * @experimental
     */
    readonly versions?: string[];
}
/**
 * (experimental) How often to check for new versions and raise pull requests for version updates.
 *
 * @experimental
 */
export declare enum DependabotScheduleInterval {
    /**
     * (experimental) Runs on every weekday, Monday to Friday.
     *
     * @experimental
     */
    DAILY = "daily",
    /**
     * (experimental) Runs once each week.
     *
     * By default, this is on Monday.
     *
     * @experimental
     */
    WEEKLY = "weekly",
    /**
     * (experimental) Runs once each month.
     *
     * This is on the first day of the month.
     *
     * @experimental
     */
    MONTHLY = "monthly"
}
/**
 * (experimental) The strategy to use when edits manifest and lock files.
 *
 * @experimental
 */
export declare enum VersioningStrategy {
    /**
     * (experimental) Only create pull requests to update lockfiles updates.
     *
     * Ignore any new
     * versions that would require package manifest changes.
     *
     * @experimental
     */
    LOCKFILE_ONLY = "lockfile-only",
    /**
     * (experimental) - For apps, the version requirements are increased.
     *
     * - For libraries, the range of versions is widened.
     *
     * @experimental
     */
    AUTO = "auto",
    /**
     * (experimental) Relax the version requirement to include both the new and old version, when possible.
     *
     * @experimental
     */
    WIDEN = "widen",
    /**
     * (experimental) Always increase the version requirement to match the new version.
     *
     * @experimental
     */
    INCREASE = "increase",
    /**
     * (experimental) Increase the version requirement only when required by the new version.
     *
     * @experimental
     */
    INCREASE_IF_NECESSARY = "increase-if-necessary"
}
/**
 * (experimental) Defines dependabot configuration for node projects.
 *
 * Since module versions are managed in projen, the versioning strategy will be
 * configured to "lockfile-only" which means that only updates that can be done
 * on the lockfile itself will be proposed.
 *
 * @experimental
 */
export declare class Dependabot extends Component {
    /**
     * (experimental) The raw dependabot configuration.
     *
     * @see https://docs.github.com/en/github/administering-a-repository/configuration-options-for-dependency-updates
     * @experimental
     */
    readonly config: any;
    private readonly ignore;
    /**
     * @experimental
     */
    constructor(github: GitHub, options?: DependabotOptions);
    /**
     * (experimental) Ignores a dependency from automatic updates.
     *
     * @param dependencyName Use to ignore updates for dependencies with matching names, optionally using `*` to match zero or more characters.
     * @param versions Use to ignore specific versions or ranges of versions.
     * @experimental
     */
    addIgnore(dependencyName: string, ...versions: string[]): void;
}
