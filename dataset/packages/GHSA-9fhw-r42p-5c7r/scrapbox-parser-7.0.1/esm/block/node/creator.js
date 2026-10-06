import { convertToNodes } from '.';
export const createNodeParser = (nodeCreator, { parseOnNested, parseOnQuoted, patterns }) => {
    return (text, opts, next) => {
        var _a, _b, _c;
        if (!parseOnNested && opts.nested)
            return (_a = next === null || next === void 0 ? void 0 : next()) !== null && _a !== void 0 ? _a : [];
        if (!parseOnQuoted && opts.quoted)
            return (_b = next === null || next === void 0 ? void 0 : next()) !== null && _b !== void 0 ? _b : [];
        for (const pattern of patterns) {
            const match = pattern.exec(text);
            if (match === null)
                continue;
            const left = text.substring(0, match.index);
            const right = text.substring(match.index + match[0].length);
            const node = nodeCreator(match[0], opts);
            return [
                ...convertToNodes(left, opts),
                ...(Array.isArray(node) ? node : [node]),
                ...convertToNodes(right, opts)
            ];
        }
        return (_c = next === null || next === void 0 ? void 0 : next()) !== null && _c !== void 0 ? _c : [];
    };
};
//# sourceMappingURL=creator.js.map