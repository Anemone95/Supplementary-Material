require('source-map-support').install();

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _appiumBaseDriver = require('appium-base-driver');

var _appiumLogger = require('appium-logger');

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _appiumSupport = require('appium-support');

var _asyncbox = require('asyncbox');

var _teen_process = require('teen_process');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _install = require('./install');

var log = (0, _appiumLogger.getLogger)('Chromedriver');

var DEFAULT_HOST = '127.0.0.1';
var DEFAULT_PORT = 9515;

var Chromedriver = (function (_events$EventEmitter) {
  _inherits(Chromedriver, _events$EventEmitter);

  function Chromedriver() {
    var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Chromedriver);

    var host = args.host;
    var port = args.port;
    var executable = args.executable;
    var cmdArgs = args.cmdArgs;
    var adbPort = args.adbPort;
    var verbose = args.verbose;
    var logPath = args.logPath;

    _get(Object.getPrototypeOf(Chromedriver.prototype), 'constructor', this).call(this);
    this.proxyHost = host || DEFAULT_HOST;
    this.proxyPort = port || DEFAULT_PORT;
    this.adbPort = adbPort;
    this.cmdArgs = cmdArgs;
    this.proc = null;
    this.chromedriver = executable;
    this.executableVerified = false;
    this.state = Chromedriver.STATE_STOPPED;
    this.jwproxy = new _appiumBaseDriver.JWProxy({ server: this.proxyHost, port: this.proxyPort });
    this.verbose = verbose;
    this.logPath = logPath;
  }

  _createClass(Chromedriver, [{
    key: 'initChromedriverPath',
    value: function initChromedriverPath() {
      var binPath;
      return _regeneratorRuntime.async(function initChromedriverPath$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!this.executableVerified) {
              context$2$0.next = 2;
              break;
            }

            return context$2$0.abrupt('return');

          case 2:
            context$2$0.t0 = this.chromedriver;

            if (context$2$0.t0) {
              context$2$0.next = 7;
              break;
            }

            context$2$0.next = 6;
            return _regeneratorRuntime.awrap((0, _install.getChromedriverBinaryPath)());

          case 6:
            context$2$0.t0 = context$2$0.sent;

          case 7:
            binPath = context$2$0.t0;
            context$2$0.next = 10;
            return _regeneratorRuntime.awrap(_appiumSupport.fs.exists(binPath));

          case 10:
            if (context$2$0.sent) {
              context$2$0.next = 12;
              break;
            }

            throw new Error('Trying to use a chromedriver binary at the path ' + (binPath + ', but it doesn\'t exist!'));

          case 12:
            this.chromedriver = binPath;
            this.executableVerified = true;
            log.info('Set chromedriver binary as: ' + this.chromedriver);

          case 15:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'start',
    value: function start(caps) {
      var emitStartingState = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
      var args, startDetector, processIsAlive;
      return _regeneratorRuntime.async(function start$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this.capabilities = caps;
            if (emitStartingState) {
              this.changeState(Chromedriver.STATE_STARTING);
            }

            args = ["--url-base=wd/hub", '--port=' + this.proxyPort];

            if (this.adbPort) {
              args = args.concat(['--adb-port=' + this.adbPort]);
            }
            if (this.cmdArgs) {
              args = args.concat(this.cmdArgs);
            }
            if (this.verbose) {
              args = args.concat(['--verbose']);
            }
            if (this.logPath) {
              args = args.concat(['--log-path=' + this.logPath]);
            }

            // what are the process stdout/stderr conditions wherein we know that
            // the process has started to our satisfaction?

            startDetector = function startDetector(stdout) {
              return stdout.indexOf('Starting ') === 0;
            };

            processIsAlive = false;
            context$2$0.prev = 9;
            context$2$0.next = 12;
            return _regeneratorRuntime.awrap(this.initChromedriverPath());

          case 12:
            context$2$0.next = 14;
            return _regeneratorRuntime.awrap(this.killAll());

          case 14:

            // set up our subprocess object
            this.proc = new _teen_process.SubProcess(this.chromedriver, args);
            processIsAlive = true;

            // handle log output
            this.proc.on('output', function (stdout, stderr) {
              if (stdout) {
                log.info('[STDOUT] ' + stdout.trim());
              }
              if (stderr) {
                log.info('[STDERR] ' + stderr.trim());
              }
            });

            // handle out-of-bound exit by simply emitting a stopped state
            this.proc.on('exit', function (code, signal) {
              processIsAlive = false;
              if (_this.state !== Chromedriver.STATE_STOPPED && _this.state !== Chromedriver.STATE_STOPPING && _this.state !== Chromedriver.STATE_RESTARTING) {
                var msg = 'Chromedriver exited unexpectedly with code ' + code + ', ' + ('signal ' + signal);
                log.error(msg);
                _this.changeState(Chromedriver.STATE_STOPPED);
              }
            });
            log.info('Spawning chromedriver with: ' + this.chromedriver + ' ' + ('' + args.join(' ')));
            // start subproc and wait for startDetector
            context$2$0.next = 21;
            return _regeneratorRuntime.awrap(this.proc.start(startDetector));

          case 21:
            context$2$0.next = 23;
            return _regeneratorRuntime.awrap(this.waitForOnline());

          case 23:
            context$2$0.next = 25;
            return _regeneratorRuntime.awrap(this.startSession());

          case 25:
            context$2$0.next = 34;
            break;

          case 27:
            context$2$0.prev = 27;
            context$2$0.t0 = context$2$0['catch'](9);

            this.emit(Chromedriver.EVENT_ERROR, context$2$0.t0);
            // just because we had an error doesn't mean the chromedriver process
            // finished; we should clean up if necessary

            if (!processIsAlive) {
              context$2$0.next = 33;
              break;
            }

            context$2$0.next = 33;
            return _regeneratorRuntime.awrap(this.proc.stop());

          case 33:
            log.errorAndThrow(context$2$0.t0);

          case 34:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[9, 27]]);
    }
  }, {
    key: 'sessionId',
    value: function sessionId() {
      if (this.state !== Chromedriver.STATE_ONLINE) {
        return null;
      }

      return this.jwproxy.sessionId;
    }
  }, {
    key: 'restart',
    value: function restart() {
      return _regeneratorRuntime.async(function restart$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            log.info("Restarting chromedriver");

            if (!(this.state !== Chromedriver.STATE_ONLINE)) {
              context$2$0.next = 3;
              break;
            }

            throw new Error("Can't restart when we're not online");

          case 3:
            this.changeState(Chromedriver.STATE_RESTARTING);
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.stop(false));

          case 6:
            context$2$0.next = 8;
            return _regeneratorRuntime.awrap(this.start(this.capabilities, false));

          case 8:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: '_statePromise',
    value: function _statePromise() {
      var _this2 = this;

      var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      return new _bluebird2['default'](function (resolve) {
        var listener = function listener(msg) {
          if (state === null || msg.state === state) {
            resolve(msg.state);
            _this2.removeListener(Chromedriver.EVENT_CHANGED, listener);
          }
        };
        _this2.on(Chromedriver.EVENT_CHANGED, listener);
      });
    }
  }, {
    key: 'waitForOnline',
    value: function waitForOnline() {
      var chromedriverStopped;
      return _regeneratorRuntime.async(function waitForOnline$(context$2$0) {
        var _this3 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            chromedriverStopped = false;
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(20, 200, function callee$2$0() {
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    if (!(this.state === Chromedriver.STATE_STOPPED)) {
                      context$3$0.next = 3;
                      break;
                    }

                    // we are either stopped or stopping, so something went wrong
                    chromedriverStopped = true;
                    return context$3$0.abrupt('return');

                  case 3:
                    context$3$0.next = 5;
                    return _regeneratorRuntime.awrap(this.getStatus());

                  case 5:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this3);
            }));

          case 3:
            if (!chromedriverStopped) {
              context$2$0.next = 5;
              break;
            }

            throw new Error('ChromeDriver crashed during startup.');

          case 5:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      return _regeneratorRuntime.async(function getStatus$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.jwproxy.command('/status', 'GET'));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'startSession',
    value: function startSession() {
      return _regeneratorRuntime.async(function startSession$(context$2$0) {
        var _this4 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap((0, _asyncbox.retryInterval)(4, 200, function callee$2$0() {
              var res;
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    context$3$0.next = 2;
                    return _regeneratorRuntime.awrap(this.jwproxy.command('/session', 'POST', { desiredCapabilities: this.capabilities }));

                  case 2:
                    res = context$3$0.sent;

                    if (!res.status) {
                      context$3$0.next = 5;
                      break;
                    }

                    throw new Error(res.value.message);

                  case 5:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this4);
            }));

          case 2:
            this.changeState(Chromedriver.STATE_ONLINE);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var emitStates = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
      return _regeneratorRuntime.async(function stop$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (emitStates) {
              this.changeState(Chromedriver.STATE_STOPPING);
            }
            context$2$0.prev = 1;
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this.jwproxy.command('', 'DELETE'));

          case 4:
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.proc.stop('SIGTERM', 20000));

          case 6:
            if (emitStates) {
              this.changeState(Chromedriver.STATE_STOPPED);
            }
            context$2$0.next = 12;
            break;

          case 9:
            context$2$0.prev = 9;
            context$2$0.t0 = context$2$0['catch'](1);

            log.error(context$2$0.t0);

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[1, 9]]);
    }
  }, {
    key: 'changeState',
    value: function changeState(state) {
      this.state = state;
      log.debug('Changed state to \'' + state + '\'');
      this.emit(Chromedriver.EVENT_CHANGED, { state: state });
    }
  }, {
    key: 'sendCommand',
    value: function sendCommand(url, method, body) {
      return _regeneratorRuntime.async(function sendCommand$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.jwproxy.command(url, method, body));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'proxyReq',
    value: function proxyReq(req, res) {
      return _regeneratorRuntime.async(function proxyReq$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.jwproxy.proxyReqRes(req, res));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'killAll',
    value: function killAll() {
      var cmd;
      return _regeneratorRuntime.async(function killAll$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            cmd = undefined;

            if (_appiumSupport.system.isWindows()) {
              // js hint cannot handle backticks, even escaped, within template literals
              cmd = "FOR /F \"usebackq tokens=5\" %a in (`netstat -nao ^| " + "findstr /R /C:\"" + this.proxyPort + " \"`) do (" + "FOR /F \"usebackq\" %b in (`TASKLIST /FI \"PID eq %a\" ^| " + "findstr /I chromedriver.exe`) do (IF NOT %b==\"\" TASKKILL " + "/F /PID %a))";
            } else {
              cmd = 'pkill -15 -f "' + this.chromedriver + '.*--port=' + this.proxyPort + '"';
            }
            log.info('Killing any old chromedrivers, running: ' + cmd);
            context$2$0.prev = 3;
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(_bluebird2['default'].promisify(_child_process2['default'].exec)(cmd));

          case 6:
            log.info("Successfully cleaned up old chromedrivers");
            context$2$0.next = 12;
            break;

          case 9:
            context$2$0.prev = 9;
            context$2$0.t0 = context$2$0['catch'](3);

            log.info("No old chromedrivers seemed to exist");

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[3, 9]]);
    }
  }, {
    key: 'hasWorkingWebview',
    value: function hasWorkingWebview() {
      return _regeneratorRuntime.async(function hasWorkingWebview$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.prev = 0;
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(this.jwproxy.command('/url', 'GET'));

          case 3:
            return context$2$0.abrupt('return', true);

          case 6:
            context$2$0.prev = 6;
            context$2$0.t0 = context$2$0['catch'](0);
            return context$2$0.abrupt('return', false);

          case 9:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[0, 6]]);
    }
  }]);

  return Chromedriver;
})(_events2['default'].EventEmitter);

Chromedriver.EVENT_ERROR = 'chromedriver_error';
Chromedriver.EVENT_CHANGED = 'stateChanged';
Chromedriver.STATE_STOPPED = 'stopped';
Chromedriver.STATE_STARTING = 'starting';
Chromedriver.STATE_ONLINE = 'online';
Chromedriver.STATE_STOPPING = 'stopping';
Chromedriver.STATE_RESTARTING = 'restarting';

exports['default'] = Chromedriver;
module.exports = exports['default'];

// we need to make sure that CD hasn't crashed

// retry session start 4 times, sometimes this fails due to adb

// ChromeDriver can return a positive status despite failing

// sometimes chromedriver stops automating webviews. this method runs a
// simple command to determine our state, and responds accordingly
//# sourceMappingURL=data:application/json;base64,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S0FBSzs7Ozs7OztLQUVmOzs7U0FoT0csWUFBWTtHQUFTLG9CQUFPLFlBQVk7O0FBbU85QyxZQUFZLENBQUMsV0FBVyxHQUFHLG9CQUFvQixDQUFDO0FBQ2hELFlBQVksQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDO0FBQzVDLFlBQVksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBQ3ZDLFlBQVksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDO0FBQ3pDLFlBQVksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO0FBQ3JDLFlBQVksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDO0FBQ3pDLFlBQVksQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7O3FCQUU5QixZQUFZIiwiZmlsZSI6ImxpYi9jaHJvbWVkcml2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB0cmFuc3BpbGU6bWFpblxuXG5pbXBvcnQgZXZlbnRzIGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBKV1Byb3h5IH0gZnJvbSAnYXBwaXVtLWJhc2UtZHJpdmVyJztcbmltcG9ydCB7IGdldExvZ2dlciB9IGZyb20gJ2FwcGl1bS1sb2dnZXInO1xuaW1wb3J0IGNwIGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgc3lzdGVtLCBmcyB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcbmltcG9ydCB7IHJldHJ5SW50ZXJ2YWwgfSBmcm9tICdhc3luY2JveCc7XG5pbXBvcnQgeyBTdWJQcm9jZXNzIH0gZnJvbSAndGVlbl9wcm9jZXNzJztcbmltcG9ydCBCIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IGdldENocm9tZWRyaXZlckJpbmFyeVBhdGggfSBmcm9tICcuL2luc3RhbGwnO1xuXG5cbmNvbnN0IGxvZyA9IGdldExvZ2dlcignQ2hyb21lZHJpdmVyJyk7XG5cbmNvbnN0IERFRkFVTFRfSE9TVCA9ICcxMjcuMC4wLjEnO1xuY29uc3QgREVGQVVMVF9QT1JUID0gOTUxNTtcbmNsYXNzIENocm9tZWRyaXZlciBleHRlbmRzIGV2ZW50cy5FdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvciAoYXJncyA9IHt9KSB7XG4gICAgY29uc3Qge2hvc3QsIHBvcnQsIGV4ZWN1dGFibGUsIGNtZEFyZ3MsIGFkYlBvcnQsIHZlcmJvc2UsIGxvZ1BhdGh9ID0gYXJncztcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucHJveHlIb3N0ID0gaG9zdCB8fCBERUZBVUxUX0hPU1Q7XG4gICAgdGhpcy5wcm94eVBvcnQgPSBwb3J0IHx8IERFRkFVTFRfUE9SVDtcbiAgICB0aGlzLmFkYlBvcnQgPSBhZGJQb3J0O1xuICAgIHRoaXMuY21kQXJncyA9IGNtZEFyZ3M7XG4gICAgdGhpcy5wcm9jID0gbnVsbDtcbiAgICB0aGlzLmNocm9tZWRyaXZlciA9IGV4ZWN1dGFibGU7XG4gICAgdGhpcy5leGVjdXRhYmxlVmVyaWZpZWQgPSBmYWxzZTtcbiAgICB0aGlzLnN0YXRlID0gQ2hyb21lZHJpdmVyLlNUQVRFX1NUT1BQRUQ7XG4gICAgdGhpcy5qd3Byb3h5ID0gbmV3IEpXUHJveHkoe3NlcnZlcjogdGhpcy5wcm94eUhvc3QsIHBvcnQ6IHRoaXMucHJveHlQb3J0fSk7XG4gICAgdGhpcy52ZXJib3NlID0gdmVyYm9zZTtcbiAgICB0aGlzLmxvZ1BhdGggPSBsb2dQYXRoO1xuICB9XG5cbiAgYXN5bmMgaW5pdENocm9tZWRyaXZlclBhdGggKCkge1xuICAgIGlmICh0aGlzLmV4ZWN1dGFibGVWZXJpZmllZCkgcmV0dXJuO1xuICAgIGxldCBiaW5QYXRoID0gdGhpcy5jaHJvbWVkcml2ZXIgfHwgKGF3YWl0IGdldENocm9tZWRyaXZlckJpbmFyeVBhdGgoKSk7XG4gICAgaWYgKCFhd2FpdCBmcy5leGlzdHMoYmluUGF0aCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVHJ5aW5nIHRvIHVzZSBhIGNocm9tZWRyaXZlciBiaW5hcnkgYXQgdGhlIHBhdGggYCArXG4gICAgICAgICAgICAgICAgICAgICAgYCR7YmluUGF0aH0sIGJ1dCBpdCBkb2Vzbid0IGV4aXN0IWApO1xuICAgIH1cbiAgICB0aGlzLmNocm9tZWRyaXZlciA9IGJpblBhdGg7XG4gICAgdGhpcy5leGVjdXRhYmxlVmVyaWZpZWQgPSB0cnVlO1xuICAgIGxvZy5pbmZvKGBTZXQgY2hyb21lZHJpdmVyIGJpbmFyeSBhczogJHt0aGlzLmNocm9tZWRyaXZlcn1gKTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0IChjYXBzLCBlbWl0U3RhcnRpbmdTdGF0ZSA9IHRydWUpIHtcbiAgICB0aGlzLmNhcGFiaWxpdGllcyA9IGNhcHM7XG4gICAgaWYgKGVtaXRTdGFydGluZ1N0YXRlKSB7XG4gICAgICB0aGlzLmNoYW5nZVN0YXRlKENocm9tZWRyaXZlci5TVEFURV9TVEFSVElORyk7XG4gICAgfVxuXG4gICAgbGV0IGFyZ3MgPSBbXCItLXVybC1iYXNlPXdkL2h1YlwiLCBgLS1wb3J0PSR7dGhpcy5wcm94eVBvcnR9YF07XG4gICAgaWYgKHRoaXMuYWRiUG9ydCkge1xuICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KFtgLS1hZGItcG9ydD0ke3RoaXMuYWRiUG9ydH1gXSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNtZEFyZ3MpIHtcbiAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdCh0aGlzLmNtZEFyZ3MpO1xuICAgIH1cbiAgICBpZiAodGhpcy52ZXJib3NlKSB7XG4gICAgICBhcmdzID0gYXJncy5jb25jYXQoWyctLXZlcmJvc2UnXSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmxvZ1BhdGgpIHtcbiAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChbYC0tbG9nLXBhdGg9JHt0aGlzLmxvZ1BhdGh9YF0pO1xuICAgIH1cblxuICAgIC8vIHdoYXQgYXJlIHRoZSBwcm9jZXNzIHN0ZG91dC9zdGRlcnIgY29uZGl0aW9ucyB3aGVyZWluIHdlIGtub3cgdGhhdFxuICAgIC8vIHRoZSBwcm9jZXNzIGhhcyBzdGFydGVkIHRvIG91ciBzYXRpc2ZhY3Rpb24/XG4gICAgY29uc3Qgc3RhcnREZXRlY3RvciA9IChzdGRvdXQpID0+IHtcbiAgICAgIHJldHVybiBzdGRvdXQuaW5kZXhPZignU3RhcnRpbmcgJykgPT09IDA7XG4gICAgfTtcblxuICAgIGxldCBwcm9jZXNzSXNBbGl2ZSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmluaXRDaHJvbWVkcml2ZXJQYXRoKCk7XG4gICAgICBhd2FpdCB0aGlzLmtpbGxBbGwoKTtcblxuICAgICAgLy8gc2V0IHVwIG91ciBzdWJwcm9jZXNzIG9iamVjdFxuICAgICAgdGhpcy5wcm9jID0gbmV3IFN1YlByb2Nlc3ModGhpcy5jaHJvbWVkcml2ZXIsIGFyZ3MpO1xuICAgICAgcHJvY2Vzc0lzQWxpdmUgPSB0cnVlO1xuXG4gICAgICAvLyBoYW5kbGUgbG9nIG91dHB1dFxuICAgICAgdGhpcy5wcm9jLm9uKCdvdXRwdXQnLCAoc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgaWYgKHN0ZG91dCkge1xuICAgICAgICAgIGxvZy5pbmZvKGBbU1RET1VUXSAke3N0ZG91dC50cmltKCl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0ZGVycikge1xuICAgICAgICAgIGxvZy5pbmZvKGBbU1RERVJSXSAke3N0ZGVyci50cmltKCl9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBoYW5kbGUgb3V0LW9mLWJvdW5kIGV4aXQgYnkgc2ltcGx5IGVtaXR0aW5nIGEgc3RvcHBlZCBzdGF0ZVxuICAgICAgdGhpcy5wcm9jLm9uKCdleGl0JywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICBwcm9jZXNzSXNBbGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSAhPT0gQ2hyb21lZHJpdmVyLlNUQVRFX1NUT1BQRUQgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgIT09IENocm9tZWRyaXZlci5TVEFURV9TVE9QUElORyAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZSAhPT0gQ2hyb21lZHJpdmVyLlNUQVRFX1JFU1RBUlRJTkcpIHtcbiAgICAgICAgICBsZXQgbXNnID0gYENocm9tZWRyaXZlciBleGl0ZWQgdW5leHBlY3RlZGx5IHdpdGggY29kZSAke2NvZGV9LCBgICtcbiAgICAgICAgICAgICAgICAgICAgYHNpZ25hbCAke3NpZ25hbH1gO1xuICAgICAgICAgIGxvZy5lcnJvcihtc2cpO1xuICAgICAgICAgIHRoaXMuY2hhbmdlU3RhdGUoQ2hyb21lZHJpdmVyLlNUQVRFX1NUT1BQRUQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGxvZy5pbmZvKGBTcGF3bmluZyBjaHJvbWVkcml2ZXIgd2l0aDogJHt0aGlzLmNocm9tZWRyaXZlcn0gYCArXG4gICAgICAgICAgICAgICBgJHthcmdzLmpvaW4oJyAnKX1gKTtcbiAgICAgIC8vIHN0YXJ0IHN1YnByb2MgYW5kIHdhaXQgZm9yIHN0YXJ0RGV0ZWN0b3JcbiAgICAgIGF3YWl0IHRoaXMucHJvYy5zdGFydChzdGFydERldGVjdG9yKTtcbiAgICAgIGF3YWl0IHRoaXMud2FpdEZvck9ubGluZSgpO1xuICAgICAgYXdhaXQgdGhpcy5zdGFydFNlc3Npb24oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLmVtaXQoQ2hyb21lZHJpdmVyLkVWRU5UX0VSUk9SLCBlKTtcbiAgICAgIC8vIGp1c3QgYmVjYXVzZSB3ZSBoYWQgYW4gZXJyb3IgZG9lc24ndCBtZWFuIHRoZSBjaHJvbWVkcml2ZXIgcHJvY2Vzc1xuICAgICAgLy8gZmluaXNoZWQ7IHdlIHNob3VsZCBjbGVhbiB1cCBpZiBuZWNlc3NhcnlcbiAgICAgIGlmIChwcm9jZXNzSXNBbGl2ZSkge1xuICAgICAgICBhd2FpdCB0aGlzLnByb2Muc3RvcCgpO1xuICAgICAgfVxuICAgICAgbG9nLmVycm9yQW5kVGhyb3coZSk7XG4gICAgfVxuICB9XG5cbiAgc2Vzc2lvbklkICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZSAhPT0gQ2hyb21lZHJpdmVyLlNUQVRFX09OTElORSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuandwcm94eS5zZXNzaW9uSWQ7XG4gIH1cblxuICBhc3luYyByZXN0YXJ0ICgpIHtcbiAgICBsb2cuaW5mbyhcIlJlc3RhcnRpbmcgY2hyb21lZHJpdmVyXCIpO1xuICAgIGlmICh0aGlzLnN0YXRlICE9PSBDaHJvbWVkcml2ZXIuU1RBVEVfT05MSU5FKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCByZXN0YXJ0IHdoZW4gd2UncmUgbm90IG9ubGluZVwiKTtcbiAgICB9XG4gICAgdGhpcy5jaGFuZ2VTdGF0ZShDaHJvbWVkcml2ZXIuU1RBVEVfUkVTVEFSVElORyk7XG4gICAgYXdhaXQgdGhpcy5zdG9wKGZhbHNlKTtcbiAgICBhd2FpdCB0aGlzLnN0YXJ0KHRoaXMuY2FwYWJpbGl0aWVzLCBmYWxzZSk7XG4gIH1cblxuICBfc3RhdGVQcm9taXNlIChzdGF0ZSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IEIoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gKG1zZykgPT4ge1xuICAgICAgICBpZiAoc3RhdGUgPT09IG51bGwgfHwgbXNnLnN0YXRlID09PSBzdGF0ZSkge1xuICAgICAgICAgIHJlc29sdmUobXNnLnN0YXRlKTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKENocm9tZWRyaXZlci5FVkVOVF9DSEFOR0VELCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0aGlzLm9uKENocm9tZWRyaXZlci5FVkVOVF9DSEFOR0VELCBsaXN0ZW5lcik7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyB3YWl0Rm9yT25saW5lICgpIHtcbiAgICAvLyB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IENEIGhhc24ndCBjcmFzaGVkXG4gICAgbGV0IGNocm9tZWRyaXZlclN0b3BwZWQgPSBmYWxzZTtcbiAgICBhd2FpdCByZXRyeUludGVydmFsKDIwLCAyMDAsIGFzeW5jICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnN0YXRlID09PSBDaHJvbWVkcml2ZXIuU1RBVEVfU1RPUFBFRCkge1xuICAgICAgICAvLyB3ZSBhcmUgZWl0aGVyIHN0b3BwZWQgb3Igc3RvcHBpbmcsIHNvIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICAgIGNocm9tZWRyaXZlclN0b3BwZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLmdldFN0YXR1cygpO1xuICAgIH0pO1xuICAgIGlmIChjaHJvbWVkcml2ZXJTdG9wcGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nocm9tZURyaXZlciBjcmFzaGVkIGR1cmluZyBzdGFydHVwLicpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldFN0YXR1cyAoKSB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuandwcm94eS5jb21tYW5kKCcvc3RhdHVzJywgJ0dFVCcpO1xuICB9XG5cbiAgYXN5bmMgc3RhcnRTZXNzaW9uICgpIHtcbiAgICAvLyByZXRyeSBzZXNzaW9uIHN0YXJ0IDQgdGltZXMsIHNvbWV0aW1lcyB0aGlzIGZhaWxzIGR1ZSB0byBhZGJcbiAgICBhd2FpdCByZXRyeUludGVydmFsKDQsIDIwMCwgYXN5bmMgKCkgPT4ge1xuICAgICAgbGV0IHJlcyA9IGF3YWl0IHRoaXMuandwcm94eS5jb21tYW5kKCcvc2Vzc2lvbicsICdQT1NUJywge2Rlc2lyZWRDYXBhYmlsaXRpZXM6IHRoaXMuY2FwYWJpbGl0aWVzfSk7XG4gICAgICAvLyBDaHJvbWVEcml2ZXIgY2FuIHJldHVybiBhIHBvc2l0aXZlIHN0YXR1cyBkZXNwaXRlIGZhaWxpbmdcbiAgICAgIGlmIChyZXMuc3RhdHVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXMudmFsdWUubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5jaGFuZ2VTdGF0ZShDaHJvbWVkcml2ZXIuU1RBVEVfT05MSU5FKTtcbiAgfVxuXG4gIGFzeW5jIHN0b3AgKGVtaXRTdGF0ZXMgPSB0cnVlKSB7XG4gICAgaWYgKGVtaXRTdGF0ZXMpIHtcbiAgICAgIHRoaXMuY2hhbmdlU3RhdGUoQ2hyb21lZHJpdmVyLlNUQVRFX1NUT1BQSU5HKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuandwcm94eS5jb21tYW5kKCcnLCAnREVMRVRFJyk7XG4gICAgICBhd2FpdCB0aGlzLnByb2Muc3RvcCgnU0lHVEVSTScsIDIwMDAwKTtcbiAgICAgIGlmIChlbWl0U3RhdGVzKSB7XG4gICAgICAgIHRoaXMuY2hhbmdlU3RhdGUoQ2hyb21lZHJpdmVyLlNUQVRFX1NUT1BQRUQpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZy5lcnJvcihlKTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VTdGF0ZSAoc3RhdGUpIHtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgbG9nLmRlYnVnKGBDaGFuZ2VkIHN0YXRlIHRvICcke3N0YXRlfSdgKTtcbiAgICB0aGlzLmVtaXQoQ2hyb21lZHJpdmVyLkVWRU5UX0NIQU5HRUQsIHtzdGF0ZX0pO1xuICB9XG5cbiAgYXN5bmMgc2VuZENvbW1hbmQgKHVybCwgbWV0aG9kLCBib2R5KSB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuandwcm94eS5jb21tYW5kKHVybCwgbWV0aG9kLCBib2R5KTtcbiAgfVxuXG4gIGFzeW5jIHByb3h5UmVxIChyZXEsIHJlcykge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmp3cHJveHkucHJveHlSZXFSZXMocmVxLCByZXMpO1xuICB9XG5cbiAgYXN5bmMga2lsbEFsbCAoKSB7XG4gICAgbGV0IGNtZDtcbiAgICBpZiAoc3lzdGVtLmlzV2luZG93cygpKSB7XG4gICAgICAvLyBqcyBoaW50IGNhbm5vdCBoYW5kbGUgYmFja3RpY2tzLCBldmVuIGVzY2FwZWQsIHdpdGhpbiB0ZW1wbGF0ZSBsaXRlcmFsc1xuICAgICAgY21kID0gXCJGT1IgL0YgXFxcInVzZWJhY2txIHRva2Vucz01XFxcIiAlYSBpbiAoYG5ldHN0YXQgLW5hbyBefCBcIiArXG4gICAgICAgICAgICBcImZpbmRzdHIgL1IgL0M6XFxcIlwiICsgdGhpcy5wcm94eVBvcnQgKyBcIiBcXFwiYCkgZG8gKFwiICtcbiAgICAgICAgICAgIFwiRk9SIC9GIFxcXCJ1c2ViYWNrcVxcXCIgJWIgaW4gKGBUQVNLTElTVCAvRkkgXFxcIlBJRCBlcSAlYVxcXCIgXnwgXCIgK1xuICAgICAgICAgICAgXCJmaW5kc3RyIC9JIGNocm9tZWRyaXZlci5leGVgKSBkbyAoSUYgTk9UICViPT1cXFwiXFxcIiBUQVNLS0lMTCBcIiArXG4gICAgICAgICAgICBcIi9GIC9QSUQgJWEpKVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbWQgPSBgcGtpbGwgLTE1IC1mIFwiJHt0aGlzLmNocm9tZWRyaXZlcn0uKi0tcG9ydD0ke3RoaXMucHJveHlQb3J0fVwiYDtcbiAgICB9XG4gICAgbG9nLmluZm8oYEtpbGxpbmcgYW55IG9sZCBjaHJvbWVkcml2ZXJzLCBydW5uaW5nOiAke2NtZH1gKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgKEIucHJvbWlzaWZ5KGNwLmV4ZWMpKShjbWQpO1xuICAgICAgbG9nLmluZm8oXCJTdWNjZXNzZnVsbHkgY2xlYW5lZCB1cCBvbGQgY2hyb21lZHJpdmVyc1wiKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZy5pbmZvKFwiTm8gb2xkIGNocm9tZWRyaXZlcnMgc2VlbWVkIHRvIGV4aXN0XCIpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGhhc1dvcmtpbmdXZWJ2aWV3ICgpIHtcbiAgICAvLyBzb21ldGltZXMgY2hyb21lZHJpdmVyIHN0b3BzIGF1dG9tYXRpbmcgd2Vidmlld3MuIHRoaXMgbWV0aG9kIHJ1bnMgYVxuICAgIC8vIHNpbXBsZSBjb21tYW5kIHRvIGRldGVybWluZSBvdXIgc3RhdGUsIGFuZCByZXNwb25kcyBhY2NvcmRpbmdseVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmp3cHJveHkuY29tbWFuZCgnL3VybCcsICdHRVQnKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxuQ2hyb21lZHJpdmVyLkVWRU5UX0VSUk9SID0gJ2Nocm9tZWRyaXZlcl9lcnJvcic7XG5DaHJvbWVkcml2ZXIuRVZFTlRfQ0hBTkdFRCA9ICdzdGF0ZUNoYW5nZWQnO1xuQ2hyb21lZHJpdmVyLlNUQVRFX1NUT1BQRUQgPSAnc3RvcHBlZCc7XG5DaHJvbWVkcml2ZXIuU1RBVEVfU1RBUlRJTkcgPSAnc3RhcnRpbmcnO1xuQ2hyb21lZHJpdmVyLlNUQVRFX09OTElORSA9ICdvbmxpbmUnO1xuQ2hyb21lZHJpdmVyLlNUQVRFX1NUT1BQSU5HID0gJ3N0b3BwaW5nJztcbkNocm9tZWRyaXZlci5TVEFURV9SRVNUQVJUSU5HID0gJ3Jlc3RhcnRpbmcnO1xuXG5leHBvcnQgZGVmYXVsdCBDaHJvbWVkcml2ZXI7XG4iXX0=