"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestTemplate = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const textfile_1 = require("../textfile");
/**
 * (experimental) Template for GitHub pull requests.
 *
 * @experimental
 */
class PullRequestTemplate extends textfile_1.TextFile {
    /**
     * @experimental
     */
    constructor(github, options = {}) {
        var _b;
        super(github.project, '.github/pull_request_template.md', {
            lines: (options.lines && ((_b = options.lines) === null || _b === void 0 ? void 0 : _b.length) > 0)
                ? options.lines
                : ['Fixes #'],
        });
    }
}
exports.PullRequestTemplate = PullRequestTemplate;
_a = JSII_RTTI_SYMBOL_1;
PullRequestTemplate[_a] = { fqn: "projen.github.PullRequestTemplate", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHItdGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2l0aHViL3ByLXRlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMENBQXVDOzs7Ozs7QUFrQnZDLE1BQWEsbUJBQW9CLFNBQVEsbUJBQVE7Ozs7SUFDL0MsWUFBWSxNQUFjLEVBQUUsVUFBc0MsRUFBRzs7UUFDbkUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsa0NBQWtDLEVBQUU7WUFDeEQsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFBLE9BQU8sQ0FBQyxLQUFLLDBDQUFFLE1BQU0sSUFBRyxDQUFDLENBQUM7Z0JBQ2pELENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSztnQkFDZixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7U0FDaEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7QUFQSCxrREFRQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRleHRGaWxlIH0gZnJvbSAnLi4vdGV4dGZpbGUnO1xuaW1wb3J0IHsgR2l0SHViIH0gZnJvbSAnLi9naXRodWInO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3RUZW1wbGF0ZU9wdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbGluZXM/OiBzdHJpbmdbXTtcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgUHVsbFJlcXVlc3RUZW1wbGF0ZSBleHRlbmRzIFRleHRGaWxlIHtcbiAgY29uc3RydWN0b3IoZ2l0aHViOiBHaXRIdWIsIG9wdGlvbnM6IFB1bGxSZXF1ZXN0VGVtcGxhdGVPcHRpb25zID0geyB9KSB7XG4gICAgc3VwZXIoZ2l0aHViLnByb2plY3QsICcuZ2l0aHViL3B1bGxfcmVxdWVzdF90ZW1wbGF0ZS5tZCcsIHtcbiAgICAgIGxpbmVzOiAob3B0aW9ucy5saW5lcyAmJiBvcHRpb25zLmxpbmVzPy5sZW5ndGggPiAwKVxuICAgICAgICA/IG9wdGlvbnMubGluZXNcbiAgICAgICAgOiBbJ0ZpeGVzICMnXSxcbiAgICB9KTtcbiAgfVxufSJdfQ==