import { Logger } from "winston";
declare type LogLevel = "debug" | "info" | "warn" | "error";
declare type MessagePart = unknown;
interface LoggerConfig {
    console?: LogLevel | "off";
    fileDatePattern?: string;
    timestampFormat?: string;
    files?: {
        [filename: string]: LogLevel | "off";
    };
    maxFiles?: number;
}
export declare class LogWrapper {
    private logger;
    private messages;
    setLogger(logger: Logger): void;
    debug(...messageParts: MessagePart[]): void;
    info(...messageParts: MessagePart[]): void;
    warn(...messageParts: MessagePart[]): void;
    error(...messageParts: MessagePart[]): void;
    drain(): void;
    private formatParts;
    private log;
}
export declare function get(name: string): LogWrapper;
export declare function configure(config: LoggerConfig): void;
export declare function configured(): boolean;
declare const _default: {
    get: typeof get;
    configure: typeof configure;
    configured: typeof configured;
};
export default _default;
