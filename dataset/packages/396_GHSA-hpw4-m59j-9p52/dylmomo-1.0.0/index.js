// var a=require("demo.js");
//接受的是对象 引入文件 不写路径只写名字 则自动去node_modules中去找
// console.log(a.fun);
//./demo.js找的是文件 demo.js自动去node_modules包中找；
//node.js 分为模块 和包 模块相当于文件 包相当于文件夹包名即文件夹名必须为node_modules;右键运行
// a.a()
//.listen("8888"); 端口号必须大于1024 因为1024下无权限访问 node.js默认80为不安全
//单线程异步机制
var http=require("http");//核心模块 自带
//操作文件 自带
var fs=require("fs");
http.createServer(function(request,response){
    var path="./"+request.url;
    fs.readFile(path,function(error,data){
        response.end(data);
    })
    // response.end("end");
    // console.log(11);
}).listen("8888");
//测试 浏览器输入localhost:8888/a.html
