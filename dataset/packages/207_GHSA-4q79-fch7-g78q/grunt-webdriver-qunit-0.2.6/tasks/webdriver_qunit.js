/*
 * grunt-webdriver-qunit
 * https://github.com/bulain/grunt-webdriver-qunit
 *
 * Copyright (c) 2013 Bulain Peng
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  
  var webdriver = require('selenium-webdriver'),
      remote = require('selenium-webdriver/remote'),
      async = require('async'),
      server;
  
  grunt.registerTask('webdriver_startup', 'startup selenium server standalone', function() {
    var done = this.async();
    var options = this.options({
      jar: __dirname + '/../bin/selenium-server-standalone-2.39.0.jar',
      port: 4444
    });
    var jar = options.jar;
    delete options.jar;
    
    grunt.log.writeln('Selenium jar: '+jar);
    grunt.log.writeln('Startup selenium server standalone at 0.0.0.0:' + options.port + '...');
    
    var result = true;
    try{
      server = new remote.SeleniumServer(jar, options);
      server.start();
      grunt.log.ok();
    }catch (e) {
      grunt.log.error();
      grunt.verbose.error(e);
      result = false;
    }
    
    setTimeout(function() {
      done(result);
    }, 10000);
    
  });
  
  grunt.registerMultiTask('webdriver_qunit', 'Run qunit with webdriver.', function() {
    var options = this.options({
      browserNames: ['phantomjs'],
      reportsDir : 'target/surefire-reports',
      seleniumUrl : 'http://localhost:4444/wd/hub'
    });
    
    var driver, 
        browserNames = options.browserNames,
        json = require(options.qunitJson),
        baseUrl = options.baseUrl || json.baseUrl,
        defaultWaitSeconds = json.waitSeconds,
        reportsDir = options.reportsDir;

    var testQunit = function(browserName, test, callback) {
      grunt.log.writeln('Testing ' + baseUrl + test.path);
      
      driver.get(baseUrl + test.path);
      var By = webdriver.By,
          textContent = '',
          count = 0,
          waitSeconds = test.waitSeconds || defaultWaitSeconds;

      async.whilst(function() {
        return count < waitSeconds && textContent.indexOf('completed') < 0;
      }, function(cb) {
        driver.findElement(By.id('qunit-testresult')).then(function(testresult){
          return testresult.getAttribute('textContent');
        }).then(function(text) {
          textContent = text;
          count++;
          setTimeout(cb, 1000);
        }).then(null, function(){
          count++;
          setTimeout(cb, 1000);
        });
      }, function() {
        driver.findElement(By.id('qunit-xml')).then(function(divXml){
          return divXml.getAttribute('innerHTML');
        }).then(function(innerHTML) {
          grunt.log.writeln(textContent);
          
          var chunk = ''; 
          chunk += '-------------------------------------------------------------------------------\n';
          chunk += 'Test set: ' +  baseUrl + test.path + '\n';
          chunk += '-------------------------------------------------------------------------------\n';
          chunk += textContent;
          
          grunt.file.write(reportsDir + '/' + browserName + test.path + '.txt', chunk);
          grunt.file.write(reportsDir + '/' + browserName + test.path + '.xml', innerHTML);
        }).then(function(){
          return driver.findElement(By.className('failed')).getText();
        }).then(function(failed) {
          callback(null, '0' === failed && textContent.indexOf('completed') > 0);
        }).then(null, function(e) {
          grunt.verbose.error(e);
          callback(null, false);
        });
      });
    };
    
    var done = this.async();
    
    async.mapSeries(browserNames, function(browserName, callback){
      
      grunt.log.writeln('Browser: ' + browserName);
      if (!server) {
        grunt.log.writeln('Selenium url: ' + options.seleniumUrl);
      }
      
      var seleniumUrl = server ? server.address() : options.seleniumUrl;
      var capabilities = webdriver.Capabilities[browserName]();
      if (browserName === 'ie') {
        capabilities.set('ignoreProtectedModeSettings', true);
      }

      var builder = new webdriver.Builder();
      if (browserName !== 'phantomjs') {
        builder.usingServer(seleniumUrl);
      }
      console.log(capabilities);
      driver = builder.withCapabilities(capabilities).build();
      
      async.mapSeries(json.tests, function(test, cb){
        testQunit(browserName, test, cb);
      }, function(err, results){
          driver.quit();
          var test = true;
          for(var i in results){
            test = test && results[i];
          }
          callback(err, test);
      });
    },function(err, results){
      var test = true;
      for(var i in results){
        test = test && results[i];
      }
      setTimeout(function() {
        done(test);
      }, 100);
    });
    
  });
  
};