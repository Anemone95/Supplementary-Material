
var Settings = function(options)
{
	this.configfile = options.configfile || null;
	this.input = options.input || null;
	this.output = options.output || null;
	this.approot = options.approot || null;
	this.domroot = options.domroot || null;
	this.lang = options.lang || null;
	this.outdir = options.outdir || null;
	this.enginePath = options.enginePath || null;
	this.type = options.type || null;

	this.parameters = options.parameters || {};
};

Settings.prototype = {
	addParam: function(key, value)
	{
		this.parameters[key] = value;
	},

	toArguments: function()
	{
		var args = [];

		if (this.type === null || this.type === undefined)
		{
			args.push('--type');
			args.push('HTML5');
		}

		for (var p in this)
		{
			if (this.hasOwnProperty(p) && p != 'parameters' && p != 'type')
			{
				var v = this[p];
				if (v !== undefined && v !== null && v !== '')
				{
					args.push('--' + p);
					args.push(v);
				}
			}
		}

		for (var k in this.parameters)
		{
			if (this.parameters.hasOwnProperty(k))
			{
				args.push('-P');
				args.push(k + '=' + this.parameters[k]);
			}
		}

		return args;
	}
};


module.exports = Settings;
