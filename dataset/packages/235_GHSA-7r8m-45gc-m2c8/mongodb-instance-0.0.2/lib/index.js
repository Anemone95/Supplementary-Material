'use strict';

var cp     = require('child_process'),
    path   = require('path'),
    util   = require('util'),
    events = require('events');


var executable = path.resolve(__dirname, '../bin/mongo/bin/mongod');
var availableOptions = ['dbpath', 'port', 'config'];






function readConfig(config) {
  var result = [];
  availableOptions.forEach(function (prop) {
    if (config[prop]) {
      result.push('--' + prop);
      result.push(config[prop]);
    }
  });
  return result;
}

function Db(config) {
  events.EventEmitter.call(this);
  var args = readConfig(config);
  console.log(args);
  this.process = cp.spawn(executable, args, {
    stdio: 'inherit'
  }).on('exit', function () {
    this.emit('exit', arguments);
  }.bind(this));
}
util.inherits(Db, events.EventEmitter);

Db.prototype.stop = function () {
  this.process.kill();
};







module.exports = {
  start: function start(config) {
    return new Db(config);
  }
};
