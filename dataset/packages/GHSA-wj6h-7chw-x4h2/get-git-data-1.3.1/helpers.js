const { SEPARATOR } = require('./constants');
const pipe = require('ramda.pipe');

exports.parseStdout = (stdout) => {
  const parsed = (pipe(
    trimLastChar,
    wrapInArray,
    replaceSeparators
  )(stdout))
  return JSON.parse(parsed);
}

function trimLastChar(str) {
  return str.substr(0, str.length-1);
}

function wrapInArray(str){
  return `[${str}]`
}

function replaceSeparators(str) {
  const newStr = str.replace(/"/g, '\\"');
  return newStr.replace(new RegExp(SEPARATOR,'g'), '"');
}
