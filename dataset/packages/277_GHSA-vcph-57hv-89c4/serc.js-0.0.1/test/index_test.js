/* jshint laxcomma: true */

process.env.NODE_ENV = 'test';


var horaa  = require('horaa')
  , sinon  = require('sinon')
  , assert = require('assert')
  , Events = require('events')
  , path   = require('path')
  ;

var serc = require('../index');


describe('serc', function() {
  var fs      = require('fs')
    , evtemit = new Events.EventEmitter()
    , spawner = require('../lib/serc/spawner')
    , spawn
    ;

  var seleniumstub = {
    stdout: evtemit,
    stderr: {
      on: function(err) {
        return;
      }
    },
    on: function(code) {
      return;
    }
  };

  var jarpath = 'path/to/a/jar';


  function fileexists(bool, callback) {
    var existsSync = sinon.stub(fs, 'existsSync', function(filepath) {
      return bool;
    });
    callback();
    fs.existsSync.restore();
  }


  beforeEach(function() {
    if (spawn && ('function' === typeof spawn.restore)) {
      spawn.restore();
    }

    spawn = sinon.stub(spawner, 'new', function() {
      return seleniumstub;
    });
  });

  afterEach(function() {
    spawner.new.restore();
  });


  it('looks for the default jar installed with the npm package', sinon.test(function() {
    fileexists(true, function() {
      serc(function() {});

      assert(spawn.called);
      assert.deepEqual(spawn.getCall(0).args, 
        ['java', ['-jar', path.normalize(__dirname+'/../bin/selenium-server.jar')]]);
    });
  }));


  it('calls back when the selenium server has started', sinon.test(function() {
    var callback = sinon.stub();

    fileexists(true, function() {
      var c = sinon.stub(console, 'log', function(args) {
        return;
      });

      var selenium = serc(callback);
      selenium.stdout.emit('data', "Started SocketListener");
      assert(callback.called);
      c.restore();
    });
  }));


  it('can accept a custom jar path', sinon.test(function() {
    fileexists(true, function() {
      serc(jarpath, function() {});

      assert(spawn.called);
      assert.deepEqual(spawn.getCall(0).args, ['java', ['-jar', jarpath]]);
    });
  }));


  it('throws an error if the jar cannot be found', sinon.test(function() {
    fileexists(false, function() {
      assert.throws(function() {
        serc('jar/does/not/exist', function() {});
      }, 'Jar path does not exist');
    });
  }));
});

