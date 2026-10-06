import { Component } from './component';
import { GithubWorkflow } from './github';
import { Project } from './project';
/**
 * (experimental) Options for `Publisher`.
 *
 * @experimental
 */
export interface PublisherOptions {
    /**
     * (experimental) The github workflow to add release jobs to.
     *
     * @experimental
     */
    readonly workflow: GithubWorkflow;
    /**
     * (experimental) The job ID that produces the build artifacts.
     *
     * All publish jobs will take a dependency on this job.
     *
     * @experimental
     */
    readonly buildJobId: string;
    /**
     * (experimental) The name of the artifact to download (e.g. `dist`).
     *
     * The artifact is expected to include a subdirectory for each release target:
     * `go` (GitHub), `dotnet` (NuGet), `java` (Maven), `js` (npm), `python`
     * (PyPI).
     *
     * @see https://github.com/aws/jsii-release
     * @experimental
     */
    readonly artifactName: string;
    /**
     * (experimental) Version requirement for `jsii-release`.
     *
     * @default "latest"
     * @experimental
     */
    readonly jsiiReleaseVersion?: string;
}
/**
 * (experimental) Implements GitHub jobs for publishing modules to package managers.
 *
 * kw
 * Under the hood, it uses https://github.com/aws/jsii-release
 *
 * @experimental
 */
export declare class Publisher extends Component {
    /**
     * @experimental
     */
    readonly workflow: GithubWorkflow;
    /**
     * @experimental
     */
    readonly buildJobId: string;
    /**
     * @experimental
     */
    readonly artifactName: string;
    /**
     * @experimental
     */
    readonly jsiiReleaseVersion: string;
    /**
     * @experimental
     */
    constructor(project: Project, options: PublisherOptions);
    /**
     * (experimental) Publishes artifacts from `js/**` to npm.
     *
     * @param options Options.
     * @experimental
     */
    publishToNpm(options: JsiiReleaseNpm): void;
    /**
     * (experimental) Publishes artifacts from `dotnet/**` to NuGet Gallary.
     *
     * @param options Options.
     * @experimental
     */
    publishToNuget(options: JsiiReleaseNuget): void;
    /**
     * (experimental) Publishes artifacts from `java/**` to Maven.
     *
     * @param options Options.
     * @experimental
     */
    publishToMaven(options: JsiiReleaseMaven): void;
    /**
     * (experimental) Publishes wheel artifacts from `python` to PyPI.
     *
     * @param options Options.
     * @experimental
     */
    publishToPyPi(options: JsiiReleasePyPi): void;
    /**
     * (experimental) Adds a go publishing job.
     *
     * @param options Options.
     * @experimental
     */
    publishToGo(options: JsiiReleaseGo): void;
    private renderJsiiReleaseCommand;
    private renderDownloadArtifactStep;
}
/**
 * (experimental) Options for npm release.
 *
 * @experimental
 */
export interface JsiiReleaseNpm {
    /**
     * (experimental) Tags can be used to provide an alias instead of version numbers.
     *
     * For example, a project might choose to have multiple streams of development
     * and use a different tag for each stream, e.g., stable, beta, dev, canary.
     *
     * By default, the `latest` tag is used by npm to identify the current version
     * of a package, and `npm install <pkg>` (without any `@<version>` or `@<tag>`
     * specifier) installs the latest tag. Typically, projects only use the
     * `latest` tag for stable release versions, and use other tags for unstable
     * versions such as prereleases.
     *
     * The `next` tag is used by some projects to identify the upcoming version.
     *
     * @default "latest"
     * @experimental
     */
    readonly distTag?: string;
    /**
     * (experimental) The domain name of the npm package registry.
     *
     * @default "registry.npmjs.org"
     * @experimental
     */
    readonly registry?: string;
    /**
     * (experimental) GitHub secret which contains the NPM token to use when publishing packages.
     *
     * @default "NPM_TOKEN"
     * @experimental
     */
    readonly npmTokenSecret?: string;
}
/**
 * (experimental) Options for PyPI release.
 *
 * @experimental
 */
export interface JsiiReleasePyPi {
    /**
     * (experimental) The registry url to use when releasing packages.
     *
     * @default - twine default
     * @experimental
     */
    readonly twineRegistryUrl?: string;
    /**
     * (experimental) The GitHub secret which contains PyPI user name.
     *
     * @default "TWINE_USERNAME"
     * @experimental
     */
    readonly twineUsernameSecret?: string;
    /**
     * (experimental) The GitHub secret which contains PyPI password.
     *
     * @default "TWINE_PASSWORD"
     * @experimental
     */
    readonly twinePasswordSecret?: string;
}
/**
 * (experimental) Options for NuGet releases.
 *
 * @experimental
 */
export interface JsiiReleaseNuget {
    /**
     * (experimental) GitHub secret which contains the API key for NuGet.
     *
     * @default "NUGET_API_KEY"
     * @experimental
     */
    readonly nugetApiKeySecret?: string;
}
/**
 * (experimental) Options for Maven releases.
 *
 * @experimental
 */
export interface JsiiReleaseMaven {
    /**
     * (experimental) Used in maven settings for credential lookup (e.g. use github when publishing to GitHub).
     *
     * @default "ossrh" Defaults to Maven Central.
     * @experimental
     */
    readonly mavenServerId?: string;
    /**
     * (experimental) Deployment repository when not deploying to Maven Central.
     *
     * @default - not set
     * @experimental
     */
    readonly mavenRepositoryUrl?: string;
    /**
     * (experimental) GitHub secret name which contains the GPG private key or file that includes it.
     *
     * This is used to sign your Maven
     * packages. See instructions.
     *
     * @default "MAVEN_GPG_PRIVATE_KEY"
     * @see https://github.com/aws/jsii-release#maven
     * @experimental
     */
    readonly mavenGpgPrivateKeySecret?: string;
    /**
     * (experimental) GitHub secret name which contains the GPG private key or file that includes it.
     *
     * This is used to sign your Maven packages. See instructions.
     *
     * @default "MAVEN_GPG_PRIVATE_KEY_PASSPHRASE"
     * @see https://github.com/aws/jsii-release#maven
     * @experimental
     */
    readonly mavenGpgPrivateKeyPassphrase?: string;
    /**
     * (experimental) GitHub secret name which contains the Username for maven repository.
     *
     * For Maven Central, you will need to Create JIRA account and then request a
     * new project (see links).
     *
     * @default "MAVEN_USERNAME"
     * @see https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134
     * @experimental
     */
    readonly mavenUsername?: string;
    /**
     * (experimental) GitHub secret name which contains the Password for maven repository.
     *
     * For Maven Central, you will need to Create JIRA account and then request a
     * new project (see links).
     *
     * @default "MAVEN_PASSWORD"
     * @see https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134
     * @experimental
     */
    readonly mavenPassword?: string;
    /**
     * (experimental) GitHub secret name which contains the Maven Central (sonatype) staging profile ID (e.g. 68a05363083174). Staging profile ID can be found in the URL of the "Releases" staging profile under "Staging Profiles" in https://oss.sonatype.org (e.g. https://oss.sonatype.org/#stagingProfiles;11a33451234521.
     *
     * @default "MAVEN_STAGING_PROFILE_ID"
     * @experimental
     */
    readonly mavenStagingProfileId?: string;
}
/**
 * (experimental) Options for Go releases.
 *
 * @experimental
 */
export interface JsiiReleaseGo {
    /**
     * (experimental) The name of the secret that includes a personal GitHub access token used to push to the GitHub repository.
     *
     * @default "GO_GITHUB_TOKEN"
     * @experimental
     */
    readonly githubTokenSecret?: string;
    /**
     * (experimental) GitHub repository to push to.
     *
     * @default - derived from `moduleName`
     * @experimental
     */
    readonly githubRepo?: string;
    /**
     * (experimental) Branch to push to.
     *
     * @default "main"
     * @experimental
     */
    readonly gitBranch?: string;
    /**
     * (experimental) The user name to use for the release git commit.
     *
     * @default "GitHub Actions"
     * @experimental
     */
    readonly gitUserName?: string;
    /**
     * (experimental) The email to use in the release git commit.
     *
     * @default "github-actions
     * @experimental
     * @github .com"
     */
    readonly gitUserEmail?: string;
    /**
     * (experimental) The commit message.
     *
     * @default "chore(release): $VERSION"
     * @experimental
     */
    readonly gitCommitMessage?: string;
}
