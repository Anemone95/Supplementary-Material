/**
 * Created by titan on 18.02.2016.
 */
"use strict";

console.log("JVM install script is started.");

// 0
var stateProvider = require("./app/stateProvider")();
// 1
var checkingSystem = require("./app/checkingSystem");
// 2
const binDir = require("./app/pathResolver")(process.argv);
var cleanUp = require("./app/cleanUp");
// 3
var creatingInstallDir = require("./app/creatingInstallDir");
// 4
var osBasedConfiguration = require("./app/osBasedConfig");
var jvmCommonFileName = "jvm.zip";
var jvmPathToZipFile;
var osBasedConfig;
// 5
var downloadingPackage = require("./app/downloadingPackage");
// 6
var unpackZip = require("./app/unpackZip");

var getMutex = function () {
    return stateProvider.createMutex()
        .then(function (result) {
            if (result === "cleanup") {
                return cleanUp(binDir).then(getMutex);
            }
        });
};

var promise = getMutex()
    .then(checkingSystem)
    .then(() => creatingInstallDir(binDir))
    .then(osBasedConfiguration)
    .then(function (result) {
        osBasedConfig = result;
        jvmPathToZipFile = require("path").join(binDir, jvmCommonFileName);
    })
    .then(() => downloadingPackage(jvmPathToZipFile, osBasedConfig))
    .then(() => unpackZip(jvmPathToZipFile, binDir));

promise.then(function () {
    console.log("Script finished.");
}, function (error) {
    if (error) {
        console.error("Critical error.");
        console.error(error);
        return cleanUp(binDir);
    }
}).then(() => stateProvider.releaseMutex())
    .then(function () {
        console.log("Script exiting.");
        process.exit(0);
    })
    .catch(function (error) {
    console.error(error);
    process.exit(-1);
});
