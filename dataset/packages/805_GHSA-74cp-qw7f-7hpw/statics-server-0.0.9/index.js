#!/usr/bin/env node
const http=require('http');
const server=http.createServer();
const fs=require('fs');
const path=require('path');
const os=require('os');
const spawnSync = require('child_process').spawnSync;
server.on('request',function (req,res) {
    if(req.url==='/favicon.ico'){
        res.end();
        return;
    }
    const staticPath=path.resolve('.'+decodeURIComponent(req.url));
    const indexPath=path.resolve(staticPath,'index.html');
    if(fs.existsSync(indexPath)){
        fs.createReadStream(indexPath).pipe(res);
    }else {
        if(fs.lstatSync(staticPath).isDirectory()){
            var files=fs.readdirSync(staticPath);
            var lis='';
            files.forEach((v,i)=>{
                if(fs.lstatSync(path.resolve(staticPath,v)).isDirectory()){
                    lis+=`<li><a href="${req.url}${v}/">${v}/</a></li>`;
                }else {
                    lis+=`<li><a href="${req.url}${v}">${v}</a></li>`
                }
            });
            res.end(`<html><head><style>
body{margin: 0;padding: 0;font-family: Consolas,sans-serif;}
p{line-height: 50px;background: #2a333c;color: #fff;padding-left: 80px;font-size: 22px;}
ul{margin-top: 30px;margin-left: 100px;min-height: 500px;}
li{line-height: 30px;font-size: 18px;list-style: none;}
a{color: #373737; }
p.copy{line-height: 30px;font-size: 14px;text-align: center;background: #fff;color: #373737;}</style></head><body><p>statics-server</p><ul>${lis}</ul><p class="copy">copy right @ 2017 song</p></body></html>`)
        }else {
            if(fs.existsSync(staticPath)){
                fs.createReadStream(staticPath).pipe(res);
            }else {
                res.end('404文件未找到');
            }
        }
    }
});
server.listen(8080,()=>{
    console.log('服务器已经启动');
    console.log('访问localhost:8080');
    if(os.platform()==='win32'){
        spawnSync('explorer', ['http://localhost:8080']);
    }else {
        spawnSync('open', ['http://localhost:8080']);
    }
})
process.on('uncaughtException',()=>{
    console.log('文件不存在');
})
