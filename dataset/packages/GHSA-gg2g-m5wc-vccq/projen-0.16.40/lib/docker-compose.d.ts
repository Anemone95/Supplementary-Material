import { Component } from './component';
import { Project } from './project';
/**
 * (experimental) Props for DockerCompose.
 *
 * @experimental
 */
export interface DockerComposeProps {
    /**
     * (experimental) A name to add to the docker-compose.yml filename.
     *
     * @default - no name is added
     * @experimental
     * @example
     *
     * 'myname' yields 'docker-compose.myname.yml'
     */
    readonly nameSuffix?: string;
    /**
     * (experimental) Docker Compose schema version do be used.
     *
     * @default 3.3
     * @experimental
     */
    readonly schemaVersion?: string;
    /**
     * (experimental) Service descriptions.
     *
     * @experimental
     */
    readonly services?: Record<string, DockerComposeServiceDescription>;
}
/**
 * (experimental) Options for port mappings.
 *
 * @experimental
 */
export interface DockerComposePortMappingOptions {
    /**
     * (experimental) Port mapping protocol.
     *
     * @default DockerComposeProtocol.TCP
     * @experimental
     */
    readonly protocol?: DockerComposeProtocol;
}
/**
 * (experimental) Create a docker-compose YAML file.
 *
 * @experimental
 */
export declare class DockerCompose extends Component {
    /**
     * (experimental) Depends on a service name.
     *
     * @experimental
     */
    static serviceName(serviceName: string): IDockerComposeServiceName;
    /**
     * (experimental) Create a port mapping.
     *
     * @param publishedPort Published port number.
     * @param targetPort Container's port number.
     * @param options Port mapping options.
     * @experimental
     */
    static portMapping(publishedPort: number, targetPort: number, options?: DockerComposePortMappingOptions): DockerComposeServicePort;
    /**
     * (experimental) Create a bind volume that binds a host path to the target path in the container.
     *
     * @param sourcePath Host path name.
     * @param targetPath Target path name.
     * @experimental
     */
    static bindVolume(sourcePath: string, targetPath: string): IDockerComposeVolumeBinding;
    /**
     * (experimental) Create a named volume and mount it to the target path.
     *
     * If you use this
     * named volume in several services, the volume will be shared. In this
     * case, the volume configuration of the first-provided options are used.
     *
     * @param volumeName Name of the volume.
     * @param targetPath Target path.
     * @param options volume configuration (default: docker compose defaults).
     * @experimental
     */
    static namedVolume(volumeName: string, targetPath: string, options?: DockerComposeVolumeConfig): IDockerComposeVolumeBinding;
    private readonly services;
    private readonly version;
    /**
     * @experimental
     */
    constructor(project: Project, props?: DockerComposeProps);
    /**
     * (experimental) Add a service to the docker-compose file.
     *
     * @param serviceName name of the service.
     * @param description a service description.
     * @experimental
     */
    addService(serviceName: string, description: DockerComposeServiceDescription): DockerComposeService;
    /**
     * @internal
     */
    _synthesizeDockerCompose(): object;
}
/**
 * (experimental) An interface providing the name of a docker compose service.
 *
 * @experimental
 */
export interface IDockerComposeServiceName {
    /**
     * (experimental) The name of the docker compose service.
     *
     * @experimental
     */
    readonly serviceName: string;
}
/**
 * (experimental) Description of a docker-compose.yml service.
 *
 * @experimental
 */
export interface DockerComposeServiceDescription {
    /**
     * (experimental) Use a docker image.
     *
     * Note: You must specify either `build` or `image` key.
     *
     * @see imageBuild
     * @experimental
     */
    readonly image?: string;
    /**
     * (experimental) Build a docker image.
     *
     * Note: You must specify either `imageBuild` or `image` key.
     *
     * @see image
     * @experimental
     */
    readonly imageBuild?: DockerComposeBuild;
    /**
     * (experimental) Provide a command to the docker container.
     *
     * @default - use the container's default command
     * @experimental
     */
    readonly command?: string[];
    /**
     * (experimental) Names of other services this service depends on.
     *
     * @default - no dependencies
     * @experimental
     */
    readonly dependsOn?: IDockerComposeServiceName[];
    /**
     * (experimental) Mount some volumes into the service.
     *
     * Use one of the following to create volumes:
     *
     * @see DockerCompose.namedVolume() to create & mount a named volume
     * @experimental
     */
    readonly volumes?: IDockerComposeVolumeBinding[];
    /**
     * (experimental) Map some ports.
     *
     * @default - no ports are mapped
     * @experimental
     */
    readonly ports?: DockerComposeServicePort[];
    /**
     * (experimental) Add environment variables.
     *
     * @default - no environment variables are provided
     * @experimental
     */
    readonly environment?: Record<string, string>;
}
/**
 * (experimental) A docker-compose service.
 *
 * @experimental
 */
export declare class DockerComposeService implements IDockerComposeServiceName {
    /**
     * (experimental) Name of the service.
     *
     * @experimental
     */
    readonly serviceName: string;
    /**
     * (experimental) Docker image.
     *
     * @experimental
     */
    readonly image?: string;
    /**
     * (experimental) Docker image build instructions.
     *
     * @experimental
     */
    readonly imageBuild?: DockerComposeBuild;
    /**
     * (experimental) Command to run in the container.
     *
     * @experimental
     */
    readonly command?: string[];
    /**
     * (experimental) Other services that this service depends on.
     *
     * @experimental
     */
    readonly dependsOn: IDockerComposeServiceName[];
    /**
     * (experimental) Volumes mounted in the container.
     *
     * @experimental
     */
    readonly volumes: IDockerComposeVolumeBinding[];
    /**
     * (experimental) Published ports.
     *
     * @experimental
     */
    readonly ports: DockerComposeServicePort[];
    /**
     * (experimental) Environment variables.
     *
     * @experimental
     */
    readonly environment: Record<string, string>;
    /**
     * @experimental
     */
    constructor(serviceName: string, serviceDescription: DockerComposeServiceDescription);
    /**
     * (experimental) Add a port mapping.
     *
     * @param publishedPort Published port number.
     * @param targetPort Container's port number.
     * @param options Port mapping options.
     * @experimental
     */
    addPort(publishedPort: number, targetPort: number, options?: DockerComposePortMappingOptions): void;
    /**
     * (experimental) Add an environment variable.
     *
     * @param name environment variable name.
     * @param value value of the environment variable.
     * @experimental
     */
    addEnvironment(name: string, value: string): void;
    /**
     * (experimental) Make the service depend on another service.
     *
     * @experimental
     */
    addDependsOn(serviceName: IDockerComposeServiceName): void;
    /**
     * (experimental) Add a volume to the service.
     *
     * @experimental
     */
    addVolume(volume: IDockerComposeVolumeBinding): void;
}
/**
 * (experimental) A service port mapping.
 *
 * @experimental
 */
export interface DockerComposeServicePort {
    /**
     * (experimental) Published port number.
     *
     * @experimental
     */
    readonly published: number;
    /**
     * (experimental) Target port number.
     *
     * @experimental
     */
    readonly target: number;
    /**
     * (experimental) Network protocol.
     *
     * @experimental
     */
    readonly protocol: DockerComposeProtocol;
    /**
     * (experimental) Port mapping mode.
     *
     * @experimental
     */
    readonly mode: string;
}
/**
 * (experimental) Network protocol for port mapping.
 *
 * @experimental
 */
export declare enum DockerComposeProtocol {
    /**
     * (experimental) TCP protocol.
     *
     * @experimental
     */
    TCP = "tcp",
    /**
     * (experimental) UDP protocol.
     *
     * @experimental
     */
    UDP = "udp"
}
/**
 * (experimental) Build arguments for creating a docker image.
 *
 * @experimental
 */
export interface DockerComposeBuild {
    /**
     * (experimental) Docker build context directory.
     *
     * @experimental
     */
    readonly context: string;
    /**
     * (experimental) A dockerfile to build from.
     *
     * @default "Dockerfile"
     * @experimental
     */
    readonly dockerfile?: string;
    /**
     * (experimental) Build args.
     *
     * @default - none are provided
     * @experimental
     */
    readonly args?: Record<string, string>;
}
/**
 * (experimental) Volume configuration.
 *
 * @experimental
 */
export interface DockerComposeVolumeConfig {
    /**
     * (experimental) Driver to use for the volume.
     *
     * @default - value is not provided
     * @experimental
     */
    readonly driver?: string;
    /**
     * (experimental) Options to provide to the driver.
     *
     * @experimental
     */
    readonly driverOpts?: Record<string, string>;
    /**
     * (experimental) Set to true to indicate that the volume is externally created.
     *
     * @default - unset, indicating that docker-compose creates the volume
     * @experimental
     */
    readonly external?: boolean;
    /**
     * (experimental) Name of the volume for when the volume name isn't going to work in YAML.
     *
     * @default - unset, indicating that docker-compose creates volumes as usual
     * @experimental
     */
    readonly name?: string;
}
/**
 * (experimental) Volume binding information.
 *
 * @experimental
 */
export interface IDockerComposeVolumeBinding {
    /**
     * (experimental) Binds the requested volume to the docker-compose volume configuration and provide mounting instructions for synthesis.
     *
     * @param volumeConfig the volume configuration.
     * @returns mounting instructions for the service.
     * @experimental
     */
    bind(volumeConfig: IDockerComposeVolumeConfig): DockerComposeVolumeMount;
}
/**
 * (experimental) Storage for volume configuration.
 *
 * @experimental
 */
export interface IDockerComposeVolumeConfig {
    /**
     * (experimental) Add volume configuration to the repository.
     *
     * @experimental
     */
    addVolumeConfiguration(volumeName: string, configuration: DockerComposeVolumeConfig): void;
}
/**
 * (experimental) Service volume mounting information.
 *
 * @experimental
 */
export interface DockerComposeVolumeMount {
    /**
     * (experimental) Type of volume.
     *
     * @experimental
     */
    readonly type: string;
    /**
     * (experimental) Volume source.
     *
     * @experimental
     */
    readonly source: string;
    /**
     * (experimental) Volume target.
     *
     * @experimental
     */
    readonly target: string;
}
