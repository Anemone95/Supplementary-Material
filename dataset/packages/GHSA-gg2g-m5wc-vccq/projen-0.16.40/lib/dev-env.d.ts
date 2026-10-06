import { Task } from './tasks';
/**
 * (experimental) Base options for configuring a container-based development environemnt.
 *
 * @experimental
 */
export interface DevEnvironmentOptions {
    /**
     * (experimental) A Docker image or Dockerfile for the container.
     *
     * @experimental
     */
    readonly dockerImage?: DevEnvironmentDockerImage;
    /**
     * (experimental) An array of tasks that should be run when the container starts.
     *
     * @experimental
     */
    readonly tasks?: Task[];
    /**
     * (experimental) An array of ports that should be exposed from the container.
     *
     * @experimental
     */
    readonly ports?: string[];
    /**
     * (experimental) An array of extension IDs that specify the extensions that should be installed inside the container when it is created.
     *
     * @experimental
     */
    readonly vscodeExtensions?: string[];
}
/**
 * (experimental) Options for specifying the Docker image of the container.
 *
 * @experimental
 */
export declare class DevEnvironmentDockerImage {
    /**
     * (experimental) A publicly available Docker image.
     *
     * @param image a Docker image.
     * @experimental
     * @example
     *
     * 'ubuntu:latest'
     */
    static fromImage(image: string): DevEnvironmentDockerImage;
    /**
     * (experimental) The relative path of a Dockerfile that defines the container contents.
     *
     * @param dockerFile a relative path.
     * @experimental
     * @example
     *
     * '.gitpod.Docker'
     */
    static fromFile(dockerFile: string): DevEnvironmentDockerImage;
    /**
     * (experimental) A publicly available Docker image.
     *
     * @experimental
     */
    readonly image?: string;
    /**
     * (experimental) The relative path of a Dockerfile that defines the container contents.
     *
     * @experimental
     */
    readonly dockerFile?: string;
    private constructor();
}
/**
 * (experimental) Abstract interface for container-based development environments, such as Gitpod and GitHub Codespaces.
 *
 * @experimental
 */
export interface IDevEnvironment {
    /**
     * (experimental) Add a custom Docker image or Dockerfile for the container.
     *
     * @param image The Docker image.
     * @experimental
     */
    addDockerImage(image: DevEnvironmentDockerImage): void;
    /**
     * (experimental) Adds tasks to run when the container starts.
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
}
