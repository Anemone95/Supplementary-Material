"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NpmAccess = exports.NodePackageManager = exports.NpmTaskExecution = exports.NodePackage = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path_1 = require("path");
const url_1 = require("url");
const fs_extra_1 = require("fs-extra");
const semver = require("semver");
const _resolve_1 = require("./_resolve");
const component_1 = require("./component");
const deps_1 = require("./deps");
const json_1 = require("./json");
const util_1 = require("./util");
const UNLICENSED = 'UNLICENSED';
const DEFAULT_NPM_REGISTRY_URL = 'https://registry.npmjs.org/';
const DEFAULT_NPM_TAG = 'latest';
/**
 * (experimental) Represents the npm `package.json` file.
 *
 * @experimental
 */
class NodePackage extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options = {}) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        super(project);
        this.keywords = new Set();
        this.bin = {};
        this.scripts = {};
        this.engines = {};
        this.packageName = (_b = options.packageName) !== null && _b !== void 0 ? _b : project.name;
        this.npmTaskExecution = (_c = options.npmTaskExecution) !== null && _c !== void 0 ? _c : NpmTaskExecution.PROJEN;
        this.projenCommand = (_d = options.projenCommand) !== null && _d !== void 0 ? _d : 'npx projen';
        this.peerDependencyOptions = (_e = options.peerDependencyOptions) !== null && _e !== void 0 ? _e : {};
        this.allowLibraryDependencies = (_f = options.allowLibraryDependencies) !== null && _f !== void 0 ? _f : true;
        this.packageManager = (_g = options.packageManager) !== null && _g !== void 0 ? _g : NodePackageManager.YARN;
        this.entrypoint = (_h = options.entrypoint) !== null && _h !== void 0 ? _h : 'lib/index.js';
        const { npmDistTag, npmAccess, npmRegistry, npmRegistryUrl } = this.parseNpmOptions(options);
        this.npmDistTag = npmDistTag;
        this.npmAccess = npmAccess;
        this.npmRegistry = npmRegistry;
        this.npmRegistryUrl = npmRegistryUrl;
        this.processDeps(options);
        // empty objects are here to preserve order for backwards compatibility
        this.manifest = {
            name: this.packageName,
            description: options.description,
            repository: !options.repository ? undefined : {
                type: 'git',
                url: options.repository,
                directory: options.repositoryDirectory,
            },
            bin: () => this.renderBin(),
            scripts: () => this.renderScripts(),
            author: this.renderAuthor(options),
            devDependencies: {},
            peerDependencies: {},
            dependencies: {},
            bundledDependencies: [],
            keywords: () => this.renderKeywords(),
            engines: () => this.renderEngines(),
            main: this.entrypoint !== '' ? this.entrypoint : undefined,
            license: () => { var _b; return (_b = this.license) !== null && _b !== void 0 ? _b : UNLICENSED; },
            version: '0.0.0',
            homepage: options.homepage,
            publishConfig: () => this.renderPublishConfig(),
        };
        // override any scripts from options (if specified)
        for (const [cmdname, shell] of Object.entries((_j = options.scripts) !== null && _j !== void 0 ? _j : {})) {
            project.addTask(cmdname, { exec: shell });
        }
        new json_1.JsonFile(this.project, 'package.json', {
            obj: this.manifest,
            marker: true,
            readonly: false,
        });
        this.addKeywords(...(_k = options.keywords) !== null && _k !== void 0 ? _k : []);
        this.addBin((_l = options.bin) !== null && _l !== void 0 ? _l : {});
        // automatically add all executable files under "bin"
        if ((_m = options.autoDetectBin) !== null && _m !== void 0 ? _m : true) {
            this.autoDiscoverBinaries();
        }
        // node version
        this.minNodeVersion = options.minNodeVersion;
        this.maxNodeVersion = options.maxNodeVersion;
        this.addNodeEngine();
        // license
        if ((_o = options.licensed) !== null && _o !== void 0 ? _o : true) {
            this.license = (_p = options.license) !== null && _p !== void 0 ? _p : 'Apache-2.0';
        }
    }
    /**
     * (experimental) Defines normal dependencies.
     *
     * @param deps Names modules to install.
     * @experimental
     */
    addDeps(...deps) {
        for (const dep of deps) {
            this.project.deps.addDependency(dep, deps_1.DependencyType.RUNTIME);
        }
    }
    /**
     * (experimental) Defines development/test dependencies.
     *
     * @param deps Names modules to install.
     * @experimental
     */
    addDevDeps(...deps) {
        for (const dep of deps) {
            this.project.deps.addDependency(dep, deps_1.DependencyType.BUILD);
        }
    }
    /**
     * (experimental) Defines peer dependencies.
     *
     * When adding peer dependencies, a devDependency will also be added on the
     * pinned version of the declared peer. This will ensure that you are testing
     * your code against the minimum version required from your consumers.
     *
     * @param deps Names modules to install.
     * @experimental
     */
    addPeerDeps(...deps) {
        if (Object.keys(deps).length && !this.allowLibraryDependencies) {
            throw new Error(`cannot add peer dependencies to an APP project: ${Object.keys(deps).join(',')}`);
        }
        for (const dep of deps) {
            this.project.deps.addDependency(dep, deps_1.DependencyType.PEER);
        }
    }
    /**
     * (experimental) Defines bundled dependencies.
     *
     * Bundled dependencies will be added as normal dependencies as well as to the
     * `bundledDependencies` section of your `package.json`.
     *
     * @param deps Names modules to install.
     * @experimental
     */
    addBundledDeps(...deps) {
        if (deps.length && !this.allowLibraryDependencies) {
            throw new Error(`cannot add bundled dependencies to an APP project: ${deps.join(',')}`);
        }
        for (const dep of deps) {
            this.project.deps.addDependency(dep, deps_1.DependencyType.BUNDLED);
        }
    }
    /**
     * (experimental) Adds an `engines` requirement to your package.
     *
     * @param engine The engine (e.g. `node`).
     * @param version The semantic version requirement (e.g. `^10`).
     * @experimental
     */
    addEngine(engine, version) {
        this.engines[engine] = version;
    }
    /**
     * (experimental) Adds keywords to package.json (deduplicated).
     *
     * @param keywords The keywords to add.
     * @experimental
     */
    addKeywords(...keywords) {
        for (const k of keywords) {
            this.keywords.add(k);
        }
    }
    /**
     * @experimental
     */
    addBin(bins) {
        for (const [k, v] of Object.entries(bins)) {
            this.bin[k] = v;
        }
    }
    /**
     * (experimental) Replaces the contents of an npm package.json script.
     *
     * @param name The script name.
     * @param command The command to execute.
     * @experimental
     */
    setScript(name, command) {
        this.scripts[name] = [command];
    }
    /**
     * (experimental) Removes the npm script (always successful).
     *
     * @param name The name of the script.
     * @experimental
     */
    removeScript(name) {
        delete this.scripts[name];
    }
    /**
     * (experimental) Indicates if a script by the name name is defined.
     *
     * @param name The name of the script.
     * @experimental
     */
    hasScript(name) {
        return name in this.scripts;
    }
    /**
     * (experimental) Directly set fields in `package.json`.
     *
     * @param name field name.
     * @param value field value.
     * @experimental
     * @escape true
     */
    addField(name, value) {
        this.manifest[name] = value;
    }
    /**
     * (experimental) Sets the package version.
     *
     * @param version Package version.
     * @experimental
     */
    addVersion(version) {
        this.manifest.version = version;
    }
    /**
     * (experimental) Returns the command to execute in order to install all dependencies (always frozen).
     *
     * @experimental
     */
    get installCommand() {
        return this.renderInstallCommand(true);
    }
    // ---------------------------------------------------------------------------------------
    /**
     * (experimental) Called before synthesis.
     *
     * @experimental
     */
    preSynthesize() {
        super.preSynthesize();
        this._renderedDeps = this.renderDependencies();
    }
    /**
     * (experimental) Called after synthesis.
     *
     * Order is *not* guaranteed.
     *
     * @experimental
     */
    postSynthesize() {
        super.postSynthesize();
        const outdir = this.project.outdir;
        // now we run `yarn install`, but before we do that, remove the
        // `node_modules/projen` symlink so that yarn won't hate us.
        const projenModule = path_1.resolve('node_modules', 'projen');
        try {
            if (fs_extra_1.lstatSync(projenModule).isSymbolicLink()) {
                fs_extra_1.unlinkSync(projenModule);
            }
        }
        catch (e) { }
        util_1.exec(this.renderInstallCommand(util_1.isTruthy(process.env.CI)), { cwd: outdir });
        this.resolveDepsAndWritePackageJson(outdir);
    }
    // -------------------------------------------------------------------------------------------
    parseNpmOptions(options) {
        var _b, _c;
        let npmRegistryUrl = options.npmRegistryUrl;
        if (options.npmRegistry) {
            if (npmRegistryUrl) {
                throw new Error('cannot use the deprecated "npmRegistry" together with "npmRegistryUrl". please use "npmRegistryUrl" instead.');
            }
            npmRegistryUrl = `https://${options.npmRegistry}`;
        }
        const npmr = url_1.parse(npmRegistryUrl !== null && npmRegistryUrl !== void 0 ? npmRegistryUrl : DEFAULT_NPM_REGISTRY_URL);
        if (!npmr || !npmr.hostname || !npmr.href) {
            throw new Error(`unable to determine npm registry host from url ${npmRegistryUrl}. Is this really a URL?`);
        }
        const npmAccess = (_b = options.npmAccess) !== null && _b !== void 0 ? _b : defaultNpmAccess(this.packageName);
        if (!isScoped(this.packageName) && npmAccess === NpmAccess.RESTRICTED) {
            throw new Error(`"npmAccess" cannot be RESTRICTED for non-scoped npm package "${this.packageName}"`);
        }
        return {
            npmDistTag: (_c = options.npmDistTag) !== null && _c !== void 0 ? _c : DEFAULT_NPM_TAG,
            npmAccess,
            npmRegistry: npmr.hostname,
            npmRegistryUrl: npmr.href,
        };
    }
    addNodeEngine() {
        if (!this.minNodeVersion && !this.maxNodeVersion) {
            return;
        }
        let nodeVersion = '';
        if (this.minNodeVersion) {
            nodeVersion += `>= ${this.minNodeVersion}`;
        }
        if (this.maxNodeVersion) {
            nodeVersion += ` <= ${this.maxNodeVersion}`;
        }
        this.addEngine('node', nodeVersion);
    }
    renderInstallCommand(frozen) {
        switch (this.packageManager) {
            case NodePackageManager.YARN:
                return [
                    'yarn install',
                    '--check-files',
                    ...frozen ? ['--frozen-lockfile'] : [],
                ].join(' ');
            case NodePackageManager.NPM:
                return frozen
                    ? 'npm ci'
                    : 'npm install';
            case NodePackageManager.PNPM:
                return [
                    'pnpm i',
                    ...frozen ? ['--frozen-lockfile'] : [],
                ].join(' ');
            default:
                throw new Error(`unexpected package manager ${this.packageManager}`);
        }
    }
    processDeps(options) {
        var _b, _c, _d, _e;
        this.addDeps(...(_b = options.deps) !== null && _b !== void 0 ? _b : []);
        this.addDevDeps(...(_c = options.devDeps) !== null && _c !== void 0 ? _c : []);
        this.addPeerDeps(...(_d = options.peerDeps) !== null && _d !== void 0 ? _d : []);
        this.addBundledDeps(...(_e = options.bundledDeps) !== null && _e !== void 0 ? _e : []);
    }
    renderDependencies() {
        var _b, _c, _d;
        const devDependencies = {};
        const peerDependencies = {};
        const dependencies = {};
        const bundledDependencies = new Array();
        // synthetic dependencies: add a pinned build dependency to ensure we are
        // testing against the minimum requirement of the peer.
        const pinned = (_b = this.peerDependencyOptions.pinnedDevDependency) !== null && _b !== void 0 ? _b : true;
        if (pinned) {
            for (const dep of this.project.deps.all.filter(d => d.type === deps_1.DependencyType.PEER)) {
                let req = dep.name;
                if (dep.version) {
                    const ver = (_c = semver.minVersion(dep.version)) === null || _c === void 0 ? void 0 : _c.version;
                    if (!ver) {
                        throw new Error(`unable to determine minimum semver for peer dependency ${dep.name}@${dep.version}`);
                    }
                    req += '@' + ver;
                }
                this.addDevDeps(req);
            }
        }
        for (const dep of this.project.deps.all) {
            const version = (_d = dep.version) !== null && _d !== void 0 ? _d : '*';
            switch (dep.type) {
                case deps_1.DependencyType.BUNDLED:
                    bundledDependencies.push(dep.name);
                    if (this.project.deps.all.find(d => d.name === dep.name && d.type === deps_1.DependencyType.PEER)) {
                        throw new Error(`unable to bundle "${dep.name}". it cannot appear as a peer dependency`);
                    }
                    // also add as a runtime dependency
                    dependencies[dep.name] = version;
                    break;
                case deps_1.DependencyType.PEER:
                    peerDependencies[dep.name] = version;
                    break;
                case deps_1.DependencyType.RUNTIME:
                    dependencies[dep.name] = version;
                    break;
                case deps_1.DependencyType.TEST:
                case deps_1.DependencyType.DEVENV:
                case deps_1.DependencyType.BUILD:
                    devDependencies[dep.name] = version;
                    break;
            }
        }
        // update the manifest we are about to save into `package.json`
        this.manifest.devDependencies = devDependencies;
        this.manifest.peerDependencies = peerDependencies;
        this.manifest.dependencies = dependencies;
        this.manifest.bundledDependencies = bundledDependencies;
        // nothing further to do if package.json file does not exist
        const root = path_1.join(this.project.outdir, 'package.json');
        if (!fs_extra_1.existsSync(root)) {
            return { devDependencies, peerDependencies, dependencies };
        }
        const pkg = fs_extra_1.readJsonSync(root);
        const readDeps = (user, current = {}) => {
            for (const [name, userVersion] of Object.entries(user)) {
                const currentVersion = current[name];
                // respect user version if it's not '*' or if current version is undefined
                if (userVersion !== '*' || !currentVersion || currentVersion === '*') {
                    continue;
                }
                // memoize current version in memory so it is preserved when saving
                user[name] = currentVersion;
            }
            // report removals
            for (const name of Object.keys(current !== null && current !== void 0 ? current : {})) {
                if (!user[name]) {
                    this.project.logger.verbose(`${name}: removed`);
                }
            }
        };
        readDeps(devDependencies, pkg.devDependencies);
        readDeps(dependencies, pkg.dependencies);
        readDeps(peerDependencies, pkg.peerDependencies);
        return { devDependencies, dependencies, peerDependencies };
    }
    resolveDepsAndWritePackageJson(outdir) {
        const root = path_1.join(outdir, 'package.json');
        const pkg = fs_extra_1.readJsonSync(root);
        const resolveDeps = (current, user) => {
            const result = {};
            current = current !== null && current !== void 0 ? current : {};
            user = user !== null && user !== void 0 ? user : {};
            for (const [name, currentDefinition] of Object.entries(user)) {
                // find actual version from node_modules
                let desiredVersion = currentDefinition;
                if (currentDefinition === '*') {
                    try {
                        const modulePath = require.resolve(`${name}/package.json`, { paths: [outdir] });
                        const module = fs_extra_1.readJsonSync(modulePath);
                        desiredVersion = `^${module.version}`;
                    }
                    catch (e) { }
                    if (!desiredVersion) {
                        this.project.logger.warn(`unable to resolve version for ${name} from installed modules`);
                        continue;
                    }
                }
                if (currentDefinition !== desiredVersion) {
                    this.project.logger.verbose(`${name}: ${currentDefinition} => ${desiredVersion}`);
                }
                result[name] = desiredVersion;
            }
            // print removed packages
            for (const name of Object.keys(current)) {
                if (!result[name]) {
                    this.project.logger.verbose(`${name} removed`);
                }
            }
            return util_1.sorted(result);
        };
        const rendered = this._renderedDeps;
        if (!rendered) {
            throw new Error('assertion failed');
        }
        pkg.dependencies = resolveDeps(pkg.dependencies, rendered.dependencies);
        pkg.devDependencies = resolveDeps(pkg.devDependencies, rendered.devDependencies);
        pkg.peerDependencies = resolveDeps(pkg.peerDependencies, rendered.peerDependencies);
        util_1.writeFile(root, JSON.stringify(pkg, undefined, 2));
    }
    renderPublishConfig() {
        // omit values if they are the same as the npm defaults
        return _resolve_1.resolve({
            registry: this.npmRegistryUrl !== DEFAULT_NPM_REGISTRY_URL ? this.npmRegistryUrl : undefined,
            tag: this.npmDistTag !== DEFAULT_NPM_TAG ? this.npmDistTag : undefined,
            access: this.npmAccess !== defaultNpmAccess(this.packageName) ? this.npmAccess : undefined,
        }, { omitEmpty: true });
    }
    renderKeywords() {
        const kwds = Array.from(this.keywords);
        return util_1.sorted(kwds.sort());
    }
    renderEngines() {
        return util_1.sorted(this.engines);
    }
    autoDiscoverBinaries() {
        const binrel = 'bin';
        const bindir = path_1.join(this.project.outdir, binrel);
        if (fs_extra_1.existsSync(bindir)) {
            for (const file of fs_extra_1.readdirSync(bindir)) {
                try {
                    fs_extra_1.accessSync(path_1.join(bindir, file), fs_extra_1.constants.X_OK);
                    this.bin[file] = path_1.join(binrel, file).replace(/\\/g, '/');
                }
                catch (e) {
                    // not executable, skip
                }
            }
        }
    }
    renderAuthor(options) {
        var _b;
        let author;
        if (options.authorName) {
            author = {
                name: options.authorName,
                email: options.authorEmail,
                url: options.authorUrl,
                organization: (_b = options.authorOrganization) !== null && _b !== void 0 ? _b : false,
            };
        }
        else {
            if (options.authorEmail || options.authorUrl || options.authorOrganization !== undefined) {
                throw new Error('"authorName" is required if specifying "authorEmail" or "authorUrl"');
            }
        }
        return author;
    }
    renderBin() {
        return util_1.sorted(this.bin);
    }
    renderScripts() {
        const result = {};
        for (const [name, commands] of Object.entries(this.scripts)) {
            const cmds = commands.length > 0 ? commands : ['echo "n/a"'];
            result[name] = cmds.join(' && ');
        }
        for (const task of this.project.tasks.all) {
            result[task.name] = this.npmScriptForTask(task);
        }
        return result;
    }
    npmScriptForTask(task) {
        switch (this.npmTaskExecution) {
            case NpmTaskExecution.PROJEN: return `${this.projenCommand} ${task.name}`;
            case NpmTaskExecution.SHELL: return task.toShellCommand();
            default:
                throw new Error(`invalid npmTaskExecution mode: ${this.npmTaskExecution}`);
        }
    }
}
exports.NodePackage = NodePackage;
_a = JSII_RTTI_SYMBOL_1;
NodePackage[_a] = { fqn: "projen.NodePackage", version: "0.16.40" };
/**
 * @experimental
 */
var NpmTaskExecution;
(function (NpmTaskExecution) {
    NpmTaskExecution["PROJEN"] = "projen";
    NpmTaskExecution["SHELL"] = "shell";
})(NpmTaskExecution = exports.NpmTaskExecution || (exports.NpmTaskExecution = {}));
/**
 * (experimental) The node package manager to use.
 *
 * @experimental
 */
var NodePackageManager;
(function (NodePackageManager) {
    NodePackageManager["YARN"] = "yarn";
    NodePackageManager["NPM"] = "npm";
    NodePackageManager["PNPM"] = "pnpm";
})(NodePackageManager = exports.NodePackageManager || (exports.NodePackageManager = {}));
/**
 * (experimental) Npm package access level.
 *
 * @experimental
 */
var NpmAccess;
(function (NpmAccess) {
    NpmAccess["PUBLIC"] = "public";
    NpmAccess["RESTRICTED"] = "restricted";
})(NpmAccess = exports.NpmAccess || (exports.NpmAccess = {}));
/**
 * Determines if an npm package is "scoped" (i.e. it starts with "xxx@").
 */
function isScoped(packageName) {
    return packageName.includes('@');
}
function defaultNpmAccess(packageName) {
    return isScoped(packageName) ? NpmAccess.RESTRICTED : NpmAccess.PUBLIC;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1wYWNrYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL25vZGUtcGFja2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLCtCQUFxQztBQUNyQyw2QkFBd0M7QUFDeEMsdUNBQStHO0FBQy9HLGlDQUFpQztBQUNqQyx5Q0FBb0Q7QUFDcEQsMkNBQXdDO0FBQ3hDLGlDQUF3QztBQUN4QyxpQ0FBa0M7QUFHbEMsaUNBQTJEO0FBRTNELE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQztBQUNoQyxNQUFNLHdCQUF3QixHQUFHLDZCQUE2QixDQUFDO0FBQy9ELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQzs7Ozs7O0FBaVJqQyxNQUFhLFdBQVksU0FBUSxxQkFBUzs7OztJQWlGeEMsWUFBWSxPQUFnQixFQUFFLFVBQThCLEVBQUU7O1FBQzVELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQVJBLGFBQVEsR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNsQyxRQUFHLEdBQTJCLEVBQUUsQ0FBQztRQUNqQyxZQUFPLEdBQTZCLEVBQUUsQ0FBQztRQUN2QyxZQUFPLEdBQTJCLEVBQUUsQ0FBQztRQU9wRCxJQUFJLENBQUMsV0FBVyxTQUFHLE9BQU8sQ0FBQyxXQUFXLG1DQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDdkQsSUFBSSxDQUFDLGdCQUFnQixTQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsbUNBQUksZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1FBQzVFLElBQUksQ0FBQyxhQUFhLFNBQUcsT0FBTyxDQUFDLGFBQWEsbUNBQUksWUFBWSxDQUFDO1FBQzNELElBQUksQ0FBQyxxQkFBcUIsU0FBRyxPQUFPLENBQUMscUJBQXFCLG1DQUFJLEVBQUUsQ0FBQztRQUNqRSxJQUFJLENBQUMsd0JBQXdCLFNBQUcsT0FBTyxDQUFDLHdCQUF3QixtQ0FBSSxJQUFJLENBQUM7UUFDekUsSUFBSSxDQUFDLGNBQWMsU0FBRyxPQUFP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Z0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDMUQ7Z0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztTQUM5RTtJQUNILENBQUM7O0FBOW5CSCxrQ0ErbkJDOzs7Ozs7QUFFRCxJQUFZLGdCQXNCWDtBQXRCRCxXQUFZLGdCQUFnQjtJQVUxQixxQ0FBaUIsQ0FBQTtJQVdqQixtQ0FBZSxDQUFBO0FBQ2pCLENBQUMsRUF0QlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFzQjNCOzs7Ozs7QUFhRCxJQUFZLGtCQWVYO0FBZkQsV0FBWSxrQkFBa0I7SUFJNUIsbUNBQWEsQ0FBQTtJQUtiLGlDQUFXLENBQUE7SUFLWCxtQ0FBYSxDQUFBO0FBQ2YsQ0FBQyxFQWZXLGtCQUFrQixHQUFsQiwwQkFBa0IsS0FBbEIsMEJBQWtCLFFBZTdCOzs7Ozs7QUFLRCxJQUFZLFNBVVg7QUFWRCxXQUFZLFNBQVM7SUFJbkIsOEJBQWlCLENBQUE7SUFLakIsc0NBQXlCLENBQUE7QUFDM0IsQ0FBQyxFQVZXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBVXBCO0FBUUQ7O0dBRUc7QUFDSCxTQUFTLFFBQVEsQ0FBQyxXQUFtQjtJQUNuQyxPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsV0FBbUI7SUFDM0MsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDekUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4sIHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IHBhcnNlIGFzIHVybHBhcnNlIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IGFjY2Vzc1N5bmMsIGNvbnN0YW50cywgZXhpc3RzU3luYywgbHN0YXRTeW5jLCByZWFkZGlyU3luYywgcmVhZEpzb25TeW5jLCB1bmxpbmtTeW5jIH0gZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQgeyByZXNvbHZlIGFzIHJlc29sdmVKc29uIH0gZnJvbSAnLi9fcmVzb2x2ZSc7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBEZXBlbmRlbmN5VHlwZSB9IGZyb20gJy4vZGVwcyc7XG5pbXBvcnQgeyBKc29uRmlsZSB9IGZyb20gJy4vanNvbic7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0JztcbmltcG9ydCB7IFRhc2sgfSBmcm9tICcuL3Rhc2tzJztcbmltcG9ydCB7IGV4ZWMsIHNvcnRlZCwgaXNUcnV0aHksIHdyaXRlRmlsZSB9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IFVOTElDRU5TRUQgPSAnVU5MSUNFTlNFRCc7XG5jb25zdCBERUZBVUxUX05QTV9SRUdJU1RSWV9VUkwgPSAnaHR0cHM6Ly9yZWdpc3RyeS5ucG1qcy5vcmcvJztcbmNvbnN0IERFRkFVTFRfTlBNX1RBRyA9ICdsYXRlc3QnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGVQYWNrYWdlT3B0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcGFja2FnZU5hbWU/OiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGRlcHM/OiBzdHJpbmdbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkZXZEZXBzPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHBlZXJEZXBzPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGJ1bmRsZWREZXBzPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcGVlckRlcGVuZGVuY3lPcHRpb25zPzogUGVlckRlcGVuZGVuY3lPcHRpb25zO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBhbGxvd0xpYnJhcnlEZXBlbmRlbmNpZXM/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGtleXdvcmRzPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBlbnRyeXBvaW50Pzogc3RyaW5nO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgYmluPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgYXV0b0RldGVjdEJpbj86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgc2NyaXB0cz86IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IG5wbVRhc2tFeGVjdXRpb24/OiBOcG1UYXNrRXhlY3V0aW9uO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcHJvamVuQ29tbWFuZD86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHBhY2thZ2VNYW5hZ2VyPzogTm9kZVBhY2thZ2VNYW5hZ2VyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSByZXBvc2l0b3J5Pzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSByZXBvc2l0b3J5RGlyZWN0b3J5Pzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgYXV0aG9yTmFtZT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgYXV0aG9yRW1haWw/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBhdXRob3JVcmw/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGF1dGhvck9yZ2FuaXphdGlvbj86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBob21lcGFnZT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHN0YWJpbGl0eT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IG1pbk5vZGVWZXJzaW9uPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IG1heE5vZGVWZXJzaW9uPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbGljZW5zZT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbGljZW5zZWQ/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBucG1EaXN0VGFnPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IG5wbVJlZ2lzdHJ5VXJsPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbnBtUmVnaXN0cnk/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbnBtQWNjZXNzPzogTnBtQWNjZXNzO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIE5vZGVQYWNrYWdlIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBwYWNrYWdlTmFtZTogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGVudHJ5cG9pbnQ6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgbnBtVGFza0V4ZWN1dGlvbjogTnBtVGFza0V4ZWN1dGlvbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgcHJvamVuQ29tbWFuZDogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGFsbG93TGlicmFyeURlcGVuZGVuY2llczogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHBhY2thZ2VNYW5hZ2VyOiBOb2RlUGFja2FnZU1hbmFnZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IG1hbmlmZXN0OiBhbnk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgbWluTm9kZVZlcnNpb24/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IG1heE5vZGVWZXJzaW9uPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBsaWNlbnNlPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBucG1EaXN0VGFnOiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IG5wbVJlZ2lzdHJ5VXJsOiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IG5wbVJlZ2lzdHJ5OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgbnBtQWNjZXNzOiBOcG1BY2Nlc3M7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBrZXl3b3JkczogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgYmluOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gIHByaXZhdGUgcmVhZG9ubHkgc2NyaXB0czogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge307XG4gIHByaXZhdGUgcmVhZG9ubHkgZW5naW5lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICBwcml2YXRlIHJlYWRvbmx5IHBlZXJEZXBlbmRlbmN5T3B0aW9uczogUGVlckRlcGVuZGVuY3lPcHRpb25zO1xuICBwcml2YXRlIF9yZW5kZXJlZERlcHM/OiBOcG1EZXBlbmRlbmNpZXM7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogUHJvamVjdCwgb3B0aW9uczogTm9kZVBhY2thZ2VPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIHRoaXMucGFja2FnZU5hbWUgPSBvcHRpb25zLnBhY2thZ2VOYW1lID8/IHByb2plY3QubmFtZTtcbiAgICB0aGlzLm5wbVRhc2tFeGVjdXRpb24gPSBvcHRpb25zLm5wbVRhc2tFeGVjdXRpb24gPz8gTnBtVGFza0V4ZWN1dGlvbi5QUk9KRU47XG4gICAgdGhpcy5wcm9qZW5Db21tYW5kID0gb3B0aW9ucy5wcm9qZW5Db21tYW5kID8/ICducHggcHJvamVuJztcbiAgICB0aGlzLnBlZXJEZXBlbmRlbmN5T3B0aW9ucyA9IG9wdGlvbnMucGVlckRlcGVuZGVuY3lPcHRpb25zID8/IHt9O1xuICAgIHRoaXMuYWxsb3dMaWJyYXJ5RGVwZW5kZW5jaWVzID0gb3B0aW9ucy5hbGxvd0xpYnJhcnlEZXBlbmRlbmNpZXMgPz8gdHJ1ZTtcbiAgICB0aGlzLnBhY2thZ2VNYW5hZ2VyID0gb3B0aW9ucy5wYWNrYWdlTWFuYWdlciA/PyBOb2RlUGFja2FnZU1hbmFnZXIuWUFSTjtcbiAgICB0aGlzLmVudHJ5cG9pbnQgPSBvcHRpb25zLmVudHJ5cG9pbnQgPz8gJ2xpYi9pbmRleC5qcyc7XG5cbiAgICBjb25zdCB7IG5wbURpc3RUYWcsIG5wbUFjY2VzcywgbnBtUmVnaXN0cnksIG5wbVJlZ2lzdHJ5VXJsIH0gPSB0aGlzLnBhcnNlTnBtT3B0aW9ucyhvcHRpb25zKTtcbiAgICB0aGlzLm5wbURpc3RUYWcgPSBucG1EaXN0VGFnO1xuICAgIHRoaXMubnBtQWNjZXNzID0gbnBtQWNjZXNzO1xuICAgIHRoaXMubnBtUmVnaXN0cnkgPSBucG1SZWdpc3RyeTtcbiAgICB0aGlzLm5wbVJlZ2lzdHJ5VXJsID0gbnBtUmVnaXN0cnlVcmw7XG5cbiAgICB0aGlzLnByb2Nlc3NEZXBzKG9wdGlvbnMpO1xuXG4gICAgLy8gZW1wdHkgb2JqZWN0cyBhcmUgaGVyZSB0byBwcmVzZXJ2ZSBvcmRlciBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgICB0aGlzLm1hbmlmZXN0ID0ge1xuICAgICAgbmFtZTogdGhpcy5wYWNrYWdlTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBvcHRpb25zLmRlc2NyaXB0aW9uLFxuICAgICAgcmVwb3NpdG9yeTogIW9wdGlvbnMucmVwb3NpdG9yeSA/IHVuZGVmaW5lZCA6IHtcbiAgICAgICAgdHlwZTogJ2dpdCcsXG4gICAgICAgIHVybDogb3B0aW9ucy5yZXBvc2l0b3J5LFxuICAgICAgICBkaXJlY3Rvcnk6IG9wdGlvbnMucmVwb3NpdG9yeURpcmVjdG9yeSxcbiAgICAgIH0sXG4gICAgICBiaW46ICgpID0+IHRoaXMucmVuZGVyQmluKCksXG4gICAgICBzY3JpcHRzOiAoKSA9PiB0aGlzLnJlbmRlclNjcmlwdHMoKSxcbiAgICAgIGF1dGhvcjogdGhpcy5yZW5kZXJBdXRob3Iob3B0aW9ucyksXG4gICAgICBkZXZEZXBlbmRlbmNpZXM6IHt9LFxuICAgICAgcGVlckRlcGVuZGVuY2llczoge30sXG4gICAgICBkZXBlbmRlbmNpZXM6IHt9LFxuICAgICAgYnVuZGxlZERlcGVuZGVuY2llczogW10sXG4gICAgICBrZXl3b3JkczogKCkgPT4gdGhpcy5yZW5kZXJLZXl3b3JkcygpLFxuICAgICAgZW5naW5lczogKCkgPT4gdGhpcy5yZW5kZXJFbmdpbmVzKCksXG4gICAgICBtYWluOiB0aGlzLmVudHJ5cG9pbnQgIT09ICcnID8gdGhpcy5lbnRyeXBvaW50IDogdW5kZWZpbmVkLFxuICAgICAgbGljZW5zZTogKCkgPT4gdGhpcy5saWNlbnNlID8/IFVOTElDRU5TRUQsXG4gICAgICB2ZXJzaW9uOiAnMC4wLjAnLFxuICAgICAgaG9tZXBhZ2U6IG9wdGlvbnMuaG9tZXBhZ2UsXG4gICAgICBwdWJsaXNoQ29uZmlnOiAoKSA9PiB0aGlzLnJlbmRlclB1Ymxpc2hDb25maWcoKSxcbiAgICB9O1xuXG4gICAgLy8gb3ZlcnJpZGUgYW55IHNjcmlwdHMgZnJvbSBvcHRpb25zIChpZiBzcGVjaWZpZWQpXG4gICAgZm9yIChjb25zdCBbY21kbmFtZSwgc2hlbGxdIG9mIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMuc2NyaXB0cyA/PyB7fSkpIHtcbiAgICAgIHByb2plY3QuYWRkVGFzayhjbWRuYW1lLCB7IGV4ZWM6IHNoZWxsIH0pO1xuICAgIH1cblxuXG4gICAgbmV3IEpzb25GaWxlKHRoaXMucHJvamVjdCwgJ3BhY2thZ2UuanNvbicsIHtcbiAgICAgIG9iajogdGhpcy5tYW5pZmVzdCxcbiAgICAgIG1hcmtlcjogdHJ1ZSxcbiAgICAgIHJlYWRvbmx5OiBmYWxzZSwgLy8gd2Ugd2FudCBcInlhcm4gYWRkXCIgdG8gd29yayBhbmQgd2UgaGF2ZSBhbnRpLXRhbXBlclxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRLZXl3b3JkcyguLi5vcHRpb25zLmtleXdvcmRzID8/IFtdKTtcbiAgICB0aGlzLmFkZEJpbihvcHRpb25zLmJpbiA/PyB7fSk7XG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IGFkZCBhbGwgZXhlY3V0YWJsZSBmaWxlcyB1bmRlciBcImJpblwiXG4gICAgaWYgKG9wdGlvbnMuYXV0b0RldGVjdEJpbiA/PyB0cnVlKSB7XG4gICAgICB0aGlzLmF1dG9EaXNjb3ZlckJpbmFyaWVzKCk7XG4gICAgfVxuXG4gICAgLy8gbm9kZSB2ZXJzaW9uXG4gICAgdGhpcy5taW5Ob2RlVmVyc2lvbiA9IG9wdGlvbnMubWluTm9kZVZlcnNpb247XG4gICAgdGhpcy5tYXhOb2RlVmVyc2lvbiA9IG9wdGlvbnMubWF4Tm9kZVZlcnNpb247XG4gICAgdGhpcy5hZGROb2RlRW5naW5lKCk7XG5cbiAgICAvLyBsaWNlbnNlXG4gICAgaWYgKG9wdGlvbnMubGljZW5zZWQgPz8gdHJ1ZSkge1xuICAgICAgdGhpcy5saWNlbnNlID0gb3B0aW9ucy5saWNlbnNlID8/ICdBcGFjaGUtMi4wJztcbiAgICB9XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkRGVwcyguLi5kZXBzOiBzdHJpbmdbXSkge1xuICAgIGZvciAoY29uc3QgZGVwIG9mIGRlcHMpIHtcbiAgICAgIHRoaXMucHJvamVjdC5kZXBzLmFkZERlcGVuZGVuY3koZGVwLCBEZXBlbmRlbmN5VHlwZS5SVU5USU1FKTtcbiAgICB9XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZERldkRlcHMoLi4uZGVwczogc3RyaW5nW10pIHtcbiAgICBmb3IgKGNvbnN0IGRlcCBvZiBkZXBzKSB7XG4gICAgICB0aGlzLnByb2plY3QuZGVwcy5hZGREZXBlbmRlbmN5KGRlcCwgRGVwZW5kZW5jeVR5cGUuQlVJTEQpO1xuXG4gICAgfVxuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZFBlZXJEZXBzKC4uLmRlcHM6IHN0cmluZ1tdKSB7XG4gICAgaWYgKE9iamVjdC5rZXlzKGRlcHMpLmxlbmd0aCAmJiAhdGhpcy5hbGxvd0xpYnJhcnlEZXBlbmRlbmNpZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IGFkZCBwZWVyIGRlcGVuZGVuY2llcyB0byBhbiBBUFAgcHJvamVjdDogJHtPYmplY3Qua2V5cyhkZXBzKS5qb2luKCcsJyl9YCk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBkZXAgb2YgZGVwcykge1xuICAgICAgdGhpcy5wcm9qZWN0LmRlcHMuYWRkRGVwZW5kZW5jeShkZXAsIERlcGVuZGVuY3lUeXBlLlBFRVIpO1xuICAgIH1cbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZEJ1bmRsZWREZXBzKC4uLmRlcHM6IHN0cmluZ1tdKSB7XG4gICAgaWYgKGRlcHMubGVuZ3RoICYmICF0aGlzLmFsbG93TGlicmFyeURlcGVuZGVuY2llcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgYWRkIGJ1bmRsZWQgZGVwZW5kZW5jaWVzIHRvIGFuIEFQUCBwcm9qZWN0OiAke2RlcHMuam9pbignLCcpfWApO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgZGVwIG9mIGRlcHMpIHtcbiAgICAgIHRoaXMucHJvamVjdC5kZXBzLmFkZERlcGVuZGVuY3koZGVwLCBEZXBlbmRlbmN5VHlwZS5CVU5ETEVEKTtcbiAgICB9XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZEVuZ2luZShlbmdpbmU6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nKSB7XG4gICAgdGhpcy5lbmdpbmVzW2VuZ2luZV0gPSB2ZXJzaW9uO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkS2V5d29yZHMoLi4ua2V5d29yZHM6IHN0cmluZ1tdKSB7XG4gICAgZm9yIChjb25zdCBrIG9mIGtleXdvcmRzKSB7XG4gICAgICB0aGlzLmtleXdvcmRzLmFkZChrKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYWRkQmluKGJpbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pIHtcbiAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhiaW5zKSkge1xuICAgICAgdGhpcy5iaW5ba10gPSB2O1xuICAgIH1cbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHNldFNjcmlwdChuYW1lOiBzdHJpbmcsIGNvbW1hbmQ6IHN0cmluZykge1xuICAgIHRoaXMuc2NyaXB0c1tuYW1lXSA9IFtjb21tYW5kXTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVtb3ZlU2NyaXB0KG5hbWU6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnNjcmlwdHNbbmFtZV07XG4gIH1cblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgaGFzU2NyaXB0KG5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBuYW1lIGluIHRoaXMuc2NyaXB0cztcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZEZpZWxkKG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIHRoaXMubWFuaWZlc3RbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGRWZXJzaW9uKHZlcnNpb246IHN0cmluZykge1xuICAgIHRoaXMubWFuaWZlc3QudmVyc2lvbiA9IHZlcnNpb247XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGdldCBpbnN0YWxsQ29tbWFuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJJbnN0YWxsQ29tbWFuZCh0cnVlKTtcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHB1YmxpYyBwcmVTeW50aGVzaXplKCkge1xuICAgIHN1cGVyLnByZVN5bnRoZXNpemUoKTtcbiAgICB0aGlzLl9yZW5kZXJlZERlcHMgPSB0aGlzLnJlbmRlckRlcGVuZGVuY2llcygpO1xuICB9XG5cbiAgcHVibGljIHBvc3RTeW50aGVzaXplKCkge1xuICAgIHN1cGVyLnBvc3RTeW50aGVzaXplKCk7XG5cbiAgICBjb25zdCBvdXRkaXIgPSB0aGlzLnByb2plY3Qub3V0ZGlyO1xuXG4gICAgLy8gbm93IHdlIHJ1biBgeWFybiBpbnN0YWxsYCwgYnV0IGJlZm9yZSB3ZSBkbyB0aGF0LCByZW1vdmUgdGhlXG4gICAgLy8gYG5vZGVfbW9kdWxlcy9wcm9qZW5gIHN5bWxpbmsgc28gdGhhdCB5YXJuIHdvbid0IGhhdGUgdXMuXG4gICAgY29uc3QgcHJvamVuTW9kdWxlID0gcmVzb2x2ZSgnbm9kZV9tb2R1bGVzJywgJ3Byb2plbicpO1xuICAgIHRyeSB7XG4gICAgICBpZiAobHN0YXRTeW5jKHByb2plbk1vZHVsZSkuaXNTeW1ib2xpY0xpbmsoKSkge1xuICAgICAgICB1bmxpbmtTeW5jKHByb2plbk1vZHVsZSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkgeyB9XG5cbiAgICBleGVjKHRoaXMucmVuZGVySW5zdGFsbENvbW1hbmQoaXNUcnV0aHkocHJvY2Vzcy5lbnYuQ0kpKSwgeyBjd2Q6IG91dGRpciB9KTtcblxuICAgIHRoaXMucmVzb2x2ZURlcHNBbmRXcml0ZVBhY2thZ2VKc29uKG91dGRpcik7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJpdmF0ZSBwYXJzZU5wbU9wdGlvbnMob3B0aW9uczogTm9kZVBhY2thZ2VPcHRpb25zKSB7XG4gICAgbGV0IG5wbVJlZ2lzdHJ5VXJsID0gb3B0aW9ucy5ucG1SZWdpc3RyeVVybDtcbiAgICBpZiAob3B0aW9ucy5ucG1SZWdpc3RyeSkge1xuICAgICAgaWYgKG5wbVJlZ2lzdHJ5VXJsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY2Fubm90IHVzZSB0aGUgZGVwcmVjYXRlZCBcIm5wbVJlZ2lzdHJ5XCIgdG9nZXRoZXIgd2l0aCBcIm5wbVJlZ2lzdHJ5VXJsXCIuIHBsZWFzZSB1c2UgXCJucG1SZWdpc3RyeVVybFwiIGluc3RlYWQuJyk7XG4gICAgICB9XG5cbiAgICAgIG5wbVJlZ2lzdHJ5VXJsID0gYGh0dHBzOi8vJHtvcHRpb25zLm5wbVJlZ2lzdHJ5fWA7XG4gICAgfVxuXG4gICAgY29uc3QgbnBtciA9IHVybHBhcnNlKG5wbVJlZ2lzdHJ5VXJsID8/IERFRkFVTFRfTlBNX1JFR0lTVFJZX1VSTCk7XG4gICAgaWYgKCFucG1yIHx8ICFucG1yLmhvc3RuYW1lIHx8ICFucG1yLmhyZWYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5hYmxlIHRvIGRldGVybWluZSBucG0gcmVnaXN0cnkgaG9zdCBmcm9tIHVybCAke25wbVJlZ2lzdHJ5VXJsfS4gSXMgdGhpcyByZWFsbHkgYSBVUkw/YCk7XG4gICAgfVxuXG4gICAgY29uc3QgbnBtQWNjZXNzID0gb3B0aW9ucy5ucG1BY2Nlc3MgPz8gZGVmYXVsdE5wbUFjY2Vzcyh0aGlzLnBhY2thZ2VOYW1lKTtcbiAgICBpZiAoIWlzU2NvcGVkKHRoaXMucGFja2FnZU5hbWUpICYmIG5wbUFjY2VzcyA9PT0gTnBtQWNjZXNzLlJFU1RSSUNURUQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgXCJucG1BY2Nlc3NcIiBjYW5ub3QgYmUgUkVTVFJJQ1RFRCBmb3Igbm9uLXNjb3BlZCBucG0gcGFja2FnZSBcIiR7dGhpcy5wYWNrYWdlTmFtZX1cImApO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBucG1EaXN0VGFnOiBvcHRpb25zLm5wbURpc3RUYWcgPz8gREVGQVVMVF9OUE1fVEFHLFxuICAgICAgbnBtQWNjZXNzLFxuICAgICAgbnBtUmVnaXN0cnk6IG5wbXIuaG9zdG5hbWUsXG4gICAgICBucG1SZWdpc3RyeVVybDogbnBtci5ocmVmLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGFkZE5vZGVFbmdpbmUoKSB7XG4gICAgaWYgKCF0aGlzLm1pbk5vZGVWZXJzaW9uICYmICF0aGlzLm1heE5vZGVWZXJzaW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG5vZGVWZXJzaW9uID0gJyc7XG4gICAgaWYgKHRoaXMubWluTm9kZVZlcnNpb24pIHtcbiAgICAgIG5vZGVWZXJzaW9uICs9IGA+PSAke3RoaXMubWluTm9kZVZlcnNpb259YDtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF4Tm9kZVZlcnNpb24pIHtcbiAgICAgIG5vZGVWZXJzaW9uICs9IGAgPD0gJHt0aGlzLm1heE5vZGVWZXJzaW9ufWA7XG4gICAgfVxuICAgIHRoaXMuYWRkRW5naW5lKCdub2RlJywgbm9kZVZlcnNpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJJbnN0YWxsQ29tbWFuZChmcm96ZW46IGJvb2xlYW4pIHtcbiAgICBzd2l0Y2ggKHRoaXMucGFja2FnZU1hbmFnZXIpIHtcbiAgICAgIGNhc2UgTm9kZVBhY2thZ2VNYW5hZ2VyLllBUk46XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgJ3lhcm4gaW5zdGFsbCcsXG4gICAgICAgICAgJy0tY2hlY2stZmlsZXMnLCAvLyBlbnN1cmUgYWxsIG1vZHVsZXMgZXhpc3QgKGVzcGVjaWFsbHkgcHJvamVuIHdoaWNoIHdhcyBqdXN0IHJlbW92ZWQpLlxuICAgICAgICAgIC4uLmZyb3plbiA/IFsnLS1mcm96ZW4tbG9ja2ZpbGUnXSA6IFtdLFxuICAgICAgICBdLmpvaW4oJyAnKTtcblxuICAgICAgY2FzZSBOb2RlUGFja2FnZU1hbmFnZXIuTlBNOlxuICAgICAgICByZXR1cm4gZnJvemVuXG4gICAgICAgICAgPyAnbnBtIGNpJ1xuICAgICAgICAgIDogJ25wbSBpbnN0YWxsJztcblxuICAgICAgY2FzZSBOb2RlUGFja2FnZU1hbmFnZXIuUE5QTTpcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAncG5wbSBpJyxcbiAgICAgICAgICAuLi5mcm96ZW4gPyBbJy0tZnJvemVuLWxvY2tmaWxlJ10gOiBbXSxcbiAgICAgICAgXS5qb2luKCcgJyk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5leHBlY3RlZCBwYWNrYWdlIG1hbmFnZXIgJHt0aGlzLnBhY2thZ2VNYW5hZ2VyfWApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcHJvY2Vzc0RlcHMob3B0aW9uczogTm9kZVBhY2thZ2VPcHRpb25zKSB7XG4gICAgdGhpcy5hZGREZXBzKC4uLm9wdGlvbnMuZGVwcyA/PyBbXSk7XG4gICAgdGhpcy5hZGREZXZEZXBzKC4uLm9wdGlvbnMuZGV2RGVwcyA/PyBbXSk7XG4gICAgdGhpcy5hZGRQZWVyRGVwcyguLi5vcHRpb25zLnBlZXJEZXBzID8/IFtdKTtcbiAgICB0aGlzLmFkZEJ1bmRsZWREZXBzKC4uLm9wdGlvbnMuYnVuZGxlZERlcHMgPz8gW10pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJEZXBlbmRlbmNpZXMoKTogTnBtRGVwZW5kZW5jaWVzIHtcbiAgICBjb25zdCBkZXZEZXBlbmRlbmNpZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICBjb25zdCBwZWVyRGVwZW5kZW5jaWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgY29uc3QgYnVuZGxlZERlcGVuZGVuY2llcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XG5cbiAgICAvLyBzeW50aGV0aWMgZGVwZW5kZW5jaWVzOiBhZGQgYSBwaW5uZWQgYnVpbGQgZGVwZW5kZW5jeSB0byBlbnN1cmUgd2UgYXJlXG4gICAgLy8gdGVzdGluZyBhZ2FpbnN0IHRoZSBtaW5pbXVtIHJlcXVpcmVtZW50IG9mIHRoZSBwZWVyLlxuICAgIGNvbnN0IHBpbm5lZCA9IHRoaXMucGVlckRlcGVuZGVuY3lPcHRpb25zLnBpbm5lZERldkRlcGVuZGVuY3kgPz8gdHJ1ZTtcbiAgICBpZiAocGlubmVkKSB7XG4gICAgICBmb3IgKGNvbnN0IGRlcCBvZiB0aGlzLnByb2plY3QuZGVwcy5hbGwuZmlsdGVyKGQgPT4gZC50eXBlID09PSBEZXBlbmRlbmN5VHlwZS5QRUVSKSkge1xuICAgICAgICBsZXQgcmVxID0gZGVwLm5hbWU7XG4gICAgICAgIGlmIChkZXAudmVyc2lvbikge1xuICAgICAgICAgIGNvbnN0IHZlciA9IHNlbXZlci5taW5WZXJzaW9uKGRlcC52ZXJzaW9uKT8udmVyc2lvbjtcbiAgICAgICAgICBpZiAoIXZlcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bmFibGUgdG8gZGV0ZXJtaW5lIG1pbmltdW0gc2VtdmVyIGZvciBwZWVyIGRlcGVuZGVuY3kgJHtkZXAubmFtZX1AJHtkZXAudmVyc2lvbn1gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXEgKz0gJ0AnICsgdmVyO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWRkRGV2RGVwcyhyZXEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgZGVwIG9mIHRoaXMucHJvamVjdC5kZXBzLmFsbCkge1xuICAgICAgY29uc3QgdmVyc2lvbiA9IGRlcC52ZXJzaW9uID8/ICcqJztcblxuICAgICAgc3dpdGNoIChkZXAudHlwZSkge1xuICAgICAgICBjYXNlIERlcGVuZGVuY3lUeXBlLkJVTkRMRUQ6XG4gICAgICAgICAgYnVuZGxlZERlcGVuZGVuY2llcy5wdXNoKGRlcC5uYW1lKTtcblxuICAgICAgICAgIGlmICh0aGlzLnByb2plY3QuZGVwcy5hbGwuZmluZChkID0+IGQubmFtZSA9PT0gZGVwLm5hbWUgJiYgZC50eXBlID09PSBEZXBlbmRlbmN5VHlwZS5QRUVSKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bmFibGUgdG8gYnVuZGxlIFwiJHtkZXAubmFtZX1cIi4gaXQgY2Fubm90IGFwcGVhciBhcyBhIHBlZXIgZGVwZW5kZW5jeWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGFsc28gYWRkIGFzIGEgcnVudGltZSBkZXBlbmRlbmN5XG4gICAgICAgICAgZGVwZW5kZW5jaWVzW2RlcC5uYW1lXSA9IHZlcnNpb247XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBEZXBlbmRlbmN5VHlwZS5QRUVSOlxuICAgICAgICAgIHBlZXJEZXBlbmRlbmNpZXNbZGVwLm5hbWVdID0gdmVyc2lvbjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIERlcGVuZGVuY3lUeXBlLlJVTlRJTUU6XG4gICAgICAgICAgZGVwZW5kZW5jaWVzW2RlcC5uYW1lXSA9IHZlcnNpb247XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBEZXBlbmRlbmN5VHlwZS5URVNUOlxuICAgICAgICBjYXNlIERlcGVuZGVuY3lUeXBlLkRFVkVOVjpcbiAgICAgICAgY2FzZSBEZXBlbmRlbmN5VHlwZS5CVUlMRDpcbiAgICAgICAgICBkZXZEZXBlbmRlbmNpZXNbZGVwLm5hbWVdID0gdmVyc2lvbjtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgdGhlIG1hbmlmZXN0IHdlIGFyZSBhYm91dCB0byBzYXZlIGludG8gYHBhY2thZ2UuanNvbmBcbiAgICB0aGlzLm1hbmlmZXN0LmRldkRlcGVuZGVuY2llcyA9IGRldkRlcGVuZGVuY2llcztcbiAgICB0aGlzLm1hbmlmZXN0LnBlZXJEZXBlbmRlbmNpZXMgPSBwZWVyRGVwZW5kZW5jaWVzO1xuICAgIHRoaXMubWFuaWZlc3QuZGVwZW5kZW5jaWVzID0gZGVwZW5kZW5jaWVzO1xuICAgIHRoaXMubWFuaWZlc3QuYnVuZGxlZERlcGVuZGVuY2llcyA9IGJ1bmRsZWREZXBlbmRlbmNpZXM7XG5cbiAgICAvLyBub3RoaW5nIGZ1cnRoZXIgdG8gZG8gaWYgcGFja2FnZS5qc29uIGZpbGUgZG9lcyBub3QgZXhpc3RcbiAgICBjb25zdCByb290ID0gam9pbih0aGlzLnByb2plY3Qub3V0ZGlyLCAncGFja2FnZS5qc29uJyk7XG4gICAgaWYgKCFleGlzdHNTeW5jKHJvb3QpKSB7XG4gICAgICByZXR1cm4geyBkZXZEZXBlbmRlbmNpZXMsIHBlZXJEZXBlbmRlbmNpZXMsIGRlcGVuZGVuY2llcyB9O1xuICAgIH1cblxuICAgIGNvbnN0IHBrZyA9IHJlYWRKc29uU3luYyhyb290KTtcblxuICAgIGNvbnN0IHJlYWREZXBzID0gKHVzZXI6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sIGN1cnJlbnQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fSkgPT4ge1xuICAgICAgZm9yIChjb25zdCBbbmFtZSwgdXNlclZlcnNpb25dIG9mIE9iamVjdC5lbnRyaWVzKHVzZXIpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRWZXJzaW9uID0gY3VycmVudFtuYW1lXTtcblxuICAgICAgICAvLyByZXNwZWN0IHVzZXIgdmVyc2lvbiBpZiBpdCdzIG5vdCAnKicgb3IgaWYgY3VycmVudCB2ZXJzaW9uIGlzIHVuZGVmaW5lZFxuICAgICAgICBpZiAodXNlclZlcnNpb24gIT09ICcqJyB8fCAhY3VycmVudFZlcnNpb24gfHwgY3VycmVudFZlcnNpb24gPT09ICcqJykge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWVtb2l6ZSBjdXJyZW50IHZlcnNpb24gaW4gbWVtb3J5IHNvIGl0IGlzIHByZXNlcnZlZCB3aGVuIHNhdmluZ1xuICAgICAgICB1c2VyW25hbWVdID0gY3VycmVudFZlcnNpb247XG4gICAgICB9XG5cbiAgICAgIC8vIHJlcG9ydCByZW1vdmFsc1xuICAgICAgZm9yIChjb25zdCBuYW1lIG9mIE9iamVjdC5rZXlzKGN1cnJlbnQgPz8ge30pKSB7XG4gICAgICAgIGlmICghdXNlcltuYW1lXSkge1xuICAgICAgICAgIHRoaXMucHJvamVjdC5sb2dnZXIudmVyYm9zZShgJHtuYW1lfTogcmVtb3ZlZGApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlYWREZXBzKGRldkRlcGVuZGVuY2llcywgcGtnLmRldkRlcGVuZGVuY2llcyk7XG4gICAgcmVhZERlcHMoZGVwZW5kZW5jaWVzLCBwa2cuZGVwZW5kZW5jaWVzKTtcbiAgICByZWFkRGVwcyhwZWVyRGVwZW5kZW5jaWVzLCBwa2cucGVlckRlcGVuZGVuY2llcyk7XG5cbiAgICByZXR1cm4geyBkZXZEZXBlbmRlbmNpZXMsIGRlcGVuZGVuY2llcywgcGVlckRlcGVuZGVuY2llcyB9O1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlRGVwc0FuZFdyaXRlUGFja2FnZUpzb24ob3V0ZGlyOiBzdHJpbmcpIHtcbiAgICBjb25zdCByb290ID0gam9pbihvdXRkaXIsICdwYWNrYWdlLmpzb24nKTtcbiAgICBjb25zdCBwa2cgPSByZWFkSnNvblN5bmMocm9vdCk7XG5cbiAgICBjb25zdCByZXNvbHZlRGVwcyA9IChjdXJyZW50OiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSwgdXNlcjogUmVjb3JkPHN0cmluZywgc3RyaW5nPikgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgICBjdXJyZW50ID0gY3VycmVudCA/PyB7fTtcbiAgICAgIHVzZXIgPSB1c2VyID8/IHt9O1xuXG4gICAgICBmb3IgKGNvbnN0IFtuYW1lLCBjdXJyZW50RGVmaW5pdGlvbl0gb2YgT2JqZWN0LmVudHJpZXModXNlcikpIHtcbiAgICAgICAgLy8gZmluZCBhY3R1YWwgdmVyc2lvbiBmcm9tIG5vZGVfbW9kdWxlc1xuICAgICAgICBsZXQgZGVzaXJlZFZlcnNpb24gPSBjdXJyZW50RGVmaW5pdGlvbjtcblxuICAgICAgICBpZiAoY3VycmVudERlZmluaXRpb24gPT09ICcqJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtb2R1bGVQYXRoID0gcmVxdWlyZS5yZXNvbHZlKGAke25hbWV9L3BhY2thZ2UuanNvbmAsIHsgcGF0aHM6IFtvdXRkaXJdIH0pO1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gcmVhZEpzb25TeW5jKG1vZHVsZVBhdGgpO1xuICAgICAgICAgICAgZGVzaXJlZFZlcnNpb24gPSBgXiR7bW9kdWxlLnZlcnNpb259YDtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7IH1cblxuICAgICAgICAgIGlmICghZGVzaXJlZFZlcnNpb24pIHtcbiAgICAgICAgICAgIHRoaXMucHJvamVjdC5sb2dnZXIud2FybihgdW5hYmxlIHRvIHJlc29sdmUgdmVyc2lvbiBmb3IgJHtuYW1lfSBmcm9tIGluc3RhbGxlZCBtb2R1bGVzYCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3VycmVudERlZmluaXRpb24gIT09IGRlc2lyZWRWZXJzaW9uKSB7XG4gICAgICAgICAgdGhpcy5wcm9qZWN0LmxvZ2dlci52ZXJib3NlKGAke25hbWV9OiAke2N1cnJlbnREZWZpbml0aW9ufSA9PiAke2Rlc2lyZWRWZXJzaW9ufWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0W25hbWVdID0gZGVzaXJlZFZlcnNpb247XG4gICAgICB9XG5cbiAgICAgIC8vIHByaW50IHJlbW92ZWQgcGFja2FnZXNcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBPYmplY3Qua2V5cyhjdXJyZW50KSkge1xuICAgICAgICBpZiAoIXJlc3VsdFtuYW1lXSkge1xuICAgICAgICAgIHRoaXMucHJvamVjdC5sb2dnZXIudmVyYm9zZShgJHtuYW1lfSByZW1vdmVkYCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNvcnRlZChyZXN1bHQpO1xuICAgIH07XG5cbiAgICBjb25zdCByZW5kZXJlZCA9IHRoaXMuX3JlbmRlcmVkRGVwcztcbiAgICBpZiAoIXJlbmRlcmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Fzc2VydGlvbiBmYWlsZWQnKTtcbiAgICB9XG4gICAgcGtnLmRlcGVuZGVuY2llcyA9IHJlc29sdmVEZXBzKHBrZy5kZXBlbmRlbmNpZXMsIHJlbmRlcmVkLmRlcGVuZGVuY2llcyk7XG4gICAgcGtnLmRldkRlcGVuZGVuY2llcyA9IHJlc29sdmVEZXBzKHBrZy5kZXZEZXBlbmRlbmNpZXMsIHJlbmRlcmVkLmRldkRlcGVuZGVuY2llcyk7XG4gICAgcGtnLnBlZXJEZXBlbmRlbmNpZXMgPSByZXNvbHZlRGVwcyhwa2cucGVlckRlcGVuZGVuY2llcywgcmVuZGVyZWQucGVlckRlcGVuZGVuY2llcyk7XG5cbiAgICB3cml0ZUZpbGUocm9vdCwgSlNPTi5zdHJpbmdpZnkocGtnLCB1bmRlZmluZWQsIDIpKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyUHVibGlzaENvbmZpZygpIHtcbiAgICAvLyBvbWl0IHZhbHVlcyBpZiB0aGV5IGFyZSB0aGUgc2FtZSBhcyB0aGUgbnBtIGRlZmF1bHRzXG4gICAgcmV0dXJuIHJlc29sdmVKc29uKHtcbiAgICAgIHJlZ2lzdHJ5OiB0aGlzLm5wbVJlZ2lzdHJ5VXJsICE9PSBERUZBVUxUX05QTV9SRUdJU1RSWV9VUkwgPyB0aGlzLm5wbVJlZ2lzdHJ5VXJsIDogdW5kZWZpbmVkLFxuICAgICAgdGFnOiB0aGlzLm5wbURpc3RUYWcgIT09IERFRkFVTFRfTlBNX1RBRyA/IHRoaXMubnBtRGlzdFRhZyA6IHVuZGVmaW5lZCxcbiAgICAgIGFjY2VzczogdGhpcy5ucG1BY2Nlc3MgIT09IGRlZmF1bHROcG1BY2Nlc3ModGhpcy5wYWNrYWdlTmFtZSkgPyB0aGlzLm5wbUFjY2VzcyA6IHVuZGVmaW5lZCxcbiAgICB9LCB7IG9taXRFbXB0eTogdHJ1ZSB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyS2V5d29yZHMoKSB7XG4gICAgY29uc3Qga3dkcyA9IEFycmF5LmZyb20odGhpcy5rZXl3b3Jkcyk7XG4gICAgcmV0dXJuIHNvcnRlZChrd2RzLnNvcnQoKSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckVuZ2luZXMoKSB7XG4gICAgcmV0dXJuIHNvcnRlZCh0aGlzLmVuZ2luZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBhdXRvRGlzY292ZXJCaW5hcmllcygpIHtcbiAgICBjb25zdCBiaW5yZWwgPSAnYmluJztcbiAgICBjb25zdCBiaW5kaXIgPSBqb2luKHRoaXMucHJvamVjdC5vdXRkaXIsIGJpbnJlbCk7XG4gICAgaWYgKGV4aXN0c1N5bmMoYmluZGlyKSkge1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIHJlYWRkaXJTeW5jKGJpbmRpcikpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhY2Nlc3NTeW5jKGpvaW4oYmluZGlyLCBmaWxlKSwgY29uc3RhbnRzLlhfT0spO1xuICAgICAgICAgIHRoaXMuYmluW2ZpbGVdID0gam9pbihiaW5yZWwsIGZpbGUpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIG5vdCBleGVjdXRhYmxlLCBza2lwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckF1dGhvcihvcHRpb25zOiBOb2RlUGFja2FnZU9wdGlvbnMpIHtcbiAgICBsZXQgYXV0aG9yO1xuICAgIGlmIChvcHRpb25zLmF1dGhvck5hbWUpIHtcbiAgICAgIGF1dGhvciA9IHtcbiAgICAgICAgbmFtZTogb3B0aW9ucy5hdXRob3JOYW1lLFxuICAgICAgICBlbWFpbDogb3B0aW9ucy5hdXRob3JFbWFpbCxcbiAgICAgICAgdXJsOiBvcHRpb25zLmF1dGhvclVybCxcbiAgICAgICAgb3JnYW5pemF0aW9uOiBvcHRpb25zLmF1dGhvck9yZ2FuaXphdGlvbiA/PyBmYWxzZSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChvcHRpb25zLmF1dGhvckVtYWlsIHx8IG9wdGlvbnMuYXV0aG9yVXJsIHx8IG9wdGlvbnMuYXV0aG9yT3JnYW5pemF0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcImF1dGhvck5hbWVcIiBpcyByZXF1aXJlZCBpZiBzcGVjaWZ5aW5nIFwiYXV0aG9yRW1haWxcIiBvciBcImF1dGhvclVybFwiJyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhdXRob3I7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckJpbigpIHtcbiAgICByZXR1cm4gc29ydGVkKHRoaXMuYmluKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyU2NyaXB0cygpIHtcbiAgICBjb25zdCByZXN1bHQ6IGFueSA9IHt9O1xuICAgIGZvciAoY29uc3QgW25hbWUsIGNvbW1hbmRzXSBvZiBPYmplY3QuZW50cmllcyh0aGlzLnNjcmlwdHMpKSB7XG4gICAgICBjb25zdCBjbWRzID0gY29tbWFuZHMubGVuZ3RoID4gMCA/IGNvbW1hbmRzIDogWydlY2hvIFwibi9hXCInXTtcbiAgICAgIHJlc3VsdFtuYW1lXSA9IGNtZHMuam9pbignICYmICcpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHRhc2sgb2YgdGhpcy5wcm9qZWN0LnRhc2tzLmFsbCkge1xuICAgICAgcmVzdWx0W3Rhc2submFtZV0gPSB0aGlzLm5wbVNjcmlwdEZvclRhc2sodGFzayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBucG1TY3JpcHRGb3JUYXNrKHRhc2s6IFRhc2spIHtcbiAgICBzd2l0Y2ggKHRoaXMubnBtVGFza0V4ZWN1dGlvbikge1xuICAgICAgY2FzZSBOcG1UYXNrRXhlY3V0aW9uLlBST0pFTjogcmV0dXJuIGAke3RoaXMucHJvamVuQ29tbWFuZH0gJHt0YXNrLm5hbWV9YDtcbiAgICAgIGNhc2UgTnBtVGFza0V4ZWN1dGlvbi5TSEVMTDogcmV0dXJuIHRhc2sudG9TaGVsbENvbW1hbmQoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBucG1UYXNrRXhlY3V0aW9uIG1vZGU6ICR7dGhpcy5ucG1UYXNrRXhlY3V0aW9ufWApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZW51bSBOcG1UYXNrRXhlY3V0aW9uIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBQUk9KRU4gPSAncHJvamVuJyxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBTSEVMTCA9ICdzaGVsbCdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQZWVyRGVwZW5kZW5jeU9wdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHBpbm5lZERldkRlcGVuZGVuY3k/OiBib29sZWFuO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgZW51bSBOb2RlUGFja2FnZU1hbmFnZXIge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIFlBUk4gPSAneWFybicsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIE5QTSA9ICducG0nLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgUE5QTSA9ICdwbnBtJ1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGVudW0gTnBtQWNjZXNzIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIFBVQkxJQyA9ICdwdWJsaWMnLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgUkVTVFJJQ1RFRCA9ICdyZXN0cmljdGVkJ1xufVxuXG5pbnRlcmZhY2UgTnBtRGVwZW5kZW5jaWVzIHtcbiAgcmVhZG9ubHkgZGVwZW5kZW5jaWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICByZWFkb25seSBkZXZEZXBlbmRlbmNpZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIHJlYWRvbmx5IHBlZXJEZXBlbmRlbmNpZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBhbiBucG0gcGFja2FnZSBpcyBcInNjb3BlZFwiIChpLmUuIGl0IHN0YXJ0cyB3aXRoIFwieHh4QFwiKS5cbiAqL1xuZnVuY3Rpb24gaXNTY29wZWQocGFja2FnZU5hbWU6IHN0cmluZykge1xuICByZXR1cm4gcGFja2FnZU5hbWUuaW5jbHVkZXMoJ0AnKTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdE5wbUFjY2VzcyhwYWNrYWdlTmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiBpc1Njb3BlZChwYWNrYWdlTmFtZSkgPyBOcG1BY2Nlc3MuUkVTVFJJQ1RFRCA6IE5wbUFjY2Vzcy5QVUJMSUM7XG59Il19