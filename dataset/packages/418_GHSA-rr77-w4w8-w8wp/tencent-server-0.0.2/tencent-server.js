var http = require('http'), //官方的核心模块， 处理HTTP服务请求和响应
	fs = require('fs'),
	mime = require('mime');
var base = process.argv[2] || 'd:/';
http.createServer(function (req, res) { //事件处理机制
		var pathurl = base + req.url;
		//console.log( req.url );
		// 默认是二进制流: 浏览器一般会直接下载 application/octet-stream
		res.writeHead(200, {'Content-Type': mime.lookup(req.url) });
		fs.stat(pathurl, function(err,stats){
			if( stats && stats.isFile() ){
					fs.readFile( pathurl, function (err, data) {
							res.end( data );
					});
			}else if( stats && stats.isDirectory() ){
					res.writeHead(200, {"Content-Type": "text/html;charset:utf-8"});
					/*创建目录列表展示*/
					fs.readdir(pathurl, function(err,files){
							//console.log( files );
							//res.end('<meta charset="utf-8"><ol><li>'+ files.join('</li><li>') +'</li></ol>');
							var html = '';
							files.map(function(file,i){
								html += '<li><a href="'+file+'">'+file+'</a></li>';
							});
							res.end( '<meta charset="utf-8"><ol>'+html+'</ol>' );
					});
			}else{
					// HTTP Code
					res.writeHead(404, {'Content-Type': 'text/html','charset':'UTF-8' });
					res.end( '<h1 style="text-align:center;">404</h1>' );
			}
	});
}).listen(8888);
console.log('调试时间：'+ new Date().getHours() +':'+new Date().getMinutes() +':'+new Date().getSeconds());