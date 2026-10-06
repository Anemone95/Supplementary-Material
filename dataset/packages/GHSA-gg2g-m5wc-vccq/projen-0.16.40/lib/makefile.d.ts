import { FileBase, FileBaseOptions, IResolver } from './file';
import { Project } from './project';
/**
 * (experimental) A Make rule.
 *
 * @experimental
 */
export interface Rule {
    /**
     * (experimental) Files to be created or updated by this rule.
     *
     * If the rule is phony then instead this represents the command's name(s).
     *
     * @experimental
     */
    readonly targets: string[];
    /**
     * (experimental) Files that are used as inputs to create a target.
     *
     * @default []
     * @experimental
     */
    readonly prerequisites?: string[];
    /**
     * (experimental) Commands that are run (using prerequisites as inputs) to create a target.
     *
     * @default []
     * @experimental
     */
    readonly recipe?: string[];
    /**
     * (experimental) Marks whether the target is phony.
     *
     * @default false
     * @experimental
     */
    readonly phony?: boolean;
}
/**
 * (experimental) Options for Makefiles.
 *
 * @experimental
 */
export interface MakefileOptions extends FileBaseOptions {
    /**
     * (experimental) List of targets to build when Make is invoked without specifying any targets.
     *
     * @default []
     * @experimental
     */
    readonly all?: string[];
    /**
     * (experimental) Rules to include in the Makefile.
     *
     * @default []
     * @experimental
     */
    readonly rules?: Rule[];
}
/**
 * (experimental) Minimal Makefile.
 *
 * @experimental
 */
export declare class Makefile extends FileBase {
    /**
     * (experimental) List of rule definitions.
     *
     * @experimental
     */
    readonly rules: Rule[];
    private readonly all;
    /**
     * @experimental
     */
    constructor(project: Project, filePath: string, options?: MakefileOptions);
    /**
     * (experimental) Add a target to all.
     *
     * @experimental
     */
    addAll(target: string): Makefile;
    /**
     * (experimental) Add multiple targets to all.
     *
     * @experimental
     */
    addAlls(...targets: string[]): Makefile;
    /**
     * (experimental) Add a rule to the Makefile.
     *
     * @experimental
     */
    addRule(rule: Rule): Makefile;
    /**
     * (experimental) Add multiple rules to the Makefile.
     *
     * @experimental
     */
    addRules(...rules: Rule[]): Makefile;
    private validateRule;
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
