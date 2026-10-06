var qs = require('querystring');
/* 暴露模块stream */
exports = module.exports = stream;

function stream(req, data) {
    if (req.headers['content-type'] && req.headers['content-type'] === 'application/x-www-form-urlencoded') {
        console.log(data);
    }
}