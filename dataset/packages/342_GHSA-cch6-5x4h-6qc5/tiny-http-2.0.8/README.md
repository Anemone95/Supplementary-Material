# tiny-http ![NPM version](https://badge.fury.io/js/tiny-http.png)

[![NPM Download](https://nodei.co/npm-dl/tiny-http.png?months=1)](https://www.npmjs.org/package/tiny-http)

> 一个单文件实现的http服务器，实现类php的CGI动态调用，多进程模式可以确保子模块的异常不会引起服务中断。

## 安装:

### local install
   $npm install tiny-http
   
   $cd tiny-http
  
   $sudo node http.js
    
   $sudo node http.js 8080
    
   $sudo node http.js 8080 /webroot    
   
   //or
   $sudo node http.js 8080 ./webroot 
   
 
### global install
   
   $sudo npm install tiny-http -g
   
   $sudo http 8080
   
   $sudo http 8080 ./webroot
   
> 参数说明：
   node http.js 端口 目录 是否自动启动浏览器(1或0)

### require

```javascript

   require('tiny-http').run(process.argv);

    //or

   new require('tiny-http').Server().init(8080, './webroot', {
         ip: '127.0.0.1',//可以省略
         autoOpenBrowser: true
   });
```

## 子CGI处理

详见 [example](https://github.com/lwdgit/tiny-http/tree/v2.0/example)

> 建议将example目录clone下来，然后执行
  
    cd example
    http 8080 . 1
    ;上面参数依次表示: 命令本身 端口号 路径 是否自动打开浏览器

## 特点

 * 简单高效。本服务器只实现了部分常用http传输协议(200, 403, 404, 501)，所以效率相对较高
   (经测试比较，静态文件处理比express快1/3左右)
 * 单文件，便于移植简合。服务器不依赖任何第三方模块，一个单文件即可实现http服务器
 * 实现了类php的CGI处理模式，模块只在被请求时才会加载。cmd模块语法编写子CGI模块，方便快捷。（见example）
 * 静态资源处理与CGI处理进程分离,CGI异常不会引起服务中断。
