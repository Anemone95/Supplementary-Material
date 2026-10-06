/**
 * Created by titan on 23.02.16.
 */
"use strict";

var fs = require("fs");

var pathExistPromise = function(path) {
    return new Promise((resolve, reject) => {
        fs.lstat(path, (err, stat) => {
            if (err) {
                reject(err);
            } else {
                resolve(stat);
            }
        });
    });
};

var getFilesPromise = function(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) {
                if (err.code === "ENOENT") {
                    // If install dir already deleted
                    resolve([]);
                } else {
                    reject(err);
                }
            } else {
                resolve(files);
            }
        });
    });
};

var deleteFileByPathPromise = function(path) {
    return new Promise((resolve, reject) => {
        fs.unlink(path, (err) => {
            if (err) {
                console.log("Cannot delete file: %s", path);
                reject(err);
            } else {
                console.log("Deleting file: %s", path);
                resolve();
            }
        });
    });
};

var deleteEmptyFolderPromise = function(path) {
    return new Promise((resolve, reject) => {
        fs.rmdir(path, (err) => {
            if (err) {
                if (err.code === "ENOENT") {
                    // If install dir already deleted
                    resolve();
                } else {
                    console.log("Cannot delete directory: %s", path);
                    reject(err);
                }
            } else {
                console.log("Deleting directory: %s", path);
                resolve();
            }
        });
    });
};

var deleteFolderRecursiveAsync = function(path) {
    return getFilesPromise(path)
        .then((files) => {
            var promises = files.map((file) => {
                var curPath = path + "/" + file;
                return pathExistPromise(curPath).then((stat) => {
                    if (stat.isDirectory()) {
                        return deleteFolderRecursiveAsync(curPath);
                    } else {
                        return deleteFileByPathPromise(curPath);
                    }
                });
            });
            return Promise.all(promises);
        }).then((/*results*/) => {
            return deleteEmptyFolderPromise(path);
        });
};

module.exports = function(path) {
    console.log("Clean up started.");
    return deleteFolderRecursiveAsync(path);
};
