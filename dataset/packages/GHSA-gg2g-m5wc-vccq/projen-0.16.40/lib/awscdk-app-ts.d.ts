import { TypeScriptAppProject, TypeScriptProjectOptions } from './typescript';
/**
 * @experimental
 */
export declare enum CdkApprovalLevel {
    /**
     * (experimental) Approval is never required.
     *
     * @experimental
     */
    NEVER = "never",
    /**
     * (experimental) Requires approval on any IAM or security-group-related change.
     *
     * @experimental
     */
    ANY_CHANGE = "any-change",
    /**
     * (experimental) Requires approval when IAM statements or traffic rules are added;
     *
     * removals don't require approval
     *
     * @experimental
     */
    BROADENING = "broadening"
}
/**
 * @experimental
 */
export interface AwsCdkTypeScriptAppOptions extends TypeScriptProjectOptions {
    /**
     * (experimental) AWS CDK version to use.
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
     * (experimental) Which AWS CDK modules (those that start with "@aws-cdk/") this app uses.
     *
     * @experimental
     */
    readonly cdkDependencies?: string[];
    /**
     * (experimental) Additional context to include in `cdk.json`.
     *
     * @experimental
     */
    readonly context?: {
        [key: string]: string;
    };
    /**
     * (experimental) The CDK app's entrypoint (relative to the source directory, which is "src" by default).
     *
     * @default "main.ts"
     * @experimental
     */
    readonly appEntrypoint?: string;
    /**
     * (experimental) To protect you against unintended changes that affect your security posture, the AWS CDK Toolkit prompts you to approve security-related changes before deploying them.
     *
     * @default CdkApprovalLevel.BROADENING
     * @experimental
     */
    readonly requireApproval?: CdkApprovalLevel;
}
/**
 * (experimental) AWS CDK app in TypeScript.
 *
 * @experimental
 * @pjid awscdk-app-ts
 */
export declare class AwsCdkTypeScriptApp extends TypeScriptAppProject {
    /**
     * (experimental) The CDK version this app is using.
     *
     * @experimental
     */
    readonly cdkVersion: string;
    /**
     * (experimental) Contents of `cdk.json`.
     *
     * @experimental
     */
    readonly cdkConfig: any;
    /**
     * (experimental) The CDK app entrypoint.
     *
     * @experimental
     */
    readonly appEntrypoint: string;
    /**
     * @experimental
     */
    constructor(options: AwsCdkTypeScriptAppOptions);
    /**
     * (experimental) Adds an AWS CDK module dependencies.
     *
     * @param modules The list of modules to depend on.
     * @experimental
     */
    addCdkDependency(...modules: string[]): void;
    private formatModuleSpec;
}
