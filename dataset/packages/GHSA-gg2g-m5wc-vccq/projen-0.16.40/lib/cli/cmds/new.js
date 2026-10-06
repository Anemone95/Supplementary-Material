"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const path = require("path");
const vm = require("vm");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const yargs = require("yargs");
const common_1 = require("../../common");
const inventory = require("../../inventory");
const logging = require("../../logging");
const util_1 = require("../../util");
const macros_1 = require("../macros");
class Command {
    constructor() {
        this.command = 'new [PROJECT-TYPE] [OPTIONS]';
        this.describe = 'Creates a new projen project';
    }
    builder(args) {
        var _a;
        args.positional('PROJECT-TYPE', { describe: 'optional only when --from is used and there is a single project type in the external module', type: 'string' });
        args.option('synth', { type: 'boolean', default: true, desc: 'Synthesize after creating .projenrc.js' });
        args.option('comments', { type: 'boolean', default: true, desc: 'Include commented out options in .projenrc.js (use --no-comments to disable)' });
        args.option('from', { type: 'string', alias: 'f', desc: 'External jsii npm module to create project from. Supports any package spec supported by yarn (such as "my-pack@^2.0")' });
        args.example('projen new awscdk-app-ts', 'Creates a new project of built-in type "awscdk-app-ts"');
        args.example('projen new --from projen-vue@^2', 'Creates a new project from an external module "projen-vue" with the specified version');
        for (const type of inventory.discover()) {
            args.command(type.pjid, (_a = type.docs) !== null && _a !== void 0 ? _a : '', {
                builder: cargs => {
                    var _a, _b, _c;
                    cargs.showHelpOnFail(true);
                    for (const option of (_a = type.options) !== null && _a !== void 0 ? _a : []) {
                        if (option.type !== 'string' && option.type !== 'number' && option.type !== 'boolean') {
                            continue; // we don't support non-primitive fields as command line options
                        }
                        let desc = [(_c = (_b = option.docs) === null || _b === void 0 ? void 0 : _b.replace(/\ *\.$/, '')) !== null && _c !== void 0 ? _c : ''];
                        const required = !option.optional;
                        let defaultValue;
                        if (option.default && option.default !== 'undefined') {
                            if (!required) {
                                // if the field is not required, just describe the default but don't actually assign a value
                                desc.push(`[default: ${option.default.replace(/^\ *-/, '').replace(/\.$/, '').trim()}]`);
                            }
                            else {
                                // if the field is required and we have a @default, then assign
                                // the value here so it appears in `--help`
                                defaultValue = renderDefault(option.default);
                            }
                        }
                        cargs.option(option.switch, {
                            group: required ? 'Required:' : 'Optional:',
                            type: option.type,
                            description: desc.join(' '),
                            default: defaultValue,
                            required,
                        });
                    }
                    return cargs;
                },
                handler: argv => newProject(process.cwd(), type, argv),
            });
        }
        return args;
    }
    async handler(args) {
        // handle --from which means we want to first install a jsii module and then
        // create a project defined within this module.
        if (args.from) {
            return newProjectFromModule(process.cwd(), args.from, args);
        }
        // project type is defined but was not matched by yargs, so print the list of supported types
        if (args.projectType) {
            console.log(`Invalid project type ${args.projectType}. Supported types:`);
            for (const pjid of inventory.discover().map(x => x.pjid)) {
                console.log(`  ${pjid}`);
            }
            return;
        }
        // Handles the use case that nothing was specified since PROJECT-TYPE is now an optional positional parameter
        yargs.showHelp();
    }
}
/**
 * Creates a new project with defaults.
 *
 * This function creates the project type in-process (with in VM) and calls
 * `.synth()` on it (if `options.synth` is not `false`).
 *
 * At the moment, it also generates a `.projenrc.js` file with the same code
 * that was just executed. In the future, this will also be done by the project
 * type, so we can easily support multiple languages of projenrc.
 */
function createProject(opts) {
    // Default project resolution location
    let mod = '../../index';
    // External projects need to load the module from the modules directory
    if (opts.type.moduleName !== 'projen') {
        try {
            mod = path.dirname(require.resolve(path.join(opts.type.moduleName, 'package.json'), { paths: [process.cwd()] }));
        }
        catch (err) {
            throw new Error(`External project module '${opts.type.moduleName}' could not be resolved.`);
        }
    }
    // pass the FQN of the project type to the project initializer so it can
    // generate the projenrc file.
    opts.params.jsiiFqn = JSON.stringify(opts.type.fqn);
    const newProjectCode = `const project = new ${opts.type.typename}(${renderParams(opts)});`;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require(mod);
    const ctx = vm.createContext(module);
    process.env.PROJEN_DISABLE_POST = (!opts.post).toString();
    vm.runInContext([
        newProjectCode,
        opts.synth ? 'project.synth();' : '',
    ].join('\n'), ctx);
    const configPath = path.join(opts.dir, common_1.PROJEN_RC);
    if (fs.existsSync(configPath)) {
        logging.error(`Directory ${opts.dir} already contains ${common_1.PROJEN_RC}`);
        process.exit(1);
    }
    const [importName] = opts.type.typename.split('.');
    const lines = [
        `const { ${importName} } = require('${opts.type.moduleName}');`,
        '',
        newProjectCode,
        '',
        'project.synth();',
        '',
    ];
    fs.writeFileSync(configPath, lines.join('\n'));
    logging.info(`Created ${common_1.PROJEN_RC} for ${opts.type.typename}`);
}
function makePadding(paddingLength) {
    return ' '.repeat(paddingLength);
}
/**
 * Prints all parameters that can be used in a project type, alongside their descriptions.
 *
 * Parameters in `params` that aren't undefined are rendered as defaults,
 * while all other parameters are rendered as commented out.
 *
 * @param type Project type
 * @param params Object with parameter default values
 * @param comments Whether to include optional parameters in commented out form
 */
function renderParams(opts) {
    var _a, _b, _c;
    // preprocessing
    const renders = {};
    const optionsWithDefaults = [];
    const optionsByModule = {}; // only options without defaults
    for (const option of opts.type.options) {
        if (option.deprecated) {
            continue;
        }
        const optionName = option.name;
        let paramRender;
        if (opts.params[optionName] !== undefined) {
            paramRender = `${optionName}: ${opts.params[optionName]},`;
            optionsWithDefaults.push(optionName);
        }
        else {
            const defaultValue = ((_a = option.default) === null || _a === void 0 ? void 0 : _a.startsWith('-')) ? undefined : ((_b = option.default) !== null && _b !== void 0 ? _b : undefined);
            paramRender = `// ${optionName}: ${defaultValue === null || defaultValue === void 0 ? void 0 : defaultValue.replace(/"(.+)"/, '\'$1\'')},`; // single quotes
            const parentModule = option.parent;
            optionsByModule[parentModule] = (_c = optionsByModule[parentModule]) !== null && _c !== void 0 ? _c : [];
            optionsByModule[parentModule].push(option);
        }
        renders[optionName] = paramRender;
    }
    // alphabetize
    const marginSize = Math.max(...Object.values(renders).map(str => str.length));
    optionsWithDefaults.sort();
    for (const parentModule in optionsByModule) {
        optionsByModule[parentModule].sort((o1, o2) => o1.name.localeCompare(o2.name));
    }
    // generate rendering
    const tab = makePadding(2);
    const result = [];
    result.push('{');
    // render options with defaults
    for (const optionName of optionsWithDefaults) {
        result.push(`${tab}${renders[optionName]}`);
    }
    if (result.length > 1) {
        result.push('');
    }
    // render options without defaults
    if (opts.comments) {
        for (const [moduleName, options] of Object.entries(optionsByModule).sort()) {
            result.push(`${tab}/* ${moduleName} */`);
            for (const option of options) {
                const paramRender = renders[option.name];
                result.push(`${tab}${paramRender}${makePadding(marginSize - paramRender.length + 2)}/* ${option.docs} */`);
            }
            result.push('');
        }
    }
    if (result[result.length - 1] === '') {
        result.pop();
    }
    result.push('}');
    return result.join('\n');
}
/**
 * Given a value from "@default", processes macros and returns a stringified
 * (quoted) result.
 *
 * @returns a javascript primitive (could be a string, number or boolean)
 */
function renderDefault(value) {
    var _a;
    return (_a = macros_1.tryProcessMacro(value)) !== null && _a !== void 0 ? _a : JSON.parse(value);
}
/**
 * Converts yargs command line switches to project type props.
 * @param type Project type
 * @param argv Command line switches
 */
function commandLineToProps(type, argv) {
    var _a;
    const props = {};
    // initialize props with default values
    for (const prop of type.options) {
        if (prop.default && prop.default !== 'undefined' && !prop.optional) {
            props[prop.name] = renderDefault(prop.default);
        }
    }
    for (const [arg, value] of Object.entries(argv)) {
        for (const prop of type.options) {
            if (prop.switch === arg) {
                let curr = props;
                const queue = [...prop.path];
                while (true) {
                    const p = queue.shift();
                    if (!p) {
                        break;
                    }
                    if (queue.length === 0) {
                        let val = value;
                        // if this is a string, then single quote it
                        if (val && typeof (val) === 'string') {
                            val = JSON.stringify(val).replace(/"(.+)"/, '\'$1\'');
                        }
                        curr[p] = val;
                    }
                    else {
                        curr[p] = (_a = curr[p]) !== null && _a !== void 0 ? _a : {};
                        curr = curr[p];
                    }
                }
            }
        }
    }
    return props;
}
/**
 * Generates a new project from an external module.
 *
 * @param spec The name of the external module to load
 * @param args Command line arguments (incl. project type)
 */
async function newProjectFromModule(baseDir, spec, args) {
    var _a;
    const specDependencyInfo = yarnAdd(baseDir, spec);
    // collect projects by looking up all .jsii modules in `node_modules`.
    const modulesDir = path.join(baseDir, 'node_modules');
    const modules = fs.readdirSync(modulesDir).map(file => path.join(modulesDir, file));
    const projects = inventory
        .discover(...modules)
        .filter(x => x.moduleName !== 'projen'); // filter built-in project types
    if (projects.length < 1) {
        throw new Error(`No projects found after installing ${spec}. The module must export at least one class which extends projen.Project`);
    }
    const requested = args.projectType;
    const types = projects.map(p => p.pjid);
    // if user did not specify a project type but the module has more than one, we need them to tell us which one...
    if (!requested && projects.length > 1) {
        throw new Error(`Multiple projects found after installing ${spec}: ${types.join(',')}. Please specify a project name.\nExample: npx projen new --from ${spec} ${types[0]}`);
    }
    // if user did not specify a type (and we know we have only one), the select it. otherwise, search by pjid.
    const type = !requested ? projects[0] : projects.find(p => p.pjid === requested);
    if (!type) {
        throw new Error(`Project type ${requested} not found. Found ${types.join(',')}`);
    }
    for (const option of (_a = type.options) !== null && _a !== void 0 ? _a : []) {
        if (option.type !== 'string' && option.type !== 'number' && option.type !== 'boolean') {
            continue; // we don't support non-primitive fields as command line options
        }
        if (option.default && option.default !== 'undefined') {
            if (!option.optional) {
                const defaultValue = renderDefault(option.default);
                args[option.name] = defaultValue;
                args[option.switch] = defaultValue;
            }
        }
    }
    // include a dev dependency for the external module
    await newProject(baseDir, type, args, {
        devDeps: JSON.stringify([specDependencyInfo]),
    });
}
/**
 * Generates a new project.
 * @param type Project type
 * @param args Command line arguments
 * @param additionalProps Additional parameters to include in .projenrc.js
 */
async function newProject(baseDir, type, args, additionalProps) {
    // convert command line arguments to project props using type information
    const props = commandLineToProps(type, args);
    // merge in additional props if specified
    for (const [k, v] of Object.entries(additionalProps !== null && additionalProps !== void 0 ? additionalProps : {})) {
        props[k] = v;
    }
    createProject({
        dir: baseDir,
        type,
        params: props,
        comments: args.comments,
        synth: args.synth,
        post: args.post,
    });
    // interactive git and github setup
    const gitFolder = path.resolve(baseDir, '.git');
    let pushInitialToGithub = false;
    if (!fs.existsSync(gitFolder)) {
        pushInitialToGithub = await askAboutGit(baseDir);
    }
    if (pushInitialToGithub) {
        util_1.exec('git add .', { cwd: baseDir });
        util_1.exec('git commit -m \'Initial commit generated by projen\'', { cwd: baseDir });
        util_1.exec('git branch -M main', { cwd: baseDir });
        util_1.exec('git push --set-upstream origin main', { cwd: baseDir });
    }
}
/**
 * Installs the npm module (through `yarn add`) to node_modules under `projectDir`.
 * @param spec The npm package spec (e.g. foo@^1.2)
 * @returns String info for the project devDeps (e.g. foo@^1.2 or foo@/var/folders/8k/qcw0ls5pv_ph0000gn/T/projen-RYurCw/pkg.tgz)
 */
function yarnAdd(baseDir, spec) {
    const packageJsonPath = path.join(baseDir, 'package.json');
    const packageJsonExisted = fs.existsSync(packageJsonPath);
    let dependencyInfo = spec;
    // workaround: yarn fails to extract tgz if it contains '@' in the name, so we
    // create a temp copy called pkg.tgz and install from there.
    // see: https://github.com/yarnpkg/yarn/issues/6339
    if (spec.endsWith('.tgz') && spec.includes('@')) {
        // if user passes in a file spec then we have to specify the project name and the package location
        // (e.g foo@/var/folders/8k/qcw0ls5pv_ph0000gn/T/projen-RYurCw/pkg.tgz)
        const moduleName = spec.split('/').slice(-1)[0].trim().split('@')[0].trim(); // Example: ./cdk-project/dist/js/cdk-project@1.0.0.jsii.tgz
        const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'projen-'));
        const copy = path.join(tmpdir, 'pkg.tgz');
        fs.copyFileSync(spec, copy);
        spec = copy;
        dependencyInfo = `${moduleName}@${spec}`;
    }
    logging.info(`installing external module ${spec}...`);
    util_1.exec(`yarn add --modules-folder=${baseDir}/node_modules --silent --no-lockfile --dev ${spec}`, { cwd: baseDir });
    // if package.json did not exist before calling yarn add, we should remove it
    // so we can start off clean.
    if (!packageJsonExisted) {
        fs.removeSync(packageJsonPath);
    }
    return dependencyInfo;
}
/**
 * Returns the last path element for use as a repository name default.
 */
function repoName() {
    return path.basename(path.basename(process.cwd()));
}
async function askAboutGit(cwd) {
    logging.info('We notice that you do not have a local git repository.');
    const { setUpGit } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'setUpGit',
            message: 'Do you want to set that up now?',
        },
    ]);
    if (setUpGit) {
        const { plan } = await inquirer.prompt(githubPlanOptions);
        const { gh, git } = plan;
        if (!git && !gh) {
            util_1.exec('git init', { cwd });
            logging.info('Ok, we have run \'git init\' for you! Have a great day.');
        }
        if (git) {
            const { gitRepoURL } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'gitRepoURL',
                    message: 'What is the repo? (example: https://github.com/projen/projen)',
                },
            ]);
            util_1.exec('git init', { cwd });
            let formattedGitRepoURL = gitRepoURL;
            if (!gitRepoURL.includes('https')) {
                formattedGitRepoURL = `https://github.com/${gitRepoURL}`;
            }
            util_1.exec(`git remote add origin ${formattedGitRepoURL}`, { cwd });
            logging.info(`Great! We have run 'git init' for you and set the remote to ${formattedGitRepoURL}`);
        }
        if (!git && gh) {
            logging.info('Ok! We will make you a repository on GitHub.');
            const ghCLIPath = util_1.execOrUndefined(`${os.platform() === 'win32' ? 'where' : 'which'} gh`, { cwd });
            if (!ghCLIPath) {
                logging.warn('Looks like you do not have the GitHub CLI installed. Please go to https://cli.github.com/ to install and try again.');
            }
            else {
                const { gitProjectName } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'gitProjectName',
                        message: 'What would you like to name it?',
                        default: repoName(),
                    },
                ]);
                logging.info(`Wow! ${gitProjectName} is such a great name!`);
                util_1.exec('git init', { cwd });
                util_1.exec(`gh repo create ${gitProjectName}`, { cwd });
                return true;
            }
        }
    }
    return false;
}
const githubPlanOptions = [
    {
        type: 'list',
        name: 'plan',
        message: 'We\'ll need some more info. Please choose one:',
        choices: [
            {
                value: {
                    git: true,
                },
                name: 'I already have a git repository',
            },
            {
                value: {
                    gh: true,
                    git: false,
                },
                name: 'I don\'t have a git repository and want to make one on GitHub',
            },
            {
                value: {
                    gh: false,
                    git: false,
                },
                name: 'I don\'t have a git repository and I don\'t want to use GitHub',
            },
        ],
    },
];
module.exports = new Command();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9jbWRzL25ldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLCtCQUErQjtBQUMvQixxQ0FBcUM7QUFDckMsK0JBQStCO0FBQy9CLHlDQUF5QztBQUN6Qyw2Q0FBNkM7QUFDN0MseUNBQXlDO0FBQ3pDLHFDQUFtRDtBQUNuRCxzQ0FBNEM7QUFFNUMsTUFBTSxPQUFPO0lBQWI7UUFDa0IsWUFBTyxHQUFHLDhCQUE4QixDQUFDO1FBQ3pDLGFBQVEsR0FBRyw4QkFBOEIsQ0FBQztJQXlFNUQsQ0FBQztJQXZFUSxPQUFPLENBQUMsSUFBZ0I7O1FBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUUsUUFBUSxFQUFFLDZGQUE2RixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzdKLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSx3Q0FBd0MsRUFBRSxDQUFDLENBQUM7UUFDekcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDhFQUE4RSxFQUFFLENBQUMsQ0FBQztRQUNsSixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsdUhBQXVILEVBQUUsQ0FBQyxDQUFDO1FBQ25MLElBQUksQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsd0RBQXdELENBQUMsQ0FBQztRQUNuRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlDQUFpQyxFQUFFLHVGQUF1RixD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QUFJLEVBQUUsT0FBTzt3QkFDYixJQUFJLEVBQUUsZ0JBQWdCO3dCQUN0QixPQUFPLEVBQUUsaUNBQWlDO3dCQUMxQyxPQUFPLEVBQUUsUUFBUSxFQUFFO3FCQUNwQjtpQkFDRixDQUFDLENBQUM7Z0JBRUgsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLGNBQWMsd0JBQXdCLENBQUMsQ0FBQztnQkFFN0QsV0FBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBRTFCLFdBQUksQ0FBQyxrQkFBa0IsY0FBYyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRCxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7S0FDRjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVELE1BQU0saUJBQWlCLEdBQUc7SUFDeEI7UUFDRSxJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFLGdEQUFnRDtRQUN6RCxPQUFPLEVBQUU7WUFDUDtnQkFDRSxLQUFLLEVBQUU7b0JBQ0wsR0FBRyxFQUFFLElBQUk7aUJBQ1Y7Z0JBQ0QsSUFBSSxFQUFFLGlDQUFpQzthQUN4QztZQUNEO2dCQUNFLEtBQUssRUFBRTtvQkFDTCxFQUFFLEVBQUUsSUFBSTtvQkFDUixHQUFHLEVBQUUsS0FBSztpQkFDWDtnQkFDRCxJQUFJLEVBQUUsK0RBQStEO2FBQ3RFO1lBQ0Q7Z0JBQ0UsS0FBSyxFQUFFO29CQUNMLEVBQUUsRUFBRSxLQUFLO29CQUNULEdBQUcsRUFBRSxLQUFLO2lCQUNYO2dCQUNELElBQUksRUFBRSxnRUFBZ0U7YUFDdkU7U0FDRjtLQUNGO0NBQ0YsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB2bSBmcm9tICd2bSc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBpbnF1aXJlciBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQgeyBQUk9KRU5fUkMgfSBmcm9tICcuLi8uLi9jb21tb24nO1xuaW1wb3J0ICogYXMgaW52ZW50b3J5IGZyb20gJy4uLy4uL2ludmVudG9yeSc7XG5pbXBvcnQgKiBhcyBsb2dnaW5nIGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHsgZXhlYywgZXhlY09yVW5kZWZpbmVkIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgeyB0cnlQcm9jZXNzTWFjcm8gfSBmcm9tICcuLi9tYWNyb3MnO1xuXG5jbGFzcyBDb21tYW5kIGltcGxlbWVudHMgeWFyZ3MuQ29tbWFuZE1vZHVsZSB7XG4gIHB1YmxpYyByZWFkb25seSBjb21tYW5kID0gJ25ldyBbUFJPSkVDVC1UWVBFXSBbT1BUSU9OU10nO1xuICBwdWJsaWMgcmVhZG9ubHkgZGVzY3JpYmUgPSAnQ3JlYXRlcyBhIG5ldyBwcm9qZW4gcHJvamVjdCc7XG5cbiAgcHVibGljIGJ1aWxkZXIoYXJnczogeWFyZ3MuQXJndikge1xuICAgIGFyZ3MucG9zaXRpb25hbCgnUFJPSkVDVC1UWVBFJywgeyBkZXNjcmliZTogJ29wdGlvbmFsIG9ubHkgd2hlbiAtLWZyb20gaXMgdXNlZCBhbmQgdGhlcmUgaXMgYSBzaW5nbGUgcHJvamVjdCB0eXBlIGluIHRoZSBleHRlcm5hbCBtb2R1bGUnLCB0eXBlOiAnc3RyaW5nJyB9KTtcbiAgICBhcmdzLm9wdGlvbignc3ludGgnLCB7IHR5cGU6ICdib29sZWFuJywgZGVmYXVsdDogdHJ1ZSwgZGVzYzogJ1N5bnRoZXNpemUgYWZ0ZXIgY3JlYXRpbmcgLnByb2plbnJjLmpzJyB9KTtcbiAgICBhcmdzLm9wdGlvbignY29tbWVudHMnLCB7IHR5cGU6ICdib29sZWFuJywgZGVmYXVsdDogdHJ1ZSwgZGVzYzogJ0luY2x1ZGUgY29tbWVudGVkIG91dCBvcHRpb25zIGluIC5wcm9qZW5yYy5qcyAodXNlIC0tbm8tY29tbWVudHMgdG8gZGlzYWJsZSknIH0pO1xuICAgIGFyZ3Mub3B0aW9uKCdmcm9tJywgeyB0eXBlOiAnc3RyaW5nJywgYWxpYXM6ICdmJywgZGVzYzogJ0V4dGVybmFsIGpzaWkgbnBtIG1vZHVsZSB0byBjcmVhdGUgcHJvamVjdCBmcm9tLiBTdXBwb3J0cyBhbnkgcGFja2FnZSBzcGVjIHN1cHBvcnRlZCBieSB5YXJuIChzdWNoIGFzIFwibXktcGFja0BeMi4wXCIpJyB9KTtcbiAgICBhcmdzLmV4YW1wbGUoJ3Byb2plbiBuZXcgYXdzY2RrLWFwcC10cycsICdDcmVhdGVzIGEgbmV3IHByb2plY3Qgb2YgYnVpbHQtaW4gdHlwZSBcImF3c2Nkay1hcHAtdHNcIicpO1xuICAgIGFyZ3MuZXhhbXBsZSgncHJvamVuIG5ldyAtLWZyb20gcHJvamVuLXZ1ZUBeMicsICdDcmVhdGVzIGEgbmV3IHByb2plY3QgZnJvbSBhbiBleHRlcm5hbCBtb2R1bGUgXCJwcm9qZW4tdnVlXCIgd2l0aCB0aGUgc3BlY2lmaWVkIHZlcnNpb24nKTtcblxuICAgIGZvciAoY29uc3QgdHlwZSBvZiBpbnZlbnRvcnkuZGlzY292ZXIoKSkge1xuICAgICAgYXJncy5jb21tYW5kKHR5cGUucGppZCwgdHlwZS5kb2NzID8/ICcnLCB7XG4gICAgICAgIGJ1aWxkZXI6IGNhcmdzID0+IHtcbiAgICAgICAgICBjYXJncy5zaG93SGVscE9uRmFpbCh0cnVlKTtcblxuICAgICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHR5cGUub3B0aW9ucyA/PyBbXSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbi50eXBlICE9PSAnc3RyaW5nJyAmJiBvcHRpb24udHlwZSAhPT0gJ251bWJlcicgJiYgb3B0aW9uLnR5cGUgIT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICBjb250aW51ZTsgLy8gd2UgZG9uJ3Qgc3VwcG9ydCBub24tcHJpbWl0aXZlIGZpZWxkcyBhcyBjb21tYW5kIGxpbmUgb3B0aW9uc1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZGVzYyA9IFtvcHRpb24uZG9jcz8ucmVwbGFjZSgvXFwgKlxcLiQvLCAnJykgPz8gJyddO1xuXG4gICAgICAgICAgICBjb25zdCByZXF1aXJlZCA9ICFvcHRpb24ub3B0aW9uYWw7XG4gICAgICAgICAgICBsZXQgZGVmYXVsdFZhbHVlO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9uLmRlZmF1bHQgJiYgb3B0aW9uLmRlZmF1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGlmICghcmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgZmllbGQgaXMgbm90IHJlcXVpcmVkLCBqdXN0IGRlc2NyaWJlIHRoZSBkZWZhdWx0IGJ1dCBkb24ndCBhY3R1YWxseSBhc3NpZ24gYSB2YWx1ZVxuICAgICAgICAgICAgICAgIGRlc2MucHVzaChgW2RlZmF1bHQ6ICR7b3B0aW9uLmRlZmF1bHQucmVwbGFjZSgvXlxcICotLywgJycpLnJlcGxhY2UoL1xcLiQvLCAnJykudHJpbSgpfV1gKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgZmllbGQgaXMgcmVxdWlyZWQgYW5kIHdlIGhhdmUgYSBAZGVmYXVsdCwgdGhlbiBhc3NpZ25cbiAgICAgICAgICAgICAgICAvLyB0aGUgdmFsdWUgaGVyZSBzbyBpdCBhcHBlYXJzIGluIGAtLWhlbHBgXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gcmVuZGVyRGVmYXVsdChvcHRpb24uZGVmYXVsdCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FyZ3Mub3B0aW9uKG9wdGlvbi5zd2l0Y2gsIHtcbiAgICAgICAgICAgICAgZ3JvdXA6IHJlcXVpcmVkID8gJ1JlcXVpcmVkOicgOiAnT3B0aW9uYWw6JyxcbiAgICAgICAgICAgICAgdHlwZTogb3B0aW9uLnR5cGUsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjLmpvaW4oJyAnKSxcbiAgICAgICAgICAgICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxuICAgICAgICAgICAgICByZXF1aXJlZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBjYXJncztcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlcjogYXJndiA9PiBuZXdQcm9qZWN0KHByb2Nlc3MuY3dkKCksIHR5cGUsIGFyZ3YpLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZ3M7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgaGFuZGxlcihhcmdzOiBhbnkpIHtcbiAgICAvLyBoYW5kbGUgLS1mcm9tIHdoaWNoIG1lYW5zIHdlIHdhbnQgdG8gZmlyc3QgaW5zdGFsbCBhIGpzaWkgbW9kdWxlIGFuZCB0aGVuXG4gICAgLy8gY3JlYXRlIGEgcHJvamVjdCBkZWZpbmVkIHdpdGhpbiB0aGlzIG1vZHVsZS5cbiAgICBpZiAoYXJncy5mcm9tKSB7XG4gICAgICByZXR1cm4gbmV3UHJvamVjdEZyb21Nb2R1bGUocHJvY2Vzcy5jd2QoKSwgYXJncy5mcm9tLCBhcmdzKTtcbiAgICB9XG5cbiAgICAvLyBwcm9qZWN0IHR5cGUgaXMgZGVmaW5lZCBidXQgd2FzIG5vdCBtYXRjaGVkIGJ5IHlhcmdzLCBzbyBwcmludCB0aGUgbGlzdCBvZiBzdXBwb3J0ZWQgdHlwZXNcbiAgICBpZiAoYXJncy5wcm9qZWN0VHlwZSkge1xuICAgICAgY29uc29sZS5sb2coYEludmFsaWQgcHJvamVjdCB0eXBlICR7YXJncy5wcm9qZWN0VHlwZX0uIFN1cHBvcnRlZCB0eXBlczpgKTtcbiAgICAgIGZvciAoY29uc3QgcGppZCBvZiBpbnZlbnRvcnkuZGlzY292ZXIoKS5tYXAoeCA9PiB4LnBqaWQpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgICR7cGppZH1gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGVzIHRoZSB1c2UgY2FzZSB0aGF0IG5vdGhpbmcgd2FzIHNwZWNpZmllZCBzaW5jZSBQUk9KRUNULVRZUEUgaXMgbm93IGFuIG9wdGlvbmFsIHBvc2l0aW9uYWwgcGFyYW1ldGVyXG4gICAgeWFyZ3Muc2hvd0hlbHAoKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgQ3JlYXRlUHJvamVjdE9wdGlvbnMge1xuICAvKipcbiAgICogUHJvamVjdCBkaXJlY3RvcnkuXG4gICAqL1xuICBkaXI6IHN0cmluZztcblxuICAvKipcbiAgICogUHJvamVjdCB0eXBlIGZyb20gdGhlIGludmVudG9yeS5cbiAgICovXG4gIHR5cGU6IGludmVudG9yeS5Qcm9qZWN0VHlwZTtcblxuICAvKipcbiAgICogT3B0aW9uIHZhbHVlcy5cbiAgICovXG4gIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAvKipcbiAgICogU2hvdWxkIHdlIHJlbmRlciBjb21tZW50ZWQtb3V0IGRlZmF1bHQgb3B0aW9ucyBpbiAucHJvamVyYy5qcyBmaWxlP1xuICAgKi9cbiAgY29tbWVudHM6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFNob3VsZCB3ZSBjYWxsIGBwcm9qZWN0LnN5bnRoKClgIG9yIGluc3RhbnRpYXRlIHRoZSBwcm9qZWN0IChjb3VsZCBzdGlsbFxuICAgKiBoYXZlIHNpZGUtZWZmZWN0cykgYW5kIHJlbmRlciB0aGUgLnByb2plbnJjIGZpbGUuXG4gICAqL1xuICBzeW50aDogYm9vbGVhbjtcblxuICAvKipcbiAgICogU2hvdWxkIHdlIGV4ZWN1aXRlIHBvc3Qgc3ludGhlc2lzIGhvb2tzPyAodXN1YWxseSBwYWNrYWdlIG1hbmFnZXIgaW5zdGFsbCkuXG4gICAqL1xuICBwb3N0OiBib29sZWFuO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcHJvamVjdCB3aXRoIGRlZmF1bHRzLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gY3JlYXRlcyB0aGUgcHJvamVjdCB0eXBlIGluLXByb2Nlc3MgKHdpdGggaW4gVk0pIGFuZCBjYWxsc1xuICogYC5zeW50aCgpYCBvbiBpdCAoaWYgYG9wdGlvbnMuc3ludGhgIGlzIG5vdCBgZmFsc2VgKS5cbiAqXG4gKiBBdCB0aGUgbW9tZW50LCBpdCBhbHNvIGdlbmVyYXRlcyBhIGAucHJvamVucmMuanNgIGZpbGUgd2l0aCB0aGUgc2FtZSBjb2RlXG4gKiB0aGF0IHdhcyBqdXN0IGV4ZWN1dGVkLiBJbiB0aGUgZnV0dXJlLCB0aGlzIHdpbGwgYWxzbyBiZSBkb25lIGJ5IHRoZSBwcm9qZWN0XG4gKiB0eXBlLCBzbyB3ZSBjYW4gZWFzaWx5IHN1cHBvcnQgbXVsdGlwbGUgbGFuZ3VhZ2VzIG9mIHByb2plbnJjLlxuICovXG5mdW5jdGlvbiBjcmVhdGVQcm9qZWN0KG9wdHM6IENyZWF0ZVByb2plY3RPcHRpb25zKSB7XG4gIC8vIERlZmF1bHQgcHJvamVjdCByZXNvbHV0aW9uIGxvY2F0aW9uXG4gIGxldCBtb2QgPSAnLi4vLi4vaW5kZXgnO1xuXG4gIC8vIEV4dGVybmFsIHByb2plY3RzIG5lZWQgdG8gbG9hZCB0aGUgbW9kdWxlIGZyb20gdGhlIG1vZHVsZXMgZGlyZWN0b3J5XG4gIGlmIChvcHRzLnR5cGUubW9kdWxlTmFtZSAhPT0gJ3Byb2plbicpIHtcbiAgICB0cnkge1xuICAgICAgbW9kID0gcGF0aC5kaXJuYW1lKFxuICAgICAgICByZXF1aXJlLnJlc29sdmUocGF0aC5qb2luKG9wdHMudHlwZS5tb2R1bGVOYW1lLCAncGFja2FnZS5qc29uJyksIHsgcGF0aHM6IFtwcm9jZXNzLmN3ZCgpXSB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4dGVybmFsIHByb2plY3QgbW9kdWxlICcke29wdHMudHlwZS5tb2R1bGVOYW1lfScgY291bGQgbm90IGJlIHJlc29sdmVkLmApO1xuICAgIH1cbiAgfVxuXG4gIC8vIHBhc3MgdGhlIEZRTiBvZiB0aGUgcHJvamVjdCB0eXBlIHRvIHRoZSBwcm9qZWN0IGluaXRpYWxpemVyIHNvIGl0IGNhblxuICAvLyBnZW5lcmF0ZSB0aGUgcHJvamVucmMgZmlsZS5cbiAgb3B0cy5wYXJhbXMuanNpaUZxbiA9IEpTT04uc3RyaW5naWZ5KG9wdHMudHlwZS5mcW4pO1xuICBjb25zdCBuZXdQcm9qZWN0Q29kZSA9IGBjb25zdCBwcm9qZWN0ID0gbmV3ICR7b3B0cy50eXBlLnR5cGVuYW1lfSgke3JlbmRlclBhcmFtcyhvcHRzKX0pO2A7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbiAgY29uc3QgbW9kdWxlID0gcmVxdWlyZShtb2QpO1xuICBjb25zdCBjdHggPSB2bS5jcmVhdGVDb250ZXh0KG1vZHVsZSk7XG5cbiAgcHJvY2Vzcy5lbnYuUFJPSkVOX0RJU0FCTEVfUE9TVCA9ICghb3B0cy5wb3N0KS50b1N0cmluZygpO1xuICB2bS5ydW5JbkNvbnRleHQoW1xuICAgIG5ld1Byb2plY3RDb2RlLFxuICAgIG9wdHMuc3ludGggPyAncHJvamVjdC5zeW50aCgpOycgOiAnJyxcbiAgXS5qb2luKCdcXG4nKSwgY3R4KTtcblxuICBjb25zdCBjb25maWdQYXRoID0gcGF0aC5qb2luKG9wdHMuZGlyLCBQUk9KRU5fUkMpO1xuICBpZiAoZnMuZXhpc3RzU3luYyhjb25maWdQYXRoKSkge1xuICAgIGxvZ2dpbmcuZXJyb3IoYERpcmVjdG9yeSAke29wdHMuZGlyfSBhbHJlYWR5IGNvbnRhaW5zICR7UFJPSkVOX1JDfWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IFtpbXBvcnROYW1lXSA9IG9wdHMudHlwZS50eXBlbmFtZS5zcGxpdCgnLicpO1xuXG4gIGNvbnN0IGxpbmVzID0gW1xuICAgIGBjb25zdCB7ICR7aW1wb3J0TmFtZX0gfSA9IHJlcXVpcmUoJyR7b3B0cy50eXBlLm1vZHVsZU5hbWV9Jyk7YCxcbiAgICAnJyxcbiAgICBuZXdQcm9qZWN0Q29kZSxcbiAgICAnJyxcbiAgICAncHJvamVjdC5zeW50aCgpOycsXG4gICAgJycsXG4gIF07XG5cbiAgZnMud3JpdGVGaWxlU3luYyhjb25maWdQYXRoLCBsaW5lcy5qb2luKCdcXG4nKSk7XG4gIGxvZ2dpbmcuaW5mbyhgQ3JlYXRlZCAke1BST0pFTl9SQ30gZm9yICR7b3B0cy50eXBlLnR5cGVuYW1lfWApO1xufVxuXG5mdW5jdGlvbiBtYWtlUGFkZGluZyhwYWRkaW5nTGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gJyAnLnJlcGVhdChwYWRkaW5nTGVuZ3RoKTtcbn1cblxuLyoqXG4gKiBQcmludHMgYWxsIHBhcmFtZXRlcnMgdGhhdCBjYW4gYmUgdXNlZCBpbiBhIHByb2plY3QgdHlwZSwgYWxvbmdzaWRlIHRoZWlyIGRlc2NyaXB0aW9ucy5cbiAqXG4gKiBQYXJhbWV0ZXJzIGluIGBwYXJhbXNgIHRoYXQgYXJlbid0IHVuZGVmaW5lZCBhcmUgcmVuZGVyZWQgYXMgZGVmYXVsdHMsXG4gKiB3aGlsZSBhbGwgb3RoZXIgcGFyYW1ldGVycyBhcmUgcmVuZGVyZWQgYXMgY29tbWVudGVkIG91dC5cbiAqXG4gKiBAcGFyYW0gdHlwZSBQcm9qZWN0IHR5cGVcbiAqIEBwYXJhbSBwYXJhbXMgT2JqZWN0IHdpdGggcGFyYW1ldGVyIGRlZmF1bHQgdmFsdWVzXG4gKiBAcGFyYW0gY29tbWVudHMgV2hldGhlciB0byBpbmNsdWRlIG9wdGlvbmFsIHBhcmFtZXRlcnMgaW4gY29tbWVudGVkIG91dCBmb3JtXG4gKi9cbmZ1bmN0aW9uIHJlbmRlclBhcmFtcyhvcHRzOiBDcmVhdGVQcm9qZWN0T3B0aW9ucykge1xuICAvLyBwcmVwcm9jZXNzaW5nXG4gIGNvbnN0IHJlbmRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgY29uc3Qgb3B0aW9uc1dpdGhEZWZhdWx0czogc3RyaW5nW10gPSBbXTtcbiAgY29uc3Qgb3B0aW9uc0J5TW9kdWxlOiBSZWNvcmQ8c3RyaW5nLCBpbnZlbnRvcnkuUHJvamVjdE9wdGlvbltdPiA9IHt9OyAvLyBvbmx5IG9wdGlvbnMgd2l0aG91dCBkZWZhdWx0c1xuXG4gIGZvciAoY29uc3Qgb3B0aW9uIG9mIG9wdHMudHlwZS5vcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbi5kZXByZWNhdGVkKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25OYW1lID0gb3B0aW9uLm5hbWU7XG4gICAgbGV0IHBhcmFtUmVuZGVyO1xuICAgIGlmIChvcHRzLnBhcmFtc1tvcHRpb25OYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXJhbVJlbmRlciA9IGAke29wdGlvbk5hbWV9OiAke29wdHMucGFyYW1zW29wdGlvbk5hbWVdfSxgO1xuICAgICAgb3B0aW9uc1dpdGhEZWZhdWx0cy5wdXNoKG9wdGlvbk5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkZWZhdWx0VmFsdWUgPSBvcHRpb24uZGVmYXVsdD8uc3RhcnRzV2l0aCgnLScpID8gdW5kZWZpbmVkIDogKG9wdGlvbi5kZWZhdWx0ID8/IHVuZGVmaW5lZCk7XG4gICAgICBwYXJhbVJlbmRlciA9IGAvLyAke29wdGlvbk5hbWV9OiAke2RlZmF1bHRWYWx1ZT8ucmVwbGFjZSgvXCIoLispXCIvLCAnXFwnJDFcXCcnKX0sYDsgLy8gc2luZ2xlIHF1b3Rlc1xuXG4gICAgICBjb25zdCBwYXJlbnRNb2R1bGUgPSBvcHRpb24ucGFyZW50O1xuICAgICAgb3B0aW9uc0J5TW9kdWxlW3BhcmVudE1vZHVsZV0gPSBvcHRpb25zQnlNb2R1bGVbcGFyZW50TW9kdWxlXSA/PyBbXTtcbiAgICAgIG9wdGlvbnNCeU1vZHVsZVtwYXJlbnRNb2R1bGVdLnB1c2gob3B0aW9uKTtcbiAgICB9XG4gICAgcmVuZGVyc1tvcHRpb25OYW1lXSA9IHBhcmFtUmVuZGVyO1xuICB9XG5cbiAgLy8gYWxwaGFiZXRpemVcbiAgY29uc3QgbWFyZ2luU2l6ZSA9IE1hdGgubWF4KC4uLk9iamVjdC52YWx1ZXMocmVuZGVycykubWFwKHN0ciA9PiBzdHIubGVuZ3RoKSk7XG4gIG9wdGlvbnNXaXRoRGVmYXVsdHMuc29ydCgpO1xuICBmb3IgKGNvbnN0IHBhcmVudE1vZHVsZSBpbiBvcHRpb25zQnlNb2R1bGUpIHtcbiAgICBvcHRpb25zQnlNb2R1bGVbcGFyZW50TW9kdWxlXS5zb3J0KChvMSwgbzIpID0+IG8xLm5hbWUubG9jYWxlQ29tcGFyZShvMi5uYW1lKSk7XG4gIH1cblxuICAvLyBnZW5lcmF0ZSByZW5kZXJpbmdcbiAgY29uc3QgdGFiID0gbWFrZVBhZGRpbmcoMik7XG4gIGNvbnN0IHJlc3VsdDogc3RyaW5nW10gPSBbXTtcbiAgcmVzdWx0LnB1c2goJ3snKTtcblxuICAvLyByZW5kZXIgb3B0aW9ucyB3aXRoIGRlZmF1bHRzXG4gIGZvciAoY29uc3Qgb3B0aW9uTmFtZSBvZiBvcHRpb25zV2l0aERlZmF1bHRzKSB7XG4gICAgcmVzdWx0LnB1c2goYCR7dGFifSR7cmVuZGVyc1tvcHRpb25OYW1lXX1gKTtcbiAgfVxuICBpZiAocmVzdWx0Lmxlbmd0aCA+IDEpIHtcbiAgICByZXN1bHQucHVzaCgnJyk7XG4gIH1cblxuICAvLyByZW5kZXIgb3B0aW9ucyB3aXRob3V0IGRlZmF1bHRzXG4gIGlmIChvcHRzLmNvbW1lbnRzKSB7XG4gICAgZm9yIChjb25zdCBbbW9kdWxlTmFtZSwgb3B0aW9uc10gb2YgT2JqZWN0LmVudHJpZXMob3B0aW9uc0J5TW9kdWxlKS5zb3J0KCkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGAke3RhYn0vKiAke21vZHVsZU5hbWV9ICovYCk7XG4gICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtUmVuZGVyID0gcmVuZGVyc1tvcHRpb24ubmFtZV07XG4gICAgICAgIHJlc3VsdC5wdXNoKGAke3RhYn0ke3BhcmFtUmVuZGVyfSR7bWFrZVBhZGRpbmcobWFyZ2luU2l6ZSAtIHBhcmFtUmVuZGVyLmxlbmd0aCArIDIpfS8qICR7b3B0aW9uLmRvY3N9ICovYCk7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGlmIChyZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSAnJykge1xuICAgIHJlc3VsdC5wb3AoKTtcbiAgfVxuICByZXN1bHQucHVzaCgnfScpO1xuICByZXR1cm4gcmVzdWx0LmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgdmFsdWUgZnJvbSBcIkBkZWZhdWx0XCIsIHByb2Nlc3NlcyBtYWNyb3MgYW5kIHJldHVybnMgYSBzdHJpbmdpZmllZFxuICogKHF1b3RlZCkgcmVzdWx0LlxuICpcbiAqIEByZXR1cm5zIGEgamF2YXNjcmlwdCBwcmltaXRpdmUgKGNvdWxkIGJlIGEgc3RyaW5nLCBudW1iZXIgb3IgYm9vbGVhbilcbiAqL1xuZnVuY3Rpb24gcmVuZGVyRGVmYXVsdCh2YWx1ZTogc3RyaW5nKSB7XG4gIHJldHVybiB0cnlQcm9jZXNzTWFjcm8odmFsdWUpID8/IEpTT04ucGFyc2UodmFsdWUpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHlhcmdzIGNvbW1hbmQgbGluZSBzd2l0Y2hlcyB0byBwcm9qZWN0IHR5cGUgcHJvcHMuXG4gKiBAcGFyYW0gdHlwZSBQcm9qZWN0IHR5cGVcbiAqIEBwYXJhbSBhcmd2IENvbW1hbmQgbGluZSBzd2l0Y2hlc1xuICovXG5mdW5jdGlvbiBjb21tYW5kTGluZVRvUHJvcHModHlwZTogaW52ZW50b3J5LlByb2plY3RUeXBlLCBhcmd2OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuICBjb25zdCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXG4gIC8vIGluaXRpYWxpemUgcHJvcHMgd2l0aCBkZWZhdWx0IHZhbHVlc1xuICBmb3IgKGNvbnN0IHByb3Agb2YgdHlwZS5vcHRpb25zKSB7XG4gICAgaWYgKHByb3AuZGVmYXVsdCAmJiBwcm9wLmRlZmF1bHQgIT09ICd1bmRlZmluZWQnICYmICFwcm9wLm9wdGlvbmFsKSB7XG4gICAgICBwcm9wc1twcm9wLm5hbWVdID0gcmVuZGVyRGVmYXVsdChwcm9wLmRlZmF1bHQpO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgW2FyZywgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGFyZ3YpKSB7XG4gICAgZm9yIChjb25zdCBwcm9wIG9mIHR5cGUub3B0aW9ucykge1xuICAgICAgaWYgKHByb3Auc3dpdGNoID09PSBhcmcpIHtcbiAgICAgICAgbGV0IGN1cnIgPSBwcm9wcztcbiAgICAgICAgY29uc3QgcXVldWUgPSBbLi4ucHJvcC5wYXRoXTtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBjb25zdCBwID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICBpZiAoIXApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBsZXQgdmFsID0gdmFsdWU7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoaXMgaXMgYSBzdHJpbmcsIHRoZW4gc2luZ2xlIHF1b3RlIGl0XG4gICAgICAgICAgICBpZiAodmFsICYmIHR5cGVvZih2YWwpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICB2YWwgPSBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoL1wiKC4rKVwiLywgJ1xcJyQxXFwnJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnJbcF0gPSB2YWw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJbcF0gPSBjdXJyW3BdID8/IHt9O1xuICAgICAgICAgICAgY3VyciA9IGN1cnJbcF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByb3BzO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG5ldyBwcm9qZWN0IGZyb20gYW4gZXh0ZXJuYWwgbW9kdWxlLlxuICpcbiAqIEBwYXJhbSBzcGVjIFRoZSBuYW1lIG9mIHRoZSBleHRlcm5hbCBtb2R1bGUgdG8gbG9hZFxuICogQHBhcmFtIGFyZ3MgQ29tbWFuZCBsaW5lIGFyZ3VtZW50cyAoaW5jbC4gcHJvamVjdCB0eXBlKVxuICovXG5hc3luYyBmdW5jdGlvbiBuZXdQcm9qZWN0RnJvbU1vZHVsZShiYXNlRGlyOiBzdHJpbmcsIHNwZWM6IHN0cmluZywgYXJnczogYW55KSB7XG4gIGNvbnN0IHNwZWNEZXBlbmRlbmN5SW5mbyA9IHlhcm5BZGQoYmFzZURpciwgc3BlYyk7XG5cbiAgLy8gY29sbGVjdCBwcm9qZWN0cyBieSBsb29raW5nIHVwIGFsbCAuanNpaSBtb2R1bGVzIGluIGBub2RlX21vZHVsZXNgLlxuICBjb25zdCBtb2R1bGVzRGlyID0gcGF0aC5qb2luKGJhc2VEaXIsICdub2RlX21vZHVsZXMnKTtcbiAgY29uc3QgbW9kdWxlcyA9IGZzLnJlYWRkaXJTeW5jKG1vZHVsZXNEaXIpLm1hcChmaWxlID0+IHBhdGguam9pbihtb2R1bGVzRGlyLCBmaWxlKSk7XG4gIGNvbnN0IHByb2plY3RzID0gaW52ZW50b3J5XG4gICAgLmRpc2NvdmVyKC4uLm1vZHVsZXMpXG4gICAgLmZpbHRlcih4ID0+IHgubW9kdWxlTmFtZSAhPT0gJ3Byb2plbicpOyAvLyBmaWx0ZXIgYnVpbHQtaW4gcHJvamVjdCB0eXBlc1xuXG4gIGlmIChwcm9qZWN0cy5sZW5ndGggPCAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBObyBwcm9qZWN0cyBmb3VuZCBhZnRlciBpbnN0YWxsaW5nICR7c3BlY30uIFRoZSBtb2R1bGUgbXVzdCBleHBvcnQgYXQgbGVhc3Qgb25lIGNsYXNzIHdoaWNoIGV4dGVuZHMgcHJvamVuLlByb2plY3RgKTtcbiAgfVxuXG4gIGNvbnN0IHJlcXVlc3RlZCA9IGFyZ3MucHJvamVjdFR5cGU7XG4gIGNvbnN0IHR5cGVzID0gcHJvamVjdHMubWFwKHAgPT4gcC5wamlkKTtcblxuICAvLyBpZiB1c2VyIGRpZCBub3Qgc3BlY2lmeSBhIHByb2plY3QgdHlwZSBidXQgdGhlIG1vZHVsZSBoYXMgbW9yZSB0aGFuIG9uZSwgd2UgbmVlZCB0aGVtIHRvIHRlbGwgdXMgd2hpY2ggb25lLi4uXG4gIGlmICghcmVxdWVzdGVkICYmIHByb2plY3RzLmxlbmd0aCA+IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE11bHRpcGxlIHByb2plY3RzIGZvdW5kIGFmdGVyIGluc3RhbGxpbmcgJHtzcGVjfTogJHt0eXBlcy5qb2luKCcsJyl9LiBQbGVhc2Ugc3BlY2lmeSBhIHByb2plY3QgbmFtZS5cXG5FeGFtcGxlOiBucHggcHJvamVuIG5ldyAtLWZyb20gJHtzcGVjfSAke3R5cGVzWzBdfWApO1xuICB9XG5cbiAgLy8gaWYgdXNlciBkaWQgbm90IHNwZWNpZnkgYSB0eXBlIChhbmQgd2Uga25vdyB3ZSBoYXZlIG9ubHkgb25lKSwgdGhlIHNlbGVjdCBpdC4gb3RoZXJ3aXNlLCBzZWFyY2ggYnkgcGppZC5cbiAgY29uc3QgdHlwZSA9ICFyZXF1ZXN0ZWQgPyBwcm9qZWN0c1swXSA6IHByb2plY3RzLmZpbmQocCA9PiBwLnBqaWQgPT09IHJlcXVlc3RlZCk7XG4gIGlmICghdHlwZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgUHJvamVjdCB0eXBlICR7cmVxdWVzdGVkfSBub3QgZm91bmQuIEZvdW5kICR7dHlwZXMuam9pbignLCcpfWApO1xuICB9XG5cbiAgZm9yIChjb25zdCBvcHRpb24gb2YgdHlwZS5vcHRpb25zID8/IFtdKSB7XG4gICAgaWYgKG9wdGlvbi50eXBlICE9PSAnc3RyaW5nJyAmJiBvcHRpb24udHlwZSAhPT0gJ251bWJlcicgJiYgb3B0aW9uLnR5cGUgIT09ICdib29sZWFuJykge1xuICAgICAgY29udGludWU7IC8vIHdlIGRvbid0IHN1cHBvcnQgbm9uLXByaW1pdGl2ZSBmaWVsZHMgYXMgY29tbWFuZCBsaW5lIG9wdGlvbnNcbiAgICB9XG5cbiAgICBpZiAob3B0aW9uLmRlZmF1bHQgJiYgb3B0aW9uLmRlZmF1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpZiAoIW9wdGlvbi5vcHRpb25hbCkge1xuICAgICAgICBjb25zdCBkZWZhdWx0VmFsdWUgPSByZW5kZXJEZWZhdWx0KG9wdGlvbi5kZWZhdWx0KTtcbiAgICAgICAgYXJnc1tvcHRpb24ubmFtZV0gPSBkZWZhdWx0VmFsdWU7XG4gICAgICAgIGFyZ3Nbb3B0aW9uLnN3aXRjaF0gPSBkZWZhdWx0VmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gaW5jbHVkZSBhIGRldiBkZXBlbmRlbmN5IGZvciB0aGUgZXh0ZXJuYWwgbW9kdWxlXG4gIGF3YWl0IG5ld1Byb2plY3QoYmFzZURpciwgdHlwZSwgYXJncywge1xuICAgIGRldkRlcHM6IEpTT04uc3RyaW5naWZ5KFtzcGVjRGVwZW5kZW5jeUluZm9dKSxcbiAgfSk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbmV3IHByb2plY3QuXG4gKiBAcGFyYW0gdHlwZSBQcm9qZWN0IHR5cGVcbiAqIEBwYXJhbSBhcmdzIENvbW1hbmQgbGluZSBhcmd1bWVudHNcbiAqIEBwYXJhbSBhZGRpdGlvbmFsUHJvcHMgQWRkaXRpb25hbCBwYXJhbWV0ZXJzIHRvIGluY2x1ZGUgaW4gLnByb2plbnJjLmpzXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG5ld1Byb2plY3QoYmFzZURpcjogc3RyaW5nLCB0eXBlOiBpbnZlbnRvcnkuUHJvamVjdFR5cGUsIGFyZ3M6IGFueSwgYWRkaXRpb25hbFByb3BzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPikge1xuICAvLyBjb252ZXJ0IGNvbW1hbmQgbGluZSBhcmd1bWVudHMgdG8gcHJvamVjdCBwcm9wcyB1c2luZyB0eXBlIGluZm9ybWF0aW9uXG4gIGNvbnN0IHByb3BzID0gY29tbWFuZExpbmVUb1Byb3BzKHR5cGUsIGFyZ3MpO1xuXG4gIC8vIG1lcmdlIGluIGFkZGl0aW9uYWwgcHJvcHMgaWYgc3BlY2lmaWVkXG4gIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKGFkZGl0aW9uYWxQcm9wcyA/PyB7fSkpIHtcbiAgICBwcm9wc1trXSA9IHY7XG4gIH1cblxuICBjcmVhdGVQcm9qZWN0KHtcbiAgICBkaXI6IGJhc2VEaXIsXG4gICAgdHlwZSxcbiAgICBwYXJhbXM6IHByb3BzLFxuICAgIGNvbW1lbnRzOiBhcmdzLmNvbW1lbnRzLFxuICAgIHN5bnRoOiBhcmdzLnN5bnRoLFxuICAgIHBvc3Q6IGFyZ3MucG9zdCxcbiAgfSk7XG5cbiAgLy8gaW50ZXJhY3RpdmUgZ2l0IGFuZCBnaXRodWIgc2V0dXBcbiAgY29uc3QgZ2l0Rm9sZGVyID0gcGF0aC5yZXNvbHZlKGJhc2VEaXIsICcuZ2l0Jyk7XG4gIGxldCBwdXNoSW5pdGlhbFRvR2l0aHViID0gZmFsc2U7XG5cbiAgaWYgKCFmcy5leGlzdHNTeW5jKGdpdEZvbGRlcikpIHtcbiAgICBwdXNoSW5pdGlhbFRvR2l0aHViID0gYXdhaXQgYXNrQWJvdXRHaXQoYmFzZURpcik7XG4gIH1cblxuICBpZiAocHVzaEluaXRpYWxUb0dpdGh1Yikge1xuICAgIGV4ZWMoJ2dpdCBhZGQgLicsIHsgY3dkOiBiYXNlRGlyIH0pO1xuICAgIGV4ZWMoJ2dpdCBjb21taXQgLW0gXFwnSW5pdGlhbCBjb21taXQgZ2VuZXJhdGVkIGJ5IHByb2plblxcJycsIHsgY3dkOiBiYXNlRGlyIH0pO1xuICAgIGV4ZWMoJ2dpdCBicmFuY2ggLU0gbWFpbicsIHsgY3dkOiBiYXNlRGlyIH0pO1xuICAgIGV4ZWMoJ2dpdCBwdXNoIC0tc2V0LXVwc3RyZWFtIG9yaWdpbiBtYWluJywgeyBjd2Q6IGJhc2VEaXIgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnN0YWxscyB0aGUgbnBtIG1vZHVsZSAodGhyb3VnaCBgeWFybiBhZGRgKSB0byBub2RlX21vZHVsZXMgdW5kZXIgYHByb2plY3REaXJgLlxuICogQHBhcmFtIHNwZWMgVGhlIG5wbSBwYWNrYWdlIHNwZWMgKGUuZy4gZm9vQF4xLjIpXG4gKiBAcmV0dXJucyBTdHJpbmcgaW5mbyBmb3IgdGhlIHByb2plY3QgZGV2RGVwcyAoZS5nLiBmb29AXjEuMiBvciBmb29AL3Zhci9mb2xkZXJzLzhrL3FjdzBsczVwdl9waDAwMDBnbi9UL3Byb2plbi1SWXVyQ3cvcGtnLnRneilcbiAqL1xuZnVuY3Rpb24geWFybkFkZChiYXNlRGlyOiBzdHJpbmcsIHNwZWM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IHBhdGguam9pbihiYXNlRGlyLCAncGFja2FnZS5qc29uJyk7XG4gIGNvbnN0IHBhY2thZ2VKc29uRXhpc3RlZCA9IGZzLmV4aXN0c1N5bmMocGFja2FnZUpzb25QYXRoKTtcbiAgbGV0IGRlcGVuZGVuY3lJbmZvID0gc3BlYztcblxuICAvLyB3b3JrYXJvdW5kOiB5YXJuIGZhaWxzIHRvIGV4dHJhY3QgdGd6IGlmIGl0IGNvbnRhaW5zICdAJyBpbiB0aGUgbmFtZSwgc28gd2VcbiAgLy8gY3JlYXRlIGEgdGVtcCBjb3B5IGNhbGxlZCBwa2cudGd6IGFuZCBpbnN0YWxsIGZyb20gdGhlcmUuXG4gIC8vIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL3lhcm5wa2cveWFybi9pc3N1ZXMvNjMzOVxuICBpZiAoc3BlYy5lbmRzV2l0aCgnLnRneicpICYmIHNwZWMuaW5jbHVkZXMoJ0AnKSkge1xuICAgIC8vIGlmIHVzZXIgcGFzc2VzIGluIGEgZmlsZSBzcGVjIHRoZW4gd2UgaGF2ZSB0byBzcGVjaWZ5IHRoZSBwcm9qZWN0IG5hbWUgYW5kIHRoZSBwYWNrYWdlIGxvY2F0aW9uXG4gICAgLy8gKGUuZyBmb29AL3Zhci9mb2xkZXJzLzhrL3FjdzBsczVwdl9waDAwMDBnbi9UL3Byb2plbi1SWXVyQ3cvcGtnLnRneilcbiAgICBjb25zdCBtb2R1bGVOYW1lID0gc3BlYy5zcGxpdCgnLycpLnNsaWNlKC0xKVswXS50cmltKCkuc3BsaXQoJ0AnKVswXS50cmltKCk7IC8vIEV4YW1wbGU6IC4vY2RrLXByb2plY3QvZGlzdC9qcy9jZGstcHJvamVjdEAxLjAuMC5qc2lpLnRnelxuXG4gICAgY29uc3QgdG1wZGlyID0gZnMubWtkdGVtcFN5bmMocGF0aC5qb2luKG9zLnRtcGRpcigpLCAncHJvamVuLScpKTtcbiAgICBjb25zdCBjb3B5ID0gcGF0aC5qb2luKHRtcGRpciwgJ3BrZy50Z3onKTtcbiAgICBmcy5jb3B5RmlsZVN5bmMoc3BlYywgY29weSk7XG4gICAgc3BlYyA9IGNvcHk7XG5cbiAgICBkZXBlbmRlbmN5SW5mbyA9IGAke21vZHVsZU5hbWV9QCR7c3BlY31gO1xuICB9XG5cbiAgbG9nZ2luZy5pbmZvKGBpbnN0YWxsaW5nIGV4dGVybmFsIG1vZHVsZSAke3NwZWN9Li4uYCk7XG4gIGV4ZWMoYHlhcm4gYWRkIC0tbW9kdWxlcy1mb2xkZXI9JHtiYXNlRGlyfS9ub2RlX21vZHVsZXMgLS1zaWxlbnQgLS1uby1sb2NrZmlsZSAtLWRldiAke3NwZWN9YCwgeyBjd2Q6IGJhc2VEaXIgfSk7XG5cbiAgLy8gaWYgcGFja2FnZS5qc29uIGRpZCBub3QgZXhpc3QgYmVmb3JlIGNhbGxpbmcgeWFybiBhZGQsIHdlIHNob3VsZCByZW1vdmUgaXRcbiAgLy8gc28gd2UgY2FuIHN0YXJ0IG9mZiBjbGVhbi5cbiAgaWYgKCFwYWNrYWdlSnNvbkV4aXN0ZWQpIHtcbiAgICBmcy5yZW1vdmVTeW5jKHBhY2thZ2VKc29uUGF0aCk7XG4gIH1cblxuICByZXR1cm4gZGVwZW5kZW5jeUluZm87XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbGFzdCBwYXRoIGVsZW1lbnQgZm9yIHVzZSBhcyBhIHJlcG9zaXRvcnkgbmFtZSBkZWZhdWx0LlxuICovXG5mdW5jdGlvbiByZXBvTmFtZSgpOiBzdHJpbmcge1xuICByZXR1cm4gcGF0aC5iYXNlbmFtZShwYXRoLmJhc2VuYW1lKHByb2Nlc3MuY3dkKCkpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYXNrQWJvdXRHaXQoY3dkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgbG9nZ2luZy5pbmZvKCdXZSBub3RpY2UgdGhhdCB5b3UgZG8gbm90IGhhdmUgYSBsb2NhbCBnaXQgcmVwb3NpdG9yeS4nKTtcbiAgY29uc3QgeyBzZXRVcEdpdCB9ID0gYXdhaXQgaW5xdWlyZXIucHJvbXB0KFtcbiAgICB7XG4gICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICBuYW1lOiAnc2V0VXBHaXQnLFxuICAgICAgbWVzc2FnZTogJ0RvIHlvdSB3YW50IHRvIHNldCB0aGF0IHVwIG5vdz8nLFxuICAgIH0sXG4gIF0pO1xuXG4gIGlmIChzZXRVcEdpdCkge1xuICAgIGNvbnN0IHsgcGxhbiB9ID0gYXdhaXQgaW5xdWlyZXIucHJvbXB0KGdpdGh1YlBsYW5PcHRpb25zKTtcblxuICAgIGNvbnN0IHsgZ2gsIGdpdCB9ID0gcGxhbjtcblxuICAgIGlmICghZ2l0ICYmICFnaCkge1xuICAgICAgZXhlYygnZ2l0IGluaXQnLCB7IGN3ZCB9KTtcbiAgICAgIGxvZ2dpbmcuaW5mbygnT2ssIHdlIGhhdmUgcnVuIFxcJ2dpdCBpbml0XFwnIGZvciB5b3UhIEhhdmUgYSBncmVhdCBkYXkuJyk7XG4gICAgfVxuXG4gICAgaWYgKGdpdCkge1xuICAgICAgY29uc3QgeyBnaXRSZXBvVVJMIH0gPSBhd2FpdCBpbnF1aXJlci5wcm9tcHQoW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICBuYW1lOiAnZ2l0UmVwb1VSTCcsXG4gICAgICAgICAgbWVzc2FnZTogJ1doYXQgaXMgdGhlIHJlcG8/IChleGFtcGxlOiBodHRwczovL2dpdGh1Yi5jb20vcHJvamVuL3Byb2plbiknLFxuICAgICAgICB9LFxuICAgICAgXSk7XG5cbiAgICAgIGV4ZWMoJ2dpdCBpbml0JywgeyBjd2QgfSk7XG5cbiAgICAgIGxldCBmb3JtYXR0ZWRHaXRSZXBvVVJMID0gZ2l0UmVwb1VSTDtcbiAgICAgIGlmICghZ2l0UmVwb1VSTC5pbmNsdWRlcygnaHR0cHMnKSkge1xuICAgICAgICBmb3JtYXR0ZWRHaXRSZXBvVVJMID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke2dpdFJlcG9VUkx9YDtcbiAgICAgIH1cblxuICAgICAgZXhlYyhgZ2l0IHJlbW90ZSBhZGQgb3JpZ2luICR7Zm9ybWF0dGVkR2l0UmVwb1VSTH1gLCB7IGN3ZCB9KTtcblxuICAgICAgbG9nZ2luZy5pbmZvKGBHcmVhdCEgV2UgaGF2ZSBydW4gJ2dpdCBpbml0JyBmb3IgeW91IGFuZCBzZXQgdGhlIHJlbW90ZSB0byAke2Zvcm1hdHRlZEdpdFJlcG9VUkx9YCk7XG4gICAgfVxuXG4gICAgaWYgKCFnaXQgJiYgZ2gpIHtcbiAgICAgIGxvZ2dpbmcuaW5mbygnT2shIFdlIHdpbGwgbWFrZSB5b3UgYSByZXBvc2l0b3J5IG9uIEdpdEh1Yi4nKTtcblxuICAgICAgY29uc3QgZ2hDTElQYXRoID0gZXhlY09yVW5kZWZpbmVkKGAke29zLnBsYXRmb3JtKCkgPT09ICd3aW4zMicgPyAnd2hlcmUnIDogJ3doaWNoJ30gZ2hgLCB7IGN3ZCB9KTtcblxuICAgICAgaWYgKCFnaENMSVBhdGgpIHtcbiAgICAgICAgbG9nZ2luZy53YXJuKCdMb29rcyBsaWtlIHlvdSBkbyBub3QgaGF2ZSB0aGUgR2l0SHViIENMSSBpbnN0YWxsZWQuIFBsZWFzZSBnbyB0byBodHRwczovL2NsaS5naXRodWIuY29tLyB0byBpbnN0YWxsIGFuZCB0cnkgYWdhaW4uJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7IGdpdFByb2plY3ROYW1lIH0gPSBhd2FpdCBpbnF1aXJlci5wcm9tcHQoW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgICBuYW1lOiAnZ2l0UHJvamVjdE5hbWUnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1doYXQgd291bGQgeW91IGxpa2UgdG8gbmFtZSBpdD8nLFxuICAgICAgICAgICAgZGVmYXVsdDogcmVwb05hbWUoKSxcbiAgICAgICAgICB9LFxuICAgICAgICBdKTtcblxuICAgICAgICBsb2dnaW5nLmluZm8oYFdvdyEgJHtnaXRQcm9qZWN0TmFtZX0gaXMgc3VjaCBhIGdyZWF0IG5hbWUhYCk7XG5cbiAgICAgICAgZXhlYygnZ2l0IGluaXQnLCB7IGN3ZCB9KTtcblxuICAgICAgICBleGVjKGBnaCByZXBvIGNyZWF0ZSAke2dpdFByb2plY3ROYW1lfWAsIHsgY3dkIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5jb25zdCBnaXRodWJQbGFuT3B0aW9ucyA9IFtcbiAge1xuICAgIHR5cGU6ICdsaXN0JyxcbiAgICBuYW1lOiAncGxhbicsXG4gICAgbWVzc2FnZTogJ1dlXFwnbGwgbmVlZCBzb21lIG1vcmUgaW5mby4gUGxlYXNlIGNob29zZSBvbmU6JyxcbiAgICBjaG9pY2VzOiBbXG4gICAgICB7XG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgZ2l0OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiAnSSBhbHJlYWR5IGhhdmUgYSBnaXQgcmVwb3NpdG9yeScsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgIGdoOiB0cnVlLFxuICAgICAgICAgIGdpdDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIG5hbWU6ICdJIGRvblxcJ3QgaGF2ZSBhIGdpdCByZXBvc2l0b3J5IGFuZCB3YW50IHRvIG1ha2Ugb25lIG9uIEdpdEh1YicsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgIGdoOiBmYWxzZSxcbiAgICAgICAgICBnaXQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiAnSSBkb25cXCd0IGhhdmUgYSBnaXQgcmVwb3NpdG9yeSBhbmQgSSBkb25cXCd0IHdhbnQgdG8gdXNlIEdpdEh1YicsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG5dO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBDb21tYW5kKCk7XG4iXX0=