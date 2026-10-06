"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Semver = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const semver = require("semver");
/**
 * @deprecated This class will be removed in upcoming releases. if you wish to
 * specify semver requirements in `deps`, `devDeps`, etc, specify them like so
 * `express@^2.1`.
 */
class Semver {
    constructor(spec) {
        this.spec = spec;
    }
    /**
     * @deprecated
     */
    static of(spec) { return new Semver(spec); }
    /**
     * (deprecated) Latest version.
     *
     * @deprecated
     */
    static latest() { return new Semver('*'); }
    /**
     * (deprecated) Accept only an exact version.
     *
     * @deprecated
     */
    static pinned(version) { return new Semver(version); }
    /**
     * (deprecated) Accept any minor version.
     *
     * >= version
     * < next major version
     *
     * @deprecated
     */
    static caret(version) { return new Semver(`^${version}`); }
    /**
     * (deprecated) Accept patches.
     *
     * >= version
     * < next minor version
     *
     * @deprecated
     */
    static tilde(version) { return new Semver(`~${version}`); }
    /**
     * @deprecated
     */
    get version() {
        var _b;
        return (_b = semver.minVersion(this.spec)) === null || _b === void 0 ? void 0 : _b.version;
    }
}
exports.Semver = Semver;
_a = JSII_RTTI_SYMBOL_1;
Semver[_a] = { fqn: "projen.Semver", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlbXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGlDQUFpQzs7Ozs7O0FBT2pDLE1BQWEsTUFBTTtJQWdDakIsWUFBb0MsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7SUFFaEQsQ0FBQzs7OztJQWhDTSxNQUFNLENBQUMsRUFBRSxDQUFDLElBQVksSUFBSSxPQUFPLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7O0lBS3BELE1BQU0sQ0FBQyxNQUFNLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7OztJQUszQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQWUsSUFBSSxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7O0lBUTlELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBZSxJQUFJLE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7O0lBUW5FLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBZSxJQUFJLE9BQU8sSUFBSSxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztJQVExRSxJQUFXLE9BQU87O1FBQ2hCLGFBQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBDQUFFLE9BQU8sQ0FBQztJQUMvQyxDQUFDOztBQXRDSCx3QkF1Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFNlbXZlciB7XG5cbiAgcHVibGljIHN0YXRpYyBvZihzcGVjOiBzdHJpbmcpIHsgcmV0dXJuIG5ldyBTZW12ZXIoc3BlYyk7IH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHN0YXRpYyBsYXRlc3QoKSB7IHJldHVybiBuZXcgU2VtdmVyKCcqJyk7IH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBzdGF0aWMgcGlubmVkKHZlcnNpb246IHN0cmluZykgeyByZXR1cm4gbmV3IFNlbXZlcih2ZXJzaW9uKTsgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgc3RhdGljIGNhcmV0KHZlcnNpb246IHN0cmluZykgeyByZXR1cm4gbmV3IFNlbXZlcihgXiR7dmVyc2lvbn1gKTsgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBzdGF0aWMgdGlsZGUodmVyc2lvbjogc3RyaW5nKSB7IHJldHVybiBuZXcgU2VtdmVyKGB+JHt2ZXJzaW9ufWApOyB9XG5cbiAgcHVibGljIHJlYWRvbmx5IG1vZGU/OiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgc3BlYzogc3RyaW5nKSB7XG5cbiAgfVxuXG4gIHB1YmxpYyBnZXQgdmVyc2lvbigpIHtcbiAgICByZXR1cm4gc2VtdmVyLm1pblZlcnNpb24odGhpcy5zcGVjKT8udmVyc2lvbjtcbiAgfVxufVxuIl19