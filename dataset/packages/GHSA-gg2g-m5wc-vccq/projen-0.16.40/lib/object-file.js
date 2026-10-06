"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectFile = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const file_1 = require("./file");
const util_1 = require("./util");
/**
 * (experimental) Represents an Object file.
 *
 * @experimental
 */
class ObjectFile extends file_1.FileBase {
    /**
     * @experimental
     */
    constructor(project, filePath, options) {
        var _b, _c, _d;
        super(project, filePath, options);
        if (!options.obj) {
            throw new Error('"obj" cannot be undefined');
        }
        this.obj = (_b = options.obj) !== null && _b !== void 0 ? _b : {};
        this.marker = (_c = options.marker) !== null && _c !== void 0 ? _c : false;
        this.omitEmpty = (_d = options.omitEmpty) !== null && _d !== void 0 ? _d : false;
        this.rawOverrides = {};
    }
    /**
     * (experimental) Adds an override to the synthesized object file.
     *
     * If the override is nested, separate each nested level using a dot (.) in the path parameter.
     * If there is an array as part of the nesting, specify the index in the path.
     *
     * To include a literal `.` in the property name, prefix with a `\`. In most
     * programming languages you will need to write this as `"\\."` because the
     * `\` itself will need to be escaped.
     *
     * For example,
     * ```typescript
     * project.tsconfig.file.addOverride('compilerOptions.alwaysStrict', true);
     * project.tsconfig.file.addOverride('compilerOptions.lib', ['dom', 'dom.iterable', 'esnext']);
     * ```
     * would add the overrides
     * ```json
     * "compilerOptions": {
     *    "alwaysStrict": true,
     *    "lib": [
     *      "dom",
     *      "dom.iterable",
     *      "esnext"
     *    ]
     *    ...
     * }
     * ...
     * ```
     *
     * @param path - The path of the property, you can use dot notation to override values in complex types.
     * @param value - The value.
     * @experimental
     */
    addOverride(path, value) {
        const parts = splitOnPeriods(path);
        let curr = this.rawOverrides;
        while (parts.length > 1) {
            const key = parts.shift();
            // if we can't recurse further or the previous value is not an
            // object overwrite it with an object.
            const isObject = curr[key] != null && typeof (curr[key]) === 'object' && !Array.isArray(curr[key]);
            if (!isObject) {
                curr[key] = {};
            }
            curr = curr[key];
        }
        const lastKey = parts.shift();
        curr[lastKey] = value;
    }
    /**
     * (experimental) Syntactic sugar for `addOverride(path, undefined)`.
     *
     * @param path The path of the value to delete.
     * @experimental
     */
    addDeletionOverride(path) {
        this.addOverride(path, undefined);
    }
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    synthesizeContent(resolver) {
        var _b;
        const obj = this.obj;
        const resolved = (_b = resolver.resolve(obj, {
            omitEmpty: this.omitEmpty,
        })) !== null && _b !== void 0 ? _b : undefined;
        if (resolved) {
            util_1.deepMerge([resolved, this.rawOverrides], true);
        }
        return resolved ? JSON.stringify(resolved, undefined, 2) : undefined;
    }
}
exports.ObjectFile = ObjectFile;
_a = JSII_RTTI_SYMBOL_1;
ObjectFile[_a] = { fqn: "projen.ObjectFile", version: "0.16.40" };
/**
 * Split on periods while processing escape characters \
 */
function splitOnPeriods(x) {
    // Build this list in reverse because it's more convenient to get the "current"
    // item by doing ret[0] than by ret[ret.length - 1].
    const ret = [''];
    for (let i = 0; i < x.length; i++) {
        if (x[i] === '\\' && i + 1 < x.length) {
            ret[0] += x[i + 1];
            i++;
        }
        else if (x[i] === '.') {
            ret.unshift('');
        }
        else {
            ret[0] += x[i];
        }
    }
    ret.reverse();
    return ret;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvb2JqZWN0LWZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpQ0FBOEQ7QUFHOUQsaUNBQW1DOzs7Ozs7QUF3Qm5DLE1BQXNCLFVBQVcsU0FBUSxlQUFROzs7O0lBdUIvQyxZQUFZLE9BQWdCLEVBQUUsUUFBZ0IsRUFBRSxPQUEwQjs7UUFDeEUsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1NBQzlDO1FBRUQsSUFBSSxDQUFDLEdBQUcsU0FBRyxPQUFPLENBQUMsR0FBRyxtQ0FBSSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLE1BQU0sU0FBRyxPQUFPLENBQUMsTUFBTSxtQ0FBSSxLQUFLLENBQUM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsU0FBRyxPQUFPLENBQUMsU0FBUyxtQ0FBSSxLQUFLLENBQUM7UUFDNUMsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDekIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQW9DTSxXQUFXLENBQUMsSUFBWSxFQUFFLEtBQVU7UUFDekMsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLElBQUksSUFBSSxHQUFRLElBQUksQ0FBQyxZQUFZLENBQUM7UUFFbEMsT0FBTyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN2QixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFHLENBQUM7WUFFM0IsOERBQThEO1lBQzlELHNDQUFzQztZQUN0QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLE9BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xHLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNoQjtZQUVELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbEI7UUFFRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFHLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN4QixDQUFDOzs7Ozs7O0lBTU0sbUJBQW1CLENBQUMsSUFBWTtRQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNwQyxDQUFDOzs7Ozs7SUFFUyxpQkFBaUIsQ0FBQyxRQUFtQjs7UUFDN0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUVyQixNQUFNLFFBQVEsU0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtZQUNyQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7U0FDMUIsQ0FBQyxtQ0FBSSxTQUFTLENBQUM7UUFFaEIsSUFBSSxRQUFRLEVBQUU7WUFDWixnQkFBUyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNoRDtRQUVELE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUN2RSxDQUFDOztBQS9HSCxnQ0FnSEM7OztBQUVEOztHQUVHO0FBQ0gsU0FBUyxjQUFjLENBQUMsQ0FBUztJQUMvQiwrRUFBK0U7SUFDL0Usb0RBQW9EO0lBQ3BELE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDakMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUNyQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuQixDQUFDLEVBQUUsQ0FBQztTQUNMO2FBQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ3ZCLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDakI7YUFBTTtZQUNMLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7S0FDRjtJQUVELEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNkLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZpbGVCYXNlLCBGaWxlQmFzZU9wdGlvbnMsIElSZXNvbHZlciB9IGZyb20gJy4vZmlsZSc7XG5pbXBvcnQgeyBJTWFya2FibGVGaWxlLCBNYXJrYWJsZUZpbGVPcHRpb25zIH0gZnJvbSAnLi9tYXJrYWJsZS1maWxlJztcbmltcG9ydCB7IFByb2plY3QgfSBmcm9tICcuL3Byb2plY3QnO1xuaW1wb3J0IHsgZGVlcE1lcmdlIH0gZnJvbSAnLi91dGlsJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdEZpbGVPcHRpb25zIGV4dGVuZHMgRmlsZUJhc2VPcHRpb25zLCBNYXJrYWJsZUZpbGVPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgb2JqPzogYW55O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBvbWl0RW1wdHk/OiBib29sZWFuO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgT2JqZWN0RmlsZSBleHRlbmRzIEZpbGVCYXNlIGltcGxlbWVudHMgSU1hcmthYmxlRmlsZSB7XG4gIC8qKlxuICAgKiBUaGUgb3V0cHV0IG9iamVjdC4gVGhpcyBvYmplY3QgY2FuIGJlIG11dGF0ZWQgdW50aWwgdGhlIHByb2plY3QgaXNcbiAgICogc3ludGhlc2l6ZWQuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IG9iajogb2JqZWN0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgbWFya2VyOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBBbiBvYmplY3QgdG8gYmUgbWVyZ2VkIG9uIHRvcCBvZiBgb2JqYCBhZnRlciB0aGUgcmVzb2x2ZXIgaXMgY2FsbGVkXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IHJhd092ZXJyaWRlczogb2JqZWN0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IG9taXRFbXB0eTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQcm9qZWN0LCBmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPYmplY3RGaWxlT3B0aW9ucykge1xuICAgIHN1cGVyKHByb2plY3QsIGZpbGVQYXRoLCBvcHRpb25zKTtcblxuICAgIGlmICghb3B0aW9ucy5vYmopIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignXCJvYmpcIiBjYW5ub3QgYmUgdW5kZWZpbmVkJyk7XG4gICAgfVxuXG4gICAgdGhpcy5vYmogPSBvcHRpb25zLm9iaiA/PyB7fTtcbiAgICB0aGlzLm1hcmtlciA9IG9wdGlvbnMubWFya2VyID8/IGZhbHNlO1xuICAgIHRoaXMub21pdEVtcHR5ID0gb3B0aW9ucy5vbWl0RW1wdHkgPz8gZmFsc2U7XG4gICAgdGhpcy5yYXdPdmVycmlkZXMgPSB7fTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZE92ZXJyaWRlKHBhdGg6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIGNvbnN0IHBhcnRzID0gc3BsaXRPblBlcmlvZHMocGF0aCk7XG4gICAgbGV0IGN1cnI6IGFueSA9IHRoaXMucmF3T3ZlcnJpZGVzO1xuXG4gICAgd2hpbGUgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNvbnN0IGtleSA9IHBhcnRzLnNoaWZ0KCkhO1xuXG4gICAgICAvLyBpZiB3ZSBjYW4ndCByZWN1cnNlIGZ1cnRoZXIgb3IgdGhlIHByZXZpb3VzIHZhbHVlIGlzIG5vdCBhblxuICAgICAgLy8gb2JqZWN0IG92ZXJ3cml0ZSBpdCB3aXRoIGFuIG9iamVjdC5cbiAgICAgIGNvbnN0IGlzT2JqZWN0ID0gY3VycltrZXldICE9IG51bGwgJiYgdHlwZW9mKGN1cnJba2V5XSkgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGN1cnJba2V5XSk7XG4gICAgICBpZiAoIWlzT2JqZWN0KSB7XG4gICAgICAgIGN1cnJba2V5XSA9IHt9O1xuICAgICAgfVxuXG4gICAgICBjdXJyID0gY3VycltrZXldO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RLZXkgPSBwYXJ0cy5zaGlmdCgpITtcbiAgICBjdXJyW2xhc3RLZXldID0gdmFsdWU7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGREZWxldGlvbk92ZXJyaWRlKHBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuYWRkT3ZlcnJpZGUocGF0aCwgdW5kZWZpbmVkKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzeW50aGVzaXplQ29udGVudChyZXNvbHZlcjogSVJlc29sdmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBvYmogPSB0aGlzLm9iajtcblxuICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZXIucmVzb2x2ZShvYmosIHtcbiAgICAgIG9taXRFbXB0eTogdGhpcy5vbWl0RW1wdHksXG4gICAgfSkgPz8gdW5kZWZpbmVkO1xuXG4gICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICBkZWVwTWVyZ2UoW3Jlc29sdmVkLCB0aGlzLnJhd092ZXJyaWRlc10sIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiByZXNvbHZlZCA/IEpTT04uc3RyaW5naWZ5KHJlc29sdmVkLCB1bmRlZmluZWQsIDIpIDogdW5kZWZpbmVkO1xuICB9XG59XG5cbi8qKlxuICogU3BsaXQgb24gcGVyaW9kcyB3aGlsZSBwcm9jZXNzaW5nIGVzY2FwZSBjaGFyYWN0ZXJzIFxcXG4gKi9cbmZ1bmN0aW9uIHNwbGl0T25QZXJpb2RzKHg6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgLy8gQnVpbGQgdGhpcyBsaXN0IGluIHJldmVyc2UgYmVjYXVzZSBpdCdzIG1vcmUgY29udmVuaWVudCB0byBnZXQgdGhlIFwiY3VycmVudFwiXG4gIC8vIGl0ZW0gYnkgZG9pbmcgcmV0WzBdIHRoYW4gYnkgcmV0W3JldC5sZW5ndGggLSAxXS5cbiAgY29uc3QgcmV0ID0gWycnXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHhbaV0gPT09ICdcXFxcJyAmJiBpICsgMSA8IHgubGVuZ3RoKSB7XG4gICAgICByZXRbMF0gKz0geFtpICsgMV07XG4gICAgICBpKys7XG4gICAgfSBlbHNlIGlmICh4W2ldID09PSAnLicpIHtcbiAgICAgIHJldC51bnNoaWZ0KCcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0WzBdICs9IHhbaV07XG4gICAgfVxuICB9XG5cbiAgcmV0LnJldmVyc2UoKTtcbiAgcmV0dXJuIHJldDtcbn1cbiJdfQ==