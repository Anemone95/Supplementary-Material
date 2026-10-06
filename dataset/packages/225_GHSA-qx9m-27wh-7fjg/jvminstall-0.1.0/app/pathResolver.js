/**
 * Created by titan on 23.02.16.
 */
"use strict";

var path = require("path");
var variableName = "installpath";

module.exports = function(arrayVariables) {
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
        const homeRootDirectory = process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"];
        const binDirName = ".jvm";
        result = path.join(homeRootDirectory, binDirName);
    }
    return result;
};
