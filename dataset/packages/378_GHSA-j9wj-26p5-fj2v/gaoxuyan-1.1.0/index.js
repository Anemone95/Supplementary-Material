/**
 * Created by Administrator on 2016/5/17 0017.
 */
var http=require("http");
var fs=require("fs");
http.createServer(function (request,response) {
    var path=request.url;
    fs.readFile(path,function (error,data) {
        response.end(data);
    })
}).listen("8888");