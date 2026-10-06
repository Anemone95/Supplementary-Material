var wix = require('./index');

wix.candle('blah.wxs')
	.then(function() {
		return wix.light('blah.wixobj')
	})
	.then(function() {
		console.log('all set');
	})