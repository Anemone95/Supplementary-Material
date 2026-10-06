var fs = require("fs");
var vm = require("vm");
var express = require("express");

var basePath = process.argv[2];

console.log("Started jikes @ "+basePath);

var app = express();

app.use(function(req, res, next) {
  res.header("Content-Type", "text/html");
  next();
});

app.get("/", function(req, res) {
  tryRunPage("/index", req, res);
});

app.get("/*", function(req, res) {
  tryRunPage(req.path, req, res);
});

function tryRunPage(page, req, res) {
  var filePath = basePath+"/pages"+page;
  tryRunJavascriptPage(filePath, req, res, function(error1) {
    if(error1) {
      tryRunHtmlPage(filePath, req, res, function(error2) {
        if(error2) {
          runErrorPage(error1, error2, req, res);
	}
      });
    }
  });
}

function tryRunJavascriptPage(page, req, res, callback) {
  fs.readFile(page+".js", function(err, data) {
    if(err) {
      return callback(err);
    }
    var module = {};
    var context = vm.createContext({
      module: {}
    });
    try {
      vm.runInContext(data, context);
      context.module.exports.call({
        query: req.query
      }, function(viewToRender, variables) {
        fs.readFile(page+"/../../views/"+viewToRender, function(err, data) {
          if(err) {
            return callback(err);
	  }
	  res.end(data);
	  callback();
	});
      });
    }
    catch(e) {
      console.log("error", e);
      return callback(e);
    }
  });
}

function tryRunHtmlPage(page, req, res, callback) {
 fs.readFile(page+".htm", function(err, data) {
    if(err) {
      return callback(err);
    }
    res.end(data);
    callback();
  });
}

function runErrorPage(error1, error2, req, res) {
  res.end("Failed to read the file<br>"+JSON.stringify(error1)+"<br>"+JSON.stringify(error2));
}

app.listen(80);

