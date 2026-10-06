"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pytest = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const sample_file_1 = require("../sample-file");
const tasks_1 = require("../tasks");
/**
 * @experimental
 */
class Pytest extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options = {}) {
        var _b;
        super(project);
        const version = (_b = options.version) !== null && _b !== void 0 ? _b : '6.2.1';
        project.addDevDependency(`pytest@${version}`);
        this.testTask = project.addTask('test', {
            description: 'Runs tests',
            category: tasks_1.TaskCategory.TEST,
            exec: [
                'pytest',
                ...(options.maxFailures ? [`--maxfail=${options.maxFailures}`] : []),
            ].join(' '),
        });
        new sample_file_1.SampleDir(project, 'tests', {
            files: {
                '__init__.py': '',
                'test_example.py': [
                    'import pytest',
                    '',
                    `from ${project.moduleName}.example import hello`,
                    '',
                    '@pytest.mark.parametrize(',
                    '    ("name", "expected"),',
                    '    [',
                    '        ("A. Musing", "Hello A. Musing!"),',
                    '        ("traveler", "Hello traveler!"),',
                    '        ("projen developer", "Hello projen developer!"),',
                    '    ],',
                    ')',
                    'def test_hello(name, expected):',
                    '    """Example test with parametrization."""',
                    '    assert hello(name) == expected',
                    '',
                ].join('\n'),
            },
        });
    }
}
exports.Pytest = Pytest;
_a = JSII_RTTI_SYMBOL_1;
Pytest[_a] = { fqn: "projen.python.Pytest", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHl0ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3B5dGhvbi9weXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0Q0FBeUM7QUFDekMsZ0RBQTJDO0FBQzNDLG9DQUE4Qzs7OztBQXdCOUMsTUFBYSxNQUFPLFNBQVEscUJBQVM7Ozs7SUFHbkMsWUFBWSxPQUFzQixFQUFFLFVBQXlCLEVBQUU7O1FBQzdELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLE1BQU0sT0FBTyxTQUFHLE9BQU8sQ0FBQyxPQUFPLG1DQUFJLE9BQU8sQ0FBQztRQUUzQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTlDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDdEMsV0FBVyxFQUFFLFlBQVk7WUFDekIsUUFBUSxFQUFFLG9CQUFZLENBQUMsSUFBSTtZQUMzQixJQUFJLEVBQUU7Z0JBQ0osUUFBUTtnQkFDUixHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDckUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1NBQ1osQ0FBQyxDQUFDO1FBRUgsSUFBSSx1QkFBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7WUFDOUIsS0FBSyxFQUFFO2dCQUNMLGFBQWEsRUFBRSxFQUFFO2dCQUNqQixpQkFBaUIsRUFBRTtvQkFDakIsZUFBZTtvQkFDZixFQUFFO29CQUNGLFFBQVEsT0FBTyxDQUFDLFVBQVUsdUJBQXVCO29CQUNqRCxFQUFFO29CQUNGLDJCQUEyQjtvQkFDM0IsMkJBQTJCO29CQUMzQixPQUFPO29CQUNQLDRDQUE0QztvQkFDNUMsMENBQTBDO29CQUMxQywwREFBMEQ7b0JBQzFELFFBQVE7b0JBQ1IsR0FBRztvQkFDSCxpQ0FBaUM7b0JBQ2pDLDhDQUE4QztvQkFDOUMsb0NBQW9DO29CQUNwQyxFQUFFO2lCQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNiO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7QUExQ0gsd0JBMkNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmltcG9ydCB7IFNhbXBsZURpciB9IGZyb20gJy4uL3NhbXBsZS1maWxlJztcbmltcG9ydCB7IFRhc2ssIFRhc2tDYXRlZ29yeSB9IGZyb20gJy4uL3Rhc2tzJztcbmltcG9ydCB7IFB5dGhvblByb2plY3QgfSBmcm9tICcuL3B5dGhvbi1wcm9qZWN0JztcblxuZXhwb3J0IGludGVyZmFjZSBQeXRlc3RPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgdmVyc2lvbj86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB0ZXN0ZGlyPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBtYXhGYWlsdXJlcz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFB5dGVzdCBleHRlbmRzIENvbXBvbmVudCB7XG4gIHB1YmxpYyByZWFkb25seSB0ZXN0VGFzazogVGFzaztcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQeXRob25Qcm9qZWN0LCBvcHRpb25zOiBQeXRlc3RPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIGNvbnN0IHZlcnNpb24gPSBvcHRpb25zLnZlcnNpb24gPz8gJzYuMi4xJztcblxuICAgIHByb2plY3QuYWRkRGV2RGVwZW5kZW5jeShgcHl0ZXN0QCR7dmVyc2lvbn1gKTtcblxuICAgIHRoaXMudGVzdFRhc2sgPSBwcm9qZWN0LmFkZFRhc2soJ3Rlc3QnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1J1bnMgdGVzdHMnLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5URVNULFxuICAgICAgZXhlYzogW1xuICAgICAgICAncHl0ZXN0JyxcbiAgICAgICAgLi4uKG9wdGlvbnMubWF4RmFpbHVyZXMgPyBbYC0tbWF4ZmFpbD0ke29wdGlvbnMubWF4RmFpbHVyZXN9YF0gOiBbXSksXG4gICAgICBdLmpvaW4oJyAnKSxcbiAgICB9KTtcblxuICAgIG5ldyBTYW1wbGVEaXIocHJvamVjdCwgJ3Rlc3RzJywge1xuICAgICAgZmlsZXM6IHtcbiAgICAgICAgJ19faW5pdF9fLnB5JzogJycsXG4gICAgICAgICd0ZXN0X2V4YW1wbGUucHknOiBbXG4gICAgICAgICAgJ2ltcG9ydCBweXRlc3QnLFxuICAgICAgICAgICcnLFxuICAgICAgICAgIGBmcm9tICR7cHJvamVjdC5tb2R1bGVOYW1lfS5leGFtcGxlIGltcG9ydCBoZWxsb2AsXG4gICAgICAgICAgJycsXG4gICAgICAgICAgJ0BweXRlc3QubWFyay5wYXJhbWV0cml6ZSgnLFxuICAgICAgICAgICcgICAgKFwibmFtZVwiLCBcImV4cGVjdGVkXCIpLCcsXG4gICAgICAgICAgJyAgICBbJyxcbiAgICAgICAgICAnICAgICAgICAoXCJBLiBNdXNpbmdcIiwgXCJIZWxsbyBBLiBNdXNpbmchXCIpLCcsXG4gICAgICAgICAgJyAgICAgICAgKFwidHJhdmVsZXJcIiwgXCJIZWxsbyB0cmF2ZWxlciFcIiksJyxcbiAgICAgICAgICAnICAgICAgICAoXCJwcm9qZW4gZGV2ZWxvcGVyXCIsIFwiSGVsbG8gcHJvamVuIGRldmVsb3BlciFcIiksJyxcbiAgICAgICAgICAnICAgIF0sJyxcbiAgICAgICAgICAnKScsXG4gICAgICAgICAgJ2RlZiB0ZXN0X2hlbGxvKG5hbWUsIGV4cGVjdGVkKTonLFxuICAgICAgICAgICcgICAgXCJcIlwiRXhhbXBsZSB0ZXN0IHdpdGggcGFyYW1ldHJpemF0aW9uLlwiXCJcIicsXG4gICAgICAgICAgJyAgICBhc3NlcnQgaGVsbG8obmFtZSkgPT0gZXhwZWN0ZWQnLFxuICAgICAgICAgICcnLFxuICAgICAgICBdLmpvaW4oJ1xcbicpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuIl19