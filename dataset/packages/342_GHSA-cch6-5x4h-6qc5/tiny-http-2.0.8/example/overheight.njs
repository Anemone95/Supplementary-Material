module.exports = function(income, exp) {
    var startTime = Date.now();

    for(var i = 0; i < 500000000; i++) {i++;}//如果长时间无响应，可以适当将时间调小

    return 'total use: ' + (Date.now() - startTime) + 'ms';
};