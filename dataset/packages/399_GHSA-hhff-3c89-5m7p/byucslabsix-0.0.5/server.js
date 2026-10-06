var fileService = require('fs');
var myHttpServer = require ('http');
var url = require('url');
var ROOT_DIR = "serverFiles/";
//var options = { //specify key and certificate options
  //key: fileService.readFileSync('serverKey.pem'),
  //cert: fileService.readFileSync('server-cert.pem')
//};
myHttpServer.createServer(function (request, response) {
  //console.log("Server started\n");
  var urlObj = url.parse(request.url, true, false);
  if(urlObj.pathname.indexOf("getCities") != -1) {
    console.log("Into the REST service");
    //console.log("Tryin to open: " + ROOT_DIR + "Lab6/cities.dat.txt");
    fileService.readFile(ROOT_DIR + 'cities.dat.txt', function (err, data) {
      if(err) {
        console.log("Reading error" + JSON.stringify(err));
        throw err;
        }
      var myRegex = new RegExp("^" + urlObj.query["q"]);
      console.log(myRegex);
      var cities = data.toString().split("\n");
      var jsonresult = [];
      for( var i = 0; i < cities.length; i++) {
        var result = cities[i].search(myRegex);
        if(result != -1) {
          console.log(cities[i]);
          jsonresult.push({city: cities[i]});
        }
      }
      console.log(jsonresult);
      response.writeHead(200);
      response.end(JSON.stringify(jsonresult));
    });
  //console.log("The path name received is: ");
  //console.log(urlObj.pathname);
  //console.log("The URL query field is: " + urlObj.query["query"]);
  }
  else {
    fileService.readFile(ROOT_DIR + urlObj.pathname, function (err, data) {
      if(err) {
        console.log("Error\n");
        console.log(JSON.stringify(err));
        response.writeHead(400);
        response.end(JSON.stringify(err));
        return;
    }
    response.writeHead(200);
    response.end(data);
    });
  }
}).listen(6006);
