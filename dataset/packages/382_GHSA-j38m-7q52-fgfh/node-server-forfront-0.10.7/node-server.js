var mime = require("mime"),    //MIME类型
    http = require("http"),
    https = require("https"),
    fs = require("fs"),
    _ = require('underscore'),
    url = require('url'),
    formidable = require('formidable'),
    handle=require("./lib/common/handle.js"),
    directory=require("./lib/filter/directory.js"),
    upload=require("./lib/plugins/upload.js"),
    less=require('less'),
    querystring = require("querystring"),
    path = require('path'),
    markdown = require('marked')
    CONF = require('./lib/config/config.js'),
    agent = require('./lib/filter/agent.js');
var cookies = {};
function start(conf){
  var server = http.createServer(function(req,resp){
      var root = conf.path||__dirname+'/';//creatserver.js所在dirname目录
          pathname = url.parse(req.url).pathname;
      try{pathurl = decodeURI(url.parse(req.url).pathname); }catch(e){ pathurl = req.url; }
      var pathname = (pathurl === '/') ? (root) : root + pathurl; 
          req.data =querystring.parse(url.parse(req.url).query);
          var serverhost ="http://" + req.headers.host.split(':')[0];
          req.$ = {title: pathurl, fileList: [], util:serverhost+":2850",root:root};
          var DEBUG = req.data.debug === "true"
      fs.stat(pathname, function(error, stats){
        if(error){
          if(!fs.existsSync(pathname)&&conf.agent && conf.agent.get && (agentM = conf.agent.get(decodeURI(url.parse(req.url).path)))){
            agent.execute(req,resp,pathurl,agentM);
          } else{
             resp.writeHead(404, {
                  "Content-Type": 'text/html'
              });
              resp.end("404");
          } 
        }else if(!error&& stats && stats.isDirectory && stats.isDirectory()){
              var folder = path.join( __dirname , "lib/tmpl/folder.html" );
              directory.execute(req,resp,root,pathname,pathurl,__dirname);
        }else if(!error && stats && stats.isFile && stats.isFile() ){
          if(req.method == 'POST'){
            upload.execute(req,resp,root,pathname,pathurl,__dirname)
          }else{
              resp.writeHead(200, {
                  "Content-Type":/\b(x\-markdown)\b/.test( mime.lookup(pathname)) ? 'text/html': mime.lookup(pathname) || 'text/html'
              });
              var rs = fs.createReadStream(pathname), str = "";
              rs.on("error", function(err){  
                resp.writeHead(500, {"Content-Type": 'text/html'});
                resp.end( JSON.stringify(err) );  //出错时 服务端给出500的HTTP-code
              }).on("data", function(d){  //data事件中拼接结果
                str += d;
              }).on("end", function(){
                //TODO 这里获取str就是结果字符串
              });

              mime.isTXT = function(path){
                
                return /\b(text|xml|javascript|json)\b/.test( this.lookup(path) );
              };
              if( mime.isTXT(pathname) ){

                rs.on("end",function(){ 
                if(/\b(x\-markdown)\b/.test( mime.lookup(pathname))){
                  str = markdown(str)
                }  
                  handle.execute(str, root, req, resp);  //将处理过程用一个新的模块实现
                });
              }else{
                rs.pipe(resp);
              }
            }
          }else{
              resp.writeHead(404, {
                  "Content-Type": 'text/html'
              });
              resp.end("404");
          }
      });
  });
  server.listen(conf.port);
  return server;

}
var ports = {};
for(var k in CONF){
    (function(c){
        if(ports[c.port]){return;}
        ports[c.port] = start(c);
    })(CONF[k]);
    console.log("Server running at http://127.0.0.1:" + CONF[k].port + '\t[' + k + ']');
}

