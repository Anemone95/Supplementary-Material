"use strict";
// This still seems a little weird see https://github.com/Microsoft/TypeScript/issues/3337
var path = require('path');
var fs = require('fs');
var express = require('express');
var nconf = require('nconf');
var handlebars = require('handlebars');
var morgan = require('morgan');
require('./config');
if (nconf.get('help')) {
    console.log('Usage: takepeek <args>\n');
    nconf.stores.argv.showHelp();
    console.log('Invert boolean options with "no" prefix (e.g. --no-index)\n');
    process.exit(0);
}
if (nconf.get('quiet')) {
    // Make console.log quiet
    console.log = function () { };
}
// Resolve the directory we are serving
var DIRECTORY = path.resolve(process.cwd(), nconf.get('directory'));
// Setup our index page
var indexTemplate = handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../index.html')).toString());
var app = express();
// Log the requests
if (!nconf.get('quiet')) {
    app.use(morgan('dev'));
}
// Serve the directory
// Turn expresses indexes off, we are making our own
app.use(express.static(DIRECTORY, {
    setHeaders: function (res, path, stat) {
        if (nconf.get('content-text')) {
            res.set('Content-Type', 'text/plain');
        }
    },
}));
// Serve the index
if (nconf.get('index')) {
    app.use(function (req, res, next) {
        var dir = path.join(DIRECTORY, req.url);
        if (fs.existsSync(dir)) {
            // List the directory
            var children = fs.readdirSync(dir)
                .filter(function (file) {
                if (!nconf.get('hidden')) {
                    return file[0] !== '.';
                }
                return true;
            });
            // Render our template
            var page = indexTemplate({
                directory: req.url,
                children: children,
            });
            res.send(page);
        }
        else {
            next();
        }
    });
}
// The file or directory does not exist
app.use(function (req, res) {
    res.status(400);
    res.send('The file or directory does not exist');
});
app.listen(nconf.get('port'), function () {
    console.log("takepeek listening at http://localhost:" + nconf.get('port'));
});
//# sourceMappingURL=index.js.map