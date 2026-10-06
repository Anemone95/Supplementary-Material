var chalk = require('chalk');

setInterval(function(){
    var date = new Date();
    if (date.getSeconds() % 5 === 0) {
        process.exit(1);
    } else {
        console.log(date);
    }
}, 1000);
