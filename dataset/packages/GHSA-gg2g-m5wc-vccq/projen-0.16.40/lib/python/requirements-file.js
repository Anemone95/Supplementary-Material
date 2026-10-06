"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirementsFile = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const deps_1 = require("../deps");
const file_1 = require("../file");
const semver_1 = require("../util/semver");
/**
 * (experimental) Specifies a list of packages to be installed using pip.
 *
 * @see https://pip.pypa.io/en/stable/reference/pip_install/#requirements-file-format
 * @experimental
 */
class RequirementsFile extends file_1.FileBase {
    /**
     * @experimental
     */
    constructor(project, filePath, options) {
        super(project, filePath);
        this.packages = new Array();
        this.packageProvider = options.packageProvider;
    }
    /**
     * (experimental) Adds the specified packages provided in semver format.
     *
     * Comment lines (start with `#`) are ignored.
     *
     * @param packages Package version in format `<module>@<semver>`.
     * @experimental
     */
    addPackages(...packages) {
        for (let pkg of packages) {
            if (pkg.startsWith('#')) {
                this.packages.push(pkg);
            }
            else {
                const { name, version } = deps_1.Dependencies.parseDependency(pkg);
                if (version) {
                    this.packages.push(`${name}${semver_1.toPythonVersionRange(version)}`);
                }
                else {
                    this.packages.push(name);
                }
            }
        }
    }
    formatDependency(dep) {
        if (dep.version) {
            return `${dep.name}${semver_1.toPythonVersionRange(dep.version)}`;
        }
        else {
            return dep.name;
        }
    }
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    synthesizeContent(resolver) {
        const allPackages = [...this.packages];
        if (this.packageProvider) {
            allPackages.push(...this.packageProvider.packages.map(dep => this.formatDependency(dep)));
        }
        return `${resolver.resolve([
            `# ${file_1.FileBase.PROJEN_MARKER}`,
            ...allPackages,
        ]).join('\n')}\n`;
    }
}
exports.RequirementsFile = RequirementsFile;
_a = JSII_RTTI_SYMBOL_1;
RequirementsFile[_a] = { fqn: "projen.python.RequirementsFile", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWlyZW1lbnRzLWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHl0aG9uL3JlcXVpcmVtZW50cy1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0NBQThEO0FBQzlELGtDQUE4QztBQUU5QywyQ0FBc0Q7Ozs7Ozs7QUFldEQsTUFBYSxnQkFBaUIsU0FBUSxlQUFROzs7O0lBSTVDLFlBQVksT0FBZ0IsRUFBRSxRQUFnQixFQUFFLE9BQWdDO1FBQzlFLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFKVixhQUFRLEdBQUcsSUFBSSxLQUFLLEVBQVUsQ0FBQztRQU05QyxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUM7SUFDakQsQ0FBQzs7Ozs7Ozs7O0lBU00sV0FBVyxDQUFDLEdBQUcsUUFBa0I7UUFDdEMsS0FBSyxJQUFJLEdBQUcsSUFBSSxRQUFRLEVBQUU7WUFDeEIsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN6QjtpQkFBTTtnQkFDTCxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLG1CQUFZLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLE9BQU8sRUFBRTtvQkFDWCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyw2QkFBb0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQy9EO3FCQUFNO29CQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMxQjthQUNGO1NBQ0Y7SUFDSCxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsR0FBMEI7UUFDakQsSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFO1lBQ2YsT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsNkJBQW9CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7U0FDMUQ7YUFBTTtZQUNMLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztTQUNqQjtJQUNILENBQUM7Ozs7OztJQUVTLGlCQUFpQixDQUFDLFFBQW1CO1FBQzdDLE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3hCLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNGO1FBRUQsT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7WUFDekIsS0FBSyxlQUFRLENBQUMsYUFBYSxFQUFFO1lBQzdCLEdBQUcsV0FBVztTQUNmLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNwQixDQUFDOztBQWxESCw0Q0FtREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZXBlbmRlbmNpZXMsIERlcGVuZGVuY3lDb29yZGluYXRlcyB9IGZyb20gJy4uL2RlcHMnO1xuaW1wb3J0IHsgRmlsZUJhc2UsIElSZXNvbHZlciB9IGZyb20gJy4uL2ZpbGUnO1xuaW1wb3J0IHsgUHJvamVjdCB9IGZyb20gJy4uL3Byb2plY3QnO1xuaW1wb3J0IHsgdG9QeXRob25WZXJzaW9uUmFuZ2UgfSBmcm9tICcuLi91dGlsL3NlbXZlcic7XG5pbXBvcnQgeyBJUGFja2FnZVByb3ZpZGVyIH0gZnJvbSAnLi9weXRob24tZGVwcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWlyZW1lbnRzRmlsZU9wdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBwYWNrYWdlUHJvdmlkZXI/OiBJUGFja2FnZVByb3ZpZGVyO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFJlcXVpcmVtZW50c0ZpbGUgZXh0ZW5kcyBGaWxlQmFzZSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgcGFja2FnZXMgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IHBhY2thZ2VQcm92aWRlcj86IElQYWNrYWdlUHJvdmlkZXI7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogUHJvamVjdCwgZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczogUmVxdWlyZW1lbnRzRmlsZU9wdGlvbnMpIHtcbiAgICBzdXBlcihwcm9qZWN0LCBmaWxlUGF0aCk7XG5cbiAgICB0aGlzLnBhY2thZ2VQcm92aWRlciA9IG9wdGlvbnMucGFja2FnZVByb3ZpZGVyO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGRQYWNrYWdlcyguLi5wYWNrYWdlczogc3RyaW5nW10pIHtcbiAgICBmb3IgKGxldCBwa2cgb2YgcGFja2FnZXMpIHtcbiAgICAgIGlmIChwa2cuc3RhcnRzV2l0aCgnIycpKSB7XG4gICAgICAgIHRoaXMucGFja2FnZXMucHVzaChwa2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBuYW1lLCB2ZXJzaW9uIH0gPSBEZXBlbmRlbmNpZXMucGFyc2VEZXBlbmRlbmN5KHBrZyk7XG4gICAgICAgIGlmICh2ZXJzaW9uKSB7XG4gICAgICAgICAgdGhpcy5wYWNrYWdlcy5wdXNoKGAke25hbWV9JHt0b1B5dGhvblZlcnNpb25SYW5nZSh2ZXJzaW9uKX1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnBhY2thZ2VzLnB1c2gobmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZvcm1hdERlcGVuZGVuY3koZGVwOiBEZXBlbmRlbmN5Q29vcmRpbmF0ZXMpIHtcbiAgICBpZiAoZGVwLnZlcnNpb24pIHtcbiAgICAgIHJldHVybiBgJHtkZXAubmFtZX0ke3RvUHl0aG9uVmVyc2lvblJhbmdlKGRlcC52ZXJzaW9uKX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZGVwLm5hbWU7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIHN5bnRoZXNpemVDb250ZW50KHJlc29sdmVyOiBJUmVzb2x2ZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGFsbFBhY2thZ2VzID0gWy4uLnRoaXMucGFja2FnZXNdO1xuICAgIGlmICh0aGlzLnBhY2thZ2VQcm92aWRlcikge1xuICAgICAgYWxsUGFja2FnZXMucHVzaCguLi50aGlzLnBhY2thZ2VQcm92aWRlci5wYWNrYWdlcy5tYXAoZGVwID0+IHRoaXMuZm9ybWF0RGVwZW5kZW5jeShkZXApKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAke3Jlc29sdmVyLnJlc29sdmUoW1xuICAgICAgYCMgJHtGaWxlQmFzZS5QUk9KRU5fTUFSS0VSfWAsXG4gICAgICAuLi5hbGxQYWNrYWdlcyxcbiAgICBdKS5qb2luKCdcXG4nKX1cXG5gO1xuICB9XG59XG4iXX0=