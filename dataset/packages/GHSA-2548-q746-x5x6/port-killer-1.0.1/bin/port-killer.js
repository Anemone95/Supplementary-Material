#!/usr/bin/env node
'use strict';

const portkill = require('./../');

const args = process.argv.splice(2);
const results = portkill(args[0]);

if (results.error) {
	console.error(results.message);
	console.error(results.error !== true ? results.error : '');
	process.exit(1);
}

console.log(results.message);
process.exit(0);
