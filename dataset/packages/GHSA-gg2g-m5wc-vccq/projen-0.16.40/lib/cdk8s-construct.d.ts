import { ConstructLibrary, ConstructLibraryOptions } from './construct-lib';
/**
 * @experimental
 */
export interface ConstructLibraryCdk8sOptions extends ConstructLibraryOptions {
    /**
     * (experimental) Minimum target version this library is tested against.
     *
     * @default "1.0.0-beta.3"
     * @experimental
     */
    readonly cdk8sVersion: string;
}
/**
 * (experimental) CDK8s construct library project.
 *
 * A multi-language (jsii) construct library which vends constructs designed to
 * use within the CDK for Kubernetes (CDK8s), with a friendly workflow and
 * automatic publishing to the construct catalog.
 *
 * @experimental
 * @pjid cdk8s-construct
 */
export declare class ConstructLibraryCdk8s extends ConstructLibrary {
    /**
     * @experimental
     */
    constructor(options: ConstructLibraryCdk8sOptions);
}
