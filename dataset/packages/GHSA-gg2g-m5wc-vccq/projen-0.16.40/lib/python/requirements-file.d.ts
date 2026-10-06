import { FileBase, IResolver } from '../file';
import { Project } from '../project';
import { IPackageProvider } from './python-deps';
/**
 * @experimental
 */
export interface RequirementsFileOptions {
    /**
     * (experimental) Provide a list of packages that can be dynamically updated.
     *
     * @experimental
     */
    readonly packageProvider?: IPackageProvider;
}
/**
 * (experimental) Specifies a list of packages to be installed using pip.
 *
 * @see https://pip.pypa.io/en/stable/reference/pip_install/#requirements-file-format
 * @experimental
 */
export declare class RequirementsFile extends FileBase {
    private readonly packages;
    private readonly packageProvider?;
    /**
     * @experimental
     */
    constructor(project: Project, filePath: string, options: RequirementsFileOptions);
    /**
     * (experimental) Adds the specified packages provided in semver format.
     *
     * Comment lines (start with `#`) are ignored.
     *
     * @param packages Package version in format `<module>@<semver>`.
     * @experimental
     */
    addPackages(...packages: string[]): void;
    private formatDependency;
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
