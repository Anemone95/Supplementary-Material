'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

var spawn = require('child_process').spawn;
var byline = require('byline');

module.exports = build;

function build (params) {
	if (_.isString(params)) {
		params = params.split(/\s+/);
	}
	if (_.isEmpty(params)) {
		params = ['-ig', '--format', 'json'];
	}

	var path = process.env.MYSTEM_PATH || (__dirname + '/bin/mystem');

	var mystem = spawn(path, params, { stdio: 'pipe' });
	var queue = [];

	function getData (data) {
		var json = data.toString();
		return JSON.parse(json);
	}

	function getError (data) {
		return data.toString();
	}

	function respond (method, data) {
		var request = queue[0];
		queue = queue.slice(1);
		if (request && request[method]) {
			request[method](data);
		}
	}

	byline(mystem.stdout).on('data', _.flow(getData, _.partial(respond, 'resolve')));
	byline(mystem.stderr).on('data', _.flow(getError, _.partial(respond, 'reject')));

	function analyze (text) {
		return new Promise(function (resolve, reject) {
			queue.push({
				resolve: resolve,
				reject: reject
			});
			mystem.stdin.write(text + '\n');
		});
	}

	function close () {
		return new Promise(function (resolve, reject) {
			mystem.on('close', resolve);
			mystem.on('error', reject);
			mystem.kill();
		});
	}

	return {
		analyze: analyze,
		close: close
	};
}
