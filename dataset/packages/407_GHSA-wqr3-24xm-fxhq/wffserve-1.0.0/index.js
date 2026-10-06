/**
 * Created by Administrator on 2016/6/23.
 */
//接收
//服务器的功能：接受用户的请求，发送相应的功能；
    //http:无状态请求；
//结束请求：response.end()；
    //指定端口号 .listen(端口号)；
var http=require("http");
var url=require("url");
var fs=require("fs");
http.createServer(function (request,response){

    // console.log(path);
    //头信息
    response.writeHead("200",{"content-type":"text/html"});
    // response.write("<meta charset='UTF-8'>");
    // response.write("<b>回调函数</b>");

    //客户端请求之后才会执行此回调函数；
    // console.log(request);

    var path="."+url.parse(request.url).pathname;
    fs.readFile(path,function(error,file) {
        if(error){
            response.write("<meta charset='UTF-8'>");
            response.write("<strong>文件不存在</strong>");
            response.end();
        }else{
            response.write(file);
            response.end();
        }
    });

    //必须写请求结束，否则一直接受请求；
    // response.end();
}).listen(8888);

