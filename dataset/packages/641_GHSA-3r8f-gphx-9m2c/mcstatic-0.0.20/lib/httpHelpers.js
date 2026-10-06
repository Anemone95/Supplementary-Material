var fs = require('fs');
var url = require('url');
var path = require('path');
var mime = require('mime');

module.exports.getRequestPathFromUrl = function(requestUrl) {
    try {
        requestUrl = requestUrl.replace(/\%00/g, '');
        decodeURI(requestUrl);
        var parsed = url.parse(requestUrl);
        var pathname = decodeURI(parsed.pathname);
    } catch (err) {
        return '';
    }
    if (pathname === '/')
        pathname = '/index.html';
    return pathname;
};

module.exports.setContentType = function (res, file) {
    var stat = fs.statSync(file);
    if (!stat)
        return;

    res.setHeader('last-modified', (new Date(stat.mtime)).toUTCString());
    res.setHeader('content-length', stat.size);

    var contentType = mime.lookup(file), charSet;

    if (contentType) {
        charSet = mime.charsets.lookup(contentType);
        if (charSet) {
            contentType += '; charset=' + charSet;
        }
    }

    res.setHeader('content-type', contentType || 'application/octet-stream');
};