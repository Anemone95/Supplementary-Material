var socket = require('socket.io-client');
var client = socket('http://localhost:7000/');

var timeout = parseInt(process.argv[2], 10) || 10;

client.on('connect', function () {
  console.log('connected');
  client.emit('exec', {
    args: ['timer.js', timeout]
  });
});

client.on('stdout', function (chunk) {
  process.stdout.write(chunk.toString());
});

client.on('stderr', function (chunk) {
  process.stderr.write(chunk.toString());
});

client.on('exit', function (result) {
  if (result.error) {
    console.error(result.error);
  }
  process.exit(result.status);
});

client.on('disconnect', function () {
  console.log('disconnected');
});

process.on('SIGINT', function () {
  setTimeout(function () {
    client.emit('kill', 0);
    process.exit(0);
  }, timeout * 1000);
});
