// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var algoSearch_1 = require("./algoSearch");
// for algorithm
var AlgoItem = /** @class */ (function() {
    /**
     *
     * @param {JSerItem[]} items
     */
    function AlgoItem(items) {
        this.items = items;
        /**
         * @type number[] 昇順となった各Itemのtime配列
         */
        this.itemTimes = items.map(function(item) {
            return item.date.getTime();
        });
    }
    /**
     *
     * @param {Date} beginDate
     * @param {Date} endDate
     * @returns {JSerItem[]}
     */
    AlgoItem.prototype.findItemsBetween = function(beginDate, endDate) {
        var indexes = algoSearch_1.findIndexesBetween(this.itemTimes, beginDate, endDate);
        var first = indexes[0];
        var last = indexes[indexes.length - 1];
        if (indexes.length === 0) {
            return [];
        }
        if (first > last) {
            return [];
        }
        return this.items.slice(first, last + 1);
    };
    return AlgoItem;
})();
exports.AlgoItem = AlgoItem;
//# sourceMappingURL=AlgoItem.js.map
