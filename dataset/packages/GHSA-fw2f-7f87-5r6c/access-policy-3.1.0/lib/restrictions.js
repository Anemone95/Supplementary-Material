'use strict';

var tests = require('./tests');

function filterRestrictions(restrictions, params) {
  return Object.keys(restrictions).every(function (item) {
    var vals = restrictions[item];
    var fn = tests[item];

    return fn(vals, params);
  });
}

function validateRestrictions(statements, context) {
  if (!Array.isArray(context)) {
    context = [context];
  }

  var valid = statements.every(function (item) {
    if (!item.allowed) {
      console.log('Statements must be validated for resource first');
      return false;
    }

    if (!item.hasOwnProperty('restriction')) {
      return false
    }

    return filterRestrictions(item.restriction, context);
  });

  return valid;
}

module.exports = validateRestrictions;
