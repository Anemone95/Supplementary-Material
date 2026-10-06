// Required libraries
require("../lib/utils.js");
var fs = require("fs");

// The config
var config = require("../config.json");

var modules = {};

modules.load = function(ext) {
	// If the extension is listed to be parsed
	if (config.parse[ext]) {
		// Try to load the js file
		try {
			return require("./" + config.parse[ext]);
		}

		// If we can't, just return a blank function and log an error
		// TODO: Honestly, IDK what I should do
		catch(err) {
			log.error("Missing module " + config.parse[ext])
			return function(data) { return data };
		}
	}

	// If we can't, try to return the default
	// Try to load the js file
	try {
		return require("./" + config.parse["default"]);
	}

	// If we can't, just return a blank function and log an error
	catch(err) {
		log.error("Missing default module " + config.parse[ext])
		return function(data) { return data };
	}
};

module.exports = modules;