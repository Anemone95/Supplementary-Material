var chalk = require('chalk');

var limit = parseInt(process.argv[2], 10) || 5;

setInterval(function(){
    console.log(limit);
    limit--;
    if (limit < 0) process.exit();
}, 1000);

process.on('SIGINT', function () {
    if (limit > 0) return;

    process.exit();
});
