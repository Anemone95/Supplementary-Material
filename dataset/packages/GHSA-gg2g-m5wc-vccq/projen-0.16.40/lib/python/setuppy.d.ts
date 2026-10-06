import { FileBase, IResolver } from '../file';
import { PythonProject } from './python-project';
/**
 * (experimental) Fields to pass in the setup() function of setup.py.
 *
 * @see https://docs.python.org/3/distutils/setupscript.html
 * @experimental
 */
export interface SetupPyOptions {
    /**
     * (experimental) Name of the package.
     *
     * @experimental
     */
    readonly name?: string;
    /**
     * (experimental) List of submodules to be packaged.
     *
     * @experimental
     */
    readonly packages?: string[];
    /**
     * (experimental) Author's name.
     *
     * @experimental
     */
    readonly authorName?: string;
    /**
     * (experimental) Author's e-mail.
     *
     * @experimental
     */
    readonly authorEmail?: string;
    /**
     * (experimental) Manually specify package version.
     *
     * @experimental
     */
    readonly version?: string;
    /**
     * (experimental) A short project description.
     *
     * @experimental
     */
    readonly description?: string;
    /**
     * (experimental) The project license.
     *
     * @experimental
     */
    readonly license?: string;
    /**
     * (experimental) Package's Homepage / Website.
     *
     * @experimental
     */
    readonly homepage?: string;
    /**
     * (experimental) A list of PyPI trove classifiers that describe the project.
     *
     * @see https://pypi.org/classifiers/
     * @experimental
     */
    readonly classifiers?: string[];
    /**
     * Escape hatch to allow any value
     */
    readonly [name: string]: any;
}
/**
 * (experimental) Python packaging script where package metadata can be placed.
 *
 * @experimental
 */
export declare class SetupPy extends FileBase {
    private readonly setupConfig;
    /**
     * @experimental
     */
    constructor(project: PythonProject, options: SetupPyOptions);
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(resolver: IResolver): string | undefined;
    private renameFields;
}
