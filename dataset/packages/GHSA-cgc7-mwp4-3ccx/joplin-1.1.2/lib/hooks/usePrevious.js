"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
function usePrevious(value, initialValue = null) {
    const ref = react_1.useRef(initialValue);
    react_1.useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}
exports.default = usePrevious;
//# sourceMappingURL=usePrevious.js.map