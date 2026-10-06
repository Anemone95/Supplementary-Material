var fs = require("fs");
eval("var message = 'hello world'; " + fs.readFileSync("./tester.js", 'utf8'))