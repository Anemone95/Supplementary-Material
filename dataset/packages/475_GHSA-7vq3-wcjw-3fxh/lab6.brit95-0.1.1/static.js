var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html";
http.createServer(function (req, res) {
	var urlObj = url.parse(req.url,true,false);
	if(urlObj.pathname.indexOf("getcity") !=-1) {	//new route
		//Execute the REST service
		//console.log("URL path "+urlObj.pathname);
                //console.log("URL search "+urlObj.search);
                //console.log("URL query "+urlObj.query["q"]);
		var query = urlObj.query["q"];
		fs.readFile('cities.dat.txt', function (err, data) {
  		if(err) throw err;
  		var jsonresult = [];
		cities = data.toString().split("\n");
  		for(var i = 0; i < cities.length; i++) {
    			if(cities[i].substring(0,query.length) == query) {
				//console.log(cities[i]);
				jsonresult.push({city:cities[i]});
			}
  		}
		//console.log(jsonresult);
		res.writeHead(200);
		res.end(JSON.stringify(jsonresult));
});
	} else
	{
	//	console.log("About to read file\n");
			
		fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
			if(err) { 
				res.writeHead(404);
				res.end(JSON.stringify(err));
				return;
			}
			res.writeHead(200);
			res.end(data);
		});
	}
}).listen(80);
