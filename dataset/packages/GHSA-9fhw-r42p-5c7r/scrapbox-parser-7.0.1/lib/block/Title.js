"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToTitle = void 0;
const convertToTitle = (pack) => {
    return {
        type: 'title',
        text: pack.rows[0].text
    };
};
exports.convertToTitle = convertToTitle;
//# sourceMappingURL=Title.js.map