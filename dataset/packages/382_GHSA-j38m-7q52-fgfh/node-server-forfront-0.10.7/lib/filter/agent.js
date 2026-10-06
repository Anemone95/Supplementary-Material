"use strict";
var http = require('http'),
    https = require('https'),
    url = require('url'),
    fs = require('fs');
var cookies = {};  
exports.execute=function(req,resp,pathurl,agent){
    var headers = {   //拼接headers数据，只处理必要的
               "user-agent": req.headers["user-agent"]|| "f2eBrowser",
               "content-type": req.headers["content-type"] || "text/html",
                cookie: cookies[agent]|| "",
                host: 'xuan.news.cn',
                accept: req.headers.accept || "*"
              };
    var param={
        host:agent.host,
        port:agent.port,
        path: agent.path,
        method: req.method,
        headers:headers
    }

    if(req.method == 'POST'){
      param.headers['content-length'] = req.headers["content-length"];
    }
    var reqs= http.request(param,function(res){
      var ck = res.headers["set-cookie"],
          hck = cookies[agent];

      if(ck){ // 远程cookie同步
        [].slice.call(ck).forEach(function(item){
          var m = item.split(";")[0],
              key = m.split("=")[0],
              reg = new RegExp('\\b' + key + '=[^;]*');
          if( reg.test(hck) ){
            hck = hck.replace(reg,m);
          }else{
            hck += ";" + m;
          }
        });
        cookies[agent] = hck;
      }
      if( res.statusCode === 302 ){ // 对于远程服务的302转发中的域名部分修改成本地域名
        res.headers.location = res.headers.location.replace( /(https?:\/\/)[^\\\/]+/, "http://" + req.headers.host );
      }
      resp.writeHead(res.statusCode, res.headers);
      res.pipe(resp);
    }).on('error', function(e) {
          resp.writeHead(500, {"Content-Type": "text/html"});
          resp.end( e.stack.toString().replace(/\n/g,"<br>") );
    })
    req.on('data', function(chunk) {
      reqs.write( chunk );  //提交POST数据
    }).on('end', function() {
      reqs.end();
    });
}