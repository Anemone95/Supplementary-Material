import { AppServiceRegistration } from "matrix-appservice";
export interface CliOpts<ConfigType extends Record<string, unknown>> {
    run: (port: number, config: ConfigType | null, registration: AppServiceRegistration | null) => void;
    onConfigChanged?: (config: ConfigType) => void;
    generateRegistration?: (reg: AppServiceRegistration, cb: (finalReg: AppServiceRegistration) => void) => void;
    bridgeConfig?: {
        affectsRegistration?: boolean;
        schema: string | Record<string, unknown>;
        defaults: Record<string, unknown>;
    };
    registrationPath?: string;
    enableRegistration?: boolean;
    enableLocalpart?: boolean;
    port?: number;
    noUrl?: boolean;
}
interface CliArgs {
    "generate-registration": boolean;
    config: string;
    url?: string;
    localpart: string;
    port: number;
    file: string;
    help: boolean;
}
export declare class Cli<ConfigType extends Record<string, unknown>> {
    static DEFAULT_PORT: number;
    static DEFAULT_WATCH_INTERVAL: number;
    static DEFAULT_FILENAME: string;
    private bridgeConfig;
    private args;
    private opts;
    /**
     * @constructor
     * @param opts CLI options
     * @param opts.run The function called when you should run the bridge.
     * @param opts.generateRegistration The function
     * called when you should generate a registration.
     * @param opts.bridgeConfig Bridge-specific config info. If null, no
     * --config option will be present in the CLI. Default: null.
     * @param opts.bridgeConfig.affectsRegistration True to make the
     * --config option required when generating the registration. The parsed config
     * can be accessed via <code>Cli.getConfig()</code>.
     * @param opts.bridgeConfig.schema Path to a schema YAML file
     * (string) or the parsed schema file (Object).
     * @param opts.bridgeConfig.defaults The default options for the
     * config file.
     * @param opts.noUrl Don't ask user for appservice url when generating
     * registration.
     * @param opts.enableRegistration Enable '--generate-registration'.
     * Default True.
     * @param opts.registrationPath The path to write the registration
     * file to. Users can overwrite this with -f.
     * @param opts.enableLocalpart Enable '--localpart [-l]'. Default: false.
     */
    constructor(opts: CliOpts<ConfigType>);
    /**
     * Get the parsed arguments. Only set after run is called and arguments parsed.
     * @return The parsed arguments
     */
    getArgs(): CliArgs | null;
    /**
     * Get the loaded and parsed bridge config. Only set after run() has been called.
     * @return The config
     */
    getConfig(): ConfigType | null;
    /**
     * Get the path to the registration file. This may be different to the one supplied
     * in the constructor if the user passed a -f flag.
     * @return The path to the registration file.
     */
    getRegistrationFilePath(): string;
    /**
     * Run the app from the command line. Will parse sys args.
     */
    run(args?: CliArgs): void;
    private assignConfigFile;
    private loadConfig;
    private generateRegistration;
    private startWithConfig;
    private loadYaml;
    private printHelp;
}
export {};
