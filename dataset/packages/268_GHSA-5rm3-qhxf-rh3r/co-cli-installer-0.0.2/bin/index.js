#!/usr/bin/env node

/*var program = require('commander'),
	pkg = require('./package.json');

program
	.version(pkg.version)
	.option('-i, --install', 'Installs co-cli')
	.option('-r, --uninstall', 'Installs co-cli')*/

var exec = require('child_process').exec,
	path = require('path');

exec('npm install -g co-cli --registry http://dev-npm.qapint.com/', function(){
	console.log('done');
	process.exit(0);
});