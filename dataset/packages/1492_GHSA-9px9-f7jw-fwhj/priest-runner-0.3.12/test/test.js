var express = require('express');
var middleware = require('../src/middleware.js');
var Controller = require('../src/controller.js');
var bodyParser = require('body-parser');

module.exports = runServer;

if (! module.parent) {
    var port = process.argv[2] || 8080;
    var dir = process.argv[3] || __dirname;

    runServer(port, dir);
}

function runServer(port, directory) {
    var priest = new Controller({
        dir: directory || __dirname,
        logs: '../logs'
    });

    express()
        .use(bodyParser.json())
        .use(express.static(__dirname))
        .use('/process', middleware(priest))
        .listen(port, function(){
           console.log("listening localhost:%d", port);
        });

    var timeout = 10;

    process.on('SIGINT', onSignal('SIGINT', timeout));
    process.on('SIGTERM', onSignal('SIGTERM', timeout));
    process.on('SIGQIUT', onSignal('SIGQIUT', timeout));
    process.on('SIGHUP', onSignal('SIGHUP', timeout));

    var isStopped = false;

    function onSignal(signal, timeout) {
        return function () {
            if (isStopped) return;

            priest.stopAll(signal, function(){
                process.exit();
            });

            setTimeout(function(){
                process.exit();
            }, timeout * 1000);

            isStopped = true;
        }
    }
}
