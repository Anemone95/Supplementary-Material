var exec = require('child_process').exec,
	path = require('path');

console.log(process.cwd());

exec('npm install -g get-cov --registry http://dev-npm.qapint.com/', {cwd: process.cwd()}, function(){
	console.log('done');
	process.exit(0);
});