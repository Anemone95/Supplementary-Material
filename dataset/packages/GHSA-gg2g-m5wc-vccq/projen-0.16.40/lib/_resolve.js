"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = void 0;
function resolve(value, options = {}) {
    var _a, _b, _c, _d;
    const args = (_a = options.args) !== null && _a !== void 0 ? _a : [];
    const omitEmpty = (_b = options.omitEmpty) !== null && _b !== void 0 ? _b : false;
    if (value == null) {
        return value;
    }
    // if value is a function, call it and resolve the result.
    if (typeof (value) === 'function') {
        const resolved = value.apply(undefined, args);
        return resolve(resolved, options);
    }
    if (typeof (value) !== 'object') {
        return value;
    }
    if (Array.isArray(value)) {
        if (omitEmpty && value.length === 0) {
            return undefined;
        }
        return value
            .map(x => resolve(x, options))
            .filter(x => x != null); // filter undefined/null/omitted
    }
    // only allow data types (i.e. objects without constructors)
    if (((_c = value.constructor) === null || _c === void 0 ? void 0 : _c.name) !== 'Object') {
        throw new Error(`only data types can be resolved. trying to resolve object of type ${(_d = value.constructor) === null || _d === void 0 ? void 0 : _d.name}`);
    }
    const result = {};
    for (const [k, v] of Object.entries(value)) {
        const resolved = resolve(v, options);
        // skip undefined values
        if (resolved === undefined) {
            continue;
        }
        result[k] = resolved;
    }
    if (omitEmpty && Object.keys(result).length === 0) {
        return undefined;
    }
    return result;
}
exports.resolve = resolve;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3Jlc29sdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvX3Jlc29sdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsU0FBZ0IsT0FBTyxDQUFDLEtBQVUsRUFBRSxVQUEwQixFQUFFOztJQUM5RCxNQUFNLElBQUksU0FBRyxPQUFPLENBQUMsSUFBSSxtQ0FBSSxFQUFFLENBQUM7SUFDaEMsTUFBTSxTQUFTLFNBQUcsT0FBTyxDQUFDLFNBQVMsbUNBQUksS0FBSyxDQUFDO0lBRTdDLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtRQUNqQixPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsMERBQTBEO0lBQzFELElBQUksT0FBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLFVBQVUsRUFBRTtRQUNoQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5QyxPQUFPLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDbkM7SUFFRCxJQUFJLE9BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxRQUFRLEVBQUU7UUFDOUIsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN4QixJQUFJLFNBQVMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNuQyxPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUNELE9BQU8sS0FBSzthQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDN0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsZ0NBQWdDO0tBQzVEO0lBRUQsNERBQTREO0lBQzVELElBQUksT0FBQSxLQUFLLENBQUMsV0FBVywwQ0FBRSxJQUFJLE1BQUssUUFBUSxFQUFFO1FBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMscUVBQXFFLE1BQUEsS0FBSyxDQUFDLFdBQVcsMENBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUNqSDtJQUVELE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2QixLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUMxQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXJDLHdCQUF3QjtRQUN4QixJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDMUIsU0FBUztTQUNWO1FBRUQsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztLQUN0QjtJQUVELElBQUksU0FBUyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNqRCxPQUFPLFNBQVMsQ0FBQztLQUNsQjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFsREQsMEJBa0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVzb2x2ZU9wdGlvbnMgfSBmcm9tICcuL2ZpbGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZTogYW55LCBvcHRpb25zOiBSZXNvbHZlT3B0aW9ucyA9IHt9KTogYW55IHtcbiAgY29uc3QgYXJncyA9IG9wdGlvbnMuYXJncyA/PyBbXTtcbiAgY29uc3Qgb21pdEVtcHR5ID0gb3B0aW9ucy5vbWl0RW1wdHkgPz8gZmFsc2U7XG5cbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvLyBpZiB2YWx1ZSBpcyBhIGZ1bmN0aW9uLCBjYWxsIGl0IGFuZCByZXNvbHZlIHRoZSByZXN1bHQuXG4gIGlmICh0eXBlb2YodmFsdWUpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSB2YWx1ZS5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgIHJldHVybiByZXNvbHZlKHJlc29sdmVkLCBvcHRpb25zKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YodmFsdWUpICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGlmIChvbWl0RW1wdHkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgICAgIC5tYXAoeCA9PiByZXNvbHZlKHgsIG9wdGlvbnMpKVxuICAgICAgLmZpbHRlcih4ID0+IHggIT0gbnVsbCk7IC8vIGZpbHRlciB1bmRlZmluZWQvbnVsbC9vbWl0dGVkXG4gIH1cblxuICAvLyBvbmx5IGFsbG93IGRhdGEgdHlwZXMgKGkuZS4gb2JqZWN0cyB3aXRob3V0IGNvbnN0cnVjdG9ycylcbiAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yPy5uYW1lICE9PSAnT2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBFcnJvcihgb25seSBkYXRhIHR5cGVzIGNhbiBiZSByZXNvbHZlZC4gdHJ5aW5nIHRvIHJlc29sdmUgb2JqZWN0IG9mIHR5cGUgJHt2YWx1ZS5jb25zdHJ1Y3Rvcj8ubmFtZX1gKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdDogYW55ID0ge307XG5cbiAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXModmFsdWUpKSB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlKHYsIG9wdGlvbnMpO1xuXG4gICAgLy8gc2tpcCB1bmRlZmluZWQgdmFsdWVzXG4gICAgaWYgKHJlc29sdmVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc3VsdFtrXSA9IHJlc29sdmVkO1xuICB9XG5cbiAgaWYgKG9taXRFbXB0eSAmJiBPYmplY3Qua2V5cyhyZXN1bHQpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufSJdfQ==