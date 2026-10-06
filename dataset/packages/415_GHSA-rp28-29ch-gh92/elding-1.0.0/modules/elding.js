// Parses Elding JS in HTML file
elding = function(data) {
	// Find <$ $> tags
	data = data.replace(/<\$(.|\n)+\$>/g, function(file){
		// Strip <$ ... $>
		file = file.replace(/(<\$ ?)|( ?\$>)/g, "");

		// Try to load requested file
		try {
			console.log(process.cwd() + file)
			return fs.readFileSync(file, 'utf8');
		}

		// If we can't, dont return anything
		catch(err) {
			log.error("Missing include " + file)
			return "";
		}
	});

	// Find code wrapped in <# code #>
	data = data.replace(/<#(.|\n)+#>/g, function(code){
		// Strip <# ... #>
		code = code.replace(/(<#)|(#>)/g, "");

		// Build in the show function
		code = "show = function(arg) { return arg }; " + code;

		//Eval the code
		return eval(code);
	});

	return data;
}

module.exports = elding;