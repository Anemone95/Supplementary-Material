import { FileBase, FileBaseOptions, IResolver } from './file';
import { Project } from './project';
/**
 * (experimental) Options for `TextFile`.
 *
 * @experimental
 */
export interface TextFileOptions extends FileBaseOptions {
    /**
     * (experimental) The contents of the text file.
     *
     * You can use `addLine()` to append lines.
     *
     * @default [] empty file
     * @experimental
     */
    readonly lines?: string[];
}
/**
 * (experimental) A text file.
 *
 * @experimental
 */
export declare class TextFile extends FileBase {
    private readonly lines;
    /**
     * (experimental) Defines a text file.
     *
     * @param project The project.
     * @param filePath File path.
     * @param options Options.
     * @experimental
     */
    constructor(project: Project, filePath: string, options?: TextFileOptions);
    /**
     * (experimental) Adds a line to the text file.
     *
     * @param line the line to add (can use tokens).
     * @experimental
     */
    addLine(line: string): void;
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(_: IResolver): string | undefined;
}
