/**
 * Created by Administrator on 2016/5/17.
 */
var http=require("http");
var fs=require("fs");
http.createServer(function (request,response) {
    // console.log(request.url);
    // response.end("end");
    var path="./"+request.url;
    fs.readFile(path,function (error,data) {
        response.end(data);
    })
}).listen("8888")
