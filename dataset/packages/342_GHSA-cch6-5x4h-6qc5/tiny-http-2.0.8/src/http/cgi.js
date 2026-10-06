var Cgi = function(script, request, response, conf) {
    if (!(script && request && response)) {
        console.log('Cgi request is invalid!');
    }

    var self = this;
    this.script = script;
    this.request = request;
    this.response = response;


    var _TH = (function() {
        var __TH = {};
        for (var p in TH) {
            __TH[p] = TH[p];
        }
        __TH.resolve = function(script) {
            var args = arguments;
            if (/^[\\/]/.test(script)) {
                script = path.join(conf.WEB_ROOT, script);
            } else {
                script = path.join(path.dirname(self.script), script);
            }
            return script;
        };
        __TH._forked = true;
        return __TH;
    }());

    var _require = (function() {
        var __require = function(script) {
            //console.log('script:' + script);
            var args = arguments;
            if (/^[\\/]/.test(script)) {
                args[0] = path.join(conf.WEB_ROOT, script);
            } else if (script.charAt(0) === '.') {
                args[0] = path.join(path.dirname(self.script), script);
            }
            return require.apply(this, args);
        };

        for (var p in require) {
            __require[p] = require[p];
        }
        __require._forked = true;
        return __require;
    }());

    function parseFunction(func) {
        func = func.toString();
        return {
            args: func.substring(func.indexOf('(') + 1, func.indexOf(')')).replace(/\s+/g, '').split(','),
            code: func.slice(func.indexOf('{') + 1, func.lastIndexOf('}'))
        };
    }

    this.do = function(data) {
        if (conf.process.length >= conf.MAX_QUEUE_LENGTH) { //如果队列已满，等待
            console.log(new Date().toString() + ': Cgi process queue overflow!!!  waitting...');
            setTimeout(function() {
                this.do(data);
            }.bind(this), 100);

            return;
        }

        this.process = child_process.fork(__filename, ['*cgi*', this.script]);
        //CGI使用子进程执行，防止CGI阻塞主进程

        //console.log(this.request);
        this.process.send({
            method: this.request.method,
            url: this.request.url,
            headers: this.request.headers,
            data: data
        });

        conf.process.length++;


        request.on('close', function() {
            //console.log(self.process.pid);
            self.process.kill();
        });

        this.process.on('message', function(msg) {
            self.request.resume();//恢复数据传送
            if (msg.contentType === 'function') {
                var func = parseFunction(msg.content);
                var args = func.args.slice(0);
                args.push('require');
                args.push('TH');
                args.push('done');
                args.push('__initEnvironment'); //修正一些内置全局变量
                args.push('__initEnvironment();try {' + func.code + '\n} catch (e) {arguments[1].writeHead(501);arguments[1].end("Internal error");console.log("\\n`' + self.script.replace(/\\/g, '\\\\') + '` has error:\\n\\n"  + e.stack + "\\n");return;}');

                var ret = Function.apply(self, args);

                ret(self.request, self.response, msg.data, _require, _TH,
                    function(data) {
                        self.response.writeHead(200);
                        self.response.end(data);
                    }, (function(_filename, _dirname) {
                        return function() {//通过initEnvironment调用
                            global.__filename = _filename;
                            global.__dirname = _dirname;
                        }
                    })(self.script, path.dirname(self.script))
                );

            } else if (msg.contentType === 'object') {
                //console.log(msg);
                self.response.writeHead(200, {
                    'content-type': 'text/json'
                });
                self.response.end(JSON.stringify(msg.content));
            } else if (msg.contentType === 'error') {
                self.response.writeHead(501, {
                    'content-type': 'text/plain'
                });
                self.response.end(msg.content);
            } else { // (msg.contentType === 'string' || msg.contentType === 'number') {
                self.response.writeHead(200, {
                    'content-type': 'text/html'
                });
                self.response.end(msg.content.toString());
            }

        });

        this.process.on('exit', function() {
            conf.process.length--;
        });
    };


    if (this.request.method === 'POST') {

        if (this.request.headers['content-type'].indexOf('multipart') > -1) {
            this.request.pause();//如果是上传文件之类的操作，先暂停上传，等子cgi fork起来之后再处理
            this.do();
        } else {
            var tmpData = '';
            this.request.on('data', function(chunk) {
                tmpData += chunk;
            });
            this.request.on('end', function() {
                self.do(tmpData);
            });
        }

    } else {
        this.do();
    }
};
