'use strict';

require('./compatible');

var download = require('./download');
var install = require('./install');
var environment = require('./environment');

// Here lie the bodies of promises, killed in
// the name of better garbage collection
download(function () {
  install(function (variables) {
    environment(variables);
  });
});