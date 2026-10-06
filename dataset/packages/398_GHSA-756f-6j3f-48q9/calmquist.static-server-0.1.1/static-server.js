var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "./root";
var server = http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
    if(urlObj.pathname.indexOf("getcity") != -1) {
        // Execute the REST service
        console.log("In REST Service.");
        fs.readFile(ROOT_DIR + '/cities.dat.txt', function(err, data) {
            if(err) {throw err;}
            console.log(urlObj.query);
            var regEx = new RegExp("^" + urlObj.query["q"]);
            console.log(regEx);
            cities = data.toString().split("\n");
            var result = [];
            cities.forEach(function(elem) {
                if(elem.search(regEx) != -1) {
                    console.log(elem);
                    result.push({city:elem});
                }
            });
            console.log(JSON.stringify(result));
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    }
    else {
        // Serve static files
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
    res.writeHead(200);
    res.end(data);
    }
  });
});

server.listen(80);

exports.server = server;

/*var options = {
    hostname: 'localhost',
    port: '80',
    path: '/hello.html'
  };
function handleResponse(response) {
  var serverData = '';
  response.on('data', function (chunk) {
    serverData += chunk;
  });
  response.on('end', function () {
    console.log(serverData);
  });
}
http.request(options, function(response){
  handleResponse(response);
}).end();*/
