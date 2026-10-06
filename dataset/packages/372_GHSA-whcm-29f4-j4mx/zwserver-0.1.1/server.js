var fs = require('fs');
var http = require('http');
var url = require('url');

String.prototype.startsWith = function(prefix){
	return this.indexOf(prefix) == 0;
}

console.log('Starting server on port 8080');
http.createServer(function (req, res) {
	var urlObj = url.parse(req.url, true);
	if(urlObj.pathname.search("getcity") > 0){
		var prefix = urlObj.query['q'].toLowerCase();
		res.writeHead(200);
		fs.readFile(__dirname + "/html/cities.dat.txt", function(err,data){
			if(err){
				res.writeHead(404);
				res.end(JSON.stringify(err));
				return;
			}
			res.writeHead(200);
			var cities = [];
			data.toString().split("\n").forEach(function(element){
				if(element.toLowerCase().startsWith(prefix)){
					cities.push({city:element});
				}
			});
			res.end(JSON.stringify(cities));
		});
	}else{
		var directory = process.argv[2] || __dirname + "/html";
		fs.readFile(directory + urlObj.pathname, function (err,data) {
			if (err) {
				res.writeHead(404);
				res.end(JSON.stringify(err));
				return;
			}
			res.writeHead(200);
			res.end(data);
		});
	}
}).listen(8080);