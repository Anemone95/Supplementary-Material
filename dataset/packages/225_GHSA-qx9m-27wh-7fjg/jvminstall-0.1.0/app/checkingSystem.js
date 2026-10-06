/**
 * Created by titan on 23.02.16.
 */
"use strict";

const javaExe = "java";

module.exports = function() {
    return new Promise((resolve, reject) => {
        console.log("1. Searching for jvm installed on this computer.");
        const spawn = require("child_process").spawn;
        const java = spawn(javaExe, ["-version"]);

        java.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
        });

        java.stderr.on("data", (data) => {
            console.log(`stderr: ${data}`);
        });

        java.on("close", (code) => {
            if (code === 0) {
                console.log("1.1 JavaVM was found on this system");
                reject();
            } else {
                resolve();
            }
        });

        java.on("error", (err) => {
            if (err.code === "ENOENT") {
                console.log("1.1 JavaVM is not installed on this system");
                resolve();
            } else {
                reject(err);
            }
        });
    });
};
