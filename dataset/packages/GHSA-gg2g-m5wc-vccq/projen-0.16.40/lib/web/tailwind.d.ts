import { JsonFile } from '../json';
import { NodeProject } from '../node-project';
/**
 * @experimental
 */
export interface TailwindConfigOptions {
    /**
     * @default "tailwind.config.json"
     * @experimental
     */
    readonly fileName?: string;
}
/**
 * (experimental) Declares a Tailwind CSS configuration file.
 *
 * There are multiple ways to add Tailwind CSS in your node project - see:
 * https://tailwindcss.com/docs/installation
 *
 * @see PostCss
 * @experimental
 */
export declare class TailwindConfig {
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
    constructor(project: NodeProject, options?: TailwindConfigOptions);
}
