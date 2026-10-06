/* jshint laxcomma: true */

var fs = require('fs')
  ;

if (!fs.existsSync(__dirname+'/bin/selenium-server.jar')) {
  console.log('\n', 'Please run npm run-script postinstall');
  process.exit();
}


var assert = require('assert')
  , soda   = require('soda')
  , serc   = require(__dirname+'/index')
  ;

var browser = soda.createClient({
  host: 'localhost',
  port: 4444,
  url: 'https://www.google.com',
  browser: 'chrome'
});


/*
 */

var selenium = serc(function() {
  browser
    .chain
    .session()
    .open('/')
    .getTitle(function(title) {
      assert.equal(title, 'Google');
    })
    .end(function(err) {
      browser.testComplete(function() {
        selenium.kill();
        if (err) console.log(err);
      });
    });
});

