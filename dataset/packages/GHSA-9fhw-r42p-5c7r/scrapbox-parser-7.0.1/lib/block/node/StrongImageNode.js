"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrongImageNodeParser = void 0;
const creator_1 = require("./creator");
const strongImageRegExp = /\[\[https?:\/\/[^\s\]]+\.(?:png|jpe?g|gif|svg)\]\]/i;
const strongGyazoImageRegExp = /\[\[https?:\/\/(?:[0-9a-z-]+\.)?gyazo\.com\/[0-9a-f]{32}\]\]/;
const createStrongImageNode = raw => {
    const src = raw.substring(2, raw.length - 2);
    const isGyazoImage = /^https?:\/\/([0-9a-z-]\.)?gyazo\.com\/[0-9a-f]{32}$/.test(src);
    return {
        type: 'strongImage',
        raw,
        src: isGyazoImage ? `${src}/thumb/1000` : src
    };
};
exports.StrongImageNodeParser = creator_1.createNodeParser(createStrongImageNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [strongImageRegExp, strongGyazoImageRegExp]
});
//# sourceMappingURL=StrongImageNode.js.map