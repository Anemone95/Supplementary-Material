#!/usr/bin/env node

/**
 * @fileoverview Main CLI that is run via the augustine command.
 * @author fanshenggang
 */

/* eslint no-console:off */

const debug = (process.argv.indexOf('--debug') > -1);

if (debug) {
  require('debug').enable('augustine:*');
}

// now we can safely include the other modules that use debug
const cli = require('../lib/cli');

process.once('uncaughtException', err => {
  console.log(err.message);
  console.log(err.stack);

  process.exitCode = 1;
});

process.exitCode = cli.execute(process.argv);
