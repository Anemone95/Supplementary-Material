"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectType = exports.Project = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path = require("path");
const cleanup_1 = require("./cleanup");
const clobber_1 = require("./clobber");
const deps_1 = require("./deps");
const file_1 = require("./file");
const github_1 = require("./github");
const gitpod_1 = require("./gitpod");
const ignore_file_1 = require("./ignore-file");
const json_1 = require("./json");
const logger_1 = require("./logger");
const object_file_1 = require("./object-file");
const readme_1 = require("./readme");
const tasks_1 = require("./tasks/tasks");
const util_1 = require("./util");
const vscode_1 = require("./vscode");
/**
 * (experimental) Base project.
 *
 * @experimental
 */
class Project {
    /**
     * @experimental
     */
    constructor(options) {
        var _b, _c, _d, _e;
        this._components = new Array();
        this.subprojects = new Array();
        this.tips = new Array();
        // https://github.com/aws/jsii/issues/2406
        process.stdout.write = (...args) => process.stderr.write.apply(process.stderr, args);
        this.jsiiFqn = options.jsiiFqn;
        delete options.jsiiFqn; // remove so it's not included in projenrc
        this.name = options.name;
        this.parent = options.parent;
        this.excludeFromCleanup = [];
        this.projectType = (_b = options.projectType) !== null && _b !== void 0 ? _b : ProjectType.UNKNOWN;
        if (this.parent && options.outdir && path.isAbsolute(options.outdir)) {
            throw new Error('"outdir" must be a relative path');
        }
        let outdir;
        if (options.parent) {
            if (!options.outdir) {
                throw new Error('"outdir" must be specified for subprojects');
            }
            outdir = path.join(options.parent.outdir, options.outdir);
        }
        else {
            outdir = (_c = options.outdir) !== null && _c !== void 0 ? _c : '.';
        }
        this.outdir = path.resolve(outdir);
        this.root = this.parent ? this.parent.root : this;
        // must happen after this.outdir, this.parent and this.root are initialized
        (_d = this.parent) === null || _d === void 0 ? void 0 : _d._addSubProject(this);
        // ------------------------------------------------------------------------
        this.gitignore = new ignore_file_1.IgnoreFile(this, '.gitignore');
        this.gitignore.exclude('node_modules/'); // created by running `npx projen`
        // oh no: tasks depends on gitignore so it has to be initialized after
        // smells like dep injectionn but god forbid.
        this.tasks = new tasks_1.Tasks(this);
        this.deps = new deps_1.Dependencies(this);
        this.logger = new logger_1.Logger(this, options.logging);
        // we only allow these global services to be used in root projects
        this.github = !this.parent ? new github_1.GitHub(this) : undefined;
        this.vscode = !this.parent ? new vscode_1.VsCode(this) : undefined;
        this.gitpod = options.gitpod ? new gitpod_1.Gitpod(this) : undefined;
        this.devContainer = options.devContainer ? new vscode_1.DevContainer(this) : undefined;
        if ((_e = options.clobber) !== null && _e !== void 0 ? _e : true) {
            new clobber_1.Clobber(this);
        }
        new readme_1.SampleReadme(this, options.readme);
    }
    /**
     * (experimental) Returns all the components within this project.
     *
     * @experimental
     */
    get components() {
        return [...this._components];
    }
    /**
     * (experimental) All files in this project.
     *
     * @experimental
     */
    get files() {
        const isFile = (c) => c instanceof file_1.FileBase;
        return this._components.filter(isFile).sort((f1, f2) => f1.path.localeCompare(f2.path));
    }
    /**
     * (experimental) Adds a new task to this project.
     *
     * This will fail if the project already has
     * a task with this name.
     *
     * @param name The task name to add.
     * @param props Task properties.
     * @experimental
     */
    addTask(name, props = {}) {
        return this.tasks.addTask(name, props);
    }
    /**
     * (experimental) Finds a file at the specified relative path within this project and all its subprojects.
     *
     * @param filePath The file path.
     * @returns a `FileBase` or undefined if there is no file in that path
     * @experimental
     */
    tryFindFile(filePath) {
        const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(this.outdir, filePath);
        for (const file of this.files) {
            if (absolute === file.absolutePath) {
                return file;
            }
        }
        for (const child of this.subprojects) {
            const file = child.tryFindFile(absolute);
            if (file) {
                return file;
            }
        }
        return undefined;
    }
    /**
     * (deprecated) Finds a json file by name.
     *
     * @param filePath The file path.
     * @deprecated use `tryFindObjectFile`
     */
    tryFindJsonFile(filePath) {
        const file = this.tryFindObjectFile(filePath);
        if (!file) {
            return undefined;
        }
        if (!(file instanceof json_1.JsonFile)) {
            throw new Error(`found file ${filePath} but it is not a JsonFile. got: ${file.constructor.name}`);
        }
        return file;
    }
    /**
     * (experimental) Finds an object file (like JsonFile, YamlFile, etc.) by name.
     *
     * @param filePath The file path.
     * @experimental
     */
    tryFindObjectFile(filePath) {
        const file = this.tryFindFile(filePath);
        if (!file) {
            return undefined;
        }
        if (!(file instanceof object_file_1.ObjectFile)) {
            throw new Error(`found file ${filePath} but it is not a ObjectFile. got: ${file.constructor.name}`);
        }
        return file;
    }
    /**
     * (deprecated) Prints a "tip" message during synthesis.
     *
     * @param message The message.
     * @deprecated - use `project.logger.info(message)` to show messages during synthesis
     */
    addTip(message) {
        this.tips.push(message);
    }
    /**
     * (experimental) Exclude the matching files from pre-synth cleanup.
     *
     * Can be used when, for example, some
     * source files include the projen marker and we don't want them to be erased during synth.
     *
     * @param globs The glob patterns to match.
     * @experimental
     */
    addExcludeFromCleanup(...globs) {
        this.excludeFromCleanup.push(...globs);
    }
    /**
     * (experimental) Synthesize all project files into `outdir`.
     *
     * 1. Call "this.preSynthesize()"
     * 2. Delete all generated files
     * 3. Synthesize all sub-projects
     * 4. Synthesize all components of this project
     * 5. Call "postSynthesize()" for all components of this project
     * 6. Call "this.postSynthesize()"
     *
     * @experimental
     */
    synth() {
        const outdir = this.outdir;
        this.logger.info('Synthesizing project...');
        this.preSynthesize();
        for (const comp of this._components) {
            comp.preSynthesize();
        }
        // we exclude all subproject directories to ensure that when subproject.synth()
        // gets called below after cleanup(), subproject generated files are left intact
        for (const subproject of this.subprojects) {
            this.addExcludeFromCleanup(subproject.outdir + '/**');
        }
        // delete all generated files before we start synthesizing new ones
        cleanup_1.cleanup(outdir, this.excludeFromCleanup);
        for (const subproject of this.subprojects) {
            subproject.synth();
        }
        for (const comp of this._components) {
            comp.synthesize();
        }
        if (!util_1.isTruthy(process.env.PROJEN_DISABLE_POST)) {
            for (const comp of this._components) {
                comp.postSynthesize();
            }
            // project-level hook
            this.postSynthesize();
        }
        this.logger.info('Synthesis complete');
    }
    /**
     * (experimental) Called before all components are synthesized.
     *
     * @experimental
     */
    preSynthesize() { }
    /**
     * (experimental) Called after all components are synthesized.
     *
     * Order is *not* guaranteed.
     *
     * @experimental
     */
    postSynthesize() { }
    /**
     * Adds a component to the project.
     * @internal
     */
    _addComponent(component) {
        this._components.push(component);
    }
    /**
     * Adds a sub-project to this project.
     *
     * This is automatically called when a new project is created with `parent`
     * pointing to this project, so there is no real need to call this manually.
     *
     * @param sub-project The child project to add.
     * @internal
     */
    _addSubProject(subproject) {
        if (subproject.parent !== this) {
            throw new Error('"parent" of child project must be this project');
        }
        // check that `outdir` is exclusive
        for (const p of this.subprojects) {
            if (path.resolve(p.outdir) === path.resolve(subproject.outdir)) {
                throw new Error(`there is already a sub-project with "outdir": ${subproject.outdir}`);
            }
        }
        this.subprojects.push(subproject);
    }
}
exports.Project = Project;
_a = JSII_RTTI_SYMBOL_1;
Project[_a] = { fqn: "projen.Project", version: "0.16.40" };
/**
 * (experimental) The name of the default task (the task executed when `projen` is run without arguments).
 *
 * Normally
 * this task should synthesize the project files.
 *
 * @experimental
 */
Project.DEFAULT_TASK = 'default';
/**
 * (experimental) Which type of project this is.
 *
 * @experimental
 */
var ProjectType;
(function (ProjectType) {
    ProjectType["UNKNOWN"] = "unknown";
    ProjectType["LIB"] = "lib";
    ProjectType["APP"] = "app";
})(ProjectType = exports.ProjectType || (exports.ProjectType = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wcm9qZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkJBQTZCO0FBQzdCLHVDQUFvQztBQUNwQyx1Q0FBb0M7QUFFcEMsaUNBQXNDO0FBQ3RDLGlDQUFrQztBQUNsQyxxQ0FBa0M7QUFDbEMscUNBQWtDO0FBQ2xDLCtDQUEyQztBQUMzQyxpQ0FBa0M7QUFDbEMscUNBQWlEO0FBQ2pELCtDQUEyQztBQUMzQyxxQ0FBMkQ7QUFFM0QseUNBQXNDO0FBQ3RDLGlDQUFrQztBQUNsQyxxQ0FBZ0Q7Ozs7OztBQThFaEQsTUFBYSxPQUFPOzs7O0lBdUZsQixZQUFZLE9BQXVCOztRQUxsQixnQkFBVyxHQUFHLElBQUksS0FBSyxFQUFhLENBQUM7UUFDckMsZ0JBQVcsR0FBRyxJQUFJLEtBQUssRUFBVyxDQUFDO1FBQ25DLFNBQUksR0FBRyxJQUFJLEtBQUssRUFBVSxDQUFDO1FBSTFDLDBDQUEwQztRQUMxQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBUyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUxRixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDL0IsT0FBUSxPQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsMENBQTBDO1FBRTNFLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDN0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxTQUFHLE9BQU8sQ0FBQyxXQUFXLG1DQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFF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QUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDaEMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDOUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBaUQsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDdkY7U0FDRjtRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7O0FBdFZILDBCQXVWQzs7Ozs7Ozs7Ozs7QUFsVndCLG9CQUFZLEdBQUcsU0FBUyxDQUFDOzs7Ozs7QUF3VmxELElBQVksV0FpQlg7QUFqQkQsV0FBWSxXQUFXO0lBSXJCLGtDQUFtQixDQUFBO0lBTW5CLDBCQUFXLENBQUE7SUFNWCwwQkFBVyxDQUFBO0FBQ2IsQ0FBQyxFQWpCVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQWlCdEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgY2xlYW51cCB9IGZyb20gJy4vY2xlYW51cCc7XG5pbXBvcnQgeyBDbG9iYmVyIH0gZnJvbSAnLi9jbG9iYmVyJztcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50JztcbmltcG9ydCB7IERlcGVuZGVuY2llcyB9IGZyb20gJy4vZGVwcyc7XG5pbXBvcnQgeyBGaWxlQmFzZSB9IGZyb20gJy4vZmlsZSc7XG5pbXBvcnQgeyBHaXRIdWIgfSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQgeyBHaXRwb2QgfSBmcm9tICcuL2dpdHBvZCc7XG5pbXBvcnQgeyBJZ25vcmVGaWxlIH0gZnJvbSAnLi9pZ25vcmUtZmlsZSc7XG5pbXBvcnQgeyBKc29uRmlsZSB9IGZyb20gJy4vanNvbic7XG5pbXBvcnQgeyBMb2dnZXIsIExvZ2dlck9wdGlvbnMgfSBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgeyBPYmplY3RGaWxlIH0gZnJvbSAnLi9vYmplY3QtZmlsZSc7XG5pbXBvcnQgeyBTYW1wbGVSZWFkbWUsIFNhbXBsZVJlYWRtZVByb3BzIH0gZnJvbSAnLi9yZWFkbWUnO1xuaW1wb3J0IHsgVGFza09wdGlvbnMgfSBmcm9tICcuL3Rhc2tzJztcbmltcG9ydCB7IFRhc2tzIH0gZnJvbSAnLi90YXNrcy90YXNrcyc7XG5pbXBvcnQgeyBpc1RydXRoeSB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBWc0NvZGUsIERldkNvbnRhaW5lciB9IGZyb20gJy4vdnNjb2RlJztcblxuZXhwb3J0IGludGVyZmFjZSBQcm9qZWN0T3B0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcGFyZW50PzogUHJvamVjdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IG91dGRpcj86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGdpdHBvZD86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGRldkNvbnRhaW5lcj86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGNsb2JiZXI/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHJlYWRtZT86IFNhbXBsZVJlYWRtZVByb3BzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBwcm9qZWN0VHlwZT86IFByb2plY3RUeXBlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbG9nZ2luZz86IExvZ2dlck9wdGlvbnM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGpzaWlGcW4/OiBzdHJpbmc7XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgUHJvamVjdCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9UQVNLID0gJ2RlZmF1bHQnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBnaXRpZ25vcmU6IElnbm9yZUZpbGU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBwYXJlbnQ/OiBQcm9qZWN0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgb3V0ZGlyOiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSByb290OiBQcm9qZWN0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgZ2l0aHViOiBHaXRIdWIgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSB2c2NvZGU6IFZzQ29kZSB8IHVuZGVmaW5lZDtcblxuICBwdWJsaWMgcmVhZG9ubHkgdGFza3M6IFRhc2tzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGdpdHBvZDogR2l0cG9kIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgZGV2Q29udGFpbmVyOiBEZXZDb250YWluZXIgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHByb2plY3RUeXBlOiBQcm9qZWN0VHlwZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGRlcHM6IERlcGVuZGVuY2llcztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGxvZ2dlcjogTG9nZ2VyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBqc2lpRnFuPzogc3RyaW5nO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2NvbXBvbmVudHMgPSBuZXcgQXJyYXk8Q29tcG9uZW50PigpO1xuICBwcml2YXRlIHJlYWRvbmx5IHN1YnByb2plY3RzID0gbmV3IEFycmF5PFByb2plY3Q+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgdGlwcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgZXhjbHVkZUZyb21DbGVhbnVwOiBzdHJpbmdbXTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQcm9qZWN0T3B0aW9ucykge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hd3MvanNpaS9pc3N1ZXMvMjQwNlxuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlID0gKC4uLmFyZ3M6IGFueSkgPT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUuYXBwbHkocHJvY2Vzcy5zdGRlcnIsIGFyZ3MpO1xuXG4gICAgdGhpcy5qc2lpRnFuID0gb3B0aW9ucy5qc2lpRnFuO1xuICAgIGRlbGV0ZSAob3B0aW9ucyBhcyBhbnkpLmpzaWlGcW47IC8vIHJlbW92ZSBzbyBpdCdzIG5vdCBpbmNsdWRlZCBpbiBwcm9qZW5yY1xuXG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgIHRoaXMucGFyZW50ID0gb3B0aW9ucy5wYXJlbnQ7XG4gICAgdGhpcy5leGNsdWRlRnJvbUNsZWFudXAgPSBbXTtcbiAgICB0aGlzLnByb2plY3RUeXBlID0gb3B0aW9ucy5wcm9qZWN0VHlwZSA/PyBQcm9qZWN0VHlwZS5VTktOT1dOO1xuXG4gICAgaWYgKHRoaXMucGFyZW50ICYmIG9wdGlvbnMub3V0ZGlyICYmIHBhdGguaXNBYnNvbHV0ZShvcHRpb25zLm91dGRpcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignXCJvdXRkaXJcIiBtdXN0IGJlIGEgcmVsYXRpdmUgcGF0aCcpO1xuICAgIH1cblxuICAgIGxldCBvdXRkaXI7XG4gICAgaWYgKG9wdGlvbnMucGFyZW50KSB7XG4gICAgICBpZiAoIW9wdGlvbnMub3V0ZGlyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignXCJvdXRkaXJcIiBtdXN0IGJlIHNwZWNpZmllZCBmb3Igc3VicHJvamVjdHMnKTtcbiAgICAgIH1cblxuICAgICAgb3V0ZGlyID0gcGF0aC5qb2luKG9wdGlvbnMucGFyZW50Lm91dGRpciwgb3B0aW9ucy5vdXRkaXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRkaXIgPSBvcHRpb25zLm91dGRpciA/PyAnLic7XG4gICAgfVxuXG4gICAgdGhpcy5vdXRkaXIgPSBwYXRoLnJlc29sdmUob3V0ZGlyKTtcblxuICAgIHRoaXMucm9vdCA9IHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQucm9vdCA6IHRoaXM7XG5cbiAgICAvLyBtdXN0IGhhcHBlbiBhZnRlciB0aGlzLm91dGRpciwgdGhpcy5wYXJlbnQgYW5kIHRoaXMucm9vdCBhcmUgaW5pdGlhbGl6ZWRcbiAgICB0aGlzLnBhcmVudD8uX2FkZFN1YlByb2plY3QodGhpcyk7XG5cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHRoaXMuZ2l0aWdub3JlID0gbmV3IElnbm9yZUZpbGUodGhpcywgJy5naXRpZ25vcmUnKTtcbiAgICB0aGlzLmdpdGlnbm9yZS5leGNsdWRlKCdub2RlX21vZHVsZXMvJyk7IC8vIGNyZWF0ZWQgYnkgcnVubmluZyBgbnB4IHByb2plbmBcblxuICAgIC8vIG9oIG5vOiB0YXNrcyBkZXBlbmRzIG9uIGdpdGlnbm9yZSBzbyBpdCBoYXMgdG8gYmUgaW5pdGlhbGl6ZWQgYWZ0ZXJcbiAgICAvLyBzbWVsbHMgbGlrZSBkZXAgaW5qZWN0aW9ubiBidXQgZ29kIGZvcmJpZC5cbiAgICB0aGlzLnRhc2tzID0gbmV3IFRhc2tzKHRoaXMpO1xuICAgIHRoaXMuZGVwcyA9IG5ldyBEZXBlbmRlbmNpZXModGhpcyk7XG5cbiAgICB0aGlzLmxvZ2dlciA9IG5ldyBMb2dnZXIodGhpcywgb3B0aW9ucy5sb2dnaW5nKTtcblxuICAgIC8vIHdlIG9ubHkgYWxsb3cgdGhlc2UgZ2xvYmFsIHNlcnZpY2VzIHRvIGJlIHVzZWQgaW4gcm9vdCBwcm9qZWN0c1xuICAgIHRoaXMuZ2l0aHViID0gIXRoaXMucGFyZW50ID8gbmV3IEdpdEh1Yih0aGlzKSA6IHVuZGVmaW5lZDtcbiAgICB0aGlzLnZzY29kZSA9ICF0aGlzLnBhcmVudCA/IG5ldyBWc0NvZGUodGhpcykgOiB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLmdpdHBvZCA9IG9wdGlvbnMuZ2l0cG9kID8gbmV3IEdpdHBvZCh0aGlzKSA6IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRldkNvbnRhaW5lciA9IG9wdGlvbnMuZGV2Q29udGFpbmVyID8gbmV3IERldkNvbnRhaW5lcih0aGlzKSA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChvcHRpb25zLmNsb2JiZXIgPz8gdHJ1ZSkge1xuICAgICAgbmV3IENsb2JiZXIodGhpcyk7XG4gICAgfVxuXG4gICAgbmV3IFNhbXBsZVJlYWRtZSh0aGlzLCBvcHRpb25zLnJlYWRtZSk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgZ2V0IGNvbXBvbmVudHMoKSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9jb21wb25lbnRzXTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBnZXQgZmlsZXMoKTogRmlsZUJhc2VbXSB7XG4gICAgY29uc3QgaXNGaWxlID0gKGM6IENvbXBvbmVudCk6IGMgaXMgRmlsZUJhc2UgPT4gYyBpbnN0YW5jZW9mIEZpbGVCYXNlO1xuICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRzLmZpbHRlcihpc0ZpbGUpLnNvcnQoKGYxLCBmMikgPT4gZjEucGF0aC5sb2NhbGVDb21wYXJlKGYyLnBhdGgpKTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGRUYXNrKG5hbWU6IHN0cmluZywgcHJvcHM6IFRhc2tPcHRpb25zID0geyB9KSB7XG4gICAgcmV0dXJuIHRoaXMudGFza3MuYWRkVGFzayhuYW1lLCBwcm9wcyk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHRyeUZpbmRGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBGaWxlQmFzZSB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgYWJzb2x1dGUgPSBwYXRoLmlzQWJzb2x1dGUoZmlsZVBhdGgpID8gZmlsZVBhdGggOiBwYXRoLnJlc29sdmUodGhpcy5vdXRkaXIsIGZpbGVQYXRoKTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgdGhpcy5maWxlcykge1xuICAgICAgaWYgKGFic29sdXRlID09PSBmaWxlLmFic29sdXRlUGF0aCkge1xuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIHRoaXMuc3VicHJvamVjdHMpIHtcbiAgICAgIGNvbnN0IGZpbGUgPSBjaGlsZC50cnlGaW5kRmlsZShhYnNvbHV0ZSk7XG4gICAgICBpZiAoZmlsZSkge1xuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgdHJ5RmluZEpzb25GaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBKc29uRmlsZSB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZmlsZSA9IHRoaXMudHJ5RmluZE9iamVjdEZpbGUoZmlsZVBhdGgpO1xuICAgIGlmICghZmlsZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoIShmaWxlIGluc3RhbmNlb2YgSnNvbkZpbGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGZvdW5kIGZpbGUgJHtmaWxlUGF0aH0gYnV0IGl0IGlzIG5vdCBhIEpzb25GaWxlLiBnb3Q6ICR7ZmlsZS5jb25zdHJ1Y3Rvci5uYW1lfWApO1xuICAgIH1cblxuICAgIHJldHVybiBmaWxlO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgdHJ5RmluZE9iamVjdEZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IE9iamVjdEZpbGUgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGZpbGUgPSB0aGlzLnRyeUZpbmRGaWxlKGZpbGVQYXRoKTtcbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIE9iamVjdEZpbGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGZvdW5kIGZpbGUgJHtmaWxlUGF0aH0gYnV0IGl0IGlzIG5vdCBhIE9iamVjdEZpbGUuIGdvdDogJHtmaWxlLmNvbnN0cnVjdG9yLm5hbWV9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbGU7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGRUaXAobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgdGhpcy50aXBzLnB1c2gobWVzc2FnZSk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkRXhjbHVkZUZyb21DbGVhbnVwKC4uLmdsb2JzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuZXhjbHVkZUZyb21DbGVhbnVwLnB1c2goLi4uZ2xvYnMpO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBzeW50aCgpOiB2b2lkIHtcbiAgICBjb25zdCBvdXRkaXIgPSB0aGlzLm91dGRpcjtcbiAgICB0aGlzLmxvZ2dlci5pbmZvKCdTeW50aGVzaXppbmcgcHJvamVjdC4uLicpO1xuXG4gICAgdGhpcy5wcmVTeW50aGVzaXplKCk7XG5cbiAgICBmb3IgKGNvbnN0IGNvbXAgb2YgdGhpcy5fY29tcG9uZW50cykge1xuICAgICAgY29tcC5wcmVTeW50aGVzaXplKCk7XG4gICAgfVxuXG4gICAgLy8gd2UgZXhjbHVkZSBhbGwgc3VicHJvamVjdCBkaXJlY3RvcmllcyB0byBlbnN1cmUgdGhhdCB3aGVuIHN1YnByb2plY3Quc3ludGgoKVxuICAgIC8vIGdldHMgY2FsbGVkIGJlbG93IGFmdGVyIGNsZWFudXAoKSwgc3VicHJvamVjdCBnZW5lcmF0ZWQgZmlsZXMgYXJlIGxlZnQgaW50YWN0XG4gICAgZm9yIChjb25zdCBzdWJwcm9qZWN0IG9mIHRoaXMuc3VicHJvamVjdHMpIHtcbiAgICAgIHRoaXMuYWRkRXhjbHVkZUZyb21DbGVhbnVwKHN1YnByb2plY3Qub3V0ZGlyICsgJy8qKicpO1xuICAgIH1cblxuICAgIC8vIGRlbGV0ZSBhbGwgZ2VuZXJhdGVkIGZpbGVzIGJlZm9yZSB3ZSBzdGFydCBzeW50aGVzaXppbmcgbmV3IG9uZXNcbiAgICBjbGVhbnVwKG91dGRpciwgdGhpcy5leGNsdWRlRnJvbUNsZWFudXApO1xuXG4gICAgZm9yIChjb25zdCBzdWJwcm9qZWN0IG9mIHRoaXMuc3VicHJvamVjdHMpIHtcbiAgICAgIHN1YnByb2plY3Quc3ludGgoKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGNvbXAgb2YgdGhpcy5fY29tcG9uZW50cykge1xuICAgICAgY29tcC5zeW50aGVzaXplKCk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1RydXRoeShwcm9jZXNzLmVudi5QUk9KRU5fRElTQUJMRV9QT1NUKSkge1xuICAgICAgZm9yIChjb25zdCBjb21wIG9mIHRoaXMuX2NvbXBvbmVudHMpIHtcbiAgICAgICAgY29tcC5wb3N0U3ludGhlc2l6ZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBwcm9qZWN0LWxldmVsIGhvb2tcbiAgICAgIHRoaXMucG9zdFN5bnRoZXNpemUoKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlci5pbmZvKCdTeW50aGVzaXMgY29tcGxldGUnKTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcHJlU3ludGhlc2l6ZSgpIHt9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHBvc3RTeW50aGVzaXplKCkge31cblxuICAvKipcbiAgICogQWRkcyBhIGNvbXBvbmVudCB0byB0aGUgcHJvamVjdC5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBwdWJsaWMgX2FkZENvbXBvbmVudChjb21wb25lbnQ6IENvbXBvbmVudCkge1xuICAgIHRoaXMuX2NvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBzdWItcHJvamVjdCB0byB0aGlzIHByb2plY3QuXG4gICAqXG4gICAqIFRoaXMgaXMgYXV0b21hdGljYWxseSBjYWxsZWQgd2hlbiBhIG5ldyBwcm9qZWN0IGlzIGNyZWF0ZWQgd2l0aCBgcGFyZW50YFxuICAgKiBwb2ludGluZyB0byB0aGlzIHByb2plY3QsIHNvIHRoZXJlIGlzIG5vIHJlYWwgbmVlZCB0byBjYWxsIHRoaXMgbWFudWFsbHkuXG4gICAqXG4gICAqIEBwYXJhbSBzdWItcHJvamVjdCBUaGUgY2hpbGQgcHJvamVjdCB0byBhZGQuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX2FkZFN1YlByb2plY3Qoc3VicHJvamVjdDogUHJvamVjdCkge1xuICAgIGlmIChzdWJwcm9qZWN0LnBhcmVudCAhPT0gdGhpcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdcInBhcmVudFwiIG9mIGNoaWxkIHByb2plY3QgbXVzdCBiZSB0aGlzIHByb2plY3QnKTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayB0aGF0IGBvdXRkaXJgIGlzIGV4Y2x1c2l2ZVxuICAgIGZvciAoY29uc3QgcCBvZiB0aGlzLnN1YnByb2plY3RzKSB7XG4gICAgICBpZiAocGF0aC5yZXNvbHZlKHAub3V0ZGlyKSA9PT0gcGF0aC5yZXNvbHZlKHN1YnByb2plY3Qub3V0ZGlyKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHRoZXJlIGlzIGFscmVhZHkgYSBzdWItcHJvamVjdCB3aXRoIFwib3V0ZGlyXCI6ICR7c3VicHJvamVjdC5vdXRkaXJ9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zdWJwcm9qZWN0cy5wdXNoKHN1YnByb2plY3QpO1xuICB9XG59XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBlbnVtIFByb2plY3RUeXBlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIFVOS05PV04gPSAndW5rbm93bicsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgTElCID0gJ2xpYicsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgQVBQID0gJ2FwcCdcbn1cbiJdfQ==