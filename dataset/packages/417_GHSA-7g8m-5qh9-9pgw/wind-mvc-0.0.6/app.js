var http = require('http');
var controller = require('./controller.js'); 
var config = require('./lib/config.js');
var port = config.port;

http.createServer(controller).listen(port);
console.log("Server has started, on port:" + port);