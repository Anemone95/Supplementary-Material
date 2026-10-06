/**
 * @deprecated This class will be removed in upcoming releases. if you wish to
 * specify semver requirements in `deps`, `devDeps`, etc, specify them like so
 * `express@^2.1`.
 */
export declare class Semver {
    readonly spec: string;
    /**
     * @deprecated
     */
    static of(spec: string): Semver;
    /**
     * (deprecated) Latest version.
     *
     * @deprecated
     */
    static latest(): Semver;
    /**
     * (deprecated) Accept only an exact version.
     *
     * @deprecated
     */
    static pinned(version: string): Semver;
    /**
     * (deprecated) Accept any minor version.
     *
     * >= version
     * < next major version
     *
     * @deprecated
     */
    static caret(version: string): Semver;
    /**
     * (deprecated) Accept patches.
     *
     * >= version
     * < next minor version
     *
     * @deprecated
     */
    static tilde(version: string): Semver;
    /**
     * @deprecated
     */
    readonly mode?: string;
    private constructor();
    /**
     * @deprecated
     */
    get version(): string | undefined;
}
