/**
 * Created by titan on 23.02.16.
 */
"use strict";

const defaultConfigPath = "./../config.json";
var variableName = "configpath";

var getConfigFilePath = function(arrayVariables) {
    var result = null;
    if (arrayVariables instanceof Array) {
        arrayVariables.forEach(function(variable) {
            var parts = variable.split("=");
            if (parts.length === 2 && parts[0] === variableName) {
                result = parts[1];
            }
        });
    }
    if (result === null) {
        result = defaultConfigPath;
    }
    return result;
};

module.exports = function(arrayVariables) {
    const path = getConfigFilePath(arrayVariables);
    return new Promise((resolve, reject) => {
        var config = require(path);
        var result = config.jvmArchive[process.platform];
        if (typeof result === "undefined") {
            console.error("2.2 Config wasn't set for this (%s) platform.", process.platform);
            reject("No cofiguration for current platform");
        } else {
            console.log("2.2 Configuration was found. Downloading file: %s", result.link);
            resolve(result);
        }
    });
};
