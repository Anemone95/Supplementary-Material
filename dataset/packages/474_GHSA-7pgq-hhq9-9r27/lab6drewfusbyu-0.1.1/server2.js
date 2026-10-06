var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html/";
http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  console.log("urlObjpath: " + urlObj.pathname);
  if (urlObj.pathname.indexOf("selectCity") != -1) {
    console.log("in selectCity function");
    fs.readFile(ROOT_DIR + "cities.dat.txt", function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      console.log("about to set data to cities");
      var cities = data.toString().split("\n");
      var json = [];
      var myRe = new RegExp("^" +  urlObj.query["q"]);
      for (var i = 0; i < cities.length; i++) {
	var result = cities[i].search(myRe);
        if (result != -1) {
          json.push({city:cities[i]});
        }
      }
      console.log(JSON.stringify(json));
      res.writeHead(200, { 'Content-Type': 'jsonp' });
      res.end(JSON.stringify(json));
      return;
    });
  }
  else {
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
