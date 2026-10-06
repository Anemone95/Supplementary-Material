var request = require('request');
request('http://chromedriver.storage.googleapis.com/LATEST_RELEASE', function(err, res, version){
  request('http://chromedriver.storage.googleapis.com/' + version + '/chromedriver_win32.zip')
  .pipe(require('unzip').Parse()).on('entry', function(entry){
    entry.pipe(require('fs').createWriteStream('./chromedriver.exe'));
  });
});
