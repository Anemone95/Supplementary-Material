#!/usr/bin/env node
/*
 * Serve Single-Page Application (sspa)
 *
 * Utility for serving single page application from file-system while in
 * development.
 */

var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    appPath = process.argv[2] || './index.html';

exports.main = function() {

  http.createServer(function(req, res) {
    if (req.url === '/') {
      fs.createReadStream(appPath).pipe(res);

    } else {
      var fsPath = path.join('.', req.url);
      fs.stat(fsPath, function(error, stat) {
        var stream;

        if (error === null) {
          if (stat.isFile()) {
            stream = fs.createReadStream(fsPath);
          } else if (stat.isDirectory()) {
            fsPath = path.join(fsPath, 'index.html');
            fs.exists(fsPath, function(exists) {
              if (exists) stream = fs.createReadStream(fsPath).pipe(res);
            });
          }
        }

        if (stream === undefined) stream = fs.createReadStream(appPath);

        stream.pipe(res);

      });
    }
  }).listen(8080);

};
