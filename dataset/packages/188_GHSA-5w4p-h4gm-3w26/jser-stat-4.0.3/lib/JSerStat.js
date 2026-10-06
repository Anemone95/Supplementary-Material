// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("array.prototype.find");
var JSerItem_1 = require("./models/JSerItem");
var JSerPost_1 = require("./models/JSerPost");
var JSerWeek_1 = require("./models/JSerWeek");
var AlgoItem_1 = require("./algo/AlgoItem");
var AlgoPost_1 = require("./algo/AlgoPost");
var NaturalSearcher_1 = require("./natural/NaturalSearcher");
var sortBy = require("lodash.sortby");
function sortByDate(items) {
    return sortBy(items, function (item) {
        return item.date;
    });
}
function filterJSerCategory(article) {
    return /jser/i.test(article.category);
}
var JSerStat = /** @class */ (function () {
    function JSerStat(rawItems, rawPosts) {
        this._rawItems = rawItems;
        this._rawPosts = rawPosts;
        /**
         * 日付で昇順にsortされたItems
         * @type {JSerItem[]}
         * */
        this.items = sortByDate(this._rawItems).map(function (item) {
            return new JSerItem_1.JSerItem(item);
        });
        /**
         * 日付で昇順にsortされてposts
         *  @type {JSerPost[]}
         **/
        this.posts = sortByDate(this._rawPosts)
            .filter(filterJSerCategory)
            .map(function (post, index) {
            return new JSerPost_1.JSerPost(index + 1, post);
        });
        /**
         *
         * @type {JSerWeek[]}
         * @private
         */
        this._weeks = [];
        /**
         *  @type {AlgoItem}
         *  @private
         **/
        this._algoItem = new AlgoItem_1.AlgoItem(this.items);
        /**
         * @type {AlgoPost}
         * @private
         */
        this._algoPost = new AlgoPost_1.default(this.posts);
        /**
         * @type {NaturalSearcher}
         */
        this.naturalSearch = null;
    }
    /**
     * 全部で何週あるかを返す(投稿記事の数と一致)
     * @returns {number}
     */
    JSerStat.prototype.getTotalWeekCount = function () {
        return this.posts.length;
    };
    /**
     * beginからendの範囲のJSerItemの配列を返す
     * @param {Date} beginDate
     * @param {Date} endDate
     * @returns {JSerItem[]}
     */
    JSerStat.prototype.findItemsBetween = function (beginDate, endDate) {
        return this._algoItem.findItemsBetween(beginDate, endDate);
    };
    // deprecated
    JSerStat.prototype.getItemsBetWeen = function (beginDate, endDate) {
        return this.findItemsBetween(beginDate, endDate);
    };
    /**
     * 全てのJSerWeekの配列を返す
     * @returns {JSerWeek[]}
     */
    JSerStat.prototype.getJSerWeeks = function () {
        var _this = this;
        if (this._weeks.length === 0) {
            this._weeks = this.posts.reduce(function (results, currentPost, index) {
                var prevPost = _this.posts[index - 1];
                var jserWeek = new JSerWeek_1.JSerWeek(currentPost, prevPost, _this._algoItem);
                results.push(jserWeek);
                return results;
            }, []);
        }
        return this._weeks;
    };
    /**
     * beginからendの範囲に含まれるJSerWeekの配列を返す
     * JSerWeek#beginDate または JSerWeek#endDate どちらかがかかれば含まれると判断される
     * @param {Date} beginDate
     * @param {Date} endDate
     * @returns {JSerWeek[]}
     */
    JSerStat.prototype.findJSerWeeksBetween = function (beginDate, endDate) {
        var weeks = this.getJSerWeeks();
        var beginTime = beginDate.getTime();
        var endTime = endDate.getTime();
        return weeks.filter(function (week) {
            var weekBeginTime = week.beginDate.getTime();
            var weekEndTime = week.endDate.getTime();
            if (beginTime <= weekBeginTime && weekBeginTime <= endTime) {
                return true;
            }
            if (beginTime <= weekEndTime && weekEndTime <= endTime) {
                return true;
            }
            return false;
        });
    };
    // deprecated
    JSerStat.prototype.getJSerWeeksBetWeen = function (beginDate, endDate) {
        return this.findJSerWeeksBetween(beginDate, endDate);
    };
    /**
     * JSer.info #xxx を返す
     * @param {number} number number start with 1
     * @returns {JSerWeek}
     */
    JSerStat.prototype.findJSerWeek = function (number) {
        if (number <= 0) {
            throw new Error("number:" + number + " should be >= 1");
        }
        if (number > this.posts.length) {
            return null;
        }
        var targetPost = this.posts[number - 1];
        var prevPost = this.posts[number - 2];
        return new JSerWeek_1.JSerWeek(targetPost, prevPost, this._algoItem);
    };
    /**
     * `postURL`に一致するJSerWeekを返す
     * @param {string} postURL
     * @returns {JSerWeek|undefined}
     */
    JSerStat.prototype.findJSerWeekWithURL = function (postURL) {
        var weeks = this.getJSerWeeks().filter(function (week) {
            return week.post.url === postURL;
        });
        if (weeks.length > 0) {
            return weeks[0];
        }
        return;
    };
    // deprecated
    JSerStat.prototype.getJSerWeek = function (number) {
        return this.findJSerWeek(number);
    };
    /**
     * JSerItemを含んでいるJSerWeekを検索して返す.
     * @param {Object} jserItem the jserItem is raw object for JSerItem
     * @return {JSerWeek|null} The week contain this jserItem.
     * 未来の記事などJSerWeekに所属していない場合もある
     */
    JSerStat.prototype.findWeekWithItem = function (jserItem) {
        var targetItem = new JSerItem_1.JSerItem(jserItem);
        var tenDaysAfter = new Date(targetItem.date);
        tenDaysAfter.setDate(targetItem.date.getDate() + 10);
        var jSerWeeks = this.findJSerWeeksBetween(targetItem.date, tenDaysAfter);
        return jSerWeeks.find(function (week) {
            if (week.post.date < targetItem.date) {
                return false;
            }
            return week.items.some(function (item) {
                return targetItem.isEqualItem(item);
            });
        });
    };
    /**
     * URLとマッチするJSerItemを返す
     * @param {string} URL
     * @return {JSerItem}
     */
    JSerStat.prototype.findItemWithURL = function (URL) {
        return this.items.find(function (item) {
            return item.url === URL;
        });
    };
    /**
     * `item` と関連するJSerItemの配列を返す
     * @param {JSerItem} item
     * @param {number} limit
     * @returns {JSerItem[]}
     */
    JSerStat.prototype.findRelatedItems = function (item, limit) {
        if (limit === void 0) { limit = 10; }
        if (this.naturalSearch == null) {
            this.naturalSearch = new NaturalSearcher_1.default(this.items);
        }
        return this.naturalSearch.findRelatedItems(item, limit);
    };
    return JSerStat;
}());
exports.JSerStat = JSerStat;
//# sourceMappingURL=JSerStat.js.map