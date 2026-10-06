module.exports = function(income, out) {
    var files = require('fs').readdirSync(__dirname);
    var list = '';
    files.forEach(function(file) {
        if (/\.njs$/.test(file)) {
            list += '<li><a href="' + file + '">' + file + '</a></li>';
        }
    });
    return TH.read('list.html').toString().replace(/%files%/, list);
};