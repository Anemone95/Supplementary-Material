/**
 * (experimental) Options for files that may include the Projen marker.
 *
 * @experimental
 */
export interface MarkableFileOptions {
    /**
     * (experimental) Adds the projen marker to the file.
     *
     * @default false
     * @experimental
     */
    readonly marker?: boolean;
}
/**
 * (experimental) Files that may include the Projen marker.
 *
 * @experimental
 */
export interface IMarkableFile {
    /**
     * (experimental) Adds the projen marker to the file.
     *
     * @default false
     * @experimental
     */
    readonly marker: boolean;
}
