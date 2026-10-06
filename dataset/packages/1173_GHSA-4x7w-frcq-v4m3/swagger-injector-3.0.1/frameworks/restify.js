'use strict';
const BaseFramework = require('./base');

class RestifyFramework extends  BaseFramework {
    constructor (config={}) {
        super(config);
    }

    serveFile (req, res, path, type, injection) {

        if (type) res.set('Content-Type', type);
        let file = this.fileCache.get(this.buildDistPath(path), injection);
        if (file) res.sendRaw(file);
    }

    middleware () {
        return (req, res, next) => {
            // Serve up documentation html
            if (this.isDocumentPath(req.path())) {
                return this.serveFile(req, res, '/index.html', 'text/html', {
                    prefix: this.config.prefix
                });

                // Serve up swagger source json
            } else if (this.isSwaggerSourcePath(req.path())) {
                res.set('Content-Type', 'application/json');
                res.send(this.config.swagger);

                // Serve up custom css
            } else if (this.isCustomCssPath(req.path())) {
                res.set('Content-Type', 'text/css');
                res.sendRaw(this.config.css);
                // Serve up assets
            } else if (this.isAssetPath(req.path())) {
                let type = (req.path().indexOf('.css') >= 0) ? 'text/css' : undefined
                return this.serveFile(req, res, req.path(), type);

            } else {
                return next();
            }
        }
    }
}

module.exports = RestifyFramework;