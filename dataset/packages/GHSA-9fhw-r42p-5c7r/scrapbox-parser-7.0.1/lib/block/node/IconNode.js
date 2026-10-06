"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconNodeParser = exports.generateIconNodeCreator = void 0;
const creator_1 = require("./creator");
const iconRegExp = /\[[^[\]]*\.icon(?:\*[1-9]\d*)?\]/;
function generateIconNodeCreator(type) {
    return raw => {
        const target = type === 'icon' ? raw.substring(1, raw.length - 1) : raw.substring(2, raw.length - 2);
        const index = target.lastIndexOf('.icon');
        const path = target.substring(0, index);
        const pathType = path.startsWith('/') ? 'root' : 'relative';
        const numStr = target.substring(index + 5, target.length);
        const num = numStr.startsWith('*') ? parseInt(numStr.substring(1), 10) : 1;
        return new Array(num).fill({}).map(() => ({ path, pathType, type, raw }));
    };
}
exports.generateIconNodeCreator = generateIconNodeCreator;
const createIconNode = generateIconNodeCreator('icon');
exports.IconNodeParser = creator_1.createNodeParser(createIconNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [iconRegExp]
});
//# sourceMappingURL=IconNode.js.map