"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonFile = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const object_file_1 = require("./object-file");
/**
 * (experimental) Represents a JSON file.
 *
 * @experimental
 */
class JsonFile extends object_file_1.ObjectFile {
    /**
     * @experimental
     */
    constructor(project, filePath, options) {
        super(project, filePath, options);
        if (!options.obj) {
            throw new Error('"obj" cannot be undefined');
        }
    }
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    synthesizeContent(resolver) {
        const json = super.synthesizeContent(resolver);
        if (!json) {
            return undefined;
        }
        const sanitized = JSON.parse(json);
        if (this.marker) {
            sanitized['//'] = JsonFile.PROJEN_MARKER;
        }
        return `${JSON.stringify(sanitized, undefined, 2)}\n`;
    }
}
exports.JsonFile = JsonFile;
_a = JSII_RTTI_SYMBOL_1;
JsonFile[_a] = { fqn: "projen.JsonFile", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9qc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsK0NBQThEOzs7Ozs7QUFXOUQsTUFBYSxRQUFTLFNBQVEsd0JBQVU7Ozs7SUFDdEMsWUFBWSxPQUFnQixFQUFFLFFBQWdCLEVBQUUsT0FBd0I7UUFDdEUsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1NBQzlDO0lBQ0gsQ0FBQzs7Ozs7O0lBRVMsaUJBQWlCLENBQUMsUUFBbUI7UUFDN0MsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUM7U0FDMUM7UUFFRCxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDeEQsQ0FBQzs7QUF0QkgsNEJBdUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVJlc29sdmVyIH0gZnJvbSAnLi9maWxlJztcbmltcG9ydCB7IE9iamVjdEZpbGUsIE9iamVjdEZpbGVPcHRpb25zIH0gZnJvbSAnLi9vYmplY3QtZmlsZSc7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0JztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBKc29uRmlsZU9wdGlvbnMgZXh0ZW5kcyBPYmplY3RGaWxlT3B0aW9ucyB7fVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgSnNvbkZpbGUgZXh0ZW5kcyBPYmplY3RGaWxlIHtcbiAgY29uc3RydWN0b3IocHJvamVjdDogUHJvamVjdCwgZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczogSnNvbkZpbGVPcHRpb25zKSB7XG4gICAgc3VwZXIocHJvamVjdCwgZmlsZVBhdGgsIG9wdGlvbnMpO1xuXG4gICAgaWYgKCFvcHRpb25zLm9iaikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdcIm9ialwiIGNhbm5vdCBiZSB1bmRlZmluZWQnKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgc3ludGhlc2l6ZUNvbnRlbnQocmVzb2x2ZXI6IElSZXNvbHZlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QganNvbiA9IHN1cGVyLnN5bnRoZXNpemVDb250ZW50KHJlc29sdmVyKTtcbiAgICBpZiAoIWpzb24pIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3Qgc2FuaXRpemVkID0gSlNPTi5wYXJzZShqc29uKTtcblxuICAgIGlmICh0aGlzLm1hcmtlcikge1xuICAgICAgc2FuaXRpemVkWycvLyddID0gSnNvbkZpbGUuUFJPSkVOX01BUktFUjtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7SlNPTi5zdHJpbmdpZnkoc2FuaXRpemVkLCB1bmRlZmluZWQsIDIpfVxcbmA7XG4gIH1cbn1cbiJdfQ==