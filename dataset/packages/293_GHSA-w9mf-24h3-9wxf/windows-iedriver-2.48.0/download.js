var request = require('request');
request('http://selenium-release.storage.googleapis.com/2.48/IEDriverServer_Win32_2.48.0.zip')
.pipe(require('unzip').Parse()).on('entry', function(entry){
  entry.pipe(require('fs').createWriteStream('./iedriver.exe'));
});
