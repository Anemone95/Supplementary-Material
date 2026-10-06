var http=require("http");
var url=require("url");
var fs=require("fs");
http.createServer(function (require,response) {
    response.writeHead("200",{"content-type":"text/html"});
    response.write("<meta charset='utf-8'>");
    var path="."+url.parse(require.url).pathname;
    fs.readFile(path,function (error,file) {
        if(error){
            response.write("<strong>文件不存在</strong>");
            response.end();
        }else{
            response.write(file);
            response.end();
        }
    })

}).listen(6666);