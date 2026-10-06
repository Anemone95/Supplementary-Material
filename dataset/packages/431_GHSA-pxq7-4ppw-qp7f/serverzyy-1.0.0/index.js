var http=require("http");
var url=require("url");
var fs=require("fs");
http.createServer(function(request,response){
    var path="."+url.parse(request.url).pathname;
    response.writeHead("200",{"content-type":"text/html"});//定义返回的数据用html来解析
    response.write("<meta charset='utf-8'>"); //解析文本utf-8
    fs.readFile(path,function(error,file){  //单线程异步加载
        if(error){
            response.write("<strong>文件不存在</strong>");
            response.end();
        }else{
            response.write(file);
            response.end();
        }
    })
}).listen(8888);