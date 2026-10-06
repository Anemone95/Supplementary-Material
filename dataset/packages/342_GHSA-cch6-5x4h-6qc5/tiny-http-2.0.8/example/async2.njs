module.exports = function(income, exp, done) {
    setTimeout(function() {
        done('hello world');
    }, 1000);
    return false;//返回false表示数据会以异步形式传递
};