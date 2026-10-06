/**
 * @experimental
 */
export interface IPythonEnv {
    /**
     * (experimental) Initializes the virtual environment if it doesn't exist (called during post-synthesis).
     *
     * @experimental
     */
    setupEnvironment(): void;
}
