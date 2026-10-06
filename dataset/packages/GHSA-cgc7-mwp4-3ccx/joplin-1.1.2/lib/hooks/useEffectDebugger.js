"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usePrevious_1 = require("./usePrevious");
const react_1 = require("react");
function useEffectDebugger(effectHook, dependencies, dependencyNames = []) {
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
        console.log('[use-effet-debugger] ', changedDeps);
    }
    react_1.useEffect(effectHook, dependencies);
}
exports.default = useEffectDebugger;
//# sourceMappingURL=useEffectDebugger.js.map