"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TailwindConfig = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const json_1 = require("../json");
/**
 * (experimental) Declares a Tailwind CSS configuration file.
 *
 * There are multiple ways to add Tailwind CSS in your node project - see:
 * https://tailwindcss.com/docs/installation
 *
 * @see PostCss
 * @experimental
 */
class TailwindConfig {
    /**
     * @experimental
     */
    constructor(project, options) {
        var _b, _c;
        this.fileName = (_b = options === null || options === void 0 ? void 0 : options.fileName) !== null && _b !== void 0 ? _b : 'tailwind.config.json';
        this.file = new json_1.JsonFile(project, this.fileName, {
            obj: {
                purge: [],
                darkMode: false,
                theme: {
                    extend: {},
                },
                variants: {
                    extend: {},
                },
                plugins: [],
            },
        });
        (_c = project.npmignore) === null || _c === void 0 ? void 0 : _c.exclude(`/${this.fileName}`);
    }
}
exports.TailwindConfig = TailwindConfig;
_a = JSII_RTTI_SYMBOL_1;
TailwindConfig[_a] = { fqn: "projen.web.TailwindConfig", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFpbHdpbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvd2ViL3RhaWx3aW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0NBQW1DOzs7Ozs7Ozs7O0FBa0JuQyxNQUFhLGNBQWM7Ozs7SUFJekIsWUFBWSxPQUFvQixFQUFFLE9BQStCOztRQUMvRCxJQUFJLENBQUMsUUFBUSxTQUFHLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxRQUFRLG1DQUFJLHNCQUFzQixDQUFDO1FBRTVELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxlQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDL0MsR0FBRyxFQUFFO2dCQUNILEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLO2dCQUNmLEtBQUssRUFBRTtvQkFDTCxNQUFNLEVBQUUsRUFBRTtpQkFDWDtnQkFDRCxRQUFRLEVBQUU7b0JBQ1IsTUFBTSxFQUFFLEVBQUU7aUJBQ1g7Z0JBQ0QsT0FBTyxFQUFFLEVBQUU7YUFDWjtTQUNGLENBQUMsQ0FBQztRQUVILE1BQUEsT0FBTyxDQUFDLFNBQVMsMENBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO0lBQ2xELENBQUM7O0FBdEJILHdDQXVCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEpzb25GaWxlIH0gZnJvbSAnLi4vanNvbic7XG5pbXBvcnQgeyBOb2RlUHJvamVjdCB9IGZyb20gJy4uL25vZGUtcHJvamVjdCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFpbHdpbmRDb25maWdPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBmaWxlTmFtZT86IHN0cmluZztcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFRhaWx3aW5kQ29uZmlnIHtcbiAgcHVibGljIHJlYWRvbmx5IGZpbGVOYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyByZWFkb25seSBmaWxlOiBKc29uRmlsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBOb2RlUHJvamVjdCwgb3B0aW9ucz86IFRhaWx3aW5kQ29uZmlnT3B0aW9ucykge1xuICAgIHRoaXMuZmlsZU5hbWUgPSBvcHRpb25zPy5maWxlTmFtZSA/PyAndGFpbHdpbmQuY29uZmlnLmpzb24nO1xuXG4gICAgdGhpcy5maWxlID0gbmV3IEpzb25GaWxlKHByb2plY3QsIHRoaXMuZmlsZU5hbWUsIHtcbiAgICAgIG9iajoge1xuICAgICAgICBwdXJnZTogW10sXG4gICAgICAgIGRhcmtNb2RlOiBmYWxzZSxcbiAgICAgICAgdGhlbWU6IHtcbiAgICAgICAgICBleHRlbmQ6IHt9LFxuICAgICAgICB9LFxuICAgICAgICB2YXJpYW50czoge1xuICAgICAgICAgIGV4dGVuZDoge30sXG4gICAgICAgIH0sXG4gICAgICAgIHBsdWdpbnM6IFtdLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHByb2plY3QubnBtaWdub3JlPy5leGNsdWRlKGAvJHt0aGlzLmZpbGVOYW1lfWApO1xuICB9XG59XG4iXX0=