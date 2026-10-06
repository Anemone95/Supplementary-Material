"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructLibraryCdk8s = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const construct_lib_1 = require("./construct-lib");
/**
 * (experimental) CDK8s construct library project.
 *
 * A multi-language (jsii) construct library which vends constructs designed to
 * use within the CDK for Kubernetes (CDK8s), with a friendly workflow and
 * automatic publishing to the construct catalog.
 *
 * @experimental
 * @pjid cdk8s-construct
 */
class ConstructLibraryCdk8s extends construct_lib_1.ConstructLibrary {
    /**
     * @experimental
     */
    constructor(options) {
        super(options);
        const ver = options.cdk8sVersion;
        this.addPeerDeps('constructs@^3.2.34', `cdk8s@^${ver}`, `cdk8s-plus-17@^${ver}`);
    }
}
exports.ConstructLibraryCdk8s = ConstructLibraryCdk8s;
_a = JSII_RTTI_SYMBOL_1;
ConstructLibraryCdk8s[_a] = { fqn: "projen.ConstructLibraryCdk8s", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrOHMtY29uc3RydWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NkazhzLWNvbnN0cnVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG1EQUE0RTs7Ozs7Ozs7Ozs7QUFvQjVFLE1BQWEscUJBQXNCLFNBQVEsZ0NBQWdCOzs7O0lBQ3pELFlBQVksT0FBcUM7UUFDL0MsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztRQUVqQyxJQUFJLENBQUMsV0FBVyxDQUNkLG9CQUFvQixFQUNwQixVQUFVLEdBQUcsRUFBRSxFQUNmLGtCQUFrQixHQUFHLEVBQUUsQ0FDeEIsQ0FBQztJQUNKLENBQUM7O0FBWEgsc0RBWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3RMaWJyYXJ5LCBDb25zdHJ1Y3RMaWJyYXJ5T3B0aW9ucyB9IGZyb20gJy4vY29uc3RydWN0LWxpYic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uc3RydWN0TGlicmFyeUNkazhzT3B0aW9ucyBleHRlbmRzIENvbnN0cnVjdExpYnJhcnlPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBjZGs4c1ZlcnNpb246IHN0cmluZztcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBDb25zdHJ1Y3RMaWJyYXJ5Q2RrOHMgZXh0ZW5kcyBDb25zdHJ1Y3RMaWJyYXJ5IHtcbiAgY29uc3RydWN0b3Iob3B0aW9uczogQ29uc3RydWN0TGlicmFyeUNkazhzT3B0aW9ucykge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuXG4gICAgY29uc3QgdmVyID0gb3B0aW9ucy5jZGs4c1ZlcnNpb247XG5cbiAgICB0aGlzLmFkZFBlZXJEZXBzKFxuICAgICAgJ2NvbnN0cnVjdHNAXjMuMi4zNCcsXG4gICAgICBgY2RrOHNAXiR7dmVyfWAsXG4gICAgICBgY2RrOHMtcGx1cy0xN0BeJHt2ZXJ9YCxcbiAgICApO1xuICB9XG59Il19