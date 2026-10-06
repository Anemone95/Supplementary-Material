"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonProject = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const project_1 = require("../project");
const pip_1 = require("./pip");
const poetry_1 = require("./poetry");
const pytest_1 = require("./pytest");
const python_sample_1 = require("./python-sample");
const setuptools_1 = require("./setuptools");
const venv_1 = require("./venv");
/** Allowed characters in python project names */
const PYTHON_PROJECT_NAME_REGEX = /^[A-Za-z0-9-_\.]+$/;
/**
 * (experimental) Python project.
 *
 * @experimental
 * @pjid python
 */
class PythonProject extends project_1.Project {
    /**
     * @experimental
     */
    constructor(options) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        super(options);
        if (!PYTHON_PROJECT_NAME_REGEX.test(options.name)) {
            throw new Error('Python projects must only consist of alphanumeric characters, hyphens, and underscores.');
        }
        this.moduleName = options.moduleName;
        this.version = options.version;
        if ((_b = options.venv) !== null && _b !== void 0 ? _b : true) {
            this.envManager = new venv_1.Venv(this);
        }
        if ((_c = options.pip) !== null && _c !== void 0 ? _c : true) {
            this.depsManager = new pip_1.Pip(this);
        }
        if ((_d = options.setuptools) !== null && _d !== void 0 ? _d : (this.projectType === project_1.ProjectType.LIB)) {
            this.packagingManager = new setuptools_1.Setuptools(this, {
                version: options.version,
                description: options.description,
                authorName: options.authorName,
                authorEmail: options.authorEmail,
                license: options.license,
                homepage: options.homepage,
                classifiers: options.classifiers,
                setupConfig: options.setupConfig,
            });
        }
        // if (options.conda ?? false) {
        //   this.depsManager = new Conda(this, options);
        //   this.envManager = this.depsManager;
        // }
        // if (options.pipenv ?? false) {
        //   this.depsManager = new Pipenv(this, options);
        //   this.envManager = this.depsManager;
        // }
        if ((_e = options.poetry) !== null && _e !== void 0 ? _e : false) {
            const poetry = new poetry_1.Poetry(this, {
                version: options.version,
                description: options.description,
                authorName: options.authorName,
                authorEmail: options.authorEmail,
                license: options.license,
                homepage: options.homepage,
                classifiers: options.classifiers,
                poetryOptions: {
                    readme: (_g = (_f = options.readme) === null || _f === void 0 ? void 0 : _f.filename) !== null && _g !== void 0 ? _g : 'README.md',
                    ...options.poetryOptions,
                },
            });
            this.depsManager = poetry;
            this.envManager = poetry;
            this.packagingManager = poetry;
        }
        if (!this.envManager) {
            throw new Error('At least one tool must be chosen for managing the environment (venv, conda, pipenv, or poetry).');
        }
        if (!this.depsManager) {
            throw new Error('At least one tool must be chosen for managing dependencies (pip, conda, pipenv, or poetry).');
        }
        if (!this.packagingManager && this.projectType === project_1.ProjectType.LIB) {
            throw new Error('At least one tool must be chosen for managing packaging (setuptools or poetry).');
        }
        if (Number((_h = options.venv) !== null && _h !== void 0 ? _h : true) + Number((_j = options.poetry) !== null && _j !== void 0 ? _j : false) > 1) {
            throw new Error('More than one component has been chosen for managing the environment (venv, conda, pipenv, or poetry)');
        }
        if (Number((_k = options.pip) !== null && _k !== void 0 ? _k : true) + Number((_l = options.poetry) !== null && _l !== void 0 ? _l : false) > 1) {
            throw new Error('More than one component has been chosen for managing dependencies (pip, conda, pipenv, or poetry)');
        }
        if (Number((_m = options.setuptools) !== null && _m !== void 0 ? _m : true) + Number((_o = options.poetry) !== null && _o !== void 0 ? _o : false) > 1) {
            throw new Error('More than one component has been chosen for managing packaging (setuptools or poetry)');
        }
        if ((_p = options.pytest) !== null && _p !== void 0 ? _p : true) {
            this.pytest = new pytest_1.Pytest(this, options.pytestOptions);
        }
        if ((_q = options.sample) !== null && _q !== void 0 ? _q : true) {
            new python_sample_1.PythonSample(this, {});
        }
        for (const dep of (_r = options.deps) !== null && _r !== void 0 ? _r : []) {
            this.addDependency(dep);
        }
        for (const dep of (_s = options.devDeps) !== null && _s !== void 0 ? _s : []) {
            this.addDevDependency(dep);
        }
        this.addDefaultGitIgnore();
    }
    /**
     * Adds default gitignore options for a Python project based on
     * https://github.com/github/gitignore/blob/master/Python.gitignore
     */
    addDefaultGitIgnore() {
        this.gitignore.exclude('# Byte-compiled / optimized / DLL files', '__pycache__/', '*.py[cod]', '*$py.class', '', '# C extensions', '*.so', '', '# Distribution / packaging', '.Python', 'build/', 'develop-eggs/', 'dist/', 'downloads/', 'eggs/', '.eggs/', 'lib/', 'lib64/', 'parts/', 'sdist/', 'var/', 'wheels/', 'share/python-wheels/', '*.egg-info/', '.installed.cfg', '*.egg', 'MANIFEST', '', '# PyInstaller', '#  Usually these files are written by a python script from a template', '#  before PyInstaller builds the exe, so as to inject date/other infos into it.', '*.manifest', '*.spec', '', '# Installer logs', 'pip-log.txt', 'pip-delete-this-directory.txt', '', '# Unit test / coverage reports', 'htmlcov/', '.tox/', '.nox/', '.coverage', '.coverage.*', '.cache', 'nosetests.xml', 'coverage.xml', '*.cover', '*.py,cover', '.hypothesis/', '.pytest_cache/', 'cover/', '', '# Translations', '*.mo', '*.pot', '', '# Django stuff:', '*.log', 'local_settings.py', 'db.sqlite3', 'db.sqlite3-journal', '', '# Flask stuff:', 'instance/', '.webassets-cache', '', '# Scrapy stuff:', '.scrapy', '', '# Sphinx documentation', 'docs/_build/', '', '# PyBuilder', '.pybuilder/', 'target/', '', '# Jupyter Notebook', '.ipynb_checkpoints', '', '# IPython', 'profile_default/', 'ipython_config.py', '', '# PEP 582; used by e.g. github.com/David-OConnor/pyflow', '__pypackages__/', '', '# Celery stuff', 'celerybeat-schedule', 'celerybeat.pid', '', '# SageMath parsed files', '*.sage.py', '', '# Environments', '.env', '.venv', 'env/', 'venv/', 'ENV/', 'env.bak/', 'venv.bak/', '', '# Spyder project settings', '.spyderproject', '.spyproject', '', '# Rope project settings', '.ropeproject', '', '# mkdocs documentation', '/site', '', '# mypy', '.mypy_cache/', '.dmypy.json', 'dmypy.json', '', '# Pyre type checker', '.pyre/', '', '# pytype static type analyzer', '.pytype/', '', '# Cython debug symbols', 'cython_debug/');
    }
    /**
     * (experimental) Adds a runtime dependency.
     *
     * @param spec Format `<module>@<semver>`.
     * @experimental
     */
    addDependency(spec) {
        return this.depsManager.addDependency(spec);
    }
    /**
     * (experimental) Adds a dev dependency.
     *
     * @param spec Format `<module>@<semver>`.
     * @experimental
     */
    addDevDependency(spec) {
        return this.depsManager.addDevDependency(spec);
    }
    /**
     * (experimental) Called after all components are synthesized.
     *
     * Order is *not* guaranteed.
     *
     * @experimental
     */
    postSynthesize() {
        super.postSynthesize();
        this.envManager.setupEnvironment();
        this.depsManager.installDependencies();
    }
}
exports.PythonProject = PythonProject;
_a = JSII_RTTI_SYMBOL_1;
PythonProject[_a] = { fqn: "projen.python.PythonProject", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHl0aG9uLXByb2plY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHl0aG9uL3B5dGhvbi1wcm9qZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0NBQWtFO0FBQ2xFLCtCQUE0QjtBQUM1QixxQ0FBa0M7QUFDbEMscUNBQWlEO0FBSWpELG1EQUErQztBQUMvQyw2Q0FBMEM7QUFDMUMsaUNBQTJDO0FBRzNDLGlEQUFpRDtBQUNqRCxNQUFNLHlCQUF5QixHQUFHLG9CQUFvQixDQUFDOzs7Ozs7O0FBd0d2RCxNQUFhLGFBQWMsU0FBUSxpQkFBTzs7OztJQWdDeEMsWUFBWSxPQUE2Qjs7UUFDdkMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyx5RkFBeUYsQ0FBQyxDQUFDO1NBQzVHO1FBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUUvQixVQUFJLE9BQU8sQ0FBQyxJQUFJLG1DQUFJLElBQUksRUFBRTtZQUN4QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksV0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsVUFBSSxPQUFPLENBQUMsR0FBRyxtQ0FBSSxJQUFJLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFNBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsQztRQUVELFVBQUksT0FBTyxDQUFDLFVBQVUsbUNBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLHFCQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDaEUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksdUJBQVUsQ0FBQyxJQUFJLEVBQUU7Z0JBQzNDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztnQkFDeEIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO2dCQUNoQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7Z0JBQzlCLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztnQkFDaEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO2dCQUN4QixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7Z0JBQzFCLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztnQkFDaEMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO2FBQ2pDLENBQUMsQ0FBQztTQUNKO1FBRUQsZ0NBQWdDO1FBQ2hDLGlEQUFpRDtRQUNqRCx3Q0FBd0M7UUFDeEMsSUFBSTtRQUVKLGlDQUFpQztRQUNqQyxrREFBa0Q7UUFDbEQsd0NBQXdDO1FBQ3hDLElBQUk7UUFFSixVQUFJLE9BQU8sQ0FBQyxNQUFNLG1DQUFJLEtBQUssRUFBRTtZQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQzlCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztnQkFDeEIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO2dCQUNoQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVU7Z0JBQzlCLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztnQkFDaEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO2dCQUN4QixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7Z0JBQzFCLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztnQkFDaEMsYUFBYSxFQUFFO29CQUNiLE1BQU0sY0FBRSxPQUFPLENBQUMsTUFBTSwwQ0FBRSxRQUFRLG1DQUFJLFdBQVc7b0JBQy9DLEdBQUcsT0FBTyxDQUFDLGFBQWE7aUJBQ3pCO2FBQ0YsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7WUFDMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7WUFDekIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztTQUNoQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUdBQWlHLENBQUMsQ0FBQztTQUNwSDtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkZBQTZGLENBQUMsQ0FBQztTQUNoSDtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxxQkFBVyxDQUFDLEdBQUcsRUFBRTtZQUNsRSxNQUFNLElBQUksS0FBSyxDQUFDLGlGQUFpRixDQUFDLENBQUM7U0FDcEc7UUFFRCxJQUFJLE1BQU0sT0FBQyxPQUFPLENBQUMsSUFBSSxtQ0FBSSxJQUFJLENBQUMsR0FBRyxNQUFNLE9BQUMsT0FBTyxDQUFDLE1BQU0sbUNBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3RFLE1BQU0sSUFBSSxLQUFLLENBQUMsdUdBQXVHLENBQUMsQ0FBQztTQUMxSDtRQUVELElBQUksTUFBTSxPQUFDLE9BQU8sQ0FBQyxHQUFHLG1DQUFJLElBQUksQ0FBQyxHQUFHLE1BQU0sT0FBQyxPQUFPLENBQUMsTUFBTSxtQ0FBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDckUsTUFBTSxJQUFJLEtBQUssQ0FBQyxtR0FBbUcsQ0FBQyxDQUFDO1NBQ3RIO1FBRUQsSUFBSSxNQUFNLE9BQUMsT0FBTyxDQUFDLFVBQVUsbUNBQUksSUFBSSxDQUFDLEdBQUcsTUFBTSxPQUFDLE9BQU8sQ0FBQyxNQUFNLG1DQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM1RSxNQUFNLElBQUksS0FBSyxDQUFDLHVGQUF1RixDQUFDLENBQUM7U0FDMUc7UUFFRCxVQUFJLE9BQU8sQ0FBQyxNQUFNLG1DQUFJLElBQUksRUFBRTtZQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDdkQ7UUFFRCxVQUFJLE9BQU8sQ0FBQyxNQUFNLG1DQUFJLElBQUksRUFBRTtZQUMxQixJQUFJLDRCQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzVCO1FBRUQsS0FBSyxNQUFNLEdBQUcsVUFBSSxPQUFPLENBQUMsSUFBSSxtQ0FBSSxFQUFFLEVBQUU7WUFDcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QjtRQUVELEtBQUssTUFBTSxHQUFHLFVBQUksT0FBTyxDQUFDLE9BQU8sbUNBQUksRUFBRSxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1QjtRQUVELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7O09BR0c7SUFDSyxtQkFBbUI7UUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQ3BCLHlDQUF5QyxFQUN6QyxjQUFjLEVBQ2QsV0FBVyxFQUNYLFlBQVksRUFDWixFQUFFLEVBQ0YsZ0JBQWdCLEVBQ2hCLE1BQU0sRUFDTixFQUFFLEVBQ0YsNEJBQTRCLEVBQzVCLFNBQVMsRUFDVCxRQUFRLEVBQ1IsZUFBZSxFQUNmLE9BQU8sRUFDUCxZQUFZLEVBQ1osT0FBTyxFQUNQLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxzQkFBc0IsRUFDdEIsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixPQUFPLEVBQ1AsVUFBVSxFQUNWLEVBQUUsRUFDRixlQUFlLEVBQ2YsdUVBQXVFLEVBQ3ZFLGlGQUFpRixFQUNqRixZQUFZLEVBQ1osUUFBUSxFQUNSLEVBQUUsRUFDRixrQkFBa0IsRUFDbEIsYUFBYSxFQUNiLCtCQUErQixFQUMvQixFQUFFLEVBQ0YsZ0NBQWdDLEVBQ2hDLFVBQVUsRUFDVixPQUFPLEVBQ1AsT0FBTyxFQUNQLFdBQVcsRUFDWCxhQUFhLEVBQ2IsUUFBUSxFQUNSLGVBQWUsRUFDZixjQUFjLEVBQ2QsU0FBUyxFQUNULFlBQVksRUFDWixjQUFjLEVBQ2QsZ0JBQWdCLEVBQ2hCLFFBQVEsRUFDUixFQUFFLEVBQ0YsZ0JBQWdCLEVBQ2hCLE1BQU0sRUFDTixPQUFPLEVBQ1AsRUFBRSxFQUNGLGlCQUFpQixFQUNqQixPQUFPLEVBQ1AsbUJBQW1CLEVBQ25CLFlBQVksRUFDWixvQkFBb0IsRUFDcEIsRUFBRSxFQUNGLGdCQUFnQixFQUNoQixXQUFXLEVBQ1gsa0JBQWtCLEVBQ2xCLEVBQUUsRUFDRixpQkFBaUIsRUFDakIsU0FBUyxFQUNULEVBQUUsRUFDRix3QkFBd0IsRUFDeEIsY0FBYyxFQUNkLEVBQUUsRUFDRixhQUFhLEVBQ2IsYUFBYSxFQUNiLFNBQVMsRUFDVCxFQUFFLEVBQ0Ysb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixFQUFFLEVBQ0YsV0FBVyxFQUNYLGtCQUFrQixFQUNsQixtQkFBbUIsRUFDbkIsRUFBRSxFQUNGLHlEQUF5RCxFQUN6RCxpQkFBaUIsRUFDakIsRUFBRSxFQUNGLGdCQUFnQixFQUNoQixxQkFBcUIsRUFDckIsZ0JBQWdCLEVBQ2hCLEVBQUUsRUFDRix5QkFBeUIsRUFDekIsV0FBVyxFQUNYLEVBQUUsRUFDRixnQkFBZ0IsRUFDaEIsTUFBTSxFQUNOLE9BQU8sRUFDUCxNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sRUFDTixVQUFVLEVBQ1YsV0FBVyxFQUNYLEVBQUUsRUFDRiwyQkFBMkIsRUFDM0IsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixFQUFFLEVBQ0YseUJBQXlCLEVBQ3pCLGNBQWMsRUFDZCxFQUFFLEVBQ0Ysd0JBQXdCLEVBQ3hCLE9BQU8sRUFDUCxFQUFFLEVBQ0YsUUFBUSxFQUNSLGNBQWMsRUFDZCxhQUFhLEVBQ2IsWUFBWSxFQUNaLEVBQUUsRUFDRixxQkFBcUIsRUFDckIsUUFBUSxFQUNSLEVBQUUsRUFDRiwrQkFBK0IsRUFDL0IsVUFBVSxFQUNWLEVBQUUsRUFDRix3QkFBd0IsRUFDeEIsZUFBZSxDQUNoQixDQUFDO0lBQ0osQ0FBQzs7Ozs7OztJQU9NLGFBQWEsQ0FBQyxJQUFZO1FBQy9CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQzs7Ozs7OztJQU9NLGdCQUFnQixDQUFDLElBQVk7UUFDbEMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pELENBQUM7Ozs7Ozs7O0lBRU0sY0FBYztRQUNuQixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUN6QyxDQUFDOztBQXJTSCxzQ0FzU0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcm9qZWN0LCBQcm9qZWN0T3B0aW9ucywgUHJvamVjdFR5cGUgfSBmcm9tICcuLi9wcm9qZWN0JztcbmltcG9ydCB7IFBpcCB9IGZyb20gJy4vcGlwJztcbmltcG9ydCB7IFBvZXRyeSB9IGZyb20gJy4vcG9ldHJ5JztcbmltcG9ydCB7IFB5dGVzdCwgUHl0ZXN0T3B0aW9ucyB9IGZyb20gJy4vcHl0ZXN0JztcbmltcG9ydCB7IElQeXRob25EZXBzIH0gZnJvbSAnLi9weXRob24tZGVwcyc7XG5pbXBvcnQgeyBJUHl0aG9uRW52IH0gZnJvbSAnLi9weXRob24tZW52JztcbmltcG9ydCB7IElQeXRob25QYWNrYWdpbmcsIFB5dGhvblBhY2thZ2luZ09wdGlvbnMgfSBmcm9tICcuL3B5dGhvbi1wYWNrYWdpbmcnO1xuaW1wb3J0IHsgUHl0aG9uU2FtcGxlIH0gZnJvbSAnLi9weXRob24tc2FtcGxlJztcbmltcG9ydCB7IFNldHVwdG9vbHMgfSBmcm9tICcuL3NldHVwdG9vbHMnO1xuaW1wb3J0IHsgVmVudiwgVmVudk9wdGlvbnMgfSBmcm9tICcuL3ZlbnYnO1xuXG5cbi8qKiBBbGxvd2VkIGNoYXJhY3RlcnMgaW4gcHl0aG9uIHByb2plY3QgbmFtZXMgKi9cbmNvbnN0IFBZVEhPTl9QUk9KRUNUX05BTUVfUkVHRVggPSAvXltBLVphLXowLTktX1xcLl0rJC87XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBQeXRob25Qcm9qZWN0T3B0aW9ucyBleHRlbmRzIFByb2plY3RPcHRpb25zLCBQeXRob25QYWNrYWdpbmdPcHRpb25zIHtcbiAgLy8gLS0gcmVxdWlyZWQgb3B0aW9ucyAtLVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBtb2R1bGVOYW1lOiBzdHJpbmc7XG5cbiAgLy8gLS0gZGVwZW5kZW5jaWVzIC0tXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkZXBzPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGRldkRlcHM/OiBzdHJpbmdbXTtcblxuICAvLyAtLSBjb3JlIGNvbXBvbmVudHMgLS1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHBpcD86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB2ZW52PzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHZlbnZPcHRpb25zPzogVmVudk9wdGlvbnM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzZXR1cHRvb2xzPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcG9ldHJ5PzogYm9vbGVhbjtcblxuICAvLyAtLSBvcHRpb25hbCBjb21wb25lbnRzIC0tXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBweXRlc3Q/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBweXRlc3RPcHRpb25zPzogUHl0ZXN0T3B0aW9ucztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHNhbXBsZT86IGJvb2xlYW47XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFB5dGhvblByb2plY3QgZXh0ZW5kcyBQcm9qZWN0IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IG1vZHVsZU5hbWU6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHZlcnNpb246IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGRlcHNNYW5hZ2VyITogSVB5dGhvbkRlcHM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgZW52TWFuYWdlciE6IElQeXRob25FbnY7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBwYWNrYWdpbmdNYW5hZ2VyPzogSVB5dGhvblBhY2thZ2luZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgcHl0ZXN0PzogUHl0ZXN0O1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFB5dGhvblByb2plY3RPcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG5cbiAgICBpZiAoIVBZVEhPTl9QUk9KRUNUX05BTUVfUkVHRVgudGVzdChvcHRpb25zLm5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1B5dGhvbiBwcm9qZWN0cyBtdXN0IG9ubHkgY29uc2lzdCBvZiBhbHBoYW51bWVyaWMgY2hhcmFjdGVycywgaHlwaGVucywgYW5kIHVuZGVyc2NvcmVzLicpO1xuICAgIH1cblxuICAgIHRoaXMubW9kdWxlTmFtZSA9IG9wdGlvbnMubW9kdWxlTmFtZTtcbiAgICB0aGlzLnZlcnNpb24gPSBvcHRpb25zLnZlcnNpb247XG5cbiAgICBpZiAob3B0aW9ucy52ZW52ID8/IHRydWUpIHtcbiAgICAgIHRoaXMuZW52TWFuYWdlciA9IG5ldyBWZW52KHRoaXMpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnBpcCA/PyB0cnVlKSB7XG4gICAgICB0aGlzLmRlcHNNYW5hZ2VyID0gbmV3IFBpcCh0aGlzKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5zZXR1cHRvb2xzID8/ICh0aGlzLnByb2plY3RUeXBlID09PSBQcm9qZWN0VHlwZS5MSUIpKSB7XG4gICAgICB0aGlzLnBhY2thZ2luZ01hbmFnZXIgPSBuZXcgU2V0dXB0b29scyh0aGlzLCB7XG4gICAgICAgIHZlcnNpb246IG9wdGlvbnMudmVyc2lvbixcbiAgICAgICAgZGVzY3JpcHRpb246IG9wdGlvbnMuZGVzY3JpcHRpb24sXG4gICAgICAgIGF1dGhvck5hbWU6IG9wdGlvbnMuYXV0aG9yTmFtZSxcbiAgICAgICAgYXV0aG9yRW1haWw6IG9wdGlvbnMuYXV0aG9yRW1haWwsXG4gICAgICAgIGxpY2Vuc2U6IG9wdGlvbnMubGljZW5zZSxcbiAgICAgICAgaG9tZXBhZ2U6IG9wdGlvbnMuaG9tZXBhZ2UsXG4gICAgICAgIGNsYXNzaWZpZXJzOiBvcHRpb25zLmNsYXNzaWZpZXJzLFxuICAgICAgICBzZXR1cENvbmZpZzogb3B0aW9ucy5zZXR1cENvbmZpZyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGlmIChvcHRpb25zLmNvbmRhID8/IGZhbHNlKSB7XG4gICAgLy8gICB0aGlzLmRlcHNNYW5hZ2VyID0gbmV3IENvbmRhKHRoaXMsIG9wdGlvbnMpO1xuICAgIC8vICAgdGhpcy5lbnZNYW5hZ2VyID0gdGhpcy5kZXBzTWFuYWdlcjtcbiAgICAvLyB9XG5cbiAgICAvLyBpZiAob3B0aW9ucy5waXBlbnYgPz8gZmFsc2UpIHtcbiAgICAvLyAgIHRoaXMuZGVwc01hbmFnZXIgPSBuZXcgUGlwZW52KHRoaXMsIG9wdGlvbnMpO1xuICAgIC8vICAgdGhpcy5lbnZNYW5hZ2VyID0gdGhpcy5kZXBzTWFuYWdlcjtcbiAgICAvLyB9XG5cbiAgICBpZiAob3B0aW9ucy5wb2V0cnkgPz8gZmFsc2UpIHtcbiAgICAgIGNvbnN0IHBvZXRyeSA9IG5ldyBQb2V0cnkodGhpcywge1xuICAgICAgICB2ZXJzaW9uOiBvcHRpb25zLnZlcnNpb24sXG4gICAgICAgIGRlc2NyaXB0aW9uOiBvcHRpb25zLmRlc2NyaXB0aW9uLFxuICAgICAgICBhdXRob3JOYW1lOiBvcHRpb25zLmF1dGhvck5hbWUsXG4gICAgICAgIGF1dGhvckVtYWlsOiBvcHRpb25zLmF1dGhvckVtYWlsLFxuICAgICAgICBsaWNlbnNlOiBvcHRpb25zLmxpY2Vuc2UsXG4gICAgICAgIGhvbWVwYWdlOiBvcHRpb25zLmhvbWVwYWdlLFxuICAgICAgICBjbGFzc2lmaWVyczogb3B0aW9ucy5jbGFzc2lmaWVycyxcbiAgICAgICAgcG9ldHJ5T3B0aW9uczoge1xuICAgICAgICAgIHJlYWRtZTogb3B0aW9ucy5yZWFkbWU/LmZpbGVuYW1lID8/ICdSRUFETUUubWQnLFxuICAgICAgICAgIC4uLm9wdGlvbnMucG9ldHJ5T3B0aW9ucyxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5kZXBzTWFuYWdlciA9IHBvZXRyeTtcbiAgICAgIHRoaXMuZW52TWFuYWdlciA9IHBvZXRyeTtcbiAgICAgIHRoaXMucGFja2FnaW5nTWFuYWdlciA9IHBvZXRyeTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZW52TWFuYWdlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdCBsZWFzdCBvbmUgdG9vbCBtdXN0IGJlIGNob3NlbiBmb3IgbWFuYWdpbmcgdGhlIGVudmlyb25tZW50ICh2ZW52LCBjb25kYSwgcGlwZW52LCBvciBwb2V0cnkpLicpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5kZXBzTWFuYWdlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdCBsZWFzdCBvbmUgdG9vbCBtdXN0IGJlIGNob3NlbiBmb3IgbWFuYWdpbmcgZGVwZW5kZW5jaWVzIChwaXAsIGNvbmRhLCBwaXBlbnYsIG9yIHBvZXRyeSkuJyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnBhY2thZ2luZ01hbmFnZXIgJiYgdGhpcy5wcm9qZWN0VHlwZSA9PT0gUHJvamVjdFR5cGUuTElCKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0IGxlYXN0IG9uZSB0b29sIG11c3QgYmUgY2hvc2VuIGZvciBtYW5hZ2luZyBwYWNrYWdpbmcgKHNldHVwdG9vbHMgb3IgcG9ldHJ5KS4nKTtcbiAgICB9XG5cbiAgICBpZiAoTnVtYmVyKG9wdGlvbnMudmVudiA/PyB0cnVlKSArIE51bWJlcihvcHRpb25zLnBvZXRyeSA/PyBmYWxzZSkgPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01vcmUgdGhhbiBvbmUgY29tcG9uZW50IGhhcyBiZWVuIGNob3NlbiBmb3IgbWFuYWdpbmcgdGhlIGVudmlyb25tZW50ICh2ZW52LCBjb25kYSwgcGlwZW52LCBvciBwb2V0cnkpJyk7XG4gICAgfVxuXG4gICAgaWYgKE51bWJlcihvcHRpb25zLnBpcCA/PyB0cnVlKSArIE51bWJlcihvcHRpb25zLnBvZXRyeSA/PyBmYWxzZSkgPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01vcmUgdGhhbiBvbmUgY29tcG9uZW50IGhhcyBiZWVuIGNob3NlbiBmb3IgbWFuYWdpbmcgZGVwZW5kZW5jaWVzIChwaXAsIGNvbmRhLCBwaXBlbnYsIG9yIHBvZXRyeSknKTtcbiAgICB9XG5cbiAgICBpZiAoTnVtYmVyKG9wdGlvbnMuc2V0dXB0b29scyA/PyB0cnVlKSArIE51bWJlcihvcHRpb25zLnBvZXRyeSA/PyBmYWxzZSkgPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01vcmUgdGhhbiBvbmUgY29tcG9uZW50IGhhcyBiZWVuIGNob3NlbiBmb3IgbWFuYWdpbmcgcGFja2FnaW5nIChzZXR1cHRvb2xzIG9yIHBvZXRyeSknKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5weXRlc3QgPz8gdHJ1ZSkge1xuICAgICAgdGhpcy5weXRlc3QgPSBuZXcgUHl0ZXN0KHRoaXMsIG9wdGlvbnMucHl0ZXN0T3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuc2FtcGxlID8/IHRydWUpIHtcbiAgICAgIG5ldyBQeXRob25TYW1wbGUodGhpcywge30pO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgZGVwIG9mIG9wdGlvbnMuZGVwcyA/PyBbXSkge1xuICAgICAgdGhpcy5hZGREZXBlbmRlbmN5KGRlcCk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBkZXAgb2Ygb3B0aW9ucy5kZXZEZXBzID8/IFtdKSB7XG4gICAgICB0aGlzLmFkZERldkRlcGVuZGVuY3koZGVwKTtcbiAgICB9XG5cbiAgICB0aGlzLmFkZERlZmF1bHRHaXRJZ25vcmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGRlZmF1bHQgZ2l0aWdub3JlIG9wdGlvbnMgZm9yIGEgUHl0aG9uIHByb2plY3QgYmFzZWQgb25cbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2dpdGh1Yi9naXRpZ25vcmUvYmxvYi9tYXN0ZXIvUHl0aG9uLmdpdGlnbm9yZVxuICAgKi9cbiAgcHJpdmF0ZSBhZGREZWZhdWx0R2l0SWdub3JlKCkge1xuICAgIHRoaXMuZ2l0aWdub3JlLmV4Y2x1ZGUoXG4gICAgICAnIyBCeXRlLWNvbXBpbGVkIC8gb3B0aW1pemVkIC8gRExMIGZpbGVzJyxcbiAgICAgICdfX3B5Y2FjaGVfXy8nLFxuICAgICAgJyoucHlbY29kXScsXG4gICAgICAnKiRweS5jbGFzcycsXG4gICAgICAnJyxcbiAgICAgICcjIEMgZXh0ZW5zaW9ucycsXG4gICAgICAnKi5zbycsXG4gICAgICAnJyxcbiAgICAgICcjIERpc3RyaWJ1dGlvbiAvIHBhY2thZ2luZycsXG4gICAgICAnLlB5dGhvbicsXG4gICAgICAnYnVpbGQvJyxcbiAgICAgICdkZXZlbG9wLWVnZ3MvJyxcbiAgICAgICdkaXN0LycsXG4gICAgICAnZG93bmxvYWRzLycsXG4gICAgICAnZWdncy8nLFxuICAgICAgJy5lZ2dzLycsXG4gICAgICAnbGliLycsXG4gICAgICAnbGliNjQvJyxcbiAgICAgICdwYXJ0cy8nLFxuICAgICAgJ3NkaXN0LycsXG4gICAgICAndmFyLycsXG4gICAgICAnd2hlZWxzLycsXG4gICAgICAnc2hhcmUvcHl0aG9uLXdoZWVscy8nLFxuICAgICAgJyouZWdnLWluZm8vJyxcbiAgICAgICcuaW5zdGFsbGVkLmNmZycsXG4gICAgICAnKi5lZ2cnLFxuICAgICAgJ01BTklGRVNUJyxcbiAgICAgICcnLFxuICAgICAgJyMgUHlJbnN0YWxsZXInLFxuICAgICAgJyMgIFVzdWFsbHkgdGhlc2UgZmlsZXMgYXJlIHdyaXR0ZW4gYnkgYSBweXRob24gc2NyaXB0IGZyb20gYSB0ZW1wbGF0ZScsXG4gICAgICAnIyAgYmVmb3JlIFB5SW5zdGFsbGVyIGJ1aWxkcyB0aGUgZXhlLCBzbyBhcyB0byBpbmplY3QgZGF0ZS9vdGhlciBpbmZvcyBpbnRvIGl0LicsXG4gICAgICAnKi5tYW5pZmVzdCcsXG4gICAgICAnKi5zcGVjJyxcbiAgICAgICcnLFxuICAgICAgJyMgSW5zdGFsbGVyIGxvZ3MnLFxuICAgICAgJ3BpcC1sb2cudHh0JyxcbiAgICAgICdwaXAtZGVsZXRlLXRoaXMtZGlyZWN0b3J5LnR4dCcsXG4gICAgICAnJyxcbiAgICAgICcjIFVuaXQgdGVzdCAvIGNvdmVyYWdlIHJlcG9ydHMnLFxuICAgICAgJ2h0bWxjb3YvJyxcbiAgICAgICcudG94LycsXG4gICAgICAnLm5veC8nLFxuICAgICAgJy5jb3ZlcmFnZScsXG4gICAgICAnLmNvdmVyYWdlLionLFxuICAgICAgJy5jYWNoZScsXG4gICAgICAnbm9zZXRlc3RzLnhtbCcsXG4gICAgICAnY292ZXJhZ2UueG1sJyxcbiAgICAgICcqLmNvdmVyJyxcbiAgICAgICcqLnB5LGNvdmVyJyxcbiAgICAgICcuaHlwb3RoZXNpcy8nLFxuICAgICAgJy5weXRlc3RfY2FjaGUvJyxcbiAgICAgICdjb3Zlci8nLFxuICAgICAgJycsXG4gICAgICAnIyBUcmFuc2xhdGlvbnMnLFxuICAgICAgJyoubW8nLFxuICAgICAgJyoucG90JyxcbiAgICAgICcnLFxuICAgICAgJyMgRGphbmdvIHN0dWZmOicsXG4gICAgICAnKi5sb2cnLFxuICAgICAgJ2xvY2FsX3NldHRpbmdzLnB5JyxcbiAgICAgICdkYi5zcWxpdGUzJyxcbiAgICAgICdkYi5zcWxpdGUzLWpvdXJuYWwnLFxuICAgICAgJycsXG4gICAgICAnIyBGbGFzayBzdHVmZjonLFxuICAgICAgJ2luc3RhbmNlLycsXG4gICAgICAnLndlYmFzc2V0cy1jYWNoZScsXG4gICAgICAnJyxcbiAgICAgICcjIFNjcmFweSBzdHVmZjonLFxuICAgICAgJy5zY3JhcHknLFxuICAgICAgJycsXG4gICAgICAnIyBTcGhpbnggZG9jdW1lbnRhdGlvbicsXG4gICAgICAnZG9jcy9fYnVpbGQvJyxcbiAgICAgICcnLFxuICAgICAgJyMgUHlCdWlsZGVyJyxcbiAgICAgICcucHlidWlsZGVyLycsXG4gICAgICAndGFyZ2V0LycsXG4gICAgICAnJyxcbiAgICAgICcjIEp1cHl0ZXIgTm90ZWJvb2snLFxuICAgICAgJy5pcHluYl9jaGVja3BvaW50cycsXG4gICAgICAnJyxcbiAgICAgICcjIElQeXRob24nLFxuICAgICAgJ3Byb2ZpbGVfZGVmYXVsdC8nLFxuICAgICAgJ2lweXRob25fY29uZmlnLnB5JyxcbiAgICAgICcnLFxuICAgICAgJyMgUEVQIDU4MjsgdXNlZCBieSBlLmcuIGdpdGh1Yi5jb20vRGF2aWQtT0Nvbm5vci9weWZsb3cnLFxuICAgICAgJ19fcHlwYWNrYWdlc19fLycsXG4gICAgICAnJyxcbiAgICAgICcjIENlbGVyeSBzdHVmZicsXG4gICAgICAnY2VsZXJ5YmVhdC1zY2hlZHVsZScsXG4gICAgICAnY2VsZXJ5YmVhdC5waWQnLFxuICAgICAgJycsXG4gICAgICAnIyBTYWdlTWF0aCBwYXJzZWQgZmlsZXMnLFxuICAgICAgJyouc2FnZS5weScsXG4gICAgICAnJyxcbiAgICAgICcjIEVudmlyb25tZW50cycsXG4gICAgICAnLmVudicsXG4gICAgICAnLnZlbnYnLFxuICAgICAgJ2Vudi8nLFxuICAgICAgJ3ZlbnYvJyxcbiAgICAgICdFTlYvJyxcbiAgICAgICdlbnYuYmFrLycsXG4gICAgICAndmVudi5iYWsvJyxcbiAgICAgICcnLFxuICAgICAgJyMgU3B5ZGVyIHByb2plY3Qgc2V0dGluZ3MnLFxuICAgICAgJy5zcHlkZXJwcm9qZWN0JyxcbiAgICAgICcuc3B5cHJvamVjdCcsXG4gICAgICAnJyxcbiAgICAgICcjIFJvcGUgcHJvamVjdCBzZXR0aW5ncycsXG4gICAgICAnLnJvcGVwcm9qZWN0JyxcbiAgICAgICcnLFxuICAgICAgJyMgbWtkb2NzIGRvY3VtZW50YXRpb24nLFxuICAgICAgJy9zaXRlJyxcbiAgICAgICcnLFxuICAgICAgJyMgbXlweScsXG4gICAgICAnLm15cHlfY2FjaGUvJyxcbiAgICAgICcuZG15cHkuanNvbicsXG4gICAgICAnZG15cHkuanNvbicsXG4gICAgICAnJyxcbiAgICAgICcjIFB5cmUgdHlwZSBjaGVja2VyJyxcbiAgICAgICcucHlyZS8nLFxuICAgICAgJycsXG4gICAgICAnIyBweXR5cGUgc3RhdGljIHR5cGUgYW5hbHl6ZXInLFxuICAgICAgJy5weXR5cGUvJyxcbiAgICAgICcnLFxuICAgICAgJyMgQ3l0aG9uIGRlYnVnIHN5bWJvbHMnLFxuICAgICAgJ2N5dGhvbl9kZWJ1Zy8nLFxuICAgICk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZERlcGVuZGVuY3koc3BlYzogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVwc01hbmFnZXIuYWRkRGVwZW5kZW5jeShzcGVjKTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGREZXZEZXBlbmRlbmN5KHNwZWM6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmRlcHNNYW5hZ2VyLmFkZERldkRlcGVuZGVuY3koc3BlYyk7XG4gIH1cblxuICBwdWJsaWMgcG9zdFN5bnRoZXNpemUoKSB7XG4gICAgc3VwZXIucG9zdFN5bnRoZXNpemUoKTtcblxuICAgIHRoaXMuZW52TWFuYWdlci5zZXR1cEVudmlyb25tZW50KCk7XG4gICAgdGhpcy5kZXBzTWFuYWdlci5pbnN0YWxsRGVwZW5kZW5jaWVzKCk7XG4gIH1cbn1cbiJdfQ==