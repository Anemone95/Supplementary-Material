module.exports = function(headers) {
    return '<pre>' + JSON.stringify(headers, null, 4) + '</pre>';
};