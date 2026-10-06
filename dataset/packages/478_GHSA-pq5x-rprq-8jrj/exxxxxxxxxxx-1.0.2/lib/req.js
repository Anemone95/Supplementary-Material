var url = require('url');
/* 暴露模块req */
exports = module.exports = function (req) {
    
    // method get's query
    req.query = url.parse(req.url, true)['query'];
    
}