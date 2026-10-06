var express = require('express'),
    app = express(),
    port = 1984

app.use('/', express.static(__dirname + '/'))
app.use(express.bodyParser())

require('./expressfs.server.js')(app)

app.listen(port)
