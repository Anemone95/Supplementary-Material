import { IResolver } from './file';
import { ObjectFile, ObjectFileOptions } from './object-file';
import { Project } from './project';
/**
 * (experimental) Options for `XmlFile`.
 *
 * @experimental
 */
export interface XmlFileOptions extends ObjectFileOptions {
}
/**
 * (experimental) Represents an XML file.
 *
 * Objects passed in will be synthesized using the npm "xml" library.
 *
 * @see https://www.npmjs.com/package/xml
 * @experimental
 */
export declare class XmlFile extends ObjectFile {
    /**
     * @experimental
     */
    constructor(project: Project, filePath: string, options?: XmlFileOptions);
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
