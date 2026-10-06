import { FileBase, FileBaseOptions, IResolver } from './file';
import { IMarkableFile, MarkableFileOptions } from './markable-file';
import { Project } from './project';
/**
 * (experimental) Options for `ObjectFile`.
 *
 * @experimental
 */
export interface ObjectFileOptions extends FileBaseOptions, MarkableFileOptions {
    /**
     * (experimental) The object that will be serialized.
     *
     * You can modify the object's contents
     * before synthesis.
     *
     * @default {} an empty object (use `file.obj` to mutate).
     * @experimental
     */
    readonly obj?: any;
    /**
     * (experimental) Omits empty objects and arrays.
     *
     * @default false
     * @experimental
     */
    readonly omitEmpty?: boolean;
}
/**
 * (experimental) Represents an Object file.
 *
 * @experimental
 */
export declare abstract class ObjectFile extends FileBase implements IMarkableFile {
    /**
     * The output object. This object can be mutated until the project is
     * synthesized.
     */
    private readonly obj;
    /**
     * (experimental) Indicates if the projen marker JSON-comment will be added to the output object.
     *
     * @experimental
     */
    readonly marker: boolean;
    /**
     * An object to be merged on top of `obj` after the resolver is called
     */
    private readonly rawOverrides;
    /**
     * (experimental) Indicates if empty objects and arrays are omitted from the output object.
     *
     * @experimental
     */
    readonly omitEmpty: boolean;
    /**
     * @experimental
     */
    constructor(project: Project, filePath: string, options: ObjectFileOptions);
    /**
     * (experimental) Adds an override to the synthesized object file.
     *
     * If the override is nested, separate each nested level using a dot (.) in the path parameter.
     * If there is an array as part of the nesting, specify the index in the path.
     *
     * To include a literal `.` in the property name, prefix with a `\`. In most
     * programming languages you will need to write this as `"\\."` because the
     * `\` itself will need to be escaped.
     *
     * For example,
     * ```typescript
     * project.tsconfig.file.addOverride('compilerOptions.alwaysStrict', true);
     * project.tsconfig.file.addOverride('compilerOptions.lib', ['dom', 'dom.iterable', 'esnext']);
     * ```
     * would add the overrides
     * ```json
     * "compilerOptions": {
     *    "alwaysStrict": true,
     *    "lib": [
     *      "dom",
     *      "dom.iterable",
     *      "esnext"
     *    ]
     *    ...
     * }
     * ...
     * ```
     *
     * @param path - The path of the property, you can use dot notation to override values in complex types.
     * @param value - The value.
     * @experimental
     */
    addOverride(path: string, value: any): void;
    /**
     * (experimental) Syntactic sugar for `addOverride(path, undefined)`.
     *
     * @param path The path of the value to delete.
     * @experimental
     */
    addDeletionOverride(path: string): void;
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
