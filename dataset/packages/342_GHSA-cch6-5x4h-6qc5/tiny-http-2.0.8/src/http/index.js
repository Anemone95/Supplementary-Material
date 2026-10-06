module.exports = {
    Server: Server,
    run: function() {
        return new Server().start();
    },
    preHandle: null,
    middleHandle: null
}

if (process.argv[2] === '*cgi*') {//如果是CGI模式，只执行require
    var exportsData = {};//exportsData用于参数传递
    Object.defineProperty({}, 'exportsData', {//将exportsData设置只读，不允许改变其对象类型
        enumerable: true,
        writable: false,
        value: exportsData
    });

    __filename = path.resolve(process.argv[3]);
    __dirname = path.dirname(__filename);

    process.on('message', function(incoming) {//监听主进程message
        var ret = {};
        try {
            ret = require(__filename)(incoming, exportsData, function(ret) {//用于处理异步cgi
                ret = {
                    contentType: typeof ret,
                    content: typeof ret === 'object' ? JSON.stringify(ret) : ret.toString(),
                    data: exportsData
                };
                process.send(ret);//发送返回数据给主进程
                process.disconnect();//断开与主进程的IPC连接 
            });
            if (ret !== false) {
                ret = {
                    contentType: typeof ret,
                    content: typeof ret === 'object' ? JSON.stringify(ret) : ret.toString(),
                    data: exportsData
                };
                process.send(ret);//发送返回数据给主进程
                process.disconnect();//断开与主进程的IPC连接  
            }
        } catch (e) {
            console.log(e.stack);
            ret = {
                contentType: 'error',
                content: 'Internal error'
            }
            process.send(ret);
            process.disconnect();//断开与主进程的IPC连接  
        }      
    })
    return;
}

if (process.mainModule && process.mainModule.filename === __filename) { //如果通过命令行直接启动，则执行start
    new Server().start();
}
