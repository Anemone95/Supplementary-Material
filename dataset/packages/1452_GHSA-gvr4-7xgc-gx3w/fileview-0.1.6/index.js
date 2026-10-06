#!/usr/bin/env node

var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    PATH = require("path"),
    PS = process;

const PORT = 8088;

var args = (function () {
    //Process args
    var args = PS.argv,
        reg = /^-+(\w+)/ig,
        rls = {};

    if (args) {
        for (var i = 0; i < args.length; i++) {
            var key = args[i],
                value = args[i + 1];

            if (reg.test(key)) {
                rls[RegExp.$1] = value || "";
            }
        }
    }

    if (typeof rls.h == "string") {
        rls.help = 1;
    }
    if (typeof rls.help == "string") {
        rls.help = 1;
    }
    if (!rls.p) {
        rls.p = PS.env.PWD;
    }
    return rls;
}());

var responseByPageTempl = function (req, res, back, mode) {
    // Function responseByPageTempl : page template response
    // @param {http} res  http Response
    // @param {String} mode html/json/no(no found)
    var header = {
        html: {
            "Content-Type": "text/html"
        },
        json: {
            "Content-Type": "text/json"
        }
    };

    switch (mode) {
        case "html":
            res.writeHead(200, header.html);
            back(req, res);
            break;
        case "json":
            res.writeHead(200, header.json);
            break;
        case "no":
            res.writeHead(404, header.html);
            res.write("<style type='text/css'>h1{text-align:center}</style>")
            res.write("<h1>No found!</h1>");
            res.end();
            break;
        default:
            res.writeHead(200, header.html);
            back(req, res);
            break;
    }


}

var fileReader = function (req, res, path, dirRender, fileRender) {
    // Function fileReader
    // @param req {http}             request
    // @param res {http}             response
    // @param path {String}          file path
    // @param dirRender {Function}   directory Render
    // @param fileRender {Function}  file Render

    path = PATH.resolve(path);

    var errorMsg = ["file or dir is not exist."];
    // Is Exist
    fs.exists(path, (exists) => {
        if (exists) {
            var fsState = fs.lstatSync(path);
            if (fsState.isFile()) {
                // file

            } else {
                // dir
                fs.readdir(path, dirRender);
            }
        } else {
            // throw new Error();
            // no found page
            responseByPageTempl(req, res, "", "no")
        }
    });
}

var router = function (url) {
    // Function router
    // @param {String} url
}

var argResponse = function (args) {
    // Function argResponse
    // @param  {json} args
    var argProcess = {
            p: function (value) {

            }
        },
        help = function () {
            console.log("==========================================");
            console.log("Usage: fileview [options]");
            console.log("");
            console.log("Options:");
            console.log("   -p,                 file path");
            console.log("   -P                  http port");
            console.log("   -h/-help/--help     output usage information");
            console.log("");
            console.log("Examples:");
            console.log("$ fileview -p /projects/example/ -P 8080");
            console.log("==========================================");
        },
        run = function (args) {


            // CREATE SERVER
            http.createServer(function (req, res) {

                // router(req.url)

                var reqPath = PATH.resolve(args.p + (req.url || ""));

                fileReader(
                    req,
                    res,
                    reqPath,
                    function (err, data) {
                        //Function directory render

                        if (data) {

                            responseByPageTempl(req, res, function (req, res) {
                                var url = req.url,
                                    url = url == "/" ? url : (url + "/");

                                res.write("<style type='text/css'>div,span,ul,li,ol,dt,dd,table,tr,td,strong,i,button,from,input,textarea{padding:0;margin:0;border-spacing:0;font-size:inherit;font-family:inherit;color:inherit}h1{fonts-szie:32px}h2{fonts-szie:24px}h3,h4,h5,h6{fonts-szie:18px}body{font-family:'Open Sans',sans-serif;font-size:14px;color:#222}a{text-decoration:none;color:#222}a:hover{color:#06f;color:#06f}.clear:before,.clear:after{content:'';display:table;clear:both}.list li{margin:2px 0;padding:0 10px;line-height:25px;list-style:none;word-break:break-all}.list .is-file{border-left:20px}.page{padding:10px 20px}.page-path{line-height:30px;border-bottom:1px solid #eee}.table-file{padding:0;margin:0;width:100%}.table-file thead>tr{background-color:#eee}.table-file tr>td.size,.table-file tr>td.date,.table-file thead>tr>td{padding:8px 4px}.table-file tr>td{text-align:left}.table-file tr>td.date{width:170px;color:#999}.table-file tr>td.size{width:70px}.table-file tr+tr>td{border-top:1px solid #eee}.table-file tr:hover{background-color:#f4f5f7}.table-file tr>td>a{display:block;padding:8px 16px}.table-file tr>td>a:before{content:'';display:inline-block;margin-right:10px;width:16px;height:16px;vertical-align:middle}.table-file tr>td>a.type-dir:before{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEISURBVDiNrZGxSgNREEXPCw/S7EZIZWelYqFlvsDKQhC0ssoPmCIfYG1hoWCXP7C3Si+ksBJEtBHE2JhgdgvNm5lnIQYkuLAbb3/vnHvHxRjpdbYugX1+62qpaXsHx7dTCuRixPU6m7a2voFzNQBijAxfnsnzLAA2Z4JYr/v+4cnNrru+2DlrrG4fNZdXig7NafT6xOShf+6DWjtJEj7eh6UCkiThTa3tg2gaPvNSZgCVKUE09aKGSSgdACBq+CCKVgwIongRw6TwU38TyA+BLkAQRCtvMKtQdYNZhaobfBPoAgRq/7CBig3G41GrkaalzJMsQ8UGPljs3t0/nkZolQlwMKBW634BV/GiU2qcKJgAAAAASUVORK5CYII=)}.table-file tr>td>a.type-file:before{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFMSURBVDiNlZA9isJAFMd/hgcWFhZRJFNoLLZ0a7XfStDLrLfwMAqewEILu6xV0lgpgieYj2SbTdhs4qIPhhmG/+drHI/HD2vtKk3Td14Yz/MiEfls7Ha7KAzDUa/Xw/O8p8hpmnK73Tifz1+itR75vo/W+pUA+L5PHMcjcc7hnHuJDJDzxFpLlmUArNdrut1uAVJKcblcSm+lFMPhEABrLWKMKQQWi0XFKQzDyjvHG2MQ51zxsdlsAIoUSimAwjlPM51OixqlCvP5vLbvYDAo3TneWlsW2O/3JadHu8irVAQmk0nJqS7FvwkOh0OJdL/fAeh0OgAEQQDwOMF4PK7dwd95mGC73VbcrtcrQRDU1ioEjDGICLPZrALq9/sl199kay2eiMRRFKG1Jsuyp47WmiiKEJFYWq3WMkmS1el0entqAT/TbDaTdru9/AbO//fVB3FwJQAAAABJRU5ErkJggg==)}</style>")
                                res.write("<div class='page'>");
                                res.write("     <div class='page-path'><strong>Path: </strong><span>" + url + "</span></div>");
                                res.write("     <table class='table-file'>");
                                res.write("         <thead><tr><td class='name'>Name</td><td class='date'>Date</td><td class='size'>Size</td></tr></thead>");
                                res.write("         <tbody>");

                                for (var i = 0; i < data.length; i++) {
                                    var fileObj = data[i],
                                        currPath = PATH.resolve(reqPath, fileObj);

                                    var OBJState = fs.lstatSync(currPath),
                                        obj = {
                                            size: OBJState.size,
                                            isFile: OBJState.isFile(),
                                            path: url + fileObj,
                                            name: fileObj,
                                            time: new Date(OBJState.mtime).toLocaleString()
                                        };
                                    res.write("<tr><td class='name'><a class=type-" + (obj.isFile ? "file" : "dir") + " href=" + obj.path + ">" + obj.name + "</a></td><td class='date'>" + obj.time + "</td><td class='size'>" + obj.size + "</td></tr>");
                                }

                                res.write("          </tbody>");
                                res.write("     </table>");
                                res.write("</div>");
                                res.end();

                            });
                        }
                    });

            }).listen(PORT);
            console.log('Server running at http://127.0.0.1:' + PORT + '/');

        };

    // PROCESS
    if (args) {

        if (args.help) {
            help();
        } else {
            for (var i in args) {
                var ap = argProcess[i];
                ap && ap(args[i]);
            }
            run(args);
        }
    }
}

// RUN AREA
argResponse(args);