'use strict';

var path = require('path');
var utils = require('./utils');

/**
 * Uses PowerShell to configure the environment for
 * msvs_version 2015 and npm python 2.7
 *
 * @params variables an object with paths for different environmental variables
 *
 * @returns {Promise}
 */
function setEnvironment(variables) {
  var pythonPath = path.join(variables.python.pythonPath, 'python.exe');
  var scriptPath = path.join(__dirname, '..', 'ps1', 'set-environment.ps1');
  var psArgs = '& {& \'' + scriptPath + '\' -pythonPath \'' + pythonPath + '\' }';
  var args = ['-ExecutionPolicy', 'Bypass', '-NoProfile', '-NoLogo', psArgs];

  return utils.executeChildProcess('powershell.exe', args);
}

module.exports = setEnvironment;