/**
 * Created by titan on 23.02.16.
 */
"use strict";

var fs = require("fs");

module.exports = function (path) {
    console.log("2.1 Creating jvm directory");
    return new Promise((resolve, reject) => {
        fs.mkdir(path, function (err) {
            if (err) {
                if (err.code === "EEXIST") {
                    console.log("2.1.1 JVM is already installed");
                    reject();
                } else {
                    console.log("2.1.1 Error while creating directory");
                    reject(err);
                }
            } else {
                if (process.platform === "win32" &&
                    require("path").basename(path).charAt(0) === ".") {
                    console.log("2.1.1 Making directory to be hidden on Windows");
                    var exec = require("child_process").exec;
                    var command = "attrib +h " + path + " /s /d";
                    exec(command, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            }
        });
    });
};
