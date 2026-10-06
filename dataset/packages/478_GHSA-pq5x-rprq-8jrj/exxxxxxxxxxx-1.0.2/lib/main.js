var http = require('http');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var path = require('path');
var loopdo = require('./loop.js');

// 暴露模块
var eX = exports = module.exports = function (req, res) {
    eX.loop(req, res)
};

// eX的配置
eX.settings = {
    // router
    router: {},
    cache_key: {}
};

/*
 * set something of eX;
 **/
eX.set = function (setting, val) {
    if (1 == arguments.length) {
        return this.settings[setting];
    } else {
        this.settings[setting] = val;
    }
};

/*
 * get something of eX;
 **/
eX.get = function (val) {
    return this.set(val);
};

/*
 * Server loop like water 核心函数
 **/
eX.loop = function (req, res) {
    //配置信息
    res.config = {
        // 路由
        router : this.settings['router'],
        // 根目录
        basename : (this.settings['basename'] || '/'),
        cache_key: this.settings['cache_key']
        // file_cache
    }
    
    loopdo(req, res);
}


/**
 * let the server listen the port.
 * 
 * @param {Number} port
 * @return {Null}
 * 
 **/
eX.listen = function () {
    /*
    if (cluster.isMaster) {
        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
        cluster.on('listening', function (worker, address) {
            console.log('核心 ' + i + ' 启动 -pid:' + worker.process.pid);
        });
        cluster.on('exit', function (worker, code, signal) {
            console.log('核心' + i + ' pid:' + worker.process.pid + ' 重启')
            //防止无限重启耗尽资源
            setTimeout(function () { cluster.fork(); }, 2000);
        });
    }
    else {
        var server = http.createServer(this);
        return server.listen.apply(server, arguments);
    }
    //*/
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
}

/*
 * Server start function for user
 **/
eX.start = eX.listen;

/*
 * Set the route for the Server
 * 
 * @param {String, Function} url, callback
 * return {Object} Server
 * 
 **/
eX.use = function (url, callback) {
    this.settings['router'][url] = callback;
    return this;
}

/*
 * Set the route for the Server
 * 
 * @param {String, Function} url, callback
 * return {Object} Server
 * 
 **/
eX.baseUrl = function (url) {
    this.set('basename', url);
    return this;
}