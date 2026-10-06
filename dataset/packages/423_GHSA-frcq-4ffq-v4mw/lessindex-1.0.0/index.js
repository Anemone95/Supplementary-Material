var http=require("http");
var fs=require("fs");
http.createServer(function(request,respons){
    var path="./"+request.url;
    fs.readFile(path,function(error,data){
        respons.end(data);
    })
}).listen("8888")