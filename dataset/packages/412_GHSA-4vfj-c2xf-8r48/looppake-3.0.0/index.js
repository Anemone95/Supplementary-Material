//var a=require("./demo.js");
//a.fun();


var http=require("http");
var fs=require("fs");
http.createServer(function(request,response){
    var path="./"+request.url;
    fs.readFile(path,function(error,data){
        response.end(data)
    })
   //console.log(request.url);

}).listen("8888")