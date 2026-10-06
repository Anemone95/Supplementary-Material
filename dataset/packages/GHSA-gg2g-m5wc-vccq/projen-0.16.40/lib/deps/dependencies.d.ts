import { Component } from '../component';
import { Project } from '../project';
import { Dependency, DependencyCoordinates, DependencyType } from './model';
/**
 * (experimental) The `Dependencies` component is responsible to track the list of dependencies a project has, and then used by project types as the model for rendering project-specific dependency manifests such as the dependencies section `package.json` files.
 *
 * To add a dependency you can use a project-type specific API such as
 * `nodeProject.addDeps()` or use the generic API of `project.deps`:
 *
 * @experimental
 */
export declare class Dependencies extends Component {
    /**
     * (experimental) The project-relative path of the deps manifest file.
     *
     * @experimental
     */
    static readonly MANIFEST_FILE: string;
    /**
     * (experimental) Returns the coordinates of a dependency spec.
     *
     * Given `foo@^3.4.0` returns `{ name: "foo", version: "^3.4.0" }`.
     * Given `bar@npm:@bar/legacy` returns `{ name: "bar", version: "npm:@bar/legacy" }`.
     *
     * @experimental
     */
    static parseDependency(spec: string): DependencyCoordinates;
    private readonly _deps;
    /**
     * (experimental) Adds a dependencies component to the project.
     *
     * @param project The parent project.
     * @experimental
     */
    constructor(project: Project);
    /**
     * (experimental) A copy of all dependencies recorded for this project.
     *
     * The list is sorted by type->name->version
     *
     * @experimental
     */
    get all(): Dependency[];
    /**
     * (experimental) Returns a dependency by name.
     *
     * Fails if there is no dependency defined by that name or if `type` is not
     * provided and there is more then one dependency type for this dependency.
     *
     * @param name The name of the dependency.
     * @param type The dependency type.
     * @returns a copy (cannot be modified)
     * @experimental
     */
    getDependency(name: string, type?: DependencyType): Dependency;
    /**
     * (experimental) Adds a dependency to this project.
     *
     * @param spec The dependency spec in the format `MODULE[@VERSION]` where `MODULE` is the package-manager-specific module name and `VERSION` is an optional semantic version requirement (e.g. `^3.4.0`).
     * @param type The type of the dependency.
     * @experimental
     */
    addDependency(spec: string, type: DependencyType, metadata?: {
        [key: string]: any;
    }): Dependency;
    /**
     * (experimental) Removes a dependency.
     *
     * @param name The name of the module to remove (without the version).
     * @param type The dependency type.
     * @experimental
     */
    removeDependency(name: string, type?: DependencyType): void;
    private tryGetDependencyIndex;
    private toJson;
}
