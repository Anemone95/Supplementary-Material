//var math=require("math.js");
//math.math(1,2)
//静态服务器
var url=require("url")
var http=require("http")
var fs=require("fs")
//连接数据库
var mysql=require("mysql");
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'ajax'
});
connection.connect();
connection.query('SELECT * from  student', function(err, rows, fields) {
    if (err) throw err;

    console.log();
});
connection.end();
//如何将数据显示到网页
//创建服务器
http.createServer(function(request,response)
{
    var path="."+url.parse(request.url).pathname;
    response.writeHead("200",{"content-type":"text/html"})
    fs.readFile(path,function(error,file)
    {
        if(error)
        {
            response.write("<meta charset='utf-8'>");
            response.write("<strong>文件不存在</strong>")
            response.end();
        }
        else
        {
            response.write(file);
            response.end();
        }
    })
}).listen(8888);
//指定端口号
//如何读取文件
//jade中如何识别变量

