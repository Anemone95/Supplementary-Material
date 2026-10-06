/// <reference path="typings/node/node.d.ts" />
var http = require("http");
var zlib = require("zlib");
var fs = require("fs");
var cdn = [
    {
        url: "http://cdn-na.infragistics.com/igniteui/latest/css/themes/infragistics/infragistics.theme.css",
        filename: "infragistics.theme.css"
    },
    {
        url: "http://cdn-na.infragistics.com/igniteui/latest/css/structure/infragistics.css",
        filename: "infragistics.css"
    },
    {
        url: "http://cdn-na.infragistics.com/igniteui/latest/js/infragistics.core.js",
        filename: "infragistics.core.js"
    },
    {
        url: "http://cdn-na.infragistics.com/igniteui/latest/js/infragistics.dv.js",
        filename: "infragistics.dv.js"
    },
    {
        url: "http://cdn-na.infragistics.com/igniteui/latest/js/infragistics.lob.js",
        filename: "infragistics.lob.js"
    }
];

fs.mkdir('js', function () {
    fs.mkdir('css', function () {
        cdn.forEach(function (link) {
            http.get(link.url, function (res) {
                var buffer = [];
                var gunzip = zlib.createGunzip();
                res.pipe(gunzip);
                gunzip.on('data', function (data) {
                    //Decompression chunk ready, add it to the buffer
                    buffer.push(data.toString());
                }).on("end", function () {
                    //Response and decompression complete, join the buffer and return
                    var output = buffer.join("");
                    if (link.filename.split(".").pop() === "css")
                        fs.writeFile('css/' + link.filename, output);
                    else
                        fs.writeFile('js/' + link.filename, output);
                }).on("error", function (err) {
                    console.log(err);
                });
            });
        });
    });
});
        
