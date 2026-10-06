var express = require('express') ;
var http = require('http'); 
var util = require("util");
var Repo = require("../repo.js");

var repo = new Repo(process.cwd());

exports.serve=function(options){
	var port=options.port||3000;
	server.listen(port); 
	console.log("server listening on port: "+port);
}


var app=express();
app.configure(function () {
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(app.router);	
	app.use(function(err, req, res, next){
		res.send(500, { error: err.message});
	});
});

app.get('/api/widget/:widgetName', function(req,res){
	repo.loadWidget(req.params.widgetName,function(widget){
		res.send(widget);
	})
}); 


var server=http.createServer(app);

