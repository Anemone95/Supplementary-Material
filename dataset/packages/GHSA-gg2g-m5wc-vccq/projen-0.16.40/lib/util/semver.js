"use strict";
// stolen from: https://github.com/aws/jsii/blob/main/packages/jsii-pacmak/lib/targets/version-utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.toReleaseVersion = exports.toPythonVersionRange = exports.toNuGetVersionRange = exports.toMavenVersionRange = exports.TargetName = void 0;
const util_1 = require("util");
const semver_1 = require("semver");
var TargetName;
(function (TargetName) {
    TargetName[TargetName["JAVA"] = 0] = "JAVA";
    TargetName[TargetName["DOTNET"] = 1] = "DOTNET";
    TargetName[TargetName["PYTHON"] = 2] = "PYTHON";
    TargetName[TargetName["GO"] = 3] = "GO";
    TargetName[TargetName["JAVASCRIPT"] = 4] = "JAVASCRIPT";
})(TargetName = exports.TargetName || (exports.TargetName = {}));
/**
 * Converts a SemVer range expression to a Maven version range expression.
 *
 * @param semverRange the SemVer range expression to convert.
 * @param suffix      the suffix to add to versions in the range.
 *
 * @see https://cwiki.apache.org/confluence/display/MAVENOLD/Dependency+Mediation+and+Conflict+Resolution
 */
function toMavenVersionRange(semverRange, suffix) {
    return toBracketNotation(semverRange, suffix, {
        semver: false,
        target: TargetName.JAVA,
    });
}
exports.toMavenVersionRange = toMavenVersionRange;
/**
 * Converts a SemVer range expression to a NuGet version range expression.
 *
 * @param semverRange the SemVer range expression to convert.
 *
 * @see https://docs.microsoft.com/en-us/nuget/concepts/package-versioning#version-ranges-and-wildcards
 */
function toNuGetVersionRange(semverRange) {
    return toBracketNotation(semverRange, undefined, {
        semver: false,
        target: TargetName.DOTNET,
    });
}
exports.toNuGetVersionRange = toNuGetVersionRange;
/**
 * Converts a SemVer range expression to a Python setuptools compatible version
 * constraint expression.
 *
 * @param semverRange the SemVer range expression to convert.
 */
function toPythonVersionRange(semverRange) {
    const range = new semver_1.Range(semverRange);
    return range.set
        .map((set) => set
        .map((comp) => {
        var _a, _b;
        const versionId = toReleaseVersion((_b = (_a = comp.semver.raw) === null || _a === void 0 ? void 0 : _a.replace(/-0$/, '')) !== null && _b !== void 0 ? _b : '0.0.0', TargetName.PYTHON);
        switch (comp.operator) {
            case '':
                // With ^0.0.0, somehow we get a left entry with an empty operator and value, we'll fix this up
                return comp.value === '' ? '>=0.0.0' : `==${versionId}`;
            case '=':
                return `==${versionId}`;
            default:
                // >, >=, <, <= are all valid expressions
                return `${comp.operator}${versionId}`;
        }
    })
        .join(', '))
        .join(', ');
}
exports.toPythonVersionRange = toPythonVersionRange;
/**
 * Converts an original version number from the NPM convention to the target
 * language's convention for expressing the same. For versions that do not
 * include a prerelease identifier, this always returns the assembly version
 * unmodified.
 *
 * @param assemblyVersion the assembly version being released
 * @param target          the target language for which the version is destined
 *
 * @returns the version that should be serialized
 */
function toReleaseVersion(assemblyVersion, target) {
    const version = semver_1.parse(assemblyVersion, { includePrerelease: true });
    if (version == null) {
        throw new Error(`Unable to parse the provided assembly version: "${assemblyVersion}"`);
    }
    if (version.prerelease.length === 0) {
        return assemblyVersion;
    }
    switch (target) {
        case TargetName.PYTHON:
            // Python supports a limited set of identifiers... And we have a mapping table...
            // https://packaging.python.org/guides/distributing-packages-using-setuptools/#pre-release-versioning
            const [label, sequence, ...rest] = version.prerelease;
            if (rest.filter((elt) => elt !== 0).length > 0 || sequence == null) {
                throw new Error(`Unable to map prerelease identifier (in: ${assemblyVersion}) components to python: ${util_1.inspect(version.prerelease)}. The format should be 'X.Y.Z-label.sequence', where sequence is a positive integer, and label is "dev", "pre", "alpha", beta", or "rc"`);
            }
            if (!Number.isInteger(sequence)) {
                throw new Error(`Unable to map prerelease identifier (in: ${assemblyVersion}) to python, as sequence ${util_1.inspect(sequence)} is not an integer`);
            }
            const baseVersion = `${version.major}.${version.minor}.${version.patch}`;
            // See PEP 440: https://www.python.org/dev/peps/pep-0440/#pre-releases
            switch (label) {
                case 'dev':
                case 'pre':
                    return `${baseVersion}.dev${sequence}`;
                case 'alpha':
                    return `${baseVersion}.a${sequence}`;
                case 'beta':
                    return `${baseVersion}.b${sequence}`;
                case 'rc':
                    return `${baseVersion}.rc${sequence}`;
                default:
                    throw new Error(`Unable to map prerelease identifier (in: ${assemblyVersion}) to python, as label ${util_1.inspect(label)} is not mapped (only "dev", "pre", "alpha", "beta" and "rc" are)`);
            }
        case TargetName.DOTNET:
        case TargetName.GO:
        case TargetName.JAVA:
        case TargetName.JAVASCRIPT:
            // Not touching - the NPM version number should be usable as-is
            break;
    }
    return assemblyVersion;
}
exports.toReleaseVersion = toReleaseVersion;
/**
 * Converts a semantic version range to the kind of bracket notation used by
 * Maven and NuGet. For example, this turns `^1.2.3` into `[1.2.3,2.0.0)`.
 *
 * @param semverRange The semantic version range to be converted.
 * @param suffix A version suffix to apply to versions in the resulting expression.
 * @param semver Whether the target supports full semantic versioning (including
 *               `-0` as the lowest possible prerelease identifier)
 *
 * @returns a bracket-notation version range.
 */
function toBracketNotation(semverRange, suffix, { semver = true, target = TargetName.JAVASCRIPT, } = {}) {
    if (semverRange === '*') {
        semverRange = '>=0.0.0';
    }
    const range = new semver_1.Range(semverRange);
    if (semverRange === range.range) {
        return semverRange;
    }
    return range.set
        .map((set) => {
        if (set.length === 1) {
            const version = set[0].semver.raw;
            if (!version && range.raw === '>=0.0.0') {
                // Case where version is '*'
                return '[0.0.0,)';
            }
            switch (set[0].operator || '=') {
                // "[version]" => means exactly version
                case '=':
                    return `[${addSuffix(version)}]`;
                // "(version,]" => means greater than version
                case '>':
                    return `(${addSuffix(version)},)`;
                // "[version,]" => means greater than or equal to that version
                case '>=':
                    return `[${addSuffix(version)},)`;
                // "[,version)" => means less than version
                case '<':
                    return `(,${addSuffix(version, !semver)})`;
                // "[,version]" => means less than or equal to version
                case '<=':
                    return `(,${addSuffix(version)}]`;
            }
        }
        else if (set.length === 2) {
            const nugetRange = toBracketRange(set[0], set[1]);
            if (nugetRange) {
                return nugetRange;
            }
        }
        throw new Error(`Unsupported SemVer range set in ${semverRange}: ${set
            .map((comp) => comp.value)
            .join(', ')}`);
    })
        .join(', ');
    function toBracketRange(left, right) {
        if (left.operator.startsWith('<') && right.operator.startsWith('>')) {
            // Order isn't ideal, swap around..
            [left, right] = [right, left];
        }
        // With ^0.0.0, somehow we get a left entry with an empty operator and value, we'll fix this up
        if (left.operator === '' && left.value === '') {
            left = new semver_1.Comparator('>=0.0.0', left.options);
        }
        if (!left.operator.startsWith('>') || !right.operator.startsWith('<')) {
            // We only support ranges defined like "> (or >=) left, < (or <=) right"
            return undefined;
        }
        const leftBrace = left.operator.endsWith('=') ? '[' : '(';
        const rightBrace = right.operator.endsWith('=') ? ']' : ')';
        return `${leftBrace}${addSuffix(left.semver.raw)},${addSuffix(right.semver.raw, right.operator === '<' && !semver)}${rightBrace}`;
    }
    function addSuffix(str, trimDashZero = false) {
        if (!str) {
            return '';
        }
        if (trimDashZero) {
            str = str.replace(/-0$/, '');
        }
        return suffix ? `${str}${suffix}` : toReleaseVersion(str, target);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvc2VtdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1R0FBdUc7OztBQUV2RywrQkFBK0I7QUFDL0IsbUNBQWtEO0FBRWxELElBQVksVUFNWDtBQU5ELFdBQVksVUFBVTtJQUNwQiwyQ0FBSSxDQUFBO0lBQ0osK0NBQU0sQ0FBQTtJQUNOLCtDQUFNLENBQUE7SUFDTix1Q0FBRSxDQUFBO0lBQ0YsdURBQVUsQ0FBQTtBQUNaLENBQUMsRUFOVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQU1yQjtBQUVEOzs7Ozs7O0dBT0c7QUFDSCxTQUFnQixtQkFBbUIsQ0FDakMsV0FBbUIsRUFDbkIsTUFBZTtJQUVmLE9BQU8saUJBQWlCLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRTtRQUM1QyxNQUFNLEVBQUUsS0FBSztRQUNiLE1BQU0sRUFBRSxVQUFVLENBQUMsSUFBSTtLQUN4QixDQUFDLENBQUM7QUFDTCxDQUFDO0FBUkQsa0RBUUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixtQkFBbUIsQ0FBQyxXQUFtQjtJQUNyRCxPQUFPLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUU7UUFDL0MsTUFBTSxFQUFFLEtBQUs7UUFDYixNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07S0FDMUIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUxELGtEQUtDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxXQUFtQjtJQUN0RCxNQUFNLEtBQUssR0FBRyxJQUFJLGNBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNyQyxPQUFPLEtBQUssQ0FBQyxHQUFHO1NBQ2IsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDWCxHQUFHO1NBQ0EsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7O1FBQ1osTUFBTSxTQUFTLEdBQUcsZ0JBQWdC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QUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDcEUsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzdG9sZW4gZnJvbTogaHR0cHM6Ly9naXRodWIuY29tL2F3cy9qc2lpL2Jsb2IvbWFpbi9wYWNrYWdlcy9qc2lpLXBhY21hay9saWIvdGFyZ2V0cy92ZXJzaW9uLXV0aWxzLnRzXG5cbmltcG9ydCB7IGluc3BlY3QgfSBmcm9tICd1dGlsJztcbmltcG9ydCB7IENvbXBhcmF0b3IsIFJhbmdlLCBwYXJzZSB9IGZyb20gJ3NlbXZlcic7XG5cbmV4cG9ydCBlbnVtIFRhcmdldE5hbWUge1xuICBKQVZBLFxuICBET1RORVQsXG4gIFBZVEhPTixcbiAgR08sXG4gIEpBVkFTQ1JJUFRcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIFNlbVZlciByYW5nZSBleHByZXNzaW9uIHRvIGEgTWF2ZW4gdmVyc2lvbiByYW5nZSBleHByZXNzaW9uLlxuICpcbiAqIEBwYXJhbSBzZW12ZXJSYW5nZSB0aGUgU2VtVmVyIHJhbmdlIGV4cHJlc3Npb24gdG8gY29udmVydC5cbiAqIEBwYXJhbSBzdWZmaXggICAgICB0aGUgc3VmZml4IHRvIGFkZCB0byB2ZXJzaW9ucyBpbiB0aGUgcmFuZ2UuXG4gKlxuICogQHNlZSBodHRwczovL2N3aWtpLmFwYWNoZS5vcmcvY29uZmx1ZW5jZS9kaXNwbGF5L01BVkVOT0xEL0RlcGVuZGVuY3krTWVkaWF0aW9uK2FuZCtDb25mbGljdCtSZXNvbHV0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b01hdmVuVmVyc2lvblJhbmdlKFxuICBzZW12ZXJSYW5nZTogc3RyaW5nLFxuICBzdWZmaXg/OiBzdHJpbmcsXG4pOiBzdHJpbmcge1xuICByZXR1cm4gdG9CcmFja2V0Tm90YXRpb24oc2VtdmVyUmFuZ2UsIHN1ZmZpeCwge1xuICAgIHNlbXZlcjogZmFsc2UsXG4gICAgdGFyZ2V0OiBUYXJnZXROYW1lLkpBVkEsXG4gIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgU2VtVmVyIHJhbmdlIGV4cHJlc3Npb24gdG8gYSBOdUdldCB2ZXJzaW9uIHJhbmdlIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIHNlbXZlclJhbmdlIHRoZSBTZW1WZXIgcmFuZ2UgZXhwcmVzc2lvbiB0byBjb252ZXJ0LlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvbnVnZXQvY29uY2VwdHMvcGFja2FnZS12ZXJzaW9uaW5nI3ZlcnNpb24tcmFuZ2VzLWFuZC13aWxkY2FyZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvTnVHZXRWZXJzaW9uUmFuZ2Uoc2VtdmVyUmFuZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB0b0JyYWNrZXROb3RhdGlvbihzZW12ZXJSYW5nZSwgdW5kZWZpbmVkLCB7XG4gICAgc2VtdmVyOiBmYWxzZSxcbiAgICB0YXJnZXQ6IFRhcmdldE5hbWUuRE9UTkVULFxuICB9KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIFNlbVZlciByYW5nZSBleHByZXNzaW9uIHRvIGEgUHl0aG9uIHNldHVwdG9vbHMgY29tcGF0aWJsZSB2ZXJzaW9uXG4gKiBjb25zdHJhaW50IGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIHNlbXZlclJhbmdlIHRoZSBTZW1WZXIgcmFuZ2UgZXhwcmVzc2lvbiB0byBjb252ZXJ0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9QeXRob25WZXJzaW9uUmFuZ2Uoc2VtdmVyUmFuZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKHNlbXZlclJhbmdlKTtcbiAgcmV0dXJuIHJhbmdlLnNldFxuICAgIC5tYXAoKHNldCkgPT5cbiAgICAgIHNldFxuICAgICAgICAubWFwKChjb21wKSA9PiB7XG4gICAgICAgICAgY29uc3QgdmVyc2lvbklkID0gdG9SZWxlYXNlVmVyc2lvbihcbiAgICAgICAgICAgIGNvbXAuc2VtdmVyLnJhdz8ucmVwbGFjZSgvLTAkLywgJycpID8/ICcwLjAuMCcsXG4gICAgICAgICAgICBUYXJnZXROYW1lLlBZVEhPTixcbiAgICAgICAgICApO1xuICAgICAgICAgIHN3aXRjaCAoY29tcC5vcGVyYXRvcikge1xuICAgICAgICAgICAgY2FzZSAnJzpcbiAgICAgICAgICAgICAgLy8gV2l0aCBeMC4wLjAsIHNvbWVob3cgd2UgZ2V0IGEgbGVmdCBlbnRyeSB3aXRoIGFuIGVtcHR5IG9wZXJhdG9yIGFuZCB2YWx1ZSwgd2UnbGwgZml4IHRoaXMgdXBcbiAgICAgICAgICAgICAgcmV0dXJuIGNvbXAudmFsdWUgPT09ICcnID8gJz49MC4wLjAnIDogYD09JHt2ZXJzaW9uSWR9YDtcbiAgICAgICAgICAgIGNhc2UgJz0nOlxuICAgICAgICAgICAgICByZXR1cm4gYD09JHt2ZXJzaW9uSWR9YDtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIC8vID4sID49LCA8LCA8PSBhcmUgYWxsIHZhbGlkIGV4cHJlc3Npb25zXG4gICAgICAgICAgICAgIHJldHVybiBgJHtjb21wLm9wZXJhdG9yfSR7dmVyc2lvbklkfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuam9pbignLCAnKSxcbiAgICApXG4gICAgLmpvaW4oJywgJyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gb3JpZ2luYWwgdmVyc2lvbiBudW1iZXIgZnJvbSB0aGUgTlBNIGNvbnZlbnRpb24gdG8gdGhlIHRhcmdldFxuICogbGFuZ3VhZ2UncyBjb252ZW50aW9uIGZvciBleHByZXNzaW5nIHRoZSBzYW1lLiBGb3IgdmVyc2lvbnMgdGhhdCBkbyBub3RcbiAqIGluY2x1ZGUgYSBwcmVyZWxlYXNlIGlkZW50aWZpZXIsIHRoaXMgYWx3YXlzIHJldHVybnMgdGhlIGFzc2VtYmx5IHZlcnNpb25cbiAqIHVubW9kaWZpZWQuXG4gKlxuICogQHBhcmFtIGFzc2VtYmx5VmVyc2lvbiB0aGUgYXNzZW1ibHkgdmVyc2lvbiBiZWluZyByZWxlYXNlZFxuICogQHBhcmFtIHRhcmdldCAgICAgICAgICB0aGUgdGFyZ2V0IGxhbmd1YWdlIGZvciB3aGljaCB0aGUgdmVyc2lvbiBpcyBkZXN0aW5lZFxuICpcbiAqIEByZXR1cm5zIHRoZSB2ZXJzaW9uIHRoYXQgc2hvdWxkIGJlIHNlcmlhbGl6ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvUmVsZWFzZVZlcnNpb24oXG4gIGFzc2VtYmx5VmVyc2lvbjogc3RyaW5nLFxuICB0YXJnZXQ6IFRhcmdldE5hbWUsXG4pOiBzdHJpbmcge1xuICBjb25zdCB2ZXJzaW9uID0gcGFyc2UoYXNzZW1ibHlWZXJzaW9uLCB7IGluY2x1ZGVQcmVyZWxlYXNlOiB0cnVlIH0pO1xuICBpZiAodmVyc2lvbiA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFVuYWJsZSB0byBwYXJzZSB0aGUgcHJvdmlkZWQgYXNzZW1ibHkgdmVyc2lvbjogXCIke2Fzc2VtYmx5VmVyc2lvbn1cImAsXG4gICAgKTtcbiAgfVxuICBpZiAodmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBhc3NlbWJseVZlcnNpb247XG4gIH1cbiAgc3dpdGNoICh0YXJnZXQpIHtcbiAgICBjYXNlIFRhcmdldE5hbWUuUFlUSE9OOlxuICAgICAgLy8gUHl0aG9uIHN1cHBvcnRzIGEgbGltaXRlZCBzZXQgb2YgaWRlbnRpZmllcnMuLi4gQW5kIHdlIGhhdmUgYSBtYXBwaW5nIHRhYmxlLi4uXG4gICAgICAvLyBodHRwczovL3BhY2thZ2luZy5weXRob24ub3JnL2d1aWRlcy9kaXN0cmlidXRpbmctcGFja2FnZXMtdXNpbmctc2V0dXB0b29scy8jcHJlLXJlbGVhc2UtdmVyc2lvbmluZ1xuICAgICAgY29uc3QgW2xhYmVsLCBzZXF1ZW5jZSwgLi4ucmVzdF0gPSB2ZXJzaW9uLnByZXJlbGVhc2U7XG4gICAgICBpZiAocmVzdC5maWx0ZXIoKGVsdCkgPT4gZWx0ICE9PSAwKS5sZW5ndGggPiAwIHx8IHNlcXVlbmNlID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gbWFwIHByZXJlbGVhc2UgaWRlbnRpZmllciAoaW46ICR7YXNzZW1ibHlWZXJzaW9ufSkgY29tcG9uZW50cyB0byBweXRob246ICR7aW5zcGVjdChcbiAgICAgICAgICAgIHZlcnNpb24ucHJlcmVsZWFzZSxcbiAgICAgICAgICApfS4gVGhlIGZvcm1hdCBzaG91bGQgYmUgJ1guWS5aLWxhYmVsLnNlcXVlbmNlJywgd2hlcmUgc2VxdWVuY2UgaXMgYSBwb3NpdGl2ZSBpbnRlZ2VyLCBhbmQgbGFiZWwgaXMgXCJkZXZcIiwgXCJwcmVcIiwgXCJhbHBoYVwiLCBiZXRhXCIsIG9yIFwicmNcImAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAoIU51bWJlci5pc0ludGVnZXIoc2VxdWVuY2UpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIG1hcCBwcmVyZWxlYXNlIGlkZW50aWZpZXIgKGluOiAke2Fzc2VtYmx5VmVyc2lvbn0pIHRvIHB5dGhvbiwgYXMgc2VxdWVuY2UgJHtpbnNwZWN0KFxuICAgICAgICAgICAgc2VxdWVuY2UsXG4gICAgICAgICAgKX0gaXMgbm90IGFuIGludGVnZXJgLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgY29uc3QgYmFzZVZlcnNpb24gPSBgJHt2ZXJzaW9uLm1ham9yfS4ke3ZlcnNpb24ubWlub3J9LiR7dmVyc2lvbi5wYXRjaH1gO1xuICAgICAgLy8gU2VlIFBFUCA0NDA6IGh0dHBzOi8vd3d3LnB5dGhvbi5vcmcvZGV2L3BlcHMvcGVwLTA0NDAvI3ByZS1yZWxlYXNlc1xuICAgICAgc3dpdGNoIChsYWJlbCkge1xuICAgICAgICBjYXNlICdkZXYnOlxuICAgICAgICBjYXNlICdwcmUnOlxuICAgICAgICAgIHJldHVybiBgJHtiYXNlVmVyc2lvbn0uZGV2JHtzZXF1ZW5jZX1gO1xuICAgICAgICBjYXNlICdhbHBoYSc6XG4gICAgICAgICAgcmV0dXJuIGAke2Jhc2VWZXJzaW9ufS5hJHtzZXF1ZW5jZX1gO1xuICAgICAgICBjYXNlICdiZXRhJzpcbiAgICAgICAgICByZXR1cm4gYCR7YmFzZVZlcnNpb259LmIke3NlcXVlbmNlfWA7XG4gICAgICAgIGNhc2UgJ3JjJzpcbiAgICAgICAgICByZXR1cm4gYCR7YmFzZVZlcnNpb259LnJjJHtzZXF1ZW5jZX1gO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gbWFwIHByZXJlbGVhc2UgaWRlbnRpZmllciAoaW46ICR7YXNzZW1ibHlWZXJzaW9ufSkgdG8gcHl0aG9uLCBhcyBsYWJlbCAke2luc3BlY3QoXG4gICAgICAgICAgICAgIGxhYmVsLFxuICAgICAgICAgICAgKX0gaXMgbm90IG1hcHBlZCAob25seSBcImRldlwiLCBcInByZVwiLCBcImFscGhhXCIsIFwiYmV0YVwiIGFuZCBcInJjXCIgYXJlKWAsXG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICBjYXNlIFRhcmdldE5hbWUuRE9UTkVUOlxuICAgIGNhc2UgVGFyZ2V0TmFtZS5HTzpcbiAgICBjYXNlIFRhcmdldE5hbWUuSkFWQTpcbiAgICBjYXNlIFRhcmdldE5hbWUuSkFWQVNDUklQVDpcbiAgICAgIC8vIE5vdCB0b3VjaGluZyAtIHRoZSBOUE0gdmVyc2lvbiBudW1iZXIgc2hvdWxkIGJlIHVzYWJsZSBhcy1pc1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGFzc2VtYmx5VmVyc2lvbjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIHNlbWFudGljIHZlcnNpb24gcmFuZ2UgdG8gdGhlIGtpbmQgb2YgYnJhY2tldCBub3RhdGlvbiB1c2VkIGJ5XG4gKiBNYXZlbiBhbmQgTnVHZXQuIEZvciBleGFtcGxlLCB0aGlzIHR1cm5zIGBeMS4yLjNgIGludG8gYFsxLjIuMywyLjAuMClgLlxuICpcbiAqIEBwYXJhbSBzZW12ZXJSYW5nZSBUaGUgc2VtYW50aWMgdmVyc2lvbiByYW5nZSB0byBiZSBjb252ZXJ0ZWQuXG4gKiBAcGFyYW0gc3VmZml4IEEgdmVyc2lvbiBzdWZmaXggdG8gYXBwbHkgdG8gdmVyc2lvbnMgaW4gdGhlIHJlc3VsdGluZyBleHByZXNzaW9uLlxuICogQHBhcmFtIHNlbXZlciBXaGV0aGVyIHRoZSB0YXJnZXQgc3VwcG9ydHMgZnVsbCBzZW1hbnRpYyB2ZXJzaW9uaW5nIChpbmNsdWRpbmdcbiAqICAgICAgICAgICAgICAgYC0wYCBhcyB0aGUgbG93ZXN0IHBvc3NpYmxlIHByZXJlbGVhc2UgaWRlbnRpZmllcilcbiAqXG4gKiBAcmV0dXJucyBhIGJyYWNrZXQtbm90YXRpb24gdmVyc2lvbiByYW5nZS5cbiAqL1xuZnVuY3Rpb24gdG9CcmFja2V0Tm90YXRpb24oXG4gIHNlbXZlclJhbmdlOiBzdHJpbmcsXG4gIHN1ZmZpeD86IHN0cmluZyxcbiAge1xuICAgIHNlbXZlciA9IHRydWUsXG4gICAgdGFyZ2V0ID0gVGFyZ2V0TmFtZS5KQVZBU0NSSVBULFxuICB9OiB7IHNlbXZlcj86IGJvb2xlYW47IHRhcmdldD86IFRhcmdldE5hbWUgfSA9IHt9LFxuKTogc3RyaW5nIHtcbiAgaWYgKHNlbXZlclJhbmdlID09PSAnKicpIHtcbiAgICBzZW12ZXJSYW5nZSA9ICc+PTAuMC4wJztcbiAgfVxuXG4gIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKHNlbXZlclJhbmdlKTtcbiAgaWYgKHNlbXZlclJhbmdlID09PSByYW5nZS5yYW5nZSkge1xuICAgIHJldHVybiBzZW12ZXJSYW5nZTtcbiAgfVxuXG4gIHJldHVybiByYW5nZS5zZXRcbiAgICAubWFwKChzZXQpID0+IHtcbiAgICAgIGlmIChzZXQubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHZlcnNpb24gPSBzZXRbMF0uc2VtdmVyLnJhdztcbiAgICAgICAgaWYgKCF2ZXJzaW9uICYmIHJhbmdlLnJhdyA9PT0gJz49MC4wLjAnKSB7XG4gICAgICAgICAgLy8gQ2FzZSB3aGVyZSB2ZXJzaW9uIGlzICcqJ1xuICAgICAgICAgIHJldHVybiAnWzAuMC4wLCknO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAoc2V0WzBdLm9wZXJhdG9yIHx8ICc9Jykge1xuICAgICAgICAgIC8vIFwiW3ZlcnNpb25dXCIgPT4gbWVhbnMgZXhhY3RseSB2ZXJzaW9uXG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICByZXR1cm4gYFske2FkZFN1ZmZpeCh2ZXJzaW9uKX1dYDtcbiAgICAgICAgICAvLyBcIih2ZXJzaW9uLF1cIiA9PiBtZWFucyBncmVhdGVyIHRoYW4gdmVyc2lvblxuICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgcmV0dXJuIGAoJHthZGRTdWZmaXgodmVyc2lvbil9LClgO1xuICAgICAgICAgIC8vIFwiW3ZlcnNpb24sXVwiID0+IG1lYW5zIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGF0IHZlcnNpb25cbiAgICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgICByZXR1cm4gYFske2FkZFN1ZmZpeCh2ZXJzaW9uKX0sKWA7XG4gICAgICAgICAgLy8gXCJbLHZlcnNpb24pXCIgPT4gbWVhbnMgbGVzcyB0aGFuIHZlcnNpb25cbiAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgIHJldHVybiBgKCwke2FkZFN1ZmZpeCh2ZXJzaW9uLCAhc2VtdmVyKX0pYDtcbiAgICAgICAgICAvLyBcIlssdmVyc2lvbl1cIiA9PiBtZWFucyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdmVyc2lvblxuICAgICAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgICAgIHJldHVybiBgKCwke2FkZFN1ZmZpeCh2ZXJzaW9uKX1dYDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzZXQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGNvbnN0IG51Z2V0UmFuZ2UgPSB0b0JyYWNrZXRSYW5nZShzZXRbMF0sIHNldFsxXSk7XG4gICAgICAgIGlmIChudWdldFJhbmdlKSB7XG4gICAgICAgICAgcmV0dXJuIG51Z2V0UmFuZ2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVuc3VwcG9ydGVkIFNlbVZlciByYW5nZSBzZXQgaW4gJHtzZW12ZXJSYW5nZX06ICR7c2V0XG4gICAgICAgICAgLm1hcCgoY29tcCkgPT4gY29tcC52YWx1ZSlcbiAgICAgICAgICAuam9pbignLCAnKX1gLFxuICAgICAgKTtcbiAgICB9KVxuICAgIC5qb2luKCcsICcpO1xuXG4gIGZ1bmN0aW9uIHRvQnJhY2tldFJhbmdlKFxuICAgIGxlZnQ6IENvbXBhcmF0b3IsXG4gICAgcmlnaHQ6IENvbXBhcmF0b3IsXG4gICk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGxlZnQub3BlcmF0b3Iuc3RhcnRzV2l0aCgnPCcpICYmIHJpZ2h0Lm9wZXJhdG9yLnN0YXJ0c1dpdGgoJz4nKSkge1xuICAgICAgLy8gT3JkZXIgaXNuJ3QgaWRlYWwsIHN3YXAgYXJvdW5kLi5cbiAgICAgIFtsZWZ0LCByaWdodF0gPSBbcmlnaHQsIGxlZnRdO1xuICAgIH1cblxuICAgIC8vIFdpdGggXjAuMC4wLCBzb21laG93IHdlIGdldCBhIGxlZnQgZW50cnkgd2l0aCBhbiBlbXB0eSBvcGVyYXRvciBhbmQgdmFsdWUsIHdlJ2xsIGZpeCB0aGlzIHVwXG4gICAgaWYgKGxlZnQub3BlcmF0b3IgPT09ICcnICYmIGxlZnQudmFsdWUgPT09ICcnKSB7XG4gICAgICBsZWZ0ID0gbmV3IENvbXBhcmF0b3IoJz49MC4wLjAnLCBsZWZ0Lm9wdGlvbnMpO1xuICAgIH1cblxuICAgIGlmICghbGVmdC5vcGVyYXRvci5zdGFydHNXaXRoKCc+JykgfHwgIXJpZ2h0Lm9wZXJhdG9yLnN0YXJ0c1dpdGgoJzwnKSkge1xuICAgICAgLy8gV2Ugb25seSBzdXBwb3J0IHJhbmdlcyBkZWZpbmVkIGxpa2UgXCI+IChvciA+PSkgbGVmdCwgPCAob3IgPD0pIHJpZ2h0XCJcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgbGVmdEJyYWNlID0gbGVmdC5vcGVyYXRvci5lbmRzV2l0aCgnPScpID8gJ1snIDogJygnO1xuICAgIGNvbnN0IHJpZ2h0QnJhY2UgPSByaWdodC5vcGVyYXRvci5lbmRzV2l0aCgnPScpID8gJ10nIDogJyknO1xuICAgIHJldHVybiBgJHtsZWZ0QnJhY2V9JHthZGRTdWZmaXgobGVmdC5zZW12ZXIucmF3KX0sJHthZGRTdWZmaXgoXG4gICAgICByaWdodC5zZW12ZXIucmF3LFxuICAgICAgcmlnaHQub3BlcmF0b3IgPT09ICc8JyAmJiAhc2VtdmVyLFxuICAgICl9JHtyaWdodEJyYWNlfWA7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTdWZmaXgoc3RyOiBzdHJpbmcgfCB1bmRlZmluZWQsIHRyaW1EYXNoWmVybyA9IGZhbHNlKSB7XG4gICAgaWYgKCFzdHIpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgaWYgKHRyaW1EYXNoWmVybykge1xuICAgICAgc3RyID0gc3RyLnJlcGxhY2UoLy0wJC8sICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1ZmZpeCA/IGAke3N0cn0ke3N1ZmZpeH1gIDogdG9SZWxlYXNlVmVyc2lvbihzdHIsIHRhcmdldCk7XG4gIH1cbn0iXX0=