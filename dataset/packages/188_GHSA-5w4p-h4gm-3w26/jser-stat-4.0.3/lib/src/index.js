// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _Posts = require("../data/posts.json");
var _Items = require("../data/items.json");
var JSerStat_1 = require("./JSerStat");
var JSerStat = function _JSerStat(items, posts) {
    if (items === void 0) {
        items = _Items;
    }
    if (posts === void 0) {
        posts = _Posts;
    }
    return new JSerStat_1.JSerStat(items, posts);
};
exports.JSerStat = JSerStat;
var compute = require("./compute/compute-tags");
exports.compute = compute;
//# sourceMappingURL=index.js.map
