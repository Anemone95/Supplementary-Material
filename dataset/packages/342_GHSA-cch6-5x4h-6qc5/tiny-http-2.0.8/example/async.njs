module.exports = function() {
    return function(request, response, exp) {
        require('fs').readdir(__dirname, function(error, files) {
            var list = '';
            files.forEach(function(file) {
                if (/\.njs$/.test(file)) {
                    list += '<li><a href="' + file + '">' + file + '</a></li>';
                }
            });
            done(TH.read('list.html').toString().replace(/%files%/, list));
        });
    }
}