export const parseToRows = (input) => input.split('\n').map(text => {
    var _a, _b;
    return ({
        indent: (_b = (_a = /^\s+/.exec(text)) === null || _a === void 0 ? void 0 : _a[0].length) !== null && _b !== void 0 ? _b : 0,
        text
    });
});
//# sourceMappingURL=Row.js.map