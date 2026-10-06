const http = require('http');
const url = require('url');
const inspect = require('util').inspect;
const fs = require('fs');
const resolve = require('path').resolve;
const extname = require('path').extname;
const debug = require('debug')('augustine');

const server = http.createServer((req, res) => {
  debug('url = ', req.url);
  const parsedUrl = url.parse(req.url);
  // remove querystring/parameters
  let path = parsedUrl && parsedUrl.pathname.slice(1);
  debug('path = ', path);
  if (path.length === 0) {
    debug('default to index.html.');
    path = resolve('index.html');
  }
  // 404 not found
  if (!fs.existsSync(path)) {
    console.log('404 Not found.');
    res.statusCode = 404;
    return res.end();
  }
  // Directory default to index.html or index.htm
  const stats = fs.statSync(path);
  if (stats.isDirectory()) {
    console.log('Is directory ...');
    if (fs.existsSync(resolve(path, 'index.html'))) {
      path = resolve(path, 'index.html');
    } else if (fs.existsSync(resolve(path, 'index.htm'))) {
      path = resolve(path, 'index.htm');
    } else {
      console.log('404 Not found: Directory.');
      res.statusCode = 404;
      return res.end();
    }
  }

  // set http header
  switch (extname(path)) {
    case '.html':
    case '.htm':
      res.setHeader('Content-Type', 'text/html');
      break;
    case '.txt':
      res.setHeader('Content-Type', 'text/plain');
      break;
    default:
      break;
  }
  res.write(fs.readFileSync(path, { flag: 'rs+' }));
  res.end();
});
server.on('clientError', (err, socket) => {
  console.error(err);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

const start = (port, hostname) => (server.listen(port, hostname, () => (console.log('Waiting for client to connect ...'))));

module.exports = exports = {
  start
};
