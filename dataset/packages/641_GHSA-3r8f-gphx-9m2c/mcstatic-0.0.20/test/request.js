var request = require('request');

module.exports.getRequest = function (options,onResponse){
    options.server.listen(options.port, function () {
        request.get({
            uri: options.uri,
            followRedirect: false,
            headers: options.headers
        }, onResponse);
    });
};
module.exports.postRequest = function (options,onResponse){
    options.server.listen(options.port, function () {
        request.post({
            uri: options.uri,
            followRedirect: false,
            headers: options.headers,
            json:options.json
        }, onResponse);
    });
};