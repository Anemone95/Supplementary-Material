"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.Logger = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const chalk = require("chalk");
const component_1 = require("./component");
const util_1 = require("./util");
/**
 * (experimental) Project-level logging utilities.
 *
 * @experimental
 */
class Logger extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options = {}) {
        var _b, _c;
        super(project);
        this.level = (_b = options.level) !== null && _b !== void 0 ? _b : LogLevel.INFO;
        this.usePrefix = (_c = options.usePrefix) !== null && _c !== void 0 ? _c : false;
    }
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
    log(level, ...text) {
        if (level === LogLevel.OFF) {
            throw new Error('Cannot log a message with level LogLevel.OFF');
        }
        let maxLevel = this.level;
        // logging level can be overridden through the --debug CLI option
        if (util_1.isTruthy(process.env.DEBUG) && maxLevel < LogLevel.DEBUG) {
            maxLevel = LogLevel.DEBUG;
        }
        if (level <= maxLevel) {
            const color = this.colorForLogLevel(level);
            const prefix = this.usePrefix ? `[${this.project.name}] ` : '';
            console.error(`🤖 ${prefix}${color(...text)}`);
        }
    }
    /**
     * (experimental) Log a message to stderr with VERBOSE severity.
     *
     * @param text strings or objects to print.
     * @experimental
     */
    verbose(...text) {
        this.log(LogLevel.VERBOSE, ...text);
    }
    /**
     * (experimental) Log a message to stderr with DEBUG severity.
     *
     * @param text strings or objects to print.
     * @experimental
     */
    debug(...text) {
        this.log(LogLevel.DEBUG, ...text);
    }
    /**
     * (experimental) Log a message to stderr with INFO severity.
     *
     * @param text strings or objects to print.
     * @experimental
     */
    info(...text) {
        this.log(LogLevel.INFO, ...text);
    }
    /**
     * (experimental) Log a message to stderr with WARN severity.
     *
     * @param text strings or objects to print.
     * @experimental
     */
    warn(...text) {
        this.log(LogLevel.WARN, ...text);
    }
    /**
     * (experimental) Log a message to stderr with ERROR severity.
     *
     * @param text strings or objects to print.
     * @experimental
     */
    error(...text) {
        this.log(LogLevel.ERROR, ...text);
    }
    colorForLogLevel(level) {
        switch (level) {
            case LogLevel.ERROR: return chalk.red;
            case LogLevel.WARN: return chalk.yellow;
            case LogLevel.INFO: return chalk.cyan;
            case LogLevel.DEBUG: return chalk.gray;
            case LogLevel.VERBOSE: return chalk.white;
            default:
                return chalk.white;
        }
    }
}
exports.Logger = Logger;
_a = JSII_RTTI_SYMBOL_1;
Logger[_a] = { fqn: "projen.Logger", version: "0.16.40" };
/**
 * (experimental) Logging verbosity.
 *
 * @experimental
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["OFF"] = "00.off";
    LogLevel["ERROR"] = "10.error";
    LogLevel["WARN"] = "20.warn";
    LogLevel["INFO"] = "30.info";
    LogLevel["DEBUG"] = "40.debug";
    LogLevel["VERBOSE"] = "50.verbose";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLCtCQUErQjtBQUMvQiwyQ0FBd0M7QUFFeEMsaUNBQWtDOzs7Ozs7QUF5QmxDLE1BQWEsTUFBTyxTQUFRLHFCQUFTOzs7O0lBSW5DLFlBQVksT0FBZ0IsRUFBRSxVQUF5QixFQUFFOztRQUN2RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFZixJQUFJLENBQUMsS0FBSyxTQUFHLE9BQU8sQ0FBQyxLQUFLLG1DQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDNUMsSUFBSSxDQUFDLFNBQVMsU0FBRyxPQUFPLENBQUMsU0FBUyxtQ0FBSSxLQUFLLENBQUM7SUFDOUMsQ0FBQzs7Ozs7Ozs7Ozs7SUFTTSxHQUFHLENBQUMsS0FBZSxFQUFFLEdBQUcsSUFBVztRQUN4QyxJQUFJLEtBQUssS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztTQUNqRTtRQUVELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFMUIsaUVBQWlFO1FBQ2pFLElBQUksZUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUU7WUFDNUQsUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7U0FDM0I7UUFFRCxJQUFJLEtBQUssSUFBSSxRQUFRLEVBQUU7WUFDckIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQy9ELE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2hEO0lBQ0gsQ0FBQzs7Ozs7OztJQU1NLE9BQU8sQ0FBQyxHQUFHLElBQVc7UUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdEMsQ0FBQzs7Ozs7OztJQU1NLEtBQUssQ0FBQyxHQUFHLElBQVc7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQzs7Ozs7OztJQU1NLElBQUksQ0FBQyxHQUFHLElBQVc7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQzs7Ozs7OztJQU1NLElBQUksQ0FBQyxHQUFHLElBQVc7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQzs7Ozs7OztJQU1NLEtBQUssQ0FBQyxHQUFHLElBQVc7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVPLGdCQUFnQixDQUFDLEtBQWU7UUFDdEMsUUFBUSxLQUFLLEVBQUU7WUFDYixLQUFLLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFDdEMsS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ3hDLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQztZQUN0QyxLQUFLLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDdkMsS0FBSyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQzFDO2dCQUNFLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQztTQUN0QjtJQUNILENBQUM7O0FBdkZILHdCQXdGQzs7Ozs7Ozs7QUFLRCxJQUFZLFFBT1g7QUFQRCxXQUFZLFFBQVE7SUFDbEIsMEJBQWMsQ0FBQTtJQUNkLDhCQUFrQixDQUFBO0lBQ2xCLDRCQUFnQixDQUFBO0lBQ2hCLDRCQUFnQixDQUFBO0lBQ2hCLDhCQUFrQixDQUFBO0lBQ2xCLGtDQUFzQixDQUFBO0FBQ3hCLENBQUMsRUFQVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQU9uQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50JztcbmltcG9ydCB7IFByb2plY3QgfSBmcm9tICcuL3Byb2plY3QnO1xuaW1wb3J0IHsgaXNUcnV0aHkgfSBmcm9tICcuL3V0aWwnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBMb2dnZXJPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbGV2ZWw/OiBMb2dMZXZlbDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB1c2VQcmVmaXg/OiBib29sZWFuO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgTG9nZ2VyIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSByZWFkb25seSBsZXZlbDogTG9nTGV2ZWw7XG4gIHByaXZhdGUgcmVhZG9ubHkgdXNlUHJlZml4OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFByb2plY3QsIG9wdGlvbnM6IExvZ2dlck9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKHByb2plY3QpO1xuXG4gICAgdGhpcy5sZXZlbCA9IG9wdGlvbnMubGV2ZWwgPz8gTG9nTGV2ZWwuSU5GTztcbiAgICB0aGlzLnVzZVByZWZpeCA9IG9wdGlvbnMudXNlUHJlZml4ID8/IGZhbHNlO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBsb2cobGV2ZWw6IExvZ0xldmVsLCAuLi50ZXh0OiBhbnlbXSkge1xuICAgIGlmIChsZXZlbCA9PT0gTG9nTGV2ZWwuT0ZGKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBsb2cgYSBtZXNzYWdlIHdpdGggbGV2ZWwgTG9nTGV2ZWwuT0ZGJyk7XG4gICAgfVxuXG4gICAgbGV0IG1heExldmVsID0gdGhpcy5sZXZlbDtcblxuICAgIC8vIGxvZ2dpbmcgbGV2ZWwgY2FuIGJlIG92ZXJyaWRkZW4gdGhyb3VnaCB0aGUgLS1kZWJ1ZyBDTEkgb3B0aW9uXG4gICAgaWYgKGlzVHJ1dGh5KHByb2Nlc3MuZW52LkRFQlVHKSAmJiBtYXhMZXZlbCA8IExvZ0xldmVsLkRFQlVHKSB7XG4gICAgICBtYXhMZXZlbCA9IExvZ0xldmVsLkRFQlVHO1xuICAgIH1cblxuICAgIGlmIChsZXZlbCA8PSBtYXhMZXZlbCkge1xuICAgICAgY29uc3QgY29sb3IgPSB0aGlzLmNvbG9yRm9yTG9nTGV2ZWwobGV2ZWwpO1xuICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy51c2VQcmVmaXggPyBgWyR7dGhpcy5wcm9qZWN0Lm5hbWV9XSBgIDogJyc7XG4gICAgICBjb25zb2xlLmVycm9yKGDwn6SWICR7cHJlZml4fSR7Y29sb3IoLi4udGV4dCl9YCk7XG4gICAgfVxuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyB2ZXJib3NlKC4uLnRleHQ6IGFueVtdKSB7XG4gICAgdGhpcy5sb2coTG9nTGV2ZWwuVkVSQk9TRSwgLi4udGV4dCk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBkZWJ1ZyguLi50ZXh0OiBhbnlbXSkge1xuICAgIHRoaXMubG9nKExvZ0xldmVsLkRFQlVHLCAuLi50ZXh0KTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgaW5mbyguLi50ZXh0OiBhbnlbXSkge1xuICAgIHRoaXMubG9nKExvZ0xldmVsLklORk8sIC4uLnRleHQpO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyB3YXJuKC4uLnRleHQ6IGFueVtdKSB7XG4gICAgdGhpcy5sb2coTG9nTGV2ZWwuV0FSTiwgLi4udGV4dCk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBlcnJvciguLi50ZXh0OiBhbnlbXSkge1xuICAgIHRoaXMubG9nKExvZ0xldmVsLkVSUk9SLCAuLi50ZXh0KTtcbiAgfVxuXG4gIHByaXZhdGUgY29sb3JGb3JMb2dMZXZlbChsZXZlbDogTG9nTGV2ZWwpOiBjaGFsay5DaGFsa0Z1bmN0aW9uIHtcbiAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICBjYXNlIExvZ0xldmVsLkVSUk9SOiByZXR1cm4gY2hhbGsucmVkO1xuICAgICAgY2FzZSBMb2dMZXZlbC5XQVJOOiByZXR1cm4gY2hhbGsueWVsbG93O1xuICAgICAgY2FzZSBMb2dMZXZlbC5JTkZPOiByZXR1cm4gY2hhbGsuY3lhbjtcbiAgICAgIGNhc2UgTG9nTGV2ZWwuREVCVUc6IHJldHVybiBjaGFsay5ncmF5O1xuICAgICAgY2FzZSBMb2dMZXZlbC5WRVJCT1NFOiByZXR1cm4gY2hhbGsud2hpdGU7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gY2hhbGsud2hpdGU7XG4gICAgfVxuICB9XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgZW51bSBMb2dMZXZlbCB7XG4gIE9GRiA9ICcwMC5vZmYnLFxuICBFUlJPUiA9ICcxMC5lcnJvcicsXG4gIFdBUk4gPSAnMjAud2FybicsXG4gIElORk8gPSAnMzAuaW5mbycsXG4gIERFQlVHID0gJzQwLmRlYnVnJyxcbiAgVkVSQk9TRSA9ICc1MC52ZXJib3NlJ1xufSJdfQ==