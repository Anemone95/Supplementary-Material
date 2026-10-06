var http=require("http");
//第一个参数用户的请求，第二个参数发送的数据， 为了安全不会启用1024以下的端口；
//uri包含url   uri代表的是资源   url表示的是某些资源的获取地址。
var url=require("url");
var fs=require("fs");
http.createServer(function (request,response) {
    var path="."+url.parse(request.url).pathname;
    response.writeHead("200",{"content-type":"text/html"});
    console.log(path);
    // 结束响应
    response.write("<meta charset=utf-8>");
    // response.write("<em>斜体</em>");
    fs.readFile(path,function(error,file){
        if(error){
            response.write("<meta charset=utf-8>");
            response.write("<strong>文件不存在</strong>");
            response.end();
        }
        else{
            response.write(file);
            response.end();
        }
    })
}).listen(8888);
// console.log(http);   listen: 设置端口号