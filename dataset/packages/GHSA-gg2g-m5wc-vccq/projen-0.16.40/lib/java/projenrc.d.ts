import { Component } from '../component';
import { Project } from '../project';
import { Pom } from './pom';
/**
 * (experimental) Options for `Projenrc`.
 *
 * @experimental
 */
export interface ProjenrcCommonOptions {
    /**
     * (experimental) The name of the Java class which contains the `main()` method for projen.
     *
     * @default "projenrc"
     * @experimental
     */
    readonly className?: string;
    /**
     * (experimental) The projen version to use.
     *
     * @default - current version
     * @experimental
     */
    readonly projenVersion?: string;
    /**
     * (experimental) Defines projenrc under the test scope instead of the main scope, which is reserved to the app.
     *
     * This means that projenrc will be under
     * `src/test/java/projenrc.java` and projen will be defined as a test
     * dependency. This enforces that application code does not take a dependency
     * on projen code.
     *
     * If this is disabled, projenrc should be under
     * `src/main/java/projenrc.java`.
     *
     * @default true
     * @experimental
     */
    readonly testScope?: boolean;
}
/**
 * @experimental
 */
export interface ProjenrcOptions extends ProjenrcCommonOptions {
    /**
     * (experimental) Project initialization options.
     *
     * @experimental
     */
    readonly initializationOptions?: {
        [name: string]: any;
    };
}
/**
 * (experimental) Allows writing projenrc files in java.
 *
 * This will install `org.projen/projen` as a Maven dependency and will add a
 * `synth` task which will compile & execute `main()` from
 * `src/main/java/projenrc.java`.
 *
 * @experimental
 */
export declare class Projenrc extends Component {
    /**
     * (experimental) The name of the java class that includes the projen entrypoint.
     *
     * @experimental
     */
    readonly className: string;
    /**
     * Whether the class is in the "test" or "main" scope?
     */
    private readonly testScope;
    /**
     * @experimental
     */
    constructor(project: Project, pom: Pom, options?: ProjenrcOptions);
    private generateProjenrc;
}
