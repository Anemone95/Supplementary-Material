
//内置的http模块提供了http服务器和客户端功能
var http = require("http") ;

//内置的path模块提供了与文件系统路径想关的功能
var fs = require("fs") ;

//内置的http模块提供了http服务器和客户端功能
var path = require("path") ;

//附加的mime模块有根据文件扩展名得出mime类型的能力
var mime = require("mime") ;

//用来缓存文件内容对象
var cache = {} ;

//创建http服务器

var server = http.createServer(function( request , response ){
    var filePath = false ;
    if(request.url == "/"){
        //返回默认的html文件
        filePath = "public/index.html" ;
    }else{
        //将url路径转换为文件的相对路径
        filePath = "public" + request.url ;
    }

    var absPath = "./" + filePath ;
    //返回静态文件
    serverStatic(response,cache,absPath);
}).listen(1212,function(){
    console.log("已启动");
})


//加载定制的node模块
var  chatServer = require("./lib/chat_server");
//启动socket服务器
chatServer.listen(server);



//文件不存在时返回404错误
function send404( response ){
    response.writeHead(404,{"Content-Type" : "text/plain"});

    response.write("err 404");
    response.end()
}

//提供文件数据服务
function sendFile( response , filePath , fileContents ){
    response.writeHead(200,{"Content-Type" : mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}


/*
 *   提供静态文件服务
 *   确定文件是否缓存，如果是返回他，如果文件还没有缓存，则从硬盘读取他，如果文件不存在，返回http 404错误响应页面
 */
function serverStatic ( response , cache , absPath){
    //检查文件是否存在缓存中
    if(cache[absPath]){
        //从内存中返回文件
        sendFile(response , absPath , cache[absPath]);
    }else{
        fs.exists(absPath,function(exists){
            //检查文件是否存在
            if(exists){
                //硬盘中读取文件
                fs.readFile(absPath,function( err , data ){
                    //如果发生错误
                    if(err){
                        send404(response);
                    }else{
                        //否则
                        cache[absPath] = data ;
                        //从硬盘中读取并返回
                        sendFile(response,absPath , data);
                    }
                })
            }else{
                //如果文件不存在返回404响应
                send404(response);
            }
        });
    }
}



