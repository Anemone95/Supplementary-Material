import { Component } from '../component';
import { DevEnvironmentDockerImage, DevEnvironmentOptions, IDevEnvironment } from '../dev-env';
import { Project } from '../project';
import { Task } from '../tasks';
/**
 * (experimental) Constructor options for the DevContainer component.
 *
 * The default docker image used for GitHub Codespaces is defined here:
 *
 * @see https://github.com/microsoft/vscode-dev-containers/tree/master/containers/codespaces-linux
 * @experimental
 */
export interface DevContainerOptions extends DevEnvironmentOptions {
}
/**
 * (experimental) A development environment running VSCode in a container;
 *
 * used by GitHub
 * codespaces.
 *
 * @experimental
 */
export declare class DevContainer extends Component implements IDevEnvironment {
    private dockerImage;
    private readonly postCreateTasks;
    private readonly ports;
    private readonly vscodeExtensions;
    /**
     * (experimental) Direct access to the devcontainer configuration (escape hatch).
     *
     * @experimental
     */
    readonly config: any;
    /**
     * @experimental
     */
    constructor(project: Project, options?: DevContainerOptions);
    /**
     * (experimental) Add a custom Docker image or Dockerfile for the container.
     *
     * @experimental
     */
    addDockerImage(image: DevEnvironmentDockerImage): void;
    /**
     * (experimental) Adds tasks to run when the container starts.
     *
     * Tasks will be run in sequence.
     *
     * @param tasks The new tasks.
     * @experimental
     */
    addTasks(...tasks: Task[]): void;
    /**
     * (experimental) Adds ports that should be exposed (forwarded) from the container.
     *
     * @param ports The new ports.
     * @experimental
     */
    addPorts(...ports: string[]): void;
    /**
     * (experimental) Adds a list of VSCode extensions that should be automatically installed in the container.
     *
     * @param extensions The extension IDs.
     * @experimental
     */
    addVscodeExtensions(...extensions: string[]): void;
    private renderTasks;
}
