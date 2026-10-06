"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MavenSample = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path_1 = require("path");
const component_1 = require("../component");
const sample_file_1 = require("../sample-file");
/**
 * (experimental) Java code sample.
 *
 * @experimental
 */
class MavenSample extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options) {
        super(project);
        const pkg = options.package.split('.');
        new sample_file_1.SampleDir(project, path_1.join('src', 'main', 'java', ...pkg), {
            files: {
                'Main.java': [
                    ...options.package ? [`package ${options.package};`] : [],
                    '',
                    'public class Main {',
                    '  public static void main(final String[] args) {',
                    '    System.out.println("Hello, world!");',
                    '  }',
                    '}',
                ].join('\n'),
            },
        });
    }
}
exports.MavenSample = MavenSample;
_a = JSII_RTTI_SYMBOL_1;
MavenSample[_a] = { fqn: "projen.java.MavenSample", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF2ZW4tc2FtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2phdmEvbWF2ZW4tc2FtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsK0JBQTRCO0FBQzVCLDRDQUF5QztBQUV6QyxnREFBMkM7Ozs7OztBQVkzQyxNQUFhLFdBQVksU0FBUSxxQkFBUzs7OztJQUN4QyxZQUFZLE9BQWdCLEVBQUUsT0FBMkI7UUFDdkQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsSUFBSSx1QkFBUyxDQUFDLE9BQU8sRUFBRSxXQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRTtZQUMxRCxLQUFLLEVBQUU7Z0JBQ0wsV0FBVyxFQUFFO29CQUNYLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUN6RCxFQUFFO29CQUNGLHFCQUFxQjtvQkFDckIsa0RBQWtEO29CQUNsRCwwQ0FBMEM7b0JBQzFDLEtBQUs7b0JBQ0wsR0FBRztpQkFDSixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDYjtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7O0FBbEJILGtDQW1CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi4vcHJvamVjdCc7XG5pbXBvcnQgeyBTYW1wbGVEaXIgfSBmcm9tICcuLi9zYW1wbGUtZmlsZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWF2ZW5TYW1wbGVPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcGFja2FnZTogc3RyaW5nO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgTWF2ZW5TYW1wbGUgZXh0ZW5kcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQcm9qZWN0LCBvcHRpb25zOiBNYXZlblNhbXBsZU9wdGlvbnMpIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIGNvbnN0IHBrZyA9IG9wdGlvbnMucGFja2FnZS5zcGxpdCgnLicpO1xuICAgIG5ldyBTYW1wbGVEaXIocHJvamVjdCwgam9pbignc3JjJywgJ21haW4nLCAnamF2YScsIC4uLnBrZyksIHtcbiAgICAgIGZpbGVzOiB7XG4gICAgICAgICdNYWluLmphdmEnOiBbXG4gICAgICAgICAgLi4ub3B0aW9ucy5wYWNrYWdlID8gW2BwYWNrYWdlICR7b3B0aW9ucy5wYWNrYWdlfTtgXSA6IFtdLFxuICAgICAgICAgICcnLFxuICAgICAgICAgICdwdWJsaWMgY2xhc3MgTWFpbiB7JyxcbiAgICAgICAgICAnICBwdWJsaWMgc3RhdGljIHZvaWQgbWFpbihmaW5hbCBTdHJpbmdbXSBhcmdzKSB7JyxcbiAgICAgICAgICAnICAgIFN5c3RlbS5vdXQucHJpbnRsbihcIkhlbGxvLCB3b3JsZCFcIik7JyxcbiAgICAgICAgICAnICB9JyxcbiAgICAgICAgICAnfScsXG4gICAgICAgIF0uam9pbignXFxuJyksXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59Il19