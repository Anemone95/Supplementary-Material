"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonSample = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const sample_file_1 = require("../sample-file");
/**
 * (experimental) Python code sample.
 *
 * @experimental
 */
class PythonSample extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, _options) {
        super(project);
        new sample_file_1.SampleDir(project, project.moduleName, {
            files: {
                '__init__.py': '__version__ = "0.1.0"\n',
                '__main__.py': [
                    'from .example import hello',
                    '',
                    'if __name__ == "__main__":',
                    '    name = input("What is your name? ")',
                    '    print(hello(name))',
                    '',
                ].join('\n'),
                'example.py': [
                    'def hello(name: str) -> str:',
                    '    """A simple greeting.',
                    '    Args:',
                    '        name (str): Name to greet.',
                    '    Returns:',
                    '        str: greeting message',
                    '    """',
                    '    return f"Hello {name}!"',
                    '',
                ].join('\n'),
            },
        });
    }
}
exports.PythonSample = PythonSample;
_a = JSII_RTTI_SYMBOL_1;
PythonSample[_a] = { fqn: "projen.python.PythonSample", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHl0aG9uLXNhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9weXRob24vcHl0aG9uLXNhbXBsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDRDQUF5QztBQUN6QyxnREFBMkM7Ozs7OztBQVczQyxNQUFhLFlBQWEsU0FBUSxxQkFBUzs7OztJQUN6QyxZQUFZLE9BQXNCLEVBQUUsUUFBNkI7UUFDL0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsSUFBSSx1QkFBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFO1lBQ3pDLEtBQUssRUFBRTtnQkFDTCxhQUFhLEVBQUUseUJBQXlCO2dCQUN4QyxhQUFhLEVBQUU7b0JBQ2IsNEJBQTRCO29CQUM1QixFQUFFO29CQUNGLDRCQUE0QjtvQkFDNUIseUNBQXlDO29CQUN6Qyx3QkFBd0I7b0JBQ3hCLEVBQUU7aUJBQ0gsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNaLFlBQVksRUFBRTtvQkFDWiw4QkFBOEI7b0JBQzlCLDJCQUEyQjtvQkFDM0IsV0FBVztvQkFDWCxvQ0FBb0M7b0JBQ3BDLGNBQWM7b0JBQ2QsK0JBQStCO29CQUMvQixTQUFTO29CQUNULDZCQUE2QjtvQkFDN0IsRUFBRTtpQkFDSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDYjtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7O0FBNUJILG9DQTZCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBTYW1wbGVEaXIgfSBmcm9tICcuLi9zYW1wbGUtZmlsZSc7XG5pbXBvcnQgeyBQeXRob25Qcm9qZWN0IH0gZnJvbSAnLi9weXRob24tcHJvamVjdCc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBQeXRob25TYW1wbGVPcHRpb25zIHt9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFB5dGhvblNhbXBsZSBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFB5dGhvblByb2plY3QsIF9vcHRpb25zOiBQeXRob25TYW1wbGVPcHRpb25zKSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICBuZXcgU2FtcGxlRGlyKHByb2plY3QsIHByb2plY3QubW9kdWxlTmFtZSwge1xuICAgICAgZmlsZXM6IHtcbiAgICAgICAgJ19faW5pdF9fLnB5JzogJ19fdmVyc2lvbl9fID0gXCIwLjEuMFwiXFxuJyxcbiAgICAgICAgJ19fbWFpbl9fLnB5JzogW1xuICAgICAgICAgICdmcm9tIC5leGFtcGxlIGltcG9ydCBoZWxsbycsXG4gICAgICAgICAgJycsXG4gICAgICAgICAgJ2lmIF9fbmFtZV9fID09IFwiX19tYWluX19cIjonLFxuICAgICAgICAgICcgICAgbmFtZSA9IGlucHV0KFwiV2hhdCBpcyB5b3VyIG5hbWU/IFwiKScsXG4gICAgICAgICAgJyAgICBwcmludChoZWxsbyhuYW1lKSknLFxuICAgICAgICAgICcnLFxuICAgICAgICBdLmpvaW4oJ1xcbicpLFxuICAgICAgICAnZXhhbXBsZS5weSc6IFtcbiAgICAgICAgICAnZGVmIGhlbGxvKG5hbWU6IHN0cikgLT4gc3RyOicsXG4gICAgICAgICAgJyAgICBcIlwiXCJBIHNpbXBsZSBncmVldGluZy4nLFxuICAgICAgICAgICcgICAgQXJnczonLFxuICAgICAgICAgICcgICAgICAgIG5hbWUgKHN0cik6IE5hbWUgdG8gZ3JlZXQuJyxcbiAgICAgICAgICAnICAgIFJldHVybnM6JyxcbiAgICAgICAgICAnICAgICAgICBzdHI6IGdyZWV0aW5nIG1lc3NhZ2UnLFxuICAgICAgICAgICcgICAgXCJcIlwiJyxcbiAgICAgICAgICAnICAgIHJldHVybiBmXCJIZWxsbyB7bmFtZX0hXCInLFxuICAgICAgICAgICcnLFxuICAgICAgICBdLmpvaW4oJ1xcbicpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuIl19