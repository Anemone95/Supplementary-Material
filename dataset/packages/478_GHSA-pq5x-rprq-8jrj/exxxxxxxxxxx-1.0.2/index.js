var app = require('./lib/main.js');

app.baseUrl('/');
app.use('/bbb', function (req, res) {
    res.end('bbb');
})
app.start(8080);
