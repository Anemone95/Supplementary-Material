'use strict';

var encode = require('./lib/encode');
var resources = require('./lib/resources');
var restrictions = require('./lib/restrictions');
var validate = require('./lib/validate');

function testResource(statements, context) {
  validate.args(arguments);
  validate.statements(statements);

  if (!statements.length) {
    return false;
  }

  if (!statements.encoded) {
    statements = encode(statements, context);
  }

  var matches = resources(statements, context);

  if (matches.length) {
    return matches;
  }

  return false;
}

function testRestriction(statements, context) {
  return restrictions(statements, context);
}

module.exports = {
  encode: encode,
  resource: testResource,
  restriction: testRestriction
};
