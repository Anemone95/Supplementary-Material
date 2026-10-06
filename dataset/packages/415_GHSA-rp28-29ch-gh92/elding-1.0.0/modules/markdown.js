// Markdown
md = function(data) {
	// Get libraries
	var marked = require("marked");
	var elding = require("./elding.js");

	// Use above library
	return marked(data);
}

module.exports = md;