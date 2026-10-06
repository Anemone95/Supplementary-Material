/**
 * @fileoverview Options configuration for optionator.
 * @author fanshenggang
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const optionator = require('optionator');

//------------------------------------------------------------------------------
// Initialization and Public Interface
//------------------------------------------------------------------------------

// exports "parse(args)", "generateHelp()", and "generateHelpForOption(optionName)"
module.exports = optionator({
  prepend: 'augustine [options]',
  defaults: {
    port: 8080
  },
  options: [
    {
      heading: 'Basic configuration'
    },
    {
      option: 'port',
      alias: 'p',
      type: 'Int',
      default: '8080',
      description: 'Augustine listening port'
    },
    {
      option: 'host',
      type: 'String',
      description: 'Augustine listening address'
    },
    {
      option: 'help',
      alias: 'h',
      type: 'Boolean',
      description: 'Show help'
    },
    {
      option: 'version',
      alias: 'v',
      type: 'Boolean',
      description: 'Output the version number'
    },
  ]
});
