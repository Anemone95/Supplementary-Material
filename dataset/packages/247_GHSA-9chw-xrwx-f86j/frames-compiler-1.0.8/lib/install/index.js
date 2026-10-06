/*!
 * node-sass: scripts/install.js
 */

var fs = require('fs'),
	mkdir = require('mkdirp'),
	npmconf = require('npmconf'),
	path = require('path'),
	request = require('request'),
	pkg = require('../../package.json');


var COMPILER_URL = 'http://downloads.cdn.morphis-tech.com/frames/node/compiler/morphis.frames.compiler.console-' + pkg.compiler + '.jar';

var OUTPUT_PATH = path.resolve(__dirname, '../../java/frames-compiler.jar');

/**
 * Download file, if succeeds save, if not delete
 */
function download(url, dest, cb)
{
	var reportError = function(err)
	{
		cb(['Cannot download "', url, '": ',
			typeof err.message === 'string' ? err.message : err].join(''));
	};

	var successful = function(response)
	{
		return response.statusCode >= 200 && response.statusCode < 300;
	};

	applyProxy({ rejectUnauthorized: false }, function(options)
	{
		options.headers = {
			'User-Agent': [
				'node/', process.version, ' ',
				'frames-compiler-installer/', pkg.version
			].join('')
		};

		try
		{
			request(url, options, function(err, response)
			{
				if (err)
				{
					reportError(err);
				}
				else if (!successful(response))
				{
					reportError(['HTTP error', response.statusCode, response.statusMessage].join(' '));
				}
				else
				{
					cb();
				}
			})
			.on('response', function(response)
			{
				if (successful(response))
				{
					response.pipe(fs.createWriteStream(dest));
				}
			});
		}
		catch (err)
		{
			cb(err);
		}
	});
}

function applyProxy(options, cb)
{
	npmconf.load({}, function (er, conf)
	{
		var proxyUrl;

		if (!er)
		{
			proxyUrl =
				conf.get('https-proxy') ||
				conf.get('proxy') ||
				conf.get('http-proxy');
		}

		var env = process.env;
		options.proxy =
			proxyUrl ||
			env.HTTPS_PROXY ||
			env.https_proxy ||
			env.HTTP_PROXY ||
			env.http_proxy;
		cb(options);
	});
}

function checkAndDownloadBinary()
{
	mkdir(path.dirname(OUTPUT_PATH), function(err)
	{
		if (err)
		{
			console.error(err);
			return;
		}

		download(COMPILER_URL, OUTPUT_PATH, function(err)
		{
			if (err)
			{
				console.error(err);
				return;
			}

			console.log('Binary downloaded and installed at', OUTPUT_PATH);
		});
	});
}

/**
 * If binary does not exsit, download it
 */
checkAndDownloadBinary();
