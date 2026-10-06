"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrongIconNodeParser = void 0;
const creator_1 = require("./creator");
const IconNode_1 = require("./IconNode");
const strongIconRegExp = /\[\[[^[\]]*\.icon(?:\*\d+)?\]\]/;
const createStrongIconNode = IconNode_1.generateIconNodeCreator('strongIcon');
exports.StrongIconNodeParser = creator_1.createNodeParser(createStrongIconNode, {
    parseOnNested: false,
    parseOnQuoted: true,
    patterns: [strongIconRegExp]
});
//# sourceMappingURL=StrongIconNode.js.map