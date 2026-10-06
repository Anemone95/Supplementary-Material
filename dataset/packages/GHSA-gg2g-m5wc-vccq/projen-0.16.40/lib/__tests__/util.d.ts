/// <reference types="node" />
import { Project, ProjectOptions } from '..';
export declare class TestProject extends Project {
    constructor(options?: Omit<ProjectOptions, 'name'>);
    postSynthesize(): void;
}
export declare function execProjenCLI(workdir: string, args?: string[]): Buffer;
export interface SynthOutput {
    [filePath: string]: any;
}
export declare function mkdtemp(): string;
export declare function synthSnapshot(project: Project): any;
export declare function synthSnapshotWithPost(project: Project): SynthOutput;
export interface DirectorySnapshotOptions {
    /**
     * Globs of files to exclude.
     * @default [] include all files
     */
    readonly excludeGlobs?: string[];
}
export declare function directorySnapshot(root: string, options?: DirectorySnapshotOptions): SynthOutput;
