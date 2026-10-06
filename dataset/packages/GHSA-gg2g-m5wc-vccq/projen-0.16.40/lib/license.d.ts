import { FileBase, IResolver } from './file';
import { Project } from './project';
/**
 * @experimental
 */
export interface LicenseOptions {
    /**
     * (experimental) Copyright owner.
     *
     * @default ""
     * @experimental
     */
    readonly copyrightOwner?: string;
    /**
     * (experimental) Period of license (e.g. "1998-2023").
     *
     * @default - current year (e.g. "2020")
     * @experimental
     */
    readonly copyrightPeriod?: string;
}
/**
 * @experimental
 */
export declare class License extends FileBase {
    private readonly text;
    /**
     * @experimental
     */
    constructor(project: Project, spdx: string, options: LicenseOptions);
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(_: IResolver): string | undefined;
}
