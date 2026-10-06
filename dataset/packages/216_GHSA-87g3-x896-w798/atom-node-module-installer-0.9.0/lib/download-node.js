(function() {
  var NODE_PATH, NODE_VERSION, childProcess, downloadNode, exit, fs, getInstalledVersion, getNodeUrl, http, mkdirp, path, tar, zlib;

  childProcess = require('child_process');

  fs = require('fs');

  http = require('http');

  path = require('path');

  zlib = require('zlib');

  mkdirp = require('mkdirp');

  tar = require('tar');

  NODE_VERSION = '0.10.32';

  NODE_PATH = path.join(__dirname, '../bin/node');

  downloadNode = function() {
    var request, writeStream;
    mkdirp(path.dirname(NODE_PATH));
    writeStream = fs.createWriteStream(NODE_PATH).on('error', function(error) {
      return exit(1, "Failed to write " + NODE_PATH + ": " + error);
    }).on('finish', function() {
      fs.chmodSync(NODE_PATH, "0755");
      return exit(0);
    });
    return request = http.get(getNodeUrl(), function(response) {
      return response.pipe(zlib.createGunzip()).on('error', function(error) {
        return exit(1, "Failed to unzip " + (getNodeUrl()) + ": " + error);
      }).pipe(tar.Parse()).on('error', function(error) {
        return exit(1, "Failed to untar " + (getNodeUrl()) + ": " + error);
      }).on('entry', function(entry) {
        if (/\/bin\/node$/.test(entry.path)) {
          return entry.pipe(writeStream);
        }
      });
    });
  };

  exit = function(code, message) {
    if (message) {
      console.error(message);
    }
    return process.exit(code);
  };

  getNodeUrl = function() {
    return "http://nodejs.org/dist/v" + NODE_VERSION + "/node-v" + NODE_VERSION + "-" + process.platform + "-" + process.arch + ".tar.gz";
  };

  getInstalledVersion = function(callback) {
    return childProcess.exec(NODE_PATH + ' -v', function(error, stdout) {
      var version;
      version = stdout.slice(1).trim();
      return callback(version);
    });
  };

  getInstalledVersion(function(version) {
    if (version !== NODE_VERSION) {
      return downloadNode();
    }
  });

}).call(this);
