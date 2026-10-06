"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseService = require('lib/services/BaseService');
const eventManager = require('lib/eventManager');
exports.utils = {
    store: {
        dispatch: () => { },
        getState: () => { },
    },
};
class CommandService extends BaseService {
    constructor() {
        super(...arguments);
        this.commands_ = {};
        this.commandPreviousStates_ = {};
        this.mapStateToPropsIID_ = null;
        this.keymapService = null;
    }
    static instance() {
        if (this.instance_)
            return this.instance_;
        this.instance_ = new CommandService();
        return this.instance_;
    }
    initialize(store, keymapService) {
        exports.utils.store = store;
        this.keymapService = keymapService;
    }
    on(eventName, callback) {
        eventManager.on(eventName, callback);
    }
    off(eventName, callback) {
        eventManager.off(eventName, callback);
    }
    propsHaveChanged(previous, next) {
        if (!previous && next)
            return true;
        for (const n in previous) {
            if (previous[n] !== next[n])
                return true;
        }
        return false;
    }
    scheduleMapStateToProps(state) {
        if (this.mapStateToPropsIID_)
            clearTimeout(this.mapStateToPropsIID_);
        this.mapStateToPropsIID_ = setTimeout(() => {
            this.mapStateToProps(state);
        }, 50);
    }
    mapStateToProps(state) {
        const newState = state;
        const changedCommands = {};
        for (const name in this.commands_) {
            const command = this.commands_[name];
            if (!command.runtime)
                continue;
            if (!command.runtime.mapStateToProps) {
                command.runtime.props = {};
                continue;
            }
            const newProps = command.runtime.mapStateToProps(state);
            const haveChanged = this.propsHaveChanged(command.runtime.props, newProps);
            if (haveChanged) {
                const previousState = this.commandPreviousStates_[name];
                command.runtime.props = newProps;
                const newState = {
                    enabled: this.isEnabled(name),
                    title: this.title(name),
                };
                if (!previousState || previousState.title !== newState.title || previousState.enabled !== newState.enabled) {
                    changedCommands[name] = newState;
                }
                this.commandPreviousStates_[name] = newState;
            }
        }
        if (Object.keys(changedCommands).length) {
            eventManager.emit('commandsEnabledStateChange', { commands: changedCommands });
        }
        return newState;
    }
    commandByName(name, options = null) {
        options = Object.assign({ mustExist: true, runtimeMustBeRegistered: false }, options);
        const command = this.commands_[name];
        if (!command) {
            if (options.mustExist)
                throw new Error(`Command not found: ${name}. Make sure the declaration has been registered.`);
            return null;
        }
        if (options.runtimeMustBeRegistered && !command.runtime)
            throw new Error(`Runtime is not registered for command ${name}`);
        return command;
    }
    registerDeclaration(declaration) {
        // if (this.commands_[declaration.name]) throw new Error(`There is already a command with name ${declaration.name}`);
        declaration = Object.assign({}, declaration);
        if (!declaration.label)
            declaration.label = () => '';
        if (!declaration.iconName)
            declaration.iconName = '';
        // In TypeScript it's not an issue, but in JavaScript it's easy to accidentally set the label
        // to a string instead of a function, and it will cause strange errors that are hard to debug.
        // So here check early that we have the right type.
        if (typeof declaration.label !== 'function')
            throw new Error(`declaration.label must be a function: ${declaration.name}`);
        this.commands_[declaration.name] = {
            declaration: declaration,
        };
        delete this.commandPreviousStates_[declaration.name];
    }
    registerRuntime(commandName, runtime) {
        if (typeof commandName !== 'string')
            throw new Error(`Command name must be a string. Got: ${JSON.stringify(commandName)}`);
        const command = this.commandByName(commandName);
        runtime = Object.assign({}, runtime);
        if (!runtime.isEnabled)
            runtime.isEnabled = () => true;
        if (!runtime.title)
            runtime.title = () => null;
        command.runtime = runtime;
        delete this.commandPreviousStates_[commandName];
    }
    componentRegisterCommands(component, commands) {
        for (const command of commands) {
            CommandService.instance().registerRuntime(command.declaration.name, command.runtime(component));
        }
    }
    componentUnregisterCommands(commands) {
        for (const command of commands) {
            CommandService.instance().unregisterRuntime(command.declaration.name);
        }
    }
    unregisterRuntime(commandName) {
        const command = this.commandByName(commandName, { mustExist: false });
        if (!command || !command.runtime)
            return;
        delete command.runtime;
        delete this.commandPreviousStates_[commandName];
    }
    execute(commandName, args = null) {
        console.info('CommandService::execute:', commandName, args);
        const command = this.commandByName(commandName);
        command.runtime.execute(args ? args : {});
    }
    scheduleExecute(commandName, args = null) {
        setTimeout(() => {
            this.execute(commandName, args);
        }, 10);
    }
    isEnabled(commandName) {
        const command = this.commandByName(commandName);
        if (!command || !command.runtime)
            return false;
        if (!command.runtime.props)
            return false;
        return command.runtime.isEnabled(command.runtime.props);
    }
    title(commandName) {
        const command = this.commandByName(commandName);
        if (!command || !command.runtime || !command.runtime.props)
            return null;
        return command.runtime.title(command.runtime.props);
    }
    label(commandName, fullLabel = false) {
        const command = this.commandByName(commandName);
        if (!command)
            throw new Error(`Command: ${commandName} is not declared`);
        const output = [];
        if (fullLabel && command.declaration.parentLabel && command.declaration.parentLabel())
            output.push(command.declaration.parentLabel());
        output.push(command.declaration.label());
        return output.join(': ');
    }
    exists(commandName) {
        const command = this.commandByName(commandName, { mustExist: false });
        return !!command;
    }
    extractExecuteArgs(command, executeArgs) {
        if (executeArgs)
            return executeArgs;
        if (!command.runtime)
            throw new Error(`Command: ${command.declaration.name}: Runtime is not defined - make sure it has been registered.`);
        if (command.runtime.props)
            return command.runtime.props;
        return {};
    }
    commandToToolbarButton(commandName, executeArgs = null) {
        const command = this.commandByName(commandName, { runtimeMustBeRegistered: true });
        return {
            tooltip: this.label(commandName),
            iconName: command.declaration.iconName,
            enabled: this.isEnabled(commandName),
            onClick: () => {
                this.execute(commandName, this.extractExecuteArgs(command, executeArgs));
            },
            title: this.title(commandName),
        };
    }
    commandToMenuItem(commandName, executeArgs = null) {
        const command = this.commandByName(commandName);
        const item = {
            id: command.declaration.name,
            label: this.label(commandName),
            click: () => {
                this.execute(commandName, this.extractExecuteArgs(command, executeArgs));
            },
        };
        if (command.declaration.role)
            item.role = command.declaration.role;
        if (this.keymapService.acceleratorExists(commandName)) {
            item.accelerator = this.keymapService.getAccelerator(commandName);
        }
        return item;
    }
    commandsEnabledState(previousState = null) {
        const output = {};
        for (const name in this.commands_) {
            const enabled = this.isEnabled(name);
            if (!previousState || previousState[name] !== enabled) {
                output[name] = enabled;
            }
        }
        return output;
    }
}
exports.default = CommandService;
//# sourceMappingURL=CommandService.js.map