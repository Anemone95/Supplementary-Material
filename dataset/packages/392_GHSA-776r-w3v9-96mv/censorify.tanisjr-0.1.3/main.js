var fs = require('fs');

var http = require('http');
var url = require('url');
var ROOTDIR = "~/node_project";

var route = "";
var citiesRoute = "getcity";

http.createServer(function (req, res) 
{
	var urlObj = url.parse(req.url, true, false);
	console.log(urlObj.pathname);
	console.log(urlObj.query["q"]);
	var input = urlObj.query["q"];
	if(urlObj.pathname.indexOf(citiesRoute) !== -1)
	{
		console.log("Use query string to find matching cities...");
		var jsonArray = [];
		fs.readFile('cities.dat.txt', function(err, data)
		{
			if(err)
				throw err;
			var cities = data.toString().split('\n');
			for(var i = 0; i < cities.length; i++)
			{
				if(cities[i].substring(0, input.length) === input)
					jsonArray.push({city:cities[i]});
			}
			res.writeHead(200);
			res.end(JSON.stringify(jsonArray));
			console.log(jsonArray);
		});
	}	
	else
	{
		console.log("Grab the file and return it.");
		console.log(urlObj.pathname.substring(1));
		var srcStream = fs.createReadStream(urlObj.pathname.substring(1));
		srcStream.on('open', function (err, data)
		{
			res.writeHead(200);
			srcStream.pipe(res);
		});

		srcStream.on('error', function (err)
		{
			if (err)
			{
				res.writeHead(404);
				res.end(JSON.stringify(err));
				return;
			}
		});
	}	
	
}).listen(80);




