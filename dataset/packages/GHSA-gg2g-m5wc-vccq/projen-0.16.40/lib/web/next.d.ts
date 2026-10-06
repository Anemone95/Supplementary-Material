import { Component } from '../component';
import { FileBase, FileBaseOptions, IResolver } from '../file';
import { NodeProject, NodeProjectOptions } from '../node-project';
import { TypeScriptAppProject, TypeScriptProjectOptions } from '../typescript';
/**
 * @experimental
 */
export interface NextJsCommonProjectOptions {
    /**
     * (experimental) Assets directory.
     *
     * @default "public"
     * @experimental
     */
    readonly assetsdir?: string;
    /**
     * (experimental) Setup Tailwind CSS as a PostCSS plugin.
     *
     * @default true
     * @see https://tailwindcss.com/docs/installation
     * @experimental
     */
    readonly tailwind?: boolean;
}
/**
 * @experimental
 */
export interface NextJsTypeScriptProjectOptions extends NextJsCommonProjectOptions, TypeScriptProjectOptions {
}
/**
 * @experimental
 */
export interface NextJsProjectOptions extends NextJsCommonProjectOptions, NodeProjectOptions {
    /**
     * (experimental) Typescript sources directory.
     *
     * @default "src"
     * @experimental
     */
    readonly srcdir?: string;
    /**
     * (experimental) Generate one-time sample in `pages/` and `public/` if there are no files there.
     *
     * @default true
     * @experimental
     */
    readonly sampleCode?: boolean;
}
/**
 * (experimental) Next.js project without TypeScript.
 *
 * @experimental
 * @pjid nextjs
 */
export declare class NextJsProject extends NodeProject {
    /**
     * (experimental) The directory in which source files reside.
     *
     * @experimental
     */
    readonly srcdir: string;
    /**
     * (experimental) The directory in which app assets reside.
     *
     * @experimental
     */
    readonly assetsdir: string;
    /**
     * (experimental) Setup Tailwind as a PostCSS plugin.
     *
     * @see https://tailwindcss.com/docs/installation
     * @experimental
     */
    readonly tailwind: boolean;
    /**
     * @experimental
     */
    constructor(options: NextJsProjectOptions);
}
/**
 * (experimental) Next.js project with TypeScript.
 *
 * @experimental
 * @pjid nextjs-ts
 */
export declare class NextJsTypeScriptProject extends TypeScriptAppProject {
    /**
     * (experimental) The directory in which source files reside.
     *
     * @experimental
     */
    readonly srcdir: string;
    /**
     * (experimental) The directory in which app assets reside.
     *
     * @experimental
     */
    readonly assetsdir: string;
    /**
     * (experimental) Setup Tailwind as a PostCSS plugin.
     *
     * @see https://tailwindcss.com/docs/installation
     * @experimental
     */
    readonly tailwind: boolean;
    /**
     * (experimental) TypeScript definition file included that ensures Next.js types are picked up by the TypeScript compiler.
     *
     * @see https://nextjs.org/docs/basic-features/typescript
     * @experimental
     */
    readonly nextJsTypeDef: NextJsTypeDef;
    /**
     * @experimental
     */
    constructor(options: NextJsTypeScriptProjectOptions);
}
/**
 * @experimental
 */
export interface NextJsTypeDefOptions extends FileBaseOptions {
}
/**
 * @experimental
 */
export declare class NextJsTypeDef extends FileBase {
    /**
     * @experimental
     */
    constructor(project: NextJsTypeScriptProject, filePath: string, options?: NextJsTypeDefOptions);
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    protected synthesizeContent(_: IResolver): string | undefined;
}
/**
 * @experimental
 */
export interface NextComponentOptions {
    /**
     * (experimental) Whether to apply options specific for TypeScript Next.js projects.
     *
     * @default false
     * @experimental
     */
    readonly typescript?: boolean;
    /**
     * (experimental) Setup Tailwind as a PostCSS plugin.
     *
     * @default true
     * @see https://tailwindcss.com/docs/installation
     * @experimental
     */
    readonly tailwind?: boolean;
}
/**
 * @experimental
 */
export declare class NextComponent extends Component {
    private readonly typescript;
    private readonly tailwind;
    /**
     * @experimental
     */
    constructor(project: NodeProject, options: NextComponentOptions);
}
