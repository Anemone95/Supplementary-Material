"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TomlFile = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const TOML = require("@iarna/toml");
const object_file_1 = require("./object-file");
/**
 * (experimental) Represents a TOML file.
 *
 * @experimental
 */
class TomlFile extends object_file_1.ObjectFile {
    /**
     * @experimental
     */
    constructor(project, filePath, options) {
        super(project, filePath, options);
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
        return [
            ...(this.marker ? [`# ${TomlFile.PROJEN_MARKER}`] : []),
            '',
            TOML.stringify(JSON.parse(json)),
        ].join('\n');
    }
}
exports.TomlFile = TomlFile;
_a = JSII_RTTI_SYMBOL_1;
TomlFile[_a] = { fqn: "projen.TomlFile", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9tbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90b21sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0NBQW9DO0FBRXBDLCtDQUE4RDs7Ozs7O0FBVzlELE1BQWEsUUFBUyxTQUFRLHdCQUFVOzs7O0lBQ3RDLFlBQVksT0FBZ0IsRUFBRSxRQUFnQixFQUFFLE9BQXdCO1FBQ3RFLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Ozs7OztJQUVTLGlCQUFpQixDQUFDLFFBQW1CO1FBQzdDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsT0FBTyxTQUFTLENBQUM7U0FDbEI7UUFFRCxPQUFPO1lBQ0wsR0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3hELEVBQUU7WUFDRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDZixDQUFDOztBQWhCSCw0QkFpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBUT01MIGZyb20gJ0BpYXJuYS90b21sJztcbmltcG9ydCB7IElSZXNvbHZlciB9IGZyb20gJy4vZmlsZSc7XG5pbXBvcnQgeyBPYmplY3RGaWxlLCBPYmplY3RGaWxlT3B0aW9ucyB9IGZyb20gJy4vb2JqZWN0LWZpbGUnO1xuaW1wb3J0IHsgUHJvamVjdCB9IGZyb20gJy4vcHJvamVjdCc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBpbnRlcmZhY2UgVG9tbEZpbGVPcHRpb25zIGV4dGVuZHMgT2JqZWN0RmlsZU9wdGlvbnMge31cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFRvbWxGaWxlIGV4dGVuZHMgT2JqZWN0RmlsZSB7XG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFByb2plY3QsIGZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IFRvbWxGaWxlT3B0aW9ucykge1xuICAgIHN1cGVyKHByb2plY3QsIGZpbGVQYXRoLCBvcHRpb25zKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzeW50aGVzaXplQ29udGVudChyZXNvbHZlcjogSVJlc29sdmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBqc29uID0gc3VwZXIuc3ludGhlc2l6ZUNvbnRlbnQocmVzb2x2ZXIpO1xuICAgIGlmICghanNvbikge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAgLi4uICh0aGlzLm1hcmtlciA/IFtgIyAke1RvbWxGaWxlLlBST0pFTl9NQVJLRVJ9YF0gOiBbXSksXG4gICAgICAnJyxcbiAgICAgIFRPTUwuc3RyaW5naWZ5KEpTT04ucGFyc2UoanNvbikpLFxuICAgIF0uam9pbignXFxuJyk7XG4gIH1cbn1cbiJdfQ==