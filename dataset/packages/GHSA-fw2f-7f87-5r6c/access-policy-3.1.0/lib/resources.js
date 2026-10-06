'use strict';

function createRegExp(path) {
  path = path.replace(/\//g, '\\/');
  path = path.replace(/\*/g, '.*?');

  return new RegExp('^' + path + '$');
}

function filterActions(verbs, action) {
  verbs = typeof verbs === 'string' ? [verbs] : verbs;

  if (verbs.indexOf('*') > -1 || verbs.indexOf(action) > -1) {
    return true;
  }

  return false;
}

function filterPaths(paths, resource) {
  paths = typeof paths === 'string' ? [paths] : paths;

  return paths.some(function (path) {
    var re = createRegExp(path);
    return re.test(resource);
  });
}

function filterDeniedStatements(item) {
  return item.effect !== 'deny';
}

function findMatchingResources(statements, context) {
  var matched = statements.filter(function (item) {
    var actions = false;
    var paths = false;

    actions = filterActions(item.action, context.Action);

    if (actions) {
      paths = filterPaths(item.resource, context.Resource);
    }

    return actions && paths;
  });

  var allowed = matched.filter(filterDeniedStatements);

  // All matched statements must be allowed
  if (allowed.length < matched.length) {
    return false;
  }

  allowed.forEach(function (item) {
    Object.defineProperty(item, 'allowed', {
      __proto__: null,
      value: true
    });
  });

  return allowed;
}

module.exports = findMatchingResources;
