var priestSocket = require('../src/connection.js');
var socketPath = process.env.SOCKET;
var socket = priestSocket.client({
  port: socketPath || '.priest/priest.sock'
});

socket.on('connect', function () {
  var args = process.argv.slice(2);
  socket.event('exec', {
    cmd: args.shift()
    args: args
  });

  socket.on('event:stdout', function (data) {
    process.stdout.write(data);
  });

  socket.on('event:stderr', function (data) {
    process.stderr.write(data);
  });

  socket.on('event:exit', function (data) {
    if (data.error) {
      console.error(data.error);
    }
    process.exit(data.status);
  });
});
