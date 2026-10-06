
// var math=require("math.js");
// console.log(math.abc);
// math.math(1,4);
//服务器功能
//接收用户请求、发送请求
var http=require("http");
var url=require("url");
var fs=require("fs");

http.createServer(function (request,response) {
    var path="."+url.parse(request.url).pathname;
    console.log(path);

    response.writeHead("200",{"content-type":"text/html"});
    //乱码处理
    // response.write("<meta charset=utf-8>");
    // response.write("<em>斜体</em>");
    fs.readFile(path,function (error,file) {
        if(error){
            response.write("<meta charset=utf-8>");
            response.write("<strong>文件不存在</strong>");
            response.end();
        }else{
            response.write(file);
            response.end();
        }
    })

}).listen(8888);