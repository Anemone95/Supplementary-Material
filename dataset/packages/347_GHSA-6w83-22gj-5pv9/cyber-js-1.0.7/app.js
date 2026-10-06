/**
* Author: Alex Munoz
* Cyber JS
*/


 exports.debug = function(str) {
   console.log(str);
 } // debug("LOL")      It prints out the string

exports.length = function(StrLength) {
  var StrLength = StrLength.length;
  console.log(StrLength);
} // length("String or var")     It prints out the length







// EXPRESS
 /*
   Built by simphon
 */

 var http = require("http"),
     url = require("url"),
     path = require("path"),
     fs = require("fs"),
     port = process.argv[2] || 3000;

 http.createServer(function(request, response) {

   var uri = url.parse(request.url).pathname
     , filename = path.join(process.cwd(), "/public/" + uri);
   var contentTypesByExtension = {
     '.html': "text/html",
     '.css':  "text/css",
     '.js':   "text/javascript"
   };
   fs.exists(filename, function(exists) {
     if(!exists) {
       response.writeHead(404, {"Content-Type": "text/plain"});
       response.write("404 - Page Not Found.\n");
       response.end();
       return;
     }
     if (fs.statSync(filename).isDirectory()) filename += '/index.html';
     fs.readFile(filename, "binary", function(err, file) {
       if(err) {
         response.writeHead(500, {"Content-Type": "text/plain"});
         response.write(err + "\n");
         response.end();
         return;
       }
       var headers = {};
       var contentType = contentTypesByExtension[path.extname("/public/" + filename)];
       if (contentType) headers["Content-Type"] = contentType;
       response.writeHead(200, headers);
       response.write(file, "binary");
       response.end();
     });
   });
 }).listen(parseInt(port, 10));

 console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
