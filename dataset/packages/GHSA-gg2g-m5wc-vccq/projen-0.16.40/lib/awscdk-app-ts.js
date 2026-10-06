"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsCdkTypeScriptApp = exports.CdkApprovalLevel = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path = require("path");
const fs = require("fs-extra");
const component_1 = require("./component");
const json_1 = require("./json");
const tasks_1 = require("./tasks");
const typescript_1 = require("./typescript");
/**
 * @experimental
 */
var CdkApprovalLevel;
(function (CdkApprovalLevel) {
    CdkApprovalLevel["NEVER"] = "never";
    CdkApprovalLevel["ANY_CHANGE"] = "any-change";
    CdkApprovalLevel["BROADENING"] = "broadening";
})(CdkApprovalLevel = exports.CdkApprovalLevel || (exports.CdkApprovalLevel = {}));
/**
 * (experimental) AWS CDK app in TypeScript.
 *
 * @experimental
 * @pjid awscdk-app-ts
 */
class AwsCdkTypeScriptApp extends typescript_1.TypeScriptAppProject {
    /**
     * @experimental
     */
    constructor(options) {
        var _b, _c, _d, _e, _f;
        super({
            ...options,
            sampleCode: false,
        });
        // encode a hidden assumption further down the chain
        if (this.srcdir !== 'src') {
            throw new Error('sources are expected under the "src" directory');
        }
        // encode a hidden assumption further down the chain
        if (this.testdir !== 'test') {
            throw new Error('test sources are expected under the "test" directory');
        }
        this.appEntrypoint = (_b = options.appEntrypoint) !== null && _b !== void 0 ? _b : 'main.ts';
        this.cdkVersion = options.cdkVersionPinning ? options.cdkVersion : `^${options.cdkVersion}`;
        // CLI
        this.addDevDeps(this.formatModuleSpec('aws-cdk'));
        this.addCdkDependency('@aws-cdk/assert');
        this.addCdkDependency('@aws-cdk/core');
        this.addCdkDependency(...(_c = options.cdkDependencies) !== null && _c !== void 0 ? _c : []);
        const synth = this.addTask('synth', {
            description: 'Synthesizes your cdk app into cdk.out (part of "yarn build")',
            category: tasks_1.TaskCategory.BUILD,
            exec: 'cdk synth',
        });
        this.addTask('deploy', {
            description: 'Deploys your CDK app to the AWS cloud',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'cdk deploy',
        });
        this.addTask('destroy', {
            description: 'Destroys your cdk app in the AWS cloud',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'cdk destroy',
        });
        this.addTask('diff', {
            description: 'Diffs the currently deployed app against your code',
            category: tasks_1.TaskCategory.MISC,
            exec: 'cdk diff',
        });
        // no compile step because we do all of it in typescript directly
        this.compileTask.reset();
        this.removeScript('watch'); // because we use ts-node
        // add synth to the build
        this.buildTask.spawn(synth);
        this.cdkConfig = {
            app: `npx ts-node --prefer-ts-exts ${path.join(this.srcdir, this.appEntrypoint)}`,
        };
        if (options.context) {
            this.cdkConfig.context = { ...options.context };
        }
        if (options.requireApproval) {
            this.cdkConfig.requireApproval = options.requireApproval;
        }
        this.gitignore.exclude('cdk.out/');
        this.gitignore.exclude('.cdk.staging/');
        this.gitignore.exclude('.parcel-cache/');
        (_d = this.npmignore) === null || _d === void 0 ? void 0 : _d.exclude('cdk.out/');
        (_e = this.npmignore) === null || _e === void 0 ? void 0 : _e.exclude('.cdk.staging/');
        if (this.tsconfig) {
            this.tsconfig.exclude.push('cdk.out');
        }
        this.addDevDeps('ts-node');
        new json_1.JsonFile(this, 'cdk.json', {
            obj: this.cdkConfig,
        });
        if ((_f = options.sampleCode) !== null && _f !== void 0 ? _f : true) {
            new SampleCode(this);
        }
    }
    /**
     * (experimental) Adds an AWS CDK module dependencies.
     *
     * @param modules The list of modules to depend on.
     * @experimental
     */
    addCdkDependency(...modules) {
        this.addDeps(...modules.map(m => this.formatModuleSpec(m)));
    }
    formatModuleSpec(module) {
        return `${module}@${this.cdkVersion}`;
    }
}
exports.AwsCdkTypeScriptApp = AwsCdkTypeScriptApp;
_a = JSII_RTTI_SYMBOL_1;
AwsCdkTypeScriptApp[_a] = { fqn: "projen.AwsCdkTypeScriptApp", version: "0.16.40" };
class SampleCode extends component_1.Component {
    constructor(project) {
        super(project);
        this.appProject = project;
    }
    synthesize() {
        const outdir = this.project.outdir;
        const srcdir = path.join(outdir, this.appProject.srcdir);
        if (fs.pathExistsSync(srcdir) && fs.readdirSync(srcdir).filter(x => x.endsWith('.ts'))) {
            return;
        }
        const srcCode = `import { App, Construct, Stack, StackProps } from '@aws-cdk/core';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // define resources here...
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();`;
        fs.mkdirpSync(srcdir);
        fs.writeFileSync(path.join(srcdir, this.appProject.appEntrypoint), srcCode);
        const testdir = path.join(outdir, this.appProject.testdir);
        if (fs.pathExistsSync(testdir) && fs.readdirSync(testdir).filter(x => x.endsWith('.ts'))) {
            return;
        }
        const appEntrypointName = path.basename(this.appProject.appEntrypoint, '.ts');
        const testCode = `import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { MyStack } from '../src/${appEntrypointName}';

test('Snapshot', () => {
  const app = new App();
  const stack = new MyStack(app, 'test');

  expect(stack).not.toHaveResource('AWS::S3::Bucket');
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});`;
        fs.mkdirpSync(testdir);
        fs.writeFileSync(path.join(testdir, `${appEntrypointName}.test.ts`), testCode);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzY2RrLWFwcC10cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hd3NjZGstYXBwLXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQiwyQ0FBd0M7QUFDeEMsaUNBQWtDO0FBQ2xDLG1DQUF1QztBQUN2Qyw2Q0FBOEU7Ozs7QUFFOUUsSUFBWSxnQkFhWDtBQWJELFdBQVksZ0JBQWdCO0lBSTFCLG1DQUFlLENBQUE7SUFJZiw2Q0FBeUIsQ0FBQTtJQUl6Qiw2Q0FBeUIsQ0FBQTtBQUMzQixDQUFDLEVBYlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFhM0I7Ozs7Ozs7QUFvREQsTUFBYSxtQkFBb0IsU0FBUSxpQ0FBb0I7Ozs7SUFnQjNELFlBQVksT0FBbUM7O1FBQzdDLEtBQUssQ0FBQztZQUNKLEdBQUcsT0FBTztZQUNWLFVBQVUsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUVILG9EQUFvRDtRQUNwRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztTQUNuRTtRQUVELG9EQUFvRDtRQUNwRCxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssTUFBTSxFQUFFO1lBQzNCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztTQUN6RTtRQUVELElBQUksQ0FBQyxhQUFhLFNBQUcsT0FBTyxDQUFDLGFBQWEsbUNBQUksU0FBUyxDQUFDO1FBRXhELElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUU1RixNQUFNO1FBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENB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QUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzRCxJQUFJLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDeEYsT0FBTztTQUNSO1FBQ0QsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlFLE1BQU0sUUFBUSxHQUFHOztrQ0FFYSxpQkFBaUI7Ozs7Ozs7O0lBUS9DLENBQUM7UUFFRCxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZCLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxpQkFBaUIsVUFBVSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDakYsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50JztcbmltcG9ydCB7IEpzb25GaWxlIH0gZnJvbSAnLi9qc29uJztcbmltcG9ydCB7IFRhc2tDYXRlZ29yeSB9IGZyb20gJy4vdGFza3MnO1xuaW1wb3J0IHsgVHlwZVNjcmlwdEFwcFByb2plY3QsIFR5cGVTY3JpcHRQcm9qZWN0T3B0aW9ucyB9IGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbmV4cG9ydCBlbnVtIENka0FwcHJvdmFsTGV2ZWwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBORVZFUiA9ICduZXZlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgQU5ZX0NIQU5HRSA9ICdhbnktY2hhbmdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBCUk9BREVOSU5HID0gJ2Jyb2FkZW5pbmcnLFxufVxuZXhwb3J0IGludGVyZmFjZSBBd3NDZGtUeXBlU2NyaXB0QXBwT3B0aW9ucyBleHRlbmRzIFR5cGVTY3JpcHRQcm9qZWN0T3B0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBjZGtWZXJzaW9uOiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBjZGtWZXJzaW9uUGlubmluZz86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGNka0RlcGVuZGVuY2llcz86IHN0cmluZ1tdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGNvbnRleHQ/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgYXBwRW50cnlwb2ludD86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgcmVxdWlyZUFwcHJvdmFsPzogQ2RrQXBwcm92YWxMZXZlbDtcblxufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIEF3c0Nka1R5cGVTY3JpcHRBcHAgZXh0ZW5kcyBUeXBlU2NyaXB0QXBwUHJvamVjdCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGNka1ZlcnNpb246IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgY2RrQ29uZmlnOiBhbnk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgYXBwRW50cnlwb2ludDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEF3c0Nka1R5cGVTY3JpcHRBcHBPcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIHNhbXBsZUNvZGU6IGZhbHNlLFxuICAgIH0pO1xuXG4gICAgLy8gZW5jb2RlIGEgaGlkZGVuIGFzc3VtcHRpb24gZnVydGhlciBkb3duIHRoZSBjaGFpblxuICAgIGlmICh0aGlzLnNyY2RpciAhPT0gJ3NyYycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignc291cmNlcyBhcmUgZXhwZWN0ZWQgdW5kZXIgdGhlIFwic3JjXCIgZGlyZWN0b3J5Jyk7XG4gICAgfVxuXG4gICAgLy8gZW5jb2RlIGEgaGlkZGVuIGFzc3VtcHRpb24gZnVydGhlciBkb3duIHRoZSBjaGFpblxuICAgIGlmICh0aGlzLnRlc3RkaXIgIT09ICd0ZXN0Jykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd0ZXN0IHNvdXJjZXMgYXJlIGV4cGVjdGVkIHVuZGVyIHRoZSBcInRlc3RcIiBkaXJlY3RvcnknKTtcbiAgICB9XG5cbiAgICB0aGlzLmFwcEVudHJ5cG9pbnQgPSBvcHRpb25zLmFwcEVudHJ5cG9pbnQgPz8gJ21haW4udHMnO1xuXG4gICAgdGhpcy5jZGtWZXJzaW9uID0gb3B0aW9ucy5jZGtWZXJzaW9uUGlubmluZyA/IG9wdGlvbnMuY2RrVmVyc2lvbiA6IGBeJHtvcHRpb25zLmNka1ZlcnNpb259YDtcblxuICAgIC8vIENMSVxuICAgIHRoaXMuYWRkRGV2RGVwcyh0aGlzLmZvcm1hdE1vZHVsZVNwZWMoJ2F3cy1jZGsnKSk7XG5cbiAgICB0aGlzLmFkZENka0RlcGVuZGVuY3koJ0Bhd3MtY2RrL2Fzc2VydCcpO1xuICAgIHRoaXMuYWRkQ2RrRGVwZW5kZW5jeSgnQGF3cy1jZGsvY29yZScpO1xuICAgIHRoaXMuYWRkQ2RrRGVwZW5kZW5jeSguLi5vcHRpb25zLmNka0RlcGVuZGVuY2llcyA/PyBbXSk7XG5cbiAgICBjb25zdCBzeW50aCA9IHRoaXMuYWRkVGFzaygnc3ludGgnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1N5bnRoZXNpemVzIHlvdXIgY2RrIGFwcCBpbnRvIGNkay5vdXQgKHBhcnQgb2YgXCJ5YXJuIGJ1aWxkXCIpJyxcbiAgICAgIGNhdGVnb3J5OiBUYXNrQ2F0ZWdvcnkuQlVJTEQsXG4gICAgICBleGVjOiAnY2RrIHN5bnRoJyxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkVGFzaygnZGVwbG95Jywge1xuICAgICAgZGVzY3JpcHRpb246ICdEZXBsb3lzIHlvdXIgQ0RLIGFwcCB0byB0aGUgQVdTIGNsb3VkJyxcbiAgICAgIGNhdGVnb3J5OiBUYXNrQ2F0ZWdvcnkuUkVMRUFTRSxcbiAgICAgIGV4ZWM6ICdjZGsgZGVwbG95JyxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkVGFzaygnZGVzdHJveScsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnRGVzdHJveXMgeW91ciBjZGsgYXBwIGluIHRoZSBBV1MgY2xvdWQnLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5SRUxFQVNFLFxuICAgICAgZXhlYzogJ2NkayBkZXN0cm95JyxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkVGFzaygnZGlmZicsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnRGlmZnMgdGhlIGN1cnJlbnRseSBkZXBsb3llZCBhcHAgYWdhaW5zdCB5b3VyIGNvZGUnLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5NSVNDLFxuICAgICAgZXhlYzogJ2NkayBkaWZmJyxcbiAgICB9KTtcblxuICAgIC8vIG5vIGNvbXBpbGUgc3RlcCBiZWNhdXNlIHdlIGRvIGFsbCBvZiBpdCBpbiB0eXBlc2NyaXB0IGRpcmVjdGx5XG4gICAgdGhpcy5jb21waWxlVGFzay5yZXNldCgpO1xuXG4gICAgdGhpcy5yZW1vdmVTY3JpcHQoJ3dhdGNoJyk7IC8vIGJlY2F1c2Ugd2UgdXNlIHRzLW5vZGVcblxuICAgIC8vIGFkZCBzeW50aCB0byB0aGUgYnVpbGRcbiAgICB0aGlzLmJ1aWxkVGFzay5zcGF3bihzeW50aCk7XG5cbiAgICB0aGlzLmNka0NvbmZpZyA9IHtcbiAgICAgIGFwcDogYG5weCB0cy1ub2RlIC0tcHJlZmVyLXRzLWV4dHMgJHtwYXRoLmpvaW4odGhpcy5zcmNkaXIsIHRoaXMuYXBwRW50cnlwb2ludCl9YCxcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMuY29udGV4dCkge1xuICAgICAgdGhpcy5jZGtDb25maWcuY29udGV4dCA9IHsgLi4ub3B0aW9ucy5jb250ZXh0IH07XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucmVxdWlyZUFwcHJvdmFsKSB7XG4gICAgICB0aGlzLmNka0NvbmZpZy5yZXF1aXJlQXBwcm92YWwgPSBvcHRpb25zLnJlcXVpcmVBcHByb3ZhbDtcbiAgICB9XG5cbiAgICB0aGlzLmdpdGlnbm9yZS5leGNsdWRlKCdjZGsub3V0LycpO1xuICAgIHRoaXMuZ2l0aWdub3JlLmV4Y2x1ZGUoJy5jZGsuc3RhZ2luZy8nKTtcbiAgICB0aGlzLmdpdGlnbm9yZS5leGNsdWRlKCcucGFyY2VsLWNhY2hlLycpO1xuXG4gICAgdGhpcy5ucG1pZ25vcmU/LmV4Y2x1ZGUoJ2Nkay5vdXQvJyk7XG4gICAgdGhpcy5ucG1pZ25vcmU/LmV4Y2x1ZGUoJy5jZGsuc3RhZ2luZy8nKTtcblxuICAgIGlmICh0aGlzLnRzY29uZmlnKSB7XG4gICAgICB0aGlzLnRzY29uZmlnLmV4Y2x1ZGUucHVzaCgnY2RrLm91dCcpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkRGV2RGVwcygndHMtbm9kZScpO1xuXG4gICAgbmV3IEpzb25GaWxlKHRoaXMsICdjZGsuanNvbicsIHtcbiAgICAgIG9iajogdGhpcy5jZGtDb25maWcsXG4gICAgfSk7XG5cbiAgICBpZiAob3B0aW9ucy5zYW1wbGVDb2RlID8/IHRydWUpIHtcbiAgICAgIG5ldyBTYW1wbGVDb2RlKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZENka0RlcGVuZGVuY3koLi4ubW9kdWxlczogc3RyaW5nW10pIHtcbiAgICB0aGlzLmFkZERlcHMoLi4ubW9kdWxlcy5tYXAobSA9PiB0aGlzLmZvcm1hdE1vZHVsZVNwZWMobSkpKTtcbiAgfVxuXG4gIHByaXZhdGUgZm9ybWF0TW9kdWxlU3BlYyhtb2R1bGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke21vZHVsZX1AJHt0aGlzLmNka1ZlcnNpb259YDtcbiAgfVxufVxuXG5jbGFzcyBTYW1wbGVDb2RlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSByZWFkb25seSBhcHBQcm9qZWN0OiBBd3NDZGtUeXBlU2NyaXB0QXBwO1xuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBBd3NDZGtUeXBlU2NyaXB0QXBwKSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG4gICAgdGhpcy5hcHBQcm9qZWN0ID0gcHJvamVjdDtcbiAgfVxuXG4gIHB1YmxpYyBzeW50aGVzaXplKCkge1xuICAgIGNvbnN0IG91dGRpciA9IHRoaXMucHJvamVjdC5vdXRkaXI7XG4gICAgY29uc3Qgc3JjZGlyID0gcGF0aC5qb2luKG91dGRpciwgdGhpcy5hcHBQcm9qZWN0LnNyY2Rpcik7XG4gICAgaWYgKGZzLnBhdGhFeGlzdHNTeW5jKHNyY2RpcikgJiYgZnMucmVhZGRpclN5bmMoc3JjZGlyKS5maWx0ZXIoeCA9PiB4LmVuZHNXaXRoKCcudHMnKSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzcmNDb2RlID0gYGltcG9ydCB7IEFwcCwgQ29uc3RydWN0LCBTdGFjaywgU3RhY2tQcm9wcyB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuXG5leHBvcnQgY2xhc3MgTXlTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IFN0YWNrUHJvcHMgPSB7fSkge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gZGVmaW5lIHJlc291cmNlcyBoZXJlLi4uXG4gIH1cbn1cblxuLy8gZm9yIGRldmVsb3BtZW50LCB1c2UgYWNjb3VudC9yZWdpb24gZnJvbSBjZGsgY2xpXG5jb25zdCBkZXZFbnYgPSB7XG4gIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4gIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfUkVHSU9OLFxufTtcblxuY29uc3QgYXBwID0gbmV3IEFwcCgpO1xuXG5uZXcgTXlTdGFjayhhcHAsICdteS1zdGFjay1kZXYnLCB7IGVudjogZGV2RW52IH0pO1xuLy8gbmV3IE15U3RhY2soYXBwLCAnbXktc3RhY2stcHJvZCcsIHsgZW52OiBwcm9kRW52IH0pO1xuXG5hcHAuc3ludGgoKTtgO1xuXG4gICAgZnMubWtkaXJwU3luYyhzcmNkaXIpO1xuICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHNyY2RpciwgdGhpcy5hcHBQcm9qZWN0LmFwcEVudHJ5cG9pbnQpLCBzcmNDb2RlKTtcblxuICAgIGNvbnN0IHRlc3RkaXIgPSBwYXRoLmpvaW4ob3V0ZGlyLCB0aGlzLmFwcFByb2plY3QudGVzdGRpcik7XG4gICAgaWYgKGZzLnBhdGhFeGlzdHNTeW5jKHRlc3RkaXIpICYmIGZzLnJlYWRkaXJTeW5jKHRlc3RkaXIpLmZpbHRlcih4ID0+IHguZW5kc1dpdGgoJy50cycpKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBhcHBFbnRyeXBvaW50TmFtZSA9IHBhdGguYmFzZW5hbWUodGhpcy5hcHBQcm9qZWN0LmFwcEVudHJ5cG9pbnQsICcudHMnKTtcbiAgICBjb25zdCB0ZXN0Q29kZSA9IGBpbXBvcnQgJ0Bhd3MtY2RrL2Fzc2VydC9qZXN0JztcbmltcG9ydCB7IEFwcCB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0IHsgTXlTdGFjayB9IGZyb20gJy4uL3NyYy8ke2FwcEVudHJ5cG9pbnROYW1lfSc7XG5cbnRlc3QoJ1NuYXBzaG90JywgKCkgPT4ge1xuICBjb25zdCBhcHAgPSBuZXcgQXBwKCk7XG4gIGNvbnN0IHN0YWNrID0gbmV3IE15U3RhY2soYXBwLCAndGVzdCcpO1xuXG4gIGV4cGVjdChzdGFjaykubm90LnRvSGF2ZVJlc291cmNlKCdBV1M6OlMzOjpCdWNrZXQnKTtcbiAgZXhwZWN0KGFwcC5zeW50aCgpLmdldFN0YWNrQXJ0aWZhY3Qoc3RhY2suYXJ0aWZhY3RJZCkudGVtcGxhdGUpLnRvTWF0Y2hTbmFwc2hvdCgpO1xufSk7YDtcblxuICAgIGZzLm1rZGlycFN5bmModGVzdGRpcik7XG4gICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4odGVzdGRpciwgYCR7YXBwRW50cnlwb2ludE5hbWV9LnRlc3QudHNgKSwgdGVzdENvZGUpO1xuICB9XG59XG4iXX0=