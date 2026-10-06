"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Venv = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path = require("path");
const fs = require("fs-extra");
const component_1 = require("../component");
const util_1 = require("../util");
/**
 * (experimental) Manages a virtual environment through the Python venv module.
 *
 * @experimental
 */
class Venv extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options = {}) {
        var _b;
        super(project);
        this.envdir = (_b = options.envdir) !== null && _b !== void 0 ? _b : '.env';
        this.project.gitignore.exclude(`/${this.envdir}`);
        this.project.tasks.addEnvironment('VIRTUAL_ENV', `$(echo $PWD/${this.envdir})`);
        this.project.tasks.addEnvironment('PATH', `$(echo $PWD/${this.envdir}/bin:$PATH)`);
    }
    /**
     * (experimental) Initializes the virtual environment if it doesn't exist (called during post-synthesis).
     *
     * @experimental
     */
    setupEnvironment() {
        const absoluteEnvdir = path.join(this.project.outdir, this.envdir);
        if (!fs.pathExistsSync(absoluteEnvdir)) {
            this.project.logger.info('Setting up a virtual environment...');
            util_1.exec(`python -m venv ${this.envdir}`, { cwd: this.project.outdir });
            this.project.logger.info(`Environment successfully created (located in ./${this.envdir}).`);
        }
    }
}
exports.Venv = Venv;
_a = JSII_RTTI_SYMBOL_1;
Venv[_a] = { fqn: "projen.python.Venv", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVudi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9weXRob24vdmVudi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZCQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IsNENBQXlDO0FBQ3pDLGtDQUErQjs7Ozs7O0FBbUIvQixNQUFhLElBQUssU0FBUSxxQkFBUzs7OztJQU1qQyxZQUFZLE9BQXNCLEVBQUUsVUFBdUIsRUFBRTs7UUFDM0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsSUFBSSxDQUFDLE1BQU0sU0FBRyxPQUFPLENBQUMsTUFBTSxtQ0FBSSxNQUFNLENBQUM7UUFFdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxlQUFlLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZUFBZSxJQUFJLENBQUMsTUFBTSxhQUFhLENBQUMsQ0FBQztJQUNyRixDQUFDOzs7Ozs7SUFLTSxnQkFBZ0I7UUFDckIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFDaEUsV0FBSSxDQUFDLGtCQUFrQixJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrREFBa0QsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7U0FDN0Y7SUFDSCxDQUFDOztBQTNCSCxvQkE0QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmltcG9ydCB7IGV4ZWMgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IElQeXRob25FbnYgfSBmcm9tICcuL3B5dGhvbi1lbnYnO1xuaW1wb3J0IHsgUHl0aG9uUHJvamVjdCB9IGZyb20gJy4vcHl0aG9uLXByb2plY3QnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIFZlbnZPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgZW52ZGlyPzogc3RyaW5nO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBWZW52IGV4dGVuZHMgQ29tcG9uZW50IGltcGxlbWVudHMgSVB5dGhvbkVudiB7XG4gIC8qKlxuICAgKiBOYW1lIG9mIGRpcmVjdG9yeSB0byBzdG9yZSB0aGUgZW52aXJvbm1lbnQgaW5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgZW52ZGlyOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogUHl0aG9uUHJvamVjdCwgb3B0aW9uczogVmVudk9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKHByb2plY3QpO1xuXG4gICAgdGhpcy5lbnZkaXIgPSBvcHRpb25zLmVudmRpciA/PyAnLmVudic7XG5cbiAgICB0aGlzLnByb2plY3QuZ2l0aWdub3JlLmV4Y2x1ZGUoYC8ke3RoaXMuZW52ZGlyfWApO1xuXG4gICAgdGhpcy5wcm9qZWN0LnRhc2tzLmFkZEVudmlyb25tZW50KCdWSVJUVUFMX0VOVicsIGAkKGVjaG8gJFBXRC8ke3RoaXMuZW52ZGlyfSlgKTtcbiAgICB0aGlzLnByb2plY3QudGFza3MuYWRkRW52aXJvbm1lbnQoJ1BBVEgnLCBgJChlY2hvICRQV0QvJHt0aGlzLmVudmRpcn0vYmluOiRQQVRIKWApO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBzZXR1cEVudmlyb25tZW50KCkge1xuICAgIGNvbnN0IGFic29sdXRlRW52ZGlyID0gcGF0aC5qb2luKHRoaXMucHJvamVjdC5vdXRkaXIsIHRoaXMuZW52ZGlyKTtcbiAgICBpZiAoIWZzLnBhdGhFeGlzdHNTeW5jKGFic29sdXRlRW52ZGlyKSkge1xuICAgICAgdGhpcy5wcm9qZWN0LmxvZ2dlci5pbmZvKCdTZXR0aW5nIHVwIGEgdmlydHVhbCBlbnZpcm9ubWVudC4uLicpO1xuICAgICAgZXhlYyhgcHl0aG9uIC1tIHZlbnYgJHt0aGlzLmVudmRpcn1gLCB7IGN3ZDogdGhpcy5wcm9qZWN0Lm91dGRpciB9KTtcbiAgICAgIHRoaXMucHJvamVjdC5sb2dnZXIuaW5mbyhgRW52aXJvbm1lbnQgc3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgKGxvY2F0ZWQgaW4gLi8ke3RoaXMuZW52ZGlyfSkuYCk7XG4gICAgfVxuICB9XG59XG4iXX0=