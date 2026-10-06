"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevContainer = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const json_1 = require("../json");
/**
  * Relative path of devcontainer file to generate
  */
const DEVCONTAINER_FILE = '.devcontainer.json';
/**
 * (experimental) A development environment running VSCode in a container;
 *
 * used by GitHub
 * codespaces.
 *
 * @experimental
 */
class DevContainer extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options = {}) {
        super(project);
        this.postCreateTasks = new Array();
        this.ports = new Array();
        this.vscodeExtensions = new Array();
        this.dockerImage = options === null || options === void 0 ? void 0 : options.dockerImage;
        if (options === null || options === void 0 ? void 0 : options.tasks) {
            for (const task of options.tasks) {
                this.addTasks(task);
            }
        }
        if (options === null || options === void 0 ? void 0 : options.ports) {
            this.addPorts(...options.ports);
        }
        if (options === null || options === void 0 ? void 0 : options.vscodeExtensions) {
            this.addVscodeExtensions(...options.vscodeExtensions);
        }
        this.config = {
            image: () => { var _b; return (_b = this.dockerImage) === null || _b === void 0 ? void 0 : _b.image; },
            build: {
                dockerfile: () => { var _b; return (_b = this.dockerImage) === null || _b === void 0 ? void 0 : _b.dockerFile; },
            },
            postCreateCommand: () => this.renderTasks(),
            forwardPorts: this.ports,
            extensions: this.vscodeExtensions,
        };
        new json_1.JsonFile(this.project, DEVCONTAINER_FILE, { obj: this.config, omitEmpty: true });
    }
    /**
     * (experimental) Add a custom Docker image or Dockerfile for the container.
     *
     * @experimental
     */
    addDockerImage(image) {
        if (this.dockerImage) {
            throw new Error('dockerImage cannot be redefined.');
        }
        this.dockerImage = image;
    }
    /**
     * (experimental) Adds tasks to run when the container starts.
     *
     * Tasks will be run in sequence.
     *
     * @param tasks The new tasks.
     * @experimental
     */
    addTasks(...tasks) {
        this.postCreateTasks.push(...tasks);
    }
    /**
     * (experimental) Adds ports that should be exposed (forwarded) from the container.
     *
     * @param ports The new ports.
     * @experimental
     */
    addPorts(...ports) {
        this.ports.push(...ports);
    }
    /**
     * (experimental) Adds a list of VSCode extensions that should be automatically installed in the container.
     *
     * @param extensions The extension IDs.
     * @experimental
     */
    addVscodeExtensions(...extensions) {
        this.vscodeExtensions.push(...extensions);
    }
    renderTasks() {
        if (this.postCreateTasks.length !== 0) {
            return this.postCreateTasks.map(task => `( npx projen ${task.name} )`).join(' && ');
        }
        else {
            return undefined;
        }
    }
}
exports.DevContainer = DevContainer;
_a = JSII_RTTI_SYMBOL_1;
DevContainer[_a] = { fqn: "projen.vscode.DevContainer", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2Y29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ZzY29kZS9kZXZjb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0Q0FBeUM7QUFFekMsa0NBQW1DO0FBSW5DOztJQUVJO0FBQ0osTUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQzs7Ozs7Ozs7O0FBYy9DLE1BQWEsWUFBYSxTQUFRLHFCQUFTOzs7O0lBV3pDLFlBQVksT0FBZ0IsRUFBRSxVQUErQixFQUFFO1FBQzdELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxLQUFLLEVBQVEsQ0FBQztRQUN6QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFVLENBQUM7UUFDakMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksS0FBSyxFQUFVLENBQUM7UUFFNUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsV0FBVyxDQUFDO1FBRXhDLElBQUksT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLEtBQUssRUFBRTtZQUNsQixLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDckI7U0FDRjtRQUNELElBQUksT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLEtBQUssRUFBRTtZQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsSUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsZ0JBQWdCLEVBQUU7WUFDN0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDdkQ7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1osS0FBSyxFQUFFLEdBQUcsRUFBRSx3QkFBQyxJQUFJLENBQUMsV0FBVywwQ0FBRSxLQUFLLEdBQUE7WUFDcEMsS0FBSyxFQUFFO2dCQUNMLFVBQVUsRUFBRSxHQUFHLEVBQUUsd0JBQUMsSUFBSSxDQUFDLFdBQVcsMENBQUUsVUFBVSxHQUFBO2FBQy9DO1lBQ0QsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUMzQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDeEIsVUFBVSxFQUFFLElBQUksQ0FBQyxnQkFBZ0I7U0FDbEMsQ0FBQztRQUVGLElBQUksZUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN2RixDQUFDOzs7Ozs7SUFFTSxjQUFjLENBQUMsS0FBZ0M7UUFDcEQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztTQUNyRDtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7Ozs7Ozs7OztJQU9NLFFBQVEsQ0FBQyxHQUFHLEtBQWE7UUFDOUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUN0QyxDQUFDOzs7Ozs7O0lBT00sUUFBUSxDQUFDLEdBQUcsS0FBZTtRQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7Ozs7Ozs7SUFRTSxtQkFBbUIsQ0FBQyxHQUFHLFVBQW9CO1FBQ2hELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU8sV0FBVztRQUNqQixJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNyQyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyRjthQUFNO1lBQ0wsT0FBTyxTQUFTLENBQUM7U0FDbEI7SUFDSCxDQUFDOztBQXRGSCxvQ0F1RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnO1xuaW1wb3J0IHsgRGV2RW52aXJvbm1lbnREb2NrZXJJbWFnZSwgRGV2RW52aXJvbm1lbnRPcHRpb25zLCBJRGV2RW52aXJvbm1lbnQgfSBmcm9tICcuLi9kZXYtZW52JztcbmltcG9ydCB7IEpzb25GaWxlIH0gZnJvbSAnLi4vanNvbic7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi4vcHJvamVjdCc7XG5pbXBvcnQgeyBUYXNrIH0gZnJvbSAnLi4vdGFza3MnO1xuXG4vKipcbiAgKiBSZWxhdGl2ZSBwYXRoIG9mIGRldmNvbnRhaW5lciBmaWxlIHRvIGdlbmVyYXRlXG4gICovXG5jb25zdCBERVZDT05UQUlORVJfRklMRSA9ICcuZGV2Y29udGFpbmVyLmpzb24nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBEZXZDb250YWluZXJPcHRpb25zIGV4dGVuZHMgRGV2RW52aXJvbm1lbnRPcHRpb25zIHt9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBEZXZDb250YWluZXIgZXh0ZW5kcyBDb21wb25lbnQgaW1wbGVtZW50cyBJRGV2RW52aXJvbm1lbnQge1xuICBwcml2YXRlIGRvY2tlckltYWdlOiBEZXZFbnZpcm9ubWVudERvY2tlckltYWdlIHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIHJlYWRvbmx5IHBvc3RDcmVhdGVUYXNrczogVGFza1tdO1xuICBwcml2YXRlIHJlYWRvbmx5IHBvcnRzOiBzdHJpbmdbXTtcbiAgcHJpdmF0ZSByZWFkb25seSB2c2NvZGVFeHRlbnNpb25zOiBzdHJpbmdbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgY29uZmlnOiBhbnk7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogUHJvamVjdCwgb3B0aW9uczogRGV2Q29udGFpbmVyT3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICB0aGlzLnBvc3RDcmVhdGVUYXNrcyA9IG5ldyBBcnJheTxUYXNrPigpO1xuICAgIHRoaXMucG9ydHMgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xuICAgIHRoaXMudnNjb2RlRXh0ZW5zaW9ucyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XG5cbiAgICB0aGlzLmRvY2tlckltYWdlID0gb3B0aW9ucz8uZG9ja2VySW1hZ2U7XG5cbiAgICBpZiAob3B0aW9ucz8udGFza3MpIHtcbiAgICAgIGZvciAoY29uc3QgdGFzayBvZiBvcHRpb25zLnRhc2tzKSB7XG4gICAgICAgIHRoaXMuYWRkVGFza3ModGFzayk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5wb3J0cykge1xuICAgICAgdGhpcy5hZGRQb3J0cyguLi5vcHRpb25zLnBvcnRzKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/LnZzY29kZUV4dGVuc2lvbnMpIHtcbiAgICAgIHRoaXMuYWRkVnNjb2RlRXh0ZW5zaW9ucyguLi5vcHRpb25zLnZzY29kZUV4dGVuc2lvbnMpO1xuICAgIH1cblxuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgaW1hZ2U6ICgpID0+IHRoaXMuZG9ja2VySW1hZ2U/LmltYWdlLFxuICAgICAgYnVpbGQ6IHtcbiAgICAgICAgZG9ja2VyZmlsZTogKCkgPT4gdGhpcy5kb2NrZXJJbWFnZT8uZG9ja2VyRmlsZSxcbiAgICAgIH0sXG4gICAgICBwb3N0Q3JlYXRlQ29tbWFuZDogKCkgPT4gdGhpcy5yZW5kZXJUYXNrcygpLFxuICAgICAgZm9yd2FyZFBvcnRzOiB0aGlzLnBvcnRzLFxuICAgICAgZXh0ZW5zaW9uczogdGhpcy52c2NvZGVFeHRlbnNpb25zLFxuICAgIH07XG5cbiAgICBuZXcgSnNvbkZpbGUodGhpcy5wcm9qZWN0LCBERVZDT05UQUlORVJfRklMRSwgeyBvYmo6IHRoaXMuY29uZmlnLCBvbWl0RW1wdHk6IHRydWUgfSk7XG4gIH1cblxuICBwdWJsaWMgYWRkRG9ja2VySW1hZ2UoaW1hZ2U6IERldkVudmlyb25tZW50RG9ja2VySW1hZ2UpIHtcbiAgICBpZiAodGhpcy5kb2NrZXJJbWFnZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkb2NrZXJJbWFnZSBjYW5ub3QgYmUgcmVkZWZpbmVkLicpO1xuICAgIH1cbiAgICB0aGlzLmRvY2tlckltYWdlID0gaW1hZ2U7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGRUYXNrcyguLi50YXNrczogVGFza1tdKSB7XG4gICAgdGhpcy5wb3N0Q3JlYXRlVGFza3MucHVzaCguLi50YXNrcyk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZFBvcnRzKC4uLnBvcnRzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMucG9ydHMucHVzaCguLi5wb3J0cyk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkVnNjb2RlRXh0ZW5zaW9ucyguLi5leHRlbnNpb25zOiBzdHJpbmdbXSkge1xuICAgIHRoaXMudnNjb2RlRXh0ZW5zaW9ucy5wdXNoKC4uLmV4dGVuc2lvbnMpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJUYXNrcygpIHtcbiAgICBpZiAodGhpcy5wb3N0Q3JlYXRlVGFza3MubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb3N0Q3JlYXRlVGFza3MubWFwKHRhc2sgPT4gYCggbnB4IHByb2plbiAke3Rhc2submFtZX0gKWApLmpvaW4oJyAmJiAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==