"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tasks = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path = require("path");
const common_1 = require("../common");
const component_1 = require("../component");
const json_1 = require("../json");
const task_1 = require("./task");
/**
 * (experimental) Defines project tasks.
 *
 * Tasks extend the projen CLI by adding subcommands to it. Task definitions are
 * synthesized into `.projen/tasks.json`.
 *
 * @experimental
 */
class Tasks extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project) {
        super(project);
        const manifestFile = Tasks.MANIFEST_FILE;
        this._tasks = {};
        this._env = {};
        new json_1.JsonFile(project, manifestFile, {
            marker: true,
            omitEmpty: true,
            obj: {
                tasks: (() => this.renderTasks()),
                env: (() => this._env),
            },
        });
    }
    /**
     * (experimental) All tasks.
     *
     * @experimental
     */
    get all() {
        return Object.values(this._tasks);
    }
    /**
     * (experimental) Adds a task to a project.
     *
     * @param name The name of the task.
     * @param options Task options.
     * @experimental
     */
    addTask(name, options = {}) {
        const task = new task_1.Task(this, name, options);
        this._tasks[name] = task;
        return task;
    }
    /**
     * (experimental) Adds global environment.
     *
     * @param name Environment variable name.
     * @param value Value.
     * @experimental
     */
    addEnvironment(name, value) {
        this._env[name] = value;
    }
    /**
     * (experimental) Returns a copy of the currently global environment for this project.
     *
     * @experimental
     */
    get env() {
        return {
            ...this._env,
        };
    }
    /**
     * (experimental) Finds a task by name.
     *
     * Returns `undefined` if the task cannot be found.
     *
     * @param name The name of the task.
     * @experimental
     */
    tryFind(name) {
        return this._tasks[name];
    }
    renderTasks() {
        const tasks = {};
        for (const task of Object.values(this._tasks)) {
            tasks[task.name] = task._renderSpec();
        }
        return tasks;
    }
}
exports.Tasks = Tasks;
_a = JSII_RTTI_SYMBOL_1;
Tasks[_a] = { fqn: "projen.tasks.Tasks", version: "0.16.40" };
/**
 * (experimental) The project-relative path of the tasks manifest file.
 *
 * @experimental
 */
Tasks.MANIFEST_FILE = path.posix.join(common_1.PROJEN_DIR, 'tasks.json');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGFza3MvdGFza3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2QkFBNkI7QUFDN0Isc0NBQXVDO0FBQ3ZDLDRDQUF5QztBQUN6QyxrQ0FBbUM7QUFHbkMsaUNBQTJDOzs7Ozs7Ozs7QUFRM0MsTUFBYSxLQUFNLFNBQVEscUJBQVM7Ozs7SUFTbEMsWUFBWSxPQUFnQjtRQUMxQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFZixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWYsSUFBSSxlQUFRLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRTtZQUNsQyxNQUFNLEVBQUUsSUFBSTtZQUNaLFNBQVMsRUFBRSxJQUFJO1lBQ2YsR0FBRyxFQUFFO2dCQUNILEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBUTtnQkFDeEMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBUTthQUNiO1NBQ25CLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7OztJQUtELElBQVcsR0FBRztRQUNaLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsQ0FBQzs7Ozs7Ozs7SUFPTSxPQUFPLENBQUMsSUFBWSxFQUFFLFVBQXVCLEVBQUU7UUFDcEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxXQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Ozs7Ozs7O0lBT00sY0FBYyxDQUFDLElBQVksRUFBRSxLQUFhO1FBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7Ozs7OztJQUtELElBQVcsR0FBRztRQUNaLE9BQU87WUFDTCxHQUFHLElBQUksQ0FBQyxJQUFJO1NBQ2IsQ0FBQztJQUNKLENBQUM7Ozs7Ozs7OztJQU1NLE9BQU8sQ0FBQyxJQUFZO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRU8sV0FBVztRQUNqQixNQUFNLEtBQUssR0FBaUMsRUFBRSxDQUFDO1FBQy9DLEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDN0MsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDdkM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7O0FBN0VILHNCQThFQzs7Ozs7Ozs7QUExRXdCLG1CQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBQUk9KRU5fRElSIH0gZnJvbSAnLi4vY29tbW9uJztcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBKc29uRmlsZSB9IGZyb20gJy4uL2pzb24nO1xuaW1wb3J0IHsgUHJvamVjdCB9IGZyb20gJy4uL3Byb2plY3QnO1xuaW1wb3J0IHsgVGFza3NNYW5pZmVzdCwgVGFza1NwZWMgfSBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7IFRhc2ssIFRhc2tPcHRpb25zIH0gZnJvbSAnLi90YXNrJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgVGFza3MgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1BTklGRVNUX0ZJTEUgPSBwYXRoLnBvc2l4LmpvaW4oUFJPSkVOX0RJUiwgJ3Rhc2tzLmpzb24nKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF90YXNrczogeyBbbmFtZTogc3RyaW5nXTogVGFzayB9O1xuICBwcml2YXRlIHJlYWRvbmx5IF9lbnY6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFByb2plY3QpIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIGNvbnN0IG1hbmlmZXN0RmlsZSA9IFRhc2tzLk1BTklGRVNUX0ZJTEU7XG4gICAgdGhpcy5fdGFza3MgPSB7fTtcbiAgICB0aGlzLl9lbnYgPSB7fTtcblxuICAgIG5ldyBKc29uRmlsZShwcm9qZWN0LCBtYW5pZmVzdEZpbGUsIHtcbiAgICAgIG1hcmtlcjogdHJ1ZSxcbiAgICAgIG9taXRFbXB0eTogdHJ1ZSxcbiAgICAgIG9iajoge1xuICAgICAgICB0YXNrczogKCgpID0+IHRoaXMucmVuZGVyVGFza3MoKSkgYXMgYW55LFxuICAgICAgICBlbnY6ICgoKSA9PiB0aGlzLl9lbnYpIGFzIGFueSxcbiAgICAgIH0gYXMgVGFza3NNYW5pZmVzdCxcbiAgICB9KTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGdldCBhbGwoKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5fdGFza3MpO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkVGFzayhuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IFRhc2tPcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB0YXNrID0gbmV3IFRhc2sodGhpcywgbmFtZSwgb3B0aW9ucyk7XG4gICAgdGhpcy5fdGFza3NbbmFtZV0gPSB0YXNrO1xuICAgIHJldHVybiB0YXNrO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkRW52aXJvbm1lbnQobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fZW52W25hbWVdID0gdmFsdWU7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgZ2V0IGVudigpOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4udGhpcy5fZW52LFxuICAgIH07XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHRyeUZpbmQobmFtZTogc3RyaW5nKTogdW5kZWZpbmVkIHwgVGFzayB7XG4gICAgcmV0dXJuIHRoaXMuX3Rhc2tzW25hbWVdO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJUYXNrcygpIHtcbiAgICBjb25zdCB0YXNrczogeyBbbmFtZTogc3RyaW5nXTogVGFza1NwZWMgfSA9IHt9O1xuICAgIGZvciAoY29uc3QgdGFzayBvZiBPYmplY3QudmFsdWVzKHRoaXMuX3Rhc2tzKSkge1xuICAgICAgdGFza3NbdGFzay5uYW1lXSA9IHRhc2suX3JlbmRlclNwZWMoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFza3M7XG4gIH1cbn1cbiJdfQ==