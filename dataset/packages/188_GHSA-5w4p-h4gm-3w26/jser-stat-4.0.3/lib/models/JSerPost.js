// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSerPost = /** @class */ (function () {
    function JSerPost(number, post) {
        /** @type {number} */
        // start with 1
        this.postNumber = number;
        /** @type {string} */
        this.title = post["title"];
        /** @type {string} */
        this.url = post["url"];
        /** @type {string} */
        this.content = post["content"];
        /** @type {string} */
        this.category = post["category"];
        /** @type {Date} */
        this.date = new Date(post["date"]);
        /** @type {string[]} */
        this.tags = post["tags"] || [];
    }
    return JSerPost;
}());
exports.JSerPost = JSerPost;
//# sourceMappingURL=JSerPost.js.map