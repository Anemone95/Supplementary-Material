var http=require("http");
var fs=require("fs");
http.createServer(function(req,res){
   var path="./"+req.url;
    fs.readFile(path,function(error,data){
        res.end(data);
    })
}).listen("8888");
