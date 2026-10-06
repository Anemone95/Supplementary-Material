"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerComposeProtocol = exports.DockerComposeService = exports.DockerCompose = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("./component");
const util_1 = require("./util");
const yaml_1 = require("./yaml");
/**
 * (experimental) Create a docker-compose YAML file.
 *
 * @experimental
 */
class DockerCompose extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, props) {
        var _c;
        super(project);
        const nameSuffix = (props === null || props === void 0 ? void 0 : props.nameSuffix) ? `${props.nameSuffix}.yml` : 'yml';
        new yaml_1.YamlFile(project, `docker-compose.${nameSuffix}`, {
            committed: true,
            readonly: true,
            obj: () => this._synthesizeDockerCompose(),
        });
        if ((props === null || props === void 0 ? void 0 : props.schemaVersion) && !parseFloat(props.schemaVersion)) {
            throw Error('Version tag needs to be a number');
        }
        this.version = (props === null || props === void 0 ? void 0 : props.schemaVersion) ? props.schemaVersion : '3.3';
        this.services = {};
        // Add the services provided via the constructor argument.
        const initialServices = (_c = props === null || props === void 0 ? void 0 : props.services) !== null && _c !== void 0 ? _c : {};
        for (const [name, serviceDescription] of Object.entries(initialServices)) {
            this.addService(name, serviceDescription);
        }
    }
    /**
     * (experimental) Depends on a service name.
     *
     * @experimental
     */
    static serviceName(serviceName) {
        return {
            serviceName,
        };
    }
    /**
     * (experimental) Create a port mapping.
     *
     * @param publishedPort Published port number.
     * @param targetPort Container's port number.
     * @param options Port mapping options.
     * @experimental
     */
    static portMapping(publishedPort, targetPort, options) {
        var _c;
        const protocol = (_c = options === null || options === void 0 ? void 0 : options.protocol) !== null && _c !== void 0 ? _c : DockerComposeProtocol.TCP;
        return {
            target: targetPort,
            published: publishedPort,
            protocol: protocol,
            mode: 'host',
        };
    }
    /**
     * (experimental) Create a bind volume that binds a host path to the target path in the container.
     *
     * @param sourcePath Host path name.
     * @param targetPath Target path name.
     * @experimental
     */
    static bindVolume(sourcePath, targetPath) {
        return {
            bind(_volumeInfo) {
                return {
                    type: 'bind',
                    source: sourcePath,
                    target: targetPath,
                };
            },
        };
    }
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
    static namedVolume(volumeName, targetPath, options = {}) {
        return {
            bind(volumeInfo) {
                volumeInfo.addVolumeConfiguration(volumeName, options);
                return {
                    type: 'volume',
                    source: volumeName,
                    target: targetPath,
                };
            },
        };
    }
    /**
     * (experimental) Add a service to the docker-compose file.
     *
     * @param serviceName name of the service.
     * @param description a service description.
     * @experimental
     */
    addService(serviceName, description) {
        const service = new DockerComposeService(serviceName, description);
        this.services[serviceName] = service;
        return service;
    }
    /**
     * @internal
     */
    _synthesizeDockerCompose() {
        if (Object.keys(this.services).length === 0) {
            throw new Error('DockerCompose requires at least one service');
        }
        return renderDockerComposeFile(this.services, this.version);
    }
}
exports.DockerCompose = DockerCompose;
_a = JSII_RTTI_SYMBOL_1;
DockerCompose[_a] = { fqn: "projen.DockerCompose", version: "0.16.40" };
/**
 * (experimental) A docker-compose service.
 *
 * @experimental
 */
class DockerComposeService {
    /**
     * @experimental
     */
    constructor(serviceName, serviceDescription) {
        var _c, _d, _e, _f;
        if ((!serviceDescription.imageBuild && !serviceDescription.image)
            || (serviceDescription.imageBuild && serviceDescription.image)) {
            throw new Error(`A service ${serviceName} requires exactly one of a \`imageBuild\` or \`image\` key`);
        }
        this.serviceName = serviceName;
        this.command = serviceDescription.command;
        this.image = serviceDescription.image;
        this.imageBuild = serviceDescription.imageBuild;
        this.dependsOn = (_c = serviceDescription.dependsOn) !== null && _c !== void 0 ? _c : [];
        this.volumes = (_d = serviceDescription.volumes) !== null && _d !== void 0 ? _d : [];
        this.ports = (_e = serviceDescription.ports) !== null && _e !== void 0 ? _e : [];
        this.environment = (_f = serviceDescription.environment) !== null && _f !== void 0 ? _f : {};
    }
    /**
     * (experimental) Add a port mapping.
     *
     * @param publishedPort Published port number.
     * @param targetPort Container's port number.
     * @param options Port mapping options.
     * @experimental
     */
    addPort(publishedPort, targetPort, options) {
        var _c;
        (_c = this.ports) === null || _c === void 0 ? void 0 : _c.push(DockerCompose.portMapping(publishedPort, targetPort, options));
    }
    /**
     * (experimental) Add an environment variable.
     *
     * @param name environment variable name.
     * @param value value of the environment variable.
     * @experimental
     */
    addEnvironment(name, value) {
        this.environment[name] = value;
    }
    /**
     * (experimental) Make the service depend on another service.
     *
     * @experimental
     */
    addDependsOn(serviceName) {
        this.dependsOn.push(serviceName);
    }
    /**
     * (experimental) Add a volume to the service.
     *
     * @experimental
     */
    addVolume(volume) {
        this.volumes.push(volume);
    }
}
exports.DockerComposeService = DockerComposeService;
_b = JSII_RTTI_SYMBOL_1;
DockerComposeService[_b] = { fqn: "projen.DockerComposeService", version: "0.16.40" };
/**
 * (experimental) Network protocol for port mapping.
 *
 * @experimental
 */
var DockerComposeProtocol;
(function (DockerComposeProtocol) {
    DockerComposeProtocol["TCP"] = "tcp";
    DockerComposeProtocol["UDP"] = "udp";
})(DockerComposeProtocol = exports.DockerComposeProtocol || (exports.DockerComposeProtocol = {}));
function renderDockerComposeFile(serviceDescriptions, version) {
    var _c, _d;
    // Record volume configuration
    const volumeConfig = {};
    const volumeInfo = {
        addVolumeConfiguration(volumeName, configuration) {
            if (!volumeConfig[volumeName]) {
                // First volume configuration takes precedence.
                volumeConfig[volumeName] = configuration;
            }
        },
    };
    // Render service configuration
    const services = {};
    for (const [serviceName, serviceDescription] of Object.entries(serviceDescriptions !== null && serviceDescriptions !== void 0 ? serviceDescriptions : {})) {
        // Resolve the names of each dependency and check that they exist.
        // Note: They may not exist if the user made a mistake when referencing a
        // service by name via `DockerCompose.serviceName()`.
        // @see DockerCompose.serviceName
        const dependsOn = Array();
        for (const dependsOnServiceName of (_c = serviceDescription.dependsOn) !== null && _c !== void 0 ? _c : []) {
            const resolvedServiceName = dependsOnServiceName.serviceName;
            if (resolvedServiceName === serviceName) {
                throw new Error(`Service ${serviceName} cannot depend on itself`);
            }
            if (!serviceDescriptions[resolvedServiceName]) {
                throw new Error(`Unable to resolve service named ${resolvedServiceName} for ${serviceName}`);
            }
            dependsOn.push(resolvedServiceName);
        }
        // Give each volume binding a chance to bind any necessary volume
        // configuration and provide volume mount information for the service.
        const volumes = [];
        for (const volumeBinding of (_d = serviceDescription.volumes) !== null && _d !== void 0 ? _d : []) {
            volumes.push(volumeBinding.bind(volumeInfo));
        }
        // Create and store the service configuration, taking care not to create
        // object members with undefined values.
        services[serviceName] = {
            ...getObjectWithKeyAndValueIfValueIsDefined('image', serviceDescription.image),
            ...getObjectWithKeyAndValueIfValueIsDefined('build', serviceDescription.imageBuild),
            ...getObjectWithKeyAndValueIfValueIsDefined('command', serviceDescription.command),
            ...(Object.keys(serviceDescription.environment).length > 0 ? { environment: serviceDescription.environment } : {}),
            ...(serviceDescription.ports.length > 0 ? { ports: serviceDescription.ports } : {}),
            ...(dependsOn.length > 0 ? { dependsOn } : {}),
            ...(volumes.length > 0 ? { volumes } : {}),
        };
    }
    // Explicit with the type here because the decamelize step after this wipes
    // out types.
    const input = {
        version,
        services,
        ...(Object.keys(volumeConfig).length > 0 ? { volumes: volumeConfig } : {}),
    };
    // Change most keys to snake case.
    return util_1.decamelizeKeysRecursively(input, {
        shouldDecamelize: shouldDecamelizeDockerComposeKey,
        separator: '_',
    });
}
/**
 * Returns `{ [key]: value }` if `value` is defined, otherwise returns `{}` so
 * that object spreading can be used to generate a peculiar interface.
 * @param key
 * @param value
 */
function getObjectWithKeyAndValueIfValueIsDefined(key, value) {
    return value !== undefined ? { [key]: value } : {};
}
/**
 * Determines whether the key at the given path should be decamelized.
 * Largely, all keys should be snake cased. But, there are some
 * exceptions for user-provided names for services, volumes, and
 * environment variables.
 *
 * @param path
 */
function shouldDecamelizeDockerComposeKey(path) {
    const poundPath = path.join('#');
    // Does not decamelize user's names.
    // services.namehere:
    // volumes.namehere:
    if (/^(services|volumes)#[^#]+$/.test(poundPath)) {
        return false;
    }
    // Does not decamelize environment variables
    // services.namehere.environment.*
    if (/^services#[^#]+#environment#/.test(poundPath)) {
        return false;
    }
    // Does not decamelize build arguments
    // services.namehere.build.args.*
    if (/^services#[^#]+#build#args#/.test(poundPath)) {
        return false;
    }
    // Otherwise, let it all decamelize.
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9ja2VyLWNvbXBvc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZG9ja2VyLWNvbXBvc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FBd0M7QUFFeEMsaUNBQW1EO0FBQ25ELGlDQUFrQzs7Ozs7O0FBdUNsQyxNQUFhLGFBQWMsU0FBUSxxQkFBUzs7OztJQXNFMUMsWUFBWSxPQUFnQixFQUFFLEtBQTBCOztRQUN0RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFZixNQUFNLFVBQVUsR0FBRyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBTSxDQUFDLFVBQVUsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDMUUsSUFBSSxlQUFRLENBQUMsT0FBTyxFQUFFLGtCQUFrQixVQUFVLEVBQUUsRUFBRTtZQUNwRCxTQUFTLEVBQUUsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJO1lBQ2QsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtTQUMzQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLGFBQWEsS0FBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDNUQsTUFBTSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztTQUNqRDtRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsYUFBYSxFQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDbEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbkIsMERBQTBEO1FBQzFELE1BQU0sZUFBZSxTQUFHLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtB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ZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50JztcbmltcG9ydCB7IFByb2plY3QgfSBmcm9tICcuL3Byb2plY3QnO1xuaW1wb3J0IHsgZGVjYW1lbGl6ZUtleXNSZWN1cnNpdmVseSB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBZYW1sRmlsZSB9IGZyb20gJy4veWFtbCc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIERvY2tlckNvbXBvc2VQcm9wcyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IG5hbWVTdWZmaXg/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzY2hlbWFWZXJzaW9uPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzZXJ2aWNlcz86IFJlY29yZDxzdHJpbmcsIERvY2tlckNvbXBvc2VTZXJ2aWNlRGVzY3JpcHRpb24+O1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIERvY2tlckNvbXBvc2VQb3J0TWFwcGluZ09wdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBwcm90b2NvbD86IERvY2tlckNvbXBvc2VQcm90b2NvbDtcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgRG9ja2VyQ29tcG9zZSBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHN0YXRpYyBzZXJ2aWNlTmFtZShzZXJ2aWNlTmFtZTogc3RyaW5nKTogSURvY2tlckNvbXBvc2VTZXJ2aWNlTmFtZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlcnZpY2VOYW1lLFxuICAgIH07XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBzdGF0aWMgcG9ydE1hcHBpbmcocHVibGlzaGVkUG9ydDogbnVtYmVyLCB0YXJnZXRQb3J0OiBudW1iZXIsIG9wdGlvbnM/OiBEb2NrZXJDb21wb3NlUG9ydE1hcHBpbmdPcHRpb25zKTogRG9ja2VyQ29tcG9zZVNlcnZpY2VQb3J0IHtcbiAgICBjb25zdCBwcm90b2NvbCA9IG9wdGlvbnM/LnByb3RvY29sID8/IERvY2tlckNvbXBvc2VQcm90b2NvbC5UQ1A7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGFyZ2V0OiB0YXJnZXRQb3J0LFxuICAgICAgcHVibGlzaGVkOiBwdWJsaXNoZWRQb3J0LFxuICAgICAgcHJvdG9jb2w6IHByb3RvY29sLFxuICAgICAgbW9kZTogJ2hvc3QnLFxuICAgIH07XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBzdGF0aWMgYmluZFZvbHVtZShzb3VyY2VQYXRoOiBzdHJpbmcsIHRhcmdldFBhdGg6IHN0cmluZyk6IElEb2NrZXJDb21wb3NlVm9sdW1lQmluZGluZyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJpbmQoX3ZvbHVtZUluZm86IElEb2NrZXJDb21wb3NlVm9sdW1lQ29uZmlnKTogRG9ja2VyQ29tcG9zZVZvbHVtZU1vdW50IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAnYmluZCcsXG4gICAgICAgICAgc291cmNlOiBzb3VyY2VQYXRoLFxuICAgICAgICAgIHRhcmdldDogdGFyZ2V0UGF0aCxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBzdGF0aWMgbmFtZWRWb2x1bWUodm9sdW1lTmFtZTogc3RyaW5nLCB0YXJnZXRQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IERvY2tlckNvbXBvc2VWb2x1bWVDb25maWcgPSB7fSk6IElEb2NrZXJDb21wb3NlVm9sdW1lQmluZGluZyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJpbmQodm9sdW1lSW5mbzogSURvY2tlckNvbXBvc2VWb2x1bWVDb25maWcpOiBEb2NrZXJDb21wb3NlVm9sdW1lTW91bnQge1xuICAgICAgICB2b2x1bWVJbmZvLmFkZFZvbHVtZUNvbmZpZ3VyYXRpb24odm9sdW1lTmFtZSwgb3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAndm9sdW1lJyxcbiAgICAgICAgICBzb3VyY2U6IHZvbHVtZU5hbWUsXG4gICAgICAgICAgdGFyZ2V0OiB0YXJnZXRQYXRoLFxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkb25seSBzZXJ2aWNlczogUmVjb3JkPHN0cmluZywgRG9ja2VyQ29tcG9zZVNlcnZpY2U+O1xuICBwcml2YXRlIHJlYWRvbmx5IHZlcnNpb246IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQcm9qZWN0LCBwcm9wcz86IERvY2tlckNvbXBvc2VQcm9wcykge1xuICAgIHN1cGVyKHByb2plY3QpO1xuXG4gICAgY29uc3QgbmFtZVN1ZmZpeCA9IHByb3BzPy5uYW1lU3VmZml4ID8gYCR7cHJvcHMhLm5hbWVTdWZmaXh9LnltbGAgOiAneW1sJztcbiAgICBuZXcgWWFtbEZpbGUocHJvamVjdCwgYGRvY2tlci1jb21wb3NlLiR7bmFtZVN1ZmZpeH1gLCB7XG4gICAgICBjb21taXR0ZWQ6IHRydWUsXG4gICAgICByZWFkb25seTogdHJ1ZSxcbiAgICAgIG9iajogKCkgPT4gdGhpcy5fc3ludGhlc2l6ZURvY2tlckNvbXBvc2UoKSxcbiAgICB9KTtcblxuICAgIGlmIChwcm9wcz8uc2NoZW1hVmVyc2lvbiAmJiAhcGFyc2VGbG9hdChwcm9wcy5zY2hlbWFWZXJzaW9uKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1ZlcnNpb24gdGFnIG5lZWRzIHRvIGJlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudmVyc2lvbiA9IHByb3BzPy5zY2hlbWFWZXJzaW9uID8gcHJvcHMuc2NoZW1hVmVyc2lvbiA6ICczLjMnO1xuICAgIHRoaXMuc2VydmljZXMgPSB7fTtcblxuICAgIC8vIEFkZCB0aGUgc2VydmljZXMgcHJvdmlkZWQgdmlhIHRoZSBjb25zdHJ1Y3RvciBhcmd1bWVudC5cbiAgICBjb25zdCBpbml0aWFsU2VydmljZXMgPSBwcm9wcz8uc2VydmljZXMgPz8ge307XG4gICAgZm9yIChjb25zdCBbbmFtZSwgc2VydmljZURlc2NyaXB0aW9uXSBvZiBPYmplY3QuZW50cmllcyhpbml0aWFsU2VydmljZXMpKSB7XG4gICAgICB0aGlzLmFkZFNlcnZpY2UobmFtZSwgc2VydmljZURlc2NyaXB0aW9uKTtcbiAgICB9XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkU2VydmljZShzZXJ2aWNlTmFtZTogc3RyaW5nLCBkZXNjcmlwdGlvbjogRG9ja2VyQ29tcG9zZVNlcnZpY2VEZXNjcmlwdGlvbik6IERvY2tlckNvbXBvc2VTZXJ2aWNlIHtcbiAgICBjb25zdCBzZXJ2aWNlID0gbmV3IERvY2tlckNvbXBvc2VTZXJ2aWNlKHNlcnZpY2VOYW1lLCBkZXNjcmlwdGlvbik7XG4gICAgdGhpcy5zZXJ2aWNlc1tzZXJ2aWNlTmFtZV0gPSBzZXJ2aWNlO1xuICAgIHJldHVybiBzZXJ2aWNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX3N5bnRoZXNpemVEb2NrZXJDb21wb3NlKCk6IG9iamVjdCB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuc2VydmljZXMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb2NrZXJDb21wb3NlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBzZXJ2aWNlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlbmRlckRvY2tlckNvbXBvc2VGaWxlKHRoaXMuc2VydmljZXMsIHRoaXMudmVyc2lvbik7XG4gIH1cbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBpbnRlcmZhY2UgSURvY2tlckNvbXBvc2VTZXJ2aWNlTmFtZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBzZXJ2aWNlTmFtZTogc3RyaW5nO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIERvY2tlckNvbXBvc2VTZXJ2aWNlRGVzY3JpcHRpb24ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgaW1hZ2U/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgaW1hZ2VCdWlsZD86IERvY2tlckNvbXBvc2VCdWlsZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGNvbW1hbmQ/OiBzdHJpbmdbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkZXBlbmRzT24/OiBJRG9ja2VyQ29tcG9zZVNlcnZpY2VOYW1lW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB2b2x1bWVzPzogSURvY2tlckNvbXBvc2VWb2x1bWVCaW5kaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHBvcnRzPzogRG9ja2VyQ29tcG9zZVNlcnZpY2VQb3J0W107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgZW52aXJvbm1lbnQ/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBEb2NrZXJDb21wb3NlU2VydmljZSBpbXBsZW1lbnRzIElEb2NrZXJDb21wb3NlU2VydmljZU5hbWUge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgc2VydmljZU5hbWU6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBpbWFnZT86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgaW1hZ2VCdWlsZD86IERvY2tlckNvbXBvc2VCdWlsZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgY29tbWFuZD86IHN0cmluZ1tdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBkZXBlbmRzT246IElEb2NrZXJDb21wb3NlU2VydmljZU5hbWVbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHZvbHVtZXM6IElEb2NrZXJDb21wb3NlVm9sdW1lQmluZGluZ1tdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHBvcnRzOiBEb2NrZXJDb21wb3NlU2VydmljZVBvcnRbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBlbnZpcm9ubWVudDogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihzZXJ2aWNlTmFtZTogc3RyaW5nLCBzZXJ2aWNlRGVzY3JpcHRpb246IERvY2tlckNvbXBvc2VTZXJ2aWNlRGVzY3JpcHRpb24pIHtcbiAgICBpZiAoKCFzZXJ2aWNlRGVzY3JpcHRpb24uaW1hZ2VCdWlsZCAmJiAhc2VydmljZURlc2NyaXB0aW9uLmltYWdlKVxuICAgICAgfHwgKHNlcnZpY2VEZXNjcmlwdGlvbi5pbWFnZUJ1aWxkICYmIHNlcnZpY2VEZXNjcmlwdGlvbi5pbWFnZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQSBzZXJ2aWNlICR7c2VydmljZU5hbWV9IHJlcXVpcmVzIGV4YWN0bHkgb25lIG9mIGEgXFxgaW1hZ2VCdWlsZFxcYCBvciBcXGBpbWFnZVxcYCBrZXlgKTtcbiAgICB9XG5cbiAgICB0aGlzLnNlcnZpY2VOYW1lID0gc2VydmljZU5hbWU7XG4gICAgdGhpcy5jb21tYW5kID0gc2VydmljZURlc2NyaXB0aW9uLmNvbW1hbmQ7XG4gICAgdGhpcy5pbWFnZSA9IHNlcnZpY2VEZXNjcmlwdGlvbi5pbWFnZTtcbiAgICB0aGlzLmltYWdlQnVpbGQgPSBzZXJ2aWNlRGVzY3JpcHRpb24uaW1hZ2VCdWlsZDtcbiAgICB0aGlzLmRlcGVuZHNPbiA9IHNlcnZpY2VEZXNjcmlwdGlvbi5kZXBlbmRzT24gPz8gW107XG4gICAgdGhpcy52b2x1bWVzID0gc2VydmljZURlc2NyaXB0aW9uLnZvbHVtZXMgPz8gW107XG4gICAgdGhpcy5wb3J0cyA9IHNlcnZpY2VEZXNjcmlwdGlvbi5wb3J0cyA/PyBbXTtcbiAgICB0aGlzLmVudmlyb25tZW50ID0gc2VydmljZURlc2NyaXB0aW9uLmVudmlyb25tZW50ID8/IHt9O1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkUG9ydChwdWJsaXNoZWRQb3J0OiBudW1iZXIsIHRhcmdldFBvcnQ6IG51bWJlciwgb3B0aW9ucz86IERvY2tlckNvbXBvc2VQb3J0TWFwcGluZ09wdGlvbnMpIHtcbiAgICB0aGlzLnBvcnRzPy5wdXNoKERvY2tlckNvbXBvc2UucG9ydE1hcHBpbmcocHVibGlzaGVkUG9ydCwgdGFyZ2V0UG9ydCwgb3B0aW9ucykpO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZEVudmlyb25tZW50KG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuZW52aXJvbm1lbnRbbmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZERlcGVuZHNPbihzZXJ2aWNlTmFtZTogSURvY2tlckNvbXBvc2VTZXJ2aWNlTmFtZSkge1xuICAgIHRoaXMuZGVwZW5kc09uLnB1c2goc2VydmljZU5hbWUpO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGFkZFZvbHVtZSh2b2x1bWU6IElEb2NrZXJDb21wb3NlVm9sdW1lQmluZGluZykge1xuICAgIHRoaXMudm9sdW1lcy5wdXNoKHZvbHVtZSk7XG4gIH1cbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIERvY2tlckNvbXBvc2VTZXJ2aWNlUG9ydCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBwdWJsaXNoZWQ6IG51bWJlcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgdGFyZ2V0OiBudW1iZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBwcm90b2NvbDogRG9ja2VyQ29tcG9zZVByb3RvY29sO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBtb2RlOiBzdHJpbmc7XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgZW51bSBEb2NrZXJDb21wb3NlUHJvdG9jb2wge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgVENQID0gJ3RjcCcsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIFVEUCA9ICd1ZHAnLFxufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIERvY2tlckNvbXBvc2VCdWlsZCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgY29udGV4dDogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkb2NrZXJmaWxlPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBhcmdzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBEb2NrZXJDb21wb3NlVm9sdW1lQ29uZmlnIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGRyaXZlcj86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgZHJpdmVyT3B0cz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGV4dGVybmFsPzogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IG5hbWU/OiBzdHJpbmc7XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIElEb2NrZXJDb21wb3NlVm9sdW1lQmluZGluZyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgYmluZCh2b2x1bWVDb25maWc6IElEb2NrZXJDb21wb3NlVm9sdW1lQ29uZmlnKTogRG9ja2VyQ29tcG9zZVZvbHVtZU1vdW50O1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBJRG9ja2VyQ29tcG9zZVZvbHVtZUNvbmZpZyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIGFkZFZvbHVtZUNvbmZpZ3VyYXRpb24odm9sdW1lTmFtZTogc3RyaW5nLCBjb25maWd1cmF0aW9uOiBEb2NrZXJDb21wb3NlVm9sdW1lQ29uZmlnKTogdm9pZDtcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBpbnRlcmZhY2UgRG9ja2VyQ29tcG9zZVZvbHVtZU1vdW50IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHR5cGU6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHNvdXJjZTogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgdGFyZ2V0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogU3RydWN0dXJlIG9mIGEgZG9ja2VyIGNvbXBvc2UgZmlsZSBiZWZvcmUgd2UgZGVjYW1lbGl6ZS5cbiAqIEBpbnRlcm5hbFxuICovXG5pbnRlcmZhY2UgRG9ja2VyQ29tcG9zZUZpbGVTY2hlbWEge1xuICB2ZXJzaW9uOiBzdHJpbmc7XG4gIHNlcnZpY2VzOiBSZWNvcmQ8c3RyaW5nLCBEb2NrZXJDb21wb3NlRmlsZVNlcnZpY2VTY2hlbWE+O1xuICB2b2x1bWVzPzogUmVjb3JkPHN0cmluZywgRG9ja2VyQ29tcG9zZVZvbHVtZUNvbmZpZz47XG59XG5cbi8qKlxuICogU3RydWN0dXJlIG9mIGEgZG9ja2VyIGNvbXBvc2UgZmlsZSdzIHNlcnZpY2UgYmVmb3JlIHdlIGRlY2FtZWxpemUuXG4gKiBAaW50ZXJuYWxcbiAqL1xuaW50ZXJmYWNlIERvY2tlckNvbXBvc2VGaWxlU2VydmljZVNjaGVtYSB7XG4gIHJlYWRvbmx5IGRlcGVuZHNPbj86IHN0cmluZ1tdO1xuICByZWFkb25seSBidWlsZD86IERvY2tlckNvbXBvc2VCdWlsZDtcbiAgcmVhZG9ubHkgaW1hZ2U/OiBzdHJpbmc7XG4gIHJlYWRvbmx5IGNvbW1hbmQ/OiBzdHJpbmdbXTtcbiAgcmVhZG9ubHkgdm9sdW1lcz86IERvY2tlckNvbXBvc2VWb2x1bWVNb3VudFtdO1xuICByZWFkb25seSBwb3J0cz86IERvY2tlckNvbXBvc2VTZXJ2aWNlUG9ydFtdO1xuICByZWFkb25seSBlbnZpcm9ubWVudD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmZ1bmN0aW9uIHJlbmRlckRvY2tlckNvbXBvc2VGaWxlKHNlcnZpY2VEZXNjcmlwdGlvbnM6IFJlY29yZDxzdHJpbmcsIERvY2tlckNvbXBvc2VTZXJ2aWNlPiwgdmVyc2lvbjogc3RyaW5nKTogb2JqZWN0IHtcbiAgLy8gUmVjb3JkIHZvbHVtZSBjb25maWd1cmF0aW9uXG4gIGNvbnN0IHZvbHVtZUNvbmZpZzogUmVjb3JkPHN0cmluZywgRG9ja2VyQ29tcG9zZVZvbHVtZUNvbmZpZz4gPSB7fTtcbiAgY29uc3Qgdm9sdW1lSW5mbzogSURvY2tlckNvbXBvc2VWb2x1bWVDb25maWcgPSB7XG4gICAgYWRkVm9sdW1lQ29uZmlndXJhdGlvbih2b2x1bWVOYW1lOiBzdHJpbmcsIGNvbmZpZ3VyYXRpb246IERvY2tlckNvbXBvc2VWb2x1bWVDb25maWcpIHtcbiAgICAgIGlmICghdm9sdW1lQ29uZmlnW3ZvbHVtZU5hbWVdKSB7XG4gICAgICAgIC8vIEZpcnN0IHZvbHVtZSBjb25maWd1cmF0aW9uIHRha2VzIHByZWNlZGVuY2UuXG4gICAgICAgIHZvbHVtZUNvbmZpZ1t2b2x1bWVOYW1lXSA9IGNvbmZpZ3VyYXRpb247XG4gICAgICB9XG4gICAgfSxcbiAgfTtcblxuICAvLyBSZW5kZXIgc2VydmljZSBjb25maWd1cmF0aW9uXG4gIGNvbnN0IHNlcnZpY2VzOiBSZWNvcmQ8c3RyaW5nLCBEb2NrZXJDb21wb3NlRmlsZVNlcnZpY2VTY2hlbWE+ID0ge307XG4gIGZvciAoY29uc3QgW3NlcnZpY2VOYW1lLCBzZXJ2aWNlRGVzY3JpcHRpb25dIG9mIE9iamVjdC5lbnRyaWVzKHNlcnZpY2VEZXNjcmlwdGlvbnMgPz8ge30pKSB7XG4gICAgLy8gUmVzb2x2ZSB0aGUgbmFtZXMgb2YgZWFjaCBkZXBlbmRlbmN5IGFuZCBjaGVjayB0aGF0IHRoZXkgZXhpc3QuXG4gICAgLy8gTm90ZTogVGhleSBtYXkgbm90IGV4aXN0IGlmIHRoZSB1c2VyIG1hZGUgYSBtaXN0YWtlIHdoZW4gcmVmZXJlbmNpbmcgYVxuICAgIC8vIHNlcnZpY2UgYnkgbmFtZSB2aWEgYERvY2tlckNvbXBvc2Uuc2VydmljZU5hbWUoKWAuXG4gICAgLy8gQHNlZSBEb2NrZXJDb21wb3NlLnNlcnZpY2VOYW1lXG4gICAgY29uc3QgZGVwZW5kc09uID0gQXJyYXk8c3RyaW5nPigpO1xuICAgIGZvciAoY29uc3QgZGVwZW5kc09uU2VydmljZU5hbWUgb2Ygc2VydmljZURlc2NyaXB0aW9uLmRlcGVuZHNPbiA/PyBbXSkge1xuICAgICAgY29uc3QgcmVzb2x2ZWRTZXJ2aWNlTmFtZSA9IGRlcGVuZHNPblNlcnZpY2VOYW1lLnNlcnZpY2VOYW1lO1xuICAgICAgaWYgKHJlc29sdmVkU2VydmljZU5hbWUgPT09IHNlcnZpY2VOYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgU2VydmljZSAke3NlcnZpY2VOYW1lfSBjYW5ub3QgZGVwZW5kIG9uIGl0c2VsZmApO1xuICAgICAgfVxuICAgICAgaWYgKCFzZXJ2aWNlRGVzY3JpcHRpb25zW3Jlc29sdmVkU2VydmljZU5hbWVdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHJlc29sdmUgc2VydmljZSBuYW1lZCAke3Jlc29sdmVkU2VydmljZU5hbWV9IGZvciAke3NlcnZpY2VOYW1lfWApO1xuICAgICAgfVxuXG4gICAgICBkZXBlbmRzT24ucHVzaChyZXNvbHZlZFNlcnZpY2VOYW1lKTtcbiAgICB9XG5cbiAgICAvLyBHaXZlIGVhY2ggdm9sdW1lIGJpbmRpbmcgYSBjaGFuY2UgdG8gYmluZCBhbnkgbmVjZXNzYXJ5IHZvbHVtZVxuICAgIC8vIGNvbmZpZ3VyYXRpb24gYW5kIHByb3ZpZGUgdm9sdW1lIG1vdW50IGluZm9ybWF0aW9uIGZvciB0aGUgc2VydmljZS5cbiAgICBjb25zdCB2b2x1bWVzOiBEb2NrZXJDb21wb3NlVm9sdW1lTW91bnRbXSA9IFtdO1xuICAgIGZvciAoY29uc3Qgdm9sdW1lQmluZGluZyBvZiBzZXJ2aWNlRGVzY3JpcHRpb24udm9sdW1lcyA/PyBbXSkge1xuICAgICAgdm9sdW1lcy5wdXNoKHZvbHVtZUJpbmRpbmcuYmluZCh2b2x1bWVJbmZvKSk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGFuZCBzdG9yZSB0aGUgc2VydmljZSBjb25maWd1cmF0aW9uLCB0YWtpbmcgY2FyZSBub3QgdG8gY3JlYXRlXG4gICAgLy8gb2JqZWN0IG1lbWJlcnMgd2l0aCB1bmRlZmluZWQgdmFsdWVzLlxuICAgIHNlcnZpY2VzW3NlcnZpY2VOYW1lXSA9IHtcbiAgICAgIC4uLmdldE9iamVjdFdpdGhLZXlBbmRWYWx1ZUlmVmFsdWVJc0RlZmluZWQoJ2ltYWdlJywgc2VydmljZURlc2NyaXB0aW9uLmltYWdlKSxcbiAgICAgIC4uLmdldE9iamVjdFdpdGhLZXlBbmRWYWx1ZUlmVmFsdWVJc0RlZmluZWQoJ2J1aWxkJywgc2VydmljZURlc2NyaXB0aW9uLmltYWdlQnVpbGQpLFxuICAgICAgLi4uZ2V0T2JqZWN0V2l0aEtleUFuZFZhbHVlSWZWYWx1ZUlzRGVmaW5lZCgnY29tbWFuZCcsIHNlcnZpY2VEZXNjcmlwdGlvbi5jb21tYW5kKSxcbiAgICAgIC4uLihPYmplY3Qua2V5cyhzZXJ2aWNlRGVzY3JpcHRpb24uZW52aXJvbm1lbnQpLmxlbmd0aCA+IDAgPyB7IGVudmlyb25tZW50OiBzZXJ2aWNlRGVzY3JpcHRpb24uZW52aXJvbm1lbnQgfSA6IHt9KSxcbiAgICAgIC4uLihzZXJ2aWNlRGVzY3JpcHRpb24ucG9ydHMubGVuZ3RoID4gMCA/IHsgcG9ydHM6IHNlcnZpY2VEZXNjcmlwdGlvbi5wb3J0cyB9IDoge30pLFxuICAgICAgLi4uKGRlcGVuZHNPbi5sZW5ndGggPiAwID8geyBkZXBlbmRzT24gfSA6IHt9KSxcbiAgICAgIC4uLih2b2x1bWVzLmxlbmd0aCA+IDAgPyB7IHZvbHVtZXMgfSA6IHt9KSxcbiAgICB9O1xuICB9XG5cbiAgLy8gRXhwbGljaXQgd2l0aCB0aGUgdHlwZSBoZXJlIGJlY2F1c2UgdGhlIGRlY2FtZWxpemUgc3RlcCBhZnRlciB0aGlzIHdpcGVzXG4gIC8vIG91dCB0eXBlcy5cbiAgY29uc3QgaW5wdXQ6IERvY2tlckNvbXBvc2VGaWxlU2NoZW1hID0ge1xuICAgIHZlcnNpb24sXG4gICAgc2VydmljZXMsXG4gICAgLi4uKE9iamVjdC5rZXlzKHZvbHVtZUNvbmZpZykubGVuZ3RoID4gMCA/IHsgdm9sdW1lczogdm9sdW1lQ29uZmlnIH0gOiB7fSksXG4gIH07XG5cbiAgLy8gQ2hhbmdlIG1vc3Qga2V5cyB0byBzbmFrZSBjYXNlLlxuICByZXR1cm4gZGVjYW1lbGl6ZUtleXNSZWN1cnNpdmVseShpbnB1dCwge1xuICAgIHNob3VsZERlY2FtZWxpemU6IHNob3VsZERlY2FtZWxpemVEb2NrZXJDb21wb3NlS2V5LFxuICAgIHNlcGFyYXRvcjogJ18nLFxuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGB7IFtrZXldOiB2YWx1ZSB9YCBpZiBgdmFsdWVgIGlzIGRlZmluZWQsIG90aGVyd2lzZSByZXR1cm5zIGB7fWAgc29cbiAqIHRoYXQgb2JqZWN0IHNwcmVhZGluZyBjYW4gYmUgdXNlZCB0byBnZW5lcmF0ZSBhIHBlY3VsaWFyIGludGVyZmFjZS5cbiAqIEBwYXJhbSBrZXlcbiAqIEBwYXJhbSB2YWx1ZVxuICovXG5mdW5jdGlvbiBnZXRPYmplY3RXaXRoS2V5QW5kVmFsdWVJZlZhbHVlSXNEZWZpbmVkPEsgZXh0ZW5kcyBzdHJpbmcsIFQ+KGtleTogSywgdmFsdWU6IFQpOiB7IEs6IFQgfSB8IHt9IHtcbiAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQgPyB7IFtrZXldOiB2YWx1ZSB9IDoge307XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBrZXkgYXQgdGhlIGdpdmVuIHBhdGggc2hvdWxkIGJlIGRlY2FtZWxpemVkLlxuICogTGFyZ2VseSwgYWxsIGtleXMgc2hvdWxkIGJlIHNuYWtlIGNhc2VkLiBCdXQsIHRoZXJlIGFyZSBzb21lXG4gKiBleGNlcHRpb25zIGZvciB1c2VyLXByb3ZpZGVkIG5hbWVzIGZvciBzZXJ2aWNlcywgdm9sdW1lcywgYW5kXG4gKiBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG4gKlxuICogQHBhcmFtIHBhdGhcbiAqL1xuZnVuY3Rpb24gc2hvdWxkRGVjYW1lbGl6ZURvY2tlckNvbXBvc2VLZXkocGF0aDogc3RyaW5nW10pIHtcbiAgY29uc3QgcG91bmRQYXRoID0gcGF0aC5qb2luKCcjJyk7XG5cbiAgLy8gRG9lcyBub3QgZGVjYW1lbGl6ZSB1c2VyJ3MgbmFtZXMuXG4gIC8vIHNlcnZpY2VzLm5hbWVoZXJlOlxuICAvLyB2b2x1bWVzLm5hbWVoZXJlOlxuICBpZiAoL14oc2VydmljZXN8dm9sdW1lcykjW14jXSskLy50ZXN0KHBvdW5kUGF0aCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBEb2VzIG5vdCBkZWNhbWVsaXplIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAvLyBzZXJ2aWNlcy5uYW1laGVyZS5lbnZpcm9ubWVudC4qXG4gIGlmICgvXnNlcnZpY2VzI1teI10rI2Vudmlyb25tZW50Iy8udGVzdChwb3VuZFBhdGgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gRG9lcyBub3QgZGVjYW1lbGl6ZSBidWlsZCBhcmd1bWVudHNcbiAgLy8gc2VydmljZXMubmFtZWhlcmUuYnVpbGQuYXJncy4qXG4gIGlmICgvXnNlcnZpY2VzI1teI10rI2J1aWxkI2FyZ3MjLy50ZXN0KHBvdW5kUGF0aCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBPdGhlcndpc2UsIGxldCBpdCBhbGwgZGVjYW1lbGl6ZS5cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=