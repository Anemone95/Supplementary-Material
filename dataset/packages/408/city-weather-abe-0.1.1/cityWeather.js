var fs = require('fs');
var http = require('http'); 
var url = require('url');
var ROOT_DIR = "/usr/local/src/projects/node";

http.createServer(function (req, res) 
{
  var urlObj = url.parse(req.url, true, false);
  fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) 
  {	
    /*if (err) 
	{
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }*/
	
	if(urlObj.pathname.indexOf("getcity") !=-1) 
	{
		// Execute the REST service 
		console.log("In REST Service");
		//var jsonresult = [];
		fs.readFile('cities.dat.txt', function (err, data) 
		{
			var myRe = new RegExp("^"+urlObj.query["q"]);
			if(err) throw err;
			var cities = data.toString().split("\n");
			var jsonresult = [];
			for(var i = 0; i < cities.length; i++) 
			{
				var result = cities[i].search(myRe); 
				if(result != -1) 
				{
					console.log(cities[i]);
					jsonresult.push({city:cities[i]});
				}		 
			}	   
			console.log(jsonresult);
			
			res.writeHead(200);
			res.write(JSON.stringify(jsonresult));
			res.end();
		});
		
		console.log("\n:::::::::::::::::::::::::::::::::::::::::::\n");
	} 
	else 
	{
		res.writeHead(200);
		res.end(data);
		// Serve static files
	}
	
  });
}).listen(80);