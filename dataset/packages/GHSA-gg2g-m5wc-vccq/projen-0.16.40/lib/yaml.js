"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YamlFile = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const YAML = require("yaml");
const object_file_1 = require("./object-file");
/**
 * (experimental) Represents a YAML file.
 *
 * @experimental
 */
class YamlFile extends object_file_1.ObjectFile {
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
            ...(this.marker ? [`# ${YamlFile.PROJEN_MARKER}`] : []),
            '',
            YAML.stringify(JSON.parse(json), { indent: 2 }),
        ].join('\n');
    }
}
exports.YamlFile = YamlFile;
_a = JSII_RTTI_SYMBOL_1;
YamlFile[_a] = { fqn: "projen.YamlFile", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFtbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy95YW1sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkJBQTZCO0FBRTdCLCtDQUE4RDs7Ozs7O0FBVzlELE1BQWEsUUFBUyxTQUFRLHdCQUFVOzs7O0lBQ3RDLFlBQVksT0FBZ0IsRUFBRSxRQUFnQixFQUFFLE9BQXdCO1FBQ3RFLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Ozs7OztJQUVTLGlCQUFpQixDQUFDLFFBQW1CO1FBQzdDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsT0FBTyxTQUFTLENBQUM7U0FDbEI7UUFFRCxPQUFPO1lBQ0wsR0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3hELEVBQUU7WUFDRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7U0FDaEQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDZixDQUFDOztBQWhCSCw0QkFpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBZQU1MIGZyb20gJ3lhbWwnO1xuaW1wb3J0IHsgSVJlc29sdmVyIH0gZnJvbSAnLi9maWxlJztcbmltcG9ydCB7IE9iamVjdEZpbGUsIE9iamVjdEZpbGVPcHRpb25zIH0gZnJvbSAnLi9vYmplY3QtZmlsZSc7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0JztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBZYW1sRmlsZU9wdGlvbnMgZXh0ZW5kcyBPYmplY3RGaWxlT3B0aW9ucyB7fVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgWWFtbEZpbGUgZXh0ZW5kcyBPYmplY3RGaWxlIHtcbiAgY29uc3RydWN0b3IocHJvamVjdDogUHJvamVjdCwgZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczogWWFtbEZpbGVPcHRpb25zKSB7XG4gICAgc3VwZXIocHJvamVjdCwgZmlsZVBhdGgsIG9wdGlvbnMpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN5bnRoZXNpemVDb250ZW50KHJlc29sdmVyOiBJUmVzb2x2ZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGpzb24gPSBzdXBlci5zeW50aGVzaXplQ29udGVudChyZXNvbHZlcik7XG4gICAgaWYgKCFqc29uKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICAuLi4gKHRoaXMubWFya2VyID8gW2AjICR7WWFtbEZpbGUuUFJPSkVOX01BUktFUn1gXSA6IFtdKSxcbiAgICAgICcnLFxuICAgICAgWUFNTC5zdHJpbmdpZnkoSlNPTi5wYXJzZShqc29uKSwgeyBpbmRlbnQ6IDIgfSksXG4gICAgXS5qb2luKCdcXG4nKTtcbiAgfVxufSJdfQ==