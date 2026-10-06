import { Dependency } from '../deps';
import { Task } from '../tasks';
/**
 * @experimental
 */
export interface IPythonDeps {
    /**
     * (experimental) A task that installs and updates dependencies.
     *
     * @experimental
     */
    readonly installTask: Task;
    /**
     * (experimental) Adds a runtime dependency.
     *
     * @param spec Format `<module>@<semver>`.
     * @experimental
     */
    addDependency(spec: string): void;
    /**
     * (experimental) Adds a dev dependency.
     *
     * @param spec Format `<module>@<semver>`.
     * @experimental
     */
    addDevDependency(spec: string): void;
    /**
     * (experimental) Installs dependencies (called during post-synthesis).
     *
     * @experimental
     */
    installDependencies(): void;
}
/**
 * @experimental
 */
export interface IPackageProvider {
    /**
     * (experimental) An array of packages (may be dynamically generated).
     *
     * @experimental
     */
    readonly packages: Dependency[];
}
