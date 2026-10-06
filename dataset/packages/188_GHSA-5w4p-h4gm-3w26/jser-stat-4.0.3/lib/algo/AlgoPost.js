// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var algoSearch_1 = require("./algoSearch");
// for algorithm
var AlgoPost = /** @class */ (function () {
    /**
     *
     * @param {JSerPost[]} posts
     */
    function AlgoPost(posts) {
        this.posts = posts;
        /**
         * @type number[] 昇順となった各Postのtime配列
         */
        this.postTimeIndex = posts.map(function (post) {
            return post.date.getTime();
        });
    }
    /**
     *
     * @param {Date} beginDate
     * @param {Date} endDate
     * @returns {JSerPost[]}
     */
    AlgoPost.prototype.findPostsBetween = function (beginDate, endDate) {
        var indexes = algoSearch_1.findIndexesBetween(this.postTimeIndex, beginDate, endDate);
        var first = indexes[0];
        var last = indexes[indexes.length - 1];
        if (indexes.length === 0) {
            return [];
        }
        // [1, 0] or [ 1, -1]
        if (first > last && last <= 0) {
            return [];
        }
        // [1, 10]
        return this.posts.slice(first, last + 1);
    };
    return AlgoPost;
}());
exports.default = AlgoPost;
//# sourceMappingURL=AlgoPost.js.map