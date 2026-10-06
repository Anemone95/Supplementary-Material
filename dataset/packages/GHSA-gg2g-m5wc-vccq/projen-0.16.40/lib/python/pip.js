"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pip = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const deps_1 = require("../deps");
const tasks_1 = require("../tasks");
const util_1 = require("../util");
const requirements_file_1 = require("./requirements-file");
/**
 * (experimental) Manages dependencies using a requirements.txt file and the pip CLI tool.
 *
 * @experimental
 */
class Pip extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, _options = {}) {
        super(project);
        new requirements_file_1.RequirementsFile(project, 'requirements.txt', { packageProvider: new RuntimeDependencyProvider(project) });
        new requirements_file_1.RequirementsFile(project, 'requirements-dev.txt', { packageProvider: new DevDependencyProvider(project) });
        this.installTask = project.addTask('install', {
            description: 'Install and upgrade dependencies',
            category: tasks_1.TaskCategory.BUILD,
        });
        this.installTask.exec('pip install --upgrade pip');
        this.installTask.exec('pip install -r requirements.txt');
        this.installTask.exec('pip install -r requirements-dev.txt');
    }
    /**
     * (experimental) Adds a runtime dependency.
     *
     * @param spec Format `<module>@<semver>`.
     * @experimental
     */
    addDependency(spec) {
        this.project.deps.addDependency(spec, deps_1.DependencyType.RUNTIME);
    }
    /**
     * (experimental) Adds a dev dependency.
     *
     * @param spec Format `<module>@<semver>`.
     * @experimental
     */
    addDevDependency(spec) {
        this.project.deps.addDependency(spec, deps_1.DependencyType.DEVENV);
    }
    /**
     * (experimental) Installs dependencies (called during post-synthesis).
     *
     * @experimental
     */
    installDependencies() {
        this.project.logger.info('Installing dependencies...');
        util_1.exec(this.installTask.toShellCommand(), { cwd: this.project.outdir });
    }
}
exports.Pip = Pip;
_a = JSII_RTTI_SYMBOL_1;
Pip[_a] = { fqn: "projen.python.Pip", version: "0.16.40" };
class RuntimeDependencyProvider {
    constructor(pythonProject) {
        this.pythonProject = pythonProject;
    }
    get packages() {
        return this.pythonProject.deps.all.filter(dep => dep.type === deps_1.DependencyType.RUNTIME);
    }
}
class DevDependencyProvider {
    constructor(pythonProject) {
        this.pythonProject = pythonProject;
    }
    get packages() {
        return this.pythonProject.deps.all.filter(dep => dep.type === deps_1.DependencyType.DEVENV);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3B5dGhvbi9waXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0Q0FBeUM7QUFDekMsa0NBQXFEO0FBQ3JELG9DQUE4QztBQUM5QyxrQ0FBK0I7QUFHL0IsMkRBQXVEOzs7Ozs7QUFVdkQsTUFBYSxHQUFJLFNBQVEscUJBQVM7Ozs7SUFHaEMsWUFBWSxPQUFzQixFQUFFLFdBQXVCLEVBQUU7UUFDM0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsSUFBSSxvQ0FBZ0IsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0csSUFBSSxvQ0FBZ0IsQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFL0csSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUM1QyxXQUFXLEVBQUUsa0NBQWtDO1lBQy9DLFFBQVEsRUFBRSxvQkFBWSxDQUFDLEtBQUs7U0FDN0IsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7SUFDL0QsQ0FBQzs7Ozs7OztJQU9NLGFBQWEsQ0FBQyxJQUFZO1FBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUscUJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRSxDQUFDOzs7Ozs7O0lBT00sZ0JBQWdCLENBQUMsSUFBWTtRQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLHFCQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0QsQ0FBQzs7Ozs7O0lBS00sbUJBQW1CO1FBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ3ZELFdBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN4RSxDQUFDOztBQTFDSCxrQkEyQ0M7OztBQUVELE1BQU0seUJBQXlCO0lBQzdCLFlBQTZCLGFBQTRCO1FBQTVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQUcsQ0FBQztJQUM3RCxJQUFXLFFBQVE7UUFDakIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxxQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hGLENBQUM7Q0FDRjtBQUVELE1BQU0scUJBQXFCO0lBQ3pCLFlBQTZCLGFBQTRCO1FBQTVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQUcsQ0FBQztJQUM3RCxJQUFXLFFBQVE7UUFDakIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxxQkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBEZXBlbmRlbmN5LCBEZXBlbmRlbmN5VHlwZSB9IGZyb20gJy4uL2RlcHMnO1xuaW1wb3J0IHsgVGFzaywgVGFza0NhdGVnb3J5IH0gZnJvbSAnLi4vdGFza3MnO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHsgSVBhY2thZ2VQcm92aWRlciwgSVB5dGhvbkRlcHMgfSBmcm9tICcuL3B5dGhvbi1kZXBzJztcbmltcG9ydCB7IFB5dGhvblByb2plY3QgfSBmcm9tICcuL3B5dGhvbi1wcm9qZWN0JztcbmltcG9ydCB7IFJlcXVpcmVtZW50c0ZpbGUgfSBmcm9tICcuL3JlcXVpcmVtZW50cy1maWxlJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBpbnRlcmZhY2UgUGlwT3B0aW9ucyB7fVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFBpcCBleHRlbmRzIENvbXBvbmVudCBpbXBsZW1lbnRzIElQeXRob25EZXBzIHtcbiAgcHVibGljIHJlYWRvbmx5IGluc3RhbGxUYXNrOiBUYXNrO1xuXG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFB5dGhvblByb2plY3QsIF9vcHRpb25zOiBQaXBPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIG5ldyBSZXF1aXJlbWVudHNGaWxlKHByb2plY3QsICdyZXF1aXJlbWVudHMudHh0JywgeyBwYWNrYWdlUHJvdmlkZXI6IG5ldyBSdW50aW1lRGVwZW5kZW5jeVByb3ZpZGVyKHByb2plY3QpIH0pO1xuICAgIG5ldyBSZXF1aXJlbWVudHNGaWxlKHByb2plY3QsICdyZXF1aXJlbWVudHMtZGV2LnR4dCcsIHsgcGFja2FnZVByb3ZpZGVyOiBuZXcgRGV2RGVwZW5kZW5jeVByb3ZpZGVyKHByb2plY3QpIH0pO1xuXG4gICAgdGhpcy5pbnN0YWxsVGFzayA9IHByb2plY3QuYWRkVGFzaygnaW5zdGFsbCcsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnSW5zdGFsbCBhbmQgdXBncmFkZSBkZXBlbmRlbmNpZXMnLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5CVUlMRCxcbiAgICB9KTtcbiAgICB0aGlzLmluc3RhbGxUYXNrLmV4ZWMoJ3BpcCBpbnN0YWxsIC0tdXBncmFkZSBwaXAnKTtcbiAgICB0aGlzLmluc3RhbGxUYXNrLmV4ZWMoJ3BpcCBpbnN0YWxsIC1yIHJlcXVpcmVtZW50cy50eHQnKTtcbiAgICB0aGlzLmluc3RhbGxUYXNrLmV4ZWMoJ3BpcCBpbnN0YWxsIC1yIHJlcXVpcmVtZW50cy1kZXYudHh0Jyk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZERlcGVuZGVuY3koc3BlYzogc3RyaW5nKSB7XG4gICAgdGhpcy5wcm9qZWN0LmRlcHMuYWRkRGVwZW5kZW5jeShzcGVjLCBEZXBlbmRlbmN5VHlwZS5SVU5USU1FKTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGREZXZEZXBlbmRlbmN5KHNwZWM6IHN0cmluZykge1xuICAgIHRoaXMucHJvamVjdC5kZXBzLmFkZERlcGVuZGVuY3koc3BlYywgRGVwZW5kZW5jeVR5cGUuREVWRU5WKTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBpbnN0YWxsRGVwZW5kZW5jaWVzKCkge1xuICAgIHRoaXMucHJvamVjdC5sb2dnZXIuaW5mbygnSW5zdGFsbGluZyBkZXBlbmRlbmNpZXMuLi4nKTtcbiAgICBleGVjKHRoaXMuaW5zdGFsbFRhc2sudG9TaGVsbENvbW1hbmQoKSwgeyBjd2Q6IHRoaXMucHJvamVjdC5vdXRkaXIgfSk7XG4gIH1cbn1cblxuY2xhc3MgUnVudGltZURlcGVuZGVuY3lQcm92aWRlciBpbXBsZW1lbnRzIElQYWNrYWdlUHJvdmlkZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHB5dGhvblByb2plY3Q6IFB5dGhvblByb2plY3QpIHt9XG4gIHB1YmxpYyBnZXQgcGFja2FnZXMoKTogRGVwZW5kZW5jeVtdIHtcbiAgICByZXR1cm4gdGhpcy5weXRob25Qcm9qZWN0LmRlcHMuYWxsLmZpbHRlcihkZXAgPT4gZGVwLnR5cGUgPT09IERlcGVuZGVuY3lUeXBlLlJVTlRJTUUpO1xuICB9XG59XG5cbmNsYXNzIERldkRlcGVuZGVuY3lQcm92aWRlciBpbXBsZW1lbnRzIElQYWNrYWdlUHJvdmlkZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHB5dGhvblByb2plY3Q6IFB5dGhvblByb2plY3QpIHt9XG4gIHB1YmxpYyBnZXQgcGFja2FnZXMoKTogRGVwZW5kZW5jeVtdIHtcbiAgICByZXR1cm4gdGhpcy5weXRob25Qcm9qZWN0LmRlcHMuYWxsLmZpbHRlcihkZXAgPT4gZGVwLnR5cGUgPT09IERlcGVuZGVuY3lUeXBlLkRFVkVOVik7XG4gIH1cbn0iXX0=