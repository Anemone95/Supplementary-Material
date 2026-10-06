var tomita = require("./");

tomita("/Users/roman/tomita-mac")
	.src("input.txt")
	.dict("dic.gzt")
	.run(function(output){
		console.log("example");
		console.log(output);
	});