import { createNodeParser } from './creator';
const iconRegExp = /\[[^[\]]*\.icon(?:\*[1-9]\d*)?\]/;
export function generateIconNodeCreator(type) {
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
const createIconNode = generateIconNodeCreator('icon');
export const IconNodeParser = createNodeParser(createIconNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [iconRegExp]
});
//# sourceMappingURL=IconNode.js.map