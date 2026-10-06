"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
/**
 * (experimental) A task that can be performed on the project.
 *
 * Modeled as a series of shell
 * commands and subtasks.
 *
 * @experimental
 */
class Task {
    /**
     * @experimental
     */
    constructor(tasks, name, props = {}) {
        var _b;
        this.tasks = tasks;
        this.name = name;
        this.description = props.description;
        this.category = props.category;
        this.condition = props.condition;
        this.cwd = props.cwd;
        this._env = (_b = props.env) !== null && _b !== void 0 ? _b : {};
        this._steps = [];
        if (props.exec) {
            this.exec(props.exec);
        }
    }
    /**
     * (experimental) Reset the task so it no longer has any commands.
     *
     * @param command the first command to add to the task after it was cleared.
     * @experimental
     */
    reset(command) {
        while (this._steps.length) {
            this._steps.shift();
        }
        if (command) {
            this.exec(command);
        }
    }
    /**
     * (experimental) Executes a shell command.
     *
     * @param command Shell command.
     * @param options Options.
     * @experimental
     */
    exec(command, options = {}) {
        this._steps.push({ exec: command, ...options });
    }
    /**
     * (experimental) Say something.
     *
     * @param message Your message.
     * @param options Options.
     * @experimental
     */
    say(message, options = {}) {
        this._steps.push({ say: message, ...options });
    }
    /**
     * (deprecated) Adds a command at the beginning of the task.
     *
     * @param shell The command to add.
     * @deprecated use `prependExec()`
     */
    prepend(shell, options = {}) {
        this.prependExec(shell, options);
    }
    /**
     * (experimental) Spawns a sub-task.
     *
     * @param subtask The subtask to execute.
     * @experimental
     */
    spawn(subtask, options = {}) {
        this._steps.push({ spawn: subtask.name, ...options });
    }
    /**
     * (experimental) Adds a command at the beginning of the task.
     *
     * @param shell The command to add.
     * @experimental
     */
    prependExec(shell, options = {}) {
        this._steps.unshift({
            exec: shell,
            ...options,
        });
    }
    /**
     * (experimental) Adds a spawn instruction at the beginning of the task.
     *
     * @param subtask The subtask to execute.
     * @experimental
     */
    prependSpawn(subtask, options = {}) {
        this._steps.unshift({
            spawn: subtask.name,
            ...options,
        });
    }
    /**
     * (experimental) Says something at the beginning of the task.
     *
     * @param message Your message.
     * @experimental
     */
    prependSay(message, options = {}) {
        this._steps.unshift({
            say: message,
            ...options,
        });
    }
    /**
     * (experimental) Adds an environment variable to this task.
     *
     * @param name The name of the variable.
     * @param value The value.
     * @experimental
     */
    env(name, value) {
        this._env[name] = value;
    }
    /**
     * (experimental) Returns an immutable copy of all the step specifications of the task.
     *
     * @experimental
     */
    get steps() {
        return [...this._steps];
    }
    /**
     * (experimental) Renders this task as a single shell command.
     *
     * @experimental
     */
    toShellCommand() {
        const cmd = new Array();
        for (const step of this.steps) {
            if (step.name) {
                cmd.push(`echo ${step.name}`);
            }
            if (step.exec) {
                cmd.push(step.exec);
            }
            if (step.spawn) {
                const subtask = this.tasks.tryFind(step.spawn);
                if (!subtask) {
                    throw new Error(`unable to resolve subtask ${step.spawn}`);
                }
                cmd.push(`( ${subtask.toShellCommand()} )`);
            }
        }
        const allCommands = cmd.map(c => `( ${c} )`).join(' && ');
        const withCondition = this.condition ? `! ( ${this.condition} ) || ( ${allCommands} )` : allCommands;
        const env = {
            ...this.tasks.env,
            ...this._env,
        };
        const lines = new Array();
        for (const [k, v] of Object.entries(env)) {
            lines.push(`${k}="${v}"; `);
        }
        return `( ${lines.join('')} ${withCondition} )`;
    }
    /**
     * Renders a task spec into the manifest.
     *
     * @internal
     */
    _renderSpec() {
        return {
            name: this.name,
            category: this.category,
            description: this.description,
            env: this._env,
            steps: this._steps,
            condition: this.condition,
            cwd: this.cwd,
        };
    }
}
exports.Task = Task;
_a = JSII_RTTI_SYMBOL_1;
Task[_a] = { fqn: "projen.tasks.Task", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90YXNrcy90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkEsTUFBYSxJQUFJOzs7O0lBMkJmLFlBQVksS0FBWSxFQUFFLElBQVksRUFBRSxRQUFxQixFQUFHOztRQUM5RCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFFckIsSUFBSSxDQUFDLElBQUksU0FBRyxLQUFLLENBQUMsR0FBRyxtQ0FBSSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFakIsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7SUFDSCxDQUFDOzs7Ozs7O0lBTU0sS0FBSyxDQUFDLE9BQWdCO1FBQzNCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNyQjtRQUVELElBQUksT0FBTyxFQUFFO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNwQjtJQUNILENBQUM7Ozs7Ozs7O0lBT00sSUFBSSxDQUFDLE9BQWUsRUFBRSxVQUEyQixFQUFHO1FBQ3pELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVB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QVMsV0FBVyxXQUFXLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBRXJHLE1BQU0sR0FBRyxHQUFHO1lBQ1YsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUc7WUFDakIsR0FBRyxJQUFJLENBQUMsSUFBSTtTQUNiLENBQUM7UUFFRixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBVSxDQUFDO1FBQ2xDLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3hDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM3QjtRQUVELE9BQU8sS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLGFBQWEsSUFBSSxDQUFDO0lBQ2xELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksV0FBVztRQUNoQixPQUFPO1lBQ0wsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbEIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztTQUNkLENBQUM7SUFDSixDQUFDOztBQXRNSCxvQkF1TUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUYXNrQ2F0ZWdvcnksIFRhc2tDb21tb25PcHRpb25zLCBUYXNrU3BlYywgVGFza1N0ZXAsIFRhc2tTdGVwT3B0aW9ucyB9IGZyb20gJy4vbW9kZWwnO1xuaW1wb3J0IHsgVGFza3MgfSBmcm9tICcuL3Rhc2tzJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tPcHRpb25zIGV4dGVuZHMgVGFza0NvbW1vbk9wdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGV4ZWM/OiBzdHJpbmc7XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgVGFzayB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBkZXNjcmlwdGlvbj86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGNhdGVnb3J5PzogVGFza0NhdGVnb3J5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGNvbmRpdGlvbj86IHN0cmluZztcblxuICBwcml2YXRlIHJlYWRvbmx5IF9zdGVwczogVGFza1N0ZXBbXTtcbiAgcHJpdmF0ZSByZWFkb25seSBfZW52OiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgcHJpdmF0ZSByZWFkb25seSBjd2Q/OiBzdHJpbmc7XG4gIHByaXZhdGUgcmVhZG9ubHkgdGFza3M6IFRhc2tzO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tzOiBUYXNrcywgbmFtZTogc3RyaW5nLCBwcm9wczogVGFza09wdGlvbnMgPSB7IH0pIHtcbiAgICB0aGlzLnRhc2tzID0gdGFza3M7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gcHJvcHMuZGVzY3JpcHRpb247XG4gICAgdGhpcy5jYXRlZ29yeSA9IHByb3BzLmNhdGVnb3J5O1xuICAgIHRoaXMuY29uZGl0aW9uID0gcHJvcHMuY29uZGl0aW9uO1xuICAgIHRoaXMuY3dkID0gcHJvcHMuY3dkO1xuXG4gICAgdGhpcy5fZW52ID0gcHJvcHMuZW52ID8/IHt9O1xuICAgIHRoaXMuX3N0ZXBzID0gW107XG5cbiAgICBpZiAocHJvcHMuZXhlYykge1xuICAgICAgdGhpcy5leGVjKHByb3BzLmV4ZWMpO1xuICAgIH1cbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVzZXQoY29tbWFuZD86IHN0cmluZykge1xuICAgIHdoaWxlICh0aGlzLl9zdGVwcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX3N0ZXBzLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgIHRoaXMuZXhlYyhjb21tYW5kKTtcbiAgICB9XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgZXhlYyhjb21tYW5kOiBzdHJpbmcsIG9wdGlvbnM6IFRhc2tTdGVwT3B0aW9ucyA9IHsgfSkge1xuICAgIHRoaXMuX3N0ZXBzLnB1c2goeyBleGVjOiBjb21tYW5kLCAuLi5vcHRpb25zIH0pO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBzYXkobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zOiBUYXNrU3RlcE9wdGlvbnMgPSB7IH0pIHtcbiAgICB0aGlzLl9zdGVwcy5wdXNoKHsgc2F5OiBtZXNzYWdlLCAuLi5vcHRpb25zIH0pO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcHJlcGVuZChzaGVsbDogc3RyaW5nLCBvcHRpb25zOiBUYXNrU3RlcE9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucHJlcGVuZEV4ZWMoc2hlbGwsIG9wdGlvbnMpO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHNwYXduKHN1YnRhc2s6IFRhc2ssIG9wdGlvbnM6IFRhc2tTdGVwT3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5fc3RlcHMucHVzaCh7IHNwYXduOiBzdWJ0YXNrLm5hbWUsIC4uLm9wdGlvbnMgfSk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBwcmVwZW5kRXhlYyhzaGVsbDogc3RyaW5nLCBvcHRpb25zOiBUYXNrU3RlcE9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuX3N0ZXBzLnVuc2hpZnQoe1xuICAgICAgZXhlYzogc2hlbGwsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHByZXBlbmRTcGF3bihzdWJ0YXNrOiBUYXNrLCBvcHRpb25zOiBUYXNrU3RlcE9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuX3N0ZXBzLnVuc2hpZnQoe1xuICAgICAgc3Bhd246IHN1YnRhc2submFtZSxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcHJlcGVuZFNheShtZXNzYWdlOiBzdHJpbmcsIG9wdGlvbnM6IFRhc2tTdGVwT3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5fc3RlcHMudW5zaGlmdCh7XG4gICAgICBzYXk6IG1lc3NhZ2UsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgZW52KG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX2VudltuYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBnZXQgc3RlcHMoKSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9zdGVwc107XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgdG9TaGVsbENvbW1hbmQoKTogc3RyaW5nIHtcbiAgICBjb25zdCBjbWQgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xuXG4gICAgZm9yIChjb25zdCBzdGVwIG9mIHRoaXMuc3RlcHMpIHtcbiAgICAgIGlmIChzdGVwLm5hbWUpIHtcbiAgICAgICAgY21kLnB1c2goYGVjaG8gJHtzdGVwLm5hbWV9YCk7XG4gICAgICB9XG4gICAgICBpZiAoc3RlcC5leGVjKSB7XG4gICAgICAgIGNtZC5wdXNoKHN0ZXAuZXhlYyk7XG4gICAgICB9XG4gICAgICBpZiAoc3RlcC5zcGF3bikge1xuICAgICAgICBjb25zdCBzdWJ0YXNrID0gdGhpcy50YXNrcy50cnlGaW5kKHN0ZXAuc3Bhd24pO1xuICAgICAgICBpZiAoIXN1YnRhc2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuYWJsZSB0byByZXNvbHZlIHN1YnRhc2sgJHtzdGVwLnNwYXdufWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY21kLnB1c2goYCggJHtzdWJ0YXNrLnRvU2hlbGxDb21tYW5kKCl9IClgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBhbGxDb21tYW5kcyA9IGNtZC5tYXAoYyA9PiBgKCAke2N9IClgKS5qb2luKCcgJiYgJyk7XG4gICAgY29uc3Qgd2l0aENvbmRpdGlvbiA9IHRoaXMuY29uZGl0aW9uID8gYCEgKCAke3RoaXMuY29uZGl0aW9ufSApIHx8ICggJHthbGxDb21tYW5kc30gKWAgOiBhbGxDb21tYW5kcztcblxuICAgIGNvbnN0IGVudiA9IHtcbiAgICAgIC4uLnRoaXMudGFza3MuZW52LFxuICAgICAgLi4udGhpcy5fZW52LFxuICAgIH07XG5cbiAgICBjb25zdCBsaW5lcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoZW52KSkge1xuICAgICAgbGluZXMucHVzaChgJHtrfT1cIiR7dn1cIjsgYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAoICR7bGluZXMuam9pbignJyl9ICR7d2l0aENvbmRpdGlvbn0gKWA7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyBhIHRhc2sgc3BlYyBpbnRvIHRoZSBtYW5pZmVzdC5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBwdWJsaWMgX3JlbmRlclNwZWMoKTogVGFza1NwZWMge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICBjYXRlZ29yeTogdGhpcy5jYXRlZ29yeSxcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgZW52OiB0aGlzLl9lbnYsXG4gICAgICBzdGVwczogdGhpcy5fc3RlcHMsXG4gICAgICBjb25kaXRpb246IHRoaXMuY29uZGl0aW9uLFxuICAgICAgY3dkOiB0aGlzLmN3ZCxcbiAgICB9O1xuICB9XG59XG4iXX0=