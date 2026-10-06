/*模块
* 包
*
* */
 var http=require("http");
 var path=require("path");
 var fs=require("fs");
 http.createServer(function(request,response){
     var relpath=path.join("html",request.url);
     fs.exists(relpath,function(error){
         if(!error){
             response.end("this file is not find");
         }else{
             fs.readFile(relpath,function(err,file){
                 response.write(file);
                 response.end();
             })
         }
     })
 }).listen("8888");