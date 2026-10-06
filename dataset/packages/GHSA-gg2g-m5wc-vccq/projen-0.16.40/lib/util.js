"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAsPythonModule = exports.sorted = exports.dedupArray = exports.deepMerge = exports.isObject = exports.isTruthy = exports.decamelizeKeysRecursively = exports.writeFile = exports.getFilePermissions = exports.execOrUndefined = exports.exec = void 0;
const child_process = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const logging = require("./logging");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const decamelize = require('decamelize');
function exec(command, options) {
    logging.verbose(command);
    return child_process.execSync(command, {
        stdio: ['inherit', process.stderr, 'pipe'],
        ...options,
    });
}
exports.exec = exec;
/**
 * Executes `command` and returns its value or undefined if the command failed.
 */
function execOrUndefined(command, options) {
    try {
        const value = child_process.execSync(command, { stdio: ['inherit', 'pipe', 'ignore'], ...options }).toString('utf-8').trim();
        if (!value) {
            return undefined;
        } // an empty string is the same as undefined
        return value;
    }
    catch (_a) {
        return undefined;
    }
}
exports.execOrUndefined = execOrUndefined;
function getFilePermissions(options) {
    var _a, _b;
    const readonly = (_a = options.readonly) !== null && _a !== void 0 ? _a : false;
    const executable = (_b = options.executable) !== null && _b !== void 0 ? _b : false;
    if (readonly && executable) {
        return '500';
    }
    else if (readonly) {
        return '400';
    }
    else if (executable) {
        return '755';
    }
    else {
        return '644';
    }
}
exports.getFilePermissions = getFilePermissions;
function writeFile(filePath, data, options = {}) {
    if (fs.existsSync(filePath)) {
        fs.chmodSync(filePath, '600');
    }
    fs.mkdirpSync(path.dirname(filePath));
    fs.writeFileSync(filePath, data);
    fs.chmodSync(filePath, getFilePermissions(options));
}
exports.writeFile = writeFile;
function decamelizeKeysRecursively(input, opt) {
    var _a, _b, _c, _d;
    const shouldAlwaysDecamelize = () => true;
    const shouldDecamelize = (_a = opt === null || opt === void 0 ? void 0 : opt.shouldDecamelize) !== null && _a !== void 0 ? _a : shouldAlwaysDecamelize;
    const separator = (_b = opt === null || opt === void 0 ? void 0 : opt.separator) !== null && _b !== void 0 ? _b : '_';
    const path_ = (_c = opt === null || opt === void 0 ? void 0 : opt.path) !== null && _c !== void 0 ? _c : [];
    const maxDepth = (_d = opt === null || opt === void 0 ? void 0 : opt.maxDepth) !== null && _d !== void 0 ? _d : 10;
    if (path_.length > maxDepth) {
        throw new Error('Decamelled too deeply - check that the input has no circular references');
    }
    if (Array.isArray(input)) {
        return input.map((k, i) => decamelizeKeysRecursively(k, {
            ...opt,
            path: [...path_, i.toString()],
        }));
    }
    if (typeof input === 'object' && input !== null) {
        const mappedObject = {};
        for (const [key, value] of Object.entries(input)) {
            const transformedKey = shouldDecamelize([...path_, key], value)
                ? decamelize(key, separator)
                : key;
            mappedObject[transformedKey] = decamelizeKeysRecursively(value, {
                ...opt,
                path: [...path_, key],
            });
        }
        return mappedObject;
    }
    return input;
}
exports.decamelizeKeysRecursively = decamelizeKeysRecursively;
/**
 * Returns false if value is unset or a falsey value, and true otherwise.
 * @param value an environment variable
 */
function isTruthy(value) {
    return !(value === undefined || ['null', 'undefined', '0', 'false', ''].includes(value.toLocaleLowerCase()));
}
exports.isTruthy = isTruthy;
/**
 * Return whether the given value is an object
 *
 * Even though arrays and instances of classes technically are objects, we
 * usually want to treat them differently, so we return false in those cases.
 */
function isObject(x) {
    return x !== null && typeof x === 'object' && !Array.isArray(x)
        && x.constructor.name === 'Object';
}
exports.isObject = isObject;
/**
 * Recursively merge objects together
 *
 * The leftmost object is mutated and returned. Arrays are not merged
 * but overwritten just like scalars.
 *
 * If an object is merged into a non-object, the non-object is lost.
 *
 * `undefined`s will cause a value to be deleted if destructive is enabled.
 */
function deepMerge(objects, destructive = false) {
    function mergeOne(target, source) {
        for (const key of Object.keys(source)) {
            const value = source[key];
            if (isObject(value)) {
                // if the value at the target is not an object, override it with an
                // object so we can continue the recursion
                if (!isObject(target[key])) {
                    target[key] = value;
                }
                mergeOne(target[key], value);
                // if the result of the merge is an empty object, it's because the
                // eventual value we assigned is `undefined`, and there are no
                // sibling concrete values alongside, so we can delete this tree.
                const output = target[key];
                if (isObject(output) && Object.keys(output).length === 0 && destructive) {
                    delete target[key];
                }
            }
            else if (value === undefined && destructive) {
                delete target[key];
            }
            else if (typeof value !== 'undefined') {
                target[key] = value;
            }
        }
    }
    const others = objects.filter(x => x != null);
    if (others.length === 0) {
        return {};
    }
    const into = others.splice(0, 1)[0];
    others.forEach(other => mergeOne(into, other));
    return into;
}
exports.deepMerge = deepMerge;
/*
 * Deduplicate values in a list, returning a new array.
 * @param array list of values
 */
function dedupArray(array) {
    return array.filter((val, idx) => array.indexOf(val) === idx);
}
exports.dedupArray = dedupArray;
/**
 * Returns a sorted version of `x` or `undefined` if it is an empty array or object.
 */
function sorted(x) {
    if (x == null) {
        return undefined;
    }
    if (Array.isArray(x)) {
        if (x.length === 0) {
            return undefined;
        }
        return x.sort();
    }
    else if (typeof x === 'object') {
        if (Object.keys(x).length === 0) {
            return undefined;
        }
        const result = {};
        for (const [key, value] of Object.entries(x).sort(([l], [r]) => l.localeCompare(r))) {
            result[key] = value;
        }
        return result;
    }
    else {
        return x;
    }
}
exports.sorted = sorted;
function formatAsPythonModule(name) {
    return name.replace(/-/g, '_').replace(/\./g, '_');
}
exports.formatAsPythonModule = formatAsPythonModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUErQztBQUMvQyw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLHFDQUFxQztBQUNyQyxpRUFBaUU7QUFDakUsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRXpDLFNBQWdCLElBQUksQ0FBQyxPQUFlLEVBQUUsT0FBdUM7SUFDM0UsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6QixPQUFPLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO1FBQ3JDLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUMxQyxHQUFHLE9BQU87S0FDWCxDQUFDLENBQUM7QUFDTCxDQUFDO0FBTkQsb0JBTUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLGVBQWUsQ0FBQyxPQUFlLEVBQUUsT0FBdUM7SUFDdEYsSUFBSTtRQUNGLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdILElBQUksQ0FBQyxLQUFLLEVBQUU7WUFBRSxPQUFPLFNBQVMsQ0FBQztTQUFFLENBQUMsMkNBQTJDO1FBQzdFLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFBQyxXQUFNO1FBQ04sT0FBTyxTQUFTLENBQUM7S0FDbEI7QUFDSCxDQUFDO0FBUkQsMENBUUM7QUFrQkQsU0FBZ0Isa0JBQWtCLENBQUMsT0FBeUI7O0lBQzFELE1BQU0sUUFBUSxTQUFHLE9BQU8sQ0FBQyxRQUFRLG1DQUFJLEtBQUssQ0FB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QUFGRCxvREFFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgbG9nZ2luZyBmcm9tICcuL2xvZ2dpbmcnO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbmNvbnN0IGRlY2FtZWxpemUgPSByZXF1aXJlKCdkZWNhbWVsaXplJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjKGNvbW1hbmQ6IHN0cmluZywgb3B0aW9ucz86IGNoaWxkX3Byb2Nlc3MuRXhlY1N5bmNPcHRpb25zKSB7XG4gIGxvZ2dpbmcudmVyYm9zZShjb21tYW5kKTtcbiAgcmV0dXJuIGNoaWxkX3Byb2Nlc3MuZXhlY1N5bmMoY29tbWFuZCwge1xuICAgIHN0ZGlvOiBbJ2luaGVyaXQnLCBwcm9jZXNzLnN0ZGVyciwgJ3BpcGUnXSxcbiAgICAuLi5vcHRpb25zLFxuICB9KTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBgY29tbWFuZGAgYW5kIHJldHVybnMgaXRzIHZhbHVlIG9yIHVuZGVmaW5lZCBpZiB0aGUgY29tbWFuZCBmYWlsZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGVjT3JVbmRlZmluZWQoY29tbWFuZDogc3RyaW5nLCBvcHRpb25zPzogY2hpbGRfcHJvY2Vzcy5FeGVjU3luY09wdGlvbnMpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbHVlID0gY2hpbGRfcHJvY2Vzcy5leGVjU3luYyhjb21tYW5kLCB7IHN0ZGlvOiBbJ2luaGVyaXQnLCAncGlwZScsICdpZ25vcmUnXSwgLi4ub3B0aW9ucyB9KS50b1N0cmluZygndXRmLTgnKS50cmltKCk7XG4gICAgaWYgKCF2YWx1ZSkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IC8vIGFuIGVtcHR5IHN0cmluZyBpcyB0aGUgc2FtZSBhcyB1bmRlZmluZWRcbiAgICByZXR1cm4gdmFsdWU7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBXcml0ZUZpbGVPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGdlbmVyYXRlZCBmaWxlIHNob3VsZCBiZSBtYXJrZWQgYXMgZXhlY3V0YWJsZS5cbiAgICpcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGV4ZWN1dGFibGU/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBnZW5lcmF0ZWQgZmlsZSBzaG91bGQgYmUgcmVhZG9ubHkuXG4gICAqXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICByZWFkb25seT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlUGVybWlzc2lvbnMob3B0aW9uczogV3JpdGVGaWxlT3B0aW9ucyk6IHN0cmluZyB7XG4gIGNvbnN0IHJlYWRvbmx5ID0gb3B0aW9ucy5yZWFkb25seSA/PyBmYWxzZTtcbiAgY29uc3QgZXhlY3V0YWJsZSA9IG9wdGlvbnMuZXhlY3V0YWJsZSA/PyBmYWxzZTtcbiAgaWYgKHJlYWRvbmx5ICYmIGV4ZWN1dGFibGUpIHtcbiAgICByZXR1cm4gJzUwMCc7XG4gIH0gZWxzZSBpZiAocmVhZG9ubHkpIHtcbiAgICByZXR1cm4gJzQwMCc7XG4gIH0gZWxzZSBpZiAoZXhlY3V0YWJsZSkge1xuICAgIHJldHVybiAnNzU1JztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJzY0NCc7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlRmlsZShmaWxlUGF0aDogc3RyaW5nLCBkYXRhOiBhbnksIG9wdGlvbnM6IFdyaXRlRmlsZU9wdGlvbnMgPSB7fSkge1xuICBpZiAoZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICBmcy5jaG1vZFN5bmMoZmlsZVBhdGgsICc2MDAnKTtcbiAgfVxuXG4gIGZzLm1rZGlycFN5bmMocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSk7XG4gIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGRhdGEpO1xuXG4gIGZzLmNobW9kU3luYyhmaWxlUGF0aCwgZ2V0RmlsZVBlcm1pc3Npb25zKG9wdGlvbnMpKTtcbn1cblxuLyoqXG4gKiBEZWNhbWVsaXplcyB0aGUga2V5cyBvZiBhbiBvYmplY3Qgc3RydWN0dXJlLCByZWN1cnNpbmcgdGhyb3VnaCBjaGlsZCBvYmplY3RzIGFuZCBhcnJheXMuXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVjYW1lbGl6ZVJlY3Vyc2l2ZWx5T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBNYXggZGVwdGggdG8gcmVjdXJzZSBiZWZvcmUgZXJyb3JpbmcuXG4gICAqIEBkZWZhdWx0IDEwXG4gICAqL1xuICBtYXhEZXB0aD86IG51bWJlcjtcblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIHdoZW4gYSBrZXkgc2hvdWxkIGJlIGRlY2FtZWxpemVkXG4gICAqIEBkZWZhdWx0IC0gYWxsIGtleXMgYXJlIGRlY2FtZWxpemVkXG4gICAqL1xuICBzaG91bGREZWNhbWVsaXplPzogKHBhdGg6IHN0cmluZ1tdLCB2YWx1ZTogYW55KSA9PiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBTZXBhcmF0b3IgZm9yIGRlY2FtZWxpemluZy5cbiAgICogQGRlZmF1bHQgXCJfXCJcbiAgICovXG4gIHNlcGFyYXRvcj86IHN0cmluZztcblxuICAvKipcbiAgICogQ3VycmVudCBwYXRoLlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHBhdGg/OiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY2FtZWxpemVLZXlzUmVjdXJzaXZlbHkoaW5wdXQ6IGFueSwgb3B0PzogRGVjYW1lbGl6ZVJlY3Vyc2l2ZWx5T3B0aW9ucyk6IGFueSB7XG4gIGNvbnN0IHNob3VsZEFsd2F5c0RlY2FtZWxpemUgPSAoKSA9PiB0cnVlO1xuICBjb25zdCBzaG91bGREZWNhbWVsaXplID0gb3B0Py5zaG91bGREZWNhbWVsaXplID8/IHNob3VsZEFsd2F5c0RlY2FtZWxpemU7XG4gIGNvbnN0IHNlcGFyYXRvciA9IG9wdD8uc2VwYXJhdG9yID8/ICdfJztcbiAgY29uc3QgcGF0aF8gPSBvcHQ/LnBhdGggPz8gW107XG4gIGNvbnN0IG1heERlcHRoID0gb3B0Py5tYXhEZXB0aCA/PyAxMDtcblxuICBpZiAocGF0aF8ubGVuZ3RoID4gbWF4RGVwdGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0RlY2FtZWxsZWQgdG9vIGRlZXBseSAtIGNoZWNrIHRoYXQgdGhlIGlucHV0IGhhcyBubyBjaXJjdWxhciByZWZlcmVuY2VzJyk7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICByZXR1cm4gaW5wdXQubWFwKChrLCBpKSA9PiBkZWNhbWVsaXplS2V5c1JlY3Vyc2l2ZWx5KGssIHtcbiAgICAgIC4uLm9wdCxcbiAgICAgIHBhdGg6IFsuLi5wYXRoXywgaS50b1N0cmluZygpXSxcbiAgICB9KSk7XG4gIH1cblxuICBpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyAmJiBpbnB1dCAhPT0gbnVsbCkge1xuICAgIGNvbnN0IG1hcHBlZE9iamVjdDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGlucHV0KSkge1xuICAgICAgY29uc3QgdHJhbnNmb3JtZWRLZXkgPSBzaG91bGREZWNhbWVsaXplKFsuLi5wYXRoXywga2V5XSwgdmFsdWUpXG4gICAgICAgID8gZGVjYW1lbGl6ZShrZXksIHNlcGFyYXRvcilcbiAgICAgICAgOiBrZXk7XG5cbiAgICAgIG1hcHBlZE9iamVjdFt0cmFuc2Zvcm1lZEtleV0gPSBkZWNhbWVsaXplS2V5c1JlY3Vyc2l2ZWx5KHZhbHVlLCB7XG4gICAgICAgIC4uLm9wdCxcbiAgICAgICAgcGF0aDogWy4uLnBhdGhfLCBrZXldLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcHBlZE9iamVjdDtcbiAgfVxuXG4gIHJldHVybiBpbnB1dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGZhbHNlIGlmIHZhbHVlIGlzIHVuc2V0IG9yIGEgZmFsc2V5IHZhbHVlLCBhbmQgdHJ1ZSBvdGhlcndpc2UuXG4gKiBAcGFyYW0gdmFsdWUgYW4gZW52aXJvbm1lbnQgdmFyaWFibGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVHJ1dGh5KHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBib29sZWFuIHtcbiAgcmV0dXJuICEodmFsdWUgPT09IHVuZGVmaW5lZCB8fCBbJ251bGwnLCAndW5kZWZpbmVkJywgJzAnLCAnZmFsc2UnLCAnJ10uaW5jbHVkZXModmFsdWUudG9Mb2NhbGVMb3dlckNhc2UoKSkpO1xufVxuXG4vKipcbiAqIFR5cGUgb2YgYSBtYXAgbWFwcGluZyBzdHJpbmdzIHRvIHNvbWUgYXJiaXRyYXJ5IHR5cGVcbiAqL1xuZXhwb3J0IHR5cGUgT2JqPFQ+ID0geyBba2V5OiBzdHJpbmddOiBUIH07XG5cbi8qKlxuICogUmV0dXJuIHdoZXRoZXIgdGhlIGdpdmVuIHZhbHVlIGlzIGFuIG9iamVjdFxuICpcbiAqIEV2ZW4gdGhvdWdoIGFycmF5cyBhbmQgaW5zdGFuY2VzIG9mIGNsYXNzZXMgdGVjaG5pY2FsbHkgYXJlIG9iamVjdHMsIHdlXG4gKiB1c3VhbGx5IHdhbnQgdG8gdHJlYXQgdGhlbSBkaWZmZXJlbnRseSwgc28gd2UgcmV0dXJuIGZhbHNlIGluIHRob3NlIGNhc2VzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3QoeDogYW55KTogeCBpcyBPYmo8YW55PiB7XG4gIHJldHVybiB4ICE9PSBudWxsICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh4KVxuICAgICYmIHguY29uc3RydWN0b3IubmFtZSA9PT0gJ09iamVjdCc7XG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgbWVyZ2Ugb2JqZWN0cyB0b2dldGhlclxuICpcbiAqIFRoZSBsZWZ0bW9zdCBvYmplY3QgaXMgbXV0YXRlZCBhbmQgcmV0dXJuZWQuIEFycmF5cyBhcmUgbm90IG1lcmdlZFxuICogYnV0IG92ZXJ3cml0dGVuIGp1c3QgbGlrZSBzY2FsYXJzLlxuICpcbiAqIElmIGFuIG9iamVjdCBpcyBtZXJnZWQgaW50byBhIG5vbi1vYmplY3QsIHRoZSBub24tb2JqZWN0IGlzIGxvc3QuXG4gKlxuICogYHVuZGVmaW5lZGBzIHdpbGwgY2F1c2UgYSB2YWx1ZSB0byBiZSBkZWxldGVkIGlmIGRlc3RydWN0aXZlIGlzIGVuYWJsZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWVwTWVyZ2Uob2JqZWN0czogQXJyYXk8T2JqPGFueT4gfCB1bmRlZmluZWQ+LCBkZXN0cnVjdGl2ZTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gIGZ1bmN0aW9uIG1lcmdlT25lKHRhcmdldDogT2JqPGFueT4sIHNvdXJjZTogT2JqPGFueT4pIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzb3VyY2UpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHNvdXJjZVtrZXldO1xuXG4gICAgICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIC8vIGlmIHRoZSB2YWx1ZSBhdCB0aGUgdGFyZ2V0IGlzIG5vdCBhbiBvYmplY3QsIG92ZXJyaWRlIGl0IHdpdGggYW5cbiAgICAgICAgLy8gb2JqZWN0IHNvIHdlIGNhbiBjb250aW51ZSB0aGUgcmVjdXJzaW9uXG4gICAgICAgIGlmICghaXNPYmplY3QodGFyZ2V0W2tleV0pKSB7XG4gICAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBtZXJnZU9uZSh0YXJnZXRba2V5XSwgdmFsdWUpO1xuXG4gICAgICAgIC8vIGlmIHRoZSByZXN1bHQgb2YgdGhlIG1lcmdlIGlzIGFuIGVtcHR5IG9iamVjdCwgaXQncyBiZWNhdXNlIHRoZVxuICAgICAgICAvLyBldmVudHVhbCB2YWx1ZSB3ZSBhc3NpZ25lZCBpcyBgdW5kZWZpbmVkYCwgYW5kIHRoZXJlIGFyZSBub1xuICAgICAgICAvLyBzaWJsaW5nIGNvbmNyZXRlIHZhbHVlcyBhbG9uZ3NpZGUsIHNvIHdlIGNhbiBkZWxldGUgdGhpcyB0cmVlLlxuICAgICAgICBjb25zdCBvdXRwdXQgPSB0YXJnZXRba2V5XTtcbiAgICAgICAgaWYgKGlzT2JqZWN0KG91dHB1dCkgJiYgT2JqZWN0LmtleXMob3V0cHV0KS5sZW5ndGggPT09IDAgJiYgZGVzdHJ1Y3RpdmUpIHtcbiAgICAgICAgICBkZWxldGUgdGFyZ2V0W2tleV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiBkZXN0cnVjdGl2ZSkge1xuICAgICAgICBkZWxldGUgdGFyZ2V0W2tleV07XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBvdGhlcnMgPSBvYmplY3RzLmZpbHRlcih4ID0+IHggIT0gbnVsbCkgYXMgQXJyYXk8T2JqPGFueT4+O1xuXG4gIGlmIChvdGhlcnMubGVuZ3RoID09PSAwKSB7IHJldHVybiB7fTsgfVxuICBjb25zdCBpbnRvID0gb3RoZXJzLnNwbGljZSgwLCAxKVswXTtcblxuICBvdGhlcnMuZm9yRWFjaChvdGhlciA9PiBtZXJnZU9uZShpbnRvLCBvdGhlcikpO1xuICByZXR1cm4gaW50bztcbn1cblxuLypcbiAqIERlZHVwbGljYXRlIHZhbHVlcyBpbiBhIGxpc3QsIHJldHVybmluZyBhIG5ldyBhcnJheS5cbiAqIEBwYXJhbSBhcnJheSBsaXN0IG9mIHZhbHVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVkdXBBcnJheTxUPihhcnJheTogVFtdKTogVFtdIHtcbiAgcmV0dXJuIGFycmF5LmZpbHRlcigodmFsLCBpZHgpID0+IGFycmF5LmluZGV4T2YodmFsKSA9PT0gaWR4KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc29ydGVkIHZlcnNpb24gb2YgYHhgIG9yIGB1bmRlZmluZWRgIGlmIGl0IGlzIGFuIGVtcHR5IGFycmF5IG9yIG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNvcnRlZDxUPih4OiBUKSB7XG4gIGlmICh4ID09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuICBpZiAoQXJyYXkuaXNBcnJheSh4KSkge1xuICAgIGlmICh4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG4gICAgcmV0dXJuICh4IGFzIHVua25vd25bXSkuc29ydCgpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB4ID09PSAnb2JqZWN0Jykge1xuICAgIGlmIChPYmplY3Qua2V5cyh4KS5sZW5ndGggPT09IDApIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuICAgIGNvbnN0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh4KS5zb3J0KChbbF0sIFtyXSkgPT4gbC5sb2NhbGVDb21wYXJlKHIpKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdCBhcyBUO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB4O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRBc1B5dGhvbk1vZHVsZShuYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5hbWUucmVwbGFjZSgvLS9nLCAnXycpLnJlcGxhY2UoL1xcLi9nLCAnXycpO1xufVxuIl19