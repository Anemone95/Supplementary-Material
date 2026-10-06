"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IgnoreFile = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const file_1 = require("./file");
/**
 * @experimental
 */
class IgnoreFile extends file_1.FileBase {
    /**
     * @experimental
     */
    constructor(project, filePath) {
        super(project, filePath, { editGitignore: filePath !== '.gitignore' });
        this._excludes = new Set();
        this._includes = new Set();
    }
    /**
     * (experimental) Add ignore patterns.
     *
     * Files that match this pattern will be ignored. If the
     * pattern starts with a negation mark `!`, files that match will _not_ be
     * ignored.
     *
     * Comment lines (start with `#`) are ignored.
     *
     * @param patterns Ignore patterns.
     * @experimental
     */
    addPatterns(...patterns) {
        for (const pattern of patterns) {
            // skip comments
            if (pattern.startsWith('#')) {
                continue;
            }
            if (pattern.startsWith('!')) {
                this._includes.add(pattern);
            }
            else {
                this._excludes.add(pattern);
            }
        }
    }
    /**
     * (experimental) Removes patterns previously added from the ignore file.
     *
     * If `addPattern()` is called after this, the pattern will be added again.
     *
     * @param patterns patters to remove.
     * @experimental
     */
    removePatterns(...patterns) {
        for (const p of patterns) {
            this._excludes.delete(p);
            this._includes.delete(p);
        }
    }
    /**
     * (experimental) Ignore the files that match these patterns.
     *
     * @param patterns The patterns to match.
     * @experimental
     */
    exclude(...patterns) {
        return this.addPatterns(...patterns);
    }
    /**
     * (experimental) Always include the specified file patterns.
     *
     * @param patterns Patterns to include in git commits.
     * @experimental
     */
    include(...patterns) {
        for (let pattern of patterns) {
            if (!pattern.startsWith('!')) {
                pattern = '!' + pattern;
            }
            this.addPatterns(pattern);
        }
    }
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    synthesizeContent(resolver) {
        const lines = [`# ${file_1.FileBase.PROJEN_MARKER}`];
        for (const line of Array.from(this._excludes).sort()) {
            // if this line exists in the inclusion list, then skip it
            if (this._includes.has(`!${line}`)) {
                continue;
            }
            lines.push(line);
        }
        for (const line of Array.from(this._includes).sort()) {
            lines.push(line);
        }
        return `${resolver.resolve(lines).join('\n')}\n`;
    }
}
exports.IgnoreFile = IgnoreFile;
_a = JSII_RTTI_SYMBOL_1;
IgnoreFile[_a] = { fqn: "projen.IgnoreFile", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWdub3JlLWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaWdub3JlLWZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpQ0FBNkM7Ozs7QUFJN0MsTUFBYSxVQUFXLFNBQVEsZUFBUTs7OztJQUl0QyxZQUFZLE9BQWdCLEVBQUUsUUFBZ0I7UUFDNUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxhQUFhLEVBQUUsUUFBUSxLQUFLLFlBQVksRUFBRSxDQUFDLENBQUM7UUFKeEQsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDOUIsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7SUFJL0MsQ0FBQzs7Ozs7Ozs7Ozs7OztJQVdNLFdBQVcsQ0FBQyxHQUFHLFFBQWtCO1FBQ3RDLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO1lBQzlCLGdCQUFnQjtZQUNoQixJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzNCLFNBQVM7YUFDVjtZQUVELElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0I7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0I7U0FDRjtJQUNILENBQUM7Ozs7Ozs7OztJQVNNLGNBQWMsQ0FBQyxHQUFHLFFBQWtCO1FBQ3pDLEtBQUssTUFBTSxDQUFDLElBQUksUUFBUSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzFCO0lBQ0gsQ0FBQzs7Ozs7OztJQU1NLE9BQU8sQ0FBQyxHQUFHLFFBQWtCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7Ozs7Ozs7SUFNTSxPQUFPLENBQUMsR0FBRyxRQUFrQjtRQUNsQyxLQUFLLElBQUksT0FBTyxJQUFJLFFBQVEsRUFBRTtZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsT0FBTyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUM7YUFDekI7WUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzNCO0lBQ0gsQ0FBQzs7Ozs7O0lBRVMsaUJBQWlCLENBQUMsUUFBbUI7UUFDN0MsTUFBTSxLQUFLLEdBQUcsQ0FBQyxLQUFLLGVBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBRTlDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDcEQsMERBQTBEO1lBQzFELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxFQUFFO2dCQUNsQyxTQUFTO2FBQ1Y7WUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2xCO1FBRUQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNwRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkQsQ0FBQzs7QUFyRkgsZ0NBc0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmlsZUJhc2UsIElSZXNvbHZlciB9IGZyb20gJy4vZmlsZSc7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0JztcblxuXG5leHBvcnQgY2xhc3MgSWdub3JlRmlsZSBleHRlbmRzIEZpbGVCYXNlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBfZXhjbHVkZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfaW5jbHVkZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQcm9qZWN0LCBmaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgc3VwZXIocHJvamVjdCwgZmlsZVBhdGgsIHsgZWRpdEdpdGlnbm9yZTogZmlsZVBhdGggIT09ICcuZ2l0aWdub3JlJyB9KTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZFBhdHRlcm5zKC4uLnBhdHRlcm5zOiBzdHJpbmdbXSkge1xuICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgICAgLy8gc2tpcCBjb21tZW50c1xuICAgICAgaWYgKHBhdHRlcm4uc3RhcnRzV2l0aCgnIycpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGF0dGVybi5zdGFydHNXaXRoKCchJykpIHtcbiAgICAgICAgdGhpcy5faW5jbHVkZXMuYWRkKHBhdHRlcm4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZXhjbHVkZXMuYWRkKHBhdHRlcm4pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVtb3ZlUGF0dGVybnMoLi4ucGF0dGVybnM6IHN0cmluZ1tdKSB7XG4gICAgZm9yIChjb25zdCBwIG9mIHBhdHRlcm5zKSB7XG4gICAgICB0aGlzLl9leGNsdWRlcy5kZWxldGUocCk7XG4gICAgICB0aGlzLl9pbmNsdWRlcy5kZWxldGUocCk7XG4gICAgfVxuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBleGNsdWRlKC4uLnBhdHRlcm5zOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmFkZFBhdHRlcm5zKC4uLnBhdHRlcm5zKTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGluY2x1ZGUoLi4ucGF0dGVybnM6IHN0cmluZ1tdKSB7XG4gICAgZm9yIChsZXQgcGF0dGVybiBvZiBwYXR0ZXJucykge1xuICAgICAgaWYgKCFwYXR0ZXJuLnN0YXJ0c1dpdGgoJyEnKSkge1xuICAgICAgICBwYXR0ZXJuID0gJyEnICsgcGF0dGVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hZGRQYXR0ZXJucyhwYXR0ZXJuKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgc3ludGhlc2l6ZUNvbnRlbnQocmVzb2x2ZXI6IElSZXNvbHZlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgbGluZXMgPSBbYCMgJHtGaWxlQmFzZS5QUk9KRU5fTUFSS0VSfWBdO1xuXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIEFycmF5LmZyb20odGhpcy5fZXhjbHVkZXMpLnNvcnQoKSkge1xuICAgICAgLy8gaWYgdGhpcyBsaW5lIGV4aXN0cyBpbiB0aGUgaW5jbHVzaW9uIGxpc3QsIHRoZW4gc2tpcCBpdFxuICAgICAgaWYgKHRoaXMuX2luY2x1ZGVzLmhhcyhgISR7bGluZX1gKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGluZXMucHVzaChsaW5lKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgQXJyYXkuZnJvbSh0aGlzLl9pbmNsdWRlcykuc29ydCgpKSB7XG4gICAgICBsaW5lcy5wdXNoKGxpbmUpO1xuICAgIH1cblxuICAgIHJldHVybiBgJHtyZXNvbHZlci5yZXNvbHZlKGxpbmVzKS5qb2luKCdcXG4nKX1cXG5gO1xuICB9XG59XG4iXX0=