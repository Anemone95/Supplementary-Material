"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeProject = exports.AutoRelease = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const common_1 = require("./common");
const auto_merge_1 = require("./github/auto-merge");
const ignore_file_1 = require("./ignore-file");
const jest_1 = require("./jest");
const license_1 = require("./license");
const node_package_1 = require("./node-package");
const project_1 = require("./project");
const projen_upgrade_1 = require("./projen-upgrade");
const publisher_1 = require("./publisher");
const tasks_1 = require("./tasks");
const version_1 = require("./version");
const PROJEN_SCRIPT = 'projen';
/**
 * (experimental) Automatic bump modes.
 *
 * @experimental
 */
var AutoRelease;
(function (AutoRelease) {
    AutoRelease[AutoRelease["EVERY_COMMIT"] = 0] = "EVERY_COMMIT";
    AutoRelease[AutoRelease["DAILY"] = 1] = "DAILY";
})(AutoRelease = exports.AutoRelease || (exports.AutoRelease = {}));
/**
 * (experimental) Node.js project.
 *
 * @experimental
 */
class NodeProject extends project_1.Project {
    /**
     * @experimental
     */
    constructor(options) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
        super(options);
        this.package = new node_package_1.NodePackage(this, options);
        this.runScriptCommand = (() => {
            switch (this.packageManager) {
                case node_package_1.NodePackageManager.NPM: return 'npm run';
                case node_package_1.NodePackageManager.YARN: return 'yarn run';
                case node_package_1.NodePackageManager.PNPM: return 'pnpm run';
                default: throw new Error(`unexpected package manager ${this.packageManager}`);
            }
        })();
        this.nodeVersion = (_b = options.workflowNodeVersion) !== null && _b !== void 0 ? _b : this.package.minNodeVersion;
        // add PATH for all tasks which includes the project's npm .bin list
        this.tasks.addEnvironment('PATH', '$(npx -c "node -e \\\"console.log(process.env.PATH)\\\"")');
        this.compileTask = this.addTask('compile', {
            description: 'Only compile',
            category: tasks_1.TaskCategory.BUILD,
        });
        this.testCompileTask = this.addTask('test:compile', {
            description: 'compiles the test code',
            category: tasks_1.TaskCategory.TEST,
        });
        this.testTask = this.addTask('test', {
            description: 'Run tests',
            category: tasks_1.TaskCategory.TEST,
        });
        this.testTask.spawn(this.testCompileTask);
        this.buildTask = this.addTask('build', {
            description: 'Full release build (test+compile)',
            category: tasks_1.TaskCategory.BUILD,
        });
        this.addLicense(options);
        this.npmDistTag = this.package.npmDistTag;
        this.npmRegistry = this.package.npmRegistry;
        if ((_c = options.npmignoreEnabled) !== null && _c !== void 0 ? _c : true) {
            this.npmignore = new ignore_file_1.IgnoreFile(this, '.npmignore');
        }
        this.addDefaultGitIgnore();
        if ((_d = options.gitignore) === null || _d === void 0 ? void 0 : _d.length) {
            for (const i of options.gitignore) {
                this.gitignore.exclude(i);
            }
        }
        if ((_e = options.npmignore) === null || _e === void 0 ? void 0 : _e.length) {
            if (!this.npmignore) {
                throw new Error('.npmignore is not defined for an APP project type. Add "npmIgnore: true" to override this');
            }
            for (const i of options.npmignore) {
                this.npmignore.exclude(i);
            }
        }
        this.setScript(PROJEN_SCRIPT, this.package.projenCommand);
        this.setScript('start', `${this.package.projenCommand} start`);
        (_f = this.npmignore) === null || _f === void 0 ? void 0 : _f.exclude(`/${common_1.PROJEN_RC}`);
        (_g = this.npmignore) === null || _g === void 0 ? void 0 : _g.exclude(`/${common_1.PROJEN_DIR}`);
        this.gitignore.include(`/${common_1.PROJEN_RC}`);
        const projen = (_h = options.projenDevDependency) !== null && _h !== void 0 ? _h : true;
        if (projen) {
            const projenVersion = (_j = options.projenVersion) !== null && _j !== void 0 ? _j : `^${common_1.PROJEN_VERSION}`;
            this.addDevDeps(`projen@${projenVersion}`);
        }
        if (!options.defaultReleaseBranch) {
            throw new Error('"defaultReleaseBranch" is temporarily a required option while we migrate its default value from "master" to "main"');
        }
        const defaultReleaseBranch = (_k = options.defaultReleaseBranch) !== null && _k !== void 0 ? _k : 'main';
        // version is read from a committed file called version.json which is how we bump
        this._version = new version_1.Version(this, { releaseBranch: defaultReleaseBranch });
        this.package.addVersion(this._version.currentVersion);
        // indicate if we have anti-tamper configured in our workflows. used by e.g. Jest
        // to decide if we can always run with --updateSnapshot
        this.antitamper = ((_l = options.buildWorkflow) !== null && _l !== void 0 ? _l : (this.parent ? false : true)) && ((_m = options.antitamper) !== null && _m !== void 0 ? _m : true);
        // configure jest if enabled
        // must be before the build/release workflows
        if ((_o = options.jest) !== null && _o !== void 0 ? _o : true) {
            this.jest = new jest_1.Jest(this, options.jestOptions);
        }
        if ((_p = options.buildWorkflow) !== null && _p !== void 0 ? _p : (this.parent ? false : true)) {
            const { workflow, buildJobId } = this.createBuildWorkflow('Build', {
                trigger: {
                    pull_request: {},
                },
                image: options.workflowContainerImage,
                codeCov: (_q = options.codeCov) !== null && _q !== void 0 ? _q : false,
                codeCovTokenSecret: options.codeCovTokenSecret,
            });
            this.buildWorkflow = workflow;
            this.buildWorkflowJobId = buildJobId;
        }
        if ((_r = options.releaseWorkflow) !== null && _r !== void 0 ? _r : (this.parent ? false : true)) {
            const releaseBranches = (_s = options.releaseBranches) !== null && _s !== void 0 ? _s : [defaultReleaseBranch];
            const trigger = {};
            if ((_t = options.releaseEveryCommit) !== null && _t !== void 0 ? _t : true) {
                trigger.push = { branches: releaseBranches };
            }
            if (options.releaseSchedule) {
                trigger.schedule = { cron: options.releaseSchedule };
            }
            const artifactDirectory = (_u = options.artifactsDirectory) !== null && _u !== void 0 ? _u : 'dist';
            const { workflow, buildJobId } = this.createBuildWorkflow('Release', {
                trigger,
                preBuildSteps: [{
                        name: 'Bump to next version',
                        run: this.runTaskCommand(this._version.bumpTask),
                    }],
                pushBranch: '${{ github.ref }}',
                artifactDirectory,
                image: options.workflowContainerImage,
                codeCov: (_v = options.codeCov) !== null && _v !== void 0 ? _v : false,
                codeCovTokenSecret: options.codeCovTokenSecret,
                checkoutWith: {
                    // we must use 'fetch-depth=0' in order to fetch all tags
                    // otherwise tags are not checked out
                    'fetch-depth': 0,
                },
            });
            this.releaseWorkflow = workflow;
            this.publisher = new publisher_1.Publisher(this, {
                workflow: this.releaseWorkflow,
                artifactName: artifactDirectory,
                buildJobId,
                jsiiReleaseVersion: options.jsiiReleaseVersion,
            });
            if ((_w = options.releaseToNpm) !== null && _w !== void 0 ? _w : false) {
                this.publisher.publishToNpm({
                    distTag: this.package.npmDistTag,
                    registry: this.package.npmRegistry,
                });
            }
        }
        else {
            // validate that no release options are selected if the release workflow is disabled.
            if (options.releaseToNpm) {
                throw new Error('"releaseToNpm" is not supported for APP projects');
            }
            if (options.releaseBranches) {
                throw new Error('"releaseBranches" is not supported for APP projects');
            }
            if (options.releaseEveryCommit) {
                throw new Error('"releaseEveryCommit" is not supported for APP projects');
            }
            if (options.releaseSchedule) {
                throw new Error('"releaseSchedule" is not supported for APP projects');
            }
        }
        if ((_x = options.mergify) !== null && _x !== void 0 ? _x : true) {
            this.autoMerge = new auto_merge_1.AutoMerge(this, {
                autoMergeLabel: options.mergifyAutoMergeLabel,
                buildJob: this.buildWorkflowJobId,
            });
            (_y = this.npmignore) === null || _y === void 0 ? void 0 : _y.exclude('/.mergify.yml');
        }
        if ((_z = options.dependabot) !== null && _z !== void 0 ? _z : true) {
            (_0 = this.github) === null || _0 === void 0 ? void 0 : _0.addDependabot(options.dependabotOptions);
        }
        const projenAutoMerge = (_1 = options.projenUpgradeAutoMerge) !== null && _1 !== void 0 ? _1 : true;
        new projen_upgrade_1.ProjenUpgrade(this, {
            autoUpgradeSecret: options.projenUpgradeSecret,
            autoUpgradeSchedule: options.projenUpgradeSchedule,
            labels: (projenAutoMerge && ((_2 = this.autoMerge) === null || _2 === void 0 ? void 0 : _2.autoMergeLabel))
                ? [this.autoMerge.autoMergeLabel]
                : [],
        });
        if ((_3 = options.pullRequestTemplate) !== null && _3 !== void 0 ? _3 : true) {
            (_4 = this.github) === null || _4 === void 0 ? void 0 : _4.addPullRequestTemplate(...(_5 = options.pullRequestTemplateContents) !== null && _5 !== void 0 ? _5 : []);
        }
        if ((_6 = options.rebuildBot) !== null && _6 !== void 0 ? _6 : (this.parent ? false : true)) {
            this.addRebuildBot((_7 = options.rebuildBotCommand) !== null && _7 !== void 0 ? _7 : 'rebuild');
        }
    }
    /**
     * @deprecated use `package.allowLibraryDependencies`
     */
    get allowLibraryDependencies() { return this.package.allowLibraryDependencies; }
    /**
     * @deprecated use `package.entrypoint`
     */
    get entrypoint() { return this.package.entrypoint; }
    /**
     * (experimental) Minimum node.js version required by this package.
     *
     * @experimental
     */
    get minNodeVersion() { return this.package.minNodeVersion; }
    /**
     * (experimental) Maximum node version required by this pacakge.
     *
     * @experimental
     */
    get maxNodeVersion() { return this.package.maxNodeVersion; }
    /**
     * (deprecated) The package manager to use.
     *
     * @deprecated use `package.packageManager`
     */
    get packageManager() { return this.package.packageManager; }
    /**
     * (deprecated) Determines how tasks are executed when invoked as npm scripts (yarn/npm run xyz).
     *
     * @deprecated use `package.npmTaskExecution`
     */
    get npmTaskExecution() { return this.package.npmTaskExecution; }
    /**
     * (experimental) The command to use in order to run the projen CLI.
     *
     * @experimental
     */
    get projenCommand() { return this.package.projenCommand; }
    /**
     * @deprecated use `package.addField(x, y)`
     */
    get manifest() {
        return this.package.manifest;
    }
    /**
     * @experimental
     */
    addBins(bins) {
        this.package.addBin(bins);
    }
    /**
     * (experimental) Replaces the contents of an npm package.json script.
     *
     * @param name The script name.
     * @param command The command to execute.
     * @experimental
     */
    setScript(name, command) {
        this.package.setScript(name, command);
    }
    /**
     * (experimental) Removes the npm script (always successful).
     *
     * @param name The name of the script.
     * @experimental
     */
    removeScript(name) {
        this.package.removeScript(name);
    }
    /**
     * (experimental) Indicates if a script by the name name is defined.
     *
     * @param name The name of the script.
     * @experimental
     */
    hasScript(name) {
        return this.package.hasScript(name);
    }
    /**
     * (deprecated) DEPRECATED.
     *
     * @deprecated use `project.compileTask.exec()`
     */
    addCompileCommand(...commands) {
        for (const c of commands) {
            this.compileTask.exec(c);
        }
    }
    /**
     * (deprecated) DEPRECATED.
     *
     * @deprecated use `project.testTask.exec()`
     */
    addTestCommand(...commands) {
        for (const c of commands) {
            this.testTask.exec(c);
        }
    }
    /**
     * (deprecated) DEPRECATED.
     *
     * @deprecated use `project.buildTask.exec()`
     */
    addBuildCommand(...commands) {
        for (const c of commands) {
            this.buildTask.exec(c);
        }
    }
    /**
     * (experimental) Directly set fields in `package.json`.
     *
     * @param fields The fields to set.
     * @experimental
     */
    addFields(fields) {
        for (const [name, value] of Object.entries(fields)) {
            this.package.addField(name, value);
        }
    }
    /**
     * (experimental) Adds keywords to package.json (deduplicated).
     *
     * @param keywords The keywords to add.
     * @experimental
     */
    addKeywords(...keywords) {
        this.package.addKeywords(...keywords);
    }
    /**
     * @experimental
     */
    get installWorkflowSteps() {
        const install = new Array();
        if (this.nodeVersion) {
            install.push({
                name: 'Setup Node.js',
                uses: 'actions/setup-node@v1',
                with: { 'node-version': this.nodeVersion },
            });
        }
        install.push({
            name: 'Install dependencies',
            run: this.package.installCommand,
        });
        // run "projen"
        install.push({
            name: 'Synthesize project files',
            run: this.package.projenCommand,
        });
        return install;
    }
    /**
     * (experimental) Defines normal dependencies.
     *
     * @param deps Names modules to install.
     * @experimental
     */
    addDeps(...deps) {
        return this.package.addDeps(...deps);
    }
    /**
     * (experimental) Defines development/test dependencies.
     *
     * @param deps Names modules to install.
     * @experimental
     */
    addDevDeps(...deps) {
        return this.package.addDevDeps(...deps);
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
        return this.package.addPeerDeps(...deps);
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
        return this.package.addBundledDeps(...deps);
    }
    addLicense(options) {
        var _b;
        if (this.package.license) {
            new license_1.License(this, this.package.license, {
                copyrightOwner: (_b = options.copyrightOwner) !== null && _b !== void 0 ? _b : options.authorName,
                copyrightPeriod: options.copyrightPeriod,
            });
        }
    }
    addDefaultGitIgnore() {
        this.gitignore.exclude('# Logs', 'logs', '*.log', 'npm-debug.log*', 'yarn-debug.log*', 'yarn-error.log*', 'lerna-debug.log*', '# Diagnostic reports (https://nodejs.org/api/report.html)', 'report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json', '# Runtime data', 'pids', '*.pid', '*.seed', '*.pid.lock', '# Directory for instrumented libs generated by jscoverage/JSCover', 'lib-cov', '# Coverage directory used by tools like istanbul', 'coverage', '*.lcov', '# nyc test coverage', '.nyc_output', '# Compiled binary addons (https://nodejs.org/api/addons.html)', 'build/Release', '# Dependency directories', 'node_modules/', 'jspm_packages/', '# TypeScript cache', '*.tsbuildinfo', '# Optional eslint cache', '.eslintcache', '# Output of \'npm pack\'', '*.tgz', '# Yarn Integrity file', '.yarn-integrity', '# parcel-bundler cache (https://parceljs.org/)', '.cache');
    }
    createBuildWorkflow(name, options) {
        var _b, _c, _d, _e;
        const buildJobId = 'build';
        const github = this.github;
        if (!github) {
            throw new Error('no github support');
        }
        const workflow = github.addWorkflow(name);
        workflow.on(options.trigger);
        workflow.on({
            workflow_dispatch: {},
        });
        const condition = options.condition ? { if: options.condition } : {};
        const preBuildSteps = (_b = options.preBuildSteps) !== null && _b !== void 0 ? _b : [];
        const preCheckoutSteps = (_c = options.preCheckoutSteps) !== null && _c !== void 0 ? _c : [];
        const checkoutWith = options.checkoutWith ? { with: options.checkoutWith } : {};
        const postSteps = (_d = options.postSteps) !== null && _d !== void 0 ? _d : [];
        const antitamperSteps = (options.antitamperDisabled || !this.antitamper) ? [] : [{
                name: 'Anti-tamper check',
                run: 'git diff --exit-code',
            }];
        const commitChanges = !options.commit ? [] : [{
                name: 'Commit changes',
                run: `git commit -am "${options.commit}"`,
            }];
        const pushChanges = !options.pushBranch ? [] : [
            {
                name: 'Push commits',
                run: 'git push origin $BRANCH',
                env: {
                    BRANCH: options.pushBranch,
                },
            },
            // push tags only after we've managed to push our commits in order to
            // avoid tags being pushed but commits being rejected due to new commits
            // see https://github.com/projen/projen/issues/553
            {
                name: 'Push tags',
                run: 'git push --follow-tags origin $BRANCH',
                env: {
                    BRANCH: options.pushBranch,
                },
            },
        ];
        const job = {
            'runs-on': 'ubuntu-latest',
            'env': {
                CI: 'true',
            },
            ...condition,
            'steps': [
                ...preCheckoutSteps,
                // check out sources.
                {
                    name: 'Checkout',
                    uses: 'actions/checkout@v2',
                    ...checkoutWith,
                },
                // install dependencies
                ...this.installWorkflowSteps,
                // perform an anti-tamper check immediately after we run projen.
                ...antitamperSteps,
                // sets git identity so we can push later
                {
                    name: 'Set git identity',
                    run: [
                        'git config user.name "Auto-bump"',
                        'git config user.email "github-actions@github.com"',
                    ].join('\n'),
                },
                // if there are changes, creates a bump commit
                ...preBuildSteps,
                // build (compile + test)
                {
                    name: 'Build',
                    run: this.runTaskCommand(this.buildTask),
                },
                // run codecov if enabled or a secret token name is passed in
                // AND jest must be configured
                ...(options.codeCov || options.codeCovTokenSecret) && ((_e = this.jest) === null || _e === void 0 ? void 0 : _e.config) ? [{
                        name: 'Upload coverage to Codecov',
                        uses: 'codecov/codecov-action@v1',
                        with: options.codeCovTokenSecret ? {
                            token: `\${{ secrets.${options.codeCovTokenSecret} }}`,
                            directory: this.jest.config.coverageDirectory,
                        } : {
                            directory: this.jest.config.coverageDirectory,
                        },
                    }] : [],
                // anti-tamper check (fails if there were changes to committed files)
                // this will identify any non-committed files generated during build (e.g. test snapshots)
                ...antitamperSteps,
                // if required, commit changes to the repo
                ...commitChanges,
                // push bump commit
                ...pushChanges,
                ...postSteps,
            ],
        };
        if (options.image) {
            job.container = { image: options.image };
        }
        if (options.artifactDirectory) {
            job.steps.push({
                name: 'Upload artifact',
                uses: 'actions/upload-artifact@v2.1.1',
                with: {
                    name: options.artifactDirectory,
                    path: options.artifactDirectory,
                },
            });
        }
        workflow.addJobs({ [buildJobId]: job });
        return { workflow, buildJobId };
    }
    /**
     * (experimental) Returns the shell command to execute in order to run a task.
     *
     * If
     * npmTaskExecution is set to PROJEN, the command will be `npx projen TASK`.
     * If it is set to SHELL, the command will be `yarn run TASK` (or `npm run
     * TASK`).
     *
     * @param task The task for which the command is required.
     * @experimental
     */
    runTaskCommand(task) {
        switch (this.package.npmTaskExecution) {
            case node_package_1.NpmTaskExecution.PROJEN: return `${this.package.projenCommand} ${task.name}`;
            case node_package_1.NpmTaskExecution.SHELL: return `${this.runScriptCommand} ${task.name}`;
            default:
                throw new Error(`invalid npmTaskExecution mode: ${this.package.npmTaskExecution}`);
        }
    }
    addRebuildBot(command) {
        const postComment = (message) => ({
            name: 'Post comment to issue',
            uses: 'peter-evans/create-or-update-comment@v1',
            with: {
                'issue-number': '${{ github.event.issue.number }}',
                'body': `_projen_: ${message}`,
            },
        });
        this.createBuildWorkflow('rebuild-bot', {
            trigger: { issue_comment: { types: ['created'] } },
            condition: `\${{ github.event.issue.pull_request && contains(github.event.comment.body, '@projen ${command}') }}`,
            antitamperDisabled: true,
            // since the "issue_comment" event is not triggered on a branch, we need to resolve
            // the git ref of the pull request before we check out
            preCheckoutSteps: [
                postComment('Rebuild started'),
                {
                    name: 'Get pull request branch',
                    id: 'query_pull_request',
                    env: { PULL_REQUEST_URL: '${{ github.event.issue.pull_request.url }}' },
                    run: [
                        'rm -f /tmp/pr.json',
                        'curl --silent $PULL_REQUEST_URL > /tmp/pr.json',
                        'BRANCH_STR=$(cat /tmp/pr.json | jq ".head.ref")',
                        'REPO_NAME=$(cat /tmp/pr.json | jq ".head.repo.full_name")',
                        'echo "::set-output name=branch::$(node -p $BRANCH_STR)"',
                        'echo "::set-output name=repo::$(node -p $REPO_NAME)"',
                    ].join('\n'),
                },
            ],
            // tell checkout to use the branch we acquired at the previous step
            checkoutWith: {
                ref: '${{ steps.query_pull_request.outputs.branch }}',
                repository: '${{ steps.query_pull_request.outputs.repo }}',
            },
            // commit changes
            commit: 'chore: update generated files',
            // and push to the pull request branch
            pushBranch: '${{ steps.query_pull_request.outputs.branch }}',
            postSteps: [
                postComment('Rebuild complete. Updates pushed to pull request branch.'),
            ],
        });
    }
}
exports.NodeProject = NodeProject;
_a = JSII_RTTI_SYMBOL_1;
NodeProject[_a] = { fqn: "projen.NodeProject", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1wcm9qZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL25vZGUtcHJvamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFDQUFpRTtBQUVqRSxvREFBZ0Q7QUFHaEQsK0NBQTJDO0FBQzNDLGlDQUEyQztBQUMzQyx1Q0FBb0M7QUFDcEMsaURBQXVHO0FBQ3ZHLHVDQUFvRDtBQUNwRCxxREFBaUQ7QUFDakQsMkNBQXdDO0FBRXhDLG1DQUE2QztBQUM3Qyx1Q0FBb0M7QUFFcEMsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDOzs7Ozs7QUFvUi9CLElBQVksV0FVWDtBQVZELFdBQVksV0FBVztJQUlyQiw2REFBWSxDQUFBO0lBS1osK0NBQUssQ0FBQTtBQUNQLENBQUMsRUFWVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQVV0Qjs7Ozs7O0FBS0QsTUFBYSxXQUFZLFNBQVEsaUJBQU87Ozs7SUFnSXRDLFlBQVksT0FBMkI7O1FBQ3JDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSwwQkFBVyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDNUIsUUFBUSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUMzQixLQUFLLGlDQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sU0FBUyxDQUFDO2dCQUM5QyxLQUFLLGlDQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDO2dCQUNoRCxLQUFLLGlDQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDO2dCQUNoRCxPQUFPLENBQUMsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQzthQUMvRTtRQUNILENBQUMsQ0FBQyxFQUFF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QUUsRUFBRTtZQUNsRCxTQUFTLEVBQUUsd0ZBQXdGLE9BQU8sT0FBTztZQUNqSCxrQkFBa0IsRUFBRSxJQUFJO1lBRXhCLG1GQUFtRjtZQUNuRixzREFBc0Q7WUFDdEQsZ0JBQWdCLEVBQUU7Z0JBQ2hCLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDOUI7b0JBQ0UsSUFBSSxFQUFFLHlCQUF5QjtvQkFDL0IsRUFBRSxFQUFFLG9CQUFvQjtvQkFDeEIsR0FBRyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsNENBQTRDLEVBQUU7b0JBQ3ZFLEdBQUcsRUFBRTt3QkFDSCxvQkFBb0I7d0JBQ3BCLGdEQUFnRDt3QkFDaEQsaURBQWlEO3dCQUNqRCwyREFBMkQ7d0JBQzNELHlEQUF5RDt3QkFDekQsc0RBQXNEO3FCQUN2RCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7aUJBQ2I7YUFDRjtZQUVELG1FQUFtRTtZQUNuRSxZQUFZLEVBQUU7Z0JBQ1osR0FBRyxFQUFFLGdEQUFnRDtnQkFDckQsVUFBVSxFQUFFLDhDQUE4QzthQUMzRDtZQUVELGlCQUFpQjtZQUNqQixNQUFNLEVBQUUsK0JBQStCO1lBRXZDLHNDQUFzQztZQUN0QyxVQUFVLEVBQUUsZ0RBQWdEO1lBRTVELFNBQVMsRUFBRTtnQkFDVCxXQUFXLENBQUMsMERBQTBELENBQUM7YUFDeEU7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDOztBQXZ3Qkgsa0NBd3dCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBST0pFTl9ESVIsIFBST0pFTl9SQywgUFJPSkVOX1ZFUlNJT04gfSBmcm9tICcuL2NvbW1vbic7XG5pbXBvcnQgeyBHaXRodWJXb3JrZmxvdyB9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7IEF1dG9NZXJnZSB9IGZyb20gJy4vZ2l0aHViL2F1dG8tbWVyZ2UnO1xuaW1wb3J0IHsgRGVwZW5kYWJvdE9wdGlvbnMgfSBmcm9tICcuL2dpdGh1Yi9kZXBlbmRhYm90JztcbmltcG9ydCB7IE1lcmdpZnlPcHRpb25zIH0gZnJvbSAnLi9naXRodWIvbWVyZ2lmeSc7XG5pbXBvcnQgeyBJZ25vcmVGaWxlIH0gZnJvbSAnLi9pZ25vcmUtZmlsZSc7XG5pbXBvcnQgeyBKZXN0LCBKZXN0T3B0aW9ucyB9IGZyb20gJy4vamVzdCc7XG5pbXBvcnQgeyBMaWNlbnNlIH0gZnJvbSAnLi9saWNlbnNlJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlLCBOcG1UYXNrRXhlY3V0aW9uLCBOb2RlUGFja2FnZU1hbmFnZXIsIE5vZGVQYWNrYWdlT3B0aW9ucyB9IGZyb20gJy4vbm9kZS1wYWNrYWdlJztcbmltcG9ydCB7IFByb2plY3QsIFByb2plY3RPcHRpb25zIH0gZnJvbSAnLi9wcm9qZWN0JztcbmltcG9ydCB7IFByb2plblVwZ3JhZGUgfSBmcm9tICcuL3Byb2plbi11cGdyYWRlJztcbmltcG9ydCB7IFB1Ymxpc2hlciB9IGZyb20gJy4vcHVibGlzaGVyJztcbmltcG9ydCB7IFNlbXZlciB9IGZyb20gJy4vc2VtdmVyJztcbmltcG9ydCB7IFRhc2ssIFRhc2tDYXRlZ29yeSB9IGZyb20gJy4vdGFza3MnO1xuaW1wb3J0IHsgVmVyc2lvbiB9IGZyb20gJy4vdmVyc2lvbic7XG5cbmNvbnN0IFBST0pFTl9TQ1JJUFQgPSAncHJvamVuJztcblxuZXhwb3J0IGludGVyZmFjZSBOb2RlUHJvamVjdE9wdGlvbnMgZXh0ZW5kcyBQcm9qZWN0T3B0aW9ucywgTm9kZVBhY2thZ2VPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGNvcHlyaWdodE93bmVyPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBjb3B5cmlnaHRQZXJpb2Q/OiBzdHJpbmc7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHByb2plblZlcnNpb24/OiBTZW12ZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBwcm9qZW5EZXZEZXBlbmRlbmN5PzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkZWZhdWx0UmVsZWFzZUJyYW5jaDogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGJ1aWxkV29ya2Zsb3c/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgY29kZUNvdj86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBjb2RlQ292VG9rZW5TZWNyZXQ/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHJlbGVhc2VXb3JrZmxvdz86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcmVsZWFzZUV2ZXJ5Q29tbWl0PzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcmVsZWFzZVNjaGVkdWxlPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcmVsZWFzZUJyYW5jaGVzPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB3b3JrZmxvd0Jvb3RzdHJhcFN0ZXBzPzogYW55W107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB3b3JrZmxvd0NvbnRhaW5lckltYWdlPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcmVsZWFzZVRvTnBtPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgYW50aXRhbXBlcj86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHdvcmtmbG93Tm9kZVZlcnNpb24/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGRlcGVuZGFib3Q/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkZXBlbmRhYm90T3B0aW9ucz86IERlcGVuZGFib3RPcHRpb25zO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBtZXJnaWZ5PzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBtZXJnaWZ5T3B0aW9ucz86IE1lcmdpZnlPcHRpb25zO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbWVyZ2lmeUF1dG9NZXJnZUxhYmVsPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBwcm9qZW5VcGdyYWRlU2VjcmV0Pzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHByb2plblVwZ3JhZGVBdXRvTWVyZ2U/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHByb2plblVwZ3JhZGVTY2hlZHVsZT86IHN0cmluZ1tdO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBucG1pZ25vcmVFbmFibGVkPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBucG1pZ25vcmU/OiBzdHJpbmdbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcHVsbFJlcXVlc3RUZW1wbGF0ZT86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBwdWxsUmVxdWVzdFRlbXBsYXRlQ29udGVudHM/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSByZWJ1aWxkQm90PzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHJlYnVpbGRCb3RDb21tYW5kPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGdpdGlnbm9yZT86IHN0cmluZ1tdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgamVzdD86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgamVzdE9wdGlvbnM/OiBKZXN0T3B0aW9ucztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBqc2lpUmVsZWFzZVZlcnNpb24/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGFydGlmYWN0c0RpcmVjdG9yeT86IHN0cmluZztcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGVudW0gQXV0b1JlbGVhc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgRVZFUllfQ09NTUlULFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBEQUlMWVxufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIE5vZGVQcm9qZWN0IGV4dGVuZHMgUHJvamVjdCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHBhY2thZ2U6IE5vZGVQYWNrYWdlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBucG1pZ25vcmU/OiBJZ25vcmVGaWxlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBnZXQgYWxsb3dMaWJyYXJ5RGVwZW5kZW5jaWVzKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5wYWNrYWdlLmFsbG93TGlicmFyeURlcGVuZGVuY2llczsgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgZ2V0IGVudHJ5cG9pbnQoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMucGFja2FnZS5lbnRyeXBvaW50OyB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgY29tcGlsZVRhc2s6IFRhc2s7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSB0ZXN0VGFzazogVGFzaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgdGVzdENvbXBpbGVUYXNrOiBUYXNrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBidWlsZFRhc2s6IFRhc2s7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGF1dG9NZXJnZT86IEF1dG9NZXJnZTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF92ZXJzaW9uOiBWZXJzaW9uO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGJ1aWxkV29ya2Zsb3c/OiBHaXRodWJXb3JrZmxvdztcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGJ1aWxkV29ya2Zsb3dKb2JJZD86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgcmVsZWFzZVdvcmtmbG93PzogR2l0aHViV29ya2Zsb3c7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgcHVibGlzaGVyPzogUHVibGlzaGVyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGdldCBtaW5Ob2RlVmVyc2lvbigpOiBzdHJpbmcgfCB1bmRlZmluZWQgeyByZXR1cm4gdGhpcy5wYWNrYWdlLm1pbk5vZGVWZXJzaW9uOyB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgZ2V0IG1heE5vZGVWZXJzaW9uKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7IHJldHVybiB0aGlzLnBhY2thZ2UubWF4Tm9kZVZlcnNpb247IH1cblxuICBwcml2YXRlIHJlYWRvbmx5IG5vZGVWZXJzaW9uPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBhbnRpdGFtcGVyOiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbnBtRGlzdFRhZzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IG5wbVJlZ2lzdHJ5OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBnZXQgcGFja2FnZU1hbmFnZXIoKTogTm9kZVBhY2thZ2VNYW5hZ2VyIHsgcmV0dXJuIHRoaXMucGFja2FnZS5wYWNrYWdlTWFuYWdlcjsgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgcnVuU2NyaXB0Q29tbWFuZDogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBqZXN0PzogSmVzdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgZ2V0IG5wbVRhc2tFeGVjdXRpb24oKTogTnBtVGFza0V4ZWN1dGlvbiB7IHJldHVybiB0aGlzLnBhY2thZ2UubnBtVGFza0V4ZWN1dGlvbjsgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBnZXQgcHJvamVuQ29tbWFuZCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5wYWNrYWdlLnByb2plbkNvbW1hbmQ7IH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBnZXQgbWFuaWZlc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFja2FnZS5tYW5pZmVzdDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IE5vZGVQcm9qZWN0T3B0aW9ucykge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuXG4gICAgdGhpcy5wYWNrYWdlID0gbmV3IE5vZGVQYWNrYWdlKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5ydW5TY3JpcHRDb21tYW5kID0gKCgpID0+IHtcbiAgICAgIHN3aXRjaCAodGhpcy5wYWNrYWdlTWFuYWdlcikge1xuICAgICAgICBjYXNlIE5vZGVQYWNrYWdlTWFuYWdlci5OUE06IHJldHVybiAnbnBtIHJ1bic7XG4gICAgICAgIGNhc2UgTm9kZVBhY2thZ2VNYW5hZ2VyLllBUk46IHJldHVybiAneWFybiBydW4nO1xuICAgICAgICBjYXNlIE5vZGVQYWNrYWdlTWFuYWdlci5QTlBNOiByZXR1cm4gJ3BucG0gcnVuJztcbiAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGB1bmV4cGVjdGVkIHBhY2thZ2UgbWFuYWdlciAke3RoaXMucGFja2FnZU1hbmFnZXJ9YCk7XG4gICAgICB9XG4gICAgfSkoKTtcblxuICAgIHRoaXMubm9kZVZlcnNpb24gPSBvcHRpb25zLndvcmtmbG93Tm9kZVZlcnNpb24gPz8gdGhpcy5wYWNrYWdlLm1pbk5vZGVWZXJzaW9uO1xuXG4gICAgLy8gYWRkIFBBVEggZm9yIGFsbCB0YXNrcyB3aGljaCBpbmNsdWRlcyB0aGUgcHJvamVjdCdzIG5wbSAuYmluIGxpc3RcbiAgICB0aGlzLnRhc2tzLmFkZEVudmlyb25tZW50KCdQQVRIJywgJyQobnB4IC1jIFwibm9kZSAtZSBcXFxcXFxcImNvbnNvbGUubG9nKHByb2Nlc3MuZW52LlBBVEgpXFxcXFxcXCJcIiknKTtcblxuICAgIHRoaXMuY29tcGlsZVRhc2sgPSB0aGlzLmFkZFRhc2soJ2NvbXBpbGUnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ09ubHkgY29tcGlsZScsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LkJVSUxELFxuICAgIH0pO1xuXG4gICAgdGhpcy50ZXN0Q29tcGlsZVRhc2sgPSB0aGlzLmFkZFRhc2soJ3Rlc3Q6Y29tcGlsZScsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnY29tcGlsZXMgdGhlIHRlc3QgY29kZScsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LlRFU1QsXG4gICAgfSk7XG5cbiAgICB0aGlzLnRlc3RUYXNrID0gdGhpcy5hZGRUYXNrKCd0ZXN0Jywge1xuICAgICAgZGVzY3JpcHRpb246ICdSdW4gdGVzdHMnLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5URVNULFxuICAgIH0pO1xuXG4gICAgdGhpcy50ZXN0VGFzay5zcGF3bih0aGlzLnRlc3RDb21waWxlVGFzayk7XG5cbiAgICB0aGlzLmJ1aWxkVGFzayA9IHRoaXMuYWRkVGFzaygnYnVpbGQnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcmVsZWFzZSBidWlsZCAodGVzdCtjb21waWxlKScsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LkJVSUxELFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRMaWNlbnNlKG9wdGlvbnMpO1xuXG4gICAgdGhpcy5ucG1EaXN0VGFnID0gdGhpcy5wYWNrYWdlLm5wbURpc3RUYWc7XG4gICAgdGhpcy5ucG1SZWdpc3RyeSA9IHRoaXMucGFja2FnZS5ucG1SZWdpc3RyeTtcblxuICAgIGlmIChvcHRpb25zLm5wbWlnbm9yZUVuYWJsZWQgPz8gdHJ1ZSkge1xuICAgICAgdGhpcy5ucG1pZ25vcmUgPSBuZXcgSWdub3JlRmlsZSh0aGlzLCAnLm5wbWlnbm9yZScpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkRGVmYXVsdEdpdElnbm9yZSgpO1xuXG4gICAgaWYgKG9wdGlvbnMuZ2l0aWdub3JlPy5sZW5ndGgpIHtcbiAgICAgIGZvciAoY29uc3QgaSBvZiBvcHRpb25zLmdpdGlnbm9yZSkge1xuICAgICAgICB0aGlzLmdpdGlnbm9yZS5leGNsdWRlKGkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLm5wbWlnbm9yZT8ubGVuZ3RoKSB7XG4gICAgICBpZiAoIXRoaXMubnBtaWdub3JlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignLm5wbWlnbm9yZSBpcyBub3QgZGVmaW5lZCBmb3IgYW4gQVBQIHByb2plY3QgdHlwZS4gQWRkIFwibnBtSWdub3JlOiB0cnVlXCIgdG8gb3ZlcnJpZGUgdGhpcycpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGkgb2Ygb3B0aW9ucy5ucG1pZ25vcmUpIHtcbiAgICAgICAgdGhpcy5ucG1pZ25vcmUuZXhjbHVkZShpKTtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIHRoaXMuc2V0U2NyaXB0KFBST0pFTl9TQ1JJUFQsIHRoaXMucGFja2FnZS5wcm9qZW5Db21tYW5kKTtcbiAgICB0aGlzLnNldFNjcmlwdCgnc3RhcnQnLCBgJHt0aGlzLnBhY2thZ2UucHJvamVuQ29tbWFuZH0gc3RhcnRgKTtcblxuICAgIHRoaXMubnBtaWdub3JlPy5leGNsdWRlKGAvJHtQUk9KRU5fUkN9YCk7XG4gICAgdGhpcy5ucG1pZ25vcmU/LmV4Y2x1ZGUoYC8ke1BST0pFTl9ESVJ9YCk7XG4gICAgdGhpcy5naXRpZ25vcmUuaW5jbHVkZShgLyR7UFJPSkVOX1JDfWApO1xuXG5cbiAgICBjb25zdCBwcm9qZW4gPSBvcHRpb25zLnByb2plbkRldkRlcGVuZGVuY3kgPz8gdHJ1ZTtcbiAgICBpZiAocHJvamVuKSB7XG4gICAgICBjb25zdCBwcm9qZW5WZXJzaW9uID0gb3B0aW9ucy5wcm9qZW5WZXJzaW9uID8/IGBeJHtQUk9KRU5fVkVSU0lPTn1gO1xuICAgICAgdGhpcy5hZGREZXZEZXBzKGBwcm9qZW5AJHtwcm9qZW5WZXJzaW9ufWApO1xuICAgIH1cblxuICAgIGlmICghb3B0aW9ucy5kZWZhdWx0UmVsZWFzZUJyYW5jaCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdcImRlZmF1bHRSZWxlYXNlQnJhbmNoXCIgaXMgdGVtcG9yYXJpbHkgYSByZXF1aXJlZCBvcHRpb24gd2hpbGUgd2UgbWlncmF0ZSBpdHMgZGVmYXVsdCB2YWx1ZSBmcm9tIFwibWFzdGVyXCIgdG8gXCJtYWluXCInKTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWZhdWx0UmVsZWFzZUJyYW5jaCA9IG9wdGlvbnMuZGVmYXVsdFJlbGVhc2VCcmFuY2ggPz8gJ21haW4nO1xuXG4gICAgLy8gdmVyc2lvbiBpcyByZWFkIGZyb20gYSBjb21taXR0ZWQgZmlsZSBjYWxsZWQgdmVyc2lvbi5qc29uIHdoaWNoIGlzIGhvdyB3ZSBidW1wXG4gICAgdGhpcy5fdmVyc2lvbiA9IG5ldyBWZXJzaW9uKHRoaXMsIHsgcmVsZWFzZUJyYW5jaDogZGVmYXVsdFJlbGVhc2VCcmFuY2ggfSk7XG4gICAgdGhpcy5wYWNrYWdlLmFkZFZlcnNpb24odGhpcy5fdmVyc2lvbi5jdXJyZW50VmVyc2lvbik7XG5cbiAgICAvLyBpbmRpY2F0ZSBpZiB3ZSBoYXZlIGFudGktdGFtcGVyIGNvbmZpZ3VyZWQgaW4gb3VyIHdvcmtmbG93cy4gdXNlZCBieSBlLmcuIEplc3RcbiAgICAvLyB0byBkZWNpZGUgaWYgd2UgY2FuIGFsd2F5cyBydW4gd2l0aCAtLXVwZGF0ZVNuYXBzaG90XG4gICAgdGhpcy5hbnRpdGFtcGVyID0gKG9wdGlvbnMuYnVpbGRXb3JrZmxvdyA/PyAodGhpcy5wYXJlbnQgPyBmYWxzZSA6IHRydWUpKSAmJiAob3B0aW9ucy5hbnRpdGFtcGVyID8/IHRydWUpO1xuXG4gICAgLy8gY29uZmlndXJlIGplc3QgaWYgZW5hYmxlZFxuICAgIC8vIG11c3QgYmUgYmVmb3JlIHRoZSBidWlsZC9yZWxlYXNlIHdvcmtmbG93c1xuICAgIGlmIChvcHRpb25zLmplc3QgPz8gdHJ1ZSkge1xuICAgICAgdGhpcy5qZXN0ID0gbmV3IEplc3QodGhpcywgb3B0aW9ucy5qZXN0T3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuYnVpbGRXb3JrZmxvdyA/PyAodGhpcy5wYXJlbnQgPyBmYWxzZSA6IHRydWUpKSB7XG4gICAgICBjb25zdCB7IHdvcmtmbG93LCBidWlsZEpvYklkIH0gPSB0aGlzLmNyZWF0ZUJ1aWxkV29ya2Zsb3coJ0J1aWxkJywge1xuICAgICAgICB0cmlnZ2VyOiB7XG4gICAgICAgICAgcHVsbF9yZXF1ZXN0OiB7IH0sXG4gICAgICAgIH0sXG4gICAgICAgIGltYWdlOiBvcHRpb25zLndvcmtmbG93Q29udGFpbmVySW1hZ2UsXG4gICAgICAgIGNvZGVDb3Y6IG9wdGlvbnMuY29kZUNvdiA/PyBmYWxzZSxcbiAgICAgICAgY29kZUNvdlRva2VuU2VjcmV0OiBvcHRpb25zLmNvZGVDb3ZUb2tlblNlY3JldCxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmJ1aWxkV29ya2Zsb3cgPSB3b3JrZmxvdztcbiAgICAgIHRoaXMuYnVpbGRXb3JrZmxvd0pvYklkID0gYnVpbGRKb2JJZDtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5yZWxlYXNlV29ya2Zsb3cgPz8gKHRoaXMucGFyZW50ID8gZmFsc2UgOiB0cnVlKSkge1xuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaGVzID0gb3B0aW9ucy5yZWxlYXNlQnJhbmNoZXMgPz8gW2RlZmF1bHRSZWxlYXNlQnJhbmNoXTtcblxuICAgICAgY29uc3QgdHJpZ2dlcjogeyBbZXZlbnQ6IHN0cmluZ106IGFueSB9ID0geyB9O1xuXG4gICAgICBpZiAob3B0aW9ucy5yZWxlYXNlRXZlcnlDb21taXQgPz8gdHJ1ZSkge1xuICAgICAgICB0cmlnZ2VyLnB1c2ggPSB7IGJyYW5jaGVzOiByZWxlYXNlQnJhbmNoZXMgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMucmVsZWFzZVNjaGVkdWxlKSB7XG4gICAgICAgIHRyaWdnZXIuc2NoZWR1bGUgPSB7IGNyb246IG9wdGlvbnMucmVsZWFzZVNjaGVkdWxlIH07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFydGlmYWN0RGlyZWN0b3J5ID0gb3B0aW9ucy5hcnRpZmFjdHNEaXJlY3RvcnkgPz8gJ2Rpc3QnO1xuXG4gICAgICBjb25zdCB7IHdvcmtmbG93LCBidWlsZEpvYklkIH0gPSB0aGlzLmNyZWF0ZUJ1aWxkV29ya2Zsb3coJ1JlbGVhc2UnLCB7XG4gICAgICAgIHRyaWdnZXIsXG4gICAgICAgIHByZUJ1aWxkU3RlcHM6IFt7XG4gICAgICAgICAgbmFtZTogJ0J1bXAgdG8gbmV4dCB2ZXJzaW9uJyxcbiAgICAgICAgICBydW46IHRoaXMucnVuVGFza0NvbW1hbmQodGhpcy5fdmVyc2lvbi5idW1wVGFzayksXG4gICAgICAgIH1dLFxuICAgICAgICBwdXNoQnJhbmNoOiAnJHt7IGdpdGh1Yi5yZWYgfX0nLFxuICAgICAgICBhcnRpZmFjdERpcmVjdG9yeSxcbiAgICAgICAgaW1hZ2U6IG9wdGlvbnMud29ya2Zsb3dDb250YWluZXJJbWFnZSxcbiAgICAgICAgY29kZUNvdjogb3B0aW9ucy5jb2RlQ292ID8/IGZhbHNlLFxuICAgICAgICBjb2RlQ292VG9rZW5TZWNyZXQ6IG9wdGlvbnMuY29kZUNvdlRva2VuU2VjcmV0LFxuICAgICAgICBjaGVja291dFdpdGg6IHtcbiAgICAgICAgICAvLyB3ZSBtdXN0IHVzZSAnZmV0Y2gtZGVwdGg9MCcgaW4gb3JkZXIgdG8gZmV0Y2ggYWxsIHRhZ3NcbiAgICAgICAgICAvLyBvdGhlcndpc2UgdGFncyBhcmUgbm90IGNoZWNrZWQgb3V0XG4gICAgICAgICAgJ2ZldGNoLWRlcHRoJzogMCxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnJlbGVhc2VXb3JrZmxvdyA9IHdvcmtmbG93O1xuXG4gICAgICB0aGlzLnB1Ymxpc2hlciA9IG5ldyBQdWJsaXNoZXIodGhpcywge1xuICAgICAgICB3b3JrZmxvdzogdGhpcy5yZWxlYXNlV29ya2Zsb3csXG4gICAgICAgIGFydGlmYWN0TmFtZTogYXJ0aWZhY3REaXJlY3RvcnksXG4gICAgICAgIGJ1aWxkSm9iSWQsXG4gICAgICAgIGpzaWlSZWxlYXNlVmVyc2lvbjogb3B0aW9ucy5qc2lpUmVsZWFzZVZlcnNpb24sXG4gICAgICB9KTtcblxuICAgICAgaWYgKG9wdGlvbnMucmVsZWFzZVRvTnBtID8/IGZhbHNlKSB7XG4gICAgICAgIHRoaXMucHVibGlzaGVyLnB1Ymxpc2hUb05wbSh7XG4gICAgICAgICAgZGlzdFRhZzogdGhpcy5wYWNrYWdlLm5wbURpc3RUYWcsXG4gICAgICAgICAgcmVnaXN0cnk6IHRoaXMucGFja2FnZS5ucG1SZWdpc3RyeSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHZhbGlkYXRlIHRoYXQgbm8gcmVsZWFzZSBvcHRpb25zIGFyZSBzZWxlY3RlZCBpZiB0aGUgcmVsZWFzZSB3b3JrZmxvdyBpcyBkaXNhYmxlZC5cbiAgICAgIGlmIChvcHRpb25zLnJlbGVhc2VUb05wbSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wicmVsZWFzZVRvTnBtXCIgaXMgbm90IHN1cHBvcnRlZCBmb3IgQVBQIHByb2plY3RzJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnJlbGVhc2VCcmFuY2hlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wicmVsZWFzZUJyYW5jaGVzXCIgaXMgbm90IHN1cHBvcnRlZCBmb3IgQVBQIHByb2plY3RzJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnJlbGVhc2VFdmVyeUNvbW1pdCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wicmVsZWFzZUV2ZXJ5Q29tbWl0XCIgaXMgbm90IHN1cHBvcnRlZCBmb3IgQVBQIHByb2plY3RzJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnJlbGVhc2VTY2hlZHVsZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wicmVsZWFzZVNjaGVkdWxlXCIgaXMgbm90IHN1cHBvcnRlZCBmb3IgQVBQIHByb2plY3RzJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMubWVyZ2lmeSA/PyB0cnVlKSB7XG4gICAgICB0aGlzLmF1dG9NZXJnZSA9IG5ldyBBdXRvTWVyZ2UodGhpcywge1xuICAgICAgICBhdXRvTWVyZ2VMYWJlbDogb3B0aW9ucy5tZXJnaWZ5QXV0b01lcmdlTGFiZWwsXG4gICAgICAgIGJ1aWxkSm9iOiB0aGlzLmJ1aWxkV29ya2Zsb3dKb2JJZCxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm5wbWlnbm9yZT8uZXhjbHVkZSgnLy5tZXJnaWZ5LnltbCcpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmRlcGVuZGFib3QgPz8gdHJ1ZSkge1xuICAgICAgdGhpcy5naXRodWI/LmFkZERlcGVuZGFib3Qob3B0aW9ucy5kZXBlbmRhYm90T3B0aW9ucyk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvamVuQXV0b01lcmdlID0gb3B0aW9ucy5wcm9qZW5VcGdyYWRlQXV0b01lcmdlID8/IHRydWU7XG4gICAgbmV3IFByb2plblVwZ3JhZGUodGhpcywge1xuICAgICAgYXV0b1VwZ3JhZGVTZWNyZXQ6IG9wdGlvbnMucHJvamVuVXBncmFkZVNlY3JldCxcbiAgICAgIGF1dG9VcGdyYWRlU2NoZWR1bGU6IG9wdGlvbnMucHJvamVuVXBncmFkZVNjaGVkdWxlLFxuICAgICAgbGFiZWxzOiAocHJvamVuQXV0b01lcmdlICYmIHRoaXMuYXV0b01lcmdlPy5hdXRvTWVyZ2VMYWJlbClcbiAgICAgICAgPyBbdGhpcy5hdXRvTWVyZ2UuYXV0b01lcmdlTGFiZWxdXG4gICAgICAgIDogW10sXG4gICAgfSk7XG5cbiAgICBpZiAob3B0aW9ucy5wdWxsUmVxdWVzdFRlbXBsYXRlID8/IHRydWUpIHtcbiAgICAgIHRoaXMuZ2l0aHViPy5hZGRQdWxsUmVxdWVzdFRlbXBsYXRlKC4uLm9wdGlvbnMucHVsbFJlcXVlc3RUZW1wbGF0ZUNvbnRlbnRzID8/IFtdKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5yZWJ1aWxkQm90ID8/ICh0aGlzLnBhcmVudCA/IGZhbHNlIDogdHJ1ZSkpIHtcbiAgICAgIHRoaXMuYWRkUmVidWlsZEJvdChvcHRpb25zLnJlYnVpbGRCb3RDb21tYW5kID8/ICdyZWJ1aWxkJyk7XG4gICAgfVxuXG4gIH1cblxuICBwdWJsaWMgYWRkQmlucyhiaW5zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB7XG4gICAgdGhpcy5wYWNrYWdlLmFkZEJpbihiaW5zKTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHNldFNjcmlwdChuYW1lOiBzdHJpbmcsIGNvbW1hbmQ6IHN0cmluZykge1xuICAgIHRoaXMucGFja2FnZS5zZXRTY3JpcHQobmFtZSwgY29tbWFuZCk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlbW92ZVNjcmlwdChuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnBhY2thZ2UucmVtb3ZlU2NyaXB0KG5hbWUpO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBoYXNTY3JpcHQobmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMucGFja2FnZS5oYXNTY3JpcHQobmFtZSk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZENvbXBpbGVDb21tYW5kKC4uLmNvbW1hbmRzOiBzdHJpbmdbXSkge1xuICAgIGZvciAoY29uc3QgYyBvZiBjb21tYW5kcykge1xuICAgICAgdGhpcy5jb21waWxlVGFzay5leGVjKGMpO1xuICAgIH1cbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkVGVzdENvbW1hbmQoLi4uY29tbWFuZHM6IHN0cmluZ1tdKSB7XG4gICAgZm9yIChjb25zdCBjIG9mIGNvbW1hbmRzKSB7XG4gICAgICB0aGlzLnRlc3RUYXNrLmV4ZWMoYyk7XG4gICAgfVxuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkQnVpbGRDb21tYW5kKC4uLmNvbW1hbmRzOiBzdHJpbmdbXSkge1xuICAgIGZvciAoY29uc3QgYyBvZiBjb21tYW5kcykge1xuICAgICAgdGhpcy5idWlsZFRhc2suZXhlYyhjKTtcbiAgICB9XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZEZpZWxkcyhmaWVsZHM6IHsgW25hbWU6IHN0cmluZ106IGFueSB9KSB7XG4gICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGZpZWxkcykpIHtcbiAgICAgIHRoaXMucGFja2FnZS5hZGRGaWVsZChuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkS2V5d29yZHMoLi4ua2V5d29yZHM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5wYWNrYWdlLmFkZEtleXdvcmRzKC4uLmtleXdvcmRzKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaW5zdGFsbFdvcmtmbG93U3RlcHMoKTogYW55W10ge1xuICAgIGNvbnN0IGluc3RhbGwgPSBuZXcgQXJyYXkoKTtcbiAgICBpZiAodGhpcy5ub2RlVmVyc2lvbikge1xuICAgICAgaW5zdGFsbC5wdXNoKHtcbiAgICAgICAgbmFtZTogJ1NldHVwIE5vZGUuanMnLFxuICAgICAgICB1c2VzOiAnYWN0aW9ucy9zZXR1cC1ub2RlQHYxJyxcbiAgICAgICAgd2l0aDogeyAnbm9kZS12ZXJzaW9uJzogdGhpcy5ub2RlVmVyc2lvbiB9LFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5zdGFsbC5wdXNoKHtcbiAgICAgIG5hbWU6ICdJbnN0YWxsIGRlcGVuZGVuY2llcycsXG4gICAgICBydW46IHRoaXMucGFja2FnZS5pbnN0YWxsQ29tbWFuZCxcbiAgICB9KTtcblxuICAgIC8vIHJ1biBcInByb2plblwiXG4gICAgaW5zdGFsbC5wdXNoKHtcbiAgICAgIG5hbWU6ICdTeW50aGVzaXplIHByb2plY3QgZmlsZXMnLFxuICAgICAgcnVuOiB0aGlzLnBhY2thZ2UucHJvamVuQ29tbWFuZCxcbiAgICB9KTtcblxuICAgIHJldHVybiBpbnN0YWxsO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZERlcHMoLi4uZGVwczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5wYWNrYWdlLmFkZERlcHMoLi4uZGVwcyk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZERldkRlcHMoLi4uZGVwczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5wYWNrYWdlLmFkZERldkRlcHMoLi4uZGVwcyk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkUGVlckRlcHMoLi4uZGVwczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5wYWNrYWdlLmFkZFBlZXJEZXBzKC4uLmRlcHMpO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkQnVuZGxlZERlcHMoLi4uZGVwczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5wYWNrYWdlLmFkZEJ1bmRsZWREZXBzKC4uLmRlcHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRMaWNlbnNlKG9wdGlvbnM6IE5vZGVQcm9qZWN0T3B0aW9ucykge1xuICAgIGlmICh0aGlzLnBhY2thZ2UubGljZW5zZSkge1xuICAgICAgbmV3IExpY2Vuc2UodGhpcywgdGhpcy5wYWNrYWdlLmxpY2Vuc2UsIHtcbiAgICAgICAgY29weXJpZ2h0T3duZXI6IG9wdGlvbnMuY29weXJpZ2h0T3duZXIgPz8gb3B0aW9ucy5hdXRob3JOYW1lLFxuICAgICAgICBjb3B5cmlnaHRQZXJpb2Q6IG9wdGlvbnMuY29weXJpZ2h0UGVyaW9kLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGREZWZhdWx0R2l0SWdub3JlKCkge1xuICAgIHRoaXMuZ2l0aWdub3JlLmV4Y2x1ZGUoXG4gICAgICAnIyBMb2dzJyxcbiAgICAgICdsb2dzJyxcbiAgICAgICcqLmxvZycsXG4gICAgICAnbnBtLWRlYnVnLmxvZyonLFxuICAgICAgJ3lhcm4tZGVidWcubG9nKicsXG4gICAgICAneWFybi1lcnJvci5sb2cqJyxcbiAgICAgICdsZXJuYS1kZWJ1Zy5sb2cqJyxcblxuICAgICAgJyMgRGlhZ25vc3RpYyByZXBvcnRzIChodHRwczovL25vZGVqcy5vcmcvYXBpL3JlcG9ydC5odG1sKScsXG4gICAgICAncmVwb3J0LlswLTldKi5bMC05XSouWzAtOV0qLlswLTldKi5qc29uJyxcblxuICAgICAgJyMgUnVudGltZSBkYXRhJyxcbiAgICAgICdwaWRzJyxcbiAgICAgICcqLnBpZCcsXG4gICAgICAnKi5zZWVkJyxcbiAgICAgICcqLnBpZC5sb2NrJyxcblxuICAgICAgJyMgRGlyZWN0b3J5IGZvciBpbnN0cnVtZW50ZWQgbGlicyBnZW5lcmF0ZWQgYnkganNjb3ZlcmFnZS9KU0NvdmVyJyxcbiAgICAgICdsaWItY292JyxcblxuICAgICAgJyMgQ292ZXJhZ2UgZGlyZWN0b3J5IHVzZWQgYnkgdG9vbHMgbGlrZSBpc3RhbmJ1bCcsXG4gICAgICAnY292ZXJhZ2UnLFxuICAgICAgJyoubGNvdicsXG5cbiAgICAgICcjIG55YyB0ZXN0IGNvdmVyYWdlJyxcbiAgICAgICcubnljX291dHB1dCcsXG5cbiAgICAgICcjIENvbXBpbGVkIGJpbmFyeSBhZGRvbnMgKGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvYWRkb25zLmh0bWwpJyxcbiAgICAgICdidWlsZC9SZWxlYXNlJyxcblxuICAgICAgJyMgRGVwZW5kZW5jeSBkaXJlY3RvcmllcycsXG4gICAgICAnbm9kZV9tb2R1bGVzLycsXG4gICAgICAnanNwbV9wYWNrYWdlcy8nLFxuXG4gICAgICAnIyBUeXBlU2NyaXB0IGNhY2hlJyxcbiAgICAgICcqLnRzYnVpbGRpbmZvJyxcblxuXG4gICAgICAnIyBPcHRpb25hbCBlc2xpbnQgY2FjaGUnLFxuICAgICAgJy5lc2xpbnRjYWNoZScsXG5cbiAgICAgICcjIE91dHB1dCBvZiBcXCducG0gcGFja1xcJycsXG4gICAgICAnKi50Z3onLFxuXG4gICAgICAnIyBZYXJuIEludGVncml0eSBmaWxlJyxcbiAgICAgICcueWFybi1pbnRlZ3JpdHknLFxuXG4gICAgICAnIyBwYXJjZWwtYnVuZGxlciBjYWNoZSAoaHR0cHM6Ly9wYXJjZWxqcy5vcmcvKScsXG4gICAgICAnLmNhY2hlJyxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVCdWlsZFdvcmtmbG93KG5hbWU6IHN0cmluZywgb3B0aW9uczogTm9kZUJ1aWxkV29ya2Zsb3dPcHRpb25zKTogQnVpbGRXb3JrZmxvdyB7XG4gICAgY29uc3QgYnVpbGRKb2JJZCA9ICdidWlsZCc7XG5cbiAgICBjb25zdCBnaXRodWIgPSB0aGlzLmdpdGh1YjtcbiAgICBpZiAoIWdpdGh1YikgeyB0aHJvdyBuZXcgRXJyb3IoJ25vIGdpdGh1YiBzdXBwb3J0Jyk7IH1cblxuICAgIGNvbnN0IHdvcmtmbG93ID0gZ2l0aHViLmFkZFdvcmtmbG93KG5hbWUpO1xuXG4gICAgd29ya2Zsb3cub24ob3B0aW9ucy50cmlnZ2VyKTtcblxuICAgIHdvcmtmbG93Lm9uKHtcbiAgICAgIHdvcmtmbG93X2Rpc3BhdGNoOiB7fSwgLy8gYWxsb3cgbWFudWFsIHRyaWdnZXJpbmdcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbmRpdGlvbiA9IG9wdGlvbnMuY29uZGl0aW9uID8geyBpZjogb3B0aW9ucy5jb25kaXRpb24gfSA6IHt9O1xuICAgIGNvbnN0IHByZUJ1aWxkU3RlcHMgPSBvcHRpb25zLnByZUJ1aWxkU3RlcHMgPz8gW107XG4gICAgY29uc3QgcHJlQ2hlY2tvdXRTdGVwcyA9IG9wdGlvbnMucHJlQ2hlY2tvdXRTdGVwcyA/PyBbXTtcbiAgICBjb25zdCBjaGVja291dFdpdGggPSBvcHRpb25zLmNoZWNrb3V0V2l0aCA/IHsgd2l0aDogb3B0aW9ucy5jaGVja291dFdpdGggfSA6IHt9O1xuICAgIGNvbnN0IHBvc3RTdGVwcyA9IG9wdGlvbnMucG9zdFN0ZXBzID8/IFtdO1xuXG4gICAgY29uc3QgYW50aXRhbXBlclN0ZXBzID0gKG9wdGlvbnMuYW50aXRhbXBlckRpc2FibGVkIHx8ICF0aGlzLmFudGl0YW1wZXIpID8gW10gOiBbe1xuICAgICAgbmFtZTogJ0FudGktdGFtcGVyIGNoZWNrJyxcbiAgICAgIHJ1bjogJ2dpdCBkaWZmIC0tZXhpdC1jb2RlJyxcbiAgICB9XTtcblxuICAgIGNvbnN0IGNvbW1pdENoYW5nZXMgPSAhb3B0aW9ucy5jb21taXQgPyBbXSA6IFt7XG4gICAgICBuYW1lOiAnQ29tbWl0IGNoYW5nZXMnLFxuICAgICAgcnVuOiBgZ2l0IGNvbW1pdCAtYW0gXCIke29wdGlvbnMuY29tbWl0fVwiYCxcbiAgICB9XTtcblxuICAgIGNvbnN0IHB1c2hDaGFuZ2VzID0gIW9wdGlvbnMucHVzaEJyYW5jaCA/IFtdIDogW1xuICAgICAge1xuICAgICAgICBuYW1lOiAnUHVzaCBjb21taXRzJyxcbiAgICAgICAgcnVuOiAnZ2l0IHB1c2ggb3JpZ2luICRCUkFOQ0gnLFxuICAgICAgICBlbnY6IHtcbiAgICAgICAgICBCUkFOQ0g6IG9wdGlvbnMucHVzaEJyYW5jaCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG5cbiAgICAgIC8vIHB1c2ggdGFncyBvbmx5IGFmdGVyIHdlJ3ZlIG1hbmFnZWQgdG8gcHVzaCBvdXIgY29tbWl0cyBpbiBvcmRlciB0b1xuICAgICAgLy8gYXZvaWQgdGFncyBiZWluZyBwdXNoZWQgYnV0IGNvbW1pdHMgYmVpbmcgcmVqZWN0ZWQgZHVlIHRvIG5ldyBjb21taXRzXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3Byb2plbi9wcm9qZW4vaXNzdWVzLzU1M1xuICAgICAge1xuICAgICAgICBuYW1lOiAnUHVzaCB0YWdzJyxcbiAgICAgICAgcnVuOiAnZ2l0IHB1c2ggLS1mb2xsb3ctdGFncyBvcmlnaW4gJEJSQU5DSCcsXG4gICAgICAgIGVudjoge1xuICAgICAgICAgIEJSQU5DSDogb3B0aW9ucy5wdXNoQnJhbmNoLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgY29uc3Qgam9iOiBhbnkgPSB7XG4gICAgICAncnVucy1vbic6ICd1YnVudHUtbGF0ZXN0JyxcbiAgICAgICdlbnYnOiB7XG4gICAgICAgIENJOiAndHJ1ZScsIC8vIHdpbGwgY2F1c2UgYE5vZGVQcm9qZWN0YCB0byBleGVjdXRlIGB5YXJuIGluc3RhbGxgIHdpdGggYC0tZnJvemVuLWxvY2tmaWxlYFxuICAgICAgfSxcbiAgICAgIC4uLmNvbmRpdGlvbixcbiAgICAgICdzdGVwcyc6IFtcbiAgICAgICAgLi4ucHJlQ2hlY2tvdXRTdGVwcyxcblxuICAgICAgICAvLyBjaGVjayBvdXQgc291cmNlcy5cbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDaGVja291dCcsXG4gICAgICAgICAgdXNlczogJ2FjdGlvbnMvY2hlY2tvdXRAdjInLFxuICAgICAgICAgIC4uLmNoZWNrb3V0V2l0aCxcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBpbnN0YWxsIGRlcGVuZGVuY2llc1xuICAgICAgICAuLi50aGlzLmluc3RhbGxXb3JrZmxvd1N0ZXBzLFxuXG4gICAgICAgIC8vIHBlcmZvcm0gYW4gYW50aS10YW1wZXIgY2hlY2sgaW1tZWRpYXRlbHkgYWZ0ZXIgd2UgcnVuIHByb2plbi5cbiAgICAgICAgLi4uYW50aXRhbXBlclN0ZXBzLFxuXG4gICAgICAgIC8vIHNldHMgZ2l0IGlkZW50aXR5IHNvIHdlIGNhbiBwdXNoIGxhdGVyXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnU2V0IGdpdCBpZGVudGl0eScsXG4gICAgICAgICAgcnVuOiBbXG4gICAgICAgICAgICAnZ2l0IGNvbmZpZyB1c2VyLm5hbWUgXCJBdXRvLWJ1bXBcIicsXG4gICAgICAgICAgICAnZ2l0IGNvbmZpZyB1c2VyLmVtYWlsIFwiZ2l0aHViLWFjdGlvbnNAZ2l0aHViLmNvbVwiJyxcbiAgICAgICAgICBdLmpvaW4oJ1xcbicpLFxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBjaGFuZ2VzLCBjcmVhdGVzIGEgYnVtcCBjb21taXRcblxuICAgICAgICAuLi5wcmVCdWlsZFN0ZXBzLFxuXG4gICAgICAgIC8vIGJ1aWxkIChjb21waWxlICsgdGVzdClcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdCdWlsZCcsXG4gICAgICAgICAgcnVuOiB0aGlzLnJ1blRhc2tDb21tYW5kKHRoaXMuYnVpbGRUYXNrKSxcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBydW4gY29kZWNvdiBpZiBlbmFibGVkIG9yIGEgc2VjcmV0IHRva2VuIG5hbWUgaXMgcGFzc2VkIGluXG4gICAgICAgIC8vIEFORCBqZXN0IG11c3QgYmUgY29uZmlndXJlZFxuICAgICAgICAuLi4ob3B0aW9ucy5jb2RlQ292IHx8IG9wdGlvbnMuY29kZUNvdlRva2VuU2VjcmV0KSAmJiB0aGlzLmplc3Q/LmNvbmZpZyA/IFt7XG4gICAgICAgICAgbmFtZTogJ1VwbG9hZCBjb3ZlcmFnZSB0byBDb2RlY292JyxcbiAgICAgICAgICB1c2VzOiAnY29kZWNvdi9jb2RlY292LWFjdGlvbkB2MScsXG4gICAgICAgICAgd2l0aDogb3B0aW9ucy5jb2RlQ292VG9rZW5TZWNyZXQgPyB7XG4gICAgICAgICAgICB0b2tlbjogYFxcJHt7IHNlY3JldHMuJHtvcHRpb25zLmNvZGVDb3ZUb2tlblNlY3JldH0gfX1gLFxuICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmplc3QuY29uZmlnLmNvdmVyYWdlRGlyZWN0b3J5LFxuICAgICAgICAgIH0gOiB7XG4gICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuamVzdC5jb25maWcuY292ZXJhZ2VEaXJlY3RvcnksXG4gICAgICAgICAgfSxcbiAgICAgICAgfV0gOiBbXSxcblxuICAgICAgICAvLyBhbnRpLXRhbXBlciBjaGVjayAoZmFpbHMgaWYgdGhlcmUgd2VyZSBjaGFuZ2VzIHRvIGNvbW1pdHRlZCBmaWxlcylcbiAgICAgICAgLy8gdGhpcyB3aWxsIGlkZW50aWZ5IGFueSBub24tY29tbWl0dGVkIGZpbGVzIGdlbmVyYXRlZCBkdXJpbmcgYnVpbGQgKGUuZy4gdGVzdCBzbmFwc2hvdHMpXG4gICAgICAgIC4uLmFudGl0YW1wZXJTdGVwcyxcblxuICAgICAgICAvLyBpZiByZXF1aXJlZCwgY29tbWl0IGNoYW5nZXMgdG8gdGhlIHJlcG9cbiAgICAgICAgLi4uY29tbWl0Q2hhbmdlcyxcblxuICAgICAgICAvLyBwdXNoIGJ1bXAgY29tbWl0XG4gICAgICAgIC4uLnB1c2hDaGFuZ2VzLFxuXG4gICAgICAgIC4uLnBvc3RTdGVwcyxcbiAgICAgIF0sXG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zLmltYWdlKSB7XG4gICAgICBqb2IuY29udGFpbmVyID0geyBpbWFnZTogb3B0aW9ucy5pbWFnZSB9O1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmFydGlmYWN0RGlyZWN0b3J5KSB7XG4gICAgICBqb2Iuc3RlcHMucHVzaCh7XG4gICAgICAgIG5hbWU6ICdVcGxvYWQgYXJ0aWZhY3QnLFxuICAgICAgICB1c2VzOiAnYWN0aW9ucy91cGxvYWQtYXJ0aWZhY3RAdjIuMS4xJyxcbiAgICAgICAgd2l0aDoge1xuICAgICAgICAgIG5hbWU6IG9wdGlvbnMuYXJ0aWZhY3REaXJlY3RvcnksXG4gICAgICAgICAgcGF0aDogb3B0aW9ucy5hcnRpZmFjdERpcmVjdG9yeSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHdvcmtmbG93LmFkZEpvYnMoeyBbYnVpbGRKb2JJZF06IGpvYiB9KTtcblxuICAgIHJldHVybiB7IHdvcmtmbG93LCBidWlsZEpvYklkIH07XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJ1blRhc2tDb21tYW5kKHRhc2s6IFRhc2spIHtcbiAgICBzd2l0Y2ggKHRoaXMucGFja2FnZS5ucG1UYXNrRXhlY3V0aW9uKSB7XG4gICAgICBjYXNlIE5wbVRhc2tFeGVjdXRpb24uUFJPSkVOOiByZXR1cm4gYCR7dGhpcy5wYWNrYWdlLnByb2plbkNvbW1hbmR9ICR7dGFzay5uYW1lfWA7XG4gICAgICBjYXNlIE5wbVRhc2tFeGVjdXRpb24uU0hFTEw6IHJldHVybiBgJHt0aGlzLnJ1blNjcmlwdENvbW1hbmR9ICR7dGFzay5uYW1lfWA7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgbnBtVGFza0V4ZWN1dGlvbiBtb2RlOiAke3RoaXMucGFja2FnZS5ucG1UYXNrRXhlY3V0aW9ufWApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkUmVidWlsZEJvdChjb21tYW5kOiBzdHJpbmcpIHtcblxuICAgIGNvbnN0IHBvc3RDb21tZW50ID0gKG1lc3NhZ2U6IHN0cmluZykgPT4gKHtcbiAgICAgIG5hbWU6ICdQb3N0IGNvbW1lbnQgdG8gaXNzdWUnLFxuICAgICAgdXNlczogJ3BldGVyLWV2YW5zL2NyZWF0ZS1vci11cGRhdGUtY29tbWVudEB2MScsXG4gICAgICB3aXRoOiB7XG4gICAgICAgICdpc3N1ZS1udW1iZXInOiAnJHt7IGdpdGh1Yi5ldmVudC5pc3N1ZS5udW1iZXIgfX0nLFxuICAgICAgICAnYm9keSc6IGBfcHJvamVuXzogJHttZXNzYWdlfWAsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5jcmVhdGVCdWlsZFdvcmtmbG93KCdyZWJ1aWxkLWJvdCcsIHtcbiAgICAgIHRyaWdnZXI6IHsgaXNzdWVfY29tbWVudDogeyB0eXBlczogWydjcmVhdGVkJ10gfSB9LFxuICAgICAgY29uZGl0aW9uOiBgXFwke3sgZ2l0aHViLmV2ZW50Lmlzc3VlLnB1bGxfcmVxdWVzdCAmJiBjb250YWlucyhnaXRodWIuZXZlbnQuY29tbWVudC5ib2R5LCAnQHByb2plbiAke2NvbW1hbmR9JykgfX1gLFxuICAgICAgYW50aXRhbXBlckRpc2FibGVkOiB0cnVlLCAvLyBkZWZpbml0ZWx5IGRvIG5vdCB3YW50IHRoYXRcblxuICAgICAgLy8gc2luY2UgdGhlIFwiaXNzdWVfY29tbWVudFwiIGV2ZW50IGlzIG5vdCB0cmlnZ2VyZWQgb24gYSBicmFuY2gsIHdlIG5lZWQgdG8gcmVzb2x2ZVxuICAgICAgLy8gdGhlIGdpdCByZWYgb2YgdGhlIHB1bGwgcmVxdWVzdCBiZWZvcmUgd2UgY2hlY2sgb3V0XG4gICAgICBwcmVDaGVja291dFN0ZXBzOiBbXG4gICAgICAgIHBvc3RDb21tZW50KCdSZWJ1aWxkIHN0YXJ0ZWQnKSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdHZXQgcHVsbCByZXF1ZXN0IGJyYW5jaCcsXG4gICAgICAgICAgaWQ6ICdxdWVyeV9wdWxsX3JlcXVlc3QnLFxuICAgICAgICAgIGVudjogeyBQVUxMX1JFUVVFU1RfVVJMOiAnJHt7IGdpdGh1Yi5ldmVudC5pc3N1ZS5wdWxsX3JlcXVlc3QudXJsIH19JyB9LFxuICAgICAgICAgIHJ1bjogW1xuICAgICAgICAgICAgJ3JtIC1mIC90bXAvcHIuanNvbicsXG4gICAgICAgICAgICAnY3VybCAtLXNpbGVudCAkUFVMTF9SRVFVRVNUX1VSTCA+IC90bXAvcHIuanNvbicsXG4gICAgICAgICAgICAnQlJBTkNIX1NUUj0kKGNhdCAvdG1wL3ByLmpzb24gfCBqcSBcIi5oZWFkLnJlZlwiKScsXG4gICAgICAgICAgICAnUkVQT19OQU1FPSQoY2F0IC90bXAvcHIuanNvbiB8IGpxIFwiLmhlYWQucmVwby5mdWxsX25hbWVcIiknLFxuICAgICAgICAgICAgJ2VjaG8gXCI6OnNldC1vdXRwdXQgbmFtZT1icmFuY2g6OiQobm9kZSAtcCAkQlJBTkNIX1NUUilcIicsXG4gICAgICAgICAgICAnZWNobyBcIjo6c2V0LW91dHB1dCBuYW1lPXJlcG86OiQobm9kZSAtcCAkUkVQT19OQU1FKVwiJyxcbiAgICAgICAgICBdLmpvaW4oJ1xcbicpLFxuICAgICAgICB9LFxuICAgICAgXSxcblxuICAgICAgLy8gdGVsbCBjaGVja291dCB0byB1c2UgdGhlIGJyYW5jaCB3ZSBhY3F1aXJlZCBhdCB0aGUgcHJldmlvdXMgc3RlcFxuICAgICAgY2hlY2tvdXRXaXRoOiB7XG4gICAgICAgIHJlZjogJyR7eyBzdGVwcy5xdWVyeV9wdWxsX3JlcXVlc3Qub3V0cHV0cy5icmFuY2ggfX0nLFxuICAgICAgICByZXBvc2l0b3J5OiAnJHt7IHN0ZXBzLnF1ZXJ5X3B1bGxfcmVxdWVzdC5vdXRwdXRzLnJlcG8gfX0nLFxuICAgICAgfSxcblxuICAgICAgLy8gY29tbWl0IGNoYW5nZXNcbiAgICAgIGNvbW1pdDogJ2Nob3JlOiB1cGRhdGUgZ2VuZXJhdGVkIGZpbGVzJyxcblxuICAgICAgLy8gYW5kIHB1c2ggdG8gdGhlIHB1bGwgcmVxdWVzdCBicmFuY2hcbiAgICAgIHB1c2hCcmFuY2g6ICcke3sgc3RlcHMucXVlcnlfcHVsbF9yZXF1ZXN0Lm91dHB1dHMuYnJhbmNoIH19JyxcblxuICAgICAgcG9zdFN0ZXBzOiBbXG4gICAgICAgIHBvc3RDb21tZW50KCdSZWJ1aWxkIGNvbXBsZXRlLiBVcGRhdGVzIHB1c2hlZCB0byBwdWxsIHJlcXVlc3QgYnJhbmNoLicpLFxuICAgICAgXSxcbiAgICB9KTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgQnVpbGRXb3JrZmxvdyB7XG4gIHJlYWRvbmx5IHdvcmtmbG93OiBHaXRodWJXb3JrZmxvdztcbiAgcmVhZG9ubHkgYnVpbGRKb2JJZDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgTm9kZUJ1aWxkV29ya2Zsb3dPcHRpb25zIHtcbiAgLyoqXG4gICAqIEBkZWZhdWx0IC0gZGVmYXVsdCBpbWFnZVxuICAgKi9cbiAgcmVhZG9ubHkgaW1hZ2U/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gXCJpZlwiIGNvbmRpdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqL1xuICByZWFkb25seSBjb25kaXRpb24/OiBhbnk7XG5cbiAgLyoqXG4gICAqIEEgZGlyZWN0b3J5IG5hbWUgd2hpY2ggY29udGFpbnMgYXJ0aWZhY3RzIHRvIGJlIHB1Ymxpc2hlZCAoZS5nLiBgZGlzdGApLlxuICAgKlxuICAgKiBqYXZhc2NyaXB0IGFydGlmYWN0cyBtdXN0IGJlIHVuZGVyIHRoZSBganNgIHN1YmRpcmVjdG9yeS5cbiAgICogQGRlZmF1bHQgdW5kZWZpbmVkIEJ5IGRlZmF1bHQgYXJ0aWZhY3RzIGFyZSBub3QgdXBsb2FkZWRcbiAgICovXG4gIHJlYWRvbmx5IGFydGlmYWN0RGlyZWN0b3J5Pzogc3RyaW5nO1xuXG4gIHJlYWRvbmx5IHRyaWdnZXI6IHsgW2V2ZW50OiBzdHJpbmddOiBhbnkgfTtcblxuICAvKipcbiAgICogQnVtcCBhIG5ldyB2ZXJzaW9uIGZvciB0aGlzIGJ1aWxkLlxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgLy8gcmVhZG9ubHkgYnVtcD86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFJ1biBjb2RlY292ZXJhZ2Ugc3RlcFxuICAgKiBTZW5kIHRvIGh0dHBzOi8vY29kZWNvdi5pby9cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHJlYWRvbmx5IGNvZGVDb3Y/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBUaGUgc2VjcmV0IG5hbWUgZm9yIHRoZSBodHRwczovL2NvZGVjb3YuaW8vIHRva2VuXG4gICAqL1xuICByZWFkb25seSBjb2RlQ292VG9rZW5TZWNyZXQ/OiBzdHJpbmc7XG5cbiAgcmVhZG9ubHkgcHJlQnVpbGRTdGVwcz86IGFueVtdO1xuICByZWFkb25seSBwcmVDaGVja291dFN0ZXBzPzogYW55W107XG4gIHJlYWRvbmx5IHBvc3RTdGVwcz86IGFueVtdO1xuICByZWFkb25seSBjaGVja291dFdpdGg/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xuXG4gIC8qKlxuICAgKiBDb21taXQgYW55IGNoYW5nZXMgd2l0aCB0aGUgc3BlY2lmaWVkIGNvbW1pdCBtZXNzYWdlLlxuICAgKi9cbiAgcmVhZG9ubHkgY29tbWl0Pzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBAZGVmYXVsdCAtIGRvIG5vdCBwdXNoIHRoZSBjaGFuZ2VzIHRvIGEgYnJhbmNoXG4gICAqL1xuICByZWFkb25seSBwdXNoQnJhbmNoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhbnRpLXRhbXBlciBjaGVja3MgaW4gdGhlIHdvcmtmbG93LlxuICAgKi9cbiAgcmVhZG9ubHkgYW50aXRhbXBlckRpc2FibGVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb2RlV29ya2Zsb3dTdGVwcyB7XG4gIHJlYWRvbmx5IGFudGl0YW1wZXI6IGFueVtdO1xuICByZWFkb25seSBpbnN0YWxsOiBhbnlbXTtcbn1cbiJdfQ==