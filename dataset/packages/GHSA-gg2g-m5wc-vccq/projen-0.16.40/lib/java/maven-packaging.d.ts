import { Component } from '../component';
import { Project } from '../project';
import { Task } from '../tasks';
import { Pom } from './pom';
/**
 * (experimental) Options for `MavenPackage`.
 *
 * @experimental
 */
export interface MavenPackagingOptions {
    /**
     * (experimental) Include sources jar in package.
     *
     * @default true
     * @experimental
     */
    readonly sources?: boolean;
    /**
     * (experimental) Where to place the package output?
     *
     * @default "dist/java"
     * @experimental
     */
    readonly distdir?: string;
    /**
     * (experimental) Include javadocs jar in package.
     *
     * @default true
     * @experimental
     */
    readonly javadocs?: boolean;
    /**
     * (experimental) Exclude source files from docs.
     *
     * @default []
     * @experimental
     */
    readonly javadocsExclude?: string[];
}
/**
 * (experimental) Configures a maven project to produce a .jar archive with sources and javadocs.
 *
 * @experimental
 */
export declare class MavenPackaging extends Component {
    /**
     * (experimental) The "package" task.
     *
     * @experimental
     */
    readonly task: Task;
    /**
     * @experimental
     */
    constructor(project: Project, pom: Pom, options?: MavenPackagingOptions);
}
