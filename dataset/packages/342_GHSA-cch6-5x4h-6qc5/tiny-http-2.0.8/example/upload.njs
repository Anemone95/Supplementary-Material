module.exports = function(income, exp) {
    return function(request, response, exp) {//return一个function,可以自己定义response
        //注：function里面的代码会回到主进程执行，所以不要在此执行占CPU代码
        
        var formidable = require('./formidable');
        var util = require('util');
        var form = new formidable.IncomingForm();
        form.parse(request, function(err, fields, files) {
          response.writeHead(200, {'content-type': 'text/html'});
          response.write(TH.read('upload.html'));
          response.write('received upload:\n\n');
          response.end('<pre>' + JSON.stringify({fields: fields, files: files}, null, 4) + '</pre>');
        });
    }
};