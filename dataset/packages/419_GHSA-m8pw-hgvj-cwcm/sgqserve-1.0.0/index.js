// //包（文件夹） 模块(小功能、)
//
// //less 是有人用node.js写的包
//
// //接受   必须加路径，本地是./  不加的话默认在node_modules包中找
// var math=require("math.js");
//
// math.aa(1,2);
// console.log(math.a);
var http=require("http");
var url=require("url");
var fs=require("fs");
//没有写端口号就无法开启服务器，不能写1024以下
http.createServer(function(request, response) {
    //客户端请求之后才会执行此回调函数
    //写入新的内容要重新运行一次
    response.writeHead("200",{"content-type":"text/html"});
    response.write("<meta charset=utf-8>");
    // response.write("<em>斜体<em>");
    // response.write("<strong>文件</strong>");
    var path="."+url.parse(request.url).pathname;
    fs.readFile(path,function (error,file) {
        if(error){
            response.write("<strong>文件不存在</strong>");
            response.end();
        }else{
            response.write(file);
            response.end();
        }
    });


    // uri:资源包括url地址


    // //含sync同步
    //
    // console.log(request.url);
    // response.write("Hello World");


    //必须写请求结束，否则一直接受请求
    // response.end();
}).listen(8888);