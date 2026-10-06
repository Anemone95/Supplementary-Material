"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configured = exports.configure = exports.get = exports.LogWrapper = void 0;
/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const util = __importStar(require("util"));
const winston_1 = __importStar(require("winston"));
const chalk_1 = __importDefault(require("chalk"));
const CHALK_LEVELS = {
    "debug": "blue",
    "info": "green",
    "warn": "yellow",
    "error": "red",
};
class LogWrapper {
    constructor() {
        this.logger = null;
        this.messages = [];
    }
    setLogger(logger) {
        this.logger = logger;
    }
    debug(...messageParts) { this.log(messageParts, 'debug'); }
    info(...messageParts) { this.log(messageParts, 'info'); }
    warn(...messageParts) { this.log(messageParts, 'warn'); }
    error(...messageParts) { this.log(messageParts, 'error'); }
    drain() {
        if (!this.logger) {
            return;
        }
        while (this.messages.length > 0) {
            const msg = this.messages[0];
            this.logger[msg.type](msg.message);
            this.messages.splice(0, 1);
        }
    }
    formatParts(messageParts) {
        return messageParts.map((part) => {
            if (typeof (part) === "object") {
                return util.inspect(part);
            }
            return String(part);
        });
    }
    log(messageParts, type) {
        const formattedParts = this.formatParts(messageParts).join(" ");
        if (this.logger === null) {
            this.messages.push({ type, message: formattedParts });
            return;
        }
        /* When we first start logging, the transports
         * won't be configured so we push to a queue.
         * When the transport becomes ready, the queue
         * is emptied. */
        this.drain();
        this.logger[type](formattedParts);
    }
}
exports.LogWrapper = LogWrapper;
class Logging {
    constructor() {
        this.loggers = new Map();
        this.config = null;
        this.transports = [];
        this.formatterFn = winston_1.format.printf((info) => {
            return `${info.timestamp} ${info.level} ${info.label} ${info.message}`;
        });
        this.colorFn = winston_1.format((info) => {
            const level = info.level.toUpperCase();
            const levelColour = CHALK_LEVELS[info.level];
            if (levelColour) {
                info.level = chalk_1.default.keyword(levelColour)(level);
            }
            return info;
        });
    }
    /*
        console: "error|warn|info|debug|off"
        fileDatePattern: "YYYY-MM-DD",
        timestampFormat: "MMM-D HH:mm:ss.SSS"
        files: {
            "abc.log" => "error|warn|info|debug|off"
        }
        maxFiles: 5
    */
    configure(config = {}) {
        if (!config.fileDatePattern) {
            config.fileDatePattern = "YYYY-MM-DD";
        }
        if (!config.timestampFormat) {
            config.timestampFormat = "MMM-D HH:mm:ss.SSS";
        }
        if (!config.console) {
            config.console = "info";
        }
        if (!config.maxFiles) {
            config.maxFiles = 0;
        }
        this.config = config;
        if (this.transports) {
            for (const transport of this.transports) {
                if (transport.close) {
                    transport.close();
                }
            }
        }
        this.transports = [];
        if (config.console !== undefined) {
            this.transports.push(new (winston_1.default.transports.Console)({
                level: config.console,
                silent: config.console === 'off',
                format: winston_1.format.combine(this.colorFn(), this.formatterFn)
            }));
        }
        if (config.files !== undefined) {
            // `winston-daily-rotate-file` has side-effects so we don't want to mess anyone up
            // unless they want to use logging
            require("winston-daily-rotate-file");
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { DailyRotateFile } = require("winston/lib/winston/transports");
            for (const filename of Object.keys(config.files)) {
                const level = config.files[filename];
                this.transports.push(new DailyRotateFile({
                    filename,
                    datePattern: config.fileDatePattern,
                    level,
                    maxFiles: config.maxFiles > 0 ? config.maxFiles : undefined
                }));
            }
        }
        this.loggers.forEach((wrapper, name) => {
            wrapper.setLogger(this.createLogger(name));
            wrapper.drain();
        });
    }
    get(name) {
        const existingLogger = this.loggers.get(name);
        if (existingLogger) {
            return existingLogger;
        }
        const wrapper = new LogWrapper();
        this.loggers.set(name, wrapper);
        /* We won't assign create and assign a logger until
            * the transports are ready */
        if (this.transports !== null) {
            wrapper.setLogger(this.createLogger(name));
        }
        return wrapper;
    }
    createLogger(name) {
        var _a;
        const logger = winston_1.default.createLogger({
            transports: this.transports,
            format: winston_1.format.combine(winston_1.format.timestamp({
                format: (_a = this.config) === null || _a === void 0 ? void 0 : _a.timestampFormat,
            }), winston_1.format.label({ label: name }), this.formatterFn),
        });
        return logger;
    }
}
const instance = new Logging();
instance.configure({ console: "off" });
let isConfigured = false;
function get(name) {
    return instance.get(name);
}
exports.get = get;
function configure(config) {
    instance.configure(config);
    isConfigured = true;
}
exports.configure = configure;
function configured() {
    return isConfigured;
}
exports.configured = configured;
// Backwards compat
exports.default = {
    get,
    configure,
    configured,
};
//# sourceMappingURL=logging.js.map