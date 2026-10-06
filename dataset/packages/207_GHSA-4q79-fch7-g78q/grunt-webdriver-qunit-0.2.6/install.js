var fs = require('fs');
var http = require('http');
var url = require('url');
var kew = require('kew');
var npmconf = require('npmconf');
var util = require("util");
var path = require("path");

var downloadedDir = './bin/';
var downloadUrl = 'http://selenium.googlecode.com/files/selenium-server-standalone-2.39.0.jar';

(function() {
  var fileName = downloadUrl.split('/').pop();
  var downloadedFile = path.join(downloadedDir, fileName);
  
  var npmconfDeferred = kew.defer();
  npmconf.load(npmconfDeferred.makeNodeResolver());
  npmconfDeferred.promise.then(function(conf) {
    if (!fs.existsSync(downloadedDir)) {
      fs.mkdirSync(downloadedDir);
    }
    if (!fs.existsSync(downloadedFile)) {
      console.log('Downloading', downloadUrl);
      console.log('Saving to', downloadedFile);
      return requestBinary(getRequestOptions(conf.get('proxy')), downloadedFile);
    } else {
      console.log('Download already available at', downloadedFile);
      return downloadedFile;
    }
  }).then(function() {
    console.log('Done. Selenium binary available at', downloadedFile)
  }).fail(function(err) {
    console.error('Selenium installation failed', err, err.stack);
  });

  function getRequestOptions(proxyUrl) {
    if (proxyUrl) {
      var options = url.parse(proxyUrl);
      options.path = downloadUrl;
      options.headers = {
        Host : url.parse(downloadUrl).host
      };
      options.headers['User-Agent'] = 'curl/7.21.4 (universal-apple-darwin11.0) libcurl/7.21.4 OpenSSL/0.9.8r zlib/1.2.5';
      if (options.auth) {
        options.headers['Proxy-Authorization'] = 'Basic ' + new Buffer(options.auth).toString('base64');
        delete options.auth;
      }

      return options;
    } else {
      return url.parse(downloadUrl);
    }
  }

  function requestBinary(requestOptions, filePath) {
    var deferred = kew.defer();

    var count = 0;
    var notifiedCount = 0;
    var writePath = filePath + '-download-' + Date.now();
    var outFile = fs.openSync(writePath, 'w');

    var client = http.get(requestOptions, function(response) {
      var status = response.statusCode;
      console.log('Receiving...');

      if (status === 200) {
        response.addListener('data', function(data) {
          fs.writeSync(outFile, data, 0, data.length, null);
          count += data.length;
          if ((count - notifiedCount) > 800000) {
            console.log('Received ' + Math.floor(count / 1024) + 'K...');
            notifiedCount = count;
          }
        })

        response.addListener('end', function() {
          console.log('Received ' + Math.floor(count / 1024) + 'K total.');
          fs.closeSync(outFile);
          fs.renameSync(writePath, filePath);
          deferred.resolve(filePath);
        })

      } else {
        client.abort();
        fs.closeSync(outFile);
        fs.unlinkSync(writePath);
        console.error('Error requesting archive');
        deferred.reject(new Error('Error with http request: ' + util.inspect(response.headers)));
      }
    })

    return deferred.promise;
  }
})();