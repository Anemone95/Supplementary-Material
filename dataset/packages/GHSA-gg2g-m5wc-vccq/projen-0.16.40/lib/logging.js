"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disable = exports.warn = exports.error = exports.info = exports.verbose = exports.debug = void 0;
const chalk = require("chalk");
let enabled = true;
function log(color, ...text) {
    if (!enabled) {
        return;
    }
    console.error(`🤖 ${color(...text)}`);
}
/**
 * @deprecated
 */
function debug(...text) {
    if (process.env.DEBUG) {
        log(chalk.gray, ...text);
    }
}
exports.debug = debug;
/**
 * @deprecated
 */
function verbose(...text) {
    log(chalk.white, ...text);
}
exports.verbose = verbose;
/**
 * @deprecated
 */
function info(...text) {
    log(chalk.cyan, ...text);
}
exports.info = info;
/**
 * @deprecated
 */
function error(...text) {
    log(chalk.red, ...text);
}
exports.error = error;
/**
 * @deprecated
 */
function warn(...text) {
    log(chalk.yellow, ...text);
}
exports.warn = warn;
/**
 * @deprecated
 */
function disable() {
    enabled = false;
}
exports.disable = disable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtCQUErQjtBQUUvQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFFbkIsU0FBUyxHQUFHLENBQUMsS0FBMEIsRUFBRSxHQUFHLElBQVc7SUFDckQsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUFFLE9BQU87S0FBRTtJQUN6QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLEtBQUssQ0FBQyxHQUFHLElBQVc7SUFDbEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRTtRQUNyQixHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQzFCO0FBQ0gsQ0FBQztBQUpELHNCQUlDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixPQUFPLENBQUMsR0FBRyxJQUFXO0lBQ3BDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUZELDBCQUVDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixJQUFJLENBQUMsR0FBRyxJQUFXO0lBQ2pDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUZELG9CQUVDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixLQUFLLENBQUMsR0FBRyxJQUFXO0lBQ2xDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUZELHNCQUVDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixJQUFJLENBQUMsR0FBRyxJQUFXO0lBQ2pDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUZELG9CQUVDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixPQUFPO0lBQ3JCLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDbEIsQ0FBQztBQUZELDBCQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5sZXQgZW5hYmxlZCA9IHRydWU7XG5cbmZ1bmN0aW9uIGxvZyhjb2xvcjogY2hhbGsuQ2hhbGtGdW5jdGlvbiwgLi4udGV4dDogYW55W10pIHtcbiAgaWYgKCFlbmFibGVkKSB7IHJldHVybjsgfVxuICBjb25zb2xlLmVycm9yKGDwn6SWICR7Y29sb3IoLi4udGV4dCl9YCk7XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnKC4uLnRleHQ6IGFueVtdKSB7XG4gIGlmIChwcm9jZXNzLmVudi5ERUJVRykge1xuICAgIGxvZyhjaGFsay5ncmF5LCAuLi50ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJib3NlKC4uLnRleHQ6IGFueVtdKSB7XG4gIGxvZyhjaGFsay53aGl0ZSwgLi4udGV4dCk7XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluZm8oLi4udGV4dDogYW55W10pIHtcbiAgbG9nKGNoYWxrLmN5YW4sIC4uLnRleHQpO1xufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvciguLi50ZXh0OiBhbnlbXSkge1xuICBsb2coY2hhbGsucmVkLCAuLi50ZXh0KTtcbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gd2FybiguLi50ZXh0OiBhbnlbXSkge1xuICBsb2coY2hhbGsueWVsbG93LCAuLi50ZXh0KTtcbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgZW5hYmxlZCA9IGZhbHNlO1xufVxuIl19