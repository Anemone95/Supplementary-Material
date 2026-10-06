var url = require("url");
var querystring = require("querystring");
var urlConfig = require("url-config.js");
var util4HTML = require("util/util4HTML.js");
var generator = require("util/generator.js");
var fs = require('fs');
var formidable = require('formidable');
var util = require('util');

//负责处理请求和响应请求
module.exports = function (request, response){
	var query = {}; //保存请求参数
	switch(request.method){
		case 'POST':
			/* var bufferArray = [];
			var totalLength = 0;
			request.addListener('data', function(chunk){
				bufferArray.push(chunk);
				totalLength += chunk.length;
			}).addListener('end', function(){
				var dataBuffer = Buffer.concat(bufferArray, totalLength);
				// console.log('####post data:\n' + data);
				var contentType = request.headers['content-type'];
				if(contentType.match('multipart/form-data')){ //form-data的方式
					// console.log('@@@进入了form-data的处理');
					var boundary = getBoundaryFromContentType(contentType);
					query = getQueryFromFormData(dataBuffer.toString(), boundary);
					// query = convertQueryFromBuffer(dataBuffer, boundary);
				}else if(contentType.match('application/x-www-form-urlencoded')){ //application/x-www-form-urlencoded
					// console.log('@@@进入了application/x-www-form-urlencoded的处理');
					query = querystring.parse(dataBuffer.toString());
				}
				proxy(request, response, query);
			}); */
			//采用formidable
			var form = new formidable.IncomingForm();
			//sets encoding for incoming form fields
			form.encoding = 'utf-8';
			form.uploadDir = 'e:\\nodejs-tmp';
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
				// console.log('@@@fileBegin=' + name + ':' + JSON.stringify(file));
			});
			
			//Emitted whenever a field / file pair has been received. file is an instance of File.
			form.on('file', function(name, file){
				// console.log('@@@file=' + name + ':' + JSON.stringify(file));
				var newPath = 'e:\\nodejs-tmp\\' + file.name;
				fs.rename(file.path, newPath, function(err){
					if(err){
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
	// console.log('@@@@@@@@' + JSON.stringify(request));// Converting circular structure to JSON
	//可以在这里对请求进行过滤
	
	var actionConfig = urlConfig[pathname];
	//对匹配到的url进行处理
	if(actionConfig){
		//可以在这里对请求进行过滤
	
		//获得相应的action
		var actionPath = actionConfig['actionPath'];
		var entryName = actionConfig['entryName'] ? actionConfig['entryName']: 'main'; //获得action的入口方法名, 默认为main
		var action = require(actionPath);
		if(action[entryName]){ //匹配到action相应的方法
			//调用action中相应的处理方法
			var result = action[entryName](request, query);
			if(actionConfig['resultType'] === 'text/html'){ //定位到一个html文件
				//结果的路径
				var resultPath = actionConfig['resultPath'];
				//返回结果。 加载文件写入response中，
				
				util4HTML.getHTMLBinary(resultPath, function (err, file){
					if(err){
						response.writeHead(500, {'Content-Type': 'text/plain'});
					}else{
						response.writeHead(200, {"Content-Type": "text/html"});
						response.write(file, 'binary');
					}
					response.end();
				});
			}else{ //ajax请求的不同返回类型
				switch(result.type){
					case 'json':
						response.writeHead(200, {"Content-Type": "application/json"});
						var body = JSON.stringify(result.data);
						response.write(body);
						break;
					case 'xml':
						response.writeHead(200, {"Content-Type": "application/xml"});
						var body = result.data;
						response.write(body);
						break;
					case 'jsonp':
					case 'script':
						var body = result.data;
						response.writeHead(200, {
							// "Content-Length": body.length,
							"Content-Type": "text/javascript; charset=utf-8"
						});
						response.write(body);
						break;
					case 'text':
						response.writeHead(200, {"Content-Type": "text/plain"});
						var body = result.data;
						response.write(body);
						break;
					case 'html':
						response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
						var body = result.data;
						response.write(body);
						break;
					default: 
						;
				}
				response.end();
			}
			
		}
	}else{ //对未配置路径的请求进行处理(比如静态文件.js, .css, img)
		util4HTML.getHTMLBinary('.' + pathname, function (err, file){
			if(err){
				response.writeHead(500, {'Content-Type': 'text/plain'});
				response.write('path error:' + pathname);
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
* 获得分界线
**/
function getBoundaryFromContentType(content){
	return content.match(/; boundary=(.+)$/)[1];
}

/**
* 获得form-data的query对象,
* data 消息体字符串
**/
function getQueryFromFormData(data, boundary){
	var query = {};
	var queryArray = data.split('--' + boundary);
/* 	console.log("@@@boundary=" + boundary);
	console.log("@@@queryArray.length=" + queryArray.length); */
	for(var i=0; i<queryArray.length; i++){
		var currStr = queryArray[i];
		if(currStr){ //每一块的数据
			var matchedStrArray = null;
			if(currStr.match(/"; filename="/)){ //是否为上传的文件
				matchedStrArray = currStr.match(/^\r\nContent-Disposition: form-data; name="(.+)"; filename="(.+)"\r\nContent-Type: (.+)\r\n\r\n(.*)/);
				// console.log("@@@@@matchedStrArray.length=" + matchedStrArray.length);
				// console.log("@@@@进行对文件域进行处理matchedStrArray=" + matchedStrArray);
				if(matchedStrArray){
					var file = {};
					file.name = matchedStrArray[2];
					file.type = matchedStrArray[3];
					file.data = new Buffer(matchedStrArray[4]); //不能逆向转换：Buffer -utf8-> String; String --utf8--> Buffer 
					fs.writeFile(file.name, file.data, function (error){
						if(error){
							throw err;
						}
						console.log('Its\'s saved');
					});
					query[matchedStrArray[1]] = file;
				}
			}else{
				matchedStrArray = currStr.match(/^\r\nContent-Disposition: form-data; name="(.+)"\r\n\r\n(.*)\r\n$/);
				if(matchedStrArray){
					var name = matchedStrArray[1];
					if(typeof query[name] === 'undefined'){
						query[name] = matchedStrArray[2];
					}else if(Array.isArray(query[name])){
						query[name].push(matchedStrArray[2]);
					}else{
						var tmpArray = [];
						tmpArray.push(query[name]);
						tmpArray.push(matchedStrArray[2]);
						query[name] = tmpArray;
					}
				}
			}
		}
	}
	return query;
}

/**
* 将buffer转换为query
* ？ 如何解析buffer
**/
function convertQueryFromBuffer(buffer, boundary){
	var query = {};
	var bufferLength = buffer.length;
	console.log('buffer.lenght = ' + bufferLength); //1100
	for(var i=0; i<bufferLength; i++){
		// var tmp = buffer.readUInt16LE(i, true);
		/* var tmp = buffer.slice(i, i+1);
		console.log(tmp.toString());
		fs.appendFile('bufferData1.txt', tmp, function(err){
			if(err){
				throw err;
			}
		}); */
	}
	console.log(buffer.toString());
	return query;
}

