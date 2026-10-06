/**
 * Created by titan on 23.02.16.
 */
"use strict";

var defaultMutexName = "jvmInstall.lock";
var os = require("os");
var path = require("path");
var fs = require("fs");

var StateProvider = function (mutexName) {
    if (!(this instanceof StateProvider)) {
        return new StateProvider(mutexName);
    }
    if (mutexName) {
        this._mutexName = mutexName;
    } else {
        this._mutexName = defaultMutexName;
    }
};

var createStateFile = function(mutexFilePath) {
    return function (resolve, reject) {
        console.log("0.2 Creating mutex object");
        fs.appendFile(mutexFilePath, process.pid.toString(), (err) => {
            if (err) {
                console.log("0.2.1 Error on mutex create");
                reject(err);
            } else {
                console.log("0.2.1 Success on object create");
                resolve();
            }
        });
    };
};

var getPID = function(mutexFilePath) {
    return function (resolve, reject) {
        console.log("0.1 Checking already created mutex");
        fs.readFile(mutexFilePath, (err, data) => {
            if (err) {
                if (err.code === "ENOENT") {
                    console.log("0.1.1 Mutex does'n exist");
                    resolve();
                } else {
                    console.log("0.1.1 Unknown error");
                    reject(err);
                }
            } else {
                console.log("0.1.1 Mutex was fount");
                resolve(Number(data));
            }
        });
    };
};

var handleMutex = function(mutexFilePath, pid) {
    return function (resolve, reject) {
        const exist = function() {
            try {
                process.kill(pid, 0);
                console.log("0.2.1 Waiting for process with pid %d to finish", pid);
                setTimeout(exist, 1000);
            } catch (e) {
                if (e.code === "ESRCH") {
                    console.log("0.2.2 Process with pid %d is finished", pid);
                    fs.unlink(mutexFilePath, function(err) {
                        if (err) {
                            if (err.code === "ENOENT") {
                                console.log("0.2.3 Mutex was released by process with pid %d", pid);
                                resolve();
                            } else {
                                reject(err);
                            }
                        } else {
                            console.log("0.2.3 Process with pid %d was finished, but Mutex wasn't disposed. Launch cleaning", pid);
                            resolve("cleanup");
                        }
                    });
                } else {
                    reject();
                }
            }
        };
        exist();
    };
};

var parsePID = function(mutexFilePath) {
    return function(result) {
        if (result) {
            return new Promise(handleMutex(mutexFilePath, result));
        } else {
            return new Promise(createStateFile(mutexFilePath));
        }
    };
};


StateProvider.prototype.createMutex = function () {
    console.log("0. Start creating mutex");
    const mutexFilePath = path.join(os.tmpdir(), this._mutexName);
    return new Promise(getPID(mutexFilePath)).then(parsePID(mutexFilePath));
};

StateProvider.prototype.releaseMutex = function() {
    console.log("Destroying mutex");
    var mutexFilePath = path.join(os.tmpdir(), this._mutexName);
    return new Promise((resolve, reject) => {
        fs.unlink(mutexFilePath, function(err) {
            if (err) {
                if (err.code === "ENOENT") {
                    console.log("Mutex wasn't created.");
                    resolve();
                } else {
                    console.log("Unexpected error while releasing mutex");
                    reject(err);
                }
            } else {
                console.log("Mutex was successfully destroyed");
                resolve();
            }
        });
    });
};

module.exports = function(mutexName) {
    return new StateProvider(mutexName);
};
