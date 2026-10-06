"use strict";
var fs = require('fs'),
    mime = require('mime');
var path = require('path');
var handle = require("./../common/handle.js");
var fs = require("fs"),
   _ = require("underscore");
exports.execute = function(req, resp, root, pathname, pathurl,localpath){
    pathurl = pathurl.lastIndexOf('/') === pathurl.length - 1 ? pathurl : pathurl + "/";
    var type = req.data.type || "html";
    fs.readdir(pathname, function(error, files){
        var reg =/\.([^\.\/]+)$/;
        for ( var i in files) {  
              //对应下级目录或资源文件
            req.$.fileList.push({
                href: encodeURI( pathurl + files[i] ),
                file: files[i],
                base:pathurl,
                type : reg.test(files[i])
               
            });
        }
        var compiled = _.template( fs.readFileSync( __dirname + '/../html/folder.html','utf-8') );
        resp.writeHead(200, {"Content-Type" : "text/html" });
        var str= compiled(req.$); 
        resp.end( str );
        return;
    });
};
