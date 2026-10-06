// var   a=require("node.js");
// a.fun();
//

var http=require("http");
var fs=require("fs");
http.createServer(function (request,response) {
        //console.log("request.url")
    //response.end("end")
    var path="."+request.url;
    fs.readFile(path,function (error,data) {
        if(error){
            response.end("this url is no found");
        }else{
            response.end(data)
        }
    })
}).listen("8888");

