import { Component } from '../component';
import { Project } from '../project';
import { Pom } from './pom';
/**
 * (experimental) Options for `Junit`.
 *
 * @experimental
 */
export interface JunitOptions {
    /**
     * (experimental) Java pom.
     *
     * @experimental
     */
    readonly pom: Pom;
    /**
     * (experimental) Junit version.
     *
     * @default "5.7.0"
     * @experimental
     */
    readonly version?: string;
    /**
     * (experimental) Java package for test sample.
     *
     * @default "org.acme"
     * @experimental
     */
    readonly sampleJavaPackage?: string;
}
/**
 * (experimental) Implements JUnit-based testing.
 *
 * @experimental
 */
export declare class Junit extends Component {
    /**
     * @experimental
     */
    constructor(project: Project, options: JunitOptions);
}
