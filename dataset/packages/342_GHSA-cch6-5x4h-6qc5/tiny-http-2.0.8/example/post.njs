module.exports = function(income, exp) {
    var startTime = Date.now();
    exp.date = new Date();
    exp.income = income;
    exp.startTime = startTime;

    return function(request, response, exp) {//return一个function,可以自己定义response
        //注：function里面的代码会回到主进程执行，所以不要在此执行占CPU代码

        response.write(TH.read('post.html'));
        var querystring = require('querystring');
        response.write(exp.income.method + ' data is:' + JSON.stringify(querystring.parse(exp.income.data)) + '<br />');
        response.write('request url is:' + exp.income.url + '<br />');
        response.write('headers is:<br>' + require('./sub.js')(request.headers) + '<br>');
        response.write(exp.date + '<br>total use:' + (Date.now() - exp.startTime) + 'ms');
        response.end();
    }
};