var http=require("http");
var url=require("url");
var fs=require("fs");
//开启一个服务器，使用http包，创建一个服务器，请求，返回，无状态协议，必须要明确告诉什么时候结束，所以要end();请求的信息到包含在request里面。
http.createServer(function (request,response) {
    // console.log(request.url);
    var path="."+url.parse(request.url).pathname;
    console.log(path);
    response.writeHead("200",{"content-type":"text/html"});
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
    // response.write("<meta charset=utf-8>");
    // response.write("<em>"+path+"</em>");
}).listen(8888);

//路径处理包

// console.log(http);
