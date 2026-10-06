// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var binarysearch = require("binarysearch");
function findIndexesBetween(times, beginDate, endDate) {
    var beginTime = beginDate.getTime();
    var endTime = endDate.getTime();
    return binarysearch.range(times, beginTime, endTime);
}
exports.findIndexesBetween = findIndexesBetween;
function findIndexBiggerTime(array, time) {
    var currentIndex = 0;
    for (var i = currentIndex; i < array.length; i++) {
        var comparedTime = array[i];
        if (time >= comparedTime) {
            currentIndex = i;
        } else {
            // timeより大きいものが出てきたら直前のものを返す
            return currentIndex;
        }
    }
    return -1;
}
exports.findIndexBiggerTime = findIndexBiggerTime;
function findIndexLessTime(array, time) {
    var currentIndex = array.length - 1;
    for (var i = currentIndex; i >= 0; i--) {
        var comparedTime = array[i];
        if (time < comparedTime) {
            currentIndex = i;
        } else {
            // timeよりも小さいものが出てきたら直前のものを返す
            return currentIndex;
        }
    }
    return -1;
}
exports.findIndexLessTime = findIndexLessTime;
//# sourceMappingURL=algoSearch.js.map
