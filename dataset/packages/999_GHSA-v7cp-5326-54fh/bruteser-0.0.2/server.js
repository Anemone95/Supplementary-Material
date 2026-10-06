var http = require('http');
var url  = require('url');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function(req, res) {
	
	var filepath = req.url;
	if (filepath=='/') {
		var filepath = '/index.html';
	}

	var ext = path.extname(filepath);

	switch (ext) {
		case '.html':
			res.setHeader('content-type', 'text/html');
		break;
		case '.css':
			res.setHeader('content-type', 'text/css');
		break;
	}
	
	
	res.writeHead(200);

	console.log(filepath);

	fs.readFile('public'+filepath, function (err, data){
		if (err) {
			if (filepath === '/index.html') {
				res.end("It seems there is no index.html file in 'public' directory");
			} else {
				res.end("There is no file by this address");
			}

			

		}
		res.end(data);
	});

});

server.listen(8080);

console.log("Server is running on port 8080");