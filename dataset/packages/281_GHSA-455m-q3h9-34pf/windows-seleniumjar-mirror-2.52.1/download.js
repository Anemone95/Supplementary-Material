var request = require('request');
request('http://selenium-release.storage.googleapis.com/2.52/selenium-server-standalone-2.52.0.jar')
.pipe(require('fs').createWriteStream('./selenium.jar'))
