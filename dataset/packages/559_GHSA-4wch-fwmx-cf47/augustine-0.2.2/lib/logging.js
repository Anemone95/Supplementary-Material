/**
 * @fileoverview Handle logging for Augustine
 * @author fanshenggang
 */

/* eslint no-console: "off" */

/* istanbul ignore next */
module.exports = {

  /**
   * Cover for console.log
   * @returns {void}
   */
  info() {
    console.log.apply(console, Array.prototype.slice.call(arguments));
  },

  /**
   * Cover for console.error
   * @returns {void}
   */
  error() {
    console.error.apply(console, Array.prototype.slice.call(arguments));
  }
};
