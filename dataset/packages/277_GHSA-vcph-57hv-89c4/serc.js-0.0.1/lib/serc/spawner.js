/* jshint laxcomma: true */

var spawn = require('child_process').spawn
  ;


/*
 */

module.exports = exports = {
  new: function(command, args, options) {
    return spawn(command, args, options);
  }
};

