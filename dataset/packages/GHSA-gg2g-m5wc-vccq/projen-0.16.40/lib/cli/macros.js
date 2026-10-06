"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryProcessMacro = void 0;
const path = require("path");
const util_1 = require("../util");
function tryProcessMacro(macro) {
    var _a, _b;
    if (!macro.startsWith('$')) {
        return undefined;
    }
    const basedir = path.basename(process.cwd());
    switch (macro) {
        case '$BASEDIR': return basedir;
        case '$GIT_REMOTE':
            const origin = util_1.execOrUndefined('git remote get-url origin');
            if (origin) {
                return origin;
            }
            const slug = (_a = getFromGitConfig('github.user')) !== null && _a !== void 0 ? _a : resolveEmail().split('@')[0];
            return `https://github.com/${slug}/${basedir}.git`;
        case '$GIT_USER_NAME': return (_b = getFromGitConfig('user.name')) !== null && _b !== void 0 ? _b : 'user';
        case '$GIT_USER_EMAIL': return resolveEmail();
        case '$PYTHON_MODULE_NAME': return util_1.formatAsPythonModule(basedir);
    }
    return undefined;
}
exports.tryProcessMacro = tryProcessMacro;
/**
 * Returns a value from git config. Searches local and then global git config.
 * @param key the config key
 */
function getFromGitConfig(key) {
    var _a;
    return (_a = util_1.execOrUndefined(`git config --get --includes ${key}`)) !== null && _a !== void 0 ? _a : util_1.execOrUndefined(`git config --get --global --includes ${key}`);
}
function resolveEmail() {
    var _a;
    return (_a = getFromGitConfig('user.email')) !== null && _a !== void 0 ? _a : 'user@domain.com';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFjcm9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9tYWNyb3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBQzdCLGtDQUFnRTtBQUVoRSxTQUFnQixlQUFlLENBQUMsS0FBYTs7SUFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFBRSxPQUFPLFNBQVMsQ0FBQztLQUFFO0lBRWpELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFFN0MsUUFBUSxLQUFLLEVBQUU7UUFDYixLQUFLLFVBQVUsQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFDO1FBQ2hDLEtBQUssYUFBYTtZQUNoQixNQUFNLE1BQU0sR0FBRyxzQkFBZSxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDNUQsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsT0FBTyxNQUFNLENBQUM7YUFDZjtZQUNELE1BQU0sSUFBSSxTQUFHLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxtQ0FBSSxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0UsT0FBTyxzQkFBc0IsSUFBSSxJQUFJLE9BQU8sTUFBTSxDQUFDO1FBRXJELEtBQUssZ0JBQWdCLENBQUMsQ0FBQyxhQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxtQ0FBSSxNQUFNLENBQUM7UUFDdEUsS0FBSyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sWUFBWSxFQUFFLENBQUM7UUFDOUMsS0FBSyxxQkFBcUIsQ0FBQyxDQUFDLE9BQU8sMkJBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDbEU7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBckJELDBDQXFCQztBQUVEOzs7R0FHRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsR0FBVzs7SUFDbkMsYUFBTyxzQkFBZSxDQUFDLCtCQUErQixHQUFHLEVBQUUsQ0FBQyxtQ0FDdkQsc0JBQWUsQ0FBQyx3Q0FBd0MsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUN0RSxDQUFDO0FBRUQsU0FBUyxZQUFZOztJQUNuQixhQUFPLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxtQ0FBSSxpQkFBaUIsQ0FBQztBQUM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4ZWNPclVuZGVmaW5lZCwgZm9ybWF0QXNQeXRob25Nb2R1bGUgfSBmcm9tICcuLi91dGlsJztcblxuZXhwb3J0IGZ1bmN0aW9uIHRyeVByb2Nlc3NNYWNybyhtYWNybzogc3RyaW5nKSB7XG4gIGlmICghbWFjcm8uc3RhcnRzV2l0aCgnJCcpKSB7IHJldHVybiB1bmRlZmluZWQ7IH1cblxuICBjb25zdCBiYXNlZGlyID0gcGF0aC5iYXNlbmFtZShwcm9jZXNzLmN3ZCgpKTtcblxuICBzd2l0Y2ggKG1hY3JvKSB7XG4gICAgY2FzZSAnJEJBU0VESVInOiByZXR1cm4gYmFzZWRpcjtcbiAgICBjYXNlICckR0lUX1JFTU9URSc6XG4gICAgICBjb25zdCBvcmlnaW4gPSBleGVjT3JVbmRlZmluZWQoJ2dpdCByZW1vdGUgZ2V0LXVybCBvcmlnaW4nKTtcbiAgICAgIGlmIChvcmlnaW4pIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpbjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNsdWcgPSBnZXRGcm9tR2l0Q29uZmlnKCdnaXRodWIudXNlcicpID8/IHJlc29sdmVFbWFpbCgpLnNwbGl0KCdAJylbMF07XG4gICAgICByZXR1cm4gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3NsdWd9LyR7YmFzZWRpcn0uZ2l0YDtcblxuICAgIGNhc2UgJyRHSVRfVVNFUl9OQU1FJzogcmV0dXJuIGdldEZyb21HaXRDb25maWcoJ3VzZXIubmFtZScpID8/ICd1c2VyJztcbiAgICBjYXNlICckR0lUX1VTRVJfRU1BSUwnOiByZXR1cm4gcmVzb2x2ZUVtYWlsKCk7XG4gICAgY2FzZSAnJFBZVEhPTl9NT0RVTEVfTkFNRSc6IHJldHVybiBmb3JtYXRBc1B5dGhvbk1vZHVsZShiYXNlZGlyKTtcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHZhbHVlIGZyb20gZ2l0IGNvbmZpZy4gU2VhcmNoZXMgbG9jYWwgYW5kIHRoZW4gZ2xvYmFsIGdpdCBjb25maWcuXG4gKiBAcGFyYW0ga2V5IHRoZSBjb25maWcga2V5XG4gKi9cbmZ1bmN0aW9uIGdldEZyb21HaXRDb25maWcoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gZXhlY09yVW5kZWZpbmVkKGBnaXQgY29uZmlnIC0tZ2V0IC0taW5jbHVkZXMgJHtrZXl9YClcbiAgICA/PyBleGVjT3JVbmRlZmluZWQoYGdpdCBjb25maWcgLS1nZXQgLS1nbG9iYWwgLS1pbmNsdWRlcyAke2tleX1gKTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUVtYWlsKCk6IHN0cmluZyB7XG4gIHJldHVybiBnZXRGcm9tR2l0Q29uZmlnKCd1c2VyLmVtYWlsJykgPz8gJ3VzZXJAZG9tYWluLmNvbSc7XG59XG4iXX0=