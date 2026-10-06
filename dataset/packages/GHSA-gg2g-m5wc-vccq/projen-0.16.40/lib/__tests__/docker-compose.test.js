"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const __1 = require("..");
const logging = require("../logging");
const util_1 = require("./util");
logging.disable();
describe('docker-compose', () => {
    test('errors when no services', () => {
        const project = new util_1.TestProject();
        new __1.DockerCompose(project);
        expect(() => project.synth())
            .toThrow(/at least one service/i);
    });
    test('errors when imageBuild and image not specified in service', () => {
        const project = new util_1.TestProject();
        const dc = new __1.DockerCompose(project);
        expect(() => dc.addService('service', {}))
            .toThrow(/requires exactly one of.*imageBuild.*image/i);
    });
    test('errors when imageBuild and image are both specified in service', () => {
        const project = new util_1.TestProject();
        const dc = new __1.DockerCompose(project);
        expect(() => dc.addService('service', {
            image: 'nginx',
            imageBuild: {
                context: '.',
            },
        })).toThrow(/requires exactly one of.*imageBuild.*image/i);
    });
    test('errors when version tag is not a number', () => {
        const project = new util_1.TestProject();
        expect(() => new __1.DockerCompose(project, {
            schemaVersion: 'blub',
            services: {
                myservice: {
                    image: 'nginx',
                },
            },
        })).toThrow(/Version tag needs to be a number/i);
    });
    test('version tag explicit set and created as float', () => {
        const project = new util_1.TestProject();
        const dc = new __1.DockerCompose(project, {
            schemaVersion: '3.1',
            services: {
                myservice: {
                    image: 'nginx',
                },
            },
        });
        expect(dc._synthesizeDockerCompose()).toEqual({
            version: '3.1',
            services: {
                myservice: {
                    image: 'nginx',
                },
            },
        });
        project.synth();
        assertDockerComposeFileValidates(project.outdir);
    });
    test('version tag explicit set and created as int', () => {
        const project = new util_1.TestProject();
        const dc = new __1.DockerCompose(project, {
            schemaVersion: '3',
            services: {
                myservice: {
                    image: 'nginx',
                },
            },
        });
        expect(dc._synthesizeDockerCompose()).toEqual({
            version: '3',
            services: {
                myservice: {
                    image: 'nginx',
                },
            },
        });
        project.synth();
        assertDockerComposeFileValidates(project.outdir);
    });
    test('version tag defaults to 3.3 when not set', () => {
        const project = new util_1.TestProject();
        const dc = new __1.DockerCompose(project, {
            services: {
                myservice: {
                    image: 'nginx',
                },
            },
        });
        expect(dc._synthesizeDockerCompose()).toEqual({
            version: '3.3',
            services: {
                myservice: {
                    image: 'nginx',
                },
            },
        });
        project.synth();
        assertDockerComposeFileValidates(project.outdir);
    });
    test('can build an image', () => {
        const project = new util_1.TestProject();
        const dc = new __1.DockerCompose(project, {
            services: {
                custom: {
                    imageBuild: {
                        context: '.',
                        dockerfile: 'docker-compose.test.Dockerfile',
                        args: {
                            FROM: 'alpine',
                        },
                    },
                    command: ['sh', '-c', 'echo hi'],
                },
            },
        });
        expect(dc._synthesizeDockerCompose()).toEqual({
            version: '3.3',
            services: {
                custom: {
                    build: {
                        context: '.',
                        dockerfile: 'docker-compose.test.Dockerfile',
                        args: {
                            FROM: 'alpine',
                        },
                    },
                    command: ['sh', '-c', 'echo hi'],
                },
            },
        });
        project.synth();
        assertDockerComposeFileValidates(project.outdir);
    });
    test('can choose a name suffix for the docker-compose.yml', () => {
        const project = new util_1.TestProject();
        new __1.DockerCompose(project, {
            nameSuffix: 'myname',
            services: {
                myservice: {
                    image: 'nginx',
                },
            },
        });
        project.synth();
        expect(fs.existsSync(path.join(project.outdir, 'docker-compose.myname.yml')));
    });
    test('can add a container command', () => {
        const project = new util_1.TestProject();
        const dc = new __1.DockerCompose(project, {
            services: {
                alpine: {
                    image: 'alpine',
                    command: ['sh', '-c', 'echo I ran'],
                },
            },
        });
        expect(dc._synthesizeDockerCompose()).toEqual({
            version: '3.3',
            services: {
                alpine: {
                    image: 'alpine',
                    command: ['sh', '-c', 'echo I ran'],
                },
            },
        });
        project.synth();
        assertDockerComposeFileValidates(project.outdir);
    });
    describe('can add a volume', () => {
        test('bind volume', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project, {
                services: {
                    myservice: {
                        image: 'nginx',
                        volumes: [
                            __1.DockerCompose.bindVolume('./docroot', '/var/www/html'),
                        ],
                    },
                },
            });
            expect(dc._synthesizeDockerCompose()).toEqual({
                version: '3.3',
                services: {
                    myservice: {
                        image: 'nginx',
                        volumes: [
                            {
                                type: 'bind',
                                source: './docroot',
                                target: '/var/www/html',
                            },
                        ],
                    },
                },
            });
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
        test('named volume', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project, {
                services: {
                    myservice: {
                        image: 'nginx',
                        volumes: [
                            __1.DockerCompose.namedVolume('html', '/var/www/html'),
                        ],
                    },
                },
            });
            expect(dc._synthesizeDockerCompose()).toEqual({
                version: '3.3',
                services: {
                    myservice: {
                        image: 'nginx',
                        volumes: [
                            {
                                type: 'volume',
                                source: 'html',
                                target: '/var/www/html',
                            },
                        ],
                    },
                },
                volumes: {
                    html: {},
                },
            });
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
        test('named volume with special driver', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project, {
                services: {
                    web: {
                        image: 'nginx',
                        volumes: [
                            __1.DockerCompose.namedVolume('web', '/var/www/html', {
                                driverOpts: {
                                    type: 'nfs',
                                    o: 'addr=10.40.0.199,nolock,soft,rw',
                                    device: ':/docker/example',
                                },
                            }),
                        ],
                    },
                },
            });
            expect(dc._synthesizeDockerCompose()).toEqual({
                version: '3.3',
                services: {
                    web: {
                        image: 'nginx',
                        volumes: [
                            {
                                type: 'volume',
                                source: 'web',
                                target: '/var/www/html',
                            },
                        ],
                    },
                },
                volumes: {
                    web: {
                        driver_opts: {
                            type: 'nfs',
                            o: 'addr=10.40.0.199,nolock,soft,rw',
                            device: ':/docker/example',
                        },
                    },
                },
            });
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
        test('imperatively', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project);
            const service = dc.addService('myservice', {
                image: 'nginx',
            });
            service.addVolume(__1.DockerCompose.namedVolume('html', '/var/www/html'));
            expect(dc._synthesizeDockerCompose()).toEqual({
                version: '3.3',
                services: {
                    myservice: {
                        image: 'nginx',
                        volumes: [
                            {
                                type: 'volume',
                                source: 'html',
                                target: '/var/www/html',
                            },
                        ],
                    },
                },
                volumes: {
                    html: {},
                },
            });
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
    });
    describe('can map a port', () => {
        const expected = {
            version: '3.3',
            services: {
                port: {
                    image: 'nginx',
                    ports: [
                        {
                            published: 8080,
                            target: 80,
                            protocol: 'tcp',
                            mode: 'host',
                        },
                        {
                            published: 8080,
                            target: 80,
                            protocol: 'udp',
                            mode: 'host',
                        },
                    ],
                },
            },
        };
        test('declaratively', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project, {
                services: {
                    port: {
                        image: 'nginx',
                        ports: [
                            __1.DockerCompose.portMapping(8080, 80),
                            __1.DockerCompose.portMapping(8080, 80, {
                                protocol: __1.DockerComposeProtocol.UDP,
                            }),
                        ],
                    },
                },
            });
            expect(dc._synthesizeDockerCompose()).toEqual(expected);
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
        test('imperatively', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project);
            const service = dc.addService('port', {
                image: 'nginx',
            });
            service.addPort(8080, 80);
            service.addPort(8080, 80, {
                protocol: __1.DockerComposeProtocol.UDP,
            });
            expect(dc._synthesizeDockerCompose()).toEqual(expected);
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
    });
    describe('can add depends_on', () => {
        const expected = {
            version: '3.3',
            services: {
                first: { image: 'alpine' },
                second: {
                    depends_on: ['first'],
                    image: 'nginx',
                },
            },
        };
        test('declaratively', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project, {
                services: {
                    first: { image: 'alpine' },
                    second: {
                        dependsOn: [__1.DockerCompose.serviceName('first')],
                        image: 'nginx',
                    },
                },
            });
            expect(dc._synthesizeDockerCompose()).toEqual(expected);
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
        test('imperatively', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project);
            const first = dc.addService('first', { image: 'alpine' });
            const second = dc.addService('second', { image: 'nginx' });
            second.addDependsOn(first);
            expect(dc._synthesizeDockerCompose()).toEqual(expected);
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
    });
    describe('can add environment variables', () => {
        const expected = {
            version: '3.3',
            services: {
                www: {
                    image: 'nginx',
                    environment: {
                        FOO: 'bar',
                        Baz: 'xyz',
                    },
                },
            },
        };
        test('declaratively', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project, {
                services: {
                    www: {
                        image: 'nginx',
                        environment: {
                            FOO: 'bar',
                            Baz: 'xyz',
                        },
                    },
                },
            });
            expect(dc._synthesizeDockerCompose()).toEqual(expected);
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
        test('imperatively', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project);
            const service = dc.addService('www', {
                image: 'nginx',
            });
            service.addEnvironment('FOO', 'bar');
            service.addEnvironment('Baz', 'xyz');
            expect(dc._synthesizeDockerCompose()).toEqual(expected);
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
    });
    test('errors when a service reference by name does not exist', () => {
        const project = new util_1.TestProject();
        new __1.DockerCompose(project, {
            services: {
                www: {
                    image: 'nginx',
                    dependsOn: [__1.DockerCompose.serviceName('nope')],
                },
            },
        });
        expect(() => project.synth())
            .toThrow(/unable to resolve.*nope.*www/i);
    });
    test('errors when a service depends on itself', () => {
        const project = new util_1.TestProject();
        new __1.DockerCompose(project, {
            services: {
                www: {
                    image: 'nginx',
                    dependsOn: [__1.DockerCompose.serviceName('www')],
                },
            },
        });
        expect(() => project.synth())
            .toThrow(/depend on itself/i);
    });
    describe('can create a wordpress dev env', () => {
        const expected = {
            version: '3.3',
            services: {
                setup: {
                    image: 'alpine',
                    command: ['sh', '-c', 'chmod a+w -R /uploads'],
                    volumes: [
                        {
                            type: 'volume',
                            source: 'uploads',
                            target: '/uploads',
                        },
                    ],
                },
                db: {
                    image: 'mysql:8',
                    volumes: [
                        {
                            type: 'volume',
                            source: 'database',
                            target: '/var/lib/mysql',
                        },
                    ],
                    environment: {
                        MYSQL_RANDOM_ROOT_PASSWORD: '1',
                        MYSQL_USER: 'wpuser',
                        MYSQL_PASSWORD: 'wppass',
                        MYSQL_DATABASE: 'wp',
                    },
                },
                wordpress: {
                    image: 'wordpress:php7.4-apache',
                    depends_on: ['db', 'setup'],
                    volumes: [
                        {
                            source: 'uploads',
                            target: '/var/www/html/wp-content/uploads',
                            type: 'volume',
                        },
                        {
                            source: 'docroot',
                            target: '/var/www/html',
                            type: 'volume',
                        },
                        {
                            source: 'plugins',
                            target: '/var/www/html/wp-content/plugins',
                            type: 'volume',
                        },
                        {
                            source: 'themes',
                            target: '/var/www/html/wp-content/themes',
                            type: 'volume',
                        },
                    ],
                    ports: [
                        {
                            mode: 'host',
                            published: 8081,
                            target: 80,
                            protocol: 'tcp',
                        },
                    ],
                    environment: {
                        WORDPRESS_DB_HOST: 'db',
                        WORDPRESS_DB_USER: 'wpuser',
                        WORDPRESS_DB_PASSWORD: 'wppass',
                        WORDPRESS_DB_NAME: 'wp',
                    },
                },
            },
            volumes: {
                database: {},
                docroot: {},
                plugins: {},
                themes: {},
                uploads: {},
            },
        };
        test('declaratively', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project, {
                services: {
                    setup: {
                        image: 'alpine',
                        command: ['sh', '-c', 'chmod a+w -R /uploads'],
                        volumes: [
                            __1.DockerCompose.namedVolume('uploads', '/uploads'),
                        ],
                    },
                    db: {
                        image: 'mysql:8',
                        volumes: [
                            __1.DockerCompose.namedVolume('database', '/var/lib/mysql'),
                        ],
                        environment: {
                            MYSQL_RANDOM_ROOT_PASSWORD: '1',
                            MYSQL_USER: 'wpuser',
                            MYSQL_PASSWORD: 'wppass',
                            MYSQL_DATABASE: 'wp',
                        },
                    },
                    wordpress: {
                        dependsOn: [
                            __1.DockerCompose.serviceName('db'),
                            __1.DockerCompose.serviceName('setup'),
                        ],
                        image: 'wordpress:php7.4-apache',
                        ports: [
                            __1.DockerCompose.portMapping(8081, 80),
                        ],
                        volumes: [
                            __1.DockerCompose.namedVolume('uploads', '/var/www/html/wp-content/uploads'),
                            __1.DockerCompose.namedVolume('docroot', '/var/www/html'),
                            __1.DockerCompose.namedVolume('plugins', '/var/www/html/wp-content/plugins'),
                            __1.DockerCompose.namedVolume('themes', '/var/www/html/wp-content/themes'),
                        ],
                        environment: {
                            WORDPRESS_DB_HOST: 'db',
                            WORDPRESS_DB_USER: 'wpuser',
                            WORDPRESS_DB_PASSWORD: 'wppass',
                            WORDPRESS_DB_NAME: 'wp',
                        },
                    },
                },
            });
            expect(dc._synthesizeDockerCompose()).toEqual(expected);
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
        test('imperatively', () => {
            const project = new util_1.TestProject();
            const dc = new __1.DockerCompose(project);
            const setup = dc.addService('setup', {
                image: 'alpine',
                command: ['sh', '-c', 'chmod a+w -R /uploads'],
                volumes: [
                    __1.DockerCompose.namedVolume('uploads', '/uploads'),
                ],
            });
            const db = dc.addService('db', {
                image: 'mysql:8',
                volumes: [
                    __1.DockerCompose.namedVolume('database', '/var/lib/mysql'),
                ],
                environment: {
                    MYSQL_RANDOM_ROOT_PASSWORD: '1',
                    MYSQL_USER: 'wpuser',
                    MYSQL_PASSWORD: 'wppass',
                    MYSQL_DATABASE: 'wp',
                },
            });
            const wp = dc.addService('wordpress', {
                dependsOn: [db],
                image: 'wordpress:php7.4-apache',
                ports: [
                    __1.DockerCompose.portMapping(8081, 80),
                ],
                volumes: [
                    __1.DockerCompose.namedVolume('uploads', '/var/www/html/wp-content/uploads'),
                ],
                environment: {
                    WORDPRESS_DB_HOST: 'db',
                    WORDPRESS_DB_USER: 'wpuser',
                    WORDPRESS_DB_PASSWORD: 'wppass',
                    WORDPRESS_DB_NAME: 'wp',
                },
            });
            wp.addDependsOn(setup);
            wp.addVolume(__1.DockerCompose.namedVolume('docroot', '/var/www/html'));
            wp.addVolume(__1.DockerCompose.namedVolume('plugins', '/var/www/html/wp-content/plugins'));
            wp.addVolume(__1.DockerCompose.namedVolume('themes', '/var/www/html/wp-content/themes'));
            expect(dc._synthesizeDockerCompose()).toEqual(expected);
            project.synth();
            assertDockerComposeFileValidates(project.outdir);
        });
    });
});
const hasDockerCompose = child_process.spawnSync('docker-compose', ['version']).status === 0;
function assertDockerComposeFileValidates(dir) {
    const filePath = path.join(dir, 'docker-compose.yml');
    expect(fs.existsSync(filePath)).toBeTruthy();
    if (hasDockerCompose) {
        const res = child_process.spawnSync('docker-compose', ['-f', filePath, 'config']);
        if (res.status !== 0) {
            throw new Error(`docker-compose file does not validate: ${res.stderr.toString()}`);
        }
    }
    else {
        console.warn('docker-compose is not present, so we cannot validate via client');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9ja2VyLWNvbXBvc2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9fX3Rlc3RzX18vZG9ja2VyLWNvbXBvc2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUErQztBQUMvQyw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLDBCQUEwRDtBQUMxRCxzQ0FBc0M7QUFDdEMsaUNBQXFDO0FBRXJDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUVsQixRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO0lBQzlCLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDbkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBVyxFQUFFLENBQUM7UUFDbEMsSUFBSSxpQkFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTNCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDMUIsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsMkRBQTJELEVBQUUsR0FBRyxFQUFFO1FBQ3JFLE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQVcsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sRUFBRSxHQUFHLElBQUksaUJBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDdkMsT0FBTyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7SUFDNUQsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsZ0VBQWdFLEVBQUUsR0FBRyxFQUFFO1FBQzFFLE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQVcsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sRUFBRSxHQUFHLElBQUksaUJBQWEsQ0FBQyxPQUFPLENB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LENBQUM7SUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUU3QyxJQUFJLGdCQUFnQixFQUFFO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDbEYsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNwRjtLQUNGO1NBQU07UUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLGlFQUFpRSxDQUFDLENBQUM7S0FDakY7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBEb2NrZXJDb21wb3NlLCBEb2NrZXJDb21wb3NlUHJvdG9jb2wgfSBmcm9tICcuLic7XG5pbXBvcnQgKiBhcyBsb2dnaW5nIGZyb20gJy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHsgVGVzdFByb2plY3QgfSBmcm9tICcuL3V0aWwnO1xuXG5sb2dnaW5nLmRpc2FibGUoKTtcblxuZGVzY3JpYmUoJ2RvY2tlci1jb21wb3NlJywgKCkgPT4ge1xuICB0ZXN0KCdlcnJvcnMgd2hlbiBubyBzZXJ2aWNlcycsICgpID0+IHtcbiAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFRlc3RQcm9qZWN0KCk7XG4gICAgbmV3IERvY2tlckNvbXBvc2UocHJvamVjdCk7XG5cbiAgICBleHBlY3QoKCkgPT4gcHJvamVjdC5zeW50aCgpKVxuICAgICAgLnRvVGhyb3coL2F0IGxlYXN0IG9uZSBzZXJ2aWNlL2kpO1xuICB9KTtcblxuICB0ZXN0KCdlcnJvcnMgd2hlbiBpbWFnZUJ1aWxkIGFuZCBpbWFnZSBub3Qgc3BlY2lmaWVkIGluIHNlcnZpY2UnLCAoKSA9PiB7XG4gICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgIGNvbnN0IGRjID0gbmV3IERvY2tlckNvbXBvc2UocHJvamVjdCk7XG5cbiAgICBleHBlY3QoKCkgPT4gZGMuYWRkU2VydmljZSgnc2VydmljZScsIHt9KSlcbiAgICAgIC50b1Rocm93KC9yZXF1aXJlcyBleGFjdGx5IG9uZSBvZi4qaW1hZ2VCdWlsZC4qaW1hZ2UvaSk7XG4gIH0pO1xuXG4gIHRlc3QoJ2Vycm9ycyB3aGVuIGltYWdlQnVpbGQgYW5kIGltYWdlIGFyZSBib3RoIHNwZWNpZmllZCBpbiBzZXJ2aWNlJywgKCkgPT4ge1xuICAgIGNvbnN0IHByb2plY3QgPSBuZXcgVGVzdFByb2plY3QoKTtcbiAgICBjb25zdCBkYyA9IG5ldyBEb2NrZXJDb21wb3NlKHByb2plY3QpO1xuXG4gICAgZXhwZWN0KCgpID0+IGRjLmFkZFNlcnZpY2UoJ3NlcnZpY2UnLCB7XG4gICAgICBpbWFnZTogJ25naW54JyxcbiAgICAgIGltYWdlQnVpbGQ6IHtcbiAgICAgICAgY29udGV4dDogJy4nLFxuICAgICAgfSxcbiAgICB9KSkudG9UaHJvdygvcmVxdWlyZXMgZXhhY3RseSBvbmUgb2YuKmltYWdlQnVpbGQuKmltYWdlL2kpO1xuICB9KTtcblxuICB0ZXN0KCdlcnJvcnMgd2hlbiB2ZXJzaW9uIHRhZyBpcyBub3QgYSBudW1iZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgIGV4cGVjdCgoKSA9PiBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0LCB7XG4gICAgICBzY2hlbWFWZXJzaW9uOiAnYmx1YicsXG4gICAgICBzZXJ2aWNlczoge1xuICAgICAgICBteXNlcnZpY2U6IHtcbiAgICAgICAgICBpbWFnZTogJ25naW54JyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSkpLnRvVGhyb3coL1ZlcnNpb24gdGFnIG5lZWRzIHRvIGJlIGEgbnVtYmVyL2kpO1xuICB9KTtcblxuICB0ZXN0KCd2ZXJzaW9uIHRhZyBleHBsaWNpdCBzZXQgYW5kIGNyZWF0ZWQgYXMgZmxvYXQnLCAoKSA9PiB7XG4gICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuXG4gICAgY29uc3QgZGMgPSBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0LCB7XG4gICAgICBzY2hlbWFWZXJzaW9uOiAnMy4xJyxcbiAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgIG15c2VydmljZToge1xuICAgICAgICAgIGltYWdlOiAnbmdpbngnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGV4cGVjdChkYy5fc3ludGhlc2l6ZURvY2tlckNvbXBvc2UoKSkudG9FcXVhbCh7XG4gICAgICB2ZXJzaW9uOiAnMy4xJyxcbiAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgIG15c2VydmljZToge1xuICAgICAgICAgIGltYWdlOiAnbmdpbngnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHByb2plY3Quc3ludGgoKTtcbiAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gIH0pO1xuXG4gIHRlc3QoJ3ZlcnNpb24gdGFnIGV4cGxpY2l0IHNldCBhbmQgY3JlYXRlZCBhcyBpbnQnLCAoKSA9PiB7XG4gICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuXG4gICAgY29uc3QgZGMgPSBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0LCB7XG4gICAgICBzY2hlbWFWZXJzaW9uOiAnMycsXG4gICAgICBzZXJ2aWNlczoge1xuICAgICAgICBteXNlcnZpY2U6IHtcbiAgICAgICAgICBpbWFnZTogJ25naW54JyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBleHBlY3QoZGMuX3N5bnRoZXNpemVEb2NrZXJDb21wb3NlKCkpLnRvRXF1YWwoe1xuICAgICAgdmVyc2lvbjogJzMnLFxuICAgICAgc2VydmljZXM6IHtcbiAgICAgICAgbXlzZXJ2aWNlOiB7XG4gICAgICAgICAgaW1hZ2U6ICduZ2lueCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgcHJvamVjdC5zeW50aCgpO1xuICAgIGFzc2VydERvY2tlckNvbXBvc2VGaWxlVmFsaWRhdGVzKHByb2plY3Qub3V0ZGlyKTtcbiAgfSk7XG5cbiAgdGVzdCgndmVyc2lvbiB0YWcgZGVmYXVsdHMgdG8gMy4zIHdoZW4gbm90IHNldCcsICgpID0+IHtcbiAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFRlc3RQcm9qZWN0KCk7XG5cbiAgICBjb25zdCBkYyA9IG5ldyBEb2NrZXJDb21wb3NlKHByb2plY3QsIHtcbiAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgIG15c2VydmljZToge1xuICAgICAgICAgIGltYWdlOiAnbmdpbngnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGV4cGVjdChkYy5fc3ludGhlc2l6ZURvY2tlckNvbXBvc2UoKSkudG9FcXVhbCh7XG4gICAgICB2ZXJzaW9uOiAnMy4zJyxcbiAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgIG15c2VydmljZToge1xuICAgICAgICAgIGltYWdlOiAnbmdpbngnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHByb2plY3Quc3ludGgoKTtcbiAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gIH0pO1xuXG4gIHRlc3QoJ2NhbiBidWlsZCBhbiBpbWFnZScsICgpID0+IHtcbiAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFRlc3RQcm9qZWN0KCk7XG5cbiAgICBjb25zdCBkYyA9IG5ldyBEb2NrZXJDb21wb3NlKHByb2plY3QsIHtcbiAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgIGN1c3RvbToge1xuICAgICAgICAgIGltYWdlQnVpbGQ6IHtcbiAgICAgICAgICAgIGNvbnRleHQ6ICcuJyxcbiAgICAgICAgICAgIGRvY2tlcmZpbGU6ICdkb2NrZXItY29tcG9zZS50ZXN0LkRvY2tlcmZpbGUnLFxuICAgICAgICAgICAgYXJnczoge1xuICAgICAgICAgICAgICBGUk9NOiAnYWxwaW5lJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb21tYW5kOiBbJ3NoJywgJy1jJywgJ2VjaG8gaGknXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBleHBlY3QoZGMuX3N5bnRoZXNpemVEb2NrZXJDb21wb3NlKCkpLnRvRXF1YWwoe1xuICAgICAgdmVyc2lvbjogJzMuMycsXG4gICAgICBzZXJ2aWNlczoge1xuICAgICAgICBjdXN0b206IHtcbiAgICAgICAgICBidWlsZDoge1xuICAgICAgICAgICAgY29udGV4dDogJy4nLFxuICAgICAgICAgICAgZG9ja2VyZmlsZTogJ2RvY2tlci1jb21wb3NlLnRlc3QuRG9ja2VyZmlsZScsXG4gICAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICAgIEZST006ICdhbHBpbmUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbW1hbmQ6IFsnc2gnLCAnLWMnLCAnZWNobyBoaSddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHByb2plY3Quc3ludGgoKTtcbiAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gIH0pO1xuXG4gIHRlc3QoJ2NhbiBjaG9vc2UgYSBuYW1lIHN1ZmZpeCBmb3IgdGhlIGRvY2tlci1jb21wb3NlLnltbCcsICgpID0+IHtcbiAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFRlc3RQcm9qZWN0KCk7XG4gICAgbmV3IERvY2tlckNvbXBvc2UocHJvamVjdCwge1xuICAgICAgbmFtZVN1ZmZpeDogJ215bmFtZScsXG4gICAgICBzZXJ2aWNlczoge1xuICAgICAgICBteXNlcnZpY2U6IHtcbiAgICAgICAgICBpbWFnZTogJ25naW54JyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBwcm9qZWN0LnN5bnRoKCk7XG4gICAgZXhwZWN0KGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2plY3Qub3V0ZGlyLCAnZG9ja2VyLWNvbXBvc2UubXluYW1lLnltbCcpKSk7XG4gIH0pO1xuXG4gIHRlc3QoJ2NhbiBhZGQgYSBjb250YWluZXIgY29tbWFuZCcsICgpID0+IHtcbiAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFRlc3RQcm9qZWN0KCk7XG4gICAgY29uc3QgZGMgPSBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0LCB7XG4gICAgICBzZXJ2aWNlczoge1xuICAgICAgICBhbHBpbmU6IHtcbiAgICAgICAgICBpbWFnZTogJ2FscGluZScsXG4gICAgICAgICAgY29tbWFuZDogWydzaCcsICctYycsICdlY2hvIEkgcmFuJ10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgZXhwZWN0KGRjLl9zeW50aGVzaXplRG9ja2VyQ29tcG9zZSgpKS50b0VxdWFsKHtcbiAgICAgIHZlcnNpb246ICczLjMnLFxuICAgICAgc2VydmljZXM6IHtcbiAgICAgICAgYWxwaW5lOiB7XG4gICAgICAgICAgaW1hZ2U6ICdhbHBpbmUnLFxuICAgICAgICAgIGNvbW1hbmQ6IFsnc2gnLCAnLWMnLCAnZWNobyBJIHJhbiddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHByb2plY3Quc3ludGgoKTtcbiAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjYW4gYWRkIGEgdm9sdW1lJywgKCkgPT4ge1xuICAgIHRlc3QoJ2JpbmQgdm9sdW1lJywgKCkgPT4ge1xuICAgICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgICAgY29uc3QgZGMgPSBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0LCB7XG4gICAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgICAgbXlzZXJ2aWNlOiB7XG4gICAgICAgICAgICBpbWFnZTogJ25naW54JyxcbiAgICAgICAgICAgIHZvbHVtZXM6IFtcbiAgICAgICAgICAgICAgRG9ja2VyQ29tcG9zZS5iaW5kVm9sdW1lKCcuL2RvY3Jvb3QnLCAnL3Zhci93d3cvaHRtbCcpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChkYy5fc3ludGhlc2l6ZURvY2tlckNvbXBvc2UoKSkudG9FcXVhbCh7XG4gICAgICAgIHZlcnNpb246ICczLjMnLFxuICAgICAgICBzZXJ2aWNlczoge1xuICAgICAgICAgIG15c2VydmljZToge1xuICAgICAgICAgICAgaW1hZ2U6ICduZ2lueCcsXG4gICAgICAgICAgICB2b2x1bWVzOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmluZCcsXG4gICAgICAgICAgICAgICAgc291cmNlOiAnLi9kb2Nyb290JyxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICcvdmFyL3d3dy9odG1sJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBwcm9qZWN0LnN5bnRoKCk7XG4gICAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gICAgfSk7XG5cbiAgICB0ZXN0KCduYW1lZCB2b2x1bWUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFRlc3RQcm9qZWN0KCk7XG4gICAgICBjb25zdCBkYyA9IG5ldyBEb2NrZXJDb21wb3NlKHByb2plY3QsIHtcbiAgICAgICAgc2VydmljZXM6IHtcbiAgICAgICAgICBteXNlcnZpY2U6IHtcbiAgICAgICAgICAgIGltYWdlOiAnbmdpbngnLFxuICAgICAgICAgICAgdm9sdW1lczogW1xuICAgICAgICAgICAgICBEb2NrZXJDb21wb3NlLm5hbWVkVm9sdW1lKCdodG1sJywgJy92YXIvd3d3L2h0bWwnKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QoZGMuX3N5bnRoZXNpemVEb2NrZXJDb21wb3NlKCkpLnRvRXF1YWwoe1xuICAgICAgICB2ZXJzaW9uOiAnMy4zJyxcbiAgICAgICAgc2VydmljZXM6IHtcbiAgICAgICAgICBteXNlcnZpY2U6IHtcbiAgICAgICAgICAgIGltYWdlOiAnbmdpbngnLFxuICAgICAgICAgICAgdm9sdW1lczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3ZvbHVtZScsXG4gICAgICAgICAgICAgICAgc291cmNlOiAnaHRtbCcsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnL3Zhci93d3cvaHRtbCcsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHZvbHVtZXM6IHtcbiAgICAgICAgICBodG1sOiB7fSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBwcm9qZWN0LnN5bnRoKCk7XG4gICAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gICAgfSk7XG5cbiAgICB0ZXN0KCduYW1lZCB2b2x1bWUgd2l0aCBzcGVjaWFsIGRyaXZlcicsICgpID0+IHtcbiAgICAgIGNvbnN0IHByb2plY3QgPSBuZXcgVGVzdFByb2plY3QoKTtcbiAgICAgIGNvbnN0IGRjID0gbmV3IERvY2tlckNvbXBvc2UocHJvamVjdCwge1xuICAgICAgICBzZXJ2aWNlczoge1xuICAgICAgICAgIHdlYjoge1xuICAgICAgICAgICAgaW1hZ2U6ICduZ2lueCcsXG4gICAgICAgICAgICB2b2x1bWVzOiBbXG4gICAgICAgICAgICAgIERvY2tlckNvbXBvc2UubmFtZWRWb2x1bWUoJ3dlYicsICcvdmFyL3d3dy9odG1sJywge1xuICAgICAgICAgICAgICAgIGRyaXZlck9wdHM6IHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICduZnMnLFxuICAgICAgICAgICAgICAgICAgbzogJ2FkZHI9MTAuNDAuMC4xOTksbm9sb2NrLHNvZnQscncnLFxuICAgICAgICAgICAgICAgICAgZGV2aWNlOiAnOi9kb2NrZXIvZXhhbXBsZScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KGRjLl9zeW50aGVzaXplRG9ja2VyQ29tcG9zZSgpKS50b0VxdWFsKHtcbiAgICAgICAgdmVyc2lvbjogJzMuMycsXG4gICAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgICAgd2ViOiB7XG4gICAgICAgICAgICBpbWFnZTogJ25naW54JyxcbiAgICAgICAgICAgIHZvbHVtZXM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6ICd2b2x1bWUnLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogJ3dlYicsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnL3Zhci93d3cvaHRtbCcsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHZvbHVtZXM6IHtcbiAgICAgICAgICB3ZWI6IHtcbiAgICAgICAgICAgIGRyaXZlcl9vcHRzOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICduZnMnLFxuICAgICAgICAgICAgICBvOiAnYWRkcj0xMC40MC4wLjE5OSxub2xvY2ssc29mdCxydycsXG4gICAgICAgICAgICAgIGRldmljZTogJzovZG9ja2VyL2V4YW1wbGUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIHByb2plY3Quc3ludGgoKTtcbiAgICAgIGFzc2VydERvY2tlckNvbXBvc2VGaWxlVmFsaWRhdGVzKHByb2plY3Qub3V0ZGlyKTtcbiAgICB9KTtcblxuICAgIHRlc3QoJ2ltcGVyYXRpdmVseScsICgpID0+IHtcbiAgICAgIGNvbnN0IHByb2plY3QgPSBuZXcgVGVzdFByb2plY3QoKTtcbiAgICAgIGNvbnN0IGRjID0gbmV3IERvY2tlckNvbXBvc2UocHJvamVjdCk7XG5cbiAgICAgIGNvbnN0IHNlcnZpY2UgPSBkYy5hZGRTZXJ2aWNlKCdteXNlcnZpY2UnLCB7XG4gICAgICAgIGltYWdlOiAnbmdpbngnLFxuICAgICAgfSk7XG4gICAgICBzZXJ2aWNlLmFkZFZvbHVtZShEb2NrZXJDb21wb3NlLm5hbWVkVm9sdW1lKCdodG1sJywgJy92YXIvd3d3L2h0bWwnKSk7XG5cbiAgICAgIGV4cGVjdChkYy5fc3ludGhlc2l6ZURvY2tlckNvbXBvc2UoKSkudG9FcXVhbCh7XG4gICAgICAgIHZlcnNpb246ICczLjMnLFxuICAgICAgICBzZXJ2aWNlczoge1xuICAgICAgICAgIG15c2VydmljZToge1xuICAgICAgICAgICAgaW1hZ2U6ICduZ2lueCcsXG4gICAgICAgICAgICB2b2x1bWVzOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndm9sdW1lJyxcbiAgICAgICAgICAgICAgICBzb3VyY2U6ICdodG1sJyxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICcvdmFyL3d3dy9odG1sJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdm9sdW1lczoge1xuICAgICAgICAgIGh0bWw6IHt9LFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIHByb2plY3Quc3ludGgoKTtcbiAgICAgIGFzc2VydERvY2tlckNvbXBvc2VGaWxlVmFsaWRhdGVzKHByb2plY3Qub3V0ZGlyKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2NhbiBtYXAgYSBwb3J0JywgKCkgPT4ge1xuICAgIGNvbnN0IGV4cGVjdGVkID0ge1xuICAgICAgdmVyc2lvbjogJzMuMycsXG4gICAgICBzZXJ2aWNlczoge1xuICAgICAgICBwb3J0OiB7XG4gICAgICAgICAgaW1hZ2U6ICduZ2lueCcsXG4gICAgICAgICAgcG9ydHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcHVibGlzaGVkOiA4MDgwLFxuICAgICAgICAgICAgICB0YXJnZXQ6IDgwLFxuICAgICAgICAgICAgICBwcm90b2NvbDogJ3RjcCcsXG4gICAgICAgICAgICAgIG1vZGU6ICdob3N0JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHB1Ymxpc2hlZDogODA4MCxcbiAgICAgICAgICAgICAgdGFyZ2V0OiA4MCxcbiAgICAgICAgICAgICAgcHJvdG9jb2w6ICd1ZHAnLFxuICAgICAgICAgICAgICBtb2RlOiAnaG9zdCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH07XG5cbiAgICB0ZXN0KCdkZWNsYXJhdGl2ZWx5JywgKCkgPT4ge1xuICAgICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgICAgY29uc3QgZGMgPSBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0LCB7XG4gICAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgICAgcG9ydDoge1xuICAgICAgICAgICAgaW1hZ2U6ICduZ2lueCcsXG4gICAgICAgICAgICBwb3J0czogW1xuICAgICAgICAgICAgICBEb2NrZXJDb21wb3NlLnBvcnRNYXBwaW5nKDgwODAsIDgwKSxcbiAgICAgICAgICAgICAgRG9ja2VyQ29tcG9zZS5wb3J0TWFwcGluZyg4MDgwLCA4MCwge1xuICAgICAgICAgICAgICAgIHByb3RvY29sOiBEb2NrZXJDb21wb3NlUHJvdG9jb2wuVURQLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QoZGMuX3N5bnRoZXNpemVEb2NrZXJDb21wb3NlKCkpLnRvRXF1YWwoZXhwZWN0ZWQpO1xuXG4gICAgICBwcm9qZWN0LnN5bnRoKCk7XG4gICAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gICAgfSk7XG5cbiAgICB0ZXN0KCdpbXBlcmF0aXZlbHknLCAoKSA9PiB7XG4gICAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFRlc3RQcm9qZWN0KCk7XG4gICAgICBjb25zdCBkYyA9IG5ldyBEb2NrZXJDb21wb3NlKHByb2plY3QpO1xuXG4gICAgICBjb25zdCBzZXJ2aWNlID0gZGMuYWRkU2VydmljZSgncG9ydCcsIHtcbiAgICAgICAgaW1hZ2U6ICduZ2lueCcsXG4gICAgICB9KTtcblxuICAgICAgc2VydmljZS5hZGRQb3J0KDgwODAsIDgwKTtcbiAgICAgIHNlcnZpY2UuYWRkUG9ydCg4MDgwLCA4MCwge1xuICAgICAgICBwcm90b2NvbDogRG9ja2VyQ29tcG9zZVByb3RvY29sLlVEUCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QoZGMuX3N5bnRoZXNpemVEb2NrZXJDb21wb3NlKCkpLnRvRXF1YWwoZXhwZWN0ZWQpO1xuXG4gICAgICBwcm9qZWN0LnN5bnRoKCk7XG4gICAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjYW4gYWRkIGRlcGVuZHNfb24nLCAoKSA9PiB7XG4gICAgY29uc3QgZXhwZWN0ZWQgPSB7XG4gICAgICB2ZXJzaW9uOiAnMy4zJyxcbiAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgIGZpcnN0OiB7IGltYWdlOiAnYWxwaW5lJyB9LFxuICAgICAgICBzZWNvbmQ6IHtcbiAgICAgICAgICBkZXBlbmRzX29uOiBbJ2ZpcnN0J10sXG4gICAgICAgICAgaW1hZ2U6ICduZ2lueCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH07XG5cbiAgICB0ZXN0KCdkZWNsYXJhdGl2ZWx5JywgKCkgPT4ge1xuICAgICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgICAgY29uc3QgZGMgPSBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0LCB7XG4gICAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgICAgZmlyc3Q6IHsgaW1hZ2U6ICdhbHBpbmUnIH0sXG4gICAgICAgICAgc2Vjb25kOiB7XG4gICAgICAgICAgICBkZXBlbmRzT246IFtEb2NrZXJDb21wb3NlLnNlcnZpY2VOYW1lKCdmaXJzdCcpXSxcbiAgICAgICAgICAgIGltYWdlOiAnbmdpbngnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KGRjLl9zeW50aGVzaXplRG9ja2VyQ29tcG9zZSgpKS50b0VxdWFsKGV4cGVjdGVkKTtcblxuICAgICAgcHJvamVjdC5zeW50aCgpO1xuICAgICAgYXNzZXJ0RG9ja2VyQ29tcG9zZUZpbGVWYWxpZGF0ZXMocHJvamVjdC5vdXRkaXIpO1xuICAgIH0pO1xuXG4gICAgdGVzdCgnaW1wZXJhdGl2ZWx5JywgKCkgPT4ge1xuICAgICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgICAgY29uc3QgZGMgPSBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0KTtcblxuICAgICAgY29uc3QgZmlyc3QgPSBkYy5hZGRTZXJ2aWNlKCdmaXJzdCcsIHsgaW1hZ2U6ICdhbHBpbmUnIH0pO1xuICAgICAgY29uc3Qgc2Vjb25kID0gZGMuYWRkU2VydmljZSgnc2Vjb25kJywgeyBpbWFnZTogJ25naW54JyB9KTtcbiAgICAgIHNlY29uZC5hZGREZXBlbmRzT24oZmlyc3QpO1xuXG4gICAgICBleHBlY3QoZGMuX3N5bnRoZXNpemVEb2NrZXJDb21wb3NlKCkpLnRvRXF1YWwoZXhwZWN0ZWQpO1xuXG4gICAgICBwcm9qZWN0LnN5bnRoKCk7XG4gICAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjYW4gYWRkIGVudmlyb25tZW50IHZhcmlhYmxlcycsICgpID0+IHtcbiAgICBjb25zdCBleHBlY3RlZCA9IHtcbiAgICAgIHZlcnNpb246ICczLjMnLFxuICAgICAgc2VydmljZXM6IHtcbiAgICAgICAgd3d3OiB7XG4gICAgICAgICAgaW1hZ2U6ICduZ2lueCcsXG4gICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgIEZPTzogJ2JhcicsXG4gICAgICAgICAgICBCYXo6ICd4eXonLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH07XG5cbiAgICB0ZXN0KCdkZWNsYXJhdGl2ZWx5JywgKCkgPT4ge1xuICAgICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgICAgY29uc3QgZGMgPSBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0LCB7XG4gICAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgICAgd3d3OiB7XG4gICAgICAgICAgICBpbWFnZTogJ25naW54JyxcbiAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgIEZPTzogJ2JhcicsXG4gICAgICAgICAgICAgIEJhejogJ3h5eicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KGRjLl9zeW50aGVzaXplRG9ja2VyQ29tcG9zZSgpKS50b0VxdWFsKGV4cGVjdGVkKTtcblxuICAgICAgcHJvamVjdC5zeW50aCgpO1xuICAgICAgYXNzZXJ0RG9ja2VyQ29tcG9zZUZpbGVWYWxpZGF0ZXMocHJvamVjdC5vdXRkaXIpO1xuICAgIH0pO1xuXG4gICAgdGVzdCgnaW1wZXJhdGl2ZWx5JywgKCkgPT4ge1xuICAgICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuICAgICAgY29uc3QgZGMgPSBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0KTtcblxuICAgICAgY29uc3Qgc2VydmljZSA9IGRjLmFkZFNlcnZpY2UoJ3d3dycsIHtcbiAgICAgICAgaW1hZ2U6ICduZ2lueCcsXG4gICAgICB9KTtcblxuICAgICAgc2VydmljZS5hZGRFbnZpcm9ubWVudCgnRk9PJywgJ2JhcicpO1xuICAgICAgc2VydmljZS5hZGRFbnZpcm9ubWVudCgnQmF6JywgJ3h5eicpO1xuXG4gICAgICBleHBlY3QoZGMuX3N5bnRoZXNpemVEb2NrZXJDb21wb3NlKCkpLnRvRXF1YWwoZXhwZWN0ZWQpO1xuXG4gICAgICBwcm9qZWN0LnN5bnRoKCk7XG4gICAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHRlc3QoJ2Vycm9ycyB3aGVuIGEgc2VydmljZSByZWZlcmVuY2UgYnkgbmFtZSBkb2VzIG5vdCBleGlzdCcsICgpID0+IHtcbiAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFRlc3RQcm9qZWN0KCk7XG5cbiAgICBuZXcgRG9ja2VyQ29tcG9zZShwcm9qZWN0LCB7XG4gICAgICBzZXJ2aWNlczoge1xuICAgICAgICB3d3c6IHtcbiAgICAgICAgICBpbWFnZTogJ25naW54JyxcbiAgICAgICAgICBkZXBlbmRzT246IFtEb2NrZXJDb21wb3NlLnNlcnZpY2VOYW1lKCdub3BlJyldLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGV4cGVjdCgoKSA9PiBwcm9qZWN0LnN5bnRoKCkpXG4gICAgICAudG9UaHJvdygvdW5hYmxlIHRvIHJlc29sdmUuKm5vcGUuKnd3dy9pKTtcbiAgfSk7XG5cbiAgdGVzdCgnZXJyb3JzIHdoZW4gYSBzZXJ2aWNlIGRlcGVuZHMgb24gaXRzZWxmJywgKCkgPT4ge1xuICAgIGNvbnN0IHByb2plY3QgPSBuZXcgVGVzdFByb2plY3QoKTtcblxuICAgIG5ldyBEb2NrZXJDb21wb3NlKHByb2plY3QsIHtcbiAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgIHd3dzoge1xuICAgICAgICAgIGltYWdlOiAnbmdpbngnLFxuICAgICAgICAgIGRlcGVuZHNPbjogW0RvY2tlckNvbXBvc2Uuc2VydmljZU5hbWUoJ3d3dycpXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBleHBlY3QoKCkgPT4gcHJvamVjdC5zeW50aCgpKVxuICAgICAgLnRvVGhyb3coL2RlcGVuZCBvbiBpdHNlbGYvaSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdjYW4gY3JlYXRlIGEgd29yZHByZXNzIGRldiBlbnYnLCAoKSA9PiB7XG4gICAgY29uc3QgZXhwZWN0ZWQgPSB7XG4gICAgICB2ZXJzaW9uOiAnMy4zJyxcbiAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgIHNldHVwOiB7XG4gICAgICAgICAgaW1hZ2U6ICdhbHBpbmUnLFxuICAgICAgICAgIGNvbW1hbmQ6IFsnc2gnLCAnLWMnLCAnY2htb2QgYSt3IC1SIC91cGxvYWRzJ10sXG4gICAgICAgICAgdm9sdW1lczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0eXBlOiAndm9sdW1lJyxcbiAgICAgICAgICAgICAgc291cmNlOiAndXBsb2FkcycsXG4gICAgICAgICAgICAgIHRhcmdldDogJy91cGxvYWRzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgZGI6IHtcbiAgICAgICAgICBpbWFnZTogJ215c3FsOjgnLFxuICAgICAgICAgIHZvbHVtZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHlwZTogJ3ZvbHVtZScsXG4gICAgICAgICAgICAgIHNvdXJjZTogJ2RhdGFiYXNlJyxcbiAgICAgICAgICAgICAgdGFyZ2V0OiAnL3Zhci9saWIvbXlzcWwnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICBNWVNRTF9SQU5ET01fUk9PVF9QQVNTV09SRDogJzEnLFxuICAgICAgICAgICAgTVlTUUxfVVNFUjogJ3dwdXNlcicsXG4gICAgICAgICAgICBNWVNRTF9QQVNTV09SRDogJ3dwcGFzcycsXG4gICAgICAgICAgICBNWVNRTF9EQVRBQkFTRTogJ3dwJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB3b3JkcHJlc3M6IHtcbiAgICAgICAgICBpbWFnZTogJ3dvcmRwcmVzczpwaHA3LjQtYXBhY2hlJyxcbiAgICAgICAgICBkZXBlbmRzX29uOiBbJ2RiJywgJ3NldHVwJ10sXG4gICAgICAgICAgdm9sdW1lczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzb3VyY2U6ICd1cGxvYWRzJyxcbiAgICAgICAgICAgICAgdGFyZ2V0OiAnL3Zhci93d3cvaHRtbC93cC1jb250ZW50L3VwbG9hZHMnLFxuICAgICAgICAgICAgICB0eXBlOiAndm9sdW1lJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNvdXJjZTogJ2RvY3Jvb3QnLFxuICAgICAgICAgICAgICB0YXJnZXQ6ICcvdmFyL3d3dy9odG1sJyxcbiAgICAgICAgICAgICAgdHlwZTogJ3ZvbHVtZScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzb3VyY2U6ICdwbHVnaW5zJyxcbiAgICAgICAgICAgICAgdGFyZ2V0OiAnL3Zhci93d3cvaHRtbC93cC1jb250ZW50L3BsdWdpbnMnLFxuICAgICAgICAgICAgICB0eXBlOiAndm9sdW1lJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNvdXJjZTogJ3RoZW1lcycsXG4gICAgICAgICAgICAgIHRhcmdldDogJy92YXIvd3d3L2h0bWwvd3AtY29udGVudC90aGVtZXMnLFxuICAgICAgICAgICAgICB0eXBlOiAndm9sdW1lJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgICBwb3J0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBtb2RlOiAnaG9zdCcsXG4gICAgICAgICAgICAgIHB1Ymxpc2hlZDogODA4MSxcbiAgICAgICAgICAgICAgdGFyZ2V0OiA4MCxcbiAgICAgICAgICAgICAgcHJvdG9jb2w6ICd0Y3AnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICBXT1JEUFJFU1NfREJfSE9TVDogJ2RiJyxcbiAgICAgICAgICAgIFdPUkRQUkVTU19EQl9VU0VSOiAnd3B1c2VyJyxcbiAgICAgICAgICAgIFdPUkRQUkVTU19EQl9QQVNTV09SRDogJ3dwcGFzcycsXG4gICAgICAgICAgICBXT1JEUFJFU1NfREJfTkFNRTogJ3dwJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHZvbHVtZXM6IHtcbiAgICAgICAgZGF0YWJhc2U6IHt9LFxuICAgICAgICBkb2Nyb290OiB7fSxcbiAgICAgICAgcGx1Z2luczoge30sXG4gICAgICAgIHRoZW1lczoge30sXG4gICAgICAgIHVwbG9hZHM6IHt9LFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgdGVzdCgnZGVjbGFyYXRpdmVseScsICgpID0+IHtcbiAgICAgIGNvbnN0IHByb2plY3QgPSBuZXcgVGVzdFByb2plY3QoKTtcbiAgICAgIGNvbnN0IGRjID0gbmV3IERvY2tlckNvbXBvc2UocHJvamVjdCwge1xuICAgICAgICBzZXJ2aWNlczoge1xuICAgICAgICAgIHNldHVwOiB7XG4gICAgICAgICAgICBpbWFnZTogJ2FscGluZScsXG4gICAgICAgICAgICBjb21tYW5kOiBbJ3NoJywgJy1jJywgJ2NobW9kIGErdyAtUiAvdXBsb2FkcyddLFxuICAgICAgICAgICAgdm9sdW1lczogW1xuICAgICAgICAgICAgICBEb2NrZXJDb21wb3NlLm5hbWVkVm9sdW1lKCd1cGxvYWRzJywgJy91cGxvYWRzJyksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZGI6IHtcbiAgICAgICAgICAgIGltYWdlOiAnbXlzcWw6OCcsXG4gICAgICAgICAgICB2b2x1bWVzOiBbXG4gICAgICAgICAgICAgIERvY2tlckNvbXBvc2UubmFtZWRWb2x1bWUoJ2RhdGFiYXNlJywgJy92YXIvbGliL215c3FsJyksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgTVlTUUxfUkFORE9NX1JPT1RfUEFTU1dPUkQ6ICcxJyxcbiAgICAgICAgICAgICAgTVlTUUxfVVNFUjogJ3dwdXNlcicsXG4gICAgICAgICAgICAgIE1ZU1FMX1BBU1NXT1JEOiAnd3BwYXNzJyxcbiAgICAgICAgICAgICAgTVlTUUxfREFUQUJBU0U6ICd3cCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgd29yZHByZXNzOiB7XG4gICAgICAgICAgICBkZXBlbmRzT246IFtcbiAgICAgICAgICAgICAgRG9ja2VyQ29tcG9zZS5zZXJ2aWNlTmFtZSgnZGInKSxcbiAgICAgICAgICAgICAgRG9ja2VyQ29tcG9zZS5zZXJ2aWNlTmFtZSgnc2V0dXAnKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbWFnZTogJ3dvcmRwcmVzczpwaHA3LjQtYXBhY2hlJyxcbiAgICAgICAgICAgIHBvcnRzOiBbXG4gICAgICAgICAgICAgIERvY2tlckNvbXBvc2UucG9ydE1hcHBpbmcoODA4MSwgODApLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHZvbHVtZXM6IFtcbiAgICAgICAgICAgICAgRG9ja2VyQ29tcG9zZS5uYW1lZFZvbHVtZSgndXBsb2FkcycsICcvdmFyL3d3dy9odG1sL3dwLWNvbnRlbnQvdXBsb2FkcycpLFxuICAgICAgICAgICAgICBEb2NrZXJDb21wb3NlLm5hbWVkVm9sdW1lKCdkb2Nyb290JywgJy92YXIvd3d3L2h0bWwnKSxcbiAgICAgICAgICAgICAgRG9ja2VyQ29tcG9zZS5uYW1lZFZvbHVtZSgncGx1Z2lucycsICcvdmFyL3d3dy9odG1sL3dwLWNvbnRlbnQvcGx1Z2lucycpLFxuICAgICAgICAgICAgICBEb2NrZXJDb21wb3NlLm5hbWVkVm9sdW1lKCd0aGVtZXMnLCAnL3Zhci93d3cvaHRtbC93cC1jb250ZW50L3RoZW1lcycpLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgIFdPUkRQUkVTU19EQl9IT1NUOiAnZGInLFxuICAgICAgICAgICAgICBXT1JEUFJFU1NfREJfVVNFUjogJ3dwdXNlcicsXG4gICAgICAgICAgICAgIFdPUkRQUkVTU19EQl9QQVNTV09SRDogJ3dwcGFzcycsXG4gICAgICAgICAgICAgIFdPUkRQUkVTU19EQl9OQU1FOiAnd3AnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChkYy5fc3ludGhlc2l6ZURvY2tlckNvbXBvc2UoKSkudG9FcXVhbChleHBlY3RlZCk7XG5cbiAgICAgIHByb2plY3Quc3ludGgoKTtcbiAgICAgIGFzc2VydERvY2tlckNvbXBvc2VGaWxlVmFsaWRhdGVzKHByb2plY3Qub3V0ZGlyKTtcbiAgICB9KTtcblxuICAgIHRlc3QoJ2ltcGVyYXRpdmVseScsICgpID0+IHtcbiAgICAgIGNvbnN0IHByb2plY3QgPSBuZXcgVGVzdFByb2plY3QoKTtcbiAgICAgIGNvbnN0IGRjID0gbmV3IERvY2tlckNvbXBvc2UocHJvamVjdCk7XG5cbiAgICAgIGNvbnN0IHNldHVwID0gZGMuYWRkU2VydmljZSgnc2V0dXAnLCB7XG4gICAgICAgIGltYWdlOiAnYWxwaW5lJyxcbiAgICAgICAgY29tbWFuZDogWydzaCcsICctYycsICdjaG1vZCBhK3cgLVIgL3VwbG9hZHMnXSxcbiAgICAgICAgdm9sdW1lczogW1xuICAgICAgICAgIERvY2tlckNvbXBvc2UubmFtZWRWb2x1bWUoJ3VwbG9hZHMnLCAnL3VwbG9hZHMnKSxcbiAgICAgICAgXSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYiA9IGRjLmFkZFNlcnZpY2UoJ2RiJywge1xuICAgICAgICBpbWFnZTogJ215c3FsOjgnLFxuICAgICAgICB2b2x1bWVzOiBbXG4gICAgICAgICAgRG9ja2VyQ29tcG9zZS5uYW1lZFZvbHVtZSgnZGF0YWJhc2UnLCAnL3Zhci9saWIvbXlzcWwnKSxcbiAgICAgICAgXSxcbiAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICBNWVNRTF9SQU5ET01fUk9PVF9QQVNTV09SRDogJzEnLFxuICAgICAgICAgIE1ZU1FMX1VTRVI6ICd3cHVzZXInLFxuICAgICAgICAgIE1ZU1FMX1BBU1NXT1JEOiAnd3BwYXNzJyxcbiAgICAgICAgICBNWVNRTF9EQVRBQkFTRTogJ3dwJyxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCB3cCA9IGRjLmFkZFNlcnZpY2UoJ3dvcmRwcmVzcycsIHtcbiAgICAgICAgZGVwZW5kc09uOiBbZGJdLFxuICAgICAgICBpbWFnZTogJ3dvcmRwcmVzczpwaHA3LjQtYXBhY2hlJyxcbiAgICAgICAgcG9ydHM6IFtcbiAgICAgICAgICBEb2NrZXJDb21wb3NlLnBvcnRNYXBwaW5nKDgwODEsIDgwKSxcbiAgICAgICAgXSxcbiAgICAgICAgdm9sdW1lczogW1xuICAgICAgICAgIERvY2tlckNvbXBvc2UubmFtZWRWb2x1bWUoJ3VwbG9hZHMnLCAnL3Zhci93d3cvaHRtbC93cC1jb250ZW50L3VwbG9hZHMnKSxcbiAgICAgICAgXSxcbiAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICBXT1JEUFJFU1NfREJfSE9TVDogJ2RiJyxcbiAgICAgICAgICBXT1JEUFJFU1NfREJfVVNFUjogJ3dwdXNlcicsXG4gICAgICAgICAgV09SRFBSRVNTX0RCX1BBU1NXT1JEOiAnd3BwYXNzJyxcbiAgICAgICAgICBXT1JEUFJFU1NfREJfTkFNRTogJ3dwJyxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICB3cC5hZGREZXBlbmRzT24oc2V0dXApO1xuICAgICAgd3AuYWRkVm9sdW1lKERvY2tlckNvbXBvc2UubmFtZWRWb2x1bWUoJ2RvY3Jvb3QnLCAnL3Zhci93d3cvaHRtbCcpKTtcbiAgICAgIHdwLmFkZFZvbHVtZShEb2NrZXJDb21wb3NlLm5hbWVkVm9sdW1lKCdwbHVnaW5zJywgJy92YXIvd3d3L2h0bWwvd3AtY29udGVudC9wbHVnaW5zJykpO1xuICAgICAgd3AuYWRkVm9sdW1lKERvY2tlckNvbXBvc2UubmFtZWRWb2x1bWUoJ3RoZW1lcycsICcvdmFyL3d3dy9odG1sL3dwLWNvbnRlbnQvdGhlbWVzJykpO1xuXG4gICAgICBleHBlY3QoZGMuX3N5bnRoZXNpemVEb2NrZXJDb21wb3NlKCkpLnRvRXF1YWwoZXhwZWN0ZWQpO1xuXG4gICAgICBwcm9qZWN0LnN5bnRoKCk7XG4gICAgICBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhwcm9qZWN0Lm91dGRpcik7XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmNvbnN0IGhhc0RvY2tlckNvbXBvc2UgPSBjaGlsZF9wcm9jZXNzLnNwYXduU3luYygnZG9ja2VyLWNvbXBvc2UnLCBbJ3ZlcnNpb24nXSkuc3RhdHVzID09PSAwO1xuXG5mdW5jdGlvbiBhc3NlcnREb2NrZXJDb21wb3NlRmlsZVZhbGlkYXRlcyhkaXI6IHN0cmluZykge1xuICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihkaXIsICdkb2NrZXItY29tcG9zZS55bWwnKTtcbiAgZXhwZWN0KGZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpKS50b0JlVHJ1dGh5KCk7XG5cbiAgaWYgKGhhc0RvY2tlckNvbXBvc2UpIHtcbiAgICBjb25zdCByZXMgPSBjaGlsZF9wcm9jZXNzLnNwYXduU3luYygnZG9ja2VyLWNvbXBvc2UnLCBbJy1mJywgZmlsZVBhdGgsICdjb25maWcnXSk7XG4gICAgaWYgKHJlcy5zdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZG9ja2VyLWNvbXBvc2UgZmlsZSBkb2VzIG5vdCB2YWxpZGF0ZTogJHtyZXMuc3RkZXJyLnRvU3RyaW5nKCl9YCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUud2FybignZG9ja2VyLWNvbXBvc2UgaXMgbm90IHByZXNlbnQsIHNvIHdlIGNhbm5vdCB2YWxpZGF0ZSB2aWEgY2xpZW50Jyk7XG4gIH1cbn1cbiJdfQ==