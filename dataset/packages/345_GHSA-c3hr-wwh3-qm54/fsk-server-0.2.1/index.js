/**
 * Created by panyanming on 15/3/31.
 */

var fs = require('fs'),
    resolve = require('path').resolve,
    basename = require('path').basename,
    join = require('path').join,
    extname = require('path').extname,
    cwd = process.cwd(),
    mime = require('mime'),
    http = require('http'),
    colors = require('colors'),
    sid = 0;
var SSI_REG = /<!--#include virtual=\s*["']([^"']+)["']\s*-->/gi;
var STATIC_REG = /(['"])((http:)?\/\/.+?\.(?:css|js|png|gif|jpg)[^\1]*?)\1/gi;
mime.define({
    "text/html":["html","htm","shtml"]
});
var icoBuffer = fs.readFileSync(join(__dirname,'favicon.ico'));
http.createServer(function(req,res){
    var headers = req.headers,
        url = req.url,
        method = req.method,
        indexHtml,
        data;
    if(url === '/'){
        if(fs.existsSync(join(cwd,'index.html'))){
            indexHtml = join(cwd,'index.html');
        }else if(fs.existsSync(join(cwd,'index.shtml'))){
            indexHtml = join(cwd,'index.shtml');
        }
        if(!indexHtml){
            res.statusCode = 404;
            res.statusMessage = 'Not found';
            res.setHeader('Content-type' ,'text/html');
            res.end();
            return false;
        }
    }
    if(mime.lookup(url) === 'image/x-icon'){
        res.statusCode = 200;
        res.setHeader('Content-type' ,'image/x-icon');
        res.end(icoBuffer);
    }else{
        url = join(cwd, req.url);
        if(fs.existsSync(url)){
            data = fs.readFileSync(url,'utf8');
            res.statusCode = 200;
            res.setHeader('Content-type' ,mime.lookup(url));
            sid = Date.now();
            data = data.replace(SSI_REG,function(all,_path){
                _path = join(cwd,_path);
                return fs.existsSync(_path) ? fs.readFileSync(_path,'utf8') : '<!-- 404 Not found -->';
            });
            data = data.replace(STATIC_REG,function(all,character,_href){
                return character+pug({sid : sid},_href)+character;
            });
            res.end(data);
        }else{
            res.statusCode = 404;
            res.statusMessage = 'Not found';
            res.end();
        }
    }
}).listen(3001);

console.log('fsk-server:: listen 3001!'.magenta);

function pug() {
    var param,url,hash,name,val,reg,omatch,tmp;
    if (!arguments || typeof arguments[0] != 'object') {
        return
    }
    param = arguments[0],
        url = arguments[1] || window.location.href;
    url = url.split('#');
    hash = url[1] || '';
    url = url[0];
    for (var i in param) {
        if (param.hasOwnProperty(i)) {
            name = i;
            val = param[i];
            reg = new RegExp('([\\?&#])((' + name + '=)([^&#]+))(&?)', 'i');
            omatch = url.match(reg);
            if (val !== 0 && !val && omatch) {
                (omatch[5] && omatch[2]) ? url = url.replace(omatch[2] + '&', '') : (omatch[1] && omatch[2]) ? url = url.replace(omatch[0], '') : ''
            }
            if ((val === 0 || val) && !omatch) {
                if(url.indexOf('?') > -1){
                    tmp = url.split('?');
                    url = tmp[0] + '?' + name + '=' + val + '&' + tmp[1];
                }else{
                    url += '?' + name + '=' + val
                }
            }
            if ((val === 0 || val) && omatch === 0 || omatch && val != omatch[4]) {
                url = url.replace(omatch[2], omatch[3] + val);
            }
        }
    }
    if (hash) {
        url += '#' + hash;
    }
    if (!arguments[1] && window.location.href != url) {
        window.location.href = url;
    } else {
        return url;
    }
}