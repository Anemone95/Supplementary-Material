"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Setuptools = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const tasks_1 = require("../tasks");
const setuppy_1 = require("./setuppy");
/**
 * (experimental) Manages packaging through setuptools with a setup.py script.
 *
 * @experimental
 */
class Setuptools extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options) {
        super(project);
        project.addDevDependency('wheel@0.36.2');
        project.addDevDependency('twine@3.3.0');
        this.packageTask = project.addTask('package', {
            description: 'Creates source archive and wheel for distribution.',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'python setup.py sdist bdist_wheel',
        });
        this.publishTestTask = project.addTask('publish:test', {
            description: 'Uploads the package against a test PyPI endpoint.',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'twine upload --repository-url https://test.pypi.org/legacy/ dist/*',
        });
        this.publishTask = project.addTask('publish', {
            description: 'Uploads the package against a test PyPI endpoint.',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'twine upload dist/*',
        });
        new setuppy_1.SetupPy(project, {
            name: project.name,
            packages: [project.moduleName],
            authorName: options.authorName,
            authorEmail: options.authorEmail,
            version: options.version,
            description: options.description,
            license: options.license,
            homepage: options.homepage,
            classifiers: options.classifiers,
            ...options.setupConfig,
        });
    }
}
exports.Setuptools = Setuptools;
_a = JSII_RTTI_SYMBOL_1;
Setuptools[_a] = { fqn: "projen.python.Setuptools", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXB0b29scy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9weXRob24vc2V0dXB0b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDRDQUF5QztBQUN6QyxvQ0FBOEM7QUFHOUMsdUNBQW9DOzs7Ozs7QUFLcEMsTUFBYSxVQUFXLFNBQVEscUJBQVM7Ozs7SUFTdkMsWUFBWSxPQUFzQixFQUFFLE9BQStCO1FBQ2pFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN6QyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUM1QyxXQUFXLEVBQUUsb0RBQW9EO1lBQ2pFLFFBQVEsRUFBRSxvQkFBWSxDQUFDLE9BQU87WUFDOUIsSUFBSSxFQUFFLG1DQUFtQztTQUMxQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFO1lBQ3JELFdBQVcsRUFBRSxtREFBbUQ7WUFDaEUsUUFBUSxFQUFFLG9CQUFZLENBQUMsT0FBTztZQUM5QixJQUFJLEVBQUUsb0VBQW9FO1NBQzNFLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDNUMsV0FBVyxFQUFFLG1EQUFtRDtZQUNoRSxRQUFRLEVBQUUsb0JBQVksQ0FBQyxPQUFPO1lBQzlCLElBQUksRUFBRSxxQkFBcUI7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxpQkFBTyxDQUFDLE9BQU8sRUFBRTtZQUNuQixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7WUFDbEIsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUM5QixVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7WUFDOUIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO1lBQ2hDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDaEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1lBQ3hCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtZQUMxQixXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDaEMsR0FBRyxPQUFPLENBQUMsV0FBVztTQUN2QixDQUFDLENBQUM7SUFDTCxDQUFDOztBQTdDSCxnQ0E4Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnO1xuaW1wb3J0IHsgVGFzaywgVGFza0NhdGVnb3J5IH0gZnJvbSAnLi4vdGFza3MnO1xuaW1wb3J0IHsgSVB5dGhvblBhY2thZ2luZywgUHl0aG9uUGFja2FnaW5nT3B0aW9ucyB9IGZyb20gJy4vcHl0aG9uLXBhY2thZ2luZyc7XG5pbXBvcnQgeyBQeXRob25Qcm9qZWN0IH0gZnJvbSAnLi9weXRob24tcHJvamVjdCc7XG5pbXBvcnQgeyBTZXR1cFB5IH0gZnJvbSAnLi9zZXR1cHB5JztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBTZXR1cHRvb2xzIGV4dGVuZHMgQ29tcG9uZW50IGltcGxlbWVudHMgSVB5dGhvblBhY2thZ2luZyB7XG4gIHB1YmxpYyByZWFkb25seSBwYWNrYWdlVGFzazogVGFzaztcbiAgcHVibGljIHJlYWRvbmx5IHB1Ymxpc2hUYXNrOiBUYXNrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgcHVibGlzaFRlc3RUYXNrOiBUYXNrO1xuXG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFB5dGhvblByb2plY3QsIG9wdGlvbnM6IFB5dGhvblBhY2thZ2luZ09wdGlvbnMpIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIHByb2plY3QuYWRkRGV2RGVwZW5kZW5jeSgnd2hlZWxAMC4zNi4yJyk7XG4gICAgcHJvamVjdC5hZGREZXZEZXBlbmRlbmN5KCd0d2luZUAzLjMuMCcpO1xuXG4gICAgdGhpcy5wYWNrYWdlVGFzayA9IHByb2plY3QuYWRkVGFzaygncGFja2FnZScsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlcyBzb3VyY2UgYXJjaGl2ZSBhbmQgd2hlZWwgZm9yIGRpc3RyaWJ1dGlvbi4nLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5SRUxFQVNFLFxuICAgICAgZXhlYzogJ3B5dGhvbiBzZXR1cC5weSBzZGlzdCBiZGlzdF93aGVlbCcsXG4gICAgfSk7XG5cbiAgICB0aGlzLnB1Ymxpc2hUZXN0VGFzayA9IHByb2plY3QuYWRkVGFzaygncHVibGlzaDp0ZXN0Jywge1xuICAgICAgZGVzY3JpcHRpb246ICdVcGxvYWRzIHRoZSBwYWNrYWdlIGFnYWluc3QgYSB0ZXN0IFB5UEkgZW5kcG9pbnQuJyxcbiAgICAgIGNhdGVnb3J5OiBUYXNrQ2F0ZWdvcnkuUkVMRUFTRSxcbiAgICAgIGV4ZWM6ICd0d2luZSB1cGxvYWQgLS1yZXBvc2l0b3J5LXVybCBodHRwczovL3Rlc3QucHlwaS5vcmcvbGVnYWN5LyBkaXN0LyonLFxuICAgIH0pO1xuXG4gICAgdGhpcy5wdWJsaXNoVGFzayA9IHByb2plY3QuYWRkVGFzaygncHVibGlzaCcsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVXBsb2FkcyB0aGUgcGFja2FnZSBhZ2FpbnN0IGEgdGVzdCBQeVBJIGVuZHBvaW50LicsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LlJFTEVBU0UsXG4gICAgICBleGVjOiAndHdpbmUgdXBsb2FkIGRpc3QvKicsXG4gICAgfSk7XG5cbiAgICBuZXcgU2V0dXBQeShwcm9qZWN0LCB7XG4gICAgICBuYW1lOiBwcm9qZWN0Lm5hbWUsXG4gICAgICBwYWNrYWdlczogW3Byb2plY3QubW9kdWxlTmFtZV0sXG4gICAgICBhdXRob3JOYW1lOiBvcHRpb25zLmF1dGhvck5hbWUsXG4gICAgICBhdXRob3JFbWFpbDogb3B0aW9ucy5hdXRob3JFbWFpbCxcbiAgICAgIHZlcnNpb246IG9wdGlvbnMudmVyc2lvbixcbiAgICAgIGRlc2NyaXB0aW9uOiBvcHRpb25zLmRlc2NyaXB0aW9uLFxuICAgICAgbGljZW5zZTogb3B0aW9ucy5saWNlbnNlLFxuICAgICAgaG9tZXBhZ2U6IG9wdGlvbnMuaG9tZXBhZ2UsXG4gICAgICBjbGFzc2lmaWVyczogb3B0aW9ucy5jbGFzc2lmaWVycyxcbiAgICAgIC4uLm9wdGlvbnMuc2V0dXBDb25maWcsXG4gICAgfSk7XG4gIH1cbn0iXX0=