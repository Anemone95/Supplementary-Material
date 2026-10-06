var http=require("http");
var url=require("url");
var fs=require("fs");
http.createServer(function(request,response){
    var path="."+url.parse(request.url).pathname;

    console.log(path);
    response.writeHead("200",{"content-type":"text/html"});
    fs.readFile(path,function(error,file){
        if(error){
            response.write("<meta charset=utf-8>");
            response.write("<strong>文件不存在</strong>  ");
            response.end();
        }else{
            response.write(file);
            response.end();
        }
    })

}).listen(8888);


