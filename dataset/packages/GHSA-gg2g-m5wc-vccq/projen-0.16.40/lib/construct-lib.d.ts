import { JsiiProject, JsiiProjectOptions } from './jsii-project';
/**
 * @experimental
 */
export interface ConstructLibraryOptions extends JsiiProjectOptions {
    /**
     * (experimental) Libraries will be picked up by the construct catalog when they are published to npm as jsii modules and will be published under:.
     *
     * https://awscdk.io/packages/[@SCOPE/]PACKAGE@VERSION
     *
     * The catalog will also post a tweet to https://twitter.com/awscdkio with the
     * package name, description and the above link. You can disable these tweets
     * through `{ announce: false }`.
     *
     * You can also add a Twitter handle through `{ twitter: 'xx' }` which will be
     * mentioned in the tweet.
     *
     * @default - new version will be announced
     * @see https://github.com/construct-catalog/catalog
     * @experimental
     */
    readonly catalog?: Catalog;
}
/**
 * @experimental
 */
export interface Catalog {
    /**
     * (experimental) Twitter account to @mention in announcement tweet.
     *
     * @experimental
     */
    readonly twitter?: string;
    /**
     * (experimental) Should we announce new versions?
     *
     * @default true
     * @experimental
     */
    readonly announce?: boolean;
}
/**
 * (experimental) A multi-language library for CDK constructs.
 *
 * @experimental
 */
export declare abstract class ConstructLibrary extends JsiiProject {
    /**
     * @experimental
     */
    constructor(options: ConstructLibraryOptions);
}
