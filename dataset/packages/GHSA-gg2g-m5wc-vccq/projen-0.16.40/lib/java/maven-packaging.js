"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MavenPackaging = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const tasks_1 = require("../tasks");
/**
 * (experimental) Configures a maven project to produce a .jar archive with sources and javadocs.
 *
 * @experimental
 */
class MavenPackaging extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, pom, options = {}) {
        var _b, _c, _d;
        super(project);
        pom.addPlugin('org.apache.maven.plugins/maven-jar-plugin@3.2.0', {
            configuration: {
                archive: {
                    index: true,
                    manifest: {
                        addDefaultImplementationEntries: true,
                        addDefaultSpecificationEntries: true,
                    },
                },
            },
        });
        if ((_b = options.sources) !== null && _b !== void 0 ? _b : true) {
            pom.addPlugin('org.apache.maven.plugins/maven-source-plugin@3.2.1', {
                executions: [
                    { id: 'attach-sources', goals: ['jar'] },
                ],
            });
        }
        if ((_c = options.javadocs) !== null && _c !== void 0 ? _c : true) {
            pom.addPlugin('org.apache.maven.plugins/maven-javadoc-plugin@3.2.0', {
                executions: [
                    { id: 'attach-javadocs', goals: ['jar'] },
                ],
                configuration: {
                    failOnError: false,
                    show: 'protected',
                    sourceFileExcludes: { exclude: options.javadocsExclude },
                    detectJavaApiLink: false,
                    additionalJOptions: {
                        additionalJOption: [
                            '-J-XX:+TieredCompilation',
                            '-J-XX:TieredStopAtLevel=1',
                        ],
                    },
                },
            });
        }
        const env = {
            MAVEN_OPTS: '-XX:+TieredCompilation -XX:TieredStopAtLevel=1',
        };
        const distdir = (_d = options.distdir) !== null && _d !== void 0 ? _d : 'dist/java';
        this.task = project.addTask('package', {
            category: tasks_1.TaskCategory.RELEASE,
            description: `Creates a java deployment package under ${distdir}`,
            env,
        });
        this.task.exec(`mkdir -p ${distdir}`);
        this.task.exec(`mvn deploy -D=altDeploymentRepository=local::default::file:///$PWD/${distdir}`);
        project.gitignore.exclude(distdir);
    }
}
exports.MavenPackaging = MavenPackaging;
_a = JSII_RTTI_SYMBOL_1;
MavenPackaging[_a] = { fqn: "projen.java.MavenPackaging", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF2ZW4tcGFja2FnaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2phdmEvbWF2ZW4tcGFja2FnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNENBQXlDO0FBRXpDLG9DQUE4Qzs7Ozs7O0FBbUM5QyxNQUFhLGNBQWUsU0FBUSxxQkFBUzs7OztJQU0zQyxZQUFZLE9BQWdCLEVBQUUsR0FBUSxFQUFFLFVBQWlDLEVBQUU7O1FBQ3pFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLEdBQUcsQ0FBQyxTQUFTLENBQUMsaURBQWlELEVBQUU7WUFDL0QsYUFBYSxFQUFFO2dCQUNiLE9BQU8sRUFBRTtvQkFDUCxLQUFLLEVBQUUsSUFBSTtvQkFDWCxRQUFRLEVBQUU7d0JBQ1IsK0JBQStCLEVBQUUsSUFBSTt3QkFDckMsOEJBQThCLEVBQUUsSUFBSTtxQkFDckM7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILFVBQUksT0FBTyxDQUFDLE9BQU8sbUNBQUksSUFBSSxFQUFFO1lBQzNCLEdBQUcsQ0FBQyxTQUFTLENBQUMsb0RBQW9ELEVBQUU7Z0JBQ2xFLFVBQVUsRUFBRTtvQkFDVixFQUFFLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTtpQkFDekM7YUFDRixDQUFDLENBQUM7U0FDSjtRQUVELFVBQUksT0FBTyxDQUFDLFFBQVEsbUNBQUksSUFBSSxFQUFFO1lBQzVCLEdBQUcsQ0FBQyxTQUFTLENBQUMscURBQXFELEVBQUU7Z0JBQ25FLFVBQVUsRUFBRTtvQkFDVixFQUFFLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTtpQkFDMUM7Z0JBQ0QsYUFBYSxFQUFFO29CQUNiLFdBQVcsRUFBRSxLQUFLO29CQUNsQixJQUFJLEVBQUUsV0FBVztvQkFDakIsa0JBQWtCLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLGVBQWUsRUFBRTtvQkFDeEQsaUJBQWlCLEVBQUUsS0FBSztvQkFDeEIsa0JBQWtCLEVBQUU7d0JBQ2xCLGlCQUFpQixFQUFFOzRCQUNqQiwwQkFBMEI7NEJBQzFCLDJCQUEyQjt5QkFDNUI7cUJBQ0Y7aUJBQ0Y7YUFDRixDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sR0FBRyxHQUFHO1lBQ1YsVUFBVSxFQUFFLGdEQUFnRDtTQUM3RCxDQUFDO1FBRUYsTUFBTSxPQUFPLFNBQUcsT0FBTyxDQUFDLE9BQU8sbUNBQUksV0FBVyxDQUFDO1FBQy9DLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDckMsUUFBUSxFQUFFLG9CQUFZLENBQUMsT0FBTztZQUM5QixXQUFXLEVBQUUsMkNBQTJDLE9BQU8sRUFBRTtZQUNqRSxHQUFHO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRWhHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JDLENBQUM7O0FBL0RILHdDQWdFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi4vcHJvamVjdCc7XG5pbXBvcnQgeyBUYXNrLCBUYXNrQ2F0ZWdvcnkgfSBmcm9tICcuLi90YXNrcyc7XG5pbXBvcnQgeyBQb20gfSBmcm9tICcuL3BvbSc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIE1hdmVuUGFja2FnaW5nT3B0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHNvdXJjZXM/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkaXN0ZGlyPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBqYXZhZG9jcz86IGJvb2xlYW47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGphdmFkb2NzRXhjbHVkZT86IHN0cmluZ1tdO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBNYXZlblBhY2thZ2luZyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHRhc2s6IFRhc2s7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogUHJvamVjdCwgcG9tOiBQb20sIG9wdGlvbnM6IE1hdmVuUGFja2FnaW5nT3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICBwb20uYWRkUGx1Z2luKCdvcmcuYXBhY2hlLm1hdmVuLnBsdWdpbnMvbWF2ZW4tamFyLXBsdWdpbkAzLjIuMCcsIHtcbiAgICAgIGNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgYXJjaGl2ZToge1xuICAgICAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgICAgICBhZGREZWZhdWx0SW1wbGVtZW50YXRpb25FbnRyaWVzOiB0cnVlLFxuICAgICAgICAgICAgYWRkRGVmYXVsdFNwZWNpZmljYXRpb25FbnRyaWVzOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgaWYgKG9wdGlvbnMuc291cmNlcyA/PyB0cnVlKSB7XG4gICAgICBwb20uYWRkUGx1Z2luKCdvcmcuYXBhY2hlLm1hdmVuLnBsdWdpbnMvbWF2ZW4tc291cmNlLXBsdWdpbkAzLjIuMScsIHtcbiAgICAgICAgZXhlY3V0aW9uczogW1xuICAgICAgICAgIHsgaWQ6ICdhdHRhY2gtc291cmNlcycsIGdvYWxzOiBbJ2phciddIH0sXG4gICAgICAgIF0sXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5qYXZhZG9jcyA/PyB0cnVlKSB7XG4gICAgICBwb20uYWRkUGx1Z2luKCdvcmcuYXBhY2hlLm1hdmVuLnBsdWdpbnMvbWF2ZW4tamF2YWRvYy1wbHVnaW5AMy4yLjAnLCB7XG4gICAgICAgIGV4ZWN1dGlvbnM6IFtcbiAgICAgICAgICB7IGlkOiAnYXR0YWNoLWphdmFkb2NzJywgZ29hbHM6IFsnamFyJ10gfSxcbiAgICAgICAgXSxcbiAgICAgICAgY29uZmlndXJhdGlvbjoge1xuICAgICAgICAgIGZhaWxPbkVycm9yOiBmYWxzZSxcbiAgICAgICAgICBzaG93OiAncHJvdGVjdGVkJyxcbiAgICAgICAgICBzb3VyY2VGaWxlRXhjbHVkZXM6IHsgZXhjbHVkZTogb3B0aW9ucy5qYXZhZG9jc0V4Y2x1ZGUgfSxcbiAgICAgICAgICBkZXRlY3RKYXZhQXBpTGluazogZmFsc2UsIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS82MTg4NDI2N1xuICAgICAgICAgIGFkZGl0aW9uYWxKT3B0aW9uczoge1xuICAgICAgICAgICAgYWRkaXRpb25hbEpPcHRpb246IFtcbiAgICAgICAgICAgICAgJy1KLVhYOitUaWVyZWRDb21waWxhdGlvbicsXG4gICAgICAgICAgICAgICctSi1YWDpUaWVyZWRTdG9wQXRMZXZlbD0xJyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGVudiA9IHtcbiAgICAgIE1BVkVOX09QVFM6ICctWFg6K1RpZXJlZENvbXBpbGF0aW9uIC1YWDpUaWVyZWRTdG9wQXRMZXZlbD0xJyxcbiAgICB9O1xuXG4gICAgY29uc3QgZGlzdGRpciA9IG9wdGlvbnMuZGlzdGRpciA/PyAnZGlzdC9qYXZhJztcbiAgICB0aGlzLnRhc2sgPSBwcm9qZWN0LmFkZFRhc2soJ3BhY2thZ2UnLCB7XG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LlJFTEVBU0UsXG4gICAgICBkZXNjcmlwdGlvbjogYENyZWF0ZXMgYSBqYXZhIGRlcGxveW1lbnQgcGFja2FnZSB1bmRlciAke2Rpc3RkaXJ9YCxcbiAgICAgIGVudixcbiAgICB9KTtcbiAgICB0aGlzLnRhc2suZXhlYyhgbWtkaXIgLXAgJHtkaXN0ZGlyfWApO1xuICAgIHRoaXMudGFzay5leGVjKGBtdm4gZGVwbG95IC1EPWFsdERlcGxveW1lbnRSZXBvc2l0b3J5PWxvY2FsOjpkZWZhdWx0OjpmaWxlOi8vLyRQV0QvJHtkaXN0ZGlyfWApO1xuXG4gICAgcHJvamVjdC5naXRpZ25vcmUuZXhjbHVkZShkaXN0ZGlyKTtcbiAgfVxufSJdfQ==