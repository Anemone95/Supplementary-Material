var _ = require('underscore');
var inherits = require('util').inherits;
var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var PriestError = require('./error.js');
var async = require('async');
var pack = require('../package.json');

module.exports = PriestController;

function PriestController(options) {
    EventEmitter.call(this);
    this.id = 0;
    this.children = [];
    this.options = _.extend({}, this.options, options);
    this.names = {};
}

inherits(PriestController, EventEmitter);

PriestController.prototype.options = {
    dir: process.cwd(),
    logs: 'logs',
    logSize: 1000, // 1_000 log items
    restart: 5,
    delay: 0,
    env: {
        COLORTERM: 1,
        FORCE_COLOR: 1
    }
};

PriestController.prototype.version = pack.version;

PriestController.prototype.listProcess = function(all, callback) {
    if (arguments.length === 1) {
        callback = all;
        all = false;
    }

    var list;
    if (! all) {
        list = this.children.filter(function(info){
            return ! info.stopped && ! info.process.killed;
        });
    } else {
        list = this.children.slice();
    }

    setImmediate(callback, null, list);
};

PriestController.prototype.listNamedProcess = function (name, callback) {
    var children = this.children.filter(function(child){
        return child.name === name;
    }).sort(function(a, b){
        return -(a.id - b.id);
    });

    setImmediate(callback, null, children);
};

PriestController.prototype.startProcess = function(params, callback) {
    var self = this;
    var name = params.name || null;

    if (name && name in this.names) {
        return setImmediate(callback, new PriestError('Name "' + name + '" already taken'));
    }

    var info = {
        id: ++this.id,
        startedAt: null,
        createdAt: new Date(),
        name: name,
        params: params,
        log: []
    };

    this.names[name] = true;
    this.children.push(info);

    var delay;
    if (params.hasOwnProperty('delay')) {
        delay = params.delay * 1000;
    } else {
        delay = 0;
    }

    info._timeout = setTimeout(function(){
        delete info._timeout;

        self.createChild(info);
        var child = info.process;

        delay || setImmediate(function(){
            if (child.killed) {
                return callback(
                    new PriestError('Process was not started')
                );
            }

            callback(null, info);
        });
    }, delay);

    if (delay) {
      console.error('DELAY', delay);
    }
};

PriestController.prototype.restartProcess = function(id, callback) {
    var info = this.getProcess(id);
    if (! info) return setImmediate(callback, new PriestError('Process not found'));
    var self = this;
    this.stopProcess(id, function (error) {
        if (error) {
            return callback(error);
        }

        var params = _.extend({}, info.params);
        self.startProcess(params, callback);
    });
};

PriestController.prototype.createChild = function(info) {
    var self = this;
    var params = info.params;
    var cmd = params.cmd || params.bin;
    var isNode = (
        cmd === 'node' ||
        cmd === 'iojs' ||
        (! cmd)
    );

    cmd = cmd || process.argv[0];

    var child = spawn(cmd, params.args, {
        env: _.extend({PATH: process.env.PATH}, process.env, this.options.env, params.env),
        cwd: path.resolve(this.options.dir, params.cwd || '.'),
        stdio: [null, null, null, isNode ? 'ipc' : null]
    });

    child.priestId = info.id;
    info.startedAt = new Date();

    var onStop = function(code){
        info.stopped = true;
        info.code = code;

        delete info.process;
        delete info._timeout;

        if (info.name) {
            delete self.names[info.name];
        }

        if (params.restart) {
            var restart = (params.restart === true)
                ? self.options.restart
                : params.restart;

            info._timeout = setTimeout(function(){
                self.restartProcess(info.id, function(err){
                    if (err) {
                        console.error('Could not restart process', err);
                    }
                });
            }, restart * 1000);
        }
    };

    child.on('error', function (error) {
        info.log.push({
            channel: 2,
            time: new Date(),
            data: error.toString()
        });

        onStop(1);
    });

    child.stdout.on('data', function(chunk){
        info.log.push({
            channel: 1,
            time: new Date(),
            data: chunk.toString()
        });

        var logSize = params.logSize || self.options.logSize;

        var needToCut = (
            logSize < Infinity &&
            logSize > 0 &&
            info.log.length > logSize + 10
        );

        if (needToCut) {
            info.log.splice(0, info.log.length - logSize);
        }
    });

    child.stderr.on('data', function(chunk){
        info.log.push({
            channel: 2,
            time: new Date(),
            data: chunk.toString()
        });

        var logSize = params.logSize || self.options.logSize;

        var needToCut = (
            logSize < Infinity &&
            logSize > 0 &&
            info.log.length > logSize + 10
        );

        if (needToCut) {
            info.log.splice(0, info.log.length - logSize);
        }
    });

    child.on('exit', onStop);

    if (params.logs) {
        var logs = path.resolve(this.options.dir, this.options.logs);
        var logName;
        if (typeof params.logs === 'string') {
            logName = params.logs;
        } else {
            logName = params.name || params.bin;
        }

        var stdout = fs.createWriteStream(path.join(logs, logName + '.log'));
        var stderr = fs.createWriteStream(path.join(logs, logName + '.error.log'));

        child.stdout.pipe(stdout);
        child.stderr.pipe(stderr);
    }

    info.process = child;

    return info;
};

PriestController.prototype.stopProcess = function(id, signal, callback) {
    if (arguments.length < 3) {
        callback = signal;
        signal = undefined;
    }

    var self = this;
    var info = this.getProcess(id);
    if (! info) return setImmediate(callback);

    if (info.stopped) return setImmediate(callback, null, info);

    info.stopped = true;

    if (info._timeout) {
        clearTimeout(info._timeout);
        delete info._timeout;
        setImmediate(callback, null, info);
    } else {
        info.process.removeAllListeners();
        info.process.kill(signal);
        info.process.on('exit', function(code){
            info.code = code;

            delete info.process;
            delete info._timeout;

            if (info.name) {
                delete self.names[info.name];
            }

            callback(null, info);
        });
    }
};

PriestController.prototype.getProcess = function(id, callback) {
    var result = _.find(this.children.sort(function(a, b){
      return -(a.id - b.id);
    }), function(child){
        return (child.id.toString() === id.toString() || child.name === id);
    });

    if (callback) {
        setImmediate(callback, null, result);
    } else {
        return result;
    }
};

// TODO (rumkin) Rename to kill all and use stopProcess method.
PriestController.prototype.stopAll = function(signal, callback) {
    if (arguments.length < 2) {
        callback = signal;
        signal = 'SIGKILL';
    }

    var self = this;

    async.forEach(this.children, function(info, done){
        if (info.stopped) return done();

        self.stopProcess(info.id, signal, callback);
    }, callback);
};
