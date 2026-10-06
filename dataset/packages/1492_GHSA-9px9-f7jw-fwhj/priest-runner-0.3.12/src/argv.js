module.exports = parseArgs;
parseArgs.convertValue = convertValue;

function parseArgs(args, target) {
  return args.reduce(function (params, arg) {
      var match = arg.match(/^--([^=]+)(=(.+))?$/);
      var key, value, hasValue;
      if (match) {
          key = match[1];
          value = match[3];
          hasValue = !! match[2];

          params[key] = hasValue
            ? convertValue(value)
            : true;
      }
      return params;
  }, target || {});
};

function convertValue(value) {
  if (value === 'true') {
      value = true;
  } else if (value === 'false') {
      value = false;
  } else if (value.match(/^\d+$/)) {
      value = parseInt(value, 10);
  } else if (value.match(/^\d+\.\d+$/)) {
      value = parseFloat(value, 10);
  }

  return value;
}
