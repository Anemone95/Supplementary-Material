var request = require('request');
request('http://selenium-release.storage.googleapis.com/2.48/selenium-server-standalone-2.48.2.jar')
.pipe(require('fs').createWriteStream('./selenium.jar'))
