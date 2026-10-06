import { Component } from '../component';
import { FileBase, FileBaseOptions, IResolver } from '../file';
import { NodeProject, NodeProjectOptions } from '../node-project';
import { TypeScriptAppProject, TypeScriptProjectOptions } from '../typescript';
/**
 * @experimental
 */
export interface ReactTypeScriptProjectOptions extends TypeScriptProjectOptions {
}
/**
 * @experimental
 */
export interface ReactProjectOptions extends NodeProjectOptions {
    /**
     * (experimental) Source directory.
     *
     * @default "src"
     * @experimental
     */
    readonly srcdir?: string;
    /**
     * (experimental) Generate one-time sample in `src/` and `public/` if there are no files there.
     *
     * @default true
     * @experimental
     */
    readonly sampleCode?: boolean;
}
/**
 * (experimental) React project without TypeScript.
 *
 * @experimental
 * @pjid react
 */
export declare class ReactProject extends NodeProject {
    /**
     * (experimental) The directory in which source files reside.
     *
     * @default "src"
     * @experimental
     */
    readonly srcdir: string;
    /**
     * @experimental
     */
    constructor(options: ReactProjectOptions);
}
/**
 * (experimental) React project with TypeScript.
 *
 * @experimental
 * @pjid react-ts
 */
export declare class ReactTypeScriptProject extends TypeScriptAppProject {
    /**
     * (experimental) The directory in which source files reside.
     *
     * @experimental
     */
    readonly srcdir: string;
    /**
     * (experimental) TypeScript definition file included that ensures React types are picked up by the TypeScript compiler.
     *
     * @experimental
     */
    readonly reactTypeDef: ReactTypeDef;
    /**
     * @experimental
     */
    constructor(options: ReactTypeScriptProjectOptions);
}
/**
 * @experimental
 */
export interface ReactComponentOptions {
    /**
     * (experimental) Whether to apply options specific for TypeScript React projects.
     *
     * @default false
     * @experimental
     */
    readonly typescript?: boolean;
}
/**
 * @experimental
 */
export declare class ReactComponent extends Component {
    private readonly typescript;
    /**
     * @experimental
     */
    constructor(project: NodeProject, options: ReactComponentOptions);
}
/**
 * @experimental
 */
export interface ReactTypeDefOptions extends FileBaseOptions {
}
/**
 * @experimental
 */
export declare class ReactTypeDef extends FileBase {
    /**
     * @experimental
     */
    constructor(project: ReactTypeScriptProject, filePath: string, options?: ReactTypeDefOptions);
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(_: IResolver): string | undefined;
}
