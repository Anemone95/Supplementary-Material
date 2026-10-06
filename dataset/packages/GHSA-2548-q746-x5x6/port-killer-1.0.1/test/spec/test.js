'use strict';

const spawn = require('child_process').spawn;
const tape = require('tape');
const portKiller = require('./../../');

tape('exports a function', test => {
	test.equal(typeof portKiller, 'function');
	test.end();
});

tape('throws error without port', test => {
	test.equal(portKiller().error, true);
	test.end();
});

tape('throws error with privileged port', test => {
	test.equal(portKiller(80).error, true);
	test.end();
});

tape('kills process', test => {
	spawn('http-server', ['-p', 9993]);

	setTimeout(() => {
		test.equal(portKiller(9993).error, false);
		test.end();
	}, 1000);
});
