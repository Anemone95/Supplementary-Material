(function() {
  var CUSTOM_NODE_URL, Promise, childProcess, moduleInstaller, os, path, _;

  childProcess = require('child_process');

  os = require('os');

  path = require('path');

  _ = require('underscore');

  Promise = require('es6-promise').Promise;

  CUSTOM_NODE_URL = 'https://gh-contractor-zcbenz.s3.amazonaws.com/atom-shell/dist';

  moduleInstaller = {
    install: function(appPath, atomShellVersion, npmCachePath, _arg) {
      var cwd, debug, env;
      debug = (_arg != null ? _arg : {}).debug;
      cwd = appPath;
      env = {
        HOME: npmCachePath,
        PATH: path.resolve(__dirname, '..', 'bin') + path.delimiter + process.env['PATH'],
        npm_config_disturl: CUSTOM_NODE_URL,
        npm_config_target: atomShellVersion,
        npm_config_arch: process.arch
      };
      _.defaults(env, process.env);
      return new Promise(function(resolve, reject) {
        var args, npm;
        args = ['install'];
        if (debug) {
          args.push('--debug');
        }
        npm = childProcess.spawn(moduleInstaller.getNpmPath(), args, {
          env: env,
          cwd: cwd
        });
        npm.on('error', function(error) {
          return reject(moduleInstaller.createError(error.message, npm));
        });
        return npm.on('exit', function(code, signal) {
          if (code === 0) {
            return resolve();
          } else {
            return reject(moduleInstaller.createError("Failed to install node modules (code:" + code + ")", npm));
          }
        });
      });
    },
    getNpmPath: function() {
      return path.join(__dirname, '../node_modules/.bin/npm');
    },
    createError: function(message, proc) {
      message = "" + message + ".\n";
      message += "stdout:\n" + (proc.stdout.read()) + "\n\n";
      message += "stderr:\n" + (proc.stderr.read());
      return new Error(message);
    }
  };

  module.exports = moduleInstaller.install;

}).call(this);
