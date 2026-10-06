var http = require('http');
var fs   = require('fs');
var url  = require('url');

var ROOT_DIR = "html";

http.createServer(function(req, res) {
	var urlObj = url.parse(req.url, true, false);
	if(urlObj.pathname == "/getcity") {
		fs.readFile(ROOT_DIR + "/cities.dat.txt", function(err, data) {
			if(err) {
				console.log("Failed to get file: cities.data.txt");
				res.writeHead(500);
				res.end(JSON.stringify(err));
				return;
			}

			var cities = new Array();
			var cityList = data.toString().split('\n');
			for(var i in cityList) {
				var city = cityList[i];
				if(city != "") {
					if(urlObj.query.q != null && city.toLowerCase().indexOf(urlObj.query.q.toLowerCase()) != 0) {
						continue;
					}

					cities.push({ city: city });
				}
			}

			res.writeHead(200);
			res.end(JSON.stringify(cities));
		});
		return;
	}
	fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
		if(err) {
			res.writeHead(404);
			res.end(JSON.stringify(err));
			return;
		}

		res.writeHead(200);
		res.end(data);
	});
}).listen(80);
