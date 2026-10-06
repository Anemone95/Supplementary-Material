'use strict';

function validateArgs(args) {
  if (args.length < 2) {
    throw new SyntaxError('missing parameters');
  }

  if (!Array.isArray(args[0])) {
    throw new TypeError('provided statements must be an Array');
  }

  if (typeof args[1] !== 'object') {
    throw new TypeError('provided resource must be an Object');
  }
}

function validateStatements(statements) {
  statements.forEach(function (item) {
    if (!item.action || !item.resource) {
      throw new SyntaxError('statement is missing required properties');
    }
  });
}

module.exports = {
  args: validateArgs,
  statements: validateStatements
}
