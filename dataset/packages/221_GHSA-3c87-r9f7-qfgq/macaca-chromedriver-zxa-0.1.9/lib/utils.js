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

exports.getPlatform = function() {
  var platform = process.platform;

  if (platform === 'linux') {
    if (process.arch === 'x64') {
      platform += '64';
    } else {
      platform += '32';
    }
  } else if (platform === 'darwin') {
    platform = 'mac32';
  } else if (platform !== 'win32') {
    console.log('Unexpected platform or architecture:', process.platform, process.arch);
    process.exit(1);
  }

  return platform;
};
