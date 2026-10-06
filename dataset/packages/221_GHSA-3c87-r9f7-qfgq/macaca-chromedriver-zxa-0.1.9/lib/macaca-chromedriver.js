/* ================================================================
 * macaca-chromedriver by xdf(xudafeng[at]126.com)
 *
 * first created at : Fri Sep 11 2015 00:49:51 GMT+0800 (CST)
 *
 * ================================================================
 * Copyright  xdf
 *
 * Licensed under the MIT License
 * You may not use this file except in compliance with the License.
 *
 * ================================================================ */

'use strict';

var _ = require('lodash');
var path = require('path');
var EOL = require('os').EOL;
var utils = require('./utils');
var Proxy = require('./proxy');
var logger = require('./logger');
var cp = require('child_process');
var install = require('./install');
var SP = require('./spawn-promise');

exports.version = '2.20';

var fileName = exports.fileName = utils.getPlatform() === 'win32' ? 'chromedriver.exe' : 'chromedriver';

var binPath = exports.binPath = path.join(__dirname, fileName);

var chromedriver = exports.chromedriver = null;

exports.start = function() {
  chromedriver = cp.execFile(binPath);
  return chromedriver;
};

exports.stop = function () {
  if (chromedriver){
    chromedriver.kill();
    logger.info('chromedriver killed');
  }
};

exports.install = function() {
  install();
};

var STATES = {
  STOPED: 'stoped',
  STARTING: 'starting',
  ONLINE: 'online',
  STOPING: 'stopping',
  RESTARTING: 'restarting'
};

function ChromeDriver(options) {
  this.proxyHost = options.proxyHost;
  this.proxyPort = options.proxyPort;
  this.adbPort = options.adbPort;
  this.binPath = options.binPath || binPath;
  this.state = STATES['STOPED'];
  this.proxy = null;
  this.chromedriver = null;
  this.init();
}

ChromeDriver.prototype.startPorxy = function() {
  this.proxy = new Proxy(this.proxyHost, this.proxyPort);
};

ChromeDriver.prototype.init = function() {
  this.startPorxy();
  this.checkBinPath();
  this.start();
};

ChromeDriver.prototype.checkBinPath = function() {
  if (this.binPath) {
    logger.info('chromedriver bin path: %s', this.binPath);
  } else {
    logger.error('chromedriver bin path not found');
  }
};

ChromeDriver.prototype.start = function(caps) {
  this.capabilities = caps;
  this.setState(STATES['STARTING']);
  let args = [];
  args.push('--url-base=wd/hub');
  args.push('--port=' + this.proxyPort);

  if (this.adbPort) {
    args.push('--adb-port=' + this.adbPort);
  }

  this.killAll();

  return new Promise(function(resolve, reject) {

    var chromedriver = cp.spawn(this.binPath, args, {
    });
    var error = [];

    chromedriver.stdout.on('data', function(data) {
      logger.info(_.trim(data.toString()));
    });

    chromedriver.stderr.on('data', function(data) {
      logger.warn(_.trim(data.toString()));
      error.push(_.trim(data.toString()));
    });

    chromedriver.stdout.on('close', function(code) {
      if (code) {
        reject(error.join(EOL));
      }
      this.state = STATES['STOPED'];
    }.bind(this));

    return this.detectAvaliable();

  }.bind(this));
};

ChromeDriver.prototype.restart = function() {

};

ChromeDriver.prototype.stop = function() {

};

ChromeDriver.prototype.kill = function() {

};

ChromeDriver.prototype.killAll = function() {

};

ChromeDriver.prototype.getState = function() {
  return this.state;
};

ChromeDriver.prototype.setState = function(state) {
  this.state = state || 'unknow';
  logger.info('state change to %s', state);
};

ChromeDriver.prototype.detectAvaliable = function() {

  return new Promise(function(resolve, reject) {

  });
};

exports.ChromeDriver = ChromeDriver;
