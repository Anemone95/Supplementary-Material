import { Component } from '../component';
import { Project } from '../project';
import { Task } from '../tasks';
import { Pom } from './pom';
/**
 * (experimental) Options for `MavenCompile`.
 *
 * @experimental
 */
export interface MavenCompileOptions {
    /**
     * (experimental) Source language version.
     *
     * @default "1.8"
     * @experimental
     */
    readonly source?: string;
    /**
     * (experimental) Target JVM version.
     *
     * @default "1.8"
     * @experimental
     */
    readonly target?: string;
}
/**
 * (experimental) Adds the maven-compiler plugin to a POM file and the `compile` task.
 *
 * @experimental
 */
export declare class MavenCompile extends Component {
    /**
     * @experimental
     */
    readonly compileTask: Task;
    /**
     * @experimental
     */
    constructor(project: Project, pom: Pom, options?: MavenCompileOptions);
}
