// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var JSerItemRelatedLink_1 = require("./JSerItemRelatedLink");
var JSerItem = /** @class */ (function () {
    function JSerItem(item) {
        /** @type {string} */
        this.title = item["title"];
        /** @type {string} */
        this.url = item["url"];
        /** @type {string} */
        this.content = item["content"];
        /** @type {string[]} */
        this.tags = item["tags"] || [];
        /** @type {Date} */
        this.date = new Date(item["date"]);
        var relatedLinks = item["relatedLinks"] || [];
        /** @type {JSerItemRelatedLink[]} */
        this.relatedLinks = relatedLinks.map(function (link) {
            return new JSerItemRelatedLink_1.default(link);
        });
    }
    /**
     * @param {JSerItem} item
     * @returns {boolean}
     */
    JSerItem.prototype.isEqualItem = function (item) {
        assert(item != null, "item should not be null");
        return this.url === item.url;
    };
    return JSerItem;
}());
exports.JSerItem = JSerItem;
//# sourceMappingURL=JSerItem.js.map