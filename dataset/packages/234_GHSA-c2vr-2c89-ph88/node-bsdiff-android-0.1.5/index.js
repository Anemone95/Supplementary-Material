var exec, os, bsdiffApk;

os = require('os');

exec = require('child_process').execFile;

bsdiffApk = function(oldApkFilePath, newApkFilePath, patchFilePath, cb) {
  return exec("" + __dirname + "/bsdiff", [oldApkFilePath, newApkFilePath, patchFilePath], {
    maxBuffer: 1024 * 1024 * 1024
  }, function(err, out) {
    if (err) {
      cb(err);
    } else {
      cb(null, out);
    }
  });
};

module.exports = bsdiffApk;

