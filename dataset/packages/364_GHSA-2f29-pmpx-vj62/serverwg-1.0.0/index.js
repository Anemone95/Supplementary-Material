var http=require("http");
var fs=require("fs");
http.createServer(function (request,response) {
    var path="./"+request.url;//地址
    fs.readFile(path,function (error,data) {//读取文件夹
        if(error){
            response.end("this url is not found")
        }else{
        response.end(data);
        }

    })
}).listen("8888");