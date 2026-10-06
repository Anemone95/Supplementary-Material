var util = require('util');

module.exports = {
	main: function (request, query){
		return {
			type: 'htmlFile'
		};
	},
	
	getJson: function (request, query){
		//对request进行处理
		return {
			type: 'json',
			data: {name: 'hjf', age: 32}
		};
	},
	getXml: function (request, query){
		return {
			type: 'xml',
			data: "<books><book><author id='1'>wind</author></book></books>"
		};
	},
	getHtml: function (request, query){
		return {
			type: 'html',
			data: "<h3>hello, " + new Date() + "</h3>"
		};
	},
	getJsonp: function (request, query){
		console.log(query);
		var callback = query['mycallback'];
		var data = {name: 'hjf', age: 34, time: new Date().toString()};
		var returnData = "";
		returnData += 'showTime("hjf");';
		returnData += callback + '(' + JSON.stringify(data) + ');';
		return {
			type: 'jsonp',
			data: returnData
		};
	},
	getScript: function (request, query){
		return {
			type: 'script',
			data: "alert(1); console.log(12);"
		};
	},
	getMembersOfRequest: function (request, query){
		var content = util.inspect(request);
		return {
			type: 'text',
			data: content
		};
	}
};