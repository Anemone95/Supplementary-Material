#!/usr/bin/env node

var Repo = require("../repo.js");
var API = require("../api.js");
var config = require("../config.js");

var conf = config.loadConfig();

exports.commit = function(options) {
	var widgetName = options.widgetName;
	var env = options.env;
	var shopId = options.shopId;
	if (!conf) {
		console.log("you must first login");
		return;
	}
	var user = conf.user;
	if (!user) {
		console.log("you must first login");
		return;
	}
	if (!widgetName) {
		console.log("you must specify the widget");
		return;
	}
	if (!env) {
		console.log("you must specify the env {alpha|beta|product}");
		return;
	}
	var cp = require('child_process');
	var api = API.getAPI(env);
	cp.exec("pwd", {}, function(err, stdout, stderr) {
		var repo=new Repo(stdout.trim());
		repo.loadWidget(widgetName,function(widget){
			api.preview(user,shopId,widget,function(html){
				if(html){
					console.log(html);
				}else{
					console.log("fail");
				}
			})
		})
	});

	
}