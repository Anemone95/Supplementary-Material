import { Project } from './project';
import { SampleFile } from './sample-file';
/**
 * (experimental) SampleReadme Properties.
 *
 * @experimental
 */
export interface SampleReadmeProps {
    /**
     * (experimental) The name of the README.md file.
     *
     * @default "README.md"
     * @experimental
     * @example
     *
     * "readme.md"
     */
    readonly filename?: string;
    /**
     * (experimental) The contents.
     *
     * @default "# replace this"
     * @experimental
     */
    readonly contents?: string;
}
/**
 * (experimental) Represents a README.md sample file. You are expected to manage this file after creation.
 *
 * @experimental
 */
export declare class SampleReadme extends SampleFile {
    /**
     * @experimental
     */
    constructor(project: Project, props?: SampleReadmeProps);
}
