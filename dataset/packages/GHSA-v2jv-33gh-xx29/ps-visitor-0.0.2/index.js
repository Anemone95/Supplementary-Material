/**
 * Created by Wisdom Kwan on 17/9/17
 */

'use strict';

const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const PS_HEADER_OSX = 'USERPID%CPU%MEMVSZRSSTTSTATSTARTEDTIMECOMMAND';
const PS_HEADER_LINUX = 'USERPID%CPU%MEMVSZRSSTTYSTATSTARTTIMECOMMAND';

const [USER, PID, CPU, MEM, VSZ, RSS, TT, STAT, STARTED, TIME, COMMAND]
  = ['user', 'pid', 'cpu', 'mem', 'vsz', 'rss', 'tt', 'stat', 'started', 'time', 'command'];

const KILL_SIGNAL_OSX = [
  'SIGHUP',   'SIGINT',     'SIGQUIT',  'SIGILL',
  'SIGTRAP',  'SIGABRT',    'SIGEMT',   'SIGFPE',
  'SIGKILL',  'SIGBUS',     'SIGSEGV',  'SIGSYS',
  'SIGPEPE',  'SIGALRM',    'SIGTERM',  'SIGURG',
  'SIGSTOP',  'SIGTSTP',    'SIGCONT',  'SIGCHLD',
  'SIGTTIN',  'SIGTTOU',    'SIGIO',    'SIGXCPU',
  'SIGXFSZ',  'SIGVTALRM',  'SIGPROF',  'SIGWINCH',
  'SIGINFO',  'SIGUSR1',    'SIGUSR2'
];
const KILL_SIGNAL_LINUX = [
  'SIGHUP',	      'SIGINT',	      'SIGQUIT',	    'SIGILL',	      'SIGTRAP',
  'SIGABRT',	    'SIGBUS',	      'SIGFPE',	      'SIGKILL',	    'SIGUSR1',
  'SIGSEGV',	    'SIGUSR2',	    'SIGPIPE',	    'SIGALRM',	    'SIGTERM',
  'SIGSTKFLT',	  'SIGCHLD',	    'SIGCONT',	    'SIGSTOP',	    'SIGTSTP',
  'SIGTTIN',	    'SIGTTOU',	    'SIGURG',	      'SIGXCPU',	    'SIGXFSZ',
  'SIGVTALRM',	  'SIGPROF',	    'SIGWINCH',	    'SIGIO',	      'SIGPWR',
  'SIGSYS',	      'SIGRTMIN',	    'SIGRTMIN+1',	  'SIGRTMIN+2',	  'SIGRTMIN+3',
  'SIGRTMIN+4',   'SIGRTMIN+5',	  'SIGRTMIN+6',	  'SIGRTMIN+7',	  'SIGRTMIN+8',
  'SIGRTMIN+9',	  'SIGRTMIN+10',  'SIGRTMIN+11',	'SIGRTMIN+12',  'SIGRTMIN+13',
  'SIGRTMIN+14',	'SIGRTMIN+15',	'SIGRTMAX-14',	'SIGRTMAX-13',	'SIGRTMAX-12',
  'SIGRTMAX-11',	'SIGRTMAX-10',	'SIGRTMAX-9',	  'SIGRTMAX-8',	  'SIGRTMAX-7',
  'SIGRTMAX-6',	  'SIGRTMAX-5',	  'SIGRTMAX-4',	  'SIGRTMAX-3',	  'SIGRTMAX-2',
  'SIGRTMAX-1',	  'SIGRTMAX'
];

/**
 * use `ps aux | grep ...` cmd get process information in current pc.
 * @param {string} [extra]
 * @param {(string|string[])} [keywords]
 * @param {boolean} [filterWaste=true]
 * @return {Promise.<string[]>}
 */
const psRaw = (extra, keywords, filterWaste = true) => {
  // shell command
  let cmd = 'ps aux';
  if (extra) cmd += ` | ${extra}`;

  // run command
  return exec(cmd).then((result) => {
    if (result.stderr) {
      throw new Error(result.stderr);
    }

    if (result.stdout) {
      // split into lines.
      // basically, the EOL should be:
      // - windows: \r\n
      // - *nix: \n
      // ps result convert to string array.
      const tmp1 = result.stdout.split(/(\r\n)|(\n\r)|\n|\r/);
      if (tmp1.length === 0) return [];

      // filter & trim element.
      const tmp2 = [];
      tmp1.forEach((element) => {
        if (element) {
          const t = element.trim();
          if (t !== '') tmp2.push(t);
        }
      });
      if (tmp2.length === 0) return [];

      // remove header.
      if (checkHeader(tmp2[0])) tmp2.shift();
      if (tmp2.length === 0) return [];

      // use keys filter array.
      return tmp2.filter((value) => {
        // filter waste.
        if (filterWaste) {
          // value not includes 'ps aux'.
          if (value.includes('ps aux')) return false;
          // value not includes 'grep' cmd.
          if (value.includes('grep')) {
            const t = parseLine(value);
            const tCmd = t[COMMAND].trim().split(/\s+/).filter((value) => {
              return value !== undefined && value !== null && value !== '';
            });
            if (tCmd[0] === 'grep') return false;
          }
        }

        // value includes keys.
        if (keywords) {
          if (Array.isArray(keywords)) {
            for (let element of keywords) {
              if (!value.includes(element)) return false;
            }
          } else {
            if (!value.includes(keywords)) return false;
          }
        }

        return true;
      });
    }

    return [];
  });
};

/**
 * check ps information header
 * @param {string} line - psRaw function return string array element.
 * @return {boolean}
 */
const checkHeader = (line) => {
  const tmp = line.replace(/\s/ig, '');
  if (os.platform() === 'linux') {
    return tmp === PS_HEADER_LINUX;
  } else if (os.platform() === 'darwin') {
    return tmp === PS_HEADER_OSX;
  }
  return false;
};

/**
 * unit info string covert to info object.
 * @param {string} line - psRaw function return string array element.
 * @return {Object}
 */
const parseLine = (line) => {
  // split into unit.
  const fields = line.split(/\s+/).filter((value) => {
    return value !== undefined && value !== null && value !== '';
  });

  // create line information object.
  const info = {};
  info[USER] = fields[0];
  info[PID] = fields[1];
  info[CPU] = fields[2];
  info[MEM] = fields[3];
  info[VSZ] = fields[4];
  info[RSS] = fields[5];
  info[TT] = fields[6];
  info[STAT] = fields[7];
  info[STARTED] = fields[8];
  info[TIME] = fields[9];

  let cmd = fields[10].trim();
  for (let i=11; i<fields.length; i++) {
    cmd += ` ${fields[i].trim()}`;
  }
  info[COMMAND] = cmd;

  return info;
};

/**
 * get process status information.
 * @param {Object} [condition]
 * @param {string} [extra]
 * @param {(string|string[])} [keywords]
 * @param {boolean} [filterWaste=true]
 * @return {Promise.<Object[]>}
 */
const ps = (condition, extra, keywords, filterWaste = true) => {
  return psRaw(extra, keywords, filterWaste)
    .then((result) => {
      if (result.length === 0) return [];

      // string array convert to object array.
      const tmp1 = [];
      result.forEach((element) => {
        tmp1.push(parseLine(element));
      });

      return tmp1.filter((value) => {
        if (typeof condition === 'object' && Object.keys(condition).length > 0) {
          return checkCondition(value, condition);
        }
        return true;
      });
    });
};

/**
 * check filter condition.
 * condition: {
 *    user<string>: 'user name',
 *    pid<string>: 'process id',
 *    cpu<string>: '>2 <10',  cpu used percent
 *    mem<string>: '>3 <20',  memory used percent
 *    vsz<string>: '>10 <20', virtual memory used (in KiB)
 *    rss<string>: '>10 <30', resident set size (in KiB)
 *    tt<string>: 'controlling tty',
 *    stat<string>: 'process state',
 *    started: 'starting time',
 *    time: 'cumulative cpu time',
 *    command<string>: 'command and all arguments',
 * }
 * @param {Object} line
 * @param {Object} condition
 * @return {boolean}
 */
const checkCondition = (line, condition) => {
  // check condition all keys.
  if (!condition) return true;
  const keys = Object.keys(condition);
  if (keys.length === 0) return true;

  // check user
  if (keys.includes(USER)) {
    if (!stringCompare(line[USER], condition[USER])) return false;
  }

  // check pid
  if (keys.includes(PID)) {
    if (condition[PID].toString().trim() !== line[PID]) return false;
  }

  // check cpu
  if (keys.includes(CPU)) {
    if (!numberCompare(line[CPU], condition[CPU])) return false;
  }

  // check memory
  if (keys.includes(MEM)) {
    if (!numberCompare(line[MEM], condition[MEM])) return false;
  }

  // check vsz
  if (keys.includes(VSZ)) {
    if (!numberCompare(line[VSZ], condition[VSZ])) return false;
  }

  // check rss
  if (keys.includes(RSS)) {
    if (!numberCompare(line[RSS], condition[RSS])) return false;
  }

  // check tt
  if (keys.includes(TT)) {
    if (condition[TT].toString().trim() !== line[TT]) return false;
  }

  // check stat
  if (keys.includes(STAT)) {
    if (condition[STAT].toString().trim() !== line[STAT]) return false;
  }

  // check started
  if (keys.includes(STARTED)) {

  }

  // check time
  if (keys.includes(TIME)) {

  }

  // check command
  if (keys.includes(COMMAND)) {
    const cmd = condition[COMMAND].trim().split(/\s+/);
    if (cmd.length === 1) {
      if (!stringCompare(line[COMMAND], cmd[0])) return false;
    } else if (cmd.length > 1) {
      for (let element of cmd) {
        let t = element.trim();
        if (!t) continue;
        if (!t.startsWith('~')) t = '~' + t;
        if (!stringCompare(line[COMMAND], t)) return false;
      }
    }
  }

  return true;
};

/**
 * compare line number data.
 * compare example: '>10 <20', '>=10 <=20'.
 * '>': greater then
 * '<': lower than
 * ...
 * @param {(number|string)} origin
 * @param {string} compare
 * @return {boolean}
 */
const numberCompare = (origin, compare) => {
  // check params.
  if (!origin) return false;
  if (!compare) return true;

  // Init params.
  let originTmp = NaN;
  if (typeof origin === 'number') originTmp = origin;
  else originTmp = +origin.trim();
  if (Number.isNaN(originTmp))  return false;

  // split compare into array<string>.
  const compareTmp = compare.trim().split(/\s+/);
  if (compareTmp.length === 0) return true;

  // compare origin and compare's element.
  for (let element of compareTmp) {
    const tElement = element.trim();
    if (!tElement) continue;

    if (tElement.startsWith('>=')) {
      const tCompare = +tElement.slice(2);
      if (tCompare) {
        if (originTmp < tCompare) return false;
      }
    } else if (tElement.startsWith('<=')) {
      const tCompare = +tElement.slice(2);
      if (tCompare) {
        if (originTmp > tCompare) return false;
      }
    } else if (tElement.startsWith('>')) {
      const tCompare = +tElement.slice(1);
      if (tCompare) {
        if (originTmp <= tCompare) return false;
      }
    } else if (tElement.startsWith('<')) {
      const tCompare = +tElement.slice(1);
      if (tCompare) {
        if (originTmp >= tCompare) return false;
      }
    } else {
      let tCompare = -1;
      if (tElement.startsWith('=')) tCompare = +tElement.slice(1);
      else tCompare = +tElement;
      if (tCompare) {
        if (originTmp !== tCompare) return false;
      }
    }
  }

  return true;
};

/**
 * compare line string data.
 * compare example: '~Sublime'
 * '~': contains
 * @param {string} origin
 * @param {string} compare
 * @return {boolean}
 */
const stringCompare = (origin, compare) => {
  // check params.
  if (!origin) return false;
  if (!compare) return true;

  // init params.
  const originTmp = origin.trim();
  if (!originTmp) return false;
  const compareTmp = compare.trim();
  if (!compareTmp) return true;

  // compare params.
  if (compareTmp.startsWith('~')) {
    const tCompare = compareTmp.slice(1);
    if (!originTmp.includes(tCompare)) return false;
  } else {
    if (originTmp !== compareTmp) return false;
  }

  return true;
};

/**
 * kill the pid process.
 * @param {(number|string)} pid
 * @param {(number|string)} [signal]
 * @return {Promise}
 */
const kill = (pid, signal) => {
  // get signal index.
  let signalIndex = -1;
  if (signal) {
    if (Number.isInteger(signal)) {
      signalIndex = signal;
    } else {
      signalIndex = getSignal(signal);
    }
  }

  // shell command
  let cmd = '';
  if (signalIndex < 0) cmd = `kill ${pid}`;
  else cmd = `kill -${signalIndex} ${pid}`;

  // run command
  return exec(cmd).then((result) => {
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return Promise.resolve();
  });
};

/**
 * get the signal's index.
 * @param {string} signal
 * @return {number}
 */
const getSignal = (signal) => {
  let tmp = signal.trim();
  if (!tmp.startsWith('SIG')) {
    tmp = 'SIG' + tmp;
  }
  let index = -1;
  if (os.platform() === 'linux') {
    index = KILL_SIGNAL_LINUX.indexOf(tmp);
  } else if (os.platform() === 'darwin') {
    index = KILL_SIGNAL_OSX.indexOf(tmp);
  }
  if (index >= 0) index += 1;
  return index;
};

/**
 * get the signal's index by shell command.
 * @param {string} signal
 * @return {Promise.<number>}
 */
const getSignalRaw = (signal) => {
  let tmp = signal.trim();
  if (tmp.startsWith('SIG')) {
    tmp = tmp.slice(3);
  }

  const cmd = `kill -l ${tmp}`;
  return exec(cmd).then((result) => {
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    const tSignal = Number.parseInt(result.stdout);
    if (tSignal) return tSignal;
    return -1;
  });
};

module.exports = {
  ps,
  kill,
  getSignalRaw,
};