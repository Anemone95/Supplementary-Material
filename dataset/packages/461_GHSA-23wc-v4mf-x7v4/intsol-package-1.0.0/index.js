/**
 * Created by Ramkumar on 11/7/2015.
 */
var http = require('http');
var fs = require('fs');
var util = require('util');
var os = require('os');
var path = require('path');

var hostName = os.hostname();
var portNumber = process.env.PORT_NUMBER || 9000;
var message = util.format('HTTP Server is Available ... http://%s:%d/',
    hostName, portNumber);
var header = {
    'Keep-Alive': true,
    'Transfer-Encoding': 'chunked',
    'Company-Name': 'GS',
    "Content-Type": 'video/x-ms-wmv'
};
var server = http.createServer(function (request, response) {
    var fileRequested = path.normalize('.' + request.url);

    fs.exists(fileRequested, function (status) {
        if (!status) {
            response.writeHead(404);
            response.end();
        }
        else {
            fs.stat(fileRequested, function (error, stats) {
                if (!error) {
                    if (stats.isDirectory()) {
                        response.writeHead(403);
                        response.end();
                    } else {
                        var stream = fs.createReadStream(fileRequested, {
                            bufferSize: 1024000
                        });

                        response.writeHead(200, header);

                        stream.pipe(response);
                        stream.on('end', function() {
                            response.end();

                            console.log('Stream Ended!');
                        });
                    }
                }
            });
        }
    });
});

server.listen(portNumber);

console.log(message);