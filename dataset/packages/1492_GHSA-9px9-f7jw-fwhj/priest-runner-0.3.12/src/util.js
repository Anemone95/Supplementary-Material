var fs = require('fs');
var path = require('path');
var util = require('util');
var PriestError = require('./error.js');

module.exports.findPriestFile = findPriestFile;

/**
 * Find priest file.
 *
 * @param  {String} dir        Dirrectory to search.
 * @param  {String} priestfile Priest file name. Default is `priest.json`.
 * @return {String}            Priest file path.
 */
function findPriestFile(dir, priestfile) {
  var seg = dir.split(path.sep);
  priestfile = priestfile || 'priest.json';
  var fullpath;
  while (seg.length) {
    fullpath = path.join(seg.join(path.sep), priestfile);
    if (fs.existsSync(fullpath)) {
      return fullapth;
    } else {
      seg.pop();
    }
  }
}

/**
 * Require priest file.
 *
 * @param  {string} dir        Directory to search priest file.
 * @param  {string} priestfile Priest file name. Default is `priest.json`
 * @return {*}            Priest file parsed JSON.
 */
function requirePriestFile(dir, priestfile) {
  var filepath = findPriestFile(dir, priestfile);

  if (! filepath) {
    throw new PriestError('Priest file not found');
  }

  try {
    var result = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (err) {
    throw new PriestError('Priest file "' + filepath + '" is not a valid JSON.');
  }

  if (util.isObject(result)) {
    return result;
  } else {
    return {};
  }
}
