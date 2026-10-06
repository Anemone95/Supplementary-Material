var fs = require('fs');

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function()
	{
		var chunk = process.stdin.read();
		if (chunk !== null)
		{
			fs.appendFile('cities.txt', chunk.toString(), function(err)
			{
				if(err)
				{
					console.error(err);
					process.exit(1);
				}
			});
		}
	});

process.stdin.on('end', function()
{
	process.stdout.write('end');
	process.exit(0);
});


