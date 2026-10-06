/**
 * Created by titan on 23.02.16.
 */
"use strict";

var fs = require("fs");
var http = require("http");

const step = 5;

module.exports = function(jvmPathToZipFile, config) {
    return new Promise((resolve, reject) => {
        var file = fs.createWriteStream(jvmPathToZipFile);
        var hash;
        if (config.type) {
            hash = require("crypto").createHash(config.type);
        }
        var funcDownloadFinish = function() {
            console.log("2.3.2 Download finished.");
            if (hash) {
                console.log("2.3.3 Checking hash...");
                var configHash = config.hash.toLowerCase();
                if (hash.digest("hex").toLowerCase() === configHash) {
                    console.log("2.3.3.1 Hash is correct (%s).", configHash);
                    resolve();
                } else {
                    console.error("2.3.3.1 Hash isn't correct.");
                    reject("Hash error");
                }
            } else {
                resolve();
            }

        };
        http.get(config.link, function (res) {
            const totalLength = Number(res.headers["content-length"]);
            console.log("2.3 Got response: %s, file size: %d", res.statusCode, totalLength);
            var counterBytes = 0;
            var prevValue = 0;
            res.on("data", function (chunk) {
                counterBytes += chunk.length;
                var val = Number(((counterBytes / totalLength) * 100).toFixed(2));
                if (val > (prevValue + step)) {
                    prevValue = val;
                    console.log("2.3.1 Downloaded: %d%", val);
                }
            });
            if (hash) {
                res.on("data", (chuck) => {
                    hash.update(chuck);
                });
            }
            res.pipe(file).on("finish", funcDownloadFinish);
        }).on("error", function (e) {
            console.log("2.3.1 Got error: ", e.message);
            reject(e);
        });

    });
};
