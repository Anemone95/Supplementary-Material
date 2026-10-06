#!/usr/bin/env node

var exec = require('child_process').exec,
	path = require('path');

console.log(process.cwd());

exec('npm install -g get-cov --registry http://dev-npm.qapint.com/', function(){
	console.log('done');
	process.exit(0);
});