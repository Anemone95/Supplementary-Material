var net = require('net');
var fs = require('fs');
var util = require('util');

/**
 * Create server.
 *
 * @param  {{}} options Server options.
 * @return {net.Server} Returns configured priest server.
 */
exports.server = function (options) {
  var server = net.createServer();

  server.listen(options.port);

  return server;
};

/**
 * Create JSON-transport socket client.
 *
 * @param  {{}} options Options object.
 * @return {{}}         Socket instance.
 */
exports.client = function (options) {
  return wrapSocket(
    net.connect(options.port)
  );
};

exports.wrap = wrapSocket;

function wrapSocket(socket) {
  var buf = '';

  function getMessages() {
    var chunk, message, i;
    while((i = buf.indexOf('\n')) > -1) {
      chunk = buf.slice(0, i);
      buf = buf.slice(i + 1);

      try {
        message = JSON.parse(chunk);
      } catch (err) {
        socket.emit('error', err);
        continue;
      }

      socket.emit('message', message);
      if (util.isObject(message)) {
        if (message.hasOwnProperty('event')) {
          socket.emit('event:' + message.event, message.data);
        }
      }
    }
  }

  socket.on('data', function (chunk) {
    buf += chunk.toString();
    getMessages();
  });

  /**
   * Send data with socket.
   *
   * @param  {*} message Serializable data to send.
   */
  socket.send = function (message) {
    if (this._ended) return;
    this.write(JSON.stringify(message) + '\n');
  };

  /**
   * Send event with socket.
   *
   * @param  {String} event Event name.
   * @param  {Object} data  Event data.
   */
  socket.event = function (event, data) {
    this.send({
      event: event,
      data: data
    });
  };

  return socket;
}
