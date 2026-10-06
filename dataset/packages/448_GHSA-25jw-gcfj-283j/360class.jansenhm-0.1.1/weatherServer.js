 
var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html";
http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  console.log("URL path "+urlObj.pathname);
  console.log("URL search "+urlObj.search);
  console.log("URL query "+JSON.stringify(urlObj.query));

  if (urlObj.pathname == "/getCity") {
    console.log("In ReST Services");
    var jsonResult = [];
    var cityRegex = new RegExp("^"+urlObj.query["q"],"i");
    console.log("Regex: " + cityRegex);
    fs.readFile('lib/cities.dat.txt', function (err, data) {
      if(err) {
	res.writeHead(404);
	res.end(JSON.stringify(err));
	return;
      }
      cities = data.toString().split("\n");
      for(var i = 0; i < cities.length; i++) {
	if (cities[i].search(cityRegex) != -1) {
	  jsonResult.push({city:cities[i]});
	  console.log(cities[i]);
	}
      }
      console.log("Read the result!" + JSON.stringify(jsonResult));
      res.writeHead(200);
      res.end(JSON.stringify(jsonResult));
    });
  } else {
    fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  } 
}).listen(80);


 
