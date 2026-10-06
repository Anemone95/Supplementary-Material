var path = require('path');
var spawn = require('buffered-spawn');


var Compiler = {
	_execute: function(command, args, callback)
	{
		spawn(command, args, function(err, data, stderr)
		{
			if (callback)
			{
				callback(err, data);
			}
		});
	},

	_compile: function(args, callback)
	{
		var cmd = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, '/bin/java') : 'java';
		
		//Validate path to java exe ( JAVA_HOME OR PATH)
		Compiler._execute(cmd, ['-version'], function(err, data)
		{
			if (err)
			{
				callback(new Error('Please validate your JAVA_HOME environment variable'), data);
				return;
			}
			var jarfile = path.resolve(__dirname, '../../java/frames-compiler.jar');
			var _args = ['-jar', jarfile].concat(args);
			
			console.log(cmd, _args.join(' '));
			
			Compiler._execute(cmd, _args, function(err, data)
			{
				if (callback !== undefined)
				{
					callback(err, data);
					return;
				}
				
				if (!err)
				{
					process.stdout.write(data);
				}
				else
				{
					throw new Error(err);
				}
			});
		});
		
	},

	process: function(settings, callback)
	{
		var args = settings.toArguments();
		Compiler._compile(args, callback);
	},

	console: function()
	{
		Compiler._compile(process.argv.slice(2));
	}
};

module.exports = Compiler;
