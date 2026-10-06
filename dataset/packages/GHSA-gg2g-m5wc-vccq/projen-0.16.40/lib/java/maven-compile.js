"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MavenCompile = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const tasks_1 = require("../tasks");
/**
 * (experimental) Adds the maven-compiler plugin to a POM file and the `compile` task.
 *
 * @experimental
 */
class MavenCompile extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, pom, options = {}) {
        var _b, _c;
        super(project);
        project.gitignore.exclude('target');
        pom.addPlugin('org.apache.maven.plugins/maven-compiler-plugin@3.8.1', {
            configuration: {
                source: (_b = options.source) !== null && _b !== void 0 ? _b : '1.8',
                target: (_c = options.target) !== null && _c !== void 0 ? _c : '1.8',
            },
        });
        this.compileTask = project.addTask('compile', {
            description: 'Compile the main source files',
            category: tasks_1.TaskCategory.BUILD,
            exec: 'mvn compiler:compile',
        });
    }
}
exports.MavenCompile = MavenCompile;
_a = JSII_RTTI_SYMBOL_1;
MavenCompile[_a] = { fqn: "projen.java.MavenCompile", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF2ZW4tY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qYXZhL21hdmVuLWNvbXBpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0Q0FBeUM7QUFFekMsb0NBQThDOzs7Ozs7QUF5QjlDLE1BQWEsWUFBYSxTQUFRLHFCQUFTOzs7O0lBR3pDLFlBQVksT0FBZ0IsRUFBRSxHQUFRLEVBQUUsVUFBK0IsRUFBRTs7UUFDdkUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFcEMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxzREFBc0QsRUFBRTtZQUNwRSxhQUFhLEVBQUU7Z0JBQ2IsTUFBTSxRQUFFLE9BQU8sQ0FBQyxNQUFNLG1DQUFJLEtBQUs7Z0JBQy9CLE1BQU0sUUFBRSxPQUFPLENBQUMsTUFBTSxtQ0FBSSxLQUFLO2FBQ2hDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUM1QyxXQUFXLEVBQUUsK0JBQStCO1lBQzVDLFFBQVEsRUFBRSxvQkFBWSxDQUFDLEtBQUs7WUFDNUIsSUFBSSxFQUFFLHNCQUFzQjtTQUM3QixDQUFDLENBQUM7SUFDTCxDQUFDOztBQXBCSCxvQ0FxQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnO1xuaW1wb3J0IHsgUHJvamVjdCB9IGZyb20gJy4uL3Byb2plY3QnO1xuaW1wb3J0IHsgVGFzaywgVGFza0NhdGVnb3J5IH0gZnJvbSAnLi4vdGFza3MnO1xuaW1wb3J0IHsgUG9tIH0gZnJvbSAnLi9wb20nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBNYXZlbkNvbXBpbGVPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzb3VyY2U/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgdGFyZ2V0Pzogc3RyaW5nO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgTWF2ZW5Db21waWxlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgcHVibGljIHJlYWRvbmx5IGNvbXBpbGVUYXNrOiBUYXNrO1xuXG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFByb2plY3QsIHBvbTogUG9tLCBvcHRpb25zOiBNYXZlbkNvbXBpbGVPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIHByb2plY3QuZ2l0aWdub3JlLmV4Y2x1ZGUoJ3RhcmdldCcpO1xuXG4gICAgcG9tLmFkZFBsdWdpbignb3JnLmFwYWNoZS5tYXZlbi5wbHVnaW5zL21hdmVuLWNvbXBpbGVyLXBsdWdpbkAzLjguMScsIHtcbiAgICAgIGNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgc291cmNlOiBvcHRpb25zLnNvdXJjZSA/PyAnMS44JyxcbiAgICAgICAgdGFyZ2V0OiBvcHRpb25zLnRhcmdldCA/PyAnMS44JyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbXBpbGVUYXNrID0gcHJvamVjdC5hZGRUYXNrKCdjb21waWxlJywge1xuICAgICAgZGVzY3JpcHRpb246ICdDb21waWxlIHRoZSBtYWluIHNvdXJjZSBmaWxlcycsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LkJVSUxELFxuICAgICAgZXhlYzogJ212biBjb21waWxlcjpjb21waWxlJyxcbiAgICB9KTtcbiAgfVxufSJdfQ==