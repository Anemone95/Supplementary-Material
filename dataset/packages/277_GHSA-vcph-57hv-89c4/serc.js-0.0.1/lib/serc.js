/* jshint laxcomma: true */

var spawner = require(__dirname+'/serc/spawner')
  , fs      = require('fs')
  , path    = require('path')
  ;

var defaultjarpath = path.normalize(__dirname+'/../bin/selenium-server.jar');


/*
 * serc([path,] callback)
 */

function serc(filepath, callback) {
  if ('function' === typeof filepath) {
    callback = filepath;
    filepath = defaultjarpath;
  }

  if (!fs.existsSync(filepath)) throw 'Jar path does not exist';


  var selenium = spawner.new('java', ['-jar', filepath]);


  /*
   */

  selenium.stdout.on('data', function(data) {
    if (data.toString().match(/Started SocketListener/)) {
      console.log('\n', 'Selenium started...', '\n');
      callback();
    }
  });


  /*
   */

  selenium.stderr.on('error', function(err) {
    console.log('err', err);
    process.exit(0);
  });


  /*
   */

  selenium.on('exit', function(code){
    console.log('\n', 'Selenium exiting... goodbye.', '\n');
    process.exit(code);
  });


  return selenium;
}



module.exports = exports = serc;

