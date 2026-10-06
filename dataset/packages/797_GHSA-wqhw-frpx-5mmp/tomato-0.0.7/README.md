Tomato -- a Node.js web framework
===============

中文版文档：https://github.com/leizongmin/tomato/blob/master/README_cn.md

1. INSTALL
==========

```bash
npm install tomato
```


2. QUICK START
==============

**Start-up file: server.js**

```javascript
var tomato = require('tomato');

// Arguments:
// 
// master:    A pm.Master instance, it's used to manage the child process
// Reference: https://github.com/aleafs/pm
//
// logger:    A tomatolog instance, it's used to record log
// Reference: https://github.com/leizongmin/tomatolog
//
// config:    The application config

tomato(function (master, logger, config) {
  // When the server is started, run code here
  console.log('Okay, the server has been started.')
});
```

**HTTP application file: app.js**

```javascript
// Arguments:
// 
// worker:    A pm.Worker instance, it's used to manage the child process
// Reference: https://github.com/aleafs/pm
//
// app:       An express.Application instance
// Reference: https://github.com/visionmedia/express
//
// logger:    A tomatolog instance, it's used to record log
// Reference: https://github.com/leizongmin/tomatolog
//
// config:    The application config

module.exports = function (worker, app, logger, config) {
  // Write your initialization code here
  app.get('/', function (req, res, next) {
    worker.emit('test', new Date(), Math.random(), Date.now());
    res.end(new Date().toString());
  });
};
```

**Config file: config.js**

```javascript
exports.worker = {
  size:   2     // The number of HTTP service child process
};
exports.http = {
  port:   8080  // The HTTP service port number
}
```

**Put the above files in the same directory and run the following command to start:**

```bash
node server.js
```

Now, open http://127.0.0.1:8080/ in your browser. You can see the page output current system time.


3. CONFIGURATION
================

The default configuration is as follows:

```bash
Name                    Type      Explain
--------------------------------------------------------------------------------
env                     String    "development" or "production", default to "development"

master
  pidFile               String    The PID file of the master process, default to undefined.
                                  Reference the pm module.
  statusFile            String    The status file of processes, default to undefined.
                                  Reference the pm module.
  delay                 Number    Start child process delay in milliseconds, default to 2000.
  heartbeat             Number    The heartbeat of child process in milliseconds, default to 2000.

  api
    enable              Boolean   Enable the API service or not, default to false.
    access_key          Array     Access keys.
    port                Number    The API service port number, default to 8081.
    secure              Boolean   Enable secure connection or not, default to false.
                                  If true, you need to use the HTTPS protocol to access.
    key                 Buffer    The content of key file.
                                  Reference: http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
    cert                Buffer    The content of cert file.

worker
  size                  Number    The number of HTTP service child process, default to your CPU number minus one.

log
  enable                Boolean   Enable the log service or not, default to false.
  path                  String    The log file save directory, default to "./log".
  interval              Number    Flush interval in milliseconds, default to 2000.
  level                 String    Log level, fatal > error > warn > info > debug, default to "debug"
  output                Boolean   Output in the console or not, default to true.

http
  port                  Number    The HTTP service port number, default to 8080.
                                  Reference the pm module.
  views                 String    The view directory path, default to "./views".
                                  Reference the express module: http://expressjs.com/api.html#app-settings
  view suffix           String    The view suffix, default to ".liquid".
                                  Reference the express module.
  static path           String    The static file path, default to "./public".
                                  Reference the connect.static middleware: http://www.senchalabs.org/connect/static.html
  static maxage         Number    Browser cache maxAge in milliseconds, default to 31536000000(1 year).
                                  Reference the connect.static middleware.
  favicon               String    The favicon located by the given path.
                                  Reference the connect.favicon middleware: http://www.senchalabs.org/connect/favicon.html
  session store         String    The session store. "file", "redis" or "cookie", default to "file".
  session config        Object    The session store config.
                                  If the "session store" is "cookie", Reference the connect.cookieSession middleware: http://www.senchalabs.org/connect/cookieSession.html
                                  If the "session store" is "file", Reference the connect.session middleware: http://www.senchalabs.org/connect/session.html
                                  If the "session store" is "redis", Reference the connect-redis middleware: http://github.com/visionmedia/connect-redis
  secret                String    The secret used for cookie and session.
  compress              Boolean   Compress response data or not, default is false.
                                  Reference the connect.compress middleware: http://www.senchalabs.org/connect/compress.html
  timeout               Number    Times out the request in milliseconds, default to false, false means to disable.
                                  Reference the connect.timeout middleware: http://www.senchalabs.org/connect/timeout.html
  upload limit          String    Limit the bytesize of request bodies, default to false, false means to disable.
                                  Reference the connect.limit middleware: http://www.senchalabs.org/connect/limit.html
  auto routing path     String    Auto load the specified directory files and register routing, default to false, false means to disable.
```


4. SCHEDULES
===========

The schedule service can be very convenient at the appointed time to perform some task.

**Create a file in the root of your application directory names "chedule.js"**

```javascript
// Arguments:
//
// register:  Use this function to register a task, it will return a cron.CronJob instance.
// Reference: https://github.com/ncb000gt/node-cron
// Example:   register('*/2 * * * *', callback);
//
// worker:    A pm.Worker instance, it's used to manage the child process
// Reference: https://github.com/aleafs/pm

module.exports = function (register, worker) {
  var a = register('*/2 * * * *', function () {
    console.log('The task has been started.');
  });
};
```


5. EVENTS
==============

The event service can do some  asynchronous task in a separate process.

**Create a file in the root of your application directory names "event.js"**

```javascript
// Arguments:
//
// register:  Use this function to register your event listener.
// Example:   register('event_name', callback);
//
// worker:    A pm.Worker instance, it's used to manage the child process
// Reference: https://github.com/aleafs/pm

module.exports = function (register, worker) {
  register('test', function (a, b) {
    console.log(a + b);
  });
}
```

**In any worker process, you can emit the event:**

```javascript
worker.emit('test', 123, 456);
```


6. AUTO REGISTER ROTUING
========================

When set the configure "http['auto routing path']", HTTP service will load all the files from the specified path,
and register to the express.Application instance.

For example:

```javascript
// This is a file under the specified path

exports.path = '/test';

exports.get = function (req, res, next) {
  res.end('get /test'); 
};

exports.post = function (req, res, next) {
  res.end('post /test');
};
```

Equal to the following:

```javascript
app.get('/test', function (req, res, next) {
  res.end('get /test');
});

app.post('/test', function (req, res, next) {
  res.end('post /test');
});
```


LICENSE
=======

```
Copyright (c) 2012 Lei Zongmin(雷宗民) <leizongmin@gmail.com>
http://ucdok.com

The MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
