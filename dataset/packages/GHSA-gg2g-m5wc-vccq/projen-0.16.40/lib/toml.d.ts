import { IResolver } from './file';
import { ObjectFile, ObjectFileOptions } from './object-file';
import { Project } from './project';
/**
 * (experimental) Options for `TomlFile`.
 *
 * @experimental
 */
export interface TomlFileOptions extends ObjectFileOptions {
}
/**
 * (experimental) Represents a TOML file.
 *
 * @experimental
 */
export declare class TomlFile extends ObjectFile {
    /**
     * @experimental
     */
    constructor(project: Project, filePath: string, options: TomlFileOptions);
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
