"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructLibraryAws = exports.AwsCdkConstructLibrary = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const construct_lib_1 = require("./construct-lib");
/**
 * (experimental) AWS CDK construct library project.
 *
 * A multi-language (jsii) construct library which vends constructs designed to
 * use within the AWS CDK with a friendly workflow and automatic publishing to
 * the construct catalog.
 *
 * ```ts
 * const project = new ConstructLibraryAws({
 *    name: 'cdk-watchful',
 *    description: 'Watching your CDK apps since 2019',
 *    jsiiVersion: Semver.caret('1.7.0'),
 *    authorName: 'Elad Ben-Israel',
 *    authorEmail: 'elad.benisrael@gmail.com',
 *    repository: 'https://github.com/eladb/cdk-watchful.git',
 *    keywords: [
 *      "cloudwatch",
 *      "monitoring"
 *    ],
 *
 *    catalog: {
 *      twitter: 'emeshbi'
 *    },
 *
 *    // creates PRs for projen upgrades
 *    projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
 *
 *    cdkVersion: '1.54.0',
 *    cdkDependencies: [
 *      "@aws-cdk/aws-apigateway",
 *      "@aws-cdk/aws-cloudwatch",
 *      "@aws-cdk/aws-cloudwatch-actions",
 *      "@aws-cdk/aws-dynamodb",
 *      "@aws-cdk/aws-ecs",
 *      "@aws-cdk/aws-ecs-patterns",
 *      "@aws-cdk/aws-elasticloadbalancingv2",
 *      "@aws-cdk/aws-events",
 *      "@aws-cdk/aws-events-targets",
 *      "@aws-cdk/aws-lambda",
 *      "@aws-cdk/aws-rds",
 *      "@aws-cdk/aws-sns",
 *      "@aws-cdk/aws-sns-subscriptions",
 *      "@aws-cdk/aws-sqs",
 *      "@aws-cdk/core"
 *    ],
 *    devDependencies: {
 *      "aws-sdk": Semver.caret("2.708.0")
 *    },
 *
 *    // jsii publishing
 *
 *    java: {
 *      javaPackage: 'com.github.eladb.watchful',
 *      mavenGroupId: 'com.github.eladb',
 *      mavenArtifactId: 'cdk-watchful'
 *    },
 *    python: {
 *      distName: 'cdk-watchful',
 *      module: 'cdk_watchful'
 *    }
 * });
 *
 * project.synth();
 * ```
 *
 * @experimental
 * @pjid awscdk-construct
 */
class AwsCdkConstructLibrary extends construct_lib_1.ConstructLibrary {
    /**
     * @experimental
     */
    constructor(options) {
        var _c, _d, _e, _f;
        super({
            ...options,
            peerDependencyOptions: {
                pinnedDevDependency: false,
            },
        });
        this.version = options.cdkVersionPinning ? options.cdkVersion : `^${options.cdkVersion}`;
        this.cdkDependenciesAsDeps = (_c = options.cdkDependenciesAsDeps) !== null && _c !== void 0 ? _c : true;
        this.addPeerDeps('constructs@^3.2.27');
        if ((_d = options.cdkAssert) !== null && _d !== void 0 ? _d : true) {
            this.addDevDeps(this.formatModuleSpec('@aws-cdk/assert'));
        }
        this.addCdkDependencies(...(_e = options.cdkDependencies) !== null && _e !== void 0 ? _e : []);
        this.addCdkTestDependencies(...(_f = options.cdkTestDependencies) !== null && _f !== void 0 ? _f : []);
    }
    /**
     * (experimental) Adds CDK modules as runtime dependencies.
     *
     * Modules are currently by default added with a caret CDK version both as "dependencies"
     * and "peerDependencies". This is because currently npm would not
     * automatically install peer dependencies that are not declared as concerete
     * dependencies by the consumer, so this is a little npm "hack" so that
     * consumers will not need to depend on them directly if they don't interact
     * with them.
     * See `cdkDependenciesAsDeps` for changing the default behavior.
     *
     * @param deps names of cdk modules (e.g. `@aws-cdk/aws-lambda`).
     * @experimental
     */
    addCdkDependencies(...deps) {
        // this ugliness will go away in cdk v2.0
        this.addPeerDeps(...deps.map(m => this.formatModuleSpec(m)));
        if (this.cdkDependenciesAsDeps) {
            this.addDeps(...deps.map(m => this.formatModuleSpec(m)));
        }
        else {
            this.addDevDeps(...deps.map(m => this.formatModuleSpec(m)));
        }
    }
    /**
     * (experimental) Adds CDK modules as test dependencies.
     *
     * @param deps names of cdk modules (e.g. `@aws-cdk/aws-lambda`).
     * @experimental
     */
    addCdkTestDependencies(...deps) {
        this.addDevDeps(...deps.map(m => this.formatModuleSpec(m)));
    }
    formatModuleSpec(module) {
        return `${module}@${this.version}`;
    }
}
exports.AwsCdkConstructLibrary = AwsCdkConstructLibrary;
_a = JSII_RTTI_SYMBOL_1;
AwsCdkConstructLibrary[_a] = { fqn: "projen.AwsCdkConstructLibrary", version: "0.16.40" };
/**
 * @deprecated use `AwsCdkConstructLibrary`
 */
class ConstructLibraryAws extends AwsCdkConstructLibrary {
}
exports.ConstructLibraryAws = ConstructLibraryAws;
_b = JSII_RTTI_SYMBOL_1;
ConstructLibraryAws[_b] = { fqn: "projen.ConstructLibraryAws", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzY2RrLWNvbnN0cnVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hd3NjZGstY29uc3RydWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsbURBQTRFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5SDVFLE1BQWEsc0JBQXVCLFNBQVEsZ0NBQWdCOzs7O0lBVzFELFlBQVksT0FBc0M7O1FBQ2hELEtBQUssQ0FBQztZQUNKLEdBQUcsT0FBTztZQUNWLHFCQUFxQixFQUFFO2dCQUNyQixtQkFBbUIsRUFBRSxLQUFLO2FBQzNCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3pGLElBQUksQ0FBQyxxQkFBcUIsU0FBRyxPQUFPLENBQUMscUJBQXFCLG1DQUFJLElBQUksQ0FBQztRQUVuRSxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFFdkMsVUFBSSxPQUFPLENBQUMsU0FBUyxtQ0FBSSxJQUFJLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1NBQzNEO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQUcsT0FBTyxDQUFDLGVBQWUsbUNBQUksRUFBRSxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQUcsT0FBTyxDQUFDLG1CQUFtQixtQ0FBSSxFQUFFLENBQUMsQ0FBQztJQUNwRSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7SUFlTSxrQkFBa0IsQ0FBQyxHQUFHLElBQWM7UUFDekMseUNBQXlDO1FBQ3pDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3RCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUQ7YUFBTTtZQUNMLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM3RDtJQUNILENBQUM7Ozs7Ozs7SUFPTSxzQkFBc0IsQ0FBQyxHQUFHLElBQWM7UUFDN0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxNQUFjO1FBQ3JDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3JDLENBQUM7O0FBbkVILHdEQW9FQzs7Ozs7O0FBTUQsTUFBYSxtQkFBb0IsU0FBUSxzQkFBc0I7O0FBQS9ELGtEQUFtRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdExpYnJhcnksIENvbnN0cnVjdExpYnJhcnlPcHRpb25zIH0gZnJvbSAnLi9jb25zdHJ1Y3QtbGliJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBpbnRlcmZhY2UgQXdzQ2RrQ29uc3RydWN0TGlicmFyeU9wdGlvbnMgZXh0ZW5kcyBDb25zdHJ1Y3RMaWJyYXJ5T3B0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgY2RrVmVyc2lvbjogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgY2RrVmVyc2lvblBpbm5pbmc/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgY2RrRGVwZW5kZW5jaWVzPzogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGNka0RlcGVuZGVuY2llc0FzRGVwcz86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBjZGtBc3NlcnQ/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgY2RrVGVzdERlcGVuZGVuY2llcz86IHN0cmluZ1tdO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBBd3NDZGtDb25zdHJ1Y3RMaWJyYXJ5IGV4dGVuZHMgQ29uc3RydWN0TGlicmFyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHZlcnNpb246IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBjZGtEZXBlbmRlbmNpZXNBc0RlcHM6IGJvb2xlYW5cblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBBd3NDZGtDb25zdHJ1Y3RMaWJyYXJ5T3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBwZWVyRGVwZW5kZW5jeU9wdGlvbnM6IHtcbiAgICAgICAgcGlubmVkRGV2RGVwZW5kZW5jeTogZmFsc2UsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy52ZXJzaW9uID0gb3B0aW9ucy5jZGtWZXJzaW9uUGlubmluZyA/IG9wdGlvbnMuY2RrVmVyc2lvbiA6IGBeJHtvcHRpb25zLmNka1ZlcnNpb259YDtcbiAgICB0aGlzLmNka0RlcGVuZGVuY2llc0FzRGVwcyA9IG9wdGlvbnMuY2RrRGVwZW5kZW5jaWVzQXNEZXBzID8/IHRydWU7XG5cbiAgICB0aGlzLmFkZFBlZXJEZXBzKCdjb25zdHJ1Y3RzQF4zLjIuMjcnKTtcblxuICAgIGlmIChvcHRpb25zLmNka0Fzc2VydCA/PyB0cnVlKSB7XG4gICAgICB0aGlzLmFkZERldkRlcHModGhpcy5mb3JtYXRNb2R1bGVTcGVjKCdAYXdzLWNkay9hc3NlcnQnKSk7XG4gICAgfVxuXG4gICAgdGhpcy5hZGRDZGtEZXBlbmRlbmNpZXMoLi4ub3B0aW9ucy5jZGtEZXBlbmRlbmNpZXMgPz8gW10pO1xuICAgIHRoaXMuYWRkQ2RrVGVzdERlcGVuZGVuY2llcyguLi5vcHRpb25zLmNka1Rlc3REZXBlbmRlbmNpZXMgPz8gW10pO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGRDZGtEZXBlbmRlbmNpZXMoLi4uZGVwczogc3RyaW5nW10pIHtcbiAgICAvLyB0aGlzIHVnbGluZXNzIHdpbGwgZ28gYXdheSBpbiBjZGsgdjIuMFxuICAgIHRoaXMuYWRkUGVlckRlcHMoLi4uZGVwcy5tYXAobSA9PiB0aGlzLmZvcm1hdE1vZHVsZVNwZWMobSkpKTtcblxuICAgIGlmICh0aGlzLmNka0RlcGVuZGVuY2llc0FzRGVwcykge1xuICAgICAgdGhpcy5hZGREZXBzKC4uLmRlcHMubWFwKG0gPT4gdGhpcy5mb3JtYXRNb2R1bGVTcGVjKG0pKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkRGV2RGVwcyguLi5kZXBzLm1hcChtID0+IHRoaXMuZm9ybWF0TW9kdWxlU3BlYyhtKSkpO1xuICAgIH1cbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkQ2RrVGVzdERlcGVuZGVuY2llcyguLi5kZXBzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuYWRkRGV2RGVwcyguLi5kZXBzLm1hcChtID0+IHRoaXMuZm9ybWF0TW9kdWxlU3BlYyhtKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3JtYXRNb2R1bGVTcGVjKG1vZHVsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7bW9kdWxlfUAke3RoaXMudmVyc2lvbn1gO1xuICB9XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBDb25zdHJ1Y3RMaWJyYXJ5QXdzT3B0aW9ucyBleHRlbmRzIEF3c0Nka0NvbnN0cnVjdExpYnJhcnlPcHRpb25zIHsgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIENvbnN0cnVjdExpYnJhcnlBd3MgZXh0ZW5kcyBBd3NDZGtDb25zdHJ1Y3RMaWJyYXJ5IHsgfVxuIl19