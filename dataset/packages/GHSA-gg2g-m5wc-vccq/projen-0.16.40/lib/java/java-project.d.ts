import { Project, ProjectOptions } from '../project';
import { Junit, JunitOptions } from './junit';
import { MavenCompile, MavenCompileOptions } from './maven-compile';
import { MavenPackaging, MavenPackagingOptions } from './maven-packaging';
import { PluginOptions, Pom, PomOptions } from './pom';
import { Projenrc as ProjenrcJava, ProjenrcCommonOptions } from './projenrc';
/**
 * (experimental) Options for `JavaProject`.
 *
 * @experimental
 */
export interface JavaProjectOptions extends ProjectOptions, PomOptions {
    /**
     * (experimental) Final artifact output directory.
     *
     * @default "dist/java"
     * @experimental
     */
    readonly distdir?: string;
    /**
     * (experimental) List of runtime dependencies for this project.
     *
     * Dependencies use the format: `<groupId>/<artifactId>@<semver>`
     *
     * Additional dependencies can be added via `project.addDependency()`.
     *
     * @default []
     * @experimental
     */
    readonly deps?: string[];
    /**
     * (experimental) List of test dependencies for this project.
     *
     * Dependencies use the format: `<groupId>/<artifactId>@<semver>`
     *
     * Additional dependencies can be added via `project.addTestDependency()`.
     *
     * @default []
     * @experimental
     */
    readonly testDeps?: string[];
    /**
     * (experimental) Include junit tests.
     *
     * @default true
     * @experimental
     */
    readonly junit?: boolean;
    /**
     * (experimental) junit options.
     *
     * @default - defaults
     * @experimental
     */
    readonly junitOptions?: JunitOptions;
    /**
     * (experimental) Packaging options.
     *
     * @default - defaults
     * @experimental
     */
    readonly packagingOptions?: MavenPackagingOptions;
    /**
     * (experimental) Compile options.
     *
     * @default - defaults
     * @experimental
     */
    readonly compileOptions?: MavenCompileOptions;
    /**
     * (experimental) Include sample code and test if the relevant directories don't exist.
     *
     * @experimental
     */
    readonly sample?: boolean;
    /**
     * (experimental) The java package to use for the code sample.
     *
     * @default "org.acme"
     * @experimental
     */
    readonly sampleJavaPackage?: string;
    /**
     * (experimental) Use projenrc in java.
     *
     * This will install `projen` as a java depedency and will add a `synth` task which
     * will compile & execute `main()` from `src/main/java/projenrc.java`.
     *
     * @default true
     * @experimental
     */
    readonly projenrcJava?: boolean;
    /**
     * (experimental) Options related to projenrc in java.
     *
     * @default - default options
     * @experimental
     */
    readonly projenrcJavaOptions?: ProjenrcCommonOptions;
}
/**
 * (experimental) Java project.
 *
 * @experimental
 * @pjid java
 */
export declare class JavaProject extends Project {
    /**
     * (experimental) API for managing `pom.xml`.
     *
     * @experimental
     */
    readonly pom: Pom;
    /**
     * (experimental) JUnit component.
     *
     * @experimental
     */
    readonly junit?: Junit;
    /**
     * (experimental) Packaging component.
     *
     * @experimental
     */
    readonly packaging: MavenPackaging;
    /**
     * (experimental) Compile component.
     *
     * @experimental
     */
    readonly compile: MavenCompile;
    /**
     * (experimental) Projenrc component.
     *
     * @experimental
     */
    readonly projenrc?: ProjenrcJava;
    /**
     * (experimental) Maven artifact output directory.
     *
     * @experimental
     */
    readonly distdir: string;
    /**
     * @experimental
     */
    constructor(options: JavaProjectOptions);
    /**
     * (experimental) Adds a runtime dependency.
     *
     * @param spec Format `<groupId>/<artifactId>@<semver>`.
     * @experimental
     */
    addDependency(spec: string): void;
    /**
     * (experimental) Adds a test dependency.
     *
     * @param spec Format `<groupId>/<artifactId>@<semver>`.
     * @experimental
     */
    addTestDependency(spec: string): void;
    /**
     * (experimental) Adds a build plugin to the pom.
     *
     * The plug in is also added as a BUILD dep to the project.
     *
     * @param spec dependency spec (`group/artifact@version`).
     * @param options plugin options.
     * @experimental
     */
    addPlugin(spec: string, options?: PluginOptions): import("../deps").Dependency;
}
