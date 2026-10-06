var fs = require("fs");
var spawn = require("child_process").spawn;
var exec = require("child_process").exec;

function Tomita(execPath){
	var exe_path = execPath;
	this.tomitaPath = execPath;
}

Tomita.prototype.src = function(filename){
	this.sourceFile = filename;
	return this;
}

Tomita.prototype.grammar = function(filename){
	this.grammarFile = filename;
	return this;
}

Tomita.prototype.dict = function(filename){
	this.dictFile = filename;
	return this;	
}

Tomita.prototype.run = function(callback){
	var tp = this.tomitaPath;
	dictArticles(this.dictFile, function(data){
		config(data, function(config){
			execute(tp, config, function(data){
				callback(data);
			});
		});
	});
}

module.exports = Tomita;

function dictArticles(filename, callback){
	fs.readFile(filename, "utf-8", function(error, data){
		if(error){
			callback(undefined);
		}else{
			var names = [];
			var exp = /TAuxDicArticle "([\w_\d]+)"/g;
			while(true){
				var m = exp.exec(data);
				if(m){
					names.push(m[1]);
				}else{
					break;
				}
			}

			callback(names);
		}
	});
}

function config(articles, callback){
	fs.readFile("templates/config.proto", "utf-8", function(error, data){
		if(error){
			callback(undefined);
		}else{
			var art = "{ Name = \"@name@\" }";
			var articles_data = "\n";
			articles.forEach(function(a){
				articles_data += art.replace("@name@", a);
				articles_data += "\n";
			});

			data = data.replace(/"@ARTICLES@"/, articles_data);

			fs.writeFile("config.proto", data, "utf-8", function(error){
				if(error){
					callback(undefined);
				}else{
					callback("config.proto");		
				}
			});
			
		}
	});	
}

function execute(tomita, config, callback){
	console.log("exec:", tomita + " "+config);
	var child = exec(tomita + " "+config);
	child.stdout.on("data", function(data){
		console.log("out:", data);
	});
	child.stdout.on("readable", function(){
		console.log("rout:", child.stdout.read());
	});
	child.on("close", function(){
		console.log("close");
		callback();
	});
	child.on("error", function(error){
		console.log("error");
		console.log(error);
	});

	child.stdin.write("hellllllllo");
}
