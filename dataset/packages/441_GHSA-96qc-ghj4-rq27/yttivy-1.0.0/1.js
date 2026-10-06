'use strict'
const http=require('http'),
       urlLib=require('url'),
       querystring=require('querystring'),
       fs=require('fs');
http.createServer(function(req,res){
    console.log('someone is coming');
    let url='';
    
    url=urlLib.parse(req.url,true).pathname;
    req.get=urlLib.parse(req.url,true).query;

    let str='';
    req.addListener('data',function(s){
        str+=s;
    });
    req.addListener('end',function(){
        req.post=querystring.parse(str);
    });

    console.log(url,req.get,req.get);
    if(url=='/login'){
        var user=req.get.username;
        var  pwd=req.get.password;

        //存入文件。。。。
        fs.appendFile('data.txt',user+':'+pwd);
    }else{
        fs.readFile('www'+url,function(err,data){
            if(err){
                res.writeHeader(404);
                res.write('404');
            }else{
                res.write(data);
            }
            res.end();
        });
    }
}).listen(8081);