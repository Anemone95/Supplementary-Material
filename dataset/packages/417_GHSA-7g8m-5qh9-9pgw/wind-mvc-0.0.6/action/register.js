module.exports = {
	main: function (request, query){
		return {
			type: 'htmlFile'
		};
	},
	saveMessage: function (request, query, response){
		//保存数据，并进行一次查询返回查询结果
		saveMessage(query, response);
	}
}

/**
* 保存信息
**/
function saveMessage(data, response){
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: '127.0.0.1',
		port: '3306',
		user: 'root',
		password: 'hjf123',
		database: 'emr'
	});

	connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
		if (err){ 
			console.log('#####error happened');
			throw err;
		}
		console.log('The solution is: ', rows[0].solution);
		connection.end();
		response4SaveMessage(rows[0]['solution'], response);
	});
}

function response4SaveMessage(data, response){
	var body = '成功! data:' + data;
	response.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
	response.end(body);
}