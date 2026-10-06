import { ConstructLibrary, ConstructLibraryOptions } from './construct-lib';
/**
 * (experimental) Options for the construct-lib-aws project.
 *
 * @experimental
 */
export interface AwsCdkConstructLibraryOptions extends ConstructLibraryOptions {
    /**
     * (experimental) Minimum target version this library is tested against.
     *
     * @default "1.73.0"
     * @experimental
     */
    readonly cdkVersion: string;
    /**
     * (experimental) Use pinned version instead of caret version for CDK.
     *
     * You can use this to prevent yarn to mix versions for your CDK dependencies and to prevent auto-updates.
     * If you use experimental features this will let you define the moment you include breaking changes.
     *
     * @default false
     * @experimental
     */
    readonly cdkVersionPinning?: boolean;
    /**
     * (experimental) Which AWS CDK modules (those that start with "@aws-cdk/") does this library require when consumed?
     *
     * @experimental
     */
    readonly cdkDependencies?: string[];
    /**
     * (experimental) If this is enabled (default), all modules declared in `cdkDependencies` will be also added as normal `dependencies` (as well as `peerDependencies`).
     *
     * This is to ensure that downstream consumers actually have your CDK dependencies installed
     * when using npm < 7 or yarn, where peer dependencies are not automatically installed.
     * If this is disabled, `cdkDependencies` will be added to `devDependencies` to ensure
     * they are present during development.
     *
     * @default true
     * @experimental
     */
    readonly cdkDependenciesAsDeps?: boolean;
    /**
     * (experimental) Install the @aws-cdk/assert library?
     *
     * @default true
     * @experimental
     */
    readonly cdkAssert?: boolean;
    /**
     * (experimental) AWS CDK modules required for testing.
     *
     * @experimental
     */
    readonly cdkTestDependencies?: string[];
}
/**
 * (experimental) AWS CDK construct library project.
 *
 * A multi-language (jsii) construct library which vends constructs designed to
 * use within the AWS CDK with a friendly workflow and automatic publishing to
 * the construct catalog.
 *
 * ```ts
 * const project = new ConstructLibraryAws({
 *    name: 'cdk-watchful',
 *    description: 'Watching your CDK apps since 2019',
 *    jsiiVersion: Semver.caret('1.7.0'),
 *    authorName: 'Elad Ben-Israel',
 *    authorEmail: 'elad.benisrael@gmail.com',
 *    repository: 'https://github.com/eladb/cdk-watchful.git',
 *    keywords: [
 *      "cloudwatch",
 *      "monitoring"
 *    ],
 *
 *    catalog: {
 *      twitter: 'emeshbi'
 *    },
 *
 *    // creates PRs for projen upgrades
 *    projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
 *
 *    cdkVersion: '1.54.0',
 *    cdkDependencies: [
 *      "@aws-cdk/aws-apigateway",
 *      "@aws-cdk/aws-cloudwatch",
 *      "@aws-cdk/aws-cloudwatch-actions",
 *      "@aws-cdk/aws-dynamodb",
 *      "@aws-cdk/aws-ecs",
 *      "@aws-cdk/aws-ecs-patterns",
 *      "@aws-cdk/aws-elasticloadbalancingv2",
 *      "@aws-cdk/aws-events",
 *      "@aws-cdk/aws-events-targets",
 *      "@aws-cdk/aws-lambda",
 *      "@aws-cdk/aws-rds",
 *      "@aws-cdk/aws-sns",
 *      "@aws-cdk/aws-sns-subscriptions",
 *      "@aws-cdk/aws-sqs",
 *      "@aws-cdk/core"
 *    ],
 *    devDependencies: {
 *      "aws-sdk": Semver.caret("2.708.0")
 *    },
 *
 *    // jsii publishing
 *
 *    java: {
 *      javaPackage: 'com.github.eladb.watchful',
 *      mavenGroupId: 'com.github.eladb',
 *      mavenArtifactId: 'cdk-watchful'
 *    },
 *    python: {
 *      distName: 'cdk-watchful',
 *      module: 'cdk_watchful'
 *    }
 * });
 *
 * project.synth();
 * ```
 *
 * @experimental
 * @pjid awscdk-construct
 */
export declare class AwsCdkConstructLibrary extends ConstructLibrary {
    /**
     * (experimental) The target CDK version for this library.
     *
     * @experimental
     */
    readonly version: string;
    /**
     * (experimental) Whether CDK dependencies are added as normal dependencies (and peer dependencies).
     *
     * @experimental
     */
    readonly cdkDependenciesAsDeps: boolean;
    /**
     * @experimental
     */
    constructor(options: AwsCdkConstructLibraryOptions);
    /**
     * (experimental) Adds CDK modules as runtime dependencies.
     *
     * Modules are currently by default added with a caret CDK version both as "dependencies"
     * and "peerDependencies". This is because currently npm would not
     * automatically install peer dependencies that are not declared as concerete
     * dependencies by the consumer, so this is a little npm "hack" so that
     * consumers will not need to depend on them directly if they don't interact
     * with them.
     * See `cdkDependenciesAsDeps` for changing the default behavior.
     *
     * @param deps names of cdk modules (e.g. `@aws-cdk/aws-lambda`).
     * @experimental
     */
    addCdkDependencies(...deps: string[]): void;
    /**
     * (experimental) Adds CDK modules as test dependencies.
     *
     * @param deps names of cdk modules (e.g. `@aws-cdk/aws-lambda`).
     * @experimental
     */
    addCdkTestDependencies(...deps: string[]): void;
    private formatModuleSpec;
}
/**
 * @deprecated use `AwsCdkConstructLibraryOptions`
 */
export interface ConstructLibraryAwsOptions extends AwsCdkConstructLibraryOptions {
}
/**
 * @deprecated use `AwsCdkConstructLibrary`
 */
export declare class ConstructLibraryAws extends AwsCdkConstructLibrary {
}
