var args = process.argv;
var num = 0;

// Voodoo magic to see if the first command is node
args = require('minimist')(process.argv.slice((args[0].split("/").pop() == "node")? 2 : 1));

// If there is one thing, we need to do a small type conversion
if (!Array.isArray(args.n)) args.n = [args.n];

// For every file, run it
for (var i = args._.length - 1; i >= 0; i--) {
	if (!args.n[i]) args.n[i] = ++num;
	console.time(args.n[i]);
	require(args._[i]);
	console.timeEnd(args.n[i]);
}