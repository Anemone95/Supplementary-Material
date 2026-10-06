'use strict';

var tests = {
  equals: function (conditions, params) {
    return Object.keys(conditions).every(function (key) {
      return params.every(function (param) {
        return conditions[key] == param[key];
      });
    });
  }
};

module.exports = tests;
