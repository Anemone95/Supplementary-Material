/**
 * @experimental
 */
export interface DepsManifest {
    /**
     * (experimental) All dependencies of this module.
     *
     * @experimental
     */
    readonly dependencies: Dependency[];
}
/**
 * (experimental) Coordinates of the dependency (name and version).
 *
 * @experimental
 */
export interface DependencyCoordinates {
    /**
     * (experimental) The package manager name of the dependency (e.g. `leftpad` for npm).
     *
     * NOTE: For package managers that use complex coordinates (like Maven), we
     * will codify it into a string somehow.
     *
     * @experimental
     */
    readonly name: string;
    /**
     * (experimental) Semantic version version requirement.
     *
     * @default - requirement is managed by the package manager (e.g. npm/yarn).
     * @experimental
     */
    readonly version?: string;
}
/**
 * (experimental) Represents a project dependency.
 *
 * @experimental
 */
export interface Dependency extends DependencyCoordinates {
    /**
     * (experimental) Which type of dependency this is (runtime, build-time, etc).
     *
     * @experimental
     */
    readonly type: DependencyType;
    /**
     * (experimental) Additional JSON metadata associated with the dependency (package manager specific).
     *
     * @default {}
     * @experimental
     */
    readonly metadata?: {
        [key: string]: any;
    };
}
/**
 * (experimental) Type of dependency.
 *
 * @experimental
 */
export declare enum DependencyType {
    /**
     * (experimental) The dependency is required for the program/library during runtime.
     *
     * @experimental
     */
    RUNTIME = "runtime",
    /**
     * (experimental) The dependency is required at runtime but expected to be installed by the consumer.
     *
     * @experimental
     */
    PEER = "peer",
    /**
     * (experimental) The dependency is bundled and shipped with the module, so consumers are not required to install it.
     *
     * @experimental
     */
    BUNDLED = "bundled",
    /**
     * (experimental) The dependency is required to run the `build` task.
     *
     * @experimental
     */
    BUILD = "build",
    /**
     * (experimental) The dependency is required to run the `test` task.
     *
     * @experimental
     */
    TEST = "test",
    /**
     * (experimental) The dependency is required for development (e.g. IDE plugins).
     *
     * @experimental
     */
    DEVENV = "devenv"
}
