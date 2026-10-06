#!/usr/bin/env node

'use strict';

var fs = require('fs');
var stream = require('stream');

var _ = require('lodash');
var request = require('request');
var targz = require('tar.gz');
var unzip = require('unzip');

var url = _.get({
	'linux': {
		'ia32': "http://download.cdn.yandex.net/mystem/mystem-3.0-linux3.5-32bit.tar.gz",
		'x64': "http://download.cdn.yandex.net/mystem/mystem-3.0-linux3.1-64bit.tar.gz"
	},
	'darwin': {
		'x64': "http://download.cdn.yandex.net/mystem/mystem-3.0-macosx10.8.tar.gz"
	},
	'win32': {
		'ia32': "http://download.cdn.yandex.net/mystem/mystem-3.0-win7-32bit.zip",
		'x64': "http://download.cdn.yandex.net/mystem/mystem-3.0-win7-64bit.zip"
	},
	'freebsd': {
		'x64': "http://download.cdn.yandex.net/mystem/mystem-3.0-freebsd9.0-64bit.tar.gz"
	}
}, [process.platform, process.arch].join('.'));

if (!url) {
	var message = ['Error:', process.platform, process.arch, 'is not supported'].join(' ');
	fail('find')(message);
}

var outputPath = __dirname + '/mystem';

console.log('installing mystem from', url, 'to', outputPath);

var unpacker = /\.tar\.gz$/.test(url) ? targz().createParseStream() : unzip.Parse();

request({ url: url, timeout: 5000 })
	.on('error', fail('download'))
	.pipe(unpacker)
	.on('error', fail('unpack'))
	.on('entry', function (entry) {
		if (entry.path != 'mystem') {
			return;
		}

		var outputStream = fs.createWriteStream(outputPath)
			.on('error', fail('write'))
			.on('finish', function () {
				fs.chmodSync(outputPath, '777');
				console.log('mystem installed');
				process.exit(0);
			});

		entry.pipe(outputStream);
	});

function fail (verb) {
	return function (error) {
		console.error('can not', verb, 'mystem due to', error);
		process.exit(1);
	};
}
