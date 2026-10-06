"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoetryPyproject = exports.Poetry = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const deps_1 = require("../deps");
const tasks_1 = require("../tasks");
const toml_1 = require("../toml");
const util_1 = require("../util");
/**
 * (experimental) Manage project dependencies, virtual environments, and packaging through the poetry CLI tool.
 *
 * @experimental
 */
class Poetry extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options) {
        var _c;
        super(project);
        this.installTask = project.addTask('install', {
            description: 'Install and upgrade dependencies',
            category: tasks_1.TaskCategory.BUILD,
            exec: 'poetry update',
        });
        this.project.tasks.addEnvironment('VIRTUAL_ENV', '$(poetry env info -p)');
        this.project.tasks.addEnvironment('PATH', '$(echo $(poetry env info -p)/bin:$PATH)');
        // declare the python versions for which the package is compatible
        this.addDependency('python@^3.6');
        this.packageTask = project.addTask('package', {
            description: 'Creates source archive and wheel for distribution.',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'poetry build',
        });
        this.publishTestTask = project.addTask('publish:test', {
            description: 'Uploads the package against a test PyPI endpoint.',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'poetry publish -r testpypi',
        });
        this.publishTask = project.addTask('publish', {
            description: 'Uploads the package to PyPI.',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'poetry publish',
        });
        new PoetryPyproject(project, {
            name: project.name,
            version: options.version,
            description: (_c = options.description) !== null && _c !== void 0 ? _c : '',
            license: options.license,
            authors: [`${options.authorName} <${options.authorEmail}>`],
            homepage: options.homepage,
            classifiers: options.classifiers,
            ...options.poetryOptions,
            dependencies: () => this.synthDependencies(),
            devDependencies: () => this.synthDevDependencies(),
        });
        new toml_1.TomlFile(project, 'poetry.toml', {
            committed: false,
            obj: {
                repositories: {
                    testpypi: {
                        url: 'https://test.pypi.org/legacy/',
                    },
                },
            },
        });
    }
    synthDependencies() {
        const dependencies = {};
        for (const pkg of this.project.deps.all) {
            if (pkg.type === deps_1.DependencyType.RUNTIME) {
                dependencies[pkg.name] = pkg.version;
            }
        }
        return dependencies;
    }
    synthDevDependencies() {
        const dependencies = {};
        for (const pkg of this.project.deps.all) {
            if ([deps_1.DependencyType.DEVENV].includes(pkg.type)) {
                dependencies[pkg.name] = pkg.version;
            }
        }
        return dependencies;
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
     * (experimental) Initializes the virtual environment if it doesn't exist (called during post-synthesis).
     *
     * @experimental
     */
    setupEnvironment() {
        const result = util_1.execOrUndefined('which poetry', { cwd: this.project.outdir });
        if (!result) {
            this.project.logger.info('Unable to setup an environment since poetry is not installed. Please install poetry (https://python-poetry.org/docs/) or use a different component for managing environments such as \'venv\'.');
        }
        let envPath = util_1.execOrUndefined('poetry env info -p', { cwd: this.project.outdir });
        if (!envPath) {
            this.project.logger.info('Setting up a virtual environment...');
            util_1.exec('poetry env use python', { cwd: this.project.outdir });
            envPath = util_1.execOrUndefined('poetry env info -p', { cwd: this.project.outdir });
            this.project.logger.info(`Environment successfully created (located in ${envPath}}).`);
        }
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
exports.Poetry = Poetry;
_a = JSII_RTTI_SYMBOL_1;
Poetry[_a] = { fqn: "projen.python.Poetry", version: "0.16.40" };
/**
 * (experimental) Represents configuration of a pyproject.toml file for a Poetry project.
 *
 * @see https://python-poetry.org/docs/pyproject/
 * @experimental
 */
class PoetryPyproject extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options) {
        super(project);
        this.file = new toml_1.TomlFile(project, 'pyproject.toml', {
            marker: true,
            omitEmpty: false,
            obj: {
                'build-system': {
                    'requires': ['poetry_core>=1.0.0'],
                    'build-backend': 'poetry.core.masonry.api',
                },
                'tool': {
                    poetry: {
                        'name': options.name,
                        'version': options.version,
                        'description': options.description,
                        'license': options.license,
                        'authors': options.authors,
                        'maintainers': options.maintainers,
                        'readme': options.readme,
                        'homepage': options.homepage,
                        'repository': options.repository,
                        'documentation': options.documentation,
                        'keywords': options.keywords,
                        'classifiers': options.classifiers,
                        'packages': options.packages,
                        'include': options.include,
                        'exclude': options.exclude,
                        'dependencies': options.dependencies,
                        'dev-dependencies': options.devDependencies,
                        'scripts': options.scripts,
                    },
                },
            },
        });
    }
}
exports.PoetryPyproject = PoetryPyproject;
_b = JSII_RTTI_SYMBOL_1;
PoetryPyproject[_b] = { fqn: "projen.python.PoetryPyproject", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ldHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3B5dGhvbi9wb2V0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0Q0FBeUM7QUFDekMsa0NBQXlDO0FBQ3pDLG9DQUE4QztBQUM5QyxrQ0FBbUM7QUFDbkMsa0NBQWdEOzs7Ozs7QUFVaEQsTUFBYSxNQUFPLFNBQVEscUJBQVM7Ozs7SUFVbkMsWUFBWSxPQUFzQixFQUFFLE9BQStCOztRQUNqRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFZixJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO1lBQzVDLFdBQVcsRUFBRSxrQ0FBa0M7WUFDL0MsUUFBUSxFQUFFLG9CQUFZLENBQUMsS0FBSztZQUM1QixJQUFJLEVBQUUsZUFBZTtTQUN0QixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO1FBRXJGLGtFQUFrRTtRQUNsRSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRWxDLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDNUMsV0FBVyxFQUFFLG9EQUFvRDtZQUNqRSxRQUFRLEVBQUUsb0JBQVksQ0FBQyxPQUFPO1lBQzlCLElBQUksRUFBRSxjQUFjO1NBQ3JCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUU7WUFDckQsV0FBVyxFQUFFLG1EQUFtRDtZQUNoRSxRQUFRLEVBQUUsb0JBQVksQ0FBQyxPQUFPO1lBQzlCLElBQUksRUFBRSw0QkFB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LEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDbEMsZUFBZSxFQUFFLHlCQUF5QjtpQkFDM0M7Z0JBQ0QsTUFBTSxFQUFFO29CQUNOLE1BQU0sRUFBRTt3QkFDTixNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUk7d0JBQ3BCLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTzt3QkFDMUIsYUFBYSxFQUFFLE9BQU8sQ0FBQyxXQUFXO3dCQUNsQyxTQUFTLEVBQUUsT0FBTyxDQUFDLE9BQU87d0JBQzFCLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTzt3QkFDMUIsYUFBYSxFQUFFLE9BQU8sQ0FBQyxXQUFXO3dCQUNsQyxRQUFRLEVBQUUsT0FBTyxDQUFDLE1BQU07d0JBQ3hCLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUTt3QkFDNUIsWUFBWSxFQUFFLE9BQU8sQ0FBQyxVQUFVO3dCQUNoQyxlQUFlLEVBQUUsT0FBTyxDQUFDLGFBQWE7d0JBQ3RDLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUTt3QkFDNUIsYUFBYSxFQUFFLE9BQU8sQ0FBQyxXQUFXO3dCQUNsQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFFBQVE7d0JBQzVCLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTzt3QkFDMUIsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPO3dCQUMxQixjQUFjLEVBQUUsT0FBTyxDQUFDLFlBQVk7d0JBQ3BDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxlQUFlO3dCQUMzQyxTQUFTLEVBQUUsT0FBTyxDQUFDLE9BQU87cUJBQzNCO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDOztBQXRDSCwwQ0F1Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnO1xuaW1wb3J0IHsgRGVwZW5kZW5jeVR5cGUgfSBmcm9tICcuLi9kZXBzJztcbmltcG9ydCB7IFRhc2ssIFRhc2tDYXRlZ29yeSB9IGZyb20gJy4uL3Rhc2tzJztcbmltcG9ydCB7IFRvbWxGaWxlIH0gZnJvbSAnLi4vdG9tbCc7XG5pbXBvcnQgeyBleGVjLCBleGVjT3JVbmRlZmluZWQgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IElQeXRob25EZXBzIH0gZnJvbSAnLi9weXRob24tZGVwcyc7XG5pbXBvcnQgeyBJUHl0aG9uRW52IH0gZnJvbSAnLi9weXRob24tZW52JztcbmltcG9ydCB7IElQeXRob25QYWNrYWdpbmcsIFB5dGhvblBhY2thZ2luZ09wdGlvbnMgfSBmcm9tICcuL3B5dGhvbi1wYWNrYWdpbmcnO1xuaW1wb3J0IHsgUHl0aG9uUHJvamVjdCB9IGZyb20gJy4vcHl0aG9uLXByb2plY3QnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFBvZXRyeSBleHRlbmRzIENvbXBvbmVudCBpbXBsZW1lbnRzIElQeXRob25EZXBzLCBJUHl0aG9uRW52LCBJUHl0aG9uUGFja2FnaW5nIHtcbiAgcHVibGljIHJlYWRvbmx5IGluc3RhbGxUYXNrOiBUYXNrO1xuICBwdWJsaWMgcmVhZG9ubHkgcGFja2FnZVRhc2s6IFRhc2s7XG4gIHB1YmxpYyByZWFkb25seSBwdWJsaXNoVGFzazogVGFzaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHB1Ymxpc2hUZXN0VGFzazogVGFzaztcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQeXRob25Qcm9qZWN0LCBvcHRpb25zOiBQeXRob25QYWNrYWdpbmdPcHRpb25zKSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICB0aGlzLmluc3RhbGxUYXNrID0gcHJvamVjdC5hZGRUYXNrKCdpbnN0YWxsJywge1xuICAgICAgZGVzY3JpcHRpb246ICdJbnN0YWxsIGFuZCB1cGdyYWRlIGRlcGVuZGVuY2llcycsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LkJVSUxELFxuICAgICAgZXhlYzogJ3BvZXRyeSB1cGRhdGUnLFxuICAgIH0pO1xuXG4gICAgdGhpcy5wcm9qZWN0LnRhc2tzLmFkZEVudmlyb25tZW50KCdWSVJUVUFMX0VOVicsICckKHBvZXRyeSBlbnYgaW5mbyAtcCknKTtcbiAgICB0aGlzLnByb2plY3QudGFza3MuYWRkRW52aXJvbm1lbnQoJ1BBVEgnLCAnJChlY2hvICQocG9ldHJ5IGVudiBpbmZvIC1wKS9iaW46JFBBVEgpJyk7XG5cbiAgICAvLyBkZWNsYXJlIHRoZSBweXRob24gdmVyc2lvbnMgZm9yIHdoaWNoIHRoZSBwYWNrYWdlIGlzIGNvbXBhdGlibGVcbiAgICB0aGlzLmFkZERlcGVuZGVuY3koJ3B5dGhvbkBeMy42Jyk7XG5cbiAgICB0aGlzLnBhY2thZ2VUYXNrID0gcHJvamVjdC5hZGRUYXNrKCdwYWNrYWdlJywge1xuICAgICAgZGVzY3JpcHRpb246ICdDcmVhdGVzIHNvdXJjZSBhcmNoaXZlIGFuZCB3aGVlbCBmb3IgZGlzdHJpYnV0aW9uLicsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LlJFTEVBU0UsXG4gICAgICBleGVjOiAncG9ldHJ5IGJ1aWxkJyxcbiAgICB9KTtcblxuICAgIHRoaXMucHVibGlzaFRlc3RUYXNrID0gcHJvamVjdC5hZGRUYXNrKCdwdWJsaXNoOnRlc3QnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1VwbG9hZHMgdGhlIHBhY2thZ2UgYWdhaW5zdCBhIHRlc3QgUHlQSSBlbmRwb2ludC4nLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5SRUxFQVNFLFxuICAgICAgZXhlYzogJ3BvZXRyeSBwdWJsaXNoIC1yIHRlc3RweXBpJyxcbiAgICB9KTtcblxuICAgIHRoaXMucHVibGlzaFRhc2sgPSBwcm9qZWN0LmFkZFRhc2soJ3B1Ymxpc2gnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1VwbG9hZHMgdGhlIHBhY2thZ2UgdG8gUHlQSS4nLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5SRUxFQVNFLFxuICAgICAgZXhlYzogJ3BvZXRyeSBwdWJsaXNoJyxcbiAgICB9KTtcblxuICAgIG5ldyBQb2V0cnlQeXByb2plY3QocHJvamVjdCwge1xuICAgICAgbmFtZTogcHJvamVjdC5uYW1lLFxuICAgICAgdmVyc2lvbjogb3B0aW9ucy52ZXJzaW9uLFxuICAgICAgZGVzY3JpcHRpb246IG9wdGlvbnMuZGVzY3JpcHRpb24gPz8gJycsXG4gICAgICBsaWNlbnNlOiBvcHRpb25zLmxpY2Vuc2UsXG4gICAgICBhdXRob3JzOiBbYCR7b3B0aW9ucy5hdXRob3JOYW1lfSA8JHtvcHRpb25zLmF1dGhvckVtYWlsfT5gXSxcbiAgICAgIGhvbWVwYWdlOiBvcHRpb25zLmhvbWVwYWdlLFxuICAgICAgY2xhc3NpZmllcnM6IG9wdGlvbnMuY2xhc3NpZmllcnMsXG4gICAgICAuLi5vcHRpb25zLnBvZXRyeU9wdGlvbnMsXG4gICAgICBkZXBlbmRlbmNpZXM6ICgpID0+IHRoaXMuc3ludGhEZXBlbmRlbmNpZXMoKSxcbiAgICAgIGRldkRlcGVuZGVuY2llczogKCkgPT4gdGhpcy5zeW50aERldkRlcGVuZGVuY2llcygpLFxuICAgIH0pO1xuXG4gICAgbmV3IFRvbWxGaWxlKHByb2plY3QsICdwb2V0cnkudG9tbCcsIHtcbiAgICAgIGNvbW1pdHRlZDogZmFsc2UsXG4gICAgICBvYmo6IHtcbiAgICAgICAgcmVwb3NpdG9yaWVzOiB7XG4gICAgICAgICAgdGVzdHB5cGk6IHtcbiAgICAgICAgICAgIHVybDogJ2h0dHBzOi8vdGVzdC5weXBpLm9yZy9sZWdhY3kvJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc3ludGhEZXBlbmRlbmNpZXMoKSB7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gICAgZm9yIChjb25zdCBwa2cgb2YgdGhpcy5wcm9qZWN0LmRlcHMuYWxsKSB7XG4gICAgICBpZiAocGtnLnR5cGUgPT09IERlcGVuZGVuY3lUeXBlLlJVTlRJTUUpIHtcbiAgICAgICAgZGVwZW5kZW5jaWVzW3BrZy5uYW1lXSA9IHBrZy52ZXJzaW9uO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVwZW5kZW5jaWVzO1xuICB9XG5cbiAgcHJpdmF0ZSBzeW50aERldkRlcGVuZGVuY2llcygpIHtcbiAgICBjb25zdCBkZXBlbmRlbmNpZXM6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgICBmb3IgKGNvbnN0IHBrZyBvZiB0aGlzLnByb2plY3QuZGVwcy5hbGwpIHtcbiAgICAgIGlmIChbRGVwZW5kZW5jeVR5cGUuREVWRU5WXS5pbmNsdWRlcyhwa2cudHlwZSkpIHtcbiAgICAgICAgZGVwZW5kZW5jaWVzW3BrZy5uYW1lXSA9IHBrZy52ZXJzaW9uO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVwZW5kZW5jaWVzO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGREZXBlbmRlbmN5KHNwZWM6IHN0cmluZykge1xuICAgIHRoaXMucHJvamVjdC5kZXBzLmFkZERlcGVuZGVuY3koc3BlYywgRGVwZW5kZW5jeVR5cGUuUlVOVElNRSk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkRGV2RGVwZW5kZW5jeShzcGVjOiBzdHJpbmcpIHtcbiAgICB0aGlzLnByb2plY3QuZGVwcy5hZGREZXBlbmRlbmN5KHNwZWMsIERlcGVuZGVuY3lUeXBlLkRFVkVOVik7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHNldHVwRW52aXJvbm1lbnQoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gZXhlY09yVW5kZWZpbmVkKCd3aGljaCBwb2V0cnknLCB7IGN3ZDogdGhpcy5wcm9qZWN0Lm91dGRpciB9KTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgdGhpcy5wcm9qZWN0LmxvZ2dlci5pbmZvKCdVbmFibGUgdG8gc2V0dXAgYW4gZW52aXJvbm1lbnQgc2luY2UgcG9ldHJ5IGlzIG5vdCBpbnN0YWxsZWQuIFBsZWFzZSBpbnN0YWxsIHBvZXRyeSAoaHR0cHM6Ly9weXRob24tcG9ldHJ5Lm9yZy9kb2NzLykgb3IgdXNlIGEgZGlmZmVyZW50IGNvbXBvbmVudCBmb3IgbWFuYWdpbmcgZW52aXJvbm1lbnRzIHN1Y2ggYXMgXFwndmVudlxcJy4nKTtcbiAgICB9XG5cbiAgICBsZXQgZW52UGF0aCA9IGV4ZWNPclVuZGVmaW5lZCgncG9ldHJ5IGVudiBpbmZvIC1wJywgeyBjd2Q6IHRoaXMucHJvamVjdC5vdXRkaXIgfSk7XG4gICAgaWYgKCFlbnZQYXRoKSB7XG4gICAgICB0aGlzLnByb2plY3QubG9nZ2VyLmluZm8oJ1NldHRpbmcgdXAgYSB2aXJ0dWFsIGVudmlyb25tZW50Li4uJyk7XG4gICAgICBleGVjKCdwb2V0cnkgZW52IHVzZSBweXRob24nLCB7IGN3ZDogdGhpcy5wcm9qZWN0Lm91dGRpciB9KTtcbiAgICAgIGVudlBhdGggPSBleGVjT3JVbmRlZmluZWQoJ3BvZXRyeSBlbnYgaW5mbyAtcCcsIHsgY3dkOiB0aGlzLnByb2plY3Qub3V0ZGlyIH0pO1xuICAgICAgdGhpcy5wcm9qZWN0LmxvZ2dlci5pbmZvKGBFbnZpcm9ubWVudCBzdWNjZXNzZnVsbHkgY3JlYXRlZCAobG9jYXRlZCBpbiAke2VudlBhdGh9fSkuYCk7XG4gICAgfVxuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGluc3RhbGxEZXBlbmRlbmNpZXMoKSB7XG4gICAgdGhpcy5wcm9qZWN0LmxvZ2dlci5pbmZvKCdJbnN0YWxsaW5nIGRlcGVuZGVuY2llcy4uLicpO1xuICAgIGV4ZWModGhpcy5pbnN0YWxsVGFzay50b1NoZWxsQ29tbWFuZCgpLCB7IGN3ZDogdGhpcy5wcm9qZWN0Lm91dGRpciB9KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9ldHJ5UHlwcm9qZWN0T3B0aW9uc1dpdGhvdXREZXBzIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBuYW1lPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgdmVyc2lvbj86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbGljZW5zZT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBhdXRob3JzPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IG1haW50YWluZXJzPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSByZWFkbWU/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGhvbWVwYWdlPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSByZXBvc2l0b3J5Pzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkb2N1bWVudGF0aW9uPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGtleXdvcmRzPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgY2xhc3NpZmllcnM/OiBzdHJpbmdbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBwYWNrYWdlcz86IHN0cmluZ1tdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGluY2x1ZGU/OiBzdHJpbmdbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBleGNsdWRlPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHNjcmlwdHM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBvZXRyeVB5cHJvamVjdE9wdGlvbnMgZXh0ZW5kcyBQb2V0cnlQeXByb2plY3RPcHRpb25zV2l0aG91dERlcHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGRlcGVuZGVuY2llcz86IHsgW2tleTogc3RyaW5nXTogYW55IH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkZXZEZXBlbmRlbmNpZXM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBQb2V0cnlQeXByb2plY3QgZXh0ZW5kcyBDb21wb25lbnQge1xuICBwdWJsaWMgcmVhZG9ubHkgZmlsZTogVG9tbEZpbGU7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogUHl0aG9uUHJvamVjdCwgb3B0aW9uczogUG9ldHJ5UHlwcm9qZWN0T3B0aW9ucykge1xuICAgIHN1cGVyKHByb2plY3QpO1xuXG4gICAgdGhpcy5maWxlID0gbmV3IFRvbWxGaWxlKHByb2plY3QsICdweXByb2plY3QudG9tbCcsIHtcbiAgICAgIG1hcmtlcjogdHJ1ZSxcbiAgICAgIG9taXRFbXB0eTogZmFsc2UsXG4gICAgICBvYmo6IHtcbiAgICAgICAgJ2J1aWxkLXN5c3RlbSc6IHtcbiAgICAgICAgICAncmVxdWlyZXMnOiBbJ3BvZXRyeV9jb3JlPj0xLjAuMCddLFxuICAgICAgICAgICdidWlsZC1iYWNrZW5kJzogJ3BvZXRyeS5jb3JlLm1hc29ucnkuYXBpJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ3Rvb2wnOiB7XG4gICAgICAgICAgcG9ldHJ5OiB7XG4gICAgICAgICAgICAnbmFtZSc6IG9wdGlvbnMubmFtZSxcbiAgICAgICAgICAgICd2ZXJzaW9uJzogb3B0aW9ucy52ZXJzaW9uLFxuICAgICAgICAgICAgJ2Rlc2NyaXB0aW9uJzogb3B0aW9ucy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICdsaWNlbnNlJzogb3B0aW9ucy5saWNlbnNlLFxuICAgICAgICAgICAgJ2F1dGhvcnMnOiBvcHRpb25zLmF1dGhvcnMsXG4gICAgICAgICAgICAnbWFpbnRhaW5lcnMnOiBvcHRpb25zLm1haW50YWluZXJzLFxuICAgICAgICAgICAgJ3JlYWRtZSc6IG9wdGlvbnMucmVhZG1lLFxuICAgICAgICAgICAgJ2hvbWVwYWdlJzogb3B0aW9ucy5ob21lcGFnZSxcbiAgICAgICAgICAgICdyZXBvc2l0b3J5Jzogb3B0aW9ucy5yZXBvc2l0b3J5LFxuICAgICAgICAgICAgJ2RvY3VtZW50YXRpb24nOiBvcHRpb25zLmRvY3VtZW50YXRpb24sXG4gICAgICAgICAgICAna2V5d29yZHMnOiBvcHRpb25zLmtleXdvcmRzLFxuICAgICAgICAgICAgJ2NsYXNzaWZpZXJzJzogb3B0aW9ucy5jbGFzc2lmaWVycyxcbiAgICAgICAgICAgICdwYWNrYWdlcyc6IG9wdGlvbnMucGFja2FnZXMsXG4gICAgICAgICAgICAnaW5jbHVkZSc6IG9wdGlvbnMuaW5jbHVkZSxcbiAgICAgICAgICAgICdleGNsdWRlJzogb3B0aW9ucy5leGNsdWRlLFxuICAgICAgICAgICAgJ2RlcGVuZGVuY2llcyc6IG9wdGlvbnMuZGVwZW5kZW5jaWVzLFxuICAgICAgICAgICAgJ2Rldi1kZXBlbmRlbmNpZXMnOiBvcHRpb25zLmRldkRlcGVuZGVuY2llcyxcbiAgICAgICAgICAgICdzY3JpcHRzJzogb3B0aW9ucy5zY3JpcHRzLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=