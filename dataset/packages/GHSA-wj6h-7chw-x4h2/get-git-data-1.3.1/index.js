const exec = require('child_process').exec
const { parseStdout } = require('./helpers');
const { SEPARATOR } = require('./constants');

function _command (cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, {maxBuffer: 1024 * 1000}, function (err, stdout, stderr) {
      if (err) return reject(err);
      if (stderr) return reject(stderr);
      resolve(stdout)
    })
  })
}

module.exports = {
  log: function (limit) {
    let cmd = `git log --no-color --pretty=format:'{
      "commitHash": "%H",
      "commitMessage": "%s",
      "timestamp": "%at000",
      "authorName": "%an"
    },' --abbrev-commit`;
    
    if (limit) {
      cmd = `${cmd} -${limit}`;
    }

    cmd = cmd.replace(/"/g, SEPARATOR);

    return new Promise(resolve => {
      _command(cmd).then(stdout => {
        const json = parseStdout(stdout);
        resolve(json)
      })
    })
  },

  short: () => _command('git rev-parse --short HEAD'),
  
  long: () => _command('git rev-parse HEAD'),
  
  branch: () => _command('git rev-parse --abbrev-ref HEAD'),
  
  tag: () => _command('git describe --always --tag --abbrev=0'),
}
