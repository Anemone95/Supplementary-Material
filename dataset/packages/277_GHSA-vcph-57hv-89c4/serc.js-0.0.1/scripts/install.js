#! /usr/bin/env node
/* jshint laxcomma: true */

var VERSION = '2.37.0';
var currentversionjar = 'http://selenium.googlecode.com/files/selenium-server-standalone-'+VERSION+'.jar';

var http = require('http')
  , fs   = require('fs')
  , path = require('path')
  ;

var installfilepath = path.normalize(__dirname+'/../bin/selenium-server.jar');

var host = {
  hostname: 'selenium.googlecode.com', 
  path:     '/files/selenium-server-standalone-'+VERSION+'.jar'
};


/*
 * selenium-server.jar
 */

var file = fs.createWriteStream(installfilepath);


/*
 */

file.on('finish', function() {
  file.close();
  console.log('Selenium jar installed @ '+installfilepath, '\nDone.');
});


/*
 * download selenium-server-standaloe-x.x.x.jar
 */

var req = http.request(host, function(res) {
  console.log(res.statusCode, 'Installing Selenium jar...');
  console.log(installfilepath);
  res.pipe(file);
});


/*
 */

req.on('error', function(err) {
  console.log('Problem installing Selenium jar @ '+currentversionjar);
  console.log(err);
});



req.end();

