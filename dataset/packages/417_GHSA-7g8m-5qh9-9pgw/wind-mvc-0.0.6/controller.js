var url = require("url");
var querystring = require("querystring");
var urlConfig = require("./lib/url-config");
var util4HTML = require("./lib/util/util4HTML");
var generator = require("./lib/util/generator");
var config = require('./lib/config.js');
var fs = require('fs');
var util = require('util');

var formidable = require('formidable');

//负责处理请求和响应
module.exports = function (request, response){
	var query = {}; //保存请求参数
	switch(request.method){
		case 'POST':
			//采用formidable
			var form = new formidable.IncomingForm();
			//sets encoding for incoming form fields
			form.encoding = 'utf-8';
			if(!fs.existsSync(config.uploadDir)){
				fs.mkdirSync(config.uploadDir);
			}
			form.uploadDir = config.uploadDir;
			//上传的文件保持原有的扩展格式
			form.keepExtensions = true;
			form.maxFieldsSize = 2*1024*1024;
			form.maxFields = 0;
			form.hash = 'md5';
			form.parse(request, function(err, fields, files){
				//?bug 如果客户端参数有name重复的，fields中会覆盖
			});
			
			//Emitted after each incoming chunk of data that has been parsed
			form.on('progress', function(bytesReceived, bytesExpected){
				console.log('---BEGIN--');
				console.log('form.bytesReceived=' + form.bytesReceived);
				console.log('form.bytesExpected=' + form.bytesExpected);
				console.log('---END--');
			});
			
			//Emitted whenever a field / value pair has been received.
			form.on('field', function(name, value) {
				if(query[name] === undefined){
					query[name] = value;
				}else if(Array.isArray(query[name])){
					query[name].push(value);
				}else{
					var tmpArray = [];
					tmpArray.push(query[name]);
					tmpArray.push(value);
					query[name] = tmpArray;
				}
			});
			
			//Emitted whenever a new file is detected in the upload stream.
			//可用于改变文件存放的位置
			form.on('fileBegin', function(name, file){
//				 console.log('@@@fileBegin=' + name + ':' + JSON.stringify(file));
			});
			
			//Emitted whenever a field / file pair has been received. file is an instance of File.
			form.on('file', function(name, file){
				// console.log('@@@file=' + name + ':' + JSON.stringify(file));
				var newPath = config.uploadDir + file.name;
				fs.rename(file.path, newPath, function(err){
					if(err){
						console.log('@@@file received fail');
						console.log(err);
					}
				});
				file.path = newPath;
				if(query[name] === undefined){
					query[name] = file;
				}else if(Array.isArray(query[name])){
					query[name].push(file);
				}else{
					var tmpArray = [];
					tmpArray.push(query[name]);
					tmpArray.push(file);
					query[name] = tmpArray;
				}
			});
			
			//Emitted when there is an error processing the incoming form.
			form.on('error', function(err){
				console.log(err);
				request.resume();
			});
			
			//Emitted when the entire request has been received
			form.on('end', function(){
				proxy(request, response, query);
			});
			break;
		case 'GET':
			var parsedUrl = url.parse(request.url);
			query = querystring.parse(parsedUrl.query); 
			proxy(request, response, query);
			break;
		default:
			console.log('####请求方式为:' + request.method);
	}
};


/**
* 当完全获得client的查询对象后进行处理
**/
function proxy(request, response, query){
	var pathname = url.parse(request.url).pathname;
	console.log('####the path name is:' + pathname);
	//可以在这里对请求进行过滤
	var urlPath = getActionUrlPath(pathname);
	var config = urlConfig[urlPath];
	//对匹配到的url进行处理
	if(config){
		//可以在这里对请求进行过滤
	
		//获得相应的action
		var actionPath = config['path'];
		var methodName = getActionMethodName(pathname);
		var action = require(actionPath);
		if(action[methodName]){ //匹配到action相应的方法
			//调用action中相应的处理方法
			var result = action[methodName](request, query, response);
			if(!result){
				return ;
			}
			switch(result.type){
				case 'htmlFile': //html文件
					var resultName = result['name'] ? result['name'] : 'success'; //返回结果的名称, 默认success
					var resultPath = config['results'][resultName];
					util4HTML.getHTMLBinary(resultPath, function (err, file){
						if(err){
							response.writeHead(500, {'Content-Type': 'text/plain'});
						}else{
							response.writeHead(200, {"Content-Type": "text/html"});
							response.write(file, 'binary');
						}
						response.end();
					});
					break;
				case 'json':
					response.writeHead(200, {"Content-Type": "application/json"});
					response.end(JSON.stringify(result.data));
					break;
				case 'xml':
					response.writeHead(200, {"Content-Type": "application/xml"});
					response.end(result.data);
					break;
				case 'jsonp':
				case 'script':
					response.writeHead(200, {
						// "Content-Length": body.length,
						"Content-Type": "text/javascript; charset=utf-8"
					});
					response.end(result.data);
					break;
				case 'text':
					response.writeHead(200, {"Content-Type": "text/plain"});
					response.end(result.data);
					break;
				case 'html': //html字符串
					response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
					response.end(result.data);
					break;
				case 'event-stream':
					response.writeHead(200, {
						'Content-Type': 'text/event-stream; charset=utf-8', 
						'Cache-Control': 'no-cache'});
					response.write('data: ' + new Date());
					response.end();
					console.log('data: ' + result.data);
					break;
				default: ;
			}
		}else{
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.end('cant\'t find:' + pathname);
		}
	}else{ //对未配置路径的请求进行处理(比如静态文件.js, .css, img)
		util4HTML.getHTMLBinary('.' + pathname, function (err, file){
			if(err){
				response.writeHead(500, {'Content-Type': 'text/plain'});
				response.write('cant\'t find:' + pathname);
				console.log(err);
			}else{
				// response.writeHead(200, {"Content-Type": "text/html"});
				response.write(file, 'binary');
			}
			response.end();
		});
	}
}

/**
* /ajax/test!getJson  --> /ajax/test
* /ajax/test --> /ajax/test
*/
function getActionUrlPath(pathname){
	return pathname.replace(/(!.*)$/, '');
}

/**
* 获得action的入口方法名称, 默认main
* /ajax/test!getJson.do  --> getJson.do 
* /ajax/test!getJson --> getJson
* /ajax/test --> main
*/
function getActionMethodName(pathname){
	var methodName = 'main';
	if(pathname.match(/!.*/)){
		methodName = pathname.match(/!(.*)$/)[1];
	}
	return methodName;
}