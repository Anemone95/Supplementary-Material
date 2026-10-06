'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var http = require('http');

module.exports = function (model, options) {
  return function (req, res, next) {
    if (!req.params.id) {
      return next();
    }

    options.contextFilter(model, req, function (filteredContext) {
      filteredContext.findOne().and(_defineProperty({}, options.idProperty, req.params.id)).lean(false).read(options.readPreference).exec().then(function (doc) {
        if (!doc) {
          var err = new Error(http.STATUS_CODES[404]);
          err.statusCode = 404;
          return options.onError(err, req, res, next);
        }

        req.erm.document = doc;

        next();
      }, function (err) {
        err.statusCode = 400;
        options.onError(err, req, res, next);
      });
    });
  };
};