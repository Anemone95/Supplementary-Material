"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRuntime = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const chalk = require("chalk");
const logging = require("../logging");
const tasks_1 = require("./tasks");
/**
 * (experimental) The runtime component of the tasks engine.
 *
 * @experimental
 */
class TaskRuntime {
    /**
     * @experimental
     */
    constructor(workdir) {
        this.workdir = path_1.resolve(workdir);
        const manifestPath = path_1.join(this.workdir, tasks_1.Tasks.MANIFEST_FILE);
        this.manifest = fs_1.existsSync(manifestPath)
            ? JSON.parse(fs_1.readFileSync(manifestPath, 'utf-8'))
            : { tasks: {} };
    }
    /**
     * (experimental) The tasks in this project.
     *
     * @experimental
     */
    get tasks() {
        var _b;
        return Object.values((_b = this.manifest.tasks) !== null && _b !== void 0 ? _b : {});
    }
    /**
     * (experimental) Find a task by name, or `undefined` if not found.
     *
     * @experimental
     */
    tryFindTask(name) {
        if (!this.manifest.tasks) {
            return undefined;
        }
        return this.manifest.tasks[name];
    }
    /**
     * (experimental) Runs the task.
     *
     * @param name The task name.
     * @experimental
     */
    runTask(name, parents = []) {
        const task = this.tryFindTask(name);
        if (!task) {
            throw new Error(`cannot find command ${task}`);
        }
        new RunTask(this, task, parents);
    }
}
exports.TaskRuntime = TaskRuntime;
_a = JSII_RTTI_SYMBOL_1;
TaskRuntime[_a] = { fqn: "projen.tasks.TaskRuntime", version: "0.16.40" };
class RunTask {
    constructor(runtime, task, parents = []) {
        var _b, _c;
        this.runtime = runtime;
        this.task = task;
        this.env = {};
        this.workdir = (_b = task.cwd) !== null && _b !== void 0 ? _b : this.runtime.workdir;
        this.parents = parents;
        this.env = { ...process.env };
        this.env = this.resolveEnvironment();
        // evaluate condition
        if (!this.evalCondition(task)) {
            this.log('condition exited with non-zero - skipping');
            return;
        }
        for (const step of (_c = task.steps) !== null && _c !== void 0 ? _c : []) {
            if (step.say) {
                logging.info(this.fmtLog(step.say));
            }
            if (step.spawn) {
                this.runtime.runTask(step.spawn, [...this.parents, this.task.name]);
            }
            if (step.exec) {
                const command = step.exec;
                const cwd = step.cwd;
                const result = this.shell({ command, cwd });
                if (result.status !== 0) {
                    throw new Error(`Task "${this.fullname}" failed when executing "${command}" (cwd: ${path_1.resolve(cwd !== null && cwd !== void 0 ? cwd : this.workdir)})`);
                }
            }
        }
    }
    /**
     * Determines if a task should be executed based on "condition".
     *
     * @returns true if the task should be executed or false if the condition
     * evaluates to false (exits with non-zero), indicating that the task should
     * be skipped.
     */
    evalCondition(task) {
        // no condition, carry on
        if (!task.condition) {
            return true;
        }
        this.log(`condition: ${task.condition}`);
        const result = this.shell({
            command: task.condition,
            logprefix: 'condition: ',
            quiet: true,
        });
        if (result.status === 0) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Renders the runtime environment for a task. Namely, it supports this syntax
     * `$(xx)` for allowing environment to be evaluated by executing a shell
     * command and obtaining its result.
     *
     * @param env The user-defined environment
     */
    resolveEnvironment() {
        var _b, _c, _d, _e;
        const env = {
            ...(_b = this.runtime.manifest.env) !== null && _b !== void 0 ? _b : {},
            ...(_c = this.task.env) !== null && _c !== void 0 ? _c : {},
        };
        const output = {
            ...process.env,
        };
        for (const [key, value] of Object.entries(env !== null && env !== void 0 ? env : {})) {
            if (value.startsWith('$(') && value.endsWith(')')) {
                const query = value.substring(2, value.length - 1);
                const result = this.shellEval({ command: query });
                if (result.status !== 0) {
                    const error = result.error
                        ? result.error.stack
                        : (_e = (_d = result.stderr) === null || _d === void 0 ? void 0 : _d.toString()) !== null && _e !== void 0 ? _e : 'unknown error';
                    throw new Error(`unable to evaluate environment variable ${key}=${value}: ${error}`);
                }
                output[key] = result.stdout.toString('utf-8').trim();
            }
            else {
                output[key] = value;
            }
        }
        return output;
    }
    /**
     * Returns the "full name" of the task which includes all it's parent task names concatenated by chevrons.
     */
    get fullname() {
        return [...this.parents, this.task.name].join(' » ');
    }
    log(...args) {
        logging.verbose(this.fmtLog(...args));
    }
    fmtLog(...args) {
        return util_1.format(`${chalk.underline(this.fullname)} |`, ...args);
    }
    shell(options) {
        var _b, _c;
        const quiet = (_b = options.quiet) !== null && _b !== void 0 ? _b : false;
        if (!quiet) {
            const log = new Array();
            if (options.logprefix) {
                log.push(options.logprefix);
            }
            log.push(options.command);
            if (options.cwd) {
                log.push(`(cwd: ${options.cwd})`);
            }
            this.log(log.join(' '));
        }
        const cwd = (_c = options.cwd) !== null && _c !== void 0 ? _c : this.workdir;
        if (!fs_1.existsSync(cwd) || !fs_1.statSync(cwd).isDirectory()) {
            throw new Error(`invalid workdir (cwd): ${cwd} must be an existing directory`);
        }
        return child_process_1.spawnSync(options.command, {
            ...options,
            cwd,
            shell: true,
            stdio: 'inherit',
            env: this.env,
            ...options.spawnOptions,
        });
    }
    shellEval(options) {
        return this.shell({
            quiet: true,
            ...options,
            spawnOptions: {
                stdio: ['inherit', 'pipe', 'inherit'],
            },
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy9ydW50aW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsaURBQXdEO0FBQ3hELDJCQUF3RDtBQUN4RCwrQkFBcUM7QUFDckMsK0JBQThCO0FBQzlCLCtCQUErQjtBQUMvQixzQ0FBc0M7QUFFdEMsbUNBQWdDOzs7Ozs7QUFLaEMsTUFBYSxXQUFXOzs7O0lBV3RCLFlBQVksT0FBZTtRQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLGNBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoQyxNQUFNLFlBQVksR0FBRyxXQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxlQUFVLENBQUMsWUFBWSxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFZLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDOzs7Ozs7SUFLRCxJQUFXLEtBQUs7O1FBQ2QsT0FBTyxNQUFNLENBQUMsTUFBTSxPQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxtQ0FBSSxFQUFFLENBQUMsQ0FBQztJQUNsRCxDQUFDOzs7Ozs7SUFLTSxXQUFXLENBQUMsSUFBWTtRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7WUFBRSxPQUFPLFNBQVMsQ0FBQztTQUFFO1FBQy9DLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQzs7Ozs7OztJQU1NLE9BQU8sQ0FBQyxJQUFZLEVBQUUsVUFBb0IsRUFBRTtRQUNqRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ2hEO1FBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuQyxDQUFDOztBQTdDSCxrQ0E4Q0M7OztBQUVELE1BQU0sT0FBTztJQU1YLFlBQTZCLE9BQW9CLEVBQW1CLElBQWMsRUFBRSxVQUFvQixFQUFFOztRQUE3RSxZQUFPLEdBQVAsT0FBTyxDQUFhO1FBQW1CLFNBQUksR0FBSixJQUFJLENBQVU7UUFMakUsUUFBRyxHQUEyQyxFQUFHLENBQUM7UUFNakUsSUFBSSxDQUFDLE9BQU8sU0FBRyxJQUFJLENBQUMsR0FBRyxtQ0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUVoRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVyQyxxQkFBcUI7UUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1lBQ3RELE9BQU87U0FDUjtRQUVELEtBQUssTUFBTSxJQUFJLFVBQUksSUFBSSxDQUFDLEtBQUssbUNBQUksRUFBRSxFQUFFO1lBQ25DLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDWixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDckM7WUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDckU7WUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDMUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDckIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLFFBQVEsNEJBQTRCLE9BQU8sV0FBVyxjQUFPLENBQUMsR0FBRyxhQUFILEdBQUcsY0FBSCxHQUFHLEdBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDdEg7YUFDRjtTQUNGO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLGFBQWEsQ0FBQyxJQUFjO1FBQ2xDLHlCQUF5QjtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDeEIsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3ZCLFNBQVMsRUFBRSxhQUFhO1lBQ3hCLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxDQUFDO1FBQ0gsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQztTQUNiO2FBQU07WUFDTCxPQUFPLEtBQUssQ0FBQztTQUNkO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLGtCQUFrQjs7UUFDeEIsTUFBTSxHQUFHLEdBQUc7WUFDVixTQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsbUNBQUksRUFBRTtZQUNsQyxTQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxtQ0FBSSxFQUFFO1NBQ3ZCLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBMkM7WUFDckQsR0FBRyxPQUFPLENBQUMsR0FBRztTQUNmLENBQUM7UUFFRixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLGFBQUgsR0FBRyxjQUFILEdBQUcsR0FBSSxFQUFFLENBQUMsRUFBRTtZQUNwRCxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDakQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN2QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSzt3QkFDeEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSzt3QkFDcEIsQ0FBQyxhQUFDLE1BQU0sQ0FBQyxNQUFNLDBDQUFFLFFBQVEscUNBQ3RCLGVBQWUsQ0FBQztvQkFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsR0FBRyxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2lCQUN0RjtnQkFDRCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDdEQ7aUJBQU07Z0JBQ0wsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUNyQjtTQUNGO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBWSxRQUFRO1FBQ2xCLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVPLEdBQUcsQ0FBQyxHQUFHLElBQVc7UUFDeEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRU8sTUFBTSxDQUFDLEdBQUcsSUFBVztRQUMzQixPQUFPLGFBQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRU8sS0FBSyxDQUFDLE9BQXFCOztRQUNqQyxNQUFNLEtBQUssU0FBRyxPQUFPLENBQUMsS0FBSyxtQ0FBSSxLQUFLLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNWLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxFQUFVLENBQUM7WUFFaEMsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFO2dCQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM3QjtZQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTFCLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDZixHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7YUFDbkM7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUN6QjtRQUVELE1BQU0sR0FBRyxTQUFHLE9BQU8sQ0FBQyxHQUFHLG1DQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEMsSUFBSSxDQUFDLGVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUNwRCxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixHQUFHLGdDQUFnQyxDQUFDLENBQUM7U0FDaEY7UUFFRCxPQUFPLHlCQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUNoQyxHQUFHLE9BQU87WUFDVixHQUFHO1lBQ0gsS0FBSyxFQUFFLElBQUk7WUFDWCxLQUFLLEVBQUUsU0FBUztZQUNoQixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixHQUFHLE9BQU8sQ0FBQyxZQUFZO1NBQ3hCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxTQUFTLENBQUMsT0FBcUI7UUFDckMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2hCLEtBQUssRUFBRSxJQUFJO1lBQ1gsR0FBRyxPQUFPO1lBQ1YsWUFBWSxFQUFFO2dCQUNaLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDO2FBQ3RDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3Bhd25PcHRpb25zLCBzcGF3blN5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgc3RhdFN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBqb2luLCByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmb3JtYXQgfSBmcm9tICd1dGlsJztcbmltcG9ydCAqIGFzIGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCAqIGFzIGxvZ2dpbmcgZnJvbSAnLi4vbG9nZ2luZyc7XG5pbXBvcnQgeyBUYXNrc01hbmlmZXN0LCBUYXNrU3BlYyB9IGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHsgVGFza3MgfSBmcm9tICcuL3Rhc2tzJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBUYXNrUnVudGltZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBtYW5pZmVzdDogVGFza3NNYW5pZmVzdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHdvcmtkaXI6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih3b3JrZGlyOiBzdHJpbmcpIHtcbiAgICB0aGlzLndvcmtkaXIgPSByZXNvbHZlKHdvcmtkaXIpO1xuICAgIGNvbnN0IG1hbmlmZXN0UGF0aCA9IGpvaW4odGhpcy53b3JrZGlyLCBUYXNrcy5NQU5JRkVTVF9GSUxFKTtcbiAgICB0aGlzLm1hbmlmZXN0ID0gZXhpc3RzU3luYyhtYW5pZmVzdFBhdGgpXG4gICAgICA/IEpTT04ucGFyc2UocmVhZEZpbGVTeW5jKG1hbmlmZXN0UGF0aCwgJ3V0Zi04JykpXG4gICAgICA6IHsgdGFza3M6IHsgfSB9O1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIGdldCB0YXNrcygpOiBUYXNrU3BlY1tdIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLm1hbmlmZXN0LnRhc2tzID8/IHt9KTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHRyeUZpbmRUYXNrKG5hbWU6IHN0cmluZyk6IFRhc2tTcGVjIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoIXRoaXMubWFuaWZlc3QudGFza3MpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuICAgIHJldHVybiB0aGlzLm1hbmlmZXN0LnRhc2tzW25hbWVdO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcnVuVGFzayhuYW1lOiBzdHJpbmcsIHBhcmVudHM6IHN0cmluZ1tdID0gW10pIHtcbiAgICBjb25zdCB0YXNrID0gdGhpcy50cnlGaW5kVGFzayhuYW1lKTtcbiAgICBpZiAoIXRhc2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IGZpbmQgY29tbWFuZCAke3Rhc2t9YCk7XG4gICAgfVxuXG4gICAgbmV3IFJ1blRhc2sodGhpcywgdGFzaywgcGFyZW50cyk7XG4gIH1cbn1cblxuY2xhc3MgUnVuVGFzayB7XG4gIHByaXZhdGUgcmVhZG9ubHkgZW52OiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCB1bmRlZmluZWQgfSA9IHsgfTtcbiAgcHJpdmF0ZSByZWFkb25seSBwYXJlbnRzOiBzdHJpbmdbXTtcblxuICBwcml2YXRlIHJlYWRvbmx5IHdvcmtkaXI6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHJ1bnRpbWU6IFRhc2tSdW50aW1lLCBwcml2YXRlIHJlYWRvbmx5IHRhc2s6IFRhc2tTcGVjLCBwYXJlbnRzOiBzdHJpbmdbXSA9IFtdKSB7XG4gICAgdGhpcy53b3JrZGlyID0gdGFzay5jd2QgPz8gdGhpcy5ydW50aW1lLndvcmtkaXI7XG5cbiAgICB0aGlzLnBhcmVudHMgPSBwYXJlbnRzO1xuICAgIHRoaXMuZW52ID0geyAuLi5wcm9jZXNzLmVudiB9O1xuICAgIHRoaXMuZW52ID0gdGhpcy5yZXNvbHZlRW52aXJvbm1lbnQoKTtcblxuICAgIC8vIGV2YWx1YXRlIGNvbmRpdGlvblxuICAgIGlmICghdGhpcy5ldmFsQ29uZGl0aW9uKHRhc2spKSB7XG4gICAgICB0aGlzLmxvZygnY29uZGl0aW9uIGV4aXRlZCB3aXRoIG5vbi16ZXJvIC0gc2tpcHBpbmcnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHN0ZXAgb2YgdGFzay5zdGVwcyA/PyBbXSkge1xuICAgICAgaWYgKHN0ZXAuc2F5KSB7XG4gICAgICAgIGxvZ2dpbmcuaW5mbyh0aGlzLmZtdExvZyhzdGVwLnNheSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RlcC5zcGF3bikge1xuICAgICAgICB0aGlzLnJ1bnRpbWUucnVuVGFzayhzdGVwLnNwYXduLCBbLi4udGhpcy5wYXJlbnRzLCB0aGlzLnRhc2submFtZV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RlcC5leGVjKSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSBzdGVwLmV4ZWM7XG4gICAgICAgIGNvbnN0IGN3ZCA9IHN0ZXAuY3dkO1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNoZWxsKHsgY29tbWFuZCwgY3dkIH0pO1xuICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyAhPT0gMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFzayBcIiR7dGhpcy5mdWxsbmFtZX1cIiBmYWlsZWQgd2hlbiBleGVjdXRpbmcgXCIke2NvbW1hbmR9XCIgKGN3ZDogJHtyZXNvbHZlKGN3ZCA/PyB0aGlzLndvcmtkaXIpfSlgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIGEgdGFzayBzaG91bGQgYmUgZXhlY3V0ZWQgYmFzZWQgb24gXCJjb25kaXRpb25cIi5cbiAgICpcbiAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgdGFzayBzaG91bGQgYmUgZXhlY3V0ZWQgb3IgZmFsc2UgaWYgdGhlIGNvbmRpdGlvblxuICAgKiBldmFsdWF0ZXMgdG8gZmFsc2UgKGV4aXRzIHdpdGggbm9uLXplcm8pLCBpbmRpY2F0aW5nIHRoYXQgdGhlIHRhc2sgc2hvdWxkXG4gICAqIGJlIHNraXBwZWQuXG4gICAqL1xuICBwcml2YXRlIGV2YWxDb25kaXRpb24odGFzazogVGFza1NwZWMpIHtcbiAgICAvLyBubyBjb25kaXRpb24sIGNhcnJ5IG9uXG4gICAgaWYgKCF0YXNrLmNvbmRpdGlvbikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5sb2coYGNvbmRpdGlvbjogJHt0YXNrLmNvbmRpdGlvbn1gKTtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNoZWxsKHtcbiAgICAgIGNvbW1hbmQ6IHRhc2suY29uZGl0aW9uLFxuICAgICAgbG9ncHJlZml4OiAnY29uZGl0aW9uOiAnLFxuICAgICAgcXVpZXQ6IHRydWUsXG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgdGhlIHJ1bnRpbWUgZW52aXJvbm1lbnQgZm9yIGEgdGFzay4gTmFtZWx5LCBpdCBzdXBwb3J0cyB0aGlzIHN5bnRheFxuICAgKiBgJCh4eClgIGZvciBhbGxvd2luZyBlbnZpcm9ubWVudCB0byBiZSBldmFsdWF0ZWQgYnkgZXhlY3V0aW5nIGEgc2hlbGxcbiAgICogY29tbWFuZCBhbmQgb2J0YWluaW5nIGl0cyByZXN1bHQuXG4gICAqXG4gICAqIEBwYXJhbSBlbnYgVGhlIHVzZXItZGVmaW5lZCBlbnZpcm9ubWVudFxuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlRW52aXJvbm1lbnQoKSB7XG4gICAgY29uc3QgZW52ID0ge1xuICAgICAgLi4udGhpcy5ydW50aW1lLm1hbmlmZXN0LmVudiA/PyB7fSxcbiAgICAgIC4uLnRoaXMudGFzay5lbnYgPz8ge30sXG4gICAgfTtcblxuICAgIGNvbnN0IG91dHB1dDogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgdW5kZWZpbmVkIH0gPSB7XG4gICAgICAuLi5wcm9jZXNzLmVudixcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZW52ID8/IHt9KSkge1xuICAgICAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJyQoJykgJiYgdmFsdWUuZW5kc1dpdGgoJyknKSkge1xuICAgICAgICBjb25zdCBxdWVyeSA9IHZhbHVlLnN1YnN0cmluZygyLCB2YWx1ZS5sZW5ndGggLSAxKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5zaGVsbEV2YWwoeyBjb21tYW5kOiBxdWVyeSB9KTtcbiAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICAgICAgICBjb25zdCBlcnJvciA9IHJlc3VsdC5lcnJvclxuICAgICAgICAgICAgPyByZXN1bHQuZXJyb3Iuc3RhY2tcbiAgICAgICAgICAgIDogcmVzdWx0LnN0ZGVycj8udG9TdHJpbmcoKVxuICAgICAgICAgICAgPz8gJ3Vua25vd24gZXJyb3InO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdW5hYmxlIHRvIGV2YWx1YXRlIGVudmlyb25tZW50IHZhcmlhYmxlICR7a2V5fT0ke3ZhbHVlfTogJHtlcnJvcn1gKTtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXRba2V5XSA9IHJlc3VsdC5zdGRvdXQudG9TdHJpbmcoJ3V0Zi04JykudHJpbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFwiZnVsbCBuYW1lXCIgb2YgdGhlIHRhc2sgd2hpY2ggaW5jbHVkZXMgYWxsIGl0J3MgcGFyZW50IHRhc2sgbmFtZXMgY29uY2F0ZW5hdGVkIGJ5IGNoZXZyb25zLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXQgZnVsbG5hbWUoKSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLnBhcmVudHMsIHRoaXMudGFzay5uYW1lXS5qb2luKCcgwrsgJyk7XG4gIH1cblxuICBwcml2YXRlIGxvZyguLi5hcmdzOiBhbnlbXSkge1xuICAgIGxvZ2dpbmcudmVyYm9zZSh0aGlzLmZtdExvZyguLi5hcmdzKSk7XG4gIH1cblxuICBwcml2YXRlIGZtdExvZyguLi5hcmdzOiBhbnlbXSkge1xuICAgIHJldHVybiBmb3JtYXQoYCR7Y2hhbGsudW5kZXJsaW5lKHRoaXMuZnVsbG5hbWUpfSB8YCwgLi4uYXJncyk7XG4gIH1cblxuICBwcml2YXRlIHNoZWxsKG9wdGlvbnM6IFNoZWxsT3B0aW9ucykge1xuICAgIGNvbnN0IHF1aWV0ID0gb3B0aW9ucy5xdWlldCA/PyBmYWxzZTtcbiAgICBpZiAoIXF1aWV0KSB7XG4gICAgICBjb25zdCBsb2cgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xuXG4gICAgICBpZiAob3B0aW9ucy5sb2dwcmVmaXgpIHtcbiAgICAgICAgbG9nLnB1c2gob3B0aW9ucy5sb2dwcmVmaXgpO1xuICAgICAgfVxuXG4gICAgICBsb2cucHVzaChvcHRpb25zLmNvbW1hbmQpO1xuXG4gICAgICBpZiAob3B0aW9ucy5jd2QpIHtcbiAgICAgICAgbG9nLnB1c2goYChjd2Q6ICR7b3B0aW9ucy5jd2R9KWApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxvZyhsb2cuam9pbignICcpKTtcbiAgICB9XG5cbiAgICBjb25zdCBjd2QgPSBvcHRpb25zLmN3ZCA/PyB0aGlzLndvcmtkaXI7XG4gICAgaWYgKCFleGlzdHNTeW5jKGN3ZCkgfHwgIXN0YXRTeW5jKGN3ZCkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHdvcmtkaXIgKGN3ZCk6ICR7Y3dkfSBtdXN0IGJlIGFuIGV4aXN0aW5nIGRpcmVjdG9yeWApO1xuICAgIH1cblxuICAgIHJldHVybiBzcGF3blN5bmMob3B0aW9ucy5jb21tYW5kLCB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgY3dkLFxuICAgICAgc2hlbGw6IHRydWUsXG4gICAgICBzdGRpbzogJ2luaGVyaXQnLFxuICAgICAgZW52OiB0aGlzLmVudixcbiAgICAgIC4uLm9wdGlvbnMuc3Bhd25PcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzaGVsbEV2YWwob3B0aW9uczogU2hlbGxPcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuc2hlbGwoe1xuICAgICAgcXVpZXQ6IHRydWUsXG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgc3Bhd25PcHRpb25zOiB7XG4gICAgICAgIHN0ZGlvOiBbJ2luaGVyaXQnLCAncGlwZScsICdpbmhlcml0J10sXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG5cbmludGVyZmFjZSBTaGVsbE9wdGlvbnMge1xuICByZWFkb25seSBjb21tYW5kOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBAZGVmYXVsdCAtIHByb2plY3QgZGlyXG4gICAqL1xuICByZWFkb25seSBjd2Q/OiBzdHJpbmc7XG4gIHJlYWRvbmx5IGxvZ3ByZWZpeD86IHN0cmluZztcbiAgcmVhZG9ubHkgc3Bhd25PcHRpb25zPzogU3Bhd25PcHRpb25zO1xuICAvKiogQGRlZmF1bHQgZmFsc2UgKi9cbiAgcmVhZG9ubHkgcXVpZXQ/OiBib29sZWFuO1xufSJdfQ==