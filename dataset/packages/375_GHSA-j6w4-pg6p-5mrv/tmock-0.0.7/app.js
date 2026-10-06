var http = require('http')
var fs = require('fs')
var path = require('path')
var mime = require('./mime')
var cwd = process.cwd()
var port = process.argv[2] || 1234
var url = 'http://127.0.1:' + port + '/'
var exec = require('child_process').exec
var spawn = require('child_process').spawn
var openURL = function(url) {
	switch (process.platform) {
		case "darwin":
			exec('open ' + url)
			break
		case "win32":
			exec('start ' + url)
			break
		default:
			spawn('xdg-open', [url])
	}
}

http.createServer(function(req, res) {
	var url = cwd + req.url
	url = path.normalize(url.slice(-1) === '/' ? url + 'index.html' : url)
	fs.exists(url, function(exists) {
		if (!exists) {
			res.writeHead(404, {
				'Content-Type': 'text/plain'
			})
			return res.end('404 nofound')
		}
		res.writeHead(200, {
			'Content-Type': mime[path.extname(url).slice(1)] || 'text/plain'
		})
		fs.readFile(url, function(err, data) {
			return err || res.end(data)
		})
	})

}).listen(port, function() {
	openURL(url)
})

console.log('Server start on ' + url)