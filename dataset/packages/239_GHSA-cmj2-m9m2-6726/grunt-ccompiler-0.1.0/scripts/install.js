var fs = require('fs');
var path = require('path');
var http = require('http');
var ProgressBar = require('progress');
var DecompressZip = require('decompress-zip');

var packageDir = path.resolve(__dirname, '..');

var compilerVersion = '20150126';
var compilerZipFilePath = path.resolve(packageDir, 'compiler', 'compiler.zip');
var compilerZipFile = fs.createWriteStream(compilerZipFilePath);
var url = 'http://dl.google.com/closure-compiler/compiler-' + compilerVersion + '.zip';



var reqData = {
  hostname: 'http://dl.google.com',
  path: '/closure-compiler/compiler-' + compilerVersion + '.tar.gz',
  method: 'GET'
}

var request = http.get(url, function(res) {

  res.pipe(compilerZipFile);

  var len = parseInt(res.headers['content-length'], 10);

  var bar = new ProgressBar('  Downloading Closure Compiler [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: len
  });

  res.on('data', function (chunk) {
    bar.tick(chunk.length);
  });

  res.on('end', function () {

    console.log('');

    var unzipper = new DecompressZip(compilerZipFilePath);

    unzipper.on('error', function (err) {
        console.log('Caught an error', err);
    });

    unzipper.on('extract', function (log) {
      console.log('Finished extracting');
      console.log('');
      fs.unlinkSync(compilerZipFilePath);
    });

    unzipper.on('progress', function (fileIndex, fileCount) {
        console.log('Extracting file...');
    });

    unzipper.extract({
      path: path.resolve(packageDir, 'compiler'),
      filter: function (file) {
        return file.filename.indexOf('.jar') > 0;
      }
    });

  });

  res.on('error', function(e) {
    console.log('Download fail: ' + e.message);
  });


});
