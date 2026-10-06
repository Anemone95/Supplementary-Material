import { Component } from './component';
import { Project } from './project';
/**
 * @experimental
 */
export interface FileBaseOptions {
    /**
     * (experimental) Indicates whether this file should be committed to git or ignored.
     *
     * By
     * default, all generated files are committed and anti-tamper is used to
     * protect against manual modifications.
     *
     * @default true
     * @experimental
     */
    readonly committed?: boolean;
    /**
     * (experimental) Update the project's .gitignore file.
     *
     * @default true
     * @experimental
     */
    readonly editGitignore?: boolean;
    /**
     * (experimental) Whether the generated file should be readonly.
     *
     * @default true
     * @experimental
     */
    readonly readonly?: boolean;
    /**
     * (experimental) Whether the generated file should be marked as executable.
     *
     * @default false
     * @experimental
     */
    readonly executable?: boolean;
}
/**
 * @experimental
 */
export declare abstract class FileBase extends Component {
    /**
     * (experimental) The marker to embed in files in order to identify them as projen files.
     *
     * This marker is used to prune these files before synthesis.
     *
     * @experimental
     */
    static readonly PROJEN_MARKER: string;
    /**
     * (experimental) The file path, relative to the project root.
     *
     * @experimental
     */
    readonly path: string;
    /**
     * (experimental) Indicates if the file should be read-only or read-write.
     *
     * @experimental
     */
    readonly: boolean;
    /**
     * (experimental) Indicates if the file should be marked as executable.
     *
     * @experimental
     */
    executable: boolean;
    /**
     * (experimental) The absolute path of this file.
     *
     * @experimental
     */
    readonly absolutePath: string;
    /**
     * @experimental
     */
    constructor(project: Project, filePath: string, options?: FileBaseOptions);
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @param resolver Call `resolver.resolve(obj)` on any objects in order to resolve token functions.
     * @returns the content to synthesize or undefined to skip the file
     * @experimental
     */
    protected abstract synthesizeContent(resolver: IResolver): string | undefined;
    /**
     * (experimental) Writes the file to the project's output directory.
     *
     * @experimental
     */
    synthesize(): void;
}
/**
 * (experimental) API for resolving tokens when synthesizing file content.
 *
 * @experimental
 */
export interface IResolver {
    /**
     * (experimental) Given a value (object/string/array/whatever, looks up any functions inside the object and returns an object where all functions are called.
     *
     * @param value The value to resolve.
     * @experimental
     * @package options Resolve options
     */
    resolve(value: any, options?: ResolveOptions): any;
}
/**
 * (experimental) Resolve options.
 *
 * @experimental
 */
export interface ResolveOptions {
    /**
     * (experimental) Omits empty arrays and objects.
     *
     * @default false
     * @experimental
     */
    readonly omitEmpty?: boolean;
    /**
     * (experimental) Context arguments.
     *
     * @default []
     * @experimental
     */
    readonly args?: any[];
}
