import { JsonFile } from '../json';
import { NodeProject } from '../node-project';
import { TailwindConfig, TailwindConfigOptions } from './tailwind';
/**
 * @experimental
 */
export interface PostCssOptions {
    /**
     * @default "postcss.config.json"
     * @experimental
     */
    readonly fileName?: string;
    /**
     * (experimental) Install Tailwind CSS as a PostCSS plugin.
     *
     * @default true
     * @experimental
     */
    readonly tailwind?: boolean;
    /**
     * (experimental) Tailwind CSS options.
     *
     * @experimental
     */
    readonly tailwindOptions?: TailwindConfigOptions;
}
/**
 * (experimental) Declares a PostCSS dependency with a default config file.
 *
 * @experimental
 */
export declare class PostCss {
    /**
     * @experimental
     */
    readonly fileName: string;
    /**
     * @experimental
     */
    readonly file: JsonFile;
    /**
     * @experimental
     */
    readonly tailwind?: TailwindConfig;
    /**
     * @experimental
     */
    constructor(project: NodeProject, options?: PostCssOptions);
}
