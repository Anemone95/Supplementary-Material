var fs = require("fs");

/**
* 获得html二进制对象
**/
exports.getHTMLBinary = function (path, callback){
	fs.readFile(path, 'binary', callback);
};