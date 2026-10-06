var path = require('path');
var child_process = require('child_process');

function wixBinWrapper(exe, requiredArgs) {
	return function(/* arguments */) {
		var args = [], opts = {};
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] === 'string') {
				args.push(arguments[i]);
			} else if (typeof arguments[i] === 'object' && i === arguments.length-1) {
				opts = arguments[i];
			} else {
				throw new Error("Wrong arguments for this command");
			}
		}

		return new Promise(function(resolve, reject) {
			var cmd = path.resolve(__dirname, 'wix-bin', exe);

			for (var key in opts) {
				args.unshift('-' + key + ' ' + opts[key]);
			}

			if (process.platform != "win32") {
				args.unshift(cmd);
				cmd = 'wine';
			}

			var child = child_process.spawn(cmd, args);
			child.on('error', function(err) {
				reject(err);
			});

			child.on('close', function() {
				resolve();
			});
		});
	}
}

module.exports = {
	candle: wixBinWrapper('candle.exe'),
	dark: wixBinWrapper('dark.exe'),
	heat: wixBinWrapper('heat.exe'),
	insignia: wixBinWrapper('insignia.exe'),
	light: wixBinWrapper('light.exe'),
	lit: wixBinWrapper('lit.exe'),
	lux: wixBinWrapper('lux.exe'),
	melt: wixBinWrapper('melt.exe'),
	nit: wixBinWrapper('nit.exe'),
	pyro: wixBinWrapper('pyro.exe'),
	retina: wixBinWrapper('retina.exe'),
	shine: wixBinWrapper('shine.exe'),
	smoke: wixBinWrapper('smoke.exe'),
	torch: wixBinWrapper('torch.exe'),
}