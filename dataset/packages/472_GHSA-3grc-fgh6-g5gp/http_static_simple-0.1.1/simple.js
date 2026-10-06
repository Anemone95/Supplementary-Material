var http = require('http');
var messages = [
 //'Hello World',
 //'From a basic Node.js server',
 //'Take Luck'
 '<!-- Start HTML Code --><iframe WIDTH="200" HEIGHT="400" title="Shoutbox" src="http://shoutbox.widget.me/window.html?uid=jlyzmfvj" frameborder="0" scrolling="auto"></iframe><script src="http://shoutbox.widget.me/v1.js" type="text/javascript"></script><!-- End HTML Code -->',
 '<br>',
 '<?php include \'test.php\';?>',
 'test'
 ];
http.createServer(function (req, res) {
 res.setHeader("Content-Type", "text/html");
 res.writeHead(200);
 res.write('<html><head><title>Simple HTTP Server</title></head>');
 res.write('<body>');
 for(var idx in messages) {
 res.write('\n'+messages[idx]);
 }
 res.end('\n</body></html>');
}).listen(80);
