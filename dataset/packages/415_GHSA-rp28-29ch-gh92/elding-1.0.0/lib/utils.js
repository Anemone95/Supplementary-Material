var fs = require("fs");
var config = require("../config.json");

// Gets the last value from an array
Array.prototype.last = function () {
	return this[this.length - 1];
};

// Gets sum of an array
Array.prototype.sum = function () {
	return this.reduce((prev, curr) => prev + curr);
};

// Wildcard matching function
match_file = function(str, rule) {
	return new RegExp("^" + rule.replace("\.", "\\\.").replace("*", ".*") + "$").test(str);
}

// Make log "class"
log = {};
debug = false;
header = "";

// Colours are important
colour = function(clr, string) {
	colours = {
		"red"	: "\x1b[31m",
		"yellow": "\x1b[33m",
		"blue"	: "\x1b[34m",
		"green"	: "\x1b[32m"
	}

	return colours[clr] + string + "\x1b[0m"
}

// Generic log function
log.plain = function(str) {

	// Only log to console if debug is true
	if (debug){
		console.log(header + str);
	}

	// Add the date/time and a newline
	str = Date().split(" ").slice(1,5).join(" ") + "> " + str + "\n";

	// Append the out put to log.txt
	fs.appendFile(config.log_file, str, function (err) {});
}

// Specific functions
log.error = function(str) { log.plain(colour("red", str)) }
log.warn = function(str) { log.plain(colour("yellow", str)) }
log.dev = function(str) { log.plain(colour("blue", str)) }
log.info = function(str) { log.plain(colour("green", str)) }