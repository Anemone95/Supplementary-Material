"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsCode = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const launch_config_1 = require("./launch-config");
/**
 * @experimental
 */
class VsCode extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project) {
        super(project);
    }
    /**
     * @experimental
     */
    get launchConfiguration() {
        if (!this._launchConfig) {
            this._launchConfig = new launch_config_1.VsCodeLaunchConfig(this);
        }
        return this._launchConfig;
    }
}
exports.VsCode = VsCode;
_a = JSII_RTTI_SYMBOL_1;
VsCode[_a] = { fqn: "projen.vscode.VsCode", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnNjb2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZzY29kZS92c2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0Q0FBeUM7QUFFekMsbURBQXFEOzs7O0FBRXJELE1BQWEsTUFBTyxTQUFRLHFCQUFTOzs7O0lBR25DLFlBQVksT0FBZ0I7UUFDMUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pCLENBQUM7Ozs7SUFFRCxJQUFXLG1CQUFtQjtRQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksa0NBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkQ7UUFFRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQzs7QUFiSCx3QkFjQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi4vcHJvamVjdCc7XG5pbXBvcnQgeyBWc0NvZGVMYXVuY2hDb25maWcgfSBmcm9tICcuL2xhdW5jaC1jb25maWcnO1xuXG5leHBvcnQgY2xhc3MgVnNDb2RlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfbGF1bmNoQ29uZmlnPzogVnNDb2RlTGF1bmNoQ29uZmlnO1xuXG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFByb2plY3QpIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGF1bmNoQ29uZmlndXJhdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX2xhdW5jaENvbmZpZykge1xuICAgICAgdGhpcy5fbGF1bmNoQ29uZmlnID0gbmV3IFZzQ29kZUxhdW5jaENvbmZpZyh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbGF1bmNoQ29uZmlnO1xuICB9XG59XG4iXX0=