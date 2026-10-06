"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptLibraryProject = exports.TypeScriptAppProject = exports.TypescriptConfig = exports.TypeScriptJsxMode = exports.TypeScriptModuleResolution = exports.TypeScriptProject = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path = require("path");
const common_1 = require("./common");
const component_1 = require("./component");
const eslint_1 = require("./eslint");
const json_1 = require("./json");
const node_project_1 = require("./node-project");
const sample_file_1 = require("./sample-file");
const tasks_1 = require("./tasks");
const textfile_1 = require("./textfile");
const typescript_typedoc_1 = require("./typescript-typedoc");
const util_1 = require("./util");
/**
 * (experimental) TypeScript project.
 *
 * @experimental
 * @pjid typescript
 */
class TypeScriptProject extends node_project_1.NodeProject {
    /**
     * @experimental
     */
    constructor(options) {
        var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        super({
            ...options,
            jestOptions: {
                ...options.jestOptions,
                jestConfig: {
                    ...(_e = options.jestOptions) === null || _e === void 0 ? void 0 : _e.jestConfig,
                    testMatch: [],
                },
            },
        });
        this.srcdir = (_f = options.srcdir) !== null && _f !== void 0 ? _f : 'src';
        this.libdir = (_g = options.libdir) !== null && _g !== void 0 ? _g : 'lib';
        this.docgen = options.docgen;
        this.docsDirectory = (_h = options.docsDirectory) !== null && _h !== void 0 ? _h : 'docs/';
        this.compileTask.exec('tsc');
        this.watchTask = this.addTask('watch', {
            description: 'Watch & compile in the background',
            category: tasks_1.TaskCategory.BUILD,
            exec: 'tsc -w',
        });
        this.testdir = (_j = options.testdir) !== null && _j !== void 0 ? _j : 'test';
        this.gitignore.include(`/${this.testdir}`);
        (_k = this.npmignore) === null || _k === void 0 ? void 0 : _k.exclude(`/${this.testdir}`);
        // if the test directory is under `src/`, then we will run our tests against
        // the javascript files and not let jest compile it for us.
        const compiledTests = this.testdir.startsWith(this.srcdir + path.posix.sep);
        // by default, we first run tests (jest compiles the typescript in the background) and only then we compile.
        const compileBeforeTest = (_l = options.compileBeforeTest) !== null && _l !== void 0 ? _l : compiledTests;
        if (compileBeforeTest) {
            this.buildTask.spawn(this.compileTask);
            this.buildTask.spawn(this.testTask);
        }
        else {
            this.buildTask.spawn(this.testTask);
            this.buildTask.spawn(this.compileTask);
        }
        if ((_m = options.package) !== null && _m !== void 0 ? _m : true) {
            this.packageTask = this.addTask('package', {
                description: 'Create an npm tarball',
                category: tasks_1.TaskCategory.RELEASE,
            });
            this.packageTask.exec('rm -fr dist');
            this.packageTask.exec('mkdir -p dist/js');
            this.packageTask.exec(`${this.package.packageManager} pack`);
            this.packageTask.exec('mv *.tgz dist/js/');
            this.buildTask.spawn(this.packageTask);
        }
        if (options.entrypointTypes || this.entrypoint !== '') {
            const entrypointTypes = (_o = options.entrypointTypes) !== null && _o !== void 0 ? _o : `${path.join(path.dirname(this.entrypoint), path.basename(this.entrypoint, '.js')).replace(/\\/g, '/')}.d.ts`;
            this.package.addField('types', entrypointTypes);
        }
        const compilerOptionDefaults = {
            alwaysStrict: true,
            declaration: true,
            experimentalDecorators: true,
            inlineSourceMap: true,
            inlineSources: true,
            lib: ['es2018'],
            module: 'CommonJS',
            noEmitOnError: false,
            noFallthroughCasesInSwitch: true,
            noImplicitAny: true,
            noImplicitReturns: true,
            noImplicitThis: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            resolveJsonModule: true,
            strict: true,
            strictNullChecks: true,
            strictPropertyInitialization: true,
            stripInternal: true,
            target: 'ES2018',
        };
        if (!options.disableTsconfig) {
            const baseTsconfig = {
                include: [`${this.srcdir}/**/*.ts`],
                exclude: [
                    'node_modules',
                    this.libdir,
                ],
                compilerOptions: {
                    rootDir: this.srcdir,
                    outDir: this.libdir,
                    ...compilerOptionDefaults,
                },
            };
            this.tsconfig = new TypescriptConfig(this, util_1.deepMerge([baseTsconfig, options.tsconfig]));
        }
        this.gitignore.exclude(`/${this.libdir}`);
        (_p = this.npmignore) === null || _p === void 0 ? void 0 : _p.include(`/${this.libdir}`);
        this.gitignore.include(`/${this.srcdir}`);
        (_q = this.npmignore) === null || _q === void 0 ? void 0 : _q.exclude(`/${this.srcdir}`);
        (_r = this.npmignore) === null || _r === void 0 ? void 0 : _r.include(`/${this.libdir}/**/*.js`);
        (_s = this.npmignore) === null || _s === void 0 ? void 0 : _s.include(`/${this.libdir}/**/*.d.ts`);
        this.gitignore.exclude('/dist');
        (_t = this.npmignore) === null || _t === void 0 ? void 0 : _t.exclude('dist'); // jsii-pacmak expects this to be "dist" and not "/dist". otherwise it will tamper with it
        (_u = this.npmignore) === null || _u === void 0 ? void 0 : _u.exclude('/tsconfig.json');
        (_v = this.npmignore) === null || _v === void 0 ? void 0 : _v.exclude('/.github');
        (_w = this.npmignore) === null || _w === void 0 ? void 0 : _w.exclude('/.vscode');
        (_x = this.npmignore) === null || _x === void 0 ? void 0 : _x.exclude('/.idea');
        (_y = this.npmignore) === null || _y === void 0 ? void 0 : _y.exclude('/.projenrc.js');
        // tests are compiled to `lib/TESTDIR`, so we don't need jest to compile them for us.
        // just run them directly from javascript.
        if (this.jest && compiledTests) {
            this.addDevDeps('@types/jest');
            const testout = path.posix.relative(this.srcdir, this.testdir);
            const libtest = path.posix.join(this.libdir, testout);
            const srctest = this.testdir;
            this.jest.addTestMatch(`**/${libtest}/**/?(*.)+(spec|test).js?(x)`);
            this.jest.addWatchIgnorePattern(`/${this.srcdir}/`);
            const resolveSnapshotPath = (test, ext) => {
                const fullpath = test.replace(libtest, srctest);
                return path.join(path.dirname(fullpath), '__snapshots__', path.basename(fullpath, '.js') + '.ts' + ext);
            };
            const resolveTestPath = (snap, ext) => {
                const filename = path.basename(snap, '.ts' + ext) + '.js';
                const dir = path.dirname(path.dirname(snap)).replace(srctest, libtest);
                return path.join(dir, filename);
            };
            const resolver = new textfile_1.TextFile(this, path.posix.join(common_1.PROJEN_DIR, 'jest-snapshot-resolver.js'));
            resolver.addLine('const path = require("path");');
            resolver.addLine(`const libtest = "${libtest}";`);
            resolver.addLine(`const srctest= "${srctest}";`);
            resolver.addLine('module.exports = {');
            resolver.addLine(`  resolveSnapshotPath: ${resolveSnapshotPath.toString()},`);
            resolver.addLine(`  resolveTestPath: ${resolveTestPath.toString()},`);
            resolver.addLine('  testPathForConsistencyCheck: path.join(\'some\', \'__tests__\', \'example.test.js\')');
            resolver.addLine('};');
            this.jest.addSnapshotResolver(`./${resolver.path}`);
        }
        if (this.jest && !compiledTests) {
            this.jest.addTestMatch('**\/__tests__/**\/*.ts?(x)');
            this.jest.addTestMatch('**\/?(*.)+(spec|test).ts?(x)');
            // create a tsconfig for jest that does NOT include outDir and rootDir and
            // includes both "src" and "test" as inputs.
            const tsconfig = this.jest.generateTypescriptConfig({
                fileName: 'tsconfig.jest.json',
                include: [
                    common_1.PROJEN_RC,
                    `${this.srcdir}/**/*.ts`,
                    `${this.testdir}/**/*.ts`,
                ],
                exclude: [
                    'node_modules',
                ],
                compilerOptions: compilerOptionDefaults,
            });
            // if we test before compilation, remove the lib/ directory before running
            // tests so that we get a clean slate for testing.
            if (!compileBeforeTest) {
                // make sure to delete "lib" *before* running tests to ensure that
                // test code does not take a dependency on "lib" and instead on "src".
                this.testTask.prependExec(`rm -fr ${this.libdir}/`);
            }
            // compile test code
            this.testCompileTask.exec(`tsc --noEmit --project ${tsconfig.fileName}`);
        }
        if ((_z = options.eslint) !== null && _z !== void 0 ? _z : true) {
            this.eslint = new eslint_1.Eslint(this, {
                tsconfigPath: './tsconfig.eslint.json',
                dirs: [this.srcdir],
                devdirs: [this.testdir, 'build-tools'],
                fileExtensions: ['.ts', '.tsx'],
                ...options.eslintOptions,
            });
            new TypescriptConfig(this, {
                fileName: 'tsconfig.eslint.json',
                include: [
                    common_1.PROJEN_RC,
                    `${this.srcdir}/**/*.ts`,
                    `${this.testdir}/**/*.ts`,
                ],
                exclude: [
                    'node_modules',
                ],
                compilerOptions: compilerOptionDefaults,
            });
        }
        const tsver = options.typescriptVersion ? `@${options.typescriptVersion}` : '';
        this.addDevDeps(`typescript${tsver}`, `@types/node@^${(_0 = this.package.minNodeVersion) !== null && _0 !== void 0 ? _0 : '10.17.0'}`);
        // generate sample code in `src` and `lib` if these directories are empty or non-existent.
        if ((_1 = options.sampleCode) !== null && _1 !== void 0 ? _1 : true) {
            new SampleCode(this);
        }
        if (this.docgen) {
            new typescript_typedoc_1.TypedocDocgen(this);
        }
    }
}
exports.TypeScriptProject = TypeScriptProject;
_a = JSII_RTTI_SYMBOL_1;
TypeScriptProject[_a] = { fqn: "projen.TypeScriptProject", version: "0.16.40" };
/**
 * (experimental) Determines how modules get resolved.
 *
 * @see https://www.typescriptlang.org/docs/handbook/module-resolution.html
 * @experimental
 */
var TypeScriptModuleResolution;
(function (TypeScriptModuleResolution) {
    TypeScriptModuleResolution["CLASSIC"] = "classic";
    TypeScriptModuleResolution["NODE"] = "node";
})(TypeScriptModuleResolution = exports.TypeScriptModuleResolution || (exports.TypeScriptModuleResolution = {}));
/**
 * (experimental) Determines how JSX should get transformed into valid JavaScript.
 *
 * @see https://www.typescriptlang.org/docs/handbook/jsx.html
 * @experimental
 */
var TypeScriptJsxMode;
(function (TypeScriptJsxMode) {
    TypeScriptJsxMode["PRESERVE"] = "preserve";
    TypeScriptJsxMode["REACT"] = "react";
    TypeScriptJsxMode["REACT_NATIVE"] = "react-native";
    TypeScriptJsxMode["REACT_JSX"] = "react-jsx";
    TypeScriptJsxMode["REACT_JSXDEV"] = "react-jsxdev";
})(TypeScriptJsxMode = exports.TypeScriptJsxMode || (exports.TypeScriptJsxMode = {}));
/**
 * @experimental
 */
class TypescriptConfig {
    /**
     * @experimental
     */
    constructor(project, options) {
        var _e, _f, _g, _h;
        const fileName = (_e = options.fileName) !== null && _e !== void 0 ? _e : 'tsconfig.json';
        this.include = (_f = options.include) !== null && _f !== void 0 ? _f : ['**/*.ts'];
        this.exclude = (_g = options.exclude) !== null && _g !== void 0 ? _g : ['node_modules'];
        this.fileName = fileName;
        this.compilerOptions = options.compilerOptions;
        this.file = new json_1.JsonFile(project, fileName, {
            obj: {
                compilerOptions: this.compilerOptions,
                include: this.include,
                exclude: this.exclude,
            },
        });
        (_h = project.npmignore) === null || _h === void 0 ? void 0 : _h.exclude(`/${fileName}`);
    }
}
exports.TypescriptConfig = TypescriptConfig;
_b = JSII_RTTI_SYMBOL_1;
TypescriptConfig[_b] = { fqn: "projen.TypescriptConfig", version: "0.16.40" };
class SampleCode extends component_1.Component {
    constructor(project) {
        super(project);
        const srcCode = [
            'export class Hello {',
            '  public sayHello() {',
            '    return \'hello, world!\';',
            '  }',
            '}',
        ].join('\n');
        const testCode = [
            "import { Hello } from '../src';",
            '',
            "test('hello', () => {",
            "  expect(new Hello().sayHello()).toBe('hello, world!');",
            '});',
        ].join('\n');
        new sample_file_1.SampleDir(project, project.srcdir, {
            files: {
                'index.ts': srcCode,
            },
        });
        new sample_file_1.SampleDir(project, project.testdir, {
            files: {
                'hello.test.ts': testCode,
            },
        });
    }
}
/**
 * (experimental) TypeScript app.
 *
 * @experimental
 * @pjid typescript-app
 */
class TypeScriptAppProject extends TypeScriptProject {
    /**
     * @experimental
     */
    constructor(options) {
        super({
            allowLibraryDependencies: false,
            releaseWorkflow: false,
            entrypoint: '',
            package: false,
            ...options,
        });
    }
}
exports.TypeScriptAppProject = TypeScriptAppProject;
_c = JSII_RTTI_SYMBOL_1;
TypeScriptAppProject[_c] = { fqn: "projen.TypeScriptAppProject", version: "0.16.40" };
/**
 * @deprecated use `TypeScriptProject`
 */
class TypeScriptLibraryProject extends TypeScriptProject {
}
exports.TypeScriptLibraryProject = TypeScriptLibraryProject;
_d = JSII_RTTI_SYMBOL_1;
TypeScriptLibraryProject[_d] = { fqn: "projen.TypeScriptLibraryProject", version: "0.16.40" };
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkJBQTZCO0FBQzdCLHFDQUFpRDtBQUNqRCwyQ0FBd0M7QUFDeEMscUNBQWlEO0FBQ2pELGlDQUFrQztBQUNsQyxpREFBaUU7QUFDakUsK0NBQTBDO0FBQzFDLG1DQUE2QztBQUM3Qyx5Q0FBc0M7QUFDdEMsNkRBQXFEO0FBQ3JELGlDQUFtQzs7Ozs7OztBQStHbkMsTUFBYSxpQkFBa0IsU0FBUSwwQkFBVzs7OztJQStCaEQsWUFBWSxPQUFpQzs7UUFDM0MsS0FBSyxDQUFDO1lBQ0osR0FBRyxPQUFPO1lBQ1YsV0FBVyxFQUFFO2dCQUNYLEdBQUcsT0FBTyxDQUFDLFdBQVc7Z0JBQ3RCLFVBQVUsRUFBRTtvQkFDVixTQUFHLE9BQU8sQ0FBQyxXQUFXLDBDQUFFLFVBQVU7b0JBQ2xDLFNBQVMsRUFBRSxFQUFFO2lCQUNkO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTSxTQUFHLE9BQU8sQ0FBQyxNQUFNLG1DQUFJLEtBQUssQ0FBQztRQUN0QyxJQUFJLENBQUMsTUFBTSxTQUFHLE9BQU8sQ0FBQyxNQUFNLG1DQUFJLEtBQUssQ0FBQztRQUV0QyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDN0IsSUFBSSxDQUFDLGFBQWEsU0FBRyxPQUFPLENBQUMsYUFBYSxtQ0FBSSxPQUFPLENBQUM7UUFFdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUNyQyxXQUFXLEVBQUUsbUNBQW1DO1lBQ2hELFFBQVEsRUFBRSxvQkFBWSxDQUFDLEtBQUs7WUFDNUIsSUFBSSxFQUFFLFFBQVE7U0FDZixDQUFDLENB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QUMsQ0FBQztJQUNMLENBQUM7O0FBVEgsb0RBVUM7Ozs7OztBQUtELE1BQWEsd0JBQXlCLFNBQVEsaUJBQWlCOztBQUEvRCw0REFDQzs7O0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBQUk9KRU5fRElSLCBQUk9KRU5fUkMgfSBmcm9tICcuL2NvbW1vbic7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBFc2xpbnQsIEVzbGludE9wdGlvbnMgfSBmcm9tICcuL2VzbGludCc7XG5pbXBvcnQgeyBKc29uRmlsZSB9IGZyb20gJy4vanNvbic7XG5pbXBvcnQgeyBOb2RlUHJvamVjdCwgTm9kZVByb2plY3RPcHRpb25zIH0gZnJvbSAnLi9ub2RlLXByb2plY3QnO1xuaW1wb3J0IHsgU2FtcGxlRGlyIH0gZnJvbSAnLi9zYW1wbGUtZmlsZSc7XG5pbXBvcnQgeyBUYXNrLCBUYXNrQ2F0ZWdvcnkgfSBmcm9tICcuL3Rhc2tzJztcbmltcG9ydCB7IFRleHRGaWxlIH0gZnJvbSAnLi90ZXh0ZmlsZSc7XG5pbXBvcnQgeyBUeXBlZG9jRG9jZ2VuIH0gZnJvbSAnLi90eXBlc2NyaXB0LXR5cGVkb2MnO1xuaW1wb3J0IHsgZGVlcE1lcmdlIH0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBUeXBlU2NyaXB0UHJvamVjdE9wdGlvbnMgZXh0ZW5kcyBOb2RlUHJvamVjdE9wdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbGliZGlyPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzcmNkaXI/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHRlc3RkaXI/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBlc2xpbnQ/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgZXNsaW50T3B0aW9ucz86IEVzbGludE9wdGlvbnM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgdHlwZXNjcmlwdFZlcnNpb24/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGRvY2dlbj86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkb2NzRGlyZWN0b3J5Pzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB0c2NvbmZpZz86IFR5cGVzY3JpcHRDb25maWdPcHRpb25zO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkaXNhYmxlVHNjb25maWc/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBjb21waWxlQmVmb3JlVGVzdD86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzYW1wbGVDb2RlPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGVudHJ5cG9pbnRUeXBlcz86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBwYWNrYWdlPzogYm9vbGVhbjtcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFR5cGVTY3JpcHRQcm9qZWN0IGV4dGVuZHMgTm9kZVByb2plY3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgZG9jZ2VuPzogYm9vbGVhbjtcbiAgcHVibGljIHJlYWRvbmx5IGRvY3NEaXJlY3Rvcnk6IHN0cmluZztcbiAgcHVibGljIHJlYWRvbmx5IGVzbGludD86IEVzbGludDtcbiAgcHVibGljIHJlYWRvbmx5IHRzY29uZmlnPzogVHlwZXNjcmlwdENvbmZpZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBzcmNkaXI6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBsaWJkaXI6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHRlc3RkaXI6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgd2F0Y2hUYXNrOiBUYXNrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBwYWNrYWdlVGFzaz86IFRhc2s7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogVHlwZVNjcmlwdFByb2plY3RPcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGplc3RPcHRpb25zOiB7XG4gICAgICAgIC4uLm9wdGlvbnMuamVzdE9wdGlvbnMsXG4gICAgICAgIGplc3RDb25maWc6IHtcbiAgICAgICAgICAuLi5vcHRpb25zLmplc3RPcHRpb25zPy5qZXN0Q29uZmlnLFxuICAgICAgICAgIHRlc3RNYXRjaDogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5zcmNkaXIgPSBvcHRpb25zLnNyY2RpciA/PyAnc3JjJztcbiAgICB0aGlzLmxpYmRpciA9IG9wdGlvbnMubGliZGlyID8/ICdsaWInO1xuXG4gICAgdGhpcy5kb2NnZW4gPSBvcHRpb25zLmRvY2dlbjtcbiAgICB0aGlzLmRvY3NEaXJlY3RvcnkgPSBvcHRpb25zLmRvY3NEaXJlY3RvcnkgPz8gJ2RvY3MvJztcblxuICAgIHRoaXMuY29tcGlsZVRhc2suZXhlYygndHNjJyk7XG5cbiAgICB0aGlzLndhdGNoVGFzayA9IHRoaXMuYWRkVGFzaygnd2F0Y2gnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1dhdGNoICYgY29tcGlsZSBpbiB0aGUgYmFja2dyb3VuZCcsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LkJVSUxELFxuICAgICAgZXhlYzogJ3RzYyAtdycsXG4gICAgfSk7XG5cbiAgICB0aGlzLnRlc3RkaXIgPSBvcHRpb25zLnRlc3RkaXIgPz8gJ3Rlc3QnO1xuICAgIHRoaXMuZ2l0aWdub3JlLmluY2x1ZGUoYC8ke3RoaXMudGVzdGRpcn1gKTtcbiAgICB0aGlzLm5wbWlnbm9yZT8uZXhjbHVkZShgLyR7dGhpcy50ZXN0ZGlyfWApO1xuXG4gICAgLy8gaWYgdGhlIHRlc3QgZGlyZWN0b3J5IGlzIHVuZGVyIGBzcmMvYCwgdGhlbiB3ZSB3aWxsIHJ1biBvdXIgdGVzdHMgYWdhaW5zdFxuICAgIC8vIHRoZSBqYXZhc2NyaXB0IGZpbGVzIGFuZCBub3QgbGV0IGplc3QgY29tcGlsZSBpdCBmb3IgdXMuXG4gICAgY29uc3QgY29tcGlsZWRUZXN0cyA9IHRoaXMudGVzdGRpci5zdGFydHNXaXRoKHRoaXMuc3JjZGlyICsgcGF0aC5wb3NpeC5zZXApO1xuXG4gICAgLy8gYnkgZGVmYXVsdCwgd2UgZmlyc3QgcnVuIHRlc3RzIChqZXN0IGNvbXBpbGVzIHRoZSB0eXBlc2NyaXB0IGluIHRoZSBiYWNrZ3JvdW5kKSBhbmQgb25seSB0aGVuIHdlIGNvbXBpbGUuXG4gICAgY29uc3QgY29tcGlsZUJlZm9yZVRlc3QgPSBvcHRpb25zLmNvbXBpbGVCZWZvcmVUZXN0ID8/IGNvbXBpbGVkVGVzdHM7XG5cbiAgICBpZiAoY29tcGlsZUJlZm9yZVRlc3QpIHtcbiAgICAgIHRoaXMuYnVpbGRUYXNrLnNwYXduKHRoaXMuY29tcGlsZVRhc2spO1xuICAgICAgdGhpcy5idWlsZFRhc2suc3Bhd24odGhpcy50ZXN0VGFzayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVpbGRUYXNrLnNwYXduKHRoaXMudGVzdFRhc2spO1xuICAgICAgdGhpcy5idWlsZFRhc2suc3Bhd24odGhpcy5jb21waWxlVGFzayk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucGFja2FnZSA/PyB0cnVlKSB7XG4gICAgICB0aGlzLnBhY2thZ2VUYXNrID0gdGhpcy5hZGRUYXNrKCdwYWNrYWdlJywge1xuICAgICAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhbiBucG0gdGFyYmFsbCcsXG4gICAgICAgIGNhdGVnb3J5OiBUYXNrQ2F0ZWdvcnkuUkVMRUFTRSxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnBhY2thZ2VUYXNrLmV4ZWMoJ3JtIC1mciBkaXN0Jyk7XG4gICAgICB0aGlzLnBhY2thZ2VUYXNrLmV4ZWMoJ21rZGlyIC1wIGRpc3QvanMnKTtcbiAgICAgIHRoaXMucGFja2FnZVRhc2suZXhlYyhgJHt0aGlzLnBhY2thZ2UucGFja2FnZU1hbmFnZXJ9IHBhY2tgKTtcbiAgICAgIHRoaXMucGFja2FnZVRhc2suZXhlYygnbXYgKi50Z3ogZGlzdC9qcy8nKTtcblxuICAgICAgdGhpcy5idWlsZFRhc2suc3Bhd24odGhpcy5wYWNrYWdlVGFzayk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZW50cnlwb2ludFR5cGVzIHx8IHRoaXMuZW50cnlwb2ludCAhPT0gJycpIHtcbiAgICAgIGNvbnN0IGVudHJ5cG9pbnRUeXBlcyA9IG9wdGlvbnMuZW50cnlwb2ludFR5cGVzID8/IGAke3BhdGguam9pbihwYXRoLmRpcm5hbWUodGhpcy5lbnRyeXBvaW50KSwgcGF0aC5iYXNlbmFtZSh0aGlzLmVudHJ5cG9pbnQsICcuanMnKSkucmVwbGFjZSgvXFxcXC9nLCAnLycpfS5kLnRzYDtcbiAgICAgIHRoaXMucGFja2FnZS5hZGRGaWVsZCgndHlwZXMnLCBlbnRyeXBvaW50VHlwZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbXBpbGVyT3B0aW9uRGVmYXVsdHM6IFR5cGVTY3JpcHRDb21waWxlck9wdGlvbnMgPSB7XG4gICAgICBhbHdheXNTdHJpY3Q6IHRydWUsXG4gICAgICBkZWNsYXJhdGlvbjogdHJ1ZSxcbiAgICAgIGV4cGVyaW1lbnRhbERlY29yYXRvcnM6IHRydWUsXG4gICAgICBpbmxpbmVTb3VyY2VNYXA6IHRydWUsXG4gICAgICBpbmxpbmVTb3VyY2VzOiB0cnVlLFxuICAgICAgbGliOiBbJ2VzMjAxOCddLFxuICAgICAgbW9kdWxlOiAnQ29tbW9uSlMnLFxuICAgICAgbm9FbWl0T25FcnJvcjogZmFsc2UsXG4gICAgICBub0ZhbGx0aHJvdWdoQ2FzZXNJblN3aXRjaDogdHJ1ZSxcbiAgICAgIG5vSW1wbGljaXRBbnk6IHRydWUsXG4gICAgICBub0ltcGxpY2l0UmV0dXJuczogdHJ1ZSxcbiAgICAgIG5vSW1wbGljaXRUaGlzOiB0cnVlLFxuICAgICAgbm9VbnVzZWRMb2NhbHM6IHRydWUsXG4gICAgICBub1VudXNlZFBhcmFtZXRlcnM6IHRydWUsXG4gICAgICByZXNvbHZlSnNvbk1vZHVsZTogdHJ1ZSxcbiAgICAgIHN0cmljdDogdHJ1ZSxcbiAgICAgIHN0cmljdE51bGxDaGVja3M6IHRydWUsXG4gICAgICBzdHJpY3RQcm9wZXJ0eUluaXRpYWxpemF0aW9uOiB0cnVlLFxuICAgICAgc3RyaXBJbnRlcm5hbDogdHJ1ZSxcbiAgICAgIHRhcmdldDogJ0VTMjAxOCcsXG4gICAgfTtcblxuICAgIGlmICghb3B0aW9ucy5kaXNhYmxlVHNjb25maWcpIHtcbiAgICAgIGNvbnN0IGJhc2VUc2NvbmZpZzogVHlwZXNjcmlwdENvbmZpZ09wdGlvbnMgPSB7XG4gICAgICAgIGluY2x1ZGU6IFtgJHt0aGlzLnNyY2Rpcn0vKiovKi50c2BdLFxuICAgICAgICBleGNsdWRlOiBbXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcycsXG4gICAgICAgICAgdGhpcy5saWJkaXIsXG4gICAgICAgIF0sXG4gICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgIHJvb3REaXI6IHRoaXMuc3JjZGlyLFxuICAgICAgICAgIG91dERpcjogdGhpcy5saWJkaXIsXG4gICAgICAgICAgLi4uY29tcGlsZXJPcHRpb25EZWZhdWx0cyxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgICB0aGlzLnRzY29uZmlnID0gbmV3IFR5cGVzY3JpcHRDb25maWcodGhpcyxcbiAgICAgICAgZGVlcE1lcmdlKFtiYXNlVHNjb25maWcsIG9wdGlvbnMudHNjb25maWddKSBhcyBUeXBlc2NyaXB0Q29uZmlnT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdGhpcy5naXRpZ25vcmUuZXhjbHVkZShgLyR7dGhpcy5saWJkaXJ9YCk7XG4gICAgdGhpcy5ucG1pZ25vcmU/LmluY2x1ZGUoYC8ke3RoaXMubGliZGlyfWApO1xuXG4gICAgdGhpcy5naXRpZ25vcmUuaW5jbHVkZShgLyR7dGhpcy5zcmNkaXJ9YCk7XG4gICAgdGhpcy5ucG1pZ25vcmU/LmV4Y2x1ZGUoYC8ke3RoaXMuc3JjZGlyfWApO1xuXG4gICAgdGhpcy5ucG1pZ25vcmU/LmluY2x1ZGUoYC8ke3RoaXMubGliZGlyfS8qKi8qLmpzYCk7XG4gICAgdGhpcy5ucG1pZ25vcmU/LmluY2x1ZGUoYC8ke3RoaXMubGliZGlyfS8qKi8qLmQudHNgKTtcblxuICAgIHRoaXMuZ2l0aWdub3JlLmV4Y2x1ZGUoJy9kaXN0Jyk7XG4gICAgdGhpcy5ucG1pZ25vcmU/LmV4Y2x1ZGUoJ2Rpc3QnKTsgLy8ganNpaS1wYWNtYWsgZXhwZWN0cyB0aGlzIHRvIGJlIFwiZGlzdFwiIGFuZCBub3QgXCIvZGlzdFwiLiBvdGhlcndpc2UgaXQgd2lsbCB0YW1wZXIgd2l0aCBpdFxuXG4gICAgdGhpcy5ucG1pZ25vcmU/LmV4Y2x1ZGUoJy90c2NvbmZpZy5qc29uJyk7XG4gICAgdGhpcy5ucG1pZ25vcmU/LmV4Y2x1ZGUoJy8uZ2l0aHViJyk7XG4gICAgdGhpcy5ucG1pZ25vcmU/LmV4Y2x1ZGUoJy8udnNjb2RlJyk7XG4gICAgdGhpcy5ucG1pZ25vcmU/LmV4Y2x1ZGUoJy8uaWRlYScpO1xuICAgIHRoaXMubnBtaWdub3JlPy5leGNsdWRlKCcvLnByb2plbnJjLmpzJyk7XG5cbiAgICAvLyB0ZXN0cyBhcmUgY29tcGlsZWQgdG8gYGxpYi9URVNURElSYCwgc28gd2UgZG9uJ3QgbmVlZCBqZXN0IHRvIGNvbXBpbGUgdGhlbSBmb3IgdXMuXG4gICAgLy8ganVzdCBydW4gdGhlbSBkaXJlY3RseSBmcm9tIGphdmFzY3JpcHQuXG4gICAgaWYgKHRoaXMuamVzdCAmJiBjb21waWxlZFRlc3RzKSB7XG4gICAgICB0aGlzLmFkZERldkRlcHMoJ0B0eXBlcy9qZXN0Jyk7XG5cbiAgICAgIGNvbnN0IHRlc3RvdXQgPSBwYXRoLnBvc2l4LnJlbGF0aXZlKHRoaXMuc3JjZGlyLCB0aGlzLnRlc3RkaXIpO1xuICAgICAgY29uc3QgbGlidGVzdCA9IHBhdGgucG9zaXguam9pbih0aGlzLmxpYmRpciwgdGVzdG91dCk7XG4gICAgICBjb25zdCBzcmN0ZXN0ID0gdGhpcy50ZXN0ZGlyO1xuXG4gICAgICB0aGlzLmplc3QuYWRkVGVzdE1hdGNoKGAqKi8ke2xpYnRlc3R9LyoqLz8oKi4pKyhzcGVjfHRlc3QpLmpzPyh4KWApO1xuICAgICAgdGhpcy5qZXN0LmFkZFdhdGNoSWdub3JlUGF0dGVybihgLyR7dGhpcy5zcmNkaXJ9L2ApO1xuXG4gICAgICBjb25zdCByZXNvbHZlU25hcHNob3RQYXRoID0gKHRlc3Q6IHN0cmluZywgZXh0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZnVsbHBhdGggPSB0ZXN0LnJlcGxhY2UobGlidGVzdCwgc3JjdGVzdCk7XG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKGZ1bGxwYXRoKSwgJ19fc25hcHNob3RzX18nLCBwYXRoLmJhc2VuYW1lKGZ1bGxwYXRoLCAnLmpzJykgKyAnLnRzJyArIGV4dCk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNvbHZlVGVzdFBhdGggPSAoc25hcDogc3RyaW5nLCBleHQ6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoc25hcCwgJy50cycgKyBleHQpICsgJy5qcyc7XG4gICAgICAgIGNvbnN0IGRpciA9IHBhdGguZGlybmFtZShwYXRoLmRpcm5hbWUoc25hcCkpLnJlcGxhY2Uoc3JjdGVzdCwgbGlidGVzdCk7XG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4oZGlyLCBmaWxlbmFtZSk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNvbHZlciA9IG5ldyBUZXh0RmlsZSh0aGlzLCBwYXRoLnBvc2l4LmpvaW4oUFJPSkVOX0RJUiwgJ2plc3Qtc25hcHNob3QtcmVzb2x2ZXIuanMnKSk7XG4gICAgICByZXNvbHZlci5hZGRMaW5lKCdjb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7Jyk7XG4gICAgICByZXNvbHZlci5hZGRMaW5lKGBjb25zdCBsaWJ0ZXN0ID0gXCIke2xpYnRlc3R9XCI7YCk7XG4gICAgICByZXNvbHZlci5hZGRMaW5lKGBjb25zdCBzcmN0ZXN0PSBcIiR7c3JjdGVzdH1cIjtgKTtcbiAgICAgIHJlc29sdmVyLmFkZExpbmUoJ21vZHVsZS5leHBvcnRzID0geycpO1xuICAgICAgcmVzb2x2ZXIuYWRkTGluZShgICByZXNvbHZlU25hcHNob3RQYXRoOiAke3Jlc29sdmVTbmFwc2hvdFBhdGgudG9TdHJpbmcoKX0sYCk7XG4gICAgICByZXNvbHZlci5hZGRMaW5lKGAgIHJlc29sdmVUZXN0UGF0aDogJHtyZXNvbHZlVGVzdFBhdGgudG9TdHJpbmcoKX0sYCk7XG4gICAgICByZXNvbHZlci5hZGRMaW5lKCcgIHRlc3RQYXRoRm9yQ29uc2lzdGVuY3lDaGVjazogcGF0aC5qb2luKFxcJ3NvbWVcXCcsIFxcJ19fdGVzdHNfX1xcJywgXFwnZXhhbXBsZS50ZXN0LmpzXFwnKScpO1xuICAgICAgcmVzb2x2ZXIuYWRkTGluZSgnfTsnKTtcblxuICAgICAgdGhpcy5qZXN0LmFkZFNuYXBzaG90UmVzb2x2ZXIoYC4vJHtyZXNvbHZlci5wYXRofWApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmplc3QgJiYgIWNvbXBpbGVkVGVzdHMpIHtcbiAgICAgIHRoaXMuamVzdC5hZGRUZXN0TWF0Y2goJyoqXFwvX190ZXN0c19fLyoqXFwvKi50cz8oeCknKTtcbiAgICAgIHRoaXMuamVzdC5hZGRUZXN0TWF0Y2goJyoqXFwvPygqLikrKHNwZWN8dGVzdCkudHM/KHgpJyk7XG4gICAgICAvLyBjcmVhdGUgYSB0c2NvbmZpZyBmb3IgamVzdCB0aGF0IGRvZXMgTk9UIGluY2x1ZGUgb3V0RGlyIGFuZCByb290RGlyIGFuZFxuICAgICAgLy8gaW5jbHVkZXMgYm90aCBcInNyY1wiIGFuZCBcInRlc3RcIiBhcyBpbnB1dHMuXG4gICAgICBjb25zdCB0c2NvbmZpZyA9IHRoaXMuamVzdC5nZW5lcmF0ZVR5cGVzY3JpcHRDb25maWcoe1xuICAgICAgICBmaWxlTmFtZTogJ3RzY29uZmlnLmplc3QuanNvbicsXG4gICAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgICBQUk9KRU5fUkMsXG4gICAgICAgICAgYCR7dGhpcy5zcmNkaXJ9LyoqLyoudHNgLFxuICAgICAgICAgIGAke3RoaXMudGVzdGRpcn0vKiovKi50c2AsXG4gICAgICAgIF0sXG4gICAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzJyxcbiAgICAgICAgXSxcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiBjb21waWxlck9wdGlvbkRlZmF1bHRzLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIGlmIHdlIHRlc3QgYmVmb3JlIGNvbXBpbGF0aW9uLCByZW1vdmUgdGhlIGxpYi8gZGlyZWN0b3J5IGJlZm9yZSBydW5uaW5nXG4gICAgICAvLyB0ZXN0cyBzbyB0aGF0IHdlIGdldCBhIGNsZWFuIHNsYXRlIGZvciB0ZXN0aW5nLlxuICAgICAgaWYgKCFjb21waWxlQmVmb3JlVGVzdCkge1xuICAgICAgICAvLyBtYWtlIHN1cmUgdG8gZGVsZXRlIFwibGliXCIgKmJlZm9yZSogcnVubmluZyB0ZXN0cyB0byBlbnN1cmUgdGhhdFxuICAgICAgICAvLyB0ZXN0IGNvZGUgZG9lcyBub3QgdGFrZSBhIGRlcGVuZGVuY3kgb24gXCJsaWJcIiBhbmQgaW5zdGVhZCBvbiBcInNyY1wiLlxuICAgICAgICB0aGlzLnRlc3RUYXNrLnByZXBlbmRFeGVjKGBybSAtZnIgJHt0aGlzLmxpYmRpcn0vYCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbXBpbGUgdGVzdCBjb2RlXG4gICAgICB0aGlzLnRlc3RDb21waWxlVGFzay5leGVjKGB0c2MgLS1ub0VtaXQgLS1wcm9qZWN0ICR7dHNjb25maWcuZmlsZU5hbWV9YCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZXNsaW50ID8/IHRydWUpIHtcbiAgICAgIHRoaXMuZXNsaW50ID0gbmV3IEVzbGludCh0aGlzLCB7XG4gICAgICAgIHRzY29uZmlnUGF0aDogJy4vdHNjb25maWcuZXNsaW50Lmpzb24nLFxuICAgICAgICBkaXJzOiBbdGhpcy5zcmNkaXJdLFxuICAgICAgICBkZXZkaXJzOiBbdGhpcy50ZXN0ZGlyLCAnYnVpbGQtdG9vbHMnXSxcbiAgICAgICAgZmlsZUV4dGVuc2lvbnM6IFsnLnRzJywgJy50c3gnXSxcbiAgICAgICAgLi4ub3B0aW9ucy5lc2xpbnRPcHRpb25zLFxuICAgICAgfSk7XG5cbiAgICAgIG5ldyBUeXBlc2NyaXB0Q29uZmlnKHRoaXMsIHtcbiAgICAgICAgZmlsZU5hbWU6ICd0c2NvbmZpZy5lc2xpbnQuanNvbicsXG4gICAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgICBQUk9KRU5fUkMsXG4gICAgICAgICAgYCR7dGhpcy5zcmNkaXJ9LyoqLyoudHNgLFxuICAgICAgICAgIGAke3RoaXMudGVzdGRpcn0vKiovKi50c2AsXG4gICAgICAgIF0sXG4gICAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzJyxcbiAgICAgICAgXSxcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiBjb21waWxlck9wdGlvbkRlZmF1bHRzLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgdHN2ZXIgPSBvcHRpb25zLnR5cGVzY3JpcHRWZXJzaW9uID8gYEAke29wdGlvbnMudHlwZXNjcmlwdFZlcnNpb259YCA6ICcnO1xuXG4gICAgdGhpcy5hZGREZXZEZXBzKFxuICAgICAgYHR5cGVzY3JpcHQke3RzdmVyfWAsXG4gICAgICBgQHR5cGVzL25vZGVAXiR7dGhpcy5wYWNrYWdlLm1pbk5vZGVWZXJzaW9uID8/ICcxMC4xNy4wJ31gLCAvLyBpbnN0YWxsIHRoZSBtaW5pbXVtIHZlcnNpb24gdG8gZW5zdXJlIGNvbXBhdGliaWxpdHlcbiAgICApO1xuXG4gICAgLy8gZ2VuZXJhdGUgc2FtcGxlIGNvZGUgaW4gYHNyY2AgYW5kIGBsaWJgIGlmIHRoZXNlIGRpcmVjdG9yaWVzIGFyZSBlbXB0eSBvciBub24tZXhpc3RlbnQuXG4gICAgaWYgKG9wdGlvbnMuc2FtcGxlQ29kZSA/PyB0cnVlKSB7XG4gICAgICBuZXcgU2FtcGxlQ29kZSh0aGlzKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kb2NnZW4pIHtcbiAgICAgIG5ldyBUeXBlZG9jRG9jZ2VuKHRoaXMpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFR5cGVzY3JpcHRDb25maWdPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGZpbGVOYW1lPzogc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGluY2x1ZGU/OiBzdHJpbmdbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgZXhjbHVkZT86IHN0cmluZ1tdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBjb21waWxlck9wdGlvbnM6IFR5cGVTY3JpcHRDb21waWxlck9wdGlvbnM7XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGVudW0gVHlwZVNjcmlwdE1vZHVsZVJlc29sdXRpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIENMQVNTSUMgPSAnY2xhc3NpYycsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgTk9ERSA9ICdub2RlJ1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGVudW0gVHlwZVNjcmlwdEpzeE1vZGUge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBQUkVTRVJWRSA9ICdwcmVzZXJ2ZScsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIFJFQUNUID0gJ3JlYWN0JyxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIFJFQUNUX05BVElWRSA9ICdyZWFjdC1uYXRpdmUnLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBSRUFDVF9KU1ggPSAncmVhY3QtanN4JyxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBSRUFDVF9KU1hERVYgPSAncmVhY3QtanN4ZGV2Jyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUeXBlU2NyaXB0Q29tcGlsZXJPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGFsbG93SnM/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBhbHdheXNTdHJpY3Q/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkZWNsYXJhdGlvbkRpcj86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkZWNsYXJhdGlvbj86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgZXNNb2R1bGVJbnRlcm9wPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBleHBlcmltZW50YWxEZWNvcmF0b3JzPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBmb3JjZUNvbnNpc3RlbnRDYXNpbmdJbkZpbGVOYW1lcz86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBpbmxpbmVTb3VyY2VNYXA/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgaW5saW5lU291cmNlcz86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBpc29sYXRlZE1vZHVsZXM/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBqc3g/OiBUeXBlU2NyaXB0SnN4TW9kZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbGliPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IG1vZHVsZT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBtb2R1bGVSZXNvbHV0aW9uPzogVHlwZVNjcmlwdE1vZHVsZVJlc29sdXRpb247XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IG5vRW1pdD86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBub0VtaXRPbkVycm9yPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBub0ZhbGx0aHJvdWdoQ2FzZXNJblN3aXRjaD86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbm9JbXBsaWNpdEFueT86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBub0ltcGxpY2l0UmV0dXJucz86IGJvb2xlYW47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbm9JbXBsaWNpdFRoaXM/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbm9VbnVzZWRMb2NhbHM/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBub1VudXNlZFBhcmFtZXRlcnM/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHJlc29sdmVKc29uTW9kdWxlPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgc2tpcExpYkNoZWNrPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzdHJpY3Q/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHN0cmljdE51bGxDaGVja3M/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzdHJpY3RQcm9wZXJ0eUluaXRpYWxpemF0aW9uPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzdHJpcEludGVybmFsPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgdGFyZ2V0Pzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgb3V0RGlyPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSByb290RGlyPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgYWxsb3dTeW50aGV0aWNEZWZhdWx0SW1wb3J0cz86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBUeXBlc2NyaXB0Q29uZmlnIHtcbiAgcHVibGljIHJlYWRvbmx5IGNvbXBpbGVyT3B0aW9uczogVHlwZVNjcmlwdENvbXBpbGVyT3B0aW9ucztcbiAgcHVibGljIHJlYWRvbmx5IGluY2x1ZGU6IHN0cmluZ1tdO1xuICBwdWJsaWMgcmVhZG9ubHkgZXhjbHVkZTogc3RyaW5nW107XG4gIHB1YmxpYyByZWFkb25seSBmaWxlTmFtZTogc3RyaW5nO1xuICBwdWJsaWMgcmVhZG9ubHkgZmlsZTogSnNvbkZpbGU7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogTm9kZVByb2plY3QsIG9wdGlvbnM6IFR5cGVzY3JpcHRDb25maWdPcHRpb25zKSB7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBvcHRpb25zLmZpbGVOYW1lID8/ICd0c2NvbmZpZy5qc29uJztcblxuICAgIHRoaXMuaW5jbHVkZSA9IG9wdGlvbnMuaW5jbHVkZSA/PyBbJyoqLyoudHMnXTtcbiAgICB0aGlzLmV4Y2x1ZGUgPSBvcHRpb25zLmV4Y2x1ZGUgPz8gWydub2RlX21vZHVsZXMnXTtcbiAgICB0aGlzLmZpbGVOYW1lID0gZmlsZU5hbWU7XG5cbiAgICB0aGlzLmNvbXBpbGVyT3B0aW9ucyA9IG9wdGlvbnMuY29tcGlsZXJPcHRpb25zO1xuXG4gICAgdGhpcy5maWxlID0gbmV3IEpzb25GaWxlKHByb2plY3QsIGZpbGVOYW1lLCB7XG4gICAgICBvYmo6IHtcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiB0aGlzLmNvbXBpbGVyT3B0aW9ucyxcbiAgICAgICAgaW5jbHVkZTogdGhpcy5pbmNsdWRlLFxuICAgICAgICBleGNsdWRlOiB0aGlzLmV4Y2x1ZGUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgcHJvamVjdC5ucG1pZ25vcmU/LmV4Y2x1ZGUoYC8ke2ZpbGVOYW1lfWApO1xuICB9XG59XG5cblxuY2xhc3MgU2FtcGxlQ29kZSBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFR5cGVTY3JpcHRQcm9qZWN0KSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG4gICAgY29uc3Qgc3JjQ29kZSA9IFtcbiAgICAgICdleHBvcnQgY2xhc3MgSGVsbG8geycsXG4gICAgICAnICBwdWJsaWMgc2F5SGVsbG8oKSB7JyxcbiAgICAgICcgICAgcmV0dXJuIFxcJ2hlbGxvLCB3b3JsZCFcXCc7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJ30nLFxuICAgIF0uam9pbignXFxuJyk7XG5cbiAgICBjb25zdCB0ZXN0Q29kZSA9IFtcbiAgICAgIFwiaW1wb3J0IHsgSGVsbG8gfSBmcm9tICcuLi9zcmMnO1wiLFxuICAgICAgJycsXG4gICAgICBcInRlc3QoJ2hlbGxvJywgKCkgPT4ge1wiLFxuICAgICAgXCIgIGV4cGVjdChuZXcgSGVsbG8oKS5zYXlIZWxsbygpKS50b0JlKCdoZWxsbywgd29ybGQhJyk7XCIsXG4gICAgICAnfSk7JyxcbiAgICBdLmpvaW4oJ1xcbicpO1xuXG4gICAgbmV3IFNhbXBsZURpcihwcm9qZWN0LCBwcm9qZWN0LnNyY2Rpciwge1xuICAgICAgZmlsZXM6IHtcbiAgICAgICAgJ2luZGV4LnRzJzogc3JjQ29kZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBuZXcgU2FtcGxlRGlyKHByb2plY3QsIHByb2plY3QudGVzdGRpciwge1xuICAgICAgZmlsZXM6IHtcbiAgICAgICAgJ2hlbGxvLnRlc3QudHMnOiB0ZXN0Q29kZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBUeXBlU2NyaXB0QXBwUHJvamVjdCBleHRlbmRzIFR5cGVTY3JpcHRQcm9qZWN0IHtcbiAgY29uc3RydWN0b3Iob3B0aW9uczogVHlwZVNjcmlwdFByb2plY3RPcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgYWxsb3dMaWJyYXJ5RGVwZW5kZW5jaWVzOiBmYWxzZSxcbiAgICAgIHJlbGVhc2VXb3JrZmxvdzogZmFsc2UsXG4gICAgICBlbnRyeXBvaW50OiAnJywgLy8gXCJtYWluXCIgaXMgbm90IG5lZWRlZCBpbiB0eXBlc2NyaXB0IGFwcHNcbiAgICAgIHBhY2thZ2U6IGZhbHNlLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgfVxufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgVHlwZVNjcmlwdExpYnJhcnlQcm9qZWN0IGV4dGVuZHMgVHlwZVNjcmlwdFByb2plY3Qge1xufTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIFR5cGVTY3JpcHRMaWJyYXJ5UHJvamVjdE9wdGlvbnMgZXh0ZW5kcyBUeXBlU2NyaXB0UHJvamVjdE9wdGlvbnMge1xufVxuIl19