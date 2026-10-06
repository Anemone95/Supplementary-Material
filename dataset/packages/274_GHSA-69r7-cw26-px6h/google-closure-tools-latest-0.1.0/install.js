'use strict';

var path = require('path');
var download = require('download');

var closureToolsUrls = 'http://dl.google.com/closure-compiler/compiler-latest.zip';
var downloadDir = path.join(__dirname, 'bin');

var closureToolsDownload = download(closureToolsUrls, downloadDir, { extract: true , strip: 0});

closureToolsDownload.on('error', function(err){
	if (err) {
		throw new Error('Failed to download "' + closureToolsUrls + '"!\n' + err);
	}
});
closureToolsDownload.on('close', function(){
	console.log('Successfully downloaded "' + closureToolsUrls + '" to:\n    ' + downloadDir);
});