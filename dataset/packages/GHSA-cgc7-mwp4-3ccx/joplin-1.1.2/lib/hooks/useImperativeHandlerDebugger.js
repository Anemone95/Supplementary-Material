"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usePrevious_1 = require("./usePrevious");
const react_1 = require("react");
function useImperativeHandleDebugger(ref, effectHook, dependencies, dependencyNames = []) {
    const previousDeps = usePrevious_1.default(dependencies, []);
    const changedDeps = dependencies.reduce((accum, dependency, index) => {
        if (dependency !== previousDeps[index]) {
            const keyName = dependencyNames[index] || index;
            return Object.assign(Object.assign({}, accum), { [keyName]: {
                    before: previousDeps[index],
                    after: dependency,
                } });
        }
        return accum;
    }, {});
    if (Object.keys(changedDeps).length) {
        console.log('[use-imperativeHandler-debugger] ', changedDeps);
    }
    react_1.useImperativeHandle(ref, effectHook, dependencies);
}
exports.default = useImperativeHandleDebugger;
//# sourceMappingURL=useImperativeHandlerDebugger.js.map