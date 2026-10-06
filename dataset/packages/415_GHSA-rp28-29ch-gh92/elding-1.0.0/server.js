#! /usr/bin/env node

// All required utilities
require("./lib/utils.js");
debug = true;

// All libraries
var http = require("http");
var fs = require("fs");

// All config files
var config = require("./config.json");
var modules = require("./modules/modules.js");

log.info("Server started at http://localhost:" + config.port)
function onRequest(request, response) {
	var data;
	var req_file;
	var dir;

	log.plain("Request " + request.url);

	// Parse request
	var parsed_request = request.url;
	var dir_struct = parsed_request.split("/").last().split(".");

	dir = (dir_struct.length == 1)? request.url : parsed_request.split("/").slice(0,-1).join("/");

	// If they are requesting a directory, serve the default file
	if (dir_struct.length == 1) {

		// Append a "/" if it's the top directory
		parsed_request += (dir_struct == "")? "" : "/";
		
		// append index
		parsed_request += config.index;
	}

	// Parse request for further use
	parsed_request = parsed_request.split("/");

	// Determine File extension
	var extension = parsed_request.last().split(".").last();

	// check if requested file fits rule in deny.json
	var denied = config.deny.map( function(x) {
		return match_file(parsed_request.last(), x);
	});


	// If the file fits more than one rule, send 403 error
	if (denied.sum() > 0) {

		// Log the request
		log.warn("Responded with 403 to requested " + req_file);

		// Assemble the head
		response.writeHead(403, {"Content-Type": config.error.e_403.type});

		// Write the content
		response.write(config.error.e_403.type);

		// End the connection
		response.end();

		// End the function with an error code
		return 403;
	}

	else {
		req_file = "." + parsed_request.join("\/");

		// Try to send a request. Most things that go wrong will be caught with a 500 error
		try {

			// See if the file exists
			try {
				data = fs.readFileSync(req_file, 'utf8');
			}

			// Throw 404 if we can't load it (most likely because it's not there)
			catch(err) {
				log.error("Responded with 404. Could not find " + req_file);
				response.writeHead(404, {"Content-Type": config.error.e_404.type});
				response.write(config.error.e_404.content);
				response.end();
				return 404;
			}

			// Set head to a blank string if it is not set up
			if (config.head == undefined) {
				config.head = "";
			}

			// Generate our head file
			var head = "<head> " + config.head;

			// Add the stylesheet if we need it
			// if (config.css_exts.indexOf(extension) >= 0) head += "<link rel='stylesheet' href=" + dir + "/" + config.css + ">";

			head += "</head>";

			// Add head to the beginning
			data = head + data;

			// Parse based on extension
			/* NOTE: Neat little thing is happening here
			 * We have the wierd double parenthases ()()
			 * becuase modules.load() is loading a function
			 * and the second set of parenthases executes it.
			 * Here's a more drawn out version:
			 * 
			 * parse = modules.load(extension)
			 * data = parse(data)
			 * 
			 * I thought it was pretty neat, at least.
			*/
			data = modules.load(extension)(data);

			// Respond with http 200
			log.plain("Responded with 200");
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write(data);
			response.end();
			return 200;
		}

		// If something goes wrong, throw a generic 500
		catch(err) {
			log.error("Responded with 500. Something went wrong serving " + req_file + "\nSee below for error.");
			log.dev(err);
			response.writeHead(500, {"Content-Type": config.error.e_500.type});
			response.write(config.error.e_500.content);
			response.end();
			return 500;
		}
	}
}

http.createServer(onRequest).listen(config.port);