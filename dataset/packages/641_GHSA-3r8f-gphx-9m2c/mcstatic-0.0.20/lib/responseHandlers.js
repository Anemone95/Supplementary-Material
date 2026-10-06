var fs = require('fs');
var statusHandlers = require('./statusHandlers');

var handleRange = function(res, file, stat){
    var total = stat.size;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];
    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total-1;
    var chunksize = (end-start)+1;
    var fstream = fs.createReadStream(file, {start: start, end: end});
    res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': contentType || 'application/octet-stream' });
    return fstream.pipe(res);
};

var handleHead = function(req, res){
    res.statusCode = req.statusCode || 200;
    return res.end();
};

var streamResponse = function(res, file, stat, next){
    var stream = fs.createReadStream(file);
    res.setHeader('content-length', stat.size);

    stream.pipe(res);
    stream.on('error', function (err) {
        statusHandlers['500'](res, next, { error: err });
    });

    stream.on('end', function () {
        res.statusCode = 200;
        res.end();
    });
};

module.exports = {
    handleHead : handleHead,
    handleRange : handleRange,
    handleGet : streamResponse,
    handlePut : streamResponse,
    handlePost : streamResponse,
    handleDelete : streamResponse
};