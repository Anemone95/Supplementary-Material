var fs = require('fs');
var api = require("./api.js").getAPI("product");
var Step = require('step');
var config = require("./config.js");
var yaml = require('js-yaml');
var Client = require('ftp');
var moment = require('moment');

exports.pack = function(projectDir, cb) {
	var user = config.loadConfig().user;
	var basePackage = projectDir + "/src/main/resources/widget";
	Step(
		function loadAllWidget() {
			console.log("start loading all widget...");
			api.loadAllWidget(user, this);
		},
		function writeWidgetToLocal(allWidget) {
			console.log(allWidget.length + " widget loaded");
			deleteFolderRecursive(projectDir + "/src/main/resources/widget");
			for (var i = allWidget.length - 1; i >= 0; i--) {
				var widget = allWidget[i];
				console.log("writing: " + widget.name + "...");
				writeWidget(basePackage, widget);
			};
			return "success";
		},
		function packageWar(result) {
			console.log("start mvn package...");
			var cp = require('child_process');
			var command = 'mvn package -Denv=product -DskipTests -f ' + projectDir + "/pom.xml";
			console.log(command);
			cp.exec(command, {}, this);

		},
		function buildFinished(err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			if (!err) {
				return "success";
			} else {
				return "fail"
			}
		},
		function pushToFTP(status) {
			console.log("prepare to push to FTP...");
			var client = new Client();
			client.on('ready', function() {
				console.log("connected");
				var localPath = projectDir + "/target/shop-web-product-2.1.9.war";
				var remotePath = "/product-shop-web/" + moment().format('YYYY-MM-DD_hh-mm-ss');
				console.log("transfer:" + localPath + " to:" + remotePath);
				client.mkdir(remotePath, true, function(err) {
					if(err)throw err;
					client.put(localPath, remotePath+"/shop-web-product-2.1.9.war", function(err) {
						if (err) throw err;
						client.end();
						console.log("transfer success");
						console.log("connection ended");
						cb();
					});
				});

			});
			client.connect({
				host: "10.1.1.81",
				user: "qaupload",
				password: "uploadwar"
			});
		});

}

function writeWidget(path, widget) {
	if (widget.modes.display.code) {
		fs.writeFileSync(path + "/" + widget.name + ".groovy", widget.modes.display.code);
	}
	if (widget.modes.display.script) {
		fs.writeFileSync(path + "/" + widget.name + ".js", widget.modes.display.script);
	}
	if (widget.modes.display.template) {
		fs.writeFileSync(path + "/" + widget.name + ".ftl", widget.modes.display.template);
	}
	if (widget.layoutName || widget.layoutRule) {
		var content = yaml.dump({
			layoutName: widget.layoutName || "",
			layoutRule: widget.layoutRule || "",
			parentWidgetName: widget.parentWidgetName || ""
		});
		fs.writeFileSync(path + "/" + widget.name + ".widget", content);
	}

}

var deleteFolderRecursive = function(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index) {
			var curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				if (file.indexOf(".layout") != -1) {
					//console.log(file);
				} else {
					fs.unlinkSync(curPath);
				}
			}
		});
	}
};