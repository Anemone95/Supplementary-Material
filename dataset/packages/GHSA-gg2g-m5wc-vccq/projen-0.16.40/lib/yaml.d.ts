import { IResolver } from './file';
import { ObjectFile, ObjectFileOptions } from './object-file';
import { Project } from './project';
/**
 * (experimental) Options for `JsonFile`.
 *
 * @experimental
 */
export interface YamlFileOptions extends ObjectFileOptions {
}
/**
 * (experimental) Represents a YAML file.
 *
 * @experimental
 */
export declare class YamlFile extends ObjectFile {
    /**
     * @experimental
     */
    constructor(project: Project, filePath: string, options: YamlFileOptions);
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
