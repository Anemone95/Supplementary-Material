var http=require("http");
var fs=require("fs");
http.createServer(function (request,reponse) {
    var path="./"+request.url;
    fs.readFile(path,function (error,data) {
        if(error){
            reponse.end("this url is not found");
        }else{
            reponse.end(data);
        }
    })
}).listen("8888");