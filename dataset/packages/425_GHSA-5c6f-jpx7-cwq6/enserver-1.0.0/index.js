var fs=require('fs');
var path=require('path');
var http=require('http');
var url=require('url');

var mime=require('./mime').types;

var server=http.createServer(function (req, res) {
   var pathname=url.parse(req.url).pathname;
    var realPath='public'+pathname;
    fs.stat(realPath,function (err,stats) {
       if (err||!stats.isFile()){
           res.writeHead(404,{
               'Content-Type':'text/plain'
           });
           res.write('404');
           res.end();
       }else {
           var ext=path.extname(realPath);
           ext=ext?ext.slice(1):'unknown';
           var contentType=mime[ext]||'text/plain';
           res.writeHead(200,{'Content-Type':contentType});
           var reader=fs.createReadStream(realPath);
           reader.pipe(res,{end:false});
           reader.on('end',function () {
               res.end();
           })
       }
    });
});
server.listen(80);
