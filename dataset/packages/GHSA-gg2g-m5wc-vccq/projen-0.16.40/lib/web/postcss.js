"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostCss = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const json_1 = require("../json");
const tailwind_1 = require("./tailwind");
/**
 * (experimental) Declares a PostCSS dependency with a default config file.
 *
 * @experimental
 */
class PostCss {
    /**
     * @experimental
     */
    constructor(project, options) {
        var _b, _c, _d;
        this.fileName = (_b = options === null || options === void 0 ? void 0 : options.fileName) !== null && _b !== void 0 ? _b : 'postcss.config.json';
        project.addDeps('postcss');
        const config = { plugins: {} };
        if ((_c = options === null || options === void 0 ? void 0 : options.tailwind) !== null && _c !== void 0 ? _c : true) {
            config.plugins.tailwindcss = {};
            config.plugins.autoprefixer = {};
            this.tailwind = new tailwind_1.TailwindConfig(project, options === null || options === void 0 ? void 0 : options.tailwindOptions);
            project.addDeps('tailwindcss', 'autoprefixer');
        }
        this.file = new json_1.JsonFile(project, this.fileName, { obj: config });
        (_d = project.npmignore) === null || _d === void 0 ? void 0 : _d.exclude(`/${this.fileName}`);
    }
}
exports.PostCss = PostCss;
_a = JSII_RTTI_SYMBOL_1;
PostCss[_a] = { fqn: "projen.web.PostCss", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdGNzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy93ZWIvcG9zdGNzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtDQUFtQztBQUVuQyx5Q0FBbUU7Ozs7OztBQXdCbkUsTUFBYSxPQUFPOzs7O0lBS2xCLFlBQVksT0FBb0IsRUFBRSxPQUF3Qjs7UUFDeEQsSUFBSSxDQUFDLFFBQVEsU0FBRyxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsUUFBUSxtQ0FBSSxxQkFBcUIsQ0FBQztRQUUzRCxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTNCLE1BQU0sTUFBTSxHQUEyQixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUV2RCxVQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxRQUFRLG1DQUFJLElBQUksRUFBRTtZQUM3QixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDaEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx5QkFBYyxDQUFDLE9BQU8sRUFBRSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsZUFBZSxDQUFDLENBQUM7WUFDdEUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7U0FDaEQ7UUFFRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksZUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFbEUsTUFBQSxPQUFPLENBQUMsU0FBUywwQ0FBRSxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7SUFDbEQsQ0FBQzs7QUF0QkgsMEJBdUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSnNvbkZpbGUgfSBmcm9tICcuLi9qc29uJztcbmltcG9ydCB7IE5vZGVQcm9qZWN0IH0gZnJvbSAnLi4vbm9kZS1wcm9qZWN0JztcbmltcG9ydCB7IFRhaWx3aW5kQ29uZmlnLCBUYWlsd2luZENvbmZpZ09wdGlvbnMgfSBmcm9tICcuL3RhaWx3aW5kJztcblxuZXhwb3J0IGludGVyZmFjZSBQb3N0Q3NzT3B0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBmaWxlTmFtZT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB0YWlsd2luZD86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHRhaWx3aW5kT3B0aW9ucz86IFRhaWx3aW5kQ29uZmlnT3B0aW9ucztcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBQb3N0Q3NzIHtcbiAgcHVibGljIHJlYWRvbmx5IGZpbGVOYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyByZWFkb25seSBmaWxlOiBKc29uRmlsZTtcbiAgcHVibGljIHJlYWRvbmx5IHRhaWx3aW5kPzogVGFpbHdpbmRDb25maWc7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogTm9kZVByb2plY3QsIG9wdGlvbnM/OiBQb3N0Q3NzT3B0aW9ucykge1xuICAgIHRoaXMuZmlsZU5hbWUgPSBvcHRpb25zPy5maWxlTmFtZSA/PyAncG9zdGNzcy5jb25maWcuanNvbic7XG5cbiAgICBwcm9qZWN0LmFkZERlcHMoJ3Bvc3Rjc3MnKTtcblxuICAgIGNvbnN0IGNvbmZpZzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHsgcGx1Z2luczoge30gfTtcblxuICAgIGlmIChvcHRpb25zPy50YWlsd2luZCA/PyB0cnVlKSB7XG4gICAgICBjb25maWcucGx1Z2lucy50YWlsd2luZGNzcyA9IHt9O1xuICAgICAgY29uZmlnLnBsdWdpbnMuYXV0b3ByZWZpeGVyID0ge307XG4gICAgICB0aGlzLnRhaWx3aW5kID0gbmV3IFRhaWx3aW5kQ29uZmlnKHByb2plY3QsIG9wdGlvbnM/LnRhaWx3aW5kT3B0aW9ucyk7XG4gICAgICBwcm9qZWN0LmFkZERlcHMoJ3RhaWx3aW5kY3NzJywgJ2F1dG9wcmVmaXhlcicpO1xuICAgIH1cblxuICAgIHRoaXMuZmlsZSA9IG5ldyBKc29uRmlsZShwcm9qZWN0LCB0aGlzLmZpbGVOYW1lLCB7IG9iajogY29uZmlnIH0pO1xuXG4gICAgcHJvamVjdC5ucG1pZ25vcmU/LmV4Y2x1ZGUoYC8ke3RoaXMuZmlsZU5hbWV9YCk7XG4gIH1cbn1cbiJdfQ==