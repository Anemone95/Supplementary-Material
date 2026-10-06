var express = require('express')
var app = express()
var os = require("os");
var spawn = require('child_process').spawn;
var https = require('https');

var PORT = process.env.PORT || 43569;
app.set('port', PORT);
app.use(function (req, res, next) {
  res.header('X-powered-by', 'domokeeper v' + process.env.npm_package_version)
  next()
})

app.get('/', function (req, res) {
  res.json({
    domokeeper: process.env.npm_package_version,
    hostname: os.hostname()
  })
})

app.get('/plugins/', function (req, res) {
  var child = spawn('npm', ['ls', '--json', '--depth', '0']);
  var buff = '';
  child.stdout.on('data', function(data) {
    buff += data;
  });
  child.on('close', function(code) {
    var dependencies = JSON.parse(buff).dependencies;
    var ds = [];
    for (var name in dependencies)
      if (name.indexOf('domokeeper-plugin') == 0)
        ds.push({name:name, version:dependencies[name].version});
    res.json(ds);
  });
})

app.post('/plugins/install/:id', function (req, res) {
  var child = spawn('npm', ['install', req.params.id]);
  var stdout = '';
  child.stdout.on('data', function(data) {
    stdout += data;
  });
  child.on('close', function(code) {
    res.json({stdout: stdout, code: code});
  });
})

app.get('/plugins/install/', function (req, res) {
  https.get({
    host: 'www.npmjs.com',
    path: '/-/search?text=domokeeper-plugin',
    headers: {'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
  }, function(response) {
      var body = '';
      response.on('data', function(d) { body += d; });
      response.on('end', function()   {
        body = JSON.parse(body);
        var r = [];
        for (var i = 0; i < body.objects.length; i++) {
          r.push(body.objects[i].package);
        }
        res.json(r);
      });
  });
})

app.delete('/plugins/:id', function (req, res) {
  var child = spawn('npm', ['remove', req.params.id]);
  var stdout = '';
  child.stdout.on('data', function(data) {
    stdout += data;
  });
  child.on('close', function(code) {
    res.json({stdout: stdout, code: code});
  });
})

app.get('/plugins/:id/sensor/:sensor', function (req, res) {
  var plugin = require(req.params.id);
  res.json(plugin.sensors[req.params.sensor].f());
})

app.get('/plugins/:id', function (req, res) {
  var plugin = require(req.params.id);
  res.json(plugin);
})

app.post('/plugins/:id/action/:action', function (req, res) {
  var plugin = require(req.params.id);
  res.json(plugin.actions[req.params.action].f());
})

app.listen(PORT, function () {
  console.log('domokeeper server listening on port ' + PORT)
})