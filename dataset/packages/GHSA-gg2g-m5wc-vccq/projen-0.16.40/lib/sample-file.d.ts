import { Component } from './component';
import { Project } from './project';
/**
 * (experimental) Options for the SampleFile object.
 *
 * @experimental
 */
export interface SampleFileOptions {
    /**
     * (experimental) The contents of the file to write.
     *
     * @experimental
     */
    readonly contents: string;
}
/**
 * (experimental) Produces a file with the given contents but only once, if the file doesn't already exist.
 *
 * Use this for creating example code files or other resources.
 *
 * @experimental
 */
export declare class SampleFile extends Component {
    private readonly filePath;
    private readonly options;
    /**
     * (experimental) Creates a new SampleFile object.
     *
     * @param project - the project to tie this file to.
     * @param filePath - the relative path in the project o put the file.
     * @param options - the options for the file.
     * @experimental
     */
    constructor(project: Project, filePath: string, options: SampleFileOptions);
    /**
     * (experimental) Synthesizes files to the project output directory.
     *
     * @experimental
     */
    synthesize(): void;
    /**
     * A helper function that will write the file once and return if it was written or not.
     * @param dir - the directory for the new file
     * @param filename - the filename for the new file
     * @param contents - the contents of the file to write
     * @return boolean - whether a new file was written or not.
     * @private
     */
    private writeOnceFileContents;
}
/**
 * (experimental) SampleDir options.
 *
 * @experimental
 */
export interface SampleDirOptions {
    /**
     * (experimental) The files to render into the directory.
     *
     * @experimental
     */
    readonly files: {
        [fileName: string]: string;
    };
}
/**
 * (experimental) Renders the given files into the directory if the directory does not exist.
 *
 * Use this to create sample code files
 *
 * @experimental
 */
export declare class SampleDir extends Component {
    private readonly dir;
    private readonly options;
    /**
     * (experimental) Create sample files in the given directory if the given directory does not exist.
     *
     * @param project Parent project to add files to.
     * @param dir directory to add files to.
     * @param options options for which files to create.
     * @experimental
     */
    constructor(project: Project, dir: string, options: SampleDirOptions);
    /**
     * (experimental) Synthesizes files to the project output directory.
     *
     * @experimental
     */
    synthesize(): void;
}
