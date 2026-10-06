import { Component } from './component';
import { Project } from './project';
/**
 * (experimental) Options for logging utilities.
 *
 * @experimental
 */
export interface LoggerOptions {
    /**
     * (experimental) The logging verbosity.
     *
     * The levels available (in increasing verbosity) are
     * OFF, ERROR, WARN, INFO, DEBUG, and VERBOSE.
     *
     * @default LogLevel.INFO
     * @experimental
     */
    readonly level?: LogLevel;
    /**
     * (experimental) Include a prefix for all logging messages with the project name.
     *
     * @default false
     * @experimental
     */
    readonly usePrefix?: boolean;
}
/**
 * (experimental) Project-level logging utilities.
 *
 * @experimental
 */
export declare class Logger extends Component {
    private readonly level;
    private readonly usePrefix;
    /**
     * @experimental
     */
    constructor(project: Project, options?: LoggerOptions);
    /**
     * (experimental) Log a message to stderr with a given logging level.
     *
     * The message will be
     * printed as long as `logger.level` is set to the message's severity or higher.
     *
     * @param level Logging verbosity.
     * @param text strings or objects to print.
     * @experimental
     */
    log(level: LogLevel, ...text: any[]): void;
    /**
     * (experimental) Log a message to stderr with VERBOSE severity.
     *
     * @param text strings or objects to print.
     * @experimental
     */
    verbose(...text: any[]): void;
    /**
     * (experimental) Log a message to stderr with DEBUG severity.
     *
     * @param text strings or objects to print.
     * @experimental
     */
    debug(...text: any[]): void;
    /**
     * (experimental) Log a message to stderr with INFO severity.
     *
     * @param text strings or objects to print.
     * @experimental
     */
    info(...text: any[]): void;
    /**
     * (experimental) Log a message to stderr with WARN severity.
     *
     * @param text strings or objects to print.
     * @experimental
     */
    warn(...text: any[]): void;
    /**
     * (experimental) Log a message to stderr with ERROR severity.
     *
     * @param text strings or objects to print.
     * @experimental
     */
    error(...text: any[]): void;
    private colorForLogLevel;
}
/**
 * (experimental) Logging verbosity.
 *
 * @experimental
 */
export declare enum LogLevel {
    /**
     * @experimental
     */
    OFF = "00.off",
    /**
     * @experimental
     */
    ERROR = "10.error",
    /**
     * @experimental
     */
    WARN = "20.warn",
    /**
     * @experimental
     */
    INFO = "30.info",
    /**
     * @experimental
     */
    DEBUG = "40.debug",
    /**
     * @experimental
     */
    VERBOSE = "50.verbose"
}
