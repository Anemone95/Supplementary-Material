import { FileBase, IResolver } from './file';
import { Project } from './project';
/**
 * @experimental
 */
export declare class IgnoreFile extends FileBase {
    private readonly _excludes;
    private readonly _includes;
    /**
     * @experimental
     */
    constructor(project: Project, filePath: string);
    /**
     * (experimental) Add ignore patterns.
     *
     * Files that match this pattern will be ignored. If the
     * pattern starts with a negation mark `!`, files that match will _not_ be
     * ignored.
     *
     * Comment lines (start with `#`) are ignored.
     *
     * @param patterns Ignore patterns.
     * @experimental
     */
    addPatterns(...patterns: string[]): void;
    /**
     * (experimental) Removes patterns previously added from the ignore file.
     *
     * If `addPattern()` is called after this, the pattern will be added again.
     *
     * @param patterns patters to remove.
     * @experimental
     */
    removePatterns(...patterns: string[]): void;
    /**
     * (experimental) Ignore the files that match these patterns.
     *
     * @param patterns The patterns to match.
     * @experimental
     */
    exclude(...patterns: string[]): void;
    /**
     * (experimental) Always include the specified file patterns.
     *
     * @param patterns Patterns to include in git commits.
     * @experimental
     */
    include(...patterns: string[]): void;
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
