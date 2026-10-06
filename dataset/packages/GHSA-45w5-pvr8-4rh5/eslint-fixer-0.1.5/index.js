const path = require("path");
const childProcess = require("child_process");
const pWaitFor = require("p-wait-for");

let cacheIsEslintAvailable;
let eslintCheckInProgress = false;

/**
 * Options to determine fix function's behaviour.
 * @typedef {Object} Options
 * @property {boolean} [checkAvailable=false]  - When true, `eslint` command availability is checked. If `eslint` is not available, `eslint` command will not be executed.
 * @property {boolean} [useEslint=true]        - When false, `eslint` command will not be executed.
 */

/**
 * Executes given command and returns result as a promise.
 * @private
 * @param   {string}                  cmd - Command to execute.
 * @returns {Promise.<stdout,stderr>}     - Result promise.
 */
function exec(cmd) {
  return new Promise((resolve, reject) => {
    /* eslint no-param-reassign: "off" */
    childProcess.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        error.message += `\n${stderr}\n${stdout}`;
      }

      return error ? reject(error) : resolve(stdout, stderr);
    });
  });
}

/**
 * Based on options determines whether `eslint` should be executed.
 * If eslint availability check is requested. It caches availability check result and returns cached result for subsequent calls.
 * For performance reasons, eslint check can be skipped. In this case it returns true.
 * Also command execution can be disabled by `useEslint` parameter.
 * @private
 * @param   {Options}           options   - Options
 * @returns {Promise.<boolean>}           - Whether eslint is available.
 */
function shouldExecute(options) {
  const { checkAvailable, useEslint } = options;

  if (!useEslint) {
    return Promise.resolve(false);
  }

  if (!checkAvailable) {
    return Promise.resolve(true);
  }

  if (eslintCheckInProgress) {
    return pWaitFor(() => !eslintCheckInProgress).then(() => cacheIsEslintAvailable);
  }

  eslintCheckInProgress = true;

  return exec("eslint -v").then(() => {
    cacheIsEslintAvailable = true;
    eslintCheckInProgress = false;
    return cacheIsEslintAvailable;
  });
}

/**
 * Executes `eslint --fix` for given filePath based on options.
 * @param   {string|Array.<string>} filePath  - File path or list of file paths are passed to `eslint --fix`.
 * @param   {Options}               options   - Options
 * @returns {Promise.<void>}                  - Result promise
 */
function fix(filePath, options = {}) {
  const { checkAvailable = false, useEslint = true } = options;

  return shouldExecute({ checkAvailable, useEslint })
    .then(doExecute => {
      const files = Array.isArray(filePath) ? filePath.map(path.normalize).join(" ") : path.normalize(filePath);
      return doExecute ? exec(`npx eslint --fix ${files}`) : false;
    })
    .then(result => result !== false);
}

module.exports = fix;
