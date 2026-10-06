/**
 * Created by titan on 23.02.16.
 */
"use strict";

var fs = require("fs");
var path = require("path");

var setPermissions = function (path, attr, index) {
    // https://unix.stackexchange.com/questions/14705/the-zip-formats-external-file-attribute
    var zipPermissions = (attr & 0x1FF0000) >> 16;
    var other = ((zipPermissions & (1 << 0)) ? 1 : 0) + ((zipPermissions & (1 << 1)) ? 2 : 0) + ((zipPermissions & (1 << 2)) ? 4 : 0);
    var group = ((zipPermissions & (1 << 3)) ? 10 : 0) + ((zipPermissions & (1 << 4)) ? 20 : 0) + ((zipPermissions & (1 << 5)) ? 40 : 0);
    var owner = ((zipPermissions & (1 << 6)) ? 100 : 0) + ((zipPermissions & (1 << 7)) ? 200 : 0) + ((zipPermissions & (1 << 8)) ? 400 : 0);

    var unixPermissions = "0" + (other + group + owner).toString();
    console.log("3.1.%d.1 Setting permissions %s to file %s", index, unixPermissions, path);
    return new Promise((resolve, reject) => {
        fs.chmod(path, unixPermissions, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    })
};

var createDirectoryPromise = function (path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(path);
            }
        });
    });
};

var unpackZipFile = function (jvmPathToZipFile, binDir) {
    var AdmZip = require("adm-zip");
    var zip = new AdmZip(jvmPathToZipFile);
    var zipEntries = zip.getEntries();

    var rootDirectory = zipEntries[0].entryName;
    var separator = rootDirectory.charAt(rootDirectory.length - 1);
    zipEntries = zipEntries.slice(1);

    var promise = new Promise((resolve/*, reject*/) => {
        console.log("3. Unpacking zip file data to %s", binDir);
        zip.extractEntryTo(rootDirectory, binDir, false, true);
        console.log("3.0 Unpack was finished.");
        resolve();
    })
        .then(() => {
            if (process.platform !== "win32") {
                return zipEntries.map(function (entry, index) {
                    var entryName = entry.entryName;
                    var targetPath = binDir;

                    var parts = entryName.split(separator);
                    for (var i = 1; i < parts.length; ++i) {
                        targetPath = path.join(targetPath, parts[i]);
                    }
                    return setPermissions(targetPath, entry.attr, index);
                });
            } else {
                return [];
            }
        }).then((promises) => {
            return Promise.all(promises);
        }).then(() => {
            return new Promise((resolve, reject) => {
                fs.unlink(jvmPathToZipFile, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("3.3 Zip file was deleted.");
                        resolve();
                    }
                })
            })
        });
};

module.exports = function (jvmPathToZipFile, binDir) {
    return unpackZipFile(jvmPathToZipFile, binDir);
};
