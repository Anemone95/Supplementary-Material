import { NodeProject } from './node-project';
import { TypescriptConfig, TypescriptConfigOptions } from './typescript';
/**
 * @experimental
 */
export interface JestConfigOptions {
    /**
     * (experimental) This option tells Jest that all imported modules in your tests should be mocked automatically.
     *
     * All modules used in your tests will have a replacement implementation, keeping the API surface
     *
     * @default - false
     * @experimental
     */
    readonly automock?: boolean;
    /**
     * (experimental) By default, Jest runs all tests and produces all errors into the console upon completion.
     *
     * The bail config option can be used here to have Jest stop running tests after n failures.
     * Setting bail to true is the same as setting bail to 1.
     *
     * @default - 0
     * @experimental
     */
    readonly bail?: boolean | number;
    /**
     * (experimental) The directory where Jest should store its cached dependency information.
     *
     * @default - "/tmp/<path>"
     * @experimental
     */
    readonly cacheDirectory?: string;
    /**
     * (experimental) Automatically clear mock calls and instances before every test.
     *
     * Equivalent to calling jest.clearAllMocks() before each test.
     * This does not remove any mock implementation that may have been provided
     *
     * @default true
     * @experimental
     */
    readonly clearMocks?: boolean;
    /**
     * (experimental) Indicates whether the coverage information should be collected while executing the test.
     *
     * Because this retrofits all executed files with coverage collection statements,
     * it may significantly slow down your tests
     *
     * @default true
     * @experimental
     */
    readonly collectCoverage?: boolean;
    /**
     * (experimental) An array of glob patterns indicating a set of files for which coverage information should be collected.
     *
     * @default - undefined
     * @experimental
     */
    readonly collectCoverageFrom?: string[];
    /**
     * (experimental) The directory where Jest should output its coverage files.
     *
     * @default "coverage"
     * @experimental
     */
    readonly coverageDirectory?: string;
    /**
     * (experimental) An array of regexp pattern strings that are matched against all file paths before executing the test.
     *
     * If the file path matches any of the patterns, coverage information will be skipped
     *
     * @default "/node_modules/"
     * @experimental
     */
    readonly coveragePathIgnorePatterns?: string[];
    /**
     * (experimental) Indicates which provider should be used to instrument code for coverage.
     *
     * Allowed values are babel (default) or v8
     *
     * @default - "babel"
     * @experimental
     */
    readonly coverageProvider?: 'babel' | 'v8';
    /**
     * (experimental) A list of reporter names that Jest uses when writing coverage reports.
     *
     * Any istanbul reporter can be used
     *
     * @default - ["json", "lcov", "text", "clover"]
     * @experimental
     */
    readonly coverageReporters?: string[];
    /**
     * (experimental) Specify the global coverage thresholds.
     *
     * This will be used to configure minimum threshold enforcement
     * for coverage results. Thresholds can be specified as global, as a glob, and as a directory or file path.
     * If thresholds aren't met, jest will fail.
     *
     * @default - undefined
     * @experimental
     */
    readonly coverageThreshold?: CoverageThreshold;
    /**
     * (experimental) This option allows the use of a custom dependency extractor.
     *
     * It must be a node module that exports an object with an extract function
     *
     * @default - undefined
     * @experimental
     */
    readonly dependencyExtractor?: string;
    /**
     * (experimental) Allows for a label to be printed alongside a test while it is running.
     *
     * @default - undefined
     * @experimental
     */
    readonly displayName?: string | any;
    /**
     * (experimental) Make calling deprecated APIs throw helpful error messages.
     *
     * Useful for easing the upgrade process.
     *
     * @default - false
     * @experimental
     */
    readonly errorOnDeprecated?: boolean;
    /**
     * (experimental) Test files run inside a vm, which slows calls to global context properties (e.g. Math). With this option you can specify extra properties to be defined inside the vm for faster lookups.
     *
     * @default - undefined
     * @experimental
     */
    readonly extraGlobals?: string[];
    /**
     * (experimental) Test files are normally ignored from collecting code coverage.
     *
     * With this option, you can overwrite this behavior and include otherwise ignored files in code coverage.
     *
     * @default - ['']
     * @experimental
     */
    readonly forceCoverageMatch?: string[];
    /**
     * (experimental) A set of global variables that need to be available in all test environments.
     *
     * @default - {}
     * @experimental
     */
    readonly globals?: any;
    /**
     * (experimental) This option allows the use of a custom global setup module which exports an async function that is triggered once before all test suites.
     *
     * This function gets Jest's globalConfig object as a parameter.
     *
     * @default - undefined
     * @experimental
     */
    readonly globalSetup?: string;
    /**
     * (experimental) This option allows the use of a custom global teardown module which exports an async function that is triggered once after all test suites.
     *
     * This function gets Jest's globalConfig object as a parameter.
     *
     * @default - undefined
     * @experimental
     */
    readonly globalTeardown?: string;
    /**
     * (experimental) This will be used to configure the behavior of jest-haste-map, Jest's internal file crawler/cache system.
     *
     * @default - {}
     * @experimental
     */
    readonly haste?: HasteConfig;
    /**
     * (experimental) Insert Jest's globals (expect, test, describe, beforeEach etc.) into the global environment. If you set this to false, you should import from @jest/globals.
     *
     * @default - true
     * @experimental
     */
    readonly injectGlobals?: boolean;
    /**
     * (experimental) A number limiting the number of tests that are allowed to run at the same time when using test.concurrent. Any test above this limit will be queued and executed once a slot is released.
     *
     * @default - 5
     * @experimental
     */
    readonly maxConcurrency?: number;
    /**
     * (experimental) An array of directory names to be searched recursively up from the requiring module's location.
     *
     * Setting this option will override the default, if you wish to still search node_modules for packages
     * include it along with any other options: ["node_modules", "bower_components"]
     *
     * @default - ["node_modules"]
     * @experimental
     */
    readonly moduleDirectories?: string[];
    /**
     * (experimental) An array of file extensions your modules use.
     *
     * If you require modules without specifying a file extension,
     * these are the extensions Jest will look for, in left-to-right order.
     *
     * @default - ["js", "json", "jsx", "ts", "tsx", "node"]
     * @experimental
     */
    readonly moduleFileExtensions?: string[];
    /**
     * (experimental) A map from regular expressions to module names or to arrays of module names that allow to stub out resources, like images or styles with a single module.
     *
     * @default - null
     * @experimental
     */
    readonly moduleNameMapper?: {
        [key: string]: string | string[];
    };
    /**
     * (experimental) An array of regexp pattern strings that are matched against all module paths before those paths are to be considered 'visible' to the module loader.
     *
     * If a given module's path matches any of the patterns,
     * it will not be require()-able in the test environment.
     *
     * @default - []
     * @experimental
     */
    readonly modulePathIgnorePatterns?: string[];
    /**
     * (experimental) An alternative API to setting the NODE_PATH env variable, modulePaths is an array of absolute paths to additional locations to search when resolving modules.
     *
     * Use the <rootDir> string token to include
     * the path to your project's root directory. Example: ["<rootDir>/app/"].
     *
     * @default - []
     * @experimental
     */
    readonly modulePaths?: string[];
    /**
     * (experimental) Activates notifications for test results.
     *
     * @default - false
     * @experimental
     */
    readonly notify?: boolean;
    /**
     * (experimental) Specifies notification mode.
     *
     * Requires notify: true
     *
     * @default - failure-change
     * @experimental
     */
    readonly notifyMode?: 'always' | 'failure' | 'success' | 'change' | 'success-change' | 'failure-change';
    /**
     * (experimental) A preset that is used as a base for Jest's configuration.
     *
     * A preset should point to an npm module
     * that has a jest-preset.json or jest-preset.js file at the root.
     *
     * @default - undefined
     * @experimental
     */
    readonly preset?: string;
    /**
     * (experimental) Sets the path to the prettier node module used to update inline snapshots.
     *
     * @default - "prettier"
     * @experimental
     */
    readonly prettierPath?: string;
    /**
     * (experimental) When the projects configuration is provided with an array of paths or glob patterns, Jest will run tests in all of the specified projects at the same time.
     *
     * This is great for monorepos or
     * when working on multiple projects at the same time.
     *
     * @default - undefined
     * @experimental
     */
    readonly projects?: Array<string | {
        [key: string]: any;
    }>;
    /**
     * (experimental) Use this configuration option to add custom reporters to Jest.
     *
     * A custom reporter is a class
     * that implements onRunStart, onTestStart, onTestResult, onRunComplete methods that will be
     * called when any of those events occurs.
     *
     * @default - undefined
     * @experimental
     */
    readonly reporters?: JestReporter[];
    /**
     * (experimental) Automatically reset mock state before every test.
     *
     * Equivalent to calling jest.resetAllMocks()
     * before each test. This will lead to any mocks having their fake implementations removed but
     * does not restore their initial implementation.
     *
     * @default - false
     * @experimental
     */
    readonly resetMocks?: boolean;
    /**
     * (experimental) By default, each test file gets its own independent module registry.
     *
     * Enabling resetModules
     * goes a step further and resets the module registry before running each individual test.
     *
     * @default - false
     * @experimental
     */
    readonly resetModules?: boolean;
    /**
     * (experimental) This option allows the use of a custom resolver.
     *
     * https://jestjs.io/docs/en/configuration#resolver-string
     *
     * @default - undefined
     * @experimental
     */
    readonly resolver?: string;
    /**
     * (experimental) Automatically restore mock state before every test.
     *
     * Equivalent to calling jest.restoreAllMocks()
     * before each test. This will lead to any mocks having their fake implementations removed and
     * restores their initial implementation.
     *
     * @default - false
     * @experimental
     */
    readonly restoreMocks?: boolean;
    /**
     * (experimental) The root directory that Jest should scan for tests and modules within.
     *
     * If you put your Jest
     * config inside your package.json and want the root directory to be the root of your repo, the
     * value for this config param will default to the directory of the package.json.
     *
     * @default - directory of the package.json
     * @experimental
     */
    readonly rootDir?: string;
    /**
     * (experimental) A list of paths to directories that Jest should use to search for files in.
     *
     * @default - ["<rootDir>"]
     * @experimental
     */
    readonly roots?: string[];
    /**
     * (experimental) This option allows you to use a custom runner instead of Jest's default test runner.
     *
     * @default - "jest-runner"
     * @experimental
     */
    readonly runner?: string;
    /**
     * (experimental) A list of paths to modules that run some code to configure or set up the testing environment.
     *
     * Each setupFile will be run once per test file. Since every test runs in its own environment,
     * these scripts will be executed in the testing environment immediately before executing the
     * test code itself.
     *
     * @default - []
     * @experimental
     */
    readonly setupFiles?: string[];
    /**
     * (experimental) A list of paths to modules that run some code to configure or set up the testing framework before each test file in the suite is executed.
     *
     * Since setupFiles executes before the test
     * framework is installed in the environment, this script file presents you the opportunity of
     * running some code immediately after the test framework has been installed in the environment.
     *
     * @default - []
     * @experimental
     */
    readonly setupFilesAfterEnv?: string[];
    /**
     * (experimental) The number of seconds after which a test is considered as slow and reported as such in the results.
     *
     * @default - 5
     * @experimental
     */
    readonly slowTestThreshold?: number;
    /**
     * (experimental) The path to a module that can resolve test<->snapshot path.
     *
     * This config option lets you customize
     * where Jest stores snapshot files on disk.
     *
     * @default - undefined
     * @experimental
     */
    readonly snapshotResolver?: string;
    /**
     * (experimental) A list of paths to snapshot serializer modules Jest should use for snapshot testing.
     *
     * @default = []
     * @experimental
     */
    readonly snapshotSerializers?: string[];
    /**
     * (experimental) The test environment that will be used for testing.
     *
     * The default environment in Jest is a
     * browser-like environment through jsdom. If you are building a node service, you can use the node
     * option to use a node-like environment instead.
     *
     * @default - "jsdom"
     * @experimental
     */
    readonly testEnvironment?: string;
    /**
     * (experimental) Test environment options that will be passed to the testEnvironment.
     *
     * The relevant options depend on the environment.
     *
     * @default - {}
     * @experimental
     */
    readonly testEnvironmentOptions?: any;
    /**
     * (experimental) The exit code Jest returns on test failure.
     *
     * @default - 1
     * @experimental
     */
    readonly testFailureExitCode?: number;
    /**
     * (experimental) The glob patterns Jest uses to detect test files.
     *
     * By default it looks for .js, .jsx, .ts and .tsx
     * files inside of __tests__ folders, as well as any files with a suffix of .test or .spec
     * (e.g. Component.test.js or Component.spec.js). It will also find files called test.js or spec.js.
     *
     * @default ['**\/__tests__/**\/*.[jt]s?(x)', '**\/?(*.)+(spec|test).[tj]s?(x)']
     * @experimental
     */
    readonly testMatch?: string[];
    /**
     * (experimental) An array of regexp pattern strings that are matched against all test paths before executing the test.
     *
     * If the test path matches any of the patterns, it will be skipped.
     *
     * @default - ["/node_modules/"]
     * @experimental
     */
    readonly testPathIgnorePatterns?: string[];
    /**
     * (experimental) The pattern or patterns Jest uses to detect test files.
     *
     * By default it looks for .js, .jsx, .ts and .tsx
     * files inside of __tests__ folders, as well as any files with a suffix of .test or .spec
     * (e.g. Component.test.js or Component.spec.js). It will also find files called test.js or spec.js.
     *
     * @default - (/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$
     * @experimental
     */
    readonly testRegex?: string | string[];
    /**
     * (experimental) This option allows the use of a custom results processor.
     *
     * @default - undefined
     * @experimental
     */
    readonly testResultsProcessor?: string;
    /**
     * (experimental) This option allows the use of a custom test runner.
     *
     * The default is jasmine2. A custom test runner
     * can be provided by specifying a path to a test runner implementation.
     *
     * @default - "jasmine2"
     * @experimental
     */
    readonly testRunner?: string;
    /**
     * (experimental) This option allows you to use a custom sequencer instead of Jest's default.
     *
     * Sort may optionally return a Promise.
     *
     * @default - "
     * @experimental
     * @jest /test-sequencer"
     */
    readonly testSequencer?: string;
    /**
     * (experimental) Default timeout of a test in milliseconds.
     *
     * @default - 5000
     * @experimental
     */
    readonly testTimeout?: number;
    /**
     * (experimental) This option sets the URL for the jsdom environment.
     *
     * It is reflected in properties such as location.href.
     *
     * @default - "http://localhost"
     * @experimental
     */
    readonly testURL?: string;
    /**
     * (experimental) Setting this value to legacy or fake allows the use of fake timers for functions such as setTimeout.
     *
     * Fake timers are useful when a piece of code sets a long timeout that we don't want to wait for in a test.
     *
     * @default - "real"
     * @experimental
     */
    readonly timers?: string;
    /**
     * (experimental) A map from regular expressions to paths to transformers.
     *
     * A transformer is a module that provides a
     * synchronous function for transforming source files.
     *
     * @default - {"\\.[jt]sx?$": "babel-jest"}
     * @experimental
     */
    readonly transform?: {
        [key: string]: string | [string, any];
    };
    /**
     * (experimental) An array of regexp pattern strings that are matched against all source file paths before transformation.
     *
     * If the test path matches any of the patterns, it will not be transformed.
     *
     * @default - ["/node_modules/", "\\.pnp\\.[^\\\/]+$"]
     * @experimental
     */
    readonly transformIgnorePatterns?: string[];
    /**
     * (experimental) An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them.
     *
     * If a module's path matches any of the patterns in this list, it
     * will not be automatically mocked by the module loader.
     *
     * @default - []
     * @experimental
     */
    readonly unmockedModulePathPatterns?: string[];
    /**
     * (experimental) Indicates whether each individual test should be reported during the run.
     *
     * All errors will also
     * still be shown on the bottom after execution. Note that if there is only one test file being run
     * it will default to true.
     *
     * @default - false
     * @experimental
     */
    readonly verbose?: boolean;
    /**
     * (experimental) An array of RegExp patterns that are matched against all source file paths before re-running tests in watch mode.
     *
     * If the file path matches any of the patterns, when it is updated, it will not trigger
     * a re-run of tests.
     *
     * @default - []
     * @experimental
     */
    readonly watchPathIgnorePatterns?: string[];
    /**
     * @default -
     * @experimental
     */
    readonly watchPlugins?: [string | [string, any]];
    /**
     * (experimental) Whether to use watchman for file crawling.
     *
     * @default - true
     * @experimental
     */
    readonly watchman?: boolean;
    /**
     * Escape hatch to allow any value
     */
    readonly [name: string]: any;
}
/**
 * @experimental
 */
export interface JestOptions {
    /**
     * (deprecated) Collect coverage.
     *
     * Deprecated
     *
     * @default true
     * @deprecated use jestConfig.collectCoverage
     */
    readonly coverage?: boolean;
    /**
     * (experimental) Include the `text` coverage reporter, which means that coverage summary is printed at the end of the jest execution.
     *
     * @default true
     * @experimental
     */
    readonly coverageText?: boolean;
    /**
     * (deprecated) Defines `testPathIgnorePatterns` and `coveragePathIgnorePatterns`.
     *
     * @default ["/node_modules/"]
     * @deprecated use jestConfig.coveragePathIgnorePatterns or jestConfig.testPathIgnorePatterns respectively
     */
    readonly ignorePatterns?: string[];
    /**
     * (experimental) Result processing with jest-junit.
     *
     * Output directory is `test-reports/`.
     *
     * @default true
     * @experimental
     */
    readonly junitReporting?: boolean;
    /**
     * (experimental) Preserve the default Jest reporter when additional reporters are added.
     *
     * @default true
     * @experimental
     */
    readonly preserveDefaultReporters?: boolean;
    /**
     * (experimental) The version of jest to use.
     *
     * @default - installs the latest jest version
     * @experimental
     */
    readonly jestVersion?: string;
    /**
     * @experimental
     */
    readonly jestConfig?: JestConfigOptions;
    /**
     * @experimental
     */
    readonly typescriptConfig?: TypescriptConfigOptions;
}
/**
 * @experimental
 */
export interface CoverageThreshold {
    /**
     * @experimental
     */
    readonly branches?: number;
    /**
     * @experimental
     */
    readonly functions?: number;
    /**
     * @experimental
     */
    readonly lines?: number;
    /**
     * @experimental
     */
    readonly statements?: number;
}
/**
 * @experimental
 */
export interface HasteConfig {
    /**
     * @experimental
     */
    readonly computeSha1?: boolean;
    /**
     * @experimental
     */
    readonly defaultPlatform?: string | undefined;
    /**
     * @experimental
     */
    readonly hasteImplModulePath?: string;
    /**
     * @experimental
     */
    readonly platforms?: Array<string>;
    /**
     * @experimental
     */
    readonly throwOnModuleCollision?: boolean;
}
declare type JestReporter = [string, {
    [key: string]: any;
}] | string;
/**
 * (experimental) Installs the following npm scripts:.
 *
 * - `test` will run `jest --passWithNoTests`
 * - `test:watch` will run `jest --watch`
 * - `test:update` will run `jest -u`
 *
 * @experimental
 */
export declare class Jest {
    /**
     * (experimental) Escape hatch.
     *
     * @experimental
     */
    readonly config: any;
    private readonly testMatch;
    private readonly ignorePatterns;
    private readonly watchIgnorePatterns;
    private readonly coverageReporters;
    private readonly project;
    private readonly reporters;
    private readonly jestConfig?;
    private readonly typescriptConfig?;
    private _snapshotResolver;
    /**
     * @experimental
     */
    constructor(project: NodeProject, options?: JestOptions);
    /**
     * (experimental) Adds a test match pattern.
     *
     * @param pattern glob pattern to match for tests.
     * @experimental
     */
    addTestMatch(pattern: string): void;
    /**
     * (experimental) Adds a watch ignore pattern.
     *
     * @param pattern The pattern (regular expression).
     * @experimental
     */
    addWatchIgnorePattern(pattern: string): void;
    /**
     * @experimental
     */
    addIgnorePattern(pattern: string): void;
    /**
     * @experimental
     */
    addReporter(reporter: JestReporter): void;
    /**
     * @experimental
     */
    addSnapshotResolver(file: string): void;
    /**
     * (experimental) Merges passed in typescript config options with jest configured typescript options from .projenrc Add Jest config settings for typescript options.
     *
     * @param options TypescriptConfigOptions.
     * @experimental
     */
    generateTypescriptConfig(options: TypescriptConfigOptions): TypescriptConfig;
    private configureTestCommand;
}
export {};
