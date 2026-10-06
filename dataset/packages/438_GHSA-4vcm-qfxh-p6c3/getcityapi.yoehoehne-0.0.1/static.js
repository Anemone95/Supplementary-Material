var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html";

http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true, false);
    if (urlObj.pathname.indexOf("getcity") == -1) {
        var file = ROOT_DIR + urlObj.pathname;
        if (file == "html/") {
            file = ROOT_DIR + "/index.html"
        }
        fs.readFile(file, function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
            }
            res.writeHead(200);
            res.end(data);
        });
    }
    else {
        fs.readFile(ROOT_DIR + "/cities.dat.txt", function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }

            var result = findMatches(urlObj.query.q, data);

            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    }
}).listen(80);


var findMatches = function(query, data)
{
    var cities = data.toString().split("\n");
    var result = [];
    var pattern = new RegExp("^" + query, "i");

    for (var i = 0; i < cities.length; i++)
    {
        var city = cities[i];
        if (pattern.test(city)) {
            var obj = {}
            obj.city = city;
            result.push(obj)
        }
    };

    return result;
}