"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dependencies = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path = require("path");
const common_1 = require("../common");
const component_1 = require("../component");
const json_1 = require("../json");
/**
 * (experimental) The `Dependencies` component is responsible to track the list of dependencies a project has, and then used by project types as the model for rendering project-specific dependency manifests such as the dependencies section `package.json` files.
 *
 * To add a dependency you can use a project-type specific API such as
 * `nodeProject.addDeps()` or use the generic API of `project.deps`:
 *
 * @experimental
 */
class Dependencies extends component_1.Component {
    /**
     * (experimental) Adds a dependencies component to the project.
     *
     * @param project The parent project.
     * @experimental
     */
    constructor(project) {
        super(project);
        this._deps = new Array();
        // this is not really required at the moment, but actually quite useful as a
        // checked-in source of truth for dependencies and will potentially be
        // valuable in the future for CLI tools.
        new json_1.JsonFile(project, Dependencies.MANIFEST_FILE, {
            marker: true,
            omitEmpty: true,
            obj: () => this.toJson(),
        });
    }
    /**
     * (experimental) Returns the coordinates of a dependency spec.
     *
     * Given `foo@^3.4.0` returns `{ name: "foo", version: "^3.4.0" }`.
     * Given `bar@npm:@bar/legacy` returns `{ name: "bar", version: "npm:@bar/legacy" }`.
     *
     * @experimental
     */
    static parseDependency(spec) {
        const scope = spec.startsWith('@');
        if (scope) {
            spec = spec.substr(1);
        }
        const [module, ...version] = spec.split('@');
        const name = scope ? `@${module}` : module;
        if (version.length == 0) {
            return { name };
        }
        else {
            return { name, version: version === null || version === void 0 ? void 0 : version.join('@') };
        }
    }
    /**
     * (experimental) A copy of all dependencies recorded for this project.
     *
     * The list is sorted by type->name->version
     *
     * @experimental
     */
    get all() {
        return [...this._deps].sort(compareDeps).map(normalizeDep);
    }
    /**
     * (experimental) Returns a dependency by name.
     *
     * Fails if there is no dependency defined by that name or if `type` is not
     * provided and there is more then one dependency type for this dependency.
     *
     * @param name The name of the dependency.
     * @param type The dependency type.
     * @returns a copy (cannot be modified)
     * @experimental
     */
    getDependency(name, type) {
        const idx = this.tryGetDependencyIndex(name, type);
        if (idx === -1) {
            const msg = type
                ? `there is no ${type} dependency defined on "${name}"`
                : `there is no dependency defined on "${name}"`;
            throw new Error(msg);
        }
        return {
            ...normalizeDep(this._deps[idx]),
        };
    }
    /**
     * (experimental) Adds a dependency to this project.
     *
     * @param spec The dependency spec in the format `MODULE[@VERSION]` where `MODULE` is the package-manager-specific module name and `VERSION` is an optional semantic version requirement (e.g. `^3.4.0`).
     * @param type The type of the dependency.
     * @experimental
     */
    addDependency(spec, type, metadata = {}) {
        this.project.logger.debug(`${type}-dep ${spec}`);
        const dep = {
            ...Dependencies.parseDependency(spec),
            type,
            metadata,
        };
        this._deps.push(dep);
        return dep;
    }
    /**
     * (experimental) Removes a dependency.
     *
     * @param name The name of the module to remove (without the version).
     * @param type The dependency type.
     * @experimental
     */
    removeDependency(name, type) {
        const removeIndex = this.tryGetDependencyIndex(name, type);
        if (removeIndex === -1) {
            return;
        }
        this._deps.splice(removeIndex, 1);
    }
    tryGetDependencyIndex(name, type) {
        const deps = this._deps.filter(d => d.name === name);
        if (deps.length === 0) {
            return -1; // not found
        }
        if (!type) {
            if (deps.length > 1) {
                throw new Error(`"${name}" is defined for multiple dependency types: ${deps.map(d => d.type).join(',')}. Please specify dependency type`);
            }
            type = deps[0].type;
        }
        return this._deps.findIndex(dep => dep.name === name && dep.type === type);
    }
    toJson() {
        if (this._deps.length === 0) {
            return undefined;
        }
        return {
            dependencies: this._deps.sort(compareDeps).map(normalizeDep),
        };
    }
}
exports.Dependencies = Dependencies;
_a = JSII_RTTI_SYMBOL_1;
Dependencies[_a] = { fqn: "projen.deps.Dependencies", version: "0.16.40" };
/**
 * (experimental) The project-relative path of the deps manifest file.
 *
 * @experimental
 */
Dependencies.MANIFEST_FILE = path.posix.join(common_1.PROJEN_DIR, 'deps.json');
function normalizeDep(d) {
    const obj = {};
    for (const [k, v] of Object.entries(d)) {
        if (v == undefined) {
            continue;
        }
        if (typeof (v) === 'object' && Object.keys(v).length === 0) {
            continue;
        }
        if (Array.isArray(v) && v.length === 0) {
            continue;
        }
        obj[k] = v;
    }
    return obj;
}
function compareDeps(d1, d2) {
    return specOf(d1).localeCompare(specOf(d2));
    function specOf(dep) {
        let spec = dep.type + ':' + dep.name;
        if (dep.version) {
            spec += '@' + dep.version;
        }
        return spec;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RlcHMvZGVwZW5kZW5jaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkJBQTZCO0FBQzdCLHNDQUF1QztBQUN2Qyw0Q0FBeUM7QUFDekMsa0NBQW1DOzs7Ozs7Ozs7QUFhbkMsTUFBYSxZQUFhLFNBQVEscUJBQVM7Ozs7Ozs7SUFpQ3pDLFlBQVksT0FBZ0I7UUFDMUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBUEEsVUFBSyxHQUFHLElBQUksS0FBSyxFQUFjLENBQUM7UUFTL0MsNEVBQTRFO1FBQzVFLHNFQUFzRTtRQUN0RSx3Q0FBd0M7UUFDeEMsSUFBSSxlQUFRLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxhQUFhLEVBQUU7WUFDaEQsTUFBTSxFQUFFLElBQUk7WUFDWixTQUFTLEVBQUUsSUFBSTtZQUNmLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1NBQ3pCLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7Ozs7OztJQWhDTSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQVk7UUFDeEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxJQUFJLEtBQUssRUFBRTtZQUNULElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0MsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDM0MsSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUN2QixPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7U0FDakI7YUFBTTtZQUNMLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztTQUM5QztJQUNILENBQUM7Ozs7Ozs7O0lBMEJELElBQVcsR0FBRztRQUNaLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzdELENBQUM7Ozs7Ozs7Ozs7OztJQWNNLGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBcUI7UUFDdEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRCxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNkLE1BQU0sR0FBRyxHQUFHLElBQUk7Z0JBQ2QsQ0FBQyxDQUFDLGVBQWUsSUFBSSwyQkFBMkIsSUFBSSxHQUFHO2dCQUN2RCxDQUFDLENBQUMsc0NBQXNDLElBQUksR0FBRyxDQUFDO1lBRWxELE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEI7UUFFRCxPQUFPO1lBQ0wsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNqQyxDQUFDO0lBQ0osQ0FBQzs7Ozs7Ozs7SUFTTSxhQUFhLENBQUMsSUFBWSxFQUFFLElBQW9CLEVBQUUsV0FBbUMsRUFBRztRQUM3RixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUVqRCxNQUFNLEdBQUcsR0FBZTtZQUN0QixHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO1lBQ3JDLElBQUk7WUFDSixRQUFRO1NBQ1QsQ0FBQztRQUVGLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQzs7Ozs7Ozs7SUFRTSxnQkFBZ0IsQ0FBQyxJQUFZLEVBQUUsSUFBcUI7UUFDekQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRCxJQUFJLFdBQVcsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUN0QixPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVPLHFCQUFxQixDQUFDLElBQVksRUFBRSxJQUFxQjtRQUMvRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNyQixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWTtTQUN4QjtRQUVELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSwrQ0FBK0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7YUFDM0k7WUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUNyQjtRQUVELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFTyxNQUFNO1FBQ1osSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFBRSxPQUFPLFNBQVMsQ0FBQztTQUFFO1FBQ2xELE9BQU87WUFDTCxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztTQUM3RCxDQUFDO0lBQ0osQ0FBQzs7QUE1SUgsb0NBNklDOzs7Ozs7OztBQXpJd0IsMEJBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBMklsRixTQUFTLFlBQVksQ0FBQyxDQUFhO0lBQ2pDLE1BQU0sR0FBRyxHQUFRLEVBQUcsQ0FBQztJQUNyQixLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUN0QyxJQUFJLENBQUMsSUFBSSxTQUFTLEVBQUU7WUFBQyxTQUFTO1NBQUM7UUFDL0IsSUFBSSxPQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUFDLFNBQVM7U0FBQztRQUN0RSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFBQyxTQUFTO1NBQUM7UUFDbkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNaO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsRUFBYyxFQUFFLEVBQWM7SUFDakQsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTVDLFNBQVMsTUFBTSxDQUFDLEdBQWU7UUFDN0IsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNyQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUU7WUFDZixJQUFJLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7U0FDM0I7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFBST0pFTl9ESVIgfSBmcm9tICcuLi9jb21tb24nO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmltcG9ydCB7IEpzb25GaWxlIH0gZnJvbSAnLi4vanNvbic7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi4vcHJvamVjdCc7XG5pbXBvcnQgeyBEZXBlbmRlbmN5LCBEZXBlbmRlbmN5Q29vcmRpbmF0ZXMsIERlcGVuZGVuY3lUeXBlLCBEZXBzTWFuaWZlc3QgfSBmcm9tICcuL21vZGVsJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNQU5JRkVTVF9GSUxFID0gcGF0aC5wb3NpeC5qb2luKFBST0pFTl9ESVIsICdkZXBzLmpzb24nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBzdGF0aWMgcGFyc2VEZXBlbmRlbmN5KHNwZWM6IHN0cmluZyk6IERlcGVuZGVuY3lDb29yZGluYXRlcyB7XG4gICAgY29uc3Qgc2NvcGUgPSBzcGVjLnN0YXJ0c1dpdGgoJ0AnKTtcbiAgICBpZiAoc2NvcGUpIHtcbiAgICAgIHNwZWMgPSBzcGVjLnN1YnN0cigxKTtcbiAgICB9XG5cbiAgICBjb25zdCBbbW9kdWxlLCAuLi52ZXJzaW9uXSA9IHNwZWMuc3BsaXQoJ0AnKTtcbiAgICBjb25zdCBuYW1lID0gc2NvcGUgPyBgQCR7bW9kdWxlfWAgOiBtb2R1bGU7XG4gICAgaWYgKHZlcnNpb24ubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiB7IG5hbWUgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgbmFtZSwgdmVyc2lvbjogdmVyc2lvbj8uam9pbignQCcpIH07XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZGVwcyA9IG5ldyBBcnJheTxEZXBlbmRlbmN5PigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQcm9qZWN0KSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICAvLyB0aGlzIGlzIG5vdCByZWFsbHkgcmVxdWlyZWQgYXQgdGhlIG1vbWVudCwgYnV0IGFjdHVhbGx5IHF1aXRlIHVzZWZ1bCBhcyBhXG4gICAgLy8gY2hlY2tlZC1pbiBzb3VyY2Ugb2YgdHJ1dGggZm9yIGRlcGVuZGVuY2llcyBhbmQgd2lsbCBwb3RlbnRpYWxseSBiZVxuICAgIC8vIHZhbHVhYmxlIGluIHRoZSBmdXR1cmUgZm9yIENMSSB0b29scy5cbiAgICBuZXcgSnNvbkZpbGUocHJvamVjdCwgRGVwZW5kZW5jaWVzLk1BTklGRVNUX0ZJTEUsIHtcbiAgICAgIG1hcmtlcjogdHJ1ZSxcbiAgICAgIG9taXRFbXB0eTogdHJ1ZSxcbiAgICAgIG9iajogKCkgPT4gdGhpcy50b0pzb24oKSxcbiAgICB9KTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgZ2V0IGFsbCgpOiBEZXBlbmRlbmN5W10ge1xuICAgIHJldHVybiBbLi4udGhpcy5fZGVwc10uc29ydChjb21wYXJlRGVwcykubWFwKG5vcm1hbGl6ZURlcCk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgZ2V0RGVwZW5kZW5jeShuYW1lOiBzdHJpbmcsIHR5cGU/OiBEZXBlbmRlbmN5VHlwZSk6IERlcGVuZGVuY3kge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMudHJ5R2V0RGVwZW5kZW5jeUluZGV4KG5hbWUsIHR5cGUpO1xuICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICBjb25zdCBtc2cgPSB0eXBlXG4gICAgICAgID8gYHRoZXJlIGlzIG5vICR7dHlwZX0gZGVwZW5kZW5jeSBkZWZpbmVkIG9uIFwiJHtuYW1lfVwiYFxuICAgICAgICA6IGB0aGVyZSBpcyBubyBkZXBlbmRlbmN5IGRlZmluZWQgb24gXCIke25hbWV9XCJgO1xuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgLi4ubm9ybWFsaXplRGVwKHRoaXMuX2RlcHNbaWR4XSksXG4gICAgfTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGREZXBlbmRlbmN5KHNwZWM6IHN0cmluZywgdHlwZTogRGVwZW5kZW5jeVR5cGUsIG1ldGFkYXRhOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0geyB9KTogRGVwZW5kZW5jeSB7XG4gICAgdGhpcy5wcm9qZWN0LmxvZ2dlci5kZWJ1ZyhgJHt0eXBlfS1kZXAgJHtzcGVjfWApO1xuXG4gICAgY29uc3QgZGVwOiBEZXBlbmRlbmN5ID0ge1xuICAgICAgLi4uRGVwZW5kZW5jaWVzLnBhcnNlRGVwZW5kZW5jeShzcGVjKSxcbiAgICAgIHR5cGUsXG4gICAgICBtZXRhZGF0YSxcbiAgICB9O1xuXG4gICAgdGhpcy5fZGVwcy5wdXNoKGRlcCk7XG5cbiAgICByZXR1cm4gZGVwO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZW1vdmVEZXBlbmRlbmN5KG5hbWU6IHN0cmluZywgdHlwZT86IERlcGVuZGVuY3lUeXBlKSB7XG4gICAgY29uc3QgcmVtb3ZlSW5kZXggPSB0aGlzLnRyeUdldERlcGVuZGVuY3lJbmRleChuYW1lLCB0eXBlKTtcbiAgICBpZiAocmVtb3ZlSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZGVwcy5zcGxpY2UocmVtb3ZlSW5kZXgsIDEpO1xuICB9XG5cbiAgcHJpdmF0ZSB0cnlHZXREZXBlbmRlbmN5SW5kZXgobmFtZTogc3RyaW5nLCB0eXBlPzogRGVwZW5kZW5jeVR5cGUpOiBudW1iZXIge1xuICAgIGNvbnN0IGRlcHMgPSB0aGlzLl9kZXBzLmZpbHRlcihkID0+IGQubmFtZSA9PT0gbmFtZSk7XG4gICAgaWYgKGRlcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTE7IC8vIG5vdCBmb3VuZFxuICAgIH1cblxuICAgIGlmICghdHlwZSkge1xuICAgICAgaWYgKGRlcHMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtuYW1lfVwiIGlzIGRlZmluZWQgZm9yIG11bHRpcGxlIGRlcGVuZGVuY3kgdHlwZXM6ICR7ZGVwcy5tYXAoZCA9PiBkLnR5cGUpLmpvaW4oJywnKX0uIFBsZWFzZSBzcGVjaWZ5IGRlcGVuZGVuY3kgdHlwZWApO1xuICAgICAgfVxuXG4gICAgICB0eXBlID0gZGVwc1swXS50eXBlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9kZXBzLmZpbmRJbmRleChkZXAgPT4gZGVwLm5hbWUgPT09IG5hbWUgJiYgZGVwLnR5cGUgPT09IHR5cGUpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b0pzb24oKTogRGVwc01hbmlmZXN0IHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodGhpcy5fZGVwcy5sZW5ndGggPT09IDApIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuICAgIHJldHVybiB7XG4gICAgICBkZXBlbmRlbmNpZXM6IHRoaXMuX2RlcHMuc29ydChjb21wYXJlRGVwcykubWFwKG5vcm1hbGl6ZURlcCksXG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVEZXAoZDogRGVwZW5kZW5jeSkge1xuICBjb25zdCBvYmo6IGFueSA9IHsgfTtcbiAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoZCkpIHtcbiAgICBpZiAodiA9PSB1bmRlZmluZWQpIHtjb250aW51ZTt9XG4gICAgaWYgKHR5cGVvZih2KSA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LmtleXModikubGVuZ3RoID09PSAwKSB7Y29udGludWU7fVxuICAgIGlmIChBcnJheS5pc0FycmF5KHYpICYmIHYubGVuZ3RoID09PSAwKSB7Y29udGludWU7fVxuICAgIG9ialtrXSA9IHY7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBjb21wYXJlRGVwcyhkMTogRGVwZW5kZW5jeSwgZDI6IERlcGVuZGVuY3kpIHtcbiAgcmV0dXJuIHNwZWNPZihkMSkubG9jYWxlQ29tcGFyZShzcGVjT2YoZDIpKTtcblxuICBmdW5jdGlvbiBzcGVjT2YoZGVwOiBEZXBlbmRlbmN5KSB7XG4gICAgbGV0IHNwZWMgPSBkZXAudHlwZSArICc6JyArIGRlcC5uYW1lO1xuICAgIGlmIChkZXAudmVyc2lvbikge1xuICAgICAgc3BlYyArPSAnQCcgKyBkZXAudmVyc2lvbjtcbiAgICB9XG4gICAgcmV0dXJuIHNwZWM7XG4gIH1cbn1cblxuIl19