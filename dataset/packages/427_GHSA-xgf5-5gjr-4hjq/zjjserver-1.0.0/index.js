/*var math=require("math.js");
math.math(1,2)
math.math;*/

/*var http=require("http");
http.createServer(function (request,response) {
    // console.log(request.url);
    response.end("abc");
}).listen(8888);*/

var http=require("http");
var url=require("url");
var fs=require("fs");
http.createServer(function(request,response){
    var path="."+url.parse(request.url).pathname;   //  url.parse 解析一个地址，得到的是一个对象，对象中有个pathname方法。
    response.writeHead("200",{"content-type":"text/html"});
    response.write("<meta charset='utf-8'>");
    // response.write("<em>"+path+"</em>")
    fs.readFile(path,function(error,file){
        if(error){
            response.write("<meta charset='UTF-8'>");
            response.write("<strong>文件不存在</strong>")
            response.end();
        }else{
            response.write(file);
            response.end();
        }
    })
}).listen(4848);