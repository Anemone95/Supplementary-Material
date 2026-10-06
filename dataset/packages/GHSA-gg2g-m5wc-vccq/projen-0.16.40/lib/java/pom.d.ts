import { Component } from '../component';
import { Project } from '../project';
/**
 * (experimental) Options for `Pom`.
 *
 * @experimental
 */
export interface PomOptions {
    /**
     * (experimental) This is generally unique amongst an organization or a project.
     *
     * For example,
     * all core Maven artifacts do (well, should) live under the groupId
     * org.apache.maven. Group ID's do not necessarily use the dot notation, for
     * example, the junit project. Note that the dot-notated groupId does not have
     * to correspond to the package structure that the project contains. It is,
     * however, a good practice to follow. When stored within a repository, the
     * group acts much like the Java packaging structure does in an operating
     * system. The dots are replaced by OS specific directory separators (such as
     * '/' in Unix) which becomes a relative directory structure from the base
     * repository. In the example given, the org.codehaus.mojo group lives within
     * the directory $M2_REPO/org/codehaus/mojo.
     *
     * @default "org.acme"
     * @experimental
     */
    readonly groupId: string;
    /**
     * (experimental) The artifactId is generally the name that the project is known by.
     *
     * Although
     * the groupId is important, people within the group will rarely mention the
     * groupId in discussion (they are often all be the same ID, such as the
     * MojoHaus project groupId: org.codehaus.mojo). It, along with the groupId,
     * creates a key that separates this project from every other project in the
     * world (at least, it should :) ). Along with the groupId, the artifactId
     * fully defines the artifact's living quarters within the repository. In the
     * case of the above project, my-project lives in
     * $M2_REPO/org/codehaus/mojo/my-project.
     *
     * @default "my-app"
     * @experimental
     */
    readonly artifactId: string;
    /**
     * (experimental) This is the last piece of the naming puzzle.
     *
     * groupId:artifactId denotes a
     * single project but they cannot delineate which incarnation of that project
     * we are talking about. Do we want the junit:junit of 2018 (version 4.12), or
     * of 2007 (version 3.8.2)? In short: code changes, those changes should be
     * versioned, and this element keeps those versions in line. It is also used
     * within an artifact's repository to separate versions from each other.
     * my-project version 1.0 files live in the directory structure
     * $M2_REPO/org/codehaus/mojo/my-project/1.0.
     *
     * @default "0.1.0"
     * @experimental
     */
    readonly version: string;
    /**
     * (experimental) Project packaging format.
     *
     * @default "jar"
     * @experimental
     */
    readonly packaging?: string;
    /**
     * (experimental) Description of a project is always good.
     *
     * Although this should not replace
     * formal documentation, a quick comment to any readers of the POM is always
     * helpful.
     *
     * @default undefined
     * @experimental
     */
    readonly description?: string;
    /**
     * (experimental) The URL, like the name, is not required.
     *
     * This is a nice gesture for
     * projects users, however, so that they know where the project lives.
     *
     * @default undefined
     * @experimental
     */
    readonly url?: string;
}
/**
 * (experimental) A Project Object Model or POM is the fundamental unit of work in Maven.
 *
 * It is
 * an XML file that contains information about the project and configuration
 * details used by Maven to build the project.
 *
 * @experimental
 */
export declare class Pom extends Component {
    /**
     * (experimental) The name of the pom file.
     *
     * @experimental
     */
    readonly fileName: string;
    /**
     * (experimental) Maven group ID.
     *
     * @experimental
     */
    readonly groupId: string;
    /**
     * (experimental) Maven artifact ID.
     *
     * @experimental
     */
    readonly artifactId: string;
    /**
     * (experimental) Project version.
     *
     * @experimental
     */
    readonly version: string;
    /**
     * (experimental) Maven packaging format.
     *
     * @experimental
     */
    readonly packaging: string;
    /**
     * (experimental) Project display name.
     *
     * @experimental
     */
    readonly name?: string;
    /**
     * (experimental) Project description.
     *
     * @experimental
     */
    readonly description?: string;
    /**
     * (experimental) Project URL.
     *
     * @experimental
     */
    readonly url?: string;
    private readonly properties;
    /**
     * @experimental
     */
    constructor(project: Project, options: PomOptions);
    /**
     * (experimental) Adds a key/value property to the pom.
     *
     * @param key the key.
     * @param value the value.
     * @experimental
     */
    addProperty(key: string, value: string): void;
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
    private synthPom;
    private synthDependencies;
}
/**
 * (experimental) Options for Maven plugins.
 *
 * @experimental
 */
export interface PluginOptions {
    /**
     * (experimental) Plugin key/value configuration.
     *
     * @default {}
     * @experimental
     */
    readonly configuration?: {
        [key: string]: any;
    };
    /**
     * (experimental) Plugin executions.
     *
     * @default []
     * @experimental
     */
    readonly executions?: PluginExecution[];
    /**
     * (experimental) You could configure the dependencies for the plugin.
     *
     * Dependencies are in `<groupId>/<artifactId>@<semver>` format.
     *
     * @default []
     * @experimental
     */
    readonly dependencies?: string[];
}
/**
 * (experimental) Plugin execution definition.
 *
 * @experimental
 */
export interface PluginExecution {
    /**
     * (experimental) The ID.
     *
     * @experimental
     */
    readonly id: string;
    /**
     * (experimental) Which Maven goals this plugin should be associated with.
     *
     * @experimental
     */
    readonly goals: string[];
}
