var config = require("../config.js");

var conf = config.loadConfig();

exports.configure = function(options) {
	if (!conf) {
		console.log("you must first login");
		return;
	}
	for (var attrname in options) {
		if (options[attrname]) {
			conf[attrname] = options[attrname];
			console.log("set %s to %s", attrname, options[attrname]);
		}
	}
	config.saveConfig(conf);
};