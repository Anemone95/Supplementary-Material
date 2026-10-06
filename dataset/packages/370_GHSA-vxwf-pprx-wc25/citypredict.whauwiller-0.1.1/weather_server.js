var fs = require('fs');
var http = require('http');
var url = require('url');
var root_dir = "html/";

http.createServer( function(req, res) {
	var urlObj = url.parse(req.url, true, false);
	if(urlObj.pathname.indexOf("getcity") != -1){
		fs.readFile('cities.dat.txt', function(err, data) {
			if(err){
				throw err;
			}
			var searchStr = urlObj.query.q;
			var searchExp = new RegExp("^" + searchStr);
                        var returnValue = [];
			var cities = data.toString().split("\n");
			for(var i = 0; i < cities.length; i++){
				var searchResult = cities[i].search(searchExp);
				if(searchResult != -1){
					returnValue.push({'city': cities[i]});
				}
			}
			res.writeHead(200);
			res.end(JSON.stringify(returnValue));
		});
	} else {
		fs.readFile(root_dir + urlObj.pathname, function(err, data){
			if(err){
				res.writeHead(404);
				res.end(JSON.stringify(err));
				return;
			}
			res.writeHead(200);
			res.end(data);
		});
	}
}).listen(80);	
