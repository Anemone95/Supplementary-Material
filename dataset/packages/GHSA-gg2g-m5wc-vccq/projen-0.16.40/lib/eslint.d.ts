import { Component } from './component';
import { NodeProject } from './node-project';
/**
 * @experimental
 */
export interface EslintOptions {
    /**
     * (experimental) Path to `tsconfig.json` which should be used by eslint.
     *
     * @default "./tsconfig.json"
     * @experimental
     */
    readonly tsconfigPath?: string;
    /**
     * (experimental) Directories with source files to lint (e.g. [ "src" ]).
     *
     * @experimental
     */
    readonly dirs: string[];
    /**
     * (experimental) Directories with source files that include tests and build tools.
     *
     * These
     * sources are linted but may also import packages from `devDependencies`.
     *
     * @default []
     * @experimental
     */
    readonly devdirs?: string[];
    /**
     * (experimental) File types that should be linted (e.g. [ ".js", ".ts" ]).
     *
     * @default [".ts"]
     * @experimental
     */
    readonly fileExtensions?: string[];
    /**
     * (experimental) List of file patterns that should not be linted, using the same syntax as .gitignore patterns.
     *
     * @default [ '*.js', '*.d.ts', 'node_modules/', '*.generated.ts', 'coverage' ]
     * @experimental
     */
    readonly ignorePatterns?: string[];
    /**
     * (experimental) Should we lint .projenrc.js.
     *
     * @default true
     * @experimental
     */
    readonly lintProjenRc?: boolean;
}
/**
 * (experimental) eslint rules override.
 *
 * @experimental
 */
export interface EslintOverride {
    /**
     * (experimental) Files or file patterns on which to apply the override.
     *
     * @experimental
     */
    readonly files: string[];
    /**
     * (experimental) The overriden rules.
     *
     * @experimental
     */
    readonly rules: {
        [rule: string]: any;
    };
}
/**
 * @experimental
 */
export declare class Eslint extends Component {
    /**
     * (experimental) eslint rules.
     *
     * @experimental
     */
    readonly rules: {
        [rule: string]: any[];
    };
    /**
     * (experimental) eslint overrides.
     *
     * @experimental
     */
    readonly overrides: EslintOverride[];
    /**
     * (experimental) Direct access to the eslint configuration (escape hatch).
     *
     * @experimental
     */
    readonly config: any;
    /**
     * (experimental) File patterns that should not be linted.
     *
     * @experimental
     */
    readonly ignorePatterns: string[];
    /**
     * @experimental
     */
    constructor(project: NodeProject, options: EslintOptions);
    /**
     * (experimental) Add an eslint rule.
     *
     * @experimental
     */
    addRules(rules: {
        [rule: string]: any;
    }): void;
    /**
     * (experimental) Add an eslint override.
     *
     * @experimental
     */
    addOverride(override: EslintOverride): void;
    /**
     * (experimental) Do not lint these files.
     *
     * @experimental
     */
    addIgnorePattern(pattern: string): void;
}
