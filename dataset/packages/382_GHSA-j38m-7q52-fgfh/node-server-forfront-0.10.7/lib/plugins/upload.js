var mime = require("mime"),    //MIME类型
    fs = require("fs"),
    path = require('path'),
    url = require('url'),
    formidable = require('formidable'),
    handle=require("./../common/handle.js");
exports.execute = function (req,resp,root,pathname,pathurl,__dirname) {
	resp.writeHead(200,{
      'Content-Type':mime.lookup(pathname) || 'text/html'
    });
    var form = new formidable.IncomingForm(); 
    var  files = [],
         fields = {};
    form.uploadDir = __dirname+'/tmp/';  //文件上传 临时文件存放路径 
    form.on('field',function(name, value){
      fields[name] = value;
    }).on('file', function(field, file) {
        if( file.size ){
            files.push({name: field, file: file});
        }
    }).on('end',function(){
		if(files.length){
            var endstring = '';
			files.map(function(file){
                fs.rename(file.file.path, form.uploadDir + file.file.name, function (err) {
                    if(err){ throw err; }
                });
                resp.writeHead(200, {'content-type':  mime.lookup(pathname)});
                endstring += '{"imgURL":"'+req.$.util + '/tmp/'+ file.file.name+'"},'
            });
             resp.end('['+endstring.substr(0, endstring.length-1)+']')

		}
        else{ 
        	fs.readFile(pathname, function(err, data){
        	    if(err){
        	        throw err;
        	    }
        	    resp.writeHead(200, {'content-type':  mime.lookup(pathname)});
        	    handle.execute(data.toString(), root, req, resp)
        	});
         }
    })
    form.parse(req);
}