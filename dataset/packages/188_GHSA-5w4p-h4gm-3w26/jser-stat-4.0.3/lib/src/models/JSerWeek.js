// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSerWeek = /** @class */ (function() {
    function JSerWeek(currentPost, prevPost, algoItem) {
        /** @type {number} */
        this.weekNumber = currentPost.postNumber;
        /**
         * first post has not date, fill with real firstWeek
         * new Date("2010-12-31T15:00:00.000Z") is actual started date
         * @type {Date}
         * */
        this.beginDate = prevPost ? prevPost.date : new Date("2010-12-31T15:00:00.000Z");
        /** @type {Date} */
        this.endDate = currentPost.date;
        /** @type {JSerPost} */
        this.post = currentPost;
        /** @type {JSerItem[]} */
        this._items = [];
        this._algoItem = algoItem;
    }
    Object.defineProperty(JSerWeek.prototype, "items", {
        get: function() {
            if (this._items.length === 0) {
                this._items = this._algoItem.findItemsBetween(this.beginDate, this.endDate);
            }
            return this._items;
        },
        enumerable: true,
        configurable: true
    });
    return JSerWeek;
})();
exports.JSerWeek = JSerWeek;
//# sourceMappingURL=JSerWeek.js.map
