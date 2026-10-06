var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = 8000,
	cwd = process.cwd();

var logging = false;

for(var i = 0; i < process.argv.length; i++){
	var arg = process.argv[i];
	switch (arg){
		case '-port':
		case '-p':
			port = process.argv[i+1];
			break;
		case '-dir':
		case '-d':
			cwd = process.argv[i+1];
			break;
		case '-log':
		case '-l':
			logging = true;
			break;
		default:
			break;
	}
}

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(cwd, uri);

    if(logging)
    	console.log("Request for",uri);

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()){
    	var output = "<html><body>";
		var files = fs.readdirSync(filename);
		
		for(var f in files){
			if(uri != '/')
				output += "<a href=\""+uri+"/"+files[f]+"\">"+files[f]+"</a>";
			else
				output += "<a href=\"/"+files[f]+"\">"+files[f]+"</a>";
			output += "<br />";	
		}
		
		output += "</body></html>";
		response.writeHead(200);
		response.write(output);
		response.end();
    } else {
	    fs.readFile(filename, "binary", function(err, file) {
	      if(err) {        
	        response.writeHead(500, {"Content-Type": "text/plain"});
	        response.write(err + "\n");
	        response.end();
	        return;
	      }

	      response.writeHead(200);
	      response.write(file, "binary");
	      response.end();
	    });	
    }
  });
}).listen(parseInt(port, 10));

console.log("Listening on port",port,"serving folder",cwd);